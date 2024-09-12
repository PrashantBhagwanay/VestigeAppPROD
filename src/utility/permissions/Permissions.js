// @flow
/* globals $Values */

import { PermissionsAndroid, Platform } from 'react-native';
import { check, request, PERMISSIONS } from 'react-native-permissions';
import { strings } from '../localization/Localized';

// must match react-native-permissions.
export const StatusEnum = {
  UNDETERMINED: 'undetermined',
  UNAVAILABLE: 'unavailable',
  GRANTED: 'granted',
  DENIED: 'denied',
  LIMITED: 'limited',
  BLOCKED: 'blocked',
  SUCCESS: 'success',
};

export const PERMISSION_TYPES = {
  android: {
    LOCATION: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
    COURSE_LOCATION: PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION,
    BACKGROUND_LOCATION: PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION,
    CAMERA: PERMISSIONS.ANDROID.CAMERA,
    CONTACTS: PERMISSIONS.ANDROID.READ_CONTACTS,
    READ_AUDIO: PERMISSIONS.ANDROID.READ_MEDIA_AUDIO,
    RECORD_AUDIO: PERMISSIONS.ANDROID.RECORD_AUDIO,
    WRITE_STORAGE: PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
    POST_NOTIFICATION: PermissionsAndroid.PERMISSIONS.POST_NOTIFICATION,
  },
  ios: {
    CAMERA: PERMISSIONS.IOS.CAMERA,
    READ_AUDIO: PERMISSIONS.IOS.MICROPHONE,
    LOCATION: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
    LOCATION_ALWAYS: PERMISSIONS.IOS.LOCATION_ALWAYS,
    PHOTO_LIBRARY: PERMISSIONS.IOS.PHOTO_LIBRARY,
    MEDIA_LIBRARY: PERMISSIONS.IOS.MEDIA_LIBRARY,
    FACE_ID: PERMISSIONS.IOS.FACE_ID,
    CALENDARS: PERMISSIONS.IOS.CALENDARS,
    SPEECH_RECOGNITION: PERMISSIONS.IOS.SPEECH_RECOGNITION,
  },
};

export const checkPermission = async type => {
  let status = StatusEnum.UNDETERMINED;
  try {
    status = await check(type);
  } catch (err) {
    console.log(err);
  }
  // console.log('checkpermission', type, status);
  return status;
};

/**
 * @description This will request permission if permission is not already granted. If permission is blocked
 *              then request method will return blocked status. note: check() method only returns denied in that case.
 */
export const requestPermission = async type => {
  let status = StatusEnum.UNDETERMINED;
  try {
    status = await checkPermission(type);
    if (status !== StatusEnum.GRANTED) {
      status = await request(type);
      console.log('check', status);
    }
  } catch (err) {
    console.log(err);
  }
  return status;
};

/**
 * @description This can be used to ask for permisssion at run-time
 * @param {*} permissionType permission value
 * @param {*} title permission alert title
 * @param {*} message permission alert message
 */
export async function checkAndroidPermission(permissionType, title, message) {
  let status = await PermissionsAndroid.check(permissionType);
  if (!status) {
    try {
      const resPermission = await PermissionsAndroid.request(permissionType, {
        title: title,
        message: message,
        // buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      });
      console.log('Android permission', resPermission);
      if (resPermission === PermissionsAndroid.RESULTS.GRANTED) {
        return { granted: true, message: StatusEnum.SUCCESS };
      } else {
        return { granted: false, message: resPermission };
      }
    } catch (err) {
      console.warn(err);
      return {
        granted: false,
        message: strings.commonMessages.somethingWentWrong,
      };
    }
  }
  return {
    granted: status,
    message: StatusEnum.SUCCESS,
  };
}