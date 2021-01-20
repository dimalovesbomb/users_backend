import { IUser } from './userClass';
import { UserModel } from './models/User';

interface IResponse {
    success: boolean;
    statusCode: number;
    statusMessage: string;
    users: object;
    newUser?: IUser;
    updatedUser?: IUser;
    deletedUser?: IUser;
    error?: object;
}

export default class Response implements IResponse {
    success: boolean;
    statusCode: number;
    statusMessage: string;
    users: IUser[];
    newUser?: IUser;
    updatedUser?: IUser;
    deletedUser?: IUser;
    error?: object;

    constructor(
        success: boolean,
        statusCode: number,
        statusMessage: string,
        users: IUser[]
    ) {
        this.success = success;
        this.statusCode = statusCode;
        this.statusMessage = statusMessage;
        this.users = users;
    }

    setNewUser(userObject: IUser) {
        this.newUser = userObject;
    }

    setUpdatedUser(userObject: IUser) {
        this.updatedUser = userObject;
    }

    setDeletedUser(userObject: IUser) {
        this.deletedUser = userObject;
    }

    setError(error: object) {
        this.error = error;
    }
}
