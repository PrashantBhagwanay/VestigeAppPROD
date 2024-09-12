import React,{ Component } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Text, ScrollView } from 'react-native';
import { observer, inject } from 'mobx-react';
import { observable, makeObservable } from 'mobx';
import { Specs } from 'app/src/utility/Theme';
import Loader from 'app/src/components/loader/Loader';
import { VESTIGE_IMAGE, UserRole, SIGNUP_ROUTE, DISTRIBUTOR_TYPE_ENUM } from 'app/src/utility/constant/Constants';
import autobind from 'autobind-decorator';    
import PlaceHolder from 'app/src/components/Placeholder';
import { strings } from 'app/src/utility/localization/Localized';
import { CustomButton, RadioButton } from 'app/src/components/buttons/Button';
import { showToast, connectedToInternet, commaSeperateAmount } from 'app/src/utility/Utility';
import CustomInput from 'app/src/components/CustomInput';
import OfflineNotice from 'app/src/components/OfflineNotice';
import { Icon } from 'react-native-elements';
import Banner from 'app/src/screens/Dashboard/Banner';
import AlertClass from 'app/src/utility/AlertClass';
import HeaderLeftIcons from 'app/src/components/navigation/HeaderLeftIcons';
import { Header } from '../../components';

const DISTRIBUTOR_DATA = [{
  fieldName: 'distributorId',
  placeholder: strings.daf.distributorId,
  icon: VESTIGE_IMAGE.PROFILE_ICON,
  maxLength: 8,
},{
  fieldName: 'distributorName',
  placeholder: strings.daf.distributorName,
  icon: VESTIGE_IMAGE.PROFILE_ICON,
  maxLength: 35,
}];
const PSEPRATOR_IMAGE = require('app/src/assets/images/DashBoardHeader/seprator.png');


@inject('cart', 'profile', 'auth', 'dashboard')
@observer
export default class ShoppingOption extends Component {

  @observable isValidDistributerId = true;
  @observable isFormFilled = false;
  @observable isInternetConnected: Boolean = true;

  constructor(props) {
    super(props);
    makeObservable(this);
    this.downlineOrOthersText = this.props.auth.distributorType === DISTRIBUTOR_TYPE_ENUM.miniDLCP ? 'Others' : 'Downline'; // As per mini DLCP requirement
    this.state = {
      // selectedLabel: 'Self',
      selectedLabel: this.props.cart.shopForObjectInfo.cartTitle == 'Your Cart' ? 'Self' : this.downlineOrOthersText,
      images: [],
      distributorId: this.props.auth.distributorID,
      distributorName: this.props.auth.username,
    };
  }

  @autobind
  async networkStatus(status) {
    if (status) {
      this.isInternetConnected = status;
      // this.props.dashboard.fetchDashboardShoppingData()
      this.getComponentDidMountData();
    }
  }

  getComponentDidMountData = () => {
    if (this.props.route.params && this.props.route.params.defaultShoppingMode) {
      this.props.cart.updateShopForObject('Self', this.props.auth.distributorID.toString(), 'SELF');
      // this.props.dashboard.fetchDashboardShoppingData()
    }
    const { cartTitle, distributorID } = this.props.cart.shopForObjectInfo;
    this.setState({
      selectedLabel: cartTitle == 'Your Cart' ? 'Self' : this.downlineOrOthersText,
      distributorId: cartTitle == 'Your Cart' ? this.props.auth.distributorID : distributorID,
      distributorName: cartTitle == 'Your Cart' ? this.props.auth.username : cartTitle,
    });
  }

  createShoppingCart = async (selectedDownline) => {
    const { cart, auth } = this.props;
    const createCart = {
      distributorId: selectedDownline.downlineId,
      cartName: `${selectedDownline.firstName} ${selectedDownline.lastName}`,
      createdBy: auth.distributorID,
      uplineId: auth.distributorID,
      updatedBy: auth.distributorID,
    };
    const responseMessage = await cart.createCart(createCart);
    if (!responseMessage) {
      this.props.cart.updateShopForObject(createCart.cartName, createCart.distributorId.toString(), 'DOWNLINE');
      return { success: true };
    }
    return { success: false, message: responseMessage };
  }

  async componentDidMount() {
    this.isInternetConnected = await connectedToInternet();
    if (this.isInternetConnected) {
      this.getComponentDidMountData();
    }
    this.props.auth.setNavigation(this.props.navigation);
  }

  async getLastTenOrders() {
    await this.props.cart.fetchOrdersList();
    const { getLastTenOrders } = this.props.cart;
    if (getLastTenOrders && getLastTenOrders.length) {
      this.navigateToAddressListing('repeatOrder');
    }
    else {
      AlertClass.showAlert('Message',
        'No Order Placed till yet.',
        [{ text: strings.viewCartScreen.alertButtonTextOk, onPress: () => console.log('OK Pressed') }]);
    }
  }


  navigateToAddressListing = (buttonPressed) => {
    const defaultShoppingMode = this.props.route.params && this.props.route.params.defaultShoppingMode
    // eslint-disable-next-line object-shorthand
    this.props.navigation.navigate('selectLocation', { buttonPressed, defaultShoppingMode })
  }

  onPressContinueShopping = async (buttonPressed) => {
    if (this.state.selectedLabel === 'Self') {
      this.props.cart.updateShopForObject('Self', this.props.auth.distributorID.toString(), 'SELF');
      if (buttonPressed === 'repeatOrder') {
        this.getLastTenOrders();
      }
      else {
        this.navigateToAddressListing('shopping');
      }
    }
    else if (this.state.distributorId.trim().length === 8 && this.state.distributorName.trim()) {
      const res = await this.createShoppingCart(this.props.cart.validatedDownline);
      if (res.success) {
        if (buttonPressed === 'repeatOrder') {
          this.getLastTenOrders();
        }
        else if (this.props.auth.distributorType === DISTRIBUTOR_TYPE_ENUM.miniDLCP) {
          this.props.navigation.navigate('selectMiUserAddress', { backScreenCount: 2 });
        }
        else {
          this.navigateToAddressListing('shopping');
        }
      }
      else {
        showToast(res.message);
      }
    }
    else {
      AlertClass.showAlert('Message', 'Please enter a valid downline distributor ID to continue shopping for downline.', [{text: 'OK', onPress: () => console.log('OK Pressed') }])
    }
    this.props.cart.fetchCart();
  }

  renderListFooter = () => {
    if (this.props.profile.countryId != 2) {
      return (
        <View style={{ backgroundColor: '#fff' }}>
          <View style={{ paddingBottom: 5, paddingTop: 10, flexDirection: 'row', backgroundColor: '#fff', justifyContent: 'space-evenly' , alignItems: 'center' }}>
            {(this.props.profile.defaultAddressCountryId == 4 || this.props.profile.defaultAddressCountryId == 25) ? null :
            <TouchableOpacity
              style={[styles.buttonContainer, { backgroundColor: '#6598d3' }]}
              onPress={() => this.onPressContinueShopping('repeatOrder')}
            >
              <Text style={styles.buttonText}>Repeat Order</Text>
            </TouchableOpacity>
            }
            <TouchableOpacity
              style={[styles.buttonContainer, { backgroundColor: '#58cdb4' }]}
              onPress={() => this.onPressContinueShopping('continueShopping')}
            >
              <Text style={styles.buttonText}>Continue Shopping</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    return null;
  }

  isEditable = (item) => {
    const { selectedLabel } = this.state;
    const isDisabled = ((selectedLabel === 'Self') && ['distributorId', 'distributorName'].includes(item.fieldName)) || (item.fieldName === 'distributorName');
    return !isDisabled;
  }

  onChangeText = async (item, value) => {
    this.setState({ [item.fieldName]: value });
    if (item.fieldName === 'distributorId' && value.length == 8) {
      this.isValidDistributerId = false;
      // await this.props.cart.validateDownline(value, undefined, true);
      let res;
      if (this.props.auth.distributorType === DISTRIBUTOR_TYPE_ENUM.miniDLCP) {
        res = await this.props.cart.validateOtherUser(value, undefined, true);
      }
      else {
        res = await this.props.cart.validateUser(value, undefined, true);
      }
      if (Object.keys(this.props.cart.validatedDownline).length > 1) {
        this.isValidDistributerId = true;
        const distName = `${this.props.cart.validatedDownline.firstName} ${this.props.cart.validatedDownline.lastName}`
        this.setState({
          distributorName: distName,
        });
      }
      else {
        this.setState({
          distributorName: '',
        })
        const errorMessage = res?.message ? res.message : strings.daf.invalidDistributorId;
        showToast(errorMessage);
      }
    }
  }

  renderItem = (item) => {
    return (
      <View style={styles.inputItem}>
        <CustomInput
          placeholder={item.placeholder}
          icon={item.icon}
          marginHorizontal={17}
          editable={this.isEditable(item)}
          value={this.state[item.fieldName]}
          onChangeText={(value) => this.onChangeText(item, value)}
          keyboardType={item.fieldName === 'distributorId' ? 'numeric' : 'default'}
          maxLength={item.maxLength}
          numberOfLines={1}
        />
      </View>
    );
  }

  // getAddressTypeString = (address) => {
  //   const addressTypeValue = address.addressType === 'Shipping' ? '(HOME DELIVERY)' : '(STORE PICK-UP)'
  //   return addressTypeValue
  // }

  // renderHomeDeliveryAddressFormat = (item) => {
  //   return(
  //     <Text 
  //       numberOfLines={5} 
  //       style={styles.addressTextStyle}
  //     >
  //       {`${item.address}, ${item.city}, ${item.state}, ${item.country}, ${item.pincode}`}
  //       { item.alternateContactNumber &&  <Text style={{ fontSize: 12,  ...Specs.fontRegular, color: '#3f4967'}}>{`\n Mobile No.-${item.alternateContactNumber}`}</Text> }
  //     </Text>
  //   )
  // }

  // renderStorePickupAddressFormat = (item) => {
  //   return(
  //     <View>
  //       <Text style={styles.storeLocationNameTextStyle}>{item.locationName}</Text>
  //       <Text style={[styles.storeLocationTimeingsDistanceTextStyle,{ marginTop: 7, marginBottom: 3 }]}>{`${strings.locationScreen.timingsKey}${item.timings}`}</Text>
  //       {item.distance && (
  //         <Text style={styles.storeLocationTimeingsDistanceTextStyle}>{`${strings.locationScreen.distanceKey}${item.distance}`}</Text>
  //       )}
  //     </View>
  //   )
  // }

  // renderDefaultAddress = (address) => {
  //   if(address && address.id) {
  //     return (
  //       <View style={{ backgroundColor: '#FFF', marginTop: 10, paddingHorizontal: 5, paddingBottom: 10 }}>
  //         <Text style={styles.recentAddressStyle} opacity={0.5}>
  //           {  strings.locationScreen.defaultShippingAddressTitle + this.getAddressTypeString(address) }
  //         </Text>
  //         <View style={{ paddingLeft: 17, flexDirection: 'row', justifyContent: 'space-between' }}>
  //           { address.addressType === 'Shipping' ? this.renderHomeDeliveryAddressFormat(address) : this.renderStorePickupAddressFormat(address) }
  //         </View>
  //       </View>
  //     )
  //   }
  //   return null
  // }

  onSignUpPress = () => {
    this.props.auth.setSignupRoutePath(SIGNUP_ROUTE.DASHBOARD_ROUTE);
    this.props.navigation.navigate('downlineRegistration');
  }


  render() {
    const { selectedLabel } = this.state;
    const { distributorID, username } = this.props.auth;
    const { selfPointValue, groupPointValue, currentPosition } = this.props.profile;
    return (
      <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps='handled'>
        { !this.isInternetConnected && <OfflineNotice networkStatus={(status) => this.networkStatus(status)} /> }
        <Loader loading={this.props.cart.isLoading || this.props.profile.isLoading || this.props.dashboard.isLoading} />
        <Header
          navigation={this.props.navigation}
          screenTitle={'Shopping'}
        />
        <View style={{ backgroundColor: '#fff' }}>
          <Text style={{...Specs.fontMedium, fontSize: 14, color: '#373e73', marginLeft: 18, marginTop: 10}}>Shop For</Text>
        </View>
        <View style={styles.radioButtonView}>
          <RadioButton
            buttonText='Self'
            onPress={() => {
              if (this.state.selectedLabel !== 'Self') {
                this.setState({ selectedLabel: 'Self', distributorId: distributorID, distributorName: username})
              }
            }}
            selectedValue={selectedLabel}
          />
          <RadioButton
            buttonText={this.downlineOrOthersText}
            onPress={() => {
              if (this.state.selectedLabel !== this.downlineOrOthersText) {
                this.setState({ selectedLabel: this.downlineOrOthersText, distributorId: '', distributorName: '' });
              }
            }}
            selectedValue={selectedLabel}
          />
        </View>
        <FlatList
          contentContainerStyle={{ paddingBottom: 20, backgroundColor: '#FFF' }}
          data={DISTRIBUTOR_DATA}
          extraData={this.props.profile.activeAddress}
          keyboardShouldPersistTaps='handled'
          renderItem={({item}) => this.renderItem(item)}
          keyExtractor={(item, index) => index.toString()}
          // ListFooterComponent={()=> this.renderListFooter()}
        />
        { this.renderListFooter() }
        <View style={styles.textView}>
          <PlaceHolder autoRun height={30} style={{marginBottom:4}} visible={!!username}>
            <Text style={styles.nameText}>{username}</Text>
          </PlaceHolder>
          <PlaceHolder autoRun visible={!!distributorID}>
            <Text style={[styles.currentPositionText, { marginBottom: 5, ...Specs.fontMedium } ]}>{`(${distributorID})`}</Text>
          </PlaceHolder>
          <PlaceHolder autoRun visible={!!currentPosition}>
            <Text style={styles.currentPositionText}>{currentPosition}</Text>
          </PlaceHolder>
        </View>
        {this.props.auth.userRole !== UserRole.Trainer && (
          <View style={{ flexDirection: 'column', flex: 1, backgroundColor: '#fff', paddingBottom: 8}}>
            <View style={styles.groupNetwork}>
              <View style={styles.group}>
                <View style={styles.groupInner}>
                  <TouchableOpacity>
                    <Text style={[styles.myPVText, styles.headingText]}>{strings.userProfileComponent.myPv}</Text>
                    <PlaceHolder autoRun width={100} height={20} visible={!!selfPointValue}>
                      <Text numberOfLines={1} style={[styles.myPVValuText, styles.valueText]}>{commaSeperateAmount(selfPointValue)}</Text>
                    </PlaceHolder>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.seprator}>
                <Banner styles={{height: 50}} source={PSEPRATOR_IMAGE} />
              </View>
              <View style={styles.network}>
                <View style={styles.groupInner}>
                  <TouchableOpacity>
                    <Text style={[styles.groupPVText, styles.headingText]}>{strings.userProfileComponent.groupPv}</Text>
                    <PlaceHolder autoRun width={100} height={20} visible={!!groupPointValue}>
                      <Text numberOfLines={1} style={[styles.groupPVValueText, styles.valueText]}>{commaSeperateAmount(groupPointValue)}</Text>
                    </PlaceHolder>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            {this.props.profile.countryId != 2 &&
              <TouchableOpacity
                style={[styles.buttonContainerSignup, { backgroundColor: '#58cdb4' }]}
                onPress={() => this.onSignUpPress()}
              >
                <Text style={styles.buttonText}>Add New Distributor</Text> 
              </TouchableOpacity>
          }
          </View>
        )}
        {/* <TouchableOpacity
          style={[styles.buttonContainerSignup, { backgroundColor: '#58cdb4' }]}
          onPress={() => this.onSignUpPress() }
        >
          <Text style={styles.buttonText}>Add New Distributor</Text>
        </TouchableOpacity> */}
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  headerTitle: {
    ...Specs.fontBold,
    fontSize:18,
    color: '#373e73',
  },
  radioButtonView:{
    flexDirection:'row',
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom:7,
    backgroundColor:'#FFF',
  },
  buttonContainerSignup : {
    marginTop: 30,
    marginHorizontal: 20,
    paddingVertical: 11, 
    paddingHorizontal: 48, 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderRadius: 30
  },
  recentAddressStyle:{
    color: '#3f4967', 
    fontSize: 12, 
    marginTop: 10,
    ...Specs.fontBold,
    marginBottom: 10, 
    marginLeft: 17
  },
  addressTextStyle:{
    fontSize: 14, 
    ...Specs.fontBold,  
    color: '#3f4967',
    width: '90%'
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
  buttonContainer : {
    // paddingVertical: 11, 
    // paddingHorizontal: 15, 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderRadius: 30,
    flex: 1,
    marginHorizontal: 8,
    width: '43%',
    height: 40
  },
  buttonText: {
    ...Specs.fontMedium,
    color: 'white', 
    fontSize: 14,
    // borderWidth: 1,
    // width: '100%',
    textAlign: 'center'
  },
  groupNetwork: {
    width: '100%',
    marginTop: 20,
    paddingTop: 10,
    paddingBottom: 5,
    // height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    // backgroundColor: '#fff'
  },
  group: {
    height: '100%',
    width: 150
  },
  seprator: {
    height: 50,
    backgroundColor: 'white',
  },
  network: {
    height: '100%',
    width: 150
  },
  groupInner: {
    flex: 1,
    alignSelf: 'center',
  },
  headingText: {
    ...Specs.fontRegular,
    marginBottom: 6,
    fontSize: 12,
    textAlign: 'center',
  },
  valueText: {
    ...Specs.fontMedium,
    fontSize: 18,
    textAlign: 'center',
  },
  myPVText: {
    color: '#2b55a4',
  },
  myPVValuText: {
    color: '#5988e0',
  },
  groupPVText: {
    color: '#156d5b',
  },
  groupPVValueText: {
    color: '#37bea1',
  },
  inputItem: {
    paddingBottom: 22, 
    paddingTop: 10
  },
  getDetails: {
    flexDirection: 'row', 
    marginRight: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#58cdb4',
    width: 100,
    alignSelf: 'flex-end',
    borderRadius: 30,
  },
  textView: {
    flex: 1,
    marginTop: 15,
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  currentPositionText: {
    ...Specs.fontSemibold,
    fontSize: 12,
    textAlign: 'center',
    color: '#474b60',
  },
  nameText: {
    ...Specs.fontSemibold,
    fontSize: 16,
    color: '#414456', 
    marginTop: 7,
  },
  changeAddressStyles: {
    textAlign: 'center',
    fontSize: 14,
    textDecorationLine: 'underline',
    marginRight: 8,
    alignSelf: 'flex-end'
  }
});