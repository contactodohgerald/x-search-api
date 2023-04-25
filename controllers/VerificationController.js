const expressAsyncHandler = require("express-async-handler");
const services = require("../config/services");
const verifiable = require("../config/verify-date");
const { verification, users } = require("../database/tables");
const mailer = require("../config/mailer");

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
            await services.multiple_select(verification, "WHERE user_id = ? AND code = ? AND status = ?", [user_id, code, 'un-use']);  
        if(responseData == null)
            return res.status(400).json({message: "Invalid code supplied, please check the code and try again"})

        const verify_date = await verifiable.verifyDate(responseData);
        if(!verify_date)
            return res.status(400).json({message: "This verification code has expired. Please re-send the verification code to try again"})

        const user = await services._select(users, "uuid", responseData.user_id);   
        if(user == null) 
            return res.status(400).json({message: "This code does not belong to a user, please try a different code."});        
        
        //update user verified_at and also update the verification status to used
        await services._update(users, [{verified_at: this.date}, {uuid: user.uuid}]);
        //update the verification status to used
        await services._update(verification, [{status: 'used'}, {uuid: responseData.uuid}]);

        if(type == 'account-verification'){
            const data = {
                username: user.username,
                email: user.email,
            };
            await mailer.pushMail("/../resource/emails/welcome.html", data, user.email, "Welcome to F-Search")
        }
        return res.status(201).json({ status: 'success', message: "Your account was successfully activated, login to continue"})
    });

    sendVerifyCode = expressAsyncHandler(async (req, res) => {
        const {user_id, type} = req.body

        // check if fields are filled 
        if(!user_id || !type)
            res.status(400).json({message: "Please fill out All fileds"})

        const user = await services._select(users, "uuid", user_id);  
        if(user == null) 
            res.status(400).json({message: "Invalid user id supplied, please try a different user id."}); 
            
        const failedStatus = await services.multiple_select(verification, "WHERE user_id = ? AND verify_type = ? AND status = ?", [user_id, type, 'un-use']); 
        //check if the code for a user exist already and update the status to failed
        if(failedStatus != null)
            await services._update(verification, [{status: 'failed'}, {uuid: failedStatus.uuid}]);

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
            services._insert(verification, verificationData);
        }
        res.status(200).json({message: "A code was successfully created and sent to your mail, please provide the code to continue"});
    });

}

const verify = new VerificationController();

module.exports = verify 



