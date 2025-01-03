/**
 * 10.5.22-MariaDB
 */

DELIMITER ;

CREATE DATABASE `sensor_DB` /*!40100 DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci */;

USE `sensor_DB`;

SET GLOBAL event_scheduler = ON;


-- sensor_DB.Sensor definition

CREATE TABLE `Sensor` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `dev_addr` VARCHAR(16) NOT NULL,
  `gps_longitude` DECIMAL(11, 8),
  `gps_latitude` DECIMAL(10, 8),
  `battery` INT DEFAULT NULL,
  `is_fire` TINYINT NOT NULL DEFAULT 0,
  `last_firetime` TIMESTAMP DEFAULT NULL NULL,
  `description` VARCHAR(128) NOT NULL DEFAULT '',
  `created_at` TIMESTAMP NOT NULL DEFAULT current_timestamp(),
  `last_refresh` TIMESTAMP NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;


DELIMITER $$

CREATE PROCEDURE SetSensorOnFire(IN sensorId INT UNSIGNED)
BEGIN
  UPDATE Sensor
  SET 
    is_fire = 1,
    last_firetime = current_timestamp()
  WHERE 
    id = sensorId;
END $$

DELIMITER ;
DELIMITER $$

CREATE PROCEDURE SetSensorOffFire(IN sensorId INT UNSIGNED)
BEGIN
  UPDATE Sensor
  SET 
    is_fire = 0,
    last_firetime = NULL
  WHERE 
    id = sensorId;
END $$

DELIMITER ;


-- sensor_DB.SensorData definition

CREATE TABLE `SensorData` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `sensor_id` INT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `temperature` FLOAT DEFAULT NULL,
  `humidity` FLOAT DEFAULT NULL,
  `pressure` FLOAT DEFAULT NULL,
  `gas_resistance` FLOAT DEFAULT NULL,
  `is_fire` TINYINT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `SensorData_FK` (`sensor_id`),
  CONSTRAINT `SensorData_FK` FOREIGN KEY (`sensor_id`) REFERENCES `Sensor` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;


DELIMITER //

CREATE PROCEDURE AddSensorData (
  IN p_mac_addr VARCHAR(16),
  IN p_temperature FLOAT,
  IN p_humidity FLOAT,
  IN p_pressure FLOAT,
  IN p_gas_resistance FLOAT,
  IN p_is_fire TINYINT,
  IN p_battery INT
)
BEGIN
  DECLARE v_sensor_id INT;

  -- 獲取 sensor_id
  SELECT id INTO v_sensor_id FROM Sensor WHERE dev_addr = p_mac_addr;

  -- 插入 SensorData
  INSERT INTO 
    SensorData (sensor_id, temperature, humidity, pressure, gas_resistance, is_fire)
  VALUES 
    (v_sensor_id, p_temperature, p_humidity, p_pressure, p_gas_resistance, p_is_fire);

  -- 刷新 Sensor 的 battery, last_refresh 值
  UPDATE 
    Sensor 
  SET 
    battery = battery, 
    last_refresh = CURRENT_TIMESTAMP()
  WHERE 
    id = v_sensor_id;
  
END //

DELIMITER ;


-- sensor_DB.`User` definition

CREATE TABLE `User` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(100) NOT NULL,
  `password` VARCHAR(128) NOT NULL,
  `user_permissions` INT UNSIGNED DEFAULT 0,
  `name` VARCHAR(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;


-- sensor_DB_db.`Session` definition

CREATE TABLE `Session` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `session_id` VARCHAR(64) NOT NULL,
  `user_id` INT UNSIGNED NOT NULL,
  `device` VARCHAR(300) DEFAULT NULL,
  `last_refresh` TIMESTAMP NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `Session_User_FK` (`user_id`),
  CONSTRAINT `Session_User_FK` FOREIGN KEY (`user_id`) REFERENCES `User` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- Auto delete expored sessions, every 10 minutes check, not used for over 6 hours

CREATE EVENT delete_expired_sessions
ON SCHEDULE EVERY 10 MINUTE
DO
  DELETE FROM Session WHERE TIMESTAMPDIFF(HOUR, last_refresh, NOW()) > 6;


DELIMITER ;



