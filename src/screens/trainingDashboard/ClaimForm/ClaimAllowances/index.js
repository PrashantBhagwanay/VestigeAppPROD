import react, { Component } from 'react';
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
import Loader from 'app/src/components/loader/Loader';
import CustomInput from '../../../../components/CustomInput';
import { isNullOrEmpty, priceWithCurrency } from '../../../../utility/Utility';
import { RadioButton } from 'app/src/components/buttons/Button';
import { observable } from 'mobx';
import { VESTIGE_IMAGE } from '../../../../utility/constant/Constants';
import { Toast } from 'app/src/components/toast/Toast';
import autobind from 'autobind-decorator';
import DateTimePicker from 'react-native-modal-datetime-picker';
import moment from 'moment';
import { CustomButton } from '../../../../components/buttons/Button';
import PickerSelector from '../../../../components/picker/pickerSelector';
import { BottomSheetPicker } from '../../../../components/picker/bottomSheetPicker';

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
    ALLOWANCE_DATE: 'Date',
    ACCOMODATION_DATE: 'accomodationDate',
    ALLOWANCE_PLACE: 'allowancePlace',
    ACCOMODATION_PLACE: 'accomodationDate',
    ALLOWANCE_AMOUNT: 'allowanceAmount',
    ACCOMODATION_AMOUNT: 'accomodationAmount',

    HALLRENT_DATE: 'hallRentDate',
    HALLRENT_PLACE: 'hallRentPlace',
    HALLRENT_AMOUNT: 'hallRentAmount',

    TOLL_DATE: 'tollDate',
    TOLL_TRAVELLS_TYPE: 'tolltravellstype',
    TOLL_FROMPLACE: 'tollFromPlace',
    TOLL_TOPLACE: 'tollToPlace',
    TOLL_REMARK: 'tollRemark',
    TOLL_KM: 'tollKm',
    TOLL_RATE: 'tollRate',
    TOLL_AMOUNT: 'tollAmount',

    OTHERS_DATE: 'othersDate',
    OTHERS_FUNCTION: 'othersfunction',
    OTHERS_AMOUNT: 'othersAmount',
    OTHERS_BRIFE_DESCRIPTION: 'othersBrifeDescription',

    TIME: 'time',
    DATE: 'date',
    LAPTOP_NUMBER: 'laptopNumber',
    PROJECTOR_NUMBER: 'projectorNumber',
    PAYOUT_HEADER: 'payoutHeader',
    PAYOUT_DETAIL: 'payoutDetails',
    //other filled

};
const TRAINING_TYPE = {
    CNT: 'CNTES',
};
const options = ['Pincode', 'State/City'];

@inject('training','profile')
@observer
class ClaimentAllowances extends Component {

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
            hallrentTotalAmount:0,
            tollTotalAmount:0,
            otherTotalAmount:0,
            finalSumAmount:0,
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
            isModalTravellsTypeVisible:false,
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
            //hall rent 
            isHallRentDatePickerVisible: false,
            isHallRentimePickerVisible: false,
            isTollDatePickerVisible: false,
            isTollTimePickerVisible: false,
            isOtherExpanceDatePickerVisible: false,
            isOtherExpanceTimePickerVisible: false,

            selectedSearchType: 'Pincode',
            selectedState: {},
            selectedCity: {},
            
            mobileExistError: [{ msg: '', isValid: null }],
            mobileNumberLimit: 10,
            contacts: [],
            modalVisible: false,

            hallRentFields: [[
                {
                    type: LIST_ITEM_TYPE.DATE_PICKER,
                    placeholder: 'Date',
                    key: LIST_ITEM_KEY.HALLRENT_DATE,
                    isEditable: true,
                    minimumDate: _minDate,
                    maximumDate: _maxDate,
                    mode: 'date',
                },
                {
                    type: LIST_ITEM_TYPE.TEXT_INPUT,
                    placeholder: 'Place',
                    key: LIST_ITEM_KEY.HALLRENT_PLACE,
                    isEditable: true,
                },
                {
                    type: LIST_ITEM_TYPE.TEXT_INPUT,
                    placeholder: 'Amount',
                    key: LIST_ITEM_KEY.HALLRENT_AMOUNT,
                    keyboardType: 'numeric',
                    isEditable: true,
                },
            ]],
            hallRentFieldsInput: [{ date: '', place: '', amount: ''}],

            tollsFields: [[
                {
                    type: LIST_ITEM_TYPE.DATE_PICKER,
                    placeholder: 'Date',
                    key: LIST_ITEM_KEY.TOLL_DATE,
                    isEditable: true,
                    minimumDate: _minDate,
                    maximumDate: _maxDate,
                    mode: 'date',
                },
                  {
                    type: LIST_ITEM_TYPE.DROP_DOWN,
                    placeholder: 'travells By',
                    key: LIST_ITEM_KEY.TOLL_TRAVELLS_TYPE,
                    isEditable: true,
                },

                {
                    type: LIST_ITEM_TYPE.TEXT_INPUT,
                    placeholder: 'From Place',
                    key: LIST_ITEM_KEY.TOLL_FROMPLACE,
                    isEditable: true,
                },
                {
                    type: LIST_ITEM_TYPE.TEXT_INPUT,
                    placeholder: 'To Place',
                    key: LIST_ITEM_KEY.TOLL_TOPLACE,
                    isEditable: true,
                },
                {
                    type: LIST_ITEM_TYPE.TEXT_INPUT,
                    placeholder: 'Remark',
                    key: LIST_ITEM_KEY.TOLL_REMARK,
                    isEditable: true,
                },
                {
                    type: LIST_ITEM_TYPE.TEXT_INPUT,
                    placeholder: 'KM',
                    key: LIST_ITEM_KEY.TOLL_KM,
                    keyboardType: 'numeric',
                    isEditable: false,
                },
                {
                    type: LIST_ITEM_TYPE.TEXT_INPUT,
                    placeholder: 'Rate',
                    key: LIST_ITEM_KEY.TOLL_RATE,
                    value:this.props.training.expanseData.km_rate,
                    keyboardType: 'numeric',
                    isEditable: true,
                },
                {
                    type: LIST_ITEM_TYPE.TEXT_INPUT,
                    placeholder: 'Amount (Rs.)',
                    key: LIST_ITEM_KEY.TOLL_AMOUNT,
                    keyboardType: 'numeric',
                    value:'',
                    isEditable: true,
                },
            ]],
            tollsFieldsInput: [{ date: '', fromPlace: '', toPlace: '', remark: '', travells_type:'', km: '', rate: '', amount: '' }],

            otherFields: [[
                {
                    type: LIST_ITEM_TYPE.DATE_PICKER,
                    placeholder: 'Date',
                    key: LIST_ITEM_KEY.OTHERS_DATE,
                    isEditable: true,
                    minimumDate: _minDate,
                    maximumDate: _maxDate,
                    mode: 'date',
                },
                {
                    type: LIST_ITEM_TYPE.TEXT_INPUT,
                    placeholder: 'Function',
                    key: LIST_ITEM_KEY.OTHERS_FUNCTION,
                    isEditable: true,
                },
                {
                    type: LIST_ITEM_TYPE.TEXT_INPUT,
                    placeholder: 'Brief Description',
                    key: LIST_ITEM_KEY.OTHERS_BRIFE_DESCRIPTION,
                    isEditable: true,
                },
                {
                    type: LIST_ITEM_TYPE.TEXT_INPUT,
                    placeholder: 'Amount',
                    key: LIST_ITEM_KEY.OTHERS_AMOUNT,
                    keyboardType: 'numeric',
                    isEditable: true,
                },
            ]],
            otherFieldsInput: [{ date: '', function: '', briefDesciption: '', amount: '', }]

        };
       
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


    createFormData() {
        const _minDate = new Date();
        const _maxDate = new Date()
        _minDate.setMonth(_minDate.getUTCMonth() + 1)
        _maxDate.setMonth(_maxDate.getUTCMonth() + 1)
        _minDate.setDate(4)
        _maxDate.setDate(27)

        const hallRentData = [{
            type: LIST_ITEM_TYPE.FUNCTION_VIEW,
            placeholder: 'function',
            key: 'renderHallRent',
        }]

        const renderTollFareData = [{
            type: LIST_ITEM_TYPE.FUNCTION_VIEW,
            placeholder: 'function',
            key: 'renderTollFare',
        }]

        const otherAllowsData = [{
            type: LIST_ITEM_TYPE.FUNCTION_VIEW,
            placeholder: 'function',
            key: 'otherAllows',
        }]
       
      
        if(this.props.training.expanseData.isDlcp=='1'){
            return [
                { title: '(D) Mileage Claim/ Petrol/ Toll/ Travel/ Etc.', data: renderTollFareData, index: 1 },
                { title: '(E) Other (miscellaneous)', data: otherAllowsData, index: 2 },
            ];

        }else{
            return [
                { title: '(C) HALL RENT', data: hallRentData, index: 0 },
                { title: '(D)  Mileage Claim/ Petrol/ Toll/ Travel/ Etc.', data: renderTollFareData, index: 1 },
                { title: '(E) Other (miscellaneous)', data: otherAllowsData, index: 2 },
            ];
    
        }
    }

    _renderHallRentListItem(item, index, section, inputIndex) {
        console.log('item _renderHallRentListItem', item)
        // const { mobileExistError } = this.state;
        if (item.type === LIST_ITEM_TYPE.TEXT_INPUT) {
            const styleOverride = !item.isEditable
                ? { backgroundColor: COLOR_CODES.extraLightGrey }
                : {};
            return (
                <>
                    <View style={[styles.textInputField, styleOverride, { height: 45 }]}>
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
                            onChangeText={value => this.handleTextInput(item, value, inputIndex)}
                            maxLength={item.maxLength}
                        />
                    </View>
                    {/* {index === 1 && mobileExistError.length > 0 && mobileExistError[inputIndex].isValid !== null && mobileExistError[inputIndex]['isValid'] == 0 && <Text style={[{ textAlign: 'right', paddingLeft: 5, fontSize: 12, marginVertical: 5}, mobileExistError.length > 0 && mobileExistError[inputIndex]['isValid'] == 1 ? { color : COLOR_CODES.labelGreen} : { color: COLOR_CODES.vividRed}]}>{mobileExistError.length && mobileExistError[inputIndex]['msg']}</Text>} */}
                    {!isNullOrEmpty(item.warningText) && (
                        <Text style={styles.warningText}>{item.warningText}</Text>
                    )}
                    <View style={{ flexDirection: 'row', alignSelf: 'flex-end' }}>
                
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
              ? this.state.hallRentFieldsInput 
              && this.state.hallRentFieldsInput[inputIndex] && 
              this.state.hallRentFieldsInput[inputIndex].date 
                ? this.state.hallRentFieldsInput[inputIndex].date
                : 'Date'
              : this.state.hallRentFieldsInput && 
              this.state.hallRentFieldsInput[inputIndex] && 
              this.state.hallRentFieldsInput[inputIndex].date
                ? this.state.hallRentFieldsInput[inputIndex].date
                : 'Date';
            return (
                <TouchableOpacity
                    style={styles.dateInputField}
                    onPress={() => this.handlePickerVisibility(item.key)}>
                    <Text style={styles.inputFieldText}>{dateFieldText}</Text>
                    <Image source={CALENDER_ICON} />
                    <DateTimePicker
                        isVisible={
                            item.key === LIST_ITEM_KEY.HALLRENT_DATE
                                ? this.state.isHallRentDatePickerVisible
                                : this.state.isHallRentimePickerVisible
                        }
                        mode={'date'}
                        onConfirm={date => this.handleConfirm(date, item.key,inputIndex)}
                        onCancel={() => this.hideDatePicker(item.key)}
                        minimumDate={item.minimumDate}
                        maximumDate={item.maximumDate}
                    />
                </TouchableOpacity>
            );
        }
        return false;
    }

    _renderListTollItem(item, index, section, inputIndex) {
        // alert(inputIndex);
        console.log('item _r_renderListTollItem', JSON.stringify(item))
        console.log('index', index + "")
        console.log('inputIndex', inputIndex + "")
        // alert(JSON.stringify(this.state.tollsFieldsInput[inputIndex]['amount']));
        // var amount=item.key==LIST_ITEM_KEY.TOLL_AMOUNT?this.state.tollsFieldsInput[inputIndex]['amount'];
        // alert(item.key==LIST_ITEM_KEY.TOLL_AMOUNT)
        if (item.type === LIST_ITEM_TYPE.TEXT_INPUT) {
            const styleOverride = !item.isEditable
                ? { backgroundColor: COLOR_CODES.extraLightGrey }
                : {};
            return (
                <>
                    <View style={[styles.textInputField, styleOverride, { height: 45 }]}>
                        <CustomInput
                            placeholder={item?.placeholder}
                            editable={item?.isEditable}
                            value={item.key==LIST_ITEM_KEY.TOLL_AMOUNT?this.state.tollsFieldsInput[inputIndex]['amount']+"":item.value}
                            showIcon={false}
                            textStyle={{ color: COLOR_CODES.labelGrey, fontSize: 12 }}
                            hideBottomLine
                            keyboardType={item.keyboardType || 'default'}
                            placeholderTextColor={COLOR_CODES.labelGrey}
                            onChangeText={value => this.handleTextInput(item, value, inputIndex)}
                            maxLength={item.maxLength}
                        />
                    </View>

                    {!isNullOrEmpty(item.warningText) && (
                        <Text style={styles.warningText}>{item.warningText}</Text>
                    )}
                    <View style={{ flexDirection: 'row', alignSelf: 'flex-end' }}>
                        {inputIndex !== 0 && index === 7 && (
                            <TouchableOpacity style={{ justifyContent: 'center', alignItem: 'center', flexDirection: 'row', width: 100, alignSelf: 'flex-end', marginTop: 10, marginRight: -15 }} onPress={() => this.removeFields(inputIndex, item.key)}>
                                <Image source={VESTIGE_IMAGE.REMOVE_ICON} style={{ height: 15, width: 15 }} />
                                <Text style={{ textAlign: 'center', paddingLeft: 5, fontSize: 12 }}>Remove</Text>
                            </TouchableOpacity>
                        )}
                    </View>


                </>
            );
        }
        if (item?.type === LIST_ITEM_TYPE.DROP_DOWN) {
          
            const dateFieldText =
            item.key === LIST_ITEM_KEY.TOLL_TRAVELLS_TYPE
              ? this.state.tollsFieldsInput 
              && this.state.tollsFieldsInput[inputIndex] && 
              this.state.tollsFieldsInput[inputIndex].travells_type:'';  

            return (
              <PickerSelector
                label={(dateFieldText==''|| dateFieldText==undefined)?'Select Travel by':''}
                selectedValue={dateFieldText}
                isDisabled={false}
                customStyle={{
                  container: {
                    height: 45,
                    marginHorizontal: 0,
                  },
                }}
                onPickerPress={() => this.handlePickerSelector(item, inputIndex)}
              />
            );
          }
        if (item.type === LIST_ITEM_TYPE.DATE_PICKER) {
           
            const dateFieldText =
            item.key === LIST_ITEM_KEY.TOLL_DATE
              ? this.state.tollsFieldsInput 
              && this.state.tollsFieldsInput[inputIndex] && 
              this.state.tollsFieldsInput[inputIndex].date 
                ? this.state.tollsFieldsInput[inputIndex].date
                : 'Date'
              : this.state.tollsFieldsInput && 
              this.state.tollsFieldsInput[inputIndex] && 
              this.state.tollsFieldsInput[inputIndex].date
                ? this.state.tollsFieldsInput[inputIndex].date
                : 'Date';
            return (
                <TouchableOpacity
                    style={styles.dateInputField}
                    onPress={() => this.handlePickerVisibility(item.key)}>
                    <Text style={styles.inputFieldText}>{dateFieldText}</Text>
                    <Image source={CALENDER_ICON} />
                    <DateTimePicker
                        isVisible={
                            item.key === LIST_ITEM_KEY.TOLL_DATE
                                ? this.state.isTollDatePickerVisible
                                : this.state.isTollTimePickerVisible
                        }
                        mode={'date'}
                        onConfirm={date => this.handleConfirm(date, item.key,inputIndex)}
                        onCancel={() => this.hideDatePicker(item.key)}
                        minimumDate={item.minimumDate}
                        maximumDate={item.maximumDate}
                    />
                </TouchableOpacity>
            );
        }
        return false;
    }


    _renderListItemOther(item, index, section, inputIndex) {
        // alert(inputIndex);
        console.log('item _renderListItemOther', JSON.stringify(item))
        console.log('index', index + "")
        console.log('inputIndex', inputIndex + "")

        // const { mobileExistError } = this.state;
        if (item.type === LIST_ITEM_TYPE.TEXT_INPUT) {
            const styleOverride = !item.isEditable
                ? { backgroundColor: COLOR_CODES.extraLightGrey }
                : {};
            return (
                <>
                    <View style={[styles.textInputField, styleOverride, { height: 45 }]}>
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
                            onChangeText={value => this.handleTextInput(item, value, inputIndex)}
                            maxLength={item.maxLength}
                        />
                    </View>
                    {/* {index === 1 && mobileExistError.length > 0 && mobileExistError[inputIndex].isValid !== null && mobileExistError[inputIndex]['isValid'] == 0 && <Text style={[{ textAlign: 'right', paddingLeft: 5, fontSize: 12, marginVertical: 5}, mobileExistError.length > 0 && mobileExistError[inputIndex]['isValid'] == 1 ? { color : COLOR_CODES.labelGreen} : { color: COLOR_CODES.vividRed}]}>{mobileExistError.length && mobileExistError[inputIndex]['msg']}</Text>} */}
                    {!isNullOrEmpty(item.warningText) && (
                        <Text style={styles.warningText}>{item.warningText}</Text>
                    )}
                    <View style={{ flexDirection: 'row', alignSelf: 'flex-end' }}>
                        {inputIndex !== 0 && index === 3 && (
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
            item.key === LIST_ITEM_KEY.OTHERS_DATE
              ? this.state.otherFieldsInput 
              && this.state.otherFieldsInput[inputIndex] && 
              this.state.otherFieldsInput[inputIndex].date 
                ? this.state.otherFieldsInput[inputIndex].date
                : 'Date'
              : this.state.otherFieldsInput && 
              this.state.otherFieldsInput[inputIndex] && 
              this.state.otherFieldsInput[inputIndex].date
                ? this.state.otherFieldsInput[inputIndex].date
                : 'Date';
            return (
                <TouchableOpacity
                    style={styles.dateInputField}
                    onPress={() => this.handlePickerVisibility(item.key)}>
                    <Text style={styles.inputFieldText}>{dateFieldText}</Text>
                    <Image source={CALENDER_ICON} />
                    <DateTimePicker
                        isVisible={
                            item.key === LIST_ITEM_KEY.OTHERS_DATE
                                ? this.state.isOtherExpanceDatePickerVisible
                                : this.state.isOtherExpanceTimePickerVisible
                        }
                        mode={'date'}
                        onConfirm={date => this.handleConfirm(date, item.key,inputIndex)}
                        onCancel={() => this.hideDatePicker(item.key)}
                        minimumDate={item.minimumDate}
                        maximumDate={item.maximumDate}
                    />
                </TouchableOpacity>
            );
        }
        return false;
    }

   

    createAllowanceFormData(key) {
        const _minDate = new Date();
        const _maxDate = new Date()
        _minDate.setMonth(_minDate.getUTCMonth() + 1)
        _maxDate.setMonth(_maxDate.getUTCMonth() + 1)
        _minDate.setDate(4)
        _maxDate.setDate(27)
        switch (key) {
            case 'renderHallRent':
            return [
                {
                    type: LIST_ITEM_TYPE.DATE_PICKER,
                    placeholder: 'Date',
                    key: LIST_ITEM_KEY.HALLRENT_DATE,
                    isEditable: true,
                    minimumDate: _minDate,
                    maximumDate: _maxDate,
                    mode: 'date',
                },
                {
                    type: LIST_ITEM_TYPE.TEXT_INPUT,
                    placeholder: 'Place',
                    key: LIST_ITEM_KEY.HALLRENT_PLACE,
                    isEditable: true,
                },
                {
                    type: LIST_ITEM_TYPE.TEXT_INPUT,
                    placeholder: 'Amount',
                    key: LIST_ITEM_KEY.HALLRENT_AMOUNT,
                    keyboardType: 'numeric',
                    isEditable: true,
                },
            ];
            case 'renderTollFare':
                return [
                    {
                        type: LIST_ITEM_TYPE.DATE_PICKER,
                        placeholder: 'Date',
                        key: LIST_ITEM_KEY.TOLL_DATE,
                        isEditable: true,
                        minimumDate: _minDate,
                        maximumDate: _maxDate,
                        mode: 'date',
                    },

                    {
                        type: LIST_ITEM_TYPE.DROP_DOWN,
                        placeholder: 'travells By',
                        key: LIST_ITEM_KEY.TOLL_TRAVELLS_TYPE,
                        isEditable: true,
                    },
                    {
                        type: LIST_ITEM_TYPE.TEXT_INPUT,
                        placeholder: 'From Place',
                        key: LIST_ITEM_KEY.TOLL_FROMPLACE,
                        isEditable: true,
                    },
                    {
                        type: LIST_ITEM_TYPE.TEXT_INPUT,
                        placeholder: 'To Place',
                        key: LIST_ITEM_KEY.TOLL_TOPLACE,
                        isEditable: true,
                    },
                    {
                        type: LIST_ITEM_TYPE.TEXT_INPUT,
                        placeholder: 'Remark',
                        key: LIST_ITEM_KEY.TOLL_REMARK,
                        isEditable: true,
                    },
                    {
                        type: LIST_ITEM_TYPE.TEXT_INPUT,
                        placeholder: 'KM',
                        key: LIST_ITEM_KEY.TOLL_KM,
                        keyboardType: 'numeric',
                        isEditable: true,
                    },
                    {
                        type: LIST_ITEM_TYPE.TEXT_INPUT,
                        placeholder: 'Rate',
                        key: LIST_ITEM_KEY.TOLL_RATE,
                        value:this.props.training.expanseData.km_rate,
                        keyboardType: 'numeric',
                        isEditable: false,
                    },
                    // {
                    //     type: LIST_ITEM_TYPE.TEXT_INPUT,
                    //     placeholder: 'Amount',
                    //     key: LIST_ITEM_KEY.ALLOWANCE_AMOUNT,
                    //     keyboardType: 'numeric',
                    //     isEditable: true,
                    // },
                    {
                        type: LIST_ITEM_TYPE.TEXT_INPUT,
                        placeholder: 'Amount (Rs.)',
                        value:'',
                        key: LIST_ITEM_KEY.TOLL_AMOUNT,
                        keyboardType: 'numeric',
                        isEditable: true,
                    },
                ];
            case 'otherAllows': return [
                {
                    type: LIST_ITEM_TYPE.DATE_PICKER,
                    placeholder: 'Date',
                    key: LIST_ITEM_KEY.OTHERS_DATE,
                    isEditable: true,
                    minimumDate: _minDate,
                    maximumDate: _maxDate,
                    mode: 'date',
                },
                {
                    type: LIST_ITEM_TYPE.TEXT_INPUT,
                    placeholder: 'Function',
                    key: LIST_ITEM_KEY.OTHERS_FUNCTION,
                    isEditable: true,
                },
                {
                    type: LIST_ITEM_TYPE.TEXT_INPUT,
                    placeholder: 'Brief Description',
                    key: LIST_ITEM_KEY.OTHERS_BRIFE_DESCRIPTION,
                    isEditable: true,
                },
                {
                    type: LIST_ITEM_TYPE.TEXT_INPUT,
                    placeholder: 'Amount',
                    key: LIST_ITEM_KEY.OTHERS_AMOUNT,
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
                    <View style={[styles.textInputField, styleOverride, { height: 45 }]}>
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
                        mode={'date'}
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
        // if (item?.type === LIST_ITEM_TYPE.DROP_DOWN) {
        //     return (
        //         <PickerSelector
        //             label={item.key === LIST_ITEM_KEY.STATE_LIST ? this.state.selectedStateLabel : item.key === LIST_ITEM_KEY.CITY_LIST ? this.state.selectedCityLabel : this.state.selectedPickerLabel}
        //             selectedValue={item.key === LIST_ITEM_KEY.STATE_LIST ? this.state.selectedPickerStateValue : item.key === LIST_ITEM_KEY.CITY_LIST ? this.state.selectedPickerCityValue : this.state.selectedPickerValue}
        //             isDisabled={item.key === LIST_ITEM_KEY.STATE_LIST ? null : item.key === LIST_ITEM_KEY.CITY_LIST ? this.state.selectCityPicker : this.state.selectLocationDlcp}
        //             customStyle={{
        //                 container: {
        //                     height: 45,
        //                     marginHorizontal: 0,
        //                 },
        //             }}
        //             onPickerPress={() => this.handlePickerSelector(item)}
        //         />
        //     );
        // }
        // renderHallRent
        if (item?.type === LIST_ITEM_TYPE.FUNCTION_VIEW && item.key === 'renderHallRent') {
            return (
                <View style={{ borderWidth: 1, borderColor: COLOR_CODES.borderGrey, marginBottom: 50 }}>
                    <View style={{ margin: 10 }}>
                        {
                            this.state.hallRentFields.map((item, _index) =>
                                <FlatList
                                    data={sectionData}
                                    contentContainerStyle={{ borderColor: COLOR_CODES.borderDark, backgroundColor: COLOR_CODES.white, borderWidth: 0.8, borderRadius: 8, padding: 10, marginBottom: 10 }}
                                    extraData={this.state}
                                    keyExtractor={(item, index) => `${index}_${item?.key}`}
                                    stickySectionHeadersEnabled={false}
                                    renderItem={({ item, index, section }) =>
                                        this._renderHallRentListItem(item, index, section, _index)
                                    }
                                />
                            )

                        }
                        <TouchableOpacity style={{ justifyContent: 'center', alignItem: 'center', flexDirection: 'row', width: 100, alignSelf: 'flex-end', marginTop: 10 }} onPress={() => this.addMoreHallRentFields()}>
                            <Image source={VESTIGE_IMAGE.ADD_MORE_ICON} style={{ height: 25, width: 25 }} />
                            <Text style={{ textAlign: 'center', paddingVertical: 4 }}>AddMore</Text>
                        </TouchableOpacity>
                        <View style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'row', alignSelf: 'flex-end' }}>
                            <Text style={{ fontSize: 16, ...Specs.fontBold }}>Sub Total Hall Rent: </Text>
                            <Text style={{ fontSize: 16, ...Specs.fontBold }}>{this._renderSubTotal(item.key)}</Text>
                        </View>
                    </View>

                </View>

            )
        }
        // renderTollFare
        if (item?.type === LIST_ITEM_TYPE.FUNCTION_VIEW && item.key === 'renderTollFare') {
            return (
                <View style={{ borderWidth: 1, borderColor: COLOR_CODES.borderGrey, marginBottom: 50 }}>
                    <View style={{ margin: 10 }}>
                        {
                            this.state.tollsFields.map((item, _index) =>
                                <FlatList
                                    data={sectionData}
                                    contentContainerStyle={{ borderColor: COLOR_CODES.borderDark, backgroundColor: COLOR_CODES.white, borderWidth: 0.8, borderRadius: 8, padding: 10, marginBottom: 10 }}
                                    extraData={this.state}
                                    keyExtractor={(item, index) => `${index}_${item?.key}`}
                                    stickySectionHeadersEnabled={false}
                                    renderItem={({ item, index, section }) =>
                                        this._renderListTollItem(item, index, section, _index)
                                    }
                                />
                            )

                        }
                        <TouchableOpacity style={{ justifyContent: 'center', alignItem: 'center', flexDirection: 'row', width: 100, alignSelf: 'flex-end', marginTop: 10 }} onPress={() => this.addMoreFields()}>
                            <Image source={VESTIGE_IMAGE.ADD_MORE_ICON} style={{ height: 25, width: 25 }} />
                            <Text style={{ textAlign: 'center', paddingVertical: 4 }}>AddMore</Text>
                        </TouchableOpacity>
                        <View style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'row', alignSelf: 'flex-end' }}>
                            <Text style={{ fontSize: 16, ...Specs.fontBold }}>Sub Total Mileage: </Text>
                            <Text style={{ fontSize: 16, ...Specs.fontBold }}>{this._renderSubTotal(item.key)}</Text>
                        </View>
                    </View>

                </View>

            )
        }
        // otherAllows
        if (item?.type === LIST_ITEM_TYPE.FUNCTION_VIEW && item.key === 'otherAllows') {
            return (
                <View style={{
                    borderWidth: 1,
                    borderColor: COLOR_CODES.borderGrey, marginBottom: 50
                }}>
                    <View style={{ margin: 10 }}>
                        {
                            this.state.otherFields.map((item, _index) =>
                                <FlatList
                                    data={sectionData}
                                    contentContainerStyle={{ borderColor: COLOR_CODES.borderDark, backgroundColor: COLOR_CODES.white, borderWidth: 0.8, borderRadius: 8, padding: 10, marginBottom: 10 }}
                                    extraData={this.state}
                                    keyExtractor={(item, index) => `${index}_${item?.key}`}
                                    stickySectionHeadersEnabled={false}
                                    renderItem={({ item, index, section }) =>
                                        this._renderListItemOther(item, index, section, _index)
                                    }
                                />
                            )

                        }
                        <TouchableOpacity style={{ justifyContent: 'center', alignItem: 'center', flexDirection: 'row', width: 100, alignSelf: 'flex-end', marginTop: 10 }} onPress={() => this.addMoreOtherFields()}>
                            <Image source={VESTIGE_IMAGE.ADD_MORE_ICON} style={{ height: 25, width: 25 }} />
                            <Text style={{ textAlign: 'center', paddingVertical: 4 }}>AddMore</Text>
                        </TouchableOpacity>
                        <View style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'row', alignSelf: 'flex-end' }}>
                            <Text style={{ fontSize: 16, ...Specs.fontBold }}>Sub Total Others: </Text>
                            <Text style={{ fontSize: 16, ...Specs.fontBold }}> {this._renderSubTotal(item.key)}</Text>
                        </View>
                    </View>

                </View>

            )
        }
        return false;
    }

    addMoreFields = () => {
        const _minDate = new Date();
        const _maxDate = new Date()
        _minDate.setMonth(_minDate.getUTCMonth() + 1)
        _maxDate.setMonth(_maxDate.getUTCMonth() + 1)
        _minDate.setDate(4)
        _maxDate.setDate(27)
        const _fields = this.state.tollsFields;
        const _textInput = this.state.tollsFieldsInput
        const _mobileExistError = this.state.mobileExistError;
        if (_fields.length > 4) {
            this.showToast(strings.commonMessages.upto, Toast.type.ERROR)
        } else {
            _fields.push([
                {
                    type: LIST_ITEM_TYPE.DATE_PICKER,
                    placeholder: 'Date',
                    key: LIST_ITEM_KEY.TOLL_DATE,
                    isEditable: true,
                    minimumDate: _minDate,
                    maximumDate: _maxDate,
                    mode: 'date',
                },
                {
                    type: LIST_ITEM_TYPE.DROP_DOWN,
                    placeholder: 'travells By',
                    key: LIST_ITEM_KEY.TOLL_TRAVELLS_TYPE,
                    isEditable: true,
                },
                {
                    type: LIST_ITEM_TYPE.TEXT_INPUT,
                    placeholder: 'From Place',
                    key: LIST_ITEM_KEY.TOLL_FROMPLACE,
                    isEditable: true,
                },
                {
                    type: LIST_ITEM_TYPE.TEXT_INPUT,
                    placeholder: 'To Place',
                    key: LIST_ITEM_KEY.TOLL_TOPLACE,
                    isEditable: true,
                },
                {
                    type: LIST_ITEM_TYPE.TEXT_INPUT,
                    placeholder: 'Remark',
                    key: LIST_ITEM_KEY.TOLL_REMARK,
                    isEditable: true,
                },
                {
                    type: LIST_ITEM_TYPE.TEXT_INPUT,
                    placeholder: 'KM',
                    key: LIST_ITEM_KEY.TOLL_KM,
                    keyboardType: 'numeric',
                    isEditable: true,
                },
                {
                    type: LIST_ITEM_TYPE.TEXT_INPUT,
                    placeholder: 'Rate',
                    value:this.props.training.expanseData.km_rate,
                    key: LIST_ITEM_KEY.TOLL_RATE,
                    keyboardType: 'numeric',
                    isEditable: true,
                },
                // {
                //     type: LIST_ITEM_TYPE.TEXT_INPUT,
                //     placeholder: 'Amount',
                //     key: LIST_ITEM_KEY.ALLOWANCE_AMOUNT,
                //     keyboardType: 'numeric',
                //     isEditable: true,
                // },
                {
                    type: LIST_ITEM_TYPE.TEXT_INPUT,
                    placeholder: 'Amount (Rs.)',
                     value:'',
                    key: LIST_ITEM_KEY.TOLL_AMOUNT,
                    keyboardType: 'numeric',
                    isEditable: true,
                },
            ])
            _textInput.push({ date: '', fromPlace: '', toPlace: '', remark: '', km: '', rate: '', amount: '' })
            _mobileExistError.push({ msg: '', isValid: null })
            this.setState({
                tollsFields: _fields,
                tollsFieldsInput: _textInput,
                mobileExistError: _mobileExistError
            })
        }
    }
    removeFields = (index, key) => {
        console.log('ClaimantInfo', key, key.search('allowance'))
        const isHallRentEnable = key.search('hallRent') < 0 ? false : true;
        const isTollEnable = key.search('toll') < 0 ? false : true;
        const isOthersEnable = key.search('others') < 0 ? false : true;
        Keyboard.dismiss();
        let _fields = {}
        let _textInput = {}
        if (isHallRentEnable) {
            _fields = this.state.hallRentFields
            _textInput = this.state.hallRentFieldsInput
        } else if (isTollEnable) {
            _fields = this.state.tollsFields
            _textInput = this.state.tollsFieldsInput
        } else {
            _fields = this.state.otherFields
            _textInput = this.state.otherFieldsInput
        }
        _fields.splice(index, 1)
        _textInput.splice(index, 1)
        if (isHallRentEnable) {
            this.setState({
                hallRentFields: _fields,
                hallRentFieldsInput: _textInput
            })
        } else if (isTollEnable) {
            this.setState({
                tollsFields: _fields,
                tollsFieldsInput: _textInput
            })
        } else {
            this.setState({
                otherFields: _fields,
                otherFieldsInput: _textInput
            })
        }
    }

    addMoreHallRentFields = () => {
        console.log("addMoreOtherFields==>", "addMoreHallRentFields")
        const _minDate = new Date();
        const _maxDate = new Date()
        _minDate.setMonth(_minDate.getUTCMonth() + 1)
        _maxDate.setMonth(_maxDate.getUTCMonth() + 1)
        _minDate.setDate(4)
        _maxDate.setDate(27)
        const _fields = this.state.hallRentFields;
        const _textInput = this.state.hallRentFieldsInput
        const _mobileExistError = this.state.mobileExistError;
        if (_fields.length > 4) {
            this.showToast(strings.commonMessages.upto, Toast.type.ERROR)
        } else {
            _fields.push([
                {
                    type: LIST_ITEM_TYPE.DATE_PICKER,
                    placeholder: 'Date',
                    key: LIST_ITEM_KEY.HALLRENT_DATE,
                    isEditable: true,
                    mode: 'date',
                },
                {
                    type: LIST_ITEM_TYPE.TEXT_INPUT,
                    placeholder: 'Place',
                    key: LIST_ITEM_KEY.HALLRENT_PLACE,
                    isEditable: true,
                },
                {
                    type: LIST_ITEM_TYPE.TEXT_INPUT,
                    placeholder: 'Amount',
                    key: LIST_ITEM_KEY.HALLRENT_AMOUNT,
                    keyboardType: 'numeric',
                    isEditable: true,
                },
            ])
            _textInput.push({ date: '', place: '', amount: '', })
            _mobileExistError.push({ msg: '', isValid: null })
            this.setState({
                hallRentFields: _fields,
                hallRentFieldsInput: _textInput,
                mobileExistError: _mobileExistError
            })
        }
    }

    addMoreOtherFields = () => {
        console.log("addMoreOtherFields==>", "addMoreOtherFields")
        const _minDate = new Date();
        const _maxDate = new Date()
        _minDate.setMonth(_minDate.getUTCMonth() + 1)
        _maxDate.setMonth(_maxDate.getUTCMonth() + 1)
        _minDate.setDate(4)
        _maxDate.setDate(27)
        const _fields = this.state.otherFields;
        const _textInput = this.state.otherFieldsInput
        const _mobileExistError = this.state.mobileExistError;
        if (_fields.length > 4) {
            this.showToast(strings.commonMessages.upto, Toast.type.ERROR)
        } else {
            _fields.push([
                {
                    type: LIST_ITEM_TYPE.DATE_PICKER,
                    placeholder: 'Date',
                    key: LIST_ITEM_KEY.OTHERS_DATE,
                    isEditable: true,
                    minimumDate: _minDate,
                    maximumDate: _maxDate,
                    mode: 'date',
                },
                {
                    type: LIST_ITEM_TYPE.TEXT_INPUT,
                    placeholder: 'Function',
                    key: LIST_ITEM_KEY.OTHERS_FUNCTION,
                    isEditable: true,
                },
                {
                    type: LIST_ITEM_TYPE.TEXT_INPUT,
                    placeholder: 'Brief Description',
                    key: LIST_ITEM_KEY.OTHERS_BRIFE_DESCRIPTION,
                    isEditable: true,
                },
                {
                    type: LIST_ITEM_TYPE.TEXT_INPUT,
                    placeholder: 'Amount',
                    key: LIST_ITEM_KEY.OTHERS_AMOUNT,
                    keyboardType: 'numeric',
                    isEditable: true,
                },
            ])
            _textInput.push({ date: '', place: '', amount: '', })
            _mobileExistError.push({ msg: '', isValid: null })
            this.setState({
                otherFields: _fields,
                otherFieldsInput: _textInput,
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
        const _fields = this.state.otherFields;
        const _textInput = this.state.otherFieldsInput
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
                    placeholder: 'Function',
                    key: LIST_ITEM_KEY.ACCOMODATION_PLACE,
                    isEditable: true,
                },
                {
                    type: LIST_ITEM_TYPE.TEXT_INPUT,
                    placeholder: 'Brief Description',
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
            ])
            _textInput.push({ date: '', place: '', amount: '', })
            _mobileExistError.push({ msg: '', isValid: null })
            this.setState({
                otherFields: _fields,
                otherFieldsInput: _textInput,
                mobileExistError: _mobileExistError
            })
        }
    }


    handleTextInput = async (item, value, index) => {
        console.log("input key ==>"+item?.key);
        var _textInput=null;
        switch (item?.key) {
            case LIST_ITEM_KEY.HALLRENT_PLACE: 
            _textInput= this.state.hallRentFieldsInput
            _textInput[index]['place'] =  value 
            this.setState({ hallRentFieldsInput: _textInput })
        
            break;
            case LIST_ITEM_KEY.HALLRENT_AMOUNT: 
             _textInput= this.state.hallRentFieldsInput
             _textInput[index]['amount'] =  Number(value) 
             this.setState({ hallRentFieldsInput: _textInput })
             break;

             case LIST_ITEM_KEY.TOLL_FROMPLACE: 
             _textInput= this.state.tollsFieldsInput
             _textInput[index]['fromPlace'] =  value 
             this.setState({ tollsFieldsInput: _textInput })
             break;

             case LIST_ITEM_KEY.TOLL_TOPLACE: 
             _textInput= this.state.tollsFieldsInput
             _textInput[index]['toPlace'] =  value 
             this.setState({ tollsFieldsInput: _textInput })
             break;

             case LIST_ITEM_KEY.TOLL_REMARK: 
             _textInput= this.state.tollsFieldsInput
             _textInput[index]['remark'] =  value 
             this.setState({ tollsFieldsInput: _textInput })
             break;

             case LIST_ITEM_KEY.TOLL_KM: 
             _textInput= this.state.tollsFieldsInput;
             _textInput[index]['km'] =  value ;  
             _textInput[index]['rate']=  this.props.training.expanseData.km_rate;
             var amountFinal=Number(value)*Number(this.props.training.expanseData.km_rate);

             _textInput[index]['amount']=amountFinal;
            //  alert(amountFinal);
             
             this.setState({ tollsFieldsInput: _textInput });

             break;
           

             case LIST_ITEM_KEY.TOLL_RATE: 
             _textInput= this.state.tollsFieldsInput
             _textInput[index]['rate'] =  value 
             this.setState({ tollsFieldsInput: _textInput })
             break;

             case LIST_ITEM_KEY.TOLL_AMOUNT: 
             _textInput= this.state.tollsFieldsInput
             _textInput[index]['amount'] =  Number(value)
             this.setState({ tollsFieldsInput: _textInput })
             break;

             case LIST_ITEM_KEY.OTHERS_AMOUNT: 
             _textInput= this.state.otherFieldsInput
             _textInput[index]['amount'] =  Number(value)
             this.setState({ otherFieldsInput: _textInput })
             break;
             
             case LIST_ITEM_KEY.OTHERS_FUNCTION: 
             _textInput= this.state.otherFieldsInput
             _textInput[index]['function'] =  value 
             this.setState({ otherFieldsInput: _textInput })
             break;

             case LIST_ITEM_KEY.OTHERS_BRIFE_DESCRIPTION: 
             _textInput= this.state.otherFieldsInput
             _textInput[index]['briefDesciption'] =  value 
             this.setState({ otherFieldsInput: _textInput })
             break;
             

        }
    };

    handlePickerSelector = (item, inputIndex) => {
        console.log('handleSelectorKey',JSON.stringify(item));
        console.log('handleSelectorKey', item?.key === LIST_ITEM_KEY.TOLL_TRAVELLS_TYPE)
        this.setState({ currentInputKey: item?.key });
        switch (item?.key) {
            
            case LIST_ITEM_KEY.TOLL_TRAVELLS_TYPE: 
            
            this.setState({
                currnetIndex:inputIndex,
                selectedPickerValue: '',
                selectedPickerLabel: 'Select Travel Type',
                selectedPickerItems: [
                    {
                        name:'Car',
                        id:'Car',
                    },
                    {
                        name:'Train',
                        id:'Train',
                    },
                    {
                        name:'Bus',
                        id:'Bus',
                    }

                ],
                selectedPickerItem: '',
                modalSchema: { label: 'name', value: 'id' },
            })

            
            return this.handleTollePickerModalVisibility(true)
            // case LIST_ITEM_KEY.CITY_LIST: return this.handleCityModalVisibility(true)
            // default: return this.handleModalVisibility(true);
        }
    };

    handlePickerItemPressCustom = async item => {
        console.log('TOLL_TRAVELLS_TYPE', item, this.state.currentInputKey)
        console.log('inputIndex', item, this.state.currnetIndex)
        var index=this.state.currnetIndex;
        if (this.state.currentInputKey === LIST_ITEM_KEY.TOLL_TRAVELLS_TYPE) {
            var _textInput= this.state.tollsFieldsInput;
            // alert(JSON.stringify(_textInput))
            _textInput[index]['travells_type'] =  item.name;
             this.setState({ tollsFieldsInput: _textInput })
             this.handleTollePickerModalVisibility(false);
            
        }

    }


    handlePickerVisibility = key => {
        console.log('key==>' + key);
        switch (key) {
            case LIST_ITEM_KEY.HALLRENT_DATE:
                return this.setState({ isHallRentDatePickerVisible: true });
                case LIST_ITEM_KEY.TOLL_DATE:
                    return this.setState({ isTollDatePickerVisible: true });
            case LIST_ITEM_KEY.OTHERS_DATE:
                return this.setState({ isOtherExpanceDatePickerVisible: true });
                HALLRENT_DATE
            case LIST_ITEM_KEY.TIME:
                return this.setState({ isTimePickerVisible: true });
        }
    };

    hideDatePicker = key => {
        switch (key) {
            case LIST_ITEM_KEY.HALLRENT_DATE:
                return this.setState({ isHallRentDatePickerVisible: false });
                case LIST_ITEM_KEY.TOLL_DATE:
                    return this.setState({ isTollDatePickerVisible: false });
                    case LIST_ITEM_KEY.OTHERS_DATE:
                        return this.setState({ isOtherExpanceDatePickerVisible: false });
            case LIST_ITEM_KEY.DATE:
                return this.setState({ isDatePickerVisible: false });
            case LIST_ITEM_KEY.TIME:
                return this.setState({ isTimePickerVisible: false });
        }
    };

    handleConfirm = (value, key, index) => {
        console.log("KEY===>",index);
        console.log("KEY===>",key);
    
        switch (key) {
            case LIST_ITEM_KEY.HALLRENT_DATE: {
                var _textInput=this.state.hallRentFieldsInput;
                let _value = new Date(value)
                let currentDate = new Date();
                if (_value.setHours(0, 0, 0, 0) === currentDate.setHours(0, 0, 0, 0)) {
                  const _minDate = new Date();
                  _minDate.setMonth(_minDate.getUTCMonth() + 1)
                  _minDate.setDate(4)
                  this.state.hallRentFieldsInput[index]['date'] = moment(_minDate).format('YYYY-MM-DD') 
                  this.setState({ hallRentFieldsInput: _textInput, isHallRentDatePickerVisible: false });
                } else {
                  this.state.hallRentFieldsInput[index]['date'] = moment(value).format('YYYY-MM-DD')
                  this.setState({ hallRentFieldsInput: _textInput, isHallRentDatePickerVisible: false });
                }
              }
                break;

                case LIST_ITEM_KEY.TOLL_DATE: {
                   
                    var _textInput=this.state.tollsFieldsInput;
                    let _value = new Date(value)
                    let currentDate = new Date();
                    if (_value.setHours(0, 0, 0, 0) === currentDate.setHours(0, 0, 0, 0)) {
                      const _minDate = new Date();
                      _minDate.setMonth(_minDate.getUTCMonth() + 1)
                      _minDate.setDate(4)
                      this.state.tollsFieldsInput[index]['date'] = moment(_minDate).format('YYYY-MM-DD') 
                      this.setState({ tollsFieldsInput: _textInput, isTollDatePickerVisible: false });
                    } else {
                      this.state.tollsFieldsInput[index]['date'] = moment(value).format('YYYY-MM-DD')
                      this.setState({ tollsFieldsInput: _textInput, isTollDatePickerVisible: false });
                    }
                  
                  }
                    break;

                    case LIST_ITEM_KEY.OTHERS_DATE: {
                        var _textInput=this.state.otherFieldsInput;
                        let _value = new Date(value)
                        let currentDate = new Date();
                        if (_value.setHours(0, 0, 0, 0) === currentDate.setHours(0, 0, 0, 0)) {
                          const _minDate = new Date();
                          _minDate.setMonth(_minDate.getUTCMonth() + 1)
                          _minDate.setDate(4)
                          this.state.otherFieldsInput[index]['date'] = moment(_minDate).format('YYYY-MM-DD') 
                          this.setState({ otherFieldsInput: _textInput, isOtherExpanceDatePickerVisible: false });
                        } else {
                          this.state.otherFieldsInput[index]['date'] = moment(value).format('YYYY-MM-DD')
                          this.setState({ otherFieldsInput: _textInput, isOtherExpanceDatePickerVisible: false });
                        }
                      }
                    
                        break;

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
            this.setState({ selectedState: item, selectedCityPickerItems: this.props.location.cityListData, modalCitySchema: { label: 'cityName', value: 'cityId' }, selectedStateLabel: item.stateName, selectedPickerStateValue: item.stateId, selectCityPicker: false, state: item.stateName })
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
    handleTollePickerModalVisibility = value => {
        this.setState({ isModalTravellsTypeVisible: value });
    };

    handleSubmitBtn = async () => {
        const {navigation,navigationParams,route}=this.props
        const { firstName, lastName, distributorID,currentPosition } = this.props.profile;
        // alert(JSON.stringify(this.props.training.expanseData))
        // console.log('Data2===>hallRent',this.state.hallRentFieldsInput),
        // console.log('Data2===> tolls',this.state.tollsFieldsInput);
        // alert(JSON.stringify(route.params))
        let userName = `${firstName} ${lastName}`;
        let allowanceValue=route.params.allowanceData;
        let accomodationValue=route.params.accomodationData;
        let trainingId=route.params.trainingId;
        let allowanceAmount=  allowanceValue.reduce(function (acc, obj) { return acc + obj.amount; }, 0);
        let accomodationAmount=  accomodationValue.reduce(function (acc, obj) { return acc + obj.amount; }, 0);
        let hallRentAmount= this.state.hallRentFieldsInput.reduce(function (acc, obj) { return acc + obj.amount; }, 0);
        let tollAmount=  this.state.tollsFieldsInput.reduce(function (acc, obj) { return acc + obj.amount; }, 0);
        let otherAmount= this.state.otherFieldsInput.reduce(function (acc, obj) { return acc + obj.amount; }, 0);
        
        let totalAmount= Number(hallRentAmount)+Number(tollAmount)+Number(otherAmount)
        +Number(allowanceAmount)+Number(accomodationAmount);
        let advanceAmount=0;
        let finalPayableAmount=totalAmount-advanceAmount;

        var isError=false;

        this.state.hallRentFieldsInput.map((value)=>{
            if(value.amount!=0 && value.date==''){
              isError=true;
              return;
            }
          });
          
          if(isError){  
            this.showToast('Please enter date in HallRent', Toast.type.ERROR)
            return;
          }
        
          this.state.tollsFieldsInput.map((value)=>{
            if(value.amount!=0 && value.date==''){
              isError=true;
              return;
            }
          });


          if(isError){  
            this.showToast('Please enter date in Mileage Claim/ Petrol /Toll /fare', Toast.type.ERROR)
            return;
      
          }

          
          this.state.otherFieldsInput.map((value)=>{
            if(value.amount!=0 && value.date==''){
              isError=true;
              return;
            }
          });
          
      
       
          if(isError){  
            this.showToast('Please enter date in others', Toast.type.ERROR)
            return;
      
          }
          
          

        if(totalAmount==0){
            this.showToast('Minimum amount must be for reimbursement', Toast.type.ERROR)
            return;
        }
        

        //allowance 
        let allowanceArray=[];
        allowanceValue.map((value)=>{
            if(value.amount!=0){
                allowanceArray.push({ 
                    date: value.date, 
                    place: value.place,
                    amount: value.amount,
                    subTotal:allowanceAmount})
            }
            }
          );

        let allowanceData={
            subTotal:allowanceAmount,
            data:allowanceArray,
        };

        //accomodation 
        let accomodationArray=[];
        accomodationValue.map((value)=>{
            if(value.amount!=0){
                accomodationArray.push({ 
                    date: value.date, 
                    place: value.place,
                    amount: value.amount,
                    subTotal:accomodationAmount})
            }
            
        });

        let accomodationData={
            subTotal:accomodationAmount,
            data:accomodationArray,
        };
        


        let hallArray=[];   
        this.state.hallRentFieldsInput.map((value)=>{
            if(value.amount!=0){
                hallArray.push({ 
                    date: value.date, 
                    place: value.place,
                    amount: value.amount,
                    subTotal:hallRentAmount})
            }
           
        });
        let hallRentData={
            subTotal:hallRentAmount,
            data:hallArray,
        };

        let tollArray=[]; 
        this.state.tollsFieldsInput.map((value)=>{
            if(value.amount!=0){
                tollArray.push({ 
                    date: value.date, 
                    fromPlace: value.fromPlace,
                    toPlace:value.toPlace,
                    remark:value.remark,
                    km:value.km,
                    rate:value.rate,
                    amount: value.amount,
                    travells_type:value.travells_type,
                    subTotal:tollAmount
                })

            }
            
        }); 
        let mileageClaimTollData={
            subTotal:tollAmount,
            data:tollArray,
        }; 

        let otherArray=[]; 
        this.state.otherFieldsInput.map((value)=>{

            if(value.amount!=0){
                otherArray.push({ 
                    date: value.date, 
                    function:value.function, 
                    briefDescription:value.briefDesciption, 
                    amount:value.amount, 
                    subTotal:otherAmount
                })
            }
          
        }); 

        let otherData={
            subTotal:otherAmount,
            data:otherArray,
        }; 
        
         const requestData = {
            distributorId: distributorID,
            trainingId:trainingId,
            member:distributorID,
            claimantFullName:userName,
            branch:'',
            statusPosition:currentPosition,
            advanceAmount:advanceAmount,
            totalAmount:totalAmount,
            finalPayableAmount:finalPayableAmount,
            allowance:allowanceData,
            accomodation:accomodationData,
            hallRent:hallRentData,
            mileageClaimToll:mileageClaimTollData,
            other:otherData

          }

          console.log("REQREST DATA==>"+JSON.stringify(requestData))
         const responseJSON = await this.props.training.submitCntClaimFrom(requestData);
         

         if(responseJSON!=undefined&& responseJSON.Result!=null &&responseJSON.Result[0]!=undefined){
            let data=responseJSON.Result[0];
            if(responseJSON.Result[0].outparam!=undefined){
                this.showToast(responseJSON.Result[0].outparam, Toast.type.ERROR);
                return;
            }else{
                this.showToast('reimburse apply successfully ', Toast.type.SUCCESS);
                navigation.navigate('claimOthersTotal', {'trainingId':trainingId, 'reimburseId':responseJSON.Result[0].id});
            }
         }
        //  this.showToast(responseJSON)
        //  navigation.navigate('claimOthersTotal', {'trainingId':trainingId, });
        // navigation.navigate('claimOthersTotal')
         
        // alert('under working');
    }

    _renderSubTotal = (key) => {
        // console.log('SubTotal==>'+key);
       
        if(key == 'renderHallRent'){
          return this.state.hallRentFieldsInput.reduce(function (acc, obj) { return acc + obj.amount; }, 0);
        } 
        if(key == 'renderTollFare'){ 
          return this.state.tollsFieldsInput.reduce(function (acc, obj) { return acc + obj.amount; }, 0);
        }
        if(key == 'otherAllows'){ 
            return this.state.otherFieldsInput.reduce(function (acc, obj) { return acc + obj.amount; }, 0);
          }
      }

      _renderFinalSubTotal=()=>{
        const {navigation,navigationParams,route}=this.props;
        let allowanceValue=route.params.allowanceData;
        let accomodationValue=route.params.accomodationData;
        let allowanceAmount=  allowanceValue.reduce(function (acc, obj) { return acc + obj.amount; }, 0);
        let accomodationAmount=  accomodationValue.reduce(function (acc, obj) { return acc + obj.amount; }, 0);
        let hallRentAmount= this.state.hallRentFieldsInput.reduce(function (acc, obj) { return acc + obj.amount; }, 0);
        let tollAmount=  this.state.tollsFieldsInput.reduce(function (acc, obj) { return acc + obj.amount; }, 0);
        let otherAmount= this.state.otherFieldsInput.reduce(function (acc, obj) { return acc + obj.amount; }, 0);
       
       
       
        return Number(hallRentAmount)+Number(tollAmount)+Number(otherAmount)
        +Number(allowanceAmount)+Number(accomodationAmount);
      }

    renderBottomSection = () => {
        return (
            <View style={[styles.textInputField, { height: 'auto' }]}>
                <View style={{ margin: 10, flexDirection :'row' }}>
                    
                    <Text>Grand Total (A+B+C+D+E) :</Text>
                    <Text style={styles.textTotalAmount}> {priceWithCurrency(this.props.profile.defaultAddressCountryId,this._renderFinalSubTotal())}</Text>
                    {/* <Text>Less : Advance as per cheque No: </Text>
                    <Text>Dated</Text>
                    <Text>NET AMOUNT PAYABLE(REFUNDABLE) :</Text> */}
                    {/* <View style={{ flexDirection: 'row' }}>
                        <View style={{ flex: 1 }}>
                            <Text>Claimed By</Text>
                            <Text>Distributor Name</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text>Approved By HOD</Text>
                            <Text>HOD Name</Text>
                        </View>
                    </View> */}
                </View>

            </View>

        )
    }

    render() {
        const { navigation, navigationParams } = this.props

        return (
            <SafeAreaView style={styles.container}>
                <Loader loading={this.props.training.isLoading} />
                <Header
                    navigation={this.props.navigation}
                    screenTitle={'CNT FROM2'}
                />
                <ScrollView>
                    <View style={styles.main}>

                    

                        {
                            this.createFormData().map((item, index) => <>
                                <View style={{ flexDirection: 'row' }}>
                                    <Text style={styles.sectionTitle}>{item?.title}</Text>
                                    {item.index >= 3 && <Text style={styles.mandatoryFields}>*</Text>}
                                </View>
                                {item.data.map((item, index) => this.renderSectionListItem(item, index))}
                            </>)
                        }

                        {this.renderBottomSection()}
                 
                        <CustomButton
                        {...this.props}
                            handleClick={this.handleSubmitBtn}
                            linearGradient
                            buttonContainer={styles.button}
                            buttonTitle={'Submit'}
                            buttonTitleStyle={styles.customButtonTitleStyle}
                            primaryColor="#58cdb4"
                            secondaryColor="#58cdb4"
                            accessibilityHint="navigate to Guest user form"
                            accessibilityLabel="Navigate_To_Guest_User_Login_Screen"
                     />

                   <BottomSheetPicker
                        isVisible={this.state.isModalTravellsTypeVisible}
                        onModalClose={() => this.handleTollePickerModalVisibility(false)}
                        pickerItems={this.state.selectedPickerItems}
                        heightMax={Dimensions.get('window').height / 2}
                        customStyles={{
                        bottomSheetItemText: {
                            textAlign: 'center',
                        },
                        }}
                        title="Select Type"
                        onItemPress={this.handlePickerItemPressCustom}
                        schema={this.state.modalSchema}
                        emptyMessage={`No Location Found`}
                    />
                    </View>

                </ScrollView>

            </SafeAreaView>
        )
    }
}

export default ClaimentAllowances;