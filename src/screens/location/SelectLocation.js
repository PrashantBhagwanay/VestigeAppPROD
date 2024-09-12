import React, {Component } from 'react';
import {
  View,
  Text,
  Keyboard,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions
} from 'react-native';
import autobind from 'autobind-decorator';
import { Specs } from 'app/src/utility/Theme';
import { CommonActions } from '@react-navigation/native';
import { Toast } from 'app/src/components/toast/Toast';
import HeaderLeftIcons from 'app/src/components/navigation/HeaderLeftIcons';
import { inject, observer } from 'mobx-react';
import { observable, makeObservable } from 'mobx';
import OfflineNotice from 'app/src/components/OfflineNotice';
import { CustomButton, RadioButton } from 'app/src/components/buttons/Button';
import Loader  from 'app/src/components/loader/Loader';
import { LOCATION_ROUTE_PATH, SHIPPING_TYPE_ID, SHIPPING_TYPE } from 'app/src/utility/constant/Constants';
import { capitalizeFirstCharacter, searchFromArray, connectedToInternet } from 'app/src/utility/Utility';
import Banner from 'app/src/screens/Dashboard/Banner';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { strings } from 'app/src/utility/localization/Localized';
import { KeyboardAwareSectionList } from 'react-native-keyboard-aware-scroll-view';
import AlertClass from 'app/src/utility/AlertClass';
import { Header } from '../../components';
import CateringLocation from 'app/src/components/cateringLocation/CateringLocation';
const options= ['Home Delivery', 'Store Pick-up'];
@inject('profile', 'location', 'auth', 'dashboard','cart')
@observer
export default class SelectLocation extends Component {

  @observable selectedAddressOption: string = '';
  @observable selectedDeliveryType: string = 'Home Delivery';
  @observable selectedAddressValue = null;
  @observable isLoading = false;
  @observable isInternetConnected: Boolean = true;

    constructor(props){
      super(props);
      makeObservable(this);
      if(this.props.route.params) {
        this.buttonPressed = this.props.route.params.buttonPressed
        this.defaultShoppingMode = this.props.route.params.defaultShoppingMode
      }
    }

    async componentDidMount() {
      // const callProfileApi = this.props.route.params && this.props.route.params.showBack;
      // if(callProfileApi) {
      //   await this.props.profile.fetchProfile()
      // }
      this.isInternetConnected = await connectedToInternet();
      if (this.isInternetConnected) {
        await this.props.profile.fetchUserAddresses();
        this.setState({});
        this.selectedDeliveryType = this.props.profile.activeAddress.addressType === 'Shipping' ? 'Home Delivery' : 'Store Pick-up'
      }
    }


    @autobind
    async networkStatus(status) {
      if(status) {
        this.isInternetConnected = status;
        this.props.profile.fetchUserAddresses();
      }
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

  /**
   * @function toggle radio button here
   */
  radioButton = async(index) => {
    if( options[index] === 'Store Pick-up' && this.props.profile.storeAddresses.length === 0)  {
      this.props.location.setLocationRoutePath(LOCATION_ROUTE_PATH.parentBack)
      this.props.navigation.navigate('location', {selectedDeliveryType: options[index], buttonPressed: this.buttonPressed,  clearSelectedAddress: this.clearSelectedAddress})
    }
    else {
      this.selectedDeliveryType = options[index]
    }
    this.pincode = ''
  }

  @autobind
  proceedForShippingType(){
    if(this.buttonPressed) {
      this.props.navigation.navigate('selectShippingType', {selectLocationRoute: true, buttonPressed: this.buttonPressed, defaultShoppingMode :this.defaultShoppingMode})
    }
    else {
      this.props.navigation.navigate('selectShippingType', {selectLocationRoute:true})
    }
  }

  @autobind
  navigateScreen(){
    // switch(this.props.location.locationRoutePath){
    //   case LOCATION_ROUTE_PATH.back: {
    //     this.props.navigation.goBack()
    //     this.props.dashboard.onAddressChange()
    //     break;
    //   }
    //   case LOCATION_ROUTE_PATH.next: {
    //     this.props.navigation.navigate('dashboard')
    //     break;
    //   }
    //   default: {
    //     this.props.dashboard.onAddressChange()
    //     this.props.navigation.navigate('dashboard')
    //   }
    // }
    // if(this.props.route.params) {
    //   var {buttonPressed, defaultShoppingMode} = this.props.route.params
    // }
    
    if(this.buttonPressed) {
      if(this.buttonPressed === 'repeatOrder') {
        this.props.navigation.navigate('repeatOrder', { defaultShoppingMode: this.defaultShoppingMode })
      }
      else {
        if(this.defaultShoppingMode) {
          // If the user is starting the application from intial screens.
          this.props.navigation.dispatch(CommonActions.reset({
            index: 0,
            actions: [
              CommonActions.navigate({ name: 'Shopping'})
            ]
          }))
        }
        else {
          //  if the user came to this screen by clicking on top header. We need to update address and pop screens.
          this.props.navigation.pop(2)
        }
      }
    }
    else {
      // In case if the user came to this screen from View Cart.
      this.props.navigation.pop()
    }
  }

  /**
  * @description hit the api for storing the address for home delivery
  */
  @autobind
  async saveHomeDeliveryAddress(address){
    let homeDeliveryData = {};
    if(address.cityId && address.stateId && address.countryId ) {
      homeDeliveryData = {
        distributorId: this.props.auth.distributorID,
        isDefault:true,
        address1:address.address,
        cityId: address.cityId,
        cityName: address.city,
        stateId: address.stateId,
        stateName: address.state,
        countryId: address.countryId,
        countryName: address.country,
        pincode:{
          pincode: address.pincode,
        }
      }
    } 
    else {
      let formatCountryName = capitalizeFirstCharacter(address.country);
      let formatStateName = capitalizeFirstCharacter(address.state);
      let formatCityName = capitalizeFirstCharacter(address.city);
      let response = await this.props.location.getCountryStateCityId(formatCountryName,formatStateName,formatCityName);
      if(response){
        this.showToast(response, Toast.type.ERROR);
        return;
      }
      else {
        homeDeliveryData = {
          distributorId: this.props.auth.distributorID,
          isDefault:true,
          address1:address.address,
          cityId: this.props.location.countryStateCityId.cityId,
          cityName: address.city,
          stateId: this.props.location.countryStateCityId.stateId,
          stateName: address.state,
          countryId: this.props.location.countryStateCityId.countryId,
          countryName: address.country,
          pincode:{
            pincode: address.pincode,
          }
        }
      }
    
    }
    this.isLoading = true;
    const status = await this.props.profile.updateLoaction(homeDeliveryData, 'home')
    this.isLoading = false;
    if(status){
      this.showToast(strings.errorMessage.location.locationSave, Toast.type.SUCCESS);
      if(this.props.navigation && this.props.route && this.props.route.params && this.props.route.params.cartId != null && this.props.route.params.cartId != undefined){
       
        this.props.cart.updateLocationOnCartAdd(this.props.route.params.cartId)
      }
      if(this.props.profile.isExpressAvailable || this.props.profile.isWarehouseAvailable){
        this.proceedForShippingType();
      }
      else{
        await this.props.profile.changeShippingType(SHIPPING_TYPE.regularDelivery);
        this.navigateScreen();
      }
    }
    else {
      this.showToast(this.props.profile.addressSaveError, Toast.type.ERROR)
    }
  }
  
  @autobind
  async selectStorePickup(item) {
    const selectStore = {
      distributorId: this.props.auth.distributorID,
      address1:item.address,
      pincode:{
        pincode: item.pincode
      },
      cityId: item.cityId,
      stateId: item.stateId,
      countryId: item.countryId,
      locationId: item.locationId,
      locationCode: item.locationCode,
      locationName: item.locationName,
      timings : item.timings,
      distance: item.distance
    }
    this.isLoading = true;
    const status = await this.props.profile.updateLoaction(selectStore, 'store')
    this.isLoading = false;
    if(status){
      this.showToast(strings.errorMessage.location.locationSave, Toast.type.SUCCESS);
      if(!item.isOnlinePayment) {
        AlertClass.showAlert('Alert!', 
          'Online payment option is not allowed for the selected store. You can continue shopping via cash only.', 
          [ {text: 'Ok', onPress: () => { 
            this.navigateScreen()
            // return;
          } },
          {text: 'Change', onPress: () => { 
            console.log('Ok Pressed')
            // return;
          } }
          ])
      }
      else {
        this.navigateScreen();
      }
    }
    else {
      this.showToast(this.props.profile.addressSaveError, Toast.type.ERROR)
    }
  }

  renderHomeDeliveryAddressFormat = (item) => {
    return(
      <Text 
        numberOfLines={5} 
        style={styles.addressTextStyle}
      >
        {`${item.address}, ${item.city}, ${item.state}, ${item.country} ${item?.countryId != 4 ? item.pincode : ''}`}
        { item.alternateContactNumber &&  <Text style={{ fontSize: 12,  ...Specs.fontRegular, color: '#3f4967'}}>{`\n Mobile No.: ${item.alternateContactNumber}`}</Text> }
        { item.isExpressShipping == SHIPPING_TYPE_ID.expressDelivery && <Text style={{ fontSize: 12,  ...Specs.fontSemiBold, color: '#3aa65c', borderRadius:3}}>{`\n ${'Express Delivery available'}`}</Text>}
      </Text>
    )
  }

  renderStorePickupAddressFormat = (item) => {
    return(
      <View>
        <Text style={styles.storeLocationNameTextStyle}>{item.locationName}</Text>
        <Text style={[styles.storeLocationTimeingsDistanceTextStyle,{ marginTop: 7, marginBottom: 3 }]}>{`${strings.locationScreen.timingsKey}${item.timings}`}</Text>
        {item.distance && (
          <Text style={styles.storeLocationTimeingsDistanceTextStyle}>{`${strings.locationScreen.distanceKey}${item.distance}`}</Text>
        )}
      </View>
    )
  }

  @autobind
  formatAddress(item){
    if(item) {
      return(
        this.selectedDeliveryType === 'Home Delivery' ? this.renderHomeDeliveryAddressFormat(item): this.renderStorePickupAddressFormat(item)
      )
    }
  }


  selectValue = async(item, index) => {
    if(this.selectedDeliveryType === 'Home Delivery') {
      const res = await this.props.location.getCountryStateCity(item.pincode)
      console.log(res)
      if(res) {
        this.showToast(res, Toast.type.ERROR)
        return
      }
    } 
    else  {
      const res = await this.props.location.getCountryStateCity(item.pincode)
      console.log(res)
      if(res) {
        this.showToast(res, Toast.type.ERROR)
        return
      }
    }
    console.log('check 780',item)
    this.selectedAddressValue = item
    this.selectedAddressOption= index
    // this.selectedDeliveryType === 'Home Delivery' ? (
    //   this.selectedAddressOption= index,
    //   this.saveHomeDeliveryAddress(item)
    // ):(this.selectedAddressOption=index,this.selectStorePickup(item))
  }

  submitAddress = async() => {
    if(this.selectedAddressValue) {
      if(this.selectedDeliveryType === 'Home Delivery') {
        await this.saveHomeDeliveryAddress(this.selectedAddressValue)
      }
      else {
        await this.selectStorePickup(this.selectedAddressValue)
      }
      console.log('address changed called')
      this.props.dashboard.onAddressChange()
    }
    else {
      // AlertClass.showAlert('Alert!', 
      //   'Do you want to continue without changing the address?', 
      //   [ {text: 'No', onPress: () => { console.log('No Pressed') }  },
      //     {text: 'Yes', onPress: () => { this.navigateScreen() }}
      //   ])
      this.navigateScreen()
    }
  }

  deleteAddress = async(item) => {
    const res = await this.props.profile.alterAddress(item, 'delete');
    if(res.success) {
      this.showToast(strings.locationScreen.addressDeleteMessage, Toast.type.SUCCESS)
    }
    else {
      this.showToast(res.message, Toast.type.ERROR)
    }
  }

  editAddress = (item, type) => {
    this.props.navigation.navigate('location', 
      {selectedDeliveryType: type ? (this.props.profile.activeAddress.addressType === 'Shipping' ? 'Home Delivery' : 'Store Pick-up' ) : this.selectedDeliveryType, 
        pincode: item.pincode,
        address: item.address,
        countryId: item.countryId,
        alternateContactNumber: item.alternateContactNumber,
        editAddress: true, 
        addressType:item.addressType,
        id: item.id, 
        isDefault: item.isDefault,
        buttonPressed: this.buttonPressed,
        clearSelectedAddress: this.clearSelectedAddress })
  }

  getAddressTypeString = (address) => {
    // const addressTypeValue = address.addressType === 'Shipping' ? '(HOME DELIVERY)' : '(STORE PICK-UP)'
    const {isWarehouseShipping, warehouseDeliveryType, defaultActiveAddressType} = this.props.profile;
    if (defaultActiveAddressType === 'Home-Delivery') {
      if (isWarehouseShipping == '1' && warehouseDeliveryType == '2') {
        return '';
      }
      return '';
    }
    return '(Store Pick-up)';
    // return addressTypeValue
  }

  renderDefaultAddress = (address) => {
    if(address && address.id) {
      return (
        <View style={{ backgroundColor: '#FFF', marginTop: 10, paddingHorizontal: 10, paddingBottom: 15 }}>
          <Text style={styles.recentAddressStyle} opacity={0.5}>
            {  strings.locationScreen.defaultShippingAddressTitle + this.getAddressTypeString(address) }
          </Text>
          <View style={{ paddingLeft: 17, flexDirection: 'row', justifyContent: 'space-between' }}>
            { address.addressType === 'Shipping' ? this.renderHomeDeliveryAddressFormat(address) : this.renderStorePickupAddressFormat(address) }
            {/* {
              address.addressType === 'Shipping' && (
                <TouchableOpacity style={{ paddingRight: 10 }} onPress={()=> this.editAddress(address, 'isDefault')}> 
                  <FontAwesome name='pencil' size={18} color='#01000250' /> 
                </TouchableOpacity>
              )
            } */}
          </View>
          <CateringLocation 
            navigation={this.props.navigation} 
            navigationParams={{selectLocationRoute: true, buttonPressed: this.buttonPressed, defaultShoppingMode :this.defaultShoppingMode}}
            containerStyle={{marginTop:15, marginHorizontal:5}}
          />
        </View>
      )
    }
    return null
  }

  clearSelectedAddress = () => {
    this.selectedAddressValue = null;
    this.selectedAddressOption = ''
  }

  render(){
    const { defaultShippingAddress, defaultStoreAddress } = this.props.profile;
    return(
      <View style={styles.container}>
        { !this.isInternetConnected && <OfflineNotice networkStatus={(status) => this.networkStatus(status)} /> }
        <Loader loading={this.props.profile.isLoading || this.isLoading} />
        <Header
          navigation={this.props.navigation}
          screenTitle={strings.locationScreen.screenTitle}
        />
        { this.renderDefaultAddress(this.props.profile.activeAddress) }
        {/* <View style={{marginTop: 10}}>
          <CateringLocation navigation={this.props.navigation} />
        </View> */}
        <View style={styles.locationContainer}>
          <Text style={styles.storeListHeaderTextStyle}>{strings.locationScreen.selectDeliveryType}</Text>
          <View style={styles.radioButtonContainer}>
            {
              options.map((option, i) => (
                <RadioButton
                  key={i.toString()}
                  buttonText={option}
                  onPress={() => this.radioButton(i)}
                  radioContainerStyles={styles.overRideStyle}
                  selectedValue={this.selectedDeliveryType}
                  accessibilityLabel={option}
                />
              ))
            }
          </View>
        </View>
        {/* { this.renderDefaultAddress(this.props.profile.activeAddress) } */}
        <View style={styles.selectLocationContainer}>
          {this.props.profile.addresses?.length >= 1 ? (
            <View style={{ marginHorizontal: 10 }}>
              <KeyboardAwareSectionList
                keyboardShouldPersistTaps='handled'
                extraScrollHeight={30}
                extraData={this.selectedAddressOption}
                initialNumToRender={this.props.profile.recentAddress.length}
                sections={[
                  { title: strings.locationScreen.recentAddressesTitle, data: this.props.profile.recentAddress.slice() }
                ]}
                renderSectionHeader={({section}) => (
                  <Text style={styles.recentAddressStyle} opacity={0.5}>{section.title}</Text>
                )}
                renderItem={({item, index}) => (
                  (this.selectedDeliveryType === 'Home Delivery'? item.addressType === 'Shipping' : item.addressType === 'StorePickup') && (
                    <TouchableOpacity 
                      style={styles.addressContainer}
                      onPress={() => {this.selectValue(item, index)}}
                    >
                      <View style={styles.radioButtonContainer}>
                        <RadioButton
                          showButtonText={false}
                          // buttonText={this.selectedDeliveryType === 'Home Delivery'? index : index}
                          buttonText={index}
                          onPress={() => {this.selectValue(item, index)}}
                          selectedValue={this.selectedAddressOption}
                        />
                      </View>
                      <View style={[styles.addressContainerTextStyle, { paddingLeft: 17 }]}>
                        {this.formatAddress(item)}
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}> 
                        {
                          this.selectedDeliveryType === 'Home Delivery' && (
                            <TouchableOpacity style={{ paddingRight: 10, borderRightWidth: 1 }} onPress={()=> this.editAddress(item)}> 
                              <FontAwesome name='pencil' size={18} color='#01000250' /> 
                            </TouchableOpacity>
                          )
                        }
                        <TouchableOpacity 
                          style={{ paddingLeft: 10 }} 
                          onPress={()=> {
                            AlertClass.showAlert('Alert!', 
                              strings.locationScreen.askForDeleteAddress, 
                              [ {text: 'Cancel', onPress: () => { console.log('Cancelled Pressed') }  },
                                {text: strings.commonMessages.ok, onPress: () => { this.deleteAddress(item) }}
                              ])
                          }}
                        > 
                          <FontAwesome name='trash-o' size={18} color='#01000250' />  
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  )
                )}
                keyExtractor={(item, index) => index}
                stickySectionHeadersEnabled={false}
              />
            </View>
          ):(
            <View style={[styles.radioButtonContainer, { flex: 1 }]}>
              <Text style={styles.recentAddressStyle} opacity={0.5}>{strings.locationScreen.noAddressesAddedTitle}</Text>
            </View>
          )}
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10 }}>
          <CustomButton
            {...this.props}
            linearGradient
            primaryColor="#6895d4"
            secondaryColor="#57a5cf"
            buttonContainer={styles.button}
            handleClick={() => {
              this.props.location.setLocationRoutePath(LOCATION_ROUTE_PATH.parentBack)
              this.props.navigation.navigate('location', 
                { selectedDeliveryType: this.selectedDeliveryType,
                  buttonPressed: this.buttonPressed,
                  clearSelectedAddress: this.clearSelectedAddress
                })
            }}
            buttonTitleStyle={styles.customButtonTitleStyle}
            buttonTitle={strings.locationScreen.addNewAddress}
          /> 
          <CustomButton
            {...this.props}
            linearGradient
            primaryColor="#6895d4"
            secondaryColor="#57a5cf"
            buttonContainer={styles.button}
            handleClick={() => {
              this.submitAddress()
              // this.props.location.setLocationRoutePath(LOCATION_ROUTE_PATH.parentBack)
              // if(this.props.route.params && this.props.route.params.showBack) {
              //   this.props.navigation.navigate('Dashboard')
              // }
              // else {
              //   this.props.navigation.pop()
              // }
            }}
            buttonTitleStyle={styles.customButtonTitleStyle}
            buttonTitle='Continue'
          />
        </View>
      </View>
    )
  }
}

const styles=StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFF3F7',
  },
  selectLocationContainer: {
    flex: 1,
    marginTop: 10, 
    backgroundColor: '#FFF',
  },
  recentAddressStyle:{
    color: '#3f4967', 
    fontSize: 12, 
    marginTop: 10,
    ...Specs.fontBold,
    marginBottom: 10, 
    marginLeft: 17
  },
  textTitleStyle: {
    color: '#373e73',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 17,
    ...Specs.fontBold,
  },
  button: {
    // marginTop: 10,
    // marginLeft: 16,
    // marginRight: 16,
    width: '48%'
  },
  customButtonTitleStyle: {
    ...Specs.fontMedium,
    color: '#FFFFFF',
    // width: '45%',
    alignSelf: 'center',
    justifyContent: 'center'
  },
  addressContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    justifyContent: 'space-between',
    paddingRight: 5,
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(200, 201, 211,0.5)',
    marginBottom: 10,
  },
  radioButtonContainer:{
    flexDirection: 'row',
    paddingBottom: 8,
  },
  addressContainerTextStyle:{
    marginBottom: 10,  
    width: '70%',
    justifyContent: 'center', 
  },
  addressTextStyle:{
    fontSize: 14, 
    ...Specs.fontBold,  
    color: '#3f4967',
    width: '90%'
  },
  storeListHeaderTextStyle: {
    ...Specs.fontMedium,
    color: '#9da3c2',
    fontSize: 12,
    marginHorizontal: 17,
    marginTop: 10,
    paddingBottom: 8
  },
  locationContainer: {
    marginTop: 10, 
    backgroundColor: '#FFFFFF', 
  },
  storeLocationNameTextStyle: {
    color: '#3f4967',
    ...Specs.fontBold,
    fontSize: 14,
  },
  storeLocationTimeingsDistanceTextStyle: {
    fontSize: 12,
    color: '#6C6C6C',
  },
  overRideStyle: {
    flex: 1,
  },
})