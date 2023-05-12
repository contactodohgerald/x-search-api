import { v4 as uuidv4 } from 'uuid';
import connection from '../database/connection.js';
import SiteDetail from '../database/models/sitedetails.model.js';

class Services {

  _sitedetails = async () => {
    const sitedetails = await SiteDetail.find();
    return sitedetails[0];
  }

  _validateEmail = (email) => {
    return String(email).toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  _verifyCode = (len = 7) => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < len) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
  }   
  

}

const services = new Services()
export default services