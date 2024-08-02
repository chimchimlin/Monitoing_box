import { setTimeout } from 'timers/promises';
import * as mqtt from 'mqtt';
import { getFormatTime } from '../../util/getFormatTime.js';

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
 * 接收到的 hex data 藉由 IEEE-754 轉換成 float 後的資料數
 */
const SENSOR_DATA_ARRAY_LENGTH = 5;

export class MQTT {
    #mqtt;
    #topic: string;
    #options: mqtt.IClientOptions;
    #client!: mqtt.MqttClient;
    #db: Database;

    constructor(config: MQTTConfig, db: Database) {
        this.#mqtt = mqtt;
        this.#topic = config.topic
        this.#options = config.options
        this.#db = db;
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
                    console.log(getFormatTime(), '[MQTT] Failed to subscribe to topic:', err);
                }
                else {
                    console.log(getFormatTime(), `[MQTT] Subscribed to topic: ${this.#topic}`);
                }
            });
        });

        this.#client.on('message', async (topic, message) => {
            const receivedData = JSON.parse(message.toString())[0] as MQTTData;
            
            // console.log(getFormatTime(), `[MQTT] Received message from ${topic}: `, JSON.parse(message.toString())[0]);
            console.log(getFormatTime(), `[MQTT] Received data from ${topic}: `, message.toString());


            const sensorDataArray = this.#hexToFloatArray(receivedData.data);

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
             */
            const sensorData = {
                temperature: sensorDataArray[0],
                humidity: sensorDataArray[1],
                pressure: sensorDataArray[2],
                gas_resistance: sensorDataArray[3],
                battery: sensorDataArray[4]
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
                CALL AddSensorData(
                    "${receivedData.macAddr}", 
                    ${sensorData.temperature}, 
                    ${sensorData.humidity}, 
                    ${sensorData.pressure}, 
                    ${sensorData.gas_resistance}, 
                    ${sensorData.battery}
                );
            `;
            const result = await this.#db.query(query);
            // console.log('INSERT sensorData', result);
        });

        this.#client.on('error', (err) => {
            console.log(getFormatTime(), '[MQTT] Connection error:', err);
        });
    }


    /**
     * 把從 MQTT 獲取的 hex data 解析
     * @private
     */
    #hexToFloatArray(hex: string) {
        if (hex.length % 8 !== 0) {
            console.log(getFormatTime(), `[MQTT] [error] Hex string length error`, hex);
            return false;
        }


        /**
         * 0: temperature
         * 1: humidity
         * 2: pressure
         * 3: gas_resistance
         * 4: battery level (%)
         */
        const floatArray: number[] = [];

        for (let i = 0; i < hex.length; i += 8) {
            const hexChunk = hex.substring(i, i + 8);
            const buffer = Buffer.from(hexChunk, 'hex');
            const float = buffer.readFloatBE(0);
            const formattedFloat = parseFloat(float.toFixed(2));
            floatArray.push(formattedFloat);
        }

        return (floatArray.length !== SENSOR_DATA_ARRAY_LENGTH) ? false : floatArray;
    }
}



