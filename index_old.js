const telegraf = require(`telegraf`);
const pg = require(`pg`);

const { MeiliSearch, ContentTypeEnum } = require(`meilisearch`);
//console.log(meiliS)


require('dotenv').config()

const inlineQuery = require(`./modules/inlineQuery.js`);
const HZ = require(`./modules/checkSender.js`);
const {
	objKeysToColumnStr,
	objKeysToColumn$IndexesStr,
	objKeysValuesToColumnValuesStr,
	getArrOfValuesFromObj,
	getStrOfColumnNamesAndTheirSettedValues

} = require(`./modules/queryUtils.js`);
const {
	COMMAND__CREATE_FOOD,
	COMMAND__CREATE_FOOD__YES,
	COMMAND__CREATE_FOOD__NO
} = require(`./modules/user_commands/create_food_funcs.js`);
// const { inlineKeyboard } = require('telegraf/typings/markup.js');
// const { callback } = require('telegraf/typings/button.js');



const TG_USERS_LAST_ACTION_TIME = {};

const ISofU = [];
const NUTRIENTS = [];



const RE_RU_NUTRIENTS = [];
	/*
	(б|белок|белки)(\\s+|)(\\d+(\\s+|)(,|\\.)(\\s+|)\\d+|\\d+)(\\s+|)/u  //(г|мкг|мг|ккал|)/u,
	(к|ккал|кал|калорийность)(\\s+|)(\\d+(\\s+|)(,|\\.)(\\s+|)\\d+|\\d+)(\\s+|)/u  //(г|мкг|мг|ккал|)/u,
	(ж|жир|жиры)(\\s+|)(\\d+(\\s+|)(,|\\.)(\\s+|)\\d+|\\d+)(\\s+|)/u  //(г|мкг|мг|ккал|)/u,
	(у|угли|углевод|углеводы)(\\s+|)(\\d+(\\s+|)(,|\\.)(\\s+|)\\d+|\\d+)(\\s+|)(/u  //г|мкг|мг|ккал|)/u, 
	*/

const RE_RU_YES = /^д$/u;
const RE_RU_NO = /^н$/u;
const RE_RU_COMMAND__DELETE_LAST_ACTION = /^у$/u;
const RE_RU_COMMAND__CANCEL_LAST_ACTION = /^о$/u;

const RE_RU_COMMAND__CREATE_FOOD = /^(се\s+)((([а-яА-Яa-zA-Z0-9]+)(\s+|))+)\./u;
// /^(с|создать)(\s+|)(е|еду)\s+((([а-яА-Яa-zA-Z0-9]+)(\s+|)){5,})(\s+|)\((\s+|)((([а-яА-Яa-zA-Z0-9]+)(\s+|):(\s+|)(\d+(\s+|)(,|\.)(\s+|)\d+|\d+)(\s+|)(г|мкг|мг|ккал)(\s+|))+)\)$/u;
// ^(с|создать)(\s+|)(е|еду)\s+((([а-яА-Яa-zA-Z0-9]+)(\s+|)){5,})(\s+|)\((\s+|)([а-яА-Яa-zA-Z0-9\s]+)(\s+|)\)$
// ^(с|создать)(\s+|)(е|еду)\s+((([а-яА-Яa-zA-Z0-9]+)(\s+|)){5,})(\s+|)\(
const RE_RU_COMMAND__SHOW_CREATED_FOOD = /^псе$/u;
const RE_RU_COMMAND__DELETE_CREATED_FOOD_IDs = /^уе/u;//(([0-9]+(\s+|)|[0-9]+)+)$/u;

const RE_RU_COMMAND__CREATE_DISH = /^(сб\s+)((([а-яА-Яa-zA-Z0-9]+)(\s+|))+)$/u;
const RE_RU_COMMAND__EDIT_DISH = /^рб\s+([0-9]+)$/u;
	const RE__RESOLVE_FD_ID_WEIGHT_FROM_InlQuery = /(f|d)([0-9]+)w(.*)/;
	const RE_RU_COMMAND__DELETE_INGREDIENTs_FROM_DISH = /^у\s+[0-9]+/u;
	const RE_RU_COMMAND__EDIT_INGREDIENT_WEIGHT_IN_DISH = /^ви\s+([0-9]+)\s+(\d+(\s+|)(,|\.)(\s+|)\d+|\d+)$/u;
	const RE_RU_COMMAND__DISH_TOTAL_WEIGHT = /^и\s+(\d+(\s+|)(,|\.)(\s+|)\d+|\d+)$/u;
/*  кнопками будут епта
	const RE_RU_COMMAND__SAVE_DISH = /^с$/u; 
	const RE_RU_COMMAND__CANCEL_CREATEEDIT_DISH = /^о$/u; */
const RE_RU_COMMAND__DELETE_CREATED_DISH_IDs = /^уб\s+/u; 
const RE_RU_COMMAND__SHOW_CREATED_DISHES = /^псб$/u;

const RE_RU_COMMAND__SHOW_EATEN_TODAY = /^пс$/u;
const RE_RU_COMMAND__SHOW_EATEN_YESTODAY = /^псв$/u;
const RE_RU_COMMAND__SHOW_EATEN_OF_ALL_TIME = /^псз$/u;
const RE_RU_COMMAND__SHOW_EATEN_IN_DAY = /^псд\s+/u;//BY DATE
const RE_RU_COMMAND__EDIT_WEIGHT_OF_EATEN_TODAY_Num = /^ив\s+/u;// num of eaten item, new weight
const RE_RU_COMMAND__EDIT_WEIGHT_OF_EATEN_YESTODAY_Num = /^ивв\s+/u;// num of eaten item, new weight
const RE_RU_COMMAND__EDIT_WEIGHT_OF_EATEN_IN_DAY_Num = /^ивд\s+/u;// num of eaten item, new weight
const RE_RU_COMMAND__DELETE_EATEN_TODAY_Num = /^ус\s+/u;
const RE_RU_COMMAND__DELETE_EATEN_YESTODAY_Num = /^усв\s+/u;
const RE_RU_COMMAND__DELETE_EATEN_IN_DAY_Num = /^усд\s+/u;

const RE_RU_COMMAND__SHOW_FOOD_BY_PARAMs = /^пе/u; //if no param prost eda proekta
const RE_RU_COMMAND__SHOW_DISH_BY_PARAMs = /^пб/u; //if no param prost blyuda proekta

const RE_RU_INLINE_COMMAND__WILL_EAT = /^([0-9]+)г\s+/u;//([0-9]+)\s+((([а-яА-Яa-zA-Z0-9]+)(\s+|)){2,})$/u; //в поиске выдавать с подсчитанным БЖУКом 
	const RE_RU_INLINE_COMMAND__ADD_INGREDIENT_TO_DISH = /^(\d+(\s+|)(,|\.)(\s+|)\d+|\d+)\s+(((б|ж|у|к)(\s+|)(>|<)(\s+|)(\d+))|)/u;
const RE_RU_INLINE_COMMAND__LOOK_AT_FOOD_OR_DISH = /^п\s+/u;// фильтры: еда, блюда проекта/юзера/других пользователей; бжук<>=num; name. e b drugih mojno dobavlyat'



const RE_RU_COMMAND__SET_DAY_BJUK = /^/u;
const RE_RU_COMMAND__SET_LOCAL_TIME = /^([0-1][0-9]|[2][0-3])(\s+|):(\s+|)([0-5][0-9])$/u;

	

// /help 
// /settings



const RE_RU_COMMAND__CREATE_AIM = /^(с|создать)(\s+|)(ц|цель)(\s+|)((п|повторять)(\s+|)\((\s+|)(([0-9]+)(\s+|)д(\s+|)\((\s+|)(([а-яА-Я]+)(\s+|):(\s+|)(([0-9]+)(\s+|)(,|.|)(\s+|)([0-9]+|)(\s+|)(г|%|к))(\s+|)(,|)(\s+|))+(\s+|)\)(\s+|)(,|)(\s+|))+\)(\s+|)((вт|в(\s+|)течении)(\s+|)([0-9]+)(\s+|)(д|м)|)|(([0-9]+)(\s+|)д(\s+|)\((\s+|)(([а-яА-Я]+)(\s+|):(\s+|)(([0-9]+)(\s+|)(,|.|)(\s+|)([0-9]+|)(\s+|)(г|%|к))(\s+|)(,|)(\s+|))+(\s+|)\)(\s+|)(,|)(\s+|))+)$/u; // не больше 365 дней или 12 месяцев,
const RE_RU_COMMAND__COMPLETE_AIM = /^(з|завершить)(\s+|)(ц|цель)(\s+|)([0-9]+)$/u;
const RE_RU_COMMAND__SHOW_AIMS = /^(п|показать)(\s+|)(ц|цели)(\s+|)((а|активные)|(з|завершенные)|(у|удаленные)|)$/u;//???? кнопки
const RE_RU_COMMAND__DELETE_AIM = /^(у|удалить)(\s+|)(ц|цель)$/u; //only active

const RE_RU_COMMAND__ADD_WEIGHTING = /^(в|вес)(\s+|)([0-9]+|[0-9]+(\s+|)(,|.)(\s+|)[0-9]+)$/u;
const RE_RU_COMMAND__DELETE_LAST_ADDED_WEIGHTING = /^(у|удалить)(\s+|)(в|вес)$/u;


const RE_RU_BOT_AND_INLINE_COMMAND__GET_STATS = /^(п|показать)(\s+|)(ст|статистику)(\s+|)(\s+|)((в|вес)|(п|потребление)|(ц|цели)|)(\s+|)((([0-9]+)(\s+|)(д|м|г))|(за(\s+|)вс(ё|е)(\s+|)время)|)$/u; // body or eaten food or aims //ras v chas
const RE_RU_BOT_AND_INLINE_COMMAND__SHOW_EATEN = /^(п|показать)(\s+|)(с|съеденное)()$/u;//??? tok esli v chati gde ne dobavlen bot

const RE_RU_INLINE_COMMAND__OFFER_RANDOM_FOOD = /^/u; //????? //validate users to NOT reserve inline commands
const RE_RU_INLINE_COMMAND__SHARE_CREATED_FOOD_OR_DISH = /^(под|поделиться)\s+((е|едой)|(б|блюдом))\s+((([а-яА-Яa-zA-Z0-9]+)(\s+|)){2,})$/u;







	const tableNames = {};
	tableNames.food_items = `fi`;
	
	const getUserLastCommand = async (pgClient, tgId) => {
		const response = await pgClient.query(`
			SELECT *
			FROM telegram_user_sended_commands
			WHERE tg_user_id = ${tgId}
			ORDER BY id DESC
			limit 1;
		`);

		const userLastCommand = response.rows[0];

		return userLastCommand;
	}

	const getUserSubProcess = async (pgClient, tgId) => {
		const response = await pgClient.query(`
			SELECT *
			FROM telegram_user_subprocesses
			WHERE tg_user_id = ${tgId}
			AND NOT completed
			ORDER BY id DESC
			limit 1;
		`);

		const userSubprocess = response.rows[0];

		return userSubprocess;
	}



			const bjukToNum = obj => {
				obj.protein = Number(obj.protein);
				obj.fat = Number(obj.fat);
				obj.carbohydrate = Number(obj.carbohydrate);
				obj.caloric_content = Number(obj.caloric_content);
				return obj;
			}
			
			const bjukValueToWC = (obj, w) => {
				obj.protein = obj.protein * w / 100;
				obj.fat = obj.fat * w / 100;
				obj.carbohydrate = obj.carbohydrate * w / 100;
				obj.caloric_content = obj.caloric_content * w / 100;
				return obj;
			}
			
			const bjukToFixedNum = obj => {
				obj.protein = obj.protein.toFixed(1);
				obj.fat = obj.fat.toFixed(1);
				obj.carbohydrate = obj.carbohydrate.toFixed(1);
				obj.caloric_content = obj.caloric_content.toFixed(1);
				return obj;
			}
			
			const calcConcentration = (c1, w1, c2, w2) => {
				return (c1 * w1 + c2 * w2)/(w1 + w2);
			}

			const calcDecreiseConcentration = (c1, w1, c2, w2) => {
				return (c1 * w1 - c2 * w2)/(w1 - w2);
			}
				
			const makeDishNumForSheetLine = (num, maxLength) => {
				const defaultMaxLength = 2;
				maxLength = maxLength ? maxLength : defaultMaxLength;
				const str = String(num);
				let result = ``;

				for (let i = 0, diff = maxLength - str.length; i < diff; i++) {
					result += `_`;
				}
				result += `<code>${str}</code>`;

				return result;
			};

			const addCharBeforeValue = (value, maxLength, charS) => {
				let str = Number(value).toFixed(1);
				
				let result = ``;
				const diff = maxLength - str.length;
				if ( diff >= 0) {
					for (let i = 0; i < diff; i++) {
						result += charS;
					}
				} else {
					str = str.slice(Math.abs(diff));
				}
				result += str;

				return result;
			};


	const setZeroBJUKnW = dish => {
		dish.protein = 0;
		dish.fat = 0;
		dish.carbohydrate = 0;
		dish.caloric_content = 0;
		dish.g_weight = 0;

		return dish;
	}

	const setBJUKnWofFirstIngToDish = (ingredient, dish) => {
		const BJUK = ['protein', 'fat', 'carbohydrate', 'caloric_content'];
		
		BJUK.forEach( e => {
			dish[e] =	ingredient[e];
		});

		dish.g_weight = ingredient.g_weight;
	};
					
	const addIngredientInDish = (dish, ingredient) => {
		const BJUK = ['protein', 'fat', 'carbohydrate', 'caloric_content'];

		BJUK.forEach( e => {
			dish[e] =	calcConcentration(
				dish[e],
				dish.g_weight,
				ingredient[e],
				ingredient.g_weight
			);
		});

		if(ingredient.g_weight > 0){
			dish.g_weight += ingredient.g_weight;
		}
	};

	const makeCopyOfObjArray = a => {
		const arr = [];
		
		a.forEach(e => {
			const obj = Object.assign({}, e);
			arr.push(obj);
		});

		return arr;
	};
					

	const calcDishBJUKnW = (d, ings) => {
		let dish = Object.assign({}, d);
		const ingredients = makeCopyOfObjArray(ings);
		
		dish = setZeroBJUKnW(dish);
		dish.total_g_weight = 0;

		ingredients.forEach((el, i) => {
				if(i){
					addIngredientInDish(dish, el);
					return;
				}
				setBJUKnWofFirstIngToDish(el, dish);
			});	

		dish = bjukToFixedNum(dish);
		dish = bjukToNum(dish);

		return dish;
	};


				const makeDishSheetHeader = dish => {
					return `<b><u>|__ID| Название блюда</u></b>\n|${
						makeDishNumForSheetLine(dish.di_id_for_user, 4)}| ${
						dish.name__lang_code_ru}\n\n<u>|<b>№_|Белки__|Жиры___|Углевод|Калории|Вес(грамм)| <i>Ингредиент и его название</i></b></u>`;
				};

				const makeDishSheetFooter = dish => {
					let dishSheetFooter = `\n<u>|<b>И__|Б:${
						addCharBeforeValue(dish.protein, 6, '_')} |Ж:${
						addCharBeforeValue(dish.fat, 6, '_')} |У:${
						addCharBeforeValue(dish.carbohydrate, 6, '_')} |К:${
						addCharBeforeValue(dish.caloric_content, 7, '_')} |В:_100.0|</b></u> Итого на 100 грамм.`;

					let totalWeight = `__н/д__`;
					let difference = `__н/д__`;
					if (dish.total_g_weight) {
						let diff = dish.g_weight - dish.total_g_weight;
						totalWeight = addCharBeforeValue(dish.total_g_weight, 6, '_') + ' ';
						difference = addCharBeforeValue(diff, 6, '_') + ' ';
					}

					dishSheetFooter += `\n<b><u>|Вес:${
						addCharBeforeValue(dish.g_weight, 6, '_')} |Итоговый вес:${
						totalWeight}|Разница:${
						difference}|</u></b>`;

					return dishSheetFooter;
				};
			
	const makeDishSheetLine = (ingreNum, protein, fat, carb, cal, weight, name) => {
				return `\n|${
					makeDishNumForSheetLine(ingreNum)} <u>|Б:${
					addCharBeforeValue(protein, 6, '_')} |Ж:${
					addCharBeforeValue(fat, 6, '_')} |У:${
					addCharBeforeValue(carb, 6, '_')} |К:${
					addCharBeforeValue(cal, 7, '_')} |В:${
					addCharBeforeValue(weight, 6, '_')}</u> <i>${
					name}</i>`
			};

				const makeDishSheet = (d, ings) => {
					let dish = Object.assign({}, d);
					const ingredients = makeCopyOfObjArray(ings);

					let dishSheet = ``;

					dishSheet += makeDishSheetHeader(dish);

					ingredients.forEach(e => {
						e = bjukToNum(
							bjukToFixedNum(
								bjukValueToWC(e, e.g_weight)
							)
						);
						dishSheet += makeDishSheetLine(
							e.n,
							e.protein,
							e.fat,
							e.carbohydrate,
							e.caloric_content,
							e.g_weight,
							e.name__lang_code_ru);
					});

					dishSheet += makeDishSheetFooter(dish);
					
					return dishSheet;
				};

const shortenBJUKnWNOfIngredients = ings => {
		ingredients.forEach((e, i) => {
			const obj = {};
			obj.i = e.id;
			obj.ru = e.name__lang_code_ru;
			obj.p = e.protein;
			obj.f = e.fat;
			obj.c = e.carbohydrate;
			obj.ca = e.caloric_content;
			obj.t = e.t;
			obj.w = e.g_weight;
			ingredients[i] = obj;
		});

		return ingredients;
	};
	
const extendBJUKnWNOfIngredients = ings => {
		const ingredients = makeCopyOfObjArray(ings);
		ingredients.forEach((e, i) => {
			const obj = {};
			obj.id = e.i;
			obj.name__lang_code_ru = e.ru;
			obj.protein = e.p;
			obj.fat = e.f;
			obj.carbohydrate = e.c;
			obj.caloric_content = e.ca;
			obj.t = e.t;
			obj.n = i + 1;
			obj.g_weight = e.w;
			ingredients[i] = obj;
		});

		return ingredients;
	};

	const insertIntoTelegramUserSendedCommandsPostgresTable = async row => {
		let paramQuery = {};
		paramQuery.text = `
			INSERT INTO telegram_user_sended_commands
			(${objKeysToColumnStr(row)})
			VALUES
			(${objKeysToColumn$IndexesStr(row)})
		;`;
		paramQuery.values = getArrOfValuesFromObj(row);
		await DB_CLIENT.query(paramQuery);
	}

	const updateTelegramUserSubprocessPostgresTable = async (id, row) => {
		let paramQuery = {};
		paramQuery.text = `
			UPDATE telegram_user_subprocesses
			SET	${getStrOfColumnNamesAndTheirSettedValues(row)}
			WHERE id = ${id}
		;`;
		await DB_CLIENT.query(paramQuery);
	};

	const updateUserSubprocess = async userSubprocess => {
		let row = {};
		row.data = userSubprocess.data;
		row.sequence = userSubprocess.sequence;
		row.state = userSubprocess.state;

		row.data = JSON.stringify(row.data);
		row.sequence = JSON.stringify(row.sequence);
		row.state = JSON.stringify(row.state);

		await updateTelegramUserSubprocessPostgresTable(
			userSubprocess.id,
			row
		);
	};
	
	const completeUserSubprocess = async (userSubprocess, obj) => {
		let row = {};
		if(obj){
			row = obj;
		}
		row.data = JSON.stringify({});
		row.sequence = JSON.stringify({});
		row.state = JSON.stringify({});
		row.completed = true;

		await updateTelegramUserSubprocessPostgresTable(
			userSubprocess.id,
			row
		);
	};

	const sendMessage = async (chatId, text) => {		
		try{
			return await bot.telegram.sendMessage(
				chatId,
				text
			);
		}catch(e){
			console.log(chatId, text, e);
			return false;
		}
	};

	const editDishSheetMessage = async (chatId, messageId, text, inlineKeyboard) => {	
		try {
			return await bot.telegram.editMessageText(
				chatId,
				messageId,
				``,
				text,
				inlineKeyboard
			);
		} catch(e) {
			console.log(chatId, messageId, text, inlineKeyboard, e);
			if(e.error_code == 400){
				try{
					return await bot.telegram.sendMessage(
						chatId,
						text,
						inlineKeyboard
					);
				}catch(e){
					console.log(chatId, messageId, text, inlineKeyboard, e);
					return false;
				}
			}
		}
	}

	const deleteMessage = async (chatId, messageId) => {		
		try{
			return await bot.telegram.deleteMessage(chatId, messageId);
		}catch(e){
			console.log(chatId, messageId, e);
			if(e.response.error_code == 400){
				return true;
			}
			return false;
		}
	};

	const getSequenceAction = (message_id, subCommand, cause, isBot) => {
		const action = {};
		action.message_id = message_id;

		if(subCommand){
			action.subCommand = subCommand;
		}

		if(cause){
			action.invalidCause = cause;
		}

		if(isBot){
			action.fromBot = true;
		}else {
			action.fromUser = true;
		}

		return action;
	};

					const deletePreviousBotComment = async userSubprocess => {
						const botPreviousComment = userSubprocess.sequence.findLast(e => e.fromBot && !e.deleted);

						if(botPreviousComment) {
							botPreviousComment.deleted = await deleteMessage(
									userSubprocess.tg_user_id,
									botPreviousComment.message_id
								);
						}
					}

					const deletePreviousUserInput = async userSubprocess => {
						const userPreviousInput = userSubprocess.sequence.findLast(e => e.fromUser && e.message_id && !e.deleted);

						if(userPreviousInput){
							userPreviousInput.deleted = await deleteMessage(
									userSubprocess.tg_user_id,
									userPreviousInput.message_id
								);
						}
					};
					
						const completeSubrocessCommand = async (userMessageId, userSubprocess, comment, subCommand, cause) => {
							// add mark of user valid/invalid input
							userSubprocess.sequence.push(
								getSequenceAction(
									userMessageId ? userMessageId : undefined,
									subCommand ? subCommand : undefined,
									cause ? cause : undefined
								)
							);

							await deletePreviousBotComment(userSubprocess);
	
	 						//use for funny reply if sequence of the same bad user input
	 						/* if (botPreviousComment && botPreviousComment?.incorrectCause == cause){
	 							let row = {};
								row.data = userSubprocess.data;
								row.sequence = userSubprocess.sequence;
								row.state = userSubprocess.state;
	 							
	 							row.data = JSON.stringify(row.data);
								row.sequence = JSON.stringify(row.sequence);
								row.state = JSON.stringify(row.state);
	
	 							let paramQuery = {};
								paramQuery.text = `
									UPDATE telegram_user_subprocesses
									SET ${getStrOfColumnNamesAndTheirSettedValues(row)}
									WHERE id = ${userSubprocess.id}
								;`;
								await pgClient.query(paramQuery);
	 							return;
							} */
				
							let res = await sendMessage(
								userSubprocess.tg_user_id,
								comment
							);
			
							if(res){
								userSubprocess.sequence.push(
									getSequenceAction(
										res.message_id,
										subCommand ? subCommand : undefined,
										cause ? cause : undefined,
										true
									)
								);
							}
	
							await updateUserSubprocess(userSubprocess);
						};

				const makeUnderlineIDOfUserCreatedFI = id => {
					const str = String(id);
					const maxStrIDLength = 4;
					
					let result = ``;

					for (let i = 0, diff = maxStrIDLength - str.len; i < diff; i++) {
						result += `_`;
					}

					return result;
				};


							const getNumberOfPages = (lengthOfItems, maxNumberOfLines) => {
								let numberOfPages = Math.floor(lengthOfItems / maxNumberOfLines) + 1;

								if(lengthOfItems > 0 && !(lengthOfItems % maxNumberOfLines)) {
									numberOfPages = numberOfPages - 1;
								}

								return numberOfPages;
							};

						const getPagesOfDish = (lengthOfItems, maxNumberOfLines, selectedPage) => {
							const numberOfPages = getNumberOfPages(lengthOfItems, maxNumberOfLines);
					
							const pages = {};
							pages.selected = selectedPage;
					
							pages.moveNext = selectedPage + 1;
							if (pages.moveNext > numberOfPages) {
								pages.moveNext = numberOfPages;
							}
					
							if (selectedPage > 1) {
								pages.movePrevious = selectedPage - 1;
							} else {
								pages.movePrevious = 1;
							}
							return pages;
						}
						
const getButtonTextPagesOfDish = pages => {
							const buttonTextPages = {};

							if (pages.movePrevious == pages.selected) {
								buttonTextPages.left = `<<${pages.movePrevious}>>`;
							} else {
								buttonTextPages.left = `${pages.movePrevious}<<`;
							}

							buttonTextPages.middle = `<<${pages.selected}>>`;

							if (pages.moveNext == pages.selected) {
								buttonTextPages.right = `<<${pages.moveNext}>>`;
							} else {
								buttonTextPages.right = `>>${pages.moveNext}`;
							}

							return buttonTextPages;
						};


					const getDishMessage = (selectedPage, maxNumberOfLines, userSubprocess) => {
						const lengthOfIngredients = userSubprocess.data.ingredients.length;

						const message = {};

						if (lengthOfIngredients > maxNumberOfLines) {
							const pages = getPagesOfDish(lengthOfIngredients, maxNumberOfLines, selectedPage);
							const buttonTextPages = getButtonTextPagesOfDish(pages);

							message.inlineKeyboard = telegraf.Markup.inlineKeyboard(
								[
									[	
										telegraf.Markup.button.callback(buttonTextPages.left, `i${userSubprocess.tg_user_id}p${pages.movePrevious}`),
										telegraf.Markup.button.callback(buttonTextPages.middle, `i${userSubprocess.tg_user_id}p${pages.selected}`),
										telegraf.Markup.button.callback(buttonTextPages.right, `i${userSubprocess.tg_user_id}p${pages.moveNext}`)
									],
									[
										telegraf.Markup.button.callback(`Сохранить`, `i${userSubprocess.tg_user_id}save`),
										telegraf.Markup.button.callback(`Отменить`, `i${userSubprocess.tg_user_id}cancel`),
										telegraf.Markup.button.callback(`Команды`, `i${userSubprocess.tg_user_id}commands`)
									]
								]
							);
						} else {
							message.inlineKeyboard = telegraf.Markup.inlineKeyboard(
								[
									[
										telegraf.Markup.button.callback(`Сохранить`, `i${userSubprocess.tg_user_id}save`),
										telegraf.Markup.button.callback(`Отменить`, `i${userSubprocess.tg_user_id}cancel`),
										telegraf.Markup.button.callback(`Команды`, `i${userSubprocess.tg_user_id}commands`)
									]
								]
							);
						}

						const selectedIngredients = userSubprocess.data.ingredients.slice(
							(selectedPage - 1) * maxNumberOfLines,
							selectedPage * maxNumberOfLines
						);
						
						message.text = makeDishSheet(
							userSubprocess.data.dish,
							selectedIngredients
						);
		
						message.inlineKeyboard.parse_mode = 'HTML';

						return message;

					};











/*
*/

const bot = new telegraf.Telegraf(process.env.BOT_TOKEN_edac);

const DB_CLIENT = new pg.Client({
	user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT
});

const pgClient = DB_CLIENT;

const meiliSClient = new MeiliSearch({
	host:process.env.MEILISEARCH_HOST,
	apiKey: process.env.MEILISEARCH_API_KEY
})
const MSDB = meiliSClient.index('foodDishNames');


const APP_STATE = {};

DB_CLIENT.on('error', err => {
	APP_STATE.isDBdead = true;

  console.error('PostgreSQL shit has happened!', err.stack);

  process.kill(process.pid, 'SIGINT');
})

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const app = async () => {

try {
	await DB_CLIENT.connect();
  console.log('PostgreSQL is connected.');
} catch (e) {
  throw e;
}

ISofU.ids = {};
ISofU.lang_codes_ru = {};
(await DB_CLIENT.query(`
	SELECT lang_code_ru, lang_code_en, id
	FROM terms_and_their_translations
	WHERE internal_definition_number IN (1,2);
`)).rows.forEach(i => {
	ISofU.push(i);
	ISofU.ids[i.id] = i.lang_code_ru;
	ISofU.lang_codes_ru[i.lang_code_ru.toLowerCase()] = i.id;
});

(await DB_CLIENT.query(`
	SELECT lang_code_ru, lang_code_en, regexp_list_ru, internal_definition_number
	FROM terms_and_their_translations
	WHERE internal_definition_number IN (3, 4);
`)).rows.forEach(i =>
	NUTRIENTS.push(i));

NUTRIENTS.forEach(i => {
		let word = i.regexp_list_ru.join('|');
		
		RE_RU_NUTRIENTS.push(
			new RegExp(`(${word})(\\s+|)(\\d+(\\s+|)(,|\\.)(\\s+|)\\d+|\\d+)(\\s+|)`, 'u') //(г|мкг|мг|ккал|)`, 'u')
		)
	

		//en version


	}
);

//console.log(NUTRIENTS, RE_RU_NUTRIENTS)

const cleanFromOldUserCommands = async () => {
	while (true) {
		await DB_CLIENT.query(`
			UPDATE telegram_user_commands tuc
			SET completed = true,
			time_is_up = true,
			data = '{}',
			life_time_ending = NULL
			FROM (
				SELECT *
				FROM telegram_user_commands
				WHERE completed != TRUE
					AND life_time_ending < '${(new Date()).toISOString()}'
			) as tuc2
			WHERE tuc2.id = tuc.id;
		`);
		
		await delay(30000);
	}
};

const cleanTGUsersLastActionTime = async () => {
	while (true) {
		const date = Date.now();
		const keys = Object.keys(TG_USERS_LAST_ACTION_TIME);

		keys.forEach(k => {
			if (date - TG_USERS_LAST_ACTION_TIME[k] > 3000) {
				delete TG_USERS_LAST_ACTION_TIME[k];
			}
		});

		await delay(3000);
	}
};

const cleanLimitationOfUCFI = async () => {
	while (true) {
		const date = (new Date(Date.now() - 1000*60*60*24)).toISOString();
	
		await DB_CLIENT.query(`
			UPDATE registered_users
			SET first_user_created_fidi_time = null,
			limit_count_of_user_created_fidi = null
			WHERE first_user_created_fidi_time < '${date}'
		;`);

		await delay(30000);
	}
}

const cleanSubprocessesAfter1H = async () => {
	while (true) {
		const date = (new Date(Date.now() - 1000*60*120)).toISOString();
		
		let response = await DB_CLIENT.query(`
			SELECT *
			FROM telegram_user_subprocesses
			WHERE creation_date < '${date}'
			AND NOT completed
		;`);

		if (response?.rows?.length) {
			for (const userSubprocess of response.rows) {

				const creation_date = new Date().toISOString();

				let messageText;

				if( userSubprocess.process_name == `DISH_CREATING` ){
					messageText = `Создание блюда отменено.`
				}	else if ( userSubprocess.process_name == `DISH_CREATING__RENAMING` ){
					messageText = `Переимнование блюда отменено`;
				}

				let response;

				try {
 					response = await bot.telegram.editMessageText(
						userSubprocess.tg_user_id,
						userSubprocess.state.message_id,
						``,
						messageText
					);
				} catch(e) {
					console.log(e);
				}

				if(!response){
					return;
				}
				
 				let row = {};
				row.data = JSON.stringify({});
				row.sequence = JSON.stringify({});
				row.state = JSON.stringify({});
				row.completed = true;
				row.canceled_by_service = true;
  
				let paramQuery = {};
				paramQuery.text = `
					UPDATE telegram_user_subprocesses
					SET ${getStrOfColumnNamesAndTheirSettedValues(row)}
					WHERE id = ${userSubprocess.id}
				;`;
				await DB_CLIENT.query(paramQuery);
				
				row = {};
				row.creation_date = creation_date;
				row.command = `CANCEL__${userSubprocess.process_name}`.slice(0, 64);
				row.tg_user_id = userSubprocess.tg_user_id;
				row.process_id = userSubprocess.id;

				paramQuery = {};
				paramQuery.text = `
					INSERT INTO telegram_user_sended_commands
					(${objKeysToColumnStr(row)})
					VALUES
					(${objKeysToColumn$IndexesStr(row)})
				;`;
				paramQuery.values = getArrOfValuesFromObj(row);
				await DB_CLIENT.query(paramQuery);

				await delay(300);
			}

		}

		await delay(300000);
	}
}

// cleanSubprocessesAfter1H();

const cleanTGInlineKeyboards = async () => {
	while (true) {
		const res = await DB_CLIENT.query(`
			SELECT *
			FROM telegram_inline_keyboards
			WHERE	inline_keyboard_deleted = FALSE
			AND life_time_ending < '${(new Date()).toISOString()}'
			limit 1000
		;`);

		// const done = [];
		res.rows.forEach(async e => {
			try {
				await bot.telegram.deleteMessage(e.tg_user_id, e.message_id);
				//delete or replace inline_keyboard
				// done.push(e.id);

				await DB_CLIENT.query(`
					UPDATE telegram_inline_keyboards
					SET inline_keyboard_deleted = true
					WHERE id = ${e.id}
				;`);
			} catch (e) {
				console.log(e);
			}
		});

		await delay(5000);
	}
};

const checkIsUserSendTooMuchFor5Min = async (tg_user_id, date, pgClient)  => {

	//date = new Date(new Date(date) - 60*60*24*1000); //24 hours
	date = new Date(new Date(date) - 60*5*1000); //5 minute

	const res = await pgClient.query(`
		SELECT count(*)
		FROM telegram_user_log
		WHERE tg_user_id = ${tg_user_id}
		AND creation_date > '${date.toISOString()}'
	;`);

 	if (Number(res.rows[0].count) > 300) {
		return true;
	}
	return false;
};


cleanFromOldUserCommands();
cleanTGUsersLastActionTime();
cleanLimitationOfUCFI();
// cleanTGInlineKeyboards();


const cleanArrFromRecurringItems = arr => {
	for ( let i = 0; i < arr.length; i++) {					
		for ( let k = i + 1; k < arr.length; k++) {
			if (arr[i] == arr[k]) {
				arr.splice(k, 1);
				k--;
			}
		}
	}
	return arr;
}

const execAndGetAllREResults = (str, re) => {
	if (!re.global) {
		throw `RegExp has not global flag.`;
	}
	const result = [];
	let arr;
	while ((arr = re.exec(str)) !== null) {
		result.push(arr[0]);
	}
	return result;
}




bot.use(async (ctx, next) => {
	console.log(
		`____use____________start`,
		JSON.stringify(ctx.update),
		// ctx,
		`____use____________end`,
	);


	let from;
	let date;

	if (!!ctx.update.message) {
		from = ctx.update.message.from;
		date = ctx.update.message.date;
		console.log(`message`);
	} else if (!!ctx.update.edited_message) {// ??? check them or not?
		from = ctx.update.edited_message.from;
		date = ctx.update.edited_message.date;
		console.log(`edited_message`);
	} else if (!!ctx.update.inline_query) {
		from = ctx.update.inline_query.from;
		// date = ctx.update.inline_query.date; // empty update
		console.log(`inline_query`);
	} else if (!!ctx.update.chosen_inline_result) {
		from = ctx.update.chosen_inline_result.from;
		date = ctx.update.chosen_inline_result.date;
		console.log(`chosen_inline_result`);
	} else if (!!ctx.update.callback_query) {
		from = ctx.update.callback_query.from;
		date = ctx.update.callback_query.date;
		console.log(`callback_query`);
	} else if (!!ctx.update.shipping_query) {
		from = ctx.update.shipping_query.from;        
		date = ctx.update.shipping_query.date;
		console.log(`shipping_query`);
	} else if (!!ctx.update.pre_checkout_query) {
		from = ctx.update.pre_checkout_query.from;
		date = ctx.update.pre_checkout_query.date;
		console.log(`pre_chechout_query`);
	} else if (!!ctx.update.poll) {
		from = ctx.update.poll.from;
		date = ctx.update.poll.date;
		console.log(`poll`);
	} else if (!!ctx.update.poll_answer) {
		from = ctx.update.poll_answer.from;
		date = ctx.update.poll_answer.date;
		console.log(`poll_answer`);

	} else if (!!ctx.update.my_chat_member) {
		from = ctx.update.my_chat_member.from;
		date = ctx.update.my_chat_member.date;
		console.log(`my_chat_member`);
		//create table
	} else if (!!ctx.update.chat_member) {
		from = ctx.update.chat_member.from;
		date = ctx.update.chat_member.date;
		console.log(`chat_member`);
	} else if (!!ctx.update.chat_join_request) {
		from = ctx.update.chat_join_request.from;
		date = ctx.update.chat_join_request.date;
		console.log(`chat_join_request`);
		//create table
	} else if (!!ctx.update.channel_post) {
		from = ctx.update.channel_post.from;
		date = ctx.update.channel_post.date;
		console.log(`channel_post`);
		return; //create table???

	} else if (!!ctx.update.edited_channel_post) {
		from = ctx.update.edited_channel_post.from;
		date = ctx.update.edited_channel_post.date;
		console.log(`editted_channel_post`);
		return;
	}
	
	if(!date){
		date = Date.now();
	} else {
		date = date * 1000;
	}

	const reqDate = date;


	//antispam validaciya
	/* if (!TG_USERS_LAST_ACTION_TIME[`${from.id}`] || date - TG_USERS_LAST_ACTION_TIME[`${from.id}`][0] > 1000) {
		TG_USERS_LAST_ACTION_TIME[`${from.id}`] = [date];
	} else if (date - TG_USERS_LAST_ACTION_TIME[`${from.id}`][0] >= 1000 && TG_USERS_LAST_ACTION_TIME[`${from.id}`].length < 5) {
		TG_USERS_LAST_ACTION_TIME[`${from.id}`].push(date);
	} else {
		if (!(ctx.update?.message?.via_bot?.id == process.env.BOT_ID_edac && ctx.update.message.chat.id == ctx.update.message.from.id)) { // if not adding ingredient in dish
			return;
		}
	} */

	if (!from.is_bot){
		HZ.checkTelegramUserExistentAndRegistryHimIfNotExists(DB_CLIENT, from.id, from.is_bot);

		if (process.env.TRACKMODE) {
			HZ.trackTelegramUserAccountDataChanges(DB_CLIENT, from);
		}

		const userInfo = await HZ.getTelegramUserInfo(DB_CLIENT, from.id);
			console.log(userInfo)

		if (userInfo.is_banned) {
			try{
				ctx.reply(`u r banned`);
			} catch(e) {
				console.log(e);
			}
			console.log(`BANNED`, userInfo);
			return;
		}

		if (new Date(userInfo.last_check) < (new Date(reqDate) - 60*5*1000)) {
			if (await checkIsUserSendTooMuchFor5Min(from.id, reqDate, DB_CLIENT)) {
				await DB_CLIENT.query(`
						UPDATE telegram_users
						SET is_banned = true,
						last_check = '${new Date(reqDate).toISOString()}'
						WHERE tg_user_id = ${from.id}
					;`);
			} else {
				await DB_CLIENT.query(`
						UPDATE telegram_users
						SET last_check = '${new Date(reqDate).toISOString()}'
						WHERE tg_user_id = ${from.id}
					;`);
			} 
		}

		let row = {};
		row.tg_user_id = from.id;
		row.log = JSON.stringify(ctx.update);
		row.creation_date = new Date(reqDate).toISOString();
		
		let paramQuery = {};
		paramQuery.text = `
			INSERT INTO telegram_user_log
			(${objKeysToColumnStr(row)})
			VALUES
			(${objKeysToColumn$IndexesStr(row)})
		;`;
		paramQuery.values = getArrOfValuesFromObj(row);
		
		await DB_CLIENT.query(paramQuery);
	} else {
		return;
	}

	next();
});

bot.on(`message`, async ctx => {
	 console.log(
		`________MESSAGE________start`,
		//Object.keys( ctx),
		JSON.stringify(ctx.update),
		//ctx,
		`________MESSAGE________end`
	) 



	if (!(ctx.update.message.chat.type == `private`)) {
		return;
	}

	if (!!ctx.update?.via_bot?.id && ctx.update.via_bot.id != process.env.BOT_ID_edac) {
		return;
	}

	const userInfo = await HZ.getTelegramUserInfo(DB_CLIENT, ctx.update.message.from.id);

	if (userInfo.is_banned) {
		return;
	}

	if(!userInfo.privilege_type) {
		try {
			await ctx.reply(`Сорян, братан, меня не доделали ещё...\n\nСкачай приложение какое или потыкай поисковичок. Рекомендую, кста, https://fitaudit.ru\n\nТакже помни, что самое важное- это выработать привычку вносить съеденное в калькулятор при любых условиях, никаких леней, забылей, писикаков и прочего. Взвесил- внёс- съел, взвесил- внёс- съел и т.д., иначе так результата и не добъешься.\n\nДавай, пупсик, обнял :*\n\nП,С, как секси станешь, скинь нюдсы в лс, спасибо.\n\nП.С.П.С. Если ты совершеннолетний человек, конечно. Обнял ещё раз, успехов!`);
		} catch(e) {
			console.log(e);
		}
		return;
	}

	const userSubprocess = await getUserSubProcess(DB_CLIENT, ctx.update.message.from.id);
	
	const reqDate = ctx.update.message.date * 1000;	
	const creation_date = new Date(reqDate).toISOString();

	if(!ctx.update.message.text){
		if (userSubprocess) {
		
			try{
				await bot.telegram.deleteMessage(
					ctx.update.message.chat.id,
					ctx.update.message.message_id
				);
			}catch(e){
				console.log(e);
			}

			let sequenceAction = {};
			sequenceAction.fromUser = true;
			sequenceAction.incorrectInput = true;
			sequenceAction.incorrectCause = `1ctx.update.message.text`;
			sequenceAction.message_id = ctx.update.message.message_id;

			userSubprocess.sequence.push(sequenceAction);

			let lastNonDeteledIndex;
			let botPreviousComment = userSubprocess.sequence.findLast((e, i) => {
				if(e.fromBot && e.incorrectInputReply && !e.deleted){
					lastNonDeteledIndex = i;
					return true;
				}
			});

			if (botPreviousComment && botPreviousComment?.incorrectCause == `!ctx.update.message.text`){
				let row = {};
				row.data = userSubprocess.data;
				row.sequence = userSubprocess.sequence;
				row.state = userSubprocess.state;

				row.data = JSON.stringify(row.data);
				row.sequence = JSON.stringify(row.sequence);
				row.state = JSON.stringify(row.state);

				let paramQuery = {};
				paramQuery.text = `
					UPDATE telegram_user_subprocesses
					SET ${getStrOfColumnNamesAndTheirSettedValues(row)}
					WHERE id = ${userSubprocess.id}
				;`;
				await DB_CLIENT.query(paramQuery);

				return;
			}

			if (botPreviousComment) {
				let response;
				try{
					response = await bot.telegram.deleteMessage(
						userSubprocess.tg_user_id,
						botPreviousComment.message_id
					);
				}catch(e){
					console.log(e);
					if(e.response.error_code == 400){
						botPreviousComment.deleted = true;
					}
				}

				if(response) {
					botPreviousComment.deleted = true;
				}
				
				userSubprocess.sequence[lastNonDeteledIndex] = botPreviousComment;
			}

			let messageText = `А текст можно, да?`;
			let response;

			try {
 				response = await bot.telegram.sendMessage(
					ctx.update.message.chat.id,
					messageText
				);
			} catch(e) {
				console.log(e);
			}

			if(!response){
				return;
			}

			sequenceAction = {};
			sequenceAction.fromBot = true;
			sequenceAction.type = `sendMessage`;
			sequenceAction.incorrectInputReply = true;
			sequenceAction.incorrectCause = `!ctx.update.message.text`;
			sequenceAction.message_id = response.message_id;

			userSubprocess.sequence.push(sequenceAction);

			let row = {};
			row.data = userSubprocess.data;
			row.sequence = userSubprocess.sequence;
			row.state = userSubprocess.state;

			row.data = JSON.stringify(row.data);
			row.sequence = JSON.stringify(row.sequence);
			row.state = JSON.stringify(row.state);

			let paramQuery = {};
			paramQuery.text = `
				UPDATE telegram_user_subprocesses
				SET ${getStrOfColumnNamesAndTheirSettedValues(row)}
				WHERE id = ${userSubprocess.id}
			;`;
			await DB_CLIENT.query(paramQuery);
			return;
		}

		let row = {};
		row.creation_date = creation_date;
		row.invalid_command = true;
		row.invalid_cause = `!ctx.update.message.text`;
		row.tg_user_id = userInfo.tg_user_id;
//add return last 20, find sequences and reply funny shit
		let paramQuery = {};
		paramQuery.text = `
			INSERT INTO telegram_user_sended_commands
			(${objKeysToColumnStr(row)})
			VALUES
			(${objKeysToColumn$IndexesStr(row)})
		;`;
		paramQuery.values = getArrOfValuesFromObj(row);
		await DB_CLIENT.query(paramQuery);

		return;
	}

	console.log(
		userInfo,
		// userSubprocess
	);
		


	let re_result;

	let text = ctx.update.message.text.replaceAll(/\s+/g, ` `).trim();
	
	if(!userSubprocess){

		if (Array.isArray(re_result = text.toLowerCase().match(RE_RU_COMMAND__DELETE_LAST_ACTION))) {
		
			const userLastCommand = await getUserLastCommand(DB_CLIENT, userInfo.tg_user_id);
			console.log(userLastCommand);

			if (!userLastCommand.can_it_be_removed){
				ctx.reply(`Последняя команда ничего не создавала, чтобы это удалить.`);
				return;
			}
			
			if (userLastCommand.command == `CREATE_FOOD`) {
				//deleted true food_items
				await DB_CLIENT.query(`
					UPDATE food_items
					SET deleted = true
					WHERE	id IN (${userLastCommand.data.food_items_ids.join()})
				;`);

				// delete doc with the same food_items_id from meilisearch
				await MSDB.deleteDocuments({
					filter:`food_items_id IN [${userLastCommand.data.food_items_ids.join()}]`
				});

				//perepisat' na telegram_users
				//registered_users available_count_of_user_created_fi - 1 //add check for all users
				userInfo.available_count_of_user_created_fi = Number(userInfo.available_count_of_user_created_fi) - userLastCommand.data.food_items_ids.length;
				await DB_CLIENT.query(`
					UPDATE registered_users
					SET available_count_of_user_created_fi = ${userInfo.available_count_of_user_created_fi}
					WHERE id = ${userInfo.r_user_id};
				`);

				//telegram_user_sended_commands add deletion
				const row = {};
				row.tg_user_id = userInfo.tg_user_id;
				row.creation_date = creation_date;
				row.command = `DELETE_FOOD`;
				row.can_it_be_canceled = true;

				row.data = {};
				row.data.food_items_ids = userLastCommand.data.food_items_ids;

				row.data = JSON.stringify(row.data);

				const paramQuery = {};
				paramQuery.text = `
					INSERT INTO telegram_user_sended_commands
					(${objKeysToColumnStr(row)})
					VALUES
					(${objKeysToColumn$IndexesStr(row)});`;
				paramQuery.values = getArrOfValuesFromObj(row);
				await DB_CLIENT.query(paramQuery);
			
				//predlojit' otmenu
				ctx.reply(`Удалено. Отменить? *"о/отмена"*.\n\nМем на тему удаления.`, {parse_mode:`Markdown`})
			} else if (userLastCommand.command) {
				console.log(`code me`)
				ctx.reply(`code me`)
			}

		} else if (Array.isArray(re_result = text.toLowerCase().match(RE_RU_COMMAND__CANCEL_LAST_ACTION))) {

			const userLastCommand = await getUserLastCommand(DB_CLIENT, userInfo.tg_user_id);
			console.log(userLastCommand);

			if (!userLastCommand.can_it_be_canceled){
				ctx.reply(`Последняя команда не может быть отменена.`);
				return;
			}
			
			if (userLastCommand.command == `DELETE_FOOD`) {
				//cancel deleted true food_items
				const res = await DB_CLIENT.query(`
					WITH updated AS (
					  UPDATE food_items
					  SET deleted = false
					  WHERE id IN (${userLastCommand.data.food_items_ids.join()})
					  RETURNING id, name__lang_code_ru, tg_user_id, protein, carbohydrate, fat, caloric_content)
					SELECT fdifm.id, fdifm.food_items_id, upd.name__lang_code_ru, upd.tg_user_id, upd.protein, upd.carbohydrate, upd.fat, upd.caloric_content
					FROM (
						SELECT id, food_items_id, dish_items_id
						FROM fooddish_ids_for_meilisearch
						WHERE food_items_id IN (SELECT id FROM updated)
						GROUP BY id, food_items_id, dish_items_id) fdifm
					full outer join
						(select id, name__lang_code_ru, tg_user_id, protein, carbohydrate, fat, caloric_content
						from updated
						group by id, name__lang_code_ru, tg_user_id, protein, carbohydrate, fat, caloric_content) upd
					ON (fdifm.food_items_id = upd.id)
				;`);
				//add doc to MSDB
				let documents = [];
				res.rows.forEach(el =>{
					let doc = {};
					doc.id = Number(el.id),
					doc.food_items_id = Number(el.food_items_id);
					doc.dish_items_id = null;
					doc.name__lang_code_ru = el.name__lang_code_ru;
					doc.tg_user_id = Number(el.tg_user_id);
					doc.created_by_project = null;
					doc.protein = Number(el.protein);
					doc.fat = Number(el.fat);
					doc.carbohydrate = Number(el.carbohydrate);
					doc.caloric_content = Number(el.caloric_content);
					documents.push(doc);
				});
				await MSDB.addDocuments(documents);
 
					//registered_users available_count_of_user_created_fi - 1 //add check for all users					
					userInfo.available_count_of_user_created_fi = Number(userInfo.available_count_of_user_created_fi) + userLastCommand.data.food_items_ids.length;
 
					await DB_CLIENT.query(`
						UPDATE registered_users
						SET available_count_of_user_created_fi = ${userInfo.available_count_of_user_created_fi}
						WHERE id = ${userInfo.r_user_id};
				`);

				//telegram_user_sended_commands add otmenu
				const row = {};
				row.tg_user_id = userInfo.tg_user_id;
				row.creation_date = new Date(reqDate).toISOString();
				row.command = `CANCEL__DELETE_FOOD`;

				row.data = {};
				row.data.food_items_ids = userLastCommand.data.food_items_ids;

				row.data = JSON.stringify(row.data);

				const paramQuery = {};
				paramQuery.text = `
					INSERT INTO telegram_user_sended_commands
					(${objKeysToColumnStr(row)})
					VALUES
					(${objKeysToColumn$IndexesStr(row)});`;
				paramQuery.values = getArrOfValuesFromObj(row);
				await DB_CLIENT.query(paramQuery);
			
				//predlojit' otmenu
				ctx.reply(`Удаление отменено\\.\n\n_Галя, у нас отмена\\.\\.\\._`, {parse_mode:`MarkdownV2`})
			} else if (userLastCommand.command) {
				console.log(`code me`)
				ctx.reply(`code me`)
			}

		} else if (Array.isArray(re_result = text.toLowerCase().match(RE_RU_BOT_AND_INLINE_COMMAND__SHOW_EATEN))) {
			console.log(`code me`)
			ctx.reply(`code me`)
			console.log(re_result);			
		} else if (Array.isArray(re_result = text.toLowerCase().match(RE_RU_COMMAND__CREATE_FOOD))) {
				// console.log(re_result, `RE_RU_COMMAND__CREATE_FOOD`);
				
				// add text second param

				let db = DB_CLIENT;

				let limit_count_of_user_created_fidi = 100;
				if (!userInfo.privilege_type && userInfo.limit_count_of_user_created_fidi >= limit_count_of_user_created_fidi) { //think about it...
					const limitResp =`Вы не можете создавать еду или блюда больше ${limit_count_of_user_created_fidi} раз за 24ч.`;
					ctx.reply(limitResp);
					return;
					/* {
						result: false,
						cause: `limit_count_of_user_created_fidi`,
						message: `Вы не можете создавать еду больше ${limit_count_of_user_created_fidi} раз за 24ч.`
					}; */
				}

				let messageText = `*Чпок, и готооова...*`;
				
				const foodName = text.slice(re_result[1].length-1, re_result[2].length + re_result[1].length).slice(0, 128).replaceAll(/['"\\]/ug, ``).trim();//(re_result[2].trim()).slice(0, 128); // poisk odinakovih imen, otpravka i ojidanie podtverjdeniya
				// console.log( foodName, re_result);return;
				if (foodName.length < 4) {
					ctx.reply(`Название еды должно иметь хотя бы 4 символа.`)
					return;
				}

				// poisk odinakovih imen, otpravka i ojidanie podtverjdeniya
				// TODO 

				messageText += `\n\n\`\`\` ${foodName}. `;

				const foodNutrientMatches = [];

				let nutrientPart = re_result.input.slice(re_result[2].length);
				// console.log(re_result, text)

				RE_RU_NUTRIENTS.forEach((el, i) => {
					const match = nutrientPart.match(el);
					
					if (!Array.isArray(match)){
						const obj = NUTRIENTS[i];
						obj.nutrientName = NUTRIENTS[i].lang_code_en.replaceAll(/\s+/g, `_`);
						obj[obj.nutrientName] = 0;
						foodNutrientMatches.push(obj);
						return;
					}

					const obj = NUTRIENTS[i];
					obj.nutrientName = NUTRIENTS[i].lang_code_en.replaceAll(/\s+/g, `_`);
					let strNutrientValue = match[3].replace(`,`, `.`);
					let dotMatch = strNutrientValue.match(/\./);
					if (Array.isArray(dotMatch)) {
						strNutrientValue = strNutrientValue.slice(0, dotMatch.index + 3);
					}
					obj[obj.nutrientName] = Number(strNutrientValue);
					foodNutrientMatches.push(obj);
				});	

				let noNutrientsResp = `Нутриентов не обнаружено. T_T`;
				if (foodNutrientMatches.length == 0){ //podumat' o zamene, prosloyke i td...

					ctx.reply(noNutrientsResp);

					return;
				}



				let cal = foodNutrientMatches.find(el => el.nutrientName == `caloric_content`);
				if(!cal.caloric_content){
					let nutrient;

					cal.caloric_content += (nutrient = foodNutrientMatches.find(el => el.nutrientName == `fat`)) ? nutrient.fat * 9 : 0;
					cal.caloric_content += (nutrient = foodNutrientMatches.find(el => el.nutrientName == `carbohydrate`)) ? nutrient.carbohydrate * 4 : 0;
					cal.caloric_content += (nutrient = foodNutrientMatches.find(el => el.nutrientName == `protein`)) ? nutrient.protein * 4 : 0;	
				}



				let nutrientValueMistakeResp = ``;
				let sumOfBJU = 0;
				foodNutrientMatches.forEach(el => {
					if (el.internal_definition_number == 4 && el.caloric_content > 900) {// caloric_content
						nutrientValueMistakeResp += `\n${el.lang_code_ru.slice(0,1).toUpperCase() + el.lang_code_ru.slice(1)} не может превышать 900 кКал.`;
					}
					if (el.internal_definition_number == 3 && el[el.nutrientName] > 100) { //БЖУ
						nutrientValueMistakeResp += `\n${el.lang_code_ru.slice(0,1).toUpperCase() + el.lang_code_ru.slice(1)} не могут превышать 100 грамм.`;
					}
					if (el.internal_definition_number == 3) { //БЖУ sum
						sumOfBJU += el[el.nutrientName];
					}

				});

				if (Math.round(sumOfBJU) > 100) {
					nutrientValueMistakeResp += `\nСумма БЖУ не может быть больше 100 грамм.`;
				}
				
				if (nutrientValueMistakeResp) {//think about it
					ctx.reply(nutrientValueMistakeResp);
					return;
				}


				foodNutrientMatches.forEach((el, i) => {
					foodNutrientMatches[i][el.nutrientName] = Number(Number(el[el.nutrientName]).toFixed(1));
				});
				
				foodNutrientMatches.forEach(el => {
					messageText += `\n${el.lang_code_ru} ${el[el.nutrientName]}`;
					if (el.caloric_content){
						messageText += ` ккал`;
					} else {
						messageText += ` г`;
					}
				});


				if (typeof userInfo.limit_count_of_user_created_fidi == `string`) {
					userInfo.limit_count_of_user_created_fidi = Number(userInfo.limit_count_of_user_created_fidi);
				} else {
					userInfo.limit_count_of_user_created_fidi = 0;
				}

				const doc = {};
				let row = {};
				row.creation_date = new Date(reqDate).toISOString();
				row.tg_user_id = ctx.update.message.from.id;
				row.view_json = {};
				row.name__lang_code_ru = foodName;

				foodNutrientMatches.forEach(e => {
					row.view_json[e.nutrientName] = e[e.nutrientName];
					row[e.nutrientName] = e[e.nutrientName];
					doc[e.nutrientName] = e[e.nutrientName];
				});

				row.view_json = JSON.stringify(row.view_json);

				userInfo.count_of_user_created_fi = userInfo.count_of_user_created_fi ? Number(userInfo.count_of_user_created_fi) + 1 : 1;
				row.fi_id_for_user = userInfo.count_of_user_created_fi;

				messageText += `\n\`\`\`\nЕда ID:\`\`\`${userInfo.count_of_user_created_fi}\`\`\`\n\nОшибка? Отправьте *"у/удалить"*.`;

				let paramQuery = {};
				paramQuery.text = `
					WITH foit AS(
						INSERT INTO food_items
						(${objKeysToColumnStr(row)})
						VALUES
						(${objKeysToColumn$IndexesStr(row)})
						RETURNING id
					),
					fdifmsear AS (
						INSERT INTO fooddish_ids_for_meilisearch
						(food_items_id)
						SELECT id
						FROM foit
						RETURNING id, food_items_id
					)
					SELECT fdifm.id as fdifmid, fdifm.food_items_id as id
					FROM ( 
						SELECT id, food_items_id
						FROM fdifmsear
						GROUP BY id, food_items_id
					) fdifm
				;`;
				paramQuery.values = getArrOfValuesFromObj(row);
				const foodItemsRes = await db.query(paramQuery);
				console.log(`TEST ME CREATE_FOOD MeiliSearch`);
				//add doc to MSDB
				doc.id = Number(foodItemsRes.rows[0].fdifmid),
				doc.food_items_id = Number(foodItemsRes.rows[0].id);
				doc.dish_items_id = null;
				doc.name__lang_code_ru = row.name__lang_code_ru;
				doc.tg_user_id = row.tg_user_id;
				doc.created_by_project = null;

				await MSDB.addDocuments([doc]);


				row = {};
				row.tg_user_id = userInfo.tg_user_id;
				row.creation_date = new Date(reqDate).toISOString();
				row.command = `CREATE_FOOD`;
				row.can_it_be_removed = true;

				row.data = {};
				row.data.food_items_ids = [foodItemsRes.rows[0].id];

				row.data = JSON.stringify(row.data);
	
				paramQuery = {};
				paramQuery.text = `
					INSERT INTO telegram_user_sended_commands
					(${objKeysToColumnStr(row)})
					VALUES
					(${objKeysToColumn$IndexesStr(row)});`;
				paramQuery.values = getArrOfValuesFromObj(row);
				await db.query(paramQuery);




				let setFUCFIDITime;
				let setLimitCOfFIDI;

				if (!userInfo.privilege_type) {
					if (!userInfo.first_user_created_fidi_time) {
						setFUCFIDITime = `first_user_created_fidi_time = ${creation_date}`;
						userInfo.limit_count_of_user_created_fidi = 0;
					}
					setLimitCOfFIDI = `limit_count_of_user_created_fidi= ${Number(userInfo.limit_count_of_user_created_fidi) + 1}`;
				}
				
				if (!userInfo.available_count_of_user_created_fi) {
					userInfo.available_count_of_user_created_fi = 1;
				} else {
					userInfo.available_count_of_user_created_fi = Number(userInfo.available_count_of_user_created_fi) + 1;
				}

				await db.query(`
					UPDATE registered_users
					SET available_count_of_user_created_fi = ${userInfo.available_count_of_user_created_fi},
					count_of_user_created_fi = ${userInfo.count_of_user_created_fi}
					${setLimitCOfFIDI ? ', ' + setLimitCOfFIDI : ``}
					${setFUCFIDITime ? ', ' + setFUCFIDITime : ``}
					WHERE id = ${userInfo.r_user_id};
				`);
	


				ctx.reply(messageText, { parse_mode: 'Markdown', allow_sending_without_reply: true });

			} else if (Array.isArray(re_result = text.match(RE_RU_COMMAND__CREATE_DISH))) {
				console.log(re_result);			
				
				let limit_count_of_user_created_fidi = 100;
				if (!userInfo.privilege_type && userInfo.limit_count_of_user_created_fidi >= limit_count_of_user_created_fidi) { //think about it...
					const limitResp =`Вы не можете создавать еду или блюда больше ${limit_count_of_user_created_fidi} раз за 24ч.`;
					ctx.reply(limitResp);
					return;
				}

				const dishName = re_result[2].slice(0, 128).replaceAll(/['"\\]/ug, ``).trim();//(re_result[2].trim()).slice(0, 128); 
				
				if (dishName.length < 4) {
					//tot je process s renaymom sdelat'
					//peredumal, NE DELAT', zachem zapuskat' process kotoriy teper' subprocess, esli eto v bolshom, glavnom processe chata sidit. vot ego sdelat' nada
					/* let row = {};
					row.creation_date = creation_date;
					row.invalid_command = true;
					row.invalid_cause = `dishName.length < 4`;
					row.tg_user_id = userInfo.tg_user_id;

					let paramQuery = {};
					paramQuery.text = `
						INSERT INTO telegram_user_sended_commands
						(${objKeysToColumnStr(row)})
						VALUES
						(${objKeysToColumn$IndexesStr(row)})
					;`;
					paramQuery.values = getArrOfValuesFromObj(row);
					await DB_CLIENT.query(paramQuery); */
					ctx.reply(`Название еды должно иметь хотя бы 4 символа.`)
					return;
				}

				let findIdenticalNameResponse = await MSDB.search(dishName, {
					filter: `name__lang_code_ru = '${dishName}' AND tg_user_id = ${userInfo.tg_user_id}`
				});
				
				const count_of_user_created_di = Number(userInfo.count_of_user_created_di) + 1;
				
				const dish = setZeroBJUKnW({});
				dish.name__lang_code_ru = dishName;
				dish.total_g_weight = 0;
				dish.di_id_for_user = count_of_user_created_di;

				console.log(findIdenticalNameResponse);
				if (findIdenticalNameResponse?.hits?.length) {
					//na global chat process perepisat'
					let messageText = `Блюдо с названием "<b>${dishName}</b>" уже существует.\n\nОтправьте <b>новое название блюда</b> или нажмите "<b>Отменить</b>".`;

					const id = userInfo.tg_user_id;
					const inlineKeyboard = telegraf.Markup.inlineKeyboard([[
							telegraf.Markup.button.callback(`Отменить`, `i${id}cancel`),
						]]);

					inlineKeyboard.parse_mode = 'HTML';

					let sendMessageResponse;

					try {
 						sendMessageResponse = await bot.telegram.sendMessage(
							ctx.update.message.chat.id,
							messageText,
							inlineKeyboard
						);
					} catch(e) {
						console.log(e);
					}

					if(!sendMessageResponse){
						return;
					}

					console.log(sendMessageResponse);

					let row = {};
					row.creation_date = creation_date;
					row.command = `CREATE_DISH__RENAME`;
					row.tg_user_id = userInfo.tg_user_id;
					row.is_process_c = true;

					let paramQuery = {};
					paramQuery.text = `
						INSERT INTO telegram_user_sended_commands
						(${objKeysToColumnStr(row)})
						VALUES
						(${objKeysToColumn$IndexesStr(row)})
						RETURNING id
					;`;
					paramQuery.values = getArrOfValuesFromObj(row);
					res = await DB_CLIENT.query(paramQuery);


					const sendedCommandId = res.rows[0].id;

					row = {};
					row.creation_date = creation_date;
					row.tg_user_id = userInfo.tg_user_id;
					row.sended_command_id = sendedCommandId;
					row.process_name = `DISH_CREATING__RENAMING`;

					row.data = {};
					row.data.dish = dish;
					row.data.ingredients = [];

					row.sequence = [];

					row.state = {};
					row.state.message_id = sendMessageResponse.message_id;
					row.state.interface = `main`;

					row.data = JSON.stringify(row.data);
					row.sequence = JSON.stringify(row.sequence);
					row.state = JSON.stringify(row.state);

					paramQuery = {};
					paramQuery.text = `
						INSERT INTO telegram_user_subprocesses
						(${objKeysToColumnStr(row)})
						VALUES
						(${objKeysToColumn$IndexesStr(row)})
					;`;
					paramQuery.values = getArrOfValuesFromObj(row);
					await DB_CLIENT.query(paramQuery);

					return;
				}

				let messageText = makeDishSheet(dish, []);

				let dishReminder = `\n\n—Перед добавлением ингредиента его нужно создать.\n—Если в блюде больше 20 ингредиентов, то блюдо придется разделить на два блюда. Создать первое блюдо и добавить его как ингредиент в создоваемое второе.\n\nНужна помощь? Нажми "<b>Команды</b>"`;

				messageText += dishReminder;

				const id = userInfo.tg_user_id;
				const inlineKeyboard = telegraf.Markup.inlineKeyboard([[
						telegraf.Markup.button.callback(`Сохранить`, `i${id}save`),
						telegraf.Markup.button.callback(`Отменить`, `i${id}cancel`),
						telegraf.Markup.button.callback(`Команды`, `i${id}commands`)
					]]);

				inlineKeyboard.parse_mode = 'HTML';

				let response;

				try {
 					response = await bot.telegram.sendMessage(
						ctx.update.message.chat.id,
						messageText,
						inlineKeyboard
					);
				} catch(e) {
					console.log(e);
				}

				if(!response){
					return;
				}

				console.log(response);

				//add to telegram_user_sended_commands
				let row = {};
				row.creation_date = creation_date;
				row.command = `CREATE_DISH`;
				row.tg_user_id = userInfo.tg_user_id;
				row.is_process_c = true;

				let paramQuery = {};
				paramQuery.text = `
					INSERT INTO telegram_user_sended_commands
					(${objKeysToColumnStr(row)})
					VALUES
					(${objKeysToColumn$IndexesStr(row)})
					RETURNING id
				;`;
				paramQuery.values = getArrOfValuesFromObj(row);
				res = await DB_CLIENT.query(paramQuery);

				//create process and insert in it dish data, state return process_id
				const sendedCommandId = res.rows[0].id;

				row = {};
				row.creation_date = creation_date;
				row.tg_user_id = userInfo.tg_user_id;
				row.sended_command_id = sendedCommandId;
				row.process_name = `DISH_CREATING`;

				row.data = {};
				row.data.dish = dish;
				row.data.ingredients = [];

				row.sequence = [];

				row.state = {};
				row.state.message_id = response.message_id;
				row.state.interface = `main`;

				row.data = JSON.stringify(row.data);
				row.sequence = JSON.stringify(row.sequence);
				row.state = JSON.stringify(row.state);

				paramQuery = {};
				paramQuery.text = `
					INSERT INTO telegram_user_subprocesses
					(${objKeysToColumnStr(row)})
					VALUES
					(${objKeysToColumn$IndexesStr(row)})
				;`;
				paramQuery.values = getArrOfValuesFromObj(row);
				await DB_CLIENT.query(paramQuery);


return;
		//posle sohraneniya	
				//update count_of_user_created_di
				let setFUCFIDITime;
				let setLimitCOfFIDI;

				if (!userInfo.privilege_type) {
					if (!userInfo.first_user_created_fidi_time) {
						setFUCFIDITime = `first_user_created_fidi_time = '${creation_date}'`;
						userInfo.limit_count_of_user_created_fidi = 0;
					}
					setLimitCOfFIDI = `limit_count_of_user_created_fidi= ${Number(userInfo.limit_count_of_user_created_fidi) + 1}`;
				}

				// perepisat' na telegram_users
				await DB_CLIENT.query(`
					UPDATE registered_users
					SET count_of_user_created_di = ${count_of_user_created_di}
					${setLimitCOfFIDI ? ', ' + setLimitCOfFIDI : ``}
					${setFUCFIDITime ? ', ' + setFUCFIDITime : ``}
					WHERE id = ${userInfo.r_user_id};
				`);

				/*
//posle sohraneniya, poluchit' iz process table
					//
				//create dish dish_items
				let row = {};
				row.creation_date = creation_date;
				row.name__lang_code_ru = dishName;
				row.di_id_for_user = count_of_user_created_di;
				row.tg_user_id = userInfo.tg_user_id;

				let paramQuery = {};
				paramQuery.text = `
					INSERT INTO dish_items
					(${objKeysToColumnStr(row)})
					VALUES
					(${objKeysToColumn$IndexesStr(row)})
					RETURNING	id
				;`;
				paramQuery.values = getArrOfValuesFromObj(row);
				const res = await DB_CLIENT.query(paramQuery);
 */

			} else if (Array.isArray(re_result = text.toLowerCase().match(RE_RU_COMMAND__EDIT_DISH))) {
				ctx.reply(`code me, bitch`);
				console.log(`code me`);

			} else if (Array.isArray(re_result = text.toLowerCase().match(RE_RU_COMMAND__SHOW_CREATED_DISHES))) {

				console.log(re_result);
			
				ctx.reply(`code me, bitch`);
				console.log(`блюда не написаны...`);

				if(!userInfo.available_count_of_user_created_di){
					ctx.reply(`Нет созданной еды... Т_Т`)
					return;
				}
				
			} else if (Array.isArray(re_result = text.toLowerCase().match(RE_RU_COMMAND__SHOW_CREATED_FOOD))) {
				console.log(re_result);
				console.log(`переписать меня нада...`);

				if(!userInfo.available_count_of_user_created_fi){
					ctx.reply(`Нет созданной еды... Т_Т`)
					return;
				}

				const makeUnderlineIDOfUserCreatedFI = intId => {
					const str = String(intId);
					const maxStrIDLength = 4;
					
					let result = ``;

					for (let i = 0, diff = maxStrIDLength - str.length; i < diff; i++) {
						result += `_`;
					}
					result += str;

					return result;
				};
				
				const getPages = (available_count_of_user_created_fi, maxNumberOfLines, selectedPage) => {
					let numberOfPages = available_count_of_user_created_fi / maxNumberOfLines;
					const numberOfPagesRound = Math.round(numberOfPages);
					const numberOfPagesFloor = Math.floor(numberOfPages);
					numberOfPages = numberOfPagesRound > numberOfPagesFloor ? numberOfPagesRound : numberOfPagesFloor + 1;
			
					const pages = {};
					pages.first = 1;
					pages.selected = selectedPage;
					pages.last = numberOfPages;
			
					if (numberOfPages == 1) {
						pages.movePrevious = 1;
						pages.movePreviousMinusFive = 1;
						pages.selected = 1;
						pages.moveNext = 1;
						pages.moveNextPlusFive = 1;
					} else if (numberOfPages > 1) {
						pages.moveNext = selectedPage + 1;
						if (pages.moveNext > numberOfPages) {
							pages.moveNext = numberOfPages;
						}
			
						pages.moveNextPlusFive = selectedPage + 6;
						if (pages.moveNextPlusFive > numberOfPages - 1) {
							pages.moveNextPlusFive = selectedPage + Math.round((numberOfPages - selectedPage ) / 2);
						}
					}
			
					if (selectedPage > numberOfPages){
						selectedPage = numberOfPages;
			
						pages.selected = numberOfPages;
						pages.moveNext = numberOfPages;
						pages.moveNextPlusFive = numberOfPages;
					}
			
					if (selectedPage > 1) {
						pages.movePrevious = selectedPage - 1;
						pages.movePreviousMinusFive = selectedPage - 6;
						if (pages.movePreviousMinusFive < 1) {
							pages.movePreviousMinusFive = Math.floor(selectedPage / 2);
						}
					} else {
						pages.movePrevious = 1;
						pages.movePreviousMinusFive = 1;
					}
					return pages;
				}
 		
				const maxNumberOfLines = 10;
				let selectedPage = 1;
				const pages = getPages(userInfo.available_count_of_user_created_fi, maxNumberOfLines, selectedPage);

				const res = await DB_CLIENT.query(`
					SELECT view_json, fi_id_for_user, name__lang_code_ru
					FROM food_items
					WHERE tg_user_id = ${userInfo.tg_user_id}
					AND fi_id_for_user IS NOT NULL
					AND deleted = false
					ORDER BY fi_id_for_user DESC
					LIMIT ${maxNumberOfLines};
				`);


				const addCharBeforeValue = (value, maxLength, charS) => {
					let str = Number(value).toFixed(1);
					
					let result = ``;

					for (let i = 0, diff = maxLength - str.length; i < diff; i++) {
						result += charS;
					}
					result += str;

					return result;
				};
				let message = `<b>Cписок созданной еды.</b> Всего: <b>${userInfo.available_count_of_user_created_fi}</b>.\n<b>ID</b>   БЖУК (на 100г) <b><i>Название еды</i></b>`;

				res.rows.forEach(e => {
					message += `\n<code>${e.fi_id_for_user}</code> Б:${
						addCharBeforeValue(e.view_json.protein ? e.view_json.protein : 0, 4, '_')} Ж:${
						addCharBeforeValue(e.view_json.fat ? e.view_json.fat : 0, 4, '_')} У:${
						addCharBeforeValue(e.view_json.carbohydrate ? e.view_json.carbohydrate : 0, 4, '_')} К:${
						addCharBeforeValue(e.view_json.caloric_content ? e.view_json.caloric_content : 0, 5, '_')} <i>${
						e.name__lang_code_ru}</i> `
				});

				const makeInlineKeyboard = (pages, tableName, id) => {
					return telegraf.Markup.inlineKeyboard([[
							telegraf.Markup.button.callback(`${pages.first}`, `${tableName + pages.first}i${id}`),
							telegraf.Markup.button.callback(`${pages.movePreviousMinusFive}<<`, `${tableName + pages.movePreviousMinusFive}i${id}`),
							telegraf.Markup.button.callback(`${pages.movePrevious}<`, `${tableName + pages.movePrevious}i${id}`),
							telegraf.Markup.button.callback(`${pages.selected}`, `${tableName + pages.selected}i${id}`),
							telegraf.Markup.button.callback(`>${pages.moveNext}`, `${tableName + pages.moveNext}i${id}`),
							telegraf.Markup.button.callback(`>>${pages.moveNextPlusFive}`, `${tableName + pages.moveNextPlusFive}i${id}`),
							telegraf.Markup.button.callback(`${pages.last}`, `${tableName + pages.last}i${id}`)
					]]);
				}

				const inlineKeyboard = makeInlineKeyboard(pages, `fi`, userInfo.tg_user_id);

				inlineKeyboard.parse_mode = 'HTML';
				inlineKeyboard.allow_sending_without_reply = true;
				// inlineKeyboard.reply_to_message_id = ctx.update.message.message_id; //only if in groups

 				const response = await bot.telegram.sendMessage(
					ctx.update.message.chat.id,
					message,
					inlineKeyboard
				);


				let row = {};
				row = {};
				row.creation_date = new Date(reqDate).toISOString();
				row.tg_user_id = ctx.update.message.from.id;
				row.command = `SHOW_CREATED_FOOD`;
				row.data = {};
				row.data.message_id = response.message_id;
				row.data = JSON.stringify(row.data);
				
				let paramQuery = {};
				paramQuery.text = `
					INSERT INTO telegram_user_sended_commands
					(${objKeysToColumnStr(row)})
					VALUES
					(${objKeysToColumn$IndexesStr(row)})
				;`;
				paramQuery.values = getArrOfValuesFromObj(row);
				await DB_CLIENT.query(paramQuery);


			} else if (Array.isArray(re_result = text.toLowerCase().match(RE_RU_COMMAND__DELETE_CREATED_FOOD_IDs))) {
				console.log(re_result);
				
					const fi_id_for_userStr = re_result.input;
					const num_re = /[0-9]+/g;

					let fi_id_for_userArr = execAndGetAllREResults(fi_id_for_userStr, num_re);
					fi_id_for_userArr = cleanArrFromRecurringItems(fi_id_for_userArr);
					// check existance of that ucfi_ids_for_user_arr
					let res = await DB_CLIENT.query(`
						SELECT fi_id_for_user
						FROM food_items
						WHERE tg_user_id = ${userInfo.tg_user_id}
						AND fi_id_for_user = ANY (ARRAY[${fi_id_for_userArr.join()}])
						AND deleted
					;`);

					if (res.rows.length) {
						let alreadyDeleted = ``;
						if (res.rows.length > 1) {
							alreadyDeleted += `Не существует еды с такими ID: `;
							res.rows.forEach((el, i) => {
								if (res.rows.length - 1 == i) {
									alreadyDeleted += el.fi_id_for_user;
									return;
								}
								alreadyDeleted += el.fi_id_for_user + ', '
							})
						} else {
							alreadyDeleted += `Не существует еды с таким ID: `;
							res.rows.forEach(el => alreadyDeleted += el.fi_id_for_user);
						}
						alreadyDeleted += `.\n\n0_0`;
						ctx.reply(alreadyDeleted)
						return;
					}
				

					// delete doc with the same food_items_ids from meilisearch
					await MSDB.deleteDocuments({
						filter:`food_items_id IN [${userLastCommand.data.food_items_ids.join()}]`
					});

					
					// update deleted ucfi rows   
					let row = {};
					row = {};
					row.deleted = true;

					let paramQuery = {};
					paramQuery.text = `
						UPDATE food_items
						SET ${getStrOfColumnNamesAndTheirSettedValues(row)}
						WHERE tg_user_id = ${userInfo.tg_user_id}
						AND fi_id_for_user = ANY (ARRAY[${fi_id_for_userArr.join(', ')}])
						RETURNING	id, name__lang_code_ru, fi_id_for_user, view_json
					;`;

					let updateFIRes = await DB_CLIENT.query(paramQuery);
					
					// add to telegram_user_commands
					row = {};
				row.creation_date = new Date(reqDate).toISOString();
					row.tg_user_id = ctx.update.message.from.id;
					row.command = `DELETE_FOOD`;
					row.can_it_be_canceled = true;

					row.data = {};
					row.data.food_items_ids = [];
					updateFIRes.rows.forEach(el => row.data.food_items_ids.push(el.id));
					row.data = JSON.stringify(row.data);
					
					paramQuery = {};
					paramQuery.text = `
						INSERT INTO telegram_user_sended_commands
						(${objKeysToColumnStr(row)})
						VALUES
						(${objKeysToColumn$IndexesStr(row)})
					;`;
					paramQuery.values = getArrOfValuesFromObj(row);
					
					await DB_CLIENT.query(paramQuery);

					// update available count fi in registered_users
					row = {};
					row.available_count_of_user_created_fi = Number(userInfo.available_count_of_user_created_fi) - fi_id_for_userArr.length;
				
					await DB_CLIENT.query(`
						UPDATE registered_users
						SET ${getStrOfColumnNamesAndTheirSettedValues(row)}
						WHERE id = ${userInfo.r_user_id}
					;`);
					
					let deletedMessage = `<b>Удалено:</b>\n\n<b>ID</b>   БЖУК (на 100г) <b><i>Название еды</i></b>`;

				const makeUnderlineIDOfUserCreatedFI = intId => {
					const str = String(intId);
					const maxStrIDLength = 4;
					
					let result = ``;

					for (let i = 0, diff = maxStrIDLength - str.length; i < diff; i++) {
						result += `_`;
					}
					result += str;

					return result;
				};

				const addCharBeforeValue = (value, maxLength, charS) => {
					let str = Number(value).toFixed(1);
					
					let result = ``;

					for (let i = 0, diff = maxLength - str.length; i < diff; i++) {
						result += charS;
					}
					result += str;

					return result;
				};

				updateFIRes.rows.forEach(e => {
					deletedMessage += `\n<b>${makeUnderlineIDOfUserCreatedFI(e.fi_id_for_user)}</b> Б:${
						addCharBeforeValue(e.view_json.protein ? e.view_json.protein : 0, 4, '_')} Ж:${
						addCharBeforeValue(e.view_json.fat ? e.view_json.fat : 0, 4, '_')} У:${
						addCharBeforeValue(e.view_json.carbohydrate ? e.view_json.carbohydrate : 0, 4, '_')} К:${
						addCharBeforeValue(e.view_json.caloric_content ? e.view_json.caloric_content : 0, 5, '_')} <i>${
						e.name__lang_code_ru}</i> `
				});

					
					deletedMessage += `\n\nОтменить?<b> "о/отмена"</b>\n\n<i>Я ТЕБЯ ПОРОДИЛ, Я ТЕБЯ И УДАЛЮ...</i>`;
					ctx.reply(deletedMessage, {parse_mode : 'HTML'});

			} else if (Array.isArray(re_result = text.toLowerCase().match(RE_RU_COMMAND__DELETE_CREATED_DISH_IDs))) {
					ctx.reply(`code me, btch`)
					console.log(`code me`)
			} else {
				//ne mogu raspoznat' zapros //ssilka na manual
				//

				ctx.reply(`Не понимаю команду.\n\n*Краткая инструкция:*\n-создать еду\n  се мороженое Обамка. б3,4ж17,2у22,2к257\nи т.д.\n\n\nПодробная инструкция ссылка.`, { parse_mode: 'Markdown', allow_sending_without_reply: true })

	
			}
		} else {
			console.log(`user has last command, main tree, subprocess`);

			await deletePreviousUserInput(userSubprocess);

			const userMessageId = ctx.update.message.message_id;

			if (userSubprocess.process_name == `DISH_CREATING` || userSubprocess.process_name == `DISH_EDITING`){
				if (Array.isArray(re_result = text.toLowerCase().match(RE__RESOLVE_FD_ID_WEIGHT_FROM_InlQuery))){
					const subCommand = `resolveFDIDWeightFromInlQuery`;

					const foodDishType = re_result[1];
					const id = Number(re_result[2]);
					const g_weight = Number(Number(re_result[3]).toFixed(1));
					
					if(userSubprocess.data.ingredients.length >= 100){
 						const invalidComment = `Больше 100 ингредиентов в одном блюде? Не шутишь?\nТогда придётся сохранить текущее блюдо, создать второе блюдо и добавить в него текущее.\nТакие дела, чо...`;
						const cause = `userSubprocess.data.ingredients.length >= 100`;
						
						await completeSubrocessCommand(userMessageId, userSubprocess, invalidComment, subCommand, cause);
						return;
					}

					let newIngredient;

					if ( foodDishType == 'f') {
						let res = await pgClient.query(`
							SELECT id, name__lang_code_ru, protein, fat, carbohydrate, caloric_content
							FROM food_items
							WHERE id = ${id}
						;`);
						newIngredient = res.rows[0];
						newIngredient.t = 'f';
					} else {
						let res = await pgClient.query(`
							SELECT id, name__lang_code_ru, protein, fat, carbohydrate, caloric_content
							FROM dish_items
							WHERE id = ${id}
						;`);
						newIngredient = res.rows[0];
						newIngredient.t = 'd';
					}
					
					newIngredient.id = Number(newIngredient.id);

					const identicalIngredient = userSubprocess.data.ingredients.find(e => e.id == newIngredient.id && e.t == newIngredient.t);

					if (identicalIngredient) {
						
						const invalidComment = `Ingredient "${newIngredient.name__lang_code_ru}" uje dobavlen pod nomerom ${identicalIngredient.n}.`;
						const cause = `identicalIngredient`;

						await completeSubrocessCommand(userMessageId, userSubprocess, invalidComment, subCommand, cause);

						return;
					}

					newIngredient.n = userSubprocess.data.ingredients.length + 1;
					newIngredient.g_weight = g_weight;
					newIngredient = bjukToNum(newIngredient);

					const validComment = `Добавлен ингредиент.\n\n${
						newIngredient.name__lang_code_ru
					}`;

					userSubprocess.data.ingredients.push(newIngredient);

					userSubprocess.data.dish = calcDishBJUKnW(
						userSubprocess.data.dish,
						userSubprocess.data.ingredients
					);
					
					const lengthOfIngredients = userSubprocess.data.ingredients.length;
					const maxNumberOfLines = 20;
					const selectedPage = getNumberOfPages(lengthOfIngredients, maxNumberOfLines);

					const m = getDishMessage(selectedPage, maxNumberOfLines, userSubprocess);

					let res = await editDishSheetMessage(
						userSubprocess.tg_user_id,
						userSubprocess.state.message_id,
						m.text,
						m.inlineKeyboard
					);

					if(!res){
						return;
					}
					
					userSubprocess.state.message_id = res.message_id;

					await completeSubrocessCommand(userMessageId, userSubprocess, validComment, subCommand);

				} else if (Array.isArray(re_result = text.toLowerCase().match(RE_RU_COMMAND__DELETE_INGREDIENTs_FROM_DISH))) {
					const subCommand = `deleteIngrFromDish`;

					//row.data.action = {delete ingredient, ingredients}
					let listNums = [];
					[...re_result.input.matchAll(/[0-9]+/g)].forEach(el => {
						listNums.push(Number(el[0]));
					});
					
					console.log(listNums);

					if (!userSubprocess.data.ingredients.length) {
						const invalidComment = `nechego udalyat'`;
						const cause = `!userSubprocess.data.ingredients.length`;

						await completeSubrocessCommand(userMessageId, userSubprocess, invalidComment, subCommand, cause);

						return;
					} else {
						let absentNums = [];
						listNums.forEach(el => {
							if ( el < 1 || el > userSubprocess.data.ingredients.length){
								absentNums.push(el);
							}
						});

						if(absentNums.length) {
							const invalidComment = `igredientov s ${absentNums.length>1?'nomerami':'nomerom'} ${absentNums.join()} net`;
							const cause = `absentNums.length`;

							await completeSubrocessCommand(userMessageId, userSubprocess, invalidComment, subCommand, cause);

							return;
						}
					}


					const getStrListOfDeletedIngreditents = (deletedNums, ingredients) => {
						let strList = ``;
						
						deletedNums.forEach(e => {
							console.log(e, ingredients)
							strList += `\n${ingredients[e - 1].name__lang_code_ru}`;
						});

						return strList;
					}

					const validComment = `Ингредиент${
						listNums.length > 1 ? 'ы' : ''
					} удален${
						listNums.length > 1 ? 'ы' : ''
					}:\n${getStrListOfDeletedIngreditents(listNums, userSubprocess.data.ingredients)}`;

					listNums.sort();
					const lastDeletedNum = listNums[listNums.length - 1];

					for(let i = 0; i < userSubprocess.data.ingredients.length; i++){
						for (let k = 0; k < listNums.length; k++) {
							if(listNums[k] == userSubprocess.data.ingredients[i].n){
								listNums.splice(k, 1);
								userSubprocess.data.ingredients.splice(i, 1);
								k = -1;
							}
						}
					}

					userSubprocess.data.ingredients.forEach((e, i) => {
						userSubprocess.data.ingredients[i].n = i + 1;
					});

					userSubprocess.data.dish = calcDishBJUKnW(
						userSubprocess.data.dish,
						userSubprocess.data.ingredients
					);
					
					const maxNumberOfLines = 20;
					const selectedPage = getNumberOfPages(lastDeletedNum, maxNumberOfLines);

					const m = getDishMessage(selectedPage, maxNumberOfLines, userSubprocess);

					let res = await editDishSheetMessage(
						userSubprocess.tg_user_id,
						userSubprocess.state.message_id,
						m.text,
						m.inlineKeyboard
					);

					if(!res){
						return;
					}
					
					userSubprocess.state.message_id = res.message_id;

					await completeSubrocessCommand(userMessageId, userSubprocess, validComment, subCommand);

				} else if (Array.isArray(re_result = text.toLowerCase().match(RE_RU_COMMAND__EDIT_INGREDIENT_WEIGHT_IN_DISH))) {
					const subCommand = `deleteIngrFromDish`;

					const ingredientNum = Number(re_result[1]);
					const newWeight = Number(re_result[2].replace(/\,/, '.'));
					
					if (!userSubprocess.data.ingredients.length) {
						const invalidComment = `nechego izmenyat''`;
						const cause = `!userSubprocess.data.ingredients.length edit w`;

						await completeSubrocessCommand(userMessageId, userSubprocess, invalidComment, subCommand, cause);

						return;
					}

					if ( ingredientNum < 1 || ingredientNum > userSubprocess.data.ingredients.length) {
						const invalidComment = `igredienta s nomerom ${ingredientNum} net`;
						const cause = `ingredientNum < 1 || ingredientNum > userSubprocess.data.ingredients.length`;

						await completeSubrocessCommand(userMessageId, userSubprocess, invalidComment, subCommand, cause);

						return;
					}

					if (userSubprocess.data.ingredients[ingredientNum - 1].g_weight == newWeight){
						const invalidComment = `Зачем задавать точно такой же вес ингредиенту???`;
						const cause = `userSubprocess.data.ingredients[ingredientNum].g_weight == newWeight`;

						await completeSubrocessCommand(userMessageId, userSubprocess, invalidComment, subCommand, cause);

						return;
					}

					userSubprocess.data.ingredients[ingredientNum - 1].g_weight = newWeight;

					userSubprocess.data.dish = calcDishBJUKnW(
						userSubprocess.data.dish,
						userSubprocess.data.ingredients
					);

					const validComment = `Изменен вес ингредиента:\n\n${userSubprocess.data.ingredients[ingredientNum - 1].name__lang_code_ru}`;
					
					const maxNumberOfLines = 20;
					const selectedPage = getNumberOfPages(ingredientNum, maxNumberOfLines);

					const m = getDishMessage(selectedPage, maxNumberOfLines, userSubprocess);

					let res = await editDishSheetMessage(
						userSubprocess.tg_user_id,
						userSubprocess.state.message_id,
						m.text,
						m.inlineKeyboard
					);

					if(!res){
						return;
					}
					
					userSubprocess.state.message_id = res.message_id;

					await completeSubrocessCommand(userMessageId, userSubprocess, validComment, subCommand);

				} else if (Array.isArray(re_result = text.toLowerCase().match(RE_RU_COMMAND__DISH_TOTAL_WEIGHT))) {
					const subCommand = `dishTotalWeight`;

					const totalWeight = Number(re_result[1].replace(/\,/, '.'));

					//check more than actual weight
					//
					if (!userSubprocess.data.ingredients.length) {

						const invalidComment = `Blyudo ne imeet ingredientov. Nechemu zadavat' itogoviy ves.`;
						const cause = `!userSubprocess.data.ingredients.length itog ves`;

						await completeSubrocessCommand(userMessageId, userSubprocess, invalidComment, subCommand, cause);

						return;
					}

					if (totalWeight > userSubprocess.data.dish.g_weight){

						const invalidComment = `Itogoviy ves ne mojet bit' bolshe vesa summi vseh ingredientov. Dobavlena voda? Zanesi ee togda.`;
						const cause = `totalWeight > userSubprocess.data.dish.g_weight)`;

						await completeSubrocessCommand(userMessageId, userSubprocess, invalidComment, subCommand, cause);

						return;
					}

					userSubprocess.data.dish = calcDishBJUKnW(
						userSubprocess.data.dish,
						userSubprocess.data.ingredients
					);

					const emptyIngredient = setZeroBJUKnW({});
					emptyIngredient.g_weight = totalWeight - userSubprocess.data.dish.g_weight;

					userSubprocess.data.dish = addIngredientInDish(
						userSubprocess.data.dish,
						emptyIngredient
					);

					userSubprocess.data.dish.total_g_weight = totalWeight;

					const validComment = `Итоговый вес блюда задан.`;

					const lengthOfIngredients = userSubprocess.data.ingredients.length;
					const maxNumberOfLines = 20;
					const selectedPage = getNumberOfPages(lengthOfIngredients, maxNumberOfLines);// COMPABILITY BITCH

					const m = getDishMessage(selectedPage, maxNumberOfLines, userSubprocess);

					let res = await editDishSheetMessage(
						userSubprocess.tg_user_id,
						userSubprocess.state.message_id,
						m.text,
						m.inlineKeyboard
					);

					if(!res){
						return;
					}
					
					userSubprocess.state.message_id = res.message_id;

					await completeSubrocessCommand(userMessageId, userSubprocess, validComment, subCommand);

				} else {
					const invalidComment = `Ne ponimayu komandu.`;
					const cause = `Ne ponimayu komandu`;

					await completeSubrocessCommand(userMessageId, userSubprocess, invalidComment, 'undefined', cause);
				}

			} else if (userSubprocess.process_name == `DISH_CREATING__RENAMING`){
				let dishName = text.slice(0, 128).replaceAll(/['"\\]/ug, ``).trim();

 				if (dishName.length < 4) {
 					let message = `Название блюда должно иметь хотя бы 4 символа.`;
 					let cause = `dishName.length < 4`;
					
					await commentUserInvalidInput(ctx, userSubprocess, cause, message);

					return;
				}


 				let findIdenticalNameResponse = await MSDB.search(dishName, {
					filter: `name__lang_code_ru = '${dishName}' AND tg_user_id = ${userInfo.tg_user_id}`
				});

 				if (findIdenticalNameResponse?.hits?.length) {
 					let message;
 					let cause = `findIdenticalNameResponse?.hits?.length`;
 					if(userSubprocess.data.name__lang_code_ru == dishName) {
						message = `Ты чо там, прикалываешься??? Зачем то же самое название кидаешь? Ты чо ебан? *диджей ебан туц-туц-туц*`;
						cause += `1`;
					} else {
						message = `Везунчик, блюдо с названием <b>"${dishName}"</b> уже тоже есть. Давай, ёпта, завязывай клоунаду свою и оригинальное название выдай или отредактируй существующее блюдо, додик.`;
						cause += `2`;
					}
					
					await commentUserInvalidInput(ctx, userSubprocess, cause, message);
					
					return;
				}

				let messageText = makeDishSheet(
					userSubprocess.data.dish,
					userSubprocess.data.ingredients
				);

				let dishReminder = `\n\n—Перед добавлением ингредиента его нужно создать.\n—Если в блюде больше 20 ингредиентов, то блюдо придется разделить на два блюда. Создать одно и добавить его как ингредиент в создоваемое второе.\n\nНужна помощь? Отправь <code>п</code>\nОтменить? Отправь <code>о</code>`;

				messageText += dishReminder;


				const id = userInfo.tg_user_id;
				const inlineKeyboard = telegraf.Markup.inlineKeyboard([[
						telegraf.Markup.button.callback(`Сохранить`, `i${id}save`),
						telegraf.Markup.button.callback(`Отмена`, `i${id}cancel`),
						telegraf.Markup.button.callback(`Команды`, `i${id}commands`)
					]]);

				inlineKeyboard.parse_mode = 'HTML';

// pothinkat', vdrug ne poluchitsya obnovit' soobshcenie
// to libo chota s inetom, libo service ne rabotaet, libo och staroe soobschenie, jdem service
				let response;

				try {
 					response = await bot.telegram.editMessageText(
						ctx.update.message.chat.id,
						userSubprocess.state.message_id,
						``,
						messageText,
						inlineKeyboard
					);
				} catch(e) {
					console.log(e);
				}

				if(!response){
					return;
				}

				console.log(response);

				// finish that process,
 				let row = {};
				row.data = JSON.stringify({});
				row.sequence = JSON.stringify({});
				row.state = JSON.stringify({});
				row.completed = true;
  
				let paramQuery = {};
				paramQuery.text = `
					UPDATE telegram_user_subprocesses
					SET ${getStrOfColumnNamesAndTheirSettedValues(row)}
					WHERE id = ${userSubprocess.id}
				;`;
				await DB_CLIENT.query(paramQuery);

				// make new process dish_creating
				//					

				row = {};
				row.creation_date = creation_date;
				row.command = `CREATE_DISH`;
				row.tg_user_id = userInfo.tg_user_id;
				row.is_process_c = true;

				paramQuery = {};
				paramQuery.text = `
					INSERT INTO telegram_user_sended_commands
					(${objKeysToColumnStr(row)})
					VALUES
					(${objKeysToColumn$IndexesStr(row)})
					RETURNING id
				;`;
				paramQuery.values = getArrOfValuesFromObj(row);
				res = await DB_CLIENT.query(paramQuery);

				//create process and insert in it dish data, state return process_id
				const sendedCommandId = res.rows[0].id;

				row = {};
				row.creation_date = creation_date;
				row.tg_user_id = userInfo.tg_user_id;
				row.sended_command_id = sendedCommandId;
				row.process_name = `DISH_CREATING`;

				row.data = {};
				row.data.dish = userSubprocess.data.dish;
				row.data.ingredients = [];

				row.sequence = [];

				const userLastAction = {};
				userLastAction.fromUser = true;
				userLastAction.message_id = ctx.update.message.message_id;

				const botLastIncorrectInputReply = userSubprocess.sequence.findLast(e => e.fromBot && e.incorrectInputReply && !e.deleted);

				if (botLastIncorrectInputReply){
					row.sequence.push(botLastIncorrectInputReply);
				}

				row.sequence.push(userLastAction);

				row.state = {};
				row.state.message_id = response.message_id;
				row.state.interface = `main`;

				row.data = JSON.stringify(row.data);
				row.sequence = JSON.stringify(row.sequence);
				row.state = JSON.stringify(row.state);

				paramQuery = {};
				paramQuery.text = `
					INSERT INTO telegram_user_subprocesses
					(${objKeysToColumnStr(row)})
					VALUES
					(${objKeysToColumn$IndexesStr(row)})
				;`;
				paramQuery.values = getArrOfValuesFromObj(row);
				await DB_CLIENT.query(paramQuery);
			} else {
				console.log(`main tree`);
			}
			console.log(text, re_result)

		}

});

bot.on(`callback_query`, async ctx => {
	console.log(
		`____________callback_____________`,
		JSON.stringify(ctx.update),
		/* ctx.update,
		ctx, */
		`____________callbavk_____________`
	);

	const callbackQuery = ctx.update.callback_query;
	console.log(callbackQuery?.data);

	let re_result;
	
	const reTGUserId = /i(\d+)/;

	if (Array.isArray(re_result = callbackQuery.data.match(reTGUserId)) && re_result[1] != callbackQuery.from.id) {
		try{
			await bot.telegram.answerCbQuery(callbackQuery.id);
		} catch(e) {
			console.log(e)
		}
		return;
	}

	const userInfo = await HZ.getTelegramUserInfo(DB_CLIENT, callbackQuery.from.id);

	if(!userInfo.privilege_type) {
		return;
	}
 	
 	try{
		await bot.telegram.answerCbQuery(callbackQuery.id);
	} catch(e) {
		console.log(e)
	}

	if (userInfo.is_banned) {
		return;
	}

	const reqDate = callbackQuery.message.date * 1000;	
	const creation_date = new Date(reqDate).toISOString();

	const userSubprocess = await getUserSubProcess(DB_CLIENT, userInfo.tg_user_id);

	const userLastCommand = (await DB_CLIENT.query(`
			SELECT *
			FROM telegram_user_sended_commands
			WHERE tg_user_id = ${userInfo.tg_user_id}
			ORDER BY id DESC
			limit 1;
		`)).rows[0];
	
	const reFoodItems = new RegExp(`${tableNames.food_items}(\\d+)i(\\d+)`);
	
	const rePreCreatedDishPage = /^i(\d+)p(\d+)$/;
	const reBack = /back/;

	const reCreatedDishPage = /^i(\d+)p(\d+)d(\d+)$/;

	const reSave = /^i(\d+)save$/;
	const reCancel = /^i(\d+)cancel$/;

	const reCommands = /^i(\d+)commands$/;
	const reCommandPage = /^i(\d+)cp(\d+)$/;



console.log(userSubprocess);	
	if(!userSubprocess){
		if(Array.isArray(re_result = callbackQuery.data.match(reCommandPage))) {
			//commands pages




		} else if (Array.isArray(re_result = callbackQuery.data.match(reFoodItems))) {

		const maxNumberOfLines = 10;//25

		let selectedPage = Number(re_result[1]);

		let numberOfPages = userInfo.available_count_of_user_created_fi / maxNumberOfLines;
		const numberOfPagesRound = Math.round(numberOfPages);
		const numberOfPagesFloor = Math.floor(numberOfPages);
		numberOfPages = numberOfPagesRound > numberOfPagesFloor ? numberOfPagesRound : numberOfPagesFloor + 1;

		const pages = {};
		pages.first = 1;
		pages.selected = selectedPage;
		pages.last = numberOfPages;

		if (numberOfPages == 1) {
			pages.movePrevious = 1;
			pages.movePreviousMinusFive = 1;
			pages.selected = 1;
			pages.moveNext = 1;
			pages.moveNextPlusFive = 1;
		} else if (numberOfPages > 1) {
			pages.moveNext = selectedPage + 1;
			if (pages.moveNext > numberOfPages) {
				pages.moveNext = numberOfPages;
			}

			pages.moveNextPlusFive = selectedPage + 6;
			if (pages.moveNextPlusFive > numberOfPages - 1) {
				pages.moveNextPlusFive = selectedPage + Math.round((numberOfPages - selectedPage ) / 2);
			}
		}

		if (selectedPage > numberOfPages){
			selectedPage = numberOfPages;

			pages.selected = numberOfPages;
			pages.moveNext = numberOfPages;
			pages.moveNextPlusFive = numberOfPages;
		}

		if (selectedPage > 1) {
			pages.movePrevious = selectedPage - 1;
			pages.movePreviousMinusFive = selectedPage - 6;
			if (pages.movePreviousMinusFive < 1) {
				pages.movePreviousMinusFive = Math.floor(selectedPage / 2);
			}
		} else {
			pages.movePrevious = 1;
			pages.movePreviousMinusFive = 1;
		}

		let ucfi_offset_string = ``;
		if (selectedPage > 1) {
			const ucfi_offset = maxNumberOfLines * (selectedPage - 1);
			ucfi_offset_string = `OFFSET ${ucfi_offset}`;
		}



				let message = `<b>Cписок созданной еды.</b> Всего: <b>${userInfo.available_count_of_user_created_fi}</b>.\n<b>ID</b>   БЖУК (на 100г) <b><i>Название еды</i></b>`;

					const res = await DB_CLIENT.query(`
						SELECT view_json, fi_id_for_user, name__lang_code_ru
						FROM food_items
						WHERE tg_user_id = ${userInfo.tg_user_id}
						AND deleted = false
						ORDER BY fi_id_for_user DESC
						LIMIT ${maxNumberOfLines}
						${ucfi_offset_string}
					;`);


				const addCharBeforeValue = (value, maxLength, charS) => {
					let str = Number(value).toFixed(1);
					
					let result = ``;

					for (let i = 0, diff = maxLength - str.length; i < diff; i++) {
						result += charS;
					}
					result += str;

					return result;
				};
		
					

				res.rows.forEach(e => {
					message += `\n<code>${e.fi_id_for_user}</code> Б:${
						addCharBeforeValue(e.view_json.protein ? e.view_json.protein : 0, 4, '_')} Ж:${
						addCharBeforeValue(e.view_json.fat ? e.view_json.fat : 0, 4, '_')} У:${
						addCharBeforeValue(e.view_json.carbohydrate ? e.view_json.carbohydrate : 0, 4, '_')} К:${
						addCharBeforeValue(e.view_json.caloric_content ? e.view_json.caloric_content : 0, 5, '_')} <i>${
						e.name__lang_code_ru}</i> `
				});


				const makeInlineKeyboard = (pages, tableName, id) => {
					return telegraf.Markup.inlineKeyboard([[
							telegraf.Markup.button.callback(`${pages.first}`, `${tableName + pages.first}i${id}`),
							telegraf.Markup.button.callback(`${pages.movePreviousMinusFive}<<`, `${tableName + pages.movePreviousMinusFive}i${id}`),
							telegraf.Markup.button.callback(`${pages.movePrevious}<`, `${tableName + pages.movePrevious}i${id}`),
							telegraf.Markup.button.callback(`${pages.selected}`, `${tableName + pages.selected}i${id}`),
							telegraf.Markup.button.callback(`>${pages.moveNext}`, `${tableName + pages.moveNext}i${id}`),
							telegraf.Markup.button.callback(`>>${pages.moveNextPlusFive}`, `${tableName + pages.moveNextPlusFive}i${id}`),
							telegraf.Markup.button.callback(`${pages.last}`, `${tableName + pages.last}i${id}`)
					]]);
				}

				const inlineKeyboard = makeInlineKeyboard(pages, `fi`, userInfo.tg_user_id);
					
					
				let response;
					if ( message.replaceAll(/<\w+>|<\/\w+>|\s+/g, ``) == callbackQuery.message.text.replaceAll(/\s+/g, ``)) {
						try{
							response =	await bot.telegram.answerCbQuery(callbackQuery.id);
						} catch(e) {
							console.log(e)
						}

		console.log(
			response
		);
						return;
					}

					inlineKeyboard.parse_mode = 'HTML';
					inlineKeyboard.protect_content = true;

		try {		
				 response = await bot.telegram.editMessageText(
					callbackQuery.message.chat.id,
					callbackQuery.message.message_id,
					``,
					message,
					 inlineKeyboard
				); 
		} catch (e) {
			console.error(e);
		}		

		/* console.log(
			response
		); */

	} else if(Array.isArray(re_result = callbackQuery.data.match(reSave))){
		console.log(re_result, callbackQuery);

		//update sended_commands, add data with dish id
		//update processes, delete data and sequences
		//

		//get dish
		let res = await DB_CLIENT.query(`
			SELECT name__lang_code_ru, protein, fat, caloric_content, carbohydrate, fooddish_gweight_items_json
			FROM dish_items
			WHERE id = ${userLastCommand.data.dish_items_ids[0]}
		;`);

		const dish = res.rows[0];

		//check dish ingredients if no return
		if (!dish.fooddish_gweight_items_json.length){
			try{
				await bot.telegram.answerCbQuery(
					callbackQuery.id,
					`Нет ни одного ингредиента.\nОтправь    /help`,
					{show_alert : true}
				);
			} catch(e) {
				console.log(e);
			}
			return;
		}
		//insert fooddish_ids_for_meilisearch  get id
		let row = {};
		row.dish_items_id = userLastCommand.data.dish_items_ids[0];
			
		let paramQuery = {};
		paramQuery.text = `
			INSERT INTO fooddish_ids_for_meilisearch
			(${objKeysToColumnStr(row)})
			VALUES
			(${objKeysToColumn$IndexesStr(row)})
			RETURNING	id
		;`;
		paramQuery.values = getArrOfValuesFromObj(row);
		res = await DB_CLIENT.query(paramQuery);

		const dishIdForMeiliSearch = res.rows[0].id;
		//insert meilisearch
		const documents = [];
		const doc = {};
		doc.id = Number(dishIdForMeiliSearch);
		doc.dish_items_id = Number(userLastCommand.data.dish_items_ids[0]);
		doc.name__lang_code_ru = dish.name__lang_code_ru;
		doc.tg_user_id = Number(userInfo.tg_user_id);
		doc.created_by_project = false;
		doc.protein = dish.protein?Number(dish.protein):0;
		doc.fat = dish.fat?Number(dish.fat):0;
		doc.carbohydrate = dish.carbohydrate ?Number(dish.carbohydrate):0;
		doc.caloric_content = dish.caloric_content ? Number(dish.caloric_content ) : 0;
		documents.push(doc);

		await MSDB.addDocuments(documents);

		//insert telegram_user_sended_commands
		row = {};
		row.creation_date = creation_date;
		row.command = 'SAVE_DISH';
		row.tg_user_id = userInfo.tg_user_id;

		row.data = {};
		row.data.dish_items_ids = [userLastCommand.data.dish_items_ids[0]];
		row.data = JSON.stringify(row.data);

		paramQuery = {};
		paramQuery.text = `
			INSERT INTO telegram_user_sended_commands
			(${objKeysToColumnStr(row)})
			VALUES
			(${objKeysToColumn$IndexesStr(row)})
		;`;
		paramQuery.values = getArrOfValuesFromObj(row);
		await DB_CLIENT.query(paramQuery);

		//make message and send
		let dishSheetHead = `\n<b><u>|__ID|Б_______|Ж_______|У_______|К______|</u> <i>Название блюда</i></b>`;

		let dishSheetFooter = `\n<u>|${
			makeDishNumForSheetLine(userInfo.count_of_user_created_di, 4)}|Б:${
			addCharBeforeValue(dish.protein, 5, '_')} |Ж:${
			addCharBeforeValue(dish.fat, 5, '_')} |У:${
			addCharBeforeValue(dish.carbohydrate, 5, '_')} |К:${
			addCharBeforeValue(dish.caloric_content, 5, '_')}|</u> <i>${
			dish.name__lang_code_ru}</i>\n\n<b>СОХРАНЕНО.</b>`;

		let messageText = dishSheetHead+dishSheetFooter;

				let response;

				try{
					response = await bot.telegram.editMessageText(
						callbackQuery.message.chat.id,
						userLastCommand.data.message_id,
						``,
						messageText,
						{parse_mode:'HTML'}
					);

				}catch(e){
					console.log(e)

				}
					console.log(response)

		}
		console.log(`!userSubprocess, main tree`);

	} else {
		if(userSubprocess.process_name == `DISH_CREATING__RENAMING`){
			if(Array.isArray(re_result = callbackQuery.data.match(reCancel))){
				console.log(re_result);

				let messageText = `Переимнование блюда отменено.`

				let response;

				try {
 					response = await bot.telegram.editMessageText(
						callbackQuery.message.chat.id,
						userSubprocess.state.message_id,
						``,
						messageText
					);
				} catch(e) {
					console.log(e);
				}

				if(!response){
					return;
				}
				
				await completeUserSubprocess(userSubprocess, {
						canceled: true
					});
				
				const row = {};
				row.creation_date = creation_date;
				row.command = `CANCEL__CREATE_DISH__RENAME`;
				row.tg_user_id = userSubprocess.tg_user_id;
				row.process_id = userSubprocess.id;

				await insertIntoTelegramUserSendedCommandsPostgresTable(row);

			}

		} else if(userSubprocess.process_name == `DISH_CREATING`){
			if(Array.isArray(re_result = callbackQuery.data.match(reCancel))){

				let messageText = `Создание блюда отменено.`

				let response;

				try {
 					response = await bot.telegram.editMessageText(
						callbackQuery.message.chat.id,
						userSubprocess.state.message_id,
						``,
						messageText
					);
				} catch(e) {
					console.log(e);
				}

				if(!response){
					return;
				}
				
				await completeUserSubprocess(userSubprocess, {
						canceled: true
					});
				
				const row = {};
				row.creation_date = creation_date;
				row.command = `CANCEL__CREATE_DISH`;
				row.tg_user_id = userInfo.tg_user_id;
				row.process_id = userSubprocess.id;
				
				await insertIntoTelegramUserSendedCommandsPostgresTable(row);

			} else if (Array.isArray(re_result = callbackQuery.data.match(reSave))){
				const subCommand = `callbackSaveDish`;
				//check ingredients
				//check dish ingredients if no return
				if (!userSubprocess.data.ingredients.length){
					const invalidComment = `Блюдо не содержит ингредиентов. Не могу сохранить.`;
					const cause = `!userSubprocess.data.ingredients`;

					await completeSubrocessCommand (0, userSubprocess, invalidComment, subCommand, cause);

					return;
				}

				let ingredients = makeCopyOfObjArray(
					userSubprocess.data.ingredients
				);
				ingredients = shortenBJUKnWNOfIngredients(ingredients);

				let dish = Object.assign({}, userSubprocess.data.dish);
				//insert into dish_items
				let row = dish;
				row.creation_date = creation_date;
				row.fooddish_gweight_items_json = JSON.stringify(ingredients);
				row.tg_user_id = userSubprocess.tg_user_id;
				
				let paramQuery = {};
				paramQuery.text = `
					INSERT INTO dish_items
					(${objKeysToColumnStr(row)})
					VALUES
					(${objKeysToColumn$IndexesStr(row)})
					RETURNING	id
				;`;
				paramQuery.values = getArrOfValuesFromObj(row);
				let res = await DB_CLIENT.query(paramQuery);
				const dishItemsId = res.rows[0].id;

				//insert into fooddish_ids_for_meilisearch
				row = {};
				row.dish_items_id = dishItemsId;
					
				paramQuery = {};
				paramQuery.text = `
					INSERT INTO fooddish_ids_for_meilisearch
					(${objKeysToColumnStr(row)})
					VALUES
					(${objKeysToColumn$IndexesStr(row)})
					RETURNING	id
				;`;
				paramQuery.values = getArrOfValuesFromObj(row);
				res = await DB_CLIENT.query(paramQuery);
				const fdIdsForMSId = res.rows[0].id;

				//insert into meilisearch
				dish = Object.assign({}, userSubprocess.data.dish);
				delete dish.di_id_for_user;
				delete dish.g_weight;
				delete dish.total_g_weight;
				
				const documents = [];
				const doc = dish;
				doc.id = Number(fdIdsForMSId);
				doc.dish_items_id = Number(dishItemsId);
				doc.tg_user_id = Number(userSubprocess.tg_user_id);
				doc.created_by_project = false;
				documents.push(doc);

				await MSDB.addDocuments(documents);

				//insert telegram_user_sended_commands
				row = {};
				row.creation_date = creation_date;
				row.command = 'SAVE_DISH';
				row.tg_user_id = userSubprocess.tg_user_id;
				row.can_it_be_removed = true;
				row.process_id = userSubprocess.id;
				row.can_it_be_removed = true;

				row.data = {};
				row.data.dish_items_ids = [dishItemsId];
				row.data = JSON.stringify(row.data);

				await insertIntoTelegramUserSendedCommandsPostgresTable(row);

				//insert telegram_users
				//perepisat' na telegram_users
				//registered_users available_count_of_user_created_fi - 1 //add check for all users
				userInfo.available_count_of_user_created_di = Number(userInfo.available_count_of_user_created_di) + 1;
				await DB_CLIENT.query(`
					UPDATE registered_users
					SET available_count_of_user_created_di = ${userInfo.available_count_of_user_created_di},
					count_of_user_created_di = ${userSubprocess.data.dish.di_id_for_user}
					WHERE id = ${userInfo.r_user_id};
				`);

				//update telegram_user_subprocesses  complete clear data state sequence
				await completeUserSubprocess(userSubprocess);


				//make message with buttons of dishitems id if ings > 20 and send
				let messageText = makeDishSheet(
					userSubprocess.data.dish,
					userSubprocess.data.ingredients
				);

				try{
					await bot.telegram.editMessageText(
						callbackQuery.message.chat.id, 
						userSubprocess.state.message_id,
						``,
						messageText,
						{parse_mode:'HTML'}
					);
					await bot.telegram.sendMessage(
						callbackQuery.message.chat.id, 
						`SOHRANENO`
					);
				}catch(e){
					console.log(e)
				}
				
			} else if (Array.isArray(re_result = callbackQuery.data.match(reCommands))) {// redirect if sequence of shit input > 2

				
				console.log(`code me`);
			}

		} else {
			console.log(`code me`);
		}
	}

});

bot.on(`inline_query`, async ctx => {
	console.log(
		`____________inline_____________`,
		JSON.stringify(ctx.update),
//		ctx.update,
//		ctx,
		`____________inline_____________`
	);
	

	if (ctx.update.inline_query.from.is_bot) {
		return;
	}

	const userInfo = await HZ.getTelegramUserInfo(DB_CLIENT, ctx.update.inline_query.from.id);
	
	if(!userInfo.privilege_type) {
		return;
	}

	const userLastCommand = (await DB_CLIENT.query(`
			SELECT *
			FROM telegram_user_sended_commands
			WHERE tg_user_id = ${userInfo.tg_user_id}
			ORDER BY id DESC
			limit 1;
		`)).rows[0];

	const userSubprocess = await getUserSubProcess(pgClient, ctx.update.inline_query.from.id);

	let re_result;
		
	let text = ctx.update.inline_query.query;
	text = text.replaceAll(/\s+/g, ` `);

	console.log(userLastCommand);

	const makeInputMessageContent = text => {
		return {
			message_text : text
		}
	}

	const makeInlineQueryResultArticle = (id, title, inputMessageContent, description) => {
		return {
			type: `article`,
			id: id,
			title: title,
			input_message_content: inputMessageContent,
			description: description,
		};
	}

	console.log(userInfo);

	if (!userSubprocess) {
		


	} else {
		if (userSubprocess.process_name == 'DISH_CREATING'){
			if (Array.isArray(re_result = text.toLowerCase().match(RE_RU_INLINE_COMMAND__ADD_INGREDIENT_TO_DISH))) {
				console.log(re_result);

				const userInputWeight = Number(re_result[1].replaceAll(/,/g, '.'));
				const userInputIngredientName = text.slice(re_result[0].length).replaceAll(/['"\\]/ug, ``).slice(0, 128).trim();
				console.log(userInputIngredientName);
				
				let articleIdPart = Date.now().toString();
				articleIdPart = articleIdPart.slice(articleIdPart.length-6);

				let filter_NutrientName, filter_lessMore;
				let noRes_BJUK, noRes_lessMore;
				if (re_result[7] == `б`) {
					filter_NutrientName = `protein`;
					noRes_BJUK = `БЕЛКОВ`;
				} else if (re_result[7] == `ж`) {
					filter_NutrientName = `fat`;
					noRes_BJUK = `ЖИРОВ`;
				} else if (re_result[7] == `у`) {
					filter_NutrientName = `carbohydrate`;
					noRes_BJUK = `УГЛЕВОДОВ`;
				} else if (re_result[7] == `к`) {
					filter_NutrientName = `caloric_content`;
					noRes_BJUK = `КАЛОРИЙ`;
				}
				if (re_result[9] == `<`) {
					filter_lessMore = '<=';
					noRes_lessMore = `МЕНЕЕ`;
				} else if (re_result[9] == `>`) {
					filter_lessMore = '>=';
					noRes_lessMore = `БОЛЕЕ`;
				}

				let userAdditionFilter = ``;
				if (filter_NutrientName) {
					userAdditionFilter += ` AND ${filter_NutrientName} ${filter_lessMore} ${re_result[11]}`;
				}

				//search in MSDB
				const res = await meiliSClient.multiSearch({
					queries:[
						{
							indexUid: 'foodDishNames',
							q: userInputIngredientName,
							filter: `tg_user_id = ${userInfo.tg_user_id} OR created_by_project = true AND dish_items_id IS NULL${userAdditionFilter}`,
							limit: 25
						},
						{
							indexUid: `foodDishNames`,
							q: userInputIngredientName,
							filter:	`tg_user_id = ${userInfo.tg_user_id} OR created_by_project = true AND food_items_id IS NULL${userAdditionFilter}`,
							limit: 25
						}
					]
				});
				
				const addCharBeforeValue = (value, maxLength, charS) => {
					let str = Number(value).toFixed(1);
					
					let result = ``;

					for (let i = 0, diff = maxLength - str.length; i < diff; i++) {
						result += charS;
					}
					result += str;

					return result;
				};

				if(res.results[0].hits.length || res.results[1].hits.length) {
					let inlineQueryResultArticles = [];

					res.results.forEach(r => {
						r.hits.forEach(el => {
							let inputMessageContent;
							if (el.food_items_id){
								inputMessageContent = makeInputMessageContent(`f${el.food_items_id}w${userInputWeight}`)
							} else {
								inputMessageContent = makeInputMessageContent(`d${el.dish_items_id}w${userInputWeight}`)
							}
							let description = `Б:${
								addCharBeforeValue(el.protein, 6, '_')} Ж:${
								addCharBeforeValue(el.fat, 6, '_')} У:${
								addCharBeforeValue(el.carbohydrate, 6, '_')} К:${
								addCharBeforeValue(el.caloric_content, 7, '_')} на 100 грамм\nБ:${
								addCharBeforeValue(el.protein * userInputWeight / 100, 6, '_')} Ж:${
								addCharBeforeValue(el.fat * userInputWeight / 100, 6, '_')} У:${
								addCharBeforeValue(el.carbohydrate * userInputWeight / 100, 6, '_')} К:${
								addCharBeforeValue(el.caloric_content * userInputWeight / 100, 7, '_')} на ${userInputWeight} грамм`;

							inlineQueryResultArticles.push(
								makeInlineQueryResultArticle(
										`cDishItem${userInfo.tg_user_id}${articleIdPart}${el.id}`,
										el.name__lang_code_ru,
										inputMessageContent,
										description	
									)
							);
						});
					});

					console.log(inlineQueryResultArticles)

					for (let i = 0; i < inlineQueryResultArticles.length; i++) {
						for (let k = i + 1; k < inlineQueryResultArticles.length; k++) {
							if (inlineQueryResultArticles[i]?.id == inlineQueryResultArticles[k].id) {
								inlineQueryResultArticles.splice(k, 1);
								k--;
								i--;
							}
						}
					}

					ctx.answerInlineQuery(
						inlineQueryResultArticles,
						{
							is_personal:true,
							cache_time:60
						}
					);
					return;
				}

				let description = `с `;
				
				if (noRes_BJUK){
					description += `количеством   ${noRes_BJUK} ${noRes_lessMore} ${re_result[11]}   на 100 грамм\nи `;
				}

				description += `именем "${userInputIngredientName}"`;

				ctx.answerInlineQuery([
					makeInlineQueryResultArticle(
							`cDishNoItem${userInfo.tg_user_id}${articleIdPart}`,
							`Ингредиент не найден`,
							makeInputMessageContent(`Вы в процессе создания блюда.`),
							description
						)
					],
					{
						is_personal:true,
						cache_time:60
					}
				);
			} else {
				if (!ctx.update.inline_query.query) {
					ctx.answerInlineQuery([
						makeInlineQueryResultArticle(
								`cDishEmptyQ${userInfo.tg_user_id}`,
								`Вы в процессе создания блюда.`,
								makeInputMessageContent(`Вы в процессе создания блюда.`),
								`Поиск и добавление ингредиента:\n@edac_bot 123 ж>10 филе\n@edac_bot 321.4 арбуз`
							)
						],
						{is_personal:true}
					);
					return;
				}
				ctx.answerInlineQuery([
					makeInlineQueryResultArticle(
							`cDishNoMatch${userInfo.tg_user_id}`,
							`Не понимаю команду.`,
							makeInputMessageContent(`Вы в процессе создания блюда.`),
							`Поиск и добавление ингредиента:\n@edac_bot 123 ж>10 филе\n@edac_bot 321.4 арбуз`
					)
					],
					{is_personal:true}
				);
			}			
		} else if (userSubprocess.process_name == 'DAY_CREATION') {

			
		}
	}

	return;	

	if (Array.isArray(re_result = text.toLowerCase().match(RE_RU_BOT_AND_INLINE_COMMAND__GET_STATS))) {	
		console.log(re_result);
	} else if (Array.isArray(re_result = text.toLowerCase().match(RE_RU_INLINE_COMMAND__SHARE_CREATED_FOOD_OR_DISH))) {
		console.log(re_result);
		console.log(re_result);
		
		//search in db
		const re_str_arr = re_result[3].split(/\s+/);

		
		// const res = await DB_CLIENT.query();

		// searchBuiltinUserFoodAndDishes()//str arr([str, str], 50/*limit*/) and str, str etc, 50

		//make results
		//send response


		

		console.log(re_result);
	} else {
		//nichego ne naydeno ili komanda ne raspoznana //ssilka
		//ctx.answerInlineQuery(results);
	}
	
	/* const res = await DB_CLIENT.query(`
			SELECT * from food_images as fi where fi.id = 55;
		`);
	
	const InputTextMessageContent = {
		message_text: `message text`,
	}

	const article = {
		type: `article`,
		id: `sasiher`,
		title: `Title`,
		input_message_content: InputTextMessageContent,
		description: `description 1t23f3 gg5e desc .`,
	}
	result.push(Object.assign({}, article));
	article.id = `8heog`;
	result.push(article);

	ctx.answerInlineQuery(results); */
	
});
bot.launch()

process.on('beforeExit', (...code)=>{
console.log(code,`be`);
	});  
process.on('disconnect', (...code)=>{
console.log(code,`dis`);
	});  
process.on('message', (...code)=>{
console.log(code,`mes`);
	});  
process.on('multipleResolves', (...code)=>{
console.log(code,`mul`);
	});  
process.on('rejectionHandled', (...code)=>{
console.log(code,`reg`);
	});  
process.on('warning', (...code)=>{
console.log(code,`war`);
	});  
process.on('worker', (...code)=>{
console.log(code,`w`);
	});  

process.once('SIGSEGV', (...info)=>{console.log('SIGSEGV', info)})
process.once('SIGFPE', (...info)=>{console.log('SIGFPE', info)})
process.once('SIGABRT', (...info)=>{console.log('SIGABRT', info)})
process.once('SIGALRM', (...info)=>{console.log('SIGALRM', info)})
process.once('SIGBUS', (...info)=>{console.log('SIGBUS', info)})
process.once('SIGCHLD', (...info)=>{console.log('SIGCHLD', info)})
process.once('SIGCLD', (...info)=>{console.log('SIGCLD', info)})
process.once('SIGCONT', (...info)=>{console.log('SIGCONT', info)})
process.once('SIGEMT', (...info)=>{console.log('SIGEMT', info)})
process.once('SIGHUP', (...info)=>{console.log('SIGHUP', info)})
process.once('SIGILL', (...info)=>{console.log('SIGILL', info)})
process.once('SIGINFO', (...info)=>{console.log('SIGINFO', info)})
process.once('SIGPWR', (...info)=>{console.log('SIGPWR', info)})
process.once('SIGINT', (...info)=>{console.log('SIGINT', info)})
process.once('SIGIO', (...info)=>{console.log('SIGIO', info)})
process.once('SIGIOT', (...info)=>{console.log('SIGIOT', info)})
process.once('SIGLOST', (...info)=>{console.log('SIGLOST', info)})
process.once('SIGPIPE', (...info)=>{console.log('SIGPIPE', info)})
process.once('SIGPOLL', (...info)=>{console.log('SIGPOLL', info)})
process.once('SIGPROF', (...info)=>{console.log('SIGPROF', info)})
process.once('SIGQUIT', (...info)=>{console.log('SIGQUIT', info)})
process.once('SIGSTKFLT', (...info)=>{console.log('SIGSTKFLT', info)})
process.once('SIGTSTP', (...info)=>{console.log('SIGTSTP', info)})
process.once('SIGSYS', (...info)=>{console.log('SIGSYS', info)})
process.once('SIGTERM', (...info)=>{console.log('SIGTERM', info)})
process.once('SIGTRAP', (...info)=>{console.log('SIGTRAP', info)})
process.once('SIGTTIN', (...info)=>{console.log('SIGTTIN', info)})
process.once('SIGTTOU', (...info)=>{console.log('SIGTTOU', info)})
process.once('SIGUNUSED', (...info)=>{console.log('SIGUNUSED', info)})
process.once('SIGURG', (...info)=>{console.log('SIGURG', info)})
process.once('SIGUSR1', (...info)=>{console.log('SIGUSR1', info)})
process.once('SIGUSR2', (...info)=>{
	
	APP_STATE.isDBdead = true;

	DB_CLIENT.end();
	
  console.log('bye');

	console.log('SIGUSR2', info)})
process.once('SIGVTALRM', (...info)=>{console.log('SIGVTALRM', info)})
process.once('SIGXCPU', (...info)=>{console.log('SIGXCPU', info)})
process.once('SIGXFSZ', (...info)=>{console.log('SIGXFSZ', info)})
process.once('SIGWINCH', (...info)=>{console.log('SIGWINCH', info)})
process.once('SIGRTMIN', (...info)=>{console.log('SIGRTMIN', info)})
process.once('SIGRTMAX', (...info)=>{console.log('SIGRTMAX', info)})
process.once('EINTR', (...info)=>{console.log('EINTR', info)})



process.on('exit', (code) => {

	APP_STATE.isDBdead = true;

	DB_CLIENT.end();

  console.log(`About to exit with code: ${code}`);
});

process.once('SIGINT', () => {
	bot.stop('SIGINT');

	APP_STATE.isDBdead = true;

	DB_CLIENT.end()

  process.exit();

  console.log('bye');

})
process.once('SIGTERM', () => bot.stop('SIGTERM'))

console.log(

);

};

app();

