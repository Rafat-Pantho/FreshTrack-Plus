const mongoose = require('mongoose');

const wasteLogSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GroceryItem',
      required: [true, 'Grocery item reference is required']
    },
    reason: {
      type: String,
      required: [true, 'Reason for waste is required'],
      trim: true,
      enum: {
        values: [
          'Expired',
          'Spoiled',
          'Moldy',
          'Damaged',
          'Overcooked',
          'Leftovers',
          'Taste/Quality',
          'Forgot About It',
          'Bought Too Much',
          'Other'
        ],
        message: '{VALUE} is not a valid waste reason'
      }
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity wasted is required'],
      min: [0.01, 'Quantity must be greater than 0']
    },
    dateLogged: {
      type: Date,
      default: Date.now
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters']
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

wasteLogSchema.index({ dateLogged: -1 });
wasteLogSchema.index({ reason: 1 });
wasteLogSchema.index({ item: 1 });

wasteLogSchema.statics.findByDateRange = function (startDate, endDate) {
  return this.find({
    dateLogged: {
      $gte: startDate,
      $lte: endDate
    }
  })
    .populate('item')
    .sort({ dateLogged: -1 });
};

wasteLogSchema.statics.getStatsByReason = function () {
  return this.aggregate([
    {
      $group: {
        _id: '$reason',
        totalQuantity: { $sum: '$quantity' },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { totalQuantity: -1 }
    }
  ]);
};

wasteLogSchema.statics.getTotalWaste = function (startDate, endDate) {
  const query = {};
  if (startDate && endDate) {
    query.dateLogged = { $gte: startDate, $lte: endDate };
  }

  return this.aggregate([
    { $match: query },
    {
      $group: {
        _id: null,
        totalQuantity: { $sum: '$quantity' },
        totalItems: { $sum: 1 }
      }
    }
  ]);
};

wasteLogSchema.statics.getMostWastedItems = function (limit = 10) {
  return this.aggregate([
    {
      $group: {
        _id: '$item',
        totalWasted: { $sum: '$quantity' },
        wasteCount: { $sum: 1 }
      }
    },
    { $sort: { totalWasted: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'groceryitems',
        localField: '_id',
        foreignField: '_id',
        as: 'itemDetails'
      }
    },
    { $unwind: '$itemDetails' }
  ]);
};

const WasteLog = mongoose.model('WasteLog', wasteLogSchema);

module.exports = WasteLog;
