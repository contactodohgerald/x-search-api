import { Configuration, OpenAIApi } from "openai";
import dotenv from 'dotenv';
dotenv.config();

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

class OpenAiHandler {

    constructor() {
        this.openai = new OpenAIApi(configuration);
    }

    generateCoverLetter = async (prompt, length = 10) => {
        const response = await this.openai.createCompletion({
            model: "davinci",
            prompt,
            temperature: 0,
            max_tokens: length,
        });
        console.log('first', response);
        return response;
    }

}

const _openai = new OpenAiHandler();
export default _openai;