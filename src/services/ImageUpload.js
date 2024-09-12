import { Platform, PermissionsAndroid } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { checkAndroidPermission } from '../utility/permissions/Permissions';

/**
 * @description It will launch camera on mobil app.
 *       Note : Must close any open modal before using this method
 *              & also use settimeout otherwise it may create issue on IOS */
export const handleLaunchCamera = async optionOverride => {
  let isPermissionGranted;
  if (Platform.OS === 'android') {
    const checkPermission = await checkAndroidPermission(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      'Camera Permission Required !',
      'Please Allow Camera Access to Vestige',
    );
    isPermissionGranted = checkPermission?.granted;
  } else {
    isPermissionGranted = true;
  }
  if (isPermissionGranted) {
    try {
      const options = {
        saveToPhotos: false,
        // quality: 0.1,
        maxWidth: 1000,
        maxHeight: 1000,
        mediaType: 'photo',
        ...optionOverride,
      };
      const result = await launchCamera(options);
      console.log('Result ==>', result);
      if (result?.didCancel) {
        console.log('User cancelled image picker');
      } else if (result?.error) {
        console.log('ImagePicker Error: ', result.error);
      } else if (result?.customButton) {
        console.log('User tapped custom button: ', result.customButton);
      } else if (result?.assets) {
        console.log('assets ==>', JSON.stringify(result.assets));
        return { success: true, data: result.assets[0] };
      }
      return null;
    } catch (err) {
      console.log(err.message);
    }
  }
};

/**
 * @description It will launch photo galary on mobil app.
 *         Note : Must close any open modal before using this method
 *              & also use settimeout otherwise it may create issue on IOS */
export const handlelaunchImageLibrary = async optionOverride => {
  let isPermissionGranted;
  if (Platform.OS === 'android') {
    const checkPermission = await checkAndroidPermission(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      'Camera Permission Required !',
      'Please Allow Camera Access to Vestige',
    );
    isPermissionGranted = checkPermission?.granted;
  } else {
    isPermissionGranted = true;
  }
  if (isPermissionGranted) {
    try {
      const options = {
        // saveToPhotos: false,
        // quality: 0.1,
        maxWidth: 1000,
        maxHeight: 1000,
        ...optionOverride,
      };
      const result = await launchImageLibrary(options);
      console.log('Result imglib ==>', result);
      if (result?.didCancel) {
        console.log('User cancelled image picker');
      } else if (result?.error) {
        console.log('ImagePicker Error: ', result.error);
      } else if (result?.customButton) {
        console.log('User tapped custom button: ', result.customButton);
      } else if (result?.assets) {
        console.log('assets ==>', JSON.stringify(result.assets));
        return { success: true, data: result.assets[0] };
      }
      return null;
    } catch (err) {
      console.log(err.message);
    }
  }
};
