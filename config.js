var config = {};

// ================================================== Server ==================================================//
config.server = {};
config.server.port = 8082;

// ================================================== Logger ==================================================//
config.loggers = {};
config.loggers['default'] = {level: 5, filepath: './log.txt'}

module.exports = config;