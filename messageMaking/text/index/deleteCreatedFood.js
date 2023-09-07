const {
	makeRuDeleteCreatedFoodText
	,makeRuDeleteCreatedFoodAlreadyDeletedText
} = require(`../languages/ru/deleteCreatedFood.js`);

const makeDeleteCreatedFoodText = (language_code, foodList) => {
	switch (language_code) {
	 	case 'ru':
	 		return makeRuDeleteCreatedFoodText(foodList);
	 	case 'en':
			return `code me`;
	 	default:
	 		return `code me`;
	}
}
exports.makeDeleteCreatedFoodText = makeDeleteCreatedFoodText;

const makeDeleteCreatedFoodAlreadyDeletedText = (languageCode, fi_ids_for_user) => {
	switch (languageCode) {
	 	case 'ru':
	 		return makeRuDeleteCreatedFoodAlreadyDeletedText(fi_ids_for_user);
	 	case 'en':
			return `code me`;
	 	default:
	 		return `code me`;
	}
};
exports.makeDeleteCreatedFoodAlreadyDeletedText = makeDeleteCreatedFoodAlreadyDeletedText;
