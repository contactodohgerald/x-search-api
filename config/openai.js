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

    openapiCoverLetterAPICall = async (prompt) => {
        const response = await this.openai.createCompletion({
            model: "text-davinci-003",
            prompt,
            temperature: 0,
            max_tokens: 1024,
        });

        return response;
    }

}

const _openai = new OpenAiHandler();
export default _openai;