const {
	HTMLMonospace, HTMLItalic, HTMLBold, HTMLUnderline 
} = require(`../../utils/textFormatting.js`);


const makeMultiLangCommandTextFromCommandBlock = (block, blockNum) => {
	let str = ``
	,i = 1;

	for (const p in block) {
		if(p == `header`){
			str += HTMLBold(blockNum ? blockNum + ') ' + block[p] : block[p]) + '\n\n';
		} else {		
			str += `${blockNum ? blockNum + '.' : ''}${i}) ${block[p].commandTitle}\n`;
			i++;			

			if(block[p].command){
				str += `__${HTMLMonospace(block[p].command)}    `;
			}
			if(block[p].parameters){
				str += `${block[p].parameters}    `;
			}
			if(block[p].parameterDescription){
				str += block[p].parameterDescription;
			}
			if(block[p].usageExamples){
				str += `\n  ${HTMLItalic(block[p].usageExamples.join('\n  '))}`;
			}
			str += `\n\n`;
		}
	}

	return str;
}
exports.makeMultiLangCommandTextFromCommandBlock = makeMultiLangCommandTextFromCommandBlock;

const makeListOfPerPageCountOfMultiLangCommandBlocksForHelpMessagePanel = (commandBlockList, minCharLengthOnPage, maxCharLengthOnPage) => {
	const listOfPerPageCountOfCommandBlocks = [];
	
	let str = ``;

	for(let i = 0, sequence = 1; i < commandBlockList.length; i++, sequence++){
		str += makeMultiLangCommandTextFromCommandBlock(commandBlockList[i], i + 1);

		if(str.length > minCharLengthOnPage && str.length < maxCharLengthOnPage){
			listOfPerPageCountOfCommandBlocks.push(sequence);
			sequence = 0;
			str = ``;
		} else if (str.length > maxCharLengthOnPage) {
			listOfPerPageCountOfCommandBlocks.push(sequence - 1);
			i = i - 1;
			sequence = 0;
			str = ``;
		}

		if(i == commandBlockList.length - 1){
			if(sequence != 0){
				listOfPerPageCountOfCommandBlocks.push(sequence);
				str = ``;
			}
			break;
		}
	}

	return listOfPerPageCountOfCommandBlocks;
};
exports.makeListOfPerPageCountOfMultiLangCommandBlocksForHelpMessagePanel = makeListOfPerPageCountOfMultiLangCommandBlocksForHelpMessagePanel;

const makeMultiLangHelpMessagePanelText = (title, commandBlockList, listOfPerPageCountOfCommandBlocksForHelpMessagePanel, selectedPage = 1) => {
	const lengthOfPages = listOfPerPageCountOfCommandBlocksForHelpMessagePanel.length;

	if(selectedPage > lengthOfPages) {
		selectedPage = lengthOfPages;
	}

	const commandBlockCountOnPage = listOfPerPageCountOfCommandBlocksForHelpMessagePanel[selectedPage - 1];
	const skippedPagesOfCommandBlockCounts =	listOfPerPageCountOfCommandBlocksForHelpMessagePanel.slice(0, selectedPage - 1);
	const countOfAllSkippedCommandBlockCounts = skippedPagesOfCommandBlockCounts.reduce((a, e) => a + e);

	let str = HTMLBold(HTMLUnderline(title)) + `\n\n`;

	for(let i = countOfAllSkippedCommandBlockCounts, limit = countOfAllSkippedCommandBlockCounts + commandBlockCountOnPage; i < limit; i++){
		str += makeMultiLangCommandTextFromCommandBlock(commandBlockList[i], i + 1);
	}
	
	return str;
}
exports.makeMultiLangHelpMessagePanelText = makeMultiLangHelpMessagePanelText;
