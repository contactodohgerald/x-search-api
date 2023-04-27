import expressAsyncHandler from "express-async-handler";
import checks from "../config/checks.js";
import _openai from "../config/openai.js";

class SearchQueryController {

    getSearchQuery = expressAsyncHandler(async (req, res) => {
        const { query } = req.body;

        if(!query)
            return res.status(400).json({message: "Please provide a search query"});

        //check for query length and convert the search query to lowercase    
        const newQuery = checks.checkQueryLength(query);
        if(!newQuery)
            return res.status(400).json({message: "Your search query doesn't look constructive enough, please provide more keywords for better and wider search result"});

        //check if the user if subscribed 
        const ifSubscribed = await checks.checkIfSubscribed(req.email);
        if(!ifSubscribed)
            return res.status(400).json({message: "You have exhusted your free tier, Please endevor to subscribed to any of our plans and try again later"});

        if(ifSubscribed == 'exceeded')
            return res.status(400).json({message: "You have exceeded the number of request for your current plan, please re-subscribe or upgrade to a higher plan for higher number of request"});

        //first check if the query already exist in the searches table
        const ifQueryExist = await checks.checkIfQueryExist(newQuery);
        if(ifQueryExist != null){
            //update the searchtrack table and return query answer
            await checks.updateSearchTrack(req.email);
            return res.status(200).json({message: "Cover Letter Generated", data: {
                query: ifQueryExist.query,
                answer: ifQueryExist.answer,
            }});
        }

        const response = await _openai.generateCoverLetter(newQuery);

        return res.status(200).json({message: "testing", data: response});
    });
}

const search_data_class = new SearchQueryController();
export default search_data_class; 