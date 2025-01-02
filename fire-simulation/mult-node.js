import fs from 'fs';
import mqtt from 'mqtt';


// 多個裝置的地址
const DEV_ADDRS = [
    '00000000008e6ae1',
    '00000000008e6ae2',
    '00000000008e6ae3',
    '00000000008e6ae4'
];

// 各個節點的資料類型順序
const dataTypes = [
    [1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    [1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    [1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];


const BATTERY_PERCENT = 85;
const INTERVAL_TIME = 5 * 1000;    // 10s 發送一次

const mqttConfig = {
    brokerUrl: 'mqtt://<host>:<port>',
    username: 'username',
    password: 'password',
    topic: 'GIOT-GW/UL/fire-simulation'
};


// 模擬的正常與火災數據
const normalData = JSON.parse(fs.readFileSync('./data/normal-data.json', 'utf-8'));
const fireData = JSON.parse(fs.readFileSync('./data/fire-data.json', 'utf-8'));




const floatToHex = (value, buffer, offset) => {
    const floatArray = new Float32Array([value]);
    const intArray = new Uint8Array(floatArray.buffer);
    for (let i = 0; i < 4; i++) {
        buffer[offset + i] = intArray[3 - i];
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

const sendDataToMQTT = (data, devAddr) => {
    const buffer = new Uint8Array(18);  // 儲存 hex sensor data

    // 轉換數據並填充 buffer
    floatToHex(data.temperature, buffer, 0);        // 轉換溫度
    floatToHex(data.humidity, buffer, 4);           // 轉換濕度
    floatToHex(data.pressure, buffer, 8);           // 轉換氣壓
    floatToHex(data.gas_resistance, buffer, 12);    // 轉換氣體阻抗
    buffer[16] = Number(BATTERY_PERCENT).toString(16);
    buffer[17] = Number(data.is_fire === 1 ? 1 : 0).toString(16);

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
        "macAddr": devAddr,
        "data": hexString,
        "frameCnt": 0,
        "fport": 2
    }];

    mqttClient.publish(mqttConfig.topic, JSON.stringify(sendData), (err) => {
        if (err) {
            console.error(`Failed to publish message for ${devAddr}:`, err);
        }
        else {
            console.log(`Message sent for ${devAddr}:`, sendData);
        }
    });
};


const main = async () => {
    if (DEV_ADDRS.length !== dataTypes.length) {
        console.log('Simulation data does not match DEV_ADDRS length.');
        process.exit(1);
    }


    console.log('Loading sensor data successfully.');
    console.log('----------------------------');

    let currentIndex = Array(DEV_ADDRS.length).fill(0);  // 初始化每個節點的當前索引

    const interval = setInterval(() => {
        DEV_ADDRS.forEach((devAddr, idx) => {
            const type = dataTypes[idx][currentIndex[idx]] || dataTypes[idx][dataTypes[idx].length - 1];

            const sensorData = (type === 1)
                ? normalData[Math.floor(Math.random() * normalData.length)]
                : fireData[Math.floor(Math.random() * fireData.length)];

            sendDataToMQTT(sensorData, devAddr);

            console.log(`Device ${devAddr} - Data Type: ${type === 1 ? 'Normal' : 'Fire'}`);
            console.log(`Sensor data #${currentIndex}:`);
            console.log(`Temperature: ${sensorData.temperature},\t Hex: ${getFloatToHex(sensorData.temperature)}`);
            console.log(`Humidity: ${sensorData.humidity},\t Hex: ${getFloatToHex(sensorData.humidity)}`);
            console.log(`Pressure: ${sensorData.pressure},\t Hex: ${getFloatToHex(sensorData.pressure)}`);
            console.log(`Gas Resistance: ${sensorData.gas_resistance},\t Hex: ${getFloatToHex(sensorData.gas_resistance)}`);
            console.log(`Battery Percent: ${BATTERY_PERCENT},\t Hex: ${Number(BATTERY_PERCENT).toString(16)}`);
            console.log(`Is fire: ${sensorData.is_fire}`);
            console.log('----------------------------');

            currentIndex[idx] = ((currentIndex[idx] + 1) < dataTypes[idx].length) ? (currentIndex[idx] + 1) : (dataTypes[idx].length - 1);
        });
        console.log('-\n-\n-');
    }, INTERVAL_TIME);

    process.on('SIGINT', () => {
        console.log('Program terminated. Stopping interval.');
        clearInterval(interval);
        mqttClient.end();
    });
};

main();
