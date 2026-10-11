/**
 * Calculates kilowatt-hours (kWh) from appliance wattage and usage hours.
 * Formula: kWh = (watts * hours) / 1000
 * Rejects negative, NaN, or non-finite inputs by returning 0.
 */
export function calculateKwh(watts: number, hours: number): number {
  if (
    typeof watts !== 'number' || 
    typeof hours !== 'number' || 
    isNaN(watts) || 
    isNaN(hours) || 
    !isFinite(watts) || 
    !isFinite(hours) || 
    watts < 0 || 
    hours < 0
  ) {
    return 0
  }

  const kwh = (watts * hours) / 1000
  // Round to 4 decimal places to prevent floating-point anomalies
  return Math.round(kwh * 10000) / 10000
}

/**
 * Calculates money saved in rupees based on energy saved and tariff rate.
 * Formula: cost = kWh * tariffPerKwh
 * Rejects negative, NaN, or non-finite inputs by returning 0.
 */
export function calculateCost(kwh: number, tariffPerKwh: number): number {
  if (
    typeof kwh !== 'number' || 
    typeof tariffPerKwh !== 'number' || 
    isNaN(kwh) || 
    isNaN(tariffPerKwh) || 
    !isFinite(kwh) || 
    !isFinite(tariffPerKwh) || 
    kwh < 0 || 
    tariffPerKwh < 0
  ) {
    return 0
  }

  const cost = kwh * tariffPerKwh
  // Round to 2 decimal places for currency
  return Math.round(cost * 100) / 100
}
