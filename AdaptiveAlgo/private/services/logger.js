var logger = module.exports;
logger.log = function log(level, message) {
    if (typeof message !== 'string') {
        message = JSON.stringify(message);
    }
    console.log(level+' : '+message);
};