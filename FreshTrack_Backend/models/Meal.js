const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GroceryItem',
      required: [true, 'Grocery item reference is required']
    },
    quantityUsed: {
      type: Number,
      required: [true, 'Quantity used is required'],
      min: [0, 'Quantity used cannot be negative']
    }
  },
  { _id: false } 
);

const mealSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      maxlength: [200, 'Meal name cannot exceed 200 characters']
    },
    type: {
      type: String,
      enum: {
        values: ['Breakfast', 'Lunch', 'Dinner', 'Snack'],
        message: '{VALUE} is not a valid meal type. Must be Breakfast, Lunch, Dinner, or Snack'
      },
      required: [true, 'Meal type is required']
    },
    ingredients: {
      type: [ingredientSchema],
      default: [],
      validate: {
        validator: function (ingredients) {

          const itemIds = ingredients.map(ing => ing.item.toString());
          return itemIds.length === new Set(itemIds).size;
        },
        message: 'Duplicate grocery items are not allowed in ingredients'
      }
    },
    estimatedCalories: {
      type: Number,
      min: [0, 'Estimated calories cannot be negative'],
      default: 0
    },
    dietaryTags: {
      type: [String],
      default: [],
      enum: {
        values: [
          'Vegan',
          'Vegetarian',
          'Gluten-Free',
          'Dairy-Free',
          'Nut-Free',
          'Keto',
          'Paleo',
          'Low-Carb',
          'Low-Fat',
          'High-Protein',
          'Quick',
          'Budget-Friendly'
        ],
        message: '{VALUE} is not a valid dietary tag'
      }
    },
    recipeInstructions: {
      type: String,
      trim: true,
      maxlength: [5000, 'Recipe instructions cannot exceed 5000 characters']
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

mealSchema.index({ type: 1 });
mealSchema.index({ dietaryTags: 1 });
mealSchema.index({ name: 'text' });

mealSchema.virtual('ingredientCount').get(function () {
  return this.ingredients.length;
});

mealSchema.statics.findByType = function (type) {
  return this.find({ type }).populate('ingredients.item');
};

mealSchema.statics.findByDietaryTag = function (tag) {
  return this.find({ dietaryTags: tag }).populate('ingredients.item');
};

mealSchema.statics.findByGroceryItem = function (groceryItemId) {
  return this.find({ 'ingredients.item': groceryItemId }).populate('ingredients.item');
};

mealSchema.methods.getTotalQuantityUsed = function () {
  return this.ingredients.reduce((total, ing) => total + ing.quantityUsed, 0);
};

mealSchema.pre('save', function (next) {
  if (!this.name) {
    const date = new Date().toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
    this.name = `${this.type} - ${date}`;
  }
  next();
});

const Meal = mongoose.model('Meal', mealSchema);

module.exports = Meal;
