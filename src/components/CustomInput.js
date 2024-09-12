
import React, { Component } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  Keyboard,
  Image,
  Text,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import PropTypes from 'prop-types';
import { Specs } from 'app/src/utility/Theme';
import FontAwesome from 'react-native-vector-icons/FontAwesome';


const REFERAL_CODE = require('app/src/assets/images/Signup/discount.png');

export default class CustomInput extends Component<any, any> {
  
  static propTypes = {
    marginHorizontal: PropTypes.number,
    marginBottom: PropTypes.number,
    onChangeText: PropTypes.func.isRequired,
    showPasswordPress: PropTypes.func,
    placeholder: PropTypes.string,
    autoCorrect: PropTypes.bool,
    autoCapitalize: PropTypes.string,
    keyboardType: PropTypes.string,
    icon: PropTypes.any,
    secureEntry: PropTypes.bool,
    placeholderTextColor: PropTypes.string,
    showMobileLoader: PropTypes.bool,
    showIcon: PropTypes.bool,
    showPassword: PropTypes.bool,
    editable: PropTypes.bool,
    uplineValidateIcon: PropTypes.any,
  };

  static defaultProps = {
    marginHorizontal: 10,
    marginBottom: 0,
    placeholder: 'Enter some text',
    autoCorrect: false,
    autoCapitalize: 'none',
    icon: require('../assets/images/Signup/profile.png'),
    secureEntry: false,
    placeholderTextColor: '#3f4967',
    showMobileLoader: false,
    showIcon: true,
    showPassword: false,
    editable: true,
    uplineValidateIcon: 'default'
  };

  constructor(props) {
    super(props);
    this.props = props;
  }

  showMobileLoader = (showMobileLoader) => {
    if(showMobileLoader){
      return(
        <ActivityIndicator size="small" color="#0000ff" />
      )
    }
  }

  showValidUplineIcon(uplineValidateIcon){
    switch(uplineValidateIcon){
      case true : {
        return 'check'; 
      }
      case false: {
        return 'close';
      }
      case 'default': {
        return '';
      }
    }
  }

  render() {
    const { 
      placeholder, 
      autoCorrect, 
      value, 
      onChangeText,
      icon, 
      autoCapitalize,
      keyboardType, 
      marginHorizontal,
      marginBottom,
      secureEntry,
      placeholderTextColor,
      showVerifyIcon,
      isOtpVerified,
      verifyMobileNumber,
      showMobileLoader,
      maxLength,
      showIcon,
      iconStyle,
      showUplineIcon,
      uplineValidateIcon,
      showPassword,
      showPasswordPress,
      editable,
      defaultValue,
      type,
      keys,
      numberOfLines,
      multiline,
      mobileIsdCode,
      showInfoIcon,
      showDigitalInfo,
      contextMenuHidden,
      infoLabel,
      labelStyle,
      hideBottomLine,
      textStyle,
    } = this.props;
    return(
      <View style={[styles.container, {marginHorizontal: marginHorizontal, marginBottom: marginBottom,}]}>
        <View style={[styles.content]}>
          {showIcon && <Image style={!iconStyle ? styles.image : iconStyle} source={(keys === 'referalCode') ? REFERAL_CODE : icon} />}
          {showIcon && <View style={styles.verticalLine} />}
          <Text style={{ marginTop: 5 }}>{mobileIsdCode}</Text>
          <TextInput
            editable={editable} 
            style={[styles.textInput, (type === 'seperator') ? {textAlign:'center'}: {}, textStyle]}
            placeholder={placeholder}
            defaultValue={defaultValue}
            autoCorrect={autoCorrect}
            autoCapitalize={autoCapitalize}
            keyboardType={keyboardType}
            value={value}
            maxLength={maxLength}
            numberOfLines={numberOfLines}
            multiline={multiline}
            onChangeText={(value)=>onChangeText(value)}
            secureTextEntry={secureEntry}
            placeholderTextColor={placeholderTextColor}
            accessibilityLabel={placeholder} 
            testID={placeholder}
            contextMenuHidden={contextMenuHidden}
            underlineColorAndroid='transparent'
          />
          {this.showMobileLoader(showMobileLoader)}
          {showPassword && <FontAwesome name={secureEntry ? 'eye-slash' : 'eye'} style={[styles.iconStyle, {  color: '#3f4967' }]} onPress={()=> { Keyboard.dismiss(), showPasswordPress(secureEntry)}} />}
          {showUplineIcon && <FontAwesome name={this.showValidUplineIcon(uplineValidateIcon)} style={[styles.iconStyle, !uplineValidateIcon? { color: 'red'}: { color: 'green'}]} />}
          {showVerifyIcon && (
            <Text
              onPress={() => !isOtpVerified && verifyMobileNumber()}
              style={styles.sendOtpLabelStyle}
            >
              {isOtpVerified ? 'Verified': 'Verify'}
            </Text>
          )}
          { showInfoIcon && (
            <TouchableOpacity
              activeOpacity={0.5}
              onPress={() => showDigitalInfo()}
              style={{ paddingHorizontal: 5, paddingBottom: 5 }}
            >
              <FontAwesome name='info' style={[styles.iconStyle, {  color: '#373e73'}]} />
            </TouchableOpacity>
          )}
        </View>
        {(infoLabel) ? 
          <Text multiline style={labelStyle}>{infoLabel}</Text>
          : null
        }
        {(type === 'seperator' || hideBottomLine) ? null : <View style={styles.horizontalLine} />}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    // width: '100%', 
  },
  content: {
    flexDirection: 'row', 
    // height: 50,
    minHeight: 40,
  },
  image: {
    marginLeft: 5,
    alignSelf: 'center',
    resizeMode: 'contain',
  },
  textInput: {
    flex:  1,
    ...Specs.fontRegular,
    fontSize: 14,
  },
  iconStyle: {
    fontSize: 20,
    paddingHorizontal: 20,
    paddingVertical:10,
    alignSelf: 'center',
  },
  verticalLine: {
    height: 15,
    borderLeftWidth: 0.5,
    alignSelf: 'center',
    borderLeftColor: '#c8c9d3',
    marginHorizontal: 10,
  },
  horizontalLine: {
    height: 1,
    backgroundColor: '#c8c9d3',
  },
  sendOtpLabelStyle: {
    position: 'absolute',
    right: 20,
    alignSelf: 'center',
    color: '#2b61a5'
  },
})
