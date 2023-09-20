const commandNameCodes = require(`../../codes/commandNameCodes.js`);
const {getHelpMessagePanel} = require(`../../../reply/main/message/help.js`);


const handleHelpCommand = async (fns, userInfo) => {
	const reply = getHelpMessagePanel(userInfo.s__lang_code, userInfo.tg_user_id);

	await fns.sendMessageToSetChat(reply);

	await fns.insertCommandIntoTelegramUserSendedCommands(commandNameCodes.HELP);
};
exports.handleHelpCommand = handleHelpCommand;
