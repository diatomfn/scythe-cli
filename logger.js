const chalk = require('chalk')

function log(...input) {
    console.log(`${logHeader("Info", chalk.blueBright)} ${input.join(' ')}`)
}

function error(...input) {
    console.log(`${logHeader("Error", chalk.redBright)} ${input.join(' ')}`)
}

function logHeader(header, color) {
    return `[${color(header)}]`
}

module.exports = { log, error }