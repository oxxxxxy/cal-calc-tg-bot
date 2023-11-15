const commandNameCodes = require(`../../codes/commandNameCodes.js`);
const processNameCodes = require(`../../codes/processNameCodes.js`);
const {getChangeLanguageMessage} = require(`../../../reply/main/message/changeLanguage.js`);

const handleChangeLanguageCommand = async (fns, userInfo) => {
	const reply = getChangeLanguageMessage(userInfo.tg_user_id);

	const res = await fns.sendMessageToSetChat(reply);	

	if(!res){
		return;
	}

	let row = {};
	row.name_code = processNameCodes.LANGUAGE_CHANGING;
	row.state = {
		message_id : res.message_id
		,chat_id : res.chat.id
	};

	const subprocess_id = await fns.createUserSubprocessAndGetItIdPredefined(row);

	row = {
		name_code : commandNameCodes.CHANGE_LANGUAGE
		,subprocess_id : subprocess_id
	};

	await fns.insertCommandIntoTelegramUserSendedCommands(row);
};
exports.handleChangeLanguageCommand = handleChangeLanguageCommand;


