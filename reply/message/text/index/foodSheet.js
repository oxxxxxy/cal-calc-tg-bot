const {
	makeRuHeaderBeforeUserFoodSheet
	,makeRuFoodSheetHeader
	,makeRuFoodSheetContent
	,ruCommandBlock_dishProcessText
} = require(`../languages/ru/foodSheet.js`);

const makeUserFoodSheetMessageText = (language_code, foodList, countOfAllRows, bjukMoreLessCondition, bjukAscDescSorting) => {
	switch (language_code) {
	 	case 'ru':
	 		return makeRuHeaderBeforeUserFoodSheet(countOfAllRows, bjukMoreLessCondition, bjukAscDescSorting)
				+ makeRuFoodSheetHeader(true)
				+ makeRuFoodSheetContent(foodList);
	 	case 'en':
			return `code me`;
	 	default:
	 		return `code me`;
	}
}
exports.makeUserFoodSheetMessageText = makeUserFoodSheetMessageText;

const getCommandBlock_dishProcessText = (languageCode) => {
	switch (languageCode) {
	 	case 'ru':
	 		return ruCommandBlock_dishProcessText;
	 	case 'en':
			return `code me`;
	 	default:
	 		return `code me`;
	}
};
exports.getCommandBlock_dishProcessText = getCommandBlock_dishProcessText;

