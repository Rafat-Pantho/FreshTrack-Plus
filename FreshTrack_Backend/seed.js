const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const NutritionInfo = require('./models/NutritionInfo');
const GroceryItem = require('./models/GroceryItem');
const Meal = require('./models/Meal');
const WasteLog = require('./models/WasteLog');
const DailyNutritionLog = require('./models/DailyNutritionLog');

const daysFromNow = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

const daysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

const sampleUser = {
  name: 'FreshUser',
  email: 'freshuser@freshtrack.com',
  password: 'hashedpassword123', 
  dietaryPreferences: ['Vegetarian', 'Gluten-Free'],
  profileImage: {
    url: null,
    publicId: null
  }
};

const sampleNutritionInfo = [
  {

    calories: 206,
    macronutrients: { protein: 4.3, carbs: 45, fats: 0.4 },
    micronutrients: { vitaminC: 0, iron: 0.8 }
  },
  {

    calories: 144,
    macronutrients: { protein: 17, carbs: 3, fats: 9 },
    micronutrients: { vitaminC: 0, iron: 2.7 }
  },
  {

    calories: 23,
    macronutrients: { protein: 2.9, carbs: 3.6, fats: 0.4 },
    micronutrients: { vitaminC: 28, iron: 2.7 }
  },
  {

    calories: 95,
    macronutrients: { protein: 0.5, carbs: 25, fats: 0.3 },
    micronutrients: { vitaminC: 8.4, iron: 0.2 }
  },
  {

    calories: 149,
    macronutrients: { protein: 8, carbs: 12, fats: 8 },
    micronutrients: { vitaminC: 0, iron: 0.1 }
  },
  {

    calories: 155,
    macronutrients: { protein: 13, carbs: 1.1, fats: 11 },
    micronutrients: { vitaminC: 0, iron: 1.8 }
  }
];

const createGroceryItems = (nutritionIds) => [

  {
    name: 'Milk',
    category: 'Dairy',
    quantity: 1,
    unit: 'L',
    purchaseDate: daysAgo(10),
    expiryDate: daysAgo(2), 
    storageLocation: 'Fridge',
    nutritionInfo: nutritionIds[4],
    image: { url: null, publicId: null }
  },
  {
    name: 'Yogurt',
    category: 'Dairy',
    quantity: 2,
    unit: 'pcs',
    purchaseDate: daysAgo(14),
    expiryDate: daysAgo(1), 
    storageLocation: 'Fridge',
    nutritionInfo: nutritionIds[4],
    image: { url: null, publicId: null }
  },
  {
    name: 'Old Spinach',
    category: 'Vegetable',
    quantity: 1,
    unit: 'pack',
    purchaseDate: daysAgo(7),
    expiryDate: daysAgo(3), 
    storageLocation: 'Fridge',
    nutritionInfo: nutritionIds[2],
    image: { url: null, publicId: null }
  },

  {
    name: 'Tofu',
    category: 'Other',
    quantity: 2,
    unit: 'pack',
    purchaseDate: daysAgo(5),
    expiryDate: daysFromNow(1), 
    storageLocation: 'Fridge',
    nutritionInfo: nutritionIds[1],
    image: { url: null, publicId: null }
  },
  {
    name: 'Fresh Spinach',
    category: 'Vegetable',
    quantity: 1,
    unit: 'pack',
    purchaseDate: daysAgo(2),
    expiryDate: daysFromNow(2), 
    storageLocation: 'Fridge',
    nutritionInfo: nutritionIds[2],
    image: { url: null, publicId: null }
  },
  {
    name: 'Cottage Cheese',
    category: 'Dairy',
    quantity: 1,
    unit: 'pack',
    purchaseDate: daysAgo(4),
    expiryDate: daysFromNow(3), 
    storageLocation: 'Fridge',
    nutritionInfo: nutritionIds[4],
    image: { url: null, publicId: null }
  },
  {
    name: 'Ripe Bananas',
    category: 'Fruit',
    quantity: 5,
    unit: 'pcs',
    purchaseDate: daysAgo(3),
    expiryDate: daysFromNow(1), 
    storageLocation: 'Counter',
    nutritionInfo: nutritionIds[3],
    image: { url: null, publicId: null }
  },

  {
    name: 'Rice',
    category: 'Grains',
    quantity: 2,
    unit: 'kg',
    purchaseDate: daysAgo(7),
    expiryDate: daysFromNow(180), 
    storageLocation: 'Pantry',
    nutritionInfo: nutritionIds[0],
    image: { url: null, publicId: null }
  },
  {
    name: 'Apples',
    category: 'Fruit',
    quantity: 6,
    unit: 'pcs',
    purchaseDate: daysAgo(1),
    expiryDate: daysFromNow(14), 
    storageLocation: 'Fridge',
    nutritionInfo: nutritionIds[3],
    image: { url: null, publicId: null }
  },
  {
    name: 'Carrots',
    category: 'Vegetable',
    quantity: 500,
    unit: 'g',
    purchaseDate: daysAgo(2),
    expiryDate: daysFromNow(21), 
    storageLocation: 'Fridge',
    nutritionInfo: nutritionIds[2],
    image: { url: null, publicId: null }
  },
  {
    name: 'Eggs',
    category: 'Dairy',
    quantity: 12,
    unit: 'pcs',
    purchaseDate: daysAgo(3),
    expiryDate: daysFromNow(25), 
    storageLocation: 'Fridge',
    nutritionInfo: nutritionIds[5],
    image: { url: null, publicId: null }
  },
  {
    name: 'Quinoa',
    category: 'Grains',
    quantity: 1,
    unit: 'kg',
    purchaseDate: daysAgo(5),
    expiryDate: daysFromNow(365), 
    storageLocation: 'Pantry',
    nutritionInfo: nutritionIds[0],
    image: { url: null, publicId: null }
  },
  {
    name: 'Almond Milk',
    category: 'Beverages',
    quantity: 1,
    unit: 'L',
    purchaseDate: daysAgo(1),
    expiryDate: daysFromNow(30), 
    storageLocation: 'Fridge',
    nutritionInfo: nutritionIds[4],
    image: { url: null, publicId: null }
  },
  {
    name: 'Bell Peppers',
    category: 'Vegetable',
    quantity: 3,
    unit: 'pcs',
    purchaseDate: daysAgo(1),
    expiryDate: daysFromNow(10), 
    storageLocation: 'Fridge',
    nutritionInfo: nutritionIds[2],
    image: { url: null, publicId: null }
  },
  {
    name: 'Oranges',
    category: 'Fruit',
    quantity: 4,
    unit: 'pcs',
    purchaseDate: new Date(),
    expiryDate: daysFromNow(7), 
    storageLocation: 'Counter',
    nutritionInfo: nutritionIds[3],
    image: { url: null, publicId: null }
  }
];

const createWasteLogs = (groceryItemIds) => [
  {
    item: groceryItemIds[0], 
    reason: 'Expired',
    quantity: 1,
    dateLogged: new Date(),
    notes: 'Forgot to use before expiry'
  },
  {
    item: groceryItemIds[2], 
    reason: 'Spoiled',
    quantity: 1,
    dateLogged: daysAgo(1),
    notes: 'Leaves turned yellow'
  }
];

const seedDatabase = async () => {
  try {

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n🗑️  Clearing existing data...');
    await User.deleteMany({});
    console.log('   - Users cleared');
    await NutritionInfo.deleteMany({});
    console.log('   - NutritionInfos cleared');
    await GroceryItem.deleteMany({});
    console.log('   - GroceryItems cleared');
    await Meal.deleteMany({});
    console.log('   - Meals cleared');
    await WasteLog.deleteMany({});
    console.log('   - WasteLogs cleared');
    await DailyNutritionLog.deleteMany({});
    console.log('   - DailyNutritionLogs cleared');

    console.log('\n👤 Creating user...');
    const user = await User.create(sampleUser);
    console.log(`   - Created user: ${user.name} (${user.email})`);

    console.log('\n🥗 Creating nutrition info records...');
    const nutritionDocs = await NutritionInfo.insertMany(sampleNutritionInfo);
    console.log(`   - Created ${nutritionDocs.length} nutrition records`);
    const nutritionIds = nutritionDocs.map(doc => doc._id);

    console.log('\n🛒 Creating grocery items...');
    const groceryItems = createGroceryItems(nutritionIds);
    const groceryDocs = await GroceryItem.insertMany(groceryItems);
    console.log(`   - Created ${groceryDocs.length} grocery items`);

    const now = new Date();
    const threeDaysFromNow = daysFromNow(3);
    const expired = groceryDocs.filter(item => item.expiryDate < now).length;
    const highRisk = groceryDocs.filter(item => 
      item.expiryDate >= now && item.expiryDate <= threeDaysFromNow
    ).length;
    const safe = groceryDocs.filter(item => item.expiryDate > threeDaysFromNow).length;

    console.log(`   - Expired: ${expired} items`);
    console.log(`   - High Risk (≤3 days): ${highRisk} items`);
    console.log(`   - Safe: ${safe} items`);

    console.log('\n📋 Creating waste logs...');
    const groceryIds = groceryDocs.map(doc => doc._id);
    const wasteLogs = createWasteLogs(groceryIds);
    const wasteLogDocs = await WasteLog.insertMany(wasteLogs);
    console.log(`   - Created ${wasteLogDocs.length} waste log entries`);

    console.log('\n' + '═'.repeat(50));
    console.log('📊 SEEDING SUMMARY');
    console.log('═'.repeat(50));
    console.log(`   Users:          ${1}`);
    console.log(`   NutritionInfos: ${nutritionDocs.length}`);
    console.log(`   GroceryItems:   ${groceryDocs.length}`);
    console.log(`   WasteLogs:      ${wasteLogDocs.length}`);
    console.log('═'.repeat(50));

    console.log('\n✅ Data Imported!');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error seeding database:', error.message);
    process.exit(1);
  }
};

seedDatabase();
