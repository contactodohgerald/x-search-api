import nodemailer from "nodemailer";
import handlebars from 'handlebars';
import fs from 'fs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config();

class sendMail{

  constructor() {
    this.date = new Date()
  }

  readHTMLFile = function(path, callback) {
    fs.readFile(path, {encoding: 'utf-8'}, function (err, html) {
        if (err) {
          callback(err);                 
        }
        else {
            callback(null, html);
        }
    });
  };

  pushMail = (path, data, to, subject) => {
    Object.assign(data, {
      sitename: process.env.APP_NAME, 
      sitemail: process.env.APP_EMAIL, 
      sitelogo: process.env.APP_LOGO, 
      siteaddress:process.env.APP_ADDRESS, 
      currentyear: this.date.getFullYear()
    });
    
    // create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
      host: process.env.STMP_HOST,
      port: process.env.STMP_PORT,
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.STMP_NAME,
        pass: process.env.STMP_PASSWORD
      }
    });

    return new Promise((resolve, reject) => {
      this.readHTMLFile(__dirname + path, function(err, html) {
        if (err) {
          console.log('error reading file', err);
          reject(err)
        }
        const template = handlebars.compile(html);
        const htmlToSend = template(data);
        const mailOptions = {
          from: process.env.FROM_EMAIL,
          to,
          subject,
          html : htmlToSend
        };
        // send mail with defined transport object
        const response = transporter.sendMail(mailOptions);
        resolve(response)
      });
    });
  }

}

const mailer = new sendMail();
export default mailer;
