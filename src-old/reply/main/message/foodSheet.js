const {
	makeUserFoodSheetMessageText
	,getCommandBlock_dishProcessText
} = require(`./text/index/foodSheet.js`);

const {makeFoodSheetMessageInlineKeyboard} = require(`./reply_markup/inlineKeyboard/index/foodSheet.js`);

const getUserFoodSheetMessagePanel = (language_code, dataPart, foodList, countOfAllRows, bjukMoreLessCondition, bjukAscDescSorting, selectedPage = 1) => {
	const maxNumberOfLines = 20;

	const message = {};

	message.reply_markup = makeFoodSheetMessageInlineKeyboard(countOfAllRows, maxNumberOfLines, dataPart, selectedPage);
	/* const reply_markup = makeFoodSheetMessageInlineKeyboard(countOfAllRows, maxNumberOfLines, dataPart, selectedPage);

	if(reply_markup){
		message.reply_markup = reply_markup;
	} */
	 
	message.text = makeUserFoodSheetMessageText(language_code, foodList, countOfAllRows, bjukMoreLessCondition, bjukAscDescSorting);
		
	message.parse_mode = 'HTML';

	return message;
}; 
exports.getUserFoodSheetMessagePanel = getUserFoodSheetMessagePanel;

const getCommandBlock_dishProcessMessage = (languageCode) => 
	getCommandBlock_dishProcessText(languageCode);
exports.getCommandBlock_dishProcessMessage = getCommandBlock_dishProcessMessage;
