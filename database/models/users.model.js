import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    username: {
        type: String,
        trim: true,
        unique: true,
    },
    notify_type: {
        type: String,
        trim: true,
        default: "mail"
    },
    verified_at: {
        type: Date,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        trim: true,
    },
    free_tier_status: {
        type: Boolean,
        default: true,
    },
    is_deleted: {
        type: String,
        default: 'no',
    }
},{
    timestamps: true
});

  
const Users = mongoose.model("Users", UserSchema);
export default Users;
  