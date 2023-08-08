
const {MeiliSearch} = require(`meilisearch`);
require('dotenv').config()


const meiliSClient = new MeiliSearch({
	host:process.env.MEILISEARCH_HOST,
	apiKey: process.env.MEILISEARCH_API_KEY
})

meiliSClient.index('foodDishNames').updateSearchableAttributes([
	'name__lang_code_ru'
]).then(res => console.log(res));
