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


import { convertUTCtoLocal } from '../../../util/convertUTCtoLocal.js';
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
                id, dev_addr, gps_longitude, gps_latitude, battery, is_fire, last_firetime, created_at, last_refresh
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


    /**
     * 資料庫 TIMESTAMP 獲取的時區為 UTC (+0:00) (2024-06-23T05:05:05.000Z)
     * 需轉換成 UTC+8 (2024-06-23 13:05:05)
     * 不在 DB 端處理時區轉換, server 端處理就好
     */
    result = result.map((item: any) => {
        item.last_refresh = convertUTCtoLocal(item.last_refresh)
        return item;
    });


    return {
        loadType: LoadType.SUCCEED,
        data: result
    };
}












