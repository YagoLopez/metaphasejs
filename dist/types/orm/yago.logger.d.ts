/**
 * Gets url query parameter form URL
 * @param {string} paramName
 * @returns {string}
 */
export declare const getUrlParameter: (paramName: string) => string;
/**
 * Update query string parameter
 * @param {string} uri
 * @param {string} key
 * @param {string} value
 * @return {string}
 */
export declare function updateQueryStringParameter(uri: string, key: string, value: string): string;
/**
 * Disable console output messages (except error).
 * Used for production mode
 */
export declare function disableConsole(): void;
/**
 * Log message formats: foreground color, background color
 * CSS syntax is used to format messages
 * @type {Object}
 */
export declare const LOG_FORMAT: {
    BLUE: string;
    ORANGE: string;
    BG_YELLOW: string;
};
/**
 * Logs sql query strings and query results, appling two formats:
 * Input (query): blue colors
 * Output (result): yellow colors
 * @param {string} msg
 * @param {"query" | "result" | string} format
 */
export declare function logQuery(msg: string, format: 'query' | 'result' | string): void;
/**
 * General Fn to apply format to a log message
 * @param {string} msg
 * @param {string} format
 */
export declare function log(msg: string, format: string): void;
