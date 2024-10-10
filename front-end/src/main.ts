import { createApp } from 'vue';
import App from './App.vue';
import router from './router';


// bootstrap 5 樣式引入
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.js";

// vue 3 ElementPlus 組件引入
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';

// ElementPlus 中文設定
import zhTw from 'element-plus/es/locale/lang/zh-tw';
import 'dayjs/locale/zh-tw';

const app = createApp(App);

app.use(ElementPlus, {
  locale: zhTw,
});
app.use(ElementPlus)
app.use(router);
app.mount('#app');