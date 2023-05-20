import Plans from "../database/models/plans.model.js";
import SiteDetail from "../database/models/sitedetails.model.js";
import dotenv from 'dotenv';
dotenv.config();

class SiteSetupController {

    createPlan = async (req, res) => {
        const {name, amount, total_request} = req.body

        const plans = await Plans.where({name: name}).findOne();
        if(plans){
            plans.name = name
            plans.amount = amount
            plans.total_request = total_request
            return res.status(200).json({status: 'success', message: "Plan updated successfully", data: plans});
        }

        const response = await Plans.create({
            name, amount, total_request
        });
        res.status(201).json({ status: 'success', message: "Plans was successfully created", data: response})
    }

    createSiteDetails = async (req, res) => {
        const {email, phone, address, free_tier, api_call} = req.body
        
        if(!email || !phone || !address || !free_tier || !api_call)
            return res.status(400).json({message: "Please provide a all fields"});

        const siteDetails = await SiteDetail.findOne();
        if(siteDetails){
            siteDetails.email = email
            siteDetails.phone = phone
            siteDetails.address = address
            siteDetails.free_tier = free_tier
            siteDetails.api_call = api_call
            await siteDetails.save();
            return res.status(200).json({status: 'success', message: "Site Details updated successfully", data: siteDetails});
        }
            
        const response = await SiteDetail.create({
            email, phone, address, free_tier, api_call, name: process.env.APP_NAME,
            logo_url: process.env.APP_LOGO, env: process.env.APP_ENV,           
        })
        res.status(201).json({ status: 'success', message: "Settings was successfully created", data: response})
    }

}

const sitesetup = new SiteSetupController();
export default sitesetup