import React, { Component } from 'react';
import { View, 
  ScrollView, 
  StyleSheet, 
  Platform, 
  Dimensions,
  Keyboard,
  TouchableWithoutFeedback, 
  Image, 
  TouchableOpacity,
  KeyboardAvoidingView,
  Text,
} from 'react-native';
import { inject, observer } from 'mobx-react';
import { observable, makeObservable } from 'mobx';
import autobind from 'autobind-decorator';
import { VESTIGE_IMAGE, MOBILE_NUMBER_UPDATE_KEY } from 'app/src/utility/constant/Constants';
import { Specs } from 'app/src/utility/Theme';
import { strings } from 'app/src/utility/localization/Localized';
import { connectedToInternet, showToast, getMaskedMobileNumber } from 'app/src/utility/Utility';
import { Toast } from 'app/src/components/toast/Toast';
import Loader  from 'app/src/components/loader/Loader';
import OfflineNotice from 'app/src/components/OfflineNotice';
import HeaderLeftIcons from 'app/src/components/navigation/HeaderLeftIcons';
import { CustomButton} from 'app/src/components/buttons/Button';
import {isMobileNumberValid } from 'app/src/utility/Validation/Validation';
import OTPInputView from 'app/src/components/otpInputView/OTPInputView';
import { Header } from '../../components';

const OTP_VERIFICATION_DESIGN = require('app/src/assets/images/mobileNumberUpdate/otp_verification.png');
const SUCCESS_TICK = require('app/src/assets/images/mobileNumberUpdate/green_tick.png');
const FAIL_CROSS = require('app/src/assets/images/mobileNumberUpdate/red_cross.png');

const viewName = {
  otpVerification: 'otpVerification',
  successMessage: 'successMessage',
  failMessage: 'failMessage'
}

@inject('profile','auth', 'mobileNumberUpdate')
@observer
export default class MobileUpdateVerification extends Component {

  codeInputRef1 = React.createRef(); 
  codeInputRef2 = React.createRef();

  @observable isInternetConnected: Boolean = true;

  constructor(props) {
    super(props);
    makeObservable(this);
    this.props = props;
    this.state = {
      isLoading : false,
      newNumberOtp: '',
      existingNumberOtp: '',
      existingMobileNumber: this.props.route?.params?.existingMobileNumber,
      newMobileNumber: this.props.route?.params?.newMobileNumber,
      viewToShow: viewName.otpVerification,
      isExistingResendDisabled: false,
      existingResendOtpSeconds: 30,
      existingResendOtpMinutes: 0,
      isNewResendDisabled: false,
      newResendOtpSeconds: 30,
      newResendOtpMinutes: 0,
      existingOtpInputKey: 1,
      newOtpInputKey:1,
    }
  }

  async componentDidMount(){
    this.isInternetConnected = await connectedToInternet();
    this.setState({
      isExistingResendDisabled: true,
      isNewResendDisabled: true
    })
    this.setExistingOtpTimer();
    this.setNewOtpTimer();
  }

  componentWillUnmount(){
    clearInterval(this.interval1);
    clearInterval(this.interval2);
  }

  @autobind
  async networkStatus(status) {
    if(status) {
      this.isInternetConnected = status;
    }
  }

  getISDCode = (countryId = 1) => {
    if(countryId === 1){
      return '+91';
    }
  }

  isValidate = () => {
    const {existingNumberOtp, newNumberOtp} = this.state;
    if(existingNumberOtp?.length < 4 || newNumberOtp?.length < 4){
      return strings.mobileNumberUpdate.errorMessage.enterOtp;
    }
    if(!isMobileNumberValid(existingNumberOtp) || !isMobileNumberValid(newNumberOtp)){
      return strings.mobileNumberUpdate.errorMessage.invalidOtp;
    }
  }

  handleVerifyAndProceed = async () => {
    const {newMobileNumber, existingNumberOtp, newNumberOtp} = this.state;
    const errorMessage = this.isValidate();
    if(errorMessage){
      showToast(errorMessage, Toast.type.ERROR)
    }
    else{
      const res = await this.props.mobileNumberUpdate.updateMobileNumber(newMobileNumber, existingNumberOtp, newNumberOtp);
      if(res.success){
        await this.props.profile.fetchProfile();
        this.setState({viewToShow: viewName.successMessage});
      }
      else{
        this.setState({viewToShow: viewName.failMessage});
      }
    }
  }

  handleGoToHome = () => {
    this.props.navigation.pop(3);
  }

  handleOtpInput = async (type, value) => {
    if(type === MOBILE_NUMBER_UPDATE_KEY.EXISTING_NUMBER){
      this.setState({existingNumberOtp: value});
    }
    else{
      this.setState({newNumberOtp: value});
    }
  }

  setExistingOtpTimer = () => {
    this.interval1 = setInterval(() => {
      if(this.state.existingResendOtpSeconds > 0){
        this.setState(prevState => ({
          existingResendOtpSeconds: prevState.existingResendOtpSeconds - 1
        }));
      }
      if(this.state.existingResendOtpSeconds === 0){
        if(this.state.existingResendOtpMinutes === 0){
          clearInterval(this.interval1);
          this.setState({
            isExistingResendDisabled: false,
            existingResendOtpMinutes: 0,
            existingResendOtpSeconds: 30
          });
        }
        else{
          this.setState(prevState => ({
            existingResendOtpMinutes: prevState.existingResendOtpMinutes - 1,
            existingResendOtpSeconds: 30
          }));
        }
      }
    }, 1000);
  }

  setNewOtpTimer = () => {
    this.interval2 = setInterval(() => {
      if(this.state.newResendOtpSeconds > 0){
        this.setState(prevState => ({
          newResendOtpSeconds: prevState.newResendOtpSeconds - 1
        }));
      }
      if(this.state.newResendOtpSeconds === 0){
        if(this.state.newResendOtpMinutes === 0){
          clearInterval(this.interval2);
          this.setState({
            isNewResendDisabled: false,
            newResendOtpMinutes: 0,
            newResendOtpSeconds: 30
          });
        }
        else{
          this.setState(prevState => ({
            newResendOtpMinutes: prevState.newResendOtpMinutes - 1,
            newResendOtpSeconds: 30
          }));
        }
      }
    }, 1000);
  }
 
  handleResendOtp = async (numberType) => {
    if(numberType === MOBILE_NUMBER_UPDATE_KEY.EXISTING_NUMBER){
      const res = await this.props.mobileNumberUpdate.sendOtpToUpdateNumber(this.state.newMobileNumber, '1');
      if(res.success){
        showToast(strings.mobileNumberUpdate.resendOtpMessage, Toast.type.SUCCESS);
        this.setState(prevState => ({
          existingNumberOtp: '',
          isExistingResendDisabled: true,
          existingOtpInputKey: prevState.existingOtpInputKey + 1
        }));
        this.setExistingOtpTimer();
      }
      else{
        showToast(res.message, Toast.type.ERROR);
      }
    }
    else{
      const res = await this.props.mobileNumberUpdate.sendOtpToUpdateNumber(this.state.newMobileNumber, '2');
      if(res.success){
        showToast(strings.mobileNumberUpdate.resendOtpMessage, Toast.type.SUCCESS);
        this.setState(prevState => ({
          newNumberOtp: '',
          isNewResendDisabled: true,
          newOtpInputKey: prevState.newOtpInputKey + 1
        }));
        this.setNewOtpTimer();
      }
      else{
        showToast(res.message, Toast.type.ERROR);
      }
    }
  }


  renderHeadingInfo = () => {
    return(
      <View style={styles.headingView}>
        <Text style={styles.headingText}>{strings.mobileNumberUpdate.otpVerificationTitle}</Text>
        <Text style={styles.descriptionText}>
          {strings.mobileNumberUpdate.otpVerificationMobileDescription}
        </Text>
      </View>
    )
  }

  mobileUpdateDesignImage = () => {
    return(
      <View style={{flex:1, marginHorizontal:15, marginVertical:10}}>
        <Image 
          style={styles.mobileUpdateImage} 
          source={OTP_VERIFICATION_DESIGN}
          resizeMode='contain'
        />
      </View>
    )
  }

  renderProceedButton = () => {
    return(
      <View style={styles.buttonContainer}>
        <CustomButton
          buttonContainer={styles.button}
          disabled={false}
          handleClick={this.handleVerifyAndProceed}
          linearGradient
          buttonTitle={strings.mobileNumberUpdate.verifyProceedButton}
          primaryColor="#6895d4"
          secondaryColor="#6896D4"
          buttonTitleStyle={styles.customButtonTitleStyle}
        />
      </View>
    )
  }

  renderOtpInput = (mobileNumberType) => {
    if(mobileNumberType === MOBILE_NUMBER_UPDATE_KEY.EXISTING_NUMBER){
      const existingMobileNumber = this.state.existingMobileNumber || 'UNKNOWN';
      return(
        <View style={styles.otpInputContainer}>
          <View style={{marginTop:5}}>
            <Text style={[styles.descriptionText, {color: '#3f4967'}]}>
              {strings.mobileNumberUpdate.enterOtpSent}
              <Text style={[styles.descriptionText, {...Specs.fontBold, color: '#3f4967'}]}> 
                {`${this.getISDCode(1)} ${getMaskedMobileNumber(existingMobileNumber, [0,1,8,9])}`}
              </Text>
            </Text>
          </View>
          <OTPInputView
            ref={this.codeInputRef1}
            key={this.state.existingOtpInputKey}
            keyboardType='numeric'
            codeLength={4}
            autoFocus={false}
            className='border-b'
            codeInputStyle={{ fontWeight: '800', marginHorizontal:5 }}
            onFulfill={(value) => this.handleOtpInput(MOBILE_NUMBER_UPDATE_KEY.EXISTING_NUMBER,value)}
            autoFill={this.state.existingNumberOtp}
            cellHorizontalMargin={{marginHorizontal: 5}}
          />
        </View>
      )
    }
    else{
      const newMobileNumber = this.state.newMobileNumber || 'UNKNOWN';
      return(
        <View style={styles.otpInputContainer}>
          <View style={{marginTop:5}}>
            <Text style={[styles.descriptionText, {color: '#3f4967'}]}>
              {strings.mobileNumberUpdate.enterOtpSent}
              <Text style={[styles.descriptionText, {...Specs.fontBold, color: '#3f4967'}]}> 
                {`${this.getISDCode(1)} ${newMobileNumber}`}
              </Text>
            </Text>
          </View>
          <OTPInputView
            ref={this.codeInputRef2}
            key={this.state.newOtpInputKey}
            keyboardType='numeric'
            codeLength={4}
            autoFocus={false}
            className='border-b'
            codeInputStyle={{ fontWeight: '800'}}
            onFulfill={(value) => this.handleOtpInput(MOBILE_NUMBER_UPDATE_KEY.NEW_NUMBER, value)}
            autoFill={this.state.newNumberOtp}
            cellHorizontalMargin={{marginHorizontal: 5}}
          />
        </View>
      )
    }
  }

  renderResendOTP = (numberType, mobileNumber) => {
    if(numberType === MOBILE_NUMBER_UPDATE_KEY.EXISTING_NUMBER){
      const {isExistingResendDisabled, existingResendOtpSeconds, existingResendOtpMinutes} = this.state;
      return(
        <View style={styles.resendOTPContainer}>
          <Text style={[styles.descriptionText, {fontSize: 12}]}>
            {strings.mobileNumberUpdate.didNotRecieveOtp}
          </Text>
          <TouchableOpacity
            onPress={() => this.handleResendOtp(MOBILE_NUMBER_UPDATE_KEY.EXISTING_NUMBER)}
            disabled={isExistingResendDisabled}
          >
            <Text style={[styles.descriptionText, {fontSize: 12, color: isExistingResendDisabled ? '#58CDB460' : '#58CDB4', ...Specs.fontBold}]}>
              {strings.mobileNumberUpdate.resendOtp}
              {isExistingResendDisabled && `( in ${existingResendOtpMinutes}:${existingResendOtpSeconds})`}
            </Text>
          </TouchableOpacity>
        </View>
      )
    }
    else{
      const {isNewResendDisabled, newResendOtpMinutes, newResendOtpSeconds} = this.state;
      return(
        <View style={styles.resendOTPContainer}>
          <Text style={[styles.descriptionText, {fontSize: 12}]}>
            {strings.mobileNumberUpdate.didNotRecieveOtp}
          </Text>
          <TouchableOpacity
            onPress={() => this.handleResendOtp(MOBILE_NUMBER_UPDATE_KEY.NEW_NUMBER)}
            disabled={isNewResendDisabled}
          >
            <Text style={[styles.descriptionText, {fontSize: 12, color:isNewResendDisabled ? '#58CDB460' : '#58CDB4', ...Specs.fontBold}]}>
              {strings.mobileNumberUpdate.resendOtp}
              {isNewResendDisabled && `( in ${newResendOtpMinutes}:${newResendOtpSeconds})`}
            </Text>
          </TouchableOpacity>
        </View>
      )
    }
  }

  /**
   * @description This is default view of screen which include otp input and other fields
   */
  renderOtpVerificationView = () => {
    return(
      <ScrollView keyboardShouldPersistTaps='handled'>
        {this.renderHeadingInfo()}
        {this.mobileUpdateDesignImage()}
        {this.renderOtpInput(MOBILE_NUMBER_UPDATE_KEY.EXISTING_NUMBER)}
        {this.renderResendOTP(MOBILE_NUMBER_UPDATE_KEY.EXISTING_NUMBER)}
        {this.renderOtpInput(MOBILE_NUMBER_UPDATE_KEY.NEW_NUMBER)}
        {this.renderResendOTP(MOBILE_NUMBER_UPDATE_KEY.NEW_NUMBER)}
        {this.renderProceedButton()}
      </ScrollView>
    )
  }

  /**
   * @description This view will come on screen in case verification is completed 
   *              & mobile update in successfull
   */
  renderSuccessMessageView = () => {
    return(
      <View style={styles.successMessageView}>
        <Image 
          style={styles.successFailIcon} 
          source={SUCCESS_TICK}
          resizeMode='contain'
        />
        <Text style={[styles.headingText, {marginVertical:5, fontSize:24}]}>{strings.mobileNumberUpdate.successTitle}</Text>
        <Text style={[styles.descriptionText, {marginVertical:5}]}>{strings.mobileNumberUpdate.successMessage}</Text>
        <CustomButton
          buttonContainer={styles.buttonGoToHome}
          disabled={false}
          handleClick={this.handleGoToHome}
          linearGradient
          buttonTitle={strings.mobileNumberUpdate.goToHomeButton}
          primaryColor="#6896D4"
          secondaryColor="#6896D4"
          buttonTitleStyle={styles.customButtonTitleStyle}
        />
      </View>
    )
  }

  /**
   * @description This view will come on screen in case verification is failed 
   *              & mobile update in un-successfull
   */
  renderFailMessageView = () => {
    return(
      <View style={styles.successMessageView}>
        <Image 
          style={styles.successFailIcon} 
          source={FAIL_CROSS}
          resizeMode='contain'
        />
        <Text style={[styles.headingText, {marginVertical:5, fontSize:24}]}>{strings.mobileNumberUpdate.failTitle}</Text>
        <Text style={[styles.descriptionText, {marginVertical:5}]}>{strings.mobileNumberUpdate.failMessage}</Text>
        <CustomButton
          buttonContainer={styles.buttonGoToHome}
          disabled={false}
          handleClick={this.handleGoToHome}
          linearGradient
          buttonTitle={strings.mobileNumberUpdate.goToHomeButton}
          primaryColor="#6896D4"
          secondaryColor="#6896D4"
          buttonTitleStyle={styles.customButtonTitleStyle}
        />
        <Text 
          style={[styles.customButtonTitleStyle, {color:'#58CDB4'}]}
          onPress={() => this.props.navigation.pop(2)}
        >
          {strings.mobileNumberUpdate.tryAnotherWay}
        </Text>
      </View>
    )
  }

  render(){
    const {viewToShow} = this.state;
    return(
      <KeyboardAvoidingView 
        style={styles.mainContainer}
        behavior={Platform.OS==='ios' ? 'padding' : 'padding'} 
        enabled={Platform.OS === 'ios'} 
        keyboardVerticalOffset={70}
      >
        { !this.isInternetConnected && <OfflineNotice networkStatus={(status) => this.networkStatus(status)} /> }
        <Loader loading={this.state.isLoading || this.props.mobileNumberUpdate.isLoading} />
        <Header
          navigation={this.props.navigation}
          screenTitle={strings.mobileNumberUpdate.mobileNumberUpdateScreenTitle}
        />
        {viewToShow === viewName.otpVerification && this.renderOtpVerificationView()}
        {viewToShow === viewName.successMessage && this.renderSuccessMessageView()}
        {viewToShow === viewName.failMessage && this.renderFailMessageView()}
      </KeyboardAvoidingView>
    )
  }
}

const styles = StyleSheet.create({
  mainContainer :{
    flex: 1,
    backgroundColor:'#fff',
    flexDirection:'column'
  },
  headerTitle:{
    ...Specs.fontBold,
    fontSize:18,
    color: '#373e73',
    width: Dimensions.get('window').width-100
  },
  headingView:{
    flex: 1,
    marginVertical:15,
    marginHorizontal: 20,
    justifyContent: 'center'
  },
  headingText:{
    ...Specs.fontBold,
    fontSize: 18,
    color:'#3f4967',
    marginBottom: 5,
    textAlign: 'center'
  },
  descriptionText:{
    ...Specs.fontRegular,
    color:'#00000060', 
    fontSize:16,
    marginBottom: 5,
    textAlign: 'center'
  },
  mobileUpdateImage:{
    height:140,
    width: 135,
    alignSelf: 'center'
  },
  successFailIcon:{
    height:65,
    width: 65,
    alignSelf: 'center'
  },
  buttonContainer:{
    flex: 1,
    marginHorizontal:20,
    marginVertical:10,
    justifyContent: 'center'
  },
  button:{
    width:'100%',
  },
  customButtonTitleStyle:{
    ...Specs.fontBold,
    fontSize: 16,
    color: '#FFFFFF',
    alignSelf: 'center',
    justifyContent: 'center'
  },
  successMessageView:{
    flex: 1,
    alignSelf: 'center',
    justifyContent: 'center',
    marginVertical: 15,
    marginHorizontal: 20
  },
  buttonGoToHome:{
    width: 220,
    alignSelf: 'center',
    marginVertical: 10
  },
  otpInputContainer:{
    flex:1,
    height: 90,
    marginHorizontal: 20,
    marginTop: 15,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: '#fff',
    borderColor: '#C8C9D3'
  },
  resendOTPContainer:{
    flex:1,
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom:2,
    justifyContent: 'center'
  }
})