const {getHelpMessagePanel} = require(`../../../reply/main/message/help.js`);

const handleHelpCommand = async (fns, userInfo) => {
	const reply = getHelpMessagePanel(userInfo.s__lang_code, userInfo.tg_user_id);

	await fns.sendMessageToSetChat(reply);

	await fns.insertCommandRowIntoTelegramUserSendedCommands(`HELP`);
};
exports.handleHelpCommand = handleHelpCommand;

const handleSetHelpPageOfMessagePanelCommand = async (fns, userInfo, selectedPage) => {
	const replyWithSelectedPage = getHelpMessagePanel(userInfo.s__lang_code, userInfo.tg_user_id, selectedPage);
	
	if(fns.isPreviousMessagePanelEqualToNewOneBound(replyWithSelectedPage)){
		return;
	}
	
	await fns.editTextOfSetMessageInSetChat(replyWithSelectedPage);

	const row = {
		command:`SET_HELP_PAGE`
		,data:JSON.stringify({selectedPage:selectedPage})
	};

	await fns.insertCommandRowIntoTelegramUserSendedCommands(row);
}
exports.handleSetHelpPageOfMessagePanelCommand = handleSetHelpPageOfMessagePanelCommand;
