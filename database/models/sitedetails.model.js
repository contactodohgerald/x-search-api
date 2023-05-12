import mongoose from "mongoose";

const SiteDetailSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        require: true
    },
    email : {
        type: String,
        trim: true,
        unique: true,
        require: true
    },
    phone: {
        type: String,
        trim: true,
    },
    logo_url: {
        type: String,
        trim: true,
    },
    address: {
        type: String,
        trim: true,
    },
    free_tier: {
        type: Number,
        default: 0,
    },
    env: {
        type: String,
        default: 'local',
    }
},{
    timestamps: true
});

  
const SiteDetail = mongoose.model("SiteDetails", SiteDetailSchema);
export default SiteDetail;
  