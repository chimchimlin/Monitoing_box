import { reactive } from 'vue';
import axios from 'axios';

interface SensorData {
  temperature: number;
  humidity: number;
  pressure: number;
  gas_resistance: number;
  created_at: string;
}

const state = reactive({
  sensorData: {} as Record<number, SensorData[]> // 
});

const fetchSensorData = async (sensorId: number, limitValue: number = 10) => {
  try {
    const response = await axios.get('/api/sensor/sensorData', {
      params: {
        sensor_id: sensorId,
        limit_value: limitValue
      }
    });
    const responseData = response.data;
    console.log('API response for sensor data:', responseData);

    //
    if (responseData && responseData.loadType === 1000) {
      state.sensorData[sensorId] = responseData.data;
    } else {
      console.error('API response loadType error or data is not available:', responseData);
    }
  } catch (error) {
    console.error('Error fetching sensor data:', error);
  }
};

export default {
  state,
  fetchSensorData,
};
