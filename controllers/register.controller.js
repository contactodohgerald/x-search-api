import expressAsyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import services from "../config/services.js";
import mailer from "../config/mailer.js";

import SearchTracks from "../database/models/_s.track.model.js";
import Verifications from "../database/models/verification.model.js";
import { UserService } from "../services/users.js";

class RegisterController {
    userInstance

    constructor() {
        this.userInstance = new UserService()
    }

    createNewUser = expressAsyncHandler(async (req, res) => {
        const {fullname, email, username, password, c_password} = req.body
    
        // check if fields are filled 
        if(!fullname || !email || !username || !password || !c_password)
            return res.status(400).json({message: "Please fill out All fileds"})
    
        if(password != c_password){
            return res.status(400).json({message: "Both password does not match"});
        }
    
        // check if email already in database 
        const emailExit = await this.userInstance.getUser({email: email})
        if(emailExit != null){
            if(emailExit.email == email)
               return res.status(400).json({message: "Email already in use, please try another"}) 
        }

        // check if username already in database 
        const usernameExit = await this.userInstance.getUser({username: username})
        if(usernameExit != null){
            if(usernameExit.username == username)
                return res.status(400).json({message: "Username already in use, please try another"})
        }

        const hashPassword = await bcrypt.hash(password, 10);
        const createNewUser = await this.userInstance.saveUser({
            name: fullname, email, username, password: hashPassword
        })

        if(!createNewUser) return res.status(500).json({message: "An error occured, request couldn't be completed"})

        await SearchTracks.create({
            email: createNewUser.email, ip_address: req.ip
        });
        
        //create and send out a verification notification to user 
        const verifyCode = services._verifyCode();
        const sitename = await services._sitedetails()
     
        //send out notification
        const sentMail = await mailer.pushMail("/../resource/emails/confirm-email.html", {
            name: fullname, 
            message: "Thank you for choosing "+sitename.name+", Your one-time verification code is: ",
            code: verifyCode, 

        }, email, "Account Verification!")
        //create a verification object on the verification table
        if(sentMail.accepted.length > 0){
            await Verifications.create({
                user_id: createNewUser._id, code: verifyCode, verify_type: 'account-verification'
            })
        }
        res.status(201).json({ status: 'success', message: "User was successfully created", data: createNewUser})
    });

}

const register = new RegisterController();
export default register 