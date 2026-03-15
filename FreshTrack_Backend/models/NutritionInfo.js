const mongoose = require('mongoose');

const nutritionInfoSchema = new mongoose.Schema(
  {
    calories: {
      type: Number,
      min: [0, 'Calories cannot be negative'],
      default: 0
    },
    macronutrients: {
      protein: {
        type: Number,
        min: [0, 'Protein cannot be negative'],
        default: 0
      },
      carbs: {
        type: Number,
        min: [0, 'Carbs cannot be negative'],
        default: 0
      },
      fats: {
        type: Number,
        min: [0, 'Fats cannot be negative'],
        default: 0
      }
    },
    micronutrients: {
      vitaminC: {
        type: Number,
        min: [0, 'Vitamin C cannot be negative'],
        default: 0
      },
      iron: {
        type: Number,
        min: [0, 'Iron cannot be negative'],
        default: 0
      }
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

nutritionInfoSchema.virtual('totalMacros').get(function () {
  const macros = this.macronutrients;
  return macros.protein + macros.carbs + macros.fats;
});

nutritionInfoSchema.methods.calculateCaloriesFromMacros = function () {
  const macros = this.macronutrients;
  return (macros.protein * 4) + (macros.carbs * 4) + (macros.fats * 9);
};

nutritionInfoSchema.statics.createWithCalculatedCalories = async function (data) {
  const nutritionInfo = new this(data);
  if (!data.calories || data.calories === 0) {
    nutritionInfo.calories = nutritionInfo.calculateCaloriesFromMacros();
  }
  return nutritionInfo.save();
};

const NutritionInfo = mongoose.model('NutritionInfo', nutritionInfoSchema);

module.exports = NutritionInfo;
