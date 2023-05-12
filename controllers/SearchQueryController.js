import expressAsyncHandler from "express-async-handler";
import checks from "../config/checks.js";
import _openai from "../config/openai.js";
import SearchTracks from "../database/models/_s.track.model.js";

class SearchQueryController {

    authGenerateCoverLetter = expressAsyncHandler(async (req, res) => {
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
            return res.status(200).json({status: 'success', message: "Cover Letter Generated", data: {
                query: newQuery,
                answer: ifQueryExist.answer,
            }});
        }

        const response = await _openai.generateCoverLetter(newQuery);
        if(response.status != 200)
            return res.status(503).json({message: "Our third party gatway is down at the moment, try again later"});

        const answer = response.data.choices[0].text.trim();   
        await checks.updateSearchTrack(req.email);
        //add the search result to searches-history tour
        await checks.createSearchHistory(newQuery, answer, req.email);
        return res.status(200).json({status: 'success', message: "Cover Letter Generated", data: {
            query: newQuery,
            answer,
        }});
    });

    freeTierGenerateCoverLetter = expressAsyncHandler(async (req, res) => {
        const { query, ip_address } = req.body;

        if(!query || !ip_address)
            return res.status(400).json({message: "Please provide a search query"});

        //check for query length and convert the search query to lowercase    
        const newQuery = checks.checkQueryLength(query);
        if(!newQuery)
            return res.status(400).json({message: "Your search query doesn't look constructive enough, please provide more keywords for better and wider search result"});

        //check if free tier is still up
        const trackCount = await checks.getSearchTrack(ip_address, "free");
        if(trackCount == null) {
            await SearchTracks.create({
                ip_address, request_count: 1
            })
        }else{
            if(trackCount.request_count >= process.env.FREE_TIER){
                return res.status(400).json({message: "You have exhusted your free tier, Please endevor to subscribed to any of our plans and try again later"});
            }

            //update the searchtrack table and return query answer
            const newCount = parseInt(trackCount.request_count) + 1;
            trackCount.request_count = newCount; 
            await trackCount.save();
        }

        //first check if the query already exist in the searches table
        const ifQueryExist = await checks.checkIfQueryExist(newQuery);
        if(ifQueryExist != null){
            return res.status(200).json({message: "Cover Letter Generated", data: {
                query: newQuery,
                answer: ifQueryExist.answer,
            }});
        }

        const response = await _openai.generateCoverLetter(newQuery);
        if(response.status != 200)
            return res.status(503).json({message: "Our third party gatway is down at the moment, try again later"});

        const answer = response.data.choices[0].text.trim();
        //add the search result to searches-history tour
        await checks.createSearchHistory(newQuery, answer, ip_address, 'free');
        return res.status(200).json({message: "Cover Letter Generated", data: {
            query: newQuery,
            answer,
        }});
    });
}

const search_data_class = new SearchQueryController();
export default search_data_class; 