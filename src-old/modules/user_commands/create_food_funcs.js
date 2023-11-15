const {
	objKeysToColumnStr,
	objKeysToColumn$IndexesStr,
	getArrOfValuesFromObj
} = require(`../queryUtils.js`);

exports.COMMAND__CREATE_FOOD = async (re_result, RE_RU_NUTRIENTS, NUTRIENTS, ISofU, ctx, db, userInfo) => {
	let limit_count_of_user_created_fidi = 60;
	if (!userInfo.privilege_type && userInfo.limit_count_of_user_created_fidi >= limit_count_of_user_created_fidi) {
		return {
			result: false,
			cause: `limit_count_of_user_created_fidi`,
			message: `Вы не можете создавать еду больше ${limit_count_of_user_created_fidi} раз за 24ч.`
		};
	}

	const foodName = (re_result[4].trim()).slice(0, 128);
	const foodNutrientMatches = [];
	let askingConfirmationResponse = `*Всё верно? Введите "да/д" или "нет/н".*\n\n\`\`\`\n${foodName}\n`;
	
	RE_RU_NUTRIENTS.forEach((item, i) => {
		const match = re_result[10].match(item);

		if (Array.isArray(match)) {
			if (match[8] == `ккал` && NUTRIENTS[i].lang_code_ru != `калорийность`) {
				return;
			}

			const obj = NUTRIENTS[i];
			obj.nutrientName = obj.lang_code_en.replaceAll(/\s+/g, `_`);
			let strNutrientValue = match[3].replace(`,`, `.`);
			let dotMatch = strNutrientValue.match(/\./);
			if (Array.isArray(dotMatch)) {
				strNutrientValue = strNutrientValue.slice(0, dotMatch.index + 3);
			}
			obj[obj.nutrientName] = Number(strNutrientValue);
			obj[`${obj.nutrientName}__m_s_term_id`] = ISofU.lang_codes_ru[match[8]];
			foodNutrientMatches.push(obj);
		}
	});

	if (foodNutrientMatches.length == 0){
		ctx.reply(`Нутриентов не обнаружено. Исправьте введённую команду и отправьте ещё раз.\n\n${re_result[0]}`, { parse_mode: 'Markdown' });
		return;
	}

	const convertNutrientFromFoodNutrientMatchesToGramm = nutrient => {
		if (ISofU.ids[nutrient[`${nutrient.nutrientName}__m_s_term_id`]] != `г`) {
			if (ISofU.ids[nutrient[`${nutrient.nutrientName}__m_s_term_id`]] == `мг`) {
				nutrient[nutrient.nutrientName] = nutrient[nutrient.nutrientName] / 1000;
			}
			if (ISofU.ids[nutrient[`${nutrient.nutrientName}__m_s_term_id`]] == `мкг`) {
				nutrient[nutrient.nutrientName] = nutrient[nutrient.nutrientName] / 1000 / 1000;
			}
			nutrient[nutrient.nutrientName] = Number(nutrient[nutrient.nutrientName].toFixed(2));
			nutrient[`${nutrient.nutrientName}__m_s_term_id`] = ISofU.lang_codes_ru[`г`];
		}
		return nutrient;
	}
	
	const findNutrientByNameAndConvertItsToGramm = name => {
		foodNutrientMatches.find((e, i) => {
			if (!!e[name]) {
				foodNutrientMatches[i] = convertNutrientFromFoodNutrientMatchesToGramm(e);
				return true;
			}									
		});
	};

	findNutrientByNameAndConvertItsToGramm(`fat`);
	findNutrientByNameAndConvertItsToGramm(`protein`);
	findNutrientByNameAndConvertItsToGramm(`carbohydrate`);

	if (!foodNutrientMatches.find(el => el.lang_code_ru == `калорийность`)) {
		let caloric_content = 0;
		let nutrient;
		if(!!(nutrient = foodNutrientMatches.find(el => el.fat))){
			caloric_content += nutrient.fat * 9;
		}
		if(!!(nutrient = foodNutrientMatches.find(el => el.protein))){
			caloric_content += nutrient.protein * 4;
		}
		if(!!(nutrient = foodNutrientMatches.find(el => el.carbohydrate))){
			caloric_content += nutrient.carbohydrate * 4;
		}
		const obj = NUTRIENTS.find(el => el.lang_code_ru == `калорийность`);
		obj.nutrientName = obj.lang_code_en.replaceAll(/\s+/g, `_`);
		obj[obj.nutrientName] = caloric_content;
		obj[`${obj.nutrientName}__m_s_term_id`] = ISofU.lang_codes_ru[`ккал`];
		foodNutrientMatches.push(obj);
	}
	
	let isNutrientValueMoreThan1000 = ``;
	foodNutrientMatches.forEach(el => {
		if (el[`${el.nutrientName}__m_s_term_id`] == ISofU.lang_codes_ru[`ккал`] && el[el.nutrientName] > 1000) {
			isNutrientValueMoreThan1000 += `\n${el.lang_code_ru.slice(0,1).toUpperCase() + el.lang_code_ru.slice(1)} не может превышать 1000 кКал.`;
		}
		if (el[`${el.nutrientName}__m_s_term_id`] == ISofU.lang_codes_ru[`г`] && el[el.nutrientName] > 100) {
			isNutrientValueMoreThan1000 += `\n${el.lang_code_ru.slice(0,1).toUpperCase() + el.lang_code_ru.slice(1)} не могут превышать 100 грамм.`;
		}
	});

	if (isNutrientValueMoreThan1000) {
		ctx.reply(isNutrientValueMoreThan1000);
		return;
	}

	let nutrientsInBrackets = `(`;
	foodNutrientMatches.forEach(e => {
		nutrientsInBrackets += `\n  ${e.lang_code_ru}: ${e[e.nutrientName]} ${ISofU.ids[e[`${e.nutrientName}__m_s_term_id`]]}`;
	});
	nutrientsInBrackets += `\n)\`\`\``;

	askingConfirmationResponse += nutrientsInBrackets;
	askingConfirmationResponse += `\n\nПеред подтверждением создания еды проверьте на наличие ошибок, опечаток в названии, на отсутствие каких-либо нутриентов или на их некорректные значения.\n\nЕда, создание которой не завершено, будет удалена через 10 минут.`;

	const row = {};
	row.creation_date = new Date();
	row.life_time_ending = new Date(row.creation_date.valueOf() + 600000);
	row.tg_user_id = ctx.update.message.from.id;
	row.command = `CREATE_FOOD`;
	row.data = {};
	row.data.user_food_name = foodName;

	foodNutrientMatches.forEach(e => {
		row.data[e.nutrientName] = e[e.nutrientName];
		row.data[`${e.nutrientName}__m_s_term_id`] = e[`${e.nutrientName}__m_s_term_id`];
	});

	row.data = JSON.stringify(row.data);
	
	const paramQuery = {};
	paramQuery.text = `
		INSERT INTO telegram_user_commands
		(${objKeysToColumnStr(row)})
		VALUES
		(${objKeysToColumn$IndexesStr(row)});
	`;
	paramQuery.values = getArrOfValuesFromObj(row);
	
	await db.query(paramQuery);
	
	ctx.reply(askingConfirmationResponse, { parse_mode: 'Markdown', allow_sending_without_reply: true });
};

exports.COMMAND__CREATE_FOOD__YES = async (userLastCommand, userInfo, db) => {
	
	if (typeof userInfo.limit_count_of_user_created_fi == `string`) {
		userInfo.limit_count_of_user_created_fi = Number(userInfo.limit_count_of_user_created_fi);
	} else {
		userInfo.limit_count_of_user_created_fi = 0;
	}

	const row = userLastCommand.data;
	row.view_json = JSON.stringify(userLastCommand.data);
	row.creation_date = (new Date()).toISOString();
	row.r_user_id = userInfo.r_user_id;

	userInfo.count_of_user_created_fi = userInfo.count_of_user_created_fi ? Number(userInfo.count_of_user_created_fi) + 1 : 1;
	row.ucfi_id_for_user = userInfo.count_of_user_created_fi;

	let setFirstUCFITimeStr;
	let setLimitCountOfUCFI;

	if (!userInfo.privilege_type) {
		if (!userInfo.first_user_created_fidi_time) {
			setFirstUCFITimeStr = `first_user_created_fidi_time = '${row.creation_date}'`;
		}
		setLimitCountOfUCFI = `limit_count_of_user_created_fi = ${userInfo.limit_count_of_user_created_fi + 1}`;
	}
	
	const paramQuery = {};
	paramQuery.text = `
		INSERT INTO user_created_food_items
		(${objKeysToColumnStr(row)})
		VALUES
		(${objKeysToColumn$IndexesStr(row)})
		RETURNING id;`;
	paramQuery.values = getArrOfValuesFromObj(row);

	const idOfucfi = (await db.query(paramQuery)).rows[0].id;
	await db.query(`
		UPDATE telegram_user_commands
		SET completed = true,
		executed = true,
		can_it_be_removed = true,
		data = '${JSON.stringify({id:idOfucfi})}',
		life_time_ending = null
		WHERE id = ${userLastCommand.id};
	`);

	await db.query(`
		UPDATE registered_users ru
		SET available_count_of_user_created_fi = ucfi.count,
		count_of_user_created_fi = ${userInfo.count_of_user_created_fi}
		${setLimitCountOfUCFI ? ', ' + setLimitCountOfUCFI : ``}
		${setFirstUCFITimeStr ? ', ' + setFirstUCFITimeStr : ``}
		FROM (
			SELECT count(*) AS count
			FROM user_created_food_items ucfi
			WHERE ucfi.r_user_id = ${row.r_user_id}
			AND NOT ucfi.deleted
		) AS ucfi
		WHERE ru.id = ${row.r_user_id};
	`);

	await db.query(`
		INSERT INTO search_all_food
		(name_tsv, user_created_food_items_id, r_user_id)
		VALUES
		(to_tsvector('simple', '${row.user_food_name}'),
		${idOfucfi},
		${row.r_user_id});
	`);
};

exports.COMMAND__CREATE_FOOD__NO = async (db, userLastCommandId) => {
	await db.query(`
		UPDATE telegram_user_commands
		SET completed = true,
		executed = true,
		data = '{}',
		can_it_be_removed = false,
		life_time_ending = null
		WHERE id = ${userLastCommandId};
	`);
};
