const pg = require(`pg`);
const {MeiliSearch} = require(`meilisearch`);
require('dotenv').config()


const delay = () => new Promise(r => setTimeout(r));


const postgreClient = new pg.Client({
	user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT
});

const meiliSClient = new MeiliSearch({
	host:process.env.MEILISEARCH_HOST,
	apiKey: process.env.MEILISEARCH_API_KEY
})

postgreClient.on('error', err => {

  console.error('PostgreSQL shit has happened!', err.stack);

  process.kill(process.pid, 'SIGINT');
});

const script = async () => {
try {
	await postgreClient.connect();
  console.log('PostgreSQL is connected.');
} catch (e) {
  throw e;
}

/*
id
name__lang_code_ru
food_items_id
dish_items_id
tg_user_id
created_by_project
//deleted //kamon, ya prosto budu ih iz MS udalyat'
*/
let end = false;
let offset = 0;
while(!end){
	let documents = [];

	let res = await postgreClient.query(`
select fdifm.id, fdifm.food_items_id, fdifm.dish_items_id,
	fi.name__lang_code_ru as finame, di.name__lang_code_ru as diname, 
	fi.tg_user_id as fitg, fi.created_by_project as ficreated,
	di.tg_user_id as ditg, di.created_by_project as dicreated
from 
	(select id, food_items_id, dish_items_id
	from fooddish_ids_for_meilisearch
	group by id, food_items_id, dish_items_id) fdifm
full outer join 
	(select id, name__lang_code_ru, tg_user_id, created_by_project
	from food_items
	where deleted is false
	group by id, name__lang_code_ru, tg_user_id, created_by_project) fi
on (fdifm.food_items_id = fi.id)
full outer join (
	select id, name__lang_code_ru, tg_user_id, created_by_project
	from dish_items
	where deleted is false
	group by id, name__lang_code_ru, tg_user_id, created_by_project) di
on (fdifm.dish_items_id = di.id)
order by fdifm.id
		offset ${200 * offset}
		limit 200
		;`);

	if(!res.rows.length){
		end = true;
	}
	res.rows.forEach(el =>{
		if (!el.finame && !el.diname){return;}
		let doc = {};
		doc.id = Number(el.id),
		doc.food_items_id = el.food_items_id ? Number(el.food_items_id): null;
		doc.dish_items_id = el.dish_items_id ? Number(el.dish_items_id): null;
		doc.name__lang_code_ru = el.finame?el.finame:el.diname;
		doc.tg_user_id = el.fitg?Number(el.fitg):(el.ditg?Number(el.ditg):null);
		doc.created_by_project = el.ficreated?el.ficreated:el.dicreated;
		documents.push(doc);
	});
	console.log(res.rows[0], documents[0]);

	const msres = await meiliSClient.index('foodDishNames').addDocuments(documents);
	console.log(msres);

	offset++;
	await delay();

}
}
script();
