const {MeiliSearch} = require(`meilisearch`);
require('dotenv').config()

const meiliSClient = new MeiliSearch({
	host:process.env.MEILISEARCH_HOST,
	apiKey: process.env.MEILISEARCH_API_KEY
})

meiliSClient.index('foodDishNames').search(
	'',
	{
		filter:'caloric_content IS NULL OR fat IS NULL OR carbohydrate IS NULL'
	}
).then(function () {
	console.log(JSON.stringify(arguments));
});
