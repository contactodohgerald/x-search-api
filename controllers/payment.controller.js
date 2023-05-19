import expressAsyncHandler from "express-async-handler";
import flutterwave from "../config/flutterwave.js";
import mailer from "../config/mailer.js";
import Plans from "../database/models/plans.model.js";
import Users from "../database/models/users.model.js";
import Subscribes from "../database/models/subscribe.model.js";
import Transactions from "../database/models/transactions.model.js";
import SearchTracks from "../database/models/_s.track.model.js";
import subscribe from "./subscription.controller.js";

class PaymentController {

    paymentWebHook = expressAsyncHandler(async (req, res) => {
        const secretHash = process.env.FLW_SECRET_HASH;
        const signature = req.headers["verif-hash"];
        if (!signature || (signature !== secretHash))
            return res.status(401).json({message: "Incorrect verify hash"});
            
        const {event, data} = req.body; 
 
        const data_request = {
            status: data.status, tx_ref: data.tx_ref, transaction_id: data.id
        }
        if(event == 'charge.completed' && data.status == 'successful'){
            res.status(200);
            subscribe.verifyPament(data_request);
        }else if(event == 'charge.completed' && data.status == 'failed'){
            res.status(200);
            subscribe.verifyPament(data_request);
        }
        return res.status(401).json({message: "An error occured"});
    })

    

}

const payments = new PaymentController();
export default payments;