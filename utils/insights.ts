import { Lead } from '../types';

/**
 * Computes median from a number array.
 * Logic: Sort ascending. Odd: middle. Even: avg of middle two (rounded).
 */
export const computeMedian = (values: number[]): number => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  
  if (sorted.length % 2 !== 0) {
    return sorted[mid];
  }
  return Math.round((sorted[mid - 1] + sorted[mid]) / 2);
};

export const computeCompMedian = (lead: Lead): number => {
  const prices = lead.cma.comps.map(c => c.soldPrice);
  return computeMedian(prices);
};

export const getInventoryLabel = (inventoryActive: number): 'tight' | 'moderate' | 'elevated' => {
  if (inventoryActive <= 40) return 'tight';
  if (inventoryActive <= 80) return 'moderate';
  return 'elevated';
};

export const getInventoryTalkingPoint = (inventoryActive: number, town?: string): string => {
  const label = getInventoryLabel(inventoryActive);
  const location = town ? `in ${town}` : 'this area';
  
  let descriptor = '';
  if (label === 'tight') {
    descriptor = inventoryActive <= 25 ? 'exceptionally tight' : 'tight';
    return `Supply is ${descriptor} with only ${inventoryActive} active listings, meaning buyers have fewer options ${location}.`;
  }
  
  if (label === 'moderate') {
    return `Supply is moderate with ${inventoryActive} active listings, providing a balanced environment for motivated buyers ${location}.`;
  }
  
  return `Supply is elevated with ${inventoryActive} active listings, increasing the competition for attention among local sellers ${location}.`;
};

/**
 * Validation checks (Dev context):
 * inventoryActive = 47 -> label = "moderate" (Correct: 47 > 40 && 47 <= 80)
 * even number of comps [10, 20] -> median = 15 (Correct: (10+20)/2)
 */
