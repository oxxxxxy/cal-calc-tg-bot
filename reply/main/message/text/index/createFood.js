const {makeRuCreatedFoodMessageText} = require(`../languages/ru/createFood.js`);

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
