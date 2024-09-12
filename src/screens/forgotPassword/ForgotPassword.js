
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableWithoutFeedback, SafeAreaView, TouchableOpacity } from 'react-native';
import { Specs } from 'app/src/utility/Theme';
import { strings } from 'app/src/utility/localization/Localized';
import call from 'react-native-phone-call';
import Icon from 'react-native-vector-icons/Ionicons';

const FOOTER_BACKGROUND_IMAGE = require('app/src/assets/images/Splash/footerBackground.png')
const VESTIGE_LOGO = require('app/src/assets/images/logo/logo.png');
const CIRCULAR_PHONE_ICON = require('app/src/assets/images/forgotPassword/circular_Phone_Icon.png');

const args = {
  number: '+918422832156', // String value with the number to call
  prompt: true // Optional boolean property. Determines if the user should be prompt prior to the call 
}

const ForgotPassword = ({navigation}) => {
  return(
    <SafeAreaView style={styles.forgotPasswordContainer}>
      <View>
        <View style={styles.backIconContainer}>
          <TouchableOpacity style={styles.tapableArea} onPress={() => {navigation.goBack()}}>
            <Icon name='ios-arrow-back' size={30} color='#3f4967'/>
          </TouchableOpacity>
        </View>
        <Image style={styles.vestigeLogo} source={VESTIGE_LOGO} />
        <Text style={styles.forgotPasswordLabel}>{strings.forgotPasswordScreen.title}</Text>
        <Text style={styles.forgotPasswordText}>{strings.forgotPasswordScreen.message}</Text>
        <TouchableWithoutFeedback onPress={() => call(args).catch(console.error)}>
          <Image 
            style={styles.circularPhoneIcon} 
            resizeMode="contain" 
            source={CIRCULAR_PHONE_ICON} 
          />
        </TouchableWithoutFeedback>
        <Text style={styles.missedCallLabel}>{strings.forgotPasswordScreen.missedCallLabelTitle}</Text>
      </View>
      <Image 
        style={styles.footerBackgroundImage} 
        resizeMode="contain" 
        source={FOOTER_BACKGROUND_IMAGE} 
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  forgotPasswordContainer: {
    flex: 1,
    backgroundColor: '#f0f3f7',
    flexDirection: 'column',
    justifyContent:'space-between'
  },
  backIconContainer: {
    flexDirection: 'row', 
    paddingHorizontal: 17, 
    paddingTop: 20,
  },
  vestigeLogo: {
    alignSelf:'center', 
    marginTop: -20, 
    marginBottom: 15
  },
  forgotPasswordLabel: {
    // TODO: Please verify the font weight according to Zeplin
    ...Specs.fontBold,
    paddingLeft: 17, 
    paddingTop: 20, 
    fontSize: 18, 
    color: '#373e73'
  },
  footerBackgroundImage: {
    alignSelf: 'center',
  },
  forgotPasswordText: {
    ...Specs.fontRegular,
    fontSize: 14,
    lineHeight: 22,
    color: '#3f4967',
    marginHorizontal: 17,
    marginTop: 42
  },
  circularPhoneIcon: {
    height: 100,
    width: 100,
    marginTop: 32,
    alignSelf: 'center',
  },
  missedCallLabel: {
    ...Specs.fontRegular,
    fontSize: 12,
    color: '#3f4967',
    marginTop: 4,
    alignSelf: 'center',  
  },
  tapableArea: {
    justifyContent: 'center', 
    height: 44, 
    paddingRight: 35,
  },
})
export default ForgotPassword;