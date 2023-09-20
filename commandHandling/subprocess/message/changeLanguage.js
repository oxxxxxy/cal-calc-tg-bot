const invalidCauseCodes = require(`../../codes/invalidCauseCodes.js`);

const {getInvalidInputMessageOfChangeLanguageSubprocess} = require(`../../../reply/subprocess/message/changeLanguage.js`);
const {getChangeLanguageMessage} = require(`../../../reply/main/message/changeLanguage.js`);

const handleInvalidInputForChangeLanguageSubprocess = async completeHandlingOfSubprocessForInvalidInput_Predefined => {
	const invalidCause = invalidCauseCodes.INPUT_TYPE_NOT_SPECIFIED_FOR_THAT_COMMAND;
	const invalidReply = getInvalidInputMessageOfChangeLanguageSubprocess();
				
	await completeHandlingOfSubprocessForInvalidInput_Predefined(invalidReply);
}
exports.handleInvalidInputForChangeLanguageSubprocess = handleInvalidInputForChangeLanguageSubprocess;

const handleDeletionOfChangeLanguageInterfaceMessage = async (fns, userSubprocess, userInfo) => {
	const reply = getChangeLanguageMessage(userInfo);

	const res = await fns.sendMessageToSetChat(reply);	

	if(!res){
		return;
	}

	userSubprocess.state.exMessage_ids.push(userSubprocess.state.message_id);//think

	userSubprocess.state.message_id = res.message_id;

	await fns.updateUserSubprocess(userSubprocess);
}
exports.handleDeletionOfChangeLanguageInterfaceMessage = handleDeletionOfChangeLanguageInterfaceMessage;
