import mongoose from "mongoose";

const individualSchema = new mongoose.Schema({

    pid: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        sparse: true
    },
   events:{
    type: [String]
   }

})

const individualEvents = mongoose.model("individualEvents", individualSchema);

export default individualEvents;