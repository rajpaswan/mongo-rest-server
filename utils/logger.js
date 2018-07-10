const moment = require('moment');
const chalk = require('chalk');

function buildMsg(arguments) {
    let args = [];
    for (index in arguments) {
        args.push(arguments[index]);
    }
    return args.join(' ');
}

let logger = new function () {

    this.log = function () {
        console.log(`[${moment().format('MMM DD YYYY, HH:mm:ss')}]`, buildMsg(arguments));
    }

    this.verb = function () {
        console.log(`${' '.repeat(moment().format('MMM DD YYYY, HH:mm:ss').length + 2)}`, buildMsg(arguments));
    }

    this.info = function () {
        this.log(chalk.cyanBright(buildMsg(arguments)));
    }

    this.warn = function () {
        this.log(chalk.yellow(buildMsg(arguments)));
    }

    this.error = function () {
        this.log(chalk.red(buildMsg(arguments)));
    }

    this.success = function () {
        this.log(chalk.green(buildMsg(arguments)));
    }
}


module.exports = logger;