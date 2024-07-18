/**
 * 獲取所有感測節點清單
 * 
 * 參數:
 * 無參數
 */
export const path = '/api/sensor/sensorList';
export const method = 'GET';
export const loginRequired = false;
export const allowPermissions = [];


import { LoadType } from '../../../@types/Express.types.js';

import type { Request, Response } from 'express';
import type { Database } from '../../../lib/database/Maria.js';
import type { ApiConfig } from '../../../@types/Config.types.js';
import type { ResultData } from '../../../@types/Express.types.js';


export async function execute(req: Request, res: Response, config: ApiConfig, db: Database): Promise<ResultData> {
    let result: object[] = [];

    try {
        const query = `
            SELECT 
                id, dev_addr, last_refresh, gps_longitude, gps_latitude 
            FROM Sensor;
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
        data: result
    };
}












