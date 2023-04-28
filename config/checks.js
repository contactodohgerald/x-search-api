import tables from "../database/tables.js";
import services from "./services.js";


class Checks {

    checkQueryLength = (query) => {
        if(query.length < process.env.QUERY_COUNT){
            return false
        }else{
            return query.toLowerCase();
        }
    }

    loggedInUser = async (email) => {
        return await services._select(tables.users, "email", email);
    } 
    
    getSearchTrack = async (user_id, type = "auth") => {
        if(type == 'auth')
            return await services._select(tables.searchTrack, "user_id", user_id);
         
        return await services._select(tables.searchTrack, "ip_address", user_id);    
    }

    checkIfSubscribed = async (email) => {
        const user = await this.loggedInUser(email)
        const subscribed = await services.multiple_select(tables.subscribe, "WHERE user_id = ? AND status = ? AND plan_status = ?", [user.uuid, true, 'ongoing']);  
        if(subscribed != null){
            const plans = await services._select(tables.subscribePlans, "uuid", subscribed.plan_id);
            const trackCount = await this.getSearchTrack(user.uuid);

            if(trackCount.request_count >= plans.total_request)
                return "exceeded";

            return true;
        }else{
            return false;
        }
    }

    checkIfQueryExist = async (query) => {
        return await services._select(tables.searches, "query", query);
    }

    updateSearchTrack = async (email) => {
        const user = await this.loggedInUser(email);
        const trackCount = await this.getSearchTrack(user.uuid);
        const newCount = parseInt(trackCount.request_count) + 1;
        await services._update(tables.searchTrack, [{request_count: newCount}, {user_id: user.uuid}]);
    }

    createSearchHistory = async (query, answer, email, type = 'auth') => {
        let user_id;
        if(type == 'auth'){
            const user = await this.loggedInUser(email);
            user_id = user.uuid;
        }else{
            user_id = email;
        }
        await services._insert(tables.searches, {
            uuid: services._uuid(), user_id, query, answer
        }) 
    }

}

const checks = new Checks();
export default checks;