
import React from 'react';
import {
  View,
  Text,
  Image,
  Keyboard,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Specs } from 'app/src/utility/Theme';
import CustomPicker from '../pickerComponent/CustomPickerComponent';

const signupPickerInput = params => {
  return(
    <View style={styles.container}>
      <TouchableOpacity
        onPress={()=> {
          Keyboard.dismiss(),
          !params.disabled && params.openPicker(true)}}
        style={styles.content}
        activeOpacity={1}
      >
        <Image style={!params.iconStyle ? styles.image : params.iconStyle} source={params.inputIcon} />      
        <View style={styles.verticalLineStyle} />
        <View style={styles.pickerInputContainer}>
          <Text style={[styles.pickerInput, params.disabled? { color: '#414456', opacity: 0.5 } : { color: '#3f4967' }]}>
            {params.pickerText}
          </Text>
          <Image source={params.pickerIcon} style={styles.pickerIconStyle} />
        </View>
      </TouchableOpacity>
      <CustomPicker 
        pickerKey={params.customPickerKey}
        pickerDefaultValue={params.cutomPickerDefaultValue}
        pickerVisible={params.customPickerVisible}
        pickerContainer={styles.customPickerContainer}
        pickerTextStyle={styles.customPickerTextStyle}
        pickerData={params.customPickerData}
        setPickerValue={params.setPickerValue}
        setPickerVisible={params.setPickerVisible}
      />
      <View style={styles.horizontalLine} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 10,
    marginBottom: 10,
  },
  content: {
    flexDirection: 'row', 
    height: 50,
    alignItems: 'center',
  },
  image: {
    marginLeft: 5,
    alignSelf: 'center',
    resizeMode: 'contain',
  },
  pickerInputContainer: {
    flex:  1,
    flexDirection: 'row',
  },
  pickerInput:{
    flex:  1,
    ...Specs.fontRegular,
    fontSize: 14,
  },
  pickerIconStyle: {
    height: 6,
    width: 12,
    alignSelf: 'center',
    marginRight: 10,
  },
  verticalLineStyle: {
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
  
  customPickerContainer: {
    width: '80%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderStyle: 'solid',
    elevation: 40,
    margin: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  customPickerTextStyle: {
    fontSize: 18,
    color: '#000000',
    alignSelf: 'flex-start',
    marginTop: 20,
    marginBottom: 20,
    marginLeft: 10,
  },
})

export default signupPickerInput;