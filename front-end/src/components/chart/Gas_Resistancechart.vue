<template>
    <BaseChart :sensorData="sensorData" label="Gas_resistance" dataKey="gas_resistance"
        borderColor="rgb(70, 202, 235)" />
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
