Это Hello Dima telegram бот созданный для общения и быстрого поиска информации. Бот был написан на JavaScript. Управление самим ботом осуществляется через Telegraf.
Бот понимает как текстовые, так и голосовые сообщения. Он может отвечать на все те вопросы на которые может ответить GPT3 и рассказать о прогнозе погоды там где вы находитесь.


**Запуск бота**
Чтобы скрипт работал для начало надо создать самого бота в telegram с помощью BotFather. После его создания вам будет выдан токен от вашего бота.
В папке config необходимо создать файл default.json и туда вставить:

`{
    "TOKEN": "<Токен от бота>",
}`

Далее нам необходимо зарегистрировать аккаунт в OpenAI и получить токен от api GPT3.
Его также вставляем в default.json в поле OPENAI_KEY.
`"OPENAI_KEY": "<API key от GPT3>",`
Также, чтобы бот мог рассказать прогноз погоды необходимо подключить ключ от api Яндекс Погоды. На их сайте можно получить бесплатный доступ. После получения ключ нужно ввести в поле WEATHER_TOKEN.
По итогу файл default.json должен выглядеть так:

`{
    "TOKEN": "<Токен от бота>",
    "OPENAI_KEY": "<API key от GPT3>",
    "WEATHER_TOKEN": "<API key от Яндекс погоды>"
}`

Осталось только установить необхадимые покеты из npm и запустить.

`npm i`
`npm start`
