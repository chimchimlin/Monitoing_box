<template>
    <!-- 模板部分保持不變 -->
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import axios from 'axios';
import { LoadType } from '@/@types/Response.types';


interface Sensor {
    id: number;
    dev_addr: string;
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
                }
                else {
                    console.error('Failed to load sensors');
                    this.error = 'Failed to load sensors';
                }
            } catch (error) {
                console.error('Error fetching sensors:', error);
                this.error = 'Failed to fetch sensor data: ' + error;
            } finally {
                this.loading = false;
            }
        }
    }
});
</script>

<style scoped>
.sensor-list {
    /* 調整這些值以適應您的設計 */
    max-width: 300px;
    max-height: 300px;
    overflow-y: auto;
    background-color: #f0f0f0;
    padding: 100px;
    border-radius: 5px;
}
</style>