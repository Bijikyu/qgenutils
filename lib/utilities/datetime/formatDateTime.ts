import { isValid, parseISO } from 'date-fns';
import { qerrors } from 'qerrors';
import logger from '../../logger.js';

type DateTimeFormatResult = {
  original: string | Date;
  formatted?: string;
  timestamp?: number;
  error?: string;
};

const formatDateTime = (input: string | Date): DateTimeFormatResult => {
  logger.debug(`formatDateTime is running`, { inputType: typeof input });

  try {
    if (input == null) {
      return { original: input as any, error: 'Invalid date: input is null/undefined' };
    }

    const date: Date =
      input instanceof Date
        ? input
        : typeof input === 'string'
          ? parseISO(input)
          : (new Date(NaN) as any);

    if (!(date instanceof Date) || !isValid(date)) {
      return {
        original: input as any,
        formatted: 'N/A',
        error: 'Invalid date'
      };
    }

    return {
      original: input,
      formatted: date.toLocaleString(),
      timestamp: date.getTime()
    };
  } catch (err) {
    const errorObj = err instanceof Error ? err : new Error(String(err));
    qerrors(errorObj, 'formatDateTime');
    logger.error(`formatDateTime failed`, { error: errorObj.message });
    return {
      original: input as any,
      formatted: 'N/A',
      error: errorObj.message
    };
  }
};

export default formatDateTime;
