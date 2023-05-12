import mongoose from "mongoose";

const SearchTrackSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        type: String,
        require: true,
    },
    ip_address: {
        type: String,
        trim: true,
    },
    request_count: {
        type: Number,
        trim: true,
        default: 0
    },
    is_deleted: {
        type: String,
        default: 'no',
    }
},{
    timestamps: true
});

  
const SearchTracks = mongoose.model("SearchTracks", SearchTrackSchema);
export default SearchTracks;
  