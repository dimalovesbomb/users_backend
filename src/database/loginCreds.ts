import { BasicAuthMiddlewareOptions } from 'express-basic-auth';
import fs from 'fs';

export interface IUserCreds {
    login: string;
    password: string;
    token?: string;
};

export function getLoginCreds() {
    const ENCODING = 'utf8';

    try {
        const data = fs.readFileSync(`${__dirname}/passwords.json`, ENCODING);

        return JSON.parse(data);
    } catch (error) {
        return { error };
    }
}

export const getBasicAuthOptions = (usersData: IUserCreds[] | any): BasicAuthMiddlewareOptions => {
    if (usersData.error) {
        const { error } = usersData;
        return error 
    } else {
        const loginPassword = usersData.reduce((accum: any, user: IUserCreds) => { 
            accum[user.login] = user.password; 
            return accum; 
        }, {});

        return {users: loginPassword}
    }
}
