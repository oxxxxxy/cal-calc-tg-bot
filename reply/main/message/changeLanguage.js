const {makeChangeLanguageMessageInlineKeyboard} = require(`./reply_markup/inlineKeyboard/index/changeLanguage.js`);
const {makeMultiLangChangeLanguageMessageText} = require(`./text/languages/multiLang/changeLanguage.js`);


const getChangeLanguageMessage = userInfo => {
	const message = {};
	message.reply_markup = makeChangeLanguageMessageInlineKeyboard(userInfo);
	message.text = makeMultiLangChangeLanguageMessageText();
	return message;
};
exports.getChangeLanguageMessage = getChangeLanguageMessage;

