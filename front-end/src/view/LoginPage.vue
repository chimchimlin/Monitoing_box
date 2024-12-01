<template>
  <div class="login-container">
    <h1 class="main-title">LoRa 火災監測與數據分析平台</h1>
    <h2>登入</h2>

    <form @submit.prevent="handleLogin()">
      <div class="form-group">
        <label for="username">帳號</label>
        <input id="username" v-model="loginForm.username" type="text" placeholder="請輸入帳號" required />
      </div>

      <div class="form-group">
        <label for="password">密碼</label>
        <input id="password" v-model="loginForm.password" type="password" placeholder="請輸入密碼" required />
      </div>

      <!-- 錯誤訊息 -->
      <div class="msg-container" v-if="errorMessage" style="color: red;">{{ errorMessage }}</div>

      <button type="submit" class="submit-button" :disabled="isLoading">
        <span v-if="!isLoading">登入</span>
        <span v-else>
          <i class="loading-spinner"></i> 登入中...
        </span>
      </button>
    </form>

  </div>
</template>


<script setup lang="ts">
import axios from "axios";
import { ref } from 'vue';

import router from '@/router';
import { changeLogState } from '@/stores/isLogin';
import { LoadType } from '@/@types/Response.types';


// pinia
const store = changeLogState();
const { LogIn, LogOut } = store;


const errorMessage = ref('');
const loginForm = ref({
  username: '',
  password: ''
});
const isLoading = ref(false);   // loading 狀態


/**
 * 登入處理
 */
const handleLogin = async () => {
  errorMessage.value = '';    // 清除錯誤訊息

  // 參數檢查
  if (!loginForm.value.username || !loginForm.value.password) {
    errorMessage.value = '請填寫所有必填欄位';
    return;
  }


  try {
    isLoading.value = true;

    const loginResponse = await axios.post('/api/service/login', loginForm.value);

    isLoading.value = false;

    // 登入成功
    if (loginResponse.data.loadType === LoadType.SUCCEED) {
      LogIn();
      router.push('/map');
      router.replace('/map');
      history.replaceState(null, '', '/');

      // console.log('document.cookie', document.cookie);
      return;
    }
    // 已登入 需跳轉
    // 應該在載入網頁時就檢查有沒有 headers.cookie.sessionId 
    else if (loginResponse.data.loadType === LoadType.SESSION_EXISTS) {
      LogIn();
      router.push('/map');
      // console.log('SESSION_EXISTS document.cookie', document.cookie);
      return;
    }
    // 帳號或密碼錯誤
    else if (loginResponse.data.loadType === LoadType.FAILED_LOGIN) {
      errorMessage.value = '帳號或密碼錯誤';
      LogOut();
      return;
    }
    // 密碼錯誤太多次 被鎖幾分鐘
    else if (loginResponse.data.loadType === LoadType.BLOCKED_LOGIN) {
      errorMessage.value = '密碼錯誤太多次 請稍後再試';
      LogOut();
      return;
    }
    // 參數錯誤
    else if (loginResponse.data.loadType === LoadType.PARAMETER_ERROR) {
      // 前端錯誤
      errorMessage.value = '網頁端參數錯誤，請聯絡管理員';
      return;
    }

    // 例外狀況
    throw new Error("An unknown error occurred while logging in: " + JSON.stringify(loginResponse.data));
  } catch (error) {
    isLoading.value = false;
    console.error('登入錯誤:', error);
    errorMessage.value = '伺服器意外關閉，請聯絡管理員 ' + error;
  }
};

</script>


<style lang="css" scoped>
.login-container {
  width: 400px;
  margin: 50px auto;
  padding: 20px;
  background-color: #003b6f;
  color: white;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
}

.main-title {
  font-size: 24px;
  margin-bottom: 30px;
  color: #fff;
}

h2 {
  font-size: 20px;
}

.form-group {
  margin-bottom: 15px;
  text-align: left;
}

label {
  display: block;
  margin-bottom: 5px;
}

input {
  width: 100%;
  padding: 8px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

input:focus {
  outline: none;
  border-color: #0078d7;
}

.submit-button {
  width: 100%;
  padding: 10px;
  background-color: #0078d7;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 20px;
}

.submit-button:hover {
  background-color: #005ea3;
}
</style>