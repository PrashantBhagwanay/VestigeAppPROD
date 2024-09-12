import { Toast } from 'app/src/components/toast/Toast';
import {
  VESTIGE_GOOGLE_KEYS,
  Month,
  MONTH_DATA,
} from 'app/src/utility/constant/Constants';
import { CommonActions } from '@react-navigation/native';
import * as AsyncStore from 'app/src/utility/AsyncStoragesUtils';
import moment from 'moment';
import store from '../stores/Store';
import { captureRef } from 'react-native-view-shot';
import {
  Dimensions,
  Platform,
  Alert,
  NativeModules,
  Linking,
} from 'react-native';
import {
  getUniqueId,
  getManufacturer,
  getModel,
} from 'react-native-device-info';
import { openSettings } from 'react-native-permissions';
import { isValidateDate } from 'app/src/utility/Validation/Validation';
import { strings } from 'app/src/utility/localization/Localized';
import Share from 'react-native-share';
import { checkInternetOnce } from './internetConnectivity/internetConnectivity';
const SHOWIMPORTANTUPDATEWARNING = AsyncStore.addPrefix(
  'showImportantUpdateWarning',
);
const SIDEMENUDATA = AsyncStore.addPrefix('SideMenuData');

var CryptoJS = require('crypto-js');
var encryptionKey = VESTIGE_GOOGLE_KEYS.VESTIGE_ENCRYPTION_KEY;

export function customAlert(customString) {
  setTimeout(() => {
    alert(customString);
  }, 1000);
}

/**
 * @description function for format ISO date string into readable format
 * @param {*} date ISO date string
 */

export function importantUpdateAlert(message) {
  return new Promise((resolve, reject) => {
    Alert.alert(
      'IMPORTANT UPDATE!',
      message,
      [
        {
          text: 'OK',
          onPress: async () => {
            await AsyncStore.set(SHOWIMPORTANTUPDATEWARNING, 'true');
            resolve();
          },
        },
      ],
      { cancelable: false },
    );
  });
}

export function isNullOrEmpty(value) {
  if (value === null || value === undefined) {
    return true;
  }
  if (typeof value === 'string') {
    return value.trim() === '';
  }
  if (typeof value === 'object') {
    if (Array.isArray(value)) {
      return value.length === 0;
    }
    return Object.keys(value).length === 0;
  }
  return false;
}

/** @description This is used for guest user login, default location id will be returned. In android data comes from backend. */
export function fetchBaseLocationIOS(countryId) {
  if (countryId === 1) return 10;
  if (countryId === 25) return 10497;
  return 10;
}

/**
 * @description this will return boolean value based on shopping allowed in mentioned country.
 * @param {*} userCountry country id of logged in user
 * @param {*} isShoppingActiveOnSelectedAddress returns boolean value as per country selected in user current address.
 */
export function isShoppingItemActiveInCountry(
  userCountry,
  isShoppingActiveOnSelectedAddress,
) {
  if (userCountry === 2) {
    return false;
  }
  if (userCountry === 1) {
    return true;
  }
  return isShoppingActiveOnSelectedAddress || false;
}


/**
 * @description this will return boolean value based on shopping allowed in mentioned country.
 * @param {*} countryId country id of logged in user
 * @returns country Name
 */
export function getCountryName(countryId) {
  switch(countryId){
    case 1: return 'India'
  }
}

/**
 * @description this will open app setting in device.
 * @param {*} title this is the title of alert
 * @param {*} message This is the message shown to user in alert.
 */
export function promptToOpenSettings(title, message = '') {
  Alert.alert(title, message, [
    {
      text: strings.commonMessages.openSetting,
      onPress: () => {
        if (Platform.OS === 'ios') {
          Linking.openURL('app-settings:');
        }
        if (Platform.OS === 'android') {
          openSettings();
        }
      },
    },
    {
      text: strings.commonMessages.cancel,
      style: 'cancel',
    },
  ]);
}

/** It returns DD MMM YY format */
export function dateFormat(date) {
  var day = date.getDate();
  var monthIndex = date.getMonth();
  var year = date.getFullYear();
  return day + ' ' + Month[monthIndex] + ' ' + year;
}

export function newDobFormat(date) {
  const date_components = date.split('/');
  const timezoneOffset = new Date().getTimezoneOffset();
  const day =
    isValidateDate(date) && timezoneOffset !== 0
      ? parseInt(date_components[0]) + 1
      : date_components[0];
  const month = date_components[1];
  const year = date_components[2];
  return new Date(year, month - 1, day);
}

export function compareDates(date) {
  // let dateObject = {};
  let currentDate = moment();
  let date1 = moment(date);
  var years = currentDate.diff(date1, 'year');
  date1.add(years, 'years');

  var months = currentDate.diff(date1, 'months');
  date1.add(months, 'months');

  var days = currentDate.diff(date1, 'days');
  console.log(typeof years);
  return (dateObject = {
    years: years,
    months: months,
    days: days,
  });
}

export function dateFormatMonthWithYear(date) {
  var monthIndex = date.getMonth();
  var year = date.getFullYear();
  return Month[monthIndex] + ' ' + year;
}

export function decimalToHex(data) {
  let hexString = Number(data).toString(16).toUpperCase();
  return hexString;
}

export function hexToDecimal(data) {
  return parseInt(data, 16);
}

export function ConsistencyDateFormat(date) {
  // var day = date.getDate();
  var monthIndex = date.getMonth();
  var year = date.getFullYear().toString().substr(-2);
  return MONTH_DATA[monthIndex] + ' ' + year;
}

export function encryptKey(key) {
  if (key === '') {
    return '';
  }
  const string = JSON.stringify(key);
  return CryptoJS.AES.encrypt(string, encryptionKey).toString();
}

/**
 * @description function for decrypting the data
 * @param {*} data string you want to encypt
 */
export function decryptKey(data) {
  if (!data) {
    return data;
  }
  const string = CryptoJS.AES.decrypt(data, encryptionKey);
  return string.toString(CryptoJS.enc.Utf8).replace(/^"(.+(?="$))"$/, '$1');
}

/**
 * @function search the key from the array
 */
export function searchFromArray(value, array) {
  let results = {};
  array.map(object => {
    for (let key in object) {
      object[key] === value ? (results = object) : null;
    }
  });
  return results;
}

/**
 * @description get the months index
 * @param {*} month JANUARY... The complete name of month should come in param
 */
export function getMonthsIndex(month) {
  //here January 1, 2012 make any date and then retrieve the month index
  //then Date.parse(January 1, 2012) => milliseconds
  const monthIndex = MONTH_DATA.findIndex(
    name => name.toLowerCase() === month.toLowerCase(),
  );
  return monthIndex === -1 ? -1 : monthIndex + 1;
}

/**
 * @description get the months index
 * @param {*} object { a: 1, b:2 } return false if contains value else true
 */
export function isObjectEmpty(object) {
  for (let key in object) {
    if (object[key]) {
      if (object[key].startsWith(' ') === false) return false;
    }
    return true;
  }
}

export function getMonthName(month) {
  return MONTH_DATA[month];
}

export function getYearList() {
  let yearList = [];
  let currentDateYear = new Date().getFullYear();
  let startingDateYear = new Date('2004-01-01').getFullYear();
  while (startingDateYear <= currentDateYear) {
    yearList.push(startingDateYear);
    startingDateYear = startingDateYear + 1;
  }
  return yearList;
}

export function getMonthList() {
  var locale = 'en-us';
  var endingDate = new Date('12/01/2000');
  var monthList = [];
  for (let i = 0; i <= 12; i++) {
    if (i < 10) {
      let date = '0' + i + '/01/2000';
      let currentDate = new Date(date);
      if (currentDate.getMonth() <= endingDate.getMonth()) {
        let month = currentDate.toLocaleString(locale, { month: 'short' });
        monthList.push(month);
      }
    } else {
      let date = i + '/01/2000';
      let currentDate = new Date(date);
      if (currentDate.getMonth() <= endingDate.getMonth()) {
        let month = currentDate.toLocaleString(locale, { month: 'short' });
        monthList.push(month);
      }
    }
  }
  return monthList;
}
/**
 * @description get the price with currency
 * @param {*} number { price } return string with indian currency
 */
export function priceWithCurrency(countryId, price) {
  switch (countryId) {
    case 1:
      return `${'\u20B9'} ${price}`;
    case 2:
      return `${'NPR'} ${price}`;
    case 25:
      return `${'\u20B1'} ${price}`;
    case 26:
      return `${'XOF'} ${price}`;
    case 4:
      return `${'AED'} ${Number(price).toFixed(2)}`;
    default:
      return `${'\u20B9'} ${price}`;
  }
  // return countryId == 2 ? `${'NPR'} ${price}` : `${'\u20B9'} ${price}`;
}



export function priceWithCurrencyFunds(countryId, price) {
  const parsedCountryId = parseInt(countryId);

  if (isNaN(parsedCountryId)) {
    return `${countryId} ${price}`;
  }

  switch (parsedCountryId) {
    case 1:
      return `${'\u20B9'} ${price}`;
    case 2:
      return `${'NPR'} ${price}`;
    case 25:
      return `${'\u20B1'} ${price}`;
    case 26:
      return `${'XOF'} ${price}`;
    case 4:
      return `${'AED'} ${Number(price).toFixed(2)}`;
    default:
      return `${'\u20B9'} ${price}`;
  }
  // return countryId == 2 ? `${'NPR'} ${price}` : `${'\u20B9'} ${price}`;
}


export function getMrpType(countryId) {
  switch (countryId) {
    case 1:
      return `MRP`;
    case 4:
      return `RP`;
    default:
      return `Price`;
  }
}

/**
 * @description convert price with k formatter
 * @param {*} number { price } return string k formatter
 */
export function kFormatter(number) {
  return number > 999 ? (number / 1000).toFixed(1) + 'k' : number;
}

export function valueFormatter(number) {
  if (number > 99999) {
    return (number / 100000).toFixed(1) + 'L';
  } else if (number > 999) {
    (number / 1000).toFixed(1) + 'K';
  }
  return number;
}

/**
 * @description return first character caps
 * @param {*} number { price } return string k formatter
 */
export function capitalizeFirstCharacter(value) {
  if (value) {
    let splitStr = value.toLowerCase().split(' ');
    for (let i = 0; i < splitStr.length; i++) {
      // You do not need to check if i is larger than splitStr length, as your for does that for you
      // Assign it back to the array
      splitStr[i] =
        splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }
    // Directly return the joined string
    return splitStr.join(' ');
  } else {
    return '';
  }
}

export function commaSeperateAmount(value) {
  if (value) {
    var commaSeperatedValue = value.toString().split('.');
    commaSeperatedValue[0] = commaSeperatedValue[0].replace(
      /\B(?=(\d{3})+(?!\d))/g,
      ',',
    );
    return commaSeperatedValue.join('.');
  } else {
    return value;
  }
}

export function spaceSeperatedName(fullname) {
  let spaceSeperatedValues = fullname?.toString().split(' ');
  return {
    firstName: spaceSeperatedValues[0],
    lastName: spaceSeperatedValues[1],
  };
}

export const isIphoneXorAbove = () => {
  const dimen = Dimensions.get('window');
  return (
    Platform.OS === 'ios' &&
    !Platform.isPad &&
    !Platform.isTVOS &&
    (dimen.height === 812 ||
      dimen.width === 812 ||
      dimen.height === 896 ||
      dimen.width === 896)
  );
};

export function showToast(message: string, toastType: Toast.type) {
  // Add a Toast on screen.
  Toast.show(message, {
    duration: Toast.durations.SHORT,
    type: toastType ? toastType : Toast.type.ERROR,
    shadow: false,
    animation: true,
    hideOnPress: true,
    delay: 0,
  });
}

/**
 * @description it will mask mobile number
 * @param item Number to mask
 * @param unMaskedIndex array of index which should not be masked
 */
export const getMaskedMobileNumber = (item, unMaskedIndex) => {
  const splitNumberArr = item?.split('');
  const maskedNumberArr = splitNumberArr.map((item, index) => {
    if (unMaskedIndex?.includes(index)) {
      return item;
    } else {
      return 'X';
    }
  });
  const maskedNumber = maskedNumberArr.join('');
  return maskedNumber;
};

// @autobind
export function gotoHomeOrderConfirm(navigation, screenName, isCartCheckout) {
  navigation?.popToTop();
  // navigation.navigate(isCartCheckout ? 'Dashboard' : 'MyCart', {
  //   screen: screenName,
  //   initial: false,
  // });
  navigation.navigate(screenName);
}

export function gotoDashboard(navigation) {
  const resetAction = CommonActions.reset({
    index: 1,
    routes: [{ name: 'Dashboard' }],
  });
  navigation.dispatch(resetAction);
}

// @autobind
export function gotoHome(navigation, screenName, isLogPayment) {
  const resetAction = CommonActions.reset({
    index: 1,
    routes: [{ name: isLogPayment ? 'Dashboard' : 'MyCart' }],
  });
  navigation.dispatch(resetAction);
  navigation.navigate(screenName);
}

/**
 * It can be used navigate to screen from different tab route after reseting current route.
 * It needs to be optimized, currently naviagtion.reset() not working as expected.
 * @param {*} navigation the navigation props from screen.
 * @param {*} screenName name of destination screen to be navigated.
 */
export const gotoScreenFromOtherRoute = (navigation, screenName) => {
  navigation.popToTop();
  navigation.navigate(screenName);
};

export async function connectedToInternet() {
  // const isInternetConnected = await AsyncStore.get('isConnected');
  if (store.auth.isNetworkConnected) {
    return true;
  }
  const status = await checkInternetOnce();
  return status;
}

export function checkAddedToCart(addedToCart) {
  switch (addedToCart) {
    case 1:
      return 'Product Added To Cart';
    case 2:
      return 'KYC Of the selected user is not complete';
    default:
      return 'Something Went wrong';
  }
}

export async function socialShare(viewRef) {
  captureRef(viewRef, {
    quality: 0.8,
    result: 'base64',
  }).then(res => {
    if (res) {
      Share.open({
        failOnCancel: false,
        url: `data:image/jpeg;base64, ${res}`,
      });
    }
  });
}

export function roundHalf(num) {
  return Math.round(num * 2) / 2;
}

export const getUniqueID = async () => {
  const res = await getUniqueId();
  return res;
};

export async function getIOSDeviceID() {
  // const { PayTm } = NativeModules;
  // await PayTm.getDeviceId((deviceVenderId) => {
  //   if (deviceVenderId != undefined && deviceVenderId != '' && deviceVenderId != null) {
  //     return deviceVenderId;
  //   }
  // });
  // return null;
  return await getUniqueId();
}

export async function getDeviceModel() {
  const manufacturerName = await getManufacturer();
  const modelName = getModel();
  return `${manufacturerName} ${modelName}`;
}

export function getGenderValidation(titleValue, genderValue) {
  let warningMessage = 'Title should match the respective Gender.';
  if (titleValue == '') {
    return warningMessage;
  }
  if (titleValue == 'Title') {
    return warningMessage;
  } else if (titleValue == 'Mr.' && genderValue != 'Male') {
    return warningMessage;
  } else if (titleValue == 'Mrs.' && genderValue != 'Female') {
    return warningMessage;
  } else if (titleValue == 'Ms.' && genderValue != 'Female') {
    return warningMessage;
  } else if (titleValue == 'Mx.' && genderValue != 'Others') {
    return warningMessage;
  } else {
    return '';
  }
}

export function roundOffAmount(value) {
  return value.toFixed(2);
}

export function getTaxableString(countryId) {
  let TAXES_APPLICABLE = ``;
  if (countryId == 4) {
    TAXES_APPLICABLE = `(Incl. VAT)`;
  }
  return `${TAXES_APPLICABLE}`;
}
