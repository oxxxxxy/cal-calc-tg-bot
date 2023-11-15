const {
	addCharBeforeValue
} = require(`../../utils/textFormatting.js`);

const getUTCOffsetStr = (userUTCOffset) => {
	return userUTCOffset.sign + addCharBeforeValue(userUTCOffset.hours, 2, '0') + ':' + addCharBeforeValue(userUTCOffset.minutes, 2, '0');
}
exports.getUTCOffsetStr = getUTCOffsetStr;

