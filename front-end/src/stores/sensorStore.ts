import { reactive, ref, watch } from 'vue';
import axios from 'axios';
import { LoadType } from '@/@types/Response.types';
import type { AxiosResponse } from 'axios';
import type { ResultData } from '@/@types/Response.types';

export interface Sensor {
  id: number;
  name: string;
  dev_addr: string; 
  description: string;  // 保留 description 欄位
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
        name: sensor.description || 'Unknown',  // description 作為顯示名稱
        dev_addr:sensor.dev_addr,
        description: sensor.description || '',   // 保存原始 description
        latitude: parseFloat(sensor.gps_latitude) || 0,
        longitude: parseFloat(sensor.gps_longitude) || 0,
        is_fire: sensor.is_fire || false,
        last_firetime: sensor.last_firetime || ''
      }));
      
      if (state.sensors.length > 0 && !currentSensor.value) {
        setCurrentSensorById(state.sensors[0].id);
      } else if (currentSensor.value) {
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
    currentSensor.value = { ...foundSensor };
  } else {
    console.error('No sensor found with the id:', id);
    currentSensor.value = null;
  }
};

const resetSensorData = () => {
  state.sensors = [];
  currentSensor.value = null;
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
    const result = await axios.post(`/api/sensor/closeFireNotify`, { sensor_id: sensorId });
    
    if (result.data.loadType === LoadType.SUCCEED) {
      state.sensors = state.sensors.map(sensor => 
        sensor.id === sensorId ? { ...sensor, is_fire: false } : sensor
      );
      console.log('警報已關閉');
      updateCurrentSensor();
      return { success: true };
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
    return {
      success: false,
      errorMessage: error instanceof Error ? error.message : '未知錯誤'
    };
  }
};

watch(() => state.sensors, (newSensors) => {
  console.log('Sensors updated:', newSensors);
  updateCurrentSensor();
}, { deep: true });

export default {
  state,
  currentSensor,
  fetchSensors,
  setCurrentSensorById,
  resetSensorData,
  turnOffAlarm,
  updateCurrentSensor
};