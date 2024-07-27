<template>
  <div class="sensor-actions">
    <header>
      <button @click="toggleMenu" class="action-button">感測器</button>
      <div v-if="isMenuOpen" class="dropdown-menu">
        <button @click="openModal('add')">添加感測器</button>
        <button @click="openModal('edit')">編輯感測器</button>
        <button @click="openModal('delete')">刪除感測器</button>
      </div>
    </header>
    
    <main>
      <SensorList class="sensor-list" />
      <SensorChart />
    </main>
    
    <ModalWindow :is-open="isModalOpen" @close="closeModal">
      <component :is="currentModalComponent" @close="closeModal"></component>
    </ModalWindow>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, shallowRef } from 'vue';
import SensorChart from './SensorChart.vue';
import SensorList from '../components/data/SensorList.vue';
import AddSensor from '../components/data/AddSensor.vue';
//import EditSensor from '../components/data/EditSensor.vue';
import DeleteSensor from '../components/data/DeleteSensor.vue';
import ModalWindow from '../components/ModalWindow.vue';

export default defineComponent({
  name: 'SensorActions',
  components: {
    SensorList,
    SensorChart,
    AddSensor,
    ModalWindow
  },
  
  setup() {
    const isMenuOpen = ref(false);
    const isModalOpen = ref(false);
    const currentModalComponent = shallowRef<any>(null);

    const toggleMenu = () => {
      isMenuOpen.value = !isMenuOpen.value;
    };

    const openModal = (action: string) => {
      isMenuOpen.value = false;
      switch (action) {
        case 'add':
          currentModalComponent.value = AddSensor;
          break;
        // case 'edit':
        //   currentModalComponent.value = EditSensor;
        //   break;
         case 'delete':
           currentModalComponent.value = DeleteSensor;
           break;
      }
      isModalOpen.value = true;
    };

    const closeModal = () => {
      isModalOpen.value = false;
    };

    return {
      isMenuOpen,
      isModalOpen,
      currentModalComponent,
      toggleMenu,
      openModal,
      closeModal
    };
  }
});
</script>

<style scoped>
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
  background-color: #5b92d9;
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
main {
  clear: both;
}
</style>
