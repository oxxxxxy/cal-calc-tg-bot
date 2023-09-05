const {BJUKWords} = require(`../static/en/BJUKWords.js`);

exports.findEngNutrientNameByItsAbbreviation = abbreviation => {
	const keys = Object.keys(BJUKWords);
	const word = keys.find(e => BJUKWords[e].abbreviation == abbreviation);
	return word.singular;
};
