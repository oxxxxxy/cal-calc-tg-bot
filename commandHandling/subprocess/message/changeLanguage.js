const {getInvalidInputMessageOfChangeLanguageSubprocess} = require(`../../../reply/subprocess/message/changeLanguage.js`);
const {getChangeLanguageMessage} = require(`../../../reply/main/message/changeLanguage.js`);
const {makeDataPart} = require(`../../main/message/changeLanguage.js`);

const handleInvalidInputForChangeLanguageSubprocess = async completeHandlingOfSubprocessForInvalidInput_Predefined => {
	const invalidReply = getInvalidInputMessageOfChangeLanguageSubprocess();
				
	await completeHandlingOfSubprocessForInvalidInput_Predefined(invalidReply);
}
exports.handleInvalidInputForChangeLanguageSubprocess = handleInvalidInputForChangeLanguageSubprocess;

const handleDeletionOfChangeLanguageInterfaceMessage = async (fns, userSubprocess) => {
	const dataPart = makeDataPart(userSubprocess.tg_user_id);

	const reply = getChangeLanguageMessage(dataPart);

	const res = await fns.sendMessageToSetChat(reply);	

	if(!res){
		return;
	}

	userSubprocess.state.message_id = res.message_id;
}
exports.handleDeletionOfChangeLanguageInterfaceMessage = handleDeletionOfChangeLanguageInterfaceMessage;
