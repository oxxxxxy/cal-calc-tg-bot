const telegraf = require(`telegraf`);

const {
	getPagingForNButtonsOfPagingInlineKeyboardLine
	,getNButtonsForPagingInlineKeyboardLine
	,makePagingInlineKeyboardLine
} = require(`../../utils/pagingInlineKeyboard.js`);
const {listOfPerPageCountOfRuCommandBlocksForHelpMessagePanel} = require(`../../../../text/languages/ru/help.js`);

const makeRuHelpMessagePanelInlineKeyboard = (selectedPage, tg_user_id) => {
	let reply_markup = {};

	const pageCount = listOfPerPageCountOfRuCommandBlocksForHelpMessagePanel.length;

	if (pageCount > 1) {
		const paging = getPagingForNButtonsOfPagingInlineKeyboardLine(pageCount, 3, selectedPage);
		const buttons = getNButtonsForPagingInlineKeyboardLine(paging, `i${tg_user_id}c`);
		const pagingLine = makePagingInlineKeyboardLine(buttons);
		
		reply_markup = telegraf.Markup.inlineKeyboard([pagingLine]).reply_markup;
	}
	
	return reply_markup;
}
exports.makeRuHelpMessagePanelInlineKeyboard = makeRuHelpMessagePanelInlineKeyboard;
