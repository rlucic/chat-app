const generateMessage = (text) => {
    return {
        text,
        createdAt: new Date().getTime()
    }

}

const generateLocationMessage = (url) => {
    return {
        theURL: url,
        createdAt: new Date().getTime()
    }
}
module.exports = {
    generateMessage,
    generateLocationMessage
}