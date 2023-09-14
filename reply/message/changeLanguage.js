const {makeChangeLanguageMessageInlineKeyboard} = require(`./reply_markup/inlineKeyboard/index/changeLanguage.js`);
const {makeMultiLangChangeLanguageMessageText} = require(`./text/languages/multiLang/changeLanguage.js`);


const getChangeLanguageMessage = dataPart => {
	const message = {};
	message.reply_markup = makeChangeLanguageMessageInlineKeyboard(dataPart);
	message.text = makeMultiLangChangeLanguageMessageText();
	return message;
};
exports.getChangeLanguageMessage = getChangeLanguageMessage;

const getLanguageHasBeenChangedMessage = languageCode => {
	const message = {};
	message.text = makeLanguageHasBeenChangedMessageText(languageCode);
	return message;
} 
exports.getLanguageHasBeenChangedMessage = getLanguageHasBeenChangedMessage;  
