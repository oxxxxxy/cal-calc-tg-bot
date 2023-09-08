require('dotenv').config();

const commandBlock_help = {
	header:`ПОМОЩЬ`
	,help:{
		commandTitle:`Получить список команд`
		,command:`х`
		,parameters:`или   /h`
		,usageExamples:[
			`х`
		]
	}
}
exports.commandBlock_help = commandBlock_help;

const commandBlock_settings = {
	header:`НАСТРОЙКИ`
	,setTime:{
		commandTitle:`Задать текущее время в 24ч формате`
		,command:`зв`
		,parameters:`N месяца N часов N минут`
		,parameterDescription:`Необходимо задать для подсчета съеденного. По умолчанию задано время по МСК (UTC+3). На примере ниже 26 число текущего месяца 13 часов 37 минут.`
		,usageExamples:[
			`зв  26 13 37`
		]
	}
	,setLang:{
		commandTitle:`Сменить язык интерфейса.`
		,command:`сменить язык`
		,parameterDescription:`Инициирует процесс смены текущего языка на один из доступных.`
		,usageExamples:[
			`сменить язык`
		]
	}
}
exports.commandBlock_settings = commandBlock_settings;

const commandBlock_userFood = {
	header: `ЕДА ПОЛЬЗОВАТЕЛЯ`
	,createFood:{
		commandTitle:`Создать еду`
		,command:`се`
		,parameters:`название еды . бжук N на 100 грамм`
		,parameterDescription:`Задав один или несколько из БЖУ, калорийность посчитается сама. Можно задать только К алорийность.`
		,usageExamples:[
			`се  АБАЛДЕННЫЕ БулАЧкИ ИЗ МАГАЗИКА . б 1.4 ж 8 у 8.2 к 28`
			,`се  лапша гречневая.у76.5 б4`
			,`се  китайская заправка с вайлбика от дяди Яхо Чуми Нет.у8.7ж6.5к67`
		]
	}
	,lookAtCreatedFoods:{
		commandTitle:`Посмотреть созданную еду`
		,command:`псе`
		,parameters:`(бжук &gt;&lt; N в 100 граммах)   (бжук п ву) сортировка по возрастанию/убыванию`
		,usageExamples:[
			`псе  ж&lt;10  жпу`
			,`псе  кпв`
			,`псе`
		]
	}
	,deleteCreatedFood:{
		commandTitle:`Удалить созданную еду`
		,command:`уе`
		,parameters:`ID вашей созданной еды, можно указать несколько ID, без аргумента удаляет последнюю созданную еду`
		,usageExamples:[
			`уе  2  5  7`
		]
	}
}
exports.commandBlock_userFood = commandBlock_userFood;

const commandBlock_userDish = {
	header:`БЛЮДА ПОЛЬЗОВАТЕЛЯ`
	,createDish:{
		commandTitle:`Создать блюдо`
		,command:`сб`
		,parameters:`название блюда`
		,parameterDescription:`Инициирует процесс создания блюда.`
		,usageExamples:[
			`сб  Нашел рецепт плова какого-то. Хз, чо у меня получится... Хоть бы не травануца госпаде...`
			,`сб  голубцы из говядины с овощями с сайта сайтсрецептами.ру`
		]
	}
	,lootAtCreatedDishes:{
		commandTitle:`Посмотреть созданные блюда`
		,command:`псб`
		,parameters:`(бжук &gt;&lt; N в 100 граммах)`
		,parameterDescription:`Фильтры опциональны.`
		,usageExamples:[
			`псб  б&gt;33`
			,`псб`
		]
	}
	,lookAtCreatedDishIngs:{
		commandTitle:`Посмотреть состав созданного блюда`
		,command:`ссб`
		,parameters:`ID созданного блюда`
		,usageExamples:[
			`ссб  12`
		]
	}
	,editCreatedDish:{
		commandTitle:`Редактировать созданное блюдо`
		,command:`рб`
		,parameters:`ID созданного блюда, без аргумента будет изменяться последнее`
		,parameterDescription:`Инициирует процесс редактирования блюда.`
		,usageExamples:[
			`рб  12`
		]
	}
	,renameDish:{
		commandTitle:`Переименовать созданное блюдо`
		,command:`перб`
		,parameters:`ID созданного блюда   новое название блюда`
		,usageExamples:[
			`перб  12  блинчики по другому рецепту`
		]
	}
	,deleteCreatedDish:{
		commandTitle:`Удалить созданное блюдо`
		,command:`уб`
		,parameters:`ID вашей созданного блюда, можно указать несколько ID, без аргумента удаляет последнее созданное блюдо`
		,usageExamples:[
			`уб 13 14`
		]
	}
}
exports.commandBlock_userDish = commandBlock_userDish;

const commandBlock_dishProcess = {
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
exports.commandBlock_dishProcess = commandBlock_dishProcess;

const commandBlock_lookAtProjectFoodnDish = {
	header:`ПРОСМОТР ЕДЫ И БЛЮД ПРОЕКТА`
	,lookAtProjectFood:{
		commandTitle:`Посмотреть еду проекта`
		,command:`пеп`
		,parameters:`(бжук &gt;&lt; N в 100 граммах)`
		,parameterDescription:`Фильтры опциональны.`
		,usageExamples:[
			`пеп  к&gt;444`
			,`пеп`
		]
	}
	,lookAtProjectDish:{
		commandTitle:`Посмотреть блюда проекта`
		,command:`пбп`
		,parameters:`(бжук &gt;&lt; N в 100 граммах)`
		,parameterDescription:`Фильтры опциональны.`
		,usageExamples:[
			`пбп  к &gt; 333`
			,`пбп`
		]
	}
	,lookAtProjectDishIngrs:{
		commandTitle:`Посмотреть состав блюда проекта`
		,command:`сбп`
		,parameters:`ID блюда проекта`
		,usageExamples:[
			`сбп  123`
		]
	}
}
exports.commandBlock_lookAtProjectFoodnDish = commandBlock_lookAtProjectFoodnDish;

const commandBlock_eatenAccounting = {
	header:`УЧЁТ СЪЕДЕННОГО`
	,addEatenFD:{
		commandTitle:`Внести съеденную еду или блюдо`
		,command:`@${process.env.BOT_USERNAME}`
		,parameters:`вес  (бжук &gt;&lt; N в 100 граммах)  название блюда/еды`
		,usageExamples:[
			`@${process.env.BOT_USERNAME}  234.5  у&lt;50  шоколад`
			,`@${process.env.BOT_USERNAME}  432.5  плов с бараниной`
		]
	}
	,deleteEatenFD:{
		commandTitle:`Удалить съеденную еду или блюдо сегодня`
		,command:`усс`
		,parameters:`N блюда/еды из списка съеденного сегодня, можно несколько N, без аргумента удаляет последнюю внесенную еду/блюдо`
		,usageExamples:[
			`усс 12 9`
			,`усс`
		]
	}
	,lookAtEatenToday:{
		commandTitle:`Посмотреть съеденное за сегодня`
		,command:`псс`
		,parameterDescription:`Список съеденных сегодня блюд и еды и суточный БЖУК.`
		,usageExamples:[
			`псс`
		]
	}
	,lookAtEatenYestoday:{
		commandTitle:`Посмотреть съеденное вчера`
		,command:`псв`
		,parameterDescription:`Список съеденных вчера блюд и еды и суточный БЖУК.`
		,usageExamples:[
			`псв`
		]
	}
	,lookAtEatenForTime:{
		commandTitle:`Посмотреть съеденное за временной промежуток`
		,command:`пс`
		,parameters:`N  н неделя м месяц  д только суточный БЖУК, без аргумента список за 1 неделю`
		,parameterDescription:`Список дней с суточным БЖУК и съеденными блюдами и едой.`
		,usageExamples:[
			`пс  2н`
			,`пс  1м  д`
		]
	}
}
exports.commandBlock_eatenAccounting = commandBlock_eatenAccounting;

const commandBlock_dayLimits = {
	header:`ОГРАНИЧЕНИЕ СУТОЧНОГО БЖУКа`
	,createDay:{
		commandTitle:`Создать день с заданным БЖУКом`
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
		commandTitle:`Посмотреть созданные дни`
		,command:`псд`
		,parameterDescription:`Список дней с БЖУКом.`
		,usageExamples:[
			`псд`
		]
	}
	,setDay:{
		commandTitle:`Задать день`
		,command:`зд`
		,parameters:`N дня`
		,parameterDescription:`Задается суточное ограничение по БЖУК.`
		,usageExamples:[
			`зд 2`
		]
	}
	,deleteDay:{
		commandTitle:`Удалить день`
		,command:`уд`
		,parameters:`N дня, можно несколько N, без аргумента удаляется последний созданный день`
		,parameterDescription:``
		,usageExamples:[
			`уд 2 5`
		]
	}
	,dropDay:{
		commandTitle:`Сбросить день`
		,command:`сбр`
		,parameterDescription:`Сбрасывается суточное ограничение по БЖУКу.`
		,usageExamples:[
			`сбр`
		]
	}
}
exports.commandBlock_dayLimits = commandBlock_dayLimits;

const commandBlock_chainOfDayLimits = {
	header:`РАСПИСАНИЕ БЖУКов`
	,createDayChain:{
		commandTitle:`Создать цепочку дней с заданными БЖУКами`
		,command:`сц`
		,parameters:`N созданных дней по порядку`
		,parameterDescription:`Зацикленное расписание суточных БЖУКов. Не больше 30 дней в цепочке.`
		,usageExamples:[
			`сц 1 1 1 1 1 1 2`
			,`сц 3 4 4`
		]
	}
	,lookAtDayChains:{
		commandTitle:`Посмотреть созданные цепочки дней`
		,command:`псц`
		,parameterDescription:`Список созданных цепочек.`
		,usageExamples:[
			`псц`
		]
	}
	,setDayChain:{
		commandTitle:`Задать цепочку дней`
		,command:`зц`
		,parameters:`N цепочки  (N дня, по умолчанию с 1-го дня)`
		,parameterDescription:`Задается расписание, которое будет повторяться по окончанию.`
		,usageExamples:[
			`зц  1  7`
			,`зц 2`
		]
	}
	,deleteDayChain:{
		commandTitle:`Удалить цепочку дней`
		,command:`уц`
		,parameters:`N цепочки, можно несколько N, без аргумента удаляется последняя созданная цепочка`
		,parameterDescription:``
		,usageExamples:[
			`уц 1 2`
		]
	}
	,dropDayChain:{
		commandTitle:`Сбросить цепочку дней`
		,command:`сбр`
		,parameterDescription:`Сбрасывается выбранное расписание заданных суточных БЖУКов.`
		,usageExamples:[
			`сбр`
		]
	}
}
exports.commandBlock_chainOfDayLimits = commandBlock_chainOfDayLimits;

const commandBlock_exchangeOfUserFoodDish = {
	header:`ШЕРИНГ СОЗДАННЫХ ЕДЫ И БЛЮД`
	,copyFood:{
			commandTitle:`Скопировать созданную еду другого пользователя`
			,parameterDescription:`Переслать сообщение созданное мной с кодом еды в личный чат со мной. Мной, ботом твоим, йопта.`
		}
	,shareFood:{
			commandTitle:`Поделиться созданной едой с другими пользователями`
			,command:`@${process.env.BOT_USERNAME}`
			,parameters:`(бжук &gt;&lt; N) название еды`
			,parameterDescription:`Создается сообщение с кодом вашей созданной еды, которое пересылает другой пользователь в свой чат со мной.`
			,usageExamples:[
				`@${process.env.BOT_USERNAME} б&gt;20 АБАЛДЕННЫЕ БулАЧкИ`
			]
		}
	,copyDish:{
			commandTitle:`Скопировать созданное блюдо другого пользователя`
			,parameterDescription:`Переслать сообщение созданное мной с кодом блюда в личный чат со мной. Мной, ботом твоим, йопта.`
		}
	,shareDish:{
			commandTitle:`Поделиться созданным блюдом с другими пользователями`
			,command:`@${process.env.BOT_USERNAME}`
			,parameters:`(бжук &gt;&lt; N) название блюда`
			,parameterDescription:`Создается сообщение с кодом вашего созданного блюда, которое пересылает другой пользователь в свой чат со мной.`
			,usageExamples:[
				`@${process.env.BOT_USERNAME} супер протеиновый коктейль ХАНАПОЧКАМ`
			]
		}
}
exports.commandBlock_exchangeOfUserFoodDish = commandBlock_exchangeOfUserFoodDish;

const commandBlockList = [
	commandBlock_help
	,commandBlock_settings
	,commandBlock_userFood
	,commandBlock_userDish
	,commandBlock_dishProcess
	,commandBlock_lookAtProjectFoodnDish
	,commandBlock_eatenAccounting
	,commandBlock_dayLimits
	,commandBlock_chainOfDayLimits
	,commandBlock_exchangeOfUserFoodDish
];
exports.commandBlockList = commandBlockList;

