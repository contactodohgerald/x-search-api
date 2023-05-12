import moment from "moment";
import Verifications from "../database/models/verification.model.js";

class Verifiable {

    constructor() {
        this.now = moment(new Date()); 
        this.date = new Date();
    }

    verifyDate = async (data) => {
        const duration = moment.duration(this.now.diff(data.created_at));
        const hoursDiff = Math.floor(duration.asHours());
        if(hoursDiff > 1){
            await Verifications.findOneAndUpdate({_id: data._id}, {status: "failed"})
            return false;
        }
        return true;
    }

}

const verifiable = new Verifiable();
export default verifiable;