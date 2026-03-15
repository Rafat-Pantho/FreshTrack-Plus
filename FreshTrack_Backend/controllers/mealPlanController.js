const GroceryItem = require('../models/GroceryItem');
const Meal = require('../models/Meal');
const NutritionInfo = require('../models/NutritionInfo');

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
const CALORIE_DISTRIBUTION = {
  Breakfast: 0.25, 
  Lunch: 0.35,     
  Dinner: 0.30,    
  Snack: 0.10      
};

const MEAL_CATEGORY_PREFERENCES = {
  Breakfast: ['Dairy', 'Bakery', 'Fruit', 'Grains'],
  Lunch: ['Vegetable', 'Meat', 'Grains', 'Dairy'],
  Dinner: ['Meat', 'Seafood', 'Vegetable', 'Grains'],
  Snack: ['Fruit', 'Snacks', 'Dairy', 'Bakery']
};

const DIETARY_EXCLUSIONS = {
  'Vegan': ['Meat', 'Seafood', 'Dairy'],
  'Vegetarian': ['Meat', 'Seafood'],
  'Dairy-Free': ['Dairy'],
  'Gluten-Free': ['Bakery', 'Grains'], 
  'Pescatarian': ['Meat'],
  'Keto': ['Grains', 'Bakery', 'Fruit'],
  'Paleo': ['Dairy', 'Grains']
};

const calculateBMR = (weight, height, age, gender) => {

  const baseBMR = (10 * weight) + (6.25 * height) - (5 * age);

  if (gender.toLowerCase() === 'male') {
    return baseBMR + 5;
  } else {
    return baseBMR - 161;
  }
};

const calculateTDEE = (bmr, activityLevel) => {

  const clampedActivity = Math.min(1.9, Math.max(1.2, activityLevel));
  return Math.round(bmr * clampedActivity);
};

const getAllowedCategories = (dietaryPreferences, mealType) => {
  const preferredCategories = [...MEAL_CATEGORY_PREFERENCES[mealType]];
  const excludedCategories = new Set();

  dietaryPreferences.forEach(pref => {
    const exclusions = DIETARY_EXCLUSIONS[pref] || [];
    exclusions.forEach(cat => excludedCategories.add(cat));
  });

  return preferredCategories.filter(cat => !excludedCategories.has(cat));
};

const estimateItemCalories = async (item) => {

  if (item.nutritionInfo) {
    const nutrition = await NutritionInfo.findById(item.nutritionInfo);
    if (nutrition) {
      return nutrition.calories;
    }
  }

  const categoryCalories = {
    'Dairy': 120,
    'Vegetable': 50,
    'Fruit': 80,
    'Meat': 200,
    'Seafood': 150,
    'Bakery': 250,
    'Beverages': 100,
    'Snacks': 150,
    'Frozen': 180,
    'Canned': 120,
    'Condiments': 30,
    'Grains': 200,
    'Spices': 5,
    'Other': 100
  };

  return categoryCalories[item.category] || 100;
};

const findAvailableIngredients = async (mealType, dietaryPreferences, targetCalories) => {
  const allowedCategories = getAllowedCategories(dietaryPreferences, mealType);

  if (!allowedCategories.includes('Other')) {
    allowedCategories.push('Other');
  }

  const currentDate = new Date();
  const items = await GroceryItem.find({
    category: { $in: allowedCategories },
    expiryDate: { $gte: currentDate },
    quantity: { $gt: 0 }
  }).populate('nutritionInfo');

  const itemsWithCalories = await Promise.all(
    items.map(async (item) => {
      const calories = await estimateItemCalories(item);
      return {
        item,
        calories,
        caloriesPerUnit: calories / (item.quantity || 1)
      };
    })
  );

  return itemsWithCalories.sort((a, b) => 
    new Date(a.item.expiryDate) - new Date(b.item.expiryDate)
  );
};

const selectIngredients = (availableItems, targetCalories, tolerance = 0.1) => {
  const selectedIngredients = [];
  let currentCalories = 0;
  const minCalories = targetCalories * (1 - tolerance);
  const maxCalories = targetCalories * (1 + tolerance);

  for (const { item, calories } of availableItems) {
    if (currentCalories >= maxCalories) break;

    const remainingCalories = targetCalories - currentCalories;
    const portionNeeded = Math.min(
      item.quantity,
      Math.ceil(remainingCalories / (calories / item.quantity))
    );

    if (portionNeeded > 0 && currentCalories + calories <= maxCalories * 1.2) {
      selectedIngredients.push({
        item: item._id,
        itemDetails: {
          name: item.name,
          category: item.category,
          expiryDate: item.expiryDate
        },
        quantityUsed: Math.min(portionNeeded, item.quantity),
        caloriesContributed: Math.round((calories / item.quantity) * Math.min(portionNeeded, item.quantity))
      });
      currentCalories += (calories / item.quantity) * Math.min(portionNeeded, item.quantity);
    }
  }

  return {
    ingredients: selectedIngredients,
    totalCalories: Math.round(currentCalories),
    withinTarget: currentCalories >= minCalories && currentCalories <= maxCalories
  };
};

const generateDailyPlan = async (
  targetCalories,
  currentMealTypeIndex,
  accumulatedMeals,
  dietaryPreferences,
  originalTDEE
) => {

  if (currentMealTypeIndex >= MEAL_TYPES.length) {
    const totalCalories = accumulatedMeals.reduce((sum, meal) => sum + meal.estimatedCalories, 0);
    const tolerance = 0.10; 
    const minAcceptable = originalTDEE * (1 - tolerance);
    const maxAcceptable = originalTDEE * (1 + tolerance);

    return {
      success: totalCalories >= minAcceptable && totalCalories <= maxAcceptable,
      meals: accumulatedMeals,
      totalCalories,
      targetCalories: originalTDEE,
      withinTolerance: totalCalories >= minAcceptable && totalCalories <= maxAcceptable,
      variance: ((totalCalories - originalTDEE) / originalTDEE * 100).toFixed(1)
    };
  }

  const mealType = MEAL_TYPES[currentMealTypeIndex];

  const mealTargetCalories = Math.round(originalTDEE * CALORIE_DISTRIBUTION[mealType]);

  const availableIngredients = await findAvailableIngredients(
    mealType,
    dietaryPreferences,
    mealTargetCalories
  );

  const selection = selectIngredients(availableIngredients, mealTargetCalories);

  const meal = {
    name: `${mealType} - Auto Generated`,
    type: mealType,
    ingredients: selection.ingredients,
    estimatedCalories: selection.totalCalories,
    dietaryTags: dietaryPreferences.filter(p => 
      ['Vegan', 'Vegetarian', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Paleo'].includes(p)
    ),
    recipeInstructions: generateRecipeInstructions(mealType, selection.ingredients),
    targetCalories: mealTargetCalories,
    calorieMatch: selection.withinTarget
  };

  const updatedMeals = [...accumulatedMeals, meal];

  const remainingCalories = targetCalories - selection.totalCalories;

  return generateDailyPlan(
    remainingCalories,
    currentMealTypeIndex + 1,
    updatedMeals,
    dietaryPreferences,
    originalTDEE
  );
};

const generateRecipeInstructions = (mealType, ingredients) => {
  if (ingredients.length === 0) {
    return 'No specific recipe available. Consider adding more items to your inventory.';
  }

  const ingredientNames = ingredients.map(ing => ing.itemDetails.name).join(', ');

  const templates = {
    Breakfast: `Start your day with ${ingredientNames}. Prepare and combine ingredients for a nutritious breakfast.`,
    Lunch: `For lunch, use ${ingredientNames}. Cook or prepare as preferred for a balanced midday meal.`,
    Dinner: `Prepare dinner using ${ingredientNames}. Season to taste and cook until done.`,
    Snack: `Enjoy ${ingredientNames} as a healthy snack between meals.`
  };

  return templates[mealType] || `Combine ${ingredientNames} and prepare according to preference.`;
};

const generateMealPlan = async (req, res) => {
  try {
    const {
      weight,
      height,
      age,
      gender,
      activityLevel,
      dietaryPreferences = []
    } = req.body;

    if (!weight || !height || !age || !gender) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        required: ['weight (kg)', 'height (cm)', 'age', 'gender']
      });
    }

    if (weight < 30 || weight > 300) {
      return res.status(400).json({
        success: false,
        message: 'Weight must be between 30 and 300 kg'
      });
    }

    if (height < 100 || height > 250) {
      return res.status(400).json({
        success: false,
        message: 'Height must be between 100 and 250 cm'
      });
    }

    if (age < 15 || age > 100) {
      return res.status(400).json({
        success: false,
        message: 'Age must be between 15 and 100 years'
      });
    }

    if (!['male', 'female'].includes(gender.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Gender must be "male" or "female"'
      });
    }

    const bmr = calculateBMR(weight, height, age, gender);
    const tdee = calculateTDEE(bmr, activityLevel || 1.4); 

    const mealPlan = await generateDailyPlan(
      tdee,                    
      0,                       
      [],                      
      dietaryPreferences,      
      tdee                     
    );

    const response = {
      success: true,
      message: mealPlan.withinTolerance 
        ? 'Meal plan generated successfully within target range'
        : 'Meal plan generated with closest possible match',
      userProfile: {
        weight: `${weight} kg`,
        height: `${height} cm`,
        age,
        gender,
        activityLevel: activityLevel || 1.4,
        dietaryPreferences
      },
      calorieCalculation: {
        bmr: Math.round(bmr),
        bmrFormula: gender.toLowerCase() === 'male' 
          ? '(10 × weight) + (6.25 × height) - (5 × age) + 5'
          : '(10 × weight) + (6.25 × height) - (5 × age) - 161',
        activityMultiplier: activityLevel || 1.4,
        tdee,
        tdeeBreakdown: {
          breakfast: Math.round(tdee * CALORIE_DISTRIBUTION.Breakfast),
          lunch: Math.round(tdee * CALORIE_DISTRIBUTION.Lunch),
          dinner: Math.round(tdee * CALORIE_DISTRIBUTION.Dinner),
          snack: Math.round(tdee * CALORIE_DISTRIBUTION.Snack)
        }
      },
      mealPlan: {
        date: new Date().toISOString().split('T')[0],
        meals: mealPlan.meals,
        summary: {
          totalCalories: mealPlan.totalCalories,
          targetCalories: mealPlan.targetCalories,
          variancePercent: mealPlan.variance,
          withinTolerance: mealPlan.withinTolerance,
          mealCount: mealPlan.meals.length
        }
      },
      recommendations: generatePlanRecommendations(mealPlan, dietaryPreferences)
    };

    res.status(200).json(response);

  } catch (error) {
    console.error('Error in generateMealPlan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate meal plan',
      error: error.message
    });
  }
};

const generatePlanRecommendations = (mealPlan, dietaryPreferences) => {
  const recommendations = [];

  if (!mealPlan.withinTolerance) {
    recommendations.push({
      type: 'warning',
      message: 'Your meal plan is outside the ±10% calorie target.',
      action: 'Consider adding more variety to your grocery inventory.'
    });
  }

  const emptyMeals = mealPlan.meals.filter(m => m.ingredients.length === 0);
  if (emptyMeals.length > 0) {
    recommendations.push({
      type: 'shopping',
      message: `No suitable ingredients found for: ${emptyMeals.map(m => m.type).join(', ')}`,
      action: 'Add items matching your dietary preferences to your grocery list.'
    });
  }

  const expiringUsed = mealPlan.meals
    .flatMap(m => m.ingredients)
    .filter(ing => {
      const daysUntilExpiry = Math.ceil(
        (new Date(ing.itemDetails?.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)
      );
      return daysUntilExpiry <= 3 && daysUntilExpiry >= 0;
    });

  if (expiringUsed.length > 0) {
    recommendations.push({
      type: 'success',
      message: `Great! Using ${expiringUsed.length} item(s) that are expiring soon.`,
      action: 'This helps reduce food waste!'
    });
  }

  return recommendations;
};

const getAvailableIngredients = async (req, res) => {
  try {
    const { mealType, dietaryPreferences = '' } = req.query;

    const preferences = dietaryPreferences 
      ? dietaryPreferences.split(',').map(p => p.trim())
      : [];

    const type = mealType || 'Lunch';

    const ingredients = await findAvailableIngredients(type, preferences, 500);

    res.status(200).json({
      success: true,
      mealType: type,
      dietaryPreferences: preferences,
      availableCount: ingredients.length,
      ingredients: ingredients.map(({ item, calories }) => ({
        _id: item._id,
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit,
        expiryDate: item.expiryDate,
        daysUntilExpiry: Math.ceil(
          (new Date(item.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)
        ),
        estimatedCalories: calories
      }))
    });
  } catch (error) {
    console.error('Error in getAvailableIngredients:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve available ingredients',
      error: error.message
    });
  }
};

const calculateUserTDEE = async (req, res) => {
  try {
    const { weight, height, age, gender, activityLevel } = req.body;

    if (!weight || !height || !age || !gender) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        required: ['weight (kg)', 'height (cm)', 'age', 'gender']
      });
    }

    const bmr = calculateBMR(weight, height, age, gender);
    const tdee = calculateTDEE(bmr, activityLevel || 1.4);

    const activityDescriptions = {
      1.2: 'Sedentary (little or no exercise)',
      1.375: 'Lightly active (light exercise 1-3 days/week)',
      1.55: 'Moderately active (moderate exercise 3-5 days/week)',
      1.725: 'Very active (hard exercise 6-7 days/week)',
      1.9: 'Extra active (very hard exercise & physical job)'
    };

    res.status(200).json({
      success: true,
      data: {
        bmr: Math.round(bmr),
        tdee,
        activityLevel: activityLevel || 1.4,
        activityDescription: activityDescriptions[activityLevel] || 'Custom activity level',
        breakdown: {
          breakfast: Math.round(tdee * 0.25),
          lunch: Math.round(tdee * 0.35),
          dinner: Math.round(tdee * 0.30),
          snack: Math.round(tdee * 0.10)
        },
        formula: {
          name: 'Mifflin-St Jeor Equation',
          equation: gender.toLowerCase() === 'male'
            ? 'BMR = (10 × weight) + (6.25 × height) - (5 × age) + 5'
            : 'BMR = (10 × weight) + (6.25 × height) - (5 × age) - 161',
          tdeeCalculation: 'TDEE = BMR × Activity Level'
        }
      }
    });
  } catch (error) {
    console.error('Error in calculateUserTDEE:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate TDEE',
      error: error.message
    });
  }
};

module.exports = {
  generateMealPlan,
  getAvailableIngredients,
  calculateUserTDEE
};
