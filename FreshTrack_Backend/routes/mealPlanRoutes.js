const express = require('express');
const router = express.Router();
const {
  generateMealPlan,
  getAvailableIngredients,
  calculateUserTDEE
} = require('../controllers/mealPlanController');

router.post('/generate', generateMealPlan);

router.get('/ingredients', getAvailableIngredients);

router.post('/calculate-tdee', calculateUserTDEE);

module.exports = router;
