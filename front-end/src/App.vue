<template>
  <div>
    <TemperatureChart :sensorData="sensorData" v-if="sensorData.length > 0"></TemperatureChart>
    <HumidityChart :sensorData="sensorData" v-if="sensorData.length > 0"></HumidityChart>
    <PressureChart :sensorData="sensorData" v-if="sensorData.length > 0"></PressureChart>
    <GasResistanceChart :sensorData="sensorData" v-if="sensorData.length > 0"></GasResistanceChart>
    <p v-else>Loading data...</p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import axios from 'axios';
import SensorChart from './components/Basechart.vue';
import TemperatureChart from './components/Temperaturechart.vue';
import HumidityChart from './components/Humiditychart.vue';
import PressureChart from './components/Pressurechart.vue';
import GasResistanceChart from './components/Gas_Resistancechart.vue';
import { Monitor } from '@/@types/Monitor.types';

export default defineComponent({
  components: {
    SensorChart,
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
        // 提取數據
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

</style>
