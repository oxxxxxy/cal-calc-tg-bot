const {getInvalidInputMessageOfChangeLanguageSubprocess} = require(`../../../reply/subprocess/message/changeLanguage.js`);

const handleInvalidInputForChangeLanguageSubprocess = async completeHandlingOfSubprocessForInvalidInput_Predefined => {
	const invalidReply = getInvalidInputMessageOfChangeLanguageSubprocess();
				
	await completeHandlingOfSubprocessForInvalidInput_Predefined(invalidReply);
}
exports.handleInvalidInputForChangeLanguageSubprocess = handleInvalidInputForChangeLanguageSubprocess;
