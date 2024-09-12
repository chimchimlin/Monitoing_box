<!-- App.vue -->
<template>


  <div id="app">
    <router-view />
  </div>

</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Wellcome from './view/Home.vue';


export default defineComponent({
  name: 'App',
  components: {
    Wellcome
    
  }
});
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

h1 {
  color: #333;
  margin: 0;
}

.sensor-list {
  /* 調整這些值以適應您的設計 */
  max-width: 300px;
  max-height: 300px;
  overflow-y: auto;
  background-color: #f0f0f0;
  padding: 100px;
  border-radius: 5px;
}

main {
  /* 確保主要內容在標題下方 */
  clear: both;
}
</style>