const {MeiliSearch} = require(`meilisearch`);
require('dotenv').config()


const meiliSClient = new MeiliSearch({
	host:process.env.MEILISEARCH_HOST,
	apiKey: process.env.MEILISEARCH_API_KEY
})

//last id
meiliSClient.index('foodDishNames').search()
