var fs = require('fs');
var utils = require('./utils.js');
var config = require('./config.js');


var loggers = {};

class Logger
{
    constructor(name, level, path)
    {
        this.queue = [];
        this.name = name;
        this.path = path;
        this.level = level;

        if (path)
            this.write();
    }

    fatal(message, parameters)
    {
        this.log(1, 'FATAL', message, parameters);
    }
    error(message, parameters)
    {
        this.log(2, 'ERROR', message, parameters);
    }
    warn(message, parameters)
    {
        this.log(3, 'WARN', message, parameters);
    }
    info(message, parameters)
    {
        this.log(4, 'INFO', message, parameters);
    }
    debug(message, parameters)
    {
        this.log(5, 'DEBUG', message, parameters);
    }
    trace(message, parameters)
    {
        this.log(6, 'TRACE', message, parameters);
    }
    log(level, prefix, message, parameters)
    {
        if (message == null) return;
        if (level > this.level) return;

        var msg = '({0}) {1}:'.format(new Date().format(), prefix);

        switch (typeof (message))
        {
            case 'array':
            case 'object':
                msg += JSON.stringify(message);
            default:
                msg += message.toString();
        }

        msg = msg.formatWith(parameters);

        console.log(msg);
        this.queue.push(msg);
    }
    write(wait = 0)
    {
        setTimeout(() => 
        {
            if (this.queue.length == 0) 
            {
                this.write(100);
            }
            else
            {
                var end = this.queue.length;
                var start = Math.min(end - 1000, 0);
                var content = this.queue.splice(start, end).join('\n');

                fs.appendFile(this.path, content + '\n', (err) =>
                { 
                    if (err) 
                        console.log(err) 
                    
                    this.write();
                });
            }
        }, wait);
    }
    clear()
    {
        //console.clear();
        fs.writeFileSync(this.path, '');
    }
}

module.exports = function (name)
{
    if (loggers[name])        
    {

    }
    else if (config.loggers[name])
    {
        loggers[name] = new Logger(name, config.loggers[name].level, config.loggers[name].filepath);
    }
    else
    {
        loggers[name] = new Logger(name, 3, './{0}.txt'.format(name));
    }

    return loggers[name];
}