import expressAsyncHandler from "express-async-handler";
import checks from "../config/checks.js";
import Searches from "../database/models/search.model.js";

class SearchHistoryController {

    getUserSearchHistory = expressAsyncHandler(async (req, res) => {
        const ip_address = req.body.ip_address;
        const user = checks.loggedInUser(req.email)

        if(!user)  return res.status(400).json({status: 'error', message: "An error occured, try again later"})

        const histories = await Searches.find({ $or: [{ user_id: user._id }, { ip_address }] });

        if(histories.length < 1)  return res.status(400).json({status: 'error', message: "No data was returned"})

        return res.status(200).json({status: 'success', message: "Data successfully returned", data: histories});
    });
    
} 

const search_history = new SearchHistoryController();
export default search_history; 