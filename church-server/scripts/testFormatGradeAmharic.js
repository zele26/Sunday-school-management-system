// church-server/scripts/testFormatGradeAmharic.js
const assert = require('assert');

// Test the logic that was placed in registrationOptions.js
const formatGradeAmharic = (grade, fallback = '—') => {
  if (grade === null || grade === undefined) return fallback;
  const str = String(grade).trim();
  if (!str || str === '—' || str === '-' || str === 'N/A' || str === 'null' || str === 'undefined') return fallback;

  if (str.includes('ክፍል') || str.includes('ባች') || str.includes('መዋዕለ') || str.includes('ሁሉም')) {
    return str;
  }

  const lower = str.toLowerCase();

  if (lower === 'all' || lower === 'all classes' || lower.includes('ሁሉም')) {
    return 'ሁሉም ክፍሎች';
  }

  if (lower.includes('batch')) {
    const match = str.match(/\d+/);
    return match ? `ባች ${match[0]}` : str;
  }

  if (lower === 'kg' || lower.includes('kindergarten') || lower.includes('nursery')) {
    return 'መዋዕለ ሕፃናት';
  }

  const match = str.match(/\d+/);
  if (match) {
    return `${match[0]}ኛ ክፍል`;
  }

  return str;
};

const testCases = [
  { input: 'Grade 12', expected: '12ኛ ክፍል' },
  { input: 'GRADE 11', expected: '11ኛ ክፍል' },
  { input: 'Grade 10', expected: '10ኛ ክፍል' },
  { input: 'Grade 9', expected: '9ኛ ክፍል' },
  { input: 'Grade 8', expected: '8ኛ ክፍል' },
  { input: 'Grade 7', expected: '7ኛ ክፍል' },
  { input: '12', expected: '12ኛ ክፍል' },
  { input: '7', expected: '7ኛ ክፍል' },
  { input: 'Batch 1', expected: 'ባች 1' },
  { input: 'BATCH 2', expected: 'ባች 2' },
  { input: 'batch 3', expected: 'ባች 3' },
  { input: 'KG', expected: 'መዋዕለ ሕፃናት' },
  { input: 'kindergarten', expected: 'መዋዕለ ሕፃናት' },
  { input: '8ኛ ክፍል', expected: '8ኛ ክፍል' },
  { input: 'ባች 2', expected: 'ባች 2' },
  { input: 'All Classes', expected: 'ሁሉም ክፍሎች' },
  { input: '', expected: '—' },
  { input: null, expected: '—' },
  { input: undefined, expected: '—' },
];

console.log('🧪 Testing formatGradeAmharic formatting cases...');
let passed = 0;
for (const tc of testCases) {
  const actual = formatGradeAmharic(tc.input);
  assert.strictEqual(actual, tc.expected, `Failed for input: "${tc.input}" - expected "${tc.expected}", got "${actual}"`);
  console.log(`  ✅ "${tc.input}" -> "${actual}"`);
  passed++;
}

console.log(`\n🎉 All ${passed}/${testCases.length} formatGradeAmharic test cases PASSED!`);
