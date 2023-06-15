import expressAsyncHandler from "express-async-handler";
import checks from "../config/checks.js";
import Searches from "../database/models/search.model.js";
import SearchTracks from "../database/models/_s.track.model.js";

class SearchHistoryController {

    getUserSearchHistory = expressAsyncHandler(async (req, res) => {
        const user = checks.loggedInUser(req.email)

        if(!user)  return res.status(400).json({status: 'error', message: "An error occured, try again later"})

        const histories = await Searches.find({ $or: [{ user_id: user._id }, { ip_address: req.ip }] });

        if(histories.length == 0)  return res.status(400).json({status: 'error', message: "No data was returned", data: []})

        return res.status(200).json({status: 'success', message: "Data successfully returned", data: histories});
    });

    getUserSearchTrack = expressAsyncHandler(async (req, res) => {

        const searchTrack = await SearchTracks.findOne({ ip_address: req.ip });

        if(!searchTrack)  return res.status(400).json({status: 'error', message: "No data was returned"})

        return res.status(200).json({status: 'success', message: "Data successfully returned", data: searchTrack});
    });
    
} 

const search_history = new SearchHistoryController();
export default search_history; 