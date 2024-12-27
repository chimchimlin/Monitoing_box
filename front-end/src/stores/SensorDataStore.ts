import { reactive } from 'vue';
import axios from 'axios';

interface SensorData {
  temperature: number;
  humidity: number;
  pressure: number;
  gas_resistance: number;
  created_at: string;
}

const state = reactive({
  sensorData: {} as Record<number, SensorData[]>,
  lastUpdateTimestamp: {} as Record<number, string>  // 新增：記錄每個感測器的最後更新時間
});

let refreshTimer: NodeJS.Timeout | null = null;

// 修改後的獲取感測器資料方法
const fetchSensorData = async (sensorId: number, limitValue: number = 10, incremental: boolean = false) => {
  try {
    const params: any = {
      sensor_id: sensorId,
      limit_value: limitValue
    };

    // 增量更新時加入最後更新時間
    if (incremental && state.lastUpdateTimestamp[sensorId]) {
      params.last_updated = state.lastUpdateTimestamp[sensorId];
    }

    const response = await axios.get('/api/sensor/sensorData', { params });
    const responseData = response.data;

    if (responseData && responseData.loadType === 1000) {
      if (incremental && responseData.data.length > 0) {
        // 增量更新：將新資料合併到現有資料前面
        state.sensorData[sensorId] = [
          ...responseData.data,
          ...(state.sensorData[sensorId] || [])
        ];
        // 更新時間戳記
        state.lastUpdateTimestamp[sensorId] = responseData.data[0].created_at;
      } else {
        // 完整更新
        state.sensorData[sensorId] = responseData.data;
        if (responseData.data.length > 0) {
          state.lastUpdateTimestamp[sensorId] = responseData.data[0].created_at;
        }
      }
    } else {
      console.error('API 回應載入類型錯誤或資料不可用:', responseData);
    }
  } catch (error) {
    console.error('獲取感測器資料失敗:', error);
  }
};

// 開始自動更新特定感測器的資料
const startAutoRefresh = (sensorId: number, interval: number = 10000) => {
  stopAutoRefresh(); // 清除現有的計時器
  
  refreshTimer = setInterval(async () => {
    await fetchSensorData(sensorId, 10, true); // 使用增量更新
  }, interval);
};

// 停止自動更新
const stopAutoRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
};

export default {
  state,
  fetchSensorData,
  startAutoRefresh,
  stopAutoRefresh
};