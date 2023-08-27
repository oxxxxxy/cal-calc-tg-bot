require('dotenv').config();

const help = {
	header:`ПОМОЩЬ`
	,help:{
		commandBlockName:`help`
		,commandTitle:`Получить список команд`
		,command:`х`
		,parameters:`или   /h`
		,usageExamples:[
			`х`
		]
	}
}

const settings = {
	header:`НАСТРОЙКИ`
	,setTime:{
		commandBlockName:`utils`
		,commandTitle:`Задать текущее время в 24ч формате`
		,command:`зв`
		,parameters:`N часов : N минут`
		,parameterDescription:`Необходимо задать для подсчета съеденного. По умолчанию задано время по Мск.`
		,usageExamples:[
			`зв  13:37`
		]
	}
}

const userFood = {
	header: `ЕДА ПОЛЬЗОВАТЕЛЯ`
	,createFood:{
		commandBlockName:`userFood`
		,commandTitle:`Создать еду`
		,command:`се`
		,parameters:`название еды . бжук N на 100 грамм`
		,parameterDescription:`Задав один или несколько из БЖУ, калорийность посчитается сама. Можно задать только К алорийность.`
		,usageExamples:[
			`се  АБАЛДЕННЫЕ БулАЧкИ ИЗ МАГАЗИКА . б 1.4 ж 8 у 8.2 к 28`
			,`се лапша гречневая.у76.5 б4`
			,`се китайская заправка с вайлбика от дяди Яхо Чуми Нет.у8.7ж6.5к67`
		]
	}
	,lookAtCreatedFoods:{
		commandBlockName:`userFood`
		,commandTitle:`Посмотреть созданную еду`
		,command:`псе`
		,parameters:`(бжук &gt;&lt; N в 100 граммах)`
		,parameterDescription:`Фильтры опциональны.`
		,usageExamples:[
			`псе  ж&lt;10`
			,`псе`
		]
	}
	,deleteCreatedFood:{
		commandBlockName:`userFood`
		,commandTitle:`Удалить созданную еду`
		,command:`уе`
		,parameters:`ID вашей созданной еды, можно указать несколько ID, без аргумента удаляет последнюю созданную еду`
		,usageExamples:[
			`уе  2  5  7`
		]
	}
}

const userDish = {
	header:`БЛЮДА ПОЛЬЗОВАТЕЛЯ`
	,createDish:{
		commandBlockName:`userDish`
		,commandTitle:`Создать блюдо`
		,command:`сб`
		,parameters:`название блюда`
		,parameterDescription:`Инициирует процесс создания блюда.`
		,usageExamples:[
			`сб  Нашел рецепт плова какого-то. Хз, чо у меня получится... Хоть бы не травануца госпаде...`
			,`сб  голубцы из говядины с овощями с сайта сайтсрецептами.ру`
		]
	}
	,lootAtCreatedDishes:{
		commandBlockName:`userDish`
		,commandTitle:`Посмотреть созданные блюда`
		,command:`псб`
		,parameters:`(бжук &gt;&lt; N в 100 граммах)`
		,parameterDescription:`Фильтры опциональны.`
		,usageExamples:[
			`псб  б&gt;33`
			,`псб`
		]
	}
	,lookAtCreatedDishIngs:{
		commandBlockName:`userDish`
		,commandTitle:`Посмотреть состав созданного блюда`
		,command:`ссб`
		,parameters:`ID созданного блюда`
		,usageExamples:[
			`ссб  12`
		]
	}
	,editCreatedDish:{
		commandBlockName:`userDish`
		,commandTitle:`Редактировать созданное блюдо`
		,command:`рб`
		,parameters:`ID созданного блюда, без аргумента будет изменяться последнее`
		,parameterDescription:`Инициирует процесс редактирования блюда.`
		,usageExamples:[
			`рб  12`
		]
	}
	,renameDish:{
		commandBlockName:`userDish`
		,commandTitle:`Переименовать созданное блюдо`
		,command:`пб`
		,parameters:`ID созданного блюда, без аргумента будет переименоваться последнее`
		,parameterDescription:`Инициирует процесс переименования блюда.`
		,usageExamples:[
			`пб  12`
		]
	}
	,deleteCreatedDish:{
		commandBlockName:`userDish`
		,commandTitle:`Удалить созданное блюдо`
		,command:`уб`
		,parameters:`ID вашей созданного блюда, можно указать несколько ID, без аргумента удаляет последнее созданное блюдо`
		,usageExamples:[
			`уб 13 14`
		]
	}
}

const dishRenaming = {
	header: `ПРОЦЕСС ПЕРЕИМЕНОВАНИЯ БЛЮДА`
	,renameDish:{
		subCommandBlockName:`dichRenaming`
		,commandTitle:`Переименовать созданное блюдо`
		,command:`новое название созданного блюда`
		,usageExamples:[
			`колбасный фарш с перцем 02.03.23`
		]
	}
}

const dishProcess = {
	header: `ПРОЦЕСС РЕДАКТИРОВАНИЯ БЛЮДА`
	,addIngredient:{
		subCommandBlockName:`dichProcessCRUD`
		,commandTitle:`Добавить ингредиент в блюдо`
		,command:`@${process.env.BOT_USERNAME}`
		,parameters:`вес  (бжук &gt;&lt; N в 100 граммах)  название ингредиента`
		,usageExamples:[
			`@${process.env.BOT_USERNAME}  321  ж&gt;10  филе`
			,`@${process.env.BOT_USERNAME}  765.4  арбуз`
		]
	}
	,deleteIngredient:{
		subCommandBlockName:`dichProcessCRUD`
		,commandTitle: `Удалить ингредиент из блюда`
		,command:`у`
		,parameters:`N из списка создаваемого блюда`
		,usageExamples:[
			`у  2  3  4`
			,`у  5`
		]
	}
	,editIngredientWeight:{
		subCommandBlockName:`dichProcessCRUD`
		,commandTitle:`Изменить вес ингредиента в блюде`
		,command:`ви`
		,parameters:`N из списка создаваемого блюда  N новый вес`
		,usageExamples:[
			`ви  1  432.1`
		]
	}
	,setTotalDishWeight:{
		subCommandBlockName:`dichProcessCRUD`
		,commandTitle:`Задать итоговый вес блюда`
		,command:`и`
		,parameters:`N итоговый вес всего блюда в граммах`
		,parameterDescription:`Например, блюда с испарившейся водой после приготовления.`
		,usageExamples:[
			`и  345.2`
		]
	}		
	,renameDish:{
		subCommandBlockName:`dichProcessCRUD`
		,commandTitle:`Переименовать созданное блюдо`
		,command:`п`
		,parameters:`новое название созданного блюда`
		,usageExamples:[
			`п  колбасный фарш с перцем 03.03.23`
		]
	}		
};

const projectFD = {
	header:`ПРОСМОТР ЕДЫ И БЛЮД ПРОЕКТА`
	,lookAtProjectFood:{
		commandBlockName:`projectFD`
		,commandTitle:`Посмотреть еду проекта`
		,command:`пеп`
		,parameters:`(бжук &gt;&lt; N в 100 граммах)`
		,parameterDescription:`Фильтры опциональны.`
		,usageExamples:[
			`пеп  к&gt;444`
			,`пеп`
		]
	}
	,lookAtProjectDish:{
		commandBlockName:`projectFD`
		,commandTitle:`Посмотреть блюда проекта`
		,command:`пбп`
		,parameters:`(бжук &gt;&lt; N в 100 граммах)`
		,parameterDescription:`Фильтры опциональны.`
		,usageExamples:[
			`пбп  к &gt; 333`
			,`пбп`
		]
	}
	,lookAtProjectDishIngrs:{
		commandBlockName:`projectFD`
		,commandTitle:`Посмотреть состав блюда проекта`
		,command:`сбп`
		,parameters:`ID блюда проекта`
		,usageExamples:[
			`сбп  123`
		]
	}
}

const eatenFD = {
	header:`УЧЁТ СЪЕДЕННОГО`
	,addEatenFD:{
		commandBlockName:`eatenFD`
		,commandTitle:`Внести съеденную еду или блюдо`
		,command:`@${process.env.BOT_USERNAME}`
		,parameters:`вес  (бжук &gt;&lt; N в 100 граммах)  название блюда/еды`
		,usageExamples:[
			`@${process.env.BOT_USERNAME}  234.5  у&lt;50  шоколад`
			,`@${process.env.BOT_USERNAME}  432.5  плов с бараниной`
		]
	}
	,deleteEatenFD:{
		commandBlockName:`eatenFD`
		,commandTitle:`Удалить съеденную еду или блюдо сегодня`
		,command:`усс`
		,parameters:`N блюда/еды из списка съеденного сегодня, можно несколько N, без аргумента удаляет последнюю внесенную еду/блюдо`
		,usageExamples:[
			`усс 12 9`
			,`усс`
		]
	}
	,lookAtEatenToday:{
		commandBlockName:`eatenFD`
		,commandTitle:`Посмотреть съеденное за сегодня`
		,command:`псс`
		,parameterDescription:`Список съеденных сегодня блюд и еды и суточный БЖУК.`
		,usageExamples:[
			`псс`
		]
	}
	,lookAtEatenYestoday:{
		commandBlockName:`eatenFD`
		,commandTitle:`Посмотреть съеденное вчера`
		,command:`псв`
		,parameterDescription:`Список съеденных вчера блюд и еды и суточный БЖУК.`
		,usageExamples:[
			`псв`
		]
	}
	,lookAtEatenForTime:{
		commandBlockName:`eatenFD`
		,commandTitle:`Посмотреть съеденное за временной промежуток`
		,command:`пс`
		,parameters:`N  н неделя м месяц  д только суточный БЖУК, без аргумента список за 1 неделю`
		,parameterDescription:`Список дней с суточным БЖУК и съеденными блюдами и едой.`
		,usageExamples:[
			`пс  2н`
			,`пс  1м  д`
		]
	}
}

const day = {
	header:`ОГРАНИЧЕНИЕ СУТОЧНОГО БЖУКа`
	,createDay:{
		commandBlockName:`day`
		,commandTitle:`Создать день с заданным БЖУКом`
		,command:`сд`
		,parameters:`название .  бжук N`
		,parameterDescription:`Калорийность можно не задавать, если задано что-то из БЖУ.`
		,usageExamples:[
			`сд  кето день. б123ж321`
			,`сд  тренировочный день. б 200 у500 ж 90`
			,`сд  восстановительный день. б1500у300ж100`
		]
	}
	,lookAtDays:{
		commandBlockName:`day`
		,commandTitle:`Посмотреть созданные дни`
		,command:`псд`
		,parameterDescription:`Список дней с БЖУКом.`
		,usageExamples:[
			`псд`
		]
	}
	,setDay:{
		commandBlockName:`day`
		,commandTitle:`Задать день`
		,command:`зд`
		,parameters:`N дня`
		,parameterDescription:`Задается суточное ограничение по БЖУК.`
		,usageExamples:[
			`зд 2`
		]
	}
	,deleteDay:{
		commandBlockName:`day`
		,commandTitle:`Удалить день`
		,command:`уд`
		,parameters:`N дня, можно несколько N, без аргумента удаляется последний созданный день`
		,parameterDescription:``
		,usageExamples:[
			`уд 2 5`
		]
	}
	,dropDay:{
		commandBlockName:`day`
		,commandTitle:`Сбросить день`
		,command:`сбр`
		,parameterDescription:`Сбрасывается суточное ограничение по БЖУКу.`
		,usageExamples:[
			`сбр`
		]
	}
}

const dayChain = {
	header:`РАСПИСАНИЕ БЖУКов`
	,createDayChain:{
		commandBlockName:`dayChain`
		,commandTitle:`Создать цепочку дней с заданными БЖУКами`
		,command:`сц`
		,parameters:`N созданных дней по порядку`
		,parameterDescription:`Зацикленное расписание суточных БЖУКов. Не больше 30 дней в цепочке.`
		,usageExamples:[
			`сц 1 1 1 1 1 1 2`
			,`сц 3 4 4`
		]
	}
	,lookAtDayChains:{
		commandBlockName:`dayChain`
		,commandTitle:`Посмотреть созданные цепочки дней`
		,command:`псц`
		,parameterDescription:`Список созданных цепочек.`
		,usageExamples:[
			`псц`
		]
	}
	,setDayChain:{
		commandBlockName:`dayChain`
		,commandTitle:`Задать цепочку дней`
		,command:`зц`
		,parameters:`N цепочки  (N дня, по умолчанию с 1-го дня)`
		,parameterDescription:`Задается расписание, которое будет повторяться по окончанию.`
		,usageExamples:[
			`зц  1  7`
			,`зц 2`
		]
	}
	,deleteDayChain:{
		commandBlockName:`dayChain`
		,commandTitle:`Удалить цепочку дней`
		,command:`уц`
		,parameters:`N цепочки, можно несколько N, без аргумента удаляется последняя созданная цепочка`
		,parameterDescription:``
		,usageExamples:[
			`уц 1 2`
		]
	}
	,dropDayChain:{
		commandBlockName:`dayChain`
		,commandTitle:`Сбросить цепочку дней`
		,command:`сбр`
		,parameterDescription:`Сбрасывается выбранное расписание заданных суточных БЖУКов.`
		,usageExamples:[
			`сбр`
		]
	}
}

const copyShareFoodDish = {
	header:`ШЕРИНГ СОЗДАННЫХ ЕДЫ И БЛЮД`
	,copyFood:{
			commandBlockName:`copyShareFoodDish`
			,commandTitle:`Скопировать созданную еду другого пользователя`
			,parameterDescription:`Переслать сообщение созданное мной с кодом еды в личный чат со мной. Мной, ботом твоим, йопта.`
		}
	,shareFood:{
			commandBlockName:`copyShareFoodDish`
			,commandTitle:`Поделиться созданной едой с другими пользователями`
			,command:`@${process.env.BOT_USERNAME}`
			,parameters:`(бжук &gt;&lt; N) название еды`
			,parameterDescription:`Создается сообщение с кодом вашей созданной еды, которое пересылает другой пользователь в свой чат со мной.`
			,usageExamples:[
				`@${process.env.BOT_USERNAME} б&gt;20 АБАЛДЕННЫЕ БулАЧкИ`
			]
		}
	,copyDish:{
			commandBlockName:`copyShareFoodDish`
			,commandTitle:`Скопировать созданное блюдо другого пользователя`
			,parameterDescription:`Переслать сообщение созданное мной с кодом блюда в личный чат со мной. Мной, ботом твоим, йопта.`
		}
	,shareDish:{
			commandBlockName:`copyShareFoodDish`
			,commandTitle:`Поделиться созданным блюдом с другими пользователями`
			,command:`@${process.env.BOT_USERNAME}`
			,parameters:`(бжук &gt;&lt; N) название блюда`
			,parameterDescription:`Создается сообщение с кодом вашего созданного блюда, которое пересылает другой пользователь в свой чат со мной.`
			,usageExamples:[
				`@${process.env.BOT_USERNAME} супер протеиновый коктейль ХАНАПОЧКАМ`
			]
		}
}

/*

		,{
			commandBlockName:``
			,commandTitle:``
			,command:``
			,parameters:``
			,parameterDescription:``
			,usageExamples:[
				``
			]
		}

*/

const HTMLBold = str => {
	return `<b>${str}</b>`;
}

const HTMLUnderline = str =>{
	return `<u>${str}</u>`;
}

const HTMLItalic = str => {
	return `<i>${str}</i>`;
}
const HTMLMonospace = str => {
	return `<code>${str}</code>`;
}

const getHTMLCommandsOfCommandBlock = (obj, blockNum) => {
	let str = ``
	,i = 1;

	for (const p in obj) {
		if(p == `header`){
			str += `${HTMLBold(obj[p])}\n\n`;
		} else {		
			str += `${blockNum ? blockNum + '.' : ''}${i}) ${obj[p].commandTitle}\n`;
			i++;			

			if(obj[p].command){
				str += `__${HTMLMonospace(obj[p].command)}    `;
			}
			if(obj[p].parameters){
				str += `${obj[p].parameters}    `;
			}
			if(obj[p].parameterDescription){
				str += obj[p].parameterDescription;
			}
			if(obj[p].usageExamples){
				str += `\n  ${HTMLItalic(obj[p].usageExamples.join('\n  '))}`;
			}
			str += `\n\n`;
		}
	}

	return str;
}

const commandList = [
	help,
	settings,
	userFood,
	userDish,
	dishRenaming,
	dishProcess,
	projectFD,
	eatenFD,
	day,
	dayChain,
	copyShareFoodDish
];

const HTMLCommandMaker = {};
Object.defineProperty(HTMLCommandMaker, `fullDescCommandListPerPageCounts`, {
	value:(function () {
		let forEveryPageCountOfCommands = [];
		
		let str = ``;
		for(let i = 0, sequence = 0; i < commandList.length; i++){
			str += getHTMLCommandsOfCommandBlock(commandList[i], i + 1);
						
			sequence++;

			if(str.length > 2000 && str.length < 2450){
				forEveryPageCountOfCommands.push(sequence);
				sequence = 0;
				str = ``;
			} else if (str.length > 2450) {
				forEveryPageCountOfCommands.push(sequence - 1);
				i = i - 1;
				sequence = 0;
				str = ``;
			}

			if(i == commandList.length - 1){
				if(sequence != 0){
					forEveryPageCountOfCommands.push(sequence);
					str = ``;
				}
				break;
			}
		}

		return forEveryPageCountOfCommands.concat([]);
	}())
});
Object.defineProperty(HTMLCommandMaker, `getFullDescCommandListPage`, {
	value:function (num){
		const lengthOfPages = HTMLCommandMaker.fullDescCommandListPerPageCounts.length;
		const lengthOfCommandList = commandList.length;

		if(!num){
			num = 1;
		} else if(num > lengthOfPages) {
			num = lengthOfPages;
		}

		const commandCountOnPage = HTMLCommandMaker.fullDescCommandListPerPageCounts[num - 1];
		const skippedCommandCountPages =	HTMLCommandMaker.fullDescCommandListPerPageCounts.slice(0, num - 1);
		
		let skippedCommandCount = 0;
		skippedCommandCountPages.forEach(e => skippedCommandCount += e);

		let str = `${HTMLBold(HTMLUnderline('СПИСОК КОМАНД'))}\n\n`;

		for(let i = skippedCommandCount, limit = skippedCommandCount + commandCountOnPage; i < limit; i++){
			str += getHTMLCommandsOfCommandBlock(commandList[i], i + 1);
		}
		
		return str;
	}
});
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
Object.defineProperty(HTMLCommandMaker, `getCommandByNum`, {
	value:function (num) {
		let i = 0;

		for (let p in this) {
			i++;
			if(num == i){
				return this[p];
			}
		}
	}
});

exports.HTMLCommandMaker = HTMLCommandMaker;
