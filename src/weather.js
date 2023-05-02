import { XMLHttpRequest } from 'xmlhttprequest'
import { Navigator } from 'node-navigator'
import config from 'config'

class Weather {
    async get( ctx, setResponse, language ) {
        try {
            
             const navigator = new Navigator()
             await navigator.geolocation.getCurrentPosition(({ latitude, longitude }, error) => {
                 if ( error ) console.log(error)
                 else (Request(latitude, longitude))
                 
             })
            async function Request ( latitude, longitude ) {
                const xhr = new XMLHttpRequest()
                console.log(latitude, longitude)
                await xhr.open('GET', `https://api.weather.yandex.ru/v2/informers?lat=${latitude}&lon=${longitude}&lang=[${language}_RU]`)
                xhr.setRequestHeader('X-Yandex-API-Key', config.get('WEATHER_TOKEN'))
                xhr.onreadystatechange = async function() {
                    console.log(xhr.readyState)
                    if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        const weatherData = await JSON.parse(xhr.responseText)
                        console.log(weatherData.forecast)
                        await setResponse(`У вас ${weatherData.fact.temp} °C \n ощущается как ${weatherData.fact.feels_like} °C \n ${weatherData.fact.condition}` +
weatherData.forecast.parts.map(weather => `${weather.part_name} от ${weather.temp_min}°C\n до ${weather.temp_max}°C\n${weather.condition}
скорость ветра ${String(weather.wind_speed).replace('.', ',')}м/с`).join('\n'))
                        
                    } 
                    else {
                        console.log('Ошибка:');
                        console.dir(xhr);
                    }
                    }
                }
                xhr.send()
             }
            
            
        } catch(error) {
            console.error( 'Ошибка в получении погоды', error)
            ctx.reply('Ошибка. Попробуйте спросить по подробней. Если не это не поможет обратитесь в поддержку (к разработчику).')
        }
    }
}

export default new Weather()