import {
    Client,
    ClientPresenceStatus,
    EmbedBuilder,
    GatewayIntentBits,
    HexColorString,
    TextChannel
} from 'discord.js';
import type { BotConfig } from '../../@types/Config.types.js';
import { getFormatTime } from '../../util/getFormatTime.js';


export class Bot {
    public channelId: string;
    public playing: string;
    public status: string;
    public embedsColor: HexColorString;
    public webUrl: string

    #client: Client;
    #token: string;

    constructor(token: string, config: BotConfig) {
        this.#client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent
            ]
        });
        this.#token = token;


        if (!/^\d+$/.test(config.channelId)) {
            throw new Error('Invalid channelId format. It must be a numeric string.');
        }

        this.channelId = config.channelId;
        this.playing = config.playing;
        this.status = config.status;
        this.embedsColor = config.embedsColor;
        this.webUrl = config.webUrl
    }


    /**
     * 啟動 Bot
     * @param token 
     */
    public async start() {
        this.events();

        return await this.#client.login(this.#token);
    }

    /**
     * 註冊 events
     */
    public async events() {
        this.#client.on('ready', async () => {
            this.#client.user?.setStatus(this.status as ClientPresenceStatus);
            this.#client.user?.setActivity(this.playing);

            console.log(`>>> Logged in as ${this.#client.user?.username}`);
        });
    }

    /**
     * 發送火災通知訊息至指定頻道
     */
    public async sendMessage(dev_addr: string, sensorName: string, timeString: string): Promise<void> {
        const channel = await this.#client.channels.fetch(this.channelId);

        if (channel?.isTextBased()) {
            const embed_ = new EmbedBuilder()
                .setColor(this.embedsColor)
                .setTitle(`🔥 火災通知`)
                .setDescription(`網頁管理介面: ${this.webUrl} \n━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
                .addFields({ name: `${sensorName} (${dev_addr})`, value: `發生時間: ${timeString}` })
                .setTimestamp();


            (channel as TextChannel).send({ embeds: [embed_] }).catch((err) => {
                console.error(`>>> Failed to send message: ${err.message}`);
            });

            console.log('Message sent');
        }
        else {
            console.error('>>> Channel is not text-based or does not exist');
        }
    }
}
