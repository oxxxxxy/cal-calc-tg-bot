const ru = require(`../languages/ru/static/words.js`);
const en = require(`../languages/en/static/words.js`);

const getEngBJUKAbbreviationFromRuAbbreviation = ruAbbr => {
	switch (ruAbbr) {
	 	case ru.BJUKWords.protein.abbreviation:
			return en.BJUKWords.protein.abbreviation;
	 	case ru.BJUKWords.fat.abbreviation:
			return en.BJUKWords.fat.abbreviation;
	 	case ru.BJUKWords.carbohydrate.abbreviation:
			return en.BJUKWords.carbohydrate.abbreviation;
	 	case ru.BJUKWords.caloric_content.abbreviation:
			return en.BJUKWords.caloric_content.abbreviation;
	 	default:
			return undefined;
	};
};
exports.getEngBJUKAbbreviationFromRuAbbreviation = getEngBJUKAbbreviationFromRuAbbreviation;

const getEngBJUKAbbreviationFromForeignAbbr = (userLanguageCode, abbr) => {
	let abbreviation;
	
	switch (userLanguageCode) {
	 	case 'ru':
			abbreviation = getEngBJUKAbbreviationFromRuAbbreviation(abbr);
			break;
	}

	return abbreviation;
};
exports.getEngBJUKAbbreviationFromForeignAbbr = getEngBJUKAbbreviationFromForeignAbbr;



const getEngSortingAbbreviationFromRuAbbreviation = ruAbbr => {
	switch (ruAbbr) {
	 	case ru.sortingWords.ascending.abbreviation:
			return en.sortingWords.ascending.abbreviation;
	 	case ru.sortingWords.descending.abbreviation:
			return en.sortingWords.descending.abbreviation;
	 	default:
			return undefined;
	};
};
exports.getEngSortingAbbreviationFromRuAbbreviation = getEngSortingAbbreviationFromRuAbbreviation;

const getEngSortingAbbreviationFromForeignAbbr = (userLanguageCode, abbr) => {
	let abbreviation;

	switch (userLanguageCode) {
	 	case 'ru':
			abbreviation = getEngSortingAbbreviationFromRuAbbreviation(abbr);
			break;
	}

	return abbreviation;
		
};
exports.getEngSortingAbbreviationFromForeignAbbr = getEngSortingAbbreviationFromForeignAbbr;

