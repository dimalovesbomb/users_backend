import { UserModel } from '../models/User';

// export interface IUserCreds {
//     login: string;
//     password: string;
//     token?: string;
// };

// export const getBasicAuthOptions = (usersData: IUserCreds[] | any) => {
//     if (usersData.error) {
//         const { error } = usersData;
//         return error 
//     } else {
//         const loginPassword = usersData.reduce((accum: any, user: IUserCreds) => { 
//             accum[user.login] = user.password; 
//             return accum; 
//         }, {});

//         return {users: loginPassword}
//     }
// }

async function isLoginUnique(login: string) {
    return !Boolean( await UserModel.findOne({login}) ); // .findOne() returns object || null
}

export async function loginPasswordVerificationHandler(login?: string, password?: string) {
    if (login && password) {
        if (await isLoginUnique(login)) {
            return true;
        } else {
            return [{statusCode: 422, status: 'Login is not unique'}]
        }
    } else {
        return [{statusCode: 422, status: 'Login/password is not specified'}]
    }
}
