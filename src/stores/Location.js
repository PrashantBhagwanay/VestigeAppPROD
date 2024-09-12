/**
 * @description MyFunds Store, calling api and some actions defined here
*/

import { observable, action, computed, makeAutoObservable } from 'mobx';
import * as AsyncStore from 'app/src/utility/AsyncStoragesUtils';
import { showToast, isNullOrEmpty} from 'app/src/utility/Utility';
import { strings } from 'app/src/utility/localization/Localized';
import { VESTIGE_GOOGLE_KEYS } from 'app/src/utility/constant/Constants';
import NetworkOps from 'app/src/network/NetworkOps';
import * as Urls from 'app/src/network/Urls';
import { connectedToInternet } from '../utility/Utility';

export default class Location {
  @observable isLoading: boolean = false;
  @observable LocationData = [];
  @observable countryListData = [];
  @observable shoppableCountryListData = [];
  @observable stateListData = [];
  @observable cityListData = [];
  @observable storeListData = [];
  @observable pincodeList = [];
  @observable countryStateCityList = {};
  @observable autoDetectHome = [];
  @observable errorFetchingCountryListMessage: String = '';

  @observable selectedStoreData = [];

  @observable locationRoutePath = '';
  @observable currentState = '';
  @observable countryStateCityId = {};
  @observable countryWisePincodeLength = 6;
  @observable contactUsData = {};

  constructor(store) {
    this.store = store;
    makeAutoObservable(this);
  }

  @action setIsLoading = value =>{this.isLoading=value}
  @action setLocationData = value =>{this.LocationData=value}
  @action setCountryListData = value =>{this.countryListData=value}
  @action setShoppableCountryListData = value =>{this.shoppableCountryListData=value}
  @action setStateListData = value =>{this.stateListData=value}
  @action setCityListData = value =>{this.cityListData=value}
  @action setStoreListData = value =>{this.storeListData=value}
  @action setPincodeList = value =>{this.pincodeList=value}
  @action setCountryStateCityList = value =>{this.countryStateCityList=value}
  @action setAutoDetectHome = value =>{this.autoDetectHome=value}
  @action setErrorFetchingCountryListMessage = value =>{this.errorFetchingCountryListMessage=value}

  @action setSelectedStoreData = value =>{this.selectedStoreData=value}

  @action setLocationRoutePaths = value =>{this.locationRoutePath=value}
  @action setCurrentState = value =>{this.currentState=value}
  @action setCountryStateCityId = value =>{this.countryStateCityId=value}
  @action setCountryWisePincodeLength = value =>{this.countryWisePincodeLength=value}
  @action setContactUsData = value =>{this.contactUsData=value}

    countryList= async(platform)=> {
    this.setIsLoading(true);
    const { shoppableCountryList } = this.store.appConfiguration;
    const response = await NetworkOps.get(`${Urls.ServiceEnum.CountryList}`);
    if (!response.message) {
      const countryList = response; // platform === 'ios' ? response.filter(item => !item.iosOman) : response
      this.setCountryListData(countryList);
      this.setShoppableCountryListData(countryList.filter(item => shoppableCountryList?.includes(item.countryId?.toString())));
      this.setStateListData([]);
      // for (let i = 0; i < countryList.length; i++) {
      //   const item = countryList[i];
      //   if (item.countryId == '1') { // ..........static to india only as per requiremnt..........
      //     if (!isNullOrEmpty(item.pincodeLength)) {
      //       this.countryWisePincodeLength = item.pincodeLength;
      //     }
      //   }
      // }
    }
    else {
      this.errorFetchingCountryList = response.message;
    }
    this.setIsLoading(false);
  }

  @computed get getActiveCountryList() {
    return this.countryListData.length && this.countryListData.filter(item => item.status === true);
  }

  @computed get getActiveCountryListForBanch() {
    let ListData= this.countryListData.length && this.countryListData.filter(item => item.status === true);
    let CountyData = [];
    if (ListData) {
      for (const country of ListData) {
        if (country.countryId != 2 && country.countryId != 23 && country.countryId != 14 && country.countryId != 23 ) {
          CountyData.push(country);
        }
      }
    }

    return CountyData;
  }
  @computed get getShoppableCountryNameList() {
    return this.shoppableCountryListData.length && this.shoppableCountryListData.filter(item => item.status === true);
  }

  @computed get getCountryName() {
    let countryName = [];
    if (this.countryListData) {
      for (const country of this.countryListData) {
        if (country.status === true) {
          countryName.push(country.countryName)
        }
      }
    }
    return countryName.slice();
  }

  @computed get getShoppableCountryName() {
    let countryName = [];
    if (this.shoppableCountryListData) {
      for (const country of this.shoppableCountryListData) {
        if (country.status === true) {
          countryName.push(country.countryName)
        }
      }
    }
    return countryName.slice();
  }

  @computed get getStateNameList() {
    let sortedStateList = [];
    if (this.stateListData?.length > 1) {
      sortedStateList = this.stateListData?.slice()?.sort((a, b) => {
        const name_a = a.stateName.toLowerCase(), name_b = b.stateName.toLowerCase()
        if (name_a < name_b) { return -1; }
        if (name_a > name_b) { return 1; }
        return 0;
      });
      return sortedStateList?.length && sortedStateList;
    }
    // return sortedStateList.length && sortedStateList;
    return this.stateListData?.length && this.stateListData.filter(item => item.status === true);
  }

  @computed get getCityNameList() {
    let sortedCityList = [];
    if (this.cityListData?.length > 1) {
      sortedCityList = this.cityListData?.slice()?.sort((a, b) => {
        const name_a = a.cityName.toLowerCase();
        const name_b = b.cityName.toLowerCase();
        if (name_a < name_b) { return -1; }
        if (name_a > name_b) { return 1; }
        return 0;
      });
      return sortedCityList.length && sortedCityList;
    }
    // return sortedCityList.length && sortedCityList
    return this.cityListData?.length && this.cityListData.filter(item => item.status === true);
  }

  @action setLocationRoutePath(path) {
    this.locationRoutePath = path;
  }

   stateList=async(id)=> {
    this.setIsLoading(true);
    const response = await NetworkOps.get(`${Urls.ServiceEnum.StateList}${id}`);
    setTimeout(() => {
      this.setIsLoading(false);
    }, 500);
    if (!response.message) {
      this.setStateListData(response);
      // this.cityListData = [];
    }
  }

  @computed get getStateName() {
    let stateName = [];
    if (this.stateListData) {
      for (const state of this.stateListData) {
        stateName.push(state.stateName)
      }
    }
    return stateName.slice();
  }

   cityListApi= async (id)=> {
    const response = await NetworkOps.get(`${Urls.ServiceEnum.CityList}${id}`);
    if (!response.message) {
      this.setCityListData(response);
    } else {
      this.setCityListData([]);
    }
  }
  async cityList(id) {
    const response = await NetworkOps.get(`${Urls.ServiceEnum.CityList}${id}`);
    if (!response.message) {
      this.setCityListData(response);
    } else {
      this.setCityListData([]);
    }
  }

  @computed get getCityName() {
    let cityName = [];
    if (this.cityListData) {
      for (const city of this.cityListData) {
        cityName.push(city.cityName)
      }
    }
    return cityName.slice();
  }

  getPincode = async (countryId, stateId, cityId) => {
    this.setIsLoading(true);
    const response = await NetworkOps.get(`${Urls.ServiceEnum.Pincode}${countryId}${'/state/'}${stateId}${'/city/'}${cityId}`);
    if (!response.message) {
      this.setPincodeList(response);
    }
    this.setIsLoading(false);
  }

  async getStoreList(pincode, countryId,selectedDeliveryType) {
    this.setStoreListData([]);
    // this.setIsLoading(true);
    const params = `?countryId=${countryId}`;
    const response = await NetworkOps.get(`${Urls.ServiceEnum.StoreList}${pincode}${params}`);
 
    console.log(response)
    // this.setIsLoading(false);
    if (!response.message) {
      if(selectedDeliveryType=='Store Pick-up' && countryId==4){
        this.setStoreListData([]);
        return strings.errorMessage.location.noStoreFound;
       
      }else{
        this.setStoreListData(response);
      }
      
    }
    else if (response.name === 'noInternet') {
      return response.message;
    }
    else {
      return strings.errorMessage.location.noStoreFound;
    }
  }

  getCountryStateCity = async (pincode, countryId) => {
    // this.isLoading = true;
    let params;
    let response;
    if (countryId) {
      params = `?countryId=${countryId}`;
      response = await NetworkOps.get(`${Urls.ServiceEnum.CountryStateCity}${pincode}${params}`);
    }
    else {
      response = await NetworkOps.get(`${Urls.ServiceEnum.CountryStateCity}${pincode}`);
    }
    // this.isLoading = false;
    // console.log(response);
    if (!response.message) {
      this.setCountryStateCityList(Object.assign(response));
    }
    else {
      return response.message;
    }
  }

  @action clearStoreListData() {
    this.storeListData = [];
  }

  async autoDetectStoreLocation(latitude, longitude) {
    this.setStoreListData([]);
    this.setIsLoading(true);
    const response = await NetworkOps.get(`${Urls.ServiceEnum.AutoDetectLocation}${longitude}${'&latitude='}${latitude}`);
    this.setIsLoading(false);
    if (!response.message) {
      this.setStoreListData(response);
      return true;
    }
    return false
  }

  async autoDetectHomeDelivery(latitude, longitude) {
    try {
      this.setIsLoading(true);
      const isInternetConnected = await connectedToInternet();
      if(isInternetConnected) {
        const url = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + latitude + ',' + longitude + '&key=' + VESTIGE_GOOGLE_KEYS.VESTIGE_ANDROID_MAP_KEY;
        console.log('googlemapurl',url)
        await fetch(url)
          .then((response) => response.json())
          .then((responseJson) => {
            this.setIsLoading(false);
            console.log('resgooglemap',responseJson)
            if (responseJson.status === 'ZERO_RESULTS') {
              showToast(strings.errorMessage.location.unableTogetLocation)
              return;
            }
            else {
              this.setIsLoading(false);
              this.setAutoDetectHome(responseJson.results[0]);
            }
          })
      }
      else {
        this.setIsLoading(false)
        showToast(strings.commonMessages.noInternet)
      }
    }
    catch (error) {
      this.setIsLoading(false)
      console.log('Something went wrong')
    }
  }

  getSelectedPincode() {
    if (this.pincodeList) {
      return this.pincodeList[0];
    }
  }

  async getCountryStateCityId(countryName, stateName, cityName) {
    // this.isLoading = true;
    let url = `${Urls.ServiceEnum.CountryStateCityId}${countryName}/${stateName}/${cityName}`;
    const response = await NetworkOps.get(url);
    if (!response.message) {
      this.setCountryStateCityId(response);
    }
    else {
      return response.message;
    }
    // this.isLoading = false;
  }

  async fetchVestigeContactDetails() {
    const params = `?countryId=${this.store.profile.countryId}`;
    const url = `${Urls.ServiceEnum.contactUs}${params}`;
    this.setIsLoading(true);
    const response = await NetworkOps.get(url);
    this.setIsLoading(false);
    if (!response.message) {
      this.setContactUsData(response);
      return { success: true };
    }
    return { success: false, message: response.message };
  }
};