const {BJUKWords, sortingWords} = require(`../../../../static/ru/words.js`);
const {
	findEngNutrientNameByItsAbbreviation
	,findEngSortingNameByItsAbbreviation
} = require(`../../../utils/findEngFns.js`);

const makeCriterionDescForRuHeaderBeforeFoodDishSheet = (bjukMoreLessCondition, bjukAscDescSorting) => {
	const makeConditionPart = bjukMoreLessCondition => {
		if(!bjukMoreLessCondition){
			return ``;
		}

		const conditionNutrientName = findEngNutrientNameByItsAbbreviation(bjukMoreLessCondition.nutrientAbbreviation);
	
		return BJUKWords[conditionNutrientName].plural.instrumentalCase + bjukMoreLessCondition.moreLessSign + bjukMoreLessCondition.value;
	};

	const makeSortingPart = bjukAscDescSorting => {
		if(!bjukAscDescSorting){
			return ``;
		}

		const sortingNutrientName = findEngNutrientNameByItsAbbreviation(bjukAscDescSorting.nutrientAbbreviation);
		const sortingName = findEngSortingNameByItsAbbreviation(bjukMoreLessCondition.sortingAbbreviation);

		return BJUKWords[sortingNutrientName].plural.instrumentalCase + ` по ` + sortingWords[sortingName].singular.dativeCase;
	};

	const conditionPart = makeConditionPart(bjukMoreLessCondition);
	const sortingPart = makeSortingPart(bjukAscDescSorting);

	if(conditionPart && sortingPart) {
		return ' с ' + conditionPart + ' и ' + sortingPart;
	}
	if(conditionPart){
		return ' с ' + conditionPart;
	}
	if(sortingPart){
		return ' с ' + sortingPart;
	}

	return ``;
}
exports.makeCriterionDescForRuHeaderBeforeFoodDishSheet = makeCriterionDescForRuHeaderBeforeFoodDishSheet;

const makeRuFoodSheetHeader = isUserFood =>
	`\n<b><u>${isUserFood ? '|__ID' : ''}|Б_____|Ж_____|У_____|К______|</u> <i>Название</i></b>`;
exports.makeRuFoodSheetHeader = makeRuFoodSheetHeader;

const makeRuFoodSheetLine = food => `\n<u>${
	food.fi_id_for_user ?
		'|' + makeNumForSheetLine(food.fi_id_for_user, 4) : ''}|Б:${
	makeBJUKValueForSheetLine(food.protein, 4)}|Ж:${
	makeBJUKValueForSheetLine(food.fat, 4)}|У:${
	makeBJUKValueForSheetLine(food.carbohydrate, 4)}|К:${
	makeBJUKValueForSheetLine(food.caloric_content, 5)}|</u> <i>${
	food.name__lang_code_ru}</i>`;
exports.makeRuFoodSheetLine = makeRuFoodSheetLine;

const makeRuFoodSheetContent = foodList => foodList.reduce(
	(accum, e) => accum + makeRuFoodSheetLine(e), '');
exports.makeRuFoodSheetContent = makeRuFoodSheetContent;
