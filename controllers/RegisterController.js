const expressAsyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const services = require("../config/services");
const {users, verification} = require("../database/tables");
const mailer = require("../config/mailer");

class RegisterController {

    constructor() {

    }

    createNewUser = expressAsyncHandler(async (req, res) => {
        const {fullname, email, username, password, c_password, ip_address} = req.body
    
        // check if fields are filled 
        if(!fullname || !email || !username || !password || !c_password || !ip_address)
            return res.status(400).json({message: "Please fill out All fileds"})
    
        if(password != c_password){
            return res.status(400).json({message: "Both password does not match"});
        }
    
        // check if email already in database 
        const emailExit = await services._select(users, 'email', email); 
        if(emailExit != null){
            if(emailExit.email == email)
               return res.status(400).json({message: "Email already in use, please try another"}) 
        }

        // check if username already in database 
        const usernameExit = await services._select(users, 'username', username);   
        if(usernameExit != null){
            if(usernameExit.username == username)
                return res.status(400).json({message: "Username already in use, please try another"})
        }

        const hashPassword = await bcrypt.hash(password, 10);
        const _uuid = services._uuid();
        const userData = {
            uuid: _uuid, name: fullname, email, username, ip_address, password: hashPassword
        }
        
        const createUser = await services._insert(users, userData);
        if(createUser != null){
            //create and send out a verification notification to user 
            const verifyCode = services._verifyCode();
            //send out notification
            const data = {
                name: fullname, 
                message: "Thank you for choosing F-Search, Your one-time verification code is: ",
                code: verifyCode, 
    
            };
            const sentMail = await mailer.pushMail("/../resource/emails/confirm-email.html", data, email, "Account Verification!")
            if(sentMail.accepted.length > 0){
                const verificationData = {
                    uuid: services._uuid(), user_id: _uuid, code: verifyCode, verify_type: 'account-verification'
                }
                services._insert(verification, verificationData);
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

module.exports = register 