
const minifyPropNamesOfUserUTCOffset = (userUTCOffset) => {
	const obj = {};

	obj.s = userUTCOffset.sign;
	obj.h = userUTCOffset.hours;
	obj.m = userUTCOffset.minutes;

	return obj;
};
exports.minifyPropNamesOfUserUTCOffset = minifyPropNamesOfUserUTCOffset;

const extendPropNamesOfUserUTCOffset = (minifiedUserUTCOffset) => {
	const obj = {};

	obj.sign = minifiedUserUTCOffset.s;
	obj.hours = minifiedUserUTCOffset.h;
	obj.minutes = minifiedUserUTCOffset.m;

	return obj;
};
exports.extendPropNamesOfUserUTCOffset = extendPropNamesOfUserUTCOffset;
