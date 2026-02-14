import errors from '../../messages/errors.json';

/**
 * Error messages extracted into separate file to avoid bundling
 * entire translation payload (landing page, dashboard, etc.) into axios.ts
 */
export const errorMessages: typeof errors = errors;
