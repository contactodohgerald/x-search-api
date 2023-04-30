import services from "../../config/services.js";
import tables from "../tables.js";
import dotenv from 'dotenv';
dotenv.config();

class DataSeed {

    constructor() {
        this.createPlan(),
        this.createSiteDetails()
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

    createSiteDetails = async () => {
        await services._insert(tables.siteDetails, {
            uuid: services._uuid(),
            name: process.env.APP_NAME,
            email: process.env.APP_EMAIL,
            phone: process.env.APP_PHONE,
            logo_url: process.env.APP_LOGO,
            address: process.env.APP_ADDRESS,
            free_tier: process.env.FREE_TIER
        })
        return true;
    }

}

new DataSeed()

console.log('seeded completed...');