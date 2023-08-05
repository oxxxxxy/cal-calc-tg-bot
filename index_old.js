/* 





*/

const telegraf = require(`telegraf`);
const pg = require(`pg`);

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

const RE_RU_YES = /^(д|да)$/u;
const RE_RU_NO = /^(н|нет)$/u;
const RE_RU_COMMAND__DELETE_LAST_ACTION = /^(у|удалить)$/u;
const RE_RU_COMMAND__CANCEL_LAST_ACTION = /^(о|отмена)$/u;

const RE_RU_COMMAND__CREATE_FOOD = /^(се\s+)((([а-яА-Яa-zA-Z0-9]+)(\s+|))+)\./u;
// /^(с|создать)(\s+|)(е|еду)\s+((([а-яА-Яa-zA-Z0-9]+)(\s+|)){5,})(\s+|)\((\s+|)((([а-яА-Яa-zA-Z0-9]+)(\s+|):(\s+|)(\d+(\s+|)(,|\.)(\s+|)\d+|\d+)(\s+|)(г|мкг|мг|ккал)(\s+|))+)\)$/u;
// ^(с|создать)(\s+|)(е|еду)\s+((([а-яА-Яa-zA-Z0-9]+)(\s+|)){5,})(\s+|)\((\s+|)([а-яА-Яa-zA-Z0-9\s]+)(\s+|)\)$
// ^(с|создать)(\s+|)(е|еду)\s+((([а-яА-Яa-zA-Z0-9]+)(\s+|)){5,})(\s+|)\(
const RE_RU_COMMAND__SHOW_CREATED_FOOD = /^псе$/u;
const RE_RU_COMMAND__DELETE_CREATED_FOOD_IDs = /^уе/u;//(([0-9]+(\s+|)|[0-9]+)+)$/u;

const RE_RU_COMMAND__CREATE_DISH = /^(сб\s+)((([а-яА-Яa-zA-Z0-9]+)(\s+|))+)$/u;
const RE_RU_COMMAND__EDIT_DISH = /^рб(\s+|)([0-9]+)$/u;
	const RE_RU_COMMAND__DELETE_INGREDIENT_FROM_DISH = /^у/u;
	const RE_RU_COMMAND__EDIT_INGREDIENT_WEIGHT_IN_DISH = /^ви/u;
const RE_RU_COMMAND__SAVE_DISH_FINAL_WEIGHT = /^и/u;
const RE_RU_COMMAND__SAVE_DISH = /^с$/u;
const RE_RU_COMMAND__DELETE_CREATED_DISH_IDs = /^уб/u; 
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
	const RE_RU_INLINE_COMMAND__ADD_INGREDIENT_TO_DISH = /^/u;
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
	} else if (!!ctx.update.edited_message) {// ??? check them or not?
		from = ctx.update.edited_message.from;
		date = ctx.update.edited_message.date;
		console.log(`edited_message`);
	} else if (!!ctx.update.inline_query) {
		from = ctx.update.inline_query.from;
		date = ctx.update.inline_query.date;
		console.log(`inline_query`);
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

	//antispam validaciya
	if (!TG_USERS_LAST_ACTION_TIME[`${from.id}`] || date - TG_USERS_LAST_ACTION_TIME[`${from.id}`][0] > 1) {
		TG_USERS_LAST_ACTION_TIME[`${from.id}`] = [date];
	} else if (date - TG_USERS_LAST_ACTION_TIME[`${from.id}`][0] == 1 && TG_USERS_LAST_ACTION_TIME[`${from.id}`].length < 3) {
		TG_USERS_LAST_ACTION_TIME[`${from.id}`].push(date);
	} else {
		return;
	}


	HZ.checkTelegramUserExistentAndRegistryHimIfNotExists(DB_CLIENT, from.id, from.is_bot);

	if (process.env.TRACKMODE) {
		HZ.trackTelegramUserAccountDataChanges(DB_CLIENT, from);
	}


	const reqDate = date * 1000;

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
	/* console.log(
		`________MESSAGE________start`,
		Object.keys( ctx),
		ctx.update,
		ctx,
		`________MESSAGE________end`
	) */

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
		const confirmCommand = (await DB_CLIENT.query(`
			SELECT *
			FROM telegram_user_sended_commands
			WHERE tg_user_id = ${userInfo.tg_user_id}
			AND confirmation 
			limit 1;
		`)).rows[0];

			console.log(
		userInfo,
				confirmCommand
	);
		

		const reqDate = ctx.update.message.date * 1000;	
		let re_result;
	
		if(!ctx.update.message.text){
			return;//
		}

		let text = ctx.update.message.text.replaceAll(/\s+/g, ` `).trim();
	
		if(!confirmCommand){
	
			if (Array.isArray(re_result = text.toLowerCase().match(RE_RU_COMMAND__DELETE_LAST_ACTION))) {
				const userLastCommand = (await DB_CLIENT.query(`
						SELECT *
						FROM telegram_user_sended_commands
						WHERE	tg_user_id = ${userInfo.tg_user_id}
						ORDER BY id DESC
						LIMIT 1;
				`)).rows[0];

				console.log(userLastCommand);

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
				const userLastCommand = (await DB_CLIENT.query(`
						SELECT *
						FROM telegram_user_sended_commands
						WHERE	tg_user_id = ${userInfo.tg_user_id}
						ORDER BY id DESC
						LIMIT 1;
				`)).rows[0];

				console.log(userLastCommand);

				if (!userLastCommand.can_it_be_canceled){
					ctx.reply(`Прости, не знаю, что отменить... Т_Т`);
					return;
				}
				
				if (userLastCommand.command == `DELETE_FOOD`) {
					//cancel deleted true food_items
					await DB_CLIENT.query(`
						UPDATE food_items
						SET deleted = false
						WHERE	id IN (${userLastCommand.data.food_items_ids.join()})
					;`);

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

				let row = {};
				row.creation_date = new Date(reqDate).toISOString();
				row.tg_user_id = ctx.update.message.from.id;
				row.view_json = {};
				row.name__lang_code_ru = foodName;

				foodNutrientMatches.forEach(e => {
					row.view_json[e.nutrientName] = e[e.nutrientName];
					row[e.nutrientName] = e[e.nutrientName];
				});

				row.view_json = JSON.stringify(row.view_json);

				userInfo.count_of_user_created_fi = userInfo.count_of_user_created_fi ? Number(userInfo.count_of_user_created_fi) + 1 : 1;
				row.fi_id_for_user = userInfo.count_of_user_created_fi;

				askingConfirmationResponse += `\n\`\`\`\nЕда ID:\`\`\`${userInfo.count_of_user_created_fi}\`\`\`\n\nОшибка? Отправьте *"у/удалить"*.`;

				let paramQuery = {};
				paramQuery.text = `
					INSERT INTO food_items
					(${objKeysToColumnStr(row)})
					VALUES
					(${objKeysToColumn$IndexesStr(row)})
					RETURNING id;`;
				paramQuery.values = getArrOfValuesFromObj(row);
				const foodItemsRes = await db.query(paramQuery);
				//do u remember me?
				/* await db.query(`
					INSERT INTO search_all_food
					(name_tsv, user_created_food_items_id, r_user_id)
					VALUES
					(to_tsvector('simple', '${row.user_food_name}'),
					${idOfucfi},
					${row.r_user_id});
				`); */




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

				let dishSheetHead = `\n<u>|<b>№_|Б:____.__|Ж:____.__|У:____.__|К:_____.__|Вес:_._ (г)</b>  <i>Ингредиент</i></u>`;

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
					addCharBeforeValue(0, 6, '_')}|Ж:${
					addCharBeforeValue(0, 6, '_')}|У:${
					addCharBeforeValue(0, 6, '_')}|К:${
					addCharBeforeValue(0, 7, '_')}|В:_100.0</b></u> Итоговый БЖУК на 100 грамм.`;

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

				


			/* } else if (Array.isArray(re_result = text.toLowerCase().match(RE_RU_COMMAND__EDIT_CREATED_FOOD_OR_DISH))) {
				console.log(re_result);			 */
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
					let row = {};

					let paramQuery = {};
					paramQuery.text = `
						SELECT fi_id_for_user
						FROM food_items
						WHERE tg_user_id = ${userInfo.tg_user_id}
						AND fi_id_for_user = ANY (ARRAY[${fi_id_for_userArr.join(', ')}])
						AND deleted
					;`;

					let res = await DB_CLIENT.query(paramQuery);

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
				

					/*
					// update deleted search_all_food rows
					row = {};
					row.deleted = true;

					paramQuery = {};
					paramQuery.text = `
						UPDATE search_all_food
						SET ${getStrOfColumnNamesAndTheirSettedValues(row)}
						WHERE r_user_id = ${userInfo.r_user_id}
						AND user_created_food_items_id = ANY (ARRAY[${ucfi_ids_for_user_arr.join(', ')}])
					;`;
					await DB_CLIENT.query(paramQuery);
					*/

					// update deleted ucfi rows   
					row = {};
					row.deleted = true;

					paramQuery = {};
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
			if (confirmCommand.command == `CREATE_DISH` || confirmCommand.command == `EDIT_DISH`){
				if (Array.isArray(re_result = text.toLowerCase().match())) {

				}


			}

			if (Array.isArray(re_result = text.toLowerCase().match(RE_RU_YES))) {
				console.log(re_result);

				switch (confirmCommand.command) {
					case `CREATE_FOOD`:						
						await COMMAND__CREATE_FOOD__YES(confirmCommand, userInfo, DB_CLIENT);
						ctx.reply(`Еда создана успешно.`);
						break;
		
					default:
						break;
				}
				
			} else if (Array.isArray(re_result = text.toLowerCase().match(RE_RU_NO))) {
				console.log(re_result);
				
				switch (confirmCommand.command) {
					case `CREATE_FOOD`:
						await COMMAND__CREATE_FOOD__NO(DB_CLIENT, confirmCommand.id);
						ctx.reply(`Создание еды отменено.`);
						break;
		
					default:
						break;
				}
				console.log(re_result);			
			} else {
				ctx.reply(`Завершите операцию.`);	
			}
		}

	//}


});

/*
 *{"update_id":517932729,"message":{"message_id":9,"from":{"id":2147423284,"is_bot":false,"first_name":"АРЧㅤ","language_code":"en"},"chat":{"id":2147423284,"first_name":"АРЧㅤ","type":"private"},"date":1657435311,"text":"gtybc"}} Context {
 {"update_id":517932732,"message":{"message_id":10,"from":{"id":2147423284,"is_bot":false,"first_name":"АРЧㅤ","language_code":"en"},"chat":{"id":2147423284,"first_name":"АРЧㅤ","type":"private"},"date":1657435343,"text":"message text","via_bot":{"id":5467847506,"is_bot":true,"first_name":"Тест","username":"edac_bot"}}}
 {"update_id":517932734,"message":{"message_id":11,"from":{"id":2147423284,"is_bot":false,"first_name":"АРЧㅤ","language_code":"en"},"chat":{"id":2147423284,"first_name":"АРЧㅤ","type":"private"},"date":1657436156,"forward_from":{"id":2147423284,"is_bot":false,"first_name":"АРЧㅤ","language_code":"en"},"forward_date":1657436149,"text":"message text","via_bot":{"id":5467847506,"is_bot":true,"first_name":"Тест","username":"edac_bot"}}}
 {"update_id":517932737,"message":{"message_id":13,"from":{"id":2147423284,"is_bot":false,"first_name":"АРЧㅤ","language_code":"en"},"chat":{"id":-792733748,"title":"ботовая","type":"group","all_members_are_administrators":true},"date":1657442887,"text":"a"}}
 {"update_id":517932738,"my_chat_member":{"chat":{"id":-1001579743247,"title":"ботовая","type":"channel"},"from":{"id":2147423284,"is_bot":false,"first_name":"АРЧㅤ","language_code":"en"},"date":1657446953,"old_chat_member":{"user":{"id":5467847506,"is_bot":true,"first_name":"Тест","username":"edac_bot"},"status":"left"},"new_chat_member":{"user":{"id":5467847506,"is_bot":true,"first_name":"Тест","username":"edac_bot"},"status":"administrator","can_be_edited":false,"can_manage_chat":true,"can_change_info":true,"can_post_messages":true,"can_edit_messages":true,"can_delete_messages":true,"can_invite_users":true,"can_restrict_members":true,"can_promote_members":false,"can_manage_video_chats":true,"is_anonymous":false,"can_manage_voice_chats":true}}}
{"update_id":517932833,"inline_query":{"id":"9223112777671489909","from":{"id":2147423284,"is_bot":false,"first_name":". _","last_name":".","username":"zov_hohol","language_code":"en"},"chat_type":"sender","query":"435 г фаыв","offset":""}} 
{"update_id":517932826,"my_chat_member":{"chat":{"id":2147423284,"first_name":". _","last_name":".","username":"zov_hohol","type":"private"},"from":{"id":2147423284,"is_bot":false,"first_name":". _","last_name":".","username":"zov_hohol","language_code":"en"},"date":1658606052,"old_chat_member":{"user":{"id":5467847506,"is_bot":true,"first_name":"Тест","username":"edac_bot"},"status":"member"},"new_chat_member":{"user":{"id":5467847506,"is_bot":true,"first_name":"Тест","username":"edac_bot"},"status":"kicked","until_date":0}}} Context 
"update_id":517932827,"my_chat_member":{"chat":{"id":2147423284,"first_name":". _","last_name":".","username":"zov_hohol","type":"private"},"from":{"id":2147423284,"is_bot":false,"first_name":". _","last_name":".","username":"zov_hohol","language_code":"en"},"date":1658607560,"old_chat_member":{"user":{"id":5467847506,"is_bot":true,"first_name":"Тест","username":"edac_bot"},"status":"kicked","until_date":0},"new_chat_member":{"user":{"id":5467847506,"is_bot":true,"first_name":"Тест","username":"edac_bot"},"status":"member"}}} Context {
{"update_id":517932828,"message":{"message_id":36,"from":{"id":2147423284,"is_bot":false,"first_name":". _","last_name":".","username":"zov_hohol","language_code":"en"},"chat":{"id":2147423284,"first_name":". _","last_name":".","username":"zov_hohol","type":"private"},"date":1658607561,"text":"/start","entities":[{"offset":0,"length":6,"type":"bot_command"}]}} Context {

 *
 * */
bot.on(`callback_query`, async ctx => {
	console.log(
		`____________callback_____________`,
		JSON.stringify(ctx.update),
		ctx.update,
		ctx,
		`____________callbavk_____________`
	);

	const tableNames = {};
	tableNames.food_items = `fi`;
	


	const callbackQuery = ctx.update.callback_query;
	
	if(callbackQuery.from.id != 2147423284) {
		return;
	}
	
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
					
					const isResponseTextValid = message.replaceAll(/<b>|<\/b>|<i>|<\/i>/g, ``);
					if ( isResponseTextValid == callbackQuery.message.text) {
						return;
					}

					inlineKeyboard.parse_mode = 'HTML';
					inlineKeyboard.protect_content = true;

let response;

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
//		JSON.stringify(ctx),
		ctx.update,
		ctx,
		`____________inline_____________`
	);
	
	if(ctx.update.inline_query.from.id != 2147423284) {
		return;
	}

	if (ctx.update.inline_query.from.is_bot) {
		return;
	}
	
	const results = [];

	let re_result;
		
	const text = ctx.update.inline_query.query;
	text.replaceAll(/\s+/g, ` `);
	
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
		id: `sasehe`,
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

