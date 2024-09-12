/**
 * @description Custom Picker functionality same as Picker react-native package
*/

import React from 'react';
import { View, Modal, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

const customPicker = params => {
  const pickerKey=params.pickerKey;
  const pickerDefaultValue=params.defaultValue;
  const checkObjectType = params.pickerData.some(value => { return typeof value == 'object' })
  return (
    <Modal
      animationType="fade"
      transparent
      visible={params.pickerVisible}
      onRequestClose={()=> params.setPickerVisible(!params.pickerVisible)}
      shadowOpacity={0.5}
    >
      <TouchableOpacity 
        activeOpacity={1}
        onPress={() => { 
          params.setPickerVisible(!params.pickerVisible);
        }}
        style={styles.pickerContainer}
      >
        <View
          style={params.pickerContainer}
        >
          <ScrollView keyboardShouldPersistTaps='always'>
            <TouchableOpacity
              onPress={() => {
                params.setPickerValue(pickerDefaultValue, 0, pickerKey);
                params.setPickerVisible(!params.pickerVisible);
              }}
              style={[styles.horizontalLineStyle, { backgroundColor: '#DCDCDC'}]}
            >
              <Text
                style={[params.pickerTextStyle, { fontWeight: 'bold', fontSize: 20 }]}
              >
                {params.pickerDefaultValue}
              </Text>
            </TouchableOpacity>
            {
              (!checkObjectType)?(
                params.pickerData.map((data)=>{
                  return(
                    <TouchableOpacity
                      key={data}
                      activeOpacity={1}
                      onPress={()=> params.setPickerValue(data, data, pickerKey)}
                    >
                      <Text style={params.pickerTextStyle}>
                        {data}
                      </Text>
                    </TouchableOpacity>
                  )
                })
              ) : params.pickerData.map((data)=>{
                return(
                  <TouchableOpacity
                    key={data}
                    activeOpacity={1}
                    onPress={()=> params.setPickerValue(data, data, pickerKey)}
                  >
                    <Text style={params.pickerTextStyle}>
                      {data.title}
                    </Text>
                  </TouchableOpacity>
                )
              })
              
            }
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal> 
  );
};

const styles = StyleSheet.create({
  pickerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  horizontalLineStyle: {
    borderBottomWidth : 1, 
    borderColor: '#979797', 
    opacity: 0.4, 
  }
})

export default customPicker;
