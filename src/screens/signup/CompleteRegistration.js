/**
 *@description This Screen used when downline login for first time after getting registered
 *by upline.
*/
import React, { Component, useReducer } from 'react';
import { View, Text, Platform, StyleSheet, Alert, Keyboard, SectionList, Modal, Dimensions, TouchableOpacity, Image, ScrollView } from 'react-native';
import autobind from 'autobind-decorator';
import { observer, inject } from 'mobx-react'; // importing the mobx from the library
import { VESTIGE_IMAGE, PICKER_ENUM, TITLE_DATA, GENDER_DATA, SIGNUP_KEY_ENUM, INPUT_COMPONENT_TYPE, UserRole, UAE_JSON,APP_VALIDATION_CONST } from 'app/src/utility/constant/Constants';
import { CustomButton, Checkbox, RadioButton } from 'app/src/components/buttons/Button';
import DatePickerComponent from 'app/src/components/datePickerComponent/DatePickerComponent';
import { strings } from 'app/src/utility/localization/Localized';
import { makeObservable, observable, observe } from 'mobx';
// import moment from 'moment';
import { Icon } from 'react-native-elements'
import {
  dateFormat,
  customAlert,
  compareDates,
  hexToDecimal,
  isIphoneXorAbove,
  newDobFormat,
  getGenderValidation, 
  // spaceSeperatedName,
  // getUniqueID, 
  // getIOSDeviceID, 
  // getDeviceModel,
} from 'app/src/utility/Utility';
import { Toast } from 'app/src/components/toast/Toast';
import { Specs } from 'app/src/utility/Theme';
import * as AsyncStore from 'app/src/utility/AsyncStoragesUtils';
// import { trackEvent } from 'app/src/utility/AnalyticsUtils';
import { SIGNUP_BUTTON_PRESS } from 'app/src/utility/GAEventConstants';
import AlertClass from 'app/src/utility/AlertClass';
import HeaderLeftIcons from 'app/src/components/navigation/HeaderLeftIcons';
import { WebView } from 'react-native-webview';
import SignupTextInput from 'app/src/components/signUpInputComponent/SignupTextInput';
import RNOtpVerify from 'react-native-otp-verify';
import {set,get} from 'app/src/utility/AsyncStoragesUtils';
import { _ } from 'lodash';

// Navigation Icons
import SignupInput from 'app/src/screens/signup/component/SignupInput';
import SignupReviewModal from 'app/src/screens/signup/component/SignupReviewModal';
import { 
  isNameValidator, 
  isEmailValidate,
  isValidateDob,
  isAddressValidate,
  maskDate,
  isValidateDate,
  isPinCodeValidate,
  isDistributorIdValidator,
  isNomineeAddressValid,
  isMobileNumberValid,
  isPasswordValidate,
  isMatchPasswordValidate,  
} from 'app/src/utility/Validation/Validation';
import Loader  from 'app/src/components/loader/Loader';
import OTPInput from './component/OTPInput';
import { Header } from '../../components';
import { connectedToInternet } from '../../utility/Utility';
import { COLOR_CODES } from '../../utility/Theme';
const { width, height } = Dimensions.get('window');

// import SignupInput from './component/SignupInput';
// import { isNameValidator, isEmailValidate,isPasswordValidate, isValidateDob,isPhoneNumberValidate, isAddressValidate,isMatchPasswordValidate, isPinCodeValidate, isDistributorIdValidator, matchPasswordValidator } from '../../utility/Validation/Validation';
// import Loader  from '../../components/loader/Loader';

// const SIGNUP_INPUT_VALUE = {};
const logo = require('app/src/assets/images/logo/logo.png');
//const isVestigeFamilyMemberOptions = ['Yes', 'No']


@inject('location', 'auth', 'cart', 'profile', 'appConfiguration')
@observer
export default class CompleteRegistration extends Component {
  codeInputRef = React.createRef(); 

  @observable selectedOwnDob : any;
  @observable selectedCoDisDob: any;
  @observable isDatePickerVisible= false;
  @observable selectedPickerValue= '';
  @observable dobIso = '';
  @observable dobCoIso = '';
  @observable selectedDob = 'Date of Birth';
  @observable selectedCoDob = '';
  @observable selectedTitle ='Title';
  @observable selectedCountry = 'Country';
  @observable selectedState = 'State';
  @observable selectedCity = 'City';
  @observable selectedGender = 'Gender';
  @observable selectedCoDistributorTitle = 'Title';
  @observable titlePickerVisible = false;
  @observable countryPickerVisible = false;
  @observable statePickerVisible = false;
  @observable cityPickerVisible = false;
  @observable genderPickerVisible = false;
  @observable coDistributorPickerVisible = false;
  @observable isPickerDisabled = false;
  @observable showPassword = true;
  @observable showConfirmPassword = true;
  @observable countryData = [];
  @observable stateData = [];
  @observable cityData = [];
  @observable distributorListData = [];
  @observable countryID = '';
  @observable stateID = '';
  @observable cityID = '';
  @observable selectedTitleId : number;
  @observable selectedCoDistributorTitleId : number;
  @observable selectedDistributor: string = 'Distributor ID';
  @observable distributorListPickerVisible : boolean = false;
  @observable validUplineIcon: any = 'default';
  @observable validRefferalIcon: any = 'default';
  @observable editUplineId: boolean = true;
  @observable editRefferalId: boolean = true;
  @observable referral: string = '';
  @observable referralCode: string = '';
  @observable otpData = {};
  @observable isOtpVerified: boolean = true;
  @observable showVerifyOtp;
  @observable zoneId = '';
  @observable distGender = '';
  @observable reviewModalData = [];
  @observable reviewModalNomineeData = [];

  constructor(props) {
    super(props);
    makeObservable(this);
    this.state = {
      fosterId: '',
      distributorId: '',
      firstName: '',
      lastName: '',
      selectedDate: '',
      selectedCoDistributorDob: '',
      coDistributorFirstName: '',
      coDistributorLastName: '',
      password: '',
      confirm_password: '',
      address: '',
      mobileNumber: '',
      pincode: '',
      emailId: '',
      referralCode: '',
      modalVisible: false,
      otp: '',
      nomineeRelationship: '',
      nomineeAddress1: '',
      nomineeAddress2: '',
      mobileIsdCode: '',
      selectedMobileCountryCode: '',
      isTermsConditionsAccepted: false,
      isTermsAndConditionsModalVisible: false,
      dafTermsANDConditions: '',
      mobileNumberLimit: 10,
      pincodeLength: 6,
      isCityPickerDisabled: true,
      showOtpLoader: false,
      poBoxNumber: '',
      digitalAddressGhana: '',
      digitalAddressInfo: '',
      ageRestrictionCheck: false,
      isOtpModalVisible: false,
      isLoading: false,
      isDeclarationAccepted: false,
      spouseName: '',
      ageRestrictionMessage: '',
      isReviewModalVisible: false,
      // selectedVestigeFamilyMemberOption: '',
      // selectedVestigeFamilyMemberValue: '-1',
      // showVestigeFamilyMemberOptions: false
    };
  }

  async componentDidMount() {
    // if(this.props.auth.signupRoutePath === SIGNUP_ROUTE.LOGIN_ROUTE || SIGNUP_ROUTE.ONBOARDING_ROUTE)
    // }
    // this.distributorListData = await this.props.auth.getDistributorIdListData() || [] ;
    // const otpStatus = await this.props.auth.getOtpStatus();
    // if(otpStatus.success) {
    // this.showVerifyOtp = otpStatus.isOtpVerified;
    // }
    // RNOtpVerify.getOtp()
    //   .then(p => RNOtpVerify.addListener(this.otpHandler))
    //   .catch(p => console.log(p));
    const { countryId } = this.props.profile;
    await this.props.location.countryList(Platform.OS);
    this.countryData = await this.props.location.getCountryName;
    const selectedCountryObject = this.props.location.countryListData.find(obj => obj.countryId == countryId)
    const callbackFunc = () => this.handleFormData(this.props.auth.completeRegistrationDetails);
    await this.setPickerValue(selectedCountryObject?.countryName, this.countryData, 'country', true, callbackFunc);
  }

  handleFormData = async (data) => {
    const {
      firstName, lastName,
      stateId, stateName,
      cityName, cityId,
      emailId, pincode,
      distributorTitle, distributorDob,
      distributorMobile,
      fosterId,
    } = data;
    const { location, auth } = this.props;

    if (auth.username && auth.username != '' && distributorTitle != '') {
      const titleObject = TITLE_DATA.filter(value => value.titleId === Number(distributorTitle));
      await this.setPickerValue(titleObject[0], distributorTitle, PICKER_ENUM.TITLE_PICKER, true);

      // const seperatedName = await spaceSeperatedName(auth.username);
      this.setState({
        firstName: firstName,
        lastName: lastName,
        fosterId: fosterId,
      });
    }
    if (distributorDob && distributorDob != '') {
      this.handleTextInput(SIGNUP_KEY_ENUM.DOB, distributorDob);
    }

    if (pincode && pincode != '') {
      this.handleTextInput(SIGNUP_KEY_ENUM.PINCODE, pincode);
    }
    else if (stateId && stateName && cityName && cityId) {
      await location.stateList(this.props.profile.countryId);
      this.stateData = location.getStateName;
      await this.setPickerValue(stateName, this.stateData, 'state', true);

      await location.cityList(stateId);
      this.cityData = location.getCityName;
      await this.setPickerValue(cityName, this.cityData, 'city', true);
    }
    emailId ? this.setState({ emailId: emailId }) : null
    distributorMobile ? this.setState({mobileNumber: distributorMobile}) : null
    this.selectedDistributor = this.props.auth.distributorID;
  }

  onTextChanged(t) { // callback for immediate state change
    if (t == 2) { this.setState({ autoFocus1: false, autoFocus2: true }, () => { console.log(this.state) }) }
    if (t == 3) { this.setState({ autoFocus2: false, autoFocus3: true }, () => { console.log(this.state) }) }
    if (t == 4) { this.setState({ autoFocus3: false, autoFocus4: true }, () => { console.log(this.state) }) }
  }

  // sendOtp = async () => {
  //   const { mobileNumber, mobileNumberLimit, mobileIsdCode } = this.state;
  //   // if( mobileNumber && mobileNumber.length < 10 && mobileNumber.length !== 10 ){
  //   //   customAlert(strings.loginScreen.validMobileAlert);
  //   //   return ;
  //   // }
  //   if( !isMobileNumberValid(mobileNumber.trim()) || (mobileNumber.trim().length != mobileNumberLimit)){
  //     customAlert(strings.loginScreen.validMobileAlert);
  //     return ;
  //   }
  //   this.setState({
  //     showMobileLoader: true,
  //   });

  //   this.otpData = await this.props.auth.validateMobile({mobileNumber: mobileIsdCode + mobileNumber, countryId: this.countryID});
  //   if (!this.otpData.message) {
  //     this.setModalVisible(true);
  //   } 
  //   else {
  //     this.showToast(this.otpData.message);
  //   }
  // }

  // showVerifyIcon = () => {
  //   if(this.state.mobileNumber.trim().length == this.state.mobileNumberLimit && (this.showVerifyOtp == 2 || this.showVerifyOtp == 3)) return true;
  //   return false
  // }

  getCountrySpecificAgeDeclaration = (countryId) => {
    if(countryId === 23){
      this.setState({ageRestrictionMessage: `${strings.errorMessage.signUp.ageAgreementMessageThailand}${this.selectedCountry}`});
    }
    else if (countryId === 1){
      this.setState({ageRestrictionMessage: `${strings.errorMessage.signUp.ageAgreementMessageIndia}${this.selectedCountry}`});
    }
    else{
      this.setState({ageRestrictionMessage: `${strings.errorMessage.signUp.ageAgreementMessageOther}${this.selectedCountry}`});
    }
  }

  showDigitalAddress = () => {
    AlertClass.showAlert('Info', 
      this.state.digitalAddressInfo, 
      [{text: strings.commonMessages.ok, onPress: () => console.log('Ok')}]
    ) 
  }

  @autobind
  createSignUpForm(): Array<any> {
    const isUAESelected = this.state.selectedMobileCountryCode.toUpperCase() == 'UAE';
    const isINDSelected = this.state.selectedMobileCountryCode.toUpperCase() == 'IN';
    const isGHANASelected = this.state.selectedMobileCountryCode.toUpperCase() == 'GHANA';
    const isPhilippinesSelected = this.state.selectedMobileCountryCode.toUpperCase() == 'PH';
    const isIvoryCoastSelected = this.state.selectedMobileCountryCode.toUpperCase() == 'CI'
    // console.log(this.state.selectedMobileCountryCode)

    const TITLE_PICKER=[
      { data: TITLE_DATA.slice(0, (this.selectedCountry === 'India' || this.selectedCountry === 'Country') ? 5 : 4 ), key: 'title', visible: this.titlePickerVisible, selected: this.selectedTitle, defaultValue: 'Select Title' },
    ];
    const CO_TITLE_PICKER=[
      { data: TITLE_DATA.slice(0, (this.selectedCountry === 'India' || this.selectedCountry === 'Country') ? 5 : 4 ), key: 'coTitle', visible: this.coDistributorPickerVisible, selected: this.selectedCoDistributorTitle, defaultValue: 'Select Title' },
    ];
    const GENDER_PICKER=[
      { data: GENDER_DATA.slice(0, (this.selectedCountry === 'India' || this.selectedCountry === 'Country') ? 3 : 2 ), key: 'gender', visible: this.genderPickerVisible, selected: this.selectedGender, defaultValue: 'Select Gender' },
    ];
    const STATE_PICKER = [
      { data: this.stateData.slice().sort(), key: 'state', visible: this.statePickerVisible, selected: this.selectedState, defaultValue: isUAESelected ? 'Select Emirates' : isPhilippinesSelected ? 'Select Province' : 'Select State' },
    ]
    const CITY_PICKER=[
      { data: this.cityData.slice().sort(), key: 'city', visible: this.cityPickerVisible, selected: this.selectedCity, defaultValue: 'Select City'},
    ];
    const COUNTRY_PICKER_DATA = [
      { data: this.countryData, key: 'country', visible: this.countryPickerVisible, selected: this.selectedCountry, defaultValue: 'Select Country' },
    ];

    const SELECT_DISTRIBUTOR_PICKER = [
      {
        data: this.distributorListData,
        key: 'distributor',
        visible: this.distributorListPickerVisible,
        selected: this.selectedDistributor,
        defaultValue: 'Select Your Distributor Id',
      },
    ];
    const termsAndConditions = [{
      type: INPUT_COMPONENT_TYPE.TERMS_AND_CONDITIONS,
    }];

    // const uplineInput = [
    //   {
    //     type: INPUT_COMPONENT_TYPE.SIGNUP_VALID_UPLINE,
    //     placeholder: strings.signUpScreen.uplineInput.referral,
    //     showIcon: true,
    //     icon: this.validRefferalIcon,
    //     key: SIGNUP_KEY_ENUM.REFERAL_CODE,
    //     isEditable: this.editRefferalId,
    //     keyboardType: 'default',
    //     maxLength: 10,
    //     value: this.state.referralCode,
    //     handleFunction: this.handleTextInput,
    //   },
    //   {
    //     // type: INPUT_COMPONENT_TYPE.VALID_UPLINE,
    //     type: INPUT_COMPONENT_TYPE.SIGNUP_LABEL,
    //     placeholder: strings.signUpScreen.uplineInput.or,
    //   },
    //   {
    //     type: INPUT_COMPONENT_TYPE.SIGNUP_VALID_UPLINE,
    //     placeholder: strings.signUpScreen.uplineInput.validUpline,
    //     showIcon: true,
    //     icon: this.validUplineIcon,
    //     key: SIGNUP_KEY_ENUM.DISTRIBUTOR_ID,
    //     keyboardType: 'numeric',
    //     maxLength: 8,
    //     isEditable: this.editUplineId,
    //     handleFunction: this.handleTextInput,
    //   }];

    const personalDetailsInput = [{
      type: INPUT_COMPONENT_TYPE.PICKER,
      inputIcon: VESTIGE_IMAGE.PROFILE_ICON,
      pickerData: TITLE_PICKER,
      handlePicker: this.openPicker,
      pickerIcon: VESTIGE_IMAGE.OPEN_PICKER_BUTTON,
      setPickerValue: this.setPickerValue,
      setPickerVisible: this.openPicker,
    }, {
      type: INPUT_COMPONENT_TYPE.TEXTINPUT_WITH_ICON,
      icon: VESTIGE_IMAGE.PROFILE_ICON,
      placeholder: strings.signUpScreen.personalDetails.firstName,
      key: SIGNUP_KEY_ENUM.FIRSTNAME,
      maxLength: 50,
      value: this.state.firstName,
      autoCapitalize: 'words',
      handleFunction: this.handleTextInput
    }, {
      type: INPUT_COMPONENT_TYPE.TEXTINPUT_WITH_ICON,
      icon: VESTIGE_IMAGE.PROFILE_ICON,
      placeholder: strings.signUpScreen.personalDetails.lastName,
      key: SIGNUP_KEY_ENUM.LASTNAME,
      value: this.state.lastName,
      maxLength: 50,
      autoCapitalize: 'words',
      handleFunction: this.handleTextInput
    }, {
      // type: INPUT_COMPONENT_TYPE.DATE_PICKER,
      type: INPUT_COMPONENT_TYPE.TEXTINPUT_WITH_ICON,
      // handleFunction: this.showDatePicker,
      handleFunction: this.handleTextInput,
      placeholder: 'DOB - DD/MM/YYYY',
      maxLength: 10,
      value: this.state.selectedDate,
      icon: VESTIGE_IMAGE.DOB_ICON,
      key: SIGNUP_KEY_ENUM.DOB,
      // datePickerTitle: this.selectedDob,
    }, {
      type: INPUT_COMPONENT_TYPE.PICKER,
      inputIcon: VESTIGE_IMAGE.GENDER_ICON,
      pickerData: GENDER_PICKER,
      handlePicker: this.openPicker,
      pickerIcon: VESTIGE_IMAGE.OPEN_PICKER_BUTTON,
      setPickerValue: this.setPickerValue,
      setPickerVisible: this.openPicker,
    }];

    const digitalAddressPoDetails = [
      {
        type: INPUT_COMPONENT_TYPE.TEXTINPUT_WITH_ICON,
        icon: VESTIGE_IMAGE.EMAIL_ICON,
        placeholder: 'Digital Address',
        key: SIGNUP_KEY_ENUM.DIGITAL_ADDRESS_GHANA,
        maxLength: 30,
        value: this.state.digitalAddressGhana,
        autoCapitalize: 'words',
        handleFunction: this.handleTextInput,
        showInfoIcon: true,
        showDigitalInfo: this.showDigitalAddress
      },
      {
        type: INPUT_COMPONENT_TYPE.TEXTINPUT_WITH_ICON,
        icon: VESTIGE_IMAGE.EMAIL_ICON,
        placeholder: 'PO Number',
        key: SIGNUP_KEY_ENUM.PO_BOX_NUMBER,
        maxLength: 30,
        value: this.state.poBoxNumber,
        autoCapitalize: 'words',
        handleFunction: this.handleTextInput,
      },
    ];

    const contactDetailsInput=[{
      type: INPUT_COMPONENT_TYPE.PICKER,
      inputIcon: VESTIGE_IMAGE.LOCATION_ICON,
      pickerData: COUNTRY_PICKER_DATA,
      handlePicker: this.openPicker,
      pickerIcon: VESTIGE_IMAGE.OPEN_PICKER_BUTTON,
      setPickerValue: this.setPickerValue,
      setPickerVisible: this.openPicker,
      disabled: true,
      alwaysEnabled: true,
    },
    {
      type: INPUT_COMPONENT_TYPE.TEXTINPUT_WITH_ICON,
      icon: VESTIGE_IMAGE.LOCATION_ICON,
      placeholder: isPhilippinesSelected ? strings.signUpScreen.contactDetails.postalCode : strings.signUpScreen.contactDetails.pincode,
      key: SIGNUP_KEY_ENUM.PINCODE,
      value: this.state.pincode,
      keyboardType: 'numeric',
      maxLength: this.state.pincodeLength,
      handleFunction: this.handleTextInput,
      optional: true,
    },
    {
      type: INPUT_COMPONENT_TYPE.PICKER,
      inputIcon: VESTIGE_IMAGE.LOCATION_ICON,
      pickerData: STATE_PICKER,
      handlePicker: this.openPicker,
      pickerIcon: VESTIGE_IMAGE.OPEN_PICKER_BUTTON,
      setPickerValue: this.setPickerValue,
      setPickerVisible: this.openPicker,
      disabled: (isUAESelected || isGHANASelected  ) ? false : true,
    },
    {
      type: INPUT_COMPONENT_TYPE.PICKER,
      inputIcon: VESTIGE_IMAGE.LOCATION_ICON,
      pickerData: CITY_PICKER,
      handlePicker: this.openPicker,
      pickerIcon: VESTIGE_IMAGE.OPEN_PICKER_BUTTON,
      setPickerValue: this.setPickerValue,
      setPickerVisible: this.openPicker,
      disabled: this.state.isCityPickerDisabled,
    },
    {
      type: INPUT_COMPONENT_TYPE.TEXTINPUT_WITH_ICON,
      icon: VESTIGE_IMAGE.LOCATION_ICON,
      placeholder: strings.signUpScreen.contactDetails.address,
      key: SIGNUP_KEY_ENUM.ADDRESS,
      maxLength: 100,
      handleFunction: this.handleTextInput,
    },
    ...(isGHANASelected ? digitalAddressPoDetails : []),
    {
      type: INPUT_COMPONENT_TYPE.TEXTINPUT_WITH_ICON,
      icon: VESTIGE_IMAGE.EMAIL_ICON,
      placeholder: strings.signUpScreen.contactDetails.emailId,
      value: this.state.emailId,
      key: SIGNUP_KEY_ENUM.EMAIL_ID,
      keyboardType: 'email-address',
      handleFunction: this.handleTextInput
    },
    {
      type: INPUT_COMPONENT_TYPE.TEXTINPUT_WITH_ICON,
      icon: VESTIGE_IMAGE.MOBILE_ICON,
      placeholder: strings.signUpScreen.contactDetails.mobile,
      key: SIGNUP_KEY_ENUM.MOBILE_NUMBER,
      // showVerifyIcon: this.showVerifyIcon(),
      // isOtpVerified: this.isOtpVerified,
      // verifyMobileNumber: this.sendOtp,
      // keyboardType: 'numeric',
      // maxLength: 10,
      maxLength: 15, // this.state.mobileNumberLimit,
      handleFunction: this.handleTextInput,
      // showMobileLoader: this.state.showMobileLoader,
      // isdCodeValue: isINDSelected ? '' : this.state.mobileIsdCode,
      value: this.state.mobileNumber,
      isEditable: false,
    },
    ];


    // const passwordDetailsInput=[{
    //   type: INPUT_COMPONENT_TYPE.TEXTINPUT_WITH_ICON_WITH_ICON,
    //   icon: VESTIGE_IMAGE.PASSWORD_ICON,
    //   placeholder: strings.signUpScreen.passwordDetails.password,
    //   key: SIGNUP_KEY_ENUM.PASSWORD,
    //   secureTextEntry: this.showPassword,
    //   maxLength: 20,
    //   handlePassword: this.showHidePassword,
    //   handleFunction: this.handleTextInput
    // },{
    //   type: INPUT_COMPONENT_TYPE.TEXTINPUT_WITH_ICON_WITH_ICON,
    //   icon: VESTIGE_IMAGE.PASSWORD_ICON,
    //   placeholder: strings.signUpScreen.passwordDetails.confirmPassword,
    //   key: SIGNUP_KEY_ENUM.CONFIRM_PASSWORD,
    //   secureTextEntry: this.showConfirmPassword,
    //   maxLength: 20,
    //   handlePassword: this.showHidePassword,
    //   handleFunction: this.handleTextInput
    // }];
    const spouseDetailsInput = [
      {
        type: INPUT_COMPONENT_TYPE.TEXTINPUT_WITH_ICON,
        icon: VESTIGE_IMAGE.PROFILE_ICON,
        placeholder: strings.signUpScreen.coDistributorDetails.spouseName,
        key: SIGNUP_KEY_ENUM.SPOUSE_NAME,
        value: this.state.spouseName,
        handleFunction: this.handleTextInput,
      },
    ];

    const nomineeDetailsInput = [
      {
        type: INPUT_COMPONENT_TYPE.TEXTINPUT_WITH_ICON,
        icon: VESTIGE_IMAGE.PROFILE_ICON,
        placeholder: strings.signUpScreen.coDistributorDetails.firstName,
        key: SIGNUP_KEY_ENUM.CO_DISTRIBUTOR_FIRSTNAME,
        maxLength: 50,
        autoCapitalize: 'words',
        value: this.state.coDistributorFirstName,
        handleFunction: this.handleTextInput
      }, {
        type: INPUT_COMPONENT_TYPE.TEXTINPUT_WITH_ICON,
        icon: VESTIGE_IMAGE.PROFILE_ICON,
        placeholder: strings.signUpScreen.coDistributorDetails.lastName,
        key: SIGNUP_KEY_ENUM.CO_DISTRIBUTOR_LASTNAME,
        autoCapitalize: 'words',
        maxLength: 50,
        value: this.state.coDistributorLastName,
        handleFunction: this.handleTextInput
      }, {
        type: INPUT_COMPONENT_TYPE.TEXTINPUT_WITH_ICON,
        icon: VESTIGE_IMAGE.PROFILE_ICON,
        placeholder: strings.signUpScreen.coDistributorDetails.relationship,
        key: SIGNUP_KEY_ENUM.RELATIONSHIP,
        value: this.state.nomineeRelationship,
        handleFunction: this.handleTextInput,
      },
      {
        type: INPUT_COMPONENT_TYPE.TEXTINPUT_WITH_ICON,
        // handleFunction: this.showDatePicker,
        handleFunction: this.handleTextInput,
        placeholder: 'DOB - DD/MM/YYYY',
        maxLength: 10,
        value: this.state.selectedCoDistributorDob,
        // type: INPUT_COMPONENT_TYPE.DATE_PICKER,
        // handleFunction: this.showDatePicker,
        icon: VESTIGE_IMAGE.DOB_ICON,
        key: SIGNUP_KEY_ENUM.CO_DISTRIBUTOR_DOB,
        // datePickerTitle: this.selectedCoDob,
        clearNomineeDob: this.clearNomineeDOB,
        showClearNomineeDOB: this.dobCoIso ? true : false
      }, {
        type: INPUT_COMPONENT_TYPE.TEXTINPUT_WITH_ICON,
        icon: VESTIGE_IMAGE.LOCATION_ICON,
        placeholder: strings.signUpScreen.coDistributorDetails.address1,
        key: SIGNUP_KEY_ENUM.ADDRESS1,
        value: this.state.nomineeAddress1,
        handleFunction: this.handleTextInput,
      }, {
        type: INPUT_COMPONENT_TYPE.TEXTINPUT_WITH_ICON,
        icon: VESTIGE_IMAGE.LOCATION_ICON,
        placeholder: strings.signUpScreen.coDistributorDetails.address2,
        key: SIGNUP_KEY_ENUM.ADDRESS2,
        value: this.state.nomineeAddress2,
        handleFunction: this.handleTextInput,
      },
    ];
    const fosterDetails = [{
      type: INPUT_COMPONENT_TYPE.VALID_FOSTER,
      placeholder: strings.signUpScreen.fosterInput.fosterId,
      showIcon: true,
      // icon: this.isValidFoster,
      key: SIGNUP_KEY_ENUM.FOSTER_ID,
      keyboardType: 'numeric',
      maxLength: APP_VALIDATION_CONST.DISTRIBUTOR_MAX_LENGTH,
      isEditable: false,
      value: this.state.fosterId,
      handleFunction: this.handleTextInput,
      // infoLabel: this.state.fosterName?.trim(),
      labelStyle: styles.uplineNameLabel,
    }];


    // const distributorIdDetailsInput = [{
    //   type: INPUT_COMPONENT_TYPE.PICKER,
    //   inputIcon: VESTIGE_IMAGE.PROFILE_ICON,
    //   pickerData: SELECT_DISTRIBUTOR_PICKER,
    //   handlePicker: this.openPicker,
    //   pickerIcon: VESTIGE_IMAGE.OPEN_PICKER_BUTTON,
    //   setPickerValue: this.setPickerValue,
    //   setPickerVisible: this.openPicker,
    // }
    // ]

    // const userDeclaration = [{
    //   type: INPUT_COMPONENT_TYPE.USER_DECLARATION,
    // }];

    return [
      { data: termsAndConditions },
      // { data: uplineInput},
      { title: 'Contact Details as per Kyc Documents*', data: (isUAESelected || isGHANASelected || isIvoryCoastSelected) ? contactDetailsInput.filter( item => !item.optional) :  contactDetailsInput },
      { title: 'Personal Details as per Kyc Documents*', data: personalDetailsInput },
      // ...( isGHANASelected ? [{ title: 'PO Box Details', data: poDetails }] : []),
      // ...( isGHANASelected ? [{ title: 'Digital Address', data: digitalAddress }] : []),
      // { title: 'CREATE PASSWORD*', data: passwordDetailsInput }, // hide password fields as per requirment by JITENDRA
      { title: this.getCoDistributorTitle(), data: (['INDIA', 'NEPAL', 'COUNTRY'].includes(this.selectedCountry.toUpperCase())) ? spouseDetailsInput : nomineeDetailsInput },
      // { title: 'Select your Distributor ID*', data: distributorIdDetailsInput }
      // { data: userDeclaration },
    ];
  }

  clearNomineeDOB = () => {
    // this.selectedCoDob = 'Date of Birth';
    this.dobCoIso = ''
    this.setState({
      selectedCoDistributorDob: ''
    })
  }

  getCoDistributorTitle = () => {
    // if(this.selectedCountry==='India' || this.selectedCountry === 'Country' || this.selectedCountry === 'GHANA') {
    if(['INDIA', 'NEPAL', 'COUNTRY'].includes(this.selectedCountry.toUpperCase())) {
      return 'Spouse/Nominee Details'
    }
    else if(this.selectedCountry.toUpperCase() === 'GHANA') {
      return 'Next of KIN Details'
    }
    return 'Nominee Details'
  }

/**
* @description function for getting the selected value from the date picker
*/
getDob = (date) => {
  let age = compareDates(date);
  let dob = dateFormat(date);
  if(this.selectedPickerValue === 'dob') {
    if((this.countryID == '23' && age.years >19) ||
        (this.countryID != '23' &&  this.stateID != '21' && age.years > 17 ) ||
        (this.countryID != '23' &&  this.stateID == '21' && age.years > 20 )
    ){
      this.selectedOwnDob = date;
      this.dobIso = date.toISOString();
      // console.log('datecheck2', this.dobIso);
      this.selectedDob = dob;
    }
    else {
      this.showToast(strings.errorMessage.signUp.notEligible, Toast.type.ERROR);
    }
  }
  else {
    this.selectedCoDisDob = date;
    this.dobCoIso = date.toISOString();
    this.selectedCoDob = dob;
  }
  this.hideDatePicker();
};
     
/**
 * @description function for hiding the datePicker
 */
hideDatePicker = () => this.isDatePickerVisible = false;

/**
* @description function for showing the datePicker
* @param selectedPicker means the picker key
*/
showDatePicker = (index) => {
  console.log(index)
  this.isDatePickerVisible = true; 
  this.selectedPickerValue = index;
}

/**
 * @description show password
 * @param passwordField return {true,false}
 * @param passwordInput return {password, confirm_password key for the input fields }
 */
showHidePassword = (passwordInput, passwordField) => {
  if(passwordInput === SIGNUP_KEY_ENUM.CONFIRM_PASSWORD){
    this.showConfirmPassword = passwordField;
  }
  else {
    this.showPassword = passwordField;
  }
}

setModalVisible(visible) {
  this.setState({modalVisible: visible});
}

/**
* @description Function for geeting user input value from the fields
*/
handleTextInput = async (key, text) => {
  const isGuestUser = this.props.auth.userRole === UserRole.GuestUser;
  switch(key){
    case SIGNUP_KEY_ENUM.DISTRIBUTOR_ID : {
      // console.log(SIGNUP_KEY_ENUM.DISTRIBUTOR_ID)
      if(text.length === 8 ){
        Keyboard.dismiss()
        if(isDistributorIdValidator(text)){
          if(this.props.auth.isTokenAvailable && !isGuestUser)  {
            if(text === this.props.auth.distributorID){
              this.validUplineIcon = true;
              AlertClass.showAlert('', 
                `${this.props.profile.firstName} ${this.props.profile.lastName} is valid distributor`, 
                [{text: strings.commonMessages.ok, onPress: () => console.log('Ok')}]
              )  
            }
            else{
              // await this.props.cart.validateDownline(text,undefined,true);
              const res = await this.props.cart.validateUser(text,undefined,true);
              if(Object.keys(this.props.cart.validatedDownline).length > 1 ){
                this.validUplineIcon = true;
                this.showToast(`${this.props.cart.validatedDownline.firstName} ${this.props.cart.validatedDownline.lastName} is valid distributor` , Toast.type.SUCCESS)
              }
              else {
                this.validUplineIcon = false;
                AlertClass.showAlert('', 
                  res.message ? res.message : strings.errorMessage.signUp.distributorError, 
                  [{text: strings.commonMessages.ok, onPress: () => console.log('Ok')}]
                )  
              }
            }
            this.setState({
              distributorId: text
            })
          }
          else {
            let res = await this.props.auth.validateUplineId(text);
            if(res.success && res.data?.isValidDistributor){
              this.validUplineIcon = true;
              // this.setState({uplineName: res.data.distributorName})
              this.showToast(res.data.distributorName+' is valid distributor', Toast.type.SUCCESS)
            }
            else { 
              this.validUplineIcon = false;
              this.showToast((res.message ? res.message : strings.errorMessage.signUp.distributorError), Toast.type.ERROR);
            }
            this.setState({
              distributorId: text
            })
          }
        }
        else {
          AlertClass.showAlert('', 
            strings.errorMessage.location.inputType, 
            [{text: strings.commonMessages.ok, onPress: () => console.log('Ok')}]
          ) 
          return;
        }
      }
      if(text.length < 8 ) {
        this.setState({
          distributorId: '',
        })
        this.validUplineIcon = 'default';
      }  
      if(text.length > 0) {
        this.editRefferalId = false
      }
      else {
        this.editRefferalId = true
      }
      break;
    }
    case SIGNUP_KEY_ENUM.FIRSTNAME: {
      this.setState({
        firstName : text
      });
      break;
    }

    case SIGNUP_KEY_ENUM.LASTNAME: {
      this.setState({
        lastName : text
      });
      break;
    }
    
    case SIGNUP_KEY_ENUM.PO_BOX_NUMBER: {
      this.setState({
        poBoxNumber : text
      });
      break;
    }

    case SIGNUP_KEY_ENUM.DIGITAL_ADDRESS_GHANA: {
      this.setState({
        digitalAddressGhana : text
      });
      break;
    }

    case SIGNUP_KEY_ENUM.MOBILE_NUMBER : {
      this.setState({
        mobileNumber: text
      });
      this.isOtpVerified = false;
      break;
    }
    
    case SIGNUP_KEY_ENUM.EMAIL_ID : {
      this.setState({
        emailId: text
      });
      break;
    }

    case SIGNUP_KEY_ENUM.ADDRESS: {
      this.setState({
        address: text
      });
      break;
    }
    
    case SIGNUP_KEY_ENUM.PASSWORD: {
      this.setState({
        password: text
      });
      break;
    }

    case SIGNUP_KEY_ENUM.CONFIRM_PASSWORD: {
      this.setState({
        confirm_password: text
      });
      break;
    }

    case SIGNUP_KEY_ENUM.DOB:{
      const date = maskDate(text);
      this.setState({selectedDate:date})
      if(date.length == 10){
        // this.selectedPickerValue='dob'
        this.selectedPickerValue = SIGNUP_KEY_ENUM.DOB
        this.getDob(newDobFormat(date))
      } 
      break;
    }

    case SIGNUP_KEY_ENUM.CO_DISTRIBUTOR_DOB:{
      const maskeddate = maskDate(text);
      this.setState({selectedCoDistributorDob: maskeddate})
      if(maskeddate.length == 10){
        this.selectedPickerValue=SIGNUP_KEY_ENUM.CO_DISTRIBUTOR_DOB
        this.getDob(newDobFormat(maskeddate))
      } 
      break;
    }

    case SIGNUP_KEY_ENUM.CO_DISTRIBUTOR_FIRSTNAME: {
      this.setState({
        coDistributorFirstName : text
      });
      break;
    }

    case SIGNUP_KEY_ENUM.CO_DISTRIBUTOR_LASTNAME: {
      this.setState({
        coDistributorLastName : text
      });
      break;
    }

    case SIGNUP_KEY_ENUM.PINCODE : {
      if(text!==6) {
        this.setState({ pincode: text })
      }
      if(text.length == this.state.pincodeLength) {
        if(isPinCodeValidate(text.trim())){
          this.getCountryStateList(text)
        }
        else {
          AlertClass.showAlert('', 
            strings.errorMessage.location.inputType, 
            [{text: strings.commonMessages.ok, onPress: () => console.log('Ok')}]
          ) 
          return;
        }
      }
      if(this.selectedCountry === 'Country' && this.selectedState === 'State' && this.selectedCity=== 'City'){
        if(text.length < 6) {
          this.isPickerDisabled = false;
          this.selectedCountry = 'Country';
          this.countryID = '';
          this.selectedState = 'State';
          this.stateID = '';
          this.selectedCity =  'City';
          this.cityID = '';
        }
      }
      else{
        this.isPickerDisabled = true;
        // this.selectedCountry = 'Country';
        // this.countryID = '';
        // this.selectedState = 'State';
        if(this.state.selectedMobileCountryCode.toUpperCase() == 'UAE') {
          this.selectedState = 'Emirates'
        }
        else if(this.state.selectedMobileCountryCode.toUpperCase() == 'PH') {
          this.selectedState = 'Select Province'
        }
        else {
          this.selectedState = 'State'
        }
        this.stateID = '';
        this.selectedCity =  'City';
        this.cityID = '';
      }
      break;
    }
    // case SIGNUP_KEY_ENUM.REFERAL_CODE: {
    //   this.referralCode = text.slice(3);
    //   this.validRefferalIcon = 'default';
    //   this.setState({
    //     referralCode: text,
    //   })
    //   if(this.referralCode.length > 5) {
    //     Keyboard.dismiss()
    //     this.referral = JSON.stringify(hexToDecimal(this.referralCode))
    //     if(this.referral.length === 8 && isDistributorIdValidator(this.referral)){
    //       if(this.props.auth.isTokenAvailable) {
    //         if(this.referral === this.props.auth.distributorID){
    //           this.validRefferalIcon = true;
    //           AlertClass.showAlert('', 
    //             strings.errorMessage.signUp.referralSuccess, 
    //             [{text: strings.commonMessages.ok, onPress: () => console.log('Ok')}]
    //           ) 
    //         }
    //         else{
    //           await this.props.cart.validateDownline(this.referral,undefined,true);
    //           if(Object.keys(this.props.cart.validatedDownline).length > 1 ){
    //             this.validRefferalIcon = true;
    //             AlertClass.showAlert('', 
    //               `${strings.errorMessage.signUp.referralSuccess} ${strings.errorMessage.signUp.joiningUnder} ${this.props.cart.validatedDownline.firstName} ${this.props.cart.validatedDownline.lastName}`, 
    //               [{text: strings.commonMessages.ok, onPress: () => console.log('Ok')}]
    //             )  
    //           }
    //           else {
    //             this.validRefferalIcon = false;
    //             this.referral = '';
    //             AlertClass.showAlert('', 
    //               strings.errorMessage.signUp.refferalCodeError, 
    //               [{text: strings.commonMessages.ok, onPress: () => console.log('Ok')}]
    //             ) 
    //           }
    //         }
    //       }
    //       else {
    //         this.validateReferral(this.referralCode);
    //       }
    //     }
    //     else {
    //       (text.length === 10 ) ?    ( AlertClass.showAlert('', 
    //         strings.errorMessage.signUp.enterReferral, 
    //         [{text: strings.commonMessages.ok, onPress: () => console.log('Ok')}]
    //       ) ):''
    //       return;
    //     }
    //   }
    //   if(this.referralCode.length < 6 ) {
    //     this.referral = ''
    //     // this.setState({
    //     //   referralCode: '',
    //     // })
    //     this.validRefferalIcon = 'default';
    //   }  
    //   if(text.length > 0) {
    //     this.editUplineId = false
    //   }
    //   else {
    //     this.editUplineId = true

    //   }
    //   break;
    // }
    case SIGNUP_KEY_ENUM.RELATIONSHIP : {
      this.setState({ nomineeRelationship: text })
      break;
    }
    case SIGNUP_KEY_ENUM.ADDRESS1: {
      this.setState({ nomineeAddress1: text })
      break;
    }
    case SIGNUP_KEY_ENUM.ADDRESS2: {
      this.setState({ nomineeAddress2: text })
      break;
    }
    case SIGNUP_KEY_ENUM.SPOUSE_NAME : {
      this.setState({ spouseName: text })
      break;
    }
    case 'otp': {
      this.setState({otp: text})
    }
  }
}

/**
 * @description function get the country, state, city name on the basis of pincode
 * @param {*} pincode pincode
 */
getCountryStateList = async(pincode) => {
  // console.log('Before----------------------',this.selectedCountry)
  this.setState({
    pincode: pincode
  });
  this.isPickerDisabled = true;
  const pincodeQueryParams = `${pincode}?countryId=${this.countryID}`
  const response = await this.props.location.getCountryStateCity(pincodeQueryParams);
  if(response) {
    this.showToast(response, Toast.type.ERROR);
    this.isPickerDisabled = false;
    this.state.pincode = ''; 
    // this.selectedCountry='Select Country'; 
    this.selectedCity='Select City';
    this.selectedState='Select State';  
  }
  // else if(this.props.location.countryStateCityList.country.states.length > 1 || this.props.location.countryStateCityList.country.states[0].cities.length > 1){
  //   this.isPickerDisabled = false
  //   // this.selectedCountry = this.props.location.countryStateCityList.country.countryName,
  //   // this.countryID = this.props.location.countryStateCityList.country.countryId,
  //   this.props.location.stateListData = this.props.location.countryStateCityList.country.states
  //   this.stateData = this.props.location.getStateName;
  //   this.distributorListData = await this.props.auth.getDistributorIdListData(this.countryID) || [] ;
  // }
  else {
    // this.selectedCountry = this.props.location.countryStateCityList.country.countryName,
    // this.countryID = this.props.location.countryStateCityList.country.countryId,
    this.selectedState = this.props.location.countryStateCityList.country.states[0].stateName
    this.stateID = this.props.location.countryStateCityList.country.states[0].stateId,
    this.selectedCity =  this.props.location.countryStateCityList.country.states[0].cities[0].cityName,
    this.cityID = this.props.location.countryStateCityList.country.states[0].cities[0].cityId
    this.cityData = this.props.location.countryStateCityList.country.states[0].cities.map( item => item.cityName );
    // this.showVerifyOtp = this.props.location.countryStateCityList.country.otpBasedRegistration;
    this.zoneId = this.props.location.countryStateCityList.country.zones.zoneId;
    this.distributorListData = await this.props.auth.getDistributorIdListData(this.countryID) || [] ;
    if(this.props.location.countryStateCityList.country.states[0].cities.length > 1) {
      this.setState({
        isCityPickerDisabled: false
      })
    }
    // this.setState({ 
    // mobileIsdCode: this.props.location.countryStateCityList.country.isdCode, 
    // selectedMobileCountryCode: this.props.location.countryStateCityList.country.countryCode,
    // dafTermsANDConditions: this.props.location.countryStateCityList.country.dafTermsANDConditions,
    // mobileNumberLimit: this.props.location.countryStateCityList.country.mobileNumberLimit
    // })
    // console.log('After----------------------',this.selectedCountry)
  }
}

@autobind
showToast(message: string,  toastType: Toast.type) {
  // Add a Toast on screen.
  Toast.show(message, {
    duration: Toast.durations.SHORT,
    type: toastType,
    shadow: false,
    animation: true,
    hideOnPress: true,
    delay: 0,
  });
}

locationKeyForDobValidation = () => {
  if(this.stateID == '21'){
    return this.stateID
  }
  else{
    return this.countryID
  }
}

dobValidationMessage = (value) => {
  if(value == '21'){
    return strings.errorMessage.signUp.invalidDobMaharashtra
  }
  else if(value == '23'){
    return strings.errorMessage.signUp.invalidDobThailand
  }
  else{
    return strings.errorMessage.signUp.invalidDob
  }
}

isValidate = () => {
  // const isUAESelected = this.state.selectedMobileCountryCode.toUpperCase() == 'UAE'
  const isGHANASelected = this.state.selectedMobileCountryCode.toUpperCase() === 'GHANA';
  console.log(isGHANASelected)
  // if((!this.state.distributorId && !this.referral) || (!isDistributorIdValidator(this.state.distributorId.trim())&& !isDistributorIdValidator(this.referral)) ) {
  //   if(this.referral){
  //     return strings.errorMessage.signUp.invalidReferralCode
  //   }
  //   return strings.errorMessage.signUp.invalidUpline
  // }
  //VMP-3125
  if(!this.state.isTermsConditionsAccepted){
    return strings.errorMessage.signUp.acceptTermAndCondn
  //   return true;
  }
  else if(!this.state.ageRestrictionCheck){
    return strings.errorMessage.signUp.acceptAgeCheck
  }
  if(!this.state.pincode || 
    !isPinCodeValidate(this.state.pincode) || 
    this.state.pincode.trim().length != this.state.pincodeLength ) {
    return strings.errorMessage.signUp.invalidPincodeEmirates
  }
  else if(this.state.cityId == ''){
    return strings.errorMessage.signUp.invalidCity
  }
  // else if(!this.countryID) {
  //   return 'Please select Country.'
  // }
  // else if(!this.state.mobileNumber.trim()) {
  //   return strings.errorMessage.signUp.emptyMobileNumber
  // }
  // else if(this.state.mobileNumber.trim().length != this.state.mobileNumberLimit) {
  //   return `Mobile Number length must be of ${this.state.mobileNumberLimit} digits.`
  // }
  // else if(!(isMobileNumberValid(this.state.mobileNumber.trim()))){
  //   return strings.errorMessage.signUp.invalidMobileNumber
  // }
  else if(!this.state.address.trim() || !isAddressValidate(this.state.address)) {
    return strings.errorMessage.signUp.invalidAddress
  }
  else if(!this.state.emailId || !isEmailValidate(this.state.emailId)) {
    return strings.errorMessage.signUp.invalidEmail
  }
  else if(!this.selectedTitle || this.selectedTitle === 'Title'){
    return strings.errorMessage.signUp.invalidUserTitle
  }
  else if(!this.state.firstName.trim() || !isNameValidator(this.state.firstName)) {
    return strings.errorMessage.signUp.invalidName
  }
  else if(this.state.lastName?.trim() && !isNameValidator(this.state.lastName, true) ) {
    return strings.errorMessage.signUp.invalidLastName
  }
  else if(!this.state.selectedDate || !isValidateDate(this.state.selectedDate)) {
    return strings.errorMessage.signUp.invalidDate
  }
  // else if(!this.dobIso || !isValidateDob(this.dobIso)) {
  //   return strings.errorMessage.signUp.invalidDob
  // }
  else if( !isValidateDob(newDobFormat(this.state.selectedDate), this.locationKeyForDobValidation())){
    return this.dobValidationMessage(this.locationKeyForDobValidation())
  }
  else if(!this.selectedGender || this.selectedGender ==='Gender') {
    return strings.errorMessage.signUp.invalidUserGender
  }
  // Hide password validation (by Jitendra) as per requirment 
  // else if(!this.state.password.trim() || !isPasswordValidate(this.state.password.trim())) {
  //   return strings.errorMessage.signUp.passwordValidationMessage
  // }
  // else if(!this.state.confirm_password) {
  //   return strings.errorMessage.signUp.invalidConfirmPassword
  // }
  // else if(!this.state.password || !this.state.confirm_password || !isMatchPasswordValidate(this.state.password,this.state.confirm_password)) {
  //   return strings.errorMessage.signUp.invalidMatchPassword
  // }
  // else if(this.selectedDistributor === 'Distributor ID') {
  //   return strings.errorMessage.signUp.invalidDistributor
  // }
  else if(this.state.spouseName) {
    if(!this.state.spouseName.trim() || !isNameValidator(this.state.spouseName))
      return strings.errorMessage.signUp.invalidNomineeName
  }
  else if(this.state.coDistributorLastName && (!this.state.coDistributorLastName.trim() || !isNameValidator(this.state.coDistributorLastName, true))) {
    return strings.errorMessage.signUp.invalidNomineeLastName
  }
  else if(this.state.nomineeAddress1 && !this.state.nomineeAddress1.trim()){
    return strings.errorMessage.signUp.invalidNomineeAddressOne
  }
  else if(this.state.nomineeAddress2 && !this.state.nomineeAddress2.trim()){
    return strings.errorMessage.signUp.invalidNomineeAdressTwo
  }
  else if(isGHANASelected && !this.state.digitalAddressGhana.trim()) {
    return 'Please fill your digital address.'
  }
  else if(this.state.coDistributorFirstName || this.state.selectedCoDistributorDob.trim() || this.state.nomineeRelationship) {
    if(!this.state.coDistributorFirstName) {
      return strings.errorMessage.signUp.firstNameRequired
    }
    if(!isNameValidator(this.state.coDistributorFirstName) || !this.state.coDistributorFirstName.trim() ) {
      return strings.errorMessage.signUp.invalidNomineeFirstName
    }
    if(!this.state.nomineeRelationship) {
      return strings.errorMessage.signUp.nomineeRelationshipRequired
    }
    if(!isNameValidator(this.state.nomineeRelationship) || !this.state.nomineeRelationship.trim()) {
      return strings.errorMessage.signUp.invalidNomineeRelationship
    }
    if(!this.state.selectedCoDistributorDob) {
      return strings.errorMessage.signUp.nomineeDobRequired
    }
    if(this.state.selectedCoDistributorDob.trim() && !isValidateDate(this.state.selectedCoDistributorDob)){
      return strings.errorMessage.signUp.invalidNomineeDob
    }
    if(this.state.selectedCoDistributorDob.trim() && 
        !isValidateDob(newDobFormat(this.state.selectedCoDistributorDob), this.locationKeyForDobValidation(), true)
    ){
      return strings.errorMessage.signUp.minimumNomineeAge;
    }
  }
}

// navigateOtherScreen = () => {
//   const token = this.props.auth.authToken
//   if(token){
//     this.props.navigation.pop()
//   }
//   else {
//     this.props.navigation.navigate('login');
//   }
// }

/**
* @description this will close review modal for signup form.
*/
closeReviewModal = () => {
  this.setState({
    isReviewModalVisible: false
  })
}

/**
* @description this method will check complete validation and other stuff before registration.
*/
onSignup = async () => {
  // trackEvent(SIGNUP_BUTTON_PRESS.eventCategory, SIGNUP_BUTTON_PRESS.events.NAVIGATE);
  const isInternetConnected = await connectedToInternet();
  if(isInternetConnected) {
    const errorMessage = this.isValidate();
    if(errorMessage) {
      this.showToast(errorMessage, Toast.type.ERROR)
    }
    else {
      if(!this.validUplineIcon){
        this.showToast(strings.errorMessage.signUp.validUpline, Toast.type.ERROR);
        return;
      }
      // if(!this.isOtpVerified && this.showVerifyIcon()) {
      //   this.showToast(strings.errorMessage.signUp.mobileNumberVerify, Toast.type.ERROR)
      //   return;
      // }
      // if(!this.downlineRegistration && this.state.showVestigeFamilyMemberOptions && !this.state.selectedVestigeFamilyMemberOption){
      //   this.showToast(strings.errorMessage.signUp.familyMemberTextError, Toast.type.ERROR)
        
      //   return 
      // }
      if(!this.state.isTermsConditionsAccepted) {
        AlertClass.showAlert('', 
          strings.errorMessage.signUp.acceptTermAndCondn, 
          [{text: strings.commonMessages.ok, onPress: () => console.log('Ok')}]
        ) 
        return;
      }
      if(!this.state.lastName?.trim() || !isNameValidator(this.state.lastName, true)){
        AlertClass.showAlert('', 
          strings.errorMessage.signUp.lastNameWarning, 
          [
            {text: strings.commonMessages.no, onPress: () => console.log('No Pressed')}, 
            {text: strings.commonMessages.yes,  onPress: () => this.openReviewModal()}
          ]);
      }
      else{
        this.openReviewModal()
      }
    }
  }
  else {
    this.showToast(strings.errorMessage.internetConnection.noInternetConnection, Toast.type.ERROR)
  }
}

/**
* @description This will handle or create review modal data which will be later formatted and shown in screen.
*/
handleReviewDetails = async () => {
  const titleObject = TITLE_DATA.filter(value => value.titleId === Number(this.selectedTitleId));
  const formattedAddress = `${this.state.address}, ${this.selectedCity}, ${this.selectedState}, ${this.selectedCountry} - ${this.state.pincode}`;
  
  let nomineeSpouseData;
  let nomineeAddress;
  if (this.state.nomineeAddress1 || this.state.nomineeAddress2) {
    nomineeAddress = `${this.state.nomineeAddress1} ${this.state.nomineeAddress2}`;
  }
  if (['INDIA', 'NEPAL', 'COUNTRY'].includes(this.selectedCountry.toUpperCase())) {
    nomineeSpouseData = [
      { heading: 'Spouse/Nominee Details', data: this.state.spouseName || ''},
    ];
  }
  else{
    nomineeSpouseData = [
      { heading: 'Nominee First Name', data: this.state.coDistributorFirstName || ''},
      { heading: 'Nominee Last Name', data: this.state.coDistributorLastName || ''},
      { heading: 'Nominee Relationship', data: this.state.nomineeRelationship || ''},
      { heading: 'Nominee DOB', data: this.state.selectedCoDistributorDob || ''},
      { heading: 'Nominee Address', data: nomineeAddress || ''},
    ];
  }

  const reviewDetails = [
    { heading: 'Distributor Id', data: this.props.auth.distributorID || ''},
    { heading: 'Title', data: titleObject[0].title || ''},
    { heading: 'First Name', data: this.state.firstName || ''},
    { heading: 'Last Name', data: this.state.lastName || ''},
    { heading: 'Gender', data: this.selectedGender || ''},
    { heading: 'Date of Birth', data: this.state.selectedDate || ''},
    { heading: 'Mobile Number', data: this.state.mobileNumber || ''},
    { heading: 'Email Id', data: this.state.emailId || ''},
    { heading: 'Distributor Address', data: formattedAddress || ''},
  ];
  const finalData = [...reviewDetails, ...nomineeSpouseData];

  this.reviewModalData = finalData;
}

/**
* @description This will open review modal for signup form and check validation.
*/
openReviewModal = async () => {
  this.handleReviewDetails();
  this.setState({
    isReviewModalVisible: true
  })
}

/**
* @description function for handling submit button
*/
handleSubmitButton = _.debounce(() => {
  this.submitData();
}, 1000, { leading: true, trailing: false });


/**
* @description function for submit the data of the user to db
*/
submitData = async() => {
  const isINDSelected = this.state.selectedMobileCountryCode.toUpperCase() == 'IN';
  const user = {
    // uplineDistributorId: (this.state.distributorId) ? this.state.distributorId : this.referral,
    firstName:this.state.firstName,
    lastName:this.state.lastName || '.',
    title: this.selectedTitleId,
    dob:this.dobIso,
    nomineeDob: this.dobCoIso || '',
    // isVestigeFamilyMember: this.state.selectedVestigeFamilyMemberOption ? this.state.selectedVestigeFamilyMemberValue : '-1',
    nomineeFirstName: this.state.coDistributorFirstName || '',
    nomineeLastName: this.state.coDistributorLastName || '',
    nomineeTitle: this.selectedCoDistributorTitleId || '',
    // status: '1',
    // minFirstPurchaseAmount: 123.00,
    // registrationDate: new Date().toISOString(),
    // panNumber: '',
    // password: '',//this.state.password, //send password blank (by jitendra) as per requirment
    // referralCode: this.referralCode,
    isApproved:1,
    distributorsAddress: [{
      address1: this.state.address,
      isDefault:true,
      contactName: this.state.firstName,
      // contactNumber: isINDSelected ? this.state.mobileNumber : (this.state.mobileIsdCode + this.state.mobileNumber),
      contactNumber: this.state.mobileNumber,
      pincode:{
        pincode: this.state.pincode,
      },
      zone: {
        zoneId: this.zoneId
      },
      countryId: this.countryID,
      stateId: this.stateID,
      cityId: this.cityID
    }],
    // mobileNumber: isINDSelected ? this.state.mobileNumber : (this.state.mobileIsdCode + this.state.mobileNumber),
    emailId:this.state.emailId,
    gender: this.selectedGender,
    distributorId: this.props.auth.distributorID,
    // otp: this.state.otp,
    spouseName: this.state.spouseName,
    nomineeAddress1: this.state.nomineeAddress1,
    nomineeAddress2: this.state.nomineeAddress2,
    nomineeRelationship: this.state.nomineeRelationship,
    distGender: this.distGender,
    poBox: this.state.poBoxNumber,
    digitalAddress: this.state.digitalAddressGhana
  };
  // console.log(user)
  const res = await this.props.auth.handleCompleteRegistration(user);
  if(res.success){
    this.closeReviewModal();
    if (this.props.appConfiguration?.isKycSkippable) {
      this.props.auth.setSkippableLoginKycInProcess(true);
      await this.props.auth.saveLoginSessionData();
    }
    else {
      // await this.props.auth.saveLoginSessionData();
      this.props.navigation.navigate('kycImage', {isLoginRoute : true});
    }
  }
  else{
    AlertClass.showAlert('Alert',
      res.message,
      [{text: strings.commonMessages.ok, onPress: () => {
        this.closeReviewModal();
        res.message === 'Distributor accepted the T and C already. ' ? this.props.navigation.navigate('kycImage', {isLoginRoute : true}) : null
      }}]
    )
  } 
  // let mess = strings.errorMessage.signUp.registrationFailed;

  // setTimeout(() => {
  //   Alert.alert(
  //     strings.errorMessage.signUp.successfullRegistration1,
  //     `${strings.errorMessage.signUp.successfullRegistration2} ${this.selectedDistributor}.`,
  //     [
  //       {text: strings.commonMessages.ok, onPress: () => this.navigateOtherScreen()},
  //     ],
  //     { cancelable: false }
  //   )
  // }, 100)
}

/**
 * @param {*} visible true, false
 * @param {*} openPickerType picker key { country, state, city, pincode }
 */
@autobind
openPicker (visible, openPickerType){
  switch(openPickerType){
    case PICKER_ENUM.TITLE_PICKER : {
      this.titlePickerVisible = visible;
      break;
    }
    case PICKER_ENUM.COUNTRY_PICKER : {
      this.countryPickerVisible = visible;
      break;
    }
    case PICKER_ENUM.STATE_PICKER : {
      if(this.countryID === ''){
        this.showToast(strings.errorMessage.signUp.stateError, Toast.type.ERROR)
      }
      else {
        this.statePickerVisible = visible;
      }
      break;
    }
    case PICKER_ENUM.CITY_PICKER : {
      if(this.stateID === ''){
        this.showToast(strings.errorMessage.signUp.cityError, Toast.type.ERROR)
      }
      else {
        this.cityPickerVisible = visible;
      }
      break;
    }
    case PICKER_ENUM.GENDER_PICKER : {
      this.genderPickerVisible = visible;
      break;
    }
    case PICKER_ENUM.CODISTRIBUTOR_PICKER : {
      this.coDistributorPickerVisible= visible;
      break;
    }
    case PICKER_ENUM.DISTRIBUTOR_PICKER : {
      this.distributorListPickerVisible= visible;
      break;
    }
  }
}

/**
 * @param {*} selectedPickerValue selected value
 * @param {*} selectedPickerIndex picker key { 0, 1,2.... }
 * @param {*} selectedPickerKey picker key { country, state, city, pincode, title, gender, coTitle, distributor }
 * @param {*} isInitialData if true then picker modal will not auto open
 * @param {*} callbackFunction if any async function need to be called.
 */
setPickerValue = async(selectedPickerValue, selectedPickerIndex, selectedPickerKey, isInitialData, callbackFunction) => {
  const isUAESelected = this.state.selectedMobileCountryCode.toUpperCase() == 'UAE';
  const isGHANASelected = this.state.selectedMobileCountryCode.toUpperCase() === 'GHANA';
  const isIvoryCoastSelected = this.state.selectedMobileCountryCode.toUpperCase() == 'CI'
  const { location } = this.props;
  if(selectedPickerIndex !== 0){
    switch(selectedPickerKey) {
      case PICKER_ENUM.TITLE_PICKER : {
        this.selectedTitle = selectedPickerValue.title;
        this.selectedTitleId = selectedPickerValue.titleId;
        this.selectedGender = 'Gender';
        this.distGender = '';
        !isInitialData ?  this.openPicker(!this.titlePickerVisible, selectedPickerKey) : null
        break;
      }
      case PICKER_ENUM.GENDER_PICKER : {
        var message = getGenderValidation(this.selectedTitle,selectedPickerValue.title)
        if(message != ''){
          this.genderPickerVisible = false;
          this.showToast(message, Toast.type.ERROR);          
          return
        }
        this.selectedGender = selectedPickerValue.title;
        this.distGender = selectedPickerValue.titleId;
        this.openPicker(!this.genderPickerVisible, selectedPickerKey);
        break;
      }
      case PICKER_ENUM.COUNTRY_PICKER : {
        this.selectedCountry = selectedPickerValue;
        const selectedCountryObject = location.countryListData.find(obj => obj.countryName === selectedPickerValue)
        console.log(selectedCountryObject)
        const mapObj = {
          listulStart: '<ul>',
          listulend: '</ul>',
          listbodyStart: '<li>',
          listbodyend:  '</li>'
        };
        let dafTermsANDConditions = 
          (selectedCountryObject.dafTermsANDConditions?.replace(/listulStart|listulend|listbodyStart |listbodyend/gi, function(matched){
            if(matched == 'listbodyStart '){  // to remove extra space
              return mapObj['listbodyStart']
            }
            else{
              return mapObj[matched];
            }
          }));
        this.setState({ 
          mobileIsdCode: selectedCountryObject.isdCode, 
          selectedMobileCountryCode: selectedCountryObject.countryCode,
          dafTermsANDConditions: dafTermsANDConditions,
          mobileNumberLimit: selectedCountryObject.mobileNumberLimit,
          pincodeLength: selectedCountryObject.pincodeLength,
          digitalAddressInfo: selectedCountryObject.digitalAddressInfo,
          //showVestigeFamilyMemberOptions: selectedCountryObject.enableIsFamilySection,
          //selectedVestigeFamilyMemberOption: '',
          isCityPickerDisabled: selectedCountryObject.countryCode.toUpperCase() == 'GHANA' ? false : true
        })
        this.showVerifyOtp = selectedCountryObject.otpBasedRegistration;
        const listWait = new Promise((resolve, reject) => {
          location.countryListData.filter(async (country)=>{
            if(country.countryName === selectedPickerValue && this.countryID !== country.countryId){
              this.getCountrySpecificAgeDeclaration(country.countryId);
              await location.stateList(country.countryId);
              // if(!this.distributorListData.length)
              // this.distributorListData = await this.props.auth.getDistributorIdListData(country.countryId) || []
              if(this.state.selectedMobileCountryCode.toUpperCase() == 'UAE') {
                this.selectedState = 'Select Emirates'
                this.isPickerDisabled = false;
              }
              else if(this.state.selectedMobileCountryCode.toUpperCase() == 'GHANA') {
                this.selectedState = 'Select Region'
                this.isPickerDisabled = false;
              } else if(this.state.selectedMobileCountryCode.toUpperCase() == 'CI') {
                this.selectedState = 'Select Region'
                this.isPickerDisabled = false;
              }
              else if(this.state.selectedMobileCountryCode.toUpperCase() == 'PH') {
                this.selectedState = 'Select Province'
              }
              else {
                this.selectedState = 'Select State'
              } 
              this.selectedDistributor = 'Distributor ID'
              this.selectedCity = 'Select City'
              this.stateID = this.cityID = ''   
              this.stateData = location.getStateName;
              this.countryID = country.countryId;
              resolve();
            }
          })
        })
        this.setState({ pincode: '',  mobileNumber: ''})
        !isInitialData ? this.openPicker(!this.countryPickerVisible, selectedPickerKey) : null
        listWait?.then(() => {
          callbackFunction();
        })
        break;
      }
      case PICKER_ENUM.STATE_PICKER : {
        this.selectedState = selectedPickerValue;
        const selectedStateObj =   location.stateListData.find( obj => obj.stateName.toUpperCase() === selectedPickerValue.toUpperCase() );
        console.log(selectedStateObj)
        if(isUAESelected || isGHANASelected) {
          const selectedPincode = selectedStateObj.pinCode.toString();
          this.setState({ pincode: selectedPincode })
        }
        this.zoneId = selectedStateObj.zoneId;
        location.stateListData.filter(async (state, index)=>{
          // console.log(state.stateName, this.state)
          // if(state.stateName === selectedPickerValue && this.state.pincode){
          //   this.selectedCity = 'Select City'
          //   this.cityID = ''
          //   this.props.location.cityListData = this.props.location.countryStateCityList.country.states[index].cities
          //   this.cityData = await location.getCityName
          //   this.stateID = state.stateId;
          // }
          // else
          if(state.stateName === selectedPickerValue && this.stateID !== state.stateId){
            this.selectedCity = 'Select City'
            this.cityID = ''
            await location.cityList(state.stateId);
            this.cityData = location.getCityName;
            this.stateID = state.stateId
          }
          if(isUAESelected) {
            this.selectedCity = this.cityData && this.cityData[0];
            this.cityID = this.props.location.cityListData && this.props.location.cityListData.length && this.props.location.cityListData[0].cityId
          }
        })
        !isInitialData ? this.openPicker(!this.statePickerVisible, selectedPickerKey) :  null
        break;
      }
      case PICKER_ENUM.CITY_PICKER : {
        let cityObj;
        if(isGHANASelected || isIvoryCoastSelected) {
          cityObj = this.props.location.cityListData.find( item => item.cityName === selectedPickerValue )
        }
        else {
          cityObj = this.props.location.countryStateCityList.country.states[0].cities.find( item => selectedPickerValue === item.cityName )
        }
       
        if(isIvoryCoastSelected) {
          const selectedPincode = cityObj.pincode.toString();
          this.setState({ pincode: selectedPincode })
        }
        this.selectedCity = selectedPickerValue
        this.cityID = cityObj.cityId;
        console.log(this.cityID, cityObj)
        // await this.props.location.cityListData.filter(async (city)=>{
        //   this.selectedCity = selectedPickerValue,
        //   this.cityID = city.cityId
        // });
        !isInitialData ? this.openPicker(!this.cityPickerVisible, selectedPickerKey) :  null
        break;
      }
      case PICKER_ENUM.CODISTRIBUTOR_PICKER : {
        this.selectedCoDistributorTitle = selectedPickerValue.title;
        this.selectedCoDistributorTitleId = selectedPickerValue.titleId;
        this.openPicker(!this.coDistributorPickerVisible, selectedPickerKey);
        break;
      }
      case PICKER_ENUM.DISTRIBUTOR_PICKER : {
        this.selectedDistributor = selectedPickerValue;
        this.openPicker(!this.distributorListPickerVisible, selectedPickerKey);
        break;
      }
    }
  }
}

isAllFieldsDisabled = (value) => {
  // if(!this.state.isTermsConditionsAccepted || !this.state.ageRestrictionCheck){
  //   return true;
  // }
  if(value?.type == INPUT_COMPONENT_TYPE.SIGNUP_VALID_UPLINE){
    return false;
  }
}

// onSelectVestigeFamilyMemberOption = (option) => {
//   this.setState({
//     selectedVestigeFamilyMemberOption: option,
//     selectedVestigeFamilyMemberValue: option === 'Yes' ? '1' : '0'
//   })
// }

// handleOtpModal = (value) => {
//   if(value === true){
//     const errorMessage = this.isValidate();
//     if(errorMessage) {
//       this.showToast(errorMessage, Toast.type.ERROR)
//     }
//     else{
//       this.setState({
//         isOtpModalVisible: value
//       })
//     }
//   }
//   else{
//     this.setState({
//       isOtpModalVisible: value
//     })
//   }
// }

/**
 * @description This will render review modal and provide final submission button to user.
 */
renderReviewModal = () => {

  return(
    <SignupReviewModal
      loader={Platform.OS === 'ios' && this.props.auth.isLoading}
      isVisible={this.state.isReviewModalVisible}
      reviewData={this.reviewModalData}
      closeReviewModal={() => this.closeReviewModal()}
      submitData={() => this.handleSubmitButton()}
    />
  )
}

renderTnCSection = () => {
  return (
    <View>
      <View style={styles.tncView}>
        <Checkbox 
          label={strings.errorMessage.signUp.agreeTNCTitle} 
          overrideStyles={{ marginRight: 5 , marginLeft: 10}}
          isSelected={this.state.isTermsConditionsAccepted}
          checkBoxLabelStyle={{ color: this.state.isTermsConditionsAccepted ? COLOR_CODES.black : COLOR_CODES.vividRed}}
          getQuantity={()=>this.setState({ isTermsConditionsAccepted: !this.state.isTermsConditionsAccepted })}
        />
        <Text style={{ paddingLeft: 3, borderBottomWidth: 0.8, paddingRight: 0, paddingTop: 1,color: this.state.isTermsConditionsAccepted ? COLOR_CODES.black : COLOR_CODES.vividRed }} onPress={() => this.setState({isTermsAndConditionsModalVisible: true})}>{`${strings.errorMessage.signUp.termsNConditions}${!this.state.isTermsConditionsAccepted ? '*' : ''}`}</Text>  
      </View>
      <View style={styles.tncView}>
        <Checkbox 
          label={`${this.state.ageRestrictionMessage}${!this.state.ageRestrictionCheck ? '*' : ''}`} 
          overrideStyles={{ marginRight: 10 , marginLeft: 10, height:50, flex:1}}
          isSelected={this.state.ageRestrictionCheck}
          checkBoxLabelStyle={{ color: this.state.ageRestrictionCheck ? COLOR_CODES.black : COLOR_CODES.vividRed}}
          getQuantity={()=>this.setState({ ageRestrictionCheck: !this.state.ageRestrictionCheck })}
        />
      </View>
    </View>
  )
}

renderDeclaration = () => {
  return(
    <View style={styles.tncView}>
      <Checkbox 
        label={strings.errorMessage.completeRegistration.acceptDeclaration} 
        overrideStyles={{ marginRight: 30 , marginLeft: 10, height: 60}}
        isSelected={this.state.isDeclarationAccepted}
        getQuantity={()=>this.setState({ isDeclarationAccepted: !this.state.isDeclarationAccepted })}
      />
    </View>
  )
}

handleDafFormating = () => {
  const formattedDaf = `<html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body>${this.state.dafTermsANDConditions}</body></html>`;
  return formattedDaf;
}

renderFooter = () => {
  return (
    <View style={styles.buttonContainer}>
      {/* {
        (!this.downlineRegistration && this.state.showVestigeFamilyMemberOptions) ? (
          <View style={styles.locationContainer}>
            <Text style={styles.storeListHeaderTextStyle}>{strings.signUpScreen.familyMemberTextDesc}</Text>
            <View style={styles.radioButtonContainer}>
              {
                isVestigeFamilyMemberOptions.map((option, i) => (
                  <RadioButton
                    radioContainerStyles={styles.overRideStyle}
                    key={i.toString()}
                    buttonText={option}
                    disabled={this.isAllFieldsDisabled()}
                    onPress={() => this.onSelectVestigeFamilyMemberOption(option)}
                    selectedValue={this.state.selectedVestigeFamilyMemberOption}
                  />
                ))
              }
            </View>
          </View>
        ) : null
      } */}
      {/* {
        (!this.props.auth?.distributorID && this.state.dafTermsANDConditions) ? (
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', position: 'absolute', left: -20, marginVertical: this.state.showVestigeFamilyMemberOptions ? 105 : 15}}>
            <Checkbox 
              label={strings.errorMessage.signUp.agreeTNCTitle} 
              overrideStyles={{ marginRight: 0 }}
              isSelected={this.state.isTermsConditionsAccepted}
              getQuantity={()=>this.setState({ isTermsConditionsAccepted: !this.state.isTermsConditionsAccepted })}
            />
            <Text style={{ paddingLeft: 3, borderBottomWidth: 0.8, paddingRight: 0, paddingTop: 1 }} onPress={() => this.setState({isTermsAndConditionsModalVisible: true})}>{strings.errorMessage.signUp.termsNConditions}</Text>  
          </View>
        ) : null
      } */}
      <Modal 
        animationType="slide" 
        visible={this.state.isTermsAndConditionsModalVisible} 
        transparent 
        onRequestClose={() => this.setState({ isTermsAndConditionsModalVisible: false })}
      >
        <View style={styles.mainContainerInfo}>
          <View style={[styles.containerInfo]}>
            <View style={{height: 45, flexDirection: 'row', justifyContent: 'center', alignItems:'center'}}>
              <Text style={styles.headingText}>{strings.errorMessage.signUp.termsNConditions}</Text>
            </View>
            {/* <ScrollView> */}
            <View style={{minHeight: 500}}>
              <WebView 
                originWhitelist={['*']}
                source={{ html: this.handleDafFormating() }}
                scrollEnabled
                javaScriptEnabled
              />
            </View>
            {/* </ScrollView> */}
            <View style={{height:60}}>
              <CustomButton
                handleClick={() => this.setState({ isTermsAndConditionsModalVisible: false })}
                disabled={this.isAllFieldsDisabled()}
                linearGradient
                buttonContainer={{marginVertical: 10, marginHorizontal: 10}}
                buttonTitle='OK'
                buttonTitleStyle={styles.customButtonTitleStyle}
                primaryColor="#58cdb4"
                secondaryColor="#58cdb4"
              />
            </View>
          </View>
        </View>
      </Modal>
      <CustomButton
        {...this.props}
        // handleClick={() => this.submitData()}
        handleClick={() => this.onSignup()}
        disabled={this.isAllFieldsDisabled()}
        buttonContainer={styles.button}
        linearGradient
        buttonTitle={strings.errorMessage.completeRegistration.proceed}
        buttonTitleStyle={styles.customButtonTitleStyle}
        primaryColor="#6895d4"
        secondaryColor="#57a5cf"
      />
    </View>
  )
}

/**
 * @description making the Signup form in the section list
 */
@autobind
signUpFormData(){
  return(
    <View style={{ flex: 1, marginTop: 10 }}>
      <SectionList
        keyboardShouldPersistTaps='handled'
        enableAutomaticScroll={false}
        extraData={this.state}
        sections={this.createSignUpForm()}
        renderSectionHeader={({section}) => (
          (section.title)?(
            <View style={styles.detailsContainer}>
              <Text style={styles.detailsContainerSection}>
                {section.title}
              </Text>
            </View>
          ): null
        )}
        renderItem={({item}) => (
          <View style={{ backgroundColor: '#FFFFFF' }}>
            {(item.type === 'termsAndConditions' && this.state.dafTermsANDConditions)
              ?
              this.renderTnCSection()
              :
              (item.type === INPUT_COMPONENT_TYPE.USER_DECLARATION)
                ?
                this.renderDeclaration()
                :
                (<SignupInput {...this.props} data={item} disableAllFields={this.isAllFieldsDisabled(item)} />)
            }
          </View>     
        )}
        keyExtractor={(item, index) => index}
        ListFooterComponent={this.renderFooter()}
        stickySectionHeadersEnabled={false}
      />
    </View> 
  )
}

@autobind
otpVerifyPress(isValid, code) {
  if(isValid) {
    this.setState({showOtpLoader:false})
    this.isOtpVerified = true;
    this.setModalVisible(false)
  }
  else {

    AlertClass.showAlert('Error!', 
      strings.errorMessage.signUp.invalidOtp, 
      [{text: strings.commonMessages.ok, onPress: () => console.log('Ok')}]
    )  
  }
}


render(){
  const { mobileNumber, mobileIsdCode } = this.state;
  const pickerDOB = new Date(new Date().setFullYear(new Date().getFullYear() - 18))
  return(
    <View style={styles.container}>
      <Loader loading={this.state.isLoading ||this.state.showOtpLoader || this.props.location.isLoading || this.props.cart.isLoading || this.props.auth.isLoading} />
      <Header
        navigation={this.props.navigation}
        screenTitle={strings.errorMessage.completeRegistration.title}
      />
      {this.signUpFormData()}
      <DatePickerComponent
        {...this.props}
        isDatePickerVisible={this.isDatePickerVisible}
        getDob={this.getDob}
        hideDatePicker={this.hideDatePicker}
        maximumDate={new Date()} 
        datePickerKey={this.selectedPickerValue}
        selectedDateOwn={this.selectedOwnDob}
        selectedDateCoDis={this.selectedCoDisDob}
      /> 
      {this.renderReviewModal()}
    </View>
  )
}
}

/**
 * @description Signup Screen CSS defined here
 */
const styles=StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f3f7',
  },
  button: {
    marginTop: '14%',
    marginBottom: '5%',
    marginHorizontal: 10
  },
  customButtonTitleStyle: {
    fontSize: 16,
    color: '#FFFFFF',
    alignSelf: 'center',
    justifyContent: 'center'
  },
  detailsContainer: {
    backgroundColor: '#FFFFFF',
    marginTop: 10,
    justifyContent: 'center',
  },
  detailsContainerSection: {
    marginLeft: 10,
    paddingTop: 19,
    marginBottom: 20,
    color: '#9da3c2',
    ...Specs.fontMedium,
    fontSize: 13,
  },
  buttonContainer: {
    flex: 1,
    marginBottom: 20
  },
  // textStyle: {
  //   color: '#373e73',
  //   ...Specs.fontBold,
  //   fontSize: 14,
  //   marginVertical: 5,
  // },
  // signInLogoContainer: {
  //   alignSelf:'center', 
  //   marginTop: 15, 
  //   marginBottom: 15
  // },
  mainContainerInfo: {
    // width: '100%',
    // height: '100%',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00000040',
  },
  containerInfo: {
    width: Dimensions.get('window').width - 30,
    // height: Dimensions.get('window').height - (isIphoneXorAbove() ? 180 : 105),
    marginTop: isIphoneXorAbove() ? 70 : 40,
    paddingHorizontal: 20,
    marginBottom: isIphoneXorAbove() ? 110 : 65,
    // marginLeft: 15,
    // marginRight: 15,
    // alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 4,
  },
  // containerInfoAndroid: {
  //   elevation: 15,
  // },
  // containerInfoIos: {
  //   shadowOffset: { width: 0, height: 0 },
  //   shadowColor: '#e1e5e6',
  //   shadowOpacity: 0.5,
  //   shadowRadius: 10,
  // },
  headingText: {
    color: '#3f5886',
    fontSize: 20,
    ...Specs.fontSemiBold, 
    textAlign:'center',
  },
  tncView:{
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'flex-start', 
    marginVertical: 12,
  },
  // termsAndConditions: {
  //   color: '#3f5886',
  //   fontSize: 18,
  //   ...Specs.fontRegular,
  // },
  // locationContainer: {
  //   marginTop: 10, 
  //   backgroundColor: '#FFFFFF', 
  //   paddingBottom: 25
  // },
  // storeListHeaderTextStyle: {
  //   ...Specs.fontMedium,
  //   color: '#9da3c2',
  //   fontSize: 10,
  //   marginHorizontal: 17,
  //   marginTop: 10,
  //   paddingBottom: 8
  // },
  // radioButtonContainer: {
  //   flexDirection: 'row',
  //   paddingBottom: 8,
  //   marginLeft: 5
  // }
})