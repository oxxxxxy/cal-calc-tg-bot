const {makeRuFoodSheetHeader, makeRuFoodSheetLine} = require(`././foodSheet/index`);
const {HTMLMonospace} = require(`../../utils/textFormatting.js`);

const makeRuCreatedFoodMessageText = food => 
	`<b>ЕДА УСПЕШНО СОЗДАНА.</b>${
		makeRuFoodSheetHeader(true)}${
		makeRuFoodSheetLine(food)}\n\nОшибка? Введите  ${
		HTMLMonospace('уе ' + food.fi_id_for_user)}.`;

exports.makeRuCreatedFoodMessageText = makeRuCreatedFoodMessageText;
