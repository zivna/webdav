const request = require('request');

String.prototype.format = function ()
{
    var args = arguments;
    return this.replace(/{\d+}/g, function (match, index, offset, string) 
    {
        return args[parseInt(match.substr(1, match.length - 2))];
    });
}
String.prototype.formatWith = function (args)
{
    return this.replace(/{{.+?}}/g, function (match, index, offset, string) 
    {
        var key = match.substr(2, match.length - 4);
        var value = args[key];
        var result = '';

        switch (typeof(value))
        {
            default: result = value; break;
            case 'array':
            case 'object': result = JSON.stringify(value); break;
        }

        return result;
    });
}
String.prototype.camelCase = function ()
{
    var output = '';
    var toUpper = false;

    for (var i = 0; i < this.length; i++)
    {
        var ch = this.charAt(i);

        if (toUpper) ch = ch.toUpperCase();

        toUpper = false;

        if (ch == ' ')
            toUpper = true;
        else
            output = output + ch;
    }

    return output;
}
String.prototype.pascalCase = function (allUpperCase)
{
    var output = '';

    for (var i = 0; i < this.length; i++)
    {
        var ch = this.charAt(i);

        if (ch == ' ')
            continue;

        if (i > 0 && ch == ch.toUpperCase())
            output = output + "_";

        if (allUpperCase)
            output = output + ch.toUpperCase();
        else
            output = output + ch;
    }

    return output;
}
String.prototype.parseDelimiter = function (delimiter, keys)
{
    var output = {};
    var parts = this.split(delimiter);

    for (var i = 0; i < parts.length && i < keys.length; i++)
    {
        if (keys[i])
            output[keys[i]] = parts[i];
    }

    return output;
}
String.prototype.extract = function (prefix, postfix)
{
    if (!prefix) return null;
    if (!postfix) postfix = prefix;

    var end_index = this.indexOf(postfix);
    var start_index = this.indexOf(prefix);

    if (start_index > -1 && end_index > start_index)
        return this.substr((start_index + prefix.length), (end_index - start_index - prefix.length));

    return null;
}

Date.prototype.getFullMonth = function()
{
    var value = this.getMonth() + 1;
    if (value <= 9) value = '0' + value; 
    return value;
}
Date.prototype.getFullDate = function()
{
    var value = this.getDate();
    if (value <= 9) value = '0' + value; 
    return value;
}
Date.prototype.getFullHours = function()
{
    var value = this.getHours();
    if (value <= 9) value = '0' + value; 
    return value;
}
Date.prototype.getFullMinutes = function()
{
    var value = this.getMinutes();
    if (value <= 9) value = '0' + value; 
    return value;
}
Date.prototype.getFullSeconds = function()
{
    var value = this.getSeconds();
    if (value <= 9) value = '0' + value; 
    return value;
}
Date.prototype.format = function()
{
    return '{0}/{1}/{2} {3}:{4}:{5}'.format(this.getFullYear(), this.getFullMonth(), this.getFullDate(), this.getFullHours(), this.getFullMinutes(), this.getFullSeconds());
}

module.exports = {
    string: {
        camelCase: function (input) { return input.camelCase(); },
        formatWith: function (input, parameters) { return input.toString().formatWith(parameters); }
    },
    stream: {
        read: function (request, callback) 
        {
            var content = '';
            request.on('data', function(data) {content += data});
            request.on('end', function() { callback(null, content) });
            request.on('error', function(err) { callback(err, null) });
        }
    },
    get: function(url, callback, headers) { return request.get({url:url, headers:headers}, callback); },
    put: function(url, callback, headers, body, isJson){ return request.put({url:url, headers:headers, body:body,json:isJson}, callback); },
    post: function(url, callback, headers, body, isJson) { return request.post({url:url, headers:headers, body:body,json:isJson}, callback); }
}