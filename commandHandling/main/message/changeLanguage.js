const {getChangeLanguageMessage} = require(`../../../reply/main/message/changeLanguage.js`);

const makeDataPart = tg_user_id => `i${tg_user_id}chLa_`;
exports.makeDataPart = makeDataPart;

const handleChangeLanguageCommand = async (fns, userInfo) => {
	const dataPart = makeDataPart(userInfo.tg_user_id);

	const reply = getChangeLanguageMessage(dataPart);

	const res = await fns.sendMessageToSetChat(reply);	

	if(!res){
		return;
	}

	let row = {};
	row.process_name = `LANGUAGE_CHANGING`;
	row.state = {
		message_id : res.message_id
		,chat_id : res.chat.id
	};

	const subprocess_id = await fns.createUserSubprocessAndGetItIdPredefined(row);

	row = {
		command : `CREATE_DISH`
		,subprocess_id : subprocess_id
	};

	await fns.insertCommandRowIntoTelegramUserSendedCommands(row);
};
exports.handleChangeLanguageCommand = handleChangeLanguageCommand;
