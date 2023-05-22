import express from 'express';
import authenticateToken from "../middleware/authenticated.js";

import register  from "../controllers/register.controller.js";
import verify  from "../controllers/verification.controller.js";
import login  from "../controllers/login.controller.js";
import controller  from "../controllers/controllers.js";
import SubscriptionController  from "../controllers/subscription.controller.js";
import SearchQueryController  from "../controllers/search.query.controller.js";
import contact  from "../controllers/contact.controller.js";
import sitesetup from '../controllers/site.setup.controller.js';
import payments from '../controllers/payment.controller.js'; 
import search_history from '../controllers/search.history.controller.js';

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

//setup sitesettings 
router.post('/setup-plans', authenticateToken, sitesetup.createPlan)
router.post('/set-site-details', authenticateToken, sitesetup.createSiteDetails)

//get user search history
router.post('/user-search-history', authenticateToken, search_history.getUserSearchHistory)
router.post('/search-track', search_history.getUserSearchTrack)


//payment webhook section
router.post('/payment-webhook', payments.paymentWebHook)


export default router;