/**
 * Validates a form object based on rules.
 * @param {Object} form - The form data.
 * @param {Object} rules - The validation rules.
 * @returns {Object} errors - An object of errors by field.
 */


export function validateForm(form, rules) {
  const errors = {};
  for (const field in rules) {
    const value = form[field];
    const rule = rules[field];

    if (rule.required && (!value || value.toString().trim() === "")) {
      errors[field] = rule.message || `${field} is required`;
    }

    if (rule.pattern && value && !rule.pattern.test(value)) {
      errors[field] = rule.message || `${field} is invalid`;
    }
  }

  return errors;
}
