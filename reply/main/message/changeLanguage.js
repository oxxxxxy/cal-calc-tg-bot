const {makeChangeLanguageMessageInlineKeyboard} = require(`./reply_markup/inlineKeyboard/index/changeLanguage.js`);
const {makeMultiLangChangeLanguageMessageText} = require(`./text/languages/multiLang/changeLanguage.js`);


const getChangeLanguageMessage = tg_user_id => {
	const message = {};
	message.reply_markup = makeChangeLanguageMessageInlineKeyboard(tg_user_id);
	message.text = makeMultiLangChangeLanguageMessageText();
	return message;
};
exports.getChangeLanguageMessage = getChangeLanguageMessage;

