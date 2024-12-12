<template>
  <el-container>
    <el-header>
      <el-row type="flex" justify="space-between" align="middle">
        <el-col :span="12">
          <div class="current-sensor-border">
            <div class="sensor-text">
              <span class="label">感測器：</span>
              <span class="name">{{ currentSensor?.name || '未選擇' }}</span>
            </div>
          </div>
        </el-col>
        <el-col :span="12" style="text-align: right;">
          <el-dropdown @command="handleCommand">
            <el-button type="primary">
              感測器
            </el-button>
            <template #dropdown> 
              <el-dropdown-menu>
                <el-dropdown-item command="add">添加感測器</el-dropdown-item>
                <el-dropdown-item command="edit">編輯感測器</el-dropdown-item>
                <el-dropdown-item command="delete">刪除感測器</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-button type="primary" @click="goToMap" icon="el-icon-map-location">地圖</el-button>
        </el-col>
      </el-row>
    </el-header>

    <el-main>
      <el-card v-if="currentSensor" class="sensor-info">
        <div class="sensor_fire">
          <el-row>
            <el-col :span="24">
              <el-tag :type="currentSensor.is_fire ? 'danger' : 'success'">
                {{ currentSensor.is_fire ? '發生火災' : '正常' }}
              </el-tag>
            </el-col>
          </el-row>
          <el-row v-if="currentSensor.is_fire">
            <el-col :span="24">
              <p><strong>發生時間：</strong>{{ currentSensor.last_firetime ? formatDateTime(currentSensor.last_firetime) : '無資料' }}</p>
            </el-col>
          </el-row>
          <el-row v-if="currentSensor.is_fire">
            <el-col :span="24">
              <el-button type="danger" @click="turnOffAlarm(currentSensor.id)">手動關閉火災警報</el-button>
            </el-col>
          </el-row>
        </div>
      </el-card>
      <el-alert
        v-else
        title="未選擇感測器"
        type="info"
        :closable="false">
      </el-alert>

      <el-row :gutter="20">
        <el-col :span="12">
          <SensorList class="sensor-list" :sensors="sensors" @sensor-selected="onSensorSelected" />
        </el-col>
        <el-col :span="24">
          <SensorChart />
        </el-col>
      </el-row>
    </el-main>

    <ModalWindow :isOpen="isModalOpen" :title="modalTitle" @close="closeModal">
      <component :is="currentModalComponent" @close="closeModal" /> 
    </ModalWindow>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import SensorChart from './SensorChart.vue';
import SensorList from '../components/data/SensorList.vue';
import AddSensor from '../components/data/AddSensor.vue';
import EditSensor from '../components/data/EditSensor.vue';
import DeleteSensor from '../components/data/DeleteSensor.vue';
import ModalWindow from '../components/ModalWindow.vue';
import sensorStore from '../stores/sensorStore';

// 響應式狀態
const router = useRouter();
const route = useRoute();
const isModalOpen = ref(false);
const currentModalComponent = ref<any>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);

// 添加 編輯 刪除
const modalTitle = computed(() => {
  switch (currentModalComponent.value) {
    case AddSensor:
      return '添加感測器';
    case EditSensor:
      return '編輯感測器';
    case DeleteSensor:
      return '刪除感測器';
    default:
      return '';
  }
});

const sensors = computed(() => sensorStore.state.sensors);
const currentSensor = computed(() => sensorStore.currentSensor.value);



const handleCommand = (command: string) => {
  console.log('Command:', command); 
  switch (command) {
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
  console.log('Current modal component:', currentModalComponent.value); 
  isModalOpen.value = true; 
};

const closeModal = () => {
  isModalOpen.value = false;
};

const goToMap = () => {
  router.push('/Map');
};

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

const onSensorSelected = (sensorId: number) => {
  sensorStore.resetSensorData(); // 清空之前的感測器資料
  sensorStore.setCurrentSensorById(sensorId); // 設定新的感測器
  router.push(`/Sensor/${sensorId}`); // 導向新的感測器頁面
};
// 生命周期
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

// 路由變化
watch(() => route.params.id, (newId) => {
  const sensorId = parseInt(newId as string);
  if (!isNaN(sensorId)) {
    sensorStore.setCurrentSensorById(sensorId);
  }
});

//監看 選擇感測器 的變化
watch(() => sensorStore.currentSensor, (newSensor) => {
  if (newSensor) {
    console.log('Current sensor updated:', newSensor.value?.name);
  } else {
    console.log('No sensor selected');
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
  display: inline-flex;
  align-items:center;
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





.current-sensor-border {
  border: 2px solid #344366;
  border-radius: 4px;
  padding: 5px 15px;
  display: inline-flex;
  
}

.sensor-text {
  display:flex;
  height: 24px; /* 根據需要調整高度 */
  margin-right:30px;
}

.sensor-text .label {
  font-weight: bold;
  margin-right:0px;
  flex-shrink: 0;
}

.sensor-text .name {
  color: #5b92d9;
  font-size: 16px;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.sensor-info {
  position: fixed;
  top: 20px; 
  right: 20px; 
  z-index: 1000; 
  width: 300px; 
}


</style>
