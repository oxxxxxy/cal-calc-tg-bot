const {makeCriterionDescForRuHeaderBeforeFoodDishSheet} = require(`../header.js`);

const makeRuHeaderBeforeUserFoodSheet = (countOfAllRows, bjukMoreLessCondition, bjukAscDescSorting) => 
	`<b>СПИСОК СОЗДАННОЙ ЕДЫ${
			makeCriterionDescForRuHeaderBeforeFoodDishSheet(bjukMoreLessCondition, bjukAscDescSorting)
		}.</b> Всего: ${countOfAllRows}.`;
exports.makeRuHeaderBeforeUserFoodSheet = makeRuHeaderBeforeUserFoodSheet;
