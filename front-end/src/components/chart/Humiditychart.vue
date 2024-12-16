<template>
    <BaseChart :sensorData="sensorData" label="Humidity" dataKey="humidity" borderColor="rgb(54, 162, 235)" />
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
	height: 400px;
	width: 500px;
}
</style>