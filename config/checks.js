import SearchTracks from "../database/models/_s.track.model.js";
import Plans from "../database/models/plans.model.js";
import Searches from "../database/models/search.model.js";
import Subscribes from "../database/models/subscribe.model.js";
import Users from "../database/models/users.model.js";


class Checks {

    checkQueryLength = (query) => {
        if(query.length < process.env.QUERY_COUNT){
            return false
        }else{
            return query.toLowerCase();
        }
    }

    loggedInUser = async (email) => {
        return await Users.findOne({email: email});
    } 
    
    getSearchTrack = async (user_id, type = "auth") => {
        if(type == 'auth')
            return await SearchTracks.findOne({user_id: user_id});
         
        return await SearchTracks.findOne({ip_address: user_id});   
    }

    checkIfSubscribed = async (email) => {
        const user = await this.loggedInUser(email) 
        const subscribed = await Subscribes.where({user_id: user._id, status: true, plan_status: 'ongoing'}).findOne()
        if(subscribed != null){
            const plans = await Plans.findOne({_id: subscribed.plan_id})
            const trackCount = await this.getSearchTrack(user._id);
            if(trackCount.request_count >= plans.total_request){
                return "exceeded";
            }else{
                return true;
            }
        }else{
            return false;
        }
    }

    checkIfQueryExist = async (query) => {
        return await Searches.findOne({query: query});
    }

    updateSearchTrack = async (email) => {
        const user = await this.loggedInUser(email);
        const searchTrack = await this.getSearchTrack(user._id);
        const newCount = parseInt(searchTrack.request_count) + 1;
        searchTrack.request_count = newCount;
        await searchTrack.save();
    }

    createSearchHistory = async (query, answer, email, type = 'auth') => {
        let user_id;
        if(type == 'auth'){
            const user = await this.loggedInUser(email);
            user_id = user._id;
        }else{
            user_id = email;
        }
        await Searches.create({
            user_id, query, answer
        })
    }

}

const checks = new Checks();
export default checks;