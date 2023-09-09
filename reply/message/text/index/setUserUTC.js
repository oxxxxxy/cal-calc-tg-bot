const ru = require(`../languages/ru/setUserUTC.js`);

const makeSetUserUTCText = (languageCode, userUTCOffset) => {
	switch (languageCode) {
	 	case 'ru':
	 		return ru.makeRuSetUserUTCText(userUTCOffset);
	 	case 'en':
			return `code me`;
	 	default:
	 		return `code me`;
	}
};
exports.makeSetUserUTCText = makeSetUserUTCText;

const makeInvalidText_dayOfMonth = (languageCode) => {
	switch (languageCode) {
	 	case 'ru':
	 		return ru.invalidText_dayOfMonth;
	 	case 'en':
			return `code me`;
	 	default:
	 		return `code me`;
	}
}
exports.makeInvalidText_dayOfMonth = makeInvalidText_dayOfMonth;

const makeInvalidText_wholeData = (languageCode) => {
	switch (languageCode) {
	 	case 'ru':
	 		return ru.invalidText_wholeData;
	 	case 'en':
			return `code me`;
	 	default:
	 		return `code me`;
	}
}
exports.makeInvalidText_wholeData = makeInvalidText_wholeData;
