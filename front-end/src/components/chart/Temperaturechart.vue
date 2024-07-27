<template>
    <BaseChart :sensorData="sensorData" label="Temperature" dataKey="temperature" borderColor="rgb(255, 162, 235)" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import BaseChart from './Basechart.vue';

import type { PropType } from 'vue';
import type { Monitor } from '@/@types/SensorData.types';


export default defineComponent({
    components: { BaseChart },
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
