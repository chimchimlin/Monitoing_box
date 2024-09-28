/**
 * 配置檔 (所有值須設置否則會出錯)
 * 
 * @type {import("./src/@types/Config.types.js").Config} - config
 * 
 * @property {object} apiConfig - api 設置及開關
 * @property {string} apiConfig.host - api host
 * @property {number} apiConfig.port - api port
 * @property {object} apiConfig.enableModule - 是否啟用子模塊
 * @property {object} apiConfig.enableModule.mqtt - 是否啟用 MQTT client 接收 LoRaWAN gateway 資料
 * 
 * @property {object} IPBlocker - IPBlocker config
 * @property {number} IPBlocker.retryLimit - 重試次數 (default: 5)
 * @property {number} IPBlocker.unlockTimeoutDuration - 封鎖時間(ms) (default: 5 minutes)
 * @property {number} IPBlocker.cleanupInterval - 定時清理器時間(ms) (default: 5 minutes)
 * 
 * @property {object} mqttConfig - MQTT config
 * @property {string} topic - 要訂閱的主題
 * @property {mqtt.IClientOptions} options - MQTT 連接選項
 * 
 */
const config = {
    apiConfig: {
        host: '0.0.0.0',
        port: 4000,
        enableModule: {
            mqtt: true
        }
    },
    ipBlocker: {
        retryLimit: 5,
        unlockTimeoutDuration: 5 * 60 * 1000,
        cleanupInterval: 5 * 60 * 1000
    },
    mqttConfig: {
        topic: 'GIOT-GW/UL/#',
        options: {
            username: 'iot2024',
            password: 'isuCSIE2024#',
            servers: [
                {
                    host: '127.0.0.1',
                    port: 1883,
                    protocol: 'mqtt'
                }
            ]
        }
    }
};

export { config };