import SearchTracks from "../database/models/_s.track.model.js";
import Plans from "../database/models/plans.model.js";
import Searches from "../database/models/search.model.js";
import Subscribes from "../database/models/subscribe.model.js";
import Users from "../database/models/users.model.js";


class Checks {

    validateCoverLetter = (query, ip_address) => {

        if(!query || !ip_address) return 'Please provide a search query and ip address';

        //check for query length
        if(query.length < process.env.QUERY_COUNT) return "Your search query doesn't look constructive enough, please provide more keywords for better and wider search result"

        const isCoverIncluded = query.includes("cover");
        const isLetterIncluded = query.includes("letter");
        if (!isCoverIncluded || !isLetterIncluded) return 'Please provide a search query with cover or letter keywords';

        return query;
    }

    loggedInUser = async (email) => {
        return await Users.findOne({email: email});
    } 
    
    getSearchTrack = async (type, ipAddress, email) => {
        if(type == 'auth')
            return await SearchTracks.findOne({ $or: [{ email }, { ip_address: ipAddress }] });

        return await SearchTracks.findOne({ ip_address: ipAddress});    
    }

    checkIfSubscribed = async (type, ipAddress, email, sitedetails) => {
        //firstly check if the user's free tier is still up
        const freeTierChecker = await this.getSearchTrack(type, ipAddress, email);
        if(freeTierChecker == null) {
            await SearchTracks.create({email: email, ip_address: ipAddress, request_count: 1 })
            return 'success';
        }else{
            freeTierChecker.ip_address = ipAddress; //updating ipAddress, incase it's changed
            freeTierChecker.email = email; //updating ipAddress, incase it's changed
            await freeTierChecker.save(); //saving the records

            const user = await this.loggedInUser(email) 
            if(user && !user.free_tier_status) {
                const subscribed = await Subscribes.where({
                    user_id: user._id, status: true, plan_status: 'ongoing'
                }).findOne()
                if(!subscribed) return "Please subscribed to any of the plans to continue using our services"

                const plans = await Plans.findOne({_id: subscribed.plan_id})
                if(!plans) return "Please subscribed to any of the plans to continue using our services"

                if(freeTierChecker.request_count >= plans.total_request) return "You have exceeded the number of request for your current plan, please subscribe or upgrade to a higher plan for higher number of request"
               
                return 'success';
    
            }else if(user && user.free_tier_status && freeTierChecker.request_count >= sitedetails.free_tier){ 
                user.free_tier_status = false
                await user.save()
                freeTierChecker.request_count = 0
                await freeTierChecker.save()
            }else{
                //checking if ip_address / email has exceeded free tier
                if(freeTierChecker.request_count >= sitedetails.free_tier) return "We regret to inform you that you have reached the limit of your free tier usage for our service. We hope you have found value in using our platform thus far. To continue accessing our service and enjoy its full range of features, we kindly request you to consider upgrading to any of our subscription plans"
                
                return 'success';
            }
           
        }
    }

    checkIfQueryExist = async (query) => {
        return await Searches.findOne({query: query});
    }

    updateSearchTrack = async (type, email, ipAddress) => {
        const searchTrack = await this.getSearchTrack(type, ipAddress, email);
        if(searchTrack) {
            const newCount = parseInt(searchTrack.request_count) + 1;
            searchTrack.request_count = newCount;
            await searchTrack.save();
        }
    }

    getfreeSearchTrack = async (query, answer, ip_address) => {
        const _query = await SearchTracks.findOne({query, ip_address})
        if(!_query){
            await SearchTracks.create({
                query, answer, ip_address
            })
        }
        return true
    }

    getauthSearchTrack = async (query, answer, email, ip_address) => {
        const user = await this.loggedInUser(email);
        const _query = await SearchTracks.findOne({query, ip_address, user_id: user._id})
        if(!_query){
            await SearchTracks.create({
                query, answer, user_id: user._id, ip_address
            })
        }
        return true
    }

}

const checks = new Checks();
export default checks;