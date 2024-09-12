<template>
    <div class="edit-sensor-form">
        <h2>編輯感測節點</h2>
        <form @submit.prevent="handleSubmit">
            <div>
                <label for="sensor_id">感測器 ID:</label>
                <input id="sensor_id" v-model="sensorData.sensor_id" required >
            </div>
            <div>
                <label for="dev_addr">DEV Address:</label>
                <input id="dev_addr" v-model="sensorData.dev_addr" required >
            </div>
            <div>
                <label for="gps_longitude">GPS 經度:</label>
                <input id="gps_longitude" v-model="sensorData.gps_longitude" required>
            </div>
            <div>
                <label for="gps_latitude">GPS 緯度:</label>
                <input id="gps_latitude" v-model="sensorData.gps_latitude" required>
            </div>
            <button type="submit" :disabled="isSubmitting">更新感測節點</button>
        </form>
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive } from 'vue';
import axios from 'axios';
import { LoadType } from '@/@types/Response.types';
import type { AxiosResponse } from 'axios';
import type { ResultData } from '@/@types/Response.types';

interface EditSensorParams {
    sensor_id: number;
    dev_addr: string;
    gps_longitude: string;
    gps_latitude: string;
}

export default defineComponent({
    name: 'EditSensorForm',
    props: {
        initialSensorData: {
            type: Object as () => EditSensorParams,
            required: true
        }
    },
    setup(props) {
        const defaultSensorData = {
        sensor_id: 0,
        dev_addr: '',
        gps_longitude: '',
        gps_latitude: ''
    };
        const sensorData = reactive<EditSensorParams>({
        sensor_id: props.initialSensorData?.sensor_id ?? defaultSensorData.sensor_id,
        dev_addr: props.initialSensorData?.dev_addr ?? defaultSensorData.dev_addr,
        gps_longitude: props.initialSensorData?.gps_longitude ?? defaultSensorData.gps_longitude,
        gps_latitude: props.initialSensorData?.gps_latitude ?? defaultSensorData.gps_latitude
        });

        const errorMessage = ref('');
        const successMessage = ref('');
        const isSubmitting = ref(false);

        const handleSubmit = async () => {
            errorMessage.value = '';
            successMessage.value = '';
            isSubmitting.value = true;

            try {
                const result = await editSensor(sensorData);
                if (result.success) {
                    successMessage.value = '感測節點更新成功！';
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

        return {
            sensorData,
            errorMessage,
            successMessage,
            isSubmitting,
            handleSubmit
        };
    }
});

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

<style scoped>
.edit-sensor-form {
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

input[readonly] {
    background-color: #f0f0f0;
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