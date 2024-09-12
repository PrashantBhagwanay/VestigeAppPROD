
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
import { strings } from 'app/src/utility/localization/Localized';

import SignupPickerInput from 'app/src/components/signUpInputComponent/SignupPickerInput';
import SignupTextInput from 'app/src/components/signUpInputComponent/SignupTextInput';

const signupInputComponent = params => {
  if(params.data.type === 'datePicker') {
    return(
      <TouchableOpacity 
        activeOpacity={0.8}
        onPress={()=>{
          (params.disableAllFields && !params.data.alwaysEnabled) ? 
            null :
            (
              Keyboard.dismiss(),
              params.data.handleFunction(params.data.key)
            )
        }}
        style={styles.container}
      >
        <View style={styles.content}>
          <Image style={styles.image} source={params.data.icon} />
          <View style={styles.verticalLineStyle} />
          <Text style={[styles.textInput, (params.data.datePickerTitle === 'Date of Birth') ? {color:'#8B92A2'}:{color: '#000000'}]}>
            {params.data.datePickerTitle}
          </Text>
          { params.data.showClearNomineeDOB && <Text onPress={()=> params.data.clearNomineeDob()} style={{ marginRight: 20 }}>Clear</Text>}
        </View>
        <View style={styles.horizontalLine} />
      </TouchableOpacity>
    )
  }
  else if (params.data.type === 'picker') {
    return (
      params.data.pickerData.map(item => {
        return (
          <SignupPickerInput
            key={item.key}
            {...params.data}
            disabled={(params.disableAllFields && !params.data.alwaysEnabled) ? true : params.data.disabled}
            inputIcon={params.data.inputIcon}
            openPicker={()=>params.data.handlePicker(true, item.key)}
            pickerText={item.selected}
            pickerIcon={params.data.pickerIcon}
            customPickerKey={item.key}
            cutomPickerDefaultValue={item.defaultValue}
            customPickerVisible={item.visible}
            customPickerData={item.data}
            setPickerValue={params.data.setPickerValue}
            setPickerVisible={()=>params.data.setPickerVisible(!item.visible, item.key)}
          />
        )
      })
    )
  }
  else {
    return <SignupTextInput inputData={params.data} isDisabled={(params.disableAllFields && !params.data.alwaysEnabled)} />
  }
}

const styles=StyleSheet.create({
  container: {
    marginHorizontal: 10,
    marginBottom: 20,
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
  textInput: {
    flex:  1,
    ...Specs.fontRegular,
    fontSize: 14,
  },
  horizontalLine: {
    height: 1,
    backgroundColor: '#c8c9d3',
  },
  verticalLineStyle: {
    height: 15,
    borderLeftWidth: 0.5,
    alignSelf: 'center',
    borderLeftColor: '#c8c9d3',
    marginHorizontal: 10,
  },
})

export default signupInputComponent;