/**
 * 刪除感測節點
 * 需添加該感測節點 server 才會收集該節點的資料
 * 
 * 參數:
 * sensor_id (number)       感測器 ID
 */
export const path = '/api/sensor/deleteSensor';
export const method = 'DELETE';
export const loginRequired = false;
export const allowPermissions = [];


import { LoadType } from '../../../@types/Express.types.js';

import type { Request, Response } from 'express';
import type { Database } from '../../../lib/database/Maria.js';
import type { ApiConfig } from '../../../@types/Config.types.js';
import type { ResultData } from '../../../@types/Express.types.js';


export async function execute(req: Request, res: Response, config: ApiConfig, db: Database): Promise<ResultData> {
    let result: object[] = [];

    // 檢查請求參數型別是否正確
    if (!Number.isInteger(Number(req.body.sensor_id)) || Number(req.body.sensor_id) === 0) {
        return {
            loadType: LoadType.PARAMETER_ERROR,
            data: []
        };
    }


    const sensorId = req.body.sensor_id;

    try {
        const query = `
            DELETE FROM Sensor WHERE id = ${sensorId};
        `;
        result = await db.query(query);
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