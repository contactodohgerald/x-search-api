import mongoose from "mongoose";

const VerificationSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        type: String,
        require: true,
    },
    code : {
        type: String,
        trim: true,
        require: true
    },
    status: {
        type: String,
        trim: true,
        default: 'un-used'
    },
    verify_type: {
        type: String,
        trim: true,
    },
    is_deleted: {
        type: String,
        default: 'no',
    }
},{
    timestamps: true
});

  
const Verifications = mongoose.model("Verifications", VerificationSchema);
export default Verifications;
  