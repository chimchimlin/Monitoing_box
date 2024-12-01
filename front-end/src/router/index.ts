import { createRouter, createWebHistory } from 'vue-router'

import Home from '../view/Home.vue'
import LoginPage from '../view/LoginPage.vue'
import Map from '../view/Map.vue'
import SensorChart from '../view/SensorChart.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'LoginPage',
      component: LoginPage
    },
    {
      path: '/map',
      name: 'SensorMap',
      component: Map
    },
    {
      path: '/sensor/:id',
      name: 'SensorChart',
      component: Home
    }
  ]
})

export default router