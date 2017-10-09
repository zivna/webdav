var fs = require('fs');
var utils = require('./utils.js');
var logger = require('./logger.js')('default');

class WebdavResponse
{
    constructor(name, code)
    {
        this.code = code || 200;
        this.headers = require('./webdav/{0}/headers.json'.format(name));
        this.body = fs.readFileSync('./webdav/{0}/body.xml'.format(name), 'utf8');
    }

    handle(request, response, data)
    {
        this.setHeaders(request, response, { date: new Date() });
        var body = this.renderBody(request, response, data);

        response.writeHead(this.code);
        response.end(body);

        logger.debug('==================== response ====================')
        logger.debug('headers: {{_headers}}', response);
        logger.debug('body: {{body}}', {body:body});

        return null
    }
    setBody(request, response, data)
    {
        var body = this.renderBody(request, response, data);

        response.write(body);
    }
    renderBody(request, response, data)
    {
        return this.body.formatWith(data);
    }
    setHeaders(request, response, data)
    {
        var headers = this.renderHeaders(request, response, data);

        Object.keys(headers).forEach(function (key)
        {
            response.setHeader(key, headers[key]);
        });
    }
    renderHeaders(request, response, data)
    {
        var output = {};
        var headers = this.headers;

        Object.keys(headers).forEach(function (key)
        {
            switch (typeof (headers[key]))
            {
                case 'boolean':
                    output[key] = headers[key];
                    break;
                case 'string':
                    output[key] = headers[key].formatWith(data);
                    break;
                case 'object':
                    if (headers[key] instanceof Array)
                    {
                        output[key] = [];
                        headers[key].forEach(function (x)
                        {
                            output[key].push(x.formatWith(data));
                        });
                    }
                    break;
            }

        });

        return output;
    }
}
class WebdavResponsePut extends WebdavResponse
{
    constructor(name, api)
    {
        super(name);

        this.api = api;
    }

    handle(request, response, data)
    {
        this.api.get(data.itemID, (err, data) => 
        {
            if (!data)
            { 
                return { method: 'errorNotFound', data: { path: request.url } };
            }
            else
            {
                this.api.upload(request, data.itemID, (err, data) => 
                {
                    response.writeHead(200, {});
                    response.end();
                });

                return null;
            }
        });
    }
}
class WebdavResponseGet extends WebdavResponse
{
    constructor(name, api)
    {
        super(name);

        this.api = api;
    }

    handle(request, response, data)
    {
        this.api.get(data.itemID, (err, data) => 
        {
            if (data)
            { 
                this.headers['filename'] = data.name;
                this.headers['Content-Disposition'] = 'attachment; filename="{0}"'.format(data.name);
                
                this.api.download(data.contentID).pipe(response);
                return null;
            }
            else
            {
                return { method: 'errorNotFound', data: { path: request.url } };
            }
        });
    }
}
class WebdavResponsePropfind extends WebdavResponse
{
    constructor(name, api)
    {
        super(name, 207);

        this.api = api;
        this.file = fs.readFileSync('./webdav/{0}/file.xml'.format(name), 'utf8');
        this.collection = fs.readFileSync('./webdav/{0}/collection.xml'.format(name), 'utf8');
    }

    handle(request, response, data)
    {
        this.api.get(data.itemID, (err, data) => 
        {
            if (data)
            {
                return super.handle(request, response, { key: data.id, item: data, depth: request.headers.depth });
            }
            else
            {
                return { method: 'errorNotFound', data: { path: request.url } };
            }
        });
    }
    renderBody(request, response, data)
    {
        var items = [];
        var fileTemplate = this.file;
        var collectionTemplate = this.collection;

        if (data.depth == 0 || data.item.type != 'collection')
            items.push(data.item);
        else
            items = items.concat(this.api.getChildren(data.item.key));

        var content = '';

        items.forEach(function (item) 
        {
            logger.debug('adding {{item}}', { item: item });

            switch (item.type)
            {
                case 'file':
                    content += fileTemplate.formatWith(item);
                    break;
                case 'collection':
                    content += collectionTemplate.formatWith(item);
                    break;
            }
        });

        return this.body.formatWith({ content: content });
    }
}
class WebdavResponseProppatch extends WebdavResponse
{
    constructor(name, api)
    {
        super(name, 207);

        this.api = api;
    }

    handle(request, response, data)
    {
         this.api.get(data.itemID, (err, data) => 
        {
            if (!data)
            { 
                return { method: 'errorNotFound', data: { path: request.url } };
            }
            else
            {
                utils.stream.read(request, (error, data) => 
                {
                    if (error)
                    {
                        console.log('error reading stream: {{error}}', {error: error});
                    }
                    else
                    {
                        request.lastAccess = data.extract('<Z:Win32LastAccessTime>', '</Z:Win32LastAccessTime>');   
                        request.lastModified = new Date(data.extract('<Z:Win32LastModifiedTime>', '</Z:Win32LastModifiedTime>'));   

                        return super.handle(request, response, { itemID: request.path.pathname });
                    }
                });

                return null;
            }
        });
    }
}

module.exports = function (contentAPI) 
{
    return {
        head: new WebdavResponse('head'),
        lock: new WebdavResponse('lock'),
        post: new WebdavResponse('post'),
        options: new WebdavResponse('options'),
        unlock: new WebdavResponse('unlock', 204),
        put: new WebdavResponsePut('put', contentAPI),
        get: new WebdavResponseGet('get', contentAPI),
        errorNotFound: new WebdavResponse('error/404', 404),
        errorNotAuthenticated: new WebdavResponse('error/401', 401),
        propfind: new WebdavResponsePropfind('propfind', contentAPI),
        proppatch: new WebdavResponseProppatch('proppatch', contentAPI),
        patch: new WebdavResponseProppatch('proppatch', contentAPI),

        handle: function (request, response, data)
        {
            data = data || {};
            data.itemID = request.parameters.id;
            var next = { data: data, method: request.method.toLowerCase() };

            while (next) 
            {
                next = this[next.method].handle(request, response, next.data);
            }

            return true;
        }
    }
}