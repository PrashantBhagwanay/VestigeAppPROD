/**
 * @description View Cart Screen
*/

import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  Modal,
  Dimensions,
  Platform,
} from 'react-native';
import { inject, observer } from 'mobx-react';
import { _ } from 'lodash';
import DeviceInfo from 'react-native-device-info';
import AlertClass from 'app/src/utility/AlertClass';
import { action, observable } from 'mobx';
import { CustomButton, CustomRadioButton } from 'app/src/components/buttons/Button';
import { Specs } from 'app/src/utility/Theme';
import CartListComponent from 'app/src/components/cartComponent/CartListComponent';
import autobind from 'autobind-decorator';
// import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
// import FontAwesome from 'react-native-vector-icons/FontAwesome';
import * as Permissions from '../../utility/permissions/Permissions';
import Geolocation from '@react-native-community/geolocation';
import { Toast } from 'app/src/components/toast/Toast';
import OrderModel from 'app/src/stores/models/OrderModel';
import Loader from 'app/src/components/loader/Loader';
import {
  UserRole,
  SHIPPING_TYPE,
  SHIPPING_TYPE_ID,
  LOCATION_ROUTE_PATH,
} from 'app/src/utility/constant/Constants';
import { trackEvent } from 'app/src/utility/AnalyticsUtils';
import { MYCART_TAB_PRESS } from 'app/src/utility/GAEventConstants';
import { strings } from 'app/src/utility/localization/Localized';
import OfflineNotice from 'app/src/components/OfflineNotice';
import CateringLocation from 'app/src/components/cateringLocation/CateringLocation';

// Navigation Icons
import HeaderLeftIcons from 'app/src/components/navigation/HeaderLeftIcons';
import { Header } from '../../components';
import {
  promptToOpenSettings,
  priceWithCurrency,
  connectedToInternet,
  isIphoneXorAbove,
  capitalizeFirstCharacter,
  isNullOrEmpty,
} from '../../utility/Utility';

@inject('cart', 'profile', 'products', 'checkout', 'location', 'auth', 'appConfiguration')
@observer
export default class CartReview extends Component {

  constructor(props) {
    super(props);
    // trackEvent(MYCART_TAB_PRESS.eventCategory, MYCART_TAB_PRESS.events.NAVIGATE);
    // this.didBlurListener = props.navigation.addListener(
    //   'didBlur', () => {
    //     this.props.cart.refreshCartInfo = []
    //   });
    this.state = {
      modalVisible: false,
      selectedCheckBox: [],
      isCncModalVisible: false,
      cncInfoList: [],
      orders: {},
      isLoading: false,
      cartIndex: null,
      cancellationAndReturnPolicyFetchFailed: undefined,
      latitude: 0.0,
      longitude: 0.0,
    };
    this.ticketEventId = this.props.route?.params?.ticketEventId;
    this.isInternetConnected = true;
  }

  async componentDidMount() {
    this.isInternetConnected = await connectedToInternet();
    const { profile } = this.props;
    if (this.isInternetConnected) {
      // await this.props.cart.fetchCartData(true);
      await this.props.cart.fetchPromoData(this.props.route.params.index);
      if (!profile.isMiUserShoppingForOthers && profile.activeAddress.addressType === 'Shipping') {
        this.props.cart.refreshCartInfo.forEach((item, index) => {
          this.updatePaymentMethod(index, 'Online');
        });
      }
      else if (profile.isMiUserShoppingForOthers && !profile.isMiUserOnlineShoppingActive) {
        this.props.cart.refreshCartInfo.forEach((item, index) => {
          this.updatePaymentMethod(index, 'Cash');
        });
      }
      else if (this.props.profile.activeAddress.isOnlinePayment) {
        this.props.cart.refreshCartInfo.forEach((item, index) => {
          this.updatePaymentMethod(index, 'Online');
        });
      }
      this.props.cart.isBonusVoucherPvBvZero = '0';
      this.props.cart.setIsCncVoucherApplied('0');
      this.props.cart.setIsCncVoucherApplied('0');
      
      this.props.cart.isShowMoqStrip = false;
      await this.getGeoLocation();
      // this.props.cart.updateCartInfo();
    }
    // this.getDeliveryInfo()
    // this.willFocusListener = this.props.navigation.addListener('willFocus', async(isFocused) => {
    //   // if(isFocused.action.type !== 'Navigation/BACK') {
    //   //   await this.props.cart.fetchCartData(true);
    //   // }
    //   // this.getDeliveryInfo()
    //   // this.props.cart.updateCartInfo();  
    // });
  }

  async getGeoLocation() {
    const permissionType = Platform.OS === 'android' ? Permissions.PERMISSION_TYPES.android.LOCATION : Permissions.PERMISSION_TYPES.ios.LOCATION;
    const response = await Permissions.requestPermission(permissionType);
    if (response === Permissions.StatusEnum.GRANTED) {
      Geolocation.getCurrentPosition(
        async (position) => {
          console.log('checkposition', position);
          this.setState({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          })
        },
        (e) => {
          // this.showToast(strings.errorMessage.location.enableLocation,Toast.type.ERROR)
        },
      );
    } else if (response === Permissions.StatusEnum.BLOCKED) {
      promptToOpenSettings(
        strings.errorMessage.location.locationPermission1,
        strings.errorMessage.location.locationPermission2,
      );
    } else {
      this.setState({
        latitude: 0.0,
        longitude: 0.0,
      })
    }
  }

  getDeliveryInfo = async () => {
    const response = await this.props.cart.cancellationAndReturnPolicyInfo()
    this.setState({ cancellationAndReturnPolicyFetchFailed: response.status })
  }

  componentWillUnmount() {
    this.didBlurListener && this.didBlurListener.remove();
    this.willFocusListener && this.willFocusListener.remove();
  }

  cncOrderEligblityConditionCheck = (index) => {
    let cncEligblityPv = 0;
    const cartList = index !== undefined ? [this.props.cart.cartInfo[index]] : this.props.cart.cartInfo;
    // console.log(cartList);
    const cncMessageList = cartList.map((cart) => {
      // console.log(cart)
      let isCncAlertDisplay = 0;
      if (cart.totalPVPoint >= 90 && cart.totalPVPoint < 100) {
        cncEligblityPv = (100 - cart.totalPVPoint).toFixed(2);
        if (cart.promotions.isFirstOrderTaken == 0) {
          isCncAlertDisplay = 1;
        }
        else {
          const cncStartDate = 1;
          const cncEndDate = 15;
          const currentDate = new Date().getDate();
          //  Repurchase order check will be 2 to 14 of every month;
          if (currentDate > cncStartDate && currentDate < cncEndDate) {
            isCncAlertDisplay = 1;
          }
        }
      }
      // eslint-disable-next-line object-shorthand
      return {
        isCncAlertDisplay,
        cartTitle: cart.cartDistributorId == this.props.auth.distributorID ? this.props.profile.username : cart.cartTitle,
        ...(isCncAlertDisplay && { message: `${strings.viewCartScreen.cncInfoInitialMessage}${cart.totalPVPoint.toFixed(2)} ${strings.viewCartScreen.cncInfoMiddleMessage} ${cncEligblityPv} ${strings.viewCartScreen.cncInfoLastMessage}` }),
      };
    });
    return cncMessageList;
  }

  checkout = async (index) => {
    const { profile, auth } = this.props;
    const { isApiV2Enabled } = this.props.appConfiguration;
    const { appliedBonusVoucher, bonusVoucherInfo } = this.props.cart.refreshCartInfo[0];
    this.props.cart.cartVouchers.map((data, dataIndex) => {
      this.props.cart.setCartInfo(dataIndex, data);
    });
    this.isInternetConnected = await connectedToInternet();
    if (this.isInternetConnected) {
      const _orderInfo = index !== undefined ? [this.props.cart.cartInfo[index]] : this.props.cart.cartInfo
      let skipPromotionsInDubai = undefined;
      if (this.props.profile.defaultAddressCountryId == 4 && _orderInfo.length && _orderInfo[0]?.appliedBonusVoucher.length) {
        skipPromotionsInDubai = appliedBonusVoucher.some(item => item.search('CNC') != -1 || item.search('CSY') != -1)
      }
      console.log('skipPromotionsInDubai>>>>>>>>>', skipPromotionsInDubai)
      const orders = new OrderModel(index !== undefined ? [this.props.cart.cartInfo[index]] : this.props.cart.cartInfo, true, skipPromotionsInDubai);

      console.log('Cart Index value', JSON.stringify(orders))

      // if(skipPromotionsInDubai == undefined || skipPromotionsInDubai == false) {
      if (orders.error) {
        setTimeout(() => {
          AlertClass.showAlert('', orders.error);
          // this.showToast(orders.error, Toast.type.ERROR)
        }, 200);
        return;
      }
      if (this.props.profile.activeAddress.pincode === 'Pincode not found') {
        AlertClass.showAlert('',
          `${strings.viewCartScreen.noAddressSelectedForCheckout}`,
          [
            { text: 'Cancel', onPress: () => console.log('OK Pressed') },
            {
              text: 'Ok', onPress: () => {
                this.props.location.setLocationRoutePath(LOCATION_ROUTE_PATH.back)
                this.props.navigation.navigate('selectLocation')
              }
            }
          ])
        return;
      }

      if (orders.orders.length > 0) {
        // orders.distributorId = this.props.profile.distributorID;
        orders.distributorId = auth.distributorID;
        orders.deviceId = this.deviceId;
        if (!profile.activeAddress) {
          setTimeout(() => { this.showToast(strings.cartListProduct.productBeforeCheckout, Toast.type.ERROR) }, 200)
          return
        }
        orders.deliveryType = profile.activeAddress.addressType;
        orders.isWarehouse = profile.isWarehouseShipping === '1' ? 1 : 0;
        orders.shippingType = profile.defaultShippingType === SHIPPING_TYPE.expressDelivery
          ? SHIPPING_TYPE_ID.expressDelivery
          : SHIPPING_TYPE_ID.regularDelivery;
        if (profile.fetchIsWarehouseShipping == '1' && profile.fetchWarehouseDeliveryType == '2') {
          orders.isDeliverToStore = profile.fetchWarehouseDeliveryType;
          orders.destinationStore = isApiV2Enabled ? profile.fetchRegularCatering.locationCode : profile.fetchRegularCatering.locationId;
        }
        else {
          orders.isDeliverToStore = profile.fetchWarehouseDeliveryType;
          orders.destinationStore = '';
        }
        orders.latitude = this.state.latitude;
        orders.longitude = this.state.longitude;
        if (profile.activeAddress.addressType === 'StorePickup') {
          orders.storesDTO = profile.activeAddress;
        }
        else {
          const homeDelivery = {
            ...profile.activeAddress,
            address1: profile.activeAddress.address,
            address2: "", // V2 API fix, will be static
            // distributorId: this.props.profile.distributorID,
            distributorId: auth.distributorID,
            pincode: {
              pincode: profile.activeAddress.pincode,
            },
          };
          // This key will be used in case of ticket purchase, value will be added in later methods.
          orders.ticketEventId = this.ticketEventId || '';

          // as per client requirement for maintaining version in order
          orders.appVersion = DeviceInfo.getVersion();

          orders.distributorAddressDTO = homeDelivery;

          /* ...................... we are using field from default caterDTO. ........... */
          orders.distributorAddressDTO.locationCode = profile.defaultCater?.locationCode;
          orders.distributorAddressDTO.locationId = profile.defaultCater?.locationId;
          orders.distributorAddressDTO.locationName = profile.defaultCater?.locationName;
        }
        // this.confirmCheckout(index, orders);
        // console.log('rescart', this.props.cart)
        // console.log('resorder', orders)
        if (!isNullOrEmpty(appliedBonusVoucher) && bonusVoucherInfo && bonusVoucherInfo.isCncVoucher == '1') {
          this.renderCncAlert(orders, bonusVoucherInfo);
        }
        else {
          this.handleOrderCourierWarning(orders);
        }
      }
      else {
        this.showToast(strings.cartListProduct.emptyCart, Toast.type.ERROR);
      }
    }
  }

  showCncPopup = async (orders, index) => {
    const cncMessageInfoList = this.cncOrderEligblityConditionCheck(index);
    const showCnc = cncMessageInfoList.some(item => item.isCncAlertDisplay == 1);
    if (showCnc) {
      this.setState({
        isCncModalVisible: showCnc,
        cncInfoList: cncMessageInfoList,
        orders: orders,
      });
    }
    else {
      const { isMiUserShoppingForOthers } = this.props.profile;
      const message = await this.props.checkout.createOrder(orders);
      if (isNullOrEmpty(message)) {
        this.props.navigation.navigate('cartCheckout', { isNavigateToMakePayment: isMiUserShoppingForOthers });
      }
      else {
        setTimeout(() => {
          AlertClass.showAlert('', message);
        }, 200);
        // this.showToast(message, Toast.type.ERROR);
      }
    }
  }

  handleAddressFormat = () => {
    const { activeAddress } = this.props.profile || {};
    if (activeAddress.addressType === 'Shipping') {
      const { fetchIsWarehouseShipping, fetchWarehouseDeliveryType, fetchRegularCatering } = this.props.profile;
      if (fetchIsWarehouseShipping == '1' && fetchWarehouseDeliveryType == '2') {
        return `Pick-up Store Address: ${fetchRegularCatering.locationName} - ${fetchRegularCatering.locationCode}`
      }
      return `Delivery Address: ${this.addressFormat(activeAddress)}`;
    }
    return `Store Address: ${this.addressFormat(activeAddress)}`;
  }

  verifyAddress = (orders, index) => {
    AlertClass.showAlert(strings.viewCartScreen.addressConfirmationTitle,
      `${strings.viewCartScreen.confirmAddressMessage}
      \n${this.handleAddressFormat()}`,
      [
        { text: 'Cancel', onPress: () => console.log('OK Pressed') },
        { text: 'Confirm', onPress: () => this.showCncPopup(orders, index) },
      ]);
  }

  /** @description This will check if their is any alert to be shown to user before proceed for order */
  handleOrderCourierWarning = (orders) => {
    const { courierWarningPrice, courierWarningMessage } = this.props.checkout;
    if (
      !isNullOrEmpty(courierWarningMessage) && !isNullOrEmpty(courierWarningPrice)
      && Number(courierWarningPrice) > orders?.orders[0]?.orderAmount
    ) {
      AlertClass.showAlert('Warning',
        courierWarningMessage,
        [
          { text: 'Cancel', onPress: () => console.log('cancel Pressed') },
          { text: 'Confirm', onPress: () => this.createOrder(orders) },
        ]);
    }
    else {
      this.createOrder(orders);
    }
  }

  /** @description Final method for proceed for order after all validation check */
  createOrder = _.debounce(async (orders) => {
    const message = await this.props.checkout.createOrder(orders);
    if (isNullOrEmpty(message)) {
      const { isMiUserShoppingForOthers } = this.props.profile;
      this.props.checkout.setCourierWarningMessage('');
      this.props.checkout.setCourierWarningPrice('');
      this.props.navigation.navigate('cartCheckout', { isNavigateToMakePayment: isMiUserShoppingForOthers });
    }
    else {
      // this.showToast(message, Toast.type.ERROR);
      setTimeout(() => {
        AlertClass.showAlert('', message);
      }, 200);
    }
  }, 1000, { leading: true, trailing: false })

  confirmCheckout = async (index, orders) => {
    const { noInventoryProducts, cartInfo, responseSkuCodes, skuCodes } = this.props.cart || {};
    this.setState({ isLoading: true });
    const response = skuCodes.length > 0 && await this.props.cart.checkInventory(this.props.cart.skuCodes, true);
    this.setState({ isLoading: false });
    let isQuantityGreaterOrNoInventory = false;
    // console.log(response, index);
    if (response) {
      if (index === undefined) {
        if (noInventoryProducts?.length) {
          AlertClass.showAlert(strings.viewCartScreen.inventoryMessageTitle,
            this.props.cart.getInventoryMessage,
            [{ text: strings.viewCartScreen.alertButtonTextOk, onPress: () => console.log('OK Pressed') }]);
        }
        else {
          // AlertClass.showAlert(strings.viewCartScreen.inventoryMessageTitle, 
          //   strings.viewCartScreen.inStockAvailableProducts, [   
          //     {text: strings.viewCartScreen.alertButtonTextReviewCart, onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
          //     {text: strings.viewCartScreen.alertButtonTextConfirm, onPress: async() => {
          //       // this.verifyAddress(orders, index)
          //       this.handleOrderCourierWarning(orders)
          //     }}
          //   ]);
          this.handleOrderCourierWarning(orders);
        }
      }
      else {
        if (cartInfo) {
          cartInfo[index].cartProducts.forEach((cartProduct) => {
            const checkIndex = responseSkuCodes?.findIndex(x => x.itemCode === cartProduct.skuCode);
            if (checkIndex === -1 || cartProduct.quantity > responseSkuCodes[checkIndex].availableQuantity) {
              isQuantityGreaterOrNoInventory = true;
              AlertClass.showAlert(strings.viewCartScreen.inventoryMessageTitle,
                this.props.cart.getInventoryMessage,
                [{ text: strings.viewCartScreen.alertButtonTextOk, onPress: () => console.log('OK Pressed') }]);
            }
          });
        }
        if (!isQuantityGreaterOrNoInventory) {
          // AlertClass.showAlert(strings.viewCartScreen.inventoryMessageTitle,
          //   strings.viewCartScreen.inStockAvailableProducts, [
          //     {text: strings.viewCartScreen.alertButtonTextReviewCart, onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
          //     {text: strings.viewCartScreen.alertButtonTextConfirm,  onPress: async() => {
          //       this.handleOrderCourierWarning(orders)
          //     }}
          //   ]);
          this.handleOrderCourierWarning(orders);
        }
      }
    }
    else {
      AlertClass.showAlert(strings.viewCartScreen.inventoryMessageTitle,
        strings.viewCartScreen.inventoryIsNotAvailableRightNow,
        [{ text: strings.viewCartScreen.alertButtonTextOk, onPress: () => console.log('OK Pressed') }]
      )
    }
  }

  /**
   * @function open a modal from downward for all available cart
   * @param {*} visible
   */
  openBuyingPreference = () => {
    this.setState({
      modalVisible: true,
    });
  }

  /**
   * @funct ion open the open buying preference modal
   * @param {*} visible
   */
  openBuyingPreferenceVisible = (visible) => {
    this.setState({ modalVisible: visible });
  }

  /**
   * @function pop to the previous screen or anywhere you want to go
   * @param {*} visible
   */
  goBackToParentScreen = () => {
    const { navigation } = this.props;
    const { goBack } = navigation;
    goBack();
  }

  /**
   * @function navigate to the createCartForDownline screen where the downline cart create
   * @param {*} visible
   */
  createCartForDownline = () => {
    const { navigation } = this.props;
    const { modalVisible } = this.state;
    navigation.navigate('createCartDownlineList');
    this.openBuyingPreferenceVisible(!modalVisible);
  }

  /**
   * @function confirmBuyer and open cart according to buyer
   * @param {*} visible
   */
  confirmBuyerCart = (buyer) => {
    const { selectedCheckBox } = this.state;
    this.setState({
      confirmBuyer: true,
      selectedCheckBox: [...selectedCheckBox, buyer],
    });
  }

  setConfirmBuyer = (buyer) => {
    const { selectedCheckBox } = this.state;
    const selectedCheckBoxBackup = [...selectedCheckBox];
    const removeBuyer = selectedCheckBox.indexOf(buyer);
    selectedCheckBoxBackup.splice(removeBuyer, 1);
    this.setState({
      confirmBuyer: buyer,
      selectedCheckBox: selectedCheckBoxBackup,
    });
  }

  @autobind
  showToast(message: string, type: Toast.type) {
    // Add a Toast on screen.
    Toast.show(message, {
      duration: Toast.durations.SHORT,
      type: type,
      shadow: false,
      animation: true,
      hideOnPress: true,
      delay: 0,
    });
  }

  @autobind
  async applyCoupon(item, index) {
    const { navigation } = this.props;
    navigation.navigate('cartVouchersScreen', { cart: item, index: index });
  }

  @autobind
  async networkStatus(status) {
    if (status) {
      this.isInternetConnected = status;
    }
  }

  updatePaymentMethod = (index, paymentType) => {
    console.log('paymentType--------------', paymentType);
    this.props.cart.modifyCartInfo('PAYMENTTYPE', index, paymentType)
  }


  @autobind
  renderItem(item, index) {
    const { navigation } = this.props;
    // console.log('showInfo',item)
    if (!this.props.cart.cartVouchers[index]) {
      this.props.cart.modifyCartInfo('INIT', index);
    }
    return (
      <View>
        {index == 0 ? <Text style={{ ...styles.headingStyle, paddingTop: 32 }}>{`Total Number of Orders (${this.props.cart.refreshCartInfo.length})`}</Text> : null}
        <CartListComponent
          userCart={item}
          index={index}
          showInfo={item.showInfo}
          handleClick={(index) => this.checkout(index)}
          removeProduct={async (cartId, product) => {
            await this.props.cart.removeProduct(cartId, product);
            this.showToast(strings.cartListProduct.productRemoved, Toast.type.SUCCESS);
          }}
          removeCart={cartId => this.props.cart.removeCart(cartId, true)}
          updatePayment={(index, paymentType) => { this.updatePaymentMethod(index, paymentType) }}
          applyVoucher={(item) => this.applyCoupon(item, index)}
          navigation={navigation}
          reviewCart
          showPromotionLoader
          addOrRemoveProduct={(type, product, cartId, distributorID) => this.props.cart.addProductToCart(type, product, cartId, distributorID)}
        />
      </View>
    );
  }

  renderHomeDeliveryAddressFormat = (item) => {
    const { fetchIsWarehouseShipping, fetchWarehouseDeliveryType } = this.props.profile;
    const isWarehouseToStore = fetchIsWarehouseShipping == '1' && fetchWarehouseDeliveryType == '2';
    const mobileNumPrefix = this.props.profile.defaultAddressCountryId == 4 ? `+` : '' ; 
    return (
      <Text
        numberOfLines={5}
        style={[styles.addressText, { color: isWarehouseToStore ? '#373e7360' : '#373e73' }]}
      >
        {this.addressFormat(item)}
        {item.alternateContactNumber && <Text style={[styles.addressText, { color: isWarehouseToStore ? '#373e7360' : '#373e73' }]}>{`\nMobile No.: ${item.alternateContactNumber}`}</Text>}
      </Text>
    );
  }

  addressFormat = (item) => {
    if (item.addressType === 'Shipping') {
      const pincode = this.props.profile.defaultAddressCountryId != 4 ? `,${item.pincode}` : '';
      return `${capitalizeFirstCharacter(item.address)}, ${capitalizeFirstCharacter(item.city)}, ${capitalizeFirstCharacter(item.state)}, ${capitalizeFirstCharacter(item.country)} ${pincode}`;
    }
    return `${item.address ? item.address.trim() + ', ' : ''}${item.locationName}`;
  }

  renderStorePickupAddressFormat = (item) => {
    return (
      <View>
        <Text style={styles.addressText}>{this.addressFormat(item)}</Text>
        <Text style={[styles.addressText, { marginTop: 7, marginBottom: 3 }]}>{`${strings.locationScreen.timingsKey}${item.timings}`}</Text>
        {/* {item.distance && (
          <Text style={styles.addressText}>{`${strings.locationScreen.distanceKey}${item.distance}`}</Text>
        )} */}
      </View>
    )
  }

  getAddressTypeString = () => {
    const { fetchIsWarehouseShipping, fetchWarehouseDeliveryType, defaultActiveAddressType } = this.props.profile;
    if (defaultActiveAddressType === 'Home-Delivery') {
      if (fetchIsWarehouseShipping == '1' && fetchWarehouseDeliveryType == '2') {
        return 'Address';
      }
      return 'Address';
    }
    return 'Address (Store Pick-up)';
  }

  // ...............commented as per requirement ( to be removed)
  // renderShippingType = (addressType) => {
  //   const {defaultShippingType} = this.props.profile;
  //   if(addressType === '(Home Delivery)'){
  //     return(
  //       <View style={styles.borderBottom}>
  //         <View style={{...styles.headerContent,flexWrap: 'wrap'}}>
  //           <Text style={styles.addressTitle}>Shipping Type</Text>
  //           <View 
  //             style={[styles.shippingType, {backgroundColor: defaultShippingType == SHIPPING_TYPE.expressDelivery ? '#14aa9320' : '#6797d420'}]}
  //           >
  //             <Text style={{...Specs.fontBold, color: defaultShippingType == SHIPPING_TYPE.expressDelivery ? '#14aa93' : '#6797d4', marginRight : 3}}> 
  //               {defaultShippingType}
  //             </Text>
  //             {/* <FontAwesome
  //               name='pencil'
  //               size={15}
  //               color={defaultShippingType == SHIPPING_TYPE.expressDelivery ? '#14aa93' : '#6797d4'}
  //             /> */}
  //           </View>
  //         </View>
  //       </View>
  //     )
  //   }
  // }

  renderHeader = (activeAddress, activeDeliveryType) => {
    const { defaultCater } = this.props.profile;
    const addressType = activeDeliveryType === 'Shipping' ? '(Home Delivery)' : '(Store-Pickup)';
    const isGuestUser = this.props.auth.userRole === UserRole.GuestUser;
    return (
      <View>
        <Text style={styles.headingStyle}>Order Review</Text>
        <View style={styles.headerContainer}>

          {
            !isGuestUser && (
              <React.Fragment>
                <View style={styles.borderBottom}>
                  <View style={styles.headerContent}>
                    <Text style={styles.addressTitle}>{this.getAddressTypeString()}</Text>
                  </View>
                </View>
                <View style={[styles.headerContent, { marginBottom: 5, marginVertical: 5 }]}>
                  {/* <Text numberOfLines={2} style={styles.addressText}>
                  {activeAddress && (activeAddress.locationName || activeAddress.address)}
                </Text> */}
                  <View style={{ flex: 1 }}>
                    {activeAddress.addressType === 'Shipping' ? this.renderHomeDeliveryAddressFormat(activeAddress) : this.renderStorePickupAddressFormat(activeAddress)}
                  </View>
                </View>
              </React.Fragment>
            )
          }
          {
            !isGuestUser && (
              <React.Fragment>
                {this.props.profile.defaultActiveAddressType !== 'Home-Delivery' &&
                  (
                    <View style={styles.borderBottom}>
                      <View style={{ ...styles.headerContent, paddingBottom: 10, flexWrap: 'wrap' }}>
                        <Text style={styles.addressTitle}>Catering Branch</Text>
                        <Text>
                          {`${defaultCater.locationName ? defaultCater.locationName + ' - ' : ''} ${defaultCater.locationCode ? defaultCater.locationCode : ''}`}
                        </Text>
                      </View>
                    </View>
                  )}
                {/* {this.renderShippingType(addressType)} */}
                <CateringLocation
                  navigation={this.props.navigation}
                  containerStyle={{ marginTop: 15 }}
                  disabled
                />
                {/* <View style={[styles.headerContent, {marginBottom: 15}]}>
                <Text 
                  numberOfLines={5} 
                  style={[styles.addressText, { width: '98%' }]}
                >
                  {`${activeAddress.locationName ? activeAddress.locationName + ' - ': ''} ${activeAddress.locationCode ?activeAddress.locationCode : ''}`}
                </Text>
              </View> */}
              </React.Fragment>
            )
          }
          {/* {
            this.state.cancellationAndReturnPolicyFetchFailed && (
              <TouchableOpacity style={[styles.headerContent, {marginBottom: 20}]} onPress={() => this.props.navigation.navigate('aboutUs', { answer: this.props.cart.cancellationAndReturnPolicy, title: this.props.cart.cancellationAndReturnPolicyTitle })}>
                <Text numberOfLines={2} style={styles.addressText}>{this.props.cart.cancellationAndReturnPolicyTitle}</Text>
                <View><FontAwesome5 name='arrow-right' size={15} color='#515867' /></View>
              </TouchableOpacity>
            )
          } */}
          {/* {
          (activeAddress.locationCode) && (
            <TouchableOpacity style={[styles.headerContent, {marginBottom: 20}]}>
              <Text numberOfLines={2} style={styles.addressText}>Catering Location</Text>
              <Text numberOfLines={2} style={styles.addressText}>{activeAddress.locationCode}</Text>
            </TouchableOpacity>
          )
        } */}
        </View>
      </View>
    )
  }


  getSelectedPaymentMethod = (paymentMethod) => {
    if (this.props.cart.cartVouchers && this.props.cart.cartVouchers.length && this.props.cart.cartVouchers[0].paymentType.toUpperCase() === paymentMethod) {
      return true
    }
    return false
  }

  renderPaymentOptions = (profile, cart) => {
    if (!profile.isMiUserShoppingForOthers && profile.activeAddress.addressType === 'Shipping') {
      return (
        <Text>Online</Text>
      );
    }
    if (profile.isMiUserShoppingForOthers && !profile.isMiUserOnlineShoppingActive) {
      return (
        <Text>Cash</Text>
      );
    }
    return (
      <React.Fragment>
        <CustomRadioButton
          overrideStyle={styles.radioButton}
          buttonText={strings.cartListProduct.cashButton}
          accessibilityLabel={strings.cartListProduct.cashButton}
          onPress={() => {
            if (!profile.isMiUserShoppingForOthers && profile.activeAddress.addressType === 'Shipping') {
              alert(strings.cartListProduct.cashOnShipping);
            }
            else {
              cart.refreshCartInfo.forEach((item, index) => {
                this.updatePaymentMethod(index, 'Cash');
              });
              // this.updatePaymentMethod(0, 'Cash')
            }
            // (this.props.profile.activeAddress.addressType === 'Shipping' ) ? : this.updatePaymentMethod(0, 'Cash')
          }}
          isSelected={this.getSelectedPaymentMethod('CASH')}
        // isSelected={(this.props.cart.cartVouchers[0].paymentType.toUpperCase() === 'CASH') ? true: false}
        />
        <CustomRadioButton
          overrideStyle={styles.radioButton}
          buttonText={strings.cartListProduct.onlineButton}
          accessibilityLabel={strings.cartListProduct.onlineButton}
          onPress={() => {
            // console.log(this.props.profile.activeAddress.isOnlinePayment)
            if (!profile.isMiUserShoppingForOthers && !profile.activeAddress.isOnlinePayment) {
              alert(strings.cartListProduct.onlineDisabled);
            }
            else if (profile.isMiUserShoppingForOthers && !profile.isMiUserOnlineShoppingActive) {
              alert(strings.cartListProduct.onlineDisabled);
            }
            else {
              cart.refreshCartInfo.forEach((item, index) => {
                this.updatePaymentMethod(index, 'Online');
              });
              // this.updatePaymentMethod(0, 'Online')
              // alert(strings.cartListProduct.onlineOnShipping)
            }
          }}
          isSelected={this.getSelectedPaymentMethod('ONLINE')}
        // isSelected={(this.props.cart.cartVouchers[0].paymentType.toUpperCase() === 'ONLINE') ? true: false}
        />
      </React.Fragment>
    );
  }


  @autobind
  renderPaymentMethodContainer() {
    const { profile, cart } = this.props;
    return (
      <View>
        <View style={styles.borderBottom}>
          <View style={[styles.titleView]}>
            <Text style={[styles.paymentText]}>{`${strings.cartListProduct.paymentMethod} : `}</Text>
            {
              this.renderPaymentOptions(profile, cart)
            }
            {/* <CustomRadioButton
              overrideStyle={styles.radioButton}
              buttonText={strings.cartListProduct.cashButton}
              accessibilityLabel={strings.cartListProduct.cashButton}
              onPress={() => { 
                if(this.props.profile.activeAddress.addressType === 'Shipping') {
                  alert(strings.cartListProduct.cashOnShipping) 
                } 
                else {
                  this.props.cart.refreshCartInfo.forEach( (item, index) => {
                    this.updatePaymentMethod(index, 'Cash')
                  })
                  // this.updatePaymentMethod(0, 'Cash')
                }
                // (this.props.profile.activeAddress.addressType === 'Shipping' ) ? : this.updatePaymentMethod(0, 'Cash')
              }}
              isSelected={this.props.cart.cartVouchers[0].paymentType.toUpperCase() === 'CASH' ? true: false}
            />
            <CustomRadioButton
              overrideStyle={styles.radioButton}
              buttonText={strings.cartListProduct.onlineButton}
              accessibilityLabel={strings.cartListProduct.onlineButton}
              onPress={() => {
                console.log(this.props.profile.activeAddress.isOnlinePayment)
                if(!this.props.profile.activeAddress.isOnlinePayment) {
                  alert(strings.cartListProduct.onlineDisabled)
                } 
                else {
                  this.props.cart.refreshCartInfo.forEach( (item, index) => {
                    this.updatePaymentMethod(index, 'Online')
                  })
                  // this.updatePaymentMethod(0, 'Online')
                  // alert(strings.cartListProduct.onlineOnShipping)
                }
              }}
              isSelected={this.props.cart.cartVouchers[0].paymentType.toUpperCase() === 'ONLINE' ? true: false}
            /> */}
          </View>
        </View>

      </View>
    )
  }

  renderFooter = (totalPrice) => {
    const handleAmtForDubai = (this.props.profile.defaultAddressCountryId == 4 && this.props.cart.cartVouchers.length && this.props.cart.cartVouchers[0].giftVoucherInfo && this.props.cart.cartVouchers[0].giftVoucherInfo.length > 0);
    const handleVouchersAmount = this.props.profile.defaultAddressCountryId == 4 && this.props.cart.cartVouchers.length && this.props.cart.cartVouchers[0].giftVoucherInfo.reduce((acc, obj) => acc + obj.quantity, 0)
    console.log('{Math.abs(this.props.cart.totalPoints).toFixed(2)}',Math.abs(this.props.cart.totalPoints).toFixed(2))
    // console.log('handleAmtForDubai?????????',JSON.stringify(this.state.orders),JSON.stringify(this.props.cart.cartVouchers), handleVouchersAmount,totalPrice )
    return (
      <View style={styles.headerContainer}>
        {this.renderPaymentMethodContainer()}
        <View style={[styles.reviewCartStyle, { marginTop: 6 }]}>
          <Text numberOfLines={1} style={{ ...styles.itemText, color: '#454545', marginTop: 16, }}>{strings.viewCartScreen.totalAmountToBePaid}</Text>
          <Text numberOfLines={1} style={{ ...styles.totalText, color: '#454545', paddingTop: 7 }}>{handleAmtForDubai ? priceWithCurrency(this.props.profile.defaultAddressCountryId, totalPrice > 0 ? totalPrice - handleVouchersAmount : totalPrice) : priceWithCurrency(this.props.profile.defaultAddressCountryId, totalPrice)}</Text>
        </View>
        <View style={styles.reviewCartStyle}>
          <Text numberOfLines={1} style={{ ...styles.itemText, color: '#14aa93', marginTop: 9, marginBottom: 12 }}>{strings.viewCartScreen.totalEarnedPv}</Text>
          <Text numberOfLines={1} style={{ ...styles.totalText, paddingBottom: 12 }}>{Math.abs(this.props.cart.totalPoints).toFixed(2)}</Text>
        </View>
      </View>
    )
  }

  renderCncMessageItem = (item) => {
    if (item.isCncAlertDisplay) {
      return (
        <View style={{ flexDirection: 'column', flex: 1, marginBottom: 10 }}>
          <Text style={styles.cartTitle}>{`${item.cartTitle}'s Cart`}</Text>
          <View>
            <Text style={styles.productTitle}>{item.message}</Text>
          </View>
        </View>
      )
    }
  }

  renderCncPopupFooter = () => {
    return (
      <View style={{ flex: 1, flexDirection: 'row' }}>
        <CustomButton
          handleClick={() => this.setState({ isCncModalVisible: false })}
          linearGradient
          buttonContainer={styles.button}
          buttonTitle='Cancel'
          buttonTitleStyle={styles.customButtonTitleStyle}
          primaryColor="#ff726f"
          secondaryColor="#ff726f"
        />
        <CustomButton
          handleClick={async () => {
            this.setState({ isCncModalVisible: false });
            const { isMiUserShoppingForOthers } = this.props.profile;
            const message = await this.props.checkout.createOrder(this.state.orders)
            if (isNullOrEmpty(message)) {
              this.props.navigation.navigate('cartCheckout', { isNavigateToMakePayment: isMiUserShoppingForOthers });
            }
            else {
              setTimeout(() => { alert(message) }, 200);
              // this.showToast(message, Toast.type.ERROR);
            }
          }}
          linearGradient
          buttonContainer={styles.button}
          buttonTitle='Confirm'
          buttonTitleStyle={styles.customButtonTitleStyle}
          primaryColor="#58cdb4"
          secondaryColor="#58cdb4"
        />
      </View>
    )
  }

  isCheckoutDisabled = () => {
    if (this.props.cart.refreshCartInfo && this.props.cart.refreshCartInfo.length && this.props.cart.refreshCartInfo[0].promotions && this.props.cart.refreshCartInfo[0].promotions.isPromotionCompleted) {
      return false
    }
    return true
  }

  renderCncAlert = async (orders, bonusVoucherInfo) => {
    const totalCartValue = parseInt(this.props.cart.refreshCartInfo[0].cost);
    console.log('resprice', totalCartValue)
    let isRemoveOtherProducts = false
    let isProductExceedsMoq = false;
    let moqExceedsProductList = ''
    orders.orders[0].products.forEach((product) => {
      if (!product.cncApplicability && product.cncApplicability != '1') {
        isRemoveOtherProducts = true;
      }
      if (parseInt(product.cncMOQ) < parseInt(product.quantity)) {
        isProductExceedsMoq = true;
        moqExceedsProductList = moqExceedsProductList + product.title + " is: " + product.cncMOQ + "\n";
      }
    });
    if ((totalCartValue == parseInt(bonusVoucherInfo.balanceAmount)) && !isRemoveOtherProducts && !isProductExceedsMoq) {
      this.handleOrderCourierWarning(orders);
    }
    else if (isRemoveOtherProducts) {
      AlertClass.showAlert('Vestige',
        `In case of CNC Voucher applied, You are allowed to shop for CNC applicable products only. Please remove the products under "others Product" section.`,
        [
          {
            text: 'Cancel', onPress: () => {
              console.log('OK Pressed')
            }
          },
          { text: 'Review', onPress: () => this.props.navigation.pop() },
        ]
      )
    }
    else if (isProductExceedsMoq) {
      this.props.cart.isShowMoqStrip = true;
      AlertClass.showAlert('vestige',
        `${strings.errorMessage.cartVoucher.quantityExceedsMessagePrefix} ${moqExceedsProductList}${strings.errorMessage.cartVoucher.quantityExceedsMessagePostfix}`,
        [
          {
            text: 'Cancel', onPress: () => {
              console.log('OK Pressed')
            }
          },
          { text: 'Review', onPress: () => this.props.navigation.pop() },
        ])
    }
    else if (totalCartValue > parseInt(bonusVoucherInfo.balanceAmount)) {
      AlertClass.showAlert('Vestige',
        `In case of CNC voucher, Cart value can't exceed more than its value. Please adjust your cart accordingly.`,
        [
          {
            text: 'Cancel', onPress: () => {
              console.log('OK Pressed')
            }
          },
          { text: 'Review', onPress: () => this.props.navigation.pop() },
        ]
      )
    }
    else {
      AlertClass.showAlert('Vestige',
        `Your cart value is lesser than your CNC voucher value. Your voucher can be used only once. Do you still want to proceed ?`,
        [
          { text: 'Review', onPress: () => this.props.navigation.pop() },
          {
            text: 'Proceed', onPress: async () => {
              this.handleOrderCourierWarning(orders)
            }
          }
        ]
      )
    }
  }

  renderHeaderLeft = () => {
    return (
      <HeaderLeftIcons
        logo
      />
    )
  }

  render() {
    // console.log(JSON.stringify(this.props.cart.refreshCartInfo))
    const isGuestUser = this.props.auth.userRole === UserRole.GuestUser
    return (
      <View style={styles.container}>
        {!this.isInternetConnected && <OfflineNotice networkStatus={(status) => this.networkStatus(status)} />}
        <Loader loading={this.props.checkout.isLoading || this.state.isLoading} />
        <Header
          navigation={this.props.navigation}
          hideBack
          leftComponent={this.renderHeaderLeft()}
        />
        <FlatList
          accessibilityLabel="Cart_List"
          testID="Cart_List"
          data={this.props.cart.refreshCartInfo}
          renderItem={({ item, index }) => (this.renderItem(item, index))}
          ListHeaderComponent={this.renderHeader(this.props.profile.activeAddress, this.props.profile.activeAddress.addressType)}
          ListFooterComponent={this.renderFooter(this.props.cart.totalPrice)}
          extraData={this.props.cart.cartInfo}
          keyExtractor={(_, index) => index.toString()}
        />
        {!isGuestUser && (
          <View style={{ marginTop: 10, flexDirection: 'row', height: 50 }}>
            <TouchableOpacity style={{ width: '50%', height: '100%', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#4DA1CC' }}
              onPress={() => {
                this.props.navigation.pop()
              }}
            >
              <Text style={{ color: '#4DA1CC', fontWeight: '700', fontSize: 14 }} >{'Edit Cart'}</Text>
            </TouchableOpacity>
            <CustomButton
              {...this.props}
              handleClick={() => this.checkout()}
              disabled={this.isCheckoutDisabled()}
              buttonTitleStyle={styles.cartCheckoutButtonTextStyle}
              buttonContainer={styles.cartCheckoutButtonStyle}
              buttonTitle='Proceed'
              accessibilityLabel="Proceed"
            />
          </View>
        )}
        <Modal
          animationType="slide"
          visible={this.state.isCncModalVisible}
          transparent
          onRequestClose={() => this.setState({ isCncModalVisible: false })}
        >
          <View style={styles.mainContainerInfo}>
            <View style={[styles.containerInfo]}>
              <FlatList
                ListHeaderComponent={() => (
                  <View style={{ flexDirection: 'row', justifyContent: 'center', marginVertical: 15 }}>
                    <Text style={styles.headingText}>Consistency Info</Text>
                  </View>
                )}
                ListFooterComponent={() => this.renderCncPopupFooter()}
                data={this.state.cncInfoList}
                renderItem={({ item }) => this.renderCncMessageItem(item)}
              />
            </View>
          </View>
        </Modal>
      </View>
    );
  }
}

/**
 * @description ViewCart Screen CSS defined here
*/
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFF3F7',
  },
  cartCheckoutButtonStyle: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#6797d4',
    justifyContent: 'center',
  },
  cartCheckoutButtonTextStyle: {
    fontSize: 16,
    color: '#FFFFFF',
    alignSelf: 'center',
  },
  headerContainer: {
    backgroundColor: '#fff',
    marginTop: 10,
  },
  headingStyle: {
    ...Specs.fontSemibold,
    fontSize: 18,
    color: '#373e73',
    paddingTop: 25,
    paddingLeft: 17
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: '#c8c9d359',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginVertical: 10,
  },
  addressTitle: {
    ...Specs.fontSemibold,
    fontSize: 14,
    color: '#373e73',
  },
  addressText: {
    ...Specs.fontReguler,
    fontSize: 14,
    color: '#515867',
  },
  paymentText: {
    ...Specs.fontMeduim,
    fontSize: 16,
    color: '#00000080',
    paddingLeft: 11,
    alignSelf: 'center',
  },
  radioButton: {
    ...Specs.fontMeduim,
    fontSize: 14,
    color: '#00000080',
  },
  itemText: {
    ...Specs.fontSemibold,
    fontSize: 13,
    color: '#46586f',
    marginHorizontal: 11,
  },
  totalText: {
    ...Specs.fontSemibold,
    fontSize: 18,
    color: '#14aa93',
    marginTop: 4,
    marginBottom: 8,
    marginHorizontal: 11,
  },
  mainContainerInfo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00000040',
  },
  containerInfo: {
    width: Dimensions.get('window').width - 30,
    marginTop: isIphoneXorAbove() ? 70 : 40,
    paddingHorizontal: 20,
    marginBottom: isIphoneXorAbove() ? 110 : 65,
    backgroundColor: 'white',
    borderRadius: 4,
  },
  button: {
    marginTop: '6%',
    marginBottom: '5%',
    flex: 1,
  },
  customButtonTitleStyle: {
    fontSize: 14,
    color: '#FFFFFF',
    alignSelf: 'center',
    justifyContent: 'center'
  },
  titleView: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 10,
  },
  headingText: {
    color: '#3f5886',
    fontSize: 20,
    ...Specs.fontSemiBold,
    textAlign: 'center',
    paddingBottom: 5
  },
  cartTitle: {
    ...Specs.fontMedium,
    fontSize: 16,
    color: '#373e73',
  },
  reviewCartStyle: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 15
  },
  productTitle: {
    ...Specs.fontRegular,
    fontSize: 14,
    lineHeight: 18,
    color: '#6c7a87',
    marginVertical: 4,
    marginRight: 10,
  },
  shippingType: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 1,
    borderRadius: 10,
  }
});