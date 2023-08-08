const {MeiliSearch} = require(`meilisearch`);
require('dotenv').config()


const meiliSClient = new MeiliSearch({
	host:process.env.MEILISEARCH_HOST,
	apiKey: process.env.MEILISEARCH_API_KEY
});

meiliSClient.deleteIndex('foodDishNames').then(res=>console.log(res))
meiliSClient.deleteIndex('fooddDishNames').then(res=>console.log(res))
