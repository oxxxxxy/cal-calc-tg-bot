const {MeiliSearch} = require(`meilisearch`);
require('dotenv').config()

const meiliSClient = new MeiliSearch({
	host:process.env.MEILISEARCH_HOST,
	apiKey: process.env.MEILISEARCH_API_KEY
})

meiliSClient.index('foodDishNames')..then(function () {
	console.log(arguments);
});
