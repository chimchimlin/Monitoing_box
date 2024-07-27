<template>
  <div class="dashboard-container">
    <header class="dashboard-header">
     
    </header>
    <div class="dashboard-content">
      <div class="sensor-list-card card">
        <SensorList class="sensor-list" />
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


<!--<p v-if="loading" class="loading-text">Loading data...</p> -->

<script lang="ts">

import { defineComponent } from 'vue';
import axios from 'axios';
import TemperatureChart from '../components/chart/Temperaturechart.vue';
import HumidityChart from '../components/chart/Humiditychart.vue';
import PressureChart from '../components/chart/Pressurechart.vue';
import GasResistanceChart from '../components/chart/Gas_Resistancechart.vue';
import { Monitor } from '@/@types/SensorData.types';
import SensorList from '../components/data/SensorList.vue';

export default defineComponent({
  components: {
    SensorList,
    TemperatureChart,
    HumidityChart,
    PressureChart,
    GasResistanceChart 
  },
  data() {
    return {
      sensorData: [] as Monitor[],
      loading: true,
      error: null as string | null
    };
  },
  methods: {
    async fetchSensorData() {
      const url = '/api/sensor/sensorData';
      const params = { sensor_id: 1, limit_value: 10 };

      try {
        const response = await axios.get(url, { params });
        console.log('Fetched data:', response.data);
        this.sensorData = response.data.data as Monitor[];
      } catch (error) {
        console.error('Error fetching sensor data:', error);
        this.error = 'Failed to fetch sensor data';
      } finally {
        this.loading = false;
      }
    }
  },
  mounted() {
    this.fetchSensorData();
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
