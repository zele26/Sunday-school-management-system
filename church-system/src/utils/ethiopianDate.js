// church-system/src/utils/ethiopianDate.js

export const ETHIOPIAN_MONTHS = [
  { index: 1, name: 'መስከረም', en: 'Meskerem' },
  { index: 2, name: 'ጥቅምት', en: 'Tikimt' },
  { index: 3, name: 'ኅዳር', en: 'Hidar' },
  { index: 4, name: 'ታኅሣሥ', en: 'Tahsas' },
  { index: 5, name: 'ጥር', en: 'Tir' },
  { index: 6, name: 'የካቲት', en: 'Yekatit' },
  { index: 7, name: 'መጋቢት', en: 'Megabit' },
  { index: 8, name: 'ሚያዝያ', en: 'Miyazya' },
  { index: 9, name: 'ግንቦት', en: 'Ginbot' },
  { index: 10, name: 'ሰኔ', en: 'Sene' },
  { index: 11, name: 'ሐምሌ', en: 'Hamle' },
  { index: 12, name: 'ነሐሴ', en: 'Nehase' },
  { index: 13, name: 'ጳጉሜን', en: 'Pagume' },
];

/**
 * Converts a Gregorian Date or date string to Ethiopian calendar parts { year, month, day, monthName }
 */
export const gregorianToEthiopic = (dateInput) => {
  if (!dateInput) return null;
  const d = typeof dateInput === 'string' || typeof dateInput === 'number' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return null;

  try {
    const parts = new Intl.DateTimeFormat('en-US-u-ca-ethiopic', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    }).formatToParts(d);

    let day = 1;
    let month = 1;
    let year = 2018;

    for (const p of parts) {
      if (p.type === 'day') day = parseInt(p.value, 10);
      if (p.type === 'month') month = parseInt(p.value, 10);
      if (p.type === 'year') year = parseInt(p.value, 10);
    }

    const monthObj = ETHIOPIAN_MONTHS.find((m) => m.index === month) || ETHIOPIAN_MONTHS[0];

    return {
      year,
      month,
      monthName: monthObj.name,
      monthEn: monthObj.en,
      day,
    };
  } catch {
    return null;
  }
};

/**
 * Converts Ethiopian Calendar date (year, month 1-13, day 1-30) to standard Gregorian JavaScript Date
 */
export const ethiopicToGregorian = (year, month, day) => {
  const y = parseInt(year, 10);
  const m = parseInt(month, 10);
  const d = parseInt(day, 10);

  if (isNaN(y) || isNaN(m) || isNaN(d)) return null;

  const jdn = (1723856 + 365) + 365 * (y - 1) + Math.floor(y / 4) + 30 * (m - 1) + d - 1;
  const a = jdn;
  const alpha = Math.floor((a - 1867216.25) / 36524.25);
  const b = a + 1 + alpha - Math.floor(alpha / 4);
  const c = b + 1524;
  const dConst = Math.floor((c - 122.1) / 365.25);
  const e = Math.floor(365.25 * dConst);
  const g = Math.floor((c - e) / 30.6001);
  const gDay = c - e - Math.floor(30.6001 * g);
  const gMonth = g < 13.5 ? g - 1 : g - 13;
  const gYear = gMonth > 2.5 ? dConst - 4716 : dConst - 4715;

  return new Date(Date.UTC(gYear, gMonth - 1, gDay, 12, 0, 0));
};

/**
 * Formats a Date or ISO date string into Ethiopian Calendar in Amharic (e.g., "መስከረም 25, 2018 ዓ.ም.")
 */
export const formatEthiopianDate = (dateInput, format = 'long') => {
  if (!dateInput) return '—';
  const eth = gregorianToEthiopic(dateInput);
  if (!eth) return '—';

  if (format === 'short') {
    const dStr = String(eth.day).padStart(2, '0');
    const mStr = String(eth.month).padStart(2, '0');
    return `${dStr}/${mStr}/${eth.year} ዓ.ም.`;
  }

  if (format === 'en') {
    return `${eth.monthEn} ${eth.day}, ${eth.year} E.C.`;
  }

  // default 'long' in Amharic
  return `${eth.monthName} ${eth.day}, ${eth.year} ዓ.ም.`;
};

/**
 * Helper to get today's Ethiopian date
 */
export const getEthiopianToday = () => {
  const eth = gregorianToEthiopic(new Date());
  return {
    ...eth,
    formatted: `${eth?.monthName || ''} ${eth?.day || ''}, ${eth?.year || ''} ዓ.ም.`,
  };
};

/**
 * Determines the maximum days in an Ethiopian month (30 for months 1-12, 5 or 6 for Pagume)
 */
export const getDaysInEthiopianMonth = (year, month) => {
  const m = parseInt(month, 10);
  if (m !== 13) return 30;
  const y = parseInt(year, 10);
  // Ethiopian leap year is when year % 4 === 3
  return y % 4 === 3 ? 6 : 5;
};
