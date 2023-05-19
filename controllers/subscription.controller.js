import expressAsyncHandler from "express-async-handler";
import flutterwave from "../config/flutterwave.js";
import mailer from "../config/mailer.js";
import Plans from "../database/models/plans.model.js";
import Users from "../database/models/users.model.js";
import Subscribes from "../database/models/subscribe.model.js";
import Transactions from "../database/models/transactions.model.js";
import SearchTracks from "../database/models/_s.track.model.js";

class SubscriptionController {

    getPlans = expressAsyncHandler(async (req, res) => {
        const plans = await Plans.find()
        if(plans.length < 1)
            return res.status(400).json({message: "Data not found"});

        return res.status(200).json({message: "Data was returned", data: plans});
    })

    subscribeNewUser = expressAsyncHandler(async (req, res) => {
        const {plan_id, type} = req.body;

        if(!plan_id || !type)
            return res.status(400).json({message: "Please fill out All fileds"});

        const user = await Users.findOne({email: req.email});
        if(user == null)  
            return res.status(400).json({message: "User not found"});

        const plans = await Plans.findOne({_id: plan_id});
        if(plans == null)  
            return res.status(400).json({message: "Plan not found"});
    
        if(type == 'flutterwave'){
            const subs = await Subscribes.create({
                user_id: user._id,
                plan_id: plans._id,
                status: false,
                plan_status: 'pending',
            })

            const desc =  "Request on subscription for "+plans.name+" Plan";
            const id = Math.floor(Math.random() * 10);
            const response = await flutterwave.makePayment({
                "id": id,
                "amount": plans.amount,
                "name": user.name,
                "email": user.email,
                "uuid": subs._id,
                "desc": desc
            });
            if(!response)
                return res.status(503).json({message: "An error occured, try again later"});

            if(response.status == 'success'){
                await Transactions.create({
                    user_id: user._id,
                    trans_ref: subs._id,
                    amount: plans.amount,
                    currency: 'NGN',
                    description: desc,
                    payment_method: type
                }) 
                return res.status(200).json({message: response.message, data: response.data});
            }
            return res.status(500).json({message: "Payment could not be completed, try again later"});
        }else if(type == 'other'){
            return res.status(200).json({message: "Comming Soon" })
        }else{
            return res.status(200).json({message: "Comming Soon" })
        }
    });

    verifyPament = expressAsyncHandler(async (req, res) => {
        const {status, tx_ref, transaction_id} = req.body;

        if(!status || !tx_ref || !transaction_id)
            return res.status(400).json({message: "Please fill out All fileds"});
            
        const trans = await Transactions.findOne({trans_ref: tx_ref});
        if(trans == null)
            return res.status(400).json({message: "Payment was not found"});

        const response = await flutterwave.verifyPayment(transaction_id); 
        if(response != null && response.data.status == "successful" 
            && response.data.amount == trans.amount  && response.data.currency == trans.currency){
            // update the status column on the transaction table
            trans.status = "success";
            await trans.save();

            //get the subsscription object, so we can get the plans object from it
            const subscribed = await Subscribes.findOne({_id: trans.trans_ref})
            //get the plans object
            const plans = await Plans.findOne({_id: subscribed.plan_id})
            //get user object
            const user = await Users.findOne({_id: trans.user_id});
            //update the plan status column on the subscription table
            subscribed.plan_status = "ongoing";
            subscribed.status = true;
            await subscribed.save();
            //reset the search-track table of the user
            await SearchTracks.findOneAndUpdate({user_id: user._id}, {request_count: 0});
            
            const message = "Subscription to "+plans.name+" plan";
            //send notice mail to user
            if(user.notify_type == 'mail'){
                await mailer.pushMail("/../resource/emails/subscription.html", {
                    title: message,
                    username: user.username,
                    planname : plans.name,
                    amount: plans.amount
                }, user.email, message)
            }

            return res.status(200).json({status: 'success', message: "Your "+message+" was successful", data: {
                uuid: subscribed._id,
                user_id: subscribed.user_id,
                plan_id: subscribed.plan_id
            }});            
        }else{
            // Inform the customer their payment was unsuccessful
            trans.status = "failed";
            await trans.save();
            return res.status(503).json({message: "Payment was not successful, we will retry resolving this issues to be certain it isn`t from out end, thank you for your patience"});
        }
    })

    getUserTrans = expressAsyncHandler(async (req, res) => {
        const user = await Users.findOne({email: req.email});
        const trans = await Transactions.where({user_id: user._id}).find();
        if(trans.length > 0){
            return res.status(200).json({ message: "Date was returned", data: trans});
        }
        return res.status(400).json({message: "No data was found", data: []});
    })

}

const subscribe = new SubscriptionController();
export default subscribe;