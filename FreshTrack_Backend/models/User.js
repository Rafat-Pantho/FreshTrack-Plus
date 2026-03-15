const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address'
      ]
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false 
    },
    dietaryPreferences: {
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
          'Halal',
          'Kosher',
          'Pescatarian',
          'None'
        ],
        message: '{VALUE} is not a valid dietary preference'
      }
    },
    profileImage: {
      url: {
        type: String,
        default: null 
      },
      publicId: {
        type: String,
        default: null 
      }
    }
  },
  {
    timestamps: true, 
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

userSchema.index({ email: 1 });

userSchema.virtual('nutritionLogs', {
  ref: 'DailyNutritionLog',
  localField: '_id',
  foreignField: 'user'
});

userSchema.pre('save', function (next) {

  next();
});

userSchema.methods.hasProfileImage = function () {
  return this.profileImage && this.profileImage.url !== null;
};

userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

const User = mongoose.model('User', userSchema);

module.exports = User;
