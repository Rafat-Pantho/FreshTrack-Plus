const mongoose = require('mongoose');

const groceryItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Grocery item name is required'],
      trim: true,
      minlength: [1, 'Name must be at least 1 character long'],
      maxlength: [200, 'Name cannot exceed 200 characters']
    },
    category: {
      type: String,
      trim: true,
      enum: {
        values: [
          'Dairy',
          'Vegetable',
          'Fruit',
          'Meat',
          'Seafood',
          'Bakery',
          'Beverages',
          'Snacks',
          'Frozen',
          'Canned',
          'Condiments',
          'Grains',
          'Spices',
          'Other'
        ],
        message: '{VALUE} is not a valid category'
      },
      default: 'Other'
    },
    quantity: {
      type: Number,
      min: [0, 'Quantity cannot be negative'],
      default: 1
    },
    unit: {
      type: String,
      trim: true,
      enum: {
        values: ['kg', 'g', 'lb', 'oz', 'L', 'ml', 'pcs', 'dozen', 'pack', 'bottle', 'can', 'box'],
        message: '{VALUE} is not a valid unit'
      },
      default: 'pcs'
    },
    purchaseDate: {
      type: Date,
      default: Date.now
    },
    expiryDate: {
      type: Date,
      required: [true, 'Expiry date is required'],
      validate: {
        validator: function (value) {

          return !this.purchaseDate || value >= this.purchaseDate;
        },
        message: 'Expiry date must be after or equal to purchase date'
      }
    },
    storageLocation: {
      type: String,
      trim: true,
      enum: {
        values: ['Fridge', 'Freezer', 'Pantry', 'Counter', 'Cabinet', 'Other'],
        message: '{VALUE} is not a valid storage location'
      },
      default: 'Pantry'
    },
    image: {
      url: {
        type: String,
        default: null 
      },
      publicId: {
        type: String,
        default: null 
      }
    },
    nutritionInfo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NutritionInfo',
      default: null
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

groceryItemSchema.index({ name: 'text' });
groceryItemSchema.index({ expiryDate: 1 });
groceryItemSchema.index({ category: 1 });
groceryItemSchema.index({ storageLocation: 1 });

groceryItemSchema.virtual('isExpired').get(function () {
  return this.expiryDate < new Date();
});

groceryItemSchema.virtual('daysUntilExpiry').get(function () {
  const now = new Date();
  const expiry = new Date(this.expiryDate);
  const diffTime = expiry - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

groceryItemSchema.statics.findExpiringSoon = function (days = 3) {
  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);

  return this.find({
    expiryDate: {
      $gte: now,
      $lte: futureDate
    }
  }).sort({ expiryDate: 1 });
};

groceryItemSchema.statics.findExpired = function () {
  return this.find({
    expiryDate: { $lt: new Date() }
  }).sort({ expiryDate: 1 });
};

groceryItemSchema.statics.findByCategory = function (category) {
  return this.find({ category }).sort({ expiryDate: 1 });
};

groceryItemSchema.methods.hasImage = function () {
  return this.image && this.image.url !== null;
};

const GroceryItem = mongoose.model('GroceryItem', groceryItemSchema);

module.exports = GroceryItem;
