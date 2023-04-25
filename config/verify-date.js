const moment = require("moment");
const { verification } = require("../database/tables");
const services = require("./services");

class Verifiable {

    constructor() {
        this.now = moment(new Date()); 
        this.date = new Date();
    }

    verifyDate = async (data) => {
        const duration = moment.duration(this.now.diff(data.created_at));
        const hoursDiff = Math.floor(duration.asHours());
        if(hoursDiff > 1){
            await services._update(verification, [{status: 'failed'}, {uuid: data.uuid}]);
            return false;
        }

        return true;
    }

}

const verifiable = new Verifiable();
module.exports = verifiable;