import { Controller } from "./Controller.js";
import { getFormatTime } from "./util/getFormatTime.js";


const controller = new Controller();


const startApp = async () => {
    controller.app?.on('debug', (msg: any) => {
        console.log(getFormatTime(), '[api][debug]', msg);
    });

    controller.app?.on('request', (req: any) => {
        const ip = req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.ip;

        if (Object.keys(req.body).length === 0) {
            console.log(getFormatTime(), '[api][request]', ip, req.url);
        }
        else {
            console.log(getFormatTime(), '[api][request]', ip, req.url, req.body);
        }
    });

    controller.app?.on('requestFail', (ip: string, failType: 'UNAUTHORIZED' | 'FORBIDDEN', path: string) => {
        console.log(getFormatTime(), '[api][requestFail]', ip, failType, path);
    });

    controller.app?.on('response', (res: any) => {
        //console.log(getFormatTime(),'[api][response]', res);
    });

    controller.app?.on('error', (msg: any) => {
        console.log(getFormatTime(), color.red, msg, color.white);
    });

    controller.app?.on('warn', (msg: any) => {
        console.log(getFormatTime(), color.yellow, msg, color.white);
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
        console.log(getFormatTime(), '[MQTT] MQTT client not enabled');
    }

    await startApp();
}

main();
