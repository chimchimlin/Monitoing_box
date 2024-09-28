/**
 * 關閉火災通知
 * 
 * 參數:
 * sensor_id (number)       感測器 ID
 */
export const path = '/api/sensor/closeFireNotify';
export const method = 'POST';
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

    try {
        const sensor_id = Number(req.body.sensor_id);

        const checkQuery = `
            SELECT EXISTS (
                SELECT 1 FROM Sensor WHERE id = ${sensor_id}
            ) AS record_exists;
        `;
        const checkResult = await db.query(checkQuery);

        // sensor_id 是否存在
        if (checkResult.length === 0 || Number((checkResult[0] as any).record_exists) === 0) {
            return {
                loadType: LoadType.DATA_NOT_FOUND,
                data: []
            };
        }


        const query = `CALL SetSensorOffFire(${sensor_id})`;
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