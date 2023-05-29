import expressAsyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import services from "../config/services.js";
import verifiable from "../config/verify-date.js";
import Users from "../database/models/users.model.js";
import Verifications from "../database/models/verification.model.js";
import Subscribes from "../database/models/subscribe.model.js";
import Plans from "../database/models/plans.model.js";
import SearchTracks from "../database/models/_s.track.model.js";

class Controller {
  getLoggedInUser = expressAsyncHandler(async (req, res) => {
    const user = await Users.findOne({email: req.email})
    if (user == null)
      return res.status(400).json({ message: "User not found" });

    return res.status(200).json({ message: "Date was returned", data: user });
  });

  updatePassword = expressAsyncHandler(async (req, res) => {
    const { cur_password, password, c_password } = req.body;
    if (!cur_password || !password || !c_password)
      return res.status(400).json({ message: "Please fill out All fileds" });

    if (password != c_password)
      return res
        .status(400)
        .json({ message: "Password does not match confirm Password" });

    const user = await Users.findOne({email: req.email})
    if (user == null)
      return res
        .status(400)
        .json({ message: "An error occured, try again later" });

    const checkPassword = await bcrypt.compare(cur_password, user.password);
    if (!checkPassword)
      return res
        .status(400)
        .json({ message: "Current password does not match" });

    const hashPassword = await bcrypt.hash(password, 10);
    user.password = hashPassword;
    await user.save();

    return res.status(200).json({ message: "Password successfully updated" });
  });

  resetPassword = expressAsyncHandler(async (req, res) => {
    const { code, password, c_password } = req.body;

    if (!code || !password || !c_password)
      return res.status(400).json({ message: "Please fill out All fileds" });

    if (password != c_password)
      return res
        .status(400)
        .json({ message: "Password does not match confirm Password" });

    const verifications = await Verifications.where({verify_type: "reset-password", code: code}).findOne();
    if (verifications == null)
      return res.status(400).json({message: "Invalid code supplied, please try a different code"});

    const user = await Users.findOne({_id: verifications.user_id});
    if (user == null)
      return res.status(400).json({ message: "An error occured, try again later" });

    const verify_date = await verifiable.verifyDate(verifications);
    if (!verify_date)
      return res.status(400).json({message:"This verification code has expired. Please re-send the verification code to try again"});

    const hashPassword = await bcrypt.hash(password, 10);
    user.password = hashPassword;
    await user.save();

    verifications.status = "used";
    await verifications.save();

    return res.status(200).json({ status: "success", message: "Password was successfully reset" });
  });

  getSiteDetails = expressAsyncHandler(async (req, res) => {
    const siteDetails = await services._sitedetails();
    if (siteDetails == null)
      return res.status(400).json({ message: "Data not found" });

    return res.status(200).json({ message: "Date was returned", data: siteDetails });
  });

  getUserCurrentPlan = expressAsyncHandler(async (req, res) => {
    const user = await Users.findOne({email: req.email});
    if(!user) return res.status(400).json({ message: "User does not exist" });

    const getSubscription = await Subscribes.where({user_id: user._id, plan_status: 'ongoing'}).findOne();
    if(!getSubscription) return res.status(400).json({ message: "You do not have an active plan at this moment" });

    const getActivePlan = await Plans.findOne({_id: getSubscription.plan_id});
    if(!getActivePlan) return res.status(400).json({ message: "You do not have an active plan at this moment" });

    const data = {
        subscription: getSubscription,
        active_plan: getActivePlan
    }
    return res.status(200).json({ message: "Date was returned", data});
    
  });
}

const controller = new Controller();
export default controller;
