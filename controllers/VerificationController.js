import expressAsyncHandler from "express-async-handler";
import verifiable from "../config/verify-date.js";
import services from "../config/services.js";
import tables from "../database/tables.js";
import mailer from "../config/mailer.js";

class VerificationController {

    constructor() {
      this.date = new Date();
    }

    verifyCode = expressAsyncHandler(async(req, res) => {
        const {user_id, code, type} = req.body

        // check if fields are filled 
        if(!user_id || !code || !type)
            res.status(400).json({message: "Please fill out All fileds"})

        const responseData = 
            await services.multiple_select(tables.verification, "WHERE user_id = ? AND code = ? AND status = ?", [user_id, code, 'un-use']);  
        if(responseData == null)
            return res.status(400).json({message: "Invalid code supplied, please check the code and try again"})

        const verify_date = await verifiable.verifyDate(responseData);
        if(!verify_date)
            return res.status(400).json({message: "This verification code has expired. Please re-send the verification code to try again"})

        const user = await services._select(tables.users, "uuid", responseData.user_id);   
        if(user == null) 
            return res.status(400).json({message: "This code does not belong to a user, please try a different code."});        
        
        //update user verified_at and also update the verification status to used
        await services._update(tables.users, [{verified_at: this.date}, {uuid: user.uuid}]);
        //update the verification status to used
        await services._update(tables.verification, [{status: 'used'}, {uuid: responseData.uuid}]);

        if(type == 'account-verification'){
            const sitename = await services._sitedetails();
            await mailer.pushMail("/../resource/emails/welcome.html", {
                username: user.username,
                email: user.email,
            }, user.email, "Welcome to "+sitename.name)
        }
        return res.status(201).json({ status: 'success', message: "Your account was successfully activated, login to continue"})
    });

    sendVerifyCode = expressAsyncHandler(async (req, res) => {
        const {user_id, type} = req.body

        // check if fields are filled 
        if(!user_id || !type)
            res.status(400).json({message: "Please fill out All fileds"})

        let user;
        if(type == "reset-password"){
            user = await services._select(tables.users, "email", user_id); 
            if(user == null){
                user = await services._select(tables.users, "username", user_id); 
            }
        } else{
            user = await services._select(tables.users, "uuid", user_id);  
        }  
        if(user == null) 
            res.status(400).json({message: "Invalid user credential supplied, please try a different user credential."}); 
            
        const failedStatus = await services.multiple_select(tables.verification, "WHERE user_id = ? AND verify_type = ? AND status = ?", [user_id, type, 'un-use']); 
        //check if the code for a user exist already and update the status to failed
        if(failedStatus != null)
            await services._update(tables.verification, [{status: 'failed'}, {uuid: failedStatus.uuid}]);

        const verifyCode = services._verifyCode();
        const data = {
            name: user.name, 
            message: "Thank you for choosing F-Search, Your one-time verification code is: ",
            code: verifyCode, 
        };
        const sentMail = await mailer.pushMail("/../resource/emails/confirm-email.html", data, user.email, "Account Verification!")
        if(sentMail.accepted.length > 0){
            const verificationData = {
                uuid: services._uuid(), user_id: user.uuid, code: verifyCode, verify_type: type
            }
            services._insert(tables.verification, verificationData);
        }
        res.status(200).json({status: 'success', message: "A code was successfully created and sent to your mail, please provide the code to continue"});
    });

}

const verify = new VerificationController();
export default verify; 



