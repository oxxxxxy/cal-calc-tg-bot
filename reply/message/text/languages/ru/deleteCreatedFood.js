const {getObjOfRuBJUKAbbreviations} = require(`../../utils/getAbbreviationFns.js`);
const {HTMLBold, HTMLUnderline} = require(`../../utils/textFormatting.js`);
const {makeMultiLangDeleteCreatedFoodSheetLine} = require(`../multiLang/deleteCreatedFood.js`);

const makeRuDeleteCreatedFoodText = foodList => {
	const BJUKabbreviations = getObjOfRuBJUKAbbreviations();
	let text = HTMLBold(`ЕДА УДАЛЕНА.`);
	text += HTMLBold(HTMLUnderline(`\n|__ID| Название |БЖУК|`));
	foodList.forEach(e => text += makeMultiLangDeleteCreatedFoodSheetLine(e, BJUKabbreviations));
	return text;
}
exports.makeRuDeleteCreatedFoodText = makeRuDeleteCreatedFoodText;

const makeRuDeleteCreatedFoodAlreadyDeletedText = fi_ids_for_user => 
	`Не существует еды с id: ${fi_ids_for_user.join(`, `)}.`;
exports.makeRuDeleteCreatedFoodAlreadyDeletedText = makeRuDeleteCreatedFoodAlreadyDeletedText;



