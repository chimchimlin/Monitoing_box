<template>
  <el-container>
    <el-main>
      <div id="map" style="height: 680px;"></div>
      <el-card v-if="isMapInitialized" class="fire-sensors-control">
        <template #header>
          <div class="card-header">
            <span v-if="fireSensors.length > 0" class="fire-alert-title">火災警報</span>
            <span v-else>目前無火災警報</span>
          </div>
        </template>

        <ul v-if="fireSensors.length > 0" class="fire-alert-list">
          <li v-for="sensor in fireSensors" :key="sensor.id">{{ sensor.name }}</li>
        </ul>
      </el-card>
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import L from 'leaflet';
import sensorStore from '../stores/sensorStore';
import sensorDataStore from '../stores/SensorDataStore';
import type { Sensor } from '../stores/sensorStore';

const markers = new Map<number, L.Marker>();
const router = useRouter();
let map: L.Map;
const isMapInitialized = ref(false);
const updateInterval = 5000;
const markerLayer = ref<L.LayerGroup | null>(null);
const updateInProgress = ref(false);

// 即時監控火災感測器
const fireSensors = computed(() => {
  return sensorStore.state.sensors.filter(sensor => sensor.is_fire);
});

// 設置圖標
const normalIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const fireIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// 初始化地圖
const initializeMap = () => {
  if (map) return;

  map = L.map('map').setView([22.735351, 120.409352], 13);
  
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  markerLayer.value = L.layerGroup().addTo(map);
  updateMarkers();
  isMapInitialized.value = true;
};



// 重試機制
const retry = async (fn: () => Promise<any>, retries = 3, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return retry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
};

// 更新所有標記
const updateMarkers = async () => {
  if (!map || !markerLayer.value || updateInProgress.value) return;

  try {
    updateInProgress.value = true;

    // 獲取當前所有感測器 ID
    const currentSensorIds = new Set(sensorStore.state.sensors.map(s => s.id));

    // 移除不再存在的標記
    for (const [id, marker] of markers.entries()) {
      if (!currentSensorIds.has(id)) {
        markerLayer.value.removeLayer(marker);
        markers.delete(id);
      }
    }

    // 更新或添加標記
    for (const sensor of sensorStore.state.sensors) {
      await updateSensorMarker(sensor);
    }
  } catch (error) {
    console.error('更新標記失敗:', error);
  } finally {
    updateInProgress.value = false;
  }
};

// 更新感測器資料和視覺元素
const updateSensorData = async () => {
  try {
    await sensorStore.fetchSensors();
    if (isMapInitialized.value) {
      await updateMarkers();
    }
  } catch (error) {
    console.error('更新感測器數據失敗:', error);
  }
};

// 更新所有標記
const updateSensorMarker = async (sensor: Sensor) => {
  if (!map || !markerLayer.value) return;

  try {
    let sensorData;
    try {
      await sensorDataStore.fetchSensorData(sensor.id, 1, true);
      sensorData = sensorDataStore.state.sensorData[sensor.id]?.[0];
    } catch (error) {
      console.warn(`無法獲取感測器 ${sensor.id} 的最新數據，使用現有數據`);
    }

    const fireStatusStyle = sensor.is_fire
      ? 'color: red; border: 2px solid red; padding: 2px 5px; display: inline-block;font-weight: bold;'
      : 'color: green;font-weight: bold;';

    const popupContent = sensorData
      ? `
        <div style="font-family: Arial, sans-serif;">
          <h3 style="margin-bottom: 10px;">感測器: ${sensor.name}</h3>
          <p><strong>溫度:</strong> ${sensorData.temperature}°C</p>
          <p><strong>濕度:</strong> ${sensorData.humidity}%</p>
          <p><strong>氣壓:</strong> ${sensorData.pressure} hPa</p>
          <p><strong>氣體阻抗:</strong> ${sensorData.gas_resistance} kΩ</p>
          <p><strong>時間:</strong> ${new Date(sensorData.created_at).toLocaleString()}</p>
          <p><strong>火災狀態:</strong> <span style="${fireStatusStyle}">${sensor.is_fire ? '警報中' : '正常'}</span></p>
          ${sensor.is_fire ? `<p><strong>火災發生時間:</strong> ${new Date(sensor.last_firetime).toLocaleString()}</p>` : ''}
        </div>
      `
      : `<div style="font-family: Arial, sans-serif;">
          <h3 style="margin-bottom: 10px;">感測器: ${sensor.name}</h3>
          <p>目前無數據</p>
          <p><strong>火災狀態:</strong> <span style="${fireStatusStyle}">${sensor.is_fire ? '警報中' : '正常'}</span></p>
          ${sensor.is_fire ? `<p><strong>火災發生時間:</strong> ${new Date(sensor.last_firetime).toLocaleString()}</p>` : ''}
        </div>`;

    const icon = sensor.is_fire ? fireIcon : normalIcon;
    const position = new L.LatLng(sensor.latitude, sensor.longitude);

    let marker = markers.get(sensor.id);
    if (marker) {
      // 更新現有標記
      marker.setIcon(icon);
      marker.setLatLng(position);
      marker.setPopupContent(popupContent);
    } else {
      // 創建新標記
      marker = L.marker(position, { icon })
        .bindPopup(popupContent)
        .on('mouseover', () => marker?.openPopup())
        .on('mouseout', () => marker?.closePopup())
        .on('click', () => router.push(`/Sensor/${sensor.id}`));

      markerLayer.value.addLayer(marker);
      markers.set(sensor.id, marker);
    }
  } catch (error) {
    console.error(`更新感測器 ${sensor.id} 標記失敗:`, error);
  }
};


// 生命週期鉤子
onMounted(async () => {
  try {
    await sensorStore.fetchSensors();
    initializeMap();
    
    const updateTimer = setInterval(() => {
      updateSensorData().catch(error => {
        console.error('定時更新失敗:', error);
      });
    }, updateInterval);
    
    onUnmounted(() => {
      clearInterval(updateTimer);
      if (map) {
        markers.forEach(marker => marker.remove());
        markers.clear();
        if (markerLayer.value) {
          markerLayer.value.clearLayers();
        }
        map.remove();
      }
    });
  } catch (error) {
    console.error('初始化失敗:', error);
    initializeMap();
  }
});

// 監聽火災警報變化
watch(
  () => fireSensors.value,
  (newFireSensors, oldFireSensors) => {
    if (newFireSensors.length !== oldFireSensors?.length) {
      // 如果火災感測器數量改變，可以在這裡添加提示音或其他警報
      console.log(`火災警報更新: 目前有 ${newFireSensors.length} 個警報`);
    }
  }
);
</script>

<style>
/* 樣式保持不變 */
@import 'leaflet/dist/leaflet.css';

.fire-sensors-control {
  position: fixed;
  top: 10px;
  right: 20px;
  z-index: 1000;
  width: 200px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.fire-alert-title {
  color: #f56c6c;
  font-weight: bold;
}

.fire-alert-list {
  list-style: none;
  padding: 0;
}

.fire-alert-list li {
  padding: 5px 0;
}
</style>