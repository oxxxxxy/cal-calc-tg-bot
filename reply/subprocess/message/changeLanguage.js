const {makeMultiLangChangeLanguageMessageText} = require(`../../main/message/text/languages/multiLang/changeLanguage.js`);
const {makeLanguageHasBeenChangedMessageText} = require(`../../main/message/text/index/changeLanguage.js`);


const getInvalidInputMessageOfChangeLanguageSubprocess = () => makeMultiLangChangeLanguageMessageText();
exports.getInvalidInputMessageOfChangeLanguageSubprocess = getInvalidInputMessageOfChangeLanguageSubprocess;

const getLanguageHasBeenChangedMessage = languageCode => {
	const message = {};
	message.text = makeLanguageHasBeenChangedMessageText(languageCode);
	return message;
} 
exports.getLanguageHasBeenChangedMessage = getLanguageHasBeenChangedMessage;  

