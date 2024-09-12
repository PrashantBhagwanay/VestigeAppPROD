import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Specs } from 'app/src/utility/Theme';
import { strings } from 'app/src/utility/localization/Localized';
import { CustomButton } from 'app/src/components/buttons/Button';
import SignupPickerInput from '../../../signup/component/SignupPickerInput';
import { VESTIGE_IMAGE } from '../../../../utility/constant/Constants';
/**
 * @description It shows all top view of Filter Training
 */
export default class FilterTraining extends Component {

  constructor(props) {
    super(props);
    this.props = props;
  }
  searchClickedHandle = () => {
    const { handleSearchCallback } = this.props;
    handleSearchCallback()
  }

  openFilterTrainingPicker = (pickerData) => {
    const { openPicker, setPickerValue } = this.props;
    return(
      pickerData.map( (item) => {
        let newStyle = styles.stateCityView;
        if(item.key==='country') {
          newStyle = styles.countryView;
        }
        return(
          <SignupPickerInput
            key={item.key}
            iconTextInputContainer={[styles.iconTextInputContainer,newStyle]}
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
        )
      })
    )
  }

  render() {
    const {  
      countryList,
      stateCityList
    } = this.props;
    return(
      <View style={styles.mainView}>
        <Text style={styles.titleText}>
          {strings.myTrainingScreen.searchBy}
        </Text>
        {
          this.openFilterTrainingPicker(countryList)
        }
        {
          this.openFilterTrainingPicker(stateCityList)
        }
        
        <CustomButton
          {...this.props}
          isDisabled={false}
          handleClick={() => this.searchClickedHandle()}
          linearGradient
          buttonContainer={styles.button}
          buttonTitle="Search"
          buttonTitleStyle={styles.customButtonTitleStyle}
          primaryColor="#6895d4"
          secondaryColor="#57a5cf"
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  mainView: {
    width: '100%',
    marginBottom: 5,
    marginTop: 10,
    backgroundColor: '#ffffff',
  },
  titleText: {
    fontSize: 14,
    color: '#3f4967',
    ...Specs.fontMedium,
    marginLeft: 17,
    marginBottom: 15,
    marginTop: 10,
  },
  customButtonTitleStyle: {
    fontSize: 14,
    color: '#ffffff',
    ...Specs.fontMedium,
    alignSelf: 'center',
    justifyContent: 'center'
  },
  verticalLineStyle: {
    height: 15,
    opacity: 0.7,
    borderLeftWidth: 1,
    borderLeftColor: '#979797',
    marginRight: 10,
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
    minHeight: 40,
    marginBottom: 30,
  },
  countryView:{
    // width: '40%',
  },
  stateCityView:{
    // width: '40%',
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
    flex: 1,
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
  },

  bottomView: {
    flexDirection: 'row',
  },

});