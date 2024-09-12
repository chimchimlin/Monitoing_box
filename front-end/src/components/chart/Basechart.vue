<template>
    <div>
        <div class="chart-container">
            <Line v-if="chartData" :data="chartData" :options="chartOptions" />
        </div>
        <div class="selector-container">
            <select v-model="displayCount" @change="updateChart">
                <option v-for="option in displayOptions" :key="option" :value="option">
                    {{ option }} 筆數據
                </option>
            </select>
            <span>顯示從 {{ formatDate(startDate) }} 到 {{ formatDate(endDate) }} 的數據</span>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue';
import { Line } from 'vue-chartjs';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

import type { PropType } from 'vue';
import type { ChartOptions } from 'chart.js';
import type { Monitor } from '@/@types/SensorData.types';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default defineComponent({
    components: { Line },
    props: {
        sensorData: {
            type: Array as PropType<Monitor[]>,
            required: true
        },
        label: {
            type: String,
            required: true
        },
        dataKey: {
            type: String,
            required: true
        },
        borderColor: {
            type: String,
            required: true
        }
    },
    setup(props) {
        const displayOptions = [10, 20, 50, 100, 200, 500]; // 可選擇的數據點數量
        const displayCount = ref(20); // 預設顯示50筆數據
        
        const filteredData = computed(() => {
            const startIndex = Math.max(0, props.sensorData.length - displayCount.value);
            return props.sensorData.slice(startIndex);
        });

        const startDate = computed(() => filteredData.value[0]?.created_at);
        const endDate = computed(() => filteredData.value[filteredData.value.length - 1]?.created_at);

        const chartData = computed(() => {
            if (!filteredData.value.length) return null;

            return {
                labels: filteredData.value.map(data => {
                    const date = new Date(data.created_at);
                    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
                }),
                datasets: [
                    {
                        label: props.label,
                        data: filteredData.value.map(data => parseFloat(data[props.dataKey as keyof Monitor] as string)),
                        borderColor: props.borderColor,
                        tension: 0.5,
                        fill: true,
                        pointRadius: 5,
                        pointHoverRadius: 10,
                        pointBackgroundColor: props.borderColor,
                        pointBorderColor: '#fff',
                        pointBorderWidth: 3,
                    }
                ]
            };
        });

        const chartOptions: ChartOptions<'line'> = {
            // ... (保持不變)
        };

        const updateChart = () => {
            // 不需要額外的邏輯，因為 chartData 是一個計算屬性
        };

        const formatDate = (date: string | undefined) => {
            if (!date) return '';
            return new Date(date).toLocaleString('ja-JP', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        };

        return { 
            chartData, 
            chartOptions, 
            displayCount, 
            displayOptions,
            updateChart, 
            formatDate, 
            startDate, 
            endDate 
        };
    }
});
</script>

<style scoped>
.chart-container {
    height: 300px;
    width: 500px;
}
.selector-container {
    margin-top: 20px;
    display: flex;
    align-items: center;
}
.selector-container select {
    margin-right: 10px;
}
</style>