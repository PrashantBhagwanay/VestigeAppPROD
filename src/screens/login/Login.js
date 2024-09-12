import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
  SafeAreaView,
  Platform,
  NativeModules,
  Alert,
  Linking,
} from 'react-native';
import { Specs } from 'app/src/utility/Theme';
import { observer, inject } from 'mobx-react'; // importing the mobx from the library
import { CustomButton, RadioButton } from 'app/src/components/buttons/Button';
import { strings } from 'app/src/utility/localization/Localized';
import AlertClass from 'app/src/utility/AlertClass';
import { Toast } from 'app/src/components/toast/Toast';
import autobind from 'autobind-decorator';
import Geolocation from '@react-native-community/geolocation';
import * as AsyncStore from 'app/src/utility/AsyncStoragesUtils';
import {
  SIGNUP_ROUTE,
  LOGIN_KEY_ENUM,
} from 'app/src/utility/constant/Constants';
import { observable, makeObservable, runInAction } from 'mobx';
// import { trackEvent } from 'app/src/utility/AnalyticsUtils';
import { LOGIN_BUTTON_PRESS } from 'app/src/utility/GAEventConstants';
import RNOtpVerify from 'react-native-otp-verify';
import * as Permissions from '../../utility/permissions/Permissions';
import Loader from '../../components/loader/Loader';
import {
  getUniqueID,
  getIOSDeviceID,
  getDeviceModel,
  promptToOpenSettings,
  connectedToInternet,
  isNullOrEmpty,
} from '../../utility/Utility';
import CustomInput from '../../components/CustomInput';

// Illustration image
const FOOTER_BACKGROUND_IMAGE = require('../../assets/images/Splash/footerBackground.png');

// Password, profile icons
const passwordIcon = require('../../assets/images/Signup/password.png');
const userIcon = require('../../assets/images/Signup/profile.png');

const logo = require('../../assets/images/logo/logo.png');

const options = ['Password', 'Verification code'];

@inject('auth', 'profile', 'location', 'appConfiguration')
@observer
class Login extends Component {
  @observable otp1;
  @observable otp2;
  @observable latitude = 0.0;
  @observable longitude = 0.0;

  constructor(props) {
    super(props);
    makeObservable(this);
    this.state = {
      distributorIdMobileInput: '',
      distributorPasswordInput: '',
      distributorOtpInput: '',
      showMobileLoader: false,
      sendOtpMessage: '',
      sendOtpLabel: '',
      deviceIDiOS: '',
      isOtpOnCallActive: 0,
      otpSentCount: 0,
      selectedLoginType: LOGIN_KEY_ENUM.password,
      securePassword: true,
      secureOtp: true,
    };
  }

  async componentDidMount() {
    this.props.auth.setNavigation(this.props.navigation);
    // this.selectedLoginType = LOGIN_KEY_ENUM.password
    // this.props.navigation.navigate('kycImage', {isLoginRoute : true})
    if (Platform.OS == 'ios') {
      this.getDeviceIDiOS();
    }
    await this.getGeoLocation();
    // this.getHash()
    if (Platform.OS === 'android') {
      RNOtpVerify.getOtp()
        .then(p => RNOtpVerify.addListener(this.otpHandler))
        .catch(p => console.log(p));
    }
  }
  // getHash = () =>
  //   RNOtpVerify.getHash()
  //     .then(data => console.log('hash',data) )
  //     .catch(console.log);

  async getGeoLocation() {
    const permissionType =
      Platform.OS === 'android'
        ? Permissions.PERMISSION_TYPES.android.LOCATION
        : Permissions.PERMISSION_TYPES.ios.LOCATION;
    const response = await Permissions.requestPermission(permissionType);
    if (response === Permissions.StatusEnum.GRANTED) {
      Geolocation.getCurrentPosition(
        async position => {
          // console.log('checkposition', position);
          runInAction(() => {
            this.latitude = position.coords.latitude;
            this.longitude = position.coords.longitude;
          });
        },
        e => {
          // this.showToast(strings.errorMessage.location.enableLocation,Toast.type.ERROR)
        },
      );
    } else if (response === Permissions.StatusEnum.BLOCKED) {
      promptToOpenSettings(
        strings.errorMessage.location.locationPermission1,
        strings.errorMessage.location.locationPermission2,
      );
    } else {
      runInAction(() => {
        this.latitude = 0.0;
        this.longitude = 0.0;
      });
    }
  }

  async getDeviceIDiOS() {
    const getId = await getIOSDeviceID();
    if (getId != null) {
      this.setState({
        deviceIDiOS: getId,
      });
    }
  }

  otpHandler = (message: string) => {
    if (message) {
      try {
        const otp = /(\d{4})/g.exec(message)[1];
        this.setState({ secureOtp: false });
        if (otp) {
          this.setState({ distributorOtpInput: otp });
        }
        Keyboard.dismiss();
      } catch (error) {
        console.log(JSON.stringify(error));
      }
    }
  };

  componentWillUnmount() {
    Platform.OS === 'android' && RNOtpVerify.removeListener();
  }

  handleDistributorIdMobileInput = value => {
    if (value.length === 8 || value.length === 10) {
      this.setState({
        sendOtpLabel: strings.loginScreen.sendOtp,
        distributorIdMobileInput: value,
      });
    } else {
      this.setState({
        distributorIdMobileInput: value,
        sendOtpLabel: '',
        isOtpOnCallActive: 0,
        otpSentCount: 0,
      });
    }
  };

  handlePasswordInput = value => {
    this.state.selectedLoginType === LOGIN_KEY_ENUM.password
      ? this.setState({ distributorPasswordInput: value })
      : this.setState({ distributorOtpInput: value });
  };

  /**
   * @function toggle radio button here
   */
  radioButton = async index => {
    Keyboard.dismiss();
    const selectedType = options[index];
    switch (selectedType) {
      case LOGIN_KEY_ENUM.password: {
        if (selectedType !== this.state.selectedLoginType) {
          this.setState({
            distributorIdMobileInput: '',
            distributorPasswordInput: '',
            securePassword: true,
          });
          clearTimeout(this.otp1);
          clearTimeout(this.otp2);
        }
        break;
      }
      case LOGIN_KEY_ENUM.otp: {
        if (selectedType !== this.state.selectedLoginType) {
          this.setState({
            distributorIdMobileInput: '',
            distributorOtpInput: '',
            showMobileLoader: false,
            sendOtpMessage: '',
            sendOtpLabel: '',
            secureOtp: true,
          });
        }
        break;
      }
      default: {
        break;
      }
    }
    this.setState({ selectedLoginType: selectedType });
  };

  sendOtp = async () => {
    const { distributorIdMobileInput } = this.state;
    if (
      distributorIdMobileInput &&
      distributorIdMobileInput.length !== 8 &&
      distributorIdMobileInput.length !== 10
    ) {
      AlertClass.showAlert(
        '',
        strings.loginScreen.validMobileAlert,
        [
          {
            text: strings.commonMessages.ok,
            onPress: () => console.log('OK Pressed'),
          },
        ],
        true,
      );
      return;
    }
    this.setState({
      showMobileLoader: true,
      sendOtpLabel: '',
      sendOtpMessage: '',
    });

    const otpData = {
      mobileNumber: distributorIdMobileInput, // both mobile number or distributor id can go here
      deviceId:
        Platform.OS == 'android' ? await getUniqueID() : this.state.deviceIDiOS,
      isOtpOnCall: false, // used to seperate otp via call or sms
    };

    const resOtp = await this.props.auth.requestOTP(otpData);
    if (resOtp.success) {
      this.setState(prevState => ({
        otpSentCount: prevState.otpSentCount + 1,
        isOtpOnCallActive: Number(resOtp.data?.isOtpOnCallActive) || 0,
      }));
      this.otp1 = setTimeout(() => {
        this.setState({
          sendOtpMessage: strings.loginScreen.sendOtpMessage,
          showMobileLoader: false,
          sendOtpLabel: '',
        });
      }, 1500);
      this.otp2 = setTimeout(() => {
        this.setState({
          sendOtpMessage: strings.loginScreen.resendOtpMessage,
          sendOtpLabel: strings.loginScreen.resendOtp,
        });
      }, 6000);
    } else {
      this.setState({
        showMobileLoader: false,
        sendOtpLabel: strings.loginScreen.sendOtp,
      });
      this.showToast(resOtp.message, Toast.type.ERROR);
    }
    // else {
    //   this.otp3 = setTimeout(()=>{
    //     this.setState({
    //       showMobileLoader: false,
    //       sendOtpLabel: strings.loginScreen.resendOtp
    //     });
    //   },2000);
    //   this.otp4 = setTimeout(()=>{
    //     this.setState({
    //       sendOtpMessage: strings.loginScreen.resendOtpMessage
    //     })
    //   },3500)
    // }
  };

  handleOtpOnCall = async () => {
    const { distributorIdMobileInput, otpSentCount } = this.state;
    if (
      distributorIdMobileInput &&
      distributorIdMobileInput.length !== 8 &&
      distributorIdMobileInput.length !== 10
    ) {
      AlertClass.showAlert(
        '',
        strings.loginScreen.validMobileAlert,
        [
          {
            text: strings.commonMessages.ok,
            onPress: () => console.log('OK Pressed'),
          },
        ],
        true,
      );
      return;
    }
    const otpData = {
      mobileNumber: distributorIdMobileInput, // both mobile number or distributor id can go here
      deviceId:
        Platform.OS == 'android' ? await getUniqueID() : this.state.deviceIDiOS,
      isOtpOnCall: true, // used to seperate otp via call or sms
    };

    const resOtp = await this.props.auth.requestOTP(otpData, true);
    if (resOtp.success) {
      this.showToast(strings.loginScreen.otpOnCallMessage, Toast.type.SUCCESS);
    } else {
      this.showToast(resOtp.message, Toast.type.ERROR);
    }
  };

  navigateToSignup = () => {
    const { navigation } = this.props;
    this.props.auth.setSignupRoutePath(SIGNUP_ROUTE.LOGIN_ROUTE);
    navigation.navigate('signup');
  };

  @autobind
  showToast(message: string, type: Toast.type) {
    // Add a Toast on screen.
    Toast.show(message, {
      duration: Toast.durations.SHORT,
      type: type,
      shadow: false,
      animation: true,
      hideOnPress: true,
      delay: 0,
    });
  }

  isValidate = () => {
    const {
      distributorIdMobileInput,
      distributorPasswordInput,
      distributorOtpInput,
    } = this.state;
    if (
      distributorIdMobileInput.length !== 8 &&
      distributorIdMobileInput.length !== 10 &&
      distributorIdMobileInput.length !== 12
    ) {
      this.showToast(
        strings.loginScreen.distributorIdErrorMessage,
        Toast.type.ERROR,
      );
      return false;
    }
    if (
      (this.state.selectedLoginType === LOGIN_KEY_ENUM.password &&
        distributorPasswordInput.length < 1) ||
      distributorPasswordInput.length > 20
    ) {
      this.showToast(
        strings.loginScreen.passwordErrorMessage,
        Toast.type.ERROR,
      );
      return false;
    }
    if (
      (this.state.selectedLoginType === LOGIN_KEY_ENUM.otp &&
        distributorOtpInput.length < 4) ||
      distributorOtpInput.length > 4
    ) {
      this.showToast(strings.loginScreen.otpErrorMessage, Toast.type.ERROR);
      return false;
    }
    return true;
  };

  /**
   * @description show password
   * @param passwordField return {true,false}
   * @param passwordInput return {password, confirm_password key for the input fields }
   */
  showHidePassword = (passwordInput, passwordField) => {
    if (passwordInput === LOGIN_KEY_ENUM.otp) {
      this.setState({
        secureOtp: passwordField,
      });
    } else {
      this.setState({
        securePassword: passwordField,
      });
    }
  };

  async validateUser() {
    // trackEvent(LOGIN_BUTTON_PRESS.eventCategory, LOGIN_BUTTON_PRESS.events.NAVIGATE);
    if (this.isValidate()) {
      const isInternetConnected = await connectedToInternet();
      if (!isInternetConnected) {
        this.showToast(
          strings.errorMessage.internetConnection.noInternetConnectionShort,
          Toast.type.ERROR,
        );
        return;
      }
      const {
        distributorIdMobileInput,
        distributorPasswordInput,
        distributorOtpInput,
      } = this.state;

      let user = {};
      if (this.state.selectedLoginType === LOGIN_KEY_ENUM.password) {
        user = {
          username: distributorIdMobileInput,
          password: distributorPasswordInput,
          deviceName: await getDeviceModel(),
          deviceId:
            Platform.OS == 'android'
              ? await getUniqueID()
              : this.state.deviceIDiOS,
          userType: 'Distributor',
          latitude: this.latitude,
          longitude: this.longitude,
          appType: 'GL',
          authenticationType: '1',
        };
      } else {
        user = {
          username: distributorIdMobileInput,
          password: distributorOtpInput,
          otpStatus: true,
          deviceId:
            Platform.OS == 'android'
              ? await getUniqueID()
              : this.state.deviceIDiOS,
          userType: 'Distributor',
          deviceName: await getDeviceModel(),
          latitude: this.latitude,
          longitude: this.longitude,
          appType: 'GL',
          authenticationType: '2',
        };
      }
      const res = await this.props.auth.login(user);
     
      if (this.props.auth.isTokenAvailable) {
        // if(!this.props.profile.activeAddress.addressType) {
        //   this.props.location.setLocationRoutePath(LOCATION_ROUTE_PATH.next)
        //   this.props.navigation.navigate('location');
        // }
        // else

        if (this.props.auth.isRegistrationCompleted == '0') {
          this.props.navigation.navigate('completeRegistration');
        } else if (
          !this.props.appConfiguration.isKycSkippable &&
          this.props.auth.isKyc == '0'
        ) {
          
          // Navigation will occur in unprotected route's screen from app router. (to handle cases of requirement)
          this.props.navigation.navigate('kycImage', { isLoginRoute: true });
        }

        //.........Commented as new react navigation flow will automatically switch navigator......
        // else if (this.props.profile.countryId == 2) {
        //   this.props.navigation.navigate('configurableDashboard');
        // } else {
        //   this.props.navigation.navigate('main');
        // }

        // }
      } else if (
        LOGIN_KEY_ENUM.deviceNotRegistered.includes(res.statusmsg) ||
        res.statusmsg === LOGIN_KEY_ENUM.mobileNotRegistered
      ) {
        // AlertClass.showAlert('Message',
        //   res.message,
        //   [{
        //     text: "Cancel",
        //     onPress: () => {
        //     }
        //   },{text: strings.commonMessages.ok, onPress: () => {
        //     this.props.navigation.navigate('loginConfirmDeviceOtp', {
        //       userData: user,
        //       message: res.message,
        //       statusmsg: res.statusmsg,
        //       loginData: res.data
        //     })
        //   }}])
        this.props.navigation.navigate('loginConfirmDeviceOtp', {
          userData: user,
          message: res.message,
          statusmsg: res.statusmsg,
          loginData: res.data,
        });
      } else {
        AlertClass.showAlert('Message', res.message, [
          {
            text: strings.commonMessages.ok,
            onPress: () => console.log('Ok Pressed'),
          },
        ]);
      }
    }
  }

  renderOtpOnCall = () => {
    const { distributorIdMobileInput, isOtpOnCallActive, otpSentCount } =
      this.state;
    const { onCallOtpLimit } = this.props.appConfiguration;
    if (
      isOtpOnCallActive &&
      otpSentCount >= onCallOtpLimit &&
      (distributorIdMobileInput?.length === 8 ||
        distributorIdMobileInput?.length === 10)
    ) {
      return (
        <Text style={styles.otpOnCall} onPress={() => this.handleOtpOnCall()}>
          {strings.loginScreen.otpOnCallText}
        </Text>
      );
    }
    return null;
  };

  otpLogin = () => {
    const {
      distributorIdMobileInput,
      distributorOtpInput,
      showMobileLoader,
      sendOtpMessage,
      sendOtpLabel,
    } = this.state;
    return (
      <View>
        <View style={{ height: 30 }}>
          <Text style={styles.sendOtpTextMessage}>{sendOtpMessage}</Text>
        </View>
        <View style={{ justifyContent: 'center' }}>
          <CustomInput
            keyboardType="numeric"
            placeholder={strings.loginScreen.distributorIdMobile}
            icon={userIcon}
            marginHorizontal={17}
            maxLength={10}
            value={distributorIdMobileInput}
            onChangeText={this.handleDistributorIdMobileInput}
            showMobileLoader={showMobileLoader}
          />
          <Text onPress={() => this.sendOtp()} style={styles.sendOtpLabelStyle}>
            {sendOtpLabel}
          </Text>
        </View>
        <View style={{ height: 20 }} />
        <CustomInput
          secureEntry={this.state.secureOtp}
          showPassword
          showPasswordPress={value =>
            this.showHidePassword(this.state.selectedLoginType, !value)
          }
          keyboardType="numeric"
          placeholder={strings.loginScreen.distributorOTP}
          icon={passwordIcon}
          marginHorizontal={17}
          maxLength={4}
          value={distributorOtpInput}
          onChangeText={value => this.handlePasswordInput(value)}
        />
        <View style={[styles.otpForgotPasswordContainer, { marginTop: 1 }]}>
          <Text style={styles.forgotPasswordStyle}>{` `}</Text>
        </View>
      </View>
    );
  };

  passwordLogin = navigation => {
    const { distributorIdMobileInput, distributorPasswordInput } = this.state;
    return (
      <View>
        <View style={{ height: 30 }} />
        <View style={{ justifyContent: 'center' }}>
          <CustomInput
            keyboardType="numeric"
            placeholder={strings.loginScreen.distributorId}
            icon={userIcon}
            marginHorizontal={17}
            maxLength={12}
            value={distributorIdMobileInput}
            onChangeText={this.handleDistributorIdMobileInput}
          />
        </View>
        <View style={{ height: 20 }} />
        <CustomInput
          secureEntry={this.state.securePassword}
          showPassword
          showPasswordPress={value =>
            this.showHidePassword(this.state.selectedLoginType, !value)
          }
          placeholder={strings.loginScreen.distributorPassword}
          icon={passwordIcon}
          marginHorizontal={17}
          maxLength={20}
          value={distributorPasswordInput}
          onChangeText={value => this.handlePasswordInput(value)}
        />
        <View style={styles.otpForgotPasswordContainer}>
          <Text
            style={styles.forgotPasswordStyle}
            onPress={() => navigation.navigate('forgotPassword')}>
            {strings.loginScreen.forgotPassword}
          </Text>
        </View>
      </View>
    );
  };

  render() {
    const { distributorIdMobileInput, distributorPasswordInput } = this.state;
    const { navigation } = this.props;
    const isEnabled = distributorPasswordInput && distributorIdMobileInput;
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.signInContainer}>
          <View>
            <Loader loading={this.props.auth.isLoading} />
            <Image style={styles.signInLogoContainer} source={logo} />

            <View style={styles.radioButtonContainer}>
              <Text style={styles.signInTextStyle}>
                {strings.loginScreen.ButtonSignIn}
              </Text>
              {options.map((option, i) => (
                <RadioButton
                  key={i.toString()}
                  buttonText={option}
                  onPress={() => this.radioButton(i)}
                  selectedValue={this.state.selectedLoginType}
                  radioContainerStyles={ i === 1 && { flex: 1 }}
                />
              ))}
            </View>
            {/* { this.state.selectedLoginType === LOGIN_KEY_ENUM.otp? this.otpLogin(navigation) : this.passwordLogin(navigation) } */}
            {this.state.selectedLoginType === LOGIN_KEY_ENUM.otp &&
              this.otpLogin(navigation)}
            {this.state.selectedLoginType === LOGIN_KEY_ENUM.password &&
              this.passwordLogin(navigation)}
            {this.state.selectedLoginType === LOGIN_KEY_ENUM.otp &&
              this.renderOtpOnCall()}
            <CustomButton
              {...this.props}
              isDisabled={!isEnabled}
              handleClick={() => this.validateUser()}
              linearGradient
              buttonContainer={styles.button}
              buttonTitle={strings.loginScreen.buttonLogin}
              buttonTitleStyle={styles.customButtonTitleStyle}
              primaryColor="#6895d4"
              secondaryColor="#57a5cf"
              accessibilityLabel="Login_Button"
            />
            <CustomButton
              {...this.props}
              handleClick={() => this.props.navigation.navigate('guestUser')}
              linearGradient
              buttonContainer={styles.button}
              buttonTitle={
                Platform.OS === 'android'
                  ? 'Login as a Guest'
                  : 'Guest/Easy Sign In'
              }
              buttonTitleStyle={styles.customButtonTitleStyle}
              primaryColor="#58cdb4"
              secondaryColor="#58cdb4"
              accessibilityHint="navigate to Guest user form"
              accessibilityLabel="Navigate_To_Guest_User_Login_Screen"
            />
            {Platform.OS === 'android' ||
            this.props.auth.isSignupEnabled == true ? (
              <View style={{ marginLeft: 'auto', marginRight: 'auto' }}>
                <Text style={styles.footerTitle}>
                  {strings.loginScreen.footerTitle}
                  <Text
                    onPress={this.navigateToSignup}
                    style={styles.signUpLabel}>
                    {` ${strings.loginScreen.signUpLabel}`}
                  </Text>
                </Text>
              </View>
            ) : null}
          </View>
          <Image
            style={styles.footerBackgroundImage}
            resizeMode="contain"
            source={FOOTER_BACKGROUND_IMAGE}
          />
        </View>
      </TouchableWithoutFeedback>
    );
  }
}

export default Login;
/**
 * @description Login Screen Style defined here
 */
const styles = StyleSheet.create({
  signInContainer: {
    flex: 1,
    backgroundColor: '#f0f3f7',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  signInLogoContainer: {
    alignSelf: 'center',
    marginTop: 35,
    marginBottom: 15,
  },
  signInTextStyle: {
    padding: 5,
    marginRight: 10,
    fontSize: 16,
    ...Specs.fontBold,
    color: '#373e73',
  },
  radioButtonContainer: {
    marginHorizontal: 5,
    flexDirection: 'row',
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center'
  },
  otpForgotPasswordContainer: {
    flexDirection: 'row',
    marginTop: 10,
    marginHorizontal: 17,
    justifyContent: 'flex-end',
  },
  sendOtpLabelStyle: {
    position: 'absolute',
    right: 20,
    alignSelf: 'flex-end',
    color: '#2b61a5',
  },
  forgotPasswordStyle: {
    ...Specs.fontRegular,
    fontSize: 12,
    color: '#9da3c2',
  },
  button: {
    marginTop: '5%',
    marginLeft: 16,
    marginRight: 16,
  },
  customButtonTitleStyle: {
    fontSize: 14,
    color: '#FFFFFF',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  signUpLabel: {
    ...Specs.fontSemibold,
    color: '#58cdb4',
    fontSize: 14,
  },
  footerTitle: {
    ...Specs.fontRegular,
    fontSize: 12,
    lineHeight: 22,
  },
  otpOnCall: {
    ...Specs.fontRegular,
    color: '#2b61a5',
    fontSize: 14,
    alignSelf: 'flex-end',
    marginHorizontal: 17,
    marginBottom: 10,
  },
  sendOtpTextMessage: {
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: 5,
    color: '#03a07f',
    fontSize: 12,
  },
  footerBackgroundImage: {
    alignSelf: 'center',
  },
  buttonContainer: {
    paddingVertical: 11,
    paddingHorizontal: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
    backgroundColor: '#58cdb4',
    marginTop: '5%',
    marginLeft: 16,
    marginRight: 16,
  },
});
