const commandNameCodes = require(`../../../codes/commandNameCodes.js`);
const invalidCauseCodes = require(`../../../codes/invalidCauseCodes.js`);

const {getUserUTCOffset} = require(`././userUTCOffsetMaking.js`);
const {makeUserUTCOffsetString} = require(`../../..//utils/utcOffset.js`);
const {getSetUserUTCMessage, getInvalidMessage_wholeData, getInvalidMessage_dayOfMonth} = require(`../../../../reply/main/message/setUserUTC.js`);


const handleSetUserUTCCommand = async (fns, pgClient, userInfo, re_result, requestDate) => {
	
	const dayOfMonth = Number(re_result[2]);
	const hours = Number(re_result[3]);
	const minutes = Number(re_result[4]);

	const completeInvalidMessageCommandHandlingBound = fns.completeInvalidMessageCommandHandling.bind(null, commandNameCodes.SET_USER_UTC);

	if(!dayOfMonth){
		const invalidReply = getInvalidMessage_dayOfMonth(userInfo.s__lang_code);
		await completeInvalidMessageCommandHandlingBound(invalidReply, invalidCauseCodes.DAY_OF_MONTH_EQUAL_TO_0);
		return;
	}

	let userUTCOffset = getUserUTCOffset(dayOfMonth, hours, minutes, requestDate);

	if (!userUTCOffset) {
		const invalidReply = getInvalidMessage_wholeData(userInfo.s__lang_code);
		await completeInvalidMessageCommandHandlingBound(invalidReply, invalidCauseCodes.WHOLE_DATE_IS_INVALID);
		return;
	}

	const reply = getSetUserUTCMessage(userInfo.s__lang_code, userUTCOffset);

	await fns.sendMessageToSetChat(reply);

	userUTCOffset = makeUserUTCOffsetString(userUTCOffset);

	// TODO: userInfo good updating code
	await pgClient.query(`
		UPDATE telegram_users
		SET s__utc_s_h_m = '${userUTCOffset}'
		WHERE tg_user_id = ${userInfo.tg_user_id}
	;`);

	const row = {
		name_code : commandNameCodes.SET_USER_UTC
		,data : JSON.stringify(userUTCOffset)
	}

	await fns.insertCommandRowIntoTelegramUserSendedCommands(row);
}
exports.handleSetUserUTCCommand = handleSetUserUTCCommand;

