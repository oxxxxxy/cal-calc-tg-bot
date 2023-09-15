const {
	HTMLMonospace
	,makeNumForSheetLine
} = require(`../../utils/textFormatting.js`);

const makeMultiLangDeleteCreatedFoodSheetLine = (food, BJUKabbreviations) => 
	`\n<u>|${makeNumForSheetLine(food.fi_id_for_user, 4)}|</u> `
		+ HTMLMonospace(food.name__lang_code_ru + '.'
			+ BJUKabbreviations.protein + food.protein
			+ BJUKabbreviations.fat + food.fat
			+ BJUKabbreviations.carbohydrate + food.carbohydrate
			+ BJUKabbreviations.caloric_content + food.caloric_content);
exports.makeMultiLangDeleteCreatedFoodSheetLine = makeMultiLangDeleteCreatedFoodSheetLine;
