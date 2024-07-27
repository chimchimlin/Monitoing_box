/**
 * Heltec battery library
 */

#ifndef __HELTEC_VBAT_H__
#define __HELTEC_VBAT_H__

#define VBAT_CTRL GPIO_NUM_37
#define VBAT_ADC  GPIO_NUM_1


const float min_voltage = 3.04;
const float max_voltage = 4.26;
const uint8_t scaled_voltage[100] = {
    254, 242, 230, 227, 223, 219, 215, 213, 210, 207,
    206, 202, 202, 200, 200, 199, 198, 198, 196, 196,
    195, 195, 194, 192, 191, 188, 187, 185, 185, 185,
    183, 182, 180, 179, 178, 175, 175, 174, 172, 171,
    170, 169, 168, 166, 166, 165, 165, 164, 161, 161,
    159, 158, 158, 157, 156, 155, 151, 148, 147, 145,
    143, 142, 140, 140, 136, 132, 130, 130, 129, 126,
    125, 124, 121, 120, 118, 116, 115, 114, 112, 112,
    110, 110, 108, 106, 106, 104, 102, 101, 99, 97,
    94, 90, 81, 80, 76, 73, 66, 52, 32, 7,
};


/**
 * @brief Measures the battery voltage.
 *
 * This function measures the battery voltage by controlling the VBAT_CTRL pin
 * and reading the analog value from the VBAT_ADC pin. The measured voltage is
 * then converted to a float value and returned.
 *
 * @return The battery voltage in volts.
 */
float heltec_vbat()
{
    pinMode(VBAT_CTRL, OUTPUT);
    digitalWrite(VBAT_CTRL, LOW);
    delay(5);
    float vbat = analogRead(VBAT_ADC) / 238.7;
    // pulled up, no need to drive it
    pinMode(VBAT_CTRL, INPUT);
    return vbat;
}

/**
 * @brief Calculates the battery percentage based on the measured battery
 * voltage.
 *
 * This function calculates the battery percentage based on the measured battery
 * voltage. If the battery voltage is not provided as a parameter, it will be
 * measured using the heltec_vbat() function. The battery percentage is then
 * returned as an integer value.
 *
 * @param vbat The battery voltage in volts (default = -1).
 * @return The battery percentage (0-100).
 */
int heltec_battery_percent(float vbat = -1)
{
    if (vbat == -1)
    {
        vbat = heltec_vbat();
    }

    for (int n = 0; n < sizeof(scaled_voltage); n++)
    {
        float step = (max_voltage - min_voltage) / 256;
        if (vbat > min_voltage + (step * scaled_voltage[n]))
        {
            return 100 - n;
        }
    }
    return 0;
}


#endif /* __HELTEC_VBAT_H__ */