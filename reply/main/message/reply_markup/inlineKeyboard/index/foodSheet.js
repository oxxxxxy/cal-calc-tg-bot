const telegraf = require(`telegraf`);
const {
	getCountOfPages
	,getPagingForNButtonsOfPagingInlineKeyboardLine
	,getNButtonsForPagingInlineKeyboardLine
	,makePagingInlineKeyboardLine
} = require(`../utils/pagingInlineKeyboard.js`);

const makeFoodSheetMessageInlineKeyboard = (countOfAllRows, maxNumberOfLines, dataPart, selectedPage) => {
	let reply_markup = {};

	if (countOfAllRows > maxNumberOfLines) {
		const countOfPages = getCountOfPages(
			countOfAllRows,
			maxNumberOfLines
		);
		const paging = getPagingForNButtonsOfPagingInlineKeyboardLine(countOfPages, 5, selectedPage);
		const buttons = getNButtonsForPagingInlineKeyboardLine(paging, dataPart);
		const pagingLine = makePagingInlineKeyboardLine(buttons);
		
		reply_markup = telegraf.Markup.inlineKeyboard([pagingLine]).reply_markup;
	}

	return reply_markup;
}
exports.makeFoodSheetMessageInlineKeyboard = makeFoodSheetMessageInlineKeyboard;
