const commandNameCodes = require(`../../codes/commandNameCodes.js`);
const processNameCodes = require(`../../codes/processNameCodes.js`);
const {getChangeLanguageMessage} = require(`../../../reply/main/message/changeLanguage.js`);

const handleChangeLanguageCommand = async (fns, userInfo) => {
	const reply = getChangeLanguageMessage(userInfo);

	const res = await fns.sendMessageToSetChat(reply);	

	if(!res){
		return;
	}

	let row = {};
	row.process_name = processNameCodes.LANGUAGE_CHANGING;
	row.state = {
		message_id : res.message_id
		,chat_id : res.chat.id
	};

	const subprocess_id = await fns.createUserSubprocessAndGetItIdPredefined(row);

	row = {
		name : commandNameCodes.CHANGE_LANGUAGE
		,subprocess_id : subprocess_id
	};

	await fns.insertCommandRowIntoTelegramUserSendedCommands(row);
};
exports.handleChangeLanguageCommand = handleChangeLanguageCommand;
