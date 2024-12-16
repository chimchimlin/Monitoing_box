<template>

</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { LoadType } from '@/@types/Response.types';

interface Sensor {
  id: number;
  dev_addr: string;
  battery: number | null;
  is_fire: boolean;
  last_firetime: string;
  last_refresh: string;
  gps_latitude: string;
  gps_longitude: string;
}

const sensors = ref<Sensor[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

async function fetchSensors() {
  try {
    const response = await axios.get('/api/sensor/sensorList');
    if (response.data.loadType === LoadType.SUCCEED) {
      sensors.value = response.data.data;
      console.log('List data:', response.data);
    } else {
      console.error('Failed to load sensors');
      error.value = '無法載入感測器資料';
    }
  } catch (err) {
    console.error('Error fetching sensors:', err);
    error.value = '獲取感測器資料時發生錯誤: ' + err;
  } finally {
    loading.value = false;
  }
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleString(); // 你可以根據需要調整日期格式
}

onMounted(() => {
  fetchSensors();
});
</script>

<style scoped>
.sensor-list {
  max-width: 300px;
  max-height: 300px;
  overflow-y: auto;
  background-color: #f0f0f0;
  padding: 10px;
  border-radius: 5px;
}
</style>