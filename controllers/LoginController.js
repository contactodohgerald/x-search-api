import expressAsyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import services from "../config/services.js";
import tables from "../database/tables.js";

class LoginController {

    loginUser = expressAsyncHandler(async (req, res) => {
        const {credential, password} = req.body;

        if(!credential || !password)
            return res.status(400).json({message: "Please fill out All fileds"});

        const email = services._validateEmail(credential);  
        var user = null;
        if(email){
            user = await services._select(tables.users, "email", credential);
        }else{
            user = await services._select(tables.users, "username", credential);
        }        
        if(user == null)  
            return res.status(400).json({message: "Either email or username does not exist"});

        const checkPassword = await bcrypt.compare(password, user.password);
        if(!checkPassword)
            return res.status(400).json({message: "Incorrect password"});
        
        if(user.verified_at == null)  
            return res.status(400).json({message: "Account not activated yet", data: user.uuid});

        const accessToken = jwt.sign({
            username: user.username, 
            email: user.email, 
            uuid: user.uuid}, 
            process.env.JWT_SECRET, 
            { expiresIn: process.env.JWT_EXPIRES }
        );

        const loggedInUser = {
            uuid: user.uuid,
            username: user.username,
            email: user.email,
            ip_address: user.ip_address,
            token: accessToken
        };
        return res.status(200).json({status: 'success', message: "Login was successful", data: loggedInUser })
    });
    
}

const login = new LoginController();
export default login;