// const path = require('path');
import fs from 'fs';
import Response from './responseClass';
import { verifyUser, User, Error } from './userClass';

const PATH_URL = 'localhost:3000';
const STATUS_MESSAGE = {
    fs: 'File system (fs) error has occured',
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
        422: 'User verification failed'
    }
};

export function getData() {
    const ENCODING = 'utf8';

    try {    
        const data = fs.readFileSync(`${__dirname}/database/db.json`, ENCODING);
        return JSON.parse(data);
    } catch (error) {
        return { error }
    }
}

export function getUsers() {
    const data: User[] | any = getData();
    if (data.error) {
        const response = new Response(false, 400, STATUS_MESSAGE.fs, getData());
        response.setError(data.error);

        return response;
    } else {
        return new Response(true, 200, STATUS_MESSAGE.user[200], data);
    }
}

export function addUser(newUser: User) {
    const currentData: User[] = getData();
    const verifiedUser: User | Error[] = verifyUser(newUser, null);
    
    if (verifiedUser instanceof User) {
        verifiedUser.setId(null);
    } else {
        const response = new Response(false, 422, STATUS_MESSAGE.user[422], getData());
        response.setError(verifiedUser)
        return response;
    }

    const returnedData = JSON.stringify([...currentData, verifiedUser]);

    try {
        fs.writeFileSync(`${__dirname}/database/db.json`, returnedData);
        
        const response = new Response(true, 201, STATUS_MESSAGE.user[201].user, getData());
        response.setNewUser(verifiedUser);

        return response; 
    } catch (error) {
        const response = new Response(false, 400, STATUS_MESSAGE.fs, getData());
        response.setError(error);

        return response;
    }
} 

export function removeUser(id: string) {
    const currentData: User[] = getData();
    const foundUser = currentData.find(item => item.id === id);

    if (foundUser) {
        const preparedData = currentData.filter(item => item.id !== id);
        const returnedData = JSON.stringify(preparedData);
    
        try {
            fs.writeFileSync(`${__dirname}/database/db.json`, returnedData);

            const response = new Response(true, 202, STATUS_MESSAGE.user[204], getData());
            response.setDeletedUser(foundUser);

            return response;
        } catch (error) {
            const response = new Response(false, 400, STATUS_MESSAGE.fs, getData());
            response.setError(error);

            return response;
        }
    } else {
        return new Response(false, 404, STATUS_MESSAGE.user[404], getData());
    }
}

export function changeData(id: string, reqBody: User) {
    const currentData: User[] = getData();
    const targetObjectArr: User[] = currentData.filter( user => user.id === id );
    const verifiedUser = verifyUser(reqBody, id);
    
    if (!(verifiedUser instanceof User)) {
        const errorRes = new Response(false, 422, STATUS_MESSAGE.user[422], getData());
        errorRes.setError(verifiedUser);

        return errorRes;
    }

    if (targetObjectArr.length !== 0) {
        targetObjectArr[0] = Object.assign(targetObjectArr[0], reqBody);
        
    } else {
        return new Response(false, 404, STATUS_MESSAGE.user[404], getData());
    }
    
    const indOfTargetObjArr = currentData.indexOf(targetObjectArr[0]);
    currentData.splice(indOfTargetObjArr, 1);

    const preparedData = currentData.concat(targetObjectArr);
    const returnedData = JSON.stringify(preparedData);

    try {
        fs.writeFileSync(`${__dirname}/database/db.json`, returnedData);

        const response = new Response(true, 202, STATUS_MESSAGE.user[202], getData());
        response.setUpdatedUser(targetObjectArr[0]);

        return response;
    } catch (error) {
        const response = new Response(false, 400, STATUS_MESSAGE.fs, getData());
        response.setError(error);

        return response;
    }
}

export function uploadPic(id: any, link: string) {
    const currentData: User[] = getData();
    const targetObject = currentData.find(user => user.id === id) as User; 

    if (!targetObject) {
        try {
            fs.unlinkSync(`${__dirname}/../${link}`);

            return new Response(false, 404, STATUS_MESSAGE.user[404], getData());
        } catch (error) {
            const response = new Response(false, 400, STATUS_MESSAGE.fs, getData());
            response.setError(error);

            return response;
        }
    }

    const verifiedUser: User | Error[] = verifyUser(targetObject, id);

    if (verifiedUser instanceof User) {
        verifiedUser.setProfilePicUrl(`${PATH_URL}/${link}`); 

        const indOfTargetObjArr = currentData.indexOf(targetObject);
        currentData.splice(indOfTargetObjArr, 1);
    
        const preparedData = currentData.concat(verifiedUser);
        const returnedData = JSON.stringify(preparedData);

        try {
            fs.writeFileSync(`${__dirname}/database/db.json`, returnedData);

            const response = new Response(true, 201, STATUS_MESSAGE.user[201].pic, getData())
            response.setUpdatedUser(verifiedUser);

            return response;
        } catch (error) {
            fs.unlinkSync(`${__dirname}/../${link}`);
            const response = new Response(false, 422, 'An error has occured', getData());
            response.setError(error);

            return response;
        }
    } else {
        try {
            fs.unlinkSync(`${__dirname}/../${link}`);

            return new Response(false, 422, STATUS_MESSAGE.user[422], getData());
        } catch (error) {
            const response = new Response(false, 400, STATUS_MESSAGE.fs, getData());
            response.setError(error);

            return response;
        }
    }
}