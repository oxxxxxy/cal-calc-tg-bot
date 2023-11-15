const commandNameCodes = require(`../../codes/commandNameCodes.js`);
const {getLanguageHasBeenChangedMessage} = require(`../../../reply/subprocess/message/changeLanguage.js`);

const handleChooseLanguage = async (fns, userSubprocess, chosenLanguage) => {
	//update message
	const reply = getLanguageHasBeenChangedMessage(chosenLanguage);
	
	const res = await fns.editTextOfSetMessageInSetChat(reply);

	if(!res){
		return;
	}

	userSubprocess.state.message_id = res.message_id;

	//update telegram_users //recode userInfo
	let row ={};
	row.s__lang_code = chosenLanguage;

	await fns.updateTelegramUsersPostgresTableBound(row);

	//insert command
	row = fns.getPredefinedRowWithDateTgUserId();
	row.name = commandNameCodes.CHOOSE_LANGUAGE;
	row.data = JSON.stringify(chosenLanguage);

	await fns.insertCommandRowIntoTelegramUserSendedCommands(row);

	//update subprocess, complete it
	userSubprocess.completed = true;

	await fns.updateUserSubprocess(userSubprocess);
};
exports.handleChooseLanguage = handleChooseLanguage;
