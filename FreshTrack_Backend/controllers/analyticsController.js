const GroceryItem = require('../models/GroceryItem');
const WasteLog = require('../models/WasteLog');

const getWasteRiskAnalysis = async (req, res) => {
  try {

    const groceryItems = await GroceryItem.find()
      .populate('nutritionInfo')
      .sort({ expiryDate: 1 });

    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); 

    const threeDaysFromNow = new Date(currentDate);
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    const categorizedItems = {
      expired: [],
      highRisk: [], 
      safe: []
    };

    const summary = {
      totalItems: groceryItems.length,
      expiredCount: 0,
      highRiskCount: 0,
      safeCount: 0,
      totalExpiredValue: 0,
      totalAtRiskValue: 0
    };

    groceryItems.forEach((item) => {
      const expiryDate = new Date(item.expiryDate);
      expiryDate.setHours(0, 0, 0, 0);

      const timeDiff = expiryDate - currentDate;
      const daysUntilExpiry = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

      const itemData = {
        _id: item._id,
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit,
        purchaseDate: item.purchaseDate,
        expiryDate: item.expiryDate,
        storageLocation: item.storageLocation,
        daysUntilExpiry: daysUntilExpiry,
        nutritionInfo: item.nutritionInfo,
        image: item.image
      };

      if (expiryDate < currentDate) {

        itemData.status = 'Expired';
        itemData.recommendation = 'Dispose immediately. Consider logging as waste.';
        itemData.alertLevel = 'critical';
        categorizedItems.expired.push(itemData);
        summary.expiredCount++;
      } else if (expiryDate <= threeDaysFromNow) {

        itemData.status = 'High Risk';
        itemData.recommendation = 'Use immediately or donate to food bank.';
        itemData.alertLevel = 'warning';
        itemData.donationEligible = true;
        categorizedItems.highRisk.push(itemData);
        summary.highRiskCount++;
      } else {

        itemData.status = 'Safe';
        itemData.recommendation = 'Item is fresh. Plan usage accordingly.';
        itemData.alertLevel = 'safe';
        categorizedItems.safe.push(itemData);
        summary.safeCount++;
      }
    });

    const insights = generateInsights(categorizedItems, summary);

    res.status(200).json({
      success: true,
      message: 'Waste risk analysis completed',
      data: {
        summary,
        categorizedItems,
        insights,
        analyzedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error in getWasteRiskAnalysis:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze waste risk',
      error: error.message
    });
  }
};

const generateInsights = (categorizedItems, summary) => {
  const insights = [];

  if (summary.expiredCount > 0) {
    insights.push({
      type: 'critical',
      title: 'Expired Items Alert',
      message: `You have ${summary.expiredCount} expired item(s) that should be disposed of immediately.`,
      action: 'Log these items as waste to track your waste patterns.'
    });
  }

  if (summary.highRiskCount > 0) {
    insights.push({
      type: 'warning',
      title: 'Items Expiring Soon',
      message: `${summary.highRiskCount} item(s) will expire within 3 days.`,
      action: 'Consider using these items in your next meal or donating to a local food bank.'
    });

    const donationItems = categorizedItems.highRisk
      .filter(item => item.donationEligible)
      .map(item => item.name);

    if (donationItems.length > 0) {
      insights.push({
        type: 'suggestion',
        title: 'Donation Recommendation',
        message: `Consider donating: ${donationItems.join(', ')}`,
        action: 'Find local food banks or community fridges nearby.'
      });
    }
  }

  const expiredByCategory = {};
  categorizedItems.expired.forEach(item => {
    expiredByCategory[item.category] = (expiredByCategory[item.category] || 0) + 1;
  });

  const mostWastedCategory = Object.entries(expiredByCategory)
    .sort(([, a], [, b]) => b - a)[0];

  if (mostWastedCategory) {
    insights.push({
      type: 'pattern',
      title: 'Waste Pattern Detected',
      message: `${mostWastedCategory[0]} items are most frequently expiring.`,
      action: 'Consider buying smaller quantities or checking storage conditions.'
    });
  }

  if (summary.expiredCount === 0 && summary.highRiskCount === 0 && summary.totalItems > 0) {
    insights.push({
      type: 'success',
      title: 'Great Job!',
      message: 'All your groceries are fresh with no immediate expiration concerns.',
      action: 'Keep tracking your inventory to maintain this streak!'
    });
  }

  return insights;
};

const getWasteStatistics = async (req, res) => {
  try {
    const { startDate, endDate, period = '30' } = req.query;

    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate 
      ? new Date(startDate) 
      : new Date(end.getTime() - parseInt(period) * 24 * 60 * 60 * 1000);

    const wasteLogs = await WasteLog.findByDateRange(start, end);

    const statsByReason = await WasteLog.getStatsByReason();

    const mostWastedItems = await WasteLog.getMostWastedItems(5);

    const totalWaste = await WasteLog.getTotalWaste(start, end);

    const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) || 1;
    const dailyAverage = totalWaste[0] 
      ? (totalWaste[0].totalQuantity / daysDiff).toFixed(2) 
      : 0;

    res.status(200).json({
      success: true,
      message: 'Waste statistics retrieved successfully',
      data: {
        period: {
          start: start.toISOString(),
          end: end.toISOString(),
          days: daysDiff
        },
        totals: totalWaste[0] || { totalQuantity: 0, totalItems: 0 },
        dailyAverage: parseFloat(dailyAverage),
        byReason: statsByReason,
        mostWastedItems,
        recentLogs: wasteLogs.slice(0, 10)
      }
    });
  } catch (error) {
    console.error('Error in getWasteStatistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve waste statistics',
      error: error.message
    });
  }
};

const getInventoryHealth = async (req, res) => {
  try {
    const totalItems = await GroceryItem.countDocuments();
    const expiredItems = await GroceryItem.countDocuments({
      expiryDate: { $lt: new Date() }
    });

    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    const atRiskItems = await GroceryItem.countDocuments({
      expiryDate: { $gte: new Date(), $lte: threeDaysFromNow }
    });

    let healthScore = 100;
    if (totalItems > 0) {
      const expiredPenalty = (expiredItems / totalItems) * 40;
      const atRiskPenalty = (atRiskItems / totalItems) * 20;
      healthScore = Math.max(0, Math.round(100 - expiredPenalty - atRiskPenalty));
    }

    let status;
    if (healthScore >= 80) status = 'Excellent';
    else if (healthScore >= 60) status = 'Good';
    else if (healthScore >= 40) status = 'Fair';
    else if (healthScore >= 20) status = 'Poor';
    else status = 'Critical';

    res.status(200).json({
      success: true,
      data: {
        healthScore,
        status,
        breakdown: {
          totalItems,
          expiredItems,
          atRiskItems,
          freshItems: totalItems - expiredItems - atRiskItems
        },
        recommendations: getHealthRecommendations(healthScore, expiredItems, atRiskItems)
      }
    });
  } catch (error) {
    console.error('Error in getInventoryHealth:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate inventory health',
      error: error.message
    });
  }
};

const getHealthRecommendations = (score, expired, atRisk) => {
  const recommendations = [];

  if (expired > 0) {
    recommendations.push('Remove expired items and log them as waste for tracking.');
  }
  if (atRisk > 0) {
    recommendations.push('Plan meals using at-risk items to prevent waste.');
  }
  if (score < 60) {
    recommendations.push('Consider buying smaller quantities more frequently.');
  }
  if (score >= 80) {
    recommendations.push('Great inventory management! Keep up the good work.');
  }

  return recommendations;
};

module.exports = {
  getWasteRiskAnalysis,
  getWasteStatistics,
  getInventoryHealth
};
