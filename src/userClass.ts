import { v4 as uuidv4 } from "uuid";
import moment from 'moment';
import { loginPasswordVerificationHandler } from "./database/loginCreds";
import { ObjectId } from "mongoose";

export interface IUser {
    _id?: string | ObjectId;
    _v?: number;
    login?: string;
    password?: string;
    firstName: string | null;
    lastName: string | null;
    birthdate: string | null;
    profilePicUrl?: string;
    bio?: string;
    error?: string | object;
}

export type Error = {
    status: string;
    statusCode: number;
};

export class User implements IUser {
    _id?: string | ObjectId;
    _v?: number;
    id?: string;
    login?: string;
    password?: string;
    firstName: string | null;
    lastName: string | null;
    birthdate: string | null;
    profilePicUrl?: string;
    bio?: string;
    error?: Error[];

    constructor(
        firstName: string | null,
        lastName: string | null,
        birthdate: string | null,
    ) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.birthdate = birthdate;
    }

    setId(id: any) {
        if (id) {
            this.id = id;
        } else {
            this.id = uuidv4();
        }
    }

    setProfilePicUrl(url: string) {
        this.profilePicUrl = url;
    }

    setBio(bio: string) {
        this.bio = bio;
    }

    setError(error: Error[]) {
        this.error = error;
    }

    setLogin(login: string) {
        this.login = login;
    }

    setPassword(password: string) {
        this.password = password;
    }
}

export async function verifyUser(userData: User, id: any, authRequired?: boolean) {
    const { firstName, lastName, birthdate, bio, profilePicUrl, login, password } = userData as User;

    if (birthdate) {
        if (!isValidDate(birthdate)) { 
            return [{statusCode: 422, status: 'Birthdate is invalid'}];
        }
    }

    if (firstName && lastName && birthdate) {
        const verifiedUser = new User(firstName, lastName, birthdate);
        verifiedUser.setId(id);
        
        if (authRequired) {
            const loginPasswordCheck = await loginPasswordVerificationHandler(login, password);

            if (Array.isArray(loginPasswordCheck)) { // if loginPasswordVerificationHandler returned an error array
                return loginPasswordCheck;
            }

            verifiedUser.setLogin(login);
            verifiedUser.setPassword(password);
        }

        if (bio) {
            verifiedUser.setBio(bio);
        }
        if (profilePicUrl) {
            verifiedUser.setProfilePicUrl(profilePicUrl);
        }

        return verifiedUser;
    } else {
        return checkEmptyKey(userData);
    }
}

function checkEmptyKey(userData: any): Error[] {
    const { firstName, lastName, birthdate } = userData;
    const testUser: any = new User(firstName, lastName, birthdate);
    let errors: Error[] = [];

    for (let key in testUser) {
        if (!testUser[key]) {
            errors.push({
                status: `No ${key} specified`,
                statusCode: 422,
            });
        }
    }
    return errors;
}

function isValidDate(date: string): boolean {
    return moment(date, 'DD.MM.YYYY').isValid();
}

