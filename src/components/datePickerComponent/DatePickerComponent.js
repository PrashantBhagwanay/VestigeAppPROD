/**
 * @description Open Date Picker in the Vestige App
*/

import React from 'react';
import DateTimePicker from 'react-native-modal-datetime-picker';

const datePickerComponent = (params) => {
  let myDate= new Date();
  if(params.datePickerKey === 'dob' && params.selectedDateOwn){
    myDate = params.selectedDateOwn
  }
  else if(params.datePickerKey === 'coDistributorDob' && params.selectedDateCoDis){
    myDate=params.selectedDateCoDis
  }
  return (
    <DateTimePicker
      isVisible={params.isDatePickerVisible}
      onConfirm={params.getDob}
      onCancel={params.hideDatePicker}
      maximumDate={params.maximumDate}
      date={myDate}      
    />
  );
};

export default datePickerComponent;
