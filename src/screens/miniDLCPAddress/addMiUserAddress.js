/**
 * @description this Screen is used to add new address for other user by Mini DLCP owner.
 */

import React, { Component } from 'react';
import {
  Alert,
  View,
  Text,
  SectionList,
  Platform,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
  Image,
  TouchableOpacity,
  Linking
} from 'react-native';
import { get } from 'lodash';
import autobind from 'autobind-decorator';
import { observer, inject } from 'mobx-react'; // importing the mobx from the library
import { observable , makeObservable} from 'mobx';
import Geolocation from '@react-native-community/geolocation';
import { CustomButton, RadioButton } from 'app/src/components/buttons/Button';
import { Toast } from 'app/src/components/toast/Toast';
import { Specs } from 'app/src/utility/Theme';
import * as Permissions from '../../utility/permissions/Permissions';
import { addressValidator, isPinCodeValidate } from 'app/src/utility/Validation/Validation';
import AlertClass from 'app/src/utility/AlertClass';
import { strings } from 'app/src/utility/localization/Localized';
import * as AsyncStore from 'app/src/utility/AsyncStoragesUtils';
import { Header } from '../../components';

// Navigation Icons
import HeaderRightIcons from 'app/src/components/navigation/HeaderRightIcons';

import SignupInput from '../signup/component/SignupInput';
import Loader from '../../components/loader/Loader';
import { VESTIGE_IMAGE, PICKER_ENUM, LOCATION_ROUTE_PATH, INPUT_COMPONENT_TYPE, SHIPPING_TYPE } from '../../utility/constant/Constants';
import { promptToOpenSettings } from '../../utility/Utility';

const STAR_IMAGE = require('app/src/assets/images/ProductsRating/star.png');
const options = ['Home Delivery', 'Store Pick-up'];

@inject('location', 'auth', 'profile', 'dashboard')
@observer
export default class Location extends Component {
  @observable selectedCountry = 'Select Country';
  @observable selectedState = 'Select State';
  @observable selectedCity = 'Select City';
  @observable countryID = '';
  @observable stateID = '';
  @observable cityID = '';
  @observable latitude = null;
  @observable longitude = null;
  @observable countryData = [];
  @observable stateData = [];
  @observable cityData = [];
  // @observable storeList = [];
  @observable countryPickerVisible = false;
  @observable statePickerVisible = false;
  @observable cityPickerVisible = false;
  @observable selectedDeliveryType = '';
  @observable address = '';
  @observable pincode = '';
  @observable isPickerDisabled = false;
  @observable selectedStoreOption = '';
  @observable alternateContactNumber = '';
  @observable isLoading = false
  @observable backScreenCount: Number = 1;

  @observable previousSelectedLocationType: string = '';

  constructor(props) {
    super(props);
    makeObservable(this);
    this.state = {
      countryWisePincodeLength: 6,
    };
    this.backScreenCount = this.props.route?.params?.backScreenCount || 1;
    // this.props.navigation.state?.params?.clearSelectedAddress();
  }

  async componentDidMount() {
    const { params } = this.props.route;
    if (params && params.selectedDeliveryType) {
      this.selectedDeliveryType = params.selectedDeliveryType;
      params.pincode && this.handleTextInput('pincode', params.pincode)
      params.selectedDeliveryType === 'Home Delivery' && params.address && this.handleTextInput('address', params.address)
      params.alternateContactNumber && this.handleTextInput('alternateContactNumber', params.alternateContactNumber)
    }
    // else if (this.props.profile.activeAddress.addressType === 'StorePickup') {
    //   this.selectedDeliveryType = 'Store Pick-up';
    // }
    else {
      this.selectedDeliveryType = 'Home Delivery';
      if (!this.props.profile.activeAddress.addressType) {
        setTimeout(() => {
          this.pincode = get(this.props.profile.residentialAddress, 'pincode', '');
          if (this.pincode && this.pincode === 'Pincode not found') {
            this.handleTextInput('pincode', this.pincode);
          }
        }, 1000);
      }
    }
    await this.props.location.countryList();
    this.setState({ countryWisePincodeLength: this.props.location.countryWisePincodeLength});
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

  @autobind
  async getGeoLocation() {
    const permissionType =
      Platform.OS === 'android'
        ? Permissions.PERMISSION_TYPES.android.LOCATION
        : Permissions.PERMISSION_TYPES.ios.LOCATION;
    const response = await Permissions.requestPermission(permissionType);
    if (response === Permissions.StatusEnum.GRANTED) {
      Geolocation.getCurrentPosition(
        async (position) => {
          this.latitude = position.coords.latitude;
          this.longitude = position.coords.longitude;
          this.detectLocation();
        },
        () => {
          // this.showToast(strings.errorMessage.location.enableLocation, Toast.type.ERROR)
        },
        { enableHighAccuracy: true },
      );
    } else if (response === Permissions.StatusEnum.BLOCKED) {
      promptToOpenSettings(
        strings.errorMessage.location.locationPermission1,
        strings.errorMessage.location.locationPermission2,
      );
    }
  }

  /**
  * @description detect the location of the user from the gps of the mobile
  */
  @autobind
  async detectLocation() {
    if (!this.latitude && !this.longitude) {
      this.showToast(strings.errorMessage.location.detectLocationError, Toast.type.ERROR);
      return;
    }

    if (this.selectedDeliveryType === 'Store Pick-up') {
      if (this.latitude && this.longitude) {
        const status = await this.props.location.autoDetectStoreLocation(this.latitude, this.longitude);
        if (!status) {
          this.pincode = '';
          Alert.alert(strings.errorMessage.location.noStorePickupAvailable1,
            strings.errorMessage.location.noStorePickupAvailable2,
            [
              {
                text: strings.commonMessages.cancel, style: 'cancel',
              },
            ]);
        }
      }
    }
    else if (this.latitude && this.longitude) {
      let formattedAddress = '';
      await this.props.location.autoDetectHomeDelivery(this.latitude, this.longitude);
      this.props.location.autoDetectHome.address_components.map((homeData) => {
        homeData.types.map((home) => {
          // this.isPickerDisabled = true;
          switch (home) {
            case 'postal_code': {
              this.pincode = homeData.long_name
              this.getCountryStateList(homeData.long_name)
              break;
            }
            case 'premise': {
              formattedAddress = formattedAddress + homeData.long_name + ', '
              break;
            }
            case 'sublocality_level_3': {
              formattedAddress = formattedAddress + homeData.long_name + ', '
              break;
            }
            case 'sublocality_level_2': {
              formattedAddress = formattedAddress + homeData.long_name + ', '
              break;
            }
            case 'sublocality_level_1': {
              formattedAddress = formattedAddress + homeData.long_name
              break;
            }
            default: {
              break;
            }
          }
        });
      });
      this.address = formattedAddress
      if (!this.pincode && !this.selectedCountry && !this.selectedCity && !this.selectedState && !this.address) {
        this.showToast(strings.errorMessage.location.unableToSave, Toast.type.ERROR)
        return
      }
    }
  }

  /**
* @param {*} visible true, false
* @param {*} openPickerType picker key { country, state, city, pincode }
*/
  @autobind
  openPicker(visible, openPickerType) {
    switch (openPickerType) {
      case PICKER_ENUM.COUNTRY_PICKER: {
        this.countryPickerVisible = visible;
        break;
      }
      case PICKER_ENUM.STATE_PICKER: {
        if (this.countryID === '') {
          this.showToast(strings.errorMessage.signUp.stateError, Toast.type.ERROR);
        }
        else {
          this.statePickerVisible = visible;
        }
        break;
      }
      case PICKER_ENUM.CITY_PICKER: {
        if (this.stateID === '') {
          this.showToast(strings.errorMessage.signUp.cityError, Toast.type.ERROR);
        }
        else {
          this.cityPickerVisible = visible;
        }
        break;
      }
      default: {
        break;
      }
    }
  }

  /**
  * @param {*} selectedPickerValue selected value
  * @param {*} selectedPickerIndex picker key { 0, 1,2.... }
  * @param {*} selectedPickerKey picker key { country, state, city, pincode }
  */
  @autobind
  async setPickerValue(selectedPickerValue, selectedPickerIndex, selectedPickerKey) {
    if (selectedPickerIndex !== 0) {
      switch (selectedPickerKey) {
        case PICKER_ENUM.COUNTRY_PICKER: {
          this.selectedCountry = selectedPickerValue;
          await this.props.location.countryListData.filter(async (country) => {
            if (country.countryName === selectedPickerValue && this.countryID !== country.countryId) {
              await this.props.location.stateList(country.countryId);
              this.selectedState = 'Select State';
              this.selectedCity = 'Select City';
              this.stateID = this.cityID = '';
              this.stateData = await this.props.location.getStateName;
              this.countryID = country.countryId;
            }
          });
          this.openPicker(!this.countryPickerVisible, selectedPickerKey);
          break;
        }
        case PICKER_ENUM.STATE_PICKER: {
          if (selectedPickerValue === 'Andaman And Nicobar Islands') {
            this.openPicker(!this.statePickerVisible, selectedPickerKey);
            alert('Sorry, our services are not available in your area');
            return;
          }
          this.selectedState = selectedPickerValue;
          await this.props.location.stateListData.filter(async (state, index) => {
            if (state.stateName === selectedPickerValue && this.pincode) {
              this.selectedCity = 'Select City'
              this.cityID = ''
              this.props.location.setCityListData(this.props.location.countryStateCityList.country.states[index].cities)
              this.cityData = await this.props.location.getCityName
              this.stateID = state.stateId;
            }
            else if (state.stateName === selectedPickerValue && this.stateID !== state.stateId) {
              this.selectedCity = 'Select City';
              this.cityID = '';
              await this.props.location.cityList(state.stateId);
              this.cityData = await this.props.location.getCityName;
              this.stateID = state.stateId;
            }
          });
          this.openPicker(!this.statePickerVisible, selectedPickerKey);
          break;
        }
        case PICKER_ENUM.CITY_PICKER: {
          await this.props.location.cityListData.filter(async (city) => {
            this.selectedCity = selectedPickerValue;
            this.cityID = city.cityId;
          });
          this.openPicker(!this.cityPickerVisible, selectedPickerKey);
          break;
        }
        default: {
          break;
        }
      }
    }
  }


  /**
 * @description Function for geeting user input value from the fields
 */
  handleTextInput = (key, text) => {
    // (key === 'pincode')?this.pincode = text : this.address = text;
    this[key] = text;
    if (this.selectedDeliveryType === 'Store Pick-up') {
      if (this.pincode.length === this.state.countryWisePincodeLength) {
        if (isPinCodeValidate(this.pincode.trim())) {
          this.getStoreList(this.pincode)
        }
        else {
          alert(strings.errorMessage.location.noStorePickupAvailable2, Toast.type.ERROR);
          return;
        }
      }
    }
    else if (key === 'pincode' && this.pincode.length === this.state.countryWisePincodeLength) {
      if (isPinCodeValidate(this.pincode.trim())) {
        this.getCountryStateList(this.pincode)
      }
      else {
        alert(strings.errorMessage.location.inputType, Toast.type.ERROR);
        return;
      }
    }

    if (this.selectedCountry === 'Country' && this.selectedState === 'State' && this.selectedCity === 'City') {
      if (this.pincode.length < this.state.countryWisePincodeLength) {
        this.isPickerDisabled = false;
        this.selectedCountry = 'Select Country';
        this.countryID = '';
        this.selectedCity = 'Select City';
        this.cityID = '';
        this.selectedState = 'Select State';
        this.stateID = '';
      }
    }
    else if (this.pincode.length === 0) {
      this.isPickerDisabled = false;
      this.selectedCountry = 'Select Country';
      this.countryID = '';
      this.selectedCity = 'Select City';
      this.cityID = '';
      this.selectedState = 'Select State';
      this.stateID = '';
    }
  }

  /**
  * @description function get all the stores on the basis of pincode
  * @param {*} pincode pincode
  */
  getStoreList = async (pincode) => {
    Keyboard.dismiss();
    const { location } = this.props;
    const msg = await location.getStoreList(pincode);
    if (msg) {
      this.showToast(msg, Toast.type.ERROR);
    }
  }

  /**
  * @description function get the country, state, city name on the basis of pincode
  * @param {*} pincode pincode
  */
  getCountryStateList = async (pincode) => {
    if (pincode.length === this.state.countryWisePincodeLength) {
      const response = await this.props.location.getCountryStateCity(pincode);
      this.isPickerDisabled = true;
      if (response) {
        this.showToast(response, Toast.type.ERROR);
        this.isPickerDisabled = false;
        this.pincode = '';
        this.selectedCountry = 'Select Country';
        this.selectedCity = 'Select City';
        this.selectedState = 'Select State';
      }
      // else if (this.props.location.countryStateCityList.country.countryId !== 1) {
      //   this.showToast(strings.locationScreen.noServicesMessage, Toast.type.ERROR)
      // }
      else if (this.props.location.countryStateCityList.country.states.length > 1 || this.props.location.countryStateCityList.country.states[0].cities.length > 1) {
        this.isPickerDisabled = false;
        this.selectedCountry = this.props.location.countryStateCityList.country.countryName;
        this.countryID = this.props.location.countryStateCityList.country.countryId;
        this.props.location.setStateListData(this.props.location.countryStateCityList.country.states);
        this.stateData = this.props.location.getStateName;
      }
      else {
        this.selectedCountry = this.props.location.countryStateCityList.country.countryName;
        this.countryID = this.props.location.countryStateCityList.country.countryId;
        this.selectedState = this.props.location.countryStateCityList.country.states[0].stateName;
        this.stateID = this.props.location.countryStateCityList.country.states[0].stateId;
        this.selectedCity = this.props.location.countryStateCityList.country.states[0].cities[0].cityName;
        this.cityID = this.props.location.countryStateCityList.country.states[0].cities[0].cityId;
      }
    }
  }

  // @autobind
  // proceedForShippingType() {
  //   if (this.lastButtonPressed) {
  //     this.props.route.params.clearSelectedAddress();
  //     this.props.navigation.navigate('selectShippingType', { locationRoute: true, lastButtonPressed: this.lastButtonPressed });
  //   }
  //   else {
  //     this.props.navigation.navigate('selectShippingType', { locationRoute: true });
  //   }
  // }

  @autobind
  navigateScreen() {
    this.props.dashboard.onAddressChange();
    this.props.navigation.pop(this.backScreenCount);
    // this.props.navigation.navigate('Shopping')
  }


  /**
  * @description hit the api for storing the address for home delivery
  */
   @autobind
  async saveHomeDeliveryAddress() {
    const { editAddress, id, isDefault, addressType } = this.props.route.params || {};
    let homeDeliveryData = {};
    if (this.pincode && this.address && this.cityID && this.selectedCity && this.stateID && this.selectedState && this.countryID && this.selectedCountry && (!this.alternateContactNumber || this.alternateContactNumber.length == 10)) {
      const response = addressValidator(this.address);
      this.props.location.setCurrentState(this.selectedState);
      if (response === true) {
        homeDeliveryData = {
          distributorId: this.props.auth.distributorID,
          isDefault: editAddress ? isDefault : true,
          address1: this.address,
          cityId: this.cityID,
          addressType: addressType || 'shipping',
          cityName: this.selectedCity,
          stateId: this.stateID,
          stateName: this.selectedState,
          countryId: this.countryID,
          alternateContactNumber: this.alternateContactNumber.trim() || this.props.profile.mobileNumber,
          countryName: this.selectedCountry,
          isStoreAddress: false,
          pincode: {
            pincode: this.pincode,
          },
          ...(editAddress && { id: id }),
        };
      }
      else {
        // alert(response)
        Alert.alert(
          'Invalid Address',
          response,
          [
            { text: strings.commonMessages.ok, onPress: () => console.log("press ok") },
          ],
          { cancelable: false },
        );

        return;
      }
    }
    else if (!this.address && !this.pincode) {
      alert(strings.errorMessage.location.mandatoryError);
      return;
    }
    else if (!this.pincode) {
      alert(strings.errorMessage.location.pincodeRequired);
      return;
    }
    else if (!this.address) {
      alert(strings.errorMessage.location.addressError);
      return;
    }
    else {
      this.showToast(strings.errorMessage.location.validData, Toast.type.ERROR);
      return;
    }
    // console.log(homeDeliveryData)
    if (editAddress) {
      this.isLoading = true;
      const res = await this.props.profile.alterMiUserAddress(homeDeliveryData);
      this.isLoading = false;
      if (res.success) {
        this.showToast(strings.errorMessage.location.locationSave, Toast.type.SUCCESS);
        this.navigateScreen();
      }
      else {
        this.showToast(res.message, Toast.type.ERROR);
      }
    }
    else {
      this.isLoading = true;
      const status = await this.props.profile.saveMiUserAddress(homeDeliveryData, 'home');
      this.isLoading = false;
      if (status) {
        this.showToast(strings.errorMessage.location.locationSave, Toast.type.SUCCESS);
        this.navigateScreen();
      }
      else {
        this.showToast(this.props.profile.addressSaveError, Toast.type.ERROR);
      }
    }
  }

  renderFooter = () => {
    return (
      this.selectedDeliveryType === 'Home Delivery' && (
        <CustomButton
          {...this.props}
          linearGradient
          primaryColor="#6896D4"
          secondaryColor="#3054C4"
          buttonContainer={styles.button}
          handleClick={() => this.saveHomeDeliveryAddress()}
          buttonTitleStyle={styles.customButtonTitleStyle}
          buttonTitle={strings.locationScreen.locationScreenButtonTitle}
        />
      )
    );
  }

  /**
  * @description return the section list of the inputs and the data used on the scren
  */
  locationInputData = () => {
    const CONTACT_PICKER = [
      { data: this.countryData, key: 'country', visible: this.countryPickerVisible, selected: this.selectedCountry, defaultValue: 'Country' },
      { data: this.stateData, key: 'state', visible: this.statePickerVisible, selected: this.selectedState, defaultValue: 'State' },
      { data: this.cityData, key: 'city', visible: this.cityPickerVisible, selected: this.selectedCity, defaultValue: 'City' },
    ];
    const pincodeInput = {
      type: INPUT_COMPONENT_TYPE.TEXTINPUT_WITH_ICON,
      icon: VESTIGE_IMAGE.LOCATION_ICON,
      placeholder: 'Pincode',
      key: 'pincode',
      keyboardType: 'numeric',
      defaultValue: this.pincode,
      maxLength: this.state.countryWisePincodeLength,
      handleFunction: this.handleTextInput,
    }
    const homeDelivery = [
      pincodeInput,
      {
        type: INPUT_COMPONENT_TYPE.TEXTINPUT_WITH_ICON,
        icon: VESTIGE_IMAGE.LOCATION_ICON,
        placeholder: 'Address (House No, Street Name, Locality)',
        key: 'address',
        defaultValue: this.address,
        maxLength: 512,
        contextMenuHidden: true,
        handleFunction: this.handleTextInput,
      },
      {
        type: INPUT_COMPONENT_TYPE.TEXTINPUT_WITH_ICON,
        icon: VESTIGE_IMAGE.MOBILE_ICON,
        placeholder: 'Alternate Mobile Number',
        key: 'alternateContactNumber',
        keyboardType: 'numeric',
        defaultValue: this.alternateContactNumber,
        maxLength: 10,
        handleFunction: this.handleTextInput,
      },
      {
        type: INPUT_COMPONENT_TYPE.PICKER,
        inputIcon: VESTIGE_IMAGE.LOCATION_ICON,
        pickerData: CONTACT_PICKER,
        handlePicker: this.openPicker,
        pickerIcon: VESTIGE_IMAGE.OPEN_PICKER_BUTTON,
        setPickerValue: this.setPickerValue,
        setPickerVisible: this.openPicker,
        disabled: this.isPickerDisabled,
      },
    ];

    const storePickup = [
      pincodeInput,
    ];

    return (
      <View style={{ marginTop: (Platform.OS) == 'ios' ? 20 : 0 }}>
        <SectionList
          keyboardShouldPersistTaps="always"
          sections={[
            (this.selectedDeliveryType === 'Home Delivery')
              ? { title: strings.locationScreen.addressDetail, subtitle: strings.locationScreen.detectLocationKey, data: homeDelivery }
              : { title: strings.locationScreen.addressDetail, data: storePickup },
          ]}
          renderSectionHeader={({ section }) => (
            <View style={styles.detectLocationContainer}>
              <Text style={styles.detectLocationTitleStyle}>{section.title}</Text>
              {/* <TouchableOpacity onPress={() => { Keyboard.dismiss(), this.getGeoLocation() }}>
                <Text style={styles.detectLocationTextStyle}>{section.subtitle}</Text>
              </TouchableOpacity> */}

            </View>
          )}
          renderItem={({ item }) => (
            <View style={{ backgroundColor: '#FFFFFF' }}>
              {(this.selectedDeliveryType !== 'Home Delivery') ? (this.renderStorePickupLocation(item)) : <SignupInput {...this.props} data={item} />}
            </View>
          )}
          keyExtractor={(item, index) => index}
          ListFooterComponent={this.renderFooter}
          stickySectionHeadersEnabled={false}
        />
      </View>
    );
  }

  @autobind
  renderStorePickupLocation(item) {
    return (
      <View style={styles.storePickupLocationContainer}>
        <View style={{ flexDirection: 'column', flex: 0.8 }}>
          <SignupInput {...this.props} data={item} />
        </View>
        <View style={{ flexDirection: 'column', flex: 0.1, }}>
          <View style={styles.verticalLine} />
          <Text style={{ alignSelf: 'center' }}>Or</Text>
          <View style={styles.verticalLine} />
        </View>
        <View style={styles.detectLocationContainer}>
          <TouchableOpacity onPress={() => { Keyboard.dismiss(), this.getGeoLocation() }}>
            <Text style={styles.detectLocationTextStyle}>
              {strings.locationScreen.detectLocationKey}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  renderHeaderRight = () => {
    return (
      <HeaderRightIcons
        doneSkip
        locationNavigation={this.props.navigation}
      />
    )
  }

  render() {
    const { editAddress } = this.props.route?.params || {};
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <Loader loading={this.props.location.isLoading || this.props.profile.isLoading || this.isLoading} />
          <Header
            navigation={this.props.navigation}
            screenTitle={strings.locationScreen.locationOptions}
            hideBack
            rightComponent={this.renderHeaderRight()}
          />
          <View style={[styles.locationContainer, !editAddress && this.selectedDeliveryType === 'Home Delivery' ? { height: '80%' } : null]}>
            {
              this.locationInputData()
            }
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFF3F7',
  },
  textTitleStyle: {
    color: '#373e73',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 17,
  },
  locationContainer: {
    marginTop: 10,
    backgroundColor: '#FFFFFF',
  },
  button: {
    marginTop: 20,
    marginLeft: 16,
    marginRight: 16,
    marginBottom: '3%',

  },
  customButtonTitleStyle: {
    ...Specs.fontMedium,
    color: '#FFFFFF',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  detectLocationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 17,
    marginBottom: 30,
  },
  detectLocationTitleStyle: {
    color: '#9da3c2',
    fontSize: 12,
    marginHorizontal: 17,
  },
  detectLocationTextStyle: {
    fontSize: 12,
    color: '#58cdb4',
    borderBottomWidth: 1,
    marginRight: 17,
    borderBottomColor: '#58cdb4',
  },
  verticalLine: {
    height: 15,
    borderLeftWidth: 0.5,
    alignSelf: 'center',
    borderLeftColor: '#c8c9d3',
    marginHorizontal: 10,
  },
  storePickupLocationContainer: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
