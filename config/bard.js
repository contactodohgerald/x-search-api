import fetch from "node-fetch";
import dotenv from 'dotenv';
dotenv.config();

class BardHandler {

    bardCoverLetterAPICall = async (prompt) => {

        const request = await fetch("https://api.bardapi.dev/chat", {
            headers: { Authorization: `Bearer ${process.env.BARD_API_KEY}` },
            method: "POST",
            body: JSON.stringify({ input: prompt }),
        });
        const response = await request.json();
        return response;
    }

}

const bard = new BardHandler()
export default bard