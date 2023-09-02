const addCharBeforeValue = (value, maxLength, charS) => {
	let str = '' + value;

	let result = ``;
	const diff = maxLength - str.length;

	if(diff >= 0) {
		for (let i = 0; i < diff; i++) {
			result += charS;
		}
	} else {
		str = str.slice(Math.abs(diff));
	}
	result += str;

	return result;
};
exports.addCharBeforeValue = addCharBeforeValue;

const addCharBeforeDecimalValue = (value, maxLength, charS) => {
	let str = Number(value).toFixed(1);

	return addCharBeforeValue(str, maxLength, charS);
};
exports.addCharBeforeDecimalValue = addCharBeforeDecimalValue;

const HTMLBold = str => {
	return `<b>${str}</b>`;
}
exports.HTMLBold = HTMLBold;

const HTMLUnderline = str =>{
	return `<u>${str}</u>`;
}
exports.HTMLUnderline = HTMLUnderline;

const HTMLItalic = str => {
	return `<i>${str}</i>`;
}
exports.HTMLItalic = HTMLItalic;

const HTMLMonospace = str => {
	return `<code>${str}</code>`;
}
exports.HTMLMonospace = HTMLMonospace;

