/**
 * @description Submit Otp Screen user enter recieved otp
 */

import React, { Component } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ImageBackground,
  TextInput,
  StyleSheet,
} from 'react-native';
import { strings } from 'app/src/utility/localization/Localized';
import { CustomButton } from 'app/src/components/buttons/Button';
import { Header } from '../../components';

//images defined here used in ForgotPassword
const BACK_BUTTON=require('../../assets/images/DashBoardHeader/left_arrow_icon.png');
const SUBMIT_OTP_BACKGROUND_IMAGE=require('../../assets/images/Splash/backgroundImage.png');
const OTP=[];

export default class SubmitOtp extends Component {

  constructor(props) {
    super(props);
    this.state={
      otpInputLength: 4,
      otp: '',
    }
  }

  /**
   * @description submitOtpInput return number of input field for submitting the otp
   */
  submitOtpInput = () => {
    const { otpInputLength } = this.state;
    let submitOtpField = [];
    for (let otp = 0; otp < otpInputLength; otp++) {
      submitOtpField.push(
        <View style={styles.iconTextInputContainer}>
          <TextInput
            style={styles.input}
            onChangeText={(value)=>this.otp(value)}
            placeholder="1"
            autoCorrect={false}
            autoCapitalize="none"
            placeholderTextColor="#8B92A2"
            keyboardType="numeric"
            maxLength={1}
            underlineColorAndroid="transparent"
          />
        </View>
      )
    }
    return submitOtpField;
  }

  /**
   * @description get the otp from the input field
  */
  otp = (enteredOtp) => {
    OTP.push(enteredOtp);
    const { otp } = this.state;
    let completeOtp=otp+enteredOtp;
    this.setState({
      otp: completeOtp
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <Header
          navigation={this.props.navigation}
          screenTitle={strings.submitOtp.title}
        />
        <ImageBackground source={SUBMIT_OTP_BACKGROUND_IMAGE} resizeMode='contain' style={styles.submitOtpContainer}>
          <Text 
            style={{ fontSize: 14, color: '#3f4967', marginTop: 18, marginHorizontal: 16, marginBottom: 30 }}
          >
            {strings.submitOtp.otpReceivedMessage}
          </Text>
          <View style={{ flexDirection: 'row'}}>{this.submitOtpInput()}</View>
          <Text 
            style={{ fontSize: 12, color: '#9da3c2', marginTop: 20, marginBottom: 20, marginHorizontal: 16 }}
          >
            {strings.submitOtp.otpReceivedMessage}
          </Text>
          <CustomButton
            {...this.props}
            handleClick={() => this.forgotPassword()}
            buttonContainer={styles.button}
            linearGradient
            buttonTitle={strings.submitOtp.resendOtp}
            buttonTitleStyle={styles.customButtonTitleStyle}
            primaryColor="#6895d4"
            secondaryColor="#57a5cf"
          />
        </ImageBackground>
      </View>
    )
  }
}

/**
 * @description Submit Otp Screen CSS defined here
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFF3F7',
  },
  submitOtpContainer: {
    backgroundColor: '#FFFFFF',
    marginTop: 5,
    height: '100%',
  },
  backButtonIconImageStyle: {
    height: 18,
    width: 10,
    margin: 17,
  },
  textTitleStyle: {
    color: '#414456',
    fontSize: 18,
    fontWeight: '500',
  },
  button: {
    width: '100%',
    marginBottom: '3%',
  },
  customButtonTitleStyle: {
    fontSize: 14,
    color: '#FFFFFF',
    alignSelf: 'center',
    justifyContent: 'center'
  },
  iconTextInputContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    borderBottomColor: '#D4D6DA',
    borderBottomWidth: 1,
    marginHorizontal: 18,
    alignItems: 'center',
    height: 40,
  },
  input: {
    backgroundColor: '#FFF',
    flex: 1,
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    height: 35,
  },
})