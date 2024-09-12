/**
 * * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 * @description implementing Mobx here
 * providing all stores through provider
 */

import React, { Component } from 'react';
import {
  StyleSheet,
  Dimensions,
  Platform,
  View,
  AppState,
  Linking,
  LogBox,
  Image,
  Alert,
  SafeAreaView,
  Text,
  StatusBar,
  Appearance,
  TextInput,
} from 'react-native';
import { Provider } from 'mobx-react';
import { action, observable, configure } from 'mobx';
import SplashScreen from 'react-native-splash-screen';
import autobind from 'autobind-decorator';
import DeviceInfo from 'react-native-device-info';
import { useNavigation, CommonActions } from '@react-navigation/native';
import TouchID from 'react-native-touch-id';
// import RNFetchBlob from 'rn-fetch-blob';
import analytics from '@react-native-firebase/analytics';
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, AuthorizationStatus } from '@notifee/react-native';
import { RootSiblingParent } from 'react-native-root-siblings';
import { Toast } from './components/toast/Toast';
import checkInternetConnectivity from 'app/src/utility/internetConnectivity/internetConnectivity';
// import * as AnalyticsUtils from 'app/src/utility/AnalyticsUtils'; // need to check
import store from 'app/src/stores/Store';
import createRootNavigator from './navigation/AppRouter';
import {
  navigate,
  navigateAndReset,
  navigationRef,
} from './navigation/NavigationService';
import * as AsyncStore from 'app/src/utility/AsyncStoragesUtils';
import { setLanguage, strings } from 'app/src/utility/localization/Localized';
import AlertClass from 'app/src/utility/AlertClass';
import NetworkOps from 'app/src/network/NetworkOps';
import * as Urls from 'app/src/network/Urls';
import {
  checkAndroidPermission,
  PERMISSION_TYPES,
} from './utility/permissions/Permissions';
import { isNullOrEmpty, showToast } from './utility/Utility';
import { enableScreens } from 'react-native-screens';
import dynamicLinks from '@react-native-firebase/dynamic-links';

// import FloatingButton from 'app/src/components/FloatingButton/FloatingButton'
// import { SIGNUP_ROUTE } from 'app/src/utility/constant/Constants';

const COUNTRY_ID = AsyncStore.addPrefix('country-id');
const FCM_TOKEN = AsyncStore.addPrefix('fcmToken');
const SELECTED_lANGUAGE = AsyncStore.addPrefix('selectedLanguage');
const SPLASH = require('./assets/images/Splash/splash.png');
const IMAGE_LOGO = require('./assets/images/video_icon.png');
const { width, height } = Dimensions.get('window');
const SPLASH_SCREEN_HIDE_TIMEOUT = 1000; // in milliseconds

const optionalConfigObject = {
  title: 'Authentication Required', // Android
  color: '#e00606', // Android,
  fallbackLabel: 'Show Passcode', // iOS (if empty, then label is hidden)
};

Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.allowFontScaling = false;
TextInput.defaultProps = TextInput.defaultProps || {};
TextInput.defaultProps.allowFontScaling = false;

/** It is done to accept old flow of mobx as major impact.
 * further only New way implementation to be done.
 * */
configure({ enforceActions: 'never' });

export default class App extends Component {
  constructor(props) {
    super(props);
    // Ignore yellow box
    LogBox.ignoreLogs([
      'Warning: isMounted(...) is deprecated',
      'Warning: componentWillReceiveProps is deprecated',
      'Warning: componentWillMount is deprecated',
      "Module RCTImageLoader requires main queue setup since it overrides `init` but doesn't implement `requiresMainQueueSetup`. In a future release React Native will default to initializing all native modules on a background thread unless explicitly opted-out of.",
      'Could not find image',
      'RCTBridge required dispatch_sync',
      'Required dispatch_sync to load constants',
    ]);

    this.state = {
      checkedSignIn: false,
      appState: AppState.currentState,
      alertPresent: false,
    };
    this.unsubscribeConnectionListener = () => {};
    this.appStateSubscription = () => {};
    this.linkingSubscription = () => {};
    this.unsubscribeOnMessage = () => {};
    this.dynamicLinksUnsubscribe = undefined;
  }

  async componentDidMount() {
    setTimeout(() => {
      SplashScreen.hide();
    }, SPLASH_SCREEN_HIDE_TIMEOUT);

    this.unsubscribeConnectionListener = await checkInternetConnectivity();
    await store.init();
    const countryId = await AsyncStore.get(COUNTRY_ID);
    const buildVersion = DeviceInfo.getVersion();

    this.setState({
      countryCode: countryId,
      checkedSignIn: true,
    });
    const SelectedLanguage = await AsyncStore.get(SELECTED_lANGUAGE);
    // alert(SelectedLanguage);
    if (SelectedLanguage) {
      setLanguage(SelectedLanguage);
    }
    // }else{
    //   await AsyncStore.set(SELECTED_lANGUAGE, 'fr');
    //   setLanguage('fr');
    // }
    await store.appConfiguration.fetchAppConfiguration(buildVersion);
    this.updateApplication('appLaunch');
    this.appStateSubscription = AppState.addEventListener(
      'change',
      this._handleAppStateChange,
    );
    // if (Platform.OS == 'android') {
    //   this.setNotificationConfiguration();
    // }
    this.checkNotificationPermission();
    this.createNotificationListeners();
    this.createDeeplinkListener();


    if (Platform.OS === 'ios') {
      enableScreens(false);
    }

  //   dynamicLinks()
  //   .getInitialLink()
  //   .then(link => {
  //     console.log('Links from firebase', link);
  //     // log.logInfo(JSON.stringify(link));
  //     // this.handleDynamicLink(link);
  //   });
  // //When the application is in the forground state
  // this.dynamicLinksUnsubscribe = dynamicLinks().onLink(
  //   this.handleDynamicLink,
  // );

  }

  handleDynamicLink = async link => {
   console.log('Link',link)
  };


  async checkNotificationPermission() {
    const enabled = await messaging().hasPermission();
    if (enabled === AuthorizationStatus.AUTHORIZED) {
      this.getToken();
    } else {
      this.requestPermission();
    }
  }

  getToken = async () => {
    let fcmToken = await AsyncStore.get(FCM_TOKEN);
    if (!fcmToken) {
      Platform.OS === 'ios' && await messaging().registerDeviceForRemoteMessages();
      fcmToken = await messaging().getToken();
      if (fcmToken) {
        // user has a device token
        await AsyncStore.set(FCM_TOKEN, fcmToken);
      }
    }
    console.log('fcmToken: ', fcmToken);
    this.unsubscribeOnMessage = messaging().onMessage(async message => {
      // process data message
      console.log('notifeeOnMessage', JSON.stringify(message));
      this.onDisplayNotification(message?.notification);
    });

  };

  requestPermission = async () => {
    try {
      let checkPermission;
      let enabled;
      if (
        Platform.OS === 'ios' ||
        (Platform.OS === 'android' && Number(Platform.Version) <= 32)
      ) {
        checkPermission = await messaging().requestPermission();
        enabled = [
          messaging.AuthorizationStatus.AUTHORIZED,
          messaging.AuthorizationStatus.PROVISIONAL,
        ].includes(checkPermission);
      } else {
        checkPermission = await checkAndroidPermission(
          PERMISSION_TYPES.android.POST_NOTIFICATION,
          'Write Permission',
          'Vestige needs access to your notifications',
        );
        enabled = checkPermission?.granted;
      }
      console.log('check noti perm ', checkPermission);

      if (enabled) {
        this.getToken();
      } else if (checkPermission?.message === 'never_ask_again') {
        showToast(
          'Please allow Notification Permission to Vestige.',
          Toast.type.WARNING,
        );
      }
    } catch (error) {
      console.log('permission rejected');
    }
  };

  onDisplayNotification = async data => {
    Platform.OS === 'ios' &&  await notifee.requestPermission()
    // Create a channel
    const channelId = await notifee.createChannel({
      id: 'vestige',
      name: 'vestige Channel',
      importance: AndroidImportance.HIGH,
    });

    // Display a notification
    await notifee.displayNotification({
      ...data,
      android: {
        channelId,
        importance: AndroidImportance.HIGH,
        // pressAction is needed if you want the notification to open the app when pressed
        pressAction: {
          id: 'default',
        },
      },
    });
  };

  async createDeeplinkListener() {
   
    if (Platform.OS === 'ios') {
      dynamicLinks()
      .getInitialLink()
      .then(url => {
        // alert(url);
        if (url) {
          this.handleOpenURL(url);
        }
      });
      // const url = await Linking.getInitialURL();
      // alert(url);
    }
    if (Platform.OS === 'android') {
      // await Linking.getInitialURL().then(async url => {
      //   alert(url);
      //   console.log('Android OS>>>>>>>>>>',url)
 
      //   if (url) {
      //     this.handleOpenURL(url);
      //   }
      // });
      dynamicLinks()
      .getInitialLink()
      .then(url => {
        // alert(url);
        if (url) {
          this.handleOpenURL(url);
        }
      });
    }
    this.linkingSubscription = Linking.addEventListener(
      'url',
      this.handleOpenURL,
    );
  }

  handleOpenURL = url => {
    let query;
    let screen;
    const initialUrl = url?.url ? url.url : url;
    console.log('initial url =>', url);
    if (initialUrl?.includes('referralCode') && !store.auth.authToken) {
      const referralCode = initialUrl.slice(initialUrl.indexOf('=') + 1);
      // alert(11+referralCode);
      screen = 'signup';
      query = {
        referralCode: referralCode,
      };
      const resetAction = CommonActions.navigate({
        name: screen,
        params: query,
      });
      navigationRef.dispatch(resetAction);
    }
  };

  // setNotificationConfiguration() {
  //   const notificationListener = firebase
  //     .notifications()
  //     .onNotification(notification => {
  //       console.log('on notification');
  //       // Process your notification as required
  //       notification.android.setChannelId('vestige');
  //       firebase.notifications().displayNotification(notification);
  //       //_handleNotification(notification);
  //     });
  // }

  async createNotificationListeners() {
    /*
     * If your app is closed, you can check if it was opened by a notification being clicked / tapped / opened as follows:
     * */
    const initialNotification = await messaging().getInitialNotification();
    if (initialNotification) {
      console.log('closed app notification =>', initialNotification);
      this.handleNotificationAction(initialNotification);
    }

    /*
     * If your app is in background, you can listen for when a notification is clicked / tapped / opened as follows:
     * */
    this.notificationOpenedListener = messaging()?.onNotificationOpenedApp(
      openedNotification => {
        console.log('background notification =>', openedNotification);
        this.handleNotificationAction(openedNotification);
      },
    );

    // const notificationListener = firebase
    //   .notifications()
    //   .onNotification(async notification => {
    //     if (Platform.OS === 'ios') {
    //       if (notification.data?.fcm_options?.image) {
    //         const res = await RNFetchBlob
    //           .config({ fileCache: true, appendExt: 'jpg' })
    //           .fetch('GET', notification.data?.fcm_options?.image);
    //         notification.ios.addAttachment('1', res.path());
    //       }
    //     }
    //     if (Platform.OS === 'android') {
    //       if (this.state.appState == 'active') {
    //         notification.android.setAutoCancel(true)
    //         const channel = new firebase.notifications.Android.Channel('vestige', 'vestige', firebase.notifications.Android.Importance.Max)
    //           .setDescription('Notification Channel ID');

    //         // Create the channel
    //         firebase.notifications().android.createChannel(channel);
    //         // try {
    //         //   let customizedNotification = new firebase.notifications.Notification({
    //         //     sound: 'default',
    //         //     show_in_foreground: true
    //         //   });
    //         //   customizedNotification = customizedNotification.setNotificationId(notification.notificationId)
    //         //     .setTitle(notification.title === undefined ? 'NA' : notification.title.toString())
    //         //     .setBody(notification.body.toString())
    //         //     .setData(notification.data)
    //         //     .android.setBigPicture(notification?.android.bigPicture.picture)
    //         //     .android.setLargeIcon(notification?.android.largeIcon);
    //         //   customizedNotification.android.setAutoCancel(notification.autoCancel === undefined ? true : notification.autoCancel);
    //         //   customizedNotification.android.setColor('black');
    //         //   customizedNotification.android.setPriority(firebase.notifications.Android.Priority.High);
    //         //   customizedNotification.android.setChannelId('vestige');
    //         //   firebase.notifications().displayNotification(customizedNotification);
    //         // } catch (exception) {
    //         //   console.log("Exception: ---> " + exception);
    //         // }

    //         //   const notifications = new firebase.notifications.Notification()
    //         //   .setNotificationId(notification.notificationId)
    //         //   .setTitle(notification.title)
    //         //   .setSound("default")
    //         //   .setBody(notification.body)

    //         // // if android
    //         // notifications.android.setSmallIcon(IMAGE_LOGO)
    //         //   .android.setChannelId('vestige')
    //         //   .android.setPriority(firebase.notifications.Android.Priority.High)
    //         //   .android.setColor('red')
    //         //   .android.setVibrate(500)
    //         //   .android.setLargeIcon(notification?.android.largeIcon);

    //         // // show notification
    //         // firebase.notifications()
    //         //   .displayNotification(notification)
    //         //   .then(x => { resolve() })
    //         //   .catch(err => console.log(err));
    //         // })
    //       }
    //     }
    //     else if (Platform.OS === 'ios') {
    //       const localNotification = new firebase.notifications.Notification()
    //         .setNotificationId(notification.notificationId)
    //         .setTitle(notification.title)
    //         .setSubtitle(notification.subtitle)
    //         .setBody(notification.body)
    //         .setData(notification.data);
    //       localNotification.ios.setBadge(notification.ios.badge);
    //       // .ios.addAttachment(notification.ios.attachments);
    //       localNotification.ios.attachments = notification.ios.attachments//[attetch]
    //       firebase.notifications()
    //         .displayNotification(localNotification);
    //     }
    //     // Process your notification as required
    //     // firebase.notifications().displayNotification(notification);
    //     //_handleNotification(notification);
    //   });
    // const messageListener = firebase.messaging().onMessage(message => {
    //   // alert(JSON.stringify(message));
    // });
  }

  handleNotificationAction = async payload => {
    console.log('notification action data =>', payload.data);
    const { data, notification, messageId } = payload || {};
    const notificationData = {
      distributorId: store.auth.distributorID,
      firebaseId: messageId || data?.Id || '',
      notificationMessage: notification?.body?.toString() || '',
      notificationTitle: notification?.title || '',
      notificationMode: data?.Id ? 'Admin' : 'Application',
      imageUrl: notification?.android?.imageUrl || '',
    };

    store.auth.savePushNotification(notificationData);

    if (store.auth.authToken && !isNullOrEmpty(data?.screen)) {
      let query;
      let screen;
      let orderObject = '';

      if (data?.orderNumber) {
        console.log('notif order data =>', JSON.stringify(data));
        const isApiV2 = data?.orderCreatedBy === 'Web_V2';
        const fetchSingleOrder = isApiV2
          ? Urls.ServiceEnum.FetchSingleOrderApiV2
          : Urls.ServiceEnum.FetchSingleOrder;
        const url = `${fetchSingleOrder}/${store.auth.distributorID}?customerOrderNumber=${data.orderNumber}`;
        const res = await NetworkOps.get(url);
        if (!res.message) {
          orderObject = res;
        }
      }

      switch (data?.screen) {
        case 'ProductList':
          screen = 'productList';
          query = {
            title: data?.title,
            param: data?.categoryId,
          };
          break;
        case 'ProductDetail':
          screen = 'productDetails';
          query = {
            skuCode: data?.skuCode,
            locationId: store.profile.defaultCater.locationId,
          };
          break;
        case 'Cart':
          screen = 'MyCart';
          break;
        case 'OrderDetails':
          screen = 'orderView';
          query = {
            item: orderObject?.length > 0 ? orderObject[0] : orderObject,
          };
          break;
        default:
          query = undefined;
          break;
      }

      // const resetAction = CommonActions.reset({
      //   index: 0,
      //   // actions: [
      //   //   CommonActions.navigate({ routeName: screen, params: query})
      //   // ]
      //   routes: [{ name: screen, params: query }],
      // });
      // console.log('check')
      // navigationRef.dispatch(resetAction);
      // navigateAndReset(0, 'Dashboard');
      navigate(screen, query);
    }
  };

  updateApplication = async (launchOptions: string) => {
    const buildVersion = await DeviceInfo.getVersion();
    const response = await store.profile.fetchAppVersion(buildVersion);
    if (response && response.osType) {
      if (Platform.OS == 'ios') {
        store.auth.setIsSignupEnabled(response.isSignupEnabled);
      }
      if (
        response.infoMessage &&
        !store.auth.authToken &&
        launchOptions === 'appLaunch'
      ) {
        if (!this.state.alertPresent) {
          this.setState({ alertPresent: true });
          AlertClass.showAlert('', response.infoMessage, [
            {
              text: strings.commonMessages.ok,
              onPress: () => {
                this.setState({ alertPresent: false });
              },
            },
          ]);
        }
      } else if (!response.infoMessage && response.updateType) {
        switch (response.updateType) {
          case 1: {
            if (!this.state.alertPresent) {
              this.setState({ alertPresent: true });
              AlertClass.showAlert('', response.message, [
                {
                  text: strings.commonMessages.skip,
                  onPress: () => {
                    this.setState({ alertPresent: false });
                  },
                },
                {
                  text: strings.commonMessages.update,
                  onPress: () => {
                    this.setState({ alertPresent: false });
                    Linking.openURL(response.appUrl);
                  },
                },
              ]);
            }
            break;
          }
          case 2: {
            if (!this.state.alertPresent) {
              this.setState({ alertPresent: true });
              AlertClass.showAlert('', response.message, [
                {
                  text: strings.commonMessages.update,
                  onPress: () => {
                    this.setState({ alertPresent: false });
                    Linking.openURL(response.appUrl);
                  },
                },
              ]);
            }
            break;
          }
          default:
        }
      }
    }
  };

  componentWillUnmount() {
    this.appStateSubscription?.remove?.();
    this.linkingSubscription?.remove?.();
    this.unsubscribeOnMessage?.();
    this.unsubscribeConnectionListener?.();
    this.notificationDisplayedListener?.();
    this.notificationListener?.();
    this.notificationOpenedListener?.();
    // this.dynamicLinksUnsubscribe && this.dynamicLinksUnsubscribe;
  }

  _handleAppStateChange = async nextAppState => {
    if (
      this.state.appState.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      console.log('App has come to the foreground!');
      this.updateApplication('forgroundLaunch');
    }
    this.state.appState = nextAppState;
  };

  // actionPress = () => {
  //   const navigateAction = CommonActions.navigate({
  //     name: 'youtubeListing',
  //     params: {
  //       uri: 'https://myvestige.freshdesk.com',
  //       screenTitle: 'Quick Support',
  //     },
  //     action: [CommonActions.navigate({ name: 'youtubeListing' })],
  //   });
  //   navigationRef.dispatch(navigateAction);
  // };

  render() {
    const { checkedSignIn, countryCode } = this.state;
    if (!checkedSignIn) {
      return (
        <View style={{ margin: 0 }}>
          <Image
            style={
              Platform.OS === 'android'
                ? { flex: 1 }
                : { width: width, height: height }
            }
            resizeMode="contain"
            source={SPLASH}
          />
        </View>
      );
    }

    const Layout = createRootNavigator;
    return (
      <RootSiblingParent>
        <Provider {...store}>
          <>
            <SafeAreaView style={styles.container}>
              <Layout auth={store.auth} profile={store.profile} />
            </SafeAreaView>
            {/* <FloatingButton onActionPress={this.actionPress} /> */}
          </>
        </Provider>
      </RootSiblingParent>
    );
  }
}

// Starting Screen CSS
const styles = StyleSheet.create({
  container: {
    flex: 1,
    // overflow: Platform.OS === 'android' ? 'hidden' : 'visible',
  },
});
