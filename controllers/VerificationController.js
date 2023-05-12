import expressAsyncHandler from "express-async-handler";
import verifiable from "../config/verify-date.js";
import services from "../config/services.js";
import mailer from "../config/mailer.js";
import Verifications from "../database/models/verification.model.js";
import Users from "../database/models/users.model.js";

class VerificationController {

    constructor() {
      this.date = new Date();
    }

    verifyCode = expressAsyncHandler(async(req, res) => {
        const {user_id, code, type} = req.body

        // check if fields are filled 
        if(!user_id || !code || !type)
            res.status(400).json({message: "Please fill out All fileds"})

        const responseData = await Verifications.where({user_id, code, status: "un-used"}).findOne()      
        if(responseData == null)
            return res.status(400).json({message: "Invalid code supplied, please check the code and try again"})

        const verify_date = await verifiable.verifyDate(responseData);
        if(!verify_date)
            return res.status(400).json({message: "This verification code has expired. Please re-send the verification code to try again"})

        const user = await Users.findOne({_id: responseData.user_id});   
        if(user == null) 
            return res.status(400).json({message: "This code does not belong to a user, please try a different code."});        
        
        //update user verified_at and also update the verification status to used
        user.verified_at = this.date;
        await user.save();

        //update the verification status to used
        responseData.status = "used";
        await responseData.save();

        if(type == 'account-verification'){
            const sitename = await services._sitedetails();
            await mailer.pushMail("/../resource/emails/welcome.html", {
                username: user.username,
                email: user.email,
            }, user.email, "Welcome to "+sitename.name)
        }
        return res.status(200).json({ status: 'success', message: "Your account was successfully activated, login to continue"})
    });

    sendVerifyCode = expressAsyncHandler(async (req, res) => {
        const {user_id, type} = req.body

        // check if fields are filled 
        if(!user_id || !type)
            res.status(400).json({message: "Please fill out All fileds"})

        let user;
        if(type == "reset-password"){
            user = await Users.findOne({email: user_id}); 
            if(user == null){
                user = await Users.findOne({username: user_id});
            }
        } else{
            user = await Users.findOne({_id: user_id}); 
        }  
        if(user == null) 
            res.status(400).json({message: "Invalid user credential supplied, please try a different user credential."}); 
        
        const failedStatus = await Verifications.where({user_id: user_id, verify_type: type, status: 'un-used'}).findOne();
        //check if the code for a user exist already and update the status to failed
        if(failedStatus != null){
            failedStatus.status = 'failed';
            await failedStatus.save();
        }

        const verifyCode = services._verifyCode();
        const sentMail = await mailer.pushMail("/../resource/emails/confirm-email.html", {
            name: user.name, 
            message: "Thank you for choosing F-Search, Your one-time verification code is: ",
            code: verifyCode, 
        }, user.email, "Account Verification!")

        if(sentMail.accepted.length > 0){
            await Verifications.create({
               user_id: user._id, code: verifyCode, verify_type: type
            });
        }
        res.status(200).json({status: 'success', message: "A code was successfully created and sent to your mail, please provide the code to continue"});
    });

}

const verify = new VerificationController();
export default verify; 



