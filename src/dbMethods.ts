import fs from 'fs';
import Response from './responseClass';
import { verifyUser, User, Error } from './userClass';
import { UserModel } from './models/User';
import path from 'path';
import bcryptjs from 'bcryptjs';

const PATH_URL = 'localhost:3000';
const STATUS_MESSAGE = {
    fs: 'File system (fs) error has occured',
    db: 'Database error has occured',
    user: {
        200: 'Database fetched successfully',
        201: {
            user: 'User created successfully',
            pic: 'Picture uploaded successfully'
        },
        202: 'User updated successfully',
        204: 'User deleted successfully',
        404: 'This user was not found',
        400: 'Error has occured',
        403: 'User credentials denied',
        422: 'User verification failed'
    }
};

export async function getData(): Promise<User[] | any> {
    try {
        const data = await UserModel.find();

        return data;
    } catch (error) {
        return { error };
    }
}

export async function getUsers() {
    const currentData: User[] | any = await getData();
    if (currentData.error) {
        const errorResponse = new Response(false, 400, STATUS_MESSAGE.db, currentData);
        errorResponse.setError(currentData.error);

        return errorResponse;
    } else {
        return new Response(true, 200, STATUS_MESSAGE.user[200], currentData);
    }
}

export async function addUser(newUser: User) {
    const currentData: User[] =  await getData();
    const verifiedUser: User | Error[] = await verifyUser(newUser, null, true);
    
    if (verifiedUser instanceof User) {
        verifiedUser.setId(null);
    } else {
        const errorResponse = new Response(false, 422, STATUS_MESSAGE.user[422], currentData);
        errorResponse.setError(verifiedUser)
        return errorResponse;
    }

    const { firstName, lastName, birthdate, login, password } = verifiedUser;
    // HASHING THE PASSWORD
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);
    
    // END OF HASHING
    const user = new UserModel({firstName, lastName, birthdate, login, password: hashedPassword});
    
    try {
        const savedUser = await user.save();
        const successResponse = new Response(true, 201, STATUS_MESSAGE.user[201].user, await getData());
        successResponse.setNewUser(savedUser);

        return successResponse;
    } catch (error) {
        const errorResponse = new Response(false, 400, STATUS_MESSAGE.fs, currentData);
        errorResponse.setError(error);

        return errorResponse;
    }
} 

export async function removeUser(id: string) {
    try {
        const deletedUser: any = await UserModel.findByIdAndDelete(id);
        const successResponse = new Response(true, 202, STATUS_MESSAGE.user[204], await getData());
        successResponse.setDeletedUser(deletedUser);

        return successResponse;
    } catch (error) {
        const errorResponse = new Response(false, 400, STATUS_MESSAGE.fs, await getData());
        errorResponse.setError(error);

        return errorResponse;
    }
}

export async function changeData(id: string, reqBody: User, clientId: string) {
    const currentData: User[] | any = await getData();
    const verifiedUser: User[] | any = await verifyUser(reqBody, id);

    if (clientId !== id) {
        const errorResponse = new Response(false, 403, STATUS_MESSAGE.user[403], currentData);
        errorResponse.setError([{statusCode: 403, statusMessage: `Invalid user's id: you don't have a permission to change this user`}]);
        
        return errorResponse;
    }

    if (verifiedUser instanceof User) {
        try {
            const changedUser: any = await UserModel.findByIdAndUpdate({_id: id}, verifiedUser);
            const successResponse = new Response(true, 202, STATUS_MESSAGE.user[202], await getData());
            successResponse.setUpdatedUser(changedUser);

            return successResponse;
        } catch (error) {
            const errorResponse = new Response(false, 400, STATUS_MESSAGE.user[400], currentData)
            errorResponse.setError(error);

            return errorResponse
        }
    } else {
        const errorResponse = new Response(false, 422, STATUS_MESSAGE.user[422], currentData)
        errorResponse.setError(verifiedUser);

        return errorResponse;
    }
}

export async function uploadPic(id: any, link: string) {
    const currentData: User[] = await getData();
    const targetUser: User | any = await UserModel.findById(id);

    if (!targetUser) {
        try {
            const pathToFile = path.resolve(`${__dirname}/../${link}`);
            fs.unlink(pathToFile, error => {
                if (error)
                    throw error;
            });

            return new Response(false, 404, STATUS_MESSAGE.user[404], currentData);
        } catch (error) {
            const errorResponse = new Response(false, 400, STATUS_MESSAGE.fs, currentData);
            errorResponse.setError(error);

            return errorResponse;
        }
    }

    const verifiedUser: User | Error[] = await verifyUser(targetUser, id);

    if (verifiedUser instanceof User) {
        verifiedUser.setProfilePicUrl(`${PATH_URL}/${link}`); 

        try {
            const changedUser: any = await UserModel.findByIdAndUpdate({_id: id}, verifiedUser);
            const successResponse = new Response(true, 202, STATUS_MESSAGE.user[202], await getData());
            successResponse.setUpdatedUser(changedUser);

            return successResponse;
        } catch (error) {
            const pathToFile = path.resolve(`${__dirname}/../${link}`);
            fs.unlink(pathToFile, error => {
                if (error) throw error;
            });

            const errorResponse = new Response(false, 422, STATUS_MESSAGE.db, currentData);
            errorResponse.setError(error);

            return errorResponse;
        }
    } else {
        try {
            const pathToFile = path.resolve(`${__dirname}/../${link}`);
            fs.unlink(pathToFile, error => {
                if (error) throw error;
            });

            const errorResponse = new Response(false, 422, STATUS_MESSAGE.user[422], currentData);
            errorResponse.setError(verifiedUser);

            return errorResponse;
        } catch (error) {
            const errorResponse = new Response(false, 400, STATUS_MESSAGE.fs, currentData);
            errorResponse.setError(error);

            return errorResponse;
        }
    }
}

