import { v4 as uuidv4 } from "uuid";

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
    hasError?: boolean;
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

    setId() {
        this.id = uuidv4();
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

export function verifyUser(userData: User): User | Error[] {
    const { firstName, lastName, birthdate } = userData;

    if (firstName && lastName && birthdate) {
        return new User(firstName, lastName, birthdate);
    } else {
        return checkEmptyKey(userData);
    }
}

function checkEmptyKey(userData: any): Error[] {
    let errors: Error[] = [];
    for (let key in userData) {
        if (userData[key] === "") {
            errors.push({
                status: `No ${key} specified`,
                statusCode: 422,
            });
        }
    }
    return errors;
}
