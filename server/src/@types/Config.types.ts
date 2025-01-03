import type { ClientPresenceStatus, HexColorString } from "discord.js";

/**
 * Server config
 */
export type Config = {
    apiConfig: ApiConfig;
    ipBlocker: IPBlockerConfig;
    mqttConfig: MQTTConfig;
    botConfig: BotConfig;
}

/**
 * api 設置及開關
 * @property {string} host - host (應設置為 localhost)
 * @property {number} port - port
 * @property {object} enableModule - 是否啟用子模塊
 * @property {object} enableModule.mqtt - 是否啟用 MQTT client 接收 LoRaWAN gateway 資料
 * @property {object} enableModule.dcbot - 是否啟用 Discord bot 發送火災通知
 */
export type ApiConfig = {
    host: string;
    port: number;
    enableModule: {
        mqtt: boolean;
        dcbot: boolean;
    }
}

/**
 * IPBlocker config
 * @property {number} retryLimit - 重試次數
 * @property {number} unlockTimeoutDuration - 封鎖時間(ms)
 * @property {number} cleanupInterval - 定時清理器時間(ms)
 */
export type IPBlockerConfig = {
    retryLimit: number;
    unlockTimeoutDuration: number;
    cleanupInterval: number;
}


/**
 * MQTT config
 * @property {string} topic - 要訂閱的主題
 * @property {mqtt.IClientOptions} options - MQTT 連接選項
 */
export type MQTTConfig = {
    topic: string;
    options: {
        username: string;
        password: string;
        servers: Array<{
            host: string;
            port: number;
            protocol?: 'wss' | 'ws' | 'mqtt' | 'mqtts' | 'tcp' | 'ssl' | 'wx' | 'wxs';
        }>;
    }
}

export type BotConfig = {
    channelId: string;
    status: ClientPresenceStatus;
    playing: string;
    embedsColor: HexColorString;
    webUrl: string;
}




/**
 * Enviornment config
 */
export interface EnvConfig {
    salt: string;
    dbConfig: DBConfig;
    smtpConfig: SmtpConfig;
    botToken: string;
}

/**
 * Database config
 */
export interface DBConfig {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
}

/**
 * SMTP account config
 */
export interface SmtpConfig {
    user: string;
    password: string;
}