const parseFormatTokens = (format: string): string[] => {
    // Regular expression to match time tokens in the format string
    const timeTokenRegex = /(yyyy|mm|dd|HH|hh|MM|ss|l)/g;
    const matches = format.match(timeTokenRegex);

    // If there are matches, return the array of matched tokens
    return matches ? matches : [];
};

const format = 'yyyy-mm-dd HH:MM:ss.l';
const formatTokens = parseFormatTokens(format);

const getFormatTime = (): string => {
    const now = new Date();

    const timeValues: { [token: string]: string } = {
        'yyyy': String(now.getFullYear()),
        'mm': String(now.getMonth() + 1).padStart(2, '0'),
        'dd': String(now.getDate()).padStart(2, '0'),
        'HH': String(now.getHours()).padStart(2, '0'),
        'hh': String(now.getHours() % 12 || 12).padStart(2, '0'),
        'MM': String(now.getMinutes()).padStart(2, '0'),
        'ss': String(now.getSeconds()).padStart(2, '0'),
        'l': String(now.getMilliseconds()).padStart(3, '0'),
    };

    // Replace each token in the format string with its corresponding value
    const formattedTime = formatTokens.reduce(
        (result, token) => result.replace(token, timeValues[token]),
        format
    );

    // 12-hour clock
    if (formatTokens.includes('hh')) {
        const period = Number(timeValues['HH']) < 12 ? 'AM' : 'PM';
        return formattedTime + ` ${period}`;
    }

    return '[' + formattedTime + ']';
};

const getLogFormatTime = (): string => {
    const now = new Date();

    const timeValues: { [token: string]: string } = {
        'yyyy': String(now.getFullYear()),
        'mm': String(now.getMonth() + 1).padStart(2, '0'),
        'dd': String(now.getDate()).padStart(2, '0'),
        'HH': String(now.getHours()).padStart(2, '0'),
        'hh': String(now.getHours() % 12 || 12).padStart(2, '0'),
        'MM': String(now.getMinutes()).padStart(2, '0'),
        'ss': String(now.getSeconds()).padStart(2, '0'),
        'l': String(now.getMilliseconds()).padStart(3, '0'),
    };

    // Replace each token in the format string with its corresponding value
    const formattedTime = formatTokens.reduce(
        (result, token) => result.replace(token, timeValues[token]),
        format
    );

    // 12-hour clock
    if (formatTokens.includes('hh')) {
        const period = Number(timeValues['HH']) < 12 ? 'AM' : 'PM';
        return formattedTime + ` ${period}`;
    }

    return '[' + formattedTime + ']';
};

export { getFormatTime, getLogFormatTime };