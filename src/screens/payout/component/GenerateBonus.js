/**
 * @description generate bonus component return modal in which user selects year and month
 */

import React, { Component } from 'react';
import {
  View,
  Modal,
  Text,
  FlatList,
  StyleSheet,
} from 'react-native';
import PropTypes from 'prop-types';
import { strings } from 'app/src/utility/localization/Localized';
import { Specs } from 'app/src/utility/Theme';
import SignupPickerInput from '../../../components/signUpInputComponent/SignupPickerInput';
import { VESTIGE_IMAGE } from '../../../utility/constant/Constants';

export default class GenerateBonus extends Component<any, any> {

  static propTypes = {
    modalVisible: PropTypes.bool,
    isEnabled: PropTypes.bool,
  };
  
  static defaultProps = {
    modalVisible: false,
    isEnabled: false,
  };

  constructor(props){
    super(props);
    this.props = props;
  }

  selectYearMonth = () => {
    const { bonusData , openPicker, setPickerValue} = this.props;
    return(
      <FlatList
        data={bonusData}
        renderItem={({ item })=>(
          <SignupPickerInput
            key={item.key}
            iconTextInputContainer={styles.iconTextInputContainer}
            profileIconStyle={styles.profileIconStyle}
            inputIcon={VESTIGE_IMAGE.DOB_ICON}
            verticalLineStyle={[styles.verticalLineStyle, { marginRight: -5 }]}
            openPicker={()=>openPicker(true, item.key)}
            pickerContainer={styles.pickerContainer}
            pickerInputContainer={styles.pickerInputContainer}
            pickerInput={styles.pickerInput}
            pickerText={item.selected}
            pickerIcon={VESTIGE_IMAGE.OPEN_PICKER_BUTTON}
            pickerIconStyle={styles.pickerIconStyle}
            customPickerKey={item.key}
            cutomPickerDefaultValue={item.defaultValue}
            customPickerVisible={item.visible}
            customPickerContainer={styles.customPickerContainer}
            customPickerTextStyle={styles.customPickerTextStyle}
            customPickerData={item.data}
            setPickerValue={setPickerValue}
            setPickerVisible={()=>openPicker(!item.visible, item.key)}
          />
        )}
      />
    )
  }

  render(){
    const {
      modalVisible,
      setModalVisible,
      isEnabled,
      generateBonus
    } = this.props;
    return(
      <Modal
        animationType="none"
        transparent
        visible={modalVisible}
        onRequestClose={() => {
          console.log('Modal has been closed.');
        }}
        shadowOpacity={1}
      >
        <View style={styles.modalMainContainer}>
          <View style={styles.modalContainer}>
            <Text style={{ color: '#3f4967', fontSize: 14, alignSelf:'center', marginTop: 29, marginBottom: 30 }}>
              {strings.payout.generateBonus}
            </Text>
            <View style={{ flex: 1 , width: '100%' }}>{this.selectYearMonth()}</View>
            <View style={{ flexDirection: 'row', alignSelf: 'flex-end', position: 'absolute', bottom: 20, marginTop: 30  }}>
              <Text 
                style={{ fontSize: 14, color: '#4a90e2', ...Specs.fontBold, marginRight: 16 }}
                onPress={() => {setModalVisible(!modalVisible)}}
              >
                {strings.payout.cancel}
              </Text>
              {
                (isEnabled)?(
                  <Text onPress={()=>{generateBonus(!modalVisible)}} style={[styles.modalDoneText,{color: '#4a90e2'}]}>{strings.commonMessages.done}</Text>
                ) : (
                  <Text style={[styles.modalDoneText, {color: '#CAE3F0'}]}>{strings.commonMessages.done}</Text>
                )
              }
          
            </View>
          </View>
        </View>
      </Modal>
    )
  }
}

const styles=StyleSheet.create({
  modalMainContainer:{
    flex: 1,
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)'
  },
  modalContainer: {
    width: '90%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderStyle: 'solid',
    elevation: 40,
    margin: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    height: 275, 
    justifyContent: 'center',
    alignItems: 'center'
  },
  profileIconStyle: {
    height: 18,
    width: 18,
    marginRight: 10,
    resizeMode: 'contain',
  },
  iconTextInputContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    borderBottomColor: '#D4D6DA',
    borderBottomWidth: 1,
    marginHorizontal: 18,
    alignItems: 'center',
    height: 40,
    marginBottom: 30,
  },
  pickerInputContainer: {
    flexDirection: 'row',
  },
  pickerInput:{
    flex: 1,
    color: '#8B92A2'
  },
  pickerContainer: {
    marginHorizontal: 18,
    flex: 1
  },
  pickerIconStyle: {
    height: 6,
    width: 12,
    alignSelf: 'center',
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
    ...Specs.fontRegular
  },
  modalDoneText: {
    fontSize: 14,
    color: '#4a90e2',
    marginRight: 21,
    ...Specs.fontBold
  }
})