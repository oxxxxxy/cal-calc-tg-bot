const commandNameCodes = require(`../../../codes/commandNameCodes.js`);
const invalidCauseCodes = require(`../../../codes/invalidCauseCodes.js`);

const {getRE_BJUK_LIST} = require(`./RE_BJUK_LISTMaking.js`);

const {
	getFoodCreationLimitationMessage
	,getFoodNameLengthRequiredCriterionMessage
} = require(`../../../../reply/main/message/createFood.js`);


const handleCreateFoodCommand = async (fns, re_result, userInfo) => {

	const foodName = re_result[1].slice(0, 128).replaceAll(/\s+/g, ` `).replaceAll(/['"\\]/g, ``).trim();
	const foodNutrientString = re_result[2].toLowerCase();


	const limit_count_of_user_created_fidi = 100;
	if (!userInfo.privilege_type && userInfo.limit_count_of_user_created_fidi >= limit_count_of_user_created_fidi) {
		const invalidReply = getFoodCreationLimitationMessage(userInfo.s__lang_code, limit_count_of_user_created_fidi);

		await fns.completeInvalidMessageCommandHandling(invalidReply, commandNameCodes.CREATE_FOOD, invalidCauseCodes.DAY_FOOD_DISH_CREATION_LIMIT);
		return;
	}

	
	if (foodName.length < 4) {
		const invalidReply = getFoodNameLengthRequiredCriterionMessage(userInfo.s__lang_code);

		await completeInvalidMessageCommandHandling(invalidReply, commandNameCodes.CREATE_FOOD, invalidCauseCodes.FOOD_DISH_NAME_LESS_THAN_4_CHARS);
		return;
	}



	
};
exports.handleCreateFoodCommand = handleCreateFoodCommand;
