import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import axios from 'axios';

// https://vitejs.dev/config/
//https://netlab.isu.edu.tw:59534/
export default defineConfig({
    plugins: [vue()],
    server: {
        proxy: {
            '/api': {
                target: 'https://sensor-server.ggwp.tw/',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, '/api'),
                //async onProxyReq(proxyReq) {
                  //  proxyReq.headers['Authorization'] = 'Bearer your_access_token';
                //},
                async onProxyRes(proxyRes) {

                    const data = await proxyRes.data;
                    console.log('Response from proxy:', data);
                    return data;
                },
            },
        },
    },
});
