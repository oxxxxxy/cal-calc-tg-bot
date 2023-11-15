const telegraf = require(`telegraf`);

const buttonOptions = [
	{
		text:`\u{1f1f7}\u{1f1fa} Русский`
		,callback_data:`ru`
	}
	,{
		text:`\u{1f92e} English`
		,callback_data:`en`
	}
];

const makeChangeLanguageMessageInlineKeyboardLine = (buttons, tg_user_id) => {
	buttons.forEach(e => {
		e.callback_data = `i${tg_user_id}chLa_` + e.callback_data;
	});

	return buttons;
};

const makeChangeLanguageMessageInlineKeyboard = dataPart => 
	telegraf.Markup.inlineKeyboard(
		makeChangeLanguageMessageInlineKeyboardLine(buttonOptions, dataPart)
	).reply_markup;
exports.makeChangeLanguageMessageInlineKeyboard = makeChangeLanguageMessageInlineKeyboard;
