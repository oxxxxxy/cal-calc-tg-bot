require('dotenv').config();

//dishCreatingOrEditingProcessCommands
const dishCreatingOrEditingProcessCommands = {
	header: `ПРОЦЕСС СОЗДАНИЯ И РЕДАКТИРОВАНИЯ БЛЮДА`,
	commands: [
		{
			subCommandBlockName:`dichProcessCRUD`
			,description:`Добавить ингредиент в блюдо`
			,command:`@${process.env.BOT_USERNAME}`
			,parameters:`вес  (бжук >< N в 100 граммах)  название ингредиента`
			,usageExamples:[
				`@${process.env.BOT_USERNAME}  321  ж<10  филе`
				,`@${process.env.BOT_USERNAME}  765.4  арбуз`
			]
		},
		{
			subCommandBlockName:`dichProcessCRUD`
			,description: `Удалить ингредиент из блюда`
			,command:`у`
			,parameters:`N из списка создаваемого блюда`
			,usageExamples:[
				`у  2  3  4`
				,`у  5`
			]
		},
		{
			subCommandBlockName:`dichProcessCRUD`
			,description:`Изменить вес ингредиента в блюде`
			,command:`ви`
			,parameters:`N из списка создаваемого блюда  N новый вес`
			,usageExamples:[
				`ви  1  432.1`
			]
		},
		{
			subCommandBlockName:`dichProcessCRUD`
			,description:`Итоговый вес блюда`
			,command:`и`
			,parameters:`N итоговый вес всего блюда в граммах`
			,parameterDescription:`Например, блюда с испарившейся водой после приготовления.`
			,usageExamples:[
				`и  345.2`
			]
		}		
	]
};

const mainCommands = {
	header:`СПИСОК КОМАНД`,
	commands:[
		{
			commandBlockName:`utils`
			,description:`Список команд`
			,command:`х`
			,usageExamples:[
				`х`
			]
		}
		,{
			commandBlockName:`utils`
			,description:`Задать текущее время в 24ч формате`
			,command:`зв`
			,parameters:`N часов : N минут`
			,parameterDescription:`Необходимо задать для подсчета съеденного. По умолчанию задано время по Мск.`
			,usageExamples:[
				`зв  13:37`
			]
		}

		,{
			commandBlockName:`foodCRD`
			,description:`Создать еду`
			,command:`се`
			,parameters:`название еды . бжук N на 100 грамм`
			,parameterDescription:`Задав один или несколько из БЖУ, калорийность посчитается сама. Можно задать только К алорийность.`
			,usageExamples:[
				`се  АБАЛДЕННЫЕ БулАЧкИ ИЗ МАГАЗИКА . б 1.4 ж 8 у 8.2 к 28`
				,`се лапша гречневая.у76.5 б4`
				,`се китайская заправка с вайлбика от дяди Яхо Чуми Нет.у8.7ж6.5к67`
			]
		}
		,{
			commandBlockName:`foodCRD`
			,description:`Посмотреть созданную еду`
			,command:`псе`
			,parameters:`бжук >< N`
			,parameterDescription:`Фильтры опциональны.`
			,usageExamples:[
				`псе  ж<10`
				,`псе`
			]
		}
		,{
			commandBlockName:`foodCRD`
			,description:`Удалить созданную еду`
			,command:`уе`
			,parameters:`ID вашей созданной еды, можно указать несколько ID`
			,usageExamples:[
				`уе  2  5  7`
			]
		}

		,{
			commandBlockName:`dishCRUD`
			,description:`Создать блюдо`
			,command:`сб`
			,parameters:`название блюда`
			,parameterDescription:`Инициирует процесс создания блюда.`
			,usageExamples:[
				`сб  Нашел рецепт плова какого-то. Хз, чо у меня получится... Хоть бы не травануца госпаде...`
				,`сб  голубцы из говядины с овощями с сайта сайтсрецептами.ру`
			]
		}
		,{
			commandBlockName:`dishCRUD`
			,description:`Посмотреть созданные блюда`
			,command:`псб`
			,parameters:`бжук >< N`
			,parameterDescription:`Фильтры опциональны.`
			,usageExamples:[
				`псб  б>33`
				,`псб`
			]
		}
		,{
			commandBlockName:`dishCRUD`
			,description:`Посмотреть состав созданного блюда`
			,command:`ссб`
			,parameters:`ID созданного блюда`
			,usageExamples:[
				`ссб  12`
			]
		}
		,{
			commandBlockName:`dishCRUD`
			,description:`Изменить созданное блюдо`
			,command:`исб`
			,parameters:`ID созданного блюда`
			,parameterDescription:`Инициирует процесс редактирования блюда.`
			,usageExamples:[
				`исб 12`
			]
		}
		,{
			commandBlockName:`dishCRUD`
			,description:`Удалить созданное блюдо`
			,command:`уб`
			,parameters:`ID вашей созданного блюда, можно указать несколько ID`
			,usageExamples:[
				`уб 13 14`
			]
		}

		,{
			commandBlockName:`projectFD`
			,description:`Посмотреть еду проекта`
			,command:`пеп`
			,parameters:`бжук >< N`
			,parameterDescription:`Фильтры опциональны.`
			,usageExamples:[
				`пеп  к<444`
				,`пеп`
			]
		}
		,{
			commandBlockName:`projectFD`
			,description:`Посмотреть блюда проекта`
			,command:`пбп`
			,parameters:`бжук >< N`
			,parameterDescription:`Фильтры опциональны.`
			,usageExamples:[
				`пбп  к < 333`
				,`пбп`
			]
		}
		,{
			commandBlockName:`projectFD`
			,description:`Посмотреть состав блюда проекта`
			,command:`сбп`
			,parameters:`ID блюда проекта`
			,usageExamples:[
				`сбп  123`
			]
		}




/*

		,{
			commandBlockName:``
			,description:``
			,command:``
			,parameters:``
			,parameterDescription:``
			,usageExamples:[
				``
			]
		}

*/


		,{
			commandBlockName:`share`
			,description:``
			,command:``
			,parameters:``
			,parameterDescription:``
			,usageExamples:[
				``
			]
		}

	]
};












