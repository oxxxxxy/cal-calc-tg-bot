const {getEngAbbreviationOfBJUKFromRuAbbreviation} = require(`./getEngAbbreviationOfBJUKFromRuAbbreviation.js`);
const {findEngNutrientNameByItsAbbreviation} = require(`./findEngNutrientNameByItsAbbreviation.js`);

const getBJUKAbbreviationAndName = (userLanguageCode, undetectedCharOfBJUK) => {
	let abbreviation;
	let name;
	
	switch (userLanguageCode) {
	 	case 'ru':
			abbreviation = getEngAbbreviationOfBJUKFromRuAbbreviation(undetectedCharOfBJUK);
			name = findEngNutrientNameByItsAbbreviation(abbreviation);
			break;
	 	case 'en':
	 		abbreviation = undetectedCharOfBJUK;
			name = findEngNutrientNameByItsAbbreviation(abbreviation);
	 		break;
	}

	if(!abbreviation || !name){
		 return undefined;
	}

	return {abbreviation, name};
};
