const {makeEnLanguageHasBeenChangedMessageText} = require(`../languages/en/changeLanguage.js`);
const {makeRuLanguageHasBeenChangedMessageText} = require(`../languages/ru/changeLanguage.js`);

const makeLanguageHasBeenChangedMessageText = languageCode => {
	switch (languageCode) {
	 	case 'ru':
			return makeRuLanguageHasBeenChangedMessageText();
	 	case 'en':
			return makeEnLanguageHasBeenChangedMessageText();
	 	default:
	 		return `code me`;
	}
}
exports.makeLanguageHasBeenChangedMessageText = makeLanguageHasBeenChangedMessageText;
