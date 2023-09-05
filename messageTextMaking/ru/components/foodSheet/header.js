const {BJUKWords, sortingWords} = require(`../../../../static/ru/words.js`);
const {
	findEngNutrientNameByItsAbbreviation
	,findEngSortingNameByItsAbbreviation
} = require(`../../../../utils/findEngFns.js`);

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
