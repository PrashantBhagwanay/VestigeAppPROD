
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
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Specs } from 'app/src/utility/Theme';
import { observer, inject } from 'mobx-react'; // importing the mobx from the library
import { CustomButton } from 'app/src/components/buttons/Button';
import { strings } from 'app/src/utility/localization/Localized';
import { Toast } from 'app/src/components/toast/Toast';
import autobind from 'autobind-decorator';
import { fetchBaseLocationIOS, isNullOrEmpty } from 'app/src/utility/Utility';
import * as AsyncStore from 'app/src/utility/AsyncStoragesUtils';
import { SIGNUP_ROUTE, LOGIN_KEY_ENUM, VESTIGE_IMAGE } from 'app/src/utility/constant/Constants';
import { observable, makeObservable } from 'mobx';
import Icon from 'react-native-vector-icons/Ionicons';
import { isNameValidator, isEmailValidate, isPhoneNumberValidate } from 'app/src/utility/Validation/Validation';
import Loader from '../../components/loader/Loader';
import CustomInput from '../../components/CustomInput';
import { connectedToInternet } from '../../utility/Utility';
import PickerSelector from '../../components/picker/pickerSelector';
import { BottomSheetPicker } from '../../components/picker/bottomSheetPicker';

const { width, height } = Dimensions.get('window');

// Illustration image
const FOOTER_BACKGROUND_IMAGE = require('../../assets/images/Splash/footerBackground.png');
// Password, profile icons
const passwordIcon = require('../../assets/images/Signup/password.png');
const userIcon = require('../../assets/images/Signup/profile.png');

const COUNTRY_ID = AsyncStore.addPrefix("country-id");
const BASE_LOCATION_ID = AsyncStore.addPrefix("location-id");

const logo = require('../../assets/images/logo/logo.png');

const options = ['Password', 'Verification code'];

@inject('auth', 'profile', 'location')
@observer
export default class GuestUser extends Component {
  @observable selectedLoginType : string = LOGIN_KEY_ENUM.password;
  @observable previousSelectedLoginType: string = '';
  @observable showPassword:boolean = true;
  @observable showOtp:boolean = true;
  @observable otp1 ;
  @observable otp2 ;

  constructor(props) {
    super(props);
    makeObservable(this);
    this.props = props;
    this.state = {
      distributorIdMobileInput: '',
      distributorPasswordInput: '',
      distributorOtpInput: '',
      showMobileLoader: false,
      sendOtpMessage: '',
      sendOtpLabel: '',
      guestUserName: '',
      guestEmail: '',
      mobileNumberLimit: 10,
      selectedCountryName: '',
      selectedCountryId: '',
      isdCode: '',
      isModalVisible: false,
    };
  }

  async componentDidMount() {
    this.props.location.setCountryListData([]);
    await this.props.location.countryList();
    this.props.auth.setNavigation(this.props.navigation);
    this.selectedLoginType = LOGIN_KEY_ENUM.password;
  }

  handlePickerSelector = () => {
    this.handleModalVisibility(true);
  };

  handlePickerItemPress = item => {
    this.setCountryValue(item?.countryId);
    this.handleModalVisibility(false);
  };

  handleModalVisibility = value => {
    this.setState({
      isModalVisible: value,
    });
  };

  setCountryValue = (countryId) => {
    const { getActiveCountryList } = this.props.location;
    const countrObj = getActiveCountryList && getActiveCountryList.find( item => item.countryId == countryId);
    // eslint-disable-next-line object-shorthand
    this.setState({
      isdCode: countrObj.isdCode,
      selectedCountryName: countrObj?.countryName,
      selectedCountryId: countryId,
      mobileNumberLimit: countrObj.mobileNumberLimit,
      distributorIdMobileInput: '',
      sendOtpLabel: '',
    });
  }

  handleDistributorIdMobileInput = (value) => {
    if (value.trim().length == this.state.mobileNumberLimit) {
      this.setState({
        sendOtpLabel: strings.loginScreen.sendOtp,
        distributorIdMobileInput: value,
      });
    }
    else {
      this.setState({
        distributorIdMobileInput: value,
        sendOtpLabel: '',
      });
    }
  }

  sendOtp = async () => {
    const { distributorIdMobileInput, guestUserName, guestEmail, selectedCountryId, isdCode } = this.state;
    const isValid = this.isValidate();
    if (isValid) {
      this.setState({
        showMobileLoader: true,
        sendOtpLabel: '',
        sendOtpMessage: '',
      });

      let user = {
        name: guestUserName,
        mobileNumber: isdCode == '91' ? distributorIdMobileInput : isdCode + distributorIdMobileInput,
        countryId: selectedCountryId,
        ...(guestEmail && { email: guestEmail }),
      };
      const json = await this.props.auth.getGuestUserOtp(user);
      if (!json.message) {
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
            sendOtpLabel: strings.loginScreen.resendOtp
          });
        }, 6000);
      }
      else {
        this.setState({
          showMobileLoader: false,
          sendOtpLabel: strings.loginScreen.sendOtp,
        });
        this.showToast(json.message);
      }
    }
  }

  navigateToSignup = () => {
    const { navigation } = this.props;
    this.props.auth.setSignupRoutePath(SIGNUP_ROUTE.LOGIN_ROUTE);
    navigation.navigate('signup');
  }


  @autobind
  showToast(message: string) {
    // Add a Toast on screen.
    Toast.show(message, {
      duration: Toast.durations.SHORT,
      type: Toast.type.ERROR,
      shadow: false,
      animation: true,
      hideOnPress: true,
      delay: 0,
    });
  }

  isValidate = () => {
    const { distributorIdMobileInput, guestUserName, guestEmail, selectedCountryId } = this.state;

    if (isNullOrEmpty(selectedCountryId)) {
      this.showToast(strings.guestUserScreen.selectCountryError);
      return false;
    }
    if (!guestUserName || !isNameValidator(guestUserName)) {
      this.showToast(strings.errorMessage.signUp.invalidName);
      return false;
    }
    if (guestEmail && !isEmailValidate(guestEmail)) {
      this.showToast(strings.errorMessage.signUp.invalidEmail);
      return false;
    }
    if (Platform.OS === 'android' && distributorIdMobileInput.trim().length != this.state.mobileNumberLimit) {
      this.showToast(strings.guestUserScreen.invalidMobileNumber);
      return false;
    }
    return true;
  }

  async validateUser() {
    if (this.isValidate()) {
      const {
        distributorIdMobileInput,
        distributorOtpInput,
        isdCode,
        guestUserName,
        guestEmail,
      } = this.state;
      const isInternetConnected = await connectedToInternet();
      if (!isInternetConnected) {
        this.showToast(strings.errorMessage.internetConnection.noInternetConnectionShort);
        return;
      }
      if (Platform.OS === 'android' && !this.state.distributorOtpInput.trim()) {
        this.showToast(strings.guestUserScreen.emptyOtp);
        return;
      }
      // else if(Platform.OS==='android' && this.props.auth.guestUserOtpInfo.otp != distributorOtpInput) {
      //   this.showToast(strings.guestUserScreen.invalidOtp);
      //   return
      // }
      let user = (Platform.OS == 'ios') ? {
        username: guestUserName,
        ...(guestEmail && { email: guestEmail }),
        userType: 'GUEST',
      } : {
        username: isdCode == '91' ? distributorIdMobileInput : isdCode + distributorIdMobileInput,
        password: distributorOtpInput,
        userType: 'GUEST',
        otpStatus: true,

      };
      const res = await this.props.auth.login(user);
      if (res == true) {
        if (Platform.OS === 'ios') {
          const { selectedCountryId } = this.state;
          const baseLocation = fetchBaseLocationIOS(selectedCountryId);
          this.props.profile.setCountryId(selectedCountryId);
          this.props.profile.baseLocationId = baseLocation;
          await AsyncStore.set(COUNTRY_ID, String(selectedCountryId));
          await AsyncStore.set(BASE_LOCATION_ID, String(baseLocation));
        }
        // console.log(user)
        // const message = await this.props.auth.login(user);
        // if(!message) {
        // this.props.navigation.navigate('dashboard');
      }
      else {
        this.showToast(res.message);
      }
    }
  }

otpLogin = () => {
  const { getActiveCountryList } = this.props.location;
  const { distributorIdMobileInput, distributorOtpInput, showMobileLoader, sendOtpMessage, sendOtpLabel, guestUserName, guestEmail, mobileNumberLimit } = this.state;
  if (Platform.OS === 'ios') {
    return (
      <View>
        <View style={{ height: 20 }}>
          <Text style={styles.sendOtpTextMessage}>{sendOtpMessage}</Text>
        </View>
        <View style={styles.pickerContainer}>
          {/* <Text style={{ color: '#3f4967' }}>Country Name</Text> */}
          <PickerSelector
            label={this.state.selectedCountryName || 'Select Country'}
            selectedValue={this.state.selectedCountryId}
            customStyle={{
              container: {
                marginHorizontal: 0,
                backgroundColor: '#f0f3f7',
                borderColor: '#c8c9d3',
              },
            }}
            onPickerPress={this.handlePickerSelector}
          />
        </View>
        <CustomInput
          placeholder={strings.guestUserScreen.nameInput}
          icon={userIcon}
          maxLength={50}
          marginHorizontal={17}
          value={guestUserName}
          onChangeText={(value) => this.setState({ guestUserName: value })}
        />
        <View style={{ height: 15 }} />
        <CustomInput
          placeholder={strings.guestUserScreen.emailInput}
          icon={VESTIGE_IMAGE.EMAIL_ICON}
          marginHorizontal={17}
          value={guestEmail}
          onChangeText={(value) => this.setState({ guestEmail: value })}
        />
        <View style={{ height: 15 }} />
        <View style={styles.otpForgotPasswordContainer}>
          <Text
            style={styles.forgotPasswordStyle}
          >
            {` `}
          </Text>
        </View>
      </View>
    );
  }
  return (
    <View>
      <View style={{ height: 20 }}>
        <Text style={styles.sendOtpTextMessage}>{sendOtpMessage}</Text>
      </View>
      <View style={styles.pickerContainer}>
        {/* <Text style={{ color: '#3f4967' }}>Country Name</Text> */}
        <PickerSelector
          label={this.state.selectedCountryName || 'Select Country'}
          selectedValue={this.state.selectedCountryId}
          customStyle={{
            container: {
              marginHorizontal: 0,
              backgroundColor: '#f0f3f7',
              borderColor: '#c8c9d3',
            },
          }}
          onPickerPress={this.handlePickerSelector}
        />
      </View>
      <CustomInput
        placeholder={strings.guestUserScreen.nameInput}
        icon={userIcon}
        maxLength={50}
        marginHorizontal={17}
        value={guestUserName}
        onChangeText={(value) => this.setState({ guestUserName: value })}
      />
      <View style={{ height: 15 }} />
      <CustomInput
        placeholder={strings.guestUserScreen.emailInput}
        icon={VESTIGE_IMAGE.EMAIL_ICON}
        marginHorizontal={17}
        value={guestEmail}
        onChangeText={(value) => this.setState({ guestEmail: value })}
      />
      <View style={{ height: 15 }} />
      <View style={{ justifyContent: 'center' }}>
        <CustomInput
          keyboardType="numeric"
          placeholder={strings.guestUserScreen.mobileNumber}
          icon={VESTIGE_IMAGE.MOBILE_ICON}
          marginHorizontal={17}
          maxLength={mobileNumberLimit}
          value={distributorIdMobileInput}
          onChangeText={this.handleDistributorIdMobileInput}
          showMobileLoader={showMobileLoader}
          mobileIsdCode={this.state.isdCode == '91' ? '' : this.state.isdCode}
        />
        <Text
          onPress={() => this.sendOtp()}
          style={styles.sendOtpLabelStyle}
        >
          {sendOtpLabel}
        </Text>
      </View>
      <View style={{height: 15}} />
      <CustomInput
        secureEntry={this.showOtp}
        showPassword
        showPasswordPress={(value)=> this.showOtp = !value}
        keyboardType="numeric"
        placeholder={strings.loginScreen.distributorOTP}
        icon={passwordIcon}
        marginHorizontal={17}
        maxLength={4}
        value={distributorOtpInput}
        onChangeText={(value) => this.setState({ distributorOtpInput: value })}
      />
      <View style={styles.otpForgotPasswordContainer}>
        <Text
          style={styles.forgotPasswordStyle}
        >
          {` `}
        </Text>
      </View>
    </View>

  );
}


render() {
  const { distributorIdMobileInput, distributorPasswordInput } = this.state;
  const { navigation } = this.props;
  const isEnabled = distributorPasswordInput && distributorIdMobileInput;
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={styles.signInContainer}>
        <View>
          <View style={styles.backIconContainer}>
            <TouchableOpacity style={styles.tapableArea} onPress={() => { navigation.goBack() }}>
              <Icon name="ios-arrow-back" size={30} color="#3f4967" />
            </TouchableOpacity>
          </View>
          <Loader loading={this.props.auth.isLoading || this.props.location.isLoading} />
          <Image style={styles.signInLogoContainer} source={logo} />
          { this.otpLogin(navigation) }
          <CustomButton
            {...this.props}
            isDisabled={!isEnabled}
            handleClick={() => this.validateUser()}
            linearGradient
            buttonContainer={styles.button}
            buttonTitle={strings.guestUserScreen.guestLoginButton}
            buttonTitleStyle={styles.customButtonTitleStyle}
            primaryColor="#6895d4"
            secondaryColor="#57a5cf"
            accessibilityLabel="Guest_User_Login_Button"
          />
        </View>
        <Image
          style={styles.footerBackgroundImage}
          resizeMode="contain"
          source={FOOTER_BACKGROUND_IMAGE}
        />
        <BottomSheetPicker
          isVisible={this.state.isModalVisible}
          schema={{ label: 'countryName', value: 'countryId' }}
          onModalClose={() => this.handleModalVisibility(false)}
          pickerItems={this.props.location.getActiveCountryList}
          heightMax={height / 2}
          onItemPress={this.handlePickerItemPress}
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
  // signInTextStyle: {
  //   marginLeft: 17,
  //   marginTop: 10,
  //   marginRight: 20,
  //   fontSize: 18,
  //   ...Specs.fontBold,
  //   color: '#373e73',
  //   paddingBottom: 8,
  // },
  // radioButtonContainer: {
  //   flexDirection: 'row',
  //   paddingBottom: 8
  // },
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
  // signUpLabel:{
  //   ...Specs.fontSemibold,
  //   color: '#58cdb4',
  //   fontSize: 14
  // },
  // footerTitle: {
  //   ...Specs.fontRegular,
  //   fontSize: 12,
  //   lineHeight: 22
  // },
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
  backIconContainer: {
    flexDirection: 'row',
    paddingHorizontal: 17,
    paddingTop: 20,
  },
  pickerContainer: {
    marginHorizontal: 17,
    // borderBottomWidth: 0.8,
    // borderBottomColor: '#c8c9d3',
    marginTop: 17,
    // marginBottom: 10,
  },
});
