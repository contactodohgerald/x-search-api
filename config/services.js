import { v4 as uuidv4 } from 'uuid';
import connection from '../database/connection.js';
import tables from '../database/tables.js';

class Services {

  _sitedetails = async () => {
    const sitedetails = await services._select_all(tables.siteDetails);
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

  _uuid = () => {
      return uuidv4();
  }

  _insert = (table, data) => {
    return new Promise((resolve, reject) => {
      connection.query('INSERT INTO '+table+' SET ?', data, function (error, results) {
        if (error){
          reject(error);
        }else{
          resolve(results)
        }
      });
    });
  }
    
  _select_all = (table) => {
      return new Promise((resolve, reject) => {
        connection.query(`SELECT * FROM ${table}`, function (error, results) {
          if (error) {
            reject(error);
          } else {
            resolve(results);
          }
        });
      });
  }

  _select_array = (table, clause, value) => {
    return new Promise((resolve, reject) => {
      connection.query(`SELECT * FROM ${table} WHERE ${clause} = ?`, value, function (error, results) {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
}

  _select = (table, clause, value) => {
    return new Promise((resolve, reject) => {
      connection.query(`SELECT * FROM ${table} WHERE ${clause} = ?`, value, function (error, results) {
        if (error) {
          reject(error);
        } else {
          resolve(results[0]);
        }
      });
    });
  };

  multiple_select = (table, clause, values) => {
    return new Promise((resolve, reject) => {
      connection.query(`SELECT * FROM ${table} ${clause}`, values, function (error, results) {
        if (error) {
          reject(error);
        } else {
          resolve(results[0]);
        }
      });
    });
  };

  _update = (table, data) => {
    return new Promise((resolve, reject) => {
      connection.query('UPDATE '+table+' SET ? WHERE ?', data, function (error, results) {
        if (error){
          reject(error);
        }else{
          resolve(results)
        }
      });
    });
  }

}

const services = new Services()
export default services