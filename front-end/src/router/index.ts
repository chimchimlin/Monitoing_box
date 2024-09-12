import { createRouter, createWebHistory } from 'vue-router';
import Home from '../view/Home.vue';  // �D�����ե�
import Map from '../view/Map.vue';    // �a�ϭ����ե�
import SensorChart from '../view/SensorChart.vue';    // �Ϫ����ե�

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/Map',
    name: 'SensorMap',
    component: Map
  },
  {
    path: '/Sensor/:id',
    name: 'SensorChart',
    component: SensorChart
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
