const isDev = process.env.NODE_ENV !== "production"

const logger = {
    log: (...args) => isDev && console.log(...args),
    error: (...args) => console.error(...args)
}

module.exports = logger