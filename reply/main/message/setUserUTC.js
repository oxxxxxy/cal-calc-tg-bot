const index = require(`./text/index/setUserUTC.js`);

const getSetUserUTCMessage= (languageCode, userUTCOffset) => {
	const message = {};
	message.text = index.makeSetUserUTCText(languageCode, userUTCOffset);

	return message;
}
exports.getSetUserUTCMessage = getSetUserUTCMessage;

const getInvalidMessage_dayOfMonth = languageCode => {
	const	message = {};
	message.text = index.makeInvalidText_dayOfMonth(languageCode);

	return message;
}
exports.getInvalidMessage_dayOfMonth = getInvalidMessage_dayOfMonth;

const getInvalidMessage_wholeData = languageCode => {
	const message = {};
	message.text = index.makeInvalidText_wholeData(languageCode);

	return message;
}
exports.getInvalidMessage_wholeData = getInvalidMessage_wholeData;
