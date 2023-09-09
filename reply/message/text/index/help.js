const {
	makeRuHelpMessagePanelText
	,ruCommandBlock_dishProcessText
} = require(`../languages/ru/help.js`);

const makeHelpMessagePanelText = (languageCode, selectedPage = 1) => {
	switch (languageCode) {
	 	case 'ru':
	 		return makeRuHelpMessagePanelText(selectedPage);
	 	case 'en':
			return `code me`;
	 	default:
	 		return `code me`;
	}
}
exports.makeHelpMessagePanelText = makeHelpMessagePanelText;

const getCommandBlock_dishProcessText = (languageCode) => {
	switch (languageCode) {
	 	case 'ru':
	 		return ruCommandBlock_dishProcessText;
	 	case 'en':
			return `code me`;
	 	default:
	 		return `code me`;
	}
};
exports.getCommandBlock_dishProcessText = getCommandBlock_dishProcessText;
