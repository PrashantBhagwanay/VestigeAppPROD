/**
 * @description Use to make Select screen
 */
import React, { Component } from 'react';
import {
  View, 
  StyleSheet,
} from 'react-native';
import autobind from 'autobind-decorator';
import { inject, observer } from 'mobx-react';
import { Specs } from 'app/src/utility/Theme';
import { strings } from 'app/src/utility/localization/Localized';
import FilterTraining from 'app/src/screens/myTraining/selectTraining/slectTrainingComponent/FilterTraining';
import { PICKER_ENUM } from 'app/src/utility/constant/Constants';
import Loader  from 'app/src/components/loader/Loader';
import HeaderLeftIcons from 'app/src/components/navigation/HeaderLeftIcons';
import { Toast } from 'app/src/components/toast/Toast';
import { observable, makeObservable } from 'mobx';
import { connectedToInternet, showToast } from 'app/src/utility/Utility';
import OfflineNotice from 'app/src/components/OfflineNotice';
import { Header } from '../../../components';

@inject('training')
@observer
export default class SelectTraining extends Component {

  @observable isInternetConnected: Boolean = true;
  
  constructor(props) {
    super(props);
    makeObservable(this);
    this.state = {
      selectedCountry: 'Country',
      selectedState: 'State',
      selectedCity: 'City',
      countryPickerVisible: false,
      statePickerVisible: false,
      cityPickerVisible: false,
      countryData: [],
      stateData: [],
      cityData: [],
      countryId:'',
      stateId: '',
      cityId: '',
      countryName: '',
      stateName: '',
      cityName: '',
      isloading: false,
    };
  }

  async componentDidMount() {
    this.isInternetConnected = await connectedToInternet();
    if(this.isInternetConnected){
      await this.getComponentData()
    }
  }

  @autobind
  async getComponentData() {
    const { training } = this.props;
    this.setState({
      isloading: true,
    })
    await training.trainingCountryListAPI();
    this.setState({
      countryData: await training.getCountryName(),
      isloading: false,
    })
  }


  @autobind
  async networkStatus(status) {
    if(status) {
      this.isInternetConnected = status;
      await this.getComponentData();
    }
  }

  /**
 * @param {*} visible true, false
 * @param {*} openPickerType picker key { country, state, city, pincode }
 */
@autobind
  openPicker (visible, openPickerType){
    switch(openPickerType){
      case PICKER_ENUM.COUNTRY_PICKER : {
        this.setState({ countryPickerVisible: visible});
        break;
      }
      case PICKER_ENUM.STATE_PICKER : {
        if(this.state.countryId === ''){
          this.showToast(strings.errorMessage.signUp.stateError, Toast.type.ERROR)
        }
        else {
          this.setState({ statePickerVisible: visible});
          this.statePickerVisible = visible;
        }
        break;
      }
      case PICKER_ENUM.CITY_PICKER : {
        if(this.state.countryId === ''){
          this.showToast(strings.errorMessage.signUp.stateError, Toast.type.ERROR)
        }
        else if(this.state.stateId === ''){
          this.showToast(strings.errorMessage.signUp.cityError, Toast.type.ERROR)
        }
        else {
          this.setState({ cityPickerVisible: visible});
          this.cityPickerVisible = visible;
        }
        break;
      }
    }
  }

@autobind
showToast(message: string,  toastType: Toast.type) {
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

/**
 * @param {*} selectedPickerValue selected value
 * @param {*} selectedPickerIndex picker key { 0, 1,2.... }
 * @param {*} selectedPickerKey picker key { country, state, city, pincode }
 */
setPickerValue = async(selectedPickerValue, selectedPickerIndex, selectedPickerKey) => {
  const { training } = this.props;
  const { 
    countryPickerVisible, 
    statePickerVisible, 
    cityPickerVisible, 
  } = this.state;
  
  if(selectedPickerIndex !== 0){
    
    if(selectedPickerKey === 'country'){
      this.setState({
        selectedCountry: selectedPickerValue,
        selectedState: 'State',
        stateData: [],
        stateId:'',
        stateName: '',
        selectedCity: 'City',
        cityId:'',
        cityName: '',
        cityData: [],
        isloading: false,
      })
      
      await training.getCountryList().filter(async (country)=>{
        if(country.countryName === selectedPickerValue){
          await training.trainingStateList(country.countryId);
          this.setState({
            stateData: await training.getStateName(),
            countryId: country.countryId,
            countryName: country.countryName,
            isloading: false
          })
        }
        else {
          this.setState({
            isloading: false
          })
        }
      })
      this.openPicker(!countryPickerVisible, selectedPickerKey)
    }
    else if( selectedPickerKey === 'state'){
      this.setState({
        selectedState: selectedPickerValue,
        selectedCity: 'City',
        cityId:'',
        cityName: '',
        cityData: [],
        isloading: false,
      })
      await training.getStateList().filter(async (state)=>{
        if(state.stateName === selectedPickerValue){
          await training.cityList(state.stateId);
          this.setState({
            cityData: await training.getCityName(),
            stateId: state.stateId,
            stateName: state.stateName,
            isloading: false
          })
        }
        else {
          this.setState({
            isloading: false
          })
        }
      })
      this.openPicker(!statePickerVisible, selectedPickerKey)
    }
    else{
      await training.getCityList().filter(async (city)=>{
        if(city.cityName === selectedPickerValue){
          this.setState({
            cityId: city.cityId,
            cityName: city.cityName,
            selectedCity: selectedPickerValue,
            isloading: false
          })
        }
      })
      this.openPicker(!cityPickerVisible, selectedPickerKey)
    }
  }
}

handleSearchCallback = async() => {
  const {countryId,stateId,cityId, countryName, stateName, cityName} = this.state;
  const {training,navigation, props} = this.props;
  const isConnectedToInternet = await connectedToInternet();
  if(isConnectedToInternet) {
    if( countryName && countryName !=='') {
      let detail = await training.getTariningDetail(countryName,stateName,cityName);
      if(detail.length > 0) {
        let {data} = this.props.route.params || {};
        let name = '';
        if(data && data.name !== null) {
          name = data.name
        }
        navigation.push('myTrainingScreen',{data:{name:name}, isTraining:false});
      }
      else{
        this.showToast(strings.emptyScreenMessages.noDataFoundMessage, Toast.type.ERROR)
      }
    }
    else{
      this.showToast(strings.training.selectCountry, Toast.type.ERROR)
    }
  }
  else {
    showToast(strings.commonMessages.noInternet)
  }
}

render() {
  const {
    selectedCountry, 
    selectedState, 
    selectedCity, 
    countryPickerVisible, 
    statePickerVisible, 
    cityPickerVisible, 
    isloading,
    countryData,
    stateData,
    cityData,
  } = this.state;
  const countryListPicker=[
    { data: countryData, key: 'country', visible: countryPickerVisible, selected: selectedCountry, defaultValue: 'Country' },
  ]
  const stateCityListPicker=[
    { data: stateData, key: 'state', visible: statePickerVisible, selected: selectedState, defaultValue: 'State' },
    { data: cityData, key: 'city', visible: cityPickerVisible, selected: selectedCity, defaultValue: 'City' },
  ];
  return(
    <View style={styles.mainView}>
      <Loader loading={isloading} />
      { !this.isInternetConnected && <OfflineNotice networkStatus={(status) => this.networkStatus(status)} /> }
      <Header
        navigation={this.props.navigation}
        screenTitle={this.props.route?.params?.data?.name || ''}
      />
      <FilterTraining 
        countryList={countryListPicker}
        stateCityList={stateCityListPicker}
        openPicker={this.openPicker}
        setPickerValue={this.setPickerValue}
        handleSearchCallback={this.handleSearchCallback}
      />
    </View>
  );
}
}

/**
 * @description: This is the custom stylesheet for Select training
 */
const styles = StyleSheet.create({
  mainView: {
    width: '100%',
    backgroundColor: '#f2f5f8',
    flex: 1,
  }
});