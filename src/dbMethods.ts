// const path = require('path');
import fs from 'fs';
import Response from './responseClass';
import { verifyUser, User, Error } from './userClass';

export function getData() {
    const ENCODING = 'utf8';

    try {    
        const data = fs.readFileSync(`${__dirname}/db.json`, ENCODING);
        return JSON.parse(data);
    } catch (error) {
        return { error }
    }
}

export function getUsers() {
    const data: User[] | any = getData();
    if (data.error) {
        const response = new Response(false, 400, 'an error has occured', getData());
        response.setError(data.error);

        return response;
    } else {
        return new Response(true, 200, 'Database fetched successfully', data);
    }
}

export function addUser(newUser: User) {
    const currentData: User[] = getData();
    const verifiedUser: User | Error[] = verifyUser(newUser, null);
    
    if (verifiedUser instanceof User) {
        verifiedUser.setId(null);
    } else {
        const response = new Response(false, 422, 'user verification failed', getData());
        response.setError(verifiedUser)
        return response;
    }

    const returnedData = JSON.stringify([...currentData, verifiedUser]);

    try {
        fs.writeFileSync(`${__dirname}/db.json`, returnedData);
        
        const response = new Response(true, 201, 'user added successfully', getData());
        response.setNewUser(verifiedUser);

        return response; 
    } catch (error) {
        const response = new Response(false, 400, 'an error has occured', getData());
        response.setError(error);

        return response;
    }
} 

export function removeUser(id: string) {
    const currentData: User[] = getData();
    const isFoundId = currentData.find(item => item.id === id);
    const deletedObjectArr = currentData.filter(item => item.id === id);

    if (isFoundId) {
        const preparedData = currentData.filter(item => item.id !== id);
        const returnedData = JSON.stringify(preparedData);
    
        try {
            fs.writeFileSync(`${__dirname}/db.json`, returnedData);

            const response = new Response(true, 201, 'user removed successfully', getData());
            response.setDeletedUser(deletedObjectArr[0]);

            return response;
        } catch (error) {
            const response = new Response(false, 400, 'an error has occured', getData());
            response.setError(error);

            return response;
        }
    } else {
        return new Response(false, 404, 'this user was not found', getData());
    }
}

export function changeData(id: string, reqBody: User) {
    const currentData: User[] = getData();
    const targetObjectArr: User[] = currentData.filter( user => user.id === id );
    const verifiedUser = verifyUser(reqBody, id);
    
    if (!(verifiedUser instanceof User)) {
        const errorRes = new Response(false, 422, 'User verification failed', getData());
        errorRes.setError(verifiedUser);

        return errorRes;
    }

    if (targetObjectArr.length !== 0) {
        targetObjectArr[0] = Object.assign(targetObjectArr[0], reqBody);
        
    } else {
        return new Response(false, 404, 'This user was not found', getData());
    }
    
    const indOfTargetObjArr = currentData.indexOf(targetObjectArr[0]);
    currentData.splice(indOfTargetObjArr, 1);

    const preparedData = currentData.concat(targetObjectArr);
    const returnedData = JSON.stringify(preparedData);

    try {
        fs.writeFileSync(`${__dirname}/db.json`, returnedData);

        const response = new Response(true, 201, 'user updated successfully', getData());
        response.setUpdatedUser(targetObjectArr[0]);

        return response;
    } catch (error) {
        const response = new Response(false, 400, 'an error has occured', getData());
        response.setError(error);

        return response;
    }
}

export function attachProfilePicUrl(id: any, link: string) {
    const currentData: User[] = getData();
    const targetObject = currentData.find(user => user.id === id) as User; 

    if (!targetObject) {
        return new Response(false, 404, 'User was not found', getData());
    }

    const verifiedUser: User | Error[] = verifyUser(targetObject, id);

    if (verifiedUser instanceof User) {
        verifiedUser.setProfilePicUrl(`http://kupriunin.ru/${link}`); 

        const indOfTargetObjArr = currentData.indexOf(targetObject);
        currentData.splice(indOfTargetObjArr, 1);
    
        const preparedData = currentData.concat(verifiedUser);
        const returnedData = JSON.stringify(preparedData);

        try {
            fs.writeFileSync(`${__dirname}/db.json`, returnedData);

            const response = new Response(true, 201, 'Profile picture uploaded', getData())
            response.setUpdatedUser(targetObject);

            return response;
        } catch (error) {
            const response = new Response(false, 422, 'An error has occured', getData());
            response.setError(error);

            return response;
        }
    } else {
        return new Response(false, 422, 'User verification failed', getData());
    }
}

// attachProfilePicUrl('123456', 'some')