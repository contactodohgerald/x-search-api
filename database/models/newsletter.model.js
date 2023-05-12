import mongoose from "mongoose";

const NewsLetterSchema = new mongoose.Schema({
    email: {
        type: String,
        trim: true,
        unique: true,
        require: true
    },
    is_deleted: {
        type: String,
        default: 'no',
    }
},{
    timestamps: true
});

  
const NewsLetter = mongoose.model("NewsLetter", NewsLetterSchema);
export default NewsLetter;
  