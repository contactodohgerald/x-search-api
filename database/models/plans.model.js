import mongoose from "mongoose";

const PlanSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        require: true
    },
    amount : {
        type: Number,
        trim: true,
        default: 0
    },
    total_request: {
        type: Number,
        default: 0,
    },
    is_deleted: {
        type: String,
        default: 'no',
    }
},{
    timestamps: true
});

  
const Plans = mongoose.model("Plans", PlanSchema);
export default Plans;
  