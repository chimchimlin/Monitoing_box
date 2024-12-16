<template>
  <el-form :model="sensorData" label-width="120px" @submit.prevent="handleSubmit">
    <h2>添加感測節點</h2>
    <el-form-item 
      label="DEV Address:" 
      prop="dev_addr" 
      required
      :rules="[{ required: true, message: '請輸入 DEV Address' }]"
    >
      <el-input v-model="sensorData.dev_addr" />
    </el-form-item>
    <el-form-item 
      label="感測器名稱:" 
      prop="description"
      :rules="[{ required: true, message: '請輸入感測器名稱' }]"
    >
      <el-input v-model="sensorData.description" placeholder="請輸入名稱"/>
    </el-form-item>
    <el-form-item 
      label="GPS 經度:" 
      prop="gps_longitude" 
      required
      :rules="[{ required: true, message: '請輸入 GPS 經度' }]"
    >
      <el-input v-model="sensorData.gps_longitude" />
    </el-form-item>
    <el-form-item 
      label="GPS 緯度:" 
      prop="gps_latitude" 
      required
      :rules="[{ required: true, message: '請輸入 GPS 緯度' }]"
    >
      <el-input v-model="sensorData.gps_latitude" />
    </el-form-item>
    <el-form-item>
      <el-button 
        type="primary" 
        native-type="submit" 
        :loading="isSubmitting"
        :disabled="isSubmitting"
      >
        添加感測節點
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

interface AddSensorParams {
  dev_addr: string;      // LORA gateway 所送出的 ABP devAddr 
  description: string;   // 感測器描述名稱
  gps_longitude: string; // GPS 經度 (120.4058239)
  gps_latitude: string;  // GPS 緯度 (22.7271472)
}

const sensorData = reactive<AddSensorParams>({
  dev_addr: '',
  description: '',
  gps_longitude: '',
  gps_latitude: ''
});

const errorMessage = ref('');
const successMessage = ref('');
const isSubmitting = ref(false);

async function addSensor(sensorData: AddSensorParams) {
  try {
    const url = '/api/sensor/addSensor';
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
    
    throw new Error("An unknown error occurred while adding sensor: " + JSON.stringify(result.data));
  } catch (error) {
    console.error('添加感測節點錯誤:', error);
    return {
      success: false,
      errorMessage: '伺服器錯誤，請聯絡管理員 ' + error
    };
  }
}

const handleSubmit = async () => {
  errorMessage.value = '';
  successMessage.value = '';
  isSubmitting.value = true;

  try {
    const result = await addSensor(sensorData);
    if (result.success) {
      successMessage.value = '感測節點添加成功！';
      // 清空表單
      sensorData.dev_addr = '';
      sensorData.description = '';
      sensorData.gps_longitude = '';
      sensorData.gps_latitude = '';
      // 重新獲取感測器列表
      await sensorStore.fetchSensors();
    } else {
      errorMessage.value = result.errorMessage || '添加失敗';
    }
  } catch (error) {
    errorMessage.value = '發生未知錯誤';
    console.error('Error:', error);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.add-sensor-form {
max-width: 400px;
margin: 0 auto;
}

form div {
margin-bottom: 15px;
}

label {
display: block;
margin-bottom: 5px;
}

input {
width: 100%;
padding: 5px;
}

button {
width: 100%;
padding: 10px;
background-color: #4CAF50;
color: white;
border: none;
cursor: pointer;
}

button:disabled {
background-color: #cccccc;
}

.error-message {
color: red;
}

.success-message {
color: green;
}
</style>