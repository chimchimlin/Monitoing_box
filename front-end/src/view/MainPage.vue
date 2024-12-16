<template>
  <el-container class="layout-container-demo" style="height:100vh">

    <!-- 側邊欄位區域 -->
    <el-aside width="200px">
      <el-menu default-active="2" class="el-menu-vertical-demo" @open="handleOpen" @close="handleClose">

        <el-menu-item index="1" @click="router.push('/map')">
          <el-icon>
            <icon-menu />
          </el-icon>
          <span>首頁</span>
        </el-menu-item>

        <el-sub-menu index="2">
          <template #title>
            <el-icon>
              <document />
            </el-icon>
            <span>選擇感測器</span>
          </template>
          <el-menu-item v-for="(sensor, index) in sensorStore.state.sensors" :key="sensor.id"
            @click="selectSensor(sensorStore.state.sensors[index] as Sensor)">
            {{ sensor.dev_addr }}
          </el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="3">
          <template #title>
            <el-icon>
              <location />
            </el-icon>
            <span>設定</span>
          </template>
          <el-menu-item index="4-1">管理員</el-menu-item>
          <el-menu-item index="4-2">版本</el-menu-item>
        </el-sub-menu>

        <el-menu-item index="4">
          <el-icon>
            <document />
          </el-icon>
          <span @click="logOut()">登出</span>
        </el-menu-item>

      </el-menu>
    </el-aside>

    <!-- 內容區域 (包含 header & content) -->
    <el-container>

      <!-- header -->
      <!--
        <el-header>
        </el-header>
      -->

      <!-- content -->
      <el-main>
        <RouterView></RouterView>
      </el-main>

    </el-container>
  </el-container>
</template>


<script lang="ts" setup>
import axios from 'axios';
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

import sensorStore from '@/stores/sensorStore';
import { changeLogState } from '@/stores/isLogin';

import type { Sensor } from '../stores/sensorStore';


const router = useRouter();


onMounted(async () => {
  await sensorStore.fetchSensors();
});

const store = changeLogState();
const { LogOut } = store;


// 控制側邊欄 收合(true) / 展開(false)
const isCollapse = ref(false);
const triggerMenu = () => {
  isCollapse.value = !isCollapse.value;
};

const selectSensor = (sensor: Sensor) => {
  console.log('選擇感測器：', sensor.name);
  sensorStore.setCurrentSensorById(sensor.id);
  router.push(`/Sensor/${sensor.id}`);
};

const handleOpen = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}

const handleClose = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}


/**
 * 登出
 */
const logOut = async () => {
  await axios.post('/api/service/logout');
  router.push("/login");
  LogOut();
};

</script>
