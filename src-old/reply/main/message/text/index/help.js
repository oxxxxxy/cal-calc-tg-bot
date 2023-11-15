const {
	makeRuHelpMessagePanelText
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

