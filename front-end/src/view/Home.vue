<template>
  <div class="current-sensor-name">
  <span class="label">感測器：</span>
  <span class="name">{{ currentSensor.value?.name }}</span>
  </div>
  <div class="sensor-actions">
    <header>
      <button @click="toggleMenu" class="action-button">感測器</button>
      <div v-if="isMenuOpen" class="dropdown-menu">
        <button @click="openModal('add')">添加感測器</button>
        <button @click="openModal('edit')">編輯感測器</button>
        <button @click="openModal('delete')">刪除感測器</button>
      </div>
      <button @click="goToMap" class="action-button map-button">地圖</button>
    </header>



    <div class="sensor-actions">
    <div class="sensor-info-container">
      <div v-if="currentSensor" class="current-sensor">
        <p>
          <strong>警報狀態：</strong>
          <span :class="{ 'status-normal': !currentSensor.value?.is_fire, 'status-fire': currentSensor.value?.is_fire }">
            {{ currentSensor.value?.is_fire ? '發生火災' : '正常' }}
          </span>
        </p>
        <p v-if="currentSensor.value?.is_fire">
          <strong>發生時間：</strong>{{ currentSensor.value?.last_firetime ? formatDateTime(currentSensor.value?.last_firetime) : '無資料' }}
        </p>
        <button v-if="currentSensor.value?.is_fire" @click="turnOffAlarm(currentSensor.value?.id)" class="alarm-button">
          手動關閉火災警報
        </button>
      </div>
      <div v-else class="no-sensor">未選擇感測器</div>
    </div>
    </div>

    <main>
      <SensorList class="sensor-list" :sensors="sensors" @sensor-selected="onSensorSelected" />
      <SensorChart />
    </main>



    <ModalWindow :is-open="isModalOpen" @close="closeModal">
      <component :is="currentModalComponent" @close="closeModal"></component>
    </ModalWindow>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import SensorChart from './SensorChart.vue';
import SensorList from '../components/data/SensorList.vue';
import AddSensor from '../components/data/AddSensor.vue';
import EditSensor from '../components/data/EditSensor.vue';
import DeleteSensor from '../components/data/DeleteSensor.vue';
import ModalWindow from '../components/ModalWindow.vue';
import sensorStore from '../stores/sensorStore';

export default defineComponent({
  name: 'Home',
  components: {
    SensorList,
    SensorChart,
    AddSensor,
    EditSensor,
    DeleteSensor,
    ModalWindow
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const isMenuOpen = ref(false);
    const isModalOpen = ref(false);
    const currentModalComponent = ref<any>(null);
    const isLoading = ref(true);
    const error = ref<string | null>(null);

    const toggleMenu = () => {
      isMenuOpen.value = !isMenuOpen.value;
    };

    const openModal = (action: string) => {
      isMenuOpen.value = false;
      switch (action) {
        case 'add':
          currentModalComponent.value = AddSensor;
          break;
        case 'edit':
          currentModalComponent.value = EditSensor;
          break;
        case 'delete':
          currentModalComponent.value = DeleteSensor;
          break;
      }
      isModalOpen.value = true;
    };

    const closeModal = () => {
      isModalOpen.value = false;
    };

    const goToMap = () => {
      router.push('/Map');
    };

    const sensors = computed(() => sensorStore.state.sensors);
    const currentSensor = computed(() => sensorStore.currentSensor);

    const turnOffAlarm = async (sensorId: number) => {
      try {
        await sensorStore.turnOffAlarm(sensorId);
        console.log(`Alarm turned off for sensor ID: ${sensorId}`);
      } catch (error) {
        console.error('Failed to turn off alarm:', error);
      }
    };

    const formatDateTime = (dateTime: string) => {
      return new Date(dateTime).toLocaleString();
    };

    onMounted(async () => {
      try {
        await sensorStore.fetchSensors();
        isLoading.value = false;
        
        // 檢查路由參數中是否有感測器ID
        const sensorId = parseInt(route.params.id as string);
        if (!isNaN(sensorId)) {
          sensorStore.setCurrentSensorById(sensorId);
        }
      } catch (e) {
        error.value = "無法加載感測器數據";
        isLoading.value = false;
      }
    });

    const onSensorSelected = (sensorId: number) => {
      sensorStore.setCurrentSensorById(sensorId);
      router.push(`/Sensor/${sensorId}`);
    };

    // 監視路由變化
    watch(() => route.params.id, (newId) => {
      const sensorId = parseInt(newId as string);
      if (!isNaN(sensorId)) {
        sensorStore.setCurrentSensorById(sensorId);
      }
    });

   

    onMounted(async () => {
      try {
        await sensorStore.fetchSensors();
        isLoading.value = false;
      } catch (e) {
        error.value = "無法加載感測器數據";
        isLoading.value = false;
      }
    });


    // 監視 currentSensor 的變化
    watch(() =>sensorStore.currentSensor, (newSensor) => {
      if (newSensor) {
        console.log('Current sensor updated:', newSensor.value?.name);
      } else {
        console.log('No sensor selected');
      }
    });

    return {
      isMenuOpen,
      isModalOpen,
      currentModalComponent,
      goToMap,
      toggleMenu,
      openModal,
      closeModal,
      onSensorSelected,
      currentSensor,
      sensors,
      turnOffAlarm,
      formatDateTime,
      isLoading,
      error
    };
  }
});
</script>
<style scoped>

.loading, .error, .no-sensor {
  padding: 20px;
  text-align: center;
  background-color: #f8f8f8;
  border-radius: 4px;
  margin-top: 20px;
}

.error {
  color: #d32f2f;
  background-color: #ffcdd2;
}

.sensor-actions {
  padding: 20px;
}

header {
  display: flex;
  justify-content: space-between;
  align-items:center;
  margin-bottom: 20px;
}

h1 {
  color: #333;
  margin: 0;
}

/*感測器新增、刪除、編輯清單*/
.action-button {
  justify-content: flex-end;
  position: absolute;
  padding: 10px 20px;
  left: 270px;
  top: 20px;
  background-color: #265880;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.action-button:hover {
  background-color: #4b82c9;
}

.dropdown-menu {
  position: absolute;
  top: 60px;
  left: 270px;
  background-color: white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.dropdown-menu button {
  width:100%;
  padding: 10px;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.3s;
}

.dropdown-menu button:hover {
  background-color: #f1f1f1;
}

.sensor-list {
  background-color: #f0f0f0;
  padding: 20px;
  border-radius: 4px;
}
/*////////////////////////////////*/

.map-button {
  position: absolute;
  margin-left: 100px;  /* 或者您想要的其他間距 */
  background-color: #4CAF50;  /* 或者您想要的其他顏色 */
}

.map-button:hover {
  background-color: #45a049;
}

main {
  clear: both;
}
.sensor-info-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 15px;
  max-width: 300px;
  width: 100%;
}

.current-sensor h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
  font-size: 18px;
}

.current-sensor p {
  margin: 10px 0;
  font-size: 14px;
}

.current-sensor strong {
  font-weight: bold;
  color: #555;
}

.status-normal {
  color: #4caf50;
  font-weight: bold;
}

.status-fire {
  color: #f44336;
  font-weight: bold;
}


.current-sensor-name {
  position: absolute;
  top: 15px;
  left: 20px;
  background-color: white;
  padding: 10px 15px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  font-size: 16px;
  z-index: 1000;
  border: 2px solid #5b92d9; /* 添加邊框 */
  display: inline-block; /* 使元素寬度適應內容 */
}
.label {
  font-weight: bold;
  color: #555;

}

.name {
  color: #5b92d9;
  font-weight: bold;
}

</style>
