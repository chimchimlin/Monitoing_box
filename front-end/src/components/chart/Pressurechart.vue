<template>
    <BaseChart :sensorData="sensorData" label="Pressure" dataKey="pressure" borderColor="rgb(80, 162, 2)" />
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
