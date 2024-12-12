<template>
    <div>
        <div class="chart-container">
            <Line v-if="chartData" :data="chartData" :options="chartOptions" />
        </div>
        <div class="selector-container">
            <el-select v-model="displayCount" @change="updateChart" style="width: 120px;">
                <el-option
                v-for="option in displayOptions"
                :key="option"
                :label="`${option} 筆數據`"
                :value="option"
                />
            </el-select>
            <el-text class="mx-1">
                顯示從 {{ formatDate(endDate) }} 到 {{ formatDate(startDate) }} 的數據
            </el-text>
        </div>
    </div>
</template>

<script lang="ts" setup >
import { ref, computed } from 'vue';
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

import type { ChartOptions } from 'chart.js';
import type { Monitor } from '@/@types/SensorData.types';

// chart工具
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// 定義 props
const props = defineProps({
    sensorData: {
        type: Array<Monitor>,
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
});

// 定義可選的數量
const displayOptions = [10, 20,50,100,500];
const displayCount = ref(20);

const filteredData = computed(() => {
    // 如果數據已經是反轉的，則從開頭取最新數據
    return props.sensorData.slice(0, displayCount.value);
});

const startDate = computed(() => {
    // 如果是反轉的陣列，最後一個元素將是最舊的數據
    const lastIndex = filteredData.value.length - 1;
    return filteredData.value[lastIndex]?.created_at;
});

const endDate = computed(() => {
    // 如果是反轉的陣列，第一個元素將是最新的數據
    return filteredData.value[0]?.created_at;
});

// 圖表數據
const chartData = computed(() => {
    if (!filteredData.value.length) return null;

    return {
        labels: filteredData.value.map(data => {
    // 分割日期和時間
    const [datePart, timePart] = data.created_at.split(' ');
    
    // 如果時間超過 23:59:59，調整為下一天的時間  //24.00 本來會被判定成無效時間
    let adjustedTime = timePart;
    if (timePart) {
        const [hours, minutes, seconds] = timePart.split(':').map(Number);
        if (hours === 24) {
            adjustedTime = '00:' + minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0');
        }
    }
    
    const date = new Date(`${datePart} ${adjustedTime}`);
    
    // 如果日期無效，返回原始時間字串
    if (isNaN(date.getTime())) {
        return data.created_at;
    }
    
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

// 圖表選項
const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
        y: {
            beginAtZero: true
        }
    },
    plugins: {
        legend: {
            display: true
        },
        title: {
            display: true,
            text: props.label
        }
    }
};

// 更新圖表方法
const updateChart = () => {};

// 日期格式化
const formatDate = (date: string | undefined) => {
    if (!date) return '';
    
    // 分割日期和時間
    const [datePart, timePart] = date.split(' ');
    
    // 如果時間超過 23:59:59，調整為下一天的時間//24.00 本來會被判定成無效時間
    let adjustedTime = timePart;
    if (timePart) {
        const [hours, minutes, seconds] = timePart.split(':').map(Number);
        if (hours === 24) {
            adjustedTime = '00:' + minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0');
        }
    }
    
    const parsedDate = new Date(`${datePart} ${adjustedTime}`);
    
    if (isNaN(parsedDate.getTime())) {
        return '無效日期';
    }
    
    return parsedDate.toLocaleString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
};
</script>

<style scoped>
.chart-container {
    height: 400px;
    margin-bottom: 20px;
}

.selector-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.selector-container select {
    margin-right: 10px;
}
</style>