import express from 'express';
import authenticateToken from "../middleware/authenticated.js";

import register  from "../controllers/RegisterController.js";
import verify  from "../controllers/VerificationController.js";
import login  from "../controllers/LoginController.js";
import controller  from "../controllers/Controller.js";
import SubscriptionController  from "../controllers/SubscriptionController.js";
import SearchQueryController  from "../controllers/SearchQueryController.js";
import contact  from "../controllers/ContactController.js";

const router = express.Router();

//authentication section
router.post('/auth/register-user', register.createNewUser)
router.post('/auth/verify-user', verify.verifyCode)
router.post('/auth/resend-code', verify.sendVerifyCode)
router.post('/auth/login-user', login.loginUser)

//user profile section
router.get('/site-details', controller.getSiteDetails)
router.get('/get-user', authenticateToken, controller.getLoggedInUser)
router.post('/auth/update-password', authenticateToken, controller.updatePassword)
router.post('/auth/reset-password', controller.resetPassword)
router.get('/get-current-plan', authenticateToken, controller.getUserCurrentPlan)

//subscription section
router.get('/get-plans', SubscriptionController.getPlans)
router.post('/create-subscription', authenticateToken, SubscriptionController.subscribeNewUser)
router.post('/verify-payment', authenticateToken, SubscriptionController.verifyPament)
router.get('/get-user-trans', authenticateToken, SubscriptionController.getUserTrans)

//search query section
router.post('/search-query-auth', authenticateToken, SearchQueryController.authGenerateCoverLetter)
router.post('/search-query-free', SearchQueryController.freeTierGenerateCoverLetter)

//contact us
router.post('/contact-us', contact.sendContactMail)
router.post('/news-letter', contact.addMailToNewsLetter)


export default router;