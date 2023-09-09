const {getUTCOffsetStr} = require(`../multiLang/setUserUTC.js`);

exports.invalidText_dayOfMonth = `Некорректное число месяца.`;

exports.invalidText_wholeData = `Некорректные данные.`;

const makeRuSetUserUTCText = userUTCOffset => 
	`Часовой пояс задан успешно. UTC ${getUTCOffsetStr(userUTCOffset)}`;
exports.makeRuSetUserUTCText = makeRuSetUserUTCText;
