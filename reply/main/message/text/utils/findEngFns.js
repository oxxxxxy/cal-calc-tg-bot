const {BJUKWords, sortingWords} = require(`../languages/en/static/words.js`);

exports.findEngSortingNameByItsAbbreviation = abbreviation => {
	console.log(sortingWords, abbreviation)

	const keys = Object.keys(sortingWords);
	return keys.find(e => sortingWords[e].abbreviation == abbreviation);
};

const findEngNutrientNameByItsAbbreviation = abbreviation => {
	const keys = Object.keys(BJUKWords);
	return keys.find(e => BJUKWords[e].abbreviation == abbreviation);
};
exports.findEngNutrientNameByItsAbbreviation = findEngNutrientNameByItsAbbreviation;

