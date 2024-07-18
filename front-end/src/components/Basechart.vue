<template>
  <div class="chart-container">
    <Line v-if="chartData" :data="chartData" :options="chartOptions" />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue';
import { Line } from 'vue-chartjs';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Monitor } from '@/@types/Monitor.types';
import { ChartOptions } from 'chart.js';

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
    // 反轉數據順序
    const reversedData = [...props.sensorData].reverse();

    const chartData = computed(() => {
      if (!props.sensorData.length) return null;

      return {
        labels: reversedData.map(data => {
          const date = new Date(data.created_at);
          return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); 
          }),// 24小時制顯示 只顯示時間沒有日期
        datasets: [
          {
            label: props.label,
            data: reversedData.map(data => parseFloat(data[props.dataKey as keyof Monitor] as string)),
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
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true
        }
      },
      plugins: {
        //改顯示詳細數值
    tooltip: {
      backgroundColor: 'rgba(0,0,0,0.8)',
      titleFont: {
        size: 15,
        weight: 'bold',
      },
      bodyFont: {
        size: 14,
      },
      padding: 20,
  
      callbacks: {
        title: function(tooltipItems) {
          if (tooltipItems.length > 0) {
            const dataIndex = tooltipItems[0].dataIndex;
            const createdAt = new Date(reversedData[dataIndex].created_at);
            return createdAt.toLocaleString('ja-JP', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            });
          }
          return '';
        },
        label: function(context) {
          let label = context.dataset.label || '';
          if (label) {
            label += ': ';
          }
          if (context.parsed.y !== null) {
            label += new Intl.NumberFormat('en-US', { 
              minimumFractionDigits: 2,
              maximumFractionDigits: 2 
            }).format(context.parsed.y);
          }
          return label;
        }
      }
    }
  }

    };

    return { chartData, chartOptions };
  }
});
</script>

<style scoped>
.chart-container {
  height: 300px;
  width: 500px;
}
</style>
