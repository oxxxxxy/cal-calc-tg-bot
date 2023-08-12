const telegraf = require(`telegraf`);
const pg = require(`pg`);

const { MeiliSearch } = require(`meilisearch`);
//console.log(meiliS)


require('dotenv').config()

const inlineQuery = require(`./modules/inlineQuery.js`);
const HZ = require(`./modules/checkSender.js`);
const {
	objKeysToColumnStr,
	objKeysToColumn$IndexesStr,
	objKeysValuesToColumnValuesStr,
	getArrOfValuesFromObj,
	getStrOfColumnNamesAndTheirSettedValues

} = require(`./modules/queryUtils.js`);
const {
	COMMAND__CREATE_FOOD,
	COMMAND__CREATE_FOOD__YES,
	COMMAND__CREATE_FOOD__NO
} = require(`./modules/user_commands/create_food_funcs.js`);
// const { callback } = require('telegraf/typings/button.js');


const TG_USERS_LAST_ACTION_TIME = {};

const ISofU = [];
const NUTRIENTS = [];



const RE_RU_NUTRIENTS = [];
	/*
	(б|белок|белки)(\\s+|)(\\d+(\\s+|)(,|\\.)(\\s+|)\\d+|\\d+)(\\s+|)/u  //(г|мкг|мг|ккал|)/u,
	(к|ккал|кал|калорийность)(\\s+|)(\\d+(\\s+|)(,|\\.)(\\s+|)\\d+|\\d+)(\\s+|)/u  //(г|мкг|мг|ккал|)/u,
	(ж|жир|жиры)(\\s+|)(\\d+(\\s+|)(,|\\.)(\\s+|)\\d+|\\d+)(\\s+|)/u  //(г|мкг|мг|ккал|)/u,
	(у|угли|углевод|углеводы)(\\s+|)(\\d+(\\s+|)(,|\\.)(\\s+|)\\d+|\\d+)(\\s+|)(/u  //г|мкг|мг|ккал|)/u, 
	*/

const RE_RU_YES = /^д$/u;
const RE_RU_NO = /^н$/u;
const RE_RU_COMMAND__DELETE_LAST_ACTION = /^у$/u;
const RE_RU_COMMAND__CANCEL_LAST_ACTION = /^о$/u;

const RE_RU_COMMAND__CREATE_FOOD = /^(се\s+)((([а-яА-Яa-zA-Z0-9]+)(\s+|))+)\./u;
// /^(с|создать)(\s+|)(е|еду)\s+((([а-яА-Яa-zA-Z0-9]+)(\s+|)){5,})(\s+|)\((\s+|)((([а-яА-Яa-zA-Z0-9]+)(\s+|):(\s+|)(\d+(\s+|)(,|\.)(\s+|)\d+|\d+)(\s+|)(г|мкг|мг|ккал)(\s+|))+)\)$/u;
// ^(с|создать)(\s+|)(е|еду)\s+((([а-яА-Яa-zA-Z0-9]+)(\s+|)){5,})(\s+|)\((\s+|)([а-яА-Яa-zA-Z0-9\s]+)(\s+|)\)$
// ^(с|создать)(\s+|)(е|еду)\s+((([а-яА-Яa-zA-Z0-9]+)(\s+|)){5,})(\s+|)\(
const RE_RU_COMMAND__SHOW_CREATED_FOOD = /^псе$/u;
const RE_RU_COMMAND__DELETE_CREATED_FOOD_IDs = /^уе/u;//(([0-9]+(\s+|)|[0-9]+)+)$/u;

const RE_RU_COMMAND__CREATE_DISH = /^(сб\s+)((([а-яА-Яa-zA-Z0-9]+)(\s+|))+)$/u;
const RE_RU_COMMAND__EDIT_DISH = /^рб\s+([0-9]+)$/u;
	const RE__RESOLVE_FD_ID_WEIGHT_FROM_InlQuery = /(food|dish)([0-9]+)w(.*)/;
	const RE_RU_COMMAND__DELETE_INGREDIENTs_FROM_DISH = /^у\s+[0-9]+/u;
	const RE_RU_COMMAND__EDIT_INGREDIENT_WEIGHT_IN_DISH = /^ви\s+([0-9]+)\s+(\d+(\s+|)(,|\.)(\s+|)\d+|\d+)$/u;
	const RE_RU_COMMAND__DISH_TOTAL_WEIGHT = /^и\s+(\d+(\s+|)(,|\.)(\s+|)\d+|\d+)$/u;
/*  кнопками будут епта
	const RE_RU_COMMAND__SAVE_DISH = /^с$/u; 
	const RE_RU_COMMAND__CANCEL_CREATEEDIT_DISH = /^о$/u; */
const RE_RU_COMMAND__DELETE_CREATED_DISH_IDs = /^уб\s+/u; 
const RE_RU_COMMAND__SHOW_CREATED_DISHES = /^псб$/u;

const RE_RU_COMMAND__SHOW_EATEN_TODAY = /^пс$/u;
const RE_RU_COMMAND__SHOW_EATEN_YESTODAY = /^псв$/u;
const RE_RU_COMMAND__SHOW_EATEN_OF_ALL_TIME = /^псз$/u;
const RE_RU_COMMAND__SHOW_EATEN_IN_DAY = /^псд\s+/u;//BY DATE
const RE_RU_COMMAND__EDIT_WEIGHT_OF_EATEN_TODAY_Num = /^ив\s+/u;// num of eaten item, new weight
const RE_RU_COMMAND__EDIT_WEIGHT_OF_EATEN_YESTODAY_Num = /^ивв\s+/u;// num of eaten item, new weight
const RE_RU_COMMAND__EDIT_WEIGHT_OF_EATEN_IN_DAY_Num = /^ивд\s+/u;// num of eaten item, new weight
const RE_RU_COMMAND__DELETE_EATEN_TODAY_Num = /^ус\s+/u;
const RE_RU_COMMAND__DELETE_EATEN_YESTODAY_Num = /^усв\s+/u;
const RE_RU_COMMAND__DELETE_EATEN_IN_DAY_Num = /^усд\s+/u;

const RE_RU_COMMAND__SHOW_FOOD_BY_PARAMs = /^пе/u; //if no param prost eda proekta
const RE_RU_COMMAND__SHOW_DISH_BY_PARAMs = /^пб/u; //if no param prost blyuda proekta

const RE_RU_INLINE_COMMAND__WILL_EAT = /^([0-9]+)г\s+/u;//([0-9]+)\s+((([а-яА-Яa-zA-Z0-9]+)(\s+|)){2,})$/u; //в поиске выдавать с подсчитанным БЖУКом 
	const RE_RU_INLINE_COMMAND__ADD_INGREDIENT_TO_DISH = /^(\d+(\s+|)(,|\.)(\s+|)\d+|\d+)\s+(((б|ж|у|к)(\s+|)(>|<)(\s+|)(\d+))|)/u;
const RE_RU_INLINE_COMMAND__LOOK_AT_FOOD_OR_DISH = /^п\s+/u;// фильтры: еда, блюда проекта/юзера/других пользователей; бжук<>=num; name. e b drugih mojno dobavlyat'



const RE_RU_COMMAND__SET_DAY_BJUK = /^/u;
const RE_RU_COMMAND__SET_LOCAL_TIME = /^([0-1][0-9]|[2][0-3])(\s+|):(\s+|)([0-5][0-9])$/u;

	

// /help 
// /settings



const RE_RU_COMMAND__CREATE_AIM = /^(с|создать)(\s+|)(ц|цель)(\s+|)((п|повторять)(\s+|)\((\s+|)(([0-9]+)(\s+|)д(\s+|)\((\s+|)(([а-яА-Я]+)(\s+|):(\s+|)(([0-9]+)(\s+|)(,|.|)(\s+|)([0-9]+|)(\s+|)(г|%|к))(\s+|)(,|)(\s+|))+(\s+|)\)(\s+|)(,|)(\s+|))+\)(\s+|)((вт|в(\s+|)течении)(\s+|)([0-9]+)(\s+|)(д|м)|)|(([0-9]+)(\s+|)д(\s+|)\((\s+|)(([а-яА-Я]+)(\s+|):(\s+|)(([0-9]+)(\s+|)(,|.|)(\s+|)([0-9]+|)(\s+|)(г|%|к))(\s+|)(,|)(\s+|))+(\s+|)\)(\s+|)(,|)(\s+|))+)$/u; // не больше 365 дней или 12 месяцев,
const RE_RU_COMMAND__COMPLETE_AIM = /^(з|завершить)(\s+|)(ц|цель)(\s+|)([0-9]+)$/u;
const RE_RU_COMMAND__SHOW_AIMS = /^(п|показать)(\s+|)(ц|цели)(\s+|)((а|активные)|(з|завершенные)|(у|удаленные)|)$/u;//???? кнопки
const RE_RU_COMMAND__DELETE_AIM = /^(у|удалить)(\s+|)(ц|цель)$/u; //only active

const RE_RU_COMMAND__ADD_WEIGHTING = /^(в|вес)(\s+|)([0-9]+|[0-9]+(\s+|)(,|.)(\s+|)[0-9]+)$/u;
const RE_RU_COMMAND__DELETE_LAST_ADDED_WEIGHTING = /^(у|удалить)(\s+|)(в|вес)$/u;


const RE_RU_BOT_AND_INLINE_COMMAND__GET_STATS = /^(п|показать)(\s+|)(ст|статистику)(\s+|)(\s+|)((в|вес)|(п|потребление)|(ц|цели)|)(\s+|)((([0-9]+)(\s+|)(д|м|г))|(за(\s+|)вс(ё|е)(\s+|)время)|)$/u; // body or eaten food or aims //ras v chas
const RE_RU_BOT_AND_INLINE_COMMAND__SHOW_EATEN = /^(п|показать)(\s+|)(с|съеденное)()$/u;//??? tok esli v chati gde ne dobavlen bot

const RE_RU_INLINE_COMMAND__OFFER_RANDOM_FOOD = /^/u; //????? //validate users to NOT reserve inline commands
const RE_RU_INLINE_COMMAND__SHARE_CREATED_FOOD_OR_DISH = /^(под|поделиться)\s+((е|едой)|(б|блюдом))\s+((([а-яА-Яa-zA-Z0-9]+)(\s+|)){2,})$/u;


/*
*/

const bot = new telegraf.Telegraf(process.env.BOT_TOKEN_edac);

const DB_CLIENT = new pg.Client({
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
const MSDB = meiliSClient.index('foodDishNames');


const APP_STATE = {};

DB_CLIENT.on('error', err => {
	APP_STATE.isDBdead = true;

  console.error('PostgreSQL shit has happened!', err.stack);

  process.kill(process.pid, 'SIGINT');
})

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const app = async () => {

try {
	await DB_CLIENT.connect();
  console.log('PostgreSQL is connected.');
} catch (e) {
  throw e;
}

ISofU.ids = {};
ISofU.lang_codes_ru = {};
(await DB_CLIENT.query(`
	SELECT lang_code_ru, lang_code_en, id
	FROM terms_and_their_translations
	WHERE internal_definition_number IN (1,2);
`)).rows.forEach(i => {
	ISofU.push(i);
	ISofU.ids[i.id] = i.lang_code_ru;
	ISofU.lang_codes_ru[i.lang_code_ru.toLowerCase()] = i.id;
});

(await DB_CLIENT.query(`
	SELECT lang_code_ru, lang_code_en, regexp_list_ru, internal_definition_number
	FROM terms_and_their_translations
	WHERE internal_definition_number IN (3, 4);
`)).rows.forEach(i =>
	NUTRIENTS.push(i));

NUTRIENTS.forEach(i => {
		let word = i.regexp_list_ru.join('|');
		
		RE_RU_NUTRIENTS.push(
			new RegExp(`(${word})(\\s+|)(\\d+(\\s+|)(,|\\.)(\\s+|)\\d+|\\d+)(\\s+|)`, 'u') //(г|мкг|мг|ккал|)`, 'u')
		)
	

		//en version


	}
);

//console.log(NUTRIENTS, RE_RU_NUTRIENTS)

const cleanFromOldUserCommands = async () => {
	while (true) {
		await DB_CLIENT.query(`
			UPDATE telegram_user_commands tuc
			SET completed = true,
			time_is_up = true,
			data = '{}',
			life_time_ending = NULL
			FROM (
				SELECT *
				FROM telegram_user_commands
				WHERE completed != TRUE
					AND life_time_ending < '${(new Date()).toISOString()}'
			) as tuc2
			WHERE tuc2.id = tuc.id;
		`);
		
		await delay(30000);
	}
};

const cleanTGUsersLastActionTime = async () => {
	while (true) {
		const date = Date.now();
		const keys = Object.keys(TG_USERS_LAST_ACTION_TIME);

		keys.forEach(k => {
			if (date - TG_USERS_LAST_ACTION_TIME[k] > 5555) {
				delete TG_USERS_LAST_ACTION_TIME[k];
			}
		});

		await delay(5555);
	}
};

const cleanLimitationOfUCFI = async () => {
	while (true) {
		const date = (new Date(Date.now() - 1000*60*60*24)).toISOString();
	
		await DB_CLIENT.query(`
			UPDATE registered_users
			SET first_user_created_fidi_time = null,
			limit_count_of_user_created_fidi = null
			WHERE first_user_created_fidi_time < '${date}'
		;`);

		await delay(30000);
	}
}

const cleanTGInlineKeyboards = async () => {
	while (true) {
		const res = await DB_CLIENT.query(`
			SELECT *
			FROM telegram_inline_keyboards
			WHERE	inline_keyboard_deleted = FALSE
			AND life_time_ending < '${(new Date()).toISOString()}'
			limit 1000
		;`);

		// const done = [];
		res.rows.forEach(async e => {
			try {
				await bot.telegram.deleteMessage(e.tg_user_id, e.message_id);
				//delete or replace inline_keyboard
				// done.push(e.id);

				await DB_CLIENT.query(`
					UPDATE telegram_inline_keyboards
					SET inline_keyboard_deleted = true
					WHERE id = ${e.id}
				;`);
			} catch (e) {
				console.log(e);
			}
		});

		await delay(5000);
	}
};

cleanFromOldUserCommands();
cleanTGUsersLastActionTime();
cleanLimitationOfUCFI();
// cleanTGInlineKeyboards();


const cleanArrFromRecurringItems = arr => {
	for ( let i = 0; i < arr.length; i++) {					
		for ( let k = i + 1; k < arr.length; k++) {
			if (arr[i] == arr[k]) {
				arr.splice(k, 1);
				k--;
			}
		}
	}
	return arr;
}

const execAndGetAllREResults = (str, re) => {
	if (!re.global) {
		throw `RegExp has not global flag.`;
	}
	const result = [];
	let arr;
	while ((arr = re.exec(str)) !== null) {
		result.push(arr[0]);
	}
	return result;
}




bot.use(async (ctx, next) => {
	console.log(
		`____use____________start`,
		JSON.stringify(ctx.update),
		// ctx,
		`____use____________end`,
	);


	let from;
	let date;

	if (!!ctx.update.message) {
		from = ctx.update.message.from;
		date = ctx.update.message.date;
		console.log(`message`);
		/*
			{"update_id":517934972,"message":{"message_id":2363,"from":{"id":2147423284,"is_bot":false,"first_name":"АРЧ","language_code":"en"},"chat":{"id":2147423284,"first_name":"АРЧ","type":"private"},"date":1691587952,"text":"df","via_bot":{"id":5467847506,"is_bot":true,"first_name":"Калькулятор Калорий","username":"edac_bot"}}}
			{"update_id":517934973,"message":{"message_id":110,"from":{"id":1087968824,"is_bot":true,"first_name":"Group","username":"GroupAnonymousBot"},"sender_chat":{"id":-1001317760469,"title":"food dairy chat","username":"food_dairy_chat","type":"supergroup"},"chat":{"id":-1001317760469,"title":"food dairy chat","username":"food_dairy_chat","type":"supergroup"},"date":1691588103,"text":"df"}}
			{"update_id":517935006,"message":{"message_id":2366,"from":{"id":2147423284,"is_bot":false,"first_name":"АРЧ","language_code":"en"},"chat":{"id":2147423284,"first_name":"АРЧ","type":"private"},"date":1691597251,"forward_from_chat":{"id":-1001317760469,"title":"food dairy chat","username":"food_dairy_chat","type":"supergroup"},"forward_date":1691588103,"text":"df"}}
			{"update_id":517935007,"message":{"message_id":2367,"from":{"id":2147423284,"is_bot":false,"first_name":"АРЧ","language_code":"en"},"chat":{"id":2147423284,"first_name":"АРЧ","type":"private"},"date":1691597251,"forward_from_chat":{"id":-1001317760469,"title":"food dairy chat","username":"food_dairy_chat","type":"supergroup"},"forward_date":1691591952,"text":"Вы в процессе создания блюда.","via_bot":{"id":5467847506,"is_bot":true,"first_name":"Калькулятор Калорий","username":"edac_bot"}}} 

		 */
	} else if (!!ctx.update.edited_message) {// ??? check them or not?
		from = ctx.update.edited_message.from;
		date = ctx.update.edited_message.date;
		console.log(`edited_message`);
		/* 
			 {"update_id":517934966,"edited_message":{"message_id":109,"from":{"id":1087968824,"is_bot":true,"first_name":"Group","username":"GroupAnonymousBot"},"sender_chat":{"id":-1001317760469,"title":"food dairy chat","username":"food_dairy_chat","type":"supergroup"},"chat":{"id":-1001317760469,"title":"food dairy chat","username":"food_dairy_chat","type":"supergroup"},"date":1691586250,"edit_date":1691586432,"text":"fdfsdaf"}}
		 {"update_id":517935004,"message":{"message_id":111,"from":{"id":1087968824,"is_bot":true,"first_name":"Group","username":"GroupAnonymousBot"},"sender_chat":{"id":-1001317760469,"title":"food dairy chat","username":"food_dairy_chat","type":"supergroup"},"chat":{"id":-1001317760469,"title":"food dairy chat","username":"food_dairy_chat","type":"supergroup"},"date":1691591952,"text":"Вы в процессе создания блюда.","via_bot":{"id":5467847506,"is_bot":true,"first_name":"Калькулятор Калорий","username":"edac_bot"}}}

		 */
	} else if (!!ctx.update.inline_query) {
		from = ctx.update.inline_query.from;
		// date = ctx.update.inline_query.date; // empty update
		console.log(`inline_query`);
		/*
		 {"update_id":517935003,"inline_query":{"id":"9223112777810632953","from":{"id":2147423284,"is_bot":false,"first_name":"АРЧ","language_code":"en"},"chat_type":"supergroup","query":"","offset":""}}
		 {"update_id":517934998,"inline_query":{"id":"9223112778541942686","from":{"id":2147423284,"is_bot":false,"first_name":"АРЧ","language_code":"en"},"chat_type":"sender","query":"","offset":""}}

		 */
	} else if (!!ctx.update.chosen_inline_result) {
		from = ctx.update.chosen_inline_result.from;
		date = ctx.update.chosen_inline_result.date;
		console.log(`chosen_inline_result`);
	} else if (!!ctx.update.callback_query) {
		from = ctx.update.callback_query.from;
		date = ctx.update.callback_query.date;
		console.log(`callback_query`);
	} else if (!!ctx.update.shipping_query) {
		from = ctx.update.shipping_query.from;        
		date = ctx.update.shipping_query.date;
		console.log(`shipping_query`);
	} else if (!!ctx.update.pre_checkout_query) {
		from = ctx.update.pre_checkout_query.from;
		date = ctx.update.pre_checkout_query.date;
		console.log(`pre_chechout_query`);
	} else if (!!ctx.update.poll) {
		from = ctx.update.poll.from;
		date = ctx.update.poll.date;
		console.log(`poll`);
	} else if (!!ctx.update.poll_answer) {
		from = ctx.update.poll_answer.from;
		date = ctx.update.poll_answer.date;
		console.log(`poll_answer`);

	} else if (!!ctx.update.my_chat_member) {
		from = ctx.update.my_chat_member.from;
		date = ctx.update.my_chat_member.date;
		console.log(`my_chat_member`);
		/*
		 {"update_id":517934962,"my_chat_member":{"chat":{"id":-1001317760469,"title":"food dairy chat","username":"food_dairy_chat","type":"supergroup"},"from":{"id":2147423284,"is_bot":false,"first_name":"АРЧ","language_code":"en"},"date":1691586237,"old_chat_member":{"user":{"id":5467847506,"is_bot":true,"first_name":"Калькулятор Калорий","username":"edac_bot"},"status":"member"},"new_chat_member":{"user":{"id":5467847506,"is_bot":true,"first_name":"Калькулятор Калорий","username":"edac_bot"},"status":"administrator","can_be_edited":false,"can_manage_chat":true,"can_change_info":true,"can_delete_messages":true,"can_invite_users":true,"can_restrict_members":true,"can_pin_messages":true,"can_manage_topics":false,"can_promote_members":false,"can_manage_video_chats":true,"is_anonymous":false,"can_manage_voice_chats":true}}}
		 */
		//create table
	} else if (!!ctx.update.chat_member) {
		from = ctx.update.chat_member.from;
		date = ctx.update.chat_member.date;
		console.log(`chat_member`);
	} else if (!!ctx.update.chat_join_request) {
		from = ctx.update.chat_join_request.from;
		date = ctx.update.chat_join_request.date;
		console.log(`chat_join_request`);
		//create table
	} else if (!!ctx.update.channel_post) {
		from = ctx.update.channel_post.from;
		date = ctx.update.channel_post.date;
		console.log(`channel_post`);
		return; //create table???
	} else if (!!ctx.update.edited_channel_post) {
		from = ctx.update.edited_channel_post.from;
		date = ctx.update.edited_channel_post.date;
		console.log(`editted_channel_post`);
		return;
	}
	
	if(!date){
		date = Date.now();
	} else {
		date * 1000;
	}

	//antispam validaciya
	if (!TG_USERS_LAST_ACTION_TIME[`${from.id}`] || date - TG_USERS_LAST_ACTION_TIME[`${from.id}`][0] > 1000) {
		TG_USERS_LAST_ACTION_TIME[`${from.id}`] = [date];
	} else if (date - TG_USERS_LAST_ACTION_TIME[`${from.id}`][0] >= 1000 && TG_USERS_LAST_ACTION_TIME[`${from.id}`].length < 3) {
		TG_USERS_LAST_ACTION_TIME[`${from.id}`].push(date);
	} else {
		if (!(ctx.update?.message?.via_bot?.id == 5467847506 && ctx.update.message.chat.id == ctx.update.message.from.id)) { // if not adding ingredient in dish
			return;
		}
	}


	HZ.checkTelegramUserExistentAndRegistryHimIfNotExists(DB_CLIENT, from.id, from.is_bot);

	if (process.env.TRACKMODE) {
		HZ.trackTelegramUserAccountDataChanges(DB_CLIENT, from);
	}

	const reqDate = date;

 if (!from.is_bot){
		let row = {};
		row.tg_user_id = from.id;
		row.log = JSON.stringify(ctx.update);
		row.creation_date = new Date(reqDate).toISOString();
		
		let paramQuery = {};
		paramQuery.text = `
			INSERT INTO telegram_user_log
			(${objKeysToColumnStr(row)})
			VALUES
			(${objKeysToColumn$IndexesStr(row)})
		;`;
		paramQuery.values = getArrOfValuesFromObj(row);
		
		await DB_CLIENT.query(paramQuery);
	} 

	next();
});

bot.on(`message`, async ctx => {
	 console.log(
		`________MESSAGE________start`,
		//Object.keys( ctx),
		JSON.stringify(ctx.update),
		//ctx,
		`________MESSAGE________end`
	) 

	if(
		// ctx.update.message.from.id != 1087968824 &&
		ctx.update.message.from.id != 2147423284) {
		// ctx.reply(`Я нахожусь в разработке. Посмотрите новости здесь @food_dairy. Напишите сюда @food_dairy_chat.\nI'm in development. See news here @food_dairy. Text here @food_dairy_chat.`);
		return;
	}


	if(ctx.update.message.from.is_bot 
		&& ctx.update.message.from.id != 1087968824
	) {
		// ctx.reply(`Старина, съеби нахуй.`);

		return;
	}

	if (!!ctx.update.via_bot && ctx.update.via_bot.id == 5467847506) {
		
	}

	// console.log(ctx.update)
	// if (ctx.update.message.chat.type == `private`) {

		const userInfo = await HZ.getTelegramUserInfo(DB_CLIENT, ctx.update.message.from.id);
		const userLastCommand = (await DB_CLIENT.query(`
			SELECT *
			FROM telegram_user_sended_commands
			WHERE tg_user_id = ${userInfo.tg_user_id}
			ORDER BY id DESC
			limit 1;
		`)).rows[0];

			console.log(
		userInfo,
			userLastCommand
	);
		

		const reqDate = ctx.update.message.date * 1000;	
		let re_result;
	
		if(!ctx.update.message.text){
			return;//
		}

		let text = ctx.update.message.text.replaceAll(/\s+/g, ` `).trim();
	
		if(!userLastCommand.confirmation){
	
			if (Array.isArray(re_result = text.toLowerCase().match(RE_RU_COMMAND__DELETE_LAST_ACTION))) {

				if (!userLastCommand.can_it_be_removed){
					ctx.reply(`Прости, не знаю, что удалить... Т_Т`);
					return;
				}
				
				if (userLastCommand.command == `CREATE_FOOD`) {
					//deleted true food_items
					await DB_CLIENT.query(`
						UPDATE food_items
						SET deleted = true
						WHERE	id IN (${userLastCommand.data.food_items_ids.join()})
					;`);

					// delete doc with the same food_items_id from meilisearch
					await MSDB.deleteDocuments({
						filter:`food_items_id IN [${userLastCommand.data.food_items_ids.join()}]`
					});

					//perepisat' na telegram_users
					//registered_users available_count_of_user_created_fi - 1 //add check for all users
					userInfo.available_count_of_user_created_fi = Number(userInfo.available_count_of_user_created_fi) - 1;
					await DB_CLIENT.query(`
						UPDATE registered_users
						SET available_count_of_user_created_fi = ${userInfo.available_count_of_user_created_fi}
						WHERE id = ${userInfo.r_user_id};
					`);

					//telegram_user_sended_commands add otmenu
					const row = {};
					row.tg_user_id = userInfo.tg_user_id;
					row.creation_date = new Date(reqDate).toISOString();
					row.command = `DELETE_FOOD`;
					row.can_it_be_canceled = true;

					row.data = {};
					row.data.food_items_ids = userLastCommand.data.food_items_ids;

					row.data = JSON.stringify(row.data);
	
					const paramQuery = {};
					paramQuery.text = `
						INSERT INTO telegram_user_sended_commands
						(${objKeysToColumnStr(row)})
						VALUES
						(${objKeysToColumn$IndexesStr(row)});`;
					paramQuery.values = getArrOfValuesFromObj(row);
					await DB_CLIENT.query(paramQuery);
				
					//predlojit' otmenu
					ctx.reply(`Удалено. Отменить? *"о/отмена"*.\n\nМем на тему удаления.`, {parse_mode:`Markdown`})
				} else if (userLastCommand.command) {
					console.log(`code me`)
					ctx.reply(`code me`)
				}



				/* const extraParameters = telegraf.Markup.inlineKeyboard(
					// [[telegraf.Markup.button.callback(`12`,`123`)]]
					[]
						// [[telegraf.Markup.button.callback(`1`, `iugblu`), telegraf.Markup.button.callback(`1<<`, `iugblu`)]]
				);

				extraParameters.parse_mode = 'HTML';
				extraParameters.protect_content = true;
				// extraParameters.allow_sending_without_reply = true;
				// extraParameters.reply_to_message_id = ctx.update.message.message_id;
				
				 const response = await bot.telegram.editMessageText(
					ctx.update.message.chat.id,
					583,
					``,
					`asdasdasd`,
					extraParameters
				); 

				const response = await bot.telegram.editMessageReplyMarkup(
					ctx.update.message.chat.id,
					583,
					``,
					extraParameters
				);

				console.log(
					extraParameters,
					response
				); */

			} else if (Array.isArray(re_result = text.toLowerCase().match(RE_RU_COMMAND__CANCEL_LAST_ACTION))) {
				console.log(re_result);		

				if (!userLastCommand.can_it_be_canceled){
					ctx.reply(`Прости, не знаю, что отменить... Т_Т`);
					return;
				}
				
				if (userLastCommand.command == `DELETE_FOOD`) {
					//cancel deleted true food_items
					const res = await DB_CLIENT.query(`
						WITH updated AS (
						  UPDATE food_items
						  SET deleted = false
						  WHERE id IN (${userLastCommand.data.food_items_ids.join()})
						  RETURNING id, name__lang_code_ru, tg_user_id, protein, carbohydrate, fat, caloric_content)
						SELECT fdifm.id, fdifm.food_items_id, upd.name__lang_code_ru, upd.tg_user_id, upd.protein, upd.carbohydrate, upd.fat, upd.caloric_content
						FROM (
							SELECT id, food_items_id, dish_items_id
							FROM fooddish_ids_for_meilisearch
							WHERE food_items_id IN (SELECT id FROM updated)
							GROUP BY id, food_items_id, dish_items_id) fdifm
						full outer join
							(select id, name__lang_code_ru, tg_user_id, protein, carbohydrate, fat, caloric_content
							from updated
							group by id, name__lang_code_ru, tg_user_id, protein, carbohydrate, fat, caloric_content) upd
						ON (fdifm.food_items_id = upd.id)
					;`);
					//add doc to MSDB
					let documents = [];
					res.rows.forEach(el =>{
						let doc = {};
						doc.id = Number(el.id),
						doc.food_items_id = Number(el.food_items_id);
						doc.dish_items_id = null;
						doc.name__lang_code_ru = el.name__lang_code_ru;
						doc.tg_user_id = Number(el.tg_user_id);
						doc.created_by_project = null;
						doc.protein = Number(el.protein);
						doc.fat = Number(el.fat);
						doc.carbohydrate = Number(el.carbohydrate);
						doc.caloric_content = Number(el.caloric_content);
						documents.push(doc);
					});
					await MSDB.addDocuments(documents);

					//registered_users available_count_of_user_created_fi - 1 //add check for all users					
					userInfo.available_count_of_user_created_fi = Number(userInfo.available_count_of_user_created_fi) + 1;

					await DB_CLIENT.query(`
						UPDATE registered_users
						SET available_count_of_user_created_fi = ${userInfo.available_count_of_user_created_fi}
						WHERE id = ${userInfo.r_user_id};
					`);

					//telegram_user_sended_commands add otmenu
					const row = {};
					row.tg_user_id = userInfo.tg_user_id;
					row.creation_date = new Date(reqDate).toISOString();
					row.command = `CANCEL__DELETE_FOOD`;

					row.data = {};
					row.data.food_items_ids = userLastCommand.data.food_items_ids;

					row.data = JSON.stringify(row.data);
	
					const paramQuery = {};
					paramQuery.text = `
						INSERT INTO telegram_user_sended_commands
						(${objKeysToColumnStr(row)})
						VALUES
						(${objKeysToColumn$IndexesStr(row)});`;
					paramQuery.values = getArrOfValuesFromObj(row);
					await DB_CLIENT.query(paramQuery);
				
					//predlojit' otmenu
					ctx.reply(`Удаление отменено\\.\n\n_Галя, у нас отмена\\.\\.\\._`, {parse_mode:`MarkdownV2`})
				} else if (userLastCommand.command) {
					console.log(`code me`)
					ctx.reply(`code me`)
				}



			} else if (Array.isArray(re_result = text.toLowerCase().match(RE_RU_BOT_AND_INLINE_COMMAND__SHOW_EATEN))) {
				console.log(re_result);			
				console.log(re_result);			
				console.log(re_result);			
			} else if (Array.isArray(re_result = text.toLowerCase().match(RE_RU_COMMAND__CREATE_FOOD))) {
				// console.log(re_result, `RE_RU_COMMAND__CREATE_FOOD`);
				
				// add text second param

				let db = DB_CLIENT;

				let limit_count_of_user_created_fidi = 100;
				if (!userInfo.privilege_type && userInfo.limit_count_of_user_created_fidi >= limit_count_of_user_created_fidi) { //think about it...
					const limitResp =`Вы не можете создавать еду или блюда больше ${limit_count_of_user_created_fidi} раз за 24ч.`;
					ctx.reply(limitResp);
					return;
					/* {
						result: false,
						cause: `limit_count_of_user_created_fidi`,
						message: `Вы не можете создавать еду больше ${limit_count_of_user_created_fidi} раз за 24ч.`
					}; */
				}

				let askingConfirmationResponse = `*Чпок, и готооова...*`;
				
				const foodName = text.slice(re_result[1].length-1, re_result[2].length + re_result[1].length).slice(0, 128).trim();//(re_result[2].trim()).slice(0, 128); // poisk odinakovih imen, otpravka i ojidanie podtverjdeniya
				// console.log( foodName, re_result);return;
				if (foodName.length < 4) {
					ctx.reply(`Название еды должно иметь хотя бы 4 символа.`)
				}
				askingConfirmationResponse += `\n\n\`\`\` ${foodName}. `;

				const foodNutrientMatches = [];

				let nutrientPart = re_result.input.slice(re_result[2].length);
				// console.log(re_result, text)

				RE_RU_NUTRIENTS.forEach((el, i) => {
					const match = nutrientPart.match(el);
					
					if (!Array.isArray(match)){
						const obj = NUTRIENTS[i];
						obj.nutrientName = NUTRIENTS[i].lang_code_en.replaceAll(/\s+/g, `_`);
						obj[obj.nutrientName] = 0;
						foodNutrientMatches.push(obj);
						return;
					}

					const obj = NUTRIENTS[i];
					obj.nutrientName = NUTRIENTS[i].lang_code_en.replaceAll(/\s+/g, `_`);
					let strNutrientValue = match[3].replace(`,`, `.`);
					let dotMatch = strNutrientValue.match(/\./);
					if (Array.isArray(dotMatch)) {
						strNutrientValue = strNutrientValue.slice(0, dotMatch.index + 3);
					}
					obj[obj.nutrientName] = Number(strNutrientValue);
					foodNutrientMatches.push(obj);
				});	

				let noNutrientsResp = `Нутриентов не обнаружено. T_T`;
				if (foodNutrientMatches.length == 0){ //podumat' o zamene, prosloyke i td...

					ctx.reply(noNutrientsResp);

					return;
				}



				let cal = foodNutrientMatches.find(el => el.nutrientName == `caloric_content`);
				if(!cal.caloric_content){
					let nutrient;

					cal.caloric_content += (nutrient = foodNutrientMatches.find(el => el.nutrientName == `fat`)) ? nutrient.fat * 9 : 0;
					cal.caloric_content += (nutrient = foodNutrientMatches.find(el => el.nutrientName == `carbohydrate`)) ? nutrient.carbohydrate * 4 : 0;
					cal.caloric_content += (nutrient = foodNutrientMatches.find(el => el.nutrientName == `protein`)) ? nutrient.protein * 4 : 0;	
				}



				let nutrientValueMistakeResp = ``;
				let sumOfBJU = 0;
				foodNutrientMatches.forEach(el => {
					if (el.internal_definition_number == 4 && el.caloric_content > 900) {// caloric_content
						nutrientValueMistakeResp += `\n${el.lang_code_ru.slice(0,1).toUpperCase() + el.lang_code_ru.slice(1)} не может превышать 900 кКал.`;
					}
					if (el.internal_definition_number == 3 && el[el.nutrientName] > 100) { //БЖУ
						nutrientValueMistakeResp += `\n${el.lang_code_ru.slice(0,1).toUpperCase() + el.lang_code_ru.slice(1)} не могут превышать 100 грамм.`;
					}
					if (el.internal_definition_number == 3) { //БЖУ sum
						sumOfBJU += el[el.nutrientName];
					}

				});

				if (Math.round(sumOfBJU) > 100) {
					nutrientValueMistakeResp += `\nСумма БЖУ не может быть больше 100 грамм.`;
				}
				
				if (nutrientValueMistakeResp) {//think about it
					ctx.reply(nutrientValueMistakeResp);
					return;
				}


				foodNutrientMatches.forEach((el, i) => {
					foodNutrientMatches[i][el.nutrientName] = Number(Number(el[el.nutrientName]).toFixed(1));
				});
				
				foodNutrientMatches.forEach(el => {
					askingConfirmationResponse += `\n${el.lang_code_ru} ${el[el.nutrientName]}`;
					if (el.caloric_content){
						askingConfirmationResponse += ` ккал`;
					} else {
						askingConfirmationResponse += ` г`;
					}
				});


				if (typeof userInfo.limit_count_of_user_created_fidi == `string`) {
					userInfo.limit_count_of_user_created_fidi = Number(userInfo.limit_count_of_user_created_fidi);
				} else {
					userInfo.limit_count_of_user_created_fidi = 0;
				}

				const doc = {};
				let row = {};
				row.creation_date = new Date(reqDate).toISOString();
				row.tg_user_id = ctx.update.message.from.id;
				row.view_json = {};
				row.name__lang_code_ru = foodName;

				foodNutrientMatches.forEach(e => {
					row.view_json[e.nutrientName] = e[e.nutrientName];
					row[e.nutrientName] = e[e.nutrientName];
					doc[e.nutrientName] = e[e.nutrientName];
				});

				row.view_json = JSON.stringify(row.view_json);

				userInfo.count_of_user_created_fi = userInfo.count_of_user_created_fi ? Number(userInfo.count_of_user_created_fi) + 1 : 1;
				row.fi_id_for_user = userInfo.count_of_user_created_fi;

				askingConfirmationResponse += `\n\`\`\`\nЕда ID:\`\`\`${userInfo.count_of_user_created_fi}\`\`\`\n\nОшибка? Отправьте *"у/удалить"*.`;

				let paramQuery = {};
				paramQuery.text = `
					WITH foit AS(
						INSERT INTO food_items
						(${objKeysToColumnStr(row)})
						VALUES
						(${objKeysToColumn$IndexesStr(row)})
						RETURNING id
					),
					fdifmsear AS (
						INSERT INTO fooddish_ids_for_meilisearch
						(food_items_id)
						SELECT id
						FROM foit
						RETURNING id, food_items_id
					)
					SELECT fdifm.id as fdifmid, fdifm.food_items_id as id
					FROM ( 
						SELECT id, food_items_id
						FROM fdifmsear
						GROUP BY id, food_items_id
					) fdifm
				;`;
				paramQuery.values = getArrOfValuesFromObj(row);
				const foodItemsRes = await db.query(paramQuery);
				console.log(`TEST ME CREATE_FOOD MeiliSearch`);
				//add doc to MSDB
				doc.id = Number(foodItemsRes.rows[0].fdifmid),
				doc.food_items_id = Number(foodItemsRes.rows[0].id);
				doc.dish_items_id = null;
				doc.name__lang_code_ru = row.name__lang_code_ru;
				doc.tg_user_id = row.tg_user_id;
				doc.created_by_project = null;

				await MSDB.addDocuments([doc]);


				row = {};
				row.tg_user_id = userInfo.tg_user_id;
				row.creation_date = new Date(reqDate).toISOString();
				row.command = `CREATE_FOOD`;
				row.can_it_be_removed = true;

				row.data = {};
				row.data.food_items_ids = [foodItemsRes.rows[0].id];

				row.data = JSON.stringify(row.data);
	
				paramQuery = {};
				paramQuery.text = `
					INSERT INTO telegram_user_sended_commands
					(${objKeysToColumnStr(row)})
					VALUES
					(${objKeysToColumn$IndexesStr(row)});`;
				paramQuery.values = getArrOfValuesFromObj(row);
				await db.query(paramQuery);




				let setFUCFIDITime;
				let setLimitCOfFIDI;

				if (!userInfo.privilege_type) {
					if (!userInfo.first_user_created_fidi_time) {
						setFUCFIDITime = `first_user_created_fidi_time = '${fi_creation_date}'`;
						userInfo.limit_count_of_user_created_fidi = 0;
					}
					setLimitCOfFIDI = `limit_count_of_user_created_fidi= ${Number(userInfo.limit_count_of_user_created_fidi) + 1}`;
				}
				
				if (!userInfo.available_count_of_user_created_fi) {
					userInfo.available_count_of_user_created_fi = 1;
				} else {
					userInfo.available_count_of_user_created_fi = Number(userInfo.available_count_of_user_created_fi) + 1;
				}

				await db.query(`
					UPDATE registered_users
					SET available_count_of_user_created_fi = ${userInfo.available_count_of_user_created_fi},
					count_of_user_created_fi = ${userInfo.count_of_user_created_fi}
					${setLimitCOfFIDI ? ', ' + setLimitCOfFIDI : ``}
					${setFUCFIDITime ? ', ' + setFUCFIDITime : ``}
					WHERE id = ${userInfo.r_user_id};
				`);
	


				ctx.reply(askingConfirmationResponse, { parse_mode: 'Markdown', allow_sending_without_reply: true });

			} else if (Array.isArray(re_result = text.toLowerCase().match(RE_RU_COMMAND__CREATE_DISH))) {
				console.log(re_result);			
				
				let limit_count_of_user_created_fidi = 100;
				if (!userInfo.privilege_type && userInfo.limit_count_of_user_created_fidi >= limit_count_of_user_created_fidi) { //think about it...
					const limitResp =`Вы не можете создавать еду или блюда больше ${limit_count_of_user_created_fidi} раз за 24ч.`;
					ctx.reply(limitResp);
					return;
				}

				const creation_date = new Date(reqDate).toISOString();
				let askingConfirmationResponse = `<b>__ID Название блюда</b>\n`;

				const dishName = re_result[2].slice(0, 128).trim();//(re_result[2].trim()).slice(0, 128); // poisk odinakovih imen, otpravka i ojidanie podtverjdeniya

				if (dishName.length < 4) {
					ctx.reply(`Название еды должно иметь хотя бы 4 символа.`)
				}
				
				const count_of_user_created_di = Number(userInfo.count_of_user_created_di) + 1;
				askingConfirmationResponse += `<code>${count_of_user_created_di}</code> ${dishName}\n`;

				let dishSheetHead = `\n<u>|<b>№_|Белки__|Жиры___|Углевод|Калории|Вес(грамм) <i>Ингредиент и его название</i></b></u>`;

				const makeDishNumForSheetLine = num => {
					const maxLength = 2;
					const str = String(num);
					let result = ``;

					for (let i = 0, diff = maxLength - str.length; i < diff; i++) {
						result += `_`;
					}
					result += `<code>${str}</code>`;

					return result;
				};
				const addCharBeforeValue = (value, maxLength, charS) => {
					let str = Number(value).toFixed(1);
					
					let result = ``;

					for (let i = 0, diff = maxLength - str.length; i < diff; i++) {
						result += charS;
					}
					result += str;

					return result;
				};
				let dishSheetFooter = `\n<u>|<b>И__|Б:${
					addCharBeforeValue(0, 6, '_')} |Ж:${
					addCharBeforeValue(0, 6, '_')} |У:${
					addCharBeforeValue(0, 6, '_')} |К:${
					addCharBeforeValue(0, 7, '_')} |В:_100.0</b></u> Итоговый БЖУК на 100 грамм.`;

				let dishReminder = `\n\n—Перед добавлением ингредиента его нужно создать.\n—Если в блюде больше 20 ингредиентов, то блюдо придется разделить на два блюда. Создать одно и добавить его как ингредиент в создоваемое второе.\n\nНужна помощь? Отправь <code>п</code>\nОтменить? Отправь <code>о</code>`;

				askingConfirmationResponse += dishSheetHead;
				askingConfirmationResponse += dishSheetFooter;
				askingConfirmationResponse += dishReminder;

 				const response = await bot.telegram.sendMessage(
					ctx.update.message.chat.id,
					askingConfirmationResponse,
					{parse_mode:'HTML'}
				);
console.log(response);

			
				//update count_of_user_created_di
				let setFUCFIDITime;
				let setLimitCOfFIDI;

				if (!userInfo.privilege_type) {
					if (!userInfo.first_user_created_fidi_time) {
						setFUCFIDITime = `first_user_created_fidi_time = '${creation_date}'`;
						userInfo.limit_count_of_user_created_fidi = 0;
					}
					setLimitCOfFIDI = `limit_count_of_user_created_fidi= ${Number(userInfo.limit_count_of_user_created_fidi) + 1}`;
				}

				await DB_CLIENT.query(`
					UPDATE registered_users
					SET count_of_user_created_di = ${count_of_user_created_di}
					${setLimitCOfFIDI ? ', ' + setLimitCOfFIDI : ``}
					${setFUCFIDITime ? ', ' + setFUCFIDITime : ``}
					WHERE id = ${userInfo.r_user_id};
				`);
				//create dish dish_items
				let row = {};
				row.creation_date = creation_date;
				row.name__lang_code_ru = dishName;
				row.di_id_for_user = count_of_user_created_di;
				row.tg_user_id = userInfo.tg_user_id;


				let paramQuery = {};
				paramQuery.text = `
					INSERT INTO dish_items
					(${objKeysToColumnStr(row)})
					VALUES
					(${objKeysToColumn$IndexesStr(row)})
					RETURNING	id
				;`;
				paramQuery.values = getArrOfValuesFromObj(row);
				const res = await DB_CLIENT.query(paramQuery);

				//add to telegram_user_sended_commands
				row = {};
				row.creation_date = creation_date;
				row.command = `CREATE_DISH`;
				row.tg_user_id = userInfo.tg_user_id;
				row.confirmation = true;
				row.can_it_be_canceled = true;

				row.data = {};
				row.data.dish_items_ids = [res.rows[0].id];
				row.data.message_id = response.message_id;
				row.data.chat = {
					id: response.chat.id,
					type: response.chat.type
				};
				row.data = JSON.stringify(row.data);

				paramQuery = {};
				paramQuery.text = `
					INSERT INTO telegram_user_sended_commands
					(${objKeysToColumnStr(row)})
					VALUES
					(${objKeysToColumn$IndexesStr(row)})
				;`;
				paramQuery.values = getArrOfValuesFromObj(row);
				await DB_CLIENT.query(paramQuery);



				return;

				/* 
				let dishSheetHead = `\n<u>|<b>№_|Б:____.__|Ж:____.__|У:____.__|К:_____.__|Вес:_._ (г)</b>  <i>Ингредиент</i></u>`;

				askingConfirmationResponse += dishSheetHead;

				const makeDishSheetLine = (ingreNum, protein, fat, carb, cal, weight, name) => {
					return `\n|${
						makeDishNumForSheetLine(ingreNum)} <u>|Б:${
						addCharBeforeValue(protein, 6, '_')}|Ж:${
						addCharBeforeValue(fat, 6, '_')}|У:${
						addCharBeforeValue(carb, 6, '_')}|К:${
						addCharBeforeValue(cal, 7, '_')}|В:${
						addCharBeforeValue(weight, 6, '_')}</u> <i>${
						name}</i>`
				}

				const rofl = () => {
					let i = 10
					let str = ``;
					while(i){
						str += makeDishSheetLine(3, 345.1, 33.3, 800.4, 8882.4, 799, `тестовый ингредиент оч оч много слов и букав опять таки привет`);
						str += makeDishSheetLine(14, 1115.1, 991.3, 153.4, 4442.4, 3999, `тестовый ингредиент второй раз сюда записываю чтобы потестить вид посмотреть да ага`);
						i--;
					}

					return str;
				}

				let dishSheet = rofl();
				
				askingConfirmationResponse += dishSheet; */

				

			} else if (Array.isArray(re_result = text.toLowerCase().match(RE_RU_COMMAND__EDIT_DISH))) {

			} else if (Array.isArray(re_result = text.toLowerCase().match(RE_RU_COMMAND__SHOW_CREATED_DISHES))) {

				console.log(re_result);
				
					ctx.reply(`code me, bitch`);
					console.log(`блюда не написаны...`);
				
			} else if (Array.isArray(re_result = text.toLowerCase().match(RE_RU_COMMAND__SHOW_CREATED_FOOD))) {
				console.log(re_result);

				if(!userInfo.available_count_of_user_created_fi){
					ctx.reply(`Нет созданной еды... Т_Т`)
					return;
				}

				const makeUnderlineIDOfUserCreatedFI = intId => {
					const str = String(intId);
					const maxStrIDLength = 4;
					
					let result = ``;

					for (let i = 0, diff = maxStrIDLength - str.length; i < diff; i++) {
						result += `_`;
					}
					result += str;

					return result;
				};
				
				const getPages = (available_count_of_user_created_fi, maxNumberOfLines, selectedPage) => {
					let numberOfPages = available_count_of_user_created_fi / maxNumberOfLines;
					const numberOfPagesRound = Math.round(numberOfPages);
					const numberOfPagesFloor = Math.floor(numberOfPages);
					numberOfPages = numberOfPagesRound > numberOfPagesFloor ? numberOfPagesRound : numberOfPagesFloor + 1;
			
					const pages = {};
					pages.first = 1;
					pages.selected = selectedPage;
					pages.last = numberOfPages;
			
					if (numberOfPages == 1) {
						pages.movePrevious = 1;
						pages.movePreviousMinusFive = 1;
						pages.selected = 1;
						pages.moveNext = 1;
						pages.moveNextPlusFive = 1;
					} else if (numberOfPages > 1) {
						pages.moveNext = selectedPage + 1;
						if (pages.moveNext > numberOfPages) {
							pages.moveNext = numberOfPages;
						}
			
						pages.moveNextPlusFive = selectedPage + 6;
						if (pages.moveNextPlusFive > numberOfPages - 1) {
							pages.moveNextPlusFive = selectedPage + Math.round((numberOfPages - selectedPage ) / 2);
						}
					}
			
					if (selectedPage > numberOfPages){
						selectedPage = numberOfPages;
			
						pages.selected = numberOfPages;
						pages.moveNext = numberOfPages;
						pages.moveNextPlusFive = numberOfPages;
					}
			
					if (selectedPage > 1) {
						pages.movePrevious = selectedPage - 1;
						pages.movePreviousMinusFive = selectedPage - 6;
						if (pages.movePreviousMinusFive < 1) {
							pages.movePreviousMinusFive = Math.floor(selectedPage / 2);
						}
					} else {
						pages.movePrevious = 1;
						pages.movePreviousMinusFive = 1;
					}
					return pages;
				}
 		
				const maxNumberOfLines = 10;
				let selectedPage = 1;
				const pages = getPages(userInfo.available_count_of_user_created_fi, maxNumberOfLines, selectedPage);

				const res = await DB_CLIENT.query(`
					SELECT view_json, fi_id_for_user, name__lang_code_ru
					FROM food_items
					WHERE tg_user_id = ${userInfo.tg_user_id}
					AND fi_id_for_user IS NOT NULL
					AND deleted = false
					ORDER BY fi_id_for_user DESC
					LIMIT ${maxNumberOfLines};
				`);


				const addCharBeforeValue = (value, maxLength, charS) => {
					let str = Number(value).toFixed(1);
					
					let result = ``;

					for (let i = 0, diff = maxLength - str.length; i < diff; i++) {
						result += charS;
					}
					result += str;

					return result;
				};
				let message = `<b>Cписок созданной еды.</b> Всего: <b>${userInfo.available_count_of_user_created_fi}</b>.\n<b>ID</b>   БЖУК (на 100г) <b><i>Название еды</i></b>`;

				res.rows.forEach(e => {
					message += `\n<code>${e.fi_id_for_user}</code> Б:${
						addCharBeforeValue(e.view_json.protein ? e.view_json.protein : 0, 4, '_')} Ж:${
						addCharBeforeValue(e.view_json.fat ? e.view_json.fat : 0, 4, '_')} У:${
						addCharBeforeValue(e.view_json.carbohydrate ? e.view_json.carbohydrate : 0, 4, '_')} К:${
						addCharBeforeValue(e.view_json.caloric_content ? e.view_json.caloric_content : 0, 5, '_')} <i>${
						e.name__lang_code_ru}</i> `
				});

				const makeInlineKeyboard = (pages, tableName, uid) => {
					return telegraf.Markup.inlineKeyboard([[
							telegraf.Markup.button.callback(`${pages.first}`, `${tableName + pages.first}uid${uid}`),
							telegraf.Markup.button.callback(`${pages.movePreviousMinusFive}<<`, `${tableName + pages.movePreviousMinusFive}uid${uid}`),
							telegraf.Markup.button.callback(`${pages.movePrevious}<`, `${tableName + pages.movePrevious}uid${uid}`),
							telegraf.Markup.button.callback(`${pages.selected}`, `${tableName + pages.selected}uid${uid}`),
							telegraf.Markup.button.callback(`>${pages.moveNext}`, `${tableName + pages.moveNext}uid${uid}`),
							telegraf.Markup.button.callback(`>>${pages.moveNextPlusFive}`, `${tableName + pages.moveNextPlusFive}uid${uid}`),
							telegraf.Markup.button.callback(`${pages.last}`, `${tableName + pages.last}uid${uid}`)
					]]);
				}

				const inlineKeyboard = makeInlineKeyboard(pages, `fi`, userInfo.tg_user_id);

				inlineKeyboard.parse_mode = 'HTML';
				inlineKeyboard.allow_sending_without_reply = true;
				// inlineKeyboard.reply_to_message_id = ctx.update.message.message_id; //only if in groups

 				const response = await bot.telegram.sendMessage(
					ctx.update.message.chat.id,
					message,
					inlineKeyboard
				);


				let row = {};
				row = {};
				row.creation_date = new Date(reqDate).toISOString();
				row.tg_user_id = ctx.update.message.from.id;
				row.command = `SHOW_CREATED_FOOD`;
				
				let paramQuery = {};
				paramQuery.text = `
					INSERT INTO telegram_user_sended_commands
					(${objKeysToColumnStr(row)})
					VALUES
					(${objKeysToColumn$IndexesStr(row)})
				;`;
				paramQuery.values = getArrOfValuesFromObj(row);
				await DB_CLIENT.query(paramQuery);


			} else if (Array.isArray(re_result = text.toLowerCase().match(RE_RU_COMMAND__DELETE_CREATED_FOOD_IDs))) {
				console.log(re_result);
				
					const fi_id_for_userStr = re_result.input;
					const num_re = /[0-9]+/g;

					let fi_id_for_userArr = execAndGetAllREResults(fi_id_for_userStr, num_re);
					fi_id_for_userArr = cleanArrFromRecurringItems(fi_id_for_userArr);
					// check existance of that ucfi_ids_for_user_arr
					let res = await DB_CLIENT.query(`
						SELECT fi_id_for_user
						FROM food_items
						WHERE tg_user_id = ${userInfo.tg_user_id}
						AND fi_id_for_user = ANY (ARRAY[${fi_id_for_userArr.join()}])
						AND deleted
					;`);

					if (res.rows.length) {
						let alreadyDeleted = ``;
						if (res.rows.length > 1) {
							alreadyDeleted += `Не существует еды с такими ID: `;
							res.rows.forEach((el, i) => {
								if (res.rows.length - 1 == i) {
									alreadyDeleted += el.fi_id_for_user;
									return;
								}
								alreadyDeleted += el.fi_id_for_user + ', '
							})
						} else {
							alreadyDeleted += `Не существует еды с таким ID: `;
							res.rows.forEach(el => alreadyDeleted += el.fi_id_for_user);
						}
						alreadyDeleted += `.\n\n0_0`;
						ctx.reply(alreadyDeleted)
						return;
					}
				

					// delete doc with the same food_items_ids from meilisearch
					await MSDB.deleteDocuments({
						filter:`food_items_id IN [${userLastCommand.data.food_items_ids.join()}]`
					});

					
					// update deleted ucfi rows   
					let row = {};
					row = {};
					row.deleted = true;

					let paramQuery = {};
					paramQuery.text = `
						UPDATE food_items
						SET ${getStrOfColumnNamesAndTheirSettedValues(row)}
						WHERE tg_user_id = ${userInfo.tg_user_id}
						AND fi_id_for_user = ANY (ARRAY[${fi_id_for_userArr.join(', ')}])
						RETURNING	id, name__lang_code_ru, fi_id_for_user, view_json
					;`;

					let updateFIRes = await DB_CLIENT.query(paramQuery);
					
					// add to telegram_user_commands
					row = {};
				row.creation_date = new Date(reqDate).toISOString();
					row.tg_user_id = ctx.update.message.from.id;
					row.command = `DELETE_FOOD`;
					row.can_it_be_canceled = true;

					row.data = {};
					row.data.food_items_ids = [];
					updateFIRes.rows.forEach(el => row.data.food_items_ids.push(el.id));
					row.data = JSON.stringify(row.data);
					
					paramQuery = {};
					paramQuery.text = `
						INSERT INTO telegram_user_sended_commands
						(${objKeysToColumnStr(row)})
						VALUES
						(${objKeysToColumn$IndexesStr(row)})
					;`;
					paramQuery.values = getArrOfValuesFromObj(row);
					
					await DB_CLIENT.query(paramQuery);

					// update available count fi in registered_users
					row = {};
					row.available_count_of_user_created_fi = Number(userInfo.available_count_of_user_created_fi) - fi_id_for_userArr.length;
				
					await DB_CLIENT.query(`
						UPDATE registered_users
						SET ${getStrOfColumnNamesAndTheirSettedValues(row)}
						WHERE id = ${userInfo.r_user_id}
					;`);
					
					let deletedMessage = `<b>Удалено:</b>\n\n<b>ID</b>   БЖУК (на 100г) <b><i>Название еды</i></b>`;

				const makeUnderlineIDOfUserCreatedFI = intId => {
					const str = String(intId);
					const maxStrIDLength = 4;
					
					let result = ``;

					for (let i = 0, diff = maxStrIDLength - str.length; i < diff; i++) {
						result += `_`;
					}
					result += str;

					return result;
				};

				const addCharBeforeValue = (value, maxLength, charS) => {
					let str = Number(value).toFixed(1);
					
					let result = ``;

					for (let i = 0, diff = maxLength - str.length; i < diff; i++) {
						result += charS;
					}
					result += str;

					return result;
				};

				updateFIRes.rows.forEach(e => {
					deletedMessage += `\n<b>${makeUnderlineIDOfUserCreatedFI(e.fi_id_for_user)}</b> Б:${
						addCharBeforeValue(e.view_json.protein ? e.view_json.protein : 0, 4, '_')} Ж:${
						addCharBeforeValue(e.view_json.fat ? e.view_json.fat : 0, 4, '_')} У:${
						addCharBeforeValue(e.view_json.carbohydrate ? e.view_json.carbohydrate : 0, 4, '_')} К:${
						addCharBeforeValue(e.view_json.caloric_content ? e.view_json.caloric_content : 0, 5, '_')} <i>${
						e.name__lang_code_ru}</i> `
				});

					
					deletedMessage += `\n\nОтменить?<b> "о/отмена"</b>\n\n<i>Я ТЕБЯ ПОРОДИЛ, Я ТЕБЯ И УДАЛЮ...</i>`;
					ctx.reply(deletedMessage, {parse_mode : 'HTML'});

			} else if (Array.isArray(re_result = text.toLowerCase().match(RE_RU_COMMAND__DELETE_CREATED_DISH_IDs))) {
					ctx.reply(`code me, btch`)
					console.log(`b`)
			} else if (Array.isArray(re_result = text.toLowerCase().match(RE_RU_COMMAND__CREATE_AIM))) {
				console.log(re_result);			
			} else if (Array.isArray(re_result = text.toLowerCase().match(RE_RU_COMMAND__COMPLETE_AIM))) {
				console.log(re_result);			
			} else if (Array.isArray(re_result = text.toLowerCase().match(RE_RU_COMMAND__SHOW_AIMS))) {
				console.log(re_result);			
			} else if (Array.isArray(re_result = text.toLowerCase().match(RE_RU_COMMAND__DELETE_AIM))) {
				console.log(re_result);			
			} else if (Array.isArray(re_result = text.toLowerCase().match(RE_RU_COMMAND__ADD_WEIGHTING))) {
				console.log(re_result);			
			} else if (Array.isArray(re_result = text.toLowerCase().match(RE_RU_COMMAND__DELETE_LAST_ADDED_WEIGHTING))) {
				console.log(re_result);			
			} else if (Array.isArray(re_result = text.toLowerCase().match(RE_RU_BOT_AND_INLINE_COMMAND__GET_STATS))) {
				console.log(re_result);			
			} else {
				//ne mogu raspoznat' zapros //ssilka na manual

				ctx.reply(`Не понимаю команду.\n\n*Краткая инструкция:*\n-создать еду\n  се мороженое Обамка. б3,4ж17,2у22,2к257\nи т.д.\n\n\nПодробная инструкция ссылка.`, { parse_mode: 'Markdown', allow_sending_without_reply: true })

	
			}
		} else {
			console.log(`user has last command`);

try{
 				await bot.telegram.deleteMessage(
					ctx.update.message.chat.id,
					ctx.update.message.message_id
				);
}catch(e){
	console.log(e);
}

					const bjukToNum = obj => {
						obj.protein = Number(obj.protein);
						obj.fat = Number(obj.fat);
						obj.carbohydrate = Number(obj.carbohydrate);
						obj.caloric_content = Number(obj.caloric_content);
						return obj;
					}
					
					const bjukValueToWC = (obj, w) => {
						obj.protein = obj.protein * w / 100;
						obj.fat = obj.fat * w / 100;
						obj.carbohydrate = obj.carbohydrate * w / 100;
						obj.caloric_content = obj.caloric_content * w / 100;
						return obj;
					}
					
					const bjukToFixedNum = obj => {
						obj.protein = obj.protein.toFixed(1);
						obj.fat = obj.fat.toFixed(1);
						obj.carbohydrate = obj.carbohydrate.toFixed(1);
						obj.caloric_content = obj.caloric_content.toFixed(1);
						return obj;
					}
					
					const calcConcentration = (c1, w1, c2, w2) => {
						return (c1 * w1 + c2 * w2)/(w1 + w2);
					}

					const calcDecreiseConcentration = (c1, w1, c2, w2) => {
						return (c1 * w1 - c2 * w2)/(w1 - w2);
					}


				
const makeDishNumForSheetLine = (num, maxLength) => {
					const defaultMaxLength = 2;
					maxLength = maxLength ? maxLength : defaultMaxLength;
					const str = String(num);
					let result = ``;

					for (let i = 0, diff = maxLength - str.length; i < diff; i++) {
						result += `_`;
					}
					result += `<code>${str}</code>`;

					return result;
				};
				const addCharBeforeValue = (value, maxLength, charS) => {
					let str = Number(value).toFixed(1);
					
					let result = ``;
					const diff = maxLength - str.length;
					if ( diff >= 0) {
						for (let i = 0; i < diff; i++) {
							result += charS;
						}
					} else {
						str = str.slice(Math.abs(diff));
					}
					result += str;

					return result;
				};

				const makeDishSheetLine = (ingreNum, protein, fat, carb, cal, weight, name) => {
					return `\n|${
						makeDishNumForSheetLine(ingreNum)} <u>|Б:${
						addCharBeforeValue(protein, 6, '_')} |Ж:${
						addCharBeforeValue(fat, 6, '_')} |У:${
						addCharBeforeValue(carb, 6, '_')} |К:${
						addCharBeforeValue(cal, 7, '_')} |В:${
						addCharBeforeValue(weight, 6, '_')}</u> <i>${
						name}</i>`
				}

			const creation_date = new Date(reqDate).toISOString();

			if (userLastCommand.command == `CREATE_DISH` || userLastCommand.command == `EDIT_DISH`){
				if (Array.isArray(re_result = text.toLowerCase().match(RE__RESOLVE_FD_ID_WEIGHT_FROM_InlQuery))){
					//get food|dish id, weight
					const foodDishType = re_result[1];
					const id = Number(re_result[2]);
					const weight = Number(Number(re_result[3]).toFixed(1));
																				 ;
					//find food|dish by id and creDish in pgdb
					let res = await DB_CLIENT.query(`
							SELECT name__lang_code_ru, protein, fat, caloric_content, carbohydrate, fooddish_gweight_items_json, g_weight
							FROM dish_items
							WHERE id = ${userLastCommand.data.dish_items_ids[0]}
						;`);
					let creDish = res.rows[0];
					console.log(creDish);
					
					if(!creDish.fooddish_gweight_items_json){
						creDish.fooddish_gweight_items_json = [];
					} else if(creDish.fooddish_gweight_items_json.length == 20){
						ctx.reply(`ingredient limit 20`);
						return;
					}

					creDish.fooddish_gweight_items_json.push({
						type:foodDishType == 'food'?'f':'d',
						id:id,
						w:weight
					});
					
					let fooddishItems = creDish.fooddish_gweight_items_json.slice();
					let foodIds = [];
					let dishIds = [];

					fooddishItems.forEach(el => {
						if(el.type == 'f'){
							foodIds.push(el.id);
						} else {
							dishIds.push(el.id);
						}
					})
					
					
					let resFoodIds;
					let resDishIds;

					if(foodIds.length){
						resFoodIds = await DB_CLIENT.query(`
							SELECT id, name__lang_code_ru, protein, fat, carbohydrate, caloric_content
							FROM food_items
							WHERE id IN (${foodIds.join()})
						;`);
						fooddishItems.forEach((el, i) => {
							fooddishItems[i] = {...el, ...resFoodIds.rows.find(rEl => rEl.id == el.id)};
						});
					}

					if(dishIds.length){
						resDishIds = await DB_CLIENT.query(`
							SELECT id, name__lang_code_ru, protein, fat, carbohydrate, caloric_content
							FROM dish_items
							WHERE id IN (${dishIds.join()})
						;`);
						fooddishItems.forEach((el, i) => {
							fooddishItems[i] = {...el, ...resDishIds.rows.find(rEl => rEl.id == el.id)};
						});
					}
					let addedItem = fooddishItems.find(el => el.id == id);
					addedItem = bjukToNum(addedItem);

					creDish = bjukToNum(creDish);
					creDish.g_weight = Number(creDish.g_weight);
					
					//calc bjuk add f|d id & weight in creDish
					creDish.protein = calcConcentration(creDish.protein, creDish.g_weight, addedItem.protein, weight);
					creDish.fat = calcConcentration(creDish.fat, creDish.g_weight, addedItem.fat, weight);
					creDish.carbohydrate = calcConcentration(creDish.carbohydrate, creDish.g_weight, addedItem.carbohydrate, weight);
					creDish.caloric_content = calcConcentration(creDish.caloric_content, creDish.g_weight, addedItem.caloric_content, weight);
					creDish.g_weight += weight;

					creDish = bjukToFixedNum(creDish);
					creDish = bjukToNum(creDish);

					console.log(fooddishItems, addedItem, creDish);
					//update creDish and return list of added ingredients 
					creDish.fooddish_gweight_items_json = JSON.stringify(creDish.fooddish_gweight_items_json);
					
					await DB_CLIENT.query(`
						UPDATE dish_items
						SET ${getStrOfColumnNamesAndTheirSettedValues(creDish)}
						WHERE id = ${userLastCommand.data.dish_items_ids[0]}
					;`);
					//update list message in chat
					
				let askingConfirmationResponse = `<b>__ID Название блюда</b>\n`;
				askingConfirmationResponse += `${makeDishNumForSheetLine(userInfo.count_of_user_created_di, 4)} ${creDish.name__lang_code_ru}\n`;

				let dishSheetHead = `\n<u>|<b>№_|Белки__|Жиры___|Углевод|Калории|Вес(грамм) <i>Ингредиент и его название</i></b></u>`;

				let dishSheetAddedIngredientList = ``;

				fooddishItems.forEach((el, i)=>{
					el = bjukValueToWC(el, el.w);
					dishSheetAddedIngredientList += makeDishSheetLine(i+1, el.protein, el.fat, el.carbohydrate, el.caloric_content, el.w, el.name__lang_code_ru);
				});

				let dishSheetFooter = `\n<u>|<b>И__|Б:${
					addCharBeforeValue(creDish.protein, 6, '_')} |Ж:${
					addCharBeforeValue(creDish.fat, 6, '_')} |У:${
					addCharBeforeValue(creDish.carbohydrate, 6, '_')} |К:${
					addCharBeforeValue(creDish.caloric_content, 7, '_')} |В:_100.0</b></u> Итого на 100 грамм.\n<b><u>|Вес:${
					addCharBeforeValue(creDish.g_weight, 6, '_')} |Итоговый вес:${
					creDish.total_g_weight?addCharBeforeValue(creDish.total_g_weight, 6, '_'):'__н/д_'} |Разница:${
					creDish.total_g_weight?addCharBeforeValue(creDish.g_weight - creDish.total_g_weight, 6, '_'): '__н/д_' }|</u></b>`;

				askingConfirmationResponse += dishSheetHead;
				askingConfirmationResponse += dishSheetAddedIngredientList;
				askingConfirmationResponse += dishSheetFooter;

					let response;
				try {
					
					if(userLastCommand.data.message_id){
 				await bot.telegram.deleteMessage(
					ctx.update.message.chat.id,
					userLastCommand.data.message_id
					
					);
					}
				}catch(e){
					console.log(e)

				}

					try{

					response = await bot.telegram.sendMessage(
						ctx.update.message.chat.id,
						askingConfirmationResponse,
						{parse_mode:'HTML'}
					);
				}catch(e){
					console.log(e)

				}


console.log(response);

				let row = {};
				row.creation_date = creation_date;
				row.command = userLastCommand.command;
				row.tg_user_id = userInfo.tg_user_id;
				row.confirmation = true;
				row.can_it_be_canceled = true;

				row.data = {};
				row.data.action = `added ingredient`
				row.data.ingredient = {type: addedItem.type, id: id, w: weight};
				row.data.dish_items_ids = [userLastCommand.data.dish_items_ids[0]];
				row.data.message_id = response.message_id;
				row.data = JSON.stringify(row.data);

				let paramQuery = {};
				paramQuery.text = `
					INSERT INTO telegram_user_sended_commands
					(${objKeysToColumnStr(row)})
					VALUES
					(${objKeysToColumn$IndexesStr(row)})
				;`;
				paramQuery.values = getArrOfValuesFromObj(row);
				await DB_CLIENT.query(paramQuery);

					//add telegram_user_sended_commands
				} else if (Array.isArray(re_result = text.toLowerCase().match(RE_RU_COMMAND__DELETE_INGREDIENTs_FROM_DISH))) {
					//row.data.action = {delete ingredient, ingredients}
					let listNums = [];
					let reRes = [...re_result.input.matchAll(/[0-9]+/g)];

					reRes.forEach(el =>{
						if(el[0] > 20 || el[0] == 0){
							return;
						}
						listNums.push(
							Number(el[0])
						);
					});
					
					console.log(listNums);

					if(!listNums.length) {
						ctx.reply(`igredientov s takim${reRes.length>1?'i nomerami':' nomerom'} net`);
						return;
					}
				
					let res = await DB_CLIENT.query(`
							SELECT name__lang_code_ru, protein, fat, caloric_content, carbohydrate, fooddish_gweight_items_json, g_weight
							FROM dish_items
							WHERE id = ${userLastCommand.data.dish_items_ids[0]}
						;`);
					let creDish = res.rows[0];
					console.log(creDish);
					
					let biggerThanLength;
					if(!creDish.fooddish_gweight_items_json?.length){
						ctx.reply(`nechego udalyat'`);
						return;
					} else if (biggerThanLength = listNums.find(el => el > creDish.fooddish_gweight_items_json.length)) {
						ctx.reply(`ingredienta s takim nomerom "${biggerThanLength}" net`);
						return;
					} else if (creDish.fooddish_gweight_items_json.length == 1){

				let askingConfirmationResponse = `<b>__ID Название блюда</b>\n`;
				askingConfirmationResponse += `${makeDishNumForSheetLine(userInfo.count_of_user_created_di, 4)} ${creDish.name__lang_code_ru}\n`;

				let dishSheetHead = `\n<u>|<b>№_|Белки__|Жиры___|Углевод|Калории|Вес(грамм) <i>Ингредиент и его название</i></b></u>`;

				let dishSheetFooter = `\n<u>|<b>И__|Б:${
					addCharBeforeValue(0, 6, '_')} |Ж:${
					addCharBeforeValue(0, 6, '_')} |У:${
					addCharBeforeValue(0, 6, '_')} |К:${
					addCharBeforeValue(0, 7, '_')} |В:_100.0</b></u> Итоговый БЖУК на 100 грамм.`;
						
				askingConfirmationResponse += dishSheetHead;
				askingConfirmationResponse += dishSheetFooter;

					let response;
				try {
					if(userLastCommand.data.message_id){
 				await bot.telegram.deleteMessage(
					ctx.update.message.chat.id,
					userLastCommand.data.message_id
					
					);
					}
				}catch(e){
					console.log(e)
				}


					try{
 					response = await bot.telegram.sendMessage(
						ctx.update.message.chat.id,
						askingConfirmationResponse,
						{parse_mode:'HTML'}
					);

					}catch(e){
						console.log(e)
					}

console.log(response);

				let row = {};
				row.creation_date = creation_date;
				row.command = userLastCommand.command;
				row.tg_user_id = userInfo.tg_user_id;
				row.confirmation = true;
				row.can_it_be_canceled = true;

				row.data = {};
				row.data.action = `delete ingredients`
				row.data.ingredients = creDish.fooddish_gweight_items_json;
				row.data.dish_items_ids = [userLastCommand.data.dish_items_ids[0]];
				row.data.message_id = response.message_id;
				row.data = JSON.stringify(row.data);

				let paramQuery = {};
				paramQuery.text = `
					INSERT INTO telegram_user_sended_commands
					(${objKeysToColumnStr(row)})
					VALUES
					(${objKeysToColumn$IndexesStr(row)})
				;`;
				paramQuery.values = getArrOfValuesFromObj(row);
				await DB_CLIENT.query(paramQuery);

						creDish.protein = 0;
						creDish.fat = 0;
						creDish.carbohydrate = 0;
						creDish.caloric_content = 0;
						creDish.g_weight = 0;
						creDish.total_g_weight = 0;
						console.log(creDish)

					creDish.fooddish_gweight_items_json = JSON.stringify([]);
					
					await DB_CLIENT.query(`
						UPDATE dish_items
						SET ${getStrOfColumnNamesAndTheirSettedValues(creDish)}
						WHERE id = ${userLastCommand.data.dish_items_ids[0]}
					;`);
						return;
					}
					//get ingredients

					let fooddishItems = creDish.fooddish_gweight_items_json.slice();
					let foodIds = [];
					let dishIds = [];

					fooddishItems.forEach(el => {
						if(el.type == 'f'){
							foodIds.push(el.id);
						} else {
							dishIds.push(el.id);
						}
					})
					
					if(foodIds.length){
						let resFoodIds = await DB_CLIENT.query(`
							SELECT id, name__lang_code_ru, protein, fat, carbohydrate, caloric_content
							FROM food_items
							WHERE id IN (${foodIds.join()})
						;`);
						fooddishItems.forEach((el, i) => {
							fooddishItems[i] = {...el, ...resFoodIds.rows.find(rEl => rEl.id == el.id)};
						});
					}

					if(dishIds.length){
						let resDishIds = await DB_CLIENT.query(`
							SELECT id, name__lang_code_ru, protein, fat, carbohydrate, caloric_content
							FROM dish_items
							WHERE id IN (${dishIds.join()})
						;`);
						fooddishItems.forEach((el, i) => {
							fooddishItems[i] = {...el, ...resDishIds.rows.find(rEl => rEl.id == el.id)};
						});
					}
					//calc bjuk of dish
					listNums.forEach((el, i) => {
						listNums[i] = bjukToNum(fooddishItems[el-1]);
					});
console.log(listNums, creDish);

					for(let i = 0, matches = 0; i < creDish.fooddish_gweight_items_json.length; i++){
						for (let k = 0; k < listNums.length; k++) {
							if(listNums[k].id == creDish.fooddish_gweight_items_json[i].id){
								matches++;
								k = 0;
								creDish.fooddish_gweight_items_json.splice(i, 1);
								fooddishItems.splice(i, 1);
								if (i >= creDish.fooddish_gweight_items_json.length) {
									break;
								}
								if(matches == listNums.length){
									break;
								}
							}
						}
					}

						creDish.protein = 0;
						creDish.fat = 0;
						creDish.carbohydrate = 0;
						creDish.caloric_content = 0;
						creDish.g_weight = 0;
					creDish.total_g_weight = 0;
					
					fooddishItems.forEach(el => {
						let addedItem = el;
						creDish.protein = calcConcentration(creDish.protein, creDish.g_weight, addedItem.protein, el.w);
						creDish.fat = calcConcentration(creDish.fat, creDish.g_weight, addedItem.fat, el.w);
						creDish.carbohydrate = calcConcentration(creDish.carbohydrate, creDish.g_weight, addedItem.carbohydrate, el.w);
						creDish.caloric_content = calcConcentration(creDish.caloric_content, creDish.g_weight, addedItem.caloric_content, el.w);
						creDish.g_weight += el.w;
						console.log(creDish)
					});

					creDish = bjukToFixedNum(creDish);
					creDish = bjukToNum(creDish);

					console.log(creDish);
					creDish.fooddish_gweight_items_json = JSON.stringify(creDish.fooddish_gweight_items_json);
					
					await DB_CLIENT.query(`
						UPDATE dish_items
						SET ${getStrOfColumnNamesAndTheirSettedValues(creDish)}
						WHERE id = ${userLastCommand.data.dish_items_ids[0]}
					;`);

console.log(listNums, creDish);
					//list of dish ingredients

				let askingConfirmationResponse = `<b>__ID Название блюда</b>\n`;
				askingConfirmationResponse += `${makeDishNumForSheetLine(userInfo.count_of_user_created_di, 4)} ${creDish.name__lang_code_ru}\n`;

				let dishSheetHead = `\n<u>|<b>№_|Белки__|Жиры___|Углевод|Калории|Вес(грамм) <i>Ингредиент и его название</i></b></u>`;

				let dishSheetAddedIngredientList = ``;

				fooddishItems.forEach((el, i)=>{
					el = bjukValueToWC(el, el.w);
					dishSheetAddedIngredientList += makeDishSheetLine(i+1, el.protein, el.fat, el.carbohydrate, el.caloric_content, el.w, el.name__lang_code_ru);
				});

				let dishSheetFooter = `\n<u>|<b>И__|Б:${
					addCharBeforeValue(creDish.protein, 6, '_')} |Ж:${
					addCharBeforeValue(creDish.fat, 6, '_')} |У:${
					addCharBeforeValue(creDish.carbohydrate, 6, '_')} |К:${
					addCharBeforeValue(creDish.caloric_content, 7, '_')} |В:_100.0</b></u> Итого на 100 грамм.\n<b><u>|Вес:${
					addCharBeforeValue(creDish.g_weight, 6, '_')} |Итоговый вес:${
					creDish.total_g_weight?addCharBeforeValue(creDish.total_g_weight, 6, '_'):'__н/д_'} |Разница:${
					creDish.total_g_weight?addCharBeforeValue(creDish.g_weight - creDish.total_g_weight, 6, '_'): '__н/д_' }|</u></b>`;

				askingConfirmationResponse += dishSheetHead;
				askingConfirmationResponse += dishSheetAddedIngredientList;
				askingConfirmationResponse += dishSheetFooter;

					let response;
				try {
					if(userLastCommand.data.message_id){
 				await bot.telegram.deleteMessage(
					ctx.update.message.chat.id,
					userLastCommand.data.message_id
					
					);
					}
				}catch(e){
					console.log(e)

				}

					try{
 					response = await bot.telegram.sendMessage(
						ctx.update.message.chat.id,
						askingConfirmationResponse,
						{parse_mode:'HTML'}
					);

					}catch(e){
						console.log(e)
					}

console.log(response);

				let row = {};
				row.creation_date = creation_date;
				row.command = userLastCommand.command;
				row.tg_user_id = userInfo.tg_user_id;
				row.confirmation = true;
				row.can_it_be_canceled = true;

				row.data = {};
				row.data.action = `delete ingredients`
				row.data.ingredients = [];
				listNums.forEach(el => {
					row.data.ingredients.push({
						type:el.type,
						id: el.id,
						w: el.w
					});
				});
				row.data.dish_items_ids = [userLastCommand.data.dish_items_ids[0]];
				row.data.message_id = response.message_id;
				row.data = JSON.stringify(row.data);

				let paramQuery = {};
				paramQuery.text = `
					INSERT INTO telegram_user_sended_commands
					(${objKeysToColumnStr(row)})
					VALUES
					(${objKeysToColumn$IndexesStr(row)})
				;`;
				paramQuery.values = getArrOfValuesFromObj(row);
				await DB_CLIENT.query(paramQuery);
					//telegram_user_sended_commands 

										 
				} else if (Array.isArray(re_result = text.toLowerCase().match(RE_RU_COMMAND__EDIT_INGREDIENT_WEIGHT_IN_DISH))) {
					const ingredientNum = Number(re_result[1]);
					const newWeight = Number(re_result[2].replace(/\,/, '.'));
					
					if(ingredientNum > 20 || ingredientNum == 0){
						ctx.reply(`igredienta s takim nomerom net`);
						return;
					}

					console.log(ingredientNum, newWeight);
					
					let res = await DB_CLIENT.query(`
							SELECT name__lang_code_ru, protein, fat, caloric_content, carbohydrate, fooddish_gweight_items_json, g_weight
							FROM dish_items
							WHERE id = ${userLastCommand.data.dish_items_ids[0]}
						;`);
					let creDish = res.rows[0];
					console.log(creDish);
					
					if(!creDish.fooddish_gweight_items_json){
						ctx.reply(`nechego izmenyat'`);
						return;
					} else if (ingredientNum > creDish.fooddish_gweight_items_json.length){
						ctx.reply(`igredienta s takim nomerom net`);
						return;
					}
					creDish.fooddish_gweight_items_json[ingredientNum - 1].w = newWeight;

					let fooddishItems = creDish.fooddish_gweight_items_json.slice();
					let foodIds = [];
					let dishIds = [];

					fooddishItems.forEach(el => {
						if(el.type == 'f'){
							foodIds.push(el.id);
						} else {
							dishIds.push(el.id);
						}
					})
					
					if(foodIds.length){
						let resFoodIds = await DB_CLIENT.query(`
							SELECT id, name__lang_code_ru, protein, fat, carbohydrate, caloric_content
							FROM food_items
							WHERE id IN (${foodIds.join()})
						;`);
						fooddishItems.forEach((el, i) => {
							fooddishItems[i] = {...el, ...resFoodIds.rows.find(rEl => rEl.id == el.id)};
						});
					}

					if(dishIds.length){
						let resDishIds = await DB_CLIENT.query(`
							SELECT id, name__lang_code_ru, protein, fat, carbohydrate, caloric_content
							FROM dish_items
							WHERE id IN (${dishIds.join()})
						;`);
						fooddishItems.forEach((el, i) => {
							fooddishItems[i] = {...el, ...resDishIds.rows.find(rEl => rEl.id == el.id)};
						});
					}

					creDish.protein = 0;
						creDish.fat = 0;
						creDish.carbohydrate = 0;
						creDish.caloric_content = 0;
						creDish.g_weight = 0;
						creDish.total_g_weight = 0;
					
					fooddishItems.forEach(el => {
						let addedItem = el;
						creDish.protein = calcConcentration(creDish.protein, creDish.g_weight, addedItem.protein, el.w);
						creDish.fat = calcConcentration(creDish.fat, creDish.g_weight, addedItem.fat, el.w);
						creDish.carbohydrate = calcConcentration(creDish.carbohydrate, creDish.g_weight, addedItem.carbohydrate, el.w);
						creDish.caloric_content = calcConcentration(creDish.caloric_content, creDish.g_weight, addedItem.caloric_content, el.w);
						creDish.g_weight += el.w;
					});

					creDish = bjukToFixedNum(creDish);
					creDish = bjukToNum(creDish);

					console.log(creDish);

				let askingConfirmationResponse = `<b>__ID Название блюда</b>\n`;
				askingConfirmationResponse += `${makeDishNumForSheetLine(userInfo.count_of_user_created_di, 4)} ${creDish.name__lang_code_ru}\n`;

				let dishSheetHead = `\n<u>|<b>№_|Белки__|Жиры___|Углевод|Калории|Вес(грамм) <i>Ингредиент и его название</i></b></u>`;

				let dishSheetAddedIngredientList = ``;

				fooddishItems.forEach((el, i)=>{
					el = bjukValueToWC(el, el.w);
					dishSheetAddedIngredientList += makeDishSheetLine(i+1, el.protein, el.fat, el.carbohydrate, el.caloric_content, el.w, el.name__lang_code_ru);
				});

				let dishSheetFooter = `\n<u>|<b>И__|Б:${
					addCharBeforeValue(creDish.protein, 6, '_')} |Ж:${
					addCharBeforeValue(creDish.fat, 6, '_')} |У:${
					addCharBeforeValue(creDish.carbohydrate, 6, '_')} |К:${
					addCharBeforeValue(creDish.caloric_content, 7, '_')} |В:_100.0</b></u> Итого на 100 грамм.\n<b><u>|Вес:${
					addCharBeforeValue(creDish.g_weight, 6, '_')} |Итоговый вес:${
					creDish.total_g_weight?addCharBeforeValue(creDish.total_g_weight, 6, '_'):'__н/д_'} |Разница:${
					creDish.total_g_weight?addCharBeforeValue(creDish.g_weight - creDish.total_g_weight, 6, '_'): '__н/д_' }|</u></b>`;

				askingConfirmationResponse += dishSheetHead;
				askingConfirmationResponse += dishSheetAddedIngredientList;
				askingConfirmationResponse += dishSheetFooter;

					let response;
				try {
					
					if(userLastCommand.data.message_id){
 				await bot.telegram.deleteMessage(
					ctx.update.message.chat.id,
					userLastCommand.data.message_id
					
					);
					}
				}catch(e){
					console.log(e)

				}

					try{

					response = await bot.telegram.sendMessage(
						ctx.update.message.chat.id,
						askingConfirmationResponse,
						{parse_mode:'HTML'}
					);
				}catch(e){
					console.log(e)

				}


console.log(response);

					creDish.fooddish_gweight_items_json = JSON.stringify(creDish.fooddish_gweight_items_json);
					
					await DB_CLIENT.query(`
						UPDATE dish_items
						SET ${getStrOfColumnNamesAndTheirSettedValues(creDish)}
						WHERE id = ${userLastCommand.data.dish_items_ids[0]}
					;`);

				let row = {};
				row.creation_date = creation_date;
				row.command = userLastCommand.command;
				row.tg_user_id = userInfo.tg_user_id;
				row.confirmation = true;
				row.can_it_be_canceled = true;

				row.data = {};
				row.data.action = `change ingredient weight`
				row.data.ingredients = [creDish.fooddish_gweight_items_json[ingredientNum-1]];
				row.data.dish_items_ids = [userLastCommand.data.dish_items_ids[0]];
				row.data.message_id = response?.message_id;
				row.data = JSON.stringify(row.data);

				let paramQuery = {};
				paramQuery.text = `
					INSERT INTO telegram_user_sended_commands
					(${objKeysToColumnStr(row)})
					VALUES
					(${objKeysToColumn$IndexesStr(row)})
				;`;
				paramQuery.values = getArrOfValuesFromObj(row);
				await DB_CLIENT.query(paramQuery);
					//telegram_user_sended_commands 
				} else if (Array.isArray(re_result = text.toLowerCase().match(RE_RU_COMMAND__DISH_TOTAL_WEIGHT))) {
					const totalWeight = Number(re_result[1].replace(/\,/, '.'));

					let res = await DB_CLIENT.query(`
							SELECT name__lang_code_ru, protein, fat, caloric_content, carbohydrate, fooddish_gweight_items_json, g_weight
							FROM dish_items
							WHERE id = ${userLastCommand.data.dish_items_ids[0]}
						;`);
					let creDish = res.rows[0];
					console.log(creDish);

					if(!creDish.fooddish_gweight_items_json){
						ctx.reply(`Нечему присваивать итоговый вес.`);
						return;
					} else if(creDish.g_weight < totalWeight) {
						ctx.reply(`Каким образом итоговый вес может быть больше веса всех ингредиентов??? Добавлена вода? Занеси воду тогда в блюдо, ебаный даун!!!`);
						return;
					}
					let fooddishItems = creDish.fooddish_gweight_items_json.slice();
					let foodIds = [];
					let dishIds = [];

					fooddishItems.forEach(el => {
						if(el.type == 'f'){
							foodIds.push(el.id);
						} else {
							dishIds.push(el.id);
						}
					})
					
					if(foodIds.length){
						let resFoodIds = await DB_CLIENT.query(`
							SELECT id, name__lang_code_ru, protein, fat, carbohydrate, caloric_content
							FROM food_items
							WHERE id IN (${foodIds.join()})
						;`);
						fooddishItems.forEach((el, i) => {
							fooddishItems[i] = {...el, ...resFoodIds.rows.find(rEl => rEl.id == el.id)};
						});
					}

					if(dishIds.length){
						let resDishIds = await DB_CLIENT.query(`
							SELECT id, name__lang_code_ru, protein, fat, carbohydrate, caloric_content
							FROM dish_items
							WHERE id IN (${dishIds.join()})
						;`);
						fooddishItems.forEach((el, i) => {
							fooddishItems[i] = {...el, ...resDishIds.rows.find(rEl => rEl.id == el.id)};
						});
					}
					// calc dish, update dish
					creDish.protein = 0;
						creDish.fat = 0;
						creDish.carbohydrate = 0;
						creDish.caloric_content = 0;
						creDish.g_weight = 0;
						creDish.total_g_weight = 0;
					
					fooddishItems.forEach(el => {
						let addedItem = el;
						creDish.protein = calcConcentration(creDish.protein, creDish.g_weight, addedItem.protein, el.w);
						creDish.fat = calcConcentration(creDish.fat, creDish.g_weight, addedItem.fat, el.w);
						creDish.carbohydrate = calcConcentration(creDish.carbohydrate, creDish.g_weight, addedItem.carbohydrate, el.w);
						creDish.caloric_content = calcConcentration(creDish.caloric_content, creDish.g_weight, addedItem.caloric_content, el.w);
						creDish.g_weight += el.w;
					});
					
						creDish.total_g_weight = totalWeight;
						weightDiff = creDish.g_weight - totalWeight;

						creDish.protein = calcDecreiseConcentration(creDish.protein, creDish.g_weight, 0, weightDiff);
						creDish.fat = calcDecreiseConcentration(creDish.fat, creDish.g_weight, 0, weightDiff)
						creDish.carbohydrate = calcDecreiseConcentration(creDish.carbohydrate, creDish.g_weight, 0, weightDiff)
						creDish.caloric_content = calcDecreiseConcentration(creDish.caloric_content, creDish.g_weight, 0, weightDiff)

					creDish = bjukToFixedNum(creDish);
					creDish = bjukToNum(creDish);
					// get ingredients
					// list ingredients and weights
				let askingConfirmationResponse = `<b>__ID Название блюда</b>\n`;
				askingConfirmationResponse += `${makeDishNumForSheetLine(userInfo.count_of_user_created_di, 4)} ${creDish.name__lang_code_ru}\n`;

				let dishSheetHead = `\n<u>|<b>№_|Белки__|Жиры___|Углевод|Калории|Вес(грамм) <i>Ингредиент и его название</i></b></u>`;

				let dishSheetAddedIngredientList = ``;

				fooddishItems.forEach((el, i)=>{
					el = bjukValueToWC(el, el.w);
					dishSheetAddedIngredientList += makeDishSheetLine(i+1, el.protein, el.fat, el.carbohydrate, el.caloric_content, el.w, el.name__lang_code_ru);
				});

				let dishSheetFooter = `\n<u>|<b>И__|Б:${
					addCharBeforeValue(creDish.protein, 6, '_')} |Ж:${
					addCharBeforeValue(creDish.fat, 6, '_')} |У:${
					addCharBeforeValue(creDish.carbohydrate, 6, '_')} |К:${
					addCharBeforeValue(creDish.caloric_content, 7, '_')} |В:_100.0</b></u> Итого на 100 грамм.\n<b><u>|Вес:${
					addCharBeforeValue(creDish.g_weight, 6, '_')} |Итоговый вес:${
					creDish.total_g_weight?addCharBeforeValue(creDish.total_g_weight, 6, '_'):'__н/д_'} |Разница:${
					creDish.total_g_weight?addCharBeforeValue(creDish.g_weight - creDish.total_g_weight, 6, '_'): '__н/д_' }|</u></b>`;

				askingConfirmationResponse += dishSheetHead;
				askingConfirmationResponse += dishSheetAddedIngredientList;
				askingConfirmationResponse += dishSheetFooter;


					let inliKeyb = telegraf.Markup.inlineKeyboard([[
							telegraf.Markup.button.callback(`Сохранить`, `tgid${userInfo.tg_user_id}save`),
							telegraf.Markup.button.callback(`Отмена`, `tgid${userInfo.tg_user_id}cancel`),
					]]);

					let response;

				try {
					
					if(userLastCommand.data.message_id){
 				await bot.telegram.deleteMessage(
					ctx.update.message.chat.id,
					userLastCommand.data.message_id
					
					);
					}
				}catch(e){
					console.log(e)

				}

					try{

					response = await bot.telegram.sendMessage(
						ctx.update.message.chat.id,
						askingConfirmationResponse,
						{parse_mode:'HTML'}
					);
				}catch(e){
					console.log(e)

				}


console.log(response);

					creDish.fooddish_gweight_items_json = JSON.stringify(creDish.fooddish_gweight_items_json);
					
					await DB_CLIENT.query(`
						UPDATE dish_items
						SET ${getStrOfColumnNamesAndTheirSettedValues(creDish)}
						WHERE id = ${userLastCommand.data.dish_items_ids[0]}
					;`);

				let row = {};
				row.creation_date = creation_date;
				row.command = userLastCommand.command;
				row.tg_user_id = userInfo.tg_user_id;
				row.confirmation = true;
				row.can_it_be_canceled = true;

				row.data = {};
				row.data.action = `change total weight`
				row.data.dish_items_ids = [userLastCommand.data.dish_items_ids[0]];
				row.data.message_id = response?.message_id;
				row.data = JSON.stringify(row.data);

				let paramQuery = {};
				paramQuery.text = `
					INSERT INTO telegram_user_sended_commands
					(${objKeysToColumnStr(row)})
					VALUES
					(${objKeysToColumn$IndexesStr(row)})
				;`;
				paramQuery.values = getArrOfValuesFromObj(row);
				await DB_CLIENT.query(paramQuery);
					// telegram_user_sended_commands
				} else if (Array.isArray(re_result = text.toLowerCase().match(/^с$/u))) {
					//add to fooddish ids
					const documents = [];
					const doc = {};

				let row = {};
				row.dish_items_id = userLastCommand.data.dish_items_ids[0];
					
				let paramQuery = {};
				paramQuery.text = `
					INSERT INTO fooddish_ids_for_meilisearch
					(${objKeysToColumnStr(row)})
					VALUES
					(${objKeysToColumn$IndexesStr(row)})
					RETURNING	id
				;`;
				paramQuery.values = getArrOfValuesFromObj(row);
				let res = await DB_CLIENT.query(paramQuery);

				doc.id = Number(res.rows[0].id);

				res = await DB_CLIENT.query(`
							SELECT name__lang_code_ru, protein, fat, caloric_content, carbohydrate, tg_user_id
							FROM dish_items
							WHERE id = ${userLastCommand.data.dish_items_ids[0]}
						;`);
				let el = res.rows[0];
		
		doc.dish_items_id = Number(userLastCommand.data.dish_items_ids[0]);
		doc.name__lang_code_ru = el.name__lang_code_ru;
		doc.tg_user_id = Number(el.tg_user_id);
		doc.created_by_project = false;
		doc.protein = el.protein?Number(el.protein):0;
		doc.fat = el.fat?Number(el.fat):0;
		doc.carbohydrate = el.carbohydrate ?Number(el.carbohydrate):0;
		doc.caloric_content = el.caloric_content ? Number( el.caloric_content ) : 0;
		documents.push(doc);
					//add to meilisearch
	await MSDB.addDocuments(documents);



				row = {};
				row.creation_date = creation_date;
				row.command = 'SAVE_DISH';
				row.tg_user_id = userInfo.tg_user_id;

				row.data = {};
				row.data.dish_items_ids = [userLastCommand.data.dish_items_ids[0]];
				row.data = JSON.stringify(row.data);

				paramQuery = {};
				paramQuery.text = `
					INSERT INTO telegram_user_sended_commands
					(${objKeysToColumnStr(row)})
					VALUES
					(${objKeysToColumn$IndexesStr(row)})
				;`;
				paramQuery.values = getArrOfValuesFromObj(row);
				await DB_CLIENT.query(paramQuery);


				} else {
					ctx.reply(`не понимаю команду`)
				}
			}
			console.log(text, re_result)

		}

	//}


});

bot.on(`callback_query`, async ctx => {
	console.log(
		`____________callback_____________`,
		JSON.stringify(ctx.update),
		/* ctx.update,
		ctx, */
		`____________callbavk_____________`
	);

	const tableNames = {};
	tableNames.food_items = `fi`;
	


	const callbackQuery = ctx.update.callback_query;
	
	if(callbackQuery.from.id != 2147423284) {
		return;
	}

	// const userLastCommand ;
	
	const userInfo = await HZ.getTelegramUserInfo(DB_CLIENT, callbackQuery.from.id);
	
	const reFoodItems = new RegExp(`${tableNames.food_items}(\\d+)uid(\\d+)`,)
	let re_result;
	
	if (re_result = callbackQuery.data.match(reFoodItems)) {
		
		if (re_result[2] != userInfo.tg_user_id) {
			return;
		}

		const maxNumberOfLines = 10;//25

		let selectedPage = Number(re_result[1]);

		let numberOfPages = userInfo.available_count_of_user_created_fi / maxNumberOfLines;
		const numberOfPagesRound = Math.round(numberOfPages);
		const numberOfPagesFloor = Math.floor(numberOfPages);
		numberOfPages = numberOfPagesRound > numberOfPagesFloor ? numberOfPagesRound : numberOfPagesFloor + 1;

		const pages = {};
		pages.first = 1;
		pages.selected = selectedPage;
		pages.last = numberOfPages;

		if (numberOfPages == 1) {
			pages.movePrevious = 1;
			pages.movePreviousMinusFive = 1;
			pages.selected = 1;
			pages.moveNext = 1;
			pages.moveNextPlusFive = 1;
		} else if (numberOfPages > 1) {
			pages.moveNext = selectedPage + 1;
			if (pages.moveNext > numberOfPages) {
				pages.moveNext = numberOfPages;
			}

			pages.moveNextPlusFive = selectedPage + 6;
			if (pages.moveNextPlusFive > numberOfPages - 1) {
				pages.moveNextPlusFive = selectedPage + Math.round((numberOfPages - selectedPage ) / 2);
			}
		}

		if (selectedPage > numberOfPages){
			selectedPage = numberOfPages;

			pages.selected = numberOfPages;
			pages.moveNext = numberOfPages;
			pages.moveNextPlusFive = numberOfPages;
		}

		if (selectedPage > 1) {
			pages.movePrevious = selectedPage - 1;
			pages.movePreviousMinusFive = selectedPage - 6;
			if (pages.movePreviousMinusFive < 1) {
				pages.movePreviousMinusFive = Math.floor(selectedPage / 2);
			}
		} else {
			pages.movePrevious = 1;
			pages.movePreviousMinusFive = 1;
		}

		let ucfi_offset_string = ``;
		if (selectedPage > 1) {
			const ucfi_offset = maxNumberOfLines * (selectedPage - 1);
			ucfi_offset_string = `OFFSET ${ucfi_offset}`;
		}

				const makeUnderlineIDOfUserCreatedFI = id => {
					const str = String(id);
					const maxStrIDLength = 4;
					
					let result = ``;

					for (let i = 0, diff = maxStrIDLength - str.len; i < diff; i++) {
						result += `_`;
					}

					return result;
				};


				let message = `<b>Cписок созданной еды.</b> Всего: <b>${userInfo.available_count_of_user_created_fi}</b>.\n<b>ID</b>   БЖУК (на 100г) <b><i>Название еды</i></b>`;

					const res = await DB_CLIENT.query(`
						SELECT view_json, fi_id_for_user, name__lang_code_ru
						FROM food_items
						WHERE tg_user_id = ${userInfo.tg_user_id}
						AND deleted = false
						ORDER BY fi_id_for_user DESC
						LIMIT ${maxNumberOfLines}
						${ucfi_offset_string}
					;`);


				const addCharBeforeValue = (value, maxLength, charS) => {
					let str = Number(value).toFixed(1);
					
					let result = ``;

					for (let i = 0, diff = maxLength - str.length; i < diff; i++) {
						result += charS;
					}
					result += str;

					return result;
				};
		
					

				res.rows.forEach(e => {
					message += `\n<code>${e.fi_id_for_user}</code> Б:${
						addCharBeforeValue(e.view_json.protein ? e.view_json.protein : 0, 4, '_')} Ж:${
						addCharBeforeValue(e.view_json.fat ? e.view_json.fat : 0, 4, '_')} У:${
						addCharBeforeValue(e.view_json.carbohydrate ? e.view_json.carbohydrate : 0, 4, '_')} К:${
						addCharBeforeValue(e.view_json.caloric_content ? e.view_json.caloric_content : 0, 5, '_')} <i>${
						e.name__lang_code_ru}</i> `
				});


				const makeInlineKeyboard = (pages, tableName, uid) => {
					return telegraf.Markup.inlineKeyboard([[
							telegraf.Markup.button.callback(`${pages.first}`, `${tableName + pages.first}uid${uid}`),
							telegraf.Markup.button.callback(`${pages.movePreviousMinusFive}<<`, `${tableName + pages.movePreviousMinusFive}uid${uid}`),
							telegraf.Markup.button.callback(`${pages.movePrevious}<`, `${tableName + pages.movePrevious}uid${uid}`),
							telegraf.Markup.button.callback(`${pages.selected}`, `${tableName + pages.selected}uid${uid}`),
							telegraf.Markup.button.callback(`>${pages.moveNext}`, `${tableName + pages.moveNext}uid${uid}`),
							telegraf.Markup.button.callback(`>>${pages.moveNextPlusFive}`, `${tableName + pages.moveNextPlusFive}uid${uid}`),
							telegraf.Markup.button.callback(`${pages.last}`, `${tableName + pages.last}uid${uid}`)
					]]);
				}

				const inlineKeyboard = makeInlineKeyboard(pages, `fi`, userInfo.tg_user_id);
					
					
let response;
					if ( message.replaceAll(/<\w+>|<\/\w+>|\s+/g, ``) == callbackQuery.message.text.replaceAll(/\s+/g, ``)) {
						try{
							response =	await bot.telegram.answerCbQuery(callbackQuery.id);
						} catch(e) {
							console.log(e)
						}

		console.log(
			response
		);
						return;
					}

					inlineKeyboard.parse_mode = 'HTML';
					inlineKeyboard.protect_content = true;


		try {		
				 response = await bot.telegram.editMessageText(
					callbackQuery.message.chat.id,
					callbackQuery.message.message_id,
					``,
					message,
					 inlineKeyboard
				); 
		} catch (e) {
			console.error(e);
		}		

		console.log(
			response
		);

	}


});

bot.on(`inline_query`, async ctx => {
	console.log(
		`____________inline_____________`,
		JSON.stringify(ctx.update),
//		ctx.update,
//		ctx,
		`____________inline_____________`
	);
	
	if(ctx.update.inline_query.from.id != 2147423284) {
		return;
	}

	if (ctx.update.inline_query.from.is_bot) {
		return;
	}

	const userInfo = await HZ.getTelegramUserInfo(DB_CLIENT, ctx.update.inline_query.from.id);
	
	const userLastCommand = (await DB_CLIENT.query(`
			SELECT *
			FROM telegram_user_sended_commands
			WHERE tg_user_id = ${userInfo.tg_user_id}
			ORDER BY id DESC
			limit 1;
		`)).rows[0];

	let re_result;
		
	let text = ctx.update.inline_query.query;
	text = text.replaceAll(/\s+/g, ` `);

	console.log(userLastCommand);

	const makeInputMessageContent = text => {
		return {
			message_text : text
		}
	}

	const makeInlineQueryResultArticle = (id, title, inputMessageContent, description) => {
		return {
			type: `article`,
			id: id,
			title: title,
			input_message_content: inputMessageContent,
			description: description,
		};
	}

	console.log(userInfo);

	if (!userLastCommand.confirmation) {

	} else {
		if (userLastCommand.command == 'CREATE_DISH'){
			if (Array.isArray(re_result = text.toLowerCase().match(RE_RU_INLINE_COMMAND__ADD_INGREDIENT_TO_DISH))) {
				console.log(re_result);

				const userInputWeight = Number(re_result[1].replaceAll(/,/g, '.'));
				const userInputIngredientName = text.slice(re_result[0].length).trim().replaceAll(/\:\{\}\[\]\;/g, ``).slice(0, 128);
				console.log(userInputIngredientName);
				
				let articleIdPart = Date.now().toString();
				articleIdPart = articleIdPart.slice(articleIdPart.length-6);

				let filter_NutrientName, filter_lessMore;
				let noRes_BJUK, noRes_lessMore;
				if (re_result[7] == `б`) {
					filter_NutrientName = `protein`;
					noRes_BJUK = `БЕЛКОВ`;
				} else if (re_result[7] == `ж`) {
					filter_NutrientName = `fat`;
					noRes_BJUK = `ЖИРОВ`;
				} else if (re_result[7] == `у`) {
					filter_NutrientName = `carbohydrate`;
					noRes_BJUK = `УГЛЕВОДОВ`;
				} else if (re_result[7] == `к`) {
					filter_NutrientName = `caloric_content`;
					noRes_BJUK = `КАЛОРИЙ`;
				}
				if (re_result[9] == `<`) {
					filter_lessMore = '<=';
					noRes_lessMore = `МЕНЕЕ`;
				} else if (re_result[9] == `>`) {
					filter_lessMore = '>=';
					noRes_lessMore = `БОЛЕЕ`;
				}

				let userAdditionFilter = ``;
				if (filter_NutrientName) {
					userAdditionFilter += ` AND ${filter_NutrientName} ${filter_lessMore} ${re_result[11]}`;
				}

				//search in MSDB
				const res = await meiliSClient.multiSearch({
					queries:[
						{
							indexUid: 'foodDishNames',
							q: userInputIngredientName,
							filter: `tg_user_id = ${userInfo.tg_user_id} OR created_by_project = true AND dish_items_id IS NULL${userAdditionFilter}`,
							limit: 25
						},
						{
							indexUid: `foodDishNames`,
							q: userInputIngredientName,
							filter:	`tg_user_id = ${userInfo.tg_user_id} OR created_by_project = true AND food_items_id IS NULL${userAdditionFilter}`,
							limit: 25
						}
					]
				});

				console.log(JSON.stringify(res));
				
				const addCharBeforeValue = (value, maxLength, charS) => {
					let str = Number(value).toFixed(1);
					
					let result = ``;

					for (let i = 0, diff = maxLength - str.length; i < diff; i++) {
						result += charS;
					}
					result += str;

					return result;
				};

				if(res.results[0].hits.length || res.results[1].hits.length) {
					let inlineQueryResultArticles = [];

					res.results.forEach(r => {
						r.hits.forEach(el => {
							let inputMessageContent;
							if (el.food_items_id){
								inputMessageContent = makeInputMessageContent(`food${el.food_items_id}w${userInputWeight}`)
							} else {
								inputMessageContent = makeInputMessageContent(`dish${el.dish_items_id}w${userInputWeight}`)
							}
							let description = `Б:${
								addCharBeforeValue(el.protein, 6, '_')} Ж:${
								addCharBeforeValue(el.fat, 6, '_')} У:${
								addCharBeforeValue(el.carbohydrate, 6, '_')} К:${
								addCharBeforeValue(el.caloric_content, 7, '_')} на 100 грамм\nБ:${
								addCharBeforeValue(el.protein * userInputWeight / 100, 6, '_')} Ж:${
								addCharBeforeValue(el.fat * userInputWeight / 100, 6, '_')} У:${
								addCharBeforeValue(el.carbohydrate * userInputWeight / 100, 6, '_')} К:${
								addCharBeforeValue(el.caloric_content * userInputWeight / 100, 7, '_')} на ${userInputWeight} грамм`;

							inlineQueryResultArticles.push(
								makeInlineQueryResultArticle(
										`cDishItem${userInfo.tg_user_id}${articleIdPart}${el.id}`,
										el.name__lang_code_ru,
										inputMessageContent,
										description	
									)
							);
						});
					});

					for (let i = 0; i < inlineQueryResultArticles.length; i++) {
						for (let k = i + 1; k < inlineQueryResultArticles.length; k++) {
							if (inlineQueryResultArticles[i].id == inlineQueryResultArticles[k].id) {
								inlineQueryResultArticles.splice(k, 1);
								k--;
								i--;
							}
						}
					}

					ctx.answerInlineQuery(
						inlineQueryResultArticles,
						{
							is_personal:true,
							cache_time:60
						}
					);
					return;
				}

				let description = `с `;
				
				if (noRes_BJUK){
					description += `количеством   ${noRes_BJUK} ${noRes_lessMore} ${re_result[11]}   на 100 грамм\nи `;
				}

				description += `именем "${userInputIngredientName}"`;

				ctx.answerInlineQuery([
					makeInlineQueryResultArticle(
							`cDishNoItem${userInfo.tg_user_id}${articleIdPart}`,
							`Ингредиент не найден`,
							makeInputMessageContent(`Вы в процессе создания блюда.`),
							description
						)
					],
					{
						is_personal:true,
						cache_time:60
					}
				);
			} else {
				if (!ctx.update.inline_query.query) {
					ctx.answerInlineQuery([
						makeInlineQueryResultArticle(
								`cDishEmptyQ${userInfo.tg_user_id}`,
								`Вы в процессе создания блюда.`,
								makeInputMessageContent(`Вы в процессе создания блюда.`),
								`Поиск и добавление ингредиента:\n@edac_bot 123 ж>10 филе\n@edac_bot 321.4 арбуз`
							)
						],
						{is_personal:true}
					);
					return;
				}
				ctx.answerInlineQuery([
					makeInlineQueryResultArticle(
							`cDishNoMatch${userInfo.tg_user_id}`,
							`Не понимаю команду.`,
							makeInputMessageContent(`Вы в процессе создания блюда.`),
							`Поиск и добавление ингредиента:\n@edac_bot 123 ж>10 филе\n@edac_bot 321.4 арбуз`
					)
					],
					{is_personal:true}
				);
			}			
		} else if (userLastCommand.command == 'CREATE_DAY') {

			
		}
	}

	return;	

	if (Array.isArray(re_result = text.toLowerCase().match(RE_RU_BOT_AND_INLINE_COMMAND__GET_STATS))) {	
		console.log(re_result);
	} else if (Array.isArray(re_result = text.toLowerCase().match(RE_RU_INLINE_COMMAND__SHARE_CREATED_FOOD_OR_DISH))) {
		console.log(re_result);
		console.log(re_result);
		
		//search in db
		const re_str_arr = re_result[3].split(/\s+/);

		
		// const res = await DB_CLIENT.query();

		// searchBuiltinUserFoodAndDishes()//str arr([str, str], 50/*limit*/) and str, str etc, 50

		//make results
		//send response


		

		console.log(re_result);
	} else {
		//nichego ne naydeno ili komanda ne raspoznana //ssilka
		//ctx.answerInlineQuery(results);
	}
	
	/* const res = await DB_CLIENT.query(`
			SELECT * from food_images as fi where fi.id = 55;
		`);
	
	const InputTextMessageContent = {
		message_text: `message text`,
	}

	const article = {
		type: `article`,
		id: `sasiher`,
		title: `Title`,
		input_message_content: InputTextMessageContent,
		description: `description 1t23f3 gg5e desc .`,
	}
	result.push(Object.assign({}, article));
	article.id = `8heog`;
	result.push(article);

	ctx.answerInlineQuery(results); */
	
});
bot.launch()

process.on('beforeExit', (...code)=>{
console.log(code,`be`);
	});  
process.on('disconnect', (...code)=>{
console.log(code,`dis`);
	});  
process.on('message', (...code)=>{
console.log(code,`mes`);
	});  
process.on('multipleResolves', (...code)=>{
console.log(code,`mul`);
	});  
process.on('rejectionHandled', (...code)=>{
console.log(code,`reg`);
	});  
process.on('warning', (...code)=>{
console.log(code,`war`);
	});  
process.on('worker', (...code)=>{
console.log(code,`w`);
	});  

process.once('SIGSEGV', (...info)=>{console.log('SIGSEGV', info)})
process.once('SIGFPE', (...info)=>{console.log('SIGFPE', info)})
process.once('SIGABRT', (...info)=>{console.log('SIGABRT', info)})
process.once('SIGALRM', (...info)=>{console.log('SIGALRM', info)})
process.once('SIGBUS', (...info)=>{console.log('SIGBUS', info)})
process.once('SIGCHLD', (...info)=>{console.log('SIGCHLD', info)})
process.once('SIGCLD', (...info)=>{console.log('SIGCLD', info)})
process.once('SIGCONT', (...info)=>{console.log('SIGCONT', info)})
process.once('SIGEMT', (...info)=>{console.log('SIGEMT', info)})
process.once('SIGHUP', (...info)=>{console.log('SIGHUP', info)})
process.once('SIGILL', (...info)=>{console.log('SIGILL', info)})
process.once('SIGINFO', (...info)=>{console.log('SIGINFO', info)})
process.once('SIGPWR', (...info)=>{console.log('SIGPWR', info)})
process.once('SIGINT', (...info)=>{console.log('SIGINT', info)})
process.once('SIGIO', (...info)=>{console.log('SIGIO', info)})
process.once('SIGIOT', (...info)=>{console.log('SIGIOT', info)})
process.once('SIGLOST', (...info)=>{console.log('SIGLOST', info)})
process.once('SIGPIPE', (...info)=>{console.log('SIGPIPE', info)})
process.once('SIGPOLL', (...info)=>{console.log('SIGPOLL', info)})
process.once('SIGPROF', (...info)=>{console.log('SIGPROF', info)})
process.once('SIGQUIT', (...info)=>{console.log('SIGQUIT', info)})
process.once('SIGSTKFLT', (...info)=>{console.log('SIGSTKFLT', info)})
process.once('SIGTSTP', (...info)=>{console.log('SIGTSTP', info)})
process.once('SIGSYS', (...info)=>{console.log('SIGSYS', info)})
process.once('SIGTERM', (...info)=>{console.log('SIGTERM', info)})
process.once('SIGTRAP', (...info)=>{console.log('SIGTRAP', info)})
process.once('SIGTTIN', (...info)=>{console.log('SIGTTIN', info)})
process.once('SIGTTOU', (...info)=>{console.log('SIGTTOU', info)})
process.once('SIGUNUSED', (...info)=>{console.log('SIGUNUSED', info)})
process.once('SIGURG', (...info)=>{console.log('SIGURG', info)})
process.once('SIGUSR1', (...info)=>{console.log('SIGUSR1', info)})
process.once('SIGUSR2', (...info)=>{
	
	APP_STATE.isDBdead = true;

	DB_CLIENT.end();
	
  console.log('bye');

	console.log('SIGUSR2', info)})
process.once('SIGVTALRM', (...info)=>{console.log('SIGVTALRM', info)})
process.once('SIGXCPU', (...info)=>{console.log('SIGXCPU', info)})
process.once('SIGXFSZ', (...info)=>{console.log('SIGXFSZ', info)})
process.once('SIGWINCH', (...info)=>{console.log('SIGWINCH', info)})
process.once('SIGRTMIN', (...info)=>{console.log('SIGRTMIN', info)})
process.once('SIGRTMAX', (...info)=>{console.log('SIGRTMAX', info)})
process.once('EINTR', (...info)=>{console.log('EINTR', info)})



process.on('exit', (code) => {

	APP_STATE.isDBdead = true;

	DB_CLIENT.end();

  console.log(`About to exit with code: ${code}`);
});

process.once('SIGINT', () => {
	bot.stop('SIGINT');

	APP_STATE.isDBdead = true;

	DB_CLIENT.end()

  process.exit();

  console.log('bye');

})
process.once('SIGTERM', () => bot.stop('SIGTERM'))

console.log(

);

};

app();

