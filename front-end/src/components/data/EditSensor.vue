<template>
  <el-form :model="sensorData" label-width="120px" @submit.prevent="handleSubmit">
    <h2>編輯感測節點</h2>
    <el-form-item label="感測器:" prop="sensor_name" required>
      <el-select 
        v-model="selectedSensorName" 
        placeholder="請選擇感測器"
        @change="handleSensorChange"  
        >
      <el-option
        v-for="sensor in sensorStore.state.sensors"
        :key="sensor.id"
        :label="sensor.name"
        :value="sensor.name"
      />
      </el-select>
    </el-form-item>
    <el-form-item label="感測器名稱:" prop="description" required>
      <el-input 
        v-model="sensorData.description" 
        placeholder="請輸入感測器名稱"
      />
    </el-form-item>
    <el-form-item label="DEV Address:" prop="dev_addr" required>
      <el-input v-model="sensorData.dev_addr" />
    </el-form-item>
    <el-form-item label="GPS 經度:" prop="gps_longitude" required>
      <el-input v-model="sensorData.gps_longitude" />
    </el-form-item>
    <el-form-item label="GPS 緯度:" prop="gps_latitude" required>
      <el-input v-model="sensorData.gps_latitude" />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" native-type="submit" :disabled="isSubmitting">
        更新感測節點
      </el-button>
    </el-form-item>
    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import axios from 'axios';
import { LoadType } from '@/@types/Response.types';
import type { AxiosResponse } from 'axios';
import type { ResultData } from '@/@types/Response.types';
import sensorStore from '@/stores/sensorStore';

interface EditSensorParams {
  sensor_id: number;
  dev_addr: string;
  description: string;
  gps_longitude: string;
  gps_latitude: string;
}

// 定義 props
const props = defineProps<{
initialSensorData: EditSensorParams;
}>();

const defaultSensorData = {
sensor_id: 0,
dev_addr: '',
description: '',
gps_longitude: '',
gps_latitude: ''
};

const sensorData = reactive<EditSensorParams>({
  sensor_id: props.initialSensorData?.sensor_id ?? defaultSensorData.sensor_id,
  dev_addr: props.initialSensorData?.dev_addr ?? defaultSensorData.dev_addr,
  description: props.initialSensorData?.description ?? defaultSensorData.description,
  gps_longitude: props.initialSensorData?.gps_longitude ?? defaultSensorData.gps_longitude,
  gps_latitude: props.initialSensorData?.gps_latitude ?? defaultSensorData.gps_latitude
});

const selectedSensorName = ref(
  sensorStore.state.sensors.find(sensor => sensor.id === sensorData.sensor_id)?.name || ''
);

const errorMessage = ref('');
const successMessage = ref('');
const isSubmitting = ref(false);

const handleSensorChange = (sensorName: string) => {
const selectedSensor = sensorStore.state.sensors.find(sensor => sensor.name === sensorName);
if (selectedSensor) {
  sensorData.sensor_id = selectedSensor.id;
  sensorData.dev_addr = selectedSensor.dev_addr;
  sensorData.description = selectedSensor.description;
  sensorData.gps_longitude = selectedSensor.longitude.toString();
  sensorData.gps_latitude = selectedSensor.latitude.toString();
}
};

const handleSubmit = async () => {
errorMessage.value = '';
successMessage.value = '';
isSubmitting.value = true;

try {
  const result = await editSensor(sensorData);
  if (result.success) {
    successMessage.value = '感測節點更新成功！';
    await sensorStore.fetchSensors();
  } else {
    errorMessage.value = result.errorMessage || '更新失敗';
  }
} catch (error) {
  errorMessage.value = '發生未知錯誤';
  console.error('Error:', error);
} finally {
  isSubmitting.value = false;
}
};

async function editSensor(sensorData: EditSensorParams) {
try {
  const url = '/api/sensor/editSensor';
  const result: AxiosResponse<ResultData> = await axios.post(url, sensorData);

  if (result.data.loadType === LoadType.SUCCEED) {
    return {
      success: true,
      data: result.data.data
    };
  }

  if (result.data.loadType === LoadType.DATA_EXISTED) {
    return {
      success: false,
      errorMessage: 'DEV Address 已存在'
    };
  }

  if (result.data.loadType === LoadType.PARAMETER_ERROR) {
    return {
      success: false,
      errorMessage: '參數錯誤'
    };
  }

  throw new Error("An unknown error occurred while editing sensor: " + JSON.stringify(result.data));
} catch (error) {
  console.error('編輯感測節點錯誤:', error);
  return {
    success: false,
    errorMessage: '伺服器錯誤，請聯絡管理員 ' + error
  };
}
}
</script>