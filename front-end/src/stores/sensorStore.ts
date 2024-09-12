import { reactive, ref, watch } from 'vue';
import axios from 'axios';
import { LoadType } from '@/@types/Response.types';
import type { AxiosResponse } from 'axios';
import type { ResultData } from '@/@types/Response.types';

interface Sensor {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  is_fire: boolean;
  last_firetime: string;
}

const state = reactive({
  sensors: [] as Sensor[],
});

const currentSensor = ref<Sensor | null>(null);

const fetchSensors = async () => {
  try {
    const response = await axios.get('/api/sensor/sensorList');
    const responseData = response.data;

    if (responseData && Array.isArray(responseData.data)) {
      state.sensors = responseData.data.map((sensor: any) => ({
        id: sensor.id,
        name: sensor.dev_addr || 'Unknown',
        latitude: parseFloat(sensor.gps_latitude) || 0,
        longitude: parseFloat(sensor.gps_longitude) || 0,
        is_fire: sensor.is_fire || false,
        last_firetime: sensor.last_firetime || ''
      }));
      
      // 如果有感測器數據但還沒有選擇當前感測器，就選擇第一個
      if (state.sensors.length > 0 && !currentSensor.value) {
        setCurrentSensorById(state.sensors[0].id);
      } else if (currentSensor.value) {
        // 更新當前選中的感測器數據
        updateCurrentSensor();
      }
    } else {
      console.error('API response data is not an array:', responseData.data);
    }
  } catch (error) {
    console.error('Error fetching sensors:', error);
    throw error;
  }
};

const setCurrentSensorById = (id: number) => {
  const foundSensor = state.sensors.find(sensor => sensor.id === id);
  if (foundSensor) {
    console.log('Found sensor:', foundSensor);
    currentSensor.value = { ...foundSensor }; // 創建一個淺拷貝
  } else {
    console.error('No sensor found with the id:', id);
    currentSensor.value = null;
  }
};

const updateCurrentSensor = () => {
  if (currentSensor.value) {
    const updatedSensor = state.sensors.find(sensor => sensor.id === currentSensor.value!.id);
    if (updatedSensor) {
      currentSensor.value = { ...updatedSensor };
    }
  }
};

const turnOffAlarm = async (sensorId: number) => {
  try {
    const result = await axios.post(`/api/sensor/closeFireNotify`,sensorId);
    if (result.data.loadType === LoadType.SUCCEED) {
      // 更新該感測器的 is_fire 狀態
      state.sensors = state.sensors.map(sensor => 
        sensor.id === sensorId ? { ...sensor, is_fire: false } : sensor
      );
      console.log('警報已關閉');
      // 更新當前選中的感測器
      updateCurrentSensor();
    }
    else if (result.data.loadType === LoadType.QUERY_FAILED) {
      console.log('有誤');
      return {
          success: false,
          errorMessage: '參數錯誤'
      };
    
  }

  } catch (error) {
    console.error('Error turning off alarm:', error);
    throw error;
  }
};

// 監聽 sensors 數組的變化
watch(() => state.sensors, (newSensors) => {
  console.log('Sensors updated:', newSensors);
  updateCurrentSensor();
}, { deep: true });

export default {
  state,
  currentSensor,
  fetchSensors,
  setCurrentSensorById,
  turnOffAlarm,
  updateCurrentSensor
};