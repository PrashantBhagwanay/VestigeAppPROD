/**
 * @description textInput used in the AddAddress Screen
*/

import React from 'react';
import {
  View,
  Image,
  Text,
  TextInput,
} from 'react-native';

const customTextInput = params => (
  <View>
    <View style={params.textInputContainerStyle}>
      <Image style={params.textInputIconStyle} source={params.icon} />
      <View style={params.textInputVerticalLineStyle} />
      <TextInput
        style={params.input}
        placeholder={params.placeholder}
        autoCorrect={false}
        autoCapitalize="none"
        placeholderTextColor={params.placeholderTextColor}
        underlineColorAndroid="transparent"
        onChangeText={value => params.handleFunction(value)}
      />
      {
        (params.alignRightText) ? (
          <Text style={params.textInputRightTextStyle}>
            {'Choose'}
          </Text>
        ) : null
      }
    </View>
    <View style={params.textInputUnderlineStyle} />
  </View>
);

export default customTextInput;