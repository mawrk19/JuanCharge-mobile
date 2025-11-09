// API Constants matching backend
export const API_CONSTANTS = {
  // Points constraints
  MIN_POINTS: 10,
  MAX_POINTS_PER_SESSION: 10000,
  
  // Energy conversion
  WATTS_PER_PORT: 10,
  WH_PER_MINUTE: 0.167, // 10W ÷ 60 = 0.167 Wh/min
  
  // CO2 calculation
  CO2_PER_KWH: 0.5, // kg CO2 per kWh
  
  // Kiosk status
  KIOSK_STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    MAINTENANCE: 'maintenance'
  },
  
  // Session status
  SESSION_STATUS: {
    ACTIVE: 'active',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
  },
  
  // Transaction types
  TRANSACTION_TYPES: {
    EARNED: 'earned',
    REDEEMED: 'redeemed',
    BONUS: 'bonus',
    ADJUSTMENT: 'adjustment'
  }
}

// Helper functions for calculations
export const calculateEnergy = (points) => {
  // 1 point = 1 minute = 0.167 Wh
  const minutes = points
  const wh = minutes * API_CONSTANTS.WH_PER_MINUTE
  return {
    minutes,
    wh: parseFloat(wh.toFixed(2)),
    kwh: parseFloat((wh / 1000).toFixed(4))
  }
}

export const calculateCO2Saved = (kWh) => {
  // CO2 saved (kg) = Energy (kWh) × 0.5
  return parseFloat((kWh * API_CONSTANTS.CO2_PER_KWH).toFixed(2))
}

export const formatSessionId = (sessionId) => {
  // Format: SESSION_1705315200_A1B2C3D4
  return sessionId
}

export const validatePointsRange = (points) => {
  return points >= API_CONSTANTS.MIN_POINTS && 
         points <= API_CONSTANTS.MAX_POINTS_PER_SESSION
}

export const formatDuration = (minutes) => {
  if (minutes < 60) {
    return `${minutes} min`
  }
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

export const formatEnergy = (wh) => {
  if (wh < 1000) {
    return `${wh.toFixed(2)} Wh`
  }
  return `${(wh / 1000).toFixed(2)} kWh`
}
