import expressAsyncHandler from "express-async-handler";
import tables from "../database/tables.js";
import services from "../config/services.js";
import flutterwave from "../config/flutterwave.js";
import mailer from "../config/mailer.js";

class SubscriptionController {

    getPlans = expressAsyncHandler(async (req, res) => {
        const plans = await services._select_all(tables.subscribePlans); 
        if(plans.length < 1)
            return res.status(400).json({message: "Data not found"});


        return res.status(200).json({message: "Data was returned", data: plans});
    })

    subscribeNewUser = expressAsyncHandler(async (req, res) => {
        const {plan_id, type} = req.body;

        if(!plan_id || !type)
            return res.status(400).json({message: "Please fill out All fileds"});

        const user = await services._select(tables.users, "email", req.email); 
        if(user == null)  
            return res.status(400).json({message: "User not found"});

        const plans = await services._select(tables.subscribePlans, "uuid", plan_id); 
        if(plans == null)  
            return res.status(400).json({message: "Plan not found"});
    
        if(type == 'flutterwave'){
            const _uuid = services._uuid();

            await services._insert(tables.subscribe, {
                uuid: _uuid,
                user_id: user.uuid,
                plan_id: plans.uuid,
                status: false,
                plan_status: 'pending',
            });

            const desc =  "Request on subscription for "+plans.name+" Plan";
            const response = await flutterwave.makePayment({
                "id": plans.id,
                "amount": plans.amount,
                "name": user.name,
                "email": user.email,
                "uuid": _uuid,
                "desc": desc
            });
            if(!response)
                return res.status(503).json({message: "An error occured, try again later"});

            if(response.status == 'success'){
                await services._insert(tables.transactions, {
                    uuid: services._uuid(),
                    user_id: user.uuid,
                    trans_ref: _uuid,
                    amount: plans.amount,
                    currency: 'NGN',
                    description: desc,
                    payment_method: type
                });
                return res.status(200).json({message: response.message, data: response.data});
            }
            return res.status(501).json({message: "Payment could not be completed, try again later"});
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

        const trans = await services._select(tables.transactions, "trans_ref", tx_ref);
        if(trans == null)
            return res.status(400).json({message: "Payment was not found"});

        const response = await flutterwave.verifyPayment(transaction_id); 
        if(response != null && response.data.status == "successful" 
            && response.data.amount == trans.amount  && response.data.currency == trans.currency){
            // update the status column on the transaction table
            await services._update(tables.transactions, [{status: 'success'}, {uuid: trans.uuid}]);

            //get the subsscription object, so we can get the plans object from it
            const subscribed = await services._select(tables.subscribe, "uuid", trans.trans_ref);
            //get the plans object
            const plans = await services._select(tables.subscribePlans, "uuid", subscribed.plan_id);
            //get user object
            const user = await services._select(tables.users, "uuid", trans.user_id);
            //update the plan status column on the subscription table
            await services._update(tables.subscribe, [{plan_status: 'ongoing', status: true}, {uuid: subscribed.uuid}]);
            //reset the search-track table of the user
            await services._update(tables.searchTrack, [{request_count: 0}, {user_id: user.uuid}]);
            
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
                uuid: subscribed.uuid,
                user_id: subscribed.user_id,
                plan_id: subscribed.plan_id
            }});            
        }else{
            // Inform the customer their payment was unsuccessful
            await services._update(tables.transactions, [{status: 'failed'}, {uuid: trans.uuid}]);
            return res.status(503).json({message: "Payment was not successful, we will retry resolving this issues to be certain it isn`t from out end, thank you for your patience"});
        }
    })

}

const subscribe = new SubscriptionController();
export default subscribe;