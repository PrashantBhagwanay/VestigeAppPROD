
import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
  SafeAreaView,
  TouchableOpacity
} from 'react-native';
import { _ } from 'lodash';
import Icon from 'react-native-vector-icons/Ionicons';
import { Specs } from 'app/src/utility/Theme';
import { observer, inject } from 'mobx-react'; // importing the mobx from the library
import { CustomButton } from 'app/src/components/buttons/Button';
import * as Urls from 'app/src/network/Urls';
import { strings } from 'app/src/utility/localization/Localized';
import AlertClass from 'app/src/utility/AlertClass';
import * as AsyncStore from 'app/src/utility/AsyncStoragesUtils';
import { LOGIN_KEY_ENUM } from 'app/src/utility/constant/Constants';
import { observable, makeObservable } from 'mobx';
import { isMobileNumberValid } from 'app/src/utility/Validation/Validation';
import Loader  from 'app/src/components/loader/Loader';
import { showToast, getMaskedMobileNumber, connectedToInternet } from 'app/src/utility/Utility';
import { Toast } from 'app/src/components/toast/Toast';
import OTPInputView from 'app/src/components/otpInputView/OTPInputView';

// Illustration image
const FOOTER_BACKGROUND_IMAGE = require('../../assets/images/Splash/footerBackground.png');

// Password, profile icons
// const passwordIcon = require('../../assets/images/Signup/password.png');
// const userIcon = require('../../assets/images/Signup/profile.png');
const logo = require('../../assets/images/logo/logo.png');

const otpLength = 4;

@inject('auth', 'profile')
@observer
export default class LoginConfirmDeviceOtp extends Component {
  codeInputRef1 = React.createRef();

  // @observable showPassword:boolean = true;
  // @observable showOtp:boolean = true;
  // @observable timeOutNumber;
  @observable userData = '';
  @observable loginData = '';

  constructor(props) {
    super(props);
    makeObservable(this);
    this.state = {
      isLoading: false,
      otpInputKey: 1,
      isResendDisabled: true,
      resendOtpSeconds: 30,
      resendOtpMinutes: 0,
      otp: '',
    };
    this.userData = this.props.route?.params?.userData;
    this.loginData = this.props.route?.params?.loginData;
  }

  async componentDidMount() {
    this.setOtpTimer();
    this.sendOtp();
  }

  componentWillUnmount() {
    clearInterval(this.interval1);
  }

  sendOtp = async() => {
    this.setState({ isLoading: true});
    const otpData = {
      mobileNumber: this.userData?.username, // both mobile number or distributor id can go here
      deviceId: this.userData?.deviceId,
      isOtpOnCall: false, // used to seperate otp via call or sms
    }
    const resOtp = await this.props.auth.requestOTP(otpData);
    this.setState({ isLoading: false});
    if (resOtp.success) {
      showToast(strings.loginConfirmDeviceOtp.verificationCodeSent, Toast.type.SUCCESS);
      return true;
    }
    showToast(resOtp.message, Toast.type.ERROR);
    return false;
  }

  isFormValid = () => {
    // const { statusmsg } = this.props.route.params;
    const { otp } = this.state;
    // if(statusmsg === LOGIN_KEY_ENUM.mobileNotRegistered) {
    // if(!distributorIdMobileInput.trim() || distributorIdMobileInput.trim().length !== 10 || !isMobileNumberValid(distributorIdMobileInput)) {
    //   showToast(strings.loginConfirmDeviceOtp.invalidMobileNumber)
    //   return false
    // }
    if (!otp.trim() || otp.length !== 4 || !isMobileNumberValid(otp)) {
      showToast(strings.loginConfirmDeviceOtp.pleaseEnterOtp)
      return false;
    }
    // }
    // if(LOGIN_KEY_ENUM.deviceNotRegistered.includes(statusmsg)) {
    //   if(!distributorOtpInput.trim() || !isMobileNumberValid(distributorOtpInput)) {
    //     showToast(strings.loginConfirmDeviceOtp.pleaseEnterOtp)
    //     return false
    //   }
    // }
    return true
  }

  async saveDeviceInfo() {
    const { otp } = this.state;
    // const { statusmsg } = this.props.route.params;
    // const mobileOtpKey = statusmsg === LOGIN_KEY_ENUM.mobileNotRegistered ? 'mb_otp' : 'dv_otp';
    const isInternetConnected = await connectedToInternet();
    if (!isInternetConnected) {
      showToast(strings.errorMessage.internetConnection.noInternetConnectionShort)
      return false;
    }
    const isFormValid = this.isFormValid();
    if (isFormValid) {
      // const confirmDeviceOtp = {
      //   ...user,
      //   [mobileOtpKey]: distributorOtpInput
      // }
      // const res = await this.props.auth.saveDeviceDetails(url, confirmDeviceOtp); // used into V2 
      const userDetails = {
        username: this.userData.username,
        password: otp,
        otpStatus: true,
        deviceId: this.userData.deviceId,
        deviceName: this.userData.deviceName,
        userType: this.userData.userType,
        latitude:this.userData.latitude,
        longitude:this.userData.longitude,
        authenticationType: '3',
        appType: 'GL',
      }
      const res = await this.props.auth.login(userDetails);
      if(this.props.auth.isTokenAvailable) {
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
        // AlertClass.showAlert(strings.loginConfirmDeviceOtp.alertTitle, 
        //   res.statusMsg, 
        //   [{text: strings.commonMessages.ok, onPress: () => this.props.navigation.pop()} ], false)
      }
      else {
        AlertClass.showAlert(strings.loginConfirmDeviceOtp.alertTitle, 
          res.message, 
          [{text: strings.commonMessages.ok, onPress: () => console.log('Ok Pressed') }], true)
      }
    }
  }

  setOtpTimer = () => {
    this.interval1 = setInterval(() => {
      if (this.state.resendOtpSeconds > 0) {
        this.setState(prevState => ({
          resendOtpSeconds: prevState.resendOtpSeconds - 1,
        }));
      }
      if (this.state.resendOtpSeconds === 0) {
        if (this.state.resendOtpMinutes === 0) {
          clearInterval(this.interval1);
          this.setState({
            isResendDisabled: false,
            resendOtpMinutes: 0,
            resendOtpSeconds: 30,
          });
        }
        else {
          this.setState(prevState => ({
            resendOtpMinutes: prevState.resendOtpMinutes - 1,
            resendOtpSeconds: 30,
          }));
        }
      }
    }, 1000);
  }

  handleResendOtp = async () => {
    const res = await this.sendOtp();
    if (res) {
      this.setState(prevState => ({
        otp: '',
        isResendDisabled: true,
        otpInputKey: prevState.otpInputKey + 1
      }));
      this.setOtpTimer();
    }
  }

  handleOtpInput = (value) => {
    this.setState({
      otp: value
    })
  }

  getUserMobileNumber = (mobile) =>{
    // console.log('checkmobile',this.loginData)
    if (isMobileNumberValid(mobile)) {
      const message = `${strings.loginConfirmDeviceOtp.verificationCodeDetails} : ${getMaskedMobileNumber(mobile, [0,1,8,9])}`
      return {success: true, data: message}
    }
    return {success: false}
  }

  renderMessageView = (message) => {
    if (message && message.trim() != '') {
      return (
        <View style={styles.messageView}>
          <Text style={[styles.descriptionText, {...Specs.fontSemibold, color:'#58CDB4'}]}>{message}</Text>
        </View>
      );
    }
  }

  renderHeading = () => {
    return (
      <View style={{marginVertical:5}}>
        <Text style={styles.headingText}>Please enter Verification Code</Text>
        <View style={styles.separateLine} />
      </View>
    );
  }

  renderOtpInputView = () => {
    return (
      <View style={styles.otpInputContainer}>
        <OTPInputView
          ref={this.codeInputRef1}
          key={this.state.otpInputKey}
          keyboardType='numeric'
          codeLength={otpLength}
          autoFocus
          className='border-b'
          codeInputStyle={{ fontWeight: '800', marginHorizontal:5 }}
          onFulfill={(value) => this.handleOtpInput(value)}
          autoFill={this.state.otp}
          cellHorizontalMargin={{marginHorizontal: 10}}
        />
      </View>
    )
  }

  renderResendOTP = () => {
    const {isResendDisabled, resendOtpSeconds, resendOtpMinutes} = this.state;
    return (
      <View style={styles.resendOTPContainer}>
        <Text style={[styles.descriptionText]}>
          {strings.loginConfirmDeviceOtp.didNotRecieveCode}
          <Text 
            onPress={() => isResendDisabled ? null : this.handleResendOtp()}
            style={[styles.descriptionText, {color: isResendDisabled ? '#58CDB460' : '#58CDB4', ...Specs.fontBold}]}
          >
            {strings.loginConfirmDeviceOtp.resendVerificationCode}
            {isResendDisabled && `( in ${resendOtpMinutes}:${resendOtpSeconds})`}
          </Text>
        </Text>
      </View>
    )
  }

  renderSubmitButton = (statusmsg) => {
    return (
      <CustomButton
        {...this.props}
        // isDisabled={!isEnabled}
        handleClick={() => this.saveDeviceInfo()}
        linearGradient
        buttonContainer={styles.button}
        buttonTitle={statusmsg === LOGIN_KEY_ENUM.mobileNotRegistered ? strings.loginConfirmDeviceOtp.saveMobile : strings.loginConfirmDeviceOtp.confirmOTP}
        buttonTitleStyle={styles.customButtonTitleStyle}
        primaryColor="#6895d4"
        secondaryColor="#57a5cf"
        accessibilityLabel="Login_Button"
      />
    )
  }

  renderOtpLoginView = () => {
    const { statusmsg } = this.props.route.params;
    const mobileNumber = this.getUserMobileNumber(this.loginData?.mobile_number);
    return (
      <View style={styles.contentContainer}>
        {this.renderHeading()}
        {mobileNumber.success && this.renderMessageView(mobileNumber.data)}
        {this.renderOtpInputView()}
        {this.renderResendOTP()}
        {this.renderSubmitButton(statusmsg)}
      </View>
    )
  }

  render() {
    const { navigation } = this.props;
    // const { message } = this.props.route.params;
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <SafeAreaView style={styles.signInContainer}>
          <Loader loading={this.props.auth.isLoading || this.state.isLoading} />
          <View style={{ flex: 1 }}>
            <View style={styles.backIconContainer}>
              <TouchableOpacity style={styles.tapableArea} onPress={() => {navigation.goBack()}}>
                <Icon name='ios-arrow-back' size={30} color='#3f4967' />
              </TouchableOpacity>
            </View>
            <Image style={styles.signInLogoContainer} source={logo} />
            {/* <View>
              <Text numberOfLines={2} style={{ textAlign: 'center'}}>{message}</Text>
            </View> */}
            {this.renderOtpLoginView()}
          </View>
          <Image 
            style={styles.footerBackgroundImage} 
            resizeMode="contain" 
            source={FOOTER_BACKGROUND_IMAGE} 
          />
        </SafeAreaView>
      </TouchableWithoutFeedback>
    );
  }
}

/**
 * @description Login Screen Style defined here
 */
const styles = StyleSheet.create({
  backIconContainer: {
    flexDirection: 'row', 
    paddingHorizontal: 17, 
    paddingTop: 20,
  },
  signInContainer: {
    flex: 1,
    backgroundColor: '#f0f3f7',
    flexDirection: 'column',
    justifyContent:'space-between'
  },
  signInLogoContainer: {
    alignSelf:'center', 
    marginTop: 20, 
    marginBottom: 15
  },
  contentContainer: {
    backgroundColor: '#fff',
    padding: 5,
    borderRadius: 15,
    marginHorizontal: 15,
    marginVertical:10,
    // elevation:1
  },
  headingText: {
    ...Specs.fontSemibold,
    fontSize: 14,
    color: '#3f5886',
    textAlign: 'center'
  },
  messageView: {
    paddingVertical:5, 
    borderRadius:8, 
    marginBottom:10, 
    marginHorizontal:12, 
    backgroundColor: '#EFFBF8',
    justifyContent: 'center'
  },
  otpInputContainer:{
    height: 55,
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: '#fff',
    borderColor: '#C8C9D3'
  },
  separateLine: {
    height: 1.5, 
    marginHorizontal: 12, 
    backgroundColor: '#80808040', 
    marginVertical:4
  },
  resendOTPContainer:{
    flexDirection: 'row',
    marginHorizontal: 20,
    marginVertical:5,
    justifyContent: 'center'
  },
  descriptionText:{
    ...Specs.fontRegular,
    color:'#00000060', 
    fontSize:12,
    textAlign: 'center'
  },
  // resendOtp: {
  //   flexDirection: 'row',
  //   marginTop: 10,
  //   marginHorizontal: 17,
  //   justifyContent: 'flex-end'
  // },
  // sendOtpLabelStyle: {
  //   position: 'absolute',
  //   right: 20,
  //   alignSelf: 'flex-end',
  //   color: '#2b61a5'
  // },
  // resendOtpText: {
  //   ...Specs.fontRegular,
  //   fontSize: 12,
  //   color: '#9da3c2',
  // },
  // sendOtpTextMessage: {
  //   marginLeft: 'auto',
  //   marginRight:'auto',
  //   marginTop: 5,
  //   color:'#03a07f',
  //   fontSize: 12,
  // },
  button: {
    marginTop: 25,
    marginLeft: 16,
    marginRight: 16,
  },
  customButtonTitleStyle: {
    ...Specs.fontSemibold,
    fontSize: 14,
    color: '#FFFFFF',
    alignSelf: 'center',
    justifyContent: 'center'
  },
  footerBackgroundImage: {
    alignSelf: 'center',
  },
});