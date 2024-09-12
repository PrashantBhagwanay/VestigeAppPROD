import React, { Component } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Keyboard,
  Image,
  ScrollView,
  SectionList,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { inject, observer } from 'mobx-react';
import { Header } from '../../../../components';
import { strings } from '../../../../utility/localization/Localized';
import { COLOR_CODES, Specs } from '../../../../utility/Theme';
import styles from './style';
import CustomInput from '../../../../components/CustomInput';
import { getCountryName, isNullOrEmpty } from '../../../../utility/Utility';
import DateTimePicker from 'react-native-modal-datetime-picker';
import moment from 'moment';
import { BottomSheetPicker } from '../../../../components/picker/bottomSheetPicker';
import PickerSelector from '../../../../components/picker/pickerSelector';
import Loader from '../../../../components/loader/Loader';
import { Toast } from 'app/src/components/toast/Toast';
import autobind from 'autobind-decorator';
import { isPinCodeValidate } from '../../../utility/Validation/Validation'
import { RadioButton } from 'app/src/components/buttons/Button';
import { observable } from 'mobx';
import { VESTIGE_IMAGE } from '../../../../utility/constant/Constants';
import { CustomButton } from 'app/src/components/buttons/Button';
import { keys } from 'lodash';

const CALENDER_ICON = require('../../../../assets/images/training/calenndarIcon.png');

const LIST_ITEM_TYPE = {
  DROP_DOWN: 'dropDown',
  DATE_PICKER: 'datePicker',
  TEXT_INPUT: 'textInput',
  RADIO_BUTTON: 'radioButton',
  PAYOUT_VIEW: 'payoutView',
  FUNCTION_VIEW: 'functionView',
};
const LIST_ITEM_KEY = {
  DISTRIBUTOR_ID: 'distributorId',
  DISTRIBUTOR_LEVEL: 'distributorLevel',
  DISTRIBUTOR_NAME: 'distributorName',
  PINCODE: 'pincode',
  LOCATION_DLCP: 'locationDLCP',
  CITY: 'city',
  DISTRICT: 'district',
  STATE: 'state',
  STATE_LIST: 'stateList',
  CITY_LIST: 'cityList',
  VENUE_NAME: 'venueName',
  VENUE_ADDRESS: 'venueAddress',
  ALLOWANCE_DATE: 'allowanceDate',
  ACCOMODATION_DATE: 'accomodationDate',
  ALLOWANCE_PLACE: 'allowancePlace',
  ACCOMODATION_PLACE: 'accomodationPlace',
  ALLOWANCE_AMOUNT: 'allowanceAmount',
  ACCOMODATION_AMOUNT: 'accomodationAmount',
  TIME: 'time',
  LAPTOP_NUMBER: 'laptopNumber',
  PROJECTOR_NUMBER: 'projectorNumber',
  PAYOUT_HEADER: 'payoutHeader',
  PAYOUT_DETAIL: 'payoutDetails',
};
const TRAINING_TYPE = {
  CNT: 'CNTES',
};
const options = ['Pincode', 'State/City'];

@inject('training', 'auth', 'appConfiguration', 'profile', 'location')
@observer
class ClaimantInfo extends Component {

  // @observable selectedSearchType = '';
  // @observable previousSelectedSearchType: string = '';

  @observable loading: Boolean = false

  constructor(props) {
    super(props);
    this.props = props;

    const _minDate = new Date();
    const _maxDate = new Date()
    _minDate.setMonth(_minDate.getUTCMonth() + 1)
    _maxDate.setMonth(_maxDate.getUTCMonth() + 1)
    _minDate.setDate(4)
    _maxDate.setDate(27)
    this.state = {
      pincode: '',
      location: '',
      dlcpLocationId: '',
      city: '',
      district: '',
      state: '',
      country: '',
      venueName: '',
      venueAddress: '',
      date: '',
      time: '',
      laptopNumber: '',
      laptopNumberEditable: true,
      projectorNumber: '',
      projectorNumberEditable: true,
      payoutData: [],
      isModalVisible: false,
      isStateModalVisible: false,
      isCityModalVisible: false,
      selectedPickerLabel: 'Select Location/DLCP',
      selectedStateLabel: 'Select State',
      selectedCityLabel: 'Select City',
      selectedPickerValue: '',
      selectedPickerStateValue: '',
      selectedPickerCityValue: '',
      selectedPickerItems: [],
      selectedStatePickerItems: [],
      selectedCityPickerItems: [],
      selectedPickerItem: {},
      modalSchema: {},
      districtName: '',
      currentInputKey: '',
      isAllowanceDatePickerVisible: false,
      isAccomodationDatePickerVisible: false,
      selectCityPicker: true,
      selectLocationDlcp: true,
      isVenueAddEditable: true,
      isVenueNameEditable: true,
      selectedSearchType: 'Pincode',
      selectedState: {},
      selectedCity: {},


      mobileExistError: [{ msg: '', isValid: null }],
      mobileNumberLimit: 10,
      contacts: [],
      modalVisible: false,

      allowanceFields: [[
        {
          type: LIST_ITEM_TYPE.DATE_PICKER,
          placeholder: 'Date',
          key: LIST_ITEM_KEY.ALLOWANCE_DATE,
          isEditable: true,
          minimumDate: _minDate,
          maximumDate: _maxDate,
          mode: 'date',
        },
        {
          type: LIST_ITEM_TYPE.TEXT_INPUT,
          placeholder: 'Place',
          key: LIST_ITEM_KEY.ALLOWANCE_PLACE,
          isEditable: true,
        },
        {
          type: LIST_ITEM_TYPE.TEXT_INPUT,
          placeholder: 'Amount',
          key: LIST_ITEM_KEY.ALLOWANCE_AMOUNT,
          keyboardType: 'numeric',
          isEditable: true,
        },
      ]],
      allowanceFieldsInput: [{ date: '', place: '', amount: 0, }],

      accomodationFields: [[
        {
          type: LIST_ITEM_TYPE.DATE_PICKER,
          placeholder: 'Date',
          key: LIST_ITEM_KEY.ACCOMODATION_DATE,
          isEditable: true,
          minimumDate: _minDate,
          maximumDate: _maxDate,
          mode: 'date',
        },
        {
          type: LIST_ITEM_TYPE.TEXT_INPUT,
          placeholder: 'Place',
          key: LIST_ITEM_KEY.ACCOMODATION_PLACE,
          isEditable: true,
        },
        {
          type: LIST_ITEM_TYPE.TEXT_INPUT,
          placeholder: 'Amount',
          key: LIST_ITEM_KEY.ACCOMODATION_AMOUNT,
          keyboardType: 'numeric',
          isEditable: true,
        },
      ]],
      accomodationFieldsInput: [{ date: '', place: '', amount: 0, }]

    };
  }

  async componentDidMount() {
    const { navigationParams, route } = this.props

    var trainingId = route.params.trainingId;
    // alert(trainingId);

    const responseJSON = await this.props.training.fetchGetbasicCNTExpense(trainingId);
    if (responseJSON.success) {
      // alert(JSON.stringify(responseJSON));
      console.log('ExpanseData===>' + JSON.stringify(responseJSON));
      //expanseData
      // this.showToast(responseJSON);
    } else {
      // this.showToast(responseJSON.message, Toast.type.ERROR)
    }

  }

  createFormData() {
    const { firstName, lastName, distributorID, currentPosition } = this.props.profile;
    // const {expanseData}=this.props.training.expanseData
    // alert(JSON.stringify(expanseData));
    const claimantInfo = [
      {
        type: LIST_ITEM_TYPE.TEXT_INPUT,
        placeholder: 'Claimant Full Name',
        key: LIST_ITEM_KEY.DISTRIBUTOR_NAME,
        isEditable: false,
        value: `${firstName} ${lastName}`,
      },
      // {
      //   type: LIST_ITEM_TYPE.TEXT_INPUT,
      //   placeholder: 'Branch',
      //   key: LIST_ITEM_KEY.PROJECTOR_NUMBER,
      //   isEditable: false,
      //   value: this.props.training.expanseData != undefined ? this.props.training.expanseData.member : '',
      // },
      {
        type: LIST_ITEM_TYPE.TEXT_INPUT,
        placeholder: 'Position',
        key: LIST_ITEM_KEY.DISTRIBUTOR_LEVEL,
        isEditable: false,
        value: currentPosition,
      },
      {
        type: LIST_ITEM_TYPE.TEXT_INPUT,
        placeholder: 'Distributor Id',
        key: LIST_ITEM_KEY.DISTRIBUTOR_ID,
        isEditable: false,
        value: this.props.training.expanseData != undefined ? this.props.training.expanseData.member : '',
      },
    ];

    const allowanceData = [{
      type: LIST_ITEM_TYPE.FUNCTION_VIEW,
      placeholder: 'function',
      key: 'renderAllowance',
    }]

    const accomodationData = [{
      type: LIST_ITEM_TYPE.FUNCTION_VIEW,
      placeholder: 'function',
      key: 'renderAccomodation',
    }]

    return [
      { title: 'Claim Info', data: claimantInfo, index: 0 },
      { title: '(A) ALLOWANCE', data: allowanceData, index: 1 },
      // { title: '(B) ACCOMODATION', data: accomodationData, index: 2 },
    ];
  }

  _renderListItem(item, index, section, inputIndex) {
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
              onChangeText={value => {
                this.handleTextInput(item, value, inputIndex)
              }}
              maxLength={item.maxLength}
            />
          </View>
          {/* {index === 1 && mobileExistError.length > 0 && mobileExistError[inputIndex].isValid !== null && mobileExistError[inputIndex]['isValid'] == 0 && <Text style={[{ textAlign: 'right', paddingLeft: 5, fontSize: 12, marginVertical: 5}, mobileExistError.length > 0 && mobileExistError[inputIndex]['isValid'] == 1 ? { color : COLOR_CODES.labelGreen} : { color: COLOR_CODES.vividRed}]}>{mobileExistError.length && mobileExistError[inputIndex]['msg']}</Text>} */}
          {!isNullOrEmpty(item.warningText) && (
            <Text style={styles.warningText}>{item.warningText}</Text>
          )}
          <View style={{ flexDirection: 'row', alignSelf: 'flex-end' }}>
            {/* {
                index === 2 && (
              <TouchableOpacity style={{ justifyContent: 'center', alignItem: 'center', flexDirection: 'row', width: 100, alignSelf: 'flex-end', marginTop: 10, marginRight: -15 }} onPress={() => this.props.navigation.navigate('contactList')}>
                <Image source={VESTIGE_IMAGE.CONTACTS_ICON} style={{ height: 15, width: 15 }} />
                <Text style={{ textAlign: 'center', paddingLeft: 5, fontSize: 12 }}>Import</Text>
              </TouchableOpacity>
                )
            } */}
            {inputIndex !== 0 && index === 2 && (
              <TouchableOpacity style={{ justifyContent: 'center', alignItem: 'center', flexDirection: 'row', width: 100, alignSelf: 'flex-end', marginTop: 10, marginRight: -15 }} onPress={() => this.removeFields(inputIndex, item.key)}>
                <Image source={VESTIGE_IMAGE.REMOVE_ICON} style={{ height: 15, width: 15 }} />
                <Text style={{ textAlign: 'center', paddingLeft: 5, fontSize: 12 }}>Remove</Text>
              </TouchableOpacity>
            )}
          </View>


        </>
      );
    }
    if (item.type === LIST_ITEM_TYPE.DATE_PICKER) {
      const dateFieldText =
        item.key === LIST_ITEM_KEY.ACCOMODATION_DATE
          ? this.state.accomodationFieldsInput && this.state.accomodationFieldsInput[inputIndex] && this.state.accomodationFieldsInput[inputIndex].date
            ? this.state.accomodationFieldsInput[inputIndex].date
            : 'Date'
          : this.state.allowanceFieldsInput && this.state.allowanceFieldsInput[inputIndex] && this.state.allowanceFieldsInput[inputIndex].date
            ? this.state.allowanceFieldsInput[inputIndex].date
            : 'Date';
      return (
        <>
          <TouchableOpacity
            style={styles.dateInputField}
            onPress={() => this.handlePickerVisibility(item.key)}>
            <Text style={styles.inputFieldText}>{dateFieldText}</Text>
            <Image source={CALENDER_ICON} />
            <DateTimePicker
              isVisible={
                item.key === LIST_ITEM_KEY.ALLOWANCE_DATE
                  ? this.state.isAllowanceDatePickerVisible
                  : this.state.isAccomodationDatePickerVisible
              }
              mode={'date'}
              onConfirm={date => {
                this.handleConfirm(date, item.key, inputIndex)
              }}
              onCancel={() => this.hideDatePicker(item.key)}
              minimumDate={item.minimumDate}
              maximumDate={item.maximumDate}
            />
          </TouchableOpacity>
        </>

      );
    }
    return false;
  }

  handleTextInput = async (item, value, index) => {
    const isAllowance = item.key.search('allowance') < 0 ? false : true;
    const _textInput = isAllowance ? this.state.allowanceFieldsInput : this.state.accomodationFieldsInput
    // const _mobileExistError = this.state.mobileExistError
    // const { trainingId } = this.props.route.params;
    switch (item.key) {
      case LIST_ITEM_KEY.ALLOWANCE_PLACE: _textInput[index]['place'] = value
        break;
      case LIST_ITEM_KEY.ALLOWANCE_AMOUNT: _textInput[index]['amount'] = Number(value)
        break;
      case LIST_ITEM_KEY.ACCOMODATION_PLACE: _textInput[index]['place'] = value
        break;
      case LIST_ITEM_KEY.ACCOMODATION_AMOUNT: _textInput[index]['amount'] = Number(value)
        break;
    }
    isAllowance ? this.setState({ allowanceFieldsInput: _textInput }) : this.setState({ accomodationFieldsInput: _textInput })
    // this.setState({ textInput: _textInput, mobileExistError: _mobileExistError })
  };


  handlePickerSelector = item => {
    this.setState({ currentInputKey: item?.key });
    switch (item?.key) {
      case LIST_ITEM_KEY.STATE_LIST: return this.handleStateModalVisibility(true)
      case LIST_ITEM_KEY.CITY_LIST: return this.handleCityModalVisibility(true)
      default: return this.handleModalVisibility(true);
    }
  };

  handlePickerVisibility = key => {
    switch (key) {
      case LIST_ITEM_KEY.ALLOWANCE_DATE:
        return this.setState({ isAllowanceDatePickerVisible: true });
      case LIST_ITEM_KEY.ACCOMODATION_DATE:
        return this.setState({ isAccomodationDatePickerVisible: true });
    }
  };

  hideDatePicker = key => {
    switch (key) {
      case LIST_ITEM_KEY.ALLOWANCE_DATE:
        return this.setState({ isAllowanceDatePickerVisible: false });
        break;
      case LIST_ITEM_KEY.ACCOMODATION_DATE:
        return this.setState({ isAccomodationDatePickerVisible: false });
        break;
    }
  };

  handleConfirm = async (value, key, index) => {
    const isAllowance = key.search('allowance') < 0 ? false : true;
    const _textInput = isAllowance ? this.state.allowanceFieldsInput : this.state.accomodationFieldsInput
    switch (key) {
      case LIST_ITEM_KEY.ALLOWANCE_DATE: {
        let _value = new Date(value)
        let currentDate = new Date();
        if (_value.setHours(0, 0, 0, 0) === currentDate.setHours(0, 0, 0, 0)) {
          const _minDate = new Date();
          _minDate.setMonth(_minDate.getUTCMonth() + 1)
          _minDate.setDate(4)
          _textInput[index]['date'] = moment(_minDate).format('YYYY-MM-DD')
          this.setState({ allowanceFieldsInput: _textInput, isAllowanceDatePickerVisible: false });
        } else {
          _textInput[index]['date'] = moment(value).format('YYYY-MM-DD')
          this.setState({ allowanceFieldsInput: _textInput, isAllowanceDatePickerVisible: false });
        }
      }
        break;
      case LIST_ITEM_KEY.ACCOMODATION_DATE: {
        let _value = new Date(value)
        let currentDate = new Date();
        if (_value.setHours(0, 0, 0, 0) === currentDate.setHours(0, 0, 0, 0)) {
          const _minDate = new Date();
          _minDate.setMonth(_minDate.getUTCMonth() + 1)
          _minDate.setDate(4)
          _textInput[index]['date'] = moment(_minDate).format('YYYY-MM-DD')
          this.setState({ accomodationFieldsInput: _textInput, isAccomodationDatePickerVisible: false });
        } else {
          _textInput[index]['date'] = moment(value).format('YYYY-MM-DD')
          this.setState({ accomodationFieldsInput: _textInput, isAccomodationDatePickerVisible: false });
        }
      }
    }
  };

  handleModalVisibility = value => {
    this.setState({ isModalVisible: value });
  };

  handleStateModalVisibility = value => {
    this.setState({ isStateModalVisible: value });
  };

  handleCityModalVisibility = value => {
    this.setState({ isCityModalVisible: value });
  };


  goToNext = (navigation) => {
    const { navigationParams, route } = this.props
    // alert(route.params.trainingId);
    var isError=false;

    this.state.allowanceFieldsInput.map((value)=>{
      if(value.amount!=0 && value.date==''){
        isError=true;
        return;
      }
    });
  
    this.state.accomodationFieldsInput.map((value)=>{
      if(value.amount!=0 && value.date==''){
        isError=true;
        return;
      }
    });

   if(isError){  
      this.showToast('Please enter date in allowance', Toast.type.ERROR)
      return;

    }

    if(isError){  
      this.showToast('Please enter date in accomodation', Toast.type.ERROR)
      return;

    }

    console.log('Data===>', this.state.allowanceFieldsInput, this.state.accomodationFieldsInput)
    navigation.navigate('claimAllowances', {
      'allowanceData': this.state.allowanceFieldsInput,
      'accomodationData': this.state.accomodationFieldsInput,
      'trainingId': route.params.trainingId

    });
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

  addMoreFields = () => {
    const _minDate = new Date();
    const _maxDate = new Date()
    _minDate.setMonth(_minDate.getUTCMonth() + 1)
    _maxDate.setMonth(_maxDate.getUTCMonth() + 1)
    _minDate.setDate(4)
    _maxDate.setDate(27)
    const _fields = this.state.allowanceFields;
    const _textInput = this.state.allowanceFieldsInput
    const _mobileExistError = this.state.mobileExistError;
    if (_fields.length > 4) {
      this.showToast(strings.commonMessages.upto, Toast.type.ERROR)
    } else {
      _fields.push([
        {
          type: LIST_ITEM_TYPE.DATE_PICKER,
          placeholder: 'Date',
          key: LIST_ITEM_KEY.ALLOWANCE_DATE,
          isEditable: true,
          minimumDate: _minDate,
          maximumDate: _maxDate,
          mode: 'date',
        },
        {
          type: LIST_ITEM_TYPE.TEXT_INPUT,
          placeholder: 'Place',
          key: LIST_ITEM_KEY.PLACE,
          isEditable: true,
        },
        {
          type: LIST_ITEM_TYPE.TEXT_INPUT,
          placeholder: 'Amount',
          key: LIST_ITEM_KEY.AMOUNT,
          keyboardType: 'numeric',
          isEditable: true,
        },
      ])
      _textInput.push({ date: '', place: '', amount: '', })
      _mobileExistError.push({ msg: '', isValid: null })
      this.setState({
        allowanceFields: _fields,
        allowanceFieldsInput: _textInput,
        mobileExistError: _mobileExistError
      })
    }
  }

  addMoreAccomodationFields = () => {
    const _minDate = new Date();
    const _maxDate = new Date()
    _minDate.setMonth(_minDate.getUTCMonth() + 1)
    _maxDate.setMonth(_maxDate.getUTCMonth() + 1)
    _minDate.setDate(4)
    _maxDate.setDate(27)
    const _fields = this.state.accomodationFields;
    const _textInput = this.state.accomodationFieldsInput
    const _mobileExistError = this.state.mobileExistError;
    if (_fields.length > 4) {
      this.showToast(strings.commonMessages.upto, Toast.type.ERROR)
    } else {
      _fields.push([
        {
          type: LIST_ITEM_TYPE.DATE_PICKER,
          placeholder: 'Date',
          key: LIST_ITEM_KEY.ACCOMODATION_DATE,
          isEditable: true,
          minimumDate: _minDate,
          maximumDate: _maxDate,
          mode: 'date',
        },
        {
          type: LIST_ITEM_TYPE.TEXT_INPUT,
          placeholder: 'Place',
          key: LIST_ITEM_KEY.PLACE,
          isEditable: true,
        },
        {
          type: LIST_ITEM_TYPE.TEXT_INPUT,
          placeholder: 'Amount',
          key: LIST_ITEM_KEY.AMOUNT,
          keyboardType: 'numeric',
          isEditable: true,
        },
      ])
      _textInput.push({ date: '', place: '', amount: '', })
      _mobileExistError.push({ msg: '', isValid: null })
      this.setState({
        accomodationFields: _fields,
        accomodationFieldsInput: _textInput,
        mobileExistError: _mobileExistError
      })
    }
  }

  removeFields = (index, key) => {
    const isAllowanceEnable = key.search('allowance') < 0 ? false : true;
    Keyboard.dismiss();
    const _fields = isAllowanceEnable ? this.state.allowanceFields : this.state.accomodationFields;
    const _textInput = isAllowanceEnable ? this.state.allowanceFieldsInput : this.state.allowanceFieldsInput;
    _fields.splice(index, 1)
    _textInput.splice(index, 1)
    isAllowanceEnable ?
      this.setState({
        allowanceFields: _fields,
        allowanceFieldsInput: _textInput
      }) : this.setState({
        accomodationFields: _fields,
        accomodationFieldsInput: _textInput
      })
  }

  isValidate = () => {
    if (this.state.selectedSearchType === 'Pincode') {
      if (this.state.pincode.trim().length === 0) {
        return strings.errorMessage.signUp.invalidPinCode
      }
      if (!this.state.pincode || isNaN(this.state.pincode.trim())) {
        return strings.errorMessage.location.inputType, Toast.type.ERROR
      }
      if (!this.state.dlcpLocationId || this.state.dlcpLocationId.trim().length === 0) {
        return strings.errorMessage.cnt.selectDlcpLocation;
      }
      if (!this.state.dlcpLocationId || this.state.dlcpLocationId.trim().length === 0) {
        return strings.errorMessage.cnt.selectDlcpLocation;
      }
      if (!this.state.dlcpLocationId || this.state.dlcpLocationId.trim().length === 0) {
        return strings.errorMessage.cnt.selectDlcpLocation;
      }
      if (!this.state.city || this.state.city.trim().length === 0) {
        return strings.errorMessage.cnt.city;
      }
      if (!this.state.district || this.state.district.trim().length === 0) {
        return strings.errorMessage.cnt.district;
      }
      if (!this.state.state || this.state.state.trim().length === 0) {
        return strings.errorMessage.cnt.state;
      }
    } else {
      if (!this.state.selectedState || Object.keys(this.state.selectedState).length === 0) {
        return strings.errorMessage.cnt.state;
      }
      if (!this.state.selectedCity || Object.keys(this.state.selectedCity).length === 0) {
        return strings.errorMessage.cnt.city;
      }
      if (!this.state.dlcpLocationId || this.state.dlcpLocationId.trim().length === 0) {
        return strings.errorMessage.cnt.selectDlcpLocation;
      }
      if (!this.state.dlcpLocationId || this.state.dlcpLocationId.trim().length === 0) {
        return strings.errorMessage.cnt.selectDlcpLocation;
      }
      if (!this.state.dlcpLocationId || this.state.dlcpLocationId.trim().length === 0) {
        return strings.errorMessage.cnt.selectDlcpLocation;
      }
    }


    if (!this.state.venueName || this.state.venueName.trim().length === 0) {
      return strings.errorMessage.cnt.venueName;
    }
    if (!this.state.venueAddress || this.state.venueAddress.trim().length === 0) {
      return strings.errorMessage.cnt.venueAdd;
    }
    if (!this.state.date || this.state.date.trim().length === 0) {
      return strings.errorMessage.cnt.date;
    }
    if (!this.state.time || this.state.time.trim().length === 0) {
      return strings.errorMessage.cnt.time;
    }
    if (!this.state.laptopNumber || this.state.laptopNumber.trim().length === 0) {
      return strings.errorMessage.cnt.laptopNo;
    }
    if (!this.state.projectorNumber || this.state.projectorNumber.trim().length === 0) {
      return strings.errorMessage.cnt.projectorNo;
    }
  }

  async onPressSubmit() {
    const { firstName, lastName, distributorID } = this.props.profile;
    const distributorName = `${firstName} ${lastName}`;
    let errorMessage = this.isValidate()
    if (errorMessage) {
      this.showToast(errorMessage, Toast.type.ERROR)
    }
    else if (moment(this.state.time, 'h:mma').isBefore(moment('07:00 AM', 'h:mma')) || moment(this.state.time, 'h:mma').isAfter(moment('10:00 PM', 'h:mma'))) {
      this.showToast(strings.errorMessage.cnt.trainingTime, Toast.type.ERROR)
    }
    else {
      const requestJSON = {
        id: 'submitTraningReqV84', // this will be static
        srNo: '', // for now blank, once edit functionality will be there then use this
        venue: this.state.venueName,
        eventDate: this.state.date,
        time: this.state.time,
        eventType: TRAINING_TYPE.CNT,
        address: this.state.venueAddress,
        state: this.state.state,
        district: this.state.district,
        city: this.state.city,
        locationName: this.state.location,
        pincode: this.state.pincode,
        dlcpLocationId: this.state.dlcpLocationId,
        country: getCountryName(this.props.profile.countryId),
        trainer: distributorName,
        distributorId: distributorID,
        projectorNumber: this.state.projectorNumber,
        laptopNumber: this.state.laptopNumber,
        enterBy: distributorName,
        distributorLevels: this.props.profile.currentPosition?.toUpperCase(),
        locationType: '', // this will be blank
      };
      const responseJSON = await this.props.training.submitTrainingDetails(requestJSON);
      if (responseJSON.success) {
        this.showToast(responseJSON.data[0].msg)
        this.props.navigation.pop()
      } else {
        this.showToast(responseJSON.message, Toast.type.ERROR)
      }
    }

  }

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


  createAllowanceFormData(key) {
    const _minDate = new Date();
    const _maxDate = new Date()
    _minDate.setMonth(_minDate.getUTCMonth() + 1)
    _maxDate.setMonth(_maxDate.getUTCMonth() + 1)
    _minDate.setDate(4)
    _maxDate.setDate(27)
    switch (key) {
      case 'renderAllowance': return [
        {
          type: LIST_ITEM_TYPE.DATE_PICKER,
          placeholder: 'Date',
          key: LIST_ITEM_KEY.ALLOWANCE_DATE,
          isEditable: true,
          minimumDate: _minDate,
          maximumDate: _maxDate,
          mode: 'date',
        },
        {
          type: LIST_ITEM_TYPE.TEXT_INPUT,
          placeholder: 'Place',
          key: LIST_ITEM_KEY.ALLOWANCE_PLACE,
          isEditable: true,
        },
        {
          type: LIST_ITEM_TYPE.TEXT_INPUT,
          placeholder: 'Amount',
          key: LIST_ITEM_KEY.ALLOWANCE_AMOUNT,
          keyboardType: 'numeric',
          isEditable: true,
        },
      ];
      case 'renderAccomodation': return [
        {
          type: LIST_ITEM_TYPE.DATE_PICKER,
          placeholder: 'Date',
          key: LIST_ITEM_KEY.ACCOMODATION_DATE,
          isEditable: true,
          minimumDate: _minDate,
          maximumDate: _maxDate,
          mode: 'date',
        },
        {
          type: LIST_ITEM_TYPE.TEXT_INPUT,
          placeholder: 'Place',
          key: LIST_ITEM_KEY.ACCOMODATION_PLACE,
          isEditable: true,
        },
        {
          type: LIST_ITEM_TYPE.TEXT_INPUT,
          placeholder: 'Amount',
          key: LIST_ITEM_KEY.ACCOMODATION_AMOUNT,
          keyboardType: 'numeric',
          isEditable: true,
        },
      ];
    }
  }

  renderSectionListItem(item, index, section) {
    const sectionData = this.createAllowanceFormData(item.key);
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
              onChangeText={value => this.handleTextInput(item, value)}
              maxLength={item.maxLength}
            // isEditable={}
            />
          </View>
          {!isNullOrEmpty(item.warningText) && (
            <Text style={styles.warningText}>{item.warningText}</Text>
          )}
        </>
      );
    }
    // renderAccomodation
    if (item?.type === LIST_ITEM_TYPE.FUNCTION_VIEW && item.key === 'renderAllowance') {
      console.log('AllowanceFields', this.state.allowanceFields)
      return (
        <View style={{ borderWidth: 1, borderColor: COLOR_CODES.borderGrey, marginBottom: 50 }}>
          <View style={{ margin: 10 }}>
            {
              this.state.allowanceFields.map((item, _index) =>
                <FlatList
                  data={sectionData}
                  contentContainerStyle={{ borderColor: COLOR_CODES.borderDark, backgroundColor: COLOR_CODES.white, borderWidth: 0.8, borderRadius: 8, padding: 10, marginBottom: 10 }}
                  // extraData={this.state.allowanceFields || this.state.allowanceFieldsInput}
                  keyExtractor={(item, index) => `${index}_${item?.key}`}
                  stickySectionHeadersEnabled={false}
                  renderItem={({ item, index, section }) =>
                    this._renderListItem(item, index, section, _index)
                  }
                />
              )

            }
            <TouchableOpacity style={{ justifyContent: 'center', alignItem: 'center', flexDirection: 'row', width: 100, alignSelf: 'flex-end', marginTop: 10 }} onPress={() => this.addMoreFields(this.state.allowanceFields.length)}>
              <Image source={VESTIGE_IMAGE.ADD_MORE_ICON} style={{ height: 25, width: 25 }} />
              <Text style={{ textAlign: 'center', paddingVertical: 4 }}>AddMore</Text>
            </TouchableOpacity>
            <View style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'row', alignSelf: 'flex-end' }}>
              <Text style={{ fontSize: 16, ...Specs.fontBold }}>Sub Total Allowance: </Text>
              <Text>{this._renderSubTotal(item.key)}</Text>
            </View>
          </View>

        </View>

      )
    }
    // 
    if (item?.type === LIST_ITEM_TYPE.FUNCTION_VIEW && item.key === 'renderAccomodation') {
      return (
        <View style={{ borderWidth: 1, borderColor: COLOR_CODES.borderGrey, marginBottom: 50 }}>
          <View style={{ margin: 10 }}>
            {
              this.state.accomodationFields.map((item, _index) =>
                <FlatList
                  data={sectionData}
                  contentContainerStyle={{ borderColor: COLOR_CODES.borderDark, backgroundColor: COLOR_CODES.white, borderWidth: 0.8, borderRadius: 8, padding: 10, marginBottom: 10 }}
                  // extraData={this.state.accomodationFields || this.state.accomodationFieldsInput}
                  keyExtractor={(item, index) => `${index}_${item?.key}`}
                  stickySectionHeadersEnabled={false}
                  renderItem={({ item, index, section }) =>
                    this._renderListItem(item, index, section, _index)
                  }
                />
              )

            }
            <TouchableOpacity style={{ justifyContent: 'center', alignItem: 'center', flexDirection: 'row', width: 100, alignSelf: 'flex-end', marginTop: 10 }} onPress={() => this.addMoreAccomodationFields(this.state.accomodationFields.length)}>
              <Image source={VESTIGE_IMAGE.ADD_MORE_ICON} style={{ height: 25, width: 25 }} />
              <Text style={{ textAlign: 'center', paddingVertical: 4 }}>AddMore</Text>
            </TouchableOpacity>
            <View style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'row', alignSelf: 'flex-end' }}>
              <Text style={{ fontSize: 16, ...Specs.fontBold }}>Sub Total Accomodation: </Text>
              <Text>{this._renderSubTotal(item.key)}</Text>
            </View>
          </View>

        </View>

      )
    }
    return false;
  }

  _renderSubTotal = (key) => {
    if (key == 'renderAllowance') {
      return this.state.allowanceFieldsInput.reduce(function (acc, obj) { return acc + obj.amount; }, 0);
    } else {
      return this.state.accomodationFieldsInput.reduce(function (acc, obj) { return acc + obj.amount; }, 0);
    }
  }

  render() {
    const { navigation, navigationParams } = this.props
    console.log('createFormData', this.createFormData())
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView>
          <Loader loading={this.props.training.isLoading || this.loading} />
          <Header
            navigation={this.props.navigation}
            screenTitle={'CNT FROM 1'}
          />
          <View style={styles.main}>
            <Text style={styles.mandatoryText}>* Required Fields</Text>
            {
              this.createFormData().map((item, index) => <>
                <View style={{ flexDirection: 'row' }}>
                  <Text style={styles.sectionTitle}>{item?.title}</Text>
                  {item.index >= 3 && <Text style={styles.mandatoryFields}>*</Text>}
                </View>
                {item.data.map((item, index) => this.renderSectionListItem(item, index))}
              </>)
            }


            <CustomButton
              {...this.props}
              handleClick={() => this.goToNext(navigation)}
              linearGradient
              buttonContainer={styles.button}
              buttonTitle={'Next'}
              buttonTitleStyle={styles.customButtonTitleStyle}
              primaryColor="#58cdb4"
              secondaryColor="#58cdb4"
              accessibilityHint="navigate to Guest user form"
              accessibilityLabel="Next_Page"
            />


          

          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
}

export default ClaimantInfo;
