const ru = require(`../static/ru/BJUKWords.js`);
const en = require(`../static/en/BJUKWords.js`);

const getEngAbbreviationOfBJUKFromRuAbbreviation = ruBJUKAbbreviation => {
	switch (ruBJUKAbbreviation) {
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
exports.getEngAbbreviationOfBJUKFromRuAbbreviation = getEngAbbreviationOfBJUKFromRuAbbreviation;
