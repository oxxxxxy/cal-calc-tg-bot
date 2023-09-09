const telegraf = require(`telegraf`);

const getCountOfPages = (lengthOfItems, maxNumberOfLinesOnPage) => {
	let countOfPages = Math.floor(lengthOfItems / maxNumberOfLinesOnPage) + 1;

	if(lengthOfItems > 0 && !(lengthOfItems % maxNumberOfLinesOnPage)) {
		countOfPages = countOfPages - 1;
	}

	return countOfPages;
};
exports.getCountOfPages = getCountOfPages;

const getPagingForNButtonsOfPagingInlineKeyboardLine = (countOfPages, countOfButtons, selectedPage = 1) => {
	if(countOfPages < 2){
		throw `countOfPages is less than 2, there is no reason to create inlineKeyboard.`;
	}

	if(!Number.isInteger(countOfButtons)){
		throw `countOfButtons must be an integer.`;
	}

	if(!(countOfButtons % 2)){
		throw `countOfButtons must have odd number value.`;
	}

	if(selectedPage > countOfPages){
		selectedPage = countOfPages;
	} else if(selectedPage < 1){
		selectedPage = 1;
	}

	const pages = {};
	
	if(countOfPages <= countOfButtons){
		for(let i = 1; i <= countOfPages; i++){
			pages[i] = {};
			pages[i].number = i;

			if(i == selectedPage){
				pages[i].selected = true;
			}
		}

		return pages;
	}

	const pagesBeforeAndAfterSelected = Math.floor(countOfButtons / 2);
	let startPoint = selectedPage - pagesBeforeAndAfterSelected;

	if(selectedPage <= pagesBeforeAndAfterSelected) {
		startPoint = 1;
	} else if(selectedPage > countOfPages - pagesBeforeAndAfterSelected) {
		startPoint = countOfPages - countOfButtons + 1;
	}

	for(let i = 1; i <= countOfButtons; i++, startPoint++){
		pages[i] = {};
		pages[i].number = startPoint;

		if(startPoint == selectedPage){
			pages[i].selected = true;
		}
	}
	
	return pages;
};
exports.getPagingForNButtonsOfPagingInlineKeyboardLine = getPagingForNButtonsOfPagingInlineKeyboardLine;

const getNButtonsForPagingInlineKeyboardLine = (pages, dataPart) => {
	const keys = Object.keys(pages);
	const buttons = {};

	let wasSelected = false;
	keys.forEach((e, i) => {
		i++;
		buttons[i] = {};
		buttons[i].data = dataPart + 'p' + pages[i].number;
		
		if(pages[i].selected){
			buttons[i].text = `<<${pages[i].number}>>`;
			wasSelected = true;
			return;
		}

		if(wasSelected){
			buttons[i].text = `>>` + pages[i].number;
		} else {
			buttons[i].text = pages[i].number + `<<`;
		}
	});

	return buttons;
}
exports.getNButtonsForPagingInlineKeyboardLine = getNButtonsForPagingInlineKeyboardLine;

const makePagingInlineKeyboardLine = buttons => {
	const inlineKeyboardLine = [];

	const keys = Object.keys(buttons);
	keys.forEach((e, i) => {
		i++;
		inlineKeyboardLine.push(
			telegraf.Markup.button.callback(buttons[i].text, buttons[i].data)
		);		
	});
	
	return inlineKeyboardLine;
};
exports.makePagingInlineKeyboardLine = makePagingInlineKeyboardLine;
