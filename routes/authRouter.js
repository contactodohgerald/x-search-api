const express = require('express');
const router = express.Router();
const authenticateToken = require("../middleware/authenticated")

const register = require("../controllers/RegisterController")
const verify = require("../controllers/VerificationController")
const login = require("../controllers/LoginController")

const controller = require("../controllers/Controller");

router.post('/register-user', register.createNewUser)
router.post('/verify-user', verify.verifyCode)
router.post('/resend-code', verify.sendVerifyCode)
router.post('/login-user', login.loginUser)

router.get('/get-user', authenticateToken, controller.getLoggedInUser)
router.post('/update-password', authenticateToken, controller.updatePassword)
router.post('/reset-password', authenticateToken, controller.resetPassword)

module.exports = router;