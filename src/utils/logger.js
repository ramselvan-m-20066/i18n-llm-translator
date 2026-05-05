import chalk from 'chalk';

class Logger {
    constructor(verbose = false) {
        this.verbose = verbose;
    }
    
    info(message) {
        console.log(message);
    }
    
    success(message) {
        console.log(chalk.green(message));
    }
    
    warn(message) {
        console.warn(chalk.yellow(message));
    }
    
    error(message) {
        console.error(chalk.red(message));
    }
    
    debug(message) {
        if (this.verbose) {
            console.log(chalk.gray(message));
        }
    }
}

export default Logger;