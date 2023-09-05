const {BJUKWords} = require(`../static/BJUKWords.js`);

console.log(BJUKWords);

const makeBJUKCriterionDescForRuHeaderOfShowingMessage = (bjukMoreLessCondition, bjukAscDescSorting) => {//think about it...
	if(bjukMoreLessCondition && bjukAscDescSorting) {
		return ' с ' + bjukMoreLessCondition + ' и ' + bjukAscDescSorting;
	}
	if(bjukMoreLessCondition){
		return ' с ' + bjukMoreLessCondition;
	}
	if(bjukAscDescSorting){
		return ' с ' + bjukAscDescSorting;
	}
	return ``;
}
exports.makeBJUKCriterionDescForRuHeaderOfShowingMessage = makeBJUKCriterionDescForRuHeaderOfShowingMessage;

const makeRuHeaderBeforeUserFoodSheet = (countOfAllRows, bjukMoreLessCondition, bjukAscDescSorting) => 
	`<b>СПИСОК СОЗДАННОЙ ЕДЫ${
			makeBJUKCriterionDescForRuHeaderOfShowingMessage(bjukMoreLessCondition, bjukAscDescSorting)
		}.</b> Всего: ${countOfAllRows}.`;
exports.makeRuHeaderBeforeUserFoodSheet = makeRuHeaderBeforeUserFoodSheet;
