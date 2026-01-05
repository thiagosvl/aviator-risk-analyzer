
import { StrategyCore } from '../chrome-extension/src/shared/strategyCore';

// User Expected Intervals: 5, 0, 4, 4, 3, 9
// Pinks should be at indices: 
// Arrow 1 (Latest): 0
// Arrow 2: 0 + 5 + 1 = 6
// Arrow 3: 6 + 0 + 1 = 7 (Double Pink)
// Arrow 4: 7 + 4 + 1 = 12
// Arrow 5: 12 + 4 + 1 = 17
// Arrow 6: 17 + 3 + 1 = 21
// Arrow 7: 21 + 9 + 1 = 31

const pinkIndices = [0, 6, 7, 12, 17, 21, 31];
const historyLength = 40;
const values = new Array(historyLength).fill(1.00); // Default BLUE

// Set PINKS
pinkIndices.forEach(idx => {
    values[idx] = 15.00;
});

console.log('--- TEST DATA: Generated History ---');
console.log('Pink Indices:', pinkIndices);
console.log('Values Preview:', values.slice(0, 35));

const result = StrategyCore.analyze(values);

console.log('\n--- ANALYSIS RESULT ---');
console.log('Last Pattern (Interval):', result.pinkIntervals.lastPattern);
console.log('Top Intervals:', result.pinkIntervals.topIntervals);
console.log('Intervals Found:', result.pinkIntervals.intervals); // Assuming we can expose this or deduce it

// Validation
const intervals = result.pinkIntervals.intervals || []; // Need to verify if this is exposed
// If not exposed, we trust TopIntervals

console.log('\n--- EXPECTATION ---');
console.log('Intervals: [5, 0, 4, 4, 3, 9]');
