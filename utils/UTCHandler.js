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

const makeThatSHIT = (dayOfMonth, hours, minutes, date) => {
	const offsetArr = [];

	const userDateInfo = {};

	// const date = new Date();
	const UTCDate = date.getUTCDate();
	const UTCMonth = date.getUTCMonth();

	if(dayOfMonth == 0){
		//bad
		return false;
	}


	//ud 31  cd 1
	if(dayOfMonth > UTCDate + 1 && dayOfMonth == getMonthByNum(UTCMonth - 1).dayLength){
		console.log(
			`//ud 31  cd 1`
			,dayOfMonth
		);
	
		return;
	}
	//ud 1  cd 31
	if(UTCDate == getMonthByNum(UTCMonth).dayLength && dayOfMonth < UTCDate - 1 && dayOfMonth == 1){
		console.log(
			`//ud 1  cd 31`
			,dayOfMonth
		);
		
		return;
	}
	//ud = cd - 1   cd 2-31
	if(dayOfMonth == UTCDate - 1){
		console.log(
			`//ud = cd - 1   cd 2-31`
			,dayOfMonth
		);
		
		return;
	}
	//ud = cd + 1   cd 1-30
	if(dayOfMonth == UTCDate + 1){
		console.log(
			`//ud = cd + 1   cd 1-30`
			,dayOfMonth
		);
		
		return;
	}
	//ud = cd = 1-31
	if(dayOfMonth == UTCDate){
		console.log(
			`//ud = cd = 1-31`
			,dayOfMonth
		);

		return;
	}

	//bad for dayOfMonth
	console.log(`invalid day input`, dayOfMonth);
	

	

	



	
	return offsetArr;
}

/*




	*/ 

makeThatSHIT(
	13
	,13, 37,
	new Date(`Mon Dec 31 2023 04:15:10 GMT`)
)
makeThatSHIT(
	33
	,13, 37,
	new Date(`Mon Dec 31 2023 04:15:10 GMT`)
)
makeThatSHIT(
	(new Date(`Mon Jan 2 2023 04:15:10 GMT+0300`)).getDate()
	,13, 37,
	new Date(`Mon Dec 31 2023 04:15:10 GMT`)
)
makeThatSHIT(
	(new Date(`Mon Jan 1 2023 04:15:10 GMT+0300`)).getDate()
	,13, 37,
	new Date(`Mon Dec 31 2023 04:15:10 GMT`)
)
makeThatSHIT(
	(new Date(`Mon Dec 31 2023 04:15:10 GMT+0300`)).getDate()
	,13, 37,
	new Date(`Mon Dec 31 2023 04:15:10 GMT`)
)
makeThatSHIT(
	(new Date(`Mon Dec 30 2023 04:15:10 GMT+0300`)).getDate()
	,13, 37,
	new Date(`Mon Dec 31 2023 04:15:10 GMT`)
)

makeThatSHIT(
	(new Date(`Mon Jan 1 2023 04:15:10 GMT+0300`)).getDate()
	,13, 37,
	new Date(`Mon Jan 2 2023 04:15:10 GMT`)
) 
makeThatSHIT(
	(new Date(`Mon Jan 3 2023 04:15:10 GMT+0300`)).getDate()
	,13, 37,
	new Date(`Mon Jan 2 2023 04:15:10 GMT`)
) 
makeThatSHIT(
	(new Date(`Mon Jan 2 2023 04:15:10 GMT+0300`)).getDate()
	,13, 37,
	new Date(`Mon Jan 1 2023 04:15:10 GMT`)
) 
makeThatSHIT(
	(new Date(`Mon Dec 31 2023 04:15:10 GMT+0300`)).getDate()
	,13, 37,
	new Date(`Mon Jan 1 2023 04:15:10 GMT`)
) 
makeThatSHIT(
	(new Date(`Mon Dec 30 2023 04:15:10 GMT+0300`)).getDate()
	,13, 37,
	new Date(`Mon Jan 1 2023 04:15:10 GMT`)
) 


const UTCHandler = {};




exports.UTCHandler = UTCHandler;

