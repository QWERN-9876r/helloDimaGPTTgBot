import axios from "axios"
import { createWriteStream } from 'fs'
import ffmpeg from "fluent-ffmpeg"
import installer from "@ffmpeg-installer/ffmpeg"
import remover from "./remover.js"
import GTTS from 'gtts'
import __dirname from './__dirname.js'
import { resolve } from "path"
import { dirname } from "path"


class Voice {
    constructor() {
        ffmpeg.setFfmpegPath(installer.path)
    }

    toMp3( input, output ) {
        try {
            const outputPath = resolve(dirname(input), `${output}.mp3`)
            return new Promise(( res, rej ) => {
                ffmpeg(input)
                .inputOption('-t 30')
                .output(outputPath)
                .on('end', () => {
                    remover(input)
                    return res(outputPath)
                }
                    )
                .on('error', error => rej(error.message))
                .run()
            })
        } catch (error) {
            console.log('Ошибка при преобразовании в mp3', error)
        }
        
    }

    async create( url, filename ) {
        try {
            const oggPath = resolve(__dirname, '../voices', `${filename}.ogg`),
                response = await axios({
                    method: 'get',
                    url,
                    responseType: 'stream'
                })
            return new Promise(res => {
                const stream = createWriteStream(oggPath)
                
                response.data.pipe(stream)
                stream.on('finish', () => res(oggPath))
            })
                
            
        } catch (error) {
            console.error('Error in crete', error.message)
        }
        
    }
    async textToMp3( text, outputFile, language ) {
        const gtts = new GTTS(text, language)
        console.log("path: ", resolve(__dirname, '../voices', outputFile))
        await gtts.save(resolve(__dirname, '../voices', outputFile), function (error) {
            if (error) console.log( 'Ошибка генерации аудио',  error)
        });
        
    }
}

export default new Voice()