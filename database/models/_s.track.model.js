import mongoose from "mongoose";

const SearchTrackSchema = new mongoose.Schema({
    email: {
        type: String,
        trim: true,
    },
    ip_address: {
        type: String,
        trim: true,
        required: true
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
  