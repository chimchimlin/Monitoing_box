import { createRouter, createWebHistory } from 'vue-router';
import SensorList from '../components/data/SensorList.vue';
import AddSensor from '../components/data/AddSensor.vue';
import EditSensor from '../components/data/EditSensor.vue';

const routes = [
  {
    path: '/sensors',
    name: 'SensorList',
    component: SensorList
  },
  {
    path: '/sensors/add',
    name: 'AddSensor',
    component: AddSensor
  }

];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;

