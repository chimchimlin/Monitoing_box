/**
 * sensor_node.ino config file
*/

#ifndef CONFIG_H
#define CONFIG_H

#define DEBUG_MODE 1    // Debug mode, 0 or 1


/**
 * LoRaWAN ABP config
 */

// Network Session Key (16 bytes)
#define NWK_SKEY {0x15, 0xb1, 0xd0, 0xef, 0xa4, 0x63, 0xdf, 0xbe, 0x3d, 0x11, 0x18, 0x1e, 0x1e, 0xc7, 0xda, 0x85}

// Application Session Key (16 bytes)
#define APP_SKEY {0xd7, 0x2c, 0x78, 0x75, 0x8c, 0xdc, 0xca, 0xbf, 0x55, 0xee, 0x4a, 0x77, 0x8d, 0x16, 0xef, 0x67}

// Device Address (4 bytes)
#define DEV_ADDR 0x007e6ae1

// LoRaWAN 資料每次發送的時間間格, (ms)
#define LORA_SEND_INTERVAL (10 * 1000)  


/**
 * BME680 I2C pin define
*/
#define BME_SDA_PIN 16  // 藍
#define BME_SCL_PIN 17  // 紫

/* Cached BME680 sensor data */
typedef struct
{
    float temperature;
    float humidity;
    float pressure;
    float gasResistance;
} BME680Data;

#define SENSOR_DATA_SIZE 20     // Sensor data size to be sent


/**
 * LED setup
*/
#define RUNNING_LED GPIO_NUM_33     // 正常運作指示燈 (normal running)
#define DATA_LED GPIO_NUM_34        // 感測資料獲取中指示燈 (getting sensor data)
#define PANIC_LED GPIO_NUM_35       // 錯誤指示燈 (error)
#define ERROR_DURATION 1000         // PANIC_LED 閃爍間隔 (ms)


#endif /* CONFIG_H */