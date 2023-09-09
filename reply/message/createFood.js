const {makeCreatedFoodMessageText} = require(`./text/index/createFood.js`);

const getCreatedFoodMessage = (languageCode, food) => {
	const message = {};

	message.text = makeCreatedFoodMessageText(languageCode, food);
	message.reply_markup = {
		parse_mode:`HTML`
	};

	return message;
}
exports.getCreatedFoodMessage = getCreatedFoodMessage;
