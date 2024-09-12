import React, { Component } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Keyboard,
  Image,
  SectionList,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { inject, observer } from 'mobx-react';
import { Header } from '../../../components';
import { strings } from '../../../utility/localization/Localized';
import { COLOR_CODES, Specs } from '../../../utility/Theme';
import styles from './style';
import CustomInput from '../../../components/CustomInput';
import { getCountryName, isNullOrEmpty } from '../../../utility/Utility';
import DateTimePicker from 'react-native-modal-datetime-picker';
import moment from 'moment';
import { BottomSheetPicker } from '../../../components/picker/bottomSheetPicker';
import PickerSelector from '../../../components/picker/pickerSelector';
import Loader from '../../../components/loader/Loader';
import { Toast } from 'app/src/components/toast/Toast';
import autobind from 'autobind-decorator';
import { isPinCodeValidate } from '../../../utility/Validation/Validation'
import { RadioButton } from 'app/src/components/buttons/Button';
import { observable } from 'mobx';

const CALENDER_ICON = require('../../../assets/images/training/calenndarIcon.png');

const LIST_ITEM_TYPE = {
  DROP_DOWN: 'dropDown',
  DATE_PICKER: 'datePicker',
  TEXT_INPUT: 'textInput',
  RADIO_BUTTON: 'radioButton',
  PAYOUT_VIEW: 'payoutView',
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
  DATE: 'date',
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
class TrainingRequestForm extends Component {

  // @observable selectedSearchType = '';
  // @observable previousSelectedSearchType: string = '';

  @observable loading: Boolean = false

  constructor(props) {
    super(props);
    this.props = props;
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
      isDatePickerVisible: false,
      isTimePickerVisible: false,
      selectCityPicker: true,
      selectLocationDlcp: true,
      isVenueAddEditable: true,
      isVenueNameEditable: true,
      selectedSearchType: 'Pincode',
      selectedState: {},
      selectedCity: {}

    };
  }

  async componentDidMount() {
    const res = await this.props.training.fetchTrainerPayoutDetails(
      this.props.auth.distributorID,
    );
    await this.props.location.stateList(this.props.profile.countryId);
    this.setState({ payoutData: res?.data });
    const responseJSON = await this.props.training.fetchCntDistributorDetails(this.props.auth.distributorID)
    if (responseJSON.success) {
      this.setState({
        laptopNumber: responseJSON?.data[0]?.LaptopNumber?.trim(),
        projectorNumber: responseJSON?.data[0]?.ProjactorNumber?.trim(),
        laptopNumberEditable: responseJSON?.data[0]?.LaptopNumber.trim() ? false : true,
        projectorNumberEditable: responseJSON?.data[0]?.ProjactorNumber.trim() ? false : true
      })
    }
  }

  createFormData() {
    const _minDate = new Date();
    const _maxDate = new Date()
    _minDate.setMonth(_minDate.getUTCMonth() + 1)
    _maxDate.setMonth(_maxDate.getUTCMonth() + 1)
    _minDate.setDate(4)
    _maxDate.setDate(27)
    const { firstName, lastName, distributorID, currentPosition } = this.props.profile;
    const eventType = [
      {
        type: LIST_ITEM_TYPE.TEXT_INPUT,
        placeholder: strings.trainingRequestScreen.eventType,
        value: TRAINING_TYPE.CNT,
        key: 'eventType',
        isEditable: false,
      },
    ];

    const personalDetails = [
      {
        type: LIST_ITEM_TYPE.TEXT_INPUT,
        placeholder: 'Distributor Id',
        key: LIST_ITEM_KEY.DISTRIBUTOR_ID,
        isEditable: false,
        value: `${distributorID}`,
      },
      {
        type: LIST_ITEM_TYPE.TEXT_INPUT,
        placeholder: 'Distributor Name',
        key: LIST_ITEM_KEY.DISTRIBUTOR_NAME,
        isEditable: false,
        value: `${firstName} ${lastName}`,
      },
      {
        type: LIST_ITEM_TYPE.TEXT_INPUT,
        placeholder: 'Distributor Level',
        key: LIST_ITEM_KEY.DISTRIBUTOR_LEVEL,
        isEditable: false,
        value: `${currentPosition?.toUpperCase()}`,
      },
    ];

    const addressRadioDetails = [{
      type: LIST_ITEM_TYPE.RADIO_BUTTON,
    }]

    const pincodeDetails = [
      {
        type: LIST_ITEM_TYPE.TEXT_INPUT,
        placeholder: 'Pincode',
        key: LIST_ITEM_KEY.PINCODE,
        isEditable: true,
        keyboardType: 'numeric',
      },
      {
        type: LIST_ITEM_TYPE.DROP_DOWN,
        placeholder: 'Location/DLCP',
        key: LIST_ITEM_KEY.LOCATION_DLCP,
        isEditable: true,
      },
      {
        type: LIST_ITEM_TYPE.TEXT_INPUT,
        placeholder: 'City',
        key: LIST_ITEM_KEY.CITY,
        isEditable: false,
        value: this.state.city,
      },
      {
        type: LIST_ITEM_TYPE.TEXT_INPUT,
        placeholder: 'District',
        key: LIST_ITEM_KEY.DISTRICT,
        isEditable: false,
        value: this.state.district
      },
      {
        type: LIST_ITEM_TYPE.TEXT_INPUT,
        placeholder: 'State',
        key: LIST_ITEM_KEY.STATE,
        isEditable: false,
        value: this.state.state
      }
    ]

    const stateCityDetails = [{
      type: LIST_ITEM_TYPE.DROP_DOWN,
      placeholder: 'State',
      key: LIST_ITEM_KEY.STATE_LIST,
      // isEditable: true,
    },
    {
      type: LIST_ITEM_TYPE.DROP_DOWN,
      placeholder: 'City',
      key: LIST_ITEM_KEY.CITY_LIST,
      // isEditable: true,
    },
    {
      type: LIST_ITEM_TYPE.DROP_DOWN,
      placeholder: 'Location/DLCP',
      key: LIST_ITEM_KEY.LOCATION_DLCP,
      // isEditable: true,
    }
    ]

    const addressOtherDetails = [
      {
        type: LIST_ITEM_TYPE.TEXT_INPUT,
        placeholder: 'Venue Name',
        key: LIST_ITEM_KEY.VENUE_NAME,
        isEditable: this.state.isVenueNameEditable,
        value: this.state.venueName,
      },
      {
        type: LIST_ITEM_TYPE.TEXT_INPUT,
        placeholder: 'Venue Address',
        key: LIST_ITEM_KEY.VENUE_ADDRESS,
        isEditable: this.state.isVenueAddEditable,
        value: this.state.venueAddress,
        warningText:
          '[Eg:- PLOT NO. 1, COMMUNITY CENTRE PHASE - 1, OKHLA, New Delhi, Delhi 110020]',
      },
      {
        type: LIST_ITEM_TYPE.DATE_PICKER,
        placeholder: 'Date',
        key: LIST_ITEM_KEY.DATE,
        isEditable: true,
        minimumDate: _minDate,
        maximumDate: _maxDate,
        mode: 'date',
      },
      {
        type: LIST_ITEM_TYPE.DATE_PICKER,
        placeholder: 'Time',
        key: LIST_ITEM_KEY.TIME,
        isEditable: true,
        mode: 'time',
      },
    ]

    const addressDetails = [
      ...addressRadioDetails,
      ...this.state.selectedSearchType === 'Pincode' ? pincodeDetails : stateCityDetails,
      ...addressOtherDetails
    ];

    const otherDetails = [
      {
        type: LIST_ITEM_TYPE.TEXT_INPUT,
        placeholder: 'Laptop Number',
        key: LIST_ITEM_KEY.LAPTOP_NUMBER,
        isEditable: this.state.laptopNumberEditable,
        value: this.state.laptopNumber,
      },
      {
        type: LIST_ITEM_TYPE.TEXT_INPUT,
        placeholder: 'Projector Number',
        key: LIST_ITEM_KEY.PROJECTOR_NUMBER,
        isEditable: this.state.projectorNumberEditable,
        value: this.state.projectorNumber,
      },
    ];

    const payout = [
      {
        type: LIST_ITEM_TYPE.PAYOUT_VIEW,
        key: 'Business Month',
        value: 'Paid Amount',
      },
      {
        type: LIST_ITEM_TYPE.PAYOUT_VIEW,
        key: this.state.payoutData[0]?.BussinesMonth,
        value: this.state.payoutData[0]?.NetPay,
      },
      {
        type: LIST_ITEM_TYPE.PAYOUT_VIEW,
        key: this.state.payoutData[1]?.BussinesMonth,
        value: this.state.payoutData[1]?.NetPay,
      },
      {
        type: LIST_ITEM_TYPE.PAYOUT_VIEW,
        key: this.state.payoutData[2]?.BussinesMonth,
        value: this.state.payoutData[2]?.NetPay,
      },
    ];

    return [
      { title: 'EVENT TYPE', data: eventType, index: 0 },
      { title: 'PERSONAL DETAILS ', data: personalDetails, index: 1 },
      { title: 'LAST 3 MONTHS PAYOUT', data: payout, index: 2 },
      { title: 'ADDRESS DETAILS ', data: addressDetails, index: 3 },
      { title: 'OTHER DETAILS ', data: otherDetails, index: 4 },
    ];
  }

  handleTextInput = async (item, value) => {
    switch (item?.key) {
      case LIST_ITEM_KEY.PINCODE: {
        if (value.length === 6 && !isNaN(value)) {
          const res = await this.props.training.fetchCntDlcpList(
            this.props.profile.countryId,
            value,
          );
          this.setState({
            selectedPickerValue: '',
            selectedPickerLabel: 'Select Location/DLCP',
            selectedPickerItems: res?.data,
            selectedPickerItem: '',
            modalSchema: { label: 'LocationName', value: 'LocationId' },
            currentInputKey: LIST_ITEM_KEY.PINCODE,
            district: res && res.hasOwnProperty('data') ? res.data[0]?.DistrictName : '',
            state: res && res.hasOwnProperty('data') ? res.data[0]?.StateName : '',
            selectLocationDlcp: false,
            pincode: value
          });
        } else {
          console.log('Pincode empty')
          this.setState({
            selectLocationDlcp: true,
            selectedPickerValue: '',
            selectedPickerLabel: 'Select Location/DLCP',
            selectedPickerItems: [],
            district: '',
            state: '',
            city: '',
            venueName: '',
            venueAddress: '',
            isVenueNameEditable: true,
            isVenueAddEditable: true,
          })
        }
      }
        break;
      case LIST_ITEM_KEY.VENUE_NAME: this.setState({ venueName: value })
        break;
      case LIST_ITEM_KEY.VENUE_ADDRESS: this.setState({ venueAddress: value })
        break;
      case LIST_ITEM_KEY.LAPTOP_NUMBER: this.setState({ laptopNumber: value })
        break;
      case LIST_ITEM_KEY.PROJECTOR_NUMBER: this.setState({ projectorNumber: value })
        break;

    }
  };

  handlePickerSelector = item => {
    console.log('handleSelectorKey', item?.key === LIST_ITEM_KEY.STATE_LIST)
    this.setState({ currentInputKey: item?.key });
    switch (item?.key) {
      case LIST_ITEM_KEY.STATE_LIST: return this.handleStateModalVisibility(true)
      case LIST_ITEM_KEY.CITY_LIST: return this.handleCityModalVisibility(true)
      default: return this.handleModalVisibility(true);
    }
  };

  handlePickerVisibility = key => {
    switch (key) {
      case LIST_ITEM_KEY.DATE:
        return this.setState({ isDatePickerVisible: true });
      case LIST_ITEM_KEY.TIME:
        return this.setState({ isTimePickerVisible: true });
    }
  };

  hideDatePicker = key => {
    switch (key) {
      case LIST_ITEM_KEY.DATE:
        return this.setState({ isDatePickerVisible: false });
      case LIST_ITEM_KEY.TIME:
        return this.setState({ isTimePickerVisible: false });
    }
  };

  handleConfirm = (value, key) => {
    switch (key) {
      case LIST_ITEM_KEY.DATE: {
        let _value = new Date(value)
        let currentDate = new Date();
        if (_value.setHours(0, 0, 0, 0) === currentDate.setHours(0, 0, 0, 0)) {
          const _minDate = new Date();
          _minDate.setMonth(_minDate.getUTCMonth() + 1)
          _minDate.setDate(4)
          this.setState({ date: moment(_minDate).format('YYYY-MM-DD'), isDatePickerVisible: false });
        } else {
          this.setState({ date: moment(value).format('YYYY-MM-DD'), isDatePickerVisible: false });
        }
      }
        break;
      case LIST_ITEM_KEY.TIME:
        return this.setState({ time: moment(value).format('hh:mm A'), isTimePickerVisible: false });
    }
  };

  handlePickerItemPress = async item => {
    console.log('this.props.location.getStateName', item, this.state.currentInputKey)

    if (this.state.currentInputKey === LIST_ITEM_KEY.PINCODE) {
      this.setState({ districtName: item?.DistrictName });
    }
    if (this.state.currentInputKey === LIST_ITEM_KEY.STATE_LIST) {
      this.loading = true;
      this.handleStateModalVisibility(false);
      await this.props.location.cityList(item.stateId)
      this.loading = false;
      this.setState({ selectedState: item, selectedCityPickerItems: this.props.location.cityListData, modalCitySchema: { label: 'cityName', value: 'cityId' }, selectedStateLabel: item.stateName, selectedPickerStateValue: item.stateId, selectCityPicker: false, state : item.stateName })
    }
    if (this.state.currentInputKey === LIST_ITEM_KEY.CITY_LIST) {
      this.handleCityModalVisibility(false);
      const responseJSON = await this.props.training.fetchCntDlcpStateCityList(this.state.selectedState.stateId, item.cityId)
      this.setState({ selectedCity: item, selectedCityLabel: item.cityName, selectedPickerCityValue: item.cityCode, selectLocationDlcp: false, city: item.cityName, district: item.cityName })
      //  this.handleModalVisibility(false);
      this.setState({
        selectedPickerValue: '',
        selectedPickerLabel: 'Select Location/DLCP',
        selectedPickerItems: responseJSON?.data,
        selectedPickerItem: '',
        modalSchema: { label: 'LocationName', value: 'LocationId' },

        // district: res && res.hasOwnProperty('data') ? res.data[0]?.DistrictName : '',
        // state: res && res.hasOwnProperty('data') ?res.data[0]?.StateName : '',
        // selectLocationDlcp: false,
        // pincode: value
      })
    }
    if (this.state.currentInputKey === LIST_ITEM_KEY.LOCATION_DLCP) {
      this.handleModalVisibility(false);
      this.setState({
        selectedPickerLabel: item?.LocationName,
        selectedPickerValue: item?.LocationId,
        selectedPickerItem: item,
        location: item?.LocationName,
        dlcpLocationId: item?.LocationId,
      });
      const res = await this.props.training.fetchDlcpLocationInfo(
        item?.LocationId,
        this.state.pincode,
        item?.LocationName,
        this.props.profile.countryId,
      );
      console.log('res.data[0]?.LocationName ', res.data[0]?.LocationName)
      this.setState({
        city: res && res.hasOwnProperty('data') ? res.data[0]?.CityName : '',
        // district: res && res.hasOwnProperty('data') ? res.data[0]?.DistrictName : '',
        // state: res && res.hasOwnProperty('data') ?res.data[0]?.StateName : '',
        // country: '',
        venueName: res && res.hasOwnProperty('data') ? res.data[0]?.LocationName : '',
        venueAddress: res && res.hasOwnProperty('data') ? res.data[0]?.DLCPAddress : '',
        isVenueNameEditable: (res && res.hasOwnProperty('data') && res.data[0]?.LocationName.length === 0) ? true : false,
        isVenueAddEditable: (res && res.hasOwnProperty('data') && res.data[0]?.DLCPAddress.length === 0) ? true : false,
      });
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


  isValidate = () => {
    console.log('dlcpLocationId', this.state.dlcpLocationId, this.state.dlcpLocationId.trim().length, this.state.dlcpLocationId.trim().length === 0)
    if(this.state.selectedSearchType === 'Pincode'){
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
    console.log('this.state.time', this.state.time, this.state.time < '07:00 AM' && this.state.time <= '10:00 PM')
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


  radioButton = async (i) => {
      console.log('item radio button>>>>>>>>>', options[i])
      Keyboard.dismiss()
      this.setState({ selectedSearchType: options[i] })
      options[i] === 'State/City' && this.setState({ selectedStatePickerItems: this.props.location.stateListData, modalStateSchema: { label: 'stateName', value: 'stateId' } })
      console.log('item radio button>>>>>>>>>.......', this.state.selectedSearchType)
      if(options[i] === 'Pincode') {
        this.setState({
          selectedStatePickerItems: [],
          selectedState: {}, selectedCityPickerItems: [], selectedStateLabel: 'Select State', selectedPickerStateValue: '', selectCityPicker: true,
          selectedCity: {}, selectedCityLabel: 'Select City', selectedPickerCityValue: '',
          venueName: '',
          venueAddress: '',
          state: '',
          district: '',
          city: '',
          isVenueAddEditable: true,
          isVenueNameEditable: true,
          selectLocationDlcp: true,
          selectedPickerLabel: 'Select Location/DLCP',
          selectedPickerValue: '',
          selectedPickerItem: {},
          location: '',
          dlcpLocationId: '',
        })
      } else {
        this.setState({
          pincode: '',
          state: '',
          district: '',
          city: '',
          selectedPickerItem: {},
          venueName: '',
          venueAddress: '',
          isVenueAddEditable: true,
          isVenueNameEditable: true,
          selectLocationDlcp: true,

          selectedPickerLabel: 'Select Location/DLCP',
          selectedPickerValue: '',
          selectedPickerItem: {},
          location: '',
          dlcpLocationId: '',
        })
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

  renderSectionListItem(item, index, section) {
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
    if (item.type === LIST_ITEM_TYPE.DATE_PICKER) {
      const dateFieldText =
        item.key === LIST_ITEM_KEY.DATE
          ? this.state.date
            ? this.state.date
            : 'Date'
          : this.state.time
            ? this.state.time
            : 'Time';
      return (
        <TouchableOpacity
          style={styles.dateInputField}
          onPress={() => this.handlePickerVisibility(item.key)}>
          <Text style={styles.inputFieldText}>{dateFieldText}</Text>
          <Image source={CALENDER_ICON} />
          <DateTimePicker
            isVisible={
              item.key === LIST_ITEM_KEY.DATE
                ? this.state.isDatePickerVisible
                : this.state.isTimePickerVisible
            }
            mode={item.key}
            onConfirm={date => this.handleConfirm(date, item.key)}
            onCancel={() => this.hideDatePicker(item.key)}
            minimumDate={item.minimumDate}
            maximumDate={item.maximumDate}
          />
        </TouchableOpacity>
      );
    }
    if (item?.type === LIST_ITEM_TYPE.PAYOUT_VIEW) {
      const styleOverride = this.getStyleOverride(index, section?.data?.length);
      return (
        <View style={[styles.inputView, styleOverride]}>
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}>
            <Text>{item?.key}</Text>
            <Text>{item?.value}</Text>
          </View>
        </View>
      );
    }
    if (item?.type === LIST_ITEM_TYPE.RADIO_BUTTON) {
      return (
        <View style={styles.radioButtonContainer}>
          {
            options.map((option, i) => (
              <RadioButton
                key={i.toString()}
                buttonText={option}
                onPress={() => this.radioButton(i)}
                radioContainerStyles={styles.overRideStyle}
                selectedValue={this.state.selectedSearchType}
                accessibilityLabel={option}
              />
            ))
          }
        </View>
      )
    }
    if (item?.type === LIST_ITEM_TYPE.DROP_DOWN) {
      return (
        <PickerSelector
          label={item.key === LIST_ITEM_KEY.STATE_LIST ? this.state.selectedStateLabel : item.key === LIST_ITEM_KEY.CITY_LIST ? this.state.selectedCityLabel : this.state.selectedPickerLabel}
          selectedValue={item.key === LIST_ITEM_KEY.STATE_LIST ? this.state.selectedPickerStateValue : item.key === LIST_ITEM_KEY.CITY_LIST ? this.state.selectedPickerCityValue : this.state.selectedPickerValue}
          isDisabled={item.key === LIST_ITEM_KEY.STATE_LIST ? null : item.key === LIST_ITEM_KEY.CITY_LIST ? this.state.selectCityPicker : this.state.selectLocationDlcp}
          customStyle={{
            container: {
              height: 45,
              marginHorizontal: 0,
            },
          }}
          onPickerPress={() => this.handlePickerSelector(item)}
        />
      );
    }
    return false;
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <Loader loading={this.props.training.isLoading || this.loading} />
        <Header
          navigation={this.props.navigation}
          screenTitle={strings.trainingRequestScreen.trainingRequest}
        />
        <View style={styles.main}>
          <Text style={styles.mandatoryText}>* Required Fields</Text>
          <SectionList
            sections={this.createFormData()}
            extraData={this.state || this.createFormData()}
            keyExtractor={(item, index) => `${index}_${item?.key}`}
            renderSectionHeader={({ section }) => (
              <View style={{ flexDirection: 'row' }}>
                <Text style={styles.sectionTitle}>{section?.title}</Text>
                {section.index >= 3 && <Text style={styles.mandatoryFields}>*</Text>}
              </View>

            )}
            stickySectionHeadersEnabled={false}
            renderItem={({ item, index, section }) =>
              this.renderSectionListItem(item, index, section)
            }
          />
          <TouchableOpacity
            style={[styles.button]}
            onPress={() => this.onPressSubmit()}>
            <Text style={[styles.buttonText]}>SUBMIT</Text>
          </TouchableOpacity>
          <BottomSheetPicker
            isVisible={this.state.isModalVisible}
            onModalClose={() => this.handleModalVisibility(false)}
            pickerItems={this.state.selectedPickerItems}
            heightMax={Dimensions.get('window').height / 2}
            customStyles={{
              bottomSheetItemText: {
                textAlign: 'center',
              },
            }}
            title="Select Location"
            onItemPress={this.handlePickerItemPress}
            schema={this.state.modalSchema}
            emptyMessage={`No Location Found`}
          />

          <BottomSheetPicker
            isVisible={this.state.isStateModalVisible}
            onModalClose={() => this.handleStateModalVisibility(false)}
            pickerItems={this.state.selectedStatePickerItems}
            heightMax={Dimensions.get('window').height / 2}
            customStyles={{
              bottomSheetItemText: {
                textAlign: 'center',
              },
            }}
            title="Select State"
            onItemPress={this.handlePickerItemPress}
            schema={this.state.modalStateSchema}
            emptyMessage={`No State Found`}
          />

          <BottomSheetPicker
            isVisible={this.state.isCityModalVisible}
            onModalClose={() => this.handleCityModalVisibility(false)}
            pickerItems={this.state.selectedCityPickerItems}
            heightMax={Dimensions.get('window').height / 2}
            customStyles={{
              bottomSheetItemText: {
                textAlign: 'center',
              },
            }}
            title="Select City"
            onItemPress={this.handlePickerItemPress}
            schema={this.state.modalCitySchema}
            emptyMessage={`No City Found`}
          />
        </View>
      </SafeAreaView>
    );
  }
}

export default TrainingRequestForm;
