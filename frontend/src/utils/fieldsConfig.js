export const ROLES = {
  SHIPPER: 'shipper',
  TRUCKING_COMPANY: 'truckingCompany',
  TRUCK_DRIVER: 'truckDriver'
};

export const ROLE_DISPLAY_NAMES = {
  [ROLES.SHIPPER]: 'Shipper',
  [ROLES.TRUCKING_COMPANY]: 'Trucking Company',
  [ROLES.TRUCK_DRIVER]: 'Truck Driver'
};

// Base fields that are common across all roles
const baseFields = [
  {
    name: 'name',
    type: 'text',
    label: 'Full Name',
    placeholder: 'Full Name',
    autoComplete: 'name',
    required: true,
    gridCol: 1
  },
  {
    name: 'email',
    type: 'email',
    label: 'Email',
    placeholder: 'example@gmail.com',
    autoComplete: 'email',
    required: true,
    gridCol: 1
  },
  {
    name: 'phone',
    type: 'tel',
    label: 'Phone',
    placeholder: 'Phone',
    autoComplete: 'tel',
    required: true,
    gridCol: 2,
    pattern: '^\\+?\\d*$',
    inputMode: 'numeric'
  },
  {
    name: 'password',
    type: 'password',
    label: 'Password',
    placeholder: '********',
    autoComplete: 'current-password',
    required: true,
    fullWidth: true
  }
];

// Role-specific field configurations
const roleSpecificFields = {
  [ROLES.SHIPPER]: [
    {
      name: 'companyname',
      type: 'text',
      label: 'Company Name',
      placeholder: 'Company Name',
      autoComplete: 'organization',
      required: true,
      gridCol: 2
    }
  ],
  [ROLES.TRUCK_DRIVER]: [
    {
      name: 'companycode',
      type: 'text',
      label: 'Company Code',
      placeholder: '98765',
      autoComplete: 'organization',
      required: true,
      gridCol: 2,
      pattern: '[0-9]*',
      inputMode: 'numeric'
    }
  ],
  [ROLES.TRUCKING_COMPANY]: [
    {
      name: 'companyname',
      type: 'text',
      label: 'Company Name',
      placeholder: 'Company Name',
      autoComplete: 'organization',
      required: true,
      gridCol: 2
    }
  ]
};

// Role content configuration
export const roleContent = {
  [ROLES.SHIPPER]: {
    title: 'Welcome to Ukaab!',
    description: 'Get started in seconds - connect with shippers, fleets, and drivers instantly to post requests, assign loads, and track in real time across one unified platform.'
  },
  [ROLES.TRUCK_DRIVER]: {
    title: 'Welcome to Ukaab!',
    description: 'Get started in seconds - connect with shippers, fleets, and drivers instantly to post requests, assign loads, and track in real time across one unified platform.'
  },
  [ROLES.TRUCKING_COMPANY]: {
    title: 'Welcome to Ukaab!',
    description: 'Get started in seconds - connect with shippers, fleets, and drivers instantly to post requests, assign loads, and track in real time across one unified platform.'
  }
};

/**
 * Get field configuration for a specific role
 * @param {string} role - The user role
 * @returns {Array} Array of field configurations
 */
export const getFieldsForRole = (role) => {
  if (!role || !roleSpecificFields[role]) {
    return baseFields;
  }

  // Insert role-specific field after name field
  const fields = [...baseFields];
  const nameIndex = fields.findIndex(field => field.name === 'name');
  
  if (nameIndex !== -1) {
    fields.splice(nameIndex + 1, 0, ...roleSpecificFields[role]);
  }

  return fields;
};

/**
 * Get initial form data for a specific role
 * @param {string} role - The user role
 * @returns {Object} Initial form data object
 */
export const getInitialFormData = (role) => {
  const fields = getFieldsForRole(role);
  return fields.reduce((acc, field) => {
    acc[field.name] = '';
    return acc;
  }, {});
};

/**
 * Get display name for a role
 * @param {string} role - The user role
 * @returns {string} Display name
 */
export const getRoleDisplayName = (role) => {
  return ROLE_DISPLAY_NAMES[role] || '';
};

/**
 * Get content configuration for a role
 * @param {string} role - The user role
 * @returns {Object} Content configuration
 */
export const getRoleContent = (role) => {
  return roleContent[role] || {
    title: 'Welcome to Ukaab!',
    description: 'Get started in seconds - connect with shippers, fleets, and drivers instantly to post requests, assign loads, and track in real time across one unified platform.'
  };
};

/**
 * Validate if a role is valid
 * @param {string} role - The user role
 * @returns {boolean} Whether the role is valid
 */
export const isValidRole = (role) => {
  return Object.values(ROLES).includes(role);
};

/**
 * Validate field input
 * @param {string} fieldName - The field name
 * @param {string} value - The input value
 * @returns {boolean} Whether the input is valid
 */
export const validateFieldInput = (fieldName, value) => {
  // Empty field check (all fields)
  if (!value || value.trim() === '') {
    return false;
  }

  if (fieldName === 'companycode') {
    return /^\d+$/.test(value);
  }
  if (fieldName === 'name' || fieldName === 'fullName' || fieldName === 'emergencyContactName') {
    return /^[a-zA-Z\s]{2,}$/.test(value.trim());
  }
  if (fieldName === 'email') {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }
  // --- Pakistani phone number validation ---
  if (fieldName === 'phone' || fieldName === 'phoneNumber' || fieldName === 'emergencyContact') {
    // Accepts 10 or 11 digits, must start with 0 (e.g., 03001234567 or 0300 1234567)
    return /^0\d{3}\s?\d{7}$/.test(value.replace(/\s/g, ''));
  }
  if (fieldName === 'experienceYears') {
    const experience = parseInt(value, 10);
    return !isNaN(experience) && experience >= 1 && Number.isInteger(experience) && value.toString() === experience.toString();
  }
  if (fieldName === 'address') {
    return value.trim().length >= 5;
  }
  if (fieldName === 'cnic' || fieldName === 'license') {
    return /^[0-9]{5}-[0-9]{7}-[0-9]$/.test(value.trim());
  }

  if (fieldName === 'phone') {
    // Only allow numeric characters or "+" at start
    return /^\+?\d*$/.test(value);
  }
  
  return true;
};