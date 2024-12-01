/**
 * 獲取 BME680 感測器資料
 * LoRaWan 上傳 server (使用 ABP mode)
 */

#include <Wire.h>
#include <LittleFS.h>
#include "LoRaWan_APP.h"

#include "src/lib/BME680.h"
#include "src/lib/heltec_vbat.h"
#include "src/config/config.h"
#include "src/lib/model.h"



/* OTAA para*/
uint8_t devEui[] = {0x22, 0x32, 0x33, 0x00, 0x00, 0x88, 0x88, 0x02};
uint8_t appEui[] = {0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00};
uint8_t appKey[] = {0x88, 0x88, 0x88, 0x88, 0x88, 0x88, 0x88, 0x88, 0x88, 0x88, 0x88, 0x88, 0x88, 0x88, 0x88, 0x88};

/* ABP para*/
uint8_t nwkSKey[16] = NWK_SKEY;
uint8_t appSKey[16] = APP_SKEY;
uint32_t devAddr = (uint32_t)DEV_ADDR;

/*LoraWan channelsmask, default channels 0-7*/
uint16_t userChannelsMask[6] = {0x00FF, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000};

/*LoraWan region, select in arduino IDE tools*/
LoRaMacRegion_t loraWanRegion = LORAMAC_REGION_AS923; // ACTIVE_REGION;

/*LoraWan Class, Class A and Class C are supported*/
DeviceClass_t loraWanClass = CLASS_A;

/*the application data transmission duty cycle.  value in [ms].*/
uint32_t appTxDutyCycle = LORA_SEND_INTERVAL;

/*OTAA or ABP*/
bool overTheAirActivation = false;

/*ADR enable*/
bool loraWanAdr = true;

/* Indicates if the node is sending confirmed or unconfirmed messages */
bool isTxConfirmed = true;

/* Application port */
uint8_t appPort = 2;

/*!
 * Number of trials to transmit the frame, if the LoRaMAC layer did not
 * receive an acknowledgment. The MAC performs a datarate adaptation,
 * according to the LoRaWAN Specification V1.0.2, chapter 18.4, according
 * to the following table:
 *
 * Transmission nb | Data Rate
 * ----------------|-----------
 * 1 (first)       | DR
 * 2               | DR
 * 3               | max(DR-1,0)
 * 4               | max(DR-1,0)
 * 5               | max(DR-2,0)
 * 6               | max(DR-2,0)
 * 7               | max(DR-3,0)
 * 8               | max(DR-3,0)
 *
 * Note, that if NbTrials is set to 1 or 2, the MAC will not decrease
 * the datarate, in case the LoRaMAC layer did not receive an acknowledgment
 */
uint8_t confirmedNbTrials = 4;


/* Prepares the payload of the frame */
static void prepareTxFrame(uint8_t* data)
{
    appDataSize = SENSOR_DATA_SIZE;
    memcpy(appData, data, SENSOR_DATA_SIZE);
}




BME680 bme(Wire);
BME680Data sensorData;
uint8_t payload[SENSOR_DATA_SIZE];      // Sensor data
float vbat = -1;                        // Battery voltage

double output[2];
void getBME680Readings()
{
    digitalWrite(DATA_LED, HIGH);

    // Tell BME680 to begin measurement.
    unsigned long endTime = bme.beginReading();

    digitalWrite(DATA_LED, LOW);

    if (endTime == 0)
    {
        Serial.println("[BME680] Failed to begin reading :(");
        int stoptime;
        stoptime = millis();
        errLeds(stoptime);
    }
    if (!bme.endReading())
    {
        Serial.println("[BME680] Failed to complete reading :(");
        int stoptime;
        stoptime = millis();
        errLeds(stoptime);
    }

    sensorData.temperature = bme.temperature;
    sensorData.pressure = bme.pressure / 100.0;
    sensorData.humidity = bme.humidity;
    sensorData.gasResistance = bme.gas_resistance / 1000.0;
    double input[3]={(double)sensorData.temperature,(double)sensorData.humidity ,(double)sensorData.gasResistance};
    score(input,output);
}

/**
 * Restart ESP32
 */
void softwareReset()
{
    esp_restart();
}

void errLeds(int stoptime)
{
    int nowtime, over;
    while (1)
    {
        nowtime = millis();

        digitalWrite(PANIC_LED, HIGH);
        delay(ERROR_DURATION);
        digitalWrite(PANIC_LED, LOW);
        delay(ERROR_DURATION);

        over = nowtime - stoptime;

        if (over > ERROR_LOOP_TIME)
        {
            softwareReset();
        }
    }
}

/**
 * 將 float 轉換為 16 進位
 */
void floatToHex(float value, uint8_t* buffer)
{
    int intValue = *(int*)&value;   // 將 float 轉換為 int 表示

    buffer[0] = (intValue >> 24) & 0xFF;
    buffer[1] = (intValue >> 16) & 0xFF;
    buffer[2] = (intValue >> 8) & 0xFF;
    buffer[3] = intValue & 0xFF;
}

/**
 * 將資料使用 LittleFS 寫入 ESP32 txt 中
 */
void logDataToFile(const char* filename, BME680Data data, float batteryPercent)
{
    File file = LittleFS.open(filename, FILE_APPEND);

    if (!file)
    {
        Serial.println("[LittleFS] Failed to open file for appending");
        return;
    }

    // Format the data as a CSV line
    file.printf("%f,%f,%f,%f,%f\n", 
                data.temperature, 
                data.humidity, 
                data.pressure, 
                data.gasResistance, 
                batteryPercent);

    file.close();

    Serial.println("[LittleFS] Data logged successfully");
}


void setup()
{
    Serial.begin(115200);
    Serial.println("----- start init -----");


    // LittleFS
#if (ENABLE_WRITE_TO_TXT)
    Serial.println("[LittleFS] Initialize LittleFS");

    if (!LittleFS.begin(true)) 
    {
        int stoptime;
        stoptime = millis();
        Serial.println("[LittleFS] Failed to mount LittleFS");
        errLeds(stoptime);
    }

    Serial.println("[LittleFS] LittleFS mounted successfully");
#endif


    // LED pin
    pinMode(RUNNING_LED, OUTPUT);
    pinMode(DATA_LED, OUTPUT);
    pinMode(PANIC_LED, OUTPUT);
    digitalWrite(RUNNING_LED, HIGH);
    digitalWrite(DATA_LED, LOW);
    digitalWrite(PANIC_LED, LOW);


    Serial.println("[LoRa] Initialize LoRaWan_APP");
    Mcu.begin();
    deviceState = DEVICE_STATE_INIT;


    Serial.println("[BME680] Initialize sensor");
    bme.setSPIPins(BME_SDA_PIN, BME_SCL_PIN);
    memset(payload, 0xFF, sizeof(payload));     // Default value


    // Init BME680 sensor
    if (!bme.begin())
    {
        int stoptime;
        stoptime = millis();
        Serial.println("[BME680] Could not find a valid BME680 sensor, check wiring!");
        errLeds(stoptime);
    }

    // Set up oversampling and filter initialization
    bme.setTemperatureOversampling(BME680_OS_8X);
    bme.setHumidityOversampling(BME680_OS_2X);
    bme.setPressureOversampling(BME680_OS_4X);
    bme.setIIRFilterSize(BME680_FILTER_SIZE_3);
    bme.setGasHeater(320, 150); // 320*C for 150 ms

    delay(50);
    getBME680Readings();    // Test get sensor data

    Serial.println("[BME680] Successfully initialized sensor");


    Serial.println("----- init ok -----");
}


void loop()
{
     switch (deviceState)
    {
    case DEVICE_STATE_INIT:
    {

#if (LORAWAN_DEVEUI_AUTO)
        LoRaWAN.generateDeveuiByChipID();
#endif

        LoRaWAN.init(loraWanClass, loraWanRegion);
        break;
    }
    case DEVICE_STATE_JOIN:
    {
        LoRaWAN.join();
        break;
    }
    case DEVICE_STATE_SEND:
    {
        vbat = heltec_vbat();
        int battery_percent = heltec_battery_percent(vbat);

        getBME680Readings();    // Get sensor data


#if (ENABLE_WRITE_TO_TXT)
        logDataToFile(TXT_FILE_PATH, sensorData, battery_percent);  // Log to file
#endif


#if (DEBUG_MODE)
        Serial.printf("Temperature = %f ºC \n", sensorData.temperature);
        Serial.printf("Humidity = %f % \n", sensorData.humidity);
        Serial.printf("Pressure = %f hPa \n", sensorData.pressure);
        Serial.printf("Gas Resistance = %f KOhm \n", sensorData.gasResistance);
        Serial.printf("Vbat = %.2fV (%d%%)\n", vbat, heltec_battery_percent(vbat));
        Serial.println();
        Serial.println("--------------");
#endif


        // Convert float data to hex
        floatToHex(sensorData.temperature, payload);            // 轉換溫度
        floatToHex(sensorData.humidity, payload + 4);           // 轉換濕度
        floatToHex(sensorData.pressure, payload + 8);           // 轉換氣壓
        floatToHex(sensorData.gasResistance, payload + 12);     // 轉換氣體阻抗
        payload[16]=battery_percent;                           // 儲存剩餘電池電量%數
        if(output[0]>output[1]){                                // 火災判斷
            payload[17]=0;
            }                
        else if(output[1]>output[0]){
            payload[17]=1;
            }  
        else if(output[1]==output[0]){
            if (sensorData.gasResistance>36){
                payload[17]=0;
            }
            else {
                payload[17]=1;
            }
        }


#if (DEBUG_MODE)
        Serial.print("Temperature (hex): ");
        for (int i = 0; i < 4; ++i) {
            Serial.print(payload[i], HEX);
            // Serial.print(" ");
        }
        Serial.println();

        Serial.print("Humidity (hex): ");
        for (int i = 4; i < 8; ++i) {
            Serial.print(payload[i], HEX);
            // Serial.print(" ");
        }
        Serial.println();

        Serial.print("Pressure (hex): ");
        for (int i = 8; i < 12; ++i) {
            Serial.print(payload[i], HEX);
            // Serial.print(" ");
        }
        Serial.println();

        Serial.print("Gas Resistance (hex): ");
        for (int i = 12; i < 16; ++i) {
            Serial.print(payload[i], HEX);
            // Serial.print(" ");
        }
        Serial.println();

        Serial.print("Battery Percent : ");
        for (int i = 16; i < 17; ++i) {
            Serial.print(payload[i]);
            // Serial.print(" ");
        }

        Serial.println();

        Serial.print("Fire Predict: ");
        for (int i = 17; i < 18; ++i) {
            Serial.print(payload[i]);
            // Serial.print(" ");
        }

        Serial.println();
        Serial.println("--------------");
#endif

        // Send  payload
        prepareTxFrame(payload);
        LoRaWAN.send();

#if (DEBUG_MODE)
        Serial.println("------- End transmission -------");
#endif

        deviceState = DEVICE_STATE_CYCLE;

        txDutyCycleTime = appTxDutyCycle + randr(-APP_TX_DUTYCYCLE_RND, APP_TX_DUTYCYCLE_RND);
        LoRaWAN.cycle(txDutyCycleTime);
        deviceState = DEVICE_STATE_SLEEP;
        break;
    }
    case DEVICE_STATE_SLEEP:
    {
        digitalWrite(RUNNING_LED, LOW);
        LoRaWAN.sleep(loraWanClass);
        break;
    }
    default:
    {
        deviceState = DEVICE_STATE_INIT;
        break;
    }
    }
}