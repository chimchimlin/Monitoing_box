import { setTimeout } from 'timers/promises';
import * as mqtt from 'mqtt';
import { getFormatTime, getLogFormatTime } from '../../util/getFormatTime.js';

import type { Bot } from '../discord/Bot.js';
import type { Database } from '../database/Maria.js';
import type { MQTTConfig } from '../../@types/Config.types.js';


export type MQTTData = {
    channel: number;    // LoRaWAN 通道頻率 (MHz)
    sf: number;         // 擴頻因子 (Spreading Factor)，用於控制資料速率和傳輸範圍
    time: string;       // 接收時間 (timestamp) (2024-06-23T05:05:05.000Z)
    gwip: string;       // LoRa 網關的 IP (不一定是 public ip)
    gwid: string;       // 網關的唯一識別碼
    repeater: string;   // 中繼器的ID，如果沒有使用中繼器，通常為 "00000000ffffffff"
    systype: number;    // 系統類型，0 表示一般系統類型
    rssi: number;       // 接收訊號強度指示 (Received Signal Strength Indicator) (dBm)
    snr: number;        // 訊號雜訊比 (Signal-to-Noise Ratio)
    snr_max: number;    // 接收到的最大訊號雜訊比
    snr_min: number;    // 接收到的最小訊號雜訊比
    macAddr: string;    // Heltec 的 MAC address (dev_addr)
    data: string;       // Sensor data
    frameCnt: number;   // 幀計數器，表示此次傳輸的資料幀數
    fport: number;      // LoRaWAN 訊框的連接 port 號，用來區分不同類型的資料
}

/**
 * 接收到的 hex data 轉換成陣列所需的長度
 */
const SENSOR_DATA_ARRAY_LENGTH = 18;

/**
 * Discord bot 消息重發時間間隔 (ms)
 */
const FIRE_ALERT_COOLDOWN = 5 * 60 * 1000;

export class MQTT {
    #mqtt;
    #topic: string;
    #options: mqtt.IClientOptions;
    #client!: mqtt.MqttClient;
    #bot: Bot | null;
    #db: Database;
    #notificationTimestamps: Map<string, number>;


    constructor(config: MQTTConfig, db: Database, bot: Bot | null) {
        this.#bot = bot;
        this.#mqtt = mqtt;
        this.#topic = config.topic
        this.#options = config.options
        this.#db = db;

        this.#notificationTimestamps = new Map();
    }


    public async start() {
        this.#client = this.#mqtt.connect(this.#options);
        this.#startListening();
        await setTimeout(1000);
    }

    #startListening() {
        this.#client.on('connect', () => {
            this.#client.subscribe(this.#topic, (err) => {
                if (err) {
                    console.log(getLogFormatTime(), '[MQTT] Failed to subscribe to topic:', err);
                }
                else {
                    console.log(getLogFormatTime(), `[MQTT] Subscribed to topic: ${this.#topic}`);
                }
            });
        });

        this.#client.on('message', async (topic, message) => {
            const receivedData = JSON.parse(message.toString())[0] as MQTTData;

            // console.log(getLogFormatTime(), `[MQTT] Received message from ${topic}: `, JSON.parse(message.toString())[0]);
            console.log(getLogFormatTime(), `[MQTT] Received data from ${topic}: `, message.toString());


            const sensorDataArray = this.#hexToFloatArray(receivedData.data);
            console.log(getLogFormatTime(), '[MQTT] sensorDataArray', receivedData.data, sensorDataArray);

            // Check data length valid
            if (!sensorDataArray) {
                return;
            }

            /**
             * 0: temperature
             * 1: humidity
             * 2: pressure
             * 3: gas_resistance
             * 4: battery level (%)
             * 5: 是否火災
             */
            const sensorData = {
                temperature: sensorDataArray[0],
                humidity: sensorDataArray[1],
                pressure: sensorDataArray[2],
                gas_resistance: sensorDataArray[3],
                battery: sensorDataArray[4],
                is_fire: sensorDataArray[5]
            }

            const checkQuery = `
                SELECT EXISTS (
                    SELECT 1 FROM Sensor WHERE dev_addr = "${receivedData.macAddr}"
                ) AS record_exists;
            `;
            const checkResult = await this.#db.query(checkQuery);

            // dev_addr 是否存在 Sensor table 中
            if (checkResult.length === 0 || Number((checkResult[0] as any).record_exists) === 0) {
                return;
            }


            /**
             * CREATE PROCEDURE AddSensorData(
             *   IN mac_addr VARCHAR(16),
             *   IN temperature FLOAT,
             *   IN humidity FLOAT,
             *   IN pressure FLOAT,
             *   IN gas_resistance FLOAT,
             *   IN battery INT
             * )
             */
            const query = `
                CALL AddSensorData (
                    "${receivedData.macAddr}", 
                    ${sensorData.temperature}, 
                    ${sensorData.humidity}, 
                    ${sensorData.pressure}, 
                    ${sensorData.gas_resistance}, 
                    ${sensorData.is_fire === 1 ? 1 : 0}, 
                    ${sensorData.battery}
                );
            `;
            const result = await this.#db.query(query);
            // console.log('INSERT sensorData', result);

            // 是否發生火災
            if (sensorData.is_fire) {
                try {
                    // 根據 macAddr 獲取 sensorId
                    const currentTime = Date.now();
                    const lastNotificationTime = this.#notificationTimestamps.get(receivedData.macAddr) || 0;

                    if (currentTime - lastNotificationTime < FIRE_ALERT_COOLDOWN) {
                        console.log(getLogFormatTime(), `[MQTT] Fire notification for ${receivedData.macAddr} suppressed.`);
                        return;
                    }

                    const query = `SELECT id, description FROM Sensor WHERE dev_addr = "${receivedData.macAddr}";`;
                    const result = await this.#db.query(query);

                    const sensorId = result.length > 0 ? (result[0] as any).id : null;
                    const sensorName = result.length > 0 ? (result[0] as any).description : '感測器';

                    if (sensorId) {
                        // 設置火災狀態
                        const callQuery = `CALL SetSensorOnFire(${sensorId});`;
                        await this.#db.query(callQuery);

                        if (this.#bot) {
                            await this.#bot.sendMessage(receivedData.macAddr, sensorName, getFormatTime());
                            this.#notificationTimestamps.set(receivedData.macAddr, currentTime);
                        }

                        console.log(getLogFormatTime(), `[MQTT] Fire detected for sensor ${receivedData.macAddr}`);
                    }
                } catch (error) {
                    console.log(getLogFormatTime(), `[MQTT] Fire to setup fire notification on sensor ${receivedData.macAddr}`, error);
                }
            }
        });

        this.#client.on('error', (err) => {
            console.log(getLogFormatTime(), '[MQTT] Connection error:', err);
        });
    }


    /**
     * 把從 MQTT 獲取的 hex data 解析
     * @private
     */
    #hexToFloatArray(hex: string) {
        if (hex.length !== SENSOR_DATA_ARRAY_LENGTH * 2) {
            console.log(getLogFormatTime(), `[MQTT] [error] Hex string length error`, hex);
            return false;
        }


        const hexArray = hex.match(/.{2}/g)!;

        /**
         * 0: temperature
         * 1: humidity
         * 2: pressure
         * 3: gas_resistance
         * 4: battery level (%)
         * 5: 是否火災
         */
        const floatArray: number[] = [];

        const hexToFloat32 = (hexChunk: string) => {
            const buffer = Buffer.from(hexChunk, 'hex');
            const float = buffer.readFloatBE(0);
            const formattedFloat = parseFloat(float.toFixed(2));
            return formattedFloat;
        };

        // 解析 temperature
        const temperatureHex = hexArray.slice(0, 4).join('');
        floatArray.push(hexToFloat32(temperatureHex));

        // 解析 humidity
        const humidityHex = hexArray.slice(4, 8).join('');
        floatArray.push(hexToFloat32(humidityHex));

        // 解析 pressure
        const pressureHex = hexArray.slice(8, 12).join('');
        floatArray.push(hexToFloat32(pressureHex));

        // 解析 gas_resistance
        const gasResistanceHex = hexArray.slice(12, 16).join('');
        floatArray.push(hexToFloat32(gasResistanceHex));

        // 解析 battery level (%)
        const batteryHex = hexArray[16];
        const batteryLevel = parseInt(batteryHex, 16);
        floatArray.push(batteryLevel);

        // 解析 是否火災
        const fireHex = hexArray[17];
        const fire = parseInt(fireHex, 16) === 1 ? 1 : 0;
        floatArray.push(fire);


        return floatArray;
    }
}
