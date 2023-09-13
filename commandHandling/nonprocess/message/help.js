const {getHelpMessagePanel} = require(`../../../reply/message/help.js`);

const handleHelpMessageCommand = async (fns, userInfo) => {
	const reply = getHelpMessagePanel(userInfo.s__lang_code, userInfo.tg_user_id);

	await fns.sendMessageToSetChat(reply);

	await fns.insertCommandRowIntoTelegramUserSendedCommands(`HELP`);
};
exports.handleHelpMessageCommand = handleHelpMessageCommand;

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
