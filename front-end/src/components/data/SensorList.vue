<template>

</template>

<script lang="ts">
import { defineComponent } from 'vue';
import axios from 'axios';
import { LoadType } from '@/@types/Response.types';

interface Sensor {
id: number;
dev_addr: string;
battery: number | null;
is_fire:boolean;
last_firetime:string;
last_refresh: string;
gps_latitude: string;
gps_longitude: string;
}

export default defineComponent({
data() {
    return {
    sensors: [] as Sensor[],
    loading: true,
    error: null as string | null
    };
},
mounted() {
    this.fetchSensors();
},
methods: {
    async fetchSensors() {
    try {
        const response = await axios.get('/api/sensor/sensorList');
        if (response.data.loadType === LoadType.SUCCEED) {
        this.sensors = response.data.data;
        console.log('List data:', response.data);
        } else {
        console.error('Failed to load sensors');
        this.error = '無法載入感測器資料';
        }
    } catch (error) {
        console.error('Error fetching sensors:', error);
        this.error = '獲取感測器資料時發生錯誤: ' + error;
    } finally {
        this.loading = false;
    }
    },
    formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleString(); // 你可以根據需要調整日期格式
    }
}
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