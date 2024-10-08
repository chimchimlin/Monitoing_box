/**
 * 登入 API
 * 
 * 參數:
 * username (string)       帳號名稱 (最大 100 字)
 * password (string)       密碼 (最大 100 字)
 */
export const path = '/api/service/login';
export const method = 'POST';
export const loginRequired = false;
export const allowPermissions = [];


import cookie from 'cookie';

import { rangeCheck } from '../../../util/rangeCheck.js';
import { LoadType } from '../../../@types/Express.types.js';

import type { Request, Response } from 'express';
import type { Database } from '../../../lib/database/Maria.js';
import type { SessionManager } from '../../../lib/session-manager/SessionManager.js';
import type { ApiConfig } from '../../../@types/Config.types.js';
import type { ResultData } from '../../../@types/Express.types.js';


export async function execute(req: Request, res: Response, config: ApiConfig, db: Database, sessionManager: SessionManager): Promise<ResultData> {

    // 參數檢查
    if (
        (typeof (req.body.username) !== 'string' || !rangeCheck.string_length(req.body.username, 100) || containsSpecialChars(req.body.username)) ||
        (typeof (req.body.password) !== 'string' || !rangeCheck.string_length(req.body.password, 100) || containsSpecialChars(req.body.password))
    ) {
        return {
            loadType: LoadType.PARAMETER_ERROR,
            data: []
        };
    }



    const userIp = (req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.ip) as string;

    // 檢查是否嘗試過多登入
    if (sessionManager.ipBlocker.checkBlocked(userIp)) {
        return {
            loadType: LoadType.BLOCKED_LOGIN,
            data: []
        };
    }


    const cookies = cookie.parse(req.headers.cookie as string || '');
    const cookieSessionId = cookies.sessionId;
    const userDevice = req.headers['user-agent'] as string || 'unknown';

    // 已登入的狀態跳過登入 (存在 sessionId)
    if (await sessionManager.checkSession(cookieSessionId)) {
        sessionManager.refreshSession(cookieSessionId);

        return {
            loadType: LoadType.SESSION_EXISTS,
            data: [
                {
                    sessionId: cookieSessionId
                }
            ]
        };
    }


    const username = req.body.username;
    const password = req.body.password;

    const sessionId = await sessionManager.createSession(username, password, userDevice);   // 添加 ip blacklist // 添加重複登入檢查 // IPBlocker

    // 登入失敗 (帳號密碼錯誤)
    if (!sessionId) {
        sessionManager.ipBlocker.add(userIp);

        return {
            loadType: LoadType.FAILED_LOGIN,
            data: []
        };
    }


    // 登入成功
    sessionManager.ipBlocker.delete(userIp);

    res.cookie('sessionId', sessionId);
    return {
        loadType: LoadType.SUCCEED,
        data: [
            {
                sessionId: sessionId
            }
        ]
    };
}


const containsSpecialChars = (str: string): boolean => {
    const specialChars = [' ', '/', '\\', '|', '<', '>', '=', '\'', '"'];
    return specialChars.some(char => str.includes(char));
};