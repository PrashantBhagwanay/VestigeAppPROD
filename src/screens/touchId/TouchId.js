import React, { Component } from 'react';
import {
  Text,
  View,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { Specs } from 'app/src/utility/Theme';
import TouchID from 'react-native-touch-id';
import { observer, inject } from 'mobx-react';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { CustomButton } from 'app/src/components/buttons/Button';
import { strings } from 'app/src/utility/localization/Localized';
import * as AsyncStore from 'app/src/utility/AsyncStoragesUtils';
import { UserRole } from 'app/src/utility/constant/Constants';
import { NativeModules } from 'react-native';

const optionalConfigObject = {
  title: 'Authentication Required', // Android
  imageColor: '#e00606', // Android
  imageErrorColor: '#ff0000', // Android
  sensorDescription: 'Touch sensor', // Android
  sensorErrorDescription: 'Failed', // Android
  cancelText: 'Cancel', // Android
  fallbackLabel: 'Show Passcode', // iOS (if empty, then label is hidden)
  unifiedErrors: false, // use unified error messages (default false)
  passcodeFallback: false, // iOS - allows the device to fall back to using the passcode, if faceid/touch is not available. this does not mean that if touchid/faceid fails the first few times it will revert to passcode, rather that if the former are not enrolled, then it will use the passcode.
};
const FACE_IMAGE = require('app/src/assets/images/emptyScreen/face_id.png');
const TOUCH_IMAGE = require('app/src/assets/images/emptyScreen/Touch_ID.png');

@inject('auth', 'profile')
@observer
class TouchScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      biometryType: '',
      isPopupVisible: false,
    };
  }

  navigate = () =>
    setTimeout(async () => {
      let navigateOptions;
      const { params } = this.props.route;
      const isGuestUser = this.props.auth.userRole === UserRole.GuestUser;

      if (params && params.query && params.screen) {
        await this.props.profile.fetchProfile();
        const { query, screen } = params;
        query.locationId = this.props.profile.defaultCater.locationId;
        navigateOptions = CommonActions.reset({
          index: 0,
          // actions: [
          //   CommonActions.navigate({ routeName: screen, params: query})
          // ]
          routes: [{ name: screen, params: query }],
        });
      } else {
        navigateOptions = CommonActions.reset({
          index: 0,
          // actions: [
          //   CommonActions.navigate({ name: 'dashboard'})
          //   // CommonActions.navigate({ name: 'Shopping'})
          // ]
          routes: [{ name: 'dashboard' }],
        });
      }
      this.props.navigation.dispatch(navigateOptions);
    }, 500);

  async componentDidMount() {
    // await this.props.profile.fetchProfile();
    const isTouchId = await AsyncStore.get('isTouchId');
    if (isTouchId === 'No') {
      return this.navigate();
    }
    await this.isTouchIdSupported();
    try {
      const res = await TouchID.isSupported();
      this.setState({
        biometryType: res,
      });
    } catch (err) {
      console.log('touch eror', err);
      // this.navigate()
    }
  }

  isTouchIdSupported = async () => {
    const isTouchId = await AsyncStore.get('isTouchId');
    TouchID.isSupported()
      .then(biometryType => {
        if (Platform.OS === 'android') {
          // this.authenticateTouchId()
          !isTouchId && this.setState({ isPopupVisible: true });
        } else {
          if (biometryType === 'FaceID' || biometryType === 'TouchID') {
            // this.authenticateTouchId()
            !isTouchId && this.setState({ isPopupVisible: true });
          } else {
            this.navigate();
          }
        }
      })
      .catch(error => {
        // Failure code if the user's device does not have touchID or faceID enabled
        this.navigate();
        console.log('touch check error', error);
        // this.setState({ showAuthModal: false})
      });
  };

  authenticateTouchId() {
    this.setState({ isPopupVisible: false });
    TouchID.authenticate('Scan Finger', optionalConfigObject)
      .then(success => {
        this.navigate();
        this.setState({ isPopupVisible: false });
        // this.setState({ showAuthModal: false })
        // AlertIOS.alert('Authenticated Successfully');
      })
      .catch(error => {
        console.log(error);
      });
  }

  onChange = async val => {
    await AsyncStore.set('isTouchId', val);
    if (val === 'Yes') {
      this.authenticateTouchId();
      return;
    }
    this.setState({ isPopupVisible: false });
    this.navigate();
  };

  render() {
    const { biometryType, isPopupVisible } = this.state;
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        {!isPopupVisible && (
          <>
            {Platform.OS === 'android' ? (
              <Image resizeMode="cover" source={TOUCH_IMAGE} />
            ) : (
              <Image
                resizeMode="cover"
                source={biometryType === 'TouchID' ? TOUCH_IMAGE : FACE_IMAGE}
              />
            )}
            <Text style={styles.errorHeading}>Vestige App Locked</Text>
            {Platform.OS === 'android' ? (
              <Text style={styles.errorText}>
                {strings.touchIdSCreen.touchIdTitle}
              </Text>
            ) : (
              <Text style={styles.errorText}>
                Unlock with
                {biometryType === 'TouchID' ? 'Touch' : 'Face'} ID to open the
                App
              </Text>
            )}

            <TouchableOpacity
              style={styles.buttonContainer}
              onPress={() => this.authenticateTouchId()}>
              {Platform.OS === 'android' ? (
                <Text style={styles.buttonText}>
                  {strings.touchIdSCreen.useTouch}
                </Text>
              ) : (
                <Text style={styles.buttonText}>
                  Use
                  {biometryType === 'TouchID' ? 'Touch' : 'Face'} ID
                </Text>
              )}
            </TouchableOpacity>
          </>
        )}
        <Modal
          transparent
          // animationType="slide"
          visible={isPopupVisible}
          onRequestClose={() => this.setState({ isPopupVisible: false })}>
          <View style={styles.background}>
            <View style={styles.modelContainer}>
              <Text style={styles.touchIdText}>
                {strings.touchIdSCreen.touchIdPermission}
              </Text>
              <View
                style={{
                  justifyContent: 'space-between',
                  flexDirection: 'row',
                }}>
                <CustomButton
                  {...this.props}
                  handleClick={() => this.onChange(strings.commonMessages.yes)}
                  linearGradient
                  buttonContainer={styles.button}
                  buttonTitle={strings.commonMessages.yes}
                  buttonTitleStyle={styles.customButtonTitleStyle}
                  primaryColor="#58cdb4"
                  secondaryColor="#58cdb4"
                  accessibilityHint="to_use_touch_id_yes"
                  accessibilityLabel="to_use_touch_id_yes"
                />
                <CustomButton
                  {...this.props}
                  handleClick={() => this.onChange(strings.commonMessages.no)}
                  linearGradient
                  buttonContainer={styles.button}
                  buttonTitle={strings.commonMessages.no}
                  buttonTitleStyle={styles.customButtonTitleStyle}
                  primaryColor="#6895d4"
                  secondaryColor="#57a5cf"
                  accessibilityHint="to_use_touch_id_no"
                  accessibilityLabel="to_use_touch_id_no"
                />
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }
}

export default TouchScreen;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modelContainer: {
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 5,
  },
  buttonContainer: {
    marginTop: 30,
    // width:200,
    minHeight: 30,
    marginHorizontal: 20,
    paddingHorizontal: 10,
    backgroundColor: '#14aa93',
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#979797',
  },
  touchIdText: {
    ...Specs.fontSemibold,
    fontSize: 14,
  },
  buttonText: {
    ...Specs.fontSemibold,
    color: '#ffffff',
    fontSize: 14,
  },
  errorHeading: {
    fontSize: 22,
    ...Specs.fontSemibold,
    color: '#3f4967',
    marginHorizontal: 20,
    textAlign: 'center',
    marginTop: 15,
  },
  errorText: {
    fontSize: 14,
    ...Specs.fontRegular,
    color: '#3f4967',
    marginHorizontal: 20,
    textAlign: 'center',
    marginTop: 15,
  },
  customButtonTitleStyle: {
    fontSize: 14,
    color: '#FFFFFF',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  button: {
    width: '30%',
    marginTop: 10,
  },
});
