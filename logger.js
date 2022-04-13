const logger = (req, res, next) => {
    var method = req.method
    var url = req.url
    var time = new Date().getTime()

    console.log(method, url, time)
    next()
}

module.exports = logger;