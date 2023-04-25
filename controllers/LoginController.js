const expressAsyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const services = require("../config/services");
const { users } = require("../database/tables");

class LoginController {
    constructor() {

    }

    loginUser = expressAsyncHandler(async (req, res) => {
        const {credential, password} = req.body;

        if(!credential || !password)
            return res.status(400).json({message: "Please fill out All fileds"});

        const email = services._validateEmail(credential);  
        var user = null;
        if(email){
            user = await services._select(users, "email", credential);
        }else{
            user = await services._select(users, "username", credential);
        }        
        if(user == null)  
            return res.status(400).json({message: "Either email or username does not exist"});

        const checkPassword = await bcrypt.compare(password, user.password);
        if(!checkPassword)
            return res.status(400).json({message: "Incorrect password"});
        
        if(user.verified_at == null)  
            return res.status(400).json({message: "Account not activated, please activate your account to continue"});

        const accessToken = jwt.sign({
            username: user.username, 
            email: user.email, 
            uuid: user.uuid}, 
            process.env.JWT_SECRET, 
            { expiresIn: process.env.JWT_EXPIRES }
        );

        const loggedInUser = {
            uuid: user.uuid,
            name: user.name,
            username: user.username,
            email: user.email,
            ip_address: user.ip_address,
            token: accessToken
        };
        return res.status(200).json({message: "Login was successful", data: loggedInUser })
    });
}

const login = new LoginController();
module.exports = login;