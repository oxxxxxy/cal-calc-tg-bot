const {MeiliSearch} = require(`meilisearch`);
require('dotenv').config()

const meiliSClient = new MeiliSearch({
	host:process.env.MEILISEARCH_HOST,
	apiKey: process.env.MEILISEARCH_API_KEY
})

meiliSClient.index('foodDishNames').search(
	'',
	{
		filter:'food_items_id IN [23, 45, 55]'
	}
).then(function () {
	console.log(JSON.stringify(arguments));
});
