<template>
  <el-form label-width="120px" @submit.prevent="handleSubmit">
    <h2>刪除感測節點</h2>
    <el-form-item label="感測器名稱:" prop="sensor_name" required>
      <el-select v-model="selectedSensorName" placeholder="請選擇感測器">
        <el-option
          v-for="sensor in sensorStore.state.sensors"
          :key="sensor.id"
          :label="sensor.name"
          :value="sensor.name"
        />
      </el-select>
    </el-form-item>
    <el-form-item>
      <el-button type="danger" native-type="submit" :disabled="isSubmitting || !selectedSensorName">刪除感測節點</el-button>
    </el-form-item>
    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
  </el-form>
</template>

<script lang="ts">
import { defineComponent, ref, reactive } from 'vue';
import axios from 'axios';
import { LoadType } from '@/@types/Response.types';
import type { AxiosResponse } from 'axios';
import type { ResultData } from '@/@types/Response.types';
import sensorStore from '@/stores/sensorStore';
import sensorDataStore from '@/stores/sensorStore'

interface SensorId {
sensor_id: number;

}
export default defineComponent({
  name: 'DeleteSensor',
  setup() {
    const selectedSensorName = ref('');
    const errorMessage = ref('');
    const successMessage = ref('');
    const isSubmitting = ref(false);

    const handleSubmit = async () => {
      errorMessage.value = '';
      successMessage.value = '';
      isSubmitting.value = true;

      try {
        const sensorId = sensorStore.state.sensors.find(sensor => sensor.name === selectedSensorName.value)?.id;
        if (!sensorId) {
          errorMessage.value = '找不到对应的感測器 ID';
          return;
        }

        const result = await deleteSensor({ sensor_id: sensorId });
        if (result.success) {
          successMessage.value = '感測節點刪除成功！';
          selectedSensorName.value = ''; // 清空选择
          // 更新 sensorStore 中的感測器列表
          await sensorStore.fetchSensors();
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
      selectedSensorName,
      errorMessage,
      successMessage,
      isSubmitting,
      handleSubmit,
      sensorStore, // 将 sensorStore 添加到返回值中
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

    if (result.data.loadType === LoadType.SUCCEED) {
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