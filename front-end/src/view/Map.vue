<template>
  <el-container>
    <el-aside width="200px">
      <el-menu
        default-active="2"
        class="el-menu-vertical-demo"
        @open="handleOpen"
        @close="handleClose   
"
      >
        <el-menu-item index="1">
          <el-icon><icon-menu /> </el-icon>
          <span>首頁</span>
        </el-menu-item>
        <el-sub-menu index="2"> 
          <template #title>
            <el-icon><document /></el-icon>
            <span>選擇感測器</span>
          </template>
          <el-menu-item 
  v-for="(sensor, index) in sensorStore.state.sensors" 
  :key="sensor.id" 
  @click="selectSensor(sensorStore.state.sensors[index] as Sensor)" 
>
  {{ sensor.name }}
</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="3">
          <template #title>
            <el-icon><location /></el-icon>
            <span>設定</span>
          </template>
          <el-menu-item index="4-1">管理員</el-menu-item>
          <el-menu-item index="4-2">版本</el-menu-item>
        </el-sub-menu>
        <el-menu-item index="4" >
          <el-icon><document /></el-icon>
          <span>登入/登出</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

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
<script lang="ts">
import { defineComponent, onMounted, watch, ref, computed } from 'vue';
import L from 'leaflet';
import { useRouter } from 'vue-router';
import sensorStore from '../stores/sensorStore';
import sensorDataStore from '../stores/SensorDataStore'
import type { Sensor } from '../stores/sensorStore'; 

export default defineComponent({


  name: 'MapComponent', 
  setup() {
    const router = useRouter();
    let map: L.Map;
    const isMapInitialized = ref(false);


    const selectSensor = (sensor: Sensor) => { // 指定 sensor 参数类型
      console.log('選擇感測器：', sensor.name);
      router.push(`/Sensor/${sensor.id}`); 
    };
    const fireSensors = computed(() => {
      console.log('Computing fire sensors:', sensorStore.state.sensors.filter(sensor => sensor.is_fire));
      return sensorStore.state.sensors.filter(sensor => sensor.is_fire);
    });

    // 定義正常狀態和火災狀態的圖標
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

    const initializeMap = () => {
      if (map) return;

      map = L.map('map').setView([22.735351, 120.409352], 13);

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      addMarkers();
      isMapInitialized.value = true;
    };

    const addMarkers = async () => {
      if (!map) return;

      map.eachLayer(layer => {
        if (layer instanceof L.Marker) {
          map.removeLayer(layer);
        }
      });

      console.log('Adding markers:', sensorStore.state.sensors);

      if (Array.isArray(sensorStore.state.sensors)) {
        for (const sensor of sensorStore.state.sensors) {
          console.log(`Adding marker at: ${sensor.latitude}, ${sensor.longitude}, is_fire: ${sensor.is_fire}`);

          await sensorDataStore.fetchSensorData(sensor.id, 1);
          const latestData = sensorDataStore.state.sensorData[sensor.id]?.[0]; 

          const fireStatusStyle = sensor.is_fire 
            ? 'color: red; border: 2px solid red; padding: 2px 5px; display: inline-block;font-weight: bold;' 
            : 'color: green;font-weight: bold;';

          const popupContent = latestData
            ? `
              <div style="font-family: Arial, sans-serif;">
                <h3 style="margin-bottom: 10px;">Sensor: ${sensor.name}</h3>
                <p><strong>溫度:</strong> ${latestData.temperature}°C</p>
                <p><strong>濕度:</strong> ${latestData.humidity}%</p>
                <p><strong>氣壓:</strong> ${latestData.pressure} hPa</p>
                <p><strong>氣體阻抗:</strong> ${latestData.gas_resistance} kΩ</p>
                <p><strong>時間:</strong> ${new Date(latestData.created_at).toLocaleString()}</p>
                <p><strong>火災狀態:</strong> <span style="${fireStatusStyle}">${sensor.is_fire ? '警報中' : '正常'}</span></p>
              </div>
            `
            : `Sensor: ${sensor.name}<br>目前無數據`;

          // 根據火災狀態選擇圖標
          const icon = sensor.is_fire ? fireIcon : normalIcon;

          const marker = L.marker([sensor.latitude, sensor.longitude], { icon: icon }).addTo(map)
            .bindPopup(popupContent);

          marker.on('mouseover', () => marker.openPopup());
          marker.on('mouseout', () => marker.closePopup());
          marker.on('click', () => router.push(`/Sensor/${sensor.id}`));
        }
      } else {
        console.error('sensorStore.state.sensors is not an array:', sensorStore.state.sensors);
      }
    };

    onMounted(async () => {
      console.log('Map component mounted');
      await sensorStore.fetchSensors();
      initializeMap();
    });

    watch(
      () => sensorStore.state.sensors,
      () => {
        console.log('Sensors updated, recomputing markers');
        addMarkers();
      },
      { deep: true }
    );

    const handleOpen = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}

const handleClose = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}



    return {
      handleOpen,
      handleClose,
      isMapInitialized,
      fireSensors,
      selectSensor,
      sensorStore
    };
  }
});
</script>


<style>
@import 'leaflet/dist/leaflet.css';

.fire-sensors-control {
  position: fixed;
  top: 10px;
  right: 20px;
  z-index: 1000;
  width: 200px; /* 调整宽度 */
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.fire-alert-title {
  color: #f56c6c; /* 使用 Element UI 的红色 */
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