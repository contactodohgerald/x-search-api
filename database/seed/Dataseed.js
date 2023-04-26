import services from "../../config/services.js";
import tables from "../tables.js";

class DataSeed {

    constructor() {
        this.createPlan()
    }

    createPlan = async () => {
        const planData = [
            {
                uuid: services._uuid(),
                name: "Basics",
                amount: 300,
                total_request: 4,
            },
            {
                uuid: services._uuid(),
                name: "Advance",
                amount: 500,
                total_request: 7,
            },
            {
                uuid: services._uuid(),
                name: "Gold",
                amount: 900,
                total_request: 11,
            }
        ];
        planData.forEach(async function (plan) {
            await services._insert(tables.subscribePlans, plan)
        });
        return true;
    }

}

new DataSeed()

console.log('seeded completed...');