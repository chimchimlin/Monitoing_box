<template>
    <BaseChart :sensorData="sensorData" label="Pressure" dataKey="pressure" borderColor="rgb(80, 162, 2)" />
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
