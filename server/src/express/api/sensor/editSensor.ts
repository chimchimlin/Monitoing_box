/**
 * 編輯感測節點
 * 需添加該感測節點 server 才會收集該節點的資料
 * 
 * 參數:
 * sensor_id (number)       感測器 ID (不可修改)
 * dev_addr (string)        LORA gateway 所送出的 ABP devAddr (00000000007e6ae1) (不可重複)
 * gps_longitude (string)   GPS 經度 (120.4058239)
 * gps_latitude (string)    GPS 緯度 (22.7271472)
 */
export const path = '/api/sensor/editSensor';
export const method = 'POST';
export const loginRequired = false;
export const allowPermissions = [];


import { rangeCheck } from '../../../util/rangeCheck.js';
import { LoadType } from '../../../@types/Express.types.js';

import type { Request, Response } from 'express';
import type { Database } from '../../../lib/database/Maria.js';
import type { ApiConfig } from '../../../@types/Config.types.js';
import type { ResultData } from '../../../@types/Express.types.js';


export async function execute(req: Request, res: Response, config: ApiConfig, db: Database): Promise<ResultData> {

    // 檢查請求參數型別是否正確
    if (
        !Number.isInteger(Number(req.body.sensor_id)) || Number(req.body.sensor_id) === 0 ||
        (typeof (req.body.dev_addr) !== 'string' || !rangeCheck.string_length(req.body.dev_addr, 100)) ||
        (typeof (req.body.gps_longitude) !== 'string' || !rangeCheck.string_length(req.body.gps_longitude, 100)) ||
        (typeof (req.body.gps_latitude) !== 'string' || !rangeCheck.string_length(req.body.gps_latitude, 100))
    ) {
        return {
            loadType: LoadType.PARAMETER_ERROR,
            data: []
        };
    }


    const newSensor = {
        sensor_id: req.body.sensor_id,
        dev_addr: req.body.dev_addr,
        gps_longitude: req.body.gps_longitude,
        gps_latitude: req.body.gps_latitude
    };

    try {
        let isDuplicate = true;

        // 檢查是否有重複 dev_addr
        while (isDuplicate) {
            const checkQuery = `SELECT EXISTS (SELECT 1 FROM Sensor WHERE dev_addr = "${newSensor.dev_addr}") AS record_exists;`;
            const result = await db.query(checkQuery);

            if (result.length === 0 || Number((result[0] as any).record_exists) === 0) {
                isDuplicate = false;
            }
            else {
                return {
                    loadType: LoadType.DATA_EXISTED,
                    data: []
                };
            }
        }


        const query = `
            UPDATE 
                Sensor
            SET 
                dev_addr = "${newSensor.dev_addr}", 
                gps_longitude = "${newSensor.gps_longitude}", 
                gps_latitude = "${newSensor.gps_latitude}"
            WHERE 
                id = ${newSensor.sensor_id};
        `;
        const result = await db.query(query);
        console.log(path, result);
    } catch (error) {
        console.log(path, error);
        return {
            loadType: LoadType.QUERY_FAILED,
            data: []
        };
    }


    return {
        loadType: LoadType.SUCCEED,
        data: []
    };
}