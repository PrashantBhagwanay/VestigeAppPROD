/**
 * @description Location Screen user set his location manually or automatically
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
  Linking,
} from 'react-native';
import { get, reject } from 'lodash';
import autobind from 'autobind-decorator';
import { observer, inject } from 'mobx-react'; // importing the mobx from the library
import { observable,  makeObservable} from 'mobx';
import Geolocation from '@react-native-community/geolocation';
import { CustomButton, RadioButton } from 'app/src/components/buttons/Button';
import { Toast } from 'app/src/components/toast/Toast';
import { Specs } from 'app/src/utility/Theme';
import * as Permissions from '../../utility/permissions/Permissions';
import { addressValidator, isPinCodeValidate, isMobileNumberValid } from 'app/src/utility/Validation/Validation';
import AlertClass from 'app/src/utility/AlertClass';
import { strings } from 'app/src/utility/localization/Localized';
import * as AsyncStore from 'app/src/utility/AsyncStoragesUtils';

// Navigation Icons
import HeaderRightIcons from 'app/src/components/navigation/HeaderRightIcons';

import SignupInput from '../signup/component/SignupInput';
import Loader from '../../components/loader/Loader';
import { VESTIGE_IMAGE, PICKER_ENUM, LOCATION_ROUTE_PATH, INPUT_COMPONENT_TYPE, SHIPPING_TYPE } from '../../utility/constant/Constants';
import { Header } from '../../components';
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
  @observable isPickerDisabled = true;
  @observable selectedStoreOption = '';
  @observable alternateContactNumber = '';
  @observable mobileIsdCodeValue = '';
  @observable mobileNumberLimit = 10;
  @observable isLoading = false;

  @observable previousSelectedLocationType: string = '';

  constructor(props) {
    super(props);
    makeObservable(this);
    this.state = {
      countryWisePincodeLength: 6,
      isUAESelected: false,
    };
    if (this.props.route.params) {
      this.lastButtonPressed = this.props.route.params.buttonPressed;
      // this.defaultShoppingMode = this.props.route.params.defaultShoppingMode
    }
  }

  async componentDidMount() {
    if (this.props.location.storeListData.length > 0) {
      this.props.location.clearStoreListData();
    }
    await this.fetchCountryDetails();
    this.handleParams();
  }

  fetchCountryDetails = async () => {
    const { location } = this.props;
    await location.countryList();
    this.countryData = location.getShoppableCountryName;
  };

  /** @description this will isdCode and mobile number to show it on textinput */
  separateNumberWithIsd = (mobileNumber, countryObject) => {
    if (countryObject?.countryId === 1) {
      return mobileNumber;
    }
    const isdCodeLength = countryObject?.isdCode?.toString()?.length;
    const separatedMobileNumber = mobileNumber.slice(isdCodeLength);
    return separatedMobileNumber;
  };

  /** @description this will do all the handeling for params received by screen */
  handleParams = async () => {
    const { params } = this.props.route;
    if (params && params.selectedDeliveryType) {
      this.selectedDeliveryType = params.selectedDeliveryType;
      let selectedCountryObject;
      if (params.countryId) {
        selectedCountryObject = this.props.location.countryListData.find(
          obj => obj.countryId === params.countryId,
        );
        if (selectedCountryObject) {
          await this.setPickerValue(
            selectedCountryObject.countryName,
            this.countryData,
            PICKER_ENUM.COUNTRY_PICKER,
            true,
          );
        }
      }
      if (params.pincode) this.handleTextInput('pincode', params.pincode);
      if (params.selectedDeliveryType === 'Home Delivery' && params.address)
        this.handleTextInput('address', params.address);
      if (params.alternateContactNumber) {
        const extractedNumber = this.separateNumberWithIsd(
          params.alternateContactNumber,
          selectedCountryObject,
        );
        this.handleTextInput('alternateContactNumber', extractedNumber);
      }
    } else if (this.props.profile.activeAddress.addressType === 'StorePickup') {
      this.selectedDeliveryType = 'Store Pick-up';
    } else {
      this.selectedDeliveryType = 'Home Delivery';
      if (!this.props.profile.activeAddress.addressType) {
        setTimeout(() => {
          this.pincode = get(
            this.props.profile.residentialAddress,
            'pincode',
            '',
          );
          this.handleTextInput('pincode', this.pincode);
        }, 1000);
      }
    }
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

  @autobind
  async getGeoLocation() {
    const permissionType =
      Platform.OS === 'android'
        ? Permissions.PERMISSION_TYPES.android.LOCATION
        : Permissions.PERMISSION_TYPES.ios.LOCATION;
    const response = await Permissions.requestPermission(permissionType);
    if (response === Permissions.StatusEnum.GRANTED) {
      Geolocation.getCurrentPosition(
        async position => {
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
      this.showToast(
        strings.errorMessage.location.detectLocationError,
        Toast.type.ERROR,
      );
      return;
    }

    if (this.selectedDeliveryType === 'Store Pick-up') {
      if (this.latitude && this.longitude) {
        const status = await this.props.location.autoDetectStoreLocation(
          this.latitude,
          this.longitude,
        );
        if (!status) {
          this.pincode = '';
          Alert.alert(
            strings.errorMessage.location.noStorePickupAvailable1,
            strings.errorMessage.location.noStorePickupAvailable2,
            [
              {
                text: strings.commonMessages.cancel,
                style: 'cancel',
              },
            ],
          );
        }
      }
    } else if (this.latitude && this.longitude) {
      let formattedAddress = '';
      await this.props.location.autoDetectHomeDelivery(
        this.latitude,
        this.longitude,
      );
      this.props.location.autoDetectHome.address_components.map(homeData => {
        homeData.types.map(home => {
          // this.isPickerDisabled = true;
          switch (home) {
            case 'postal_code': {
              this.pincode = homeData.long_name;
              this.getCountryStateList(homeData.long_name);
              break;
            }
            case 'premise': {
              formattedAddress = formattedAddress + homeData.long_name + ', ';
              break;
            }
            case 'sublocality_level_3': {
              formattedAddress = formattedAddress + homeData.long_name + ', ';
              break;
            }
            case 'sublocality_level_2': {
              formattedAddress = formattedAddress + homeData.long_name + ', ';
              break;
            }
            case 'sublocality_level_1': {
              formattedAddress = formattedAddress + homeData.long_name;
              break;
            }
            default: {
              break;
            }
          }
        });
      });
      this.address = formattedAddress;
      if (
        !this.pincode &&
        !this.selectedCountry &&
        !this.selectedCity &&
        !this.selectedState &&
        !this.address
      ) {
        this.showToast(
          strings.errorMessage.location.unableToSave,
          Toast.type.ERROR,
        );
        return;
      }
    }
  }

  radioButton = async index => {
    Keyboard.dismiss();
    this.selectedDeliveryType = options[index];
    switch (this.selectedDeliveryType) {
      case 'Home Delivery': {
        if (this.previousSelectedLocationType !== this.selectedDeliveryType) {
          this.pincode = '';
          this.selectedCountry = 'Select Country';
          this.countryID = '';
          this.mobileIsdCodeValue = '';
          this.mobileNumberLimit = 10;
          if (this.props.location.storeListData.length > 0) {
            this.props.location.clearStoreListData();
          } else if (!this.props.profile.activeAddress.addressType) {
            setTimeout(() => {
              this.pincode = get(
                this.props.profile.residentialAddress,
                'pincode',
                '',
              );
              this.handleTextInput('pincode', this.pincode);
            }, 1000);
          }
        }
        break;
      }
      case 'Store Pick-up': {
        if (this.previousSelectedLocationType !== this.selectedDeliveryType) {
          this.pincode = '';
          // this.isPickerDisabled = false;
          this.selectedCountry = 'Select Country';
          this.countryID = '';
          this.selectedCity = 'Select City';
          this.cityID = '';
          this.selectedState = this.state.isUAESelected
            ? 'Select Emirates'
            : 'Select State';
          this.stateID = '';
          this.address = '';
        }
        break;
      }
      default: {
        break;
      }
    }
    this.previousSelectedLocationType = options[index];
  };

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
          this.showToast(
            strings.errorMessage.signUp.stateError,
            Toast.type.ERROR,
          );
        } else {
          this.statePickerVisible = visible;
        }
        break;
      }
      case PICKER_ENUM.CITY_PICKER: {
        if (this.stateID === '') {
          this.showToast(
            strings.errorMessage.signUp.cityError,
            Toast.type.ERROR,
          );
        } else {
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
  async setPickerValue(
    selectedPickerValue,
    selectedPickerIndex,
    selectedPickerKey,
    openPickerDisabled,
  ) {
    if (selectedPickerIndex !== 0) {
      switch (selectedPickerKey) {
        case PICKER_ENUM.COUNTRY_PICKER: {
          this.pincode = '';
          this.selectedCountry = selectedPickerValue;
          const listWait = new Promise((resolve, reject) => {
            this.props.location.countryListData.filter(async country => {
              this.props.location.storeListData = [];
              if (
                country.countryName === selectedPickerValue &&
                this.countryID !== country.countryId
              ) {
                if (selectedPickerValue === 'U.A.E.')
                  this.setState({ isUAESelected: true });
                else this.setState({ isUAESelected: false });
                await this.props.location.stateList(country.countryId);
                this.selectedState = this.state.isUAESelected
                  ? 'Select Emirates'
                  : 'Select State';
                this.selectedCity = 'Select City';
                this.stateID = this.cityID = '';
                this.stateData = await this.props.location.getStateName;
                this.countryID = country.countryId;
                this.address = '';
                this.alternateContactNumber = '';
                this.mobileIsdCodeValue = country.isdCode;
                this.mobileNumberLimit = country.mobileNumberLimit;
                this.setState({
                  countryWisePincodeLength: country.pincodeLength,
                });
                resolve();
              }
            });
          });
          await listWait.then(() => {
            console.log('done');
          });
          if (!openPickerDisabled)
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
          await this.props.location.stateListData.filter(
            async (state, index) => {
              if (state.stateName === selectedPickerValue && this.pincode) {
                this.selectedCity = 'Select City';
                this.cityID = '';
                //if (this.props.profile.countryId != 4 || (this.props.profile.defaultAddressCountryId != 4) {    //condn 
                if (this.props.profile.countryId != 4 || !this.state.isUAESelected) {
                  await this.props.location.cityList(state.stateId);
                  //comment by vishnu 
                  // this.props.location.setCityListData(this.props.location.countryStateCityList.country.states[index].cities);
                } else {
                  await this.props.location.cityList(state.stateId);
                }
              
                this.cityData = await this.props.location.getCityName;
                this.stateID = state.stateId;
                this.pincode = state?.pinCode;

              } else if (state.stateName === selectedPickerValue && this.stateID !== state.stateId) {
                this.selectedCity = 'Select City';
                this.cityID = '';
                await this.props.location.cityList(state.stateId);
                this.cityData = await this.props.location.getCityName;
                this.stateID = state.stateId;
                this.pincode = state?.pinCode;
              }
            },
          );
          this.openPicker(!this.statePickerVisible, selectedPickerKey);
          break;
        }
        case PICKER_ENUM.CITY_PICKER: {
          await this.props.location.cityListData.filter(async city => {
            this.selectedCity = selectedPickerValue;
            this.cityID = city.cityId;
          });
          this.openPicker(!this.cityPickerVisible, selectedPickerKey);
          if(this.state.isUAESelected) {
            this.getStoreList(this.pincode, this.countryID);
          }
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
          this.getStoreList(this.pincode, this.countryID);
        } else {
          alert(
            strings.errorMessage.location.noStorePickupAvailable2,
            Toast.type.ERROR,
          );
          return;
        }
      }
    } else if (
      key === 'pincode' &&
      this.pincode.length === this.state.countryWisePincodeLength
    ) {
      if (isPinCodeValidate(this.pincode.trim())) {
        this.getCountryStateList(this.pincode, this.countryID);
      } else {
        alert(strings.errorMessage.location.inputType, Toast.type.ERROR);
        return;
      }
    }

    if (
      this.selectedCountry === 'Country' &&
      this.selectedState === 'State' &&
      this.selectedCity === 'City'
    ) {
      if (this.pincode.length < this.state.countryWisePincodeLength) {
        // this.isPickerDisabled = false;
        this.selectedCountry = 'Select Country';
        this.countryID = '';
        this.selectedCity = 'Select City';
        this.cityID = '';
        this.selectedState = this.state.isUAESelected
          ? 'Select Emirates'
          : 'Select State';
        this.stateID = '';
      }
    } else if (this.pincode.length === 0) {
      // this.isPickerDisabled = false;
      // this.selectedCountry = 'Select Country';
      // this.countryID = '';
      this.selectedCity = 'Select City';
      this.cityID = '';
      this.selectedState = this.state.isUAESelected
        ? 'Select Emirates'
        : 'Select State';
      this.stateID = '';
    }
  };

  /**
   * @description function get all the stores on the basis of pincode
   * @param {*} pincode pincode
   */
  getStoreList = async (pincode, countryId) => {
    Keyboard.dismiss();
    const { location } = this.props;
    const msg = await location.getStoreList(pincode, countryId,this.selectedDeliveryType);
    if (msg) {
      this.showToast(msg, Toast.type.ERROR);
    }
  };

  /**
   * @description function get the country, state, city name on the basis of pincode
   * @param {*} pincode pincode
   */
  getCountryStateList = async (pincode, countryId) => {
    if (pincode.length === this.state.countryWisePincodeLength) {
      const response = await this.props.location.getCountryStateCity(
        pincode,
        countryId,
      );
      // this.isPickerDisabled = true;
      if (response) {
        this.showToast(response, Toast.type.ERROR);
        // this.isPickerDisabled = false;
        this.pincode = '';
        // this.selectedCountry = 'Select Country';
        this.selectedCity = 'Select City';
        this.selectedState = this.state.isUAESelected
          ? 'Select Emirates'
          : 'Select State';
      }
      // else if (this.props.location.countryStateCityList.country.countryId !== 1) {
      //   this.showToast(strings.locationScreen.noServicesMessage, Toast.type.ERROR)
      // }
      else if (
        this.props.location.countryStateCityList.country.states.length > 1 ||
        this.props.location.countryStateCityList.country.states[0].cities
          .length > 1
      ) {
        // this.isPickerDisabled = false;
        // this.selectedCountry = this.props.location.countryStateCityList.country.countryName;
        // this.countryID = this.props.location.countryStateCityList.country.countryId;
        this.props.location.setStateListData(
          this.props.location.countryStateCityList.country.states,
        );
        this.stateData = this.props.location.getStateName;
      } else {
        // this.selectedCountry = this.props.location.countryStateCityList.country.countryName;
        // this.countryID = this.props.location.countryStateCityList.country.countryId;
        this.selectedState =
          this.props.location.countryStateCityList.country.states[0].stateName;
        this.stateID =
          this.props.location.countryStateCityList.country.states[0].stateId;
        this.selectedCity =
          this.props.location.countryStateCityList.country.states[0].cities[0].cityName;
        this.cityID =
          this.props.location.countryStateCityList.country.states[0].cities[0].cityId;
      }
    }
  };

  @autobind
  proceedForShippingType() {
    if (this.lastButtonPressed) {
      this.props.route.params.clearSelectedAddress();
      this.props.navigation.navigate('selectShippingType', {
        locationRoute: true,
        lastButtonPressed: this.lastButtonPressed,
      });
    } else {
      this.props.navigation.navigate('selectShippingType', {
        locationRoute: true,
      });
    }
  }

  @autobind
  navigateScreen() {
    // switch(this.props.location.locationRoutePath){
    //   case LOCATION_ROUTE_PATH.back: {
    //     this.props.navigation.goBack()
    //     this.props.dashboard.onAddressChange()
    //     this.props.route.params.updateLocation && this.props.route.params.updateLocation(true)
    //     break;
    //   }
    //   case LOCATION_ROUTE_PATH.next: {
    //     this.props.navigation.navigate('dashboard')
    //     break;
    //   }
    //   case LOCATION_ROUTE_PATH.parentBack: {
    //     this.props.navigation.pop(2)
    //     this.props.dashboard.onAddressChange()
    //     break;
    //   }
    //   default: {
    //     this.props.navigation.navigate('dashboard')
    //   }
    // }
    this.props.dashboard.onAddressChange();
    if (this.lastButtonPressed) {
      this.props.route.params.clearSelectedAddress();
      this.props.navigation.pop();
    } else {
      this.props.navigation.goBack(2);
    }
    // this.props.navigation.navigate('Shopping')
  }

  /**
   * @description is will decide if specific field is disabled or not based on condition
   */
  isFieldEditable = () => {
    if (this.countryID && this.countryID !== '') {
      return true;
    }
    return false;
  };

  /**
   * @description It will do validation for all the fields in the form
   */
  isValidate = () => {
    if (!this.countryID || !this.selectedCountry) {
      return strings.errorMessage.location.selectedCountryError;
    }
    if (!this.pincode) {
      return strings.errorMessage.location.pincodeRequired;
    }
    if (!this.stateID || !this.cityID) {
      return strings.errorMessage.location.validData;
    }
    if (!this.address) {
      return strings.errorMessage.location.addressError;
    }
    if (this.address) {
      const addressResponse = addressValidator(this.address);
      if (addressResponse !== true) {
        return addressResponse;
      }
    }
    if (
      this.props.profile.countryId != this.countryID &&
      !this.alternateContactNumber?.trim()
    ) {
      return strings.errorMessage.location.emptyContactNumber;
    }
    if (
      this.alternateContactNumber?.trim() &&
      (!isMobileNumberValid(this.alternateContactNumber?.trim()) ||
        this.alternateContactNumber.trim()?.length !== this.mobileNumberLimit)
    ) {
      return strings.errorMessage.location.validContactNumber;
    }
    return null;
  };

  /**
   * @description Contact info will be set here as per country.
   */
  setContactInfo = () => {
    if (this.alternateContactNumber.trim()) {
      if (this.countryID === 1) {
        return this.alternateContactNumber.trim();
      }
      return `${this.mobileIsdCodeValue}${this.alternateContactNumber.trim()}`;
    }
    return this.props.profile.mobileNumber;
  };

  /**
   * @description hit the api for storing the address for home delivery
   */
  @autobind
  async saveHomeDeliveryAddress() {
    const { editAddress, id, isDefault, addressType } = this.props.route.params;
    let homeDeliveryData = {};
    const errorMessage = this.isValidate();
    if (errorMessage) {
      this.showToast(errorMessage, Toast.type.ERROR);
    } else {
      this.props.location.setCurrentState(this.selectedState);
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
        alternateContactNumber: this.setContactInfo(),
        countryName: this.selectedCountry,
        pincode: {
          pincode: this.pincode,
        },
        ...(editAddress && { id: id }),
      };

      console.log(homeDeliveryData);
      if (editAddress) {
        this.isLoading = true;
        const res = await this.props.profile.alterAddress(homeDeliveryData);
        this.isLoading = false;
        if (res.success) {
          this.showToast(
            strings.errorMessage.location.locationSave,
            Toast.type.SUCCESS,
          );
          this.navigateScreen();
        } else {
          this.showToast(res.message, Toast.type.ERROR);
        }
      } else {
        this.isLoading = true;
        const status = await this.props.profile.updateLoaction(
          homeDeliveryData,
          'home',
        );
        this.isLoading = false;
        if (status) {
          this.showToast(
            strings.errorMessage.location.locationSave,
            Toast.type.SUCCESS,
          );
          if (
            this.props.profile.isExpressAvailable ||
            this.props.profile.isWarehouseAvailable
          ) {
            this.proceedForShippingType();
          } else {
            await this.props.profile.changeShippingType(
              SHIPPING_TYPE.regularDelivery,
            );
            this.navigateScreen();
          }
          this.props.dashboard.onAddressChange();
        } else {
          this.showToast(this.props.profile.addressSaveError, Toast.type.ERROR);
        }
      }
    }
  }

  @autobind
  async selectStorePickup(item) {
    const { editAddress, id, isDefault } = this.props.route.params;
    console.log(item);
    const selectStore = {
      distributorId: this.props.auth.distributorID,
      address1: item.address,
      pincode: {
        pincode: item.pincode,
      },
      cityId: item.cityId,
      stateId: item.stateId,
      countryId: item.countryId,
      locationId: item.locationId,
      locationCode: item.locationCode,
      locationName: item.locationName,
      timings: item.timings,
      distance: item.distance,
      isOnlinePayment: item.isOnlinePayment,
      ...(editAddress && { id: id, isDefault: isDefault }),
    };
    if (editAddress) {
      this.isLoading = true;
      const res = await this.props.profile.alterAddress(selectStore);
      this.isLoading = false;
      if (res.success) {
        this.showToast(
          strings.errorMessage.location.locationSave,
          Toast.type.SUCCESS,
        );
        this.navigateScreen();
      } else {
        this.showToast(res.message, Toast.type.ERROR);
      }
    } else {
      console.log(selectStore);
      this.isLoading = true;
      const status = await this.props.profile.updateLoaction(
        selectStore,
        'store',
      );
      this.isLoading = false;
      if (status) {
        this.showToast(
          strings.errorMessage.location.locationSave,
          Toast.type.SUCCESS,
        );
        if (!selectStore.isOnlinePayment) {
          AlertClass.showAlert(
            'Alert!',
            'Online payment option is not allowed for the selected store. You can continue shopping via cash only.',
            [
              {
                text: 'Ok',
                onPress: () => {
                  this.navigateScreen();
                  // return;
                },
              },
              {
                text: 'Change',
                onPress: () => {
                  console.log('Ok Pressed');
                  // return;
                },
              },
            ],
          );
        } else {
          this.navigateScreen();
        }
      } else {
        this.showToast(this.props.profile.addressSaveError, Toast.type.ERROR);
      }
    }
  }

  openGoogleMaps = item => {
    console.log(item);
    if (
      item.geoLocation &&
      item.geoLocation.longitude &&
      item.geoLocation.latitude
    ) {
      const scheme = Platform.select({
        ios: 'maps:0,0?q=',
        android: 'geo:0,0?q=',
      });
      const latLng = `${item.geoLocation.latitude},${item.geoLocation.longitude}`;
      const label = `${item.locationName}`;
      const url = Platform.select({
        ios: `${scheme}${label}@${latLng}`,
        android: `${scheme}${latLng}(${label})`,
      });
      Linking.openURL(url);
    } else {
      this.showToast(strings.branchesScreen.noCoordinatesFound);
    }
  };

  renderFooter = () => {
    return (
      this.selectedDeliveryType === 'Home Delivery' && (
        <CustomButton
          {...this.props}
          linearGradient
          primaryColor="#6895d4"
          secondaryColor="#57a5cf"
          buttonContainer={styles.button}
          handleClick={() => this.saveHomeDeliveryAddress()}
          buttonTitleStyle={styles.customButtonTitleStyle}
          buttonTitle={strings.locationScreen.locationScreenButtonTitle}
        />
      )
    );
  };

  /**
   * @description return the section list of the inputs and the data used on the scren
   */
  locationInputData = () => {
    const COUNTRY_PICKER = [
      {
        data: this.countryData,
        key: 'country',
        visible: this.countryPickerVisible,
        selected: this.selectedCountry,
        defaultValue: 'Country',
      },
    ];
    const STATE_CITY_PICKER = [
      {
        data: this.stateData,
        key: 'state',
        visible: this.statePickerVisible,
        selected: this.selectedState,
        defaultValue: this.state.isUAESelected ? 'Emirates' : 'State',
      },
      {
        data: this.cityData,
        key: 'city',
        visible: this.cityPickerVisible,
        selected: this.selectedCity,
        defaultValue: 'City',
      },
    ];
    const pincodeInput = {
      type: this.state.isUAESelected
        ? ''
        : INPUT_COMPONENT_TYPE.TEXTINPUT_WITH_ICON,
      icon: VESTIGE_IMAGE.LOCATION_ICON,
      placeholder: 'Pincode',
      key: 'pincode',
      keyboardType: 'numeric',
      defaultValue: this.pincode,
      maxLength: this.state.countryWisePincodeLength,
      handleFunction: this.handleTextInput,
      isEditable: this.isFieldEditable(),
    };
    const countryIdPicker = {
      type: INPUT_COMPONENT_TYPE.PICKER,
      inputIcon: VESTIGE_IMAGE.LOCATION_ICON,
      pickerData: COUNTRY_PICKER,
      handlePicker: this.openPicker,
      pickerIcon: VESTIGE_IMAGE.OPEN_PICKER_BUTTON,
      setPickerValue: this.setPickerValue,
      setPickerVisible: this.openPicker,
      // disabled: this.isPickerDisabled,
    };
    const homeDelivery = [
      countryIdPicker,
      pincodeInput,
      {
        type: INPUT_COMPONENT_TYPE.PICKER,
        inputIcon: VESTIGE_IMAGE.LOCATION_ICON,
        pickerData: STATE_CITY_PICKER,
        handlePicker: this.openPicker,
        pickerIcon: VESTIGE_IMAGE.OPEN_PICKER_BUTTON,
        setPickerValue: this.setPickerValue,
        setPickerVisible: this.openPicker,
        // disabled: this.isPickerDisabled,
        disabled: this.state.isUAESelected ? false : this.isPickerDisabled,
      },
      {
        type: INPUT_COMPONENT_TYPE.TEXTINPUT_WITH_ICON,
        icon: VESTIGE_IMAGE.LOCATION_ICON,
        placeholder: 'Address (House No, Street Name, Locality)',
        key: 'address',
        defaultValue: this.address,
        maxLength: 512,
        contextMenuHidden: true,
        handleFunction: this.handleTextInput,
        isEditable: this.isFieldEditable(),
      },
      {
        type: INPUT_COMPONENT_TYPE.TEXTINPUT_WITH_ICON,
        icon: VESTIGE_IMAGE.MOBILE_ICON,
        placeholder: 'Alternate Mobile Number',
        key: 'alternateContactNumber',
        keyboardType: 'numeric',
        defaultValue: this.alternateContactNumber,
        maxLength: this.mobileNumberLimit,
        handleFunction: this.handleTextInput,
        isEditable: this.isFieldEditable(),
        isdCodeValue: this.mobileIsdCodeValue,
      },
    ];

    const storePickup = [
      countryIdPicker,
      pincodeInput,
      {
        type: this.state.isUAESelected ? INPUT_COMPONENT_TYPE.PICKER : '',
        inputIcon: VESTIGE_IMAGE.LOCATION_ICON,
        pickerData: STATE_CITY_PICKER,
        handlePicker: this.openPicker,
        pickerIcon: VESTIGE_IMAGE.OPEN_PICKER_BUTTON,
        setPickerValue: this.setPickerValue,
        setPickerVisible: this.openPicker,
      },
    ];

    return (
      <View style={{ marginTop: Platform.OS == 'ios' ? 20 : 0 }}>
        <SectionList
          keyboardShouldPersistTaps="always"
          sections={[
            this.selectedDeliveryType === 'Home Delivery'
              ? {
                  title: strings.locationScreen.addressDetail,
                  subtitle: strings.locationScreen.detectLocationKey,
                  data: homeDelivery,
                }
              : {
                  title: strings.locationScreen.addressDetail,
                  data: storePickup,
                },
          ]}
          renderSectionHeader={({ section }) => (
            <View style={styles.detectLocationContainer}>
              <Text style={styles.detectLocationTitleStyle}>
                {section.title}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  Keyboard.dismiss();
                  this.getGeoLocation();
                }}>
                <Text style={styles.detectLocationTextStyle}>
                  {section.subtitle}
                </Text>
              </TouchableOpacity>
            </View>
          )}
          renderItem={({ item }) => (
            <View style={{ backgroundColor: '#FFFFFF' }}>
              {this.selectedDeliveryType !== 'Home Delivery' ? (
                this.renderStorePickupLocationInput(item)
              ) : (
                <SignupInput {...this.props} data={item} />
              )}
            </View>
          )}
          keyExtractor={(item, index) => index}
          ListFooterComponent={this.renderFooter}
          stickySectionHeadersEnabled={false}
        />
      </View>
    );
  };

  @autobind
  storeRatingView(item) {
    if (this.selectedDeliveryType === 'Home Delivery') {
      return <View />;
    }
    if (
      item.averageRating != '0.0' &&
      item.averageRating != '0' &&
      item.averageRating != null &&
      item.averageRating != undefined
    ) {
      return (
        <View
          style={{
            marginTop: 10,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            width: 80,
            paddingHorizontal: 10,
            height: 40,
            borderRadius: 5,
            backgroundColor: '#6797d4',
          }}>
          <Image source={STAR_IMAGE} style={{ width: 20, height: 20 }} />
          <Text
            style={{
              marginLeft: 10,
              color: 'white',
              fontWeight: '700',
              fontSize: 18,
            }}>
            {item.averageRating}
          </Text>
        </View>
      );
    }
    return <View />;
  }

  @autobind
  renderStorePickupLocationInput(item) {
    if (item.placeholder === 'Pincode') {
      return (
        <View
          style={[
            styles.storePickupLocationContainer,
            { justifyContent: 'space-between' },
          ]}>
          <View style={{ flexDirection: 'column', flex: 0.8 }}>
            <SignupInput {...this.props} data={item} />
          </View>
          {!this.state.isUAESelected && (
            <>
              <View style={{ flexDirection: 'column', flex: 0.1 }}>
                <View style={styles.verticalLine} />
                <Text style={{ alignSelf: 'center' }}>Or</Text>
                <View style={styles.verticalLine} />
              </View>
              <View style={styles.detectLocationContainer}>
                <TouchableOpacity
                  onPress={() => {
                    Keyboard.dismiss();
                    this.getGeoLocation();
                  }}>
                  <Text style={styles.detectLocationTextStyle}>
                    {strings.locationScreen.detectLocationKey}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      );
    }
    return (
      <View style={styles.storePickupLocationContainer}>
        <View style={{ flexDirection: 'column', flex: 1 }}>
          <SignupInput {...this.props} data={item} />
        </View>
      </View>
    );
  }

  renderStoreList = () => {
    if (
      this.props.location.storeListData.length > 0 &&
      this.selectedDeliveryType === 'Store Pick-up'
    ) {
      return (
        <View style={styles.storeListContainer}>
          <SectionList
            keyboardVerticalOffset={Platform.OS === 'ios' ? -64 : 0}
            keyboardShouldPersistTaps="always"
            extraData={this.selectedStoreOption}
            sections={[
              {
                title: strings.locationScreen.selectStorePickup,
                data: this.props.location.storeListData,
              },
            ]}
            renderSectionHeader={({ section }) => (
              <View style={[styles.storeListContainer, { marginBottom: 15 }]}>
                <Text style={styles.storeListHeaderTextStyle}>
                  {section.title}
                </Text>
              </View>
            )}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.storeContainer}
                onPress={() => {
                  Keyboard.dismiss();
                  this.selectedStoreOption = item.locationName;
                  this.selectStorePickup(item);
                }}
                accessible={false}>
                <View
                  style={[
                    styles.storeLocationContainer,
                    { flexDirection: 'row' },
                  ]}>
                  <View>
                    <RadioButton
                      showButtonText={false}
                      buttonText={item.locationName}
                      onPress={() => {
                        Keyboard.dismiss();
                        this.selectedStoreOption = item.locationName;
                        this.selectStorePickup(item);
                      }}
                      selectedValue={this.selectedStoreOption}
                    />
                  </View>
                  <View>
                    <Text style={styles.storeLocationNameTextStyle}>
                      {item.locationName}
                    </Text>
                    <Text
                      style={[
                        styles.storeLocationTimeingsDistanceTextStyle,
                        { marginTop: 7, marginBottom: 3 },
                      ]}>{`${strings.locationScreen.timingsKey}${item.timings}`}</Text>
                    {item.distance && (
                      <Text
                        style={
                          styles.storeLocationTimeingsDistanceTextStyle
                        }>{`${strings.locationScreen.distanceKey}${item.distance}`}</Text>
                    )}
                    {this.storeRatingView(item)}
                  </View>
                  <TouchableOpacity
                    style={styles.storeLocationImageStyle}
                    onPress={() => {
                      Keyboard.dismiss();
                      this.openGoogleMaps(item);
                    }}>
                    <Image source={VESTIGE_IMAGE.STORE_LOCATION_ICON} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            )}
            keyExtractor={(item, index) => index}
          />
        </View>
      );
    }
    return false;
  };

  renderHeaderRight = () => {
    return (
      <HeaderRightIcons doneSkip locationNavigation={this.props.navigation} />
    );
  };

  render() {
    const { editAddress } = this.props.route.params;
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <Loader
            loading={
              this.props.location.isLoading ||
              this.props.profile.isLoading ||
              this.isLoading
            }
          />
          <Header
            navigation={this.props.navigation}
            hideBack
            rightComponent={this.renderHeaderRight()}
            screenTitle={`${strings.locationScreen.locationOptions}`}
          />
          {!editAddress && (
            <View style={styles.locationContainer}>
              <Text style={styles.storeListHeaderTextStyle}>
                {strings.locationScreen.selectDeliveryType}
              </Text>
              <View style={styles.radioButtonContainer}>
                {options.map((option, i) => (
                  <RadioButton
                    radioContainerStyles={styles.overRideStyle}
                    key={i.toString()}
                    buttonText={option}
                    onPress={() => this.radioButton(i)}
                    selectedValue={this.selectedDeliveryType}
                    // disabled={this.props.route.params.editAddress ? true : false}
                  />
                ))}
              </View>
            </View>
          )}
          <View
            style={[
              styles.locationContainer,
              !editAddress && this.selectedDeliveryType === 'Home Delivery'
                ? { height: '80%' }
                : null,
            ]}>
            {this.locationInputData()}
          </View>
          {this.renderStoreList()}
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
  radioButtonContainer: {
    flexDirection: 'row',
    paddingBottom: 8,
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
  overRideStyle: {
    flex: 1,
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
  storeListHeaderTextStyle: {
    ...Specs.fontMedium,
    color: '#9da3c2',
    fontSize: 12,
    marginHorizontal: 17,
    marginTop: 10,
    paddingBottom: 8,
  },
  storeContainer: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
  },
  storeListContainer: {
    marginTop: 10,
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  storeLocationContainer: {
    marginLeft: 15,
    flex: 1,
    marginBottom: 30
  },
  storeLocationNameTextStyle: {
    color: '#363636',
    fontSize: 16,
  },
  storeLocationTimeingsDistanceTextStyle: {
    fontSize: 12,
    color: '#6C6C6C',
  },
  storeLocationImageStyle: {
    position: 'absolute',
    right: 2,
    paddingHorizontal: 25,
    paddingVertical: 5,
    marginTop: 0,
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
    alignItems: 'flex-start',
  },
});
