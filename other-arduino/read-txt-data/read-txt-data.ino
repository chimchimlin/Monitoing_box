/**
 * 讀取寫入的 TXT 資料
 * 
 */

#include <LittleFS.h>

#define TXT_FILE_PATH "/sensor_data.txt"


void readSensorDataFromFile() {

    if (!LittleFS.begin())
    {
        Serial.println("Failed to initialize LittleFS");
        return;
    }

    File file = LittleFS.open(TXT_FILE_PATH, FILE_READ);

    if (!file)
    {
        Serial.println("Failed to open file");
        return;
    }

    Serial.println("Reading file content:");
    Serial.println("temperature,humidity,pressure,gasResistance,batteryPercent");
    Serial.println("----------------------");

    while (file.available())
    {
        Serial.write(file.read());
    }

    file.close();
}


void setup() 
{
    Serial.begin(115200);
    readSensorDataFromFile();  // 讀取文件並顯示到 console
}

void loop() 
{
}