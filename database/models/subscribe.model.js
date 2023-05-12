import mongoose from "mongoose";

const SubscribeSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        type: String,
        require: true,
    }, 
    plan_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Plans",
        type: String,
        require: true,
    },
    status: {
        type: Boolean,
        default: true,
    },
    plan_status: {
        type: String,
        trim: true,
        require: true,
    },
    is_deleted: {
        type: String,
        default: 'no',
    }
},{
    timestamps: true
});

  
const Subscribes = mongoose.model("Subscribes", SubscribeSchema);
export default Subscribes;
  