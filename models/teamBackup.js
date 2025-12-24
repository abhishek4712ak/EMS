import mongoose from "mongoose";

const teamBackupSchema = new mongoose.Schema({
    tid: {
        type: String
    },
    name: {
        type: String,
    },
    event: {
        type: String,
    }
    ,
    temp_members: {
        type: [String],
    },
    actual_members: {
        type: [String],
    },
    created_by: {
        type: String,
    }

});

const TeamBackup = mongoose.model("TeamBackup", teamBackupSchema);

export default TeamBackup