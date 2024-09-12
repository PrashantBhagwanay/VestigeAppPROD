import React, { Component } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  TextInput,
  SectionList,
  Modal,
  SafeAreaView,
  ScrollView,
  Dimensions,
  Keyboard,
} from 'react-native';
import autobind from 'autobind-decorator';
import { inject, observer } from 'mobx-react';
import { Header } from '../../../components';
import { strings } from '../../../utility/localization/Localized';
import { COLOR_CODES, Specs } from '../../../utility/Theme';
import styles from './style';
import CustomInput from '../../../components/CustomInput';
import { CustomButton } from 'app/src/components/buttons/Button';
import { isNullOrEmpty, connectedToInternet } from '../../../utility/Utility';
import { isMobileNumberValid, isNameValidator, isEmailValidate } from '../../../utility/Validation/Validation';
import { Toast } from 'app/src/components/toast/Toast';
import { VESTIGE_IMAGE } from '../../../utility/constant/Constants';
import Loader  from 'app/src/components/loader/Loader';

const deviceWidth = Dimensions.get('window').width
const deviceHeight = Dimensions.get('window').height

const LIST_ITEM_TYPE = {
  TEXT_INPUT: 'textInput',
};
const LIST_ITEM_KEY = {
  DISTRIBUTOR_ID: 'distributorId',
  DISTRIBUTOR_NAME: 'name',
  PRIMARY_NO: 'primaryNo',
  SECONDARY_NO: 'secondaryNo',
  EMAIL: 'email',
};

@inject('training', 'auth', 'appConfiguration', 'profile')
@observer
class AddProspects extends Component {
  constructor(props) {
    super(props);
    this.props = props;
    this.state = {
      mobileExistError: [{ msg: '', isValid: null}],
      mobileNumberLimit: 10,
      contacts: [],
      modalVisible: false,
      prospectsFields: [[
        // {
        //   type: LIST_ITEM_TYPE.TEXT_INPUT,
        //   placeholder: 'Distributor Id',
        //   key: LIST_ITEM_KEY.DISTRIBUTOR_ID,
        //   isEditable: true,
        // },
        {
          type: LIST_ITEM_TYPE.TEXT_INPUT,
          placeholder: 'Distributor Name',
          key: LIST_ITEM_KEY.DISTRIBUTOR_NAME,
          isEditable: true,
        },
        {
          type: LIST_ITEM_TYPE.TEXT_INPUT,
          placeholder: 'Primary Mobile Number',
          key: LIST_ITEM_KEY.PRIMARY_NO,
          keyboardType: 'numeric',
          isEditable: true,
          maxLength: 10
        },
        // {
        //   type: LIST_ITEM_TYPE.TEXT_INPUT,
        //   placeholder: 'Secondary Mobile Number',
        //   key: LIST_ITEM_KEY.SECONDARY_NO,
        //   keyboardType: 'numeric',
        //   isEditable: true,
        //   maxLength: 10
        // },
        {
          type: LIST_ITEM_TYPE.TEXT_INPUT,
          placeholder: 'Email Id',
          key: LIST_ITEM_KEY.EMAIL,
          keyboardType: 'email-address',
          isEditable: true,
        },
      ]],
      prospectsFieldsInput: [{ name: '', mobile: '', email: '', }]
    };
  }

  createFormData() {
    const { firstName, lastName, distributorID } = this.props.profile;

    const personalDetails = [
      // {
      //   type: LIST_ITEM_TYPE.TEXT_INPUT,
      //   placeholder: 'Distributor Id',
      //   key: LIST_ITEM_KEY.DISTRIBUTOR_ID,
      //   isEditable: true,
      // },
      {
        type: LIST_ITEM_TYPE.TEXT_INPUT,
        placeholder: 'Distributor Name',
        key: LIST_ITEM_KEY.DISTRIBUTOR_NAME,

        isEditable: true,
      },
      {
        type: LIST_ITEM_TYPE.TEXT_INPUT,
        placeholder: 'Primary Mobile Number',
        key: LIST_ITEM_KEY.PRIMARY_NO,
        keyboardType: 'numeric',
        isEditable: true,
        maxLength: 10
      },
      // {
      //   type: LIST_ITEM_TYPE.TEXT_INPUT,
      //   placeholder: 'Secondary Mobile Number',
      //   key: LIST_ITEM_KEY.SECONDARY_NO,
      //   keyboardType: 'numeric',
      //   isEditable: true,
      //   maxLength: 10
      // },
      {
        type: LIST_ITEM_TYPE.TEXT_INPUT,
        placeholder: 'Email Id',
        key: LIST_ITEM_KEY.EMAIL,
        keyboardType: 'email-address',
        isEditable: true,
      },
    ];

    return personalDetails
  }

  @autobind
  showToast(message: string, toastType: Toast.type) {
    // Add a Toast on screen.
    Toast.show(message, {
      duration: Toast.durations.SHORT,
      type: toastType,
      shadow: false,
      animation: true,
      hideOnPress: true,
      delay: 0,
    });
  }

  handleTextInput = async (item, value, index) => {
    const _textInput = this.state.prospectsFieldsInput
    const _mobileExistError = this.state.mobileExistError
    const { trainingId } = this.props.route.params;
    switch (item.key) {
      case LIST_ITEM_KEY.DISTRIBUTOR_NAME: _textInput[index]['name'] =  value 
        break;
      case LIST_ITEM_KEY.PRIMARY_NO: {
        if (isMobileNumberValid(value.trim()) && value.length === 10) {
          const responseJSON = await this.props.training.fetchTrainingProspectsAttendedMobile(trainingId,value)
          if(responseJSON[0]['isValid'] == 1 ){
            // this.showToast(responseJSON[0]['errMsg'])
          } else {
            this.showToast(responseJSON[0]['errMsg'], Toast.type.ERROR)
          }
          _mobileExistError[index]['msg'] = responseJSON[0]['errMsg'] , 
          _mobileExistError[index]['isValid'] = responseJSON[0]['isValid'] == 1 ? true : false
        }
        if(value.length === 0) {
          _mobileExistError[index]['msg'] = ''
          _mobileExistError[index]['isValid'] = null
        }
          
        _textInput[index]['mobile'] = value
      }
        break;
      case LIST_ITEM_KEY.EMAIL: _textInput[index]['email'] = value 
        break;
    }
    this.setState({ textInput: _textInput, mobileExistError: _mobileExistError })
  };


  getStyleOverride = (index, dataLength) => {
    if (dataLength === 1) {
      return { borderRadius: 5 };
    }
    if (index === dataLength - 1) {
      return { borderBottomLeftRadius: 5, borderBottomRightRadius: 5 };
    }
    if (index === 0) {
      return { borderTopLeftRadius: 5, borderTopRightRadius: 5 };
    }
  };

  renderSectionListItem(item, index, section, inputIndex) {
    const { mobileExistError } = this.state;
    if (item.type === LIST_ITEM_TYPE.TEXT_INPUT) {
      const styleOverride = !item.isEditable
        ? { backgroundColor: COLOR_CODES.extraLightGrey }
        : {};
      return (
        <>
          <View style={[styles.textInputField, styleOverride]}>
            {/* <Text style={{ position: 'absolute', top: -10, left: 10, backgroundColor: COLOR_CODES.white}}>item?.placeholder</Text> */}
            <CustomInput
              placeholder={item?.placeholder}
              editable={item?.isEditable}
              value={item.value}
              showIcon={false}
              textStyle={{ color: COLOR_CODES.labelGrey, fontSize: 12 }}
              hideBottomLine
              keyboardType={item.keyboardType || 'default'}
              placeholderTextColor={COLOR_CODES.labelGrey}
              onChangeText={value => this.handleTextInput(item, value,inputIndex)}
              maxLength={item.maxLength}
            />
          </View>
          {index === 1 && mobileExistError.length > 0 && mobileExistError[inputIndex].isValid !== null && mobileExistError[inputIndex]['isValid'] == 0 && <Text style={[{ textAlign: 'right', paddingLeft: 5, fontSize: 12, marginVertical: 5}, mobileExistError.length > 0 && mobileExistError[inputIndex]['isValid'] == 1 ? { color : COLOR_CODES.labelGreen} : { color: COLOR_CODES.vividRed}]}>{mobileExistError.length && mobileExistError[inputIndex]['msg']}</Text>}
          {!isNullOrEmpty(item.warningText) && (
            <Text style={styles.warningText}>{item.warningText}</Text>
          )}
          <View style={{ flexDirection: 'row', alignSelf: 'flex-end'}}>
          {/* {
              index === 2 && (
            <TouchableOpacity style={{ justifyContent: 'center', alignItem: 'center', flexDirection: 'row', width: 100, alignSelf: 'flex-end', marginTop: 10, marginRight: -15 }} onPress={() => this.props.navigation.navigate('contactList')}>
              <Image source={VESTIGE_IMAGE.CONTACTS_ICON} style={{ height: 15, width: 15 }} />
              <Text style={{ textAlign: 'center', paddingLeft: 5, fontSize: 12 }}>Import</Text>
            </TouchableOpacity>
              )
          } */}
          { inputIndex !== 0 && index === 2 && (
            <TouchableOpacity style={{ justifyContent: 'center', alignItem: 'center', flexDirection: 'row', width: 100, alignSelf: 'flex-end', marginTop: 10, marginRight: -15 }} onPress={() => this.removeFields(inputIndex)}>
              <Image source={VESTIGE_IMAGE.REMOVE_ICON} style={{ height: 15, width: 15 }} />
              <Text style={{ textAlign: 'center', paddingLeft: 5, fontSize: 12 }}>Remove</Text>
            </TouchableOpacity>
          )}
          </View>
            
        
        </>
      );
    }
    return false;
  }

  isValidate = (data) => {
    if (!data.name.trim() || !isNameValidator(data.name)) {
      return strings.errorMessage.signUp.invalidName
    }
    else if (!data.mobile?.trim()) {
      return strings.errorMessage.signUp.emptyMobileNumber
    }
    else if (data.mobile.trim().length != this.state.mobileNumberLimit) {
      return `Mobile Number length must be of ${this.state.mobileNumberLimit} digits.`
    }
    else if (!(isMobileNumberValid(data.mobile.trim()))) {
      return strings.errorMessage.signUp.invalidMobileNumber
    }
    // else if(this.state.secondaryPhoneNo){
    //   if(!this.state.secondaryPhoneNo?.trim()) {
    //     return strings.errorMessage.signUp.emptyMobileNumber
    //   }
    //   else if(this.state.secondaryPhoneNo.trim().length != this.state.mobileNumberLimit) {
    //     return `Secondary Mobile Number length must be of ${this.state.mobileNumberLimit} digits.`
    //   }
    //   else if(!(isMobileNumberValid(this.state.secondaryPhoneNo.trim()))){
    //     return strings.errorMessage.signUp.invalidSecondaryMobileNumber
    //   }
    // }
    else if (data.email) {
      if (!isEmailValidate(data.email)) {
        return strings.errorMessage.signUp.invalidEmail
      }
    }

  }

  addMoreFields = () => {
    const _fields = this.state.prospectsFields;
    const _textInput = this.state.prospectsFieldsInput
    const _mobileExistError = this.state.mobileExistError;
    if(_fields.length > 4){
      this.showToast(strings.commonMessages.upto,Toast.type.ERROR)
    } else {
      _fields.push([
        // {
        //   type: LIST_ITEM_TYPE.TEXT_INPUT,
        //   placeholder: 'Distributor Id',
        //   key: LIST_ITEM_KEY.DISTRIBUTOR_ID,
        //   isEditable: true,
        // },
        {
          type: LIST_ITEM_TYPE.TEXT_INPUT,
          placeholder: 'Distributor Name',
          key: LIST_ITEM_KEY.DISTRIBUTOR_NAME,
          isEditable: true,
        },
        {
          type: LIST_ITEM_TYPE.TEXT_INPUT,
          placeholder: 'Primary Mobile Number',
          key: LIST_ITEM_KEY.PRIMARY_NO,
          keyboardType: 'numeric',
          isEditable: true,
          maxLength: 10
        },
        // {
        //   type: LIST_ITEM_TYPE.TEXT_INPUT,
        //   placeholder: 'Secondary Mobile Number',
        //   key: LIST_ITEM_KEY.SECONDARY_NO,
        //   keyboardType: 'numeric',
        //   isEditable: true,
        //   maxLength: 10
        // },
        {
          type: LIST_ITEM_TYPE.TEXT_INPUT,
          placeholder: 'Email Id',
          key: LIST_ITEM_KEY.EMAIL,
          keyboardType: 'email-address',
          isEditable: true,
        },
      ])
      _textInput.push({ name: '', mobile: '', email: '', })
      _mobileExistError.push({ msg: '', isValid: null})
      this.setState({
        prospectsFields: _fields,
        prospectsFieldsInput: _textInput,
        mobileExistError: _mobileExistError
      })
    }
  }

  removeFields = (index) => {
    Keyboard.dismiss();
    const _fields = this.state.prospectsFields;
    const _textInput = this.state.prospectsFieldsInput
    _fields.splice(index,1)
    _textInput.splice(index,1)
    this.setState({
      prospectsFields: _fields,
      prospectsFieldsInput: _textInput
    })
  }

  submitRequest = async () => {
    const { trainingId } = this.props.route.params;
    const { prospectsFieldsInput, mobileExistError } = this.state;
    let _prospectsFieldsInput = prospectsFieldsInput;
    let errorMessage = ''
    let mobileExistErrorMessage = [...new Set(_prospectsFieldsInput.map(item => item.mobile))];
    console.log('mobileExistErrorMessage',mobileExistErrorMessage)
    this.state.prospectsFieldsInput.forEach((item)=>errorMessage = this.isValidate(item))

    if (errorMessage) {
      this.showToast(errorMessage, Toast.type.ERROR)
    } 
    else if(mobileExistErrorMessage.length !== prospectsFieldsInput.length){
      this.showToast(strings.commonMessages.mobileAlreadyExists, Toast.type.ERROR)
    }
    else {
      const isMobileExist = mobileExistError.every(item => item.isValid === null || item.isValid === true)
      if(isMobileExist){
        const data = {
          distributorId: this.props.auth.distributorID,
          trainingId: trainingId,
          prospects: prospectsFieldsInput
        }
        const responseJSON = await this.props.training.submitAttendedProspects(data)
        this.showToast(responseJSON[0]['Outparam'])
        this.props.navigation.pop()
      }
      else {
        this.showToast(strings.commonMessages.mobileAlreadyExists, Toast.type.ERROR)
      }
 
    }
  }

  render() {
    const sectionData = this.createFormData();
    return (
      <SafeAreaView style={styles.container}>
      <Loader loading={this.props.training.isLoading} />
        <Header
          navigation={this.props.navigation}
          screenTitle={strings.trainingRequestScreen.addProspects}
        />
        <View style={styles.main}>
          <ScrollView style={{ marginBottom: 50}}>
            {
              this.state.prospectsFields.map((item, _index) =>
                <FlatList
                  data={sectionData}
                  contentContainerStyle={{ borderColor: COLOR_CODES.borderDark, backgroundColor: COLOR_CODES.white, borderWidth: 0.8, borderRadius: 8,  padding: 10, marginBottom: 10}}
                  extraData={this.state}
                  keyExtractor={(item, index) => `${index}_${item?.key}`}
                  stickySectionHeadersEnabled={false}
                  renderItem={({ item, index, section }) =>
                    this.renderSectionListItem(item, index, section,_index)
                  }
                />
              )

            }
            <TouchableOpacity style={{ justifyContent: 'center', alignItem: 'center', flexDirection: 'row', width: 100, alignSelf: 'flex-end', marginTop: 10 }} onPress={() => this.addMoreFields()}>
              <Image source={VESTIGE_IMAGE.ADD_MORE_ICON} style={{ height: 25, width: 25 }} />
              <Text style={{ textAlign: 'center', paddingVertical: 4 }}>AddMore</Text>
            </TouchableOpacity>
            <CustomButton
              buttonContainer={styles.button}
              handleClick={async () => {
                const isConnectedToInternet = await connectedToInternet();
                if (isConnectedToInternet) {
                  this.submitRequest();
                } else {
                  this.showToast(strings.commonMessages.noInternet);
                }
              }}
              linearGradient
              buttonTitle={'Submit'}
              primaryColor="#6895d4"
              secondaryColor="#57a5cf"
              buttonTitleStyle={styles.customButtonTitleStyle}
            />
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }
}

export default AddProspects;