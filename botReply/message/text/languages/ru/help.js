const {
	makeMultiLangHelpMessagePanelText
	,makeMultiLangCommandTextFromCommandBlock
	,makeListOfPerPageCountOfMultiLangCommandBlocksForHelpMessagePanel
} = require(`../multiLang/help.js`);
const {commandBlockList} = require(`./static/botCommandList.js`);


const listOfPerPageCountOfRuCommandBlocksForHelpMessagePanel = makeListOfPerPageCountOfMultiLangCommandBlocksForHelpMessagePanel(commandBlockList, 2000, 2450);
exports.listOfPerPageCountOfRuCommandBlocksForHelpMessagePanel = listOfPerPageCountOfRuCommandBlocksForHelpMessagePanel;

const makeRuHelpMessagePanelText = (selectedPage = 1) => {
	return makeMultiLangHelpMessagePanelText('СПИСОК КОМАНД', commandBlockList, listOfPerPageCountOfRuCommandBlocksForHelpMessagePanel, selectedPage);
}
exports.makeRuHelpMessagePanelText = makeRuHelpMessagePanelText;
