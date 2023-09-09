const telegraf = require(`telegraf`);

const {
	getPagingForNButtonsOfPagingInlineKeyboardLine
	,getNButtonsForPagingInlineKeyboardLine
	,makePagingInlineKeyboardLine
} = require(`../../utils/inlineKeyboard.js`);
const {listOfPerPageCountOfRuCommandBlocksForHelpMessagePanel} = require(`../../../../text/languages/ru/help.js`);

const makeRuHelpMessagePanelInlineKeyboard = (selectedPage, tg_user_id) => {
	let inlineKeyboard = {};

	const pageCount = listOfPerPageCountOfRuCommandBlocksForHelpMessagePanel.length;

	if (pageCount > 1) {
		const paging = getPagingForNButtonsOfPagingInlineKeyboardLine(pageCount, 3, selectedPage);
		const buttons = getNButtonsForPagingInlineKeyboardLine(paging, `i${tg_user_id}c`);
		const pagingLine = makePagingInlineKeyboardLine(buttons);
		
		inlineKeyboard = telegraf.Markup.inlineKeyboard([pagingLine]);
	}
	
	return inlineKeyboard;
}
exports.makeRuHelpMessagePanelInlineKeyboard = makeRuHelpMessagePanelInlineKeyboard;
