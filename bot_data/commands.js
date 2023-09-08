const {
	HTMLMonospace, HTMLItalic, HTMLBold, HTMLUnderline 
} = require(`../botReply/message/text/utils/textFormatting.js`);




const listOfPerPageCountOfRuCommandBlocksForHelpMessagePanel = makeListOfPerPageCountOfMultiLangCommandBlocksForHelpMessagePanel(commandBlockList, 2000, 2450);
exports.listOfPerPageCountOfRuCommandBlocksForHelpMessagePanel = listOfPerPageCountOfRuCommandBlocksForHelpMessagePanel;

const makeRuHelpMessagePanelText = (commandBlockList, listOfPerPageCountOfRuCommandBlocksForHelpMessagePanel, selectedPage = 1) => {
	return makeMultiLangHelpMessagePanelText('СПИСОК КОМАНД', commandBlockList, listOfPerPageCountOfRuCommandBlocksForHelpMessagePanel, selectedPage);
}
exports.makeRuHelpMessagePanelText = makeRuHelpMessagePanelText;



Object.defineProperty(HTMLCommandMaker, `help`, {
	get () { return getHTMLCommandsOfCommandBlock(help);}
	,enumerable:true
});
Object.defineProperty(HTMLCommandMaker, `settings`, {
	get () { return getHTMLCommandsOfCommandBlock(settings);}
	,enumerable:true
});
Object.defineProperty(HTMLCommandMaker, `userFood`, {
	get () { return getHTMLCommandsOfCommandBlock(userFood);}
	,enumerable:true
});
Object.defineProperty(HTMLCommandMaker, `userDish`, {
	get () { return getHTMLCommandsOfCommandBlock(userDish);}
	,enumerable:true
});
Object.defineProperty(HTMLCommandMaker, `dishProcess`, {
	get () { return getHTMLCommandsOfCommandBlock(dishProcess);}
	,enumerable:true
});
Object.defineProperty(HTMLCommandMaker, `projectFD`, {
	get () { return getHTMLCommandsOfCommandBlock(projectFD);}
	,enumerable:true
});
Object.defineProperty(HTMLCommandMaker, `eatenFD`, {
	get () { return getHTMLCommandsOfCommandBlock(eatenFD);}
	,enumerable:true
});
Object.defineProperty(HTMLCommandMaker, `day`, {
	get () { return getHTMLCommandsOfCommandBlock(day);}
	,enumerable:true
});
Object.defineProperty(HTMLCommandMaker, `dayChain`, {
	get () { return getHTMLCommandsOfCommandBlock(dayChain);}
	,enumerable:true
});
Object.defineProperty(HTMLCommandMaker, `copyShareFoodDish`, {
	get () { return getHTMLCommandsOfCommandBlock(copyShareFoodDish);}
	,enumerable:true
});
exports.HTMLCommandMaker = HTMLCommandMaker;
