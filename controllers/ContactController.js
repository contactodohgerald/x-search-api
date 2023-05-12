import expressAsyncHandler from "express-async-handler";
import services from "../config/services.js";
import mailer from "../config/mailer.js";
import NewsLetter from "../database/models/newsletter.model.js";

class ContactController {

  sendContactMail = expressAsyncHandler(async (req, res) => {
    const { email, subject, message } = req.body;

    if (!email || !subject || !message)
      return res.status(400).json({ message: "Please fill out All fileds" });

    const sitename = services._sitedetails()
    if(sitename.env == 'production'){
        await mailer.pushMail("/../resource/emails/general.html", {
            message: "Thank you for contacting "+sitename.name+", we recieved your mail, our agent will reach out to you as soon as possible",
        }, email, "Contact Support!")
    
        await mailer.pushMail("/../resource/emails/general.html", {
            subject, message
        }, sitename.email, subject)
    }
    return res
      .status(200)
      .json({message: "We recieved your mail, our agent will reach out to you as soon as possible" });
  });

  addMailToNewsLetter = expressAsyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email)
      return res.status(400).json({ message: "Please fill out email filed" });

    await NewsLetter.create({
      email
    })

    return res
      .status(200)
      .json({message: "Your email was successfully subscribed to our newsletter" });
  });
 
}

const contact = new ContactController();
export default contact;
