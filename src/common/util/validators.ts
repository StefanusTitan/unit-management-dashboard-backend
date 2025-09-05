import { validate } from 'uuid';
import { transform } from 'jet-validators/utils';


/******************************************************************************
                                Functions
******************************************************************************/

/**
 * Database relational key.
 */
export function isRelationalKey(arg: unknown): arg is string {
  return typeof arg === 'string' && validate(arg);
}

/**
 * Check if a string is a valid ISO date string.
 */
function isValidISODateString(arg: unknown): arg is string {
  if (typeof arg !== 'string') return false;
  const date = new Date(arg);
  return !isNaN(date.getTime()) && date.toISOString() === arg;
}

/**
 * Convert ISO date string to date object then check is a valid date.
 */
export const transIsDate = transform(
  arg => {
    if (!isValidISODateString(arg)) {
      throw new Error('Invalid ISO date string');
    }
    return arg as string;
  },
  isValidISODateString,
);
