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
        trim: true,
    },
    env: {
        type: String,
        trim: true,
    },
    api_call: {
        type: String,
        trim: true,
    },
    facebook: {
        type: String,
        trim: true,
    },  
    twitter: {
        type: String,
        trim: true,
    },  
    instagram: {
        type: String,
        trim: true,
    },
},{
    timestamps: true
});

  
const SiteDetail = mongoose.model("SiteDetails", SiteDetailSchema);
export default SiteDetail;
  