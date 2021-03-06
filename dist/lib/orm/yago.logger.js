"use strict";
// Debugger in the browser console can be controlled through a url query parameter.
// For example: http://localhost:3000?logger=true
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Controls default logger behaviour.
 * Pass a 'false' value to avoid logger. This is the desired behaviour for production.
 * @type {string}
 */
var DEFAULT_LOG_STATE = 'false';
/**
 * Gets url query parameter form URL
 * @param {string} paramName
 * @returns {string}
 */
exports.getUrlParameter = function (paramName) {
    paramName = paramName.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + paramName + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};
/**
 * Update query string parameter
 * @param {string} uri
 * @param {string} key
 * @param {string} value
 * @return {string}
 */
function updateQueryStringParameter(uri, key, value) {
    var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
    var separator = uri.indexOf('?') !== -1 ? "&" : "?";
    if (uri.match(re)) {
        return uri.replace(re, '$1' + key + "=" + value + '$2');
    }
    else {
        return uri + separator + key + "=" + value;
    }
}
exports.updateQueryStringParameter = updateQueryStringParameter;
// Variable that holds the looger state
var urlLogParam = exports.getUrlParameter('logger');
urlLogParam = urlLogParam || DEFAULT_LOG_STATE;
/**
 * Disables console output messages (except error).
 * Used for production mode
 */
function disableConsole() {
    // console = console || {};
    console.log = function () { };
    console.table = function () { };
    console.warn = function () { };
}
exports.disableConsole = disableConsole;
if (urlLogParam === 'false') {
    disableConsole();
}
/**
 * Logs message formats: foreground color, background color
 * CSS syntax is used to format messages
 * @type {Object}
 */
exports.LOG_FORMAT = {
    BLUE: 'background: ghostwhite; color: cornflowerblue; font-size: 12px; font-weight: bold',
    ORANGE: 'color: orange',
    BG_YELLOW: 'background-color: yellow'
};
/**
 * Logs sql query strings and query results, appling two formats:
 * Input (query): blue colors
 * Output (result): yellow colors
 * @param {string} msg
 * @param {"query" | "result" | string} format
 */
function logQuery(msg, format) {
    if (format === 'query') {
        var format_1 = exports.LOG_FORMAT.BLUE;
        console.log("%c" + msg, format_1);
    }
    else if (format === 'result') {
        var format_2 = exports.LOG_FORMAT.ORANGE;
        console.log("%c\u2705 " + msg, format_2);
    }
    else {
        console.log("%c" + msg, format);
    }
}
exports.logQuery = logQuery;
/**
 * General Fn to apply format to a log message
 * @param {string} msg
 * @param {string} format
 */
function log(msg, format) {
    console.log("%c" + msg, format);
}
exports.log = log;
/* Using a global variable: ********************************** */
// interface window {
//   DEBUG: boolean;
// }
//
// export const setDebugLevel = (flag: boolean = true): void => {
//   (window as any).DEBUG = flag;
// };
/* Get query string parameters for modern browsers. Doesnt work with Jest. A shim is needed */
// const urlParams = new URLSearchParams(window.location.search);
// let urlLogParam = urlParams.get('log');
//# sourceMappingURL=yago.logger.js.map