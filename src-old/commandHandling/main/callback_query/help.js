const commandNameCodes = require(`../../codes/commandNameCodes.js`);
const {getHelpMessagePanel} = require(`../../../reply/main/message/help.js`);


const handleSetHelpPageCommand = async (fns, userInfo, selectedPage) => {
	const replyWithSelectedPage = getHelpMessagePanel(userInfo.s__lang_code, userInfo.tg_user_id, selectedPage);
	
	if(fns.isPreviousMessagePanelEqualToNewOneBound(replyWithSelectedPage)){
		return;
	}
	
	await fns.editTextOfSetMessageInSetChat(replyWithSelectedPage);

	const row = {
		name_code: commandNameCodes.CHOOSE_HELP_PAGE
		,data: JSON.stringify(selectedPage)
	};

	await fns.insertCommandIntoTelegramUserSendedCommands(row);
}
exports.handleSetHelpPageCommand = handleSetHelpPageCommand;
