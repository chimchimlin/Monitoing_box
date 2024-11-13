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

<script lang="ts">
import { defineComponent, ref, watch, onMounted, onUnmounted } from 'vue';
import axios from 'axios';
import TemperatureChart from '../components/chart/Temperaturechart.vue';
import HumidityChart from '../components/chart/Humiditychart.vue';
import PressureChart from '../components/chart/Pressurechart.vue';
import GasResistanceChart from '../components/chart/Gas_Resistancechart.vue';
import SensorList from '../components/data/SensorList.vue';
import { useRoute } from 'vue-router';
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

export default defineComponent({
  components: {
    SensorList,
    TemperatureChart,
    HumidityChart,
    PressureChart,
    GasResistanceChart 
  },
  setup() {
    const route = useRoute();
    const sensorId = ref<number | null>(Number(route.params.id));
    const sensorData = ref<Monitor[]>([]);
    const loading = ref(true);
    const error = ref<string | null>(null);
    const availableSensors = ref<Sensor[]>([]);
    const selectedSensorIds = ref<number[]>([]);
    let timerId: NodeJS.Timeout | null = null; // 刷新 儲存

    // API
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

    // 根据 sensorId 获取传感器数据
    const fetchSensorData = async (id: number) => {
      loading.value = true;
      error.value = null;
      sensorData.value = [];
      
      try {
        const response = await axios.get('/api/sensor/sensorData', { params: { sensor_id: id, limit_value: 100 } });
        if (response.data.loadType === LoadType.SUCCEED) {
          sensorData.value = response.data.data.map((item: Monitor) => ({
            ...item,
            sensorId: id
          }));
        } else {
          console.warn(`Failed to fetch data for sensor ${id}. Load type: ${response.data.loadType}`);
        }
      } catch (err) {
        console.error(`Error fetching data for sensor ${id}:`, err);
        error.value = `Failed to fetch data for sensor ${id}`;
      } finally {
        loading.value = false;
      }
    };

    // 监听路由参数变化
    watch(() => route.params.id, (newId) => {
      sensorId.value = Number(newId);
      if (sensorId.value) {
        fetchSensorData(sensorId.value);
      }
    }, { immediate: true });

    // 定時獲取數據
    const startTimer = () => {
      timerId = setInterval(() => {
        if (sensorId.value) {
          fetchSensorData(sensorId.value);
        }
      }, 5000 + Math.random() * 1000); // 5~6秒
    };

    onMounted(async () => {
      await fetchAvailableSensors();
      if (sensorId.value) {
        fetchSensorData(sensorId.value);
      }
      startTimer();
    });

    // 组件卸载时清除定时器
    onUnmounted(() => {
      if (timerId) {
        clearInterval(timerId);
      }
    });

    return {
      sensorData,
      loading,
      error,
      availableSensors,
      onSensorSelected: (id: number) => {
        sensorId.value = id;
        fetchSensorData(id);
      },
      TemperatureChart,
      HumidityChart,
      PressureChart,
      GasResistanceChart
    };
  }
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