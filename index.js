const fs = require('fs')
const { ArgumentParser } = require('argparse')
const chokidar = require('chokidar')
const path = require('path')
const axios = require('axios')
const clear = require('clear')
const chalk = require('chalk')

const logger = require('./logger')
const compiler = require('./compiler')
const output = require('./output')

const parser = new ArgumentParser({
  description: 'Scythe CLI'
})

parser.add_argument('-p', '--project', { help: 'The scythe project directory' })
parser.add_argument('-w', '--watch', { help: 'Watch project for edits and evaluate', default: false, action: 'store_true' })

let args = parser.parse_args()

if (!args.project) {
    return parser.print_usage()
}

const configPath = path.join(args.project, 'scythe.json')

const projectConfig = JSON.parse(fs.readFileSync(configPath))
const relativeEntryPath = path.join(args.project, projectConfig.entry)

if (!fs.existsSync(configPath)) {
    logger.error(`No scythe.json found in ${args.project}`)
    return
}

if (!fs.existsSync(relativeEntryPath)) {
    logger.error(`Entry ${relativePath} does not exist`)
    return
}

const entryPath = path.resolve(relativeEntryPath)

if (args.watch) {
    watch()
} else {
    runCode(entryPath)
}

function runCode(source) {
    const buildStart = Date.now()

    compiler.compile(source).then(source => {
        const buildTime = Date.now()-buildStart
        const runStart = Date.now()
        axios({
            url: 'http://localhost:8081/debug',
            method: 'post',
            data: {
                script: source.result
            }
        }).then(res => {
            logger.log(`Build took ${buildTime}ms, run took ${Date.now()-runStart}ms`)

            console.log(chalk.grey('\nOutput begins here\n'))
            output.parse(res.data).forEach(line => console.log(line))
            console.log(chalk.grey('\nOutput ends here'))
        }).catch(err => {
            logger.error(err)
        })
    }).catch(err => {
        logger.error(err)
    })
}

function watch() {
    let wathcer = chokidar.watch(args.project, { persistent: true })
    
    const onChange = () => {
        clear()
        logger.log("Project change detected, rebuilding")
        runCode(entryPath)
    }

    wathcer.on('change', onChange)
    wathcer.on('ready', onChange)
}