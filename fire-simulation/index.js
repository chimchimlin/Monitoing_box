import fs from 'fs';
import mqtt from 'mqtt';


const DEV_ADDR = '00000000007e6ae3';

const BATTERY_PERCENT = 85;
const INTERVAL_TIME = 10 * 1000;    // 10s 發送一次

const mqttConfig = {
    brokerUrl: 'mqtt://<host>:<port>',
    username: 'username',
    password: 'password',
    topic: 'GIOT-GW/UL/fire-simulation'
};




const floatToHex = (value, buffer, offset) => {
    const floatArray = new Float32Array([value]);           // 建立浮點數陣列
    const intArray = new Uint8Array(floatArray.buffer);     // 取得對應的 Uint8Array 表示

    // 按照大端序（big-endian）順序複製 4 個 bytes 到 buffer 中
    for (let i = 0; i < 4; i++) {
        buffer[offset + i] = intArray[3 - i];  // 反轉順序
    }
};

const getFloatToHex = (value) => {
    const buffer = new ArrayBuffer(4);      // 建立一個 4 字節的 ArrayBuffer
    const view = new DataView(buffer);      // 用 DataView 來處理 ArrayBuffer

    view.setFloat32(0, value, false);       // false 表示大端序（Big Endian）

    // 將每個 byte 轉換為 16 進位字串
    let hexString = '';
    for (let i = 0; i < 4; i++) {
        let byte = view.getUint8(i);
        hexString += byte.toString(16).padStart(2, '0');  // 將 byte 轉換為 2 位的 16 進位數字串
    }

    return hexString;
};


const mqttClient = mqtt.connect(mqttConfig.brokerUrl, {
    username: mqttConfig.username,
    password: mqttConfig.password
});

mqttClient.on('connect', () => {
    console.log('MQTT connected!');
});

mqttClient.on('error', (err) => {
    console.error('MQTT connection error:', err);
});

const sendDataToMQTT = (data) => {
    const buffer = new Uint8Array(20);  // 儲存 hex sensor data

    // 轉換數據並填充 buffer
    floatToHex(data.temperature, buffer, 0);        // 轉換溫度
    floatToHex(data.humidity, buffer, 4);           // 轉換濕度
    floatToHex(data.pressure, buffer, 8);           // 轉換氣壓
    floatToHex(data.gas_resistance, buffer, 12);    // 轉換氣體阻抗
    floatToHex(BATTERY_PERCENT, buffer, 16);        // 轉換電池電量百分比

    // 將 buffer 轉換為 hex string
    const hexString = Array.from(buffer)
        .map(byte => byte.toString(16).padStart(2, '0'))  // 將每個 byte 轉換為 2 位數 hex string
        .join('');

    const sendData = [{
        "channel": 923800000,
        "sf": 7,
        "time": (new Date().toISOString().split('.')[0]),
        "gwip": "192.168.2.18",
        "gwid": "0000111111111111",
        "repeater": "00000000ffffffff",
        "systype": 0,
        "rssi": -72.0,
        "snr": 24.5,
        "snr_max": 37.5,
        "snr_min": 15.8,
        "macAddr": DEV_ADDR,
        "data": hexString,
        "frameCnt": 0,
        "fport": 2
    }];

    mqttClient.publish(mqttConfig.topic, JSON.stringify(sendData), (err) => {
        if (err) {
            console.error('Failed to publish message:', err);
        }
        else {
            console.log('Message sent:', sendData);
        }
    });
};


const main = async () => {
    const rawData = fs.readFileSync('./data/sensor-data.json', 'utf-8');
    const sensorData = JSON.parse(rawData);
    let currentIndex = 0;

    console.log(`Loading sensor data successfully, data count: ${sensorData.length}`);
    console.log('----------------------------');

    const interval = setInterval(() => {
        if (currentIndex < sensorData.length) {
            // 發送 sensor data 到 MQTT
            sendDataToMQTT(sensorData[currentIndex]);
            currentIndex++;
        }
        else {
            console.log('All data sent. Continuing to send last data...');
            // 當所有資料發送完後，繼續發送最後一筆資料
            sendDataToMQTT(sensorData[sensorData.length - 1]);
        }

        console.log(`Sensor data #${currentIndex}:`);
        console.log(`Temperature: ${sensorData[currentIndex - 1].temperature},\t Hex: ${getFloatToHex(sensorData[sensorData.length - 1].temperature)}`);
        console.log(`Humidity: ${sensorData[currentIndex - 1].humidity},\t Hex: ${getFloatToHex(sensorData[sensorData.length - 1].humidity)}`);
        console.log(`Pressure: ${sensorData[currentIndex - 1].pressure},\t Hex: ${getFloatToHex(sensorData[sensorData.length - 1].pressure)}`);
        console.log(`Gas Resistance: ${sensorData[currentIndex - 1].gas_resistance},\t Hex: ${getFloatToHex(sensorData[sensorData.length - 1].gas_resistance)}`);
        console.log(`Battery Percent: ${BATTERY_PERCENT},\t Hex: ${getFloatToHex(BATTERY_PERCENT)}`);
        console.log('----------------------------');
    }, INTERVAL_TIME);


    // 當按下 ctrl + c 退出程式時停止發送
    process.on('SIGINT', () => {
        console.log('Program terminated. Stopping interval.');
        clearInterval(interval);
        mqttClient.end();
    });
};

main();
