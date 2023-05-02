import { Configuration, OpenAIApi } from 'openai'
import config from 'config'
import { createReadStream } from 'fs'

class OpenAI {
    constructor(apiKey) {
        const configuration = new Configuration({
            apiKey
        })
        this.openai = new OpenAIApi(configuration)
    }

    async chat(messages) {
        try {
            const response = await this.openai.createChatCompletion({
                model: 'gpt-3.5-turbo',
                messages
            })
            console.log(response)
            return response.data.choices[0].message.content
        } catch (error) {
            console.log('Ошибка в методе chat ', error.message)
        }
    }

    async transcription( filepath ) {
        try {
            const response = await this.openai.createTranslation(
                createReadStream(filepath),
                'whisper-1'
            )
            return response.data.text
        } catch (error) {
            console.error('Error in transcription', error.message)
        }
    }
}

export default new OpenAI(config.get('OPENAI_KEY'))