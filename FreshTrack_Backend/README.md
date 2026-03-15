# FreshTrack+ Backend

A comprehensive backend API for the FreshTrack+ grocery management system.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **File Upload:** Multer (local storage)

## Project Structure

```
FreshTrack_Backend/
├── config/
│   └── db.js              # MongoDB connection configuration
├── controllers/           # Route controllers (business logic)
├── middleware/
│   └── upload.js          # Multer file upload configuration
├── models/
│   ├── index.js           # Models export index
│   ├── User.js            # User schema
│   ├── NutritionInfo.js   # Nutrition information schema
│   ├── GroceryItem.js     # Grocery item schema
│   ├── Meal.js            # Meal schema
│   ├── WasteLog.js        # Food waste log schema
│   └── DailyNutritionLog.js # Daily nutrition tracking schema
├── routes/                # API route definitions
├── uploads/               # Uploaded files storage
├── .env                   # Environment variables
├── .env.example           # Environment variables template
├── package.json           # Project dependencies
├── README.md              # Project documentation
└── server.js              # Application entry point
```

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file from template:
   ```bash
   cp .env.example .env
   ```

4. Update `.env` with your configuration:
   ```
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/freshtrack
   ```

5. Start the server:
   ```bash
   # Development mode with hot reload
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints (Planned)

### Users
- `POST /api/users` - Register new user
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile
- `DELETE /api/users/:id` - Delete user

### Grocery Items
- `GET /api/grocery-items` - List all items
- `POST /api/grocery-items` - Add new item
- `GET /api/grocery-items/:id` - Get item details
- `PUT /api/grocery-items/:id` - Update item
- `DELETE /api/grocery-items/:id` - Remove item
- `GET /api/grocery-items/expiring` - Get items expiring soon

### Meals
- `GET /api/meals` - List all meals
- `POST /api/meals` - Create new meal
- `GET /api/meals/:id` - Get meal details
- `PUT /api/meals/:id` - Update meal
- `DELETE /api/meals/:id` - Delete meal

### Waste Logs
- `GET /api/waste-logs` - List waste logs
- `POST /api/waste-logs` - Log food waste
- `GET /api/waste-logs/stats` - Get waste statistics

### Daily Nutrition
- `GET /api/daily-nutrition` - Get nutrition logs
- `POST /api/daily-nutrition` - Create/update daily log
- `GET /api/daily-nutrition/summary` - Get weekly summary

## Data Models

### User
- Name, email, password
- Dietary preferences
- Profile image

### GroceryItem
- Name, category, quantity, unit
- Purchase and expiry dates
- Storage location
- Nutrition information reference
- Image

### Meal
- Name, type (Breakfast/Lunch/Dinner/Snack)
- Ingredients with quantities
- Estimated calories
- Dietary tags
- Recipe instructions

### WasteLog
- Item reference
- Reason for waste
- Quantity wasted
- Date logged

### DailyNutritionLog
- User reference
- Date
- Meals consumed
- Total calories and macros

## File Uploads

Images are handled via Multer and stored locally in the `uploads/` directory.

- **Max file size:** 5MB
- **Allowed types:** JPEG, PNG, GIF, WebP
- **File naming:** `{fieldname}-{timestamp}-{random}.{extension}`

## License

ISC
