const makeUserUTCOffsetString = userUTCOffset => 
	userUTCOffset.sign + userUTCOffset.hours + ':' + userUTCOffset.minutes;
exports.makeUserUTCOffsetString = makeUserUTCOffsetString;

const parseUserUTCOffsetString = userUTCOffsetString => {
	const re = /(.)(\d+):(\d+)/;
	const reResult = userUTCOffsetString.match(re);

	const userUTCOffset = {};
	userUTCOffset.sign = reResult[1];
	userUTCOffset.hours = Number(reResult[2]);
	userUTCOffset.minutes = Number(reResult[3]);

	return userUTCOffset;
};
exports.parseUserUTCOffsetString = parseUserUTCOffsetString;
