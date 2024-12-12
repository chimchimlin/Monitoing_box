<template>
  <div class="dashboard-container">
    <header class="dashboard-header">
    </header>
    <div class="dashboard-content">
      <div class="sensor-list-card card">
        <SensorList 
          class="sensor-list" 
          :sensors="availableSensors"
          @sensor-selected="onSensorSelected" 
        />
      </div>
      <div class="charts-container">
        <div class="chart-card card" v-if="sensorData.length > 0">
          <TemperatureChart :sensorData="sensorData"></TemperatureChart>
        </div>
        <div class="chart-card card" v-if="sensorData.length > 0">
          <HumidityChart :sensorData="sensorData"></HumidityChart>
        </div>
        <div class="chart-card card" v-if="sensorData.length > 0">
          <PressureChart :sensorData="sensorData"></PressureChart>
        </div>
        <div class="chart-card card" v-if="sensorData.length > 0">
          <GasResistanceChart :sensorData="sensorData"></GasResistanceChart>
        </div>
      </div>
      <p v-if="error" class="error-text">{{ error }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
import axios from 'axios';
import { useRoute } from 'vue-router';
import TemperatureChart from '../components/chart/Temperaturechart.vue';
import HumidityChart from '../components/chart/Humiditychart.vue';
import PressureChart from '../components/chart/Pressurechart.vue';
import GasResistanceChart from '../components/chart/Gas_Resistancechart.vue';
import SensorList from '../components/data/SensorList.vue';
import type { Monitor } from '@/@types/SensorData.types';
import { LoadType } from '@/@types/Response.types';


interface Sensor {
  id: number;
  dev_addr: string;
  battery: number | null;
  last_refresh: string;
  gps_longitude: string;
  gps_latitude: string;
}

// 路線和初始狀態
const route = useRoute();
const sensorId = ref<number | null>(Number(route.params.id));
const sensorData = ref<Monitor[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const availableSensors = ref<Sensor[]>([]);
const selectedSensorIds = ref<number[]>([]);
const lastUpdateTimestamp = ref<string | null>(null);


// 取得可用感測器
const fetchAvailableSensors = async () => {
  try {
    const response = await axios.get('/api/sensor/sensorList');
    if (response.data.loadType === LoadType.SUCCEED) {
      availableSensors.value = response.data.data;
      selectedSensorIds.value = availableSensors.value.map(sensor => sensor.id);
    } else {
      console.warn('Failed to fetch sensor list. Load type:', response.data.loadType);
    }
  } catch (err) {
    console.error('Error fetching sensor list:', err);
    error.value = 'Failed to fetch sensor list';
  }
};

// 取得感測器數據
const fetchSensorData = async (id: number, options: { 
  incremental?: boolean 
} = {}) => {
  try {
    const response = await axios.get('/api/sensor/sensorData', { 
      params: { 
        sensor_id: id, 
        limit_value: 100,
        // 如果是增量更新，最后一次更新
        ...(options.incremental && lastUpdateTimestamp.value 
          ? { last_updated: lastUpdateTimestamp.value } 
          : {})
      } 
    });

    if (response.data.loadType === LoadType.SUCCEED) {
      const newData = response.data.data.map((item: Monitor) => ({
        ...item,
        sensorId: id
      }));

      if (options.incremental) {
        // 增量更新：將新數據添加到現有数据的前面
        sensorData.value = [
          ...newData, 
          ...sensorData.value
        ];
      } else {
        //全部數據更新
        sensorData.value = newData;
      }

      // 更新最后更新時間點
      if (newData.length > 0) {
        lastUpdateTimestamp.value = newData[0].created_at;
      }
    }
  } catch (err) {
    console.error(`Error fetching data for sensor ${id}:`, err);
  }
};


// 感測器選擇處理程序
const onSensorSelected = (id: number) => {
  sensorId.value = id;
    // 清空之前的傳感器數據
  sensorData.value = [];
  fetchSensorData(id);
};



// 觀察路由參數變化
watch(() => route.params.id, (newId) => {
  sensorId.value = Number(newId);
  if (sensorId.value) {
    fetchSensorData(sensorId.value);
  }
}, { immediate: true });

//定时器函数
const createSmartTimer = (id: number) => {
  let timeoutId: NodeJS.Timeout | null = null;

  const scheduleNextUpdate = () => {
    
    const RefreshTime = 5000 ; //固定5秒
    
    timeoutId = setTimeout(async () => {
      await fetchSensorData(id, { incremental: true });
      scheduleNextUpdate();
    }, RefreshTime);
  };

  scheduleNextUpdate();

  return () => {
    if (timeoutId) clearTimeout(timeoutId);
  };
};

// 修改生命周期
let stopTimer: (() => void) | null = null;

onMounted(async () => {
  await fetchAvailableSensors();
  if (sensorId.value) {
    // 初始加载全部數據
    await fetchSensorData(sensorId.value);
    
    // 定时器
    stopTimer = createSmartTimer(sensorId.value);
  }
});

onUnmounted(() => {
    if (stopTimer) stopTimer();
});
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
  background-color: #ebebeb;
}

.dashboard-header {
  display: flex;
  justify-content: center;
  align-items: center;
}

.dashboard-content {
  display: grid;
  grid-template-columns: 1fr 3fr;
}

.sensor-list-card {
  grid-column: 1 / 2;
}

.charts-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  grid-column: 1 / 3;
}

.chart-card {
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.loading-text,
.error-text {
  text-align: center;
  color: #ff4d4f;
}
</style>