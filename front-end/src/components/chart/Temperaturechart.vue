<template>
    <BaseChart :sensorData="sensorData" label="Temperature" dataKey="temperature" borderColor="rgb(255, 162, 235)" />
</template>

<script setup lang="ts">
import BaseChart from './Basechart.vue';
import type { Monitor } from '@/@types/SensorData.types';

defineProps<{
  sensorData: Monitor[]
}>();
</script>

<style scoped>
.chart-container {
  height: 300px;
  width: 500px;
}
</style>
