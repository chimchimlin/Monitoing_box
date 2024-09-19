import { createRouter, createWebHistory } from 'vue-router'
import Home from '../view/Home.vue'
import Map from '../view/Map.vue'
import SensorChart from '../view/SensorChart.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
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
  ]
})

export default router