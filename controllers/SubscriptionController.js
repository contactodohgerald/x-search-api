import expressAsyncHandler from "express-async-handler";
import tables from "../database/tables.js";
import services from "../config/services.js";
import flutterwave from "../config/flutterwave.js";

class SubscriptionController {

    getPlans = expressAsyncHandler(async (req, res) => {
        const plans = await services._select_all(tables.subscribePlans); 
        if(plans.length < 1)
            return res.status(400).json({message: "Data not found"});


        return res.status(200).json({message: "Data was returned", data: plans});
    })

    subscribeNewUser = expressAsyncHandler(async (req, res) => {
        const {user_id, plan_id, type} = req.body;

        if(!user_id || !plan_id || !type)
            return res.status(400).json({message: "Please fill out All fileds"});

        const user = await services._select(tables.users, "uuid", user_id); 
        if(user == null)  
            return res.status(400).json({message: "User not found"});

        const plans = await services._select(tables.subscribePlans, "uuid", plan_id); 
        if(plans == null)  
            return res.status(400).json({message: "Plan not found"});

        if(type == 'flutterwave'){
            const requestBody = {
                "id": plans.id,
                "amount": plans.amount,
                "name": user.name,
                "email": user.email,
                "uuid": services._uuid(),
                "desc": "Request on subscription for "+plans.name+" Plan",
            }
            const flutterwaveResponse = await flutterwave.sendPayment(requestBody);
            return res.status(400).json({message: "testing", data: flutterwaveResponse});
        }else if(type == 'other'){
            return res.status(200).json({message: "Comming Soon" })
        }else{
            return res.status(200).json({message: "Comming Soon" })
        }
    });

}

const subscribe = new SubscriptionController();
export default subscribe;