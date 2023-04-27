import expressAsyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import services from "../config/services.js";
import tables from "../database/tables.js";
import mailer from "../config/mailer.js";

class RegisterController {

    createNewUser = expressAsyncHandler(async (req, res) => {
        const {fullname, email, username, password, c_password, ip_address} = req.body
    
        // check if fields are filled 
        if(!fullname || !email || !username || !password || !c_password || !ip_address)
            return res.status(400).json({message: "Please fill out All fileds"})
    
        if(password != c_password){
            return res.status(400).json({message: "Both password does not match"});
        }
    
        // check if email already in database 
        const emailExit = await services._select(tables.users, 'email', email); 
        if(emailExit != null){
            if(emailExit.email == email)
               return res.status(400).json({message: "Email already in use, please try another"}) 
        }

        // check if username already in database 
        const usernameExit = await services._select(tables.users, 'username', username);   
        if(usernameExit != null){
            if(usernameExit.username == username)
                return res.status(400).json({message: "Username already in use, please try another"})
        }

        const hashPassword = await bcrypt.hash(password, 10);
        const _uuid = services._uuid();
        
        const createUser = await services._insert(tables.users, {
            uuid: _uuid,
            name: fullname, 
            email, username, 
            password: hashPassword
        });
        if(createUser != null){
            await services._insert(tables.searchTrack, {
                uuid: services._uuid(), 
                user_id: _uuid, 
                ip_address, 
                request_count: 0
            });
            //create and send out a verification notification to user 
            const verifyCode = services._verifyCode();
            //send out notification
            const sentMail = await mailer.pushMail("/../resource/emails/confirm-email.html", {
                name: fullname, 
                message: "Thank you for choosing F-Search, Your one-time verification code is: ",
                code: verifyCode, 
    
            }, email, "Account Verification!")
            //create a verification object on the verification table
            if(sentMail.accepted.length > 0){
                await services._insert(tables.verification, {
                    uuid: services._uuid(), 
                    user_id: _uuid, 
                    code: verifyCode, 
                    verify_type: 'account-verification'
                });
            }
            res.status(201).json({ status: 'success', message: "User was successfully created", data: {
                fullname, email, username
            }})
        }else{
           return res.status(505).json({message: "An error occured, request couldn't be completed"})
        }
    });

}

const register = new RegisterController();
export default register 