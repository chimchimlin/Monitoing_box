import { App } from "./express/App.js";
import { Authorizer } from "./lib/session-manager/Authorizer.js";
import { Database } from "./lib/database/Maria.js";
import { Bot } from "./lib/discord/Bot.js";
import { MQTT } from "./lib/mqtt/MQTT.js";
import { SessionManager } from "./lib/session-manager/SessionManager.js";
import { loadEnviornment } from "./loader/loadEnviornment.js";

import { config } from "../config.js";

import type { Config } from "./@types/Config.types.js";


export class Controller {
    public config: Config;
    public app: App;

    #db: Database;
    #mqtt: MQTT | null;
    #bot: Bot | null;
    #sessionManager: SessionManager;


    constructor() {
        this.config = config;
        const env = loadEnviornment();

        this.#db = new Database(env.dbConfig);
        this.#sessionManager = new SessionManager(new Authorizer(env.salt, this.#db), this.#db, this.config.ipBlocker);
        this.#bot = (this.config.apiConfig.enableModule.dcbot) ? new Bot(env.botToken, this.config.botConfig) : null;
        this.#mqtt = (this.config.apiConfig.enableModule.mqtt) ? new MQTT(this.config.mqttConfig, this.#db, this.#bot) : null;
        this.app = new App(this.config.apiConfig, this.#db, this.#sessionManager);
    }


    /**
     * 啟動 express 框架
     */
    public async initExpress(): Promise<void> {
        await this.app?.setRoutes();
        this.app?.startListening();
    }

    /**
     * 啟動 Disocrd bot
     */
    public async initBot(): Promise<void> {
        await this.#bot?.start();
    }

    /**
     * 啟動 MQTT client
     * @returns {Promise<boolean>} - true: 已啟用, false: 未啟用
     */
    public async ininMQTT(): Promise<boolean> {
        if (!this.#mqtt) {
            return false;
        }

        await this.#mqtt.start();
        return true;
    }
}