import Flutterwave from 'flutterwave-node-v3';
import got from 'got';
import dotenv from 'dotenv';
dotenv.config();

class PaymentHandler {

    constructor () {
        this.header = {
            Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`
        };
        this.flw = new Flutterwave(process.env.FLW_PUBLIC_KEY, process.env.FLW_SECRET_KEY);
    }
    makePayment = async (data) => {
        try {
            return await got.post("https://api.flutterwave.com/v3/payments", {
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
            }).json();
        } catch (err) {
            return false;
        }

    }

    verifyPayment = async (trans_ref) => {
        return await this.flw.Transaction.verify({id: trans_ref})
    }

}

const flutterwave = new PaymentHandler();
export default flutterwave