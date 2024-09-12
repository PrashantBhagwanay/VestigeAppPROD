/**
 * @description TextInput 
 */

import React from 'react';
import {
  TextInput,
  StyleSheet
} from 'react-native';

const secureText=false;

const textInputComponent = params => {
  return(
    <TextInput
      style={[styles.input, params.textInputData.uplineStyle]}
      placeholder={params.textInputData.placeholder}
      autoCorrect={false}
      defaultValue={params.textInputData.defaultValue}
      editable={params.textInputData.isEditable}
      autoCapitalize='none'
      secureTextEntry={(params.textInputData.secureTextEntry)?params.textInputData.secureTextEntry:secureText}
      placeholderTextColor='#8B92A2'
      keyboardType={params.textInputData.keyboardType}
      maxLength={params.textInputData.maxLength}
      underlineColorAndroid="transparent"
      onEndEditing={params.textInputData.onEndEditing}
      onChangeText={value => params.textInputData.handleFunction(value, params.textInputData.key)}
    />
  )
}

const styles=StyleSheet.create({
  input: {
    backgroundColor: '#FFF',
    flex: 1,
  },
})

export default textInputComponent;