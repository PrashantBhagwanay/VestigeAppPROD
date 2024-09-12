/**
 * @description This screen is used for selecting default delivery type of user i.e based 
 *              on different catering location.
 */

import React, { Component } from 'react';
import {
  Alert,
  View,
  Text,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  Image,
  TouchableOpacity,
  Dimensions,
  Modal,
  ScrollView
} from 'react-native';

import { observer, inject } from 'mobx-react'; // importing the mobx from the library
import { CommonActions } from '@react-navigation/native';
import { isIphoneXorAbove, capitalizeFirstCharacter, getViewportScript } from '../../utility/Utility';
import { CustomRadioButtonWithIcon, Checkbox, CustomButton} from 'app/src/components/buttons/Button';
import { Toast } from 'app/src/components/toast/Toast';
import { Specs } from 'app/src/utility/Theme';
import * as Permissions from 'app/src/utility/permissions/Permissions';
import { addressValidator, isPinCodeValidate } from 'app/src/utility/Validation/Validation';
import AlertClass from 'app/src/utility/AlertClass';
import { strings } from 'app/src/utility/localization/Localized';
import * as AsyncStore from 'app/src/utility/AsyncStoragesUtils';
import Loader from 'app/src/components/loader/Loader';
import { SHIPPING_TYPE, SHIPPING_TYPE_ID } from 'app/src/utility/constant/Constants';
import HeaderRightIcons from 'app/src/components/navigation/HeaderRightIcons';
// import HTML from 'react-native-render-html'; 
import { WebView } from 'react-native-webview';
import { Header } from '../../components';

const SELECTEDSHIPPINGTYPE = AsyncStore.addPrefix("selected-shipping-type");

const colorScheme = {
  regular: '#578BD3',
  express: '#2CA58D',
  warehouse: '#F1A66A'
}

const deviceWidth =  Dimensions.get('window').width;
const deviceHeight =  Dimensions.get('window').height;

@inject('location', 'auth', 'profile', 'dashboard')
@observer
export default class selectShippingType extends Component {

  constructor(props){
    super(props);
    this.state ={
      selectedValue:'',
      expressButtonInfo: '',
      isExpressTnCAccepted : false,
      expressTnC: '',
      selectedWarehouseType: '',
      warehouseButtonInfo: '',
      warehouseHomeDeliveryInfo: '',
      warehouseStorePickupInfo: ''
    }
    this.selectLocationRoute = this.props.route?.params?.selectLocationRoute;
    this.buttonPressed = this.props.route?.params?.buttonPressed;
    this.defaultShoppingMode = this.props.route?.params?.defaultShoppingMode
    this.locationRoute = this.props.route?.params?.locationRoute;
    this.lastButtonPressed = this.props.route?.params?.lastButtonPressed;
  }

  async componentDidMount(){
    const {profile} = this.props;
    if(this.selectLocationRoute || this.locationRoute){
      await profile.changeShippingType(SHIPPING_TYPE.regularDelivery);
    }
    this.setState({
      selectedValue: profile.defaultShippingType
    })
    const res = await profile.expressDeliveryTnC(profile.activeAddress.pincode, profile.fetchRegularCatering.locationId);
    if(res.success){
      this.setState({
        expressTnC: res.data.termsAndConditions,
        expressButtonInfo: res.data.expressCharge,
        warehouseButtonInfo: res.data.warehouseInfo,
        warehouseHomeDeliveryInfo: res.data.warehouseHomeDeliveryInfo,
        warehouseStorePickupInfo: res.data.warehouseStorePickupInfo
      })
    }
  }

  modalClose = () => {
    this.props.profile.isShippingTypeModalVisible = false;
  }

  addressFormat=(item)=>{
    if(item.addressType === 'Shipping'){
      return `${capitalizeFirstCharacter(item.address)}, ${capitalizeFirstCharacter(item.city)}, ${capitalizeFirstCharacter(item.state)}, ${capitalizeFirstCharacter(item.country)}, ${item.pincode}`
    }
    return `${item.address ? item.address.trim() + ', ': ''}${item.locationName}`
  }

  onPressShippingType = async (value) => {
    if(value === SHIPPING_TYPE.expressDelivery){
      this.setState({
        isExpressTnCAccepted: false,
        selectedValue: value
      })
    }
    else if(value === SHIPPING_TYPE.warehouseDelivery){
      this.setState({
        selectedWarehouseType: '',
        selectedValue: value
      })
    }
    else{
      this.setState({selectedValue: value})
    }
  }

  submitShippingType = async (value) => {
    if(value === SHIPPING_TYPE.regularDelivery || value === SHIPPING_TYPE.expressDelivery){
      const res = await this.props.profile.changeShippingType(value);
      if(res.success){
        this.handleNavigation();
      }
      else{
        console.log('false');
      }
    }
    else{
      if(this.props.profile.defaultShippingType == SHIPPING_TYPE.expressDelivery){
        await this.props.profile.changeShippingType(SHIPPING_TYPE.regularDelivery);
      }
      const res = await this.props.profile.handleWarehouseShipping('1', this.state.selectedWarehouseType);
      if(res.success){
        this.handleNavigation();
      }
      else{
        console.log('false');
      }
    }             
    
  }

  handleNavigation = () => {
    if(this.selectLocationRoute){
      if(this.buttonPressed){
        if(this.buttonPressed === 'repeatOrder') {
          //...for route (dashboard -> shopping option(repeat order) -> selectLocation -> shippingtype)
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
            //...for route (dashboard -> {shopping option -> selectLocation -> (cateringBranchComponent || continue button) --> shippingtype})....pop range {..}
            this.props.navigation.pop(3)
          }
        }
      }
      else{
        //...for route (dashboard -> {selectLocation -> (cateringBranchComponent || continue button) --> shippingtype})....pop range {..}
        this.props.navigation.pop(2)
      }
      
    }
    else if(this.locationRoute){
      if(this.lastButtonPressed){
        //...for route (dashboard -> {shopping option -> selectLocation -> addNewAddress --> shippingtype})....pop range {..}
        this.props.navigation.pop(4);
      }
      else{
        //...for route (dashboard -> {selectLocation -> addNewAddress --> shippingtype})....pop range {..}
        this.props.navigation.pop(3);
      }
    }
    else{
      //...for route (dashboard -> cart -> (cateringBranchComponent) --> {shippingtype})....pop range {..}
      this.props.navigation.pop(1);
    }
  }

  isSubmitDisabled = () => {
    if(this.state.selectedValue === SHIPPING_TYPE.expressDelivery && 
        this.state.expressTnC != '' && !this.state.isExpressTnCAccepted){
      return true;
    }
    else if(this.state.selectedValue === SHIPPING_TYPE.warehouseDelivery && this.state.selectedWarehouseType == ''){
      return true;
    }
    else{
      return false;
    }
  }

  handleWarehouseTypeClick = (type) => {
    this.setState({
      selectedWarehouseType: type
    })
  }

  handleWarehouseTypeButtonStyle = (type) => {
    if(type === this.state.selectedWarehouseType){
      return styles.selectedWarehouseType;
    }
    else{
      return styles.warehouseType;
    }
  }

  handleWarehouseTypeTextStyle = (type) => {
    if(type === this.state.selectedWarehouseType){
      return styles.selectedWarehouseTypeButtonTitle;
    }
    else{
      return styles.warehouseTypeButtonTitle;
    }
  }

  getViewportScript = () => {
    if ( Platform.OS === 'ios') {
      return `const meta = document.createElement('meta'); meta.setAttribute('content', 'width=width, initial-scale=1.1, maximum-scale=1.0, user-scalable=2.0'); meta.setAttribute('name', 'viewport'); document.getElementsByTagName('head')[0].appendChild(meta); `;
    }
    return `const meta = document.createElement('meta'); meta.setAttribute('content', 'width=width, initial-scale=1.0, maximum-scale=1.0, user-scalable=1.0'); meta.setAttribute('name', 'viewport'); document.getElementsByTagName('head')[0].appendChild(meta); `
  }

  renderTermsNConditions = (type) => {
    if(type === SHIPPING_TYPE.expressDelivery){
      return(
        <View style={styles.termsAndConditionsContainer}>
          <View style={{flexDirection: 'row', alignItems: 'center', justifyContent:'flex-start', paddingTop: 5}}>
            <Checkbox 
              // label={strings.errorMessage.signUp.agreeTNCTitle} 
              overrideStyles={{marginRight: 0, marginLeft : 15}}
              isSelected={this.state.isExpressTnCAccepted}
              getQuantity={()=> this.setState(prevState =>  ({ isExpressTnCAccepted: !prevState.isExpressTnCAccepted }))}
            />
            <Text style={{color:'#373e73', ...Specs.fontBold, fontSize:14 }} onPress={() => null}>{strings.errorMessage.signUp.termsNConditions}</Text>  
          </View>
          <View style={{height: 1, marginHorizontal: 10, backgroundColor: '#80808060', marginVertical:2}} />
          <View style={{ marginHorizontal:15, height: (deviceHeight * 25 / 100) }}>
            <WebView
              source={{html: this.state.expressTnC }}
              scalesPageToFit
              injectedJavaScript={this.getViewportScript()}
            />
          </View>
        </View> 
      )
    }
  }

  renderRegularCatering = () => {
    const {fetchRegularCatering} = this.props.profile;
    return(
      <View style={{alignItems: 'center', marginVertical:10}}>
        <CustomRadioButtonWithIcon
          handleClick={() => this.onPressShippingType(SHIPPING_TYPE.regularDelivery)}
          buttonContainer={[styles.buttonContainer]}
          button={[styles.button]}
          stripStyle={[styles.cateringStrip, {backgroundColor: colorScheme.regular}]}
          stripTitle={strings.selectShippingType.cateringStripTitle}
          stripText={`${fetchRegularCatering.locationName} - ${fetchRegularCatering.locationCode}`}
          radioButtonStyles={styles.radioButton}
          buttonTitle={SHIPPING_TYPE.regularDelivery}
          buttonTitleStyle={[styles.customButtonTitleStyle, {color: colorScheme.regular}]}
          iconName='truck'
          iconSize={30}
          iconColor={colorScheme.regular}
          isSelectedValue={this.state.selectedValue === SHIPPING_TYPE.regularDelivery}
        />
      </View>
    )
  }

  renderExpressCatering = () => {
    const {fetchExpressCatering} = this.props.profile;
    return(
      <View style={{alignItems: 'center', marginVertical:10, justifyContent: 'space-between'}}>
        <CustomRadioButtonWithIcon
          handleClick={() => this.onPressShippingType(SHIPPING_TYPE.expressDelivery)}
          // disabled={!this.props.profile.isExpressAvailable}
          buttonContainer={[styles.buttonContainer]}
          button={[styles.button]}
          stripStyle={[styles.cateringStrip, {backgroundColor: colorScheme.express}]}
          stripTitle={strings.selectShippingType.cateringStripTitle}
          stripText={`${fetchExpressCatering.locationName} - ${fetchExpressCatering.locationCode}`}
          radioButtonStyles={styles.radioButton}
          buttonTitle={SHIPPING_TYPE.expressDelivery}
          buttonTitleStyle={[styles.customButtonTitleStyle, {color: colorScheme.express}]}
          iconName='truck-fast'
          iconSize={30}
          iconColor={colorScheme.express}
          buttonInfo={this.state.expressButtonInfo}
          buttonInfoStyle={styles.buttonInfoStyle}
          isSelectedValue={this.state.selectedValue === SHIPPING_TYPE.expressDelivery}
        />
        {
          (this.state.selectedValue === SHIPPING_TYPE.expressDelivery && this.state.expressTnC) 
            ? 
            this.renderTermsNConditions(SHIPPING_TYPE.expressDelivery)
            : null
        }
      </View>
    )
  }

  renderWarehouseHomeDeliveryInfo = () => {
    if(this.state.warehouseHomeDeliveryInfo &&  this.state.warehouseHomeDeliveryInfo != ''){
      return(
        <Text style={[this.handleWarehouseTypeTextStyle(SHIPPING_TYPE_ID.warehouse.homeDelivery), {...Specs.fontRegular, fontSize:13}]}>
          {this.state.warehouseHomeDeliveryInfo}
        </Text> 
      )
    }
  }

  renderWarehouseStorePickupInfo = () => {
    if(this.state.warehouseStorePickupInfo &&  this.state.warehouseStorePickupInfo != ''){
      return(
        <Text style={[this.handleWarehouseTypeTextStyle(SHIPPING_TYPE_ID.warehouse.storePickup), {...Specs.fontRegular, fontSize:13}]}>
          {this.state.warehouseStorePickupInfo}
        </Text> 
      )
    }
  }

  renderWarehouseShoppingMode = () =>{
    const {fetchRegularCatering} = this.props.profile;
    return(
      <View style={styles.warehouseShoppingMode}>
        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent:'center', paddingVertical: 5}}>
          <Text style={{color:'#373e73', ...Specs.fontBold, fontSize:14 }} onPress={() => null}>Please select Delivery Point</Text>  
        </View>
        <View style={{height: 1, marginHorizontal: 10, backgroundColor: '#001A2330', marginVertical:2}} />
        <TouchableOpacity 
          style={[this.handleWarehouseTypeButtonStyle(SHIPPING_TYPE_ID.warehouse.homeDelivery)]}
          onPress={() => this.handleWarehouseTypeClick(SHIPPING_TYPE_ID.warehouse.homeDelivery)}
        >
          <Text style={[this.handleWarehouseTypeTextStyle(SHIPPING_TYPE_ID.warehouse.homeDelivery)]}>
            {strings.selectShippingType.warehouse.homeDelivery}
          </Text>
          <Text style={[this.handleWarehouseTypeTextStyle(SHIPPING_TYPE_ID.warehouse.homeDelivery), {...Specs.fontRegular, fontSize:15}]}>
            {this.addressFormat(this.props.profile.activeAddress)}
          </Text>
          {this.renderWarehouseHomeDeliveryInfo()}
        </TouchableOpacity>
        {this.props.profile.isRegularAvailable &&
          (
            <TouchableOpacity 
              style={[this.handleWarehouseTypeButtonStyle(SHIPPING_TYPE_ID.warehouse.storePickup)]}
              onPress={() => this.handleWarehouseTypeClick(SHIPPING_TYPE_ID.warehouse.storePickup)}
            >
              <Text style={[this.handleWarehouseTypeTextStyle(SHIPPING_TYPE_ID.warehouse.storePickup)]}>
                {strings.selectShippingType.warehouse.storePickup}
              </Text>
              <Text style={[this.handleWarehouseTypeTextStyle(SHIPPING_TYPE_ID.warehouse.storePickup), {...Specs.fontRegular, fontSize:15}]}>
                {`${fetchRegularCatering.locationName} - ${fetchRegularCatering.locationCode}`}
              </Text>
              {this.renderWarehouseStorePickupInfo()}
            </TouchableOpacity>
          )
        }
      </View>
    )
  }

  renderWarehouseCatering = () => {
    const {fetchWarehouseCatering} = this.props.profile;
    return(
      <View style={{alignItems: 'center', marginVertical:10}}>
        <CustomRadioButtonWithIcon
          handleClick={() => this.onPressShippingType(SHIPPING_TYPE.warehouseDelivery)}
          buttonContainer={[styles.buttonContainer]}
          button={[styles.button]}
          stripStyle={[styles.cateringStrip, {backgroundColor: colorScheme.warehouse}]}
          stripTitle={strings.selectShippingType.cateringStripTitle}
          stripText={`${fetchWarehouseCatering.locationName} - ${fetchWarehouseCatering.locationCode}`}
          radioButtonStyles={styles.radioButton}
          buttonTitle={SHIPPING_TYPE.warehouseDelivery}
          buttonTitleStyle={[styles.customButtonTitleStyle, {color: colorScheme.warehouse}]}
          iconName='store'
          iconSize={30}
          iconColor={colorScheme.warehouse}
          buttonInfo={this.state.warehouseButtonInfo}
          buttonInfoStyle={styles.buttonInfoStyle}
          isSelectedValue={this.state.selectedValue === SHIPPING_TYPE.warehouseDelivery}
        />
        {this.state.selectedValue === SHIPPING_TYPE.warehouseDelivery && this.renderWarehouseShoppingMode()}
      </View>
    )
  }

  renderSubmitButton = () => {
    return(
      <View>
        <CustomButton
          buttonContainer={styles.submitButton}
          disabled={this.isSubmitDisabled()}
          handleClick={async () => this.submitShippingType(this.state.selectedValue, )}
          linearGradient
          buttonTitle={strings.kyc.docType.bank.submitButtonTitle}
          primaryColor="#6895d4"
          secondaryColor="#3259CD"
          buttonTitleStyle={styles.customButtonTitleStyle}
        />
      </View>
    )
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
    const {isExpressAvailable, isWarehouseAvailable, isRegularAvailable} = this.props.profile;
    return (
      <View style={styles.container}>
        <Loader loading={this.props.profile.isLoading} />
        <Header
          navigation={this.props.navigation}
          hideBack
          rightComponent={this.renderHeaderRight()}
          screenTitle={strings.selectShippingType.screenTitle}
        />
        <ScrollView style={{paddingHorizontal:5, marginVertical:10}}>
          {isRegularAvailable && this.renderRegularCatering()}
          {isExpressAvailable && this.renderExpressCatering()}
          {isWarehouseAvailable && this.renderWarehouseCatering()}
        </ScrollView>
        {this.renderSubmitButton()}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container:{
    flex:1,
    backgroundColor: '#F2F4F5',
  },
  textTitleStyle: {
    color: '#373e73',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 17,
  },
  buttonContainer:{
    flex: 1,
  },
  button: {
    width: deviceWidth - 40,
    // minHeight: 100,
    minHeight: 50,
    paddingHorizontal: 10,
    borderRadius: 12,
    justifyContent: 'center',
    backgroundColor: '#fff',
    elevation: 4,
    shadowOffset: { width: 0, height: 0 },
    shadowColor: '#808080',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    borderWidth:0.5,
    borderColor:'#001A2350'
  },
  cateringStrip:{
    width: deviceWidth - 50,
    minHeight: 40,
    alignSelf: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingTop:10,
    marginTop:-10,
    backgroundColor: '#001A23',
    borderRadius: 10,
    elevation: 4,
    shadowOffset: { width: 0, height: 0 },
    shadowColor: '#808080',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    zIndex:-99
  },
  customButtonTitleStyle: {
    fontSize: 22,
    ...Specs.fontBold,
    alignSelf: 'center',
    color:'#fff',
    justifyContent: 'center',
    marginRight: 15
  },
  radioButton: {
    height: 20,
    width: 20,
    borderWidth: 2,
    borderRadius: 10,
    borderColor: '#80808090',
    marginRight: 10,
    alignSelf: 'center',
    marginVertical: 0,      //used for overright the default style
    justifyContent: 'center',
  },
  buttonInfoStyle:{ 
    marginHorizontal: 5
  },
  submitButton: {
    backgroundColor: 'transparent',
    width:'85%',
    marginTop:10,
    alignSelf: 'center'
  },
  termsAndConditionsContainer:{
    width: deviceWidth - 60, 
    marginTop: 5, 
    backgroundColor:'#fff', 
    // borderRadius:12,
    borderBottomLeftRadius:12,
    borderBottomRightRadius:12,
    elevation: 4,
    shadowOffset: { width: 0, height: 0 },
    shadowColor: '#808080',
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  warehouseShoppingMode: {
    width: deviceWidth - 60,
    marginTop: 5, 
    justifyContent: 'center',
    backgroundColor:'#fff', 
    // borderRadius:12,
    borderBottomLeftRadius:12,
    borderBottomRightRadius:12,
    elevation: 4,
    shadowOffset: { width: 0, height: 0 },
    shadowColor: '#808080',
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  selectedWarehouseType:{
    marginHorizontal: 15,
    marginVertical: 15,
    padding:5,
    borderWidth:1,
    borderColor: '#3054C4',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E8EDFA'
  },
  selectedWarehouseTypeButtonTitle:{
    fontSize: 18,
    ...Specs.fontBold,
    alignSelf: 'center',
    color:'#3054C4',
    justifyContent: 'center',
    textAlign: 'center'
  },
  warehouseType:{
    marginHorizontal: 15,
    marginVertical: 15,
    padding:5,
    borderWidth:1,
    borderColor: '#001A2370',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  warehouseTypeButtonTitle:{
    fontSize: 18,
    ...Specs.fontBold,
    alignSelf: 'center',
    color:'#001A2370',
    justifyContent: 'center',
    textAlign: 'center'
  },
});


