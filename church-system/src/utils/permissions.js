// church-system/src/utils/permissions.js

/**
 * Granular Permissions Keys Constant
 */
export const PERMISSIONS = {
  // Attendance & QR Scanner
  ATTENDANCE_SCAN: 'attendance:scan',
  ATTENDANCE_VIEW: 'attendance:view',
  ATTENDANCE_MANAGE: 'attendance:manage',

  // Registrations & Admissions Intake
  REGISTRATIONS_VIEW: 'registrations:view',
  REGISTRATIONS_APPROVE: 'registrations:approve',
  REGISTRATIONS_SETTINGS: 'registrations:settings',

  // Students & Teachers
  STUDENTS_VIEW: 'students:view',
  STUDENTS_MANAGE: 'students:manage',
  TEACHERS_VIEW: 'teachers:view',
  TEACHERS_MANAGE: 'teachers:manage',

  // Academic & LMS
  ACADEMIC_CLASSES: 'academic:classes',
  ACADEMIC_COURSES: 'academic:courses',
  ACADEMIC_DISTANCE_HUB: 'academic:distance_hub',
  ACADEMIC_ENROLLMENTS: 'academic:enrollments',

  // Certificates
  CERTIFICATES_VIEW: 'certificates:view',
  CERTIFICATES_ISSUE: 'certificates:issue',

  // Announcements & Resources
  ANNOUNCEMENTS_MANAGE: 'announcements:manage',
  RESOURCES_MANAGE: 'resources:manage',

  // Departments & Memberships
  DEPARTMENTS_MANAGE: 'departments:manage',
  MEMBERSHIPS_MANAGE: 'memberships:manage',

  // Reports & Analytics
  REPORTS_VIEW: 'reports:view',
  ANALYTICS_VIEW: 'analytics:view',

  // System & Administration
  USERS_MANAGE: 'users:manage',
  PASSWORD_RESETS_MANAGE: 'password_resets:manage',
  SETTINGS_MANAGE: 'settings:manage',
  AUDIT_LOGS_VIEW: 'audit_logs:view',
};

/**
 * Categorized Permission Groups for UI Selection
 */
export const PERMISSION_CATEGORIES = [
  {
    id: 'attendance',
    titleAm: '📱 መገኘትና QR መቃኛ',
    titleEn: 'Attendance & QR Scanner',
    descriptionAm: 'የሰንበት ትምህርት ቤት ተማሪዎች መገኘት መቃኛና መዝገብ',
    descriptionEn: 'QR Attendance Scanning & Real-time Records',
    permissions: [
      { key: PERMISSIONS.ATTENDANCE_SCAN, labelAm: 'የተማሪዎች QR መቃኛ (QR Scanner)', labelEn: 'Scan Student QR Attendance' },
      { key: PERMISSIONS.ATTENDANCE_VIEW, labelAm: 'የመገኘት መዝገቦችን ማየት', labelEn: 'View Attendance Records' },
      { key: PERMISSIONS.ATTENDANCE_MANAGE, labelAm: 'የመገኘት መረጃዎችን ማስተካከል', labelEn: 'Manage & Correct Attendance' },
    ],
  },
  {
    id: 'registrations',
    titleAm: '📝 ምዝገባና ቅበላ',
    titleEn: 'Registrations & Intake',
    descriptionAm: 'የአዳዲስ ተማሪዎች ማመልከቻ፣ ደረሰኝ ማረጋገጫና ቅበላ',
    descriptionEn: 'Review & verify student intake applications',
    permissions: [
      { key: PERMISSIONS.REGISTRATIONS_VIEW, labelAm: 'አዲስ ምዝገባዎችንና ደረሰኞችን ማየት', labelEn: 'View Registrations & Receipts' },
      { key: PERMISSIONS.REGISTRATIONS_APPROVE, labelAm: 'ምዝገባ ማጽደቅና ውድቅ ማድረግ', labelEn: 'Approve & Reject Applications' },
      { key: PERMISSIONS.REGISTRATIONS_SETTINGS, labelAm: 'የምዝገባ በር መክፈት/መዝጋት', labelEn: 'Open/Close Registration Intake' },
    ],
  },
  {
    id: 'students_teachers',
    titleAm: '👥 ተማሪዎችና መምህራን',
    titleEn: 'Students & Teachers',
    descriptionAm: 'የተማሪዎችና የመምህራን ማህደሮችና ዝርዝር',
    descriptionEn: 'Manage student & teacher profiles',
    permissions: [
      { key: PERMISSIONS.STUDENTS_VIEW, labelAm: 'የተማሪዎችን ዝርዝር ማየት', labelEn: 'View Student Directory' },
      { key: PERMISSIONS.STUDENTS_MANAGE, labelAm: 'ተማሪዎችን መመዝገብና ማስተካከል', labelEn: 'Add & Edit Student Profiles' },
      { key: PERMISSIONS.TEACHERS_VIEW, labelAm: 'የመምህራን ዝርዝር ማየት', labelEn: 'View Teacher Directory' },
      { key: PERMISSIONS.TEACHERS_MANAGE, labelAm: 'መምህራንን መመዝገብና ማስተካከል', labelEn: 'Add & Edit Teachers' },
    ],
  },
  {
    id: 'academic',
    titleAm: '🎓 አካዳሚክና ትምህርቶች',
    titleEn: 'Academic & LMS',
    descriptionAm: 'ክፍሎች፣ ኮርሶች፣ የትምህርት ምዝገባዎችና የርቀት ማዕከል',
    descriptionEn: 'Classes, courses, and distance learning',
    permissions: [
      { key: PERMISSIONS.ACADEMIC_CLASSES, labelAm: 'ክፍሎችንና ባቾችን ማስተዳደር', labelEn: 'Manage Classes & Batches' },
      { key: PERMISSIONS.ACADEMIC_COURSES, labelAm: 'ኮርሶችንና ትምህርቶችን ማስተዳደር', labelEn: 'Manage Courses & Curriculum' },
      { key: PERMISSIONS.ACADEMIC_DISTANCE_HUB, labelAm: 'የርቀት ትምህርት ማዕከል', labelEn: 'Distance LMS Hub' },
      { key: PERMISSIONS.ACADEMIC_ENROLLMENTS, labelAm: 'የትምህርት ምዝገባዎችን ማስተዳደር', labelEn: 'Manage Academic Enrollments' },
    ],
  },
  {
    id: 'certificates',
    titleAm: '📜 ምስክር ወረቀት',
    titleEn: 'Certificates',
    descriptionAm: 'የተማሪዎች ይፋዊ የምስክር ወረቀት አዘገጃጀትና አሰጣጥ',
    descriptionEn: 'Generate & issue verifiable certificates',
    permissions: [
      { key: PERMISSIONS.CERTIFICATES_VIEW, labelAm: 'የምስክር ወረቀቶችን ማየት', labelEn: 'View Certificates' },
      { key: PERMISSIONS.CERTIFICATES_ISSUE, labelAm: 'ምስክር ወረቀት ማዘጋጀትና መስጠት', labelEn: 'Issue & Generate Certificates' },
    ],
  },
  {
    id: 'announcements_resources',
    titleAm: '📢 ማስታወቂያና ማጣቀሻ',
    titleEn: 'Announcements & Resources',
    descriptionAm: 'ይፋዊ መግለጫዎችና የትምህርት ማጣቀሻ መጻሕፍት',
    descriptionEn: 'Official announcements and learning materials',
    permissions: [
      { key: PERMISSIONS.ANNOUNCEMENTS_MANAGE, labelAm: 'ይፋዊ ማስታወቂያዎችን መለጠፍ', labelEn: 'Manage Announcements' },
      { key: PERMISSIONS.RESOURCES_MANAGE, labelAm: 'የትምህርት ማጣቀሻዎችን ማስተዳደር', labelEn: 'Manage Resources' },
    ],
  },
  {
    id: 'departments',
    titleAm: '🏢 ክፍላትና አባላት',
    titleEn: 'Departments & Memberships',
    descriptionAm: 'የሰንበት ትምህርት ቤት ክፍላትና የቤተክርስቲያን አባልነቶች',
    descriptionEn: 'Church departments and member rosters',
    permissions: [
      { key: PERMISSIONS.DEPARTMENTS_MANAGE, labelAm: 'ክፍላትን ማስተዳደር', labelEn: 'Manage Church Departments' },
      { key: PERMISSIONS.MEMBERSHIPS_MANAGE, labelAm: 'የአባልነት መዝገቦችን ማስተዳደር', labelEn: 'Manage Memberships' },
    ],
  },
  {
    id: 'reports',
    titleAm: '📊 ሪፖርትና አናሊቲክስ',
    titleEn: 'Reports & Analytics',
    descriptionAm: 'አጠቃላይ የስታቲስቲክስና የድርጊት ሪፖርቶች',
    descriptionEn: 'Statistical metrics and system reporting',
    permissions: [
      { key: PERMISSIONS.REPORTS_VIEW, labelAm: 'አጠቃላይ ሪፖርቶችን ማየትና ማውረድ', labelEn: 'View & Export Reports' },
      { key: PERMISSIONS.ANALYTICS_VIEW, labelAm: 'የሲስተም አናሊቲክስ ማየት', labelEn: 'View System Analytics' },
    ],
  },
  {
    id: 'system',
    titleAm: '⚙️ ሲስተምና ተጠቃሚዎች',
    titleEn: 'System Administration',
    descriptionAm: 'ተጠቃሚዎች፣ የይለፍ ቃል ጥያቄዎችና አጠቃላይ ቅንብሮች',
    descriptionEn: 'User accounts, permissions, and system settings',
    permissions: [
      { key: PERMISSIONS.USERS_MANAGE, labelAm: 'ተጠቃሚዎችንና ሚናዎችን ማስተዳደር', labelEn: 'Manage Users & Permissions' },
      { key: PERMISSIONS.PASSWORD_RESETS_MANAGE, labelAm: 'የይለፍ ቃል ጥያቄዎችን ማስተናገድ', labelEn: 'Manage Password Resets' },
      { key: PERMISSIONS.SETTINGS_MANAGE, labelAm: 'አጠቃላይ የሲስተም ቅንብሮች', labelEn: 'Manage System Settings' },
      { key: PERMISSIONS.AUDIT_LOGS_VIEW, labelAm: 'የድርጊት መዝገቦችን ማየት', labelEn: 'View Audit Logs' },
    ],
  },
];

/**
 * 1-Click Role Presets for User Creation
 */
export const ROLE_PRESETS = [
  {
    id: 'attendance_usher',
    nameAm: '📱 የመገኘት አስተባባሪ (Attendance Usher)',
    nameEn: 'Attendance Usher',
    role: 'staff',
    permissions: [PERMISSIONS.ATTENDANCE_SCAN, PERMISSIONS.ATTENDANCE_VIEW],
  },
  {
    id: 'admissions_officer',
    nameAm: '📝 የምዝገባ ኦፊሰር (Admissions Officer)',
    nameEn: 'Admissions Officer',
    role: 'staff',
    permissions: [PERMISSIONS.REGISTRATIONS_VIEW, PERMISSIONS.REGISTRATIONS_APPROVE, PERMISSIONS.STUDENTS_VIEW],
  },
  {
    id: 'academic_coordinator',
    nameAm: '🎓 የትምህርት አስተባባሪ (Academic Coordinator)',
    nameEn: 'Academic Coordinator',
    role: 'staff',
    permissions: [
      PERMISSIONS.ACADEMIC_CLASSES,
      PERMISSIONS.ACADEMIC_COURSES,
      PERMISSIONS.ACADEMIC_DISTANCE_HUB,
      PERMISSIONS.ACADEMIC_ENROLLMENTS,
      PERMISSIONS.STUDENTS_VIEW,
      PERMISSIONS.TEACHERS_VIEW,
    ],
  },
  {
    id: 'certificate_officer',
    nameAm: '📜 የሰርተፊኬት ኦፊሰር (Certificate Officer)',
    nameEn: 'Certificate Officer',
    role: 'staff',
    permissions: [PERMISSIONS.CERTIFICATES_VIEW, PERMISSIONS.CERTIFICATES_ISSUE, PERMISSIONS.STUDENTS_VIEW],
  },
  {
    id: 'communications_secretary',
    nameAm: '📢 የማስታወቂያና ተግባቦት (Communications)',
    nameEn: 'Communications Secretary',
    role: 'staff',
    permissions: [PERMISSIONS.ANNOUNCEMENTS_MANAGE, PERMISSIONS.RESOURCES_MANAGE],
  },
  {
    id: 'department_head',
    nameAm: '🏢 የክፍል ኃላፊ (Department Head)',
    nameEn: 'Department Head',
    role: 'department_admin',
    permissions: [PERMISSIONS.DEPARTMENTS_MANAGE, PERMISSIONS.MEMBERSHIPS_MANAGE, PERMISSIONS.ANNOUNCEMENTS_MANAGE],
  },
  {
    id: 'full_admin',
    nameAm: '👑 ሙሉ አድሚን (Full Administrator)',
    nameEn: 'Full Administrator',
    role: 'admin',
    permissions: ['*'],
  },
  {
    id: 'custom',
    nameAm: '🛠️ ብጁ ፈቃድ (Custom Selection)',
    nameEn: 'Custom Permissions',
    role: 'staff',
    permissions: [],
  },
];

/**
 * Universal Permission Check Helper Function
 * @param {Object} user - The current logged in user object
 * @param {string|string[]} requiredPermission - Required permission key or array of keys (any match allowed)
 * @returns {boolean}
 */
export function hasPermission(user, requiredPermission) {
  if (!user) return false;

  // Super Admin & Admin have unrestricted universal access
  if (user.role === 'superadmin' || user.role === 'admin') {
    return true;
  }

  const userPerms = Array.isArray(user.permissions) ? user.permissions : [];

  // Universal wildcard
  if (userPerms.includes('*') || userPerms.includes('all')) {
    return true;
  }

  // If array of permissions is supplied, check if user satisfies at least one
  if (Array.isArray(requiredPermission)) {
    return requiredPermission.some((perm) => hasPermission(user, perm));
  }

  if (!requiredPermission) return true;

  // Exact match
  if (userPerms.includes(requiredPermission)) {
    return true;
  }

  // Wildcard category match (e.g., 'attendance:*' satisfies 'attendance:scan')
  const [category] = requiredPermission.split(':');
  if (category && (userPerms.includes(`${category}:*`) || userPerms.includes(`${category}:all`))) {
    return true;
  }

  return false;
}
