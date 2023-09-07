const {
	makeDeleteCreatedFoodAlreadyDeletedText
	,makeDeleteCreatedFoodText
} = require(`./text/index/deleteCreatedFood.js`);

const getDeleteCreatedFoodMessage = (languageCode, foodList) => {
	const message = {};
	message.text = makeDeleteCreatedFoodText(languageCode, foodList);
	message.reply_markup = {parse_mode:`HTML`};
	return message;
}
exports.getDeleteCreatedFoodMessage = getDeleteCreatedFoodMessage;

const getDeleteCreatedFoodAlreadyDeletedMessage = (languageCode, fi_ids_for_user) => {
	const message = {};
	message.text = makeDeleteCreatedFoodAlreadyDeletedText(languageCode, fi_ids_for_user);
	return message;
};
exports.getDeleteCreatedFoodAlreadyDeletedMessage = getDeleteCreatedFoodAlreadyDeletedMessage;

