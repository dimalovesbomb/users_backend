import { v4 as uuidv4 } from "uuid";
import moment from 'moment';

export interface IUser {
    id?: string;
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
    id?: string;
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
}

export function verifyUser(userData: User, id: any): User | Error[] {
    const { firstName, lastName, birthdate, bio, profilePicUrl } = userData as User;

    if (birthdate) {
        if (!isValidDate(birthdate)) { 
            return [{statusCode: 422, status: 'Birthdate is invalid'}] // set mask ####.##.## on client
        }
    }

    if (firstName && lastName && birthdate) {
        const verifiedUser = new User(firstName, lastName, birthdate);
        verifiedUser.setId(id);

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
// console.log(isValidDate('32.12.1994'));
