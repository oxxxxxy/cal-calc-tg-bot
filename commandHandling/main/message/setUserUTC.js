const {makeUserUTCOffsetString} = require(`../..//utils/utcOffset.js`);
const {getSetUserUTCMessage, getInvalidMessage_wholeData, getInvalidMessage_dayOfMonth} = require(`../../../reply/main/message/setUserUTC.js`);

const months = [
	{
		name: `January`
		,dayLength:31
	}
	,{
		name: `February`
		,dayLength:28
	}
	,{
		name: `March`
		,dayLength:31
	}
	,{
		name: `April`
		,dayLength:30
	}
	,{
		name: `May`
		,dayLength:31
	}
	,{
		name: `June`
		,dayLength:30
	}
	,{
		name: `July`
		,dayLength:31
	}
	,{
		name: `August`
		,dayLength:31
	}
	,{
		name: `September`
		,dayLength:30
	}
	,{
		name: `October`
		,dayLength:31
	}
	,{
		name: `November`
		,dayLength:30
	}
	,{
		name: `December`
		,dayLength:31
	}
];

const isLeapYear = (y) => {
	if(!(y % 4)){
		return true;
	}

	if(!(y % 100)) {
		return true;
	}

	if(!(y % 400)) {
		return true;
	}

	return false;
};

const checkLeapYearAndAddDayToFebruary = () => {

	const date = new Date();
	
	if(isLeapYear(date.getUTCFullYear())){
		const index = months.findIndex(e => e.name == `February`);
		months[index].dayLength = 29;
	}
};

checkLeapYearAndAddDayToFebruary()

const getMonthByNum = (n) => {
	if(n > 11) {
		return months[n % 12];
	}

	if(n < 0) {
		if(Math.abs(n) <= 12){
			return months[n + 12];
		}

		const remainder = n % 12;

		if(!remainder){
			return months[remainder];
		}

		return months[remainder + 12];
	}
		
	return months[n];
};

const getUserDayOffset = (dayOfMonth, requestDate) => {
	const UTCDate = requestDate.getUTCDate();
	const UTCMonth = requestDate.getUTCMonth();
	//ud 31  cd 1
	if(dayOfMonth > UTCDate + 1 && dayOfMonth == getMonthByNum(UTCMonth - 1).dayLength){
		return `yesterday`;
	}
	//ud 1  cd 31
	if(UTCDate == getMonthByNum(UTCMonth).dayLength && dayOfMonth < UTCDate - 1 && dayOfMonth == 1){
		return `tomorrow`;
	}
	//ud = cd - 1   cd 2-31
	if(dayOfMonth == UTCDate - 1){
		return `yesterday`;
	}
	//ud = cd + 1   cd 1-30
	if(dayOfMonth == UTCDate + 1){
		return `tomorrow`;
	}
	//ud = cd = 1-31
	if(dayOfMonth == UTCDate){
		return `today`;
	}

	return false;
}

const calcUserUTCOffsetWhenUHoursOffsetPositive = (userUTCHoursOffset, userMinutes, UTCMinutes) => {
	const userUTCOffset = {};

	if(userUTCHoursOffset > 14){
		return false;
	}

	let userUTCMinutesOffset = userMinutes - UTCMinutes;

	if(userUTCMinutesOffset < 0){
		userUTCMinutesOffset = 60 + userUTCMinutesOffset;
		userUTCHoursOffset = userUTCHoursOffset - 1;
	}
			
	if(userUTCHoursOffset == 14 && userUTCMinutesOffset){
		return false;
	}
			
	userUTCOffset.sign = `+`;
	userUTCOffset.hours = userUTCHoursOffset;
	userUTCOffset.minutes = userUTCMinutesOffset;
	
	return userUTCOffset;
}

const calcUserUTCOffsetWhenUHoursOffsetNegative = (userUTCHoursOffset, userMinutes, UTCMinutes) => {
	const userUTCOffset = {};

	if(userUTCHoursOffset > 12){
		return false;
	}

	let userUTCMinutesOffset = userMinutes - UTCMinutes;

	if(userUTCMinutesOffset < 0){
		userUTCMinutesOffset = Math.abs(userUTCMinutesOffset);
	} else if ( userUTCMinutesOffset > 0){
		userUTCMinutesOffset = 60 - userUTCMinutesOffset;
		userUTCHoursOffset = userUTCHoursOffset - 1;
	}
			
	if(userUTCHoursOffset == 12 && userUTCMinutesOffset){
		return false;
	}
	
	userUTCOffset.sign = `-`;
	userUTCOffset.hours = userUTCHoursOffset;
	userUTCOffset.minutes = userUTCMinutesOffset;

	return userUTCOffset;
}

const getUserUTCOffset = (userDayOfMonth, userHours, userMinutes, requestDate) => {
	const userDayOffset = getUserDayOffset(userDayOfMonth, requestDate);
	
	if(!userDayOffset){
		return false;
	}
	
	const UTCHours = requestDate.getUTCHours();
	const UTCMinutes = requestDate.getUTCMinutes();

	let userUTCOffset = {
		sign:`+`
		,hours:0
		,minutes:0
	};

	if(userDayOffset == `tomorrow`){
		let userUTCHoursOffset = 24 - UTCHours + userHours;
		
		userUTCOffset = calcUserUTCOffsetWhenUHoursOffsetPositive(userUTCHoursOffset, userMinutes, UTCMinutes);
	} else if (userDayOffset == `today`) {
		if(userHours > UTCHours){
			let userUTCHoursOffset = userHours - UTCHours;
			
			userUTCOffset = calcUserUTCOffsetWhenUHoursOffsetPositive(userUTCHoursOffset, userMinutes, UTCMinutes);
		} else if (userHours < UTCHours){
			let userUTCHoursOffset = UTCHours - userHours;

			userUTCOffset = calcUserUTCOffsetWhenUHoursOffsetNegative(userUTCHoursOffset, userMinutes, UTCMinutes);
		} else {
			let userUTCMinutesOffset = userMinutes - UTCMinutes;

			if(userUTCMinutesOffset < 0){
				userUTCMinutesOffset = Math.abs(userUTCMinutesOffset);
				userUTCOffset.sign = `-`;
			}

			userUTCOffset.minutes = userUTCMinutesOffset;
		}
	} else if (userDayOffset == `yesterday`) {
		let userUTCHoursOffset = 24 - userHours + UTCHours;

		userUTCOffset = calcUserUTCOffsetWhenUHoursOffsetNegative(userUTCHoursOffset, userMinutes, UTCMinutes);
	}

	if(!userUTCOffset){
		return false;
	}

	return userUTCOffset;
}
exports.getUserUTCOffset = getUserUTCOffset;

const handleSetUserUTCCommand = async (fns, pgClient, userInfo, dayOfMonth, hours, minutes, requestDate) => {
	if(!dayOfMonth){
		const invalidReply = getInvalidMessage_dayOfMonth(userInfo.s__lang_code);
		await fns.completeInvalidCommandHandling(invalidReply);
		return;
	}

	let userUTCOffset = getUserUTCOffset(dayOfMonth, hours, minutes, requestDate);

	if (!userUTCOffset) {
		const invalidReply = getInvalidMessage_wholeData(userInfo.s__lang_code);
		await fns.completeInvalidCommandHandling(invalidReply);
		return;
	}

	const reply = getSetUserUTCMessage(userInfo.s__lang_code, userUTCOffset);

	await fns.sendMessageToSetChat(reply);

	userUTCOffset = makeUserUTCOffsetString(userUTCOffset);
	
	await pgClient.query(`
		UPDATE telegram_users
		SET s__utc_s_h_m = '${userUTCOffset}'
		WHERE tg_user_id = ${userInfo.tg_user_id}
	;`);

	const row = {
		command : `SET_USER_UTC`
		,data : JSON.stringify(userUTCOffset)
	}

	await fns.insertCommandRowIntoTelegramUserSendedCommands(row);
}
exports.handleSetUserUTCCommand = handleSetUserUTCCommand;


