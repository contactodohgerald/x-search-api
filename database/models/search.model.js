import mongoose from "mongoose";

const SearchSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        type: String,
        require: true,
    },
    query: {
        type: String,
        trim: true,
        require: true,
    },
    answer: {
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

  
const Searches = mongoose.model("Searches", SearchSchema);
export default Searches;
  