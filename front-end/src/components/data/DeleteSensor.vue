<template>
  <div class="delete-sensor-form">
    <h2>刪除感測節點</h2>
    <form @submit.prevent="handleSubmit">
      <div>
        <label for="sensor_id">感測器 ID:</label>
        <input id="sensor_id" v-model.number="id.sensor_id" type="number" required>
      </div>
      <button type="submit" :disabled="isSubmitting">刪除感測節點</button>
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

interface SensorId {
  sensor_id: number;
}

export default defineComponent({
  name: 'DeleteSensor',
  setup() {
    const id = reactive<SensorId>({ 
      sensor_id: 0,
    });
    const errorMessage = ref('');
    const successMessage = ref('');
    const isSubmitting = ref(false);

    const handleSubmit = async () => {
      errorMessage.value = '';
      successMessage.value = '';
      isSubmitting.value = true;

      try {
        const result = await deleteSensor(id);
        if (result.success) {
          successMessage.value = '感測節點刪除成功！';
          id.sensor_id = 0;
        } else {
          errorMessage.value = result.errorMessage || '刪除失敗';
        }
      } catch (error) {
        errorMessage.value = '發生未知錯誤';
        console.error('Error:', error);
      } finally {
        isSubmitting.value = false;
      }
    };

    return {
      id,
      errorMessage,
      successMessage,
      isSubmitting,
      handleSubmit
    };
  }
});

async function deleteSensor(id: SensorId) {
  const url = '/api/sensor/deleteSensor';

  if (id.sensor_id === 0) {
    return { success: false, errorMessage: '感測器 ID 不能為空' };
  }

  try {
    const result: AxiosResponse<ResultData> = await axios.delete(url, {
      data: { sensor_id: id.sensor_id }
    });

    if (result.data.loadType === 1000) {
      return { success: true, data: result.data.data };
    } else if (result.data.loadType === 1051) {
      return { success: false, errorMessage: '查詢失敗，請稍後再試' };
    } else if (result.data.loadType === 1003) {
      return { success: false, errorMessage: '參數錯誤，請檢查輸入' };
    }

    throw new Error("An unknown error occurred while deleting sensor: " + JSON.stringify(result.data));
  } catch (error) {
    console.error('刪除感測節點錯誤:', error);
    return { success: false, errorMessage: '伺服器錯誤，請聯絡管理員 ' + error };
  }
}
</script>

<style scoped>
.delete-sensor-form {
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
  background-color: #f44336;
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