const {makeRuHelpMessagePanelInlineKeyboard} = require(`../languages/ru/help.js`);

const makeHelpMessagePanelInlineKeyboard = (languageCode, selectedPage, tg_user_id) => {
	switch (languageCode) {
	 	case 'ru':
	 		return makeRuHelpMessagePanelInlineKeyboard(selectedPage, tg_user_id);
	 	case 'en':
			return {};
	 	default:
	 		return {};
	}
}
exports.makeHelpMessagePanelInlineKeyboard = makeHelpMessagePanelInlineKeyboard;

