import {Document, model, Schema, Types} from "mongoose";

export interface IUserModel extends Document {
    _id: Types.ObjectId;
    email: string;
    password: string;
}


export const UserSchema = new Schema<IUserModel>({
    email: {
        type: String,
        required: [true, "Email is required"],
    },
    password: {
        type: String,
        required: [true, "Password is required"],
    },
});

export const UserModel = model<IUserModel>("UserModel", UserSchema, "users");