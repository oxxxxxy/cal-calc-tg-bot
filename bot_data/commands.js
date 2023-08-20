require('dotenv').config();

//dishCreatingOrEditingProcessCommands
const dishCreatingOrEditingProcessCommands = {
	name: `ПРОЦЕСС СОЗДАНИЯ И РЕДАКТИРОВАНИЯ БЛЮДА`,
	commands: [
		{
			description:`Добавить ингредиент в блюдо`
			,command:`@${process.env.BOT_USERNAME}`
			,parameterDescription:`вес  (бжук >< N в 100 граммах)  название ингредиента`
			,usageExamples:[
				`@${process.env.BOT_USERNAME} 321 ж<10 филе`
				,`@${process.env.BOT_USERNAME} 765.4 арбуз`
			]
		},
		{
			description: `Удалить ингредиент из блюда`
			,command:`у`
			,parameterDescription:`N из списка создаваемого блюда`
			,usageExamples:[
				`у 2 3 4`
				,`у 5`
			]
		},
		{
			description:`Изменить вес ингредиента в блюде`
			,command:`ви`
			,parameterDescription:`N из списка создаваемого блюда  N новый вес`
			,usageExamples:[
				`ви 1 432.1`
			]
		},
		{
			description:`Итоговый вес блюда`
			,command:`и`
			,parameterDescription:`N итоговый вес всего блюда в граммах. Например, для блюд с испарившейся водой после приготовления`
			,usageExamples:[
				`и 345.2`
			]
		}		
	]
};



/*

		{
			description:
			,command:
			,parameterDescription:
			,usageExamples:[
				
			]
		},





*/










