const {
	objKeysToColumnStr,
	objKeysToColumn$IndexesStr,
	getArrOfValuesFromObj,
	objKeysValuesToColumnValuesStr
} = require(`./queryUtils.js`);


const createTelegramUser = async (pgClient, tg_user_id, is_bot, creation_date) => {
	const row = {};
	row.tg_user_id = tg_user_id;
	row.is_bot = is_bot;
	row.creation_date = creation_date;

	const paramQuery = {};
	paramQuery.text = `
			INSERT INTO telegram_users
			(${objKeysToColumnStr(row)})
			VALUES
			(${objKeysToColumn$IndexesStr(row)})
		;`;
	paramQuery.values = getArrOfValuesFromObj(row);
	
	await pgClient.query(paramQuery);
}
exports.createTelegramUser = createTelegramUser;

const checkTelegramUserExistentAndCreateHimIfNotExists = async (pgClient, tg_user_id, is_bot, creation_date) => {
	const res = await pgClient.query(`
			SELECT tg_user_id
			FROM telegram_users
			WHERE tg_user_id = ${tg_user_id}
		;`);

	if(!res.rows.length){
		await createTelegramUser (pgClient, tg_user_id, is_bot, creation_date);
	}
}
exports.checkTelegramUserExistentAndCreateHimIfNotExists = checkTelegramUserExistentAndCreateHimIfNotExists;




const renamedColumnsOfTablesTgUsersAndRegUsers = `
	tu.is_banned,
	tu.last_check,
	tu.tg_user_id,
	tu.deleted AS tu_deleted,
	tu.s__lang_code,
	tu.s__utc_s_h_m,
	tu.s__delete_old_ucfi,
	tu.s__delete_old_ucdi,
	ru.internal_use_only AS ru_internal_use_only,
	ru.id AS r_user_id,
	ru.creation_date AS ru_creation_date,
	tu.creation_date AS tu_creation_date,
	ru.first_user_created_fidi_time,
	ru.limit_count_of_user_created_fidi,
	ru.count_of_user_created_fi,
	ru.count_of_user_created_di,
	ru.available_count_of_user_created_fi,
	ru.available_count_of_user_created_di,
	ru.privilege_type,
	ru.last_online
`;

const getNumberFromNumberColumnValue = v =>
	typeof v === null ? 0 : Number(v);

const getTelegramUserInfo = async (pgClient, tg_user_id) => {
	const res = await pgClient.query(`
		SELECT *
		FROM telegram_users
		WHERE tg_user_id = ${tg_user_id}
	;`);

	const userInfo = res.rows[0];

	userInfo.limit_count_of_user_created_fidi = getNumberFromNumberColumnValue(
		userInfo.limit_count_of_user_created_fidi
	);

	userInfo.count_of_user_created_fi = getNumberFromNumberColumnValue(
		userInfo.count_of_user_created_fi
	);
	userInfo.available_count_of_user_created_fi = getNumberFromNumberColumnValue(
		userInfo.available_count_of_user_created_fi
	);

	userInfo.count_of_user_created_di = getNumberFromNumberColumnValue(
		userInfo.count_of_user_created_di
	);
	userInfo.available_count_of_user_created_di = getNumberFromNumberColumnValue(
		userInfo.available_count_of_user_created_di
	);

	return userInfo;
};
exports.getTelegramUserInfo = getTelegramUserInfo;

/*

const getTelegramUserInfo = async (db, tg_user_id) => {
	const res = await db.query(`SELECT
		${renamedColumnsOfTablesTgUsersAndRegUsers}
		FROM telegram_users tu
		LEFT JOIN registered_users ru
		ON tu.tg_user_id = ru.tg_user_id
		WHERE tu.tg_user_id = ${tg_user_id};`);

	return res.rows[0];
};
exports.getTelegramUserInfo = getTelegramUserInfo;

*/

const registryTelegramUser = async (db, tg_user_id, is_bot) => {

	const res = await db.query(`WITH
		tu AS (INSERT INTO telegram_users (
		tg_user_id,
		is_bot,
		count_of_user_created_di,
		count_of_user_created_fi,
		available_count_of_user_created_fi,
		available_count_of_user_created_di
		) VALUES (
		${tg_user_id},
		${is_bot},
		0,0,0,0) RETURNING * ),
		ru AS (INSERT INTO registered_users (tg_user_id) VALUES (${tg_user_id}) RETURNING *)
		SELECT 
		${renamedColumnsOfTablesTgUsersAndRegUsers}
		FROM tu, ru;`);

	return res.rows[0];
};
exports.registryTelegramUser = registryTelegramUser;

const checkTelegramUserExistentAndRegistryHimIfNotExists = async (db, tg_user_id, is_bot) => {
	let tgUserInfo = await getTelegramUserInfo(db, tg_user_id);
	if (!tgUserInfo) {
		tgUserInfo = await registryTelegramUser(db, tg_user_id, is_bot);
	}
	return tgUserInfo;
};
exports.checkTelegramUserExistentAndRegistryHimIfNotExists = checkTelegramUserExistentAndRegistryHimIfNotExists;

const trackTelegramUserAccountDataChanges = async (db, ctxUpdateMessageFrom) => {
	const lastChanges = await db.query(`
		SELECT fn.json ->> 'firstname' as firstname,
		ln.json ->> 'lastname' as lastname,
		un.json ->> 'username' as username,
		lc.json ->> 'lang_code' as lang_code
		FROM (
			SELECT *
			FROM telegram_user_account_data_changes
			WHERE tg_user_id = ${ctxUpdateMessageFrom.id}
			AND is_not_firstname_null
			ORDER BY id DESC
			LIMIT 1)
		AS fn, (
			SELECT *
			FROM telegram_user_account_data_changes
			WHERE tg_user_id = ${ctxUpdateMessageFrom.id}
			AND is_not_lastname_null
			ORDER BY id DESC
			LIMIT 1)
		AS ln, (
			SELECT *
			FROM telegram_user_account_data_changes
			WHERE tg_user_id = ${ctxUpdateMessageFrom.id}
			AND is_not_username_null
			ORDER BY id DESC
			LIMIT 1)
		AS un, (
			SELECT *
			FROM telegram_user_account_data_changes
			WHERE tg_user_id = ${ctxUpdateMessageFrom.id}
			AND is_not_lang_code_null
			ORDER BY id DESC
			LIMIT 1)
		AS lc;
		`);
	const columnsAndItsValues = {};
	columnsAndItsValues.tg_user_id = ctxUpdateMessageFrom.id;
	columnsAndItsValues.json = {};
	const paramQuery = {};
	if (lastChanges.rows.length) {
		if(lastChanges.rows[0].username != ctxUpdateMessageFrom.username){
			columnsAndItsValues.json.username = ctxUpdateMessageFrom.username;
			columnsAndItsValues.is_not_username_null = true;
		}
		if(lastChanges.rows[0].firstname != ctxUpdateMessageFrom.first_name){
			columnsAndItsValues.json.firstname = ctxUpdateMessageFrom.first_name;
			columnsAndItsValues.is_not_firstname_null = true;
		}
		if(lastChanges.rows[0].lastname != ctxUpdateMessageFrom.last_name){
			columnsAndItsValues.json.lastname = ctxUpdateMessageFrom.last_name;
			columnsAndItsValues.is_not_lastname_null = true;
		}
		if(lastChanges.rows[0].lang_code != ctxUpdateMessageFrom.language_code){
			columnsAndItsValues.json.lang_code = ctxUpdateMessageFrom.language_code;
			columnsAndItsValues.is_not_lang_code_null = true;
		}
		if(Object.keys(columnsAndItsValues).length > 2){
			paramQuery.text = `
				INSERT INTO telegram_user_account_data_changes
				(${objKeysToColumnStr(columnsAndItsValues)})
				VALUES
				(${objKeysToColumn$IndexesStr(columnsAndItsValues)})
			;`;
			paramQuery.values = [];
			Object.keys(columnsAndItsValues).forEach(i => {
				if(typeof i == `object`){
					paramQuery.values.push(JSON.stringify(columnsAndItsValues[i]));
				}else{
					paramQuery.values.push(columnsAndItsValues[i]);
				}
			});
			await db.query(paramQuery);
		}
	} else {
		columnsAndItsValues.json.username = ctxUpdateMessageFrom.username;
		columnsAndItsValues.is_not_username_null = true;
		columnsAndItsValues.json.firstname = ctxUpdateMessageFrom.first_name;
		columnsAndItsValues.is_not_firstname_null = true;
		columnsAndItsValues.json.lastname = ctxUpdateMessageFrom.last_name;
		columnsAndItsValues.is_not_lastname_null = true;
		columnsAndItsValues.json.lang_code = ctxUpdateMessageFrom.language_code;
		columnsAndItsValues.is_not_lang_code_null = true;
		paramQuery.text = `
			INSERT INTO telegram_user_account_data_changes
			(${objKeysToColumnStr(columnsAndItsValues)})
			VALUES
			(${objKeysToColumn$IndexesStr(columnsAndItsValues)})
		;`;
		paramQuery.values = [];
		Object.keys(columnsAndItsValues).forEach(i => {
			if(typeof i == `object`){
				paramQuery.values.push(JSON.stringify(columnsAndItsValues[i]));
			}else{
				paramQuery.values.push(columnsAndItsValues[i]);
			}
		});
		await db.query(paramQuery);
	}
};
exports.trackTelegramUserAccountDataChanges = trackTelegramUserAccountDataChanges;
