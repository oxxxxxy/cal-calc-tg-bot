const {
	objKeysToColumnStr,
	objKeysToColumn$IndexesStr,
	objKeysValuesToColumnValuesStr
} = require(`./queryUtils.js`);


const renamedColumnsOfTablesTgUsersAndRegUsers = `
	tu.tg_user_id,
	tu.deleted AS tu_deleted,
	tu.s__lang_code AS tu_s__lang_code,
	tu.s__utc_offset__h_m AS tu_s__utc_offset__h_m,
	tu.s__delete_old_ucfi,
	tu.s__delete_old_ucdi,
	ru.internal_use_only AS ru_internal_use_only,
	tu.internal_use_only AS tu_internal_use_only,
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

const registryTelegramUser = async (db, tg_user_id, is_bot) => {
	const res = await db.query(`WITH
		tu AS (INSERT INTO telegram_users (tg_user_id, is_bot) VALUES (${tg_user_id}, ${is_bot}) RETURNING * ),
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
			ORDER BY creation_date DESC
			LIMIT 1)
		AS fn, (
			SELECT *
			FROM telegram_user_account_data_changes
			WHERE tg_user_id = ${ctxUpdateMessageFrom.id}
			AND is_not_lastname_null
			ORDER BY creation_date DESC
			LIMIT 1)
		AS ln, (
			SELECT *
			FROM telegram_user_account_data_changes
			WHERE tg_user_id = ${ctxUpdateMessageFrom.id}
			AND is_not_username_null
			ORDER BY creation_date DESC
			LIMIT 1)
		AS un, (
			SELECT *
			FROM telegram_user_account_data_changes
			WHERE tg_user_id = ${ctxUpdateMessageFrom.id}
			AND is_not_lang_code_null
			ORDER BY creation_date DESC
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
