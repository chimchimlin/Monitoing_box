/**
 * 刪除寫入的 TXT 資料
 * 
 */

#include <LittleFS.h>

#define TXT_FILE_PATH "/sensor_data.txt"


void clearFileContent()
{
    if (!LittleFS.begin())
    {
        Serial.println("Failed to initialize LittleFS");
        return;
    }

    // 檢查文件是否存在
    if (LittleFS.exists(TXT_FILE_PATH))
    {
        // 以寫入模式重新打開文件，這會清空文件內容
        File file = LittleFS.open(TXT_FILE_PATH, FILE_WRITE);

        if (file)
        {
            Serial.println("File content cleared.");
            file.close();
        }
        else
        {
            Serial.println("Failed to open file for writing.");
        }
    }
    else
    {
        Serial.println("File does not exist.");
    }

    LittleFS.end();
}

void setup() {
    Serial.begin(115200);
    clearFileContent();
}

void loop() 
{
}