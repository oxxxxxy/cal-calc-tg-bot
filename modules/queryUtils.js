const objKeysToColumnStr = obj => {
	let str = ``;
	const keys = Object.keys(obj);
	keys.forEach((item, i) => {
		str += item;		
		if(keys.length > 1 && i < keys.length - 1){
			str += `, `;
		}
	});
	return str;
};
exports.objKeysToColumnStr = objKeysToColumnStr;

const objKeysToColumn$IndexesStr = obj => {
	let str = ``;
	const keys = Object.keys(obj);
	keys.forEach((item, i) => {
		str += `$${i + 1}`;		
		if(keys.length > 1 && i < keys.length - 1){
			str += `, `;
		}
	});
	return str;
};
exports.objKeysToColumn$IndexesStr = objKeysToColumn$IndexesStr;

const getArrOfValuesFromObj = obj => {
	const arr = [];
	
	const keys = Object.keys(obj);
	keys.forEach(i => {
		arr.push(obj[i]);
	});

	return arr;
};
exports.getArrOfValuesFromObj = getArrOfValuesFromObj;

const getStrOfColumnNamesAndTheirSettedValues = obj => {
	let str = ``;
	
	const keys = Object.keys(obj);
	keys.forEach((k, i) => {
		str += `${k} = `;
		if (typeof obj[k] == 'number') {
			str += obj[k];
		} else if (typeof obj[k] == 'string') {
			str  += obj[k];
		} else if (typeof obj[k] == 'boolean') {
			str  += obj[k];
		} else {
			throw `unknown data type for adding in database. add code to me, honey`
		}
		
		if(keys.length > 1 && i < keys.length - 1){
			str += `, `;
		}

	});

	return str;
};
exports.getStrOfColumnNamesAndTheirSettedValues = getStrOfColumnNamesAndTheirSettedValues;

const objKeysValuesToColumnValuesStr = obj => {
	let str = ``;
	const keys = Object.keys(obj);
	throw `is not ready`
	keys.forEach((item, i) => {


		if(keys.length > 1 && i < keys.length - 1){
			str += `, `;
		}
	});
	return str;
};
exports.objKeysValuesToColumnValuesStr = objKeysValuesToColumnValuesStr;
