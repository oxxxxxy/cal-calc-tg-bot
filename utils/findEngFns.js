const {BJUKWords, sortingWords} = require(`../static/en/words.js`);

exports.findEngSortingNameByItsAbbreviation = abbreviation => {
	const keys = Object.keys(sortingWords);
	const word = keys.find(e => sortingWords[e].abbreviation == abbreviation);
	return word.singular;
};

exports.findEngNutrientNameByItsAbbreviation = abbreviation => {
	const keys = Object.keys(BJUKWords);
	const word = keys.find(e => BJUKWords[e].abbreviation == abbreviation);
	return word.singular;
};
