const mongoose = require('mongoose');

const dailyNutritionLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required']
    },
    date: {
      type: Date,
      default: () => {

        const now = new Date();
        now.setHours(0, 0, 0, 0);
        return now;
      }
    },
    meals: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Meal'
        }
      ],
      default: []
    },
    totalCalories: {
      type: Number,
      min: [0, 'Total calories cannot be negative'],
      default: 0
    },
    totalMacros: {
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
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

dailyNutritionLogSchema.index({ user: 1, date: 1 }, { unique: true });
dailyNutritionLogSchema.index({ date: -1 });

dailyNutritionLogSchema.virtual('mealCount').get(function () {
  return this.meals.length;
});

dailyNutritionLogSchema.virtual('calculatedCalories').get(function () {
  const macros = this.totalMacros;
  return (macros.protein * 4) + (macros.carbs * 4) + (macros.fats * 9);
});

dailyNutritionLogSchema.statics.findOrCreateForDate = async function (userId, date = new Date()) {

  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);

  let log = await this.findOne({ user: userId, date: normalizedDate });

  if (!log) {
    log = await this.create({ user: userId, date: normalizedDate });
  }

  return log;
};

dailyNutritionLogSchema.statics.findByUserAndDateRange = function (userId, startDate, endDate) {
  return this.find({
    user: userId,
    date: {
      $gte: startDate,
      $lte: endDate
    }
  })
    .populate('meals')
    .sort({ date: -1 });
};

dailyNutritionLogSchema.statics.getWeeklySummary = function (userId, weekStartDate) {
  const weekEndDate = new Date(weekStartDate);
  weekEndDate.setDate(weekEndDate.getDate() + 7);

  return this.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        date: {
          $gte: weekStartDate,
          $lt: weekEndDate
        }
      }
    },
    {
      $group: {
        _id: null,
        avgCalories: { $avg: '$totalCalories' },
        totalCalories: { $sum: '$totalCalories' },
        avgProtein: { $avg: '$totalMacros.protein' },
        avgCarbs: { $avg: '$totalMacros.carbs' },
        avgFats: { $avg: '$totalMacros.fats' },
        daysLogged: { $sum: 1 }
      }
    }
  ]);
};

dailyNutritionLogSchema.methods.addMeal = async function (mealId) {
  if (!this.meals.includes(mealId)) {
    this.meals.push(mealId);
    await this.save();
  }
  return this;
};

dailyNutritionLogSchema.methods.removeMeal = async function (mealId) {
  this.meals = this.meals.filter(id => id.toString() !== mealId.toString());
  await this.save();
  return this;
};

dailyNutritionLogSchema.methods.recalculateTotals = async function () {
  await this.populate('meals');

  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFats = 0;

  for (const meal of this.meals) {
    totalCalories += meal.estimatedCalories || 0;

  }

  this.totalCalories = totalCalories;

  await this.save();
  return this;
};

const DailyNutritionLog = mongoose.model('DailyNutritionLog', dailyNutritionLogSchema);

module.exports = DailyNutritionLog;
