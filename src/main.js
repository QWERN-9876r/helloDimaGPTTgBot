import { Telegraf, session, Input } from "telegraf"
import { message } from 'telegraf/filters'
import config from 'config'
import Voice from './toMp3.js'
import openAI from './openAI.js'
import remover from "./remover.js"
import __dirname from "./__dirname.js"
import { resolve } from 'path'
import weather from "./weather.js"

const bot = new Telegraf(config.get('TOKEN')),
 SESSION = {
    messages: new Array()
}

let languageNow = 'ru',
 lastResponse = new Map()
const languages = new Map([
    [ 'ru', ' and comment in Russian' ],
    [ 'en', '' ]
])
const frazes = new Map([
    [ 'Who created you?', new Map([
        [ 'ru', 'Меня создал замечательный разработчик Дмитрий Сотников!' ],
        [ 'en', 'I was created by a wonderful developer Dmitry Sotnikov!' ]
    ]) ],
    [ 'Who are you?', new Map([
        [ 'ru', 'Я Hello Dima telegram бот созданый на основе GPT3 Дмитрием Сотниковым!' ],
        [ 'en', 'I am Hello Dima telegram bot created on the basis of GPT3 by Dmitry Sotnikov!' ]
    ]) ],
    [ 'What are your commands?', new Map([
        [ 'ru', `/en - переключает язык на английский
/ru - переключает язык на русский
/new - чистит контекст,
/help - выводит все команды
/audio - отправляет голосовое сообщение с содержанием приведущего ответа`],
[ 'en', `/en - switches the language to English
/ru - switches the language to Russian
/new - cleans the context
/help - outputs all commands
/audio - sends a voice message with the content of the resulting response` ]
    ]),
    [ 'How are you?', new Date().toISOString().slice(0, 10) ] ],
    
])

bot.use(session())

async function Response(text, ctx, userId) {
    languageNow = ctx.message.from.language_code
    let response

    const sendResponse = async response => {
        if ( response.length < 4096 ) {
            await ctx.reply(response)
        } else {
            for (let kol = 4096; kol < response.length; kol += 4096) {
                if ( kol > response.length ) kol = response.length - 1
    
                await ctx.reply(response.slice(kol - 4096, kol))
            }
        }
        await Voice.textToMp3(response, `${userId}_output.ogg`, languageNow)
        const audio = await Input.fromLocalFile(resolve(__dirname, '../voices', `${userId}_output.ogg`))
        lastResponse.set(userId, audio)
    }

    if ( frazes.has(text) ) {
        response = frazes.get(text).get(languageNow)
    } else {
        if ( text.split(/weather/i)[1] ) {
            await weather.get(ctx, sendResponse, languageNow)
        } else {
            ctx.session.messages.push({ role: 'user', content: text + languages.get(languageNow) })
            response = await openAI.chat(ctx.session.messages)
            ctx.session.messages.push({ 
                role: 'assistant', 
                content: response
            })
        } 
    }

    if ( response ) sendResponse(response)
    
    try {
        await ctx.replyWithAudio(audio)
        await remover(resolve(__dirname, '../voices', `${userId}_output.ogg`))
         
    } catch (error) {
        console.log('Ошибка в отправке аудио', error)
    }
}

bot.on(message('voice'), async ctx => {
    try {
        ctx.session ??= SESSION // ??= значит если ctx.session == undefiend или null
    
        const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id),
        userId = String(ctx.message.from.id),
        oggPath = await Voice.create(link.href, userId),
        mp3Path = await Voice.toMp3(oggPath, userId),
        text = await openAI.transcription(mp3Path)
        remover(resolve(__dirname, '../voices', `${userId}.mp3`))
        if ( text ) {
            await ctx.reply('Вы сказали: ' + text)
            Response(text, ctx, userId)
        }
    } catch (error) {
        console.log('ошибка в обработке голосового сообщения', error)
        await ctx.reply('Неизвестная ошибка!')
    }
     
})
bot.command('start', async ctx => {
    await ctx.reply('Привет!')
    ctx.session = SESSION
})
bot.command('new', async ctx => {
    await ctx.reply('Окей, давай сначала!')
    ctx.session = SESSION
})
bot.command('ru', async ctx => {
    await ctx.reply('Русский язык включен.')
    languageNow = 'ru'
})
bot.command('help', async ctx => {
    await ctx.reply(frazes.get('What are your commands?').get(languageNow))
} )
bot.command('en', async ctx => { 
    await ctx.reply('English is included.')
    languageNow = 'en' 
})
bot.command('audio', async ctx => {
    const userId = String(ctx.message.from.id) 
    await ctx.replyWithAudio(lastResponse.get(userId))
    await remover(resolve(__dirname, '../voices', `${userId}_output.ogg`))
})
bot.on(message('text'), ctx => Response(ctx.message.text, ctx, String(ctx.message.from.id)))

bot.launch()

process.once( 'SIGINT', () => bot.stop('SIGINT') )
process.once( 'SIGTERM', () => bot.stop('SIGTERM') )