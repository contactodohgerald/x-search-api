import expressAsyncHandler from "express-async-handler";
import checks from "../config/checks.js";
import _openai from "../config/openai.js";
import services from "../config/services.js";
import bard from "../config/bard.js";

class SearchQueryController {

    authGenerateCoverLetter = expressAsyncHandler(async (req, res) => {
        const { query, ip_address } = req.body;
        const sitedetails = await services._sitedetails()
        const newQuery = query.toLowerCase()

        //run all the neccessary validations
        const validates = checks.validateCoverLetter(newQuery, ip_address);
        if(validates != newQuery) return res.status(400).json({status: 'error', message: validates});
       
        const ifSubscribed = await checks.checkIfSubscribed('auth', ip_address, req.email, sitedetails) 
        if(ifSubscribed != 'success') return res.status(400).json({status: 'error', message: ifSubscribed});

        //first check if the query already exist in the searches table
        const queryExist = await checks.checkIfQueryExist(newQuery);
        let answer //declare answer variable

        if(queryExist){//check if query was returned
            answer = queryExist.answer
        }else{
            if(sitedetails.api_call == 'openai'){
                const response = await _openai.openapiCoverLetterAPICall(newQuery);
                if(response.status != 200) return res.status(503).json({status: 'error', message: "Our third party gatway is down at the moment, try again later"});
                answer = response.data.choices[0].text.trim();   
            }else{
                const response = await bard.bardCoverLetterAPICall(newQuery);
                if(response.output == null) return res.status(503).json({status: 'error', message: "Our third party gatway is down at the moment, try again later"});
                answer = response.output
            }           
        }

        //add the search result to searches model
        await checks.getauthSearch(newQuery, answer, req.email, ip_address);

        //update the searchtrack table
        await checks.updateSearchTrack('auth', req.email, ip_address);
      
        return res.status(201).json({status: 'success', message: "Cover Letter Generated", data: {
            query: newQuery, answer,
        }});
    });

    freeTierGenerateCoverLetter = expressAsyncHandler(async (req, res) => {
        const sitedetails = await services._sitedetails()
        const { query, ip_address } = req.body;
        const newQuery = query.toLowerCase()

        //run all the neccessary validations
        const validates = checks.validateCoverLetter(newQuery, ip_address);
        if(validates != newQuery) return res.status(400).json({status: 'error', message: validates});
       
        const ifSubscribed = await checks.checkIfSubscribed('free', ip_address, null, sitedetails) 
        if(ifSubscribed != 'success') return res.status(400).json({status: 'error', message: ifSubscribed});

        //first check if the query already exist in the searches table
        const queryExist = await checks.checkIfQueryExist(newQuery);
        let answer //declare answer variable
        if(queryExist){//check if query was returned
            answer = queryExist.answer
        }else{
            if(sitedetails.api_call == 'openai'){
                const response = await _openai.openapiCoverLetterAPICall(newQuery);
                if(response.status != 200) return res.status(503).json({status: 'error', message: "Our third party gatway is down at the moment, try again later"});
                answer = response.data.choices[0].text.trim();   
            }else{
                const response = await bard.bardCoverLetterAPICall(newQuery);
                if(response.output == null) return res.status(503).json({status: 'error', message: "Our third party gatway is down at the moment, try again later"});
                answer = response.output
            }           
        }

        //add the search result to searches model
        await checks.getfreeSearch(newQuery, answer, ip_address)

        //update the searchtrack table
        await checks.updateSearchTrack('free', null, ip_address);

        return res.status(201).json({status: 'success', message: "Cover Letter Generated", data: {
            query: newQuery, answer,
        }});
    });
    
} 

const search_data_class = new SearchQueryController();
export default search_data_class; 