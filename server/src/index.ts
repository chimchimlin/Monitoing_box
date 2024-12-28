import { Controller } from "./Controller.js";
import { getLogFormatTime } from "./util/getFormatTime.js";


const controller = new Controller();


const startApp = async () => {
    controller.app?.on('debug', (msg: any) => {
        console.log(getLogFormatTime(), '[api][debug]', msg);
    });

    controller.app?.on('request', (req: any) => {
        const ip = req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.ip;

        if (Object.keys(req.body).length === 0) {
            console.log(getLogFormatTime(), '[api][request]', ip, req.url);
        }
        else {
            console.log(getLogFormatTime(), '[api][request]', ip, req.url, req.body);
        }
    });

    controller.app?.on('requestFail', (ip: string, failType: 'UNAUTHORIZED' | 'FORBIDDEN', path: string) => {
        console.log(getLogFormatTime(), '[api][requestFail]', ip, failType, path);
    });

    controller.app?.on('response', (res: any) => {
        //console.log(getLogFormatTime(),'[api][response]', res);
    });

    controller.app?.on('error', (msg: any) => {
        console.log(getLogFormatTime(), color.red, msg, color.white);
    });

    controller.app?.on('warn', (msg: any) => {
        console.log(getLogFormatTime(), color.yellow, msg, color.white);
    });


    await controller.initExpress();
};


const color = {
    cyan: '\x1B[36m',
    green: '\x1B[32m',
    grey: '\x1B[2m',
    red: '\x1B[31m',
    white: '\x1B[0m',
    yellow: '\x1B[33m'
}




const main = async () => {
    const sucess = await controller.ininMQTT();

    if (!sucess) {
        console.log(getLogFormatTime(), '[MQTT] MQTT client not enabled');
    }

    await controller.initBot();
    await startApp();
}

main();
