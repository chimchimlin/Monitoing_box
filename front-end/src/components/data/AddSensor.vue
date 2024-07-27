


<template>
  <div class="add-sensor-form">
    <h2>添加感測節點</h2>
    <form @submit.prevent="handleSubmit">
      <div>
        <label for="dev_addr">DEV Address:</label>
        <input id="dev_addr" v-model="sensorData.dev_addr" required>
      </div>
      <div>
        <label for="gps_longitude">GPS 經度:</label>
        <input id="gps_longitude" v-model="sensorData.gps_longitude" required>
      </div>
      <div>
        <label for="gps_latitude">GPS 緯度:</label>
        <input id="gps_latitude" v-model="sensorData.gps_latitude" required>
      </div>
      <button type="submit" :disabled="isSubmitting">添加感測節點</button>
    </form>
    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
  </div>
</template>





<script lang="ts">
import { defineComponent, ref, reactive } from 'vue';
import axios, { AxiosResponse } from 'axios';
import { LoadType } from '@/@types/Response.types';
import type { ResultData } from '@/@types/Response.types';


interface AddSensorParams {
  dev_addr: string;      // LORA gateway 所送出的 ABP devAddr 
  gps_longitude: string; // GPS 經度 (120.4058239) 11
  gps_latitude: string;  // GPS 緯度 (22.7271472) 10
}


export default defineComponent({
  name: 'AddSensorForm',
  setup() {
    const sensorData = reactive<AddSensorParams>({
      dev_addr: '',
      gps_longitude: '',
      gps_latitude: ''
    });

    const errorMessage = ref('');
    const successMessage = ref('');
    const isSubmitting = ref(false);

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
          sensorData.gps_longitude = '';
          sensorData.gps_latitude = '';
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

    return {
      sensorData,
      errorMessage,
      successMessage,
      isSubmitting,
      handleSubmit
    };
  }
});







export async function addSensor(sensorData: AddSensorParams) {
  const errorMessage = ref('');

  try {
    const url = '/api/sensor/addSensor';
    const result: AxiosResponse<ResultData> = await axios.post(url, sensorData);

    if (result.data.loadType === 1000) {
      return { success: true, data: result.data.data };
    }


    throw new Error("An unknown error occurred while adding sensor: " + JSON.stringify(result.data));
  } catch (error) {
    console.error('添加感測節點錯誤:', error);
    errorMessage.value = '伺服器錯誤，請聯絡管理員 ' + error;
    return { success: false, errorMessage: errorMessage.value };
  }
}
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