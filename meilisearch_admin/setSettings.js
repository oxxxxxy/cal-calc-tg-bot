
const {MeiliSearch} = require(`meilisearch`);
require('dotenv').config()


const meiliSClient = new MeiliSearch({
	host:process.env.MEILISEARCH_HOST,
	apiKey: process.env.MEILISEARCH_API_KEY
})

/* meiliSClient.index('foodDishNames').updateSearchableAttributes([
	'name__lang_code_ru'
]).then(res => console.log(res)); */

meiliSClient.index('foodDishNames').updateSettings({
	searchableAttributes : ['name__lang_code_ru'],
	sortableAttributes: ['id', 'tg_user_id', 'created_by_project', 'food_items_id','dish_items_id', 'protein', 'fat', 'caloric_content', 'carbohydrate'],
	filterableAttributes: ['id', 'tg_user_id', 'created_by_project', 'food_items_id','dish_items_id', 'protein', 'fat', 'caloric_content', 'carbohydrate']

}).then(res => console.log(res));
