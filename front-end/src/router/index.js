import { createRouter, createWebHistory } from 'vue-router';
import Home from '../view/Home.vue';  // 主頁面組件
import Map from '../view/Map.vue';    // 地圖頁面組件
import SensorChart from '../view/SensorChart.vue';    // 圖表頁面組件

const routes = [
  
  {
    path: '/Map',
    name: 'SensorMap',
    component: Map
  },
  {
    path: '/Sensor/:id',
    name: 'SensorChart',
    component: Home
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
