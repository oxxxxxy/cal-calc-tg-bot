const telegraf = require(`telegraf`);

const {makeUserFoodSheetMessageText} = require(`../messageTextMaking/_main/foodSheet/index.js`);
const {
	getCountOfPages
	,getPagingForNButtonsOfPagingInlineKeyboardLine
	,getNButtonsForPagingInlineKeyboardLine
	,makePagingInlineKeyboardLine
} = require(`./inlineKeyboardUtils.js`);

const getUserFoodSheetMessagePanel = (language_code, dataPart, foodList, countOfAllRows, bjukMoreLessCondition, bjukAscDescSorting, selectedPage = 1) => {
	const maxNumberOfLines = 20;

	const message = {};
	message.inlineKeyboard = {};

	if (countOfAllRows > maxNumberOfLines) {
		const countOfPages = getCountOfPages(
			countOfAllRows,
			maxNumberOfLines
		);
		const paging = getPagingForNButtonsOfPagingInlineKeyboardLine(countOfPages, 5, selectedPage);
		const buttons = getNButtonsForPagingInlineKeyboardLine(paging, dataPart);
		const pagingLine = makePagingInlineKeyboardLine(buttons);
		
		message.inlineKeyboard = telegraf.Markup.inlineKeyboard([pagingLine]);
	}
	 
	message.text = makeUserFoodSheetMessageText(language_code, foodList, countOfAllRows, bjukMoreLessCondition, bjukAscDescSorting);
		
	message.inlineKeyboard.parse_mode = 'HTML';

	return message;

}; 
exports.getUserFoodSheetMessagePanel = getUserFoodSheetMessagePanel;
