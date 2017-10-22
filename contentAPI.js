var http = require('http');
var utils = require('./utils.js');
var logger = require('./logger.js')('default');

var backendURL = '10.32.5.147';

class File
{
    constructor(source)
    {
        if (typeof(source) === 'string')
            source = JSON.parse(source);

        this.type = 'file';
        this.key = source.wsBaseObjectEntity.id;
        this.name = source.wsBaseObjectEntity.name;
        this.format = source.wsBaseObjectEntity.format;
        this.size = source.wsBaseObjectEntity.size || 0;
        this.contentID = source.wsBaseObjectEntity.contentID;
        this.modified = source.wsBaseObjectEntity.updated.timestamp;

        switch (source.wsBaseObjectEntity.format) {
            default:
            case 'docx':
                this.content = 'application/octet-stream';
                break;
            case 'jpeg':
                this.content = 'image/jpeg';
                break;
        }   
    }
}

var rootItem = { key: '/root', name: 'root', type: 'collection', size: 0, modified: new Date(1980, 8, 13) };
var childItem = { key: 'text.txt', name: 'text.txt', type: 'file', size: 0, modified: new Date(1980, 8, 13) };

var api = {
    headers: {},
    get: function (key, callback)
    {
        logger.debug('fetching file');

        if (key == 'text.txt')
        {
            callback(null, childItem);
        }
        else if (key)
        {
            utils.get('http://{0}:12050/contentManagement/File/{1}'.format(backendURL, key), (error, response, body) => 
            {
                logger.debug('fetching file complete ({{code}})', {code: response.statusCode});

                if (response.statusCode == 200)
                {
                    logger.debug('file found ');
                    callback(null, new File(body));
                }
                else
                {
                    logger.debug('file not found - {{data}}', {data:body});
                    callback(body, null);
                }

            }, api.headers);
        }
        else
        {
            logger.debug('found root item');
            callback(null, rootItem);
        }
    },
    getChildren: function (parentKey)
    {
        // var list = [];
        // var regex = new RegExp(parentKey + '[^\/]*'); file://101.1.157.42@8082/root/FI2

        // Object.keys(items).forEach(function (key)
        // {
        //     if (key.match(regex))
        //         list.push(items[key]);
        // });

        // return list;
        return [childItem];
    },
    download: function (key, callback)
    {
        logger.debug('downloading stream - ' + key);

        return utils.get('http://{0}:12050/contentManagement/File/{1}/content'.format(backendURL, key), (error, response, body) => 
        {
            if (!callback) return;

            if (response.statusCode == 200)
                callback(null, body);
            else
                callback(body, null);

        }, api.headers);
    },
    upload: function(stream, key, callback)
    {
        logger.debug('uploading stream...');

        if (key)
        {
            stream.pipe(utils.put('http://{0}:13050/contentManagement/File/{1}/content'.format(backendURL, key), (error, response, body) => 
            {

                if (error)
                {
                    logger.error('uploading stream failed:  {{error}}', {error: error});
                    callback(error, null);
                }
                else
                {                
                    logger.debug('uploading stream done');
                    callback(null, body);
                }

            }, api.headers));
        }
        else
        {
            stream.pipe(utils.post('http://{0}:13050/contentManagement/content'.format(backendURL), (error, response, body) => 
            {

                if (error)
                {
                    logger.error('uploading stream failed:  {{error}}', {error: error});
                    callback(error, null);
                }
                else
                {                
                    logger.debug('uploading stream done');
                    callback(null, body);
                }

            }, api.headers));
        }
    },
    create: function(file, callback)
    {
        logger.debug('creating file: {{file}}', {file:file});

        utils.post('http://{0}:12050/contentManagement/File'.format(backendURL), (error, response, body) => 
        {
            if (response.statusCode == 200)
                callback(null, body);
            else
                callback(body, null);
            
        }, api.headers, file, true);
    }
}

module.exports = api;