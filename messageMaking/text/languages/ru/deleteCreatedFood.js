const {getObjOfRuBJUKAbbreviations} = require(`../../utils/getAbbreviationFns.js`);
const {
	HTMLMonospace
	,HTMLBold 
	,HTMLUnderline
	,makeNumForSheetLine
} = require(`../../utils/textFormatting.js`);

const makeRuDeleteCreatedFoodSheetLine = food => {
	const BJUKabbreviations = getObjOfRuBJUKAbbreviations();
	return `\n|${makeNumForSheetLine(food.fi_id_for_user)}| `
		+ HTMLMonospace(food.name__lang_code_ru + '.'
			+ BJUKabbreviations.protein + food.protein
			+ BJUKabbreviations.fat + food.fat
			+ BJUKabbreviations.carbohydrate + food.carbohydrate
			+ BJUKabbreviations.caloric_content + food.caloric_content);
}
exports.makeRuDeleteCreatedFoodSheetLine = makeRuDeleteCreatedFoodSheetLine;

const makeRuDeleteCreatedFoodText = foodList => {
	let text = HTMLBold(`ЕДА УДАЛЕНА.`);
	text += HTMLBold(HTMLUnderline(`\n|__ID| Название |БЖУК|`));
	foodList.forEach(e => text += makeRuDeleteCreatedFoodSheetLine(e));
	return text;
}
exports.makeRuDeleteCreatedFoodText = makeRuDeleteCreatedFoodText;

const makeRuDeleteCreatedFoodAlreadyDeletedText = fi_ids_for_user => 
	`Не существует еды с id: ${fi_ids_for_user.join(`, `)}.`;
exports.makeRuDeleteCreatedFoodAlreadyDeletedText = makeRuDeleteCreatedFoodAlreadyDeletedText;



