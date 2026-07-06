const PLAN_LIMITS = {
  starter: {
    maxStudents: 200,
    maxTeachers: 5,
    features: ['attendance', 'homework', 'fees']
  },
  professional: {
    maxStudents: 1000,
    maxTeachers: 25,
    features: ['attendance', 'homework', 'fees', 'analytics', 'sms', 'priority_support']
  },
  enterprise: {
    maxStudents: Infinity,
    maxTeachers: Infinity,
    features: [
      'attendance',
      'homework',
      'fees',
      'analytics',
      'sms',
      'priority_support',
      'custom_integrations',
      'dedicated_sla',
      'phone_support'
    ]
  }
};

module.exports = PLAN_LIMITS;
