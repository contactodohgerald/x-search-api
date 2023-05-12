import Plans from "../database/models/plans.model.js";
import SiteDetail from "../database/models/sitedetails.model.js";
import dotenv from 'dotenv';
dotenv.config();

class SiteSetupController {

    createPlan = async (req, res) => {
        const plans = await Plans.find();
        if(plans.length > 0)
            return res.status(200).json({status: 'success', message: "Plans returned successfully", data: plans});

        const planData = [
            {
                name: "Basics",
                amount: 300,
                total_request: 4,
            },
            {
                name: "Advance",
                amount: 500,
                total_request: 7,
            },
            {
                name: "Gold",
                amount: 900,
                total_request: 11,
            }
        ];
        planData.forEach(async (plan) => {
            await Plans.create({
                name: plan.name, amount: plan.amount, total_request: plan.total_request
            });
        });
        res.status(201).json({ status: 'success', message: "Plans was successfully created"})
    }

    createSiteDetails = async (req, res) => {
        const siteDetails = await SiteDetail.findOne();
        if(siteDetails)
            return res.status(200).json({status: 'success', message: "Site Details returned successfully", data: siteDetails});
            
        await SiteDetail.create({
            name: process.env.APP_NAME,
            email: process.env.APP_EMAIL,
            phone: process.env.APP_PHONE,
            logo_url: process.env.APP_LOGO,
            address: process.env.APP_ADDRESS,
            free_tier: process.env.FREE_TIER
        })
        res.status(201).json({ status: 'success', message: "Settings was successfully created"})
    }

}

const sitesetup = new SiteSetupController();
export default sitesetup