import mongoose from "mongoose";

const countSchema = new mongoose.Schema({
    count: {
        type: Number,
        required: true,
        default: 0
    },
    name: {
        type: String,
        required: true
    }
}, { timestamps: true });

const Count = mongoose.model("Count", countSchema);

export default Count;