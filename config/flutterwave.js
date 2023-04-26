import got from 'got';
import dotenv from 'dotenv';
dotenv.config();

class PaymentHandler {

    constructor () {
        this.header = {
            Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`
        }
    }

    sendPayment = async (data) => {
        const request = {
            headers: this.header,
            json: {
                tx_ref: data.uuid, 
                amount: data.amount,
                currency: "NGN",
                redirect_url: process.env.FLW_REDIRECT,
                meta: {
                    consumer_id: data.id,
                    consumer_mac: data.uuid
                },
                customer: {
                    email: data.email,
                    name: data.name
                },
                customizations: {
                    title: data.desc,
                    logo: process.env.APP_LOGO
                }
            }
        }
        return new Promise((resolve, reject) => {
            got.post("https://api.flutterwave.com/v3/payments", request, function (error, results) {
                if (error){
                    reject(error);
                }else{
                    resolve(results)
                }
            })
        })
    }

}

const flutterwave = new PaymentHandler();
export default flutterwave