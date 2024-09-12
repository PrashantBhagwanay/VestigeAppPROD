// // @flow
// /* global __DEV__ */

// import {GoogleAnalyticsSettings, GoogleAnalyticsTracker} from 'react-native-google-analytics-bridge';
// import { GA_CONSTANT } from  'app/src/utility/constant/Constants';


// /* setDryRun when enabled the native library prevents any data from being sent to Google Analytics.
//    This allows you to test or debug the implementation, without your test data appearing in your Google Analytics reports.
// */

// GoogleAnalyticsSettings.setDryRun(__DEV__ ? true : false);

// // setDispatchInterval allows you to configure how often (in seconds) the batches are sent to your tracker.
// GoogleAnalyticsSettings.setDispatchInterval(GA_CONSTANT.tracker_interval);

// // Google Analytics Tracker object
// // const tracker = new GoogleAnalyticsTracker(GA_CONSTANT.trackingId, {
// //   USER_ID: 1, APP_CODE: 2
// // });

// const tracker = new GoogleAnalyticsTracker(GA_CONSTANT.trackingId);

// console.log(tracker);

// // Google Analytics custom dimensions
// let customDimensions = {
//   USER_ID: 'anonymous',
//   APP_CODE: 'Demo-y'
// };

// // setter function for custom dimension
// export const setDimension = (dimension) => {
//   customDimensions = {...customDimensions, ...dimension};
// };

// // Google Analytics Tracker Methods

// export const setUser = (userId) => {
//   tracker.setUser(userId);
// };

// export const setAppName = (appName) => {
//   tracker.setAppName(appName);
// };

// export const trackScreenView = (screenName) => {
//   tracker.trackScreenView(screenName);
// };

// export const setAppVersion = (appVersion) => {
//   tracker.setAppVersion(appVersion);
// };

// /**
// category (required): String, category of event
//   action (required): String, name of action
//   optionalValues: Object
//       label: String
//       value: Number
// */
// export const trackEvent = (category, action, eventMetadata, payload) => {
//   tracker.trackEvent(category, action, eventMetadata, payload);
// };

// export const trackTiming = (category, value, optionalValues:Object = {}) => {
//   tracker.trackTiming(category, value, optionalValues);
// };

// // Enable tracking of uncaught exceptions
// export const setTrackUncaughtExceptions = (enabled:boolean = true) => {
//   tracker.setTrackUncaughtExceptions(enabled);
// };

// /**
// error: String, a description of the exception (up to 100 characters), accepts nil
// fatal (required): Boolean, indicates whether the exception was fatal, defaults to false
// */

// export const trackException = (error, fatal:boolean = false) => {
//   tracker.trackException(error, fatal);
// };

// /**
// product (required): Object
//     id (required): String
//     name (required): String
//     category (optional): String
//     brand (optional): String
//     variant (optional): String
//     price (optional): Number
//     quantity (optional): Number
//     couponCode (optional): String
// transaction (required): Object
//     id (required): String
//     affiliation (optional): String, an entity with which the transaction should be affiliated (e.g. a particular store)
//     revenue (optional): Number
//     tax (optional): Number
//     shipping (optional): Number
//     couponCode (optional): String
// */

// export const addProductAction = {
//   action: 3
// }
// export const removeProductAction = {
//   action: 4
// }
// export const checkoutProductAction = {
//   action: 5
// }
// export const productDetailAction = {
//   action: 1
// }