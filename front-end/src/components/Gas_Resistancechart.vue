<template>
  <BaseChart :sensorData="sensorData" label="Gas_resistance" dataKey="gas_resistance" borderColor="rgb(70, 202, 235)" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import BaseChart from './Basechart.vue';
import { Monitor } from '@/@types/Monitor.types';

export default defineComponent({
  components: { BaseChart},
  props: {
    sensorData: {
      type: Array as PropType<Monitor[]>,
      required: true
    }
  }
});
</script>

<style scoped>
.chart-container {
  height: 300px;
  width: 500px;
}
</style>
