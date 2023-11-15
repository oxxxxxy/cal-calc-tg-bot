const ru = require(`../../../../reply/main/message/text/languages/ru/static/words.js`);
const en = require(`../../../../reply/main/message/text/languages/en/static/words.js`);


const makeREToMatchBJUKParameter = (abbreviation, flagString) =>
	new RegExp(`${abbreviation}(\\s+|)(\\d+(\\s+|)(,|\\.)(\\s+|)\\d+|\\d+)`, flagString);

const makeRE_RU_BJUK_LIST = () => {	
	const keys = Object.keys(ru.BJUKWords);
	 
	return keys.map(e => 
		({
			columnName: e
			,re: makeREToMatchBJUKParameter(ru.BJUKWords[e].abbreviation, 'u')
			,name: ru.BJUKWords[e].plural.nominativeCase
		})
	);
};

const makeRE_EN_BJUK_LIST = () => {	
	const keys = Object.keys(en.BJUKWords);
	 
	return keys.map(e => 
		({
			columnName: e
			,re: makeREToMatchBJUKParameter(en.BJUKWords[e].abbreviation)
			,name: en.BJUKWords[e].singular
		})
	);
};

const RE_RU_BJUK_LIST = makeRE_RU_BJUK_LIST();
const RE_EN_BJUK_LIST = makeRE_EN_BJUK_LIST();

const getRE_BJUK_LIST = languageCode => {
	switch (languageCode) {
 		case 'ru':
 			return RE_RU_BJUK_LIST;
 		case 'en':
 			return RE_EN_BJUK_LIST;
 		default:
			throw new Error(`New language detected: ${languageCode }. But there is no handler for this language.`);
	}
};
exports.getRE_BJUK_LIST = getRE_BJUK_LIST;
