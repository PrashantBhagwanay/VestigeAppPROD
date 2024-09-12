import React from 'react';
import CustomInput from 'app/src/components/CustomInput';
import { Text, StyleSheet } from 'react-native';
import { Specs } from 'app/src/utility/Theme';
import { INPUT_COMPONENT_TYPE } from 'app/src/utility/constant/Constants';  

const signupTextInput = params => {
  if(params.inputData.type === 'textInputWithIconWithIcon') {
    return (
      <CustomInput
        key={params.inputData.key}
        placeholder={params.inputData.placeholder}
        showIcon={false}
        value={params.inputData.value}
        maxLength={params.inputData.maxLength}
        keyboardType={params.inputData.keyboardType}
        secureEntry={params.inputData.secureTextEntry}
        defaultValue={params.inputData.defaultValue}
        onChangeText={value => params.inputData.handleFunction(params.inputData.key, value)}
        showPasswordPress={(value)=>params.inputData.handlePassword(params.inputData.key, !value)}
        showPassword
        marginBottom={0}
        autoCapitalize={params.inputData.autoCapitalize}
        editable={(params.isDisabled ? false : params.inputData.isEditable)}
      />
    )
  }
  else if(params.inputData.type === 'textInputWithIcon') {
    return (
      <CustomInput
        key={params.inputData.key}
        value={params.inputData.value}
        placeholder={params.inputData.placeholder}
        icon={params.inputData.icon}
        maxLength={params.inputData.maxLength}
        defaultValue={params.inputData.defaultValue}
        keyboardType={params.inputData.keyboardType}
        showVerifyIcon={params.inputData.showVerifyIcon}
        isOtpVerified={params.inputData.isOtpVerified}
        verifyMobileNumber={() => params.inputData.verifyMobileNumber()}
        onChangeText={(value) => {params.inputData.handleFunction(params.inputData.key, value)}}
        verifyMobile={() => params.inputData.verifyMobile()}
        marginBottom={0}
        autoCapitalize={params.inputData.autoCapitalize}
        editable={(params.isDisabled ? false : params.inputData.isEditable)}
        mobileIsdCode={params.inputData.isdCodeValue}
        showInfoIcon={params.inputData.showInfoIcon}
        contextMenuHidden={params.inputData.contextMenuHidden}
        showDigitalInfo={() => params.inputData.showDigitalInfo()}
      />
    )
  }
  else if(params.inputData.type === 'validUpline') {
    return (
      <CustomInput
        type={params.inputData.key}
        placeholder={params.inputData.placeholder}
        showIcon={params.inputData.showIcon}
        value={params.inputData.value}
        defaultValue={params.inputData.defaultValue}
        maxLength={params.inputData.maxLength}
        keyboardType={params.inputData.keyboardType}
        onChangeText={value => params.inputData.handleFunction(params.inputData.key, value)}
        marginBottom={0}
        autoCapitalize={params.inputData.autoCapitalize}
        editable={(params.isDisabled ? false : params.inputData.isEditable)}
        numberOfLines={params.inputData.numberOfLines}
        multiline={params.inputData.multiline}
      />
    )
  } 
  else if(params.inputData.type === INPUT_COMPONENT_TYPE.SIGNUP_VALID_UPLINE) {
    return (
      <CustomInput
        placeholder={params.inputData.placeholder}
        showIcon={params.inputData.showIcon}
        keys={params.inputData.key}
        uplineValidateIcon={params.inputData.icon}
        value={params.inputData.value}
        defaultValue={params.inputData.defaultValue}
        maxLength={params.inputData.maxLength}
        keyboardType={params.inputData.keyboardType}
        onChangeText={value => params.inputData.handleFunction(params.inputData.key, value)}
        marginBottom={0}
        autoCapitalize={params.inputData.autoCapitalize}
        editable={(params.isDisabled ? false : params.inputData.isEditable)}
        showUplineIcon
        infoLabel={params.inputData.infoLabel}
        labelStyle={params.inputData.labelStyle}
      />
    )
  }
  else if (params.inputData.type === INPUT_COMPONENT_TYPE.SIGNUP_LABEL){
    return (
      <Text style={[params.inputData.style ? params.inputData.style : styles.signupLabel]} numberOfLines={2}>
        {params.inputData.placeholder}
      </Text>
    )
  }
  else {
    return null
  }
}

const styles=StyleSheet.create({
  signupLabel: {
    marginVertical: 10,
    textAlign: 'center',
    fontSize: 12,
    color: '#474b60',
    ...Specs.fontRegular,
  }
})


export default signupTextInput;