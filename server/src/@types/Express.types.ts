import type { Request, Response } from 'express';

import type { Database } from '../lib/database/Maria.js';
import type { SessionManager } from '../lib/session-manager/SessionManager.js';

import type { ApiConfig } from './Config.types.js';


/**
 * App events
 */
export type EventListeners<T> = {
    (event: 'debug', listener: (message: string) => void): T;
    (event: 'request', listener: (request: Request) => void): T;
    (event: 'requestFail', listener: (ip: string, failType: 'UNAUTHORIZED' | 'FORBIDDEN', path: string) => void): T;
    (event: 'response', listener: (response: Response) => void): T;
    (event: 'error', listener: (message: string) => void): T;
    (event: 'warn', listener: (message: string) => void): T;
}




/**
 * API route structure
 */
export interface Route {
    path: string;
    method: string;
    loginRequired: boolean;
    allowPermissions: UserPermissions[];
    execute: (req: Request, res: Response, config: ApiConfig, db: Database, sessionManager: SessionManager) => Promise<void>;
}


/**
 * 使用者權限列表
 */
export enum UserPermissions {
    None = 0,
    Admin = 1,
    Employee = 2,
    Farmer = 3,
}




/**
 * EmptyData    :   空值佔位符 (表示該參數為 null)
 */
export enum RequestParameterFormat {
    EmptyData = 'EMPTY_DATA'
}




/**
 * 回傳的資料結構
 */
export interface ResultData {
    loadType: LoadType;
    missingFK?: MissingFK;    // 當參數中帶入的外鍵值不存在時會出現此值 (loadType = FK_NOT_FOUND)
    data: Object[];
}


/**
 * LoadType codes
 */
export enum LoadType {
    SUCCEED             = 1000,     // 成功回傳
    UNAUTHORIZED        = 1001,     // 未登入或請求 header 沒帶 sessionID
    FORBIDDEN           = 1002,     // 此 sessionID 沒權限請求
    PARAMETER_ERROR     = 1003,     // 請求參數錯誤
    PATH_ERROR          = 1004,     // 請求路徑錯誤
    DISABLE             = 1005,     // 該 API 已被禁用

    SERVER_ERROR        = 1050,     // 伺服器錯誤 (內部錯誤)
    QUERY_FAILED        = 1051,     // 資料庫查詢錯誤 (內部錯誤)


    DATA_EXISTED        = 1100,     // 資料庫已存在該資料
    DATA_NOT_FOUND      = 1101,     // 資料庫未找到該資料
    FK_NOT_FOUND        = 1103,     // 引用的外鍵未找到 (會多出 missingFK 值)
    ROW_IS_REFERENCED   = 1104,     // 此項資料已被引用


    // TYPE_ACCOUNT = 2xxx
    ACCOUNT_EXISTS      = 2001,     // 帳號已存在
    ACCOUNT_NOT_EXISTS  = 2002,     // 帳號不存在
    OLD_PASSWORD_ERROR  = 2003,     // 舊密碼錯誤  (更改密碼 api 會出現)


    // TYPE_SESSION = 3xxx
    BLOCKED_LOGIN       = 3000,     // 嘗試登入太多次 鎖定一段時間
    FAILED_LOGIN        = 3001,     // 登入失敗 (帳號或密碼錯誤)
    SESSION_EXISTS      = 3003,     // 請求時已帶入有效的 sessionId 跳過登入
    SESSION_INVALID     = 3004,     // 請求時帶入的 sessionId 無效 (可能閒置太久過期了), 可重定向至登入介面


    // TYPE_MAIL = 4xxx
    SEND_FAIL           = 4000      // 發送信件失敗
}


/**
 * 不存在的外鍵(FK)類型  
 * CONTRACT_UUID    :   契作合約 uuid  
 * LAND_UUID        :   農地 uuid  
 * CROP_UUID        :   作物品種 uuid  
 * WEED_PEST_UUID   :   除草的農藥種類 uuid  
 * SPRAY_PEST_UUID  :   噴藥的農藥種類 uuid  
 * PRE_FERT_UUID    :   穗前肥的肥料種類 uuid  
 * POST_FERT_UUID   :   穗後肥的肥料種類 uuid  
 */
export enum MissingFK {
    CONTRACT_UUID = 100,
    FARMER_UUID = 101,
    LAND_UUID = 102,
    CROP_UUID = 103,

    WEED_PEST_UUID = 110,
    SPRAY_PEST_UUID = 111,
    PRE_FERT_UUID = 112,
    POST_FERT_UUID = 113
}