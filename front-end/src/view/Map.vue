<template>
  <div>
    <div id="map" style="height: 680px;"></div>
    <div v-if="isMapInitialized" class="fire-sensors-control leaflet-control leaflet-bar">
      <h4 v-if="fireSensors.length > 0" style="margin: 0 0 5px 0; color: red;">火災警報</h4>
      <ul v-if="fireSensors.length > 0" style="margin: 0; padding-left: 20px;">
        <li v-for="sensor in fireSensors" :key="sensor.id">{{ sensor.name }}</li>
      </ul>
      <p v-else style="margin: 0;">目前無火災警報</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, watch, ref, computed } from 'vue';
import L from 'leaflet';
import { useRouter } from 'vue-router';
import sensorStore from '../stores/sensorStore';
import sensorDataStore from '../stores/SensorDataStore'

export default defineComponent({
  name: 'MapComponent',
  setup() {
    const router = useRouter();
    let map: L.Map;
    const isMapInitialized = ref(false);

    const fireSensors = computed(() => {
      console.log('Computing fire sensors:', sensorStore.state.sensors.filter(sensor => sensor.is_fire));
      return sensorStore.state.sensors.filter(sensor => sensor.is_fire);
    });

    const initializeMap = () => {
      if (map) return;

      map = L.map('map').setView([22.735351, 120.409352], 13);

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      addMarkers();
      isMapInitialized.value = true;  // 設置地圖初始化完成
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

          const marker = L.marker([sensor.latitude, sensor.longitude]).addTo(map)
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

    return {
      isMapInitialized,
      fireSensors
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
  background-color: white;
  padding: 10px;
  border: 2px solid red;
  border-radius: 4px;
  box-shadow: 0 1px 5px rgba(0,0,0,0.65);
}

.fire-sensors-control h4 {
  margin: 0 0 5px 0;
  color: red;
}

.fire-sensors-control ul {
  margin: 0;
  padding-left: 20px;
}
</style>