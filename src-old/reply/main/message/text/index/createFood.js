const {makeRuCreatedFoodMessageText} = require(`../languages/ru/createFood.js`);
const {makeRuTextOfLimitationOfFoodDishCreation} = require(`../languages/ru/foodDishCreationLimitation.js`);

const makeCreatedFoodMessageText = (language_code, food) => {
	switch (language_code) {
	 	case 'ru':
	 		return makeRuCreatedFoodMessageText(food);
	 	case 'en':
			return `code me`;
	 	default:
	 		return `code me`;
	}
}
exports.makeCreatedFoodMessageText = makeCreatedFoodMessageText;

const makeFoodCreationLimitationText = (languageCode, limitValue) => {
	switch (languageCode) {
	 	case 'ru':
	 		return makeRuTextOfLimitationOfFoodDishCreation(limitValue);
	 	case 'en':
			return `code me`;
	 	default:
	 		return `code me`;
	}
};
exports.makeFoodCreationLimitationText = makeFoodCreationLimitationText;
