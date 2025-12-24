import mongoose from "mongoose";
import Count from "./count.js";

const studentSchema = new mongoose.Schema({

    email: {
        type: String,
        required: true,
        unique: true
    },
    pid: {
        type: String,
        required: true,
        unique: true
    },
    rollno: {
        type: String,
        required: true,
        unique:true
    },
    name: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    accommodation: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true,

    },
    address:{
        type:String,
        required:true   
    },
    college: {
        type: String,
        required: true
    }
    ,
    branch: {
        type: String,
        required: true
    },
    year:{
        type:Number,
        required:true
    },
    verified:{
        type:Number,
        default:0
    }

});

studentSchema.pre("save", async function(next) {
    try {
        const preCount = await Count.findOne({ name: "studentsCount" });
        if (preCount) {
            const newCount = preCount.count;
            try{
                const updatedCount = await Count.updateOne(
                    { name: "studentsCount" },
                    {$set: { count: newCount } }
                );
                if(updatedCount && updatedCount.modifiedCount === 1){
                    console.log("Students count updated successfully");
                }
                else{
                    console.log("Students count not updated");
                }
            }catch(err){
                console.error("Error updating students count:", err);
            }
        }
        else{
            const count = new Count({ name: "studentsCount", count: 1 });
            await count.save();
            console.log("Students count document created");
        }
        next();
    }
    catch(err){
        console.error("Error in pre-save hook for students:", err);
        next(err);
    }
});

const students = mongoose.model("students", studentSchema);

export default students;