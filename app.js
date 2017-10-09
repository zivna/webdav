const fs = require('fs');
const url = require('url');
const path = require('path');
const http = require('http');
const requestHelper = require('request')
const utils = require('./utils.js');
const config = require('./config.js');
const contentAPI = require('./contentAPI.js');
const logger = require('./logger.js')('default');

// ================================================== JWT authentication ==================================================//
//var jwt = require('jsonwebtoken');

// var token = jwt.sign({ sub: 'admin', roles: ['SUPER-USER'], SeccValue: 100, DivisionID: 'POC1', PositionID: 'POC111' }, config.authentication.key);
// logger.debug('token ({{length}}): {{token}}', { length: token.length, token: token });

// ================================================== Content API ==================================================//
// var items = {
//     '/': { key: '/', name: 'root', type: 'collection', size: 0, modified: new Date(1980, 8, 13) },
//     '/child-folder': { key: '/child-folder', name: 'child-folder', type: 'collection', size: 0, modified: 'Mon, 03 Jul 2017 12:29:26 +0300' },
//     '/child-folder/text.txt': { key: '/child-folder/text.txt', name: 'text.txt', type: 'file', size: 75, modified: 'Mon, 03 Jul 2017 12:29:26 +0300', content: 'text/plain; charset=utf-8' },
//     '/child-folder/123.docx': { key: '/child-folder/123.docx', name: '123.docx', type: 'file', size: 10418, modified: 'Mon, 03 Jul 2017 12:29:26 +0300', content: 'application/octet-stream' },
//     '/child-folder/jpg.jpg': { key: '/child-folder/jpg.jpg', name: 'jpg.jpg', type: 'file', size: 32172, modified: 'Mon, 03 Jul 2017 12:29:26 +0300', content: 'image/jpeg' },
//     '/child-folder/video.mp4': { key: '/child-folder/video.mp4', name: 'video.mp4', type: 'file', size: 32172, modified: 'Mon, 03 Jul 2017 12:29:26 +0300', content: 'video/mp4' },
//     '/child-folder/entities.xlsx': { key: '/child-folder/entities.xlsx', name: 'entities.xlsx', type: 'file', size: 102200, modified: 'Mon, 03 Jul 2017 12:29:26 +0300', content: 'application/octet-stream' }
// };

// var contentAPI = {
//     getItem: function (itemID)
//     {
//         return items[itemID];
//     },
//     getChildren: function (parentKey)
//     {
//         var list = [];
//         var regex = new RegExp(parentKey + '[^\/]*');

//         Object.keys(items).forEach(function (key)
//         {
//             if (key.match(regex))
//                 list.push(items[key]);
//         });

//         return list;
//     }
// }

// ================================================== Webdav ==================================================//

var webdav = require('./webdav.js')(contentAPI);

// ================================================== Setup ==================================================//

var headers = {
    "WS-USER-INFO.NAME": 'User10',
    "WS-USER-INFO.ROLES": ['SUPER-USER'],
    "WS-USER-INFO.DIVISION-ID": 'DIV1',
    "WS-USER-INFO.POSITION-ID": 'POS1',
    "WS-USER-INFO.CLASSIFICATION-VALUE": 100,
    "Content-Type": "application/octet-stream"
}
var options = {
    url: 'http://localhost:12050/contentManagement/content',
    method: 'POST',
    json: true,
    headers: headers
};



// var promise = new Promise((resolve, reject) => {
//     request(options,
//         (error, response, body) => {
//             logger.debug('response {{response}}, {{body}}, {{error}}', { response: {}, body: body, error: error });

//             resolve(response);
//         });
// });

// var api = {
//     send: (options, callback) => { request(options, callback); },
//     post: (url, headers, body, callback) => { api.send({ method: 'POST', url: url, headers: headers, json: false, body: body }, callback); },
//     upload: (path, callback) => { api.post('http://localhost:12050/contentManagement/content', headers, fs.createReadStream(path), callback)}
// }

// api.upload('./data/123.docx', (error, response, body) => 
// {
//     logger.debug('response {{response}}, {{body}}, {{error}}', { response: {}, body: body, error: error });
// });

// var req = http.request(options, function(res)
// {
//     logger.debug('request');
// });

// fs.createReadStream('./data/123.docx').pipe(request.post(options, function(error, response, data)
// {
//     logger.debug('request');
// }));




// promise.then(function(response)
// {
//     logger.debug('done');
// });

// ================================================== Node Server ==================================================//

// http.createServer(function (request, response)
// {
//     logger.debug('==================== request ====================')

//     logger.debug('method: {{method}}', request);
//     logger.debug('url: {{url}}', request);
//     logger.debug('path: {{path}}', request);
//     logger.debug('headers: {{headers}}', request);

//     contentAPI.getItem('7fa64ec7-dc3d-4b27-a179-c3d14c194794');

//     try 
//     {
//         request.path = url.parse(request.url, true);

//         if (!webdav.handle(request, response))
//         {
//             response.end('Failed');
//         }
//     }
//     catch (er)
//     {
//         logger.error('server error - {{error}}', {error: er});
//     }


//     // if (config.authentication)
//     // {
//     //     try 
//     //     {
//     //         request.jwt = jwt.verify(request.path.query.jwt, config.authentication.key);
//     //         request.user = request.jwt.sub;

//     //         logger.debug('user: {{user}}', request);
//     //     } catch (error)
//     //     {
//     //         return webdav.errorNotAuthenticated.handle(request, response);
//     //     }
//     // }



//     // var body = [];
//     // request.on('data', function (chunk)
//     // {
//     //     body.push(chunk);
//     // }).on('end', function ()
//     // {
//     //     request.body = Buffer.concat(body).toString();

//     //     console.log('body:');
//     //     console.log(request.body);

//     //     if (!webdav.handle(request, response, {}))
//     //     {
//     //         response.end('Failed');
//     //     }


//     //     // if (request.method == 'PROPFIND')
//     //     // {
//     //     //     propfind(request, response)
//     //     // }
//     //     // else if (request.method == 'OPTIONS')
//     //     // {
//     //     //     options(request, response)
//     //     // }
//     //     // else
//     //     // {
//     //     //     response.end();
//     //     // }
//     // });



// }).listen(config.server.port);


contentAPI.headers = headers;
// contentAPI.upload(fs.createReadStream('./data/text.txt'), (err, data) => 
// {
//     var key = data;

//     logger.debug('uploaded - ' + data);

//     contentAPI.create({
//         contentID: data,
//         format: 'txt',
//         name: 'text.txt',
//         fileType: 'document'
//      }, (err, data) => 
//      {
//          logger.debug('created - ' + data.entityId);
//      })
// });



http.createServer(function (request, response)
{
    request.path = url.parse(request.url, true);
    request.parameters = request.path.pathname.parseDelimiter('/', [null, 'root', 'id']);

    logger.debug('==================== request ====================')

    logger.debug('method: {{method}}', request);
    logger.debug('url: {{url}}', request);
    logger.debug('path: {{pathname}}', request.path);
    logger.debug('parameters: {{parameters}}', request);
    logger.debug('headers: {{headers}}', request);


    if (request.method == 'GET' && request.url == "/add")
    {
        contentAPI.upload(fs.createReadStream('./data/text.txt'), null, (err, data) => 
        {
            var key = data;

            logger.debug('uploaded - ' + data);

            contentAPI.create({
                contentID: data,
                format: 'txt',
                name: 'text.txt',
                fileType: 'document'
            }, (err, data) => 
            {
                if (err)
                    logger.debug('error while creating file: ' + JSON.stringify(err));
                else
                    logger.debug('file created: ' + JSON.stringify(data));
            })
        });

        response.writeHead(200, {});
        response.end();
    }
    else
    {
        if (!webdav.handle(request, response))
        {
            response.end('Failed');
        }
    }

}).listen(config.server.port);

logger.info('Server running at http://127.0.0.1:{0}/'.format(config.server.port)); 