import { unlink } from 'fs'

export default async function (path) {
    try {
        console.log(path)
        await unlink(path)
        return true
    } catch (error) {
        console.log('Ошибка удаления файла!', error.message)
        return false
    }
}