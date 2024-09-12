
import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity
} from 'react-native';
import CustomPicker from '../../../components/pickerComponent/CustomPickerComponent';

const signupPickerInput = params => {
  return(
    <View style={params.iconTextInputContainer}>
      <Image
        style={params.profileIconStyle}
        source={params.inputIcon}
      />
      <View style={params.verticalLineStyle} />
      <TouchableOpacity
        disabled={params.disabled}
        onPress={()=> params.openPicker(true)}
        style={params.pickerContainer}
        activeOpacity={1}
      >
        <View style={params.pickerInputContainer}>
          <Text style={params.pickerInput}>
            {params.pickerText}
          </Text>
          <Image source={params.pickerIcon} style={params.pickerIconStyle} />
        </View>
      </TouchableOpacity>
      <CustomPicker 
        pickerKey={params.customPickerKey}
        pickerDefaultValue={params.cutomPickerDefaultValue}
        pickerVisible={params.customPickerVisible}
        pickerContainer={params.customPickerContainer}
        pickerTextStyle={params.customPickerTextStyle}
        pickerData={params.customPickerData}
        setPickerValue={params.setPickerValue}
        setPickerVisible={params.setPickerVisible}
      />
    </View>
  )
}

export default signupPickerInput;