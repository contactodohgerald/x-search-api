import expressAsyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import services from "../config/services.js";
import tables from "../database/tables.js";
import verifiable from "../config/verify-date.js";

class Controller {
  getLoggedInUser = expressAsyncHandler(async (req, res) => {
    const user = await services._select(tables.users, "email", req.email);
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

    const user = await services._select(tables.users, "email", req.email);
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
    await services._update(tables.users, [
      { password: hashPassword },
      { uuid: user.uuid },
    ]);

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

    const verifications = await services.multiple_select(
      tables.verification,
      "WHERE verify_type = ? AND code = ?",
      ["reset-password", code]
    );
    if (verifications == null)
      return res
        .status(400)
        .json({
          message: "Invalid code supplied, please try a different code",
        });

    const user = await services._select(
      tables.users,
      "uuid",
      verifications.user_id
    );
    if (user == null)
      return res
        .status(400)
        .json({ message: "An error occured, try again later" });

    const verify_date = await verifiable.verifyDate(verifications);
    if (!verify_date)
      return res
        .status(400)
        .json({
          message:
            "This verification code has expired. Please re-send the verification code to try again",
        });

    const hashPassword = await bcrypt.hash(password, 10);
    await services._update(tables.users, [
      { password: hashPassword },
      { uuid: user.uuid },
    ]);

    await services._update(tables.verification, [
      { status: "used" },
      { uuid: verifications.uuid },
    ]);

    return res
      .status(200)
      .json({ status: "success", message: "Password was successfully reset" });
  });

  getSiteDetails = expressAsyncHandler(async (req, res) => {
    const siteDetails = await services._sitedetails();
    if (siteDetails == null)
      return res.status(400).json({ message: "Data not found" });

    return res
      .status(200)
      .json({ message: "Date was returned", data: siteDetails });
  });

  getUserCurrentPlan = expressAsyncHandler(async (req, res) => {
    const user = await services._select(tables.users, "email", req.email);
    if (user != null) {
      const getSubscription = await services.multiple_select(
        tables.subscribe, "WHERE user_id = ? AND plan_status = ?", [user.uuid, "ongoing"]
      );
      if (getSubscription != null) {
        const getActivePlan = await services._select(tables.subscribePlans, "uuid", getSubscription.plan_id);
        const getSearchTrack = await services._select(tables.searchTrack, "user_id", user.uuid);
        return res
            .status(200)
            .json({ message: "Date was returned", data: {...getSubscription, getActivePlan, getSearchTrack}});
      }
    }
    return res.status(400).json({ message: "You do not have an active plan at this moment" });
  });
}

const controller = new Controller();
export default controller;
