/* global __DEV__ */

/**
 * @description This is used to print log to console.
 * @param {*} title heading/title of log. {type: string}
 * @param {*} data message content to be printed i.e the data provided. {type: any}
 */
export const showLog = (title, data) => {
  try {
    if (__DEV__) {
      console.log(`${title ?? ''}`, `${data ? `==> ${data}` : ''}`);
    }
  } catch (error) {
    console.log('log print error =>', error);
  }
};
