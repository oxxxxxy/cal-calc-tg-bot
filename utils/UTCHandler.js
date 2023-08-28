const months = [
	{
		name: `January`
		,dayLength:31
	}
	,{
		name: `February`
		,dayLength:28
	}
	,{
		name: `March`
		,dayLength:31
	}
	,{
		name: `April`
		,dayLength:30
	}
	,{
		name: `May`
		,dayLength:31
	}
	,{
		name: `June`
		,dayLength:30
	}
	,{
		name: `July`
		,dayLength:31
	}
	,{
		name: `August`
		,dayLength:31
	}
	,{
		name: `September`
		,dayLength:30
	}
	,{
		name: `October`
		,dayLength:31
	}
	,{
		name: `November`
		,dayLength:30
	}
	,{
		name: `December`
		,dayLength:31
	}
];

const isLeapYear = (y) => {
	if(!(y % 4)){
		return true;
	}

	if(!(y % 100)) {
		return true;
	}

	if(!(y % 400)) {
		return true;
	}

	return false;
};

const checkLeapYearAndAddDayToFebruary = () => {

	const date = new Date();
	
	if(isLeapYear(date.getUTCFullYear())){
		const index = months.findIndex(e => e.name == `February`);
		months[index].dayLength = 29;
	}
};

checkLeapYearAndAddDayToFebruary()

const getMonthByNum = (n) => {
	if(n > 11) {
		return months[n % 12];
	}

	if(n < 0) {
		if(Math.abs(n) <= 12){
			return months[n + 12];
		}

		const remainder = n % 12;

		if(!remainder){
			return months[remainder];
		}

		return months[remainder + 12];
	}
		
	return months[n];
};

console.log(
	getMonthByNum(-1)
	,getMonthByNum(-11)
	,getMonthByNum(-12)
	,getMonthByNum(-13)
	,getMonthByNum(13)
);

const makeThatSHIT = (day, hours, minutes) => {
	const offsetArr = [];

	const inputState = {};

	const currentDate = new Date();
	const currentMonth = currentDate.getUTCMonth();

	if(day == 0){
		//bad
		return false;
	}



	//ud 31  cd 1
		
	//ud 1  cd 31
	//ud = cd = 1-31
	//ud 1 cd 2
	//ud 2 cd 1

	if(day < currentDate.getUTCDay() && day == currentDate.getUTCDay() - 1){

		//good
	}
	if(day > currentDate.getUTCDay() && day == currentDate.getUTCDay() + 1){

		//good
	}

	if(day ==  currentDate.getUTCDay()){

		//good
	}


	



	
	return offsetArr;
}

makeThatSHIT(28, 13, 37)

const UTCHandler = {};




exports.UTCHandler = UTCHandler;

