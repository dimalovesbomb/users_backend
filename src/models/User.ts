import { createSchema, Type, typedModel } from 'ts-mongoose';

const UserSchema = createSchema({
    id: Type.string(),
    login: Type.string(),
    password: Type.string(),
    firstName: Type.string({required: true}),
    lastName: Type.string({required: true}),
    birthdate: Type.string({required: true}),
    profilePicUrl: Type.string(),
    bio: Type.string()
});

export const UserModel = typedModel('user', UserSchema);