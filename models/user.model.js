import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email : {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password : {
        type: String,
        required: true
        },
    role : {
        type: String,
        enum: ["superadmin", "admin", "superjc", "jc"],
        default: "user"
    }

}, { timestamps: true });

const User = mongoose.model("Users", userSchema);

export default User;