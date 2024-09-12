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
  Alert,
  Modal,
  Dimensions,
} from 'react-native';
import { inject, observer } from 'mobx-react';
import AlertClass from '../../utility/AlertClass';
import { action, observable } from 'mobx';
import { CustomButton } from 'app/src/components/buttons/Button';
import { Specs } from 'app/src/utility/Theme';
import CartListComponent from 'app/src/components/cartComponent/CartListComponent';
import autobind from 'autobind-decorator';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { Toast } from 'app/src/components/toast/Toast';
import OrderModel from 'app/src/stores/models/OrderModel';
import {
  priceWithCurrency,
  connectedToInternet,
  isIphoneXorAbove,
  capitalizeFirstCharacter,
  importantUpdateAlert,
  isNullOrEmpty
} from 'app/src/utility/Utility';
import Loader from 'app/src/components/loader/Loader';
import { LOCATION_ROUTE_PATH, UserRole, SHIPPING_TYPE, SHIPPING_TYPE_ID } from 'app/src/utility/constant/Constants';
import { trackEvent } from 'app/src/utility/AnalyticsUtils';
import { MYCART_TAB_PRESS } from 'app/src/utility/GAEventConstants';
import { strings } from 'app/src/utility/localization/Localized';
import OfflineNotice from 'app/src/components/OfflineNotice';
import { _ } from 'lodash';
// Navigation Icons
import HeaderLeftIcons from 'app/src/components/navigation/HeaderLeftIcons';
import HeaderRightIcons from 'app/src/components/navigation/HeaderRightIcons';
import * as AsyncStore from 'app/src/utility/AsyncStoragesUtils';
import CateringLocation from 'app/src/components/cateringLocation/CateringLocation';
import { Header } from '../../components';
import TextTicker from 'react-native-text-ticker';
import TicketModal from '../../components/cartComponent/TicketLocationModal';
@inject('cart', 'profile', 'products', 'checkout', 'location', 'auth', 'appConfiguration')
@observer
export default class ViewCart extends Component {

  constructor(props) {
    super(props);
    this.deviceId = "";
    this.fetchNoInventoryProducts = '';
    // trackEvent(MYCART_TAB_PRESS.eventCategory, MYCART_TAB_PRESS.events.NAVIGATE);
    // this.blurListenerUnsubscribe = props.navigation.addListener('blur', () => {
    //   // this.props.cart.refreshCartInfo = []
    // });
    this.state = {
      modalVisible: false,
      selectedCheckBox: [],
      isCncModalVisible: false,
      cncInfoList: [],
      orders: {},
      isLoading: false,
      cancellationAndReturnPolicyFetchFailed: undefined,
      isShowTicketModal: false,
      ticketEventDetails: [],
    };
    this.isInternetConnected = true;
  }

  async componentDidMount() {
    const DEVICE_ID = AsyncStore.addPrefix('deviceId');
    this.deviceId = await AsyncStore.get(DEVICE_ID);
    this.isInternetConnected = await connectedToInternet();
    if (this.isInternetConnected) {
      this.fetchCartInfo();
      this.props.cart.isShowMoqStrip = false;
    }
    this.focusListenerUnsubscribe = this.props.navigation.addListener('focus', async (isFocused) => {
      // if(isFocused.action.type !== 'Navigation/BACK') {
      //   await this.props.cart.fetchCartData(true);
      // }
      // this.props.cart.reset();
      this.props.cart.reset();
      this.fetchCartInfo();
    });
  }

  async fetchCartInfo () {
    this.setState({ isLoading: true });
    if (_.isEmpty(this.props.cart.shopForObjectInfo)) {
      this.props.cart.updateShopForObject('Self', this.props.auth.distributorID.toString(), 'SELF');
    }
    await this.props.cart.fetchCartData(false);
    await this.props.cart.checkInventory(this.props.cart.skuCodes, true);
    this.fetchNoInventoryProducts = await this.props.cart.noInventoryProducts;
    await this.props.cart.updateCartInfo();
    this.getDeliveryInfo();
    this.setState({ isLoading: false });
  };

  getDeliveryInfo = async () => {
    const response = await this.props.cart.cancellationAndReturnPolicyInfo()
    this.setState({
      cancellationAndReturnPolicyFetchFailed: response.status
    })
  }

  // getCheckGstDistributor = async () =>{
  //   const response = await this.props.cart.getCheckGstDistributor()


  // }

  componentWillUnmount() {
    // this.blurListenerUnsubscribe()
    this.focusListenerUnsubscribe()
  }

  handleAddressNavigation = () => {
    const {
      profile,
      location,
      cart,
      navigation,
    } = this.props;
    if (profile.isMiUserShoppingForOthers) {
      // this will work in case of mini dlcp user shopping for other distributors.
      this.props.navigation.navigate('selectMiUserAddress', { backScreenCount: 1 });
    }
    else {
      location.setLocationRoutePath(LOCATION_ROUTE_PATH.back);
      if (cart.refreshCartInfo.length > 0 && !isNullOrEmpty(cart.refreshCartInfo[0]?.cartId)) {
        navigation.navigate('selectLocation', { cartId: this.props.cart.refreshCartInfo[0].cartId });
      }
      else {
        navigation.navigate('selectLocation');
      }
    }
  }

  cncOrderEligblityConditionCheck = (index) => {
    let cncEligblityPv = 0;
    let cartList = index !== undefined ? [this.props.cart.cartInfo[index]] : this.props.cart.cartInfo;
    console.log(cartList);
    let cncMessageList = cartList.map(cart => {
      console.log(cart);
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
          //  Repurchase order check will be 2 to 14 of every month
          if (currentDate > cncStartDate && currentDate < cncEndDate) {
            isCncAlertDisplay = 1;
          }
        }
      }
      // eslint-disable-next-line object-shorthand
      return {
        isCncAlertDisplay,
        cartTitle: cart.cartDistributorId == this.props.auth.distributorID ? this.props.profile.username : cart.cartTitle,
        ...(isCncAlertDisplay && { message: `${strings.viewCartScreen.cncInfoInitialMessage}${cart.totalPVPoint.toFixed(2)} ${strings.viewCartScreen.cncInfoMiddleMessage} ${cncEligblityPv} ${strings.viewCartScreen.cncInfoLastMessage}` })
      }
    });
    return cncMessageList;
  }

  handleImportantAlert = async (index) => {
    if (this.props.cart.isCartPopup && !isNullOrEmpty(this.props.cart.cartPopText) && this.props.cart.cartPopText.length > 0) {
      // importantUpdateAlert(this.props.cart.cartPopText);
      Alert.alert(
        'IMPORTANT UPDATE!',
        this.props.cart.cartPopText,
        [
          {
            text: 'OK',
            onPress: async () => {
              // await AsyncStore.set(SHOWIMPORTANTUPDATEWARNING, 'true');
              this.checkout(index);
            },
          },
        ],
        { cancelable: false },
      );
    }
    else {
      // this.props.cart.cartVouchers.map((data, index) => {
      //   this.props.cart.setCartInfo(index, data)
      // });
      this.checkout(index);
    }
  }

  checkout = async (index) => {
    // await AsyncStore.set(SHOWIMPORTANTUPDATEWARNING, 'true');
    const { profile, auth, appConfiguration } = this.props;
    const { isApiV2Enabled } = appConfiguration;

    this.isInternetConnected = await connectedToInternet();
    if (this.isInternetConnected) {
      const orders = new OrderModel((index !== undefined ? [this.props.cart.cartInfo[index]]:this.props.cart.cartInfo), false);
      // console.log('rescheckoutorder', orders);
      if (orders.error) {
        setTimeout(() => {
          alert(orders.error);
          // this.showToast(orders.error, Toast.type.ERROR)
        }, 200);
        return;
      }
      if (isNullOrEmpty(profile.activeAddress.pincode) || profile.activeAddress.pincode === 'Pincode not found') {
        AlertClass.showAlert('',
          `${strings.viewCartScreen.noAddressSelectedForCheckout}`,
          [
            { text: 'Cancel', onPress: () => console.log('OK Pressed') },
            {
              text: 'Ok',
              onPress: () => {
                this.handleAddressNavigation();
              },
            },
          ]);
        return;
      }

      if (orders.orders.length > 0) {
        // orders.distributorId = this.props.profile.distributorID;
        orders.distributorId = auth.distributorID;
        orders.deviceId = this.deviceId;
        if (!profile.activeAddress) {
          setTimeout(() => {
            alert(strings.cartListProduct.productBeforeCheckout)
            // this.showToast(strings.cartListProduct.productBeforeCheckout, Toast.type.ERROR)
          }, 200);
          return;
        }
        orders.deliveryType = profile.activeAddress.addressType;
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
        orders.isWarehouse = profile.fetchIsWarehouseShipping === '1' ? 1 : 0;
        if (profile.activeAddress.addressType === 'StorePickup') {
          orders.storesDTO = profile.activeAddress;
        }
        else {
          const homeDelivery = {
            ...this.props.profile.activeAddress,
            address1: this.props.profile.activeAddress.address,
            address2: "", // V2 API fix, will be static
            // distributorId: this.props.profile.distributorID,
            distributorId: this.props.auth.distributorID,
            pincode: {
              pincode: this.props.profile.activeAddress.pincode,
            },
          };
          // This key will be used in case of ticket purchase, value will be added in later methods.
          orders.ticketEventId = '';

          orders.distributorAddressDTO = homeDelivery;

          /* ...................... we are using field from default caterDTO. */
          orders.distributorAddressDTO.locationCode = profile.defaultCater?.locationCode;
          orders.distributorAddressDTO.locationId = profile.defaultCater?.locationId;
          orders.distributorAddressDTO.locationName = profile.defaultCater?.locationName;
        }
        this.confirmCheckout(index, orders);
      }
      else {
        alert(strings.cartListProduct.emptyCart)
        // this.showToast(strings.cartListProduct.emptyCart, Toast.type.ERROR);
      }
    }
    else {
      this.showToast('No Internet connection.', Toast.type.ERROR);
    }
  }

  confirmCheckout = async (index, orders) => {
    const { noInventoryProducts, cartInfo, responseSkuCodes, skuCodes} = this.props.cart;
    const {isApiV2Enabled} = this.props.appConfiguration;
    this.setState({ isLoading: true });
    const response = isApiV2Enabled
      ? this.props.cart.skuCodes.length > 0
      : this.props.cart.skuCodes.length > 0 && await this.props.cart.checkInventory(this.props.cart.skuCodes, true);
    this.setState({ isLoading: false });
    let isQuantityGreaterOrNoInventory = false;
    // console.log('rescheckout',response, index)
    if (response) {
      if (index === undefined) {
        if (this.props.cart.noInventoryProducts && this.props.cart.noInventoryProducts.length) {
          AlertClass.showAlert(strings.viewCartScreen.inventoryMessageTitle,
            this.props.cart.getInventoryMessage,
            // `${strings.viewCartScreen.singleCartInventoryMessage} ${JSON.stringify(this.props.cart.responseSkuCodes)}`,
            [{ text: strings.viewCartScreen.alertButtonTextOk, onPress: () => console.log('OK Pressed') }]);
        }
        else {
          // AlertClass.showAlert(strings.viewCartScreen.inventoryMessageTitle,
          //   strings.viewCartScreen.inStockAvailableProducts, [
          //     {text: strings.viewCartScreen.alertButtonTextReviewCart, onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
          //     {text: strings.viewCartScreen.alertButtonTextConfirm, onPress: () => {
          //       this.verifyAddress(orders, index)
          //     }}
          //   ]);
          this.verifyAddress(orders, index)
        }
      }
      else {
        cartInfo && cartInfo[index].cartProducts.forEach( (cartProduct) => {
          const index = this.props.cart.responseSkuCodes.findIndex(x => x.itemCode === cartProduct.skuCode);
          if(index === -1 || cartProduct.quantity>this.props.cart.responseSkuCodes[index].availableQuantity) {
            isQuantityGreaterOrNoInventory = true;
            AlertClass.showAlert(strings.viewCartScreen.inventoryMessageTitle, 
              this.props.cart.getInventoryMessage, 
              // `${strings.viewCartScreen.singleCartInventoryMessage} ${JSON.stringify(this.props.cart.responseSkuCodes)}`,
              [{text: strings.viewCartScreen.alertButtonTextOk, onPress: () => console.log('OK Pressed')}])
          }
        })
        if (!isQuantityGreaterOrNoInventory) {
          // AlertClass.showAlert(strings.viewCartScreen.inventoryMessageTitle, 
          //   strings.viewCartScreen.inStockAvailableProducts, [   
          //     {text: strings.viewCartScreen.alertButtonTextReviewCart, onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
          //     {text: strings.viewCartScreen.alertButtonTextConfirm,  onPress: () => {
          //       this.verifyAddress(orders, index)
          //     } }
          //   ]);
          this.verifyAddress(orders, index);
        }
      }
    }
    else {
      AlertClass.showAlert(strings.viewCartScreen.inventoryMessageTitle,
        strings.viewCartScreen.inventoryIsNotAvailableRightNow,
        [{ text: strings.viewCartScreen.alertButtonTextOk, onPress: () => console.log('OK Pressed') }]);
    }
  }


  /**
   * @description Final method after all validation, It will generate log and navigate to cart review.
   * @param {*} orders Request body of log generate api.
   * @param {*} index Index of order.
   * @param {*} ticketEventId This will be used in case of ticket shopping getting done.
   */
  generateLogAndNavigate = async (orders, index, ticketEventId) => {
    const res = await this.props.checkout.generateOrderLog(orders);
    if (res.success) {
      this.props.navigation.navigate('cartReview', { index: index, ticketEventId: ticketEventId });
    }
    else {
      AlertClass.showAlert('', res.message);
    }
  }

  showCncPopup = async(orders, index, ticketEventId) => {
    const cncMessageInfoList = this.cncOrderEligblityConditionCheck(index);
    const showCnc = cncMessageInfoList.some(item => item.isCncAlertDisplay == 1);
    if (showCnc) {
      this.setState({
        isCncModalVisible: showCnc,
        cncInfoList: cncMessageInfoList,
        orders: orders,
        cartIndex: index,
      });
    }
    else {
      await this.generateLogAndNavigate(orders, index, ticketEventId);
      // const message = await this.props.checkout.createOrder(orders)
      // if(message === '') {
      //   this.props.navigation.navigate('cartCheckout')
      // } 
      // else {
      //   this.showToast(message, Toast.type.ERROR);
      // }
    }
  }

  /**
   * @description This will add event id in order object and proceed for cart review screen.
   * @param {*} eventId This key stores the user selected value for ticket event.
   */
  onTicketSubmit = async (eventId) => {
    const { orders, cartIndex } = this.state;
    orders.ticketEventId = eventId || '';
    this.handleTicketModalVisiblity(false);
    this.showCncPopup(orders, cartIndex, eventId);
  }

  handleTicketModalVisiblity = async (value, orders, cartIndex) => {
    if (value === true) {
      this.setState({ isLoading: true });
      const { products } = orders.orders[0] || [];
      const ticketObject = products.find(obj => obj.isTicket) || {};
      const {
        productId, quantity, locationId, skuCode,
      } = ticketObject;
      const data = {
        distributorId: orders.orders[0]?.distributorId,
        productId: productId,
        quantity: quantity,
        locationId: locationId,
        skuCode: skuCode,
      };
      const res = await this.props.cart.fetchTicketEventDetails(data);
      this.setState({ isLoading: false });
      if (res.success) {
        this.setState({
          ticketEventDetails: res.data,
          orders: orders,
          cartIndex: cartIndex,
          isShowTicketModal: value,
        });
      }
      else {
        AlertClass.showAlert('', res.message);
      }
    }
    else {
      this.setState({ isShowTicketModal: value })
    }
  }

  /**
   * @@description This will handle conditional modal for different type of product.
   */
  handleCheckoutPopup = (orders, index) => {
    const { products } = orders.orders[0] || [];
    const ticketIndex = products.findIndex(val => val.isTicket === true);
    if (ticketIndex !== -1) {
      this.handleTicketModalVisiblity(true, orders, index);
    }
    else {
      this.showCncPopup(orders, index);
    }
  }

  handleAddressFormat = () => {
    const { activeAddress } = this.props.profile;
    if (activeAddress.addressType === 'Shipping') {
      const {fetchIsWarehouseShipping, fetchWarehouseDeliveryType, fetchRegularCatering} = this.props.profile;
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
        {text: 'Cancel', onPress: () => console.log('OK Pressed')},
        {text: 'Confirm', onPress: () => this.handleCheckoutPopup(orders, index) } 
      ])
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
  openBuyingPreferenceVisible = visible => {
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
    let selectedCheckBoxBackup = [...selectedCheckBox];
    var removeBuyer = selectedCheckBox.indexOf(buyer);
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
    navigation.navigate('cartVouchersScreen',{cart: item, index: index});
  }

  @autobind
  async networkStatus(status) {
    if(status) {
      this.isInternetConnected = status;
    }
  }

  updatePaymentMethod = (index, paymentType) => {
    this.props.cart.modifyCartInfo('PAYMENTTYPE', index, paymentType )
  }

  onAddTocartPress = _.debounce(async (type, product, cartId, distributorID) => {
    this.props.cart.addProductToCart(type, product, cartId, distributorID);
  }, 1, { leading: true, trailing: false })

  removeProduct = async (cartId, product) => {
    await this.props.cart.removeProduct(cartId, product);
    if (this.props.profile.isWarehouseShipping == '1' && this.props.cart?.refreshCartInfo?.length < 1) {
      await this.props.profile.changeShippingType(SHIPPING_TYPE.regularDelivery);
      this.showToast(`${strings.cartListProduct.productRemoved}\n${strings.viewCartScreen.movingToBaseLocationMessage}`, Toast.type.SUCCESS);
      this.props.navigation.navigate('Dashboard');
    }
    else {
      this.showToast(strings.cartListProduct.productRemoved, Toast.type.SUCCESS);
    }
  }

  @autobind
  renderItem(item, index) {
    const { navigation } = this.props;
    const {isShowMoqStrip} = this.props.cart;
    if (!this.props.cart.cartVouchers[index]) {
      this.props.cart.modifyCartInfo('INIT', index)
    }
    return (
      <View>
        <CartListComponent
          userCart={item}
          index={index}
          fetchNoInventoryProducts={this.fetchNoInventoryProducts}
          showInfo
          isShowMoqStrip = {isShowMoqStrip}
          handleClick={(index) => this.handleImportantAlert(index)}
          removeProduct={async(cartId, product) => this.removeProduct(cartId, product)}
          removeCart={(cartId) => this.props.cart.removeCart(cartId, true)}
          updatePayment={(index, paymentType) => {this.updatePaymentMethod(index, paymentType)}}
          applyVoucher={(item) => this.applyCoupon(item, index)}
          navigation={navigation}
          showPromotionLoader={false}
          addOrRemoveProduct={(type, product, cartId, distributorID)=> this.onAddTocartPress(type, product, cartId, distributorID)}
        />
      </View>
    )
  }

  renderHomeDeliveryAddressFormat = (item) => {
    const { fetchIsWarehouseShipping, fetchWarehouseDeliveryType } = this.props.profile;
    const isWarehouseToStore = fetchIsWarehouseShipping == '1' && fetchWarehouseDeliveryType == '2';
    const mobileNumPrefix = this.props.profile.defaultAddressCountryId == 4 ? `+` : '' ; 
    return (
      <Text
        numberOfLines={5}
        style={[styles.addressText, {color: isWarehouseToStore ? '#373e7360' : '#373e73' }]}
      >
        {this.addressFormat(item)}
        { item.alternateContactNumber && <Text style={[styles.addressText, { color: isWarehouseToStore ? '#373e7360' : '#373e73' }]}>{`\nMobile No.: ${item.alternateContactNumber}`}</Text> }
      </Text>
    )
  }

   addressFormat = (item) => {
     if (item.addressType === 'Shipping') {
       const pincode = this.props.profile.defaultAddressCountryId != 4 ? `,${item.pincode}` : '';
       return `${capitalizeFirstCharacter(item.address)}, ${capitalizeFirstCharacter(item.city)}, ${capitalizeFirstCharacter(item.state)}, ${capitalizeFirstCharacter(item.country)} ${pincode}`
     }
     return `${item.address ? item.address.trim() + ', ' : ''}${item.locationName}`;
   }

  renderStorePickupAddressFormat = (item) => {
    return (
      <View>
        <Text style={styles.addressText}>{this.addressFormat(item)}</Text>
        <Text style={[styles.addressText,{ marginTop: 7, marginBottom: 3 }]}>{`${strings.locationScreen.timingsKey}${item.timings}`}</Text>
        {/* {item.distance && (
          <Text style={styles.addressText}>{`${strings.locationScreen.distanceKey}${item.distance}`}</Text>
        )} */}
      </View>
    )
  }

  getAddressTypeString = () => {
    const {fetchIsWarehouseShipping, fetchWarehouseDeliveryType, defaultActiveAddressType} = this.props.profile;
    if (defaultActiveAddressType === 'Home-Delivery') {
      if (fetchIsWarehouseShipping == '1' && fetchWarehouseDeliveryType == '2') {
        return 'Address';
      }
      return 'Address';
    }
    return 'Address (Store Pick-up)';
  }

  renderHeader = (activeAddress, activeDeliveryType) => {
    const { defaultCater } = this.props.profile;
    // const addressType = activeDeliveryType === 'Shipping' ? '(Home Delivery)' : '(Store-Pickup)';
    const isGuestUser = this.props.auth.userRole === UserRole.GuestUser;
    return (
      <View style={styles.headerContainer}>
        {
          !isGuestUser && (
            <React.Fragment>
              <View style={styles.borderBottom}>
                <View style={styles.headerContent}>
                  <Text style={styles.addressTitle}>{this.getAddressTypeString()}</Text>
                </View>
              </View>
              <View style={[styles.headerContent, {marginBottom: 5, marginVertical:5}]}>
                {/* <Text numberOfLines={2} style={styles.addressText}>
                  {activeAddress && (activeAddress.locationName || activeAddress.address)}
                </Text> */}
                <View style={{ flex:1 }}>
                  { activeAddress.addressType === 'Shipping' ? this.renderHomeDeliveryAddressFormat(activeAddress) : this.renderStorePickupAddressFormat(activeAddress) }
                </View>
                <TouchableOpacity 
                  style={{justifyContent: 'flex-start', alignItems: 'flex-end', width: 25}}
                  onPress={() => {
                    this.handleAddressNavigation();
                  }}
                >
                  <FontAwesome name="pencil" size={15} color="#515867" />
                </TouchableOpacity>
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
                    <View style={{...styles.headerContent,flexWrap: 'wrap'}}>
                      <Text style={styles.addressTitle}>Catering Branch</Text>
                      <Text>
                        {`${defaultCater.locationName ? defaultCater.locationName + ' - ': ''} ${defaultCater.locationCode ?defaultCater.locationCode : ''}`}
                      </Text>
                    </View>
                  </View>
                )}
              {/* {this.renderShippingType(addressType)} */}
              <CateringLocation 
                navigation={this.props.navigation} 
                containerStyle={{marginTop:15}}
                disabled={this.props.profile.isMiUserShoppingForOthers}
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
        {
          this.state.cancellationAndReturnPolicyFetchFailed && (
            <TouchableOpacity style={[styles.headerContent, {marginBottom: 10}]} onPress={() => this.props.navigation.navigate('aboutUs', { answer: this.props.cart.cancellationAndReturnPolicy, title: this.props.cart.cancellationAndReturnPolicyTitle })}>
              <Text numberOfLines={2} style={styles.addressText}>{this.props.cart.cancellationAndReturnPolicyTitle}</Text>
              <View><MaterialCommunityIcons name='arrow-right' size={15} color='#515867' /></View>
            </TouchableOpacity>
          )
        }
        {/* {
          (activeAddress.locationCode) && (
            <TouchableOpacity style={[styles.headerContent, {marginBottom: 20}]}>
              <Text numberOfLines={2} style={styles.addressText}>Catering Location</Text>
              <Text numberOfLines={2} style={styles.addressText}>{activeAddress.locationCode}</Text>
            </TouchableOpacity>
          )
        } */}
      </View>
    )
  }

  renderFooter = (totalPrice) => {
    return (
      <View style={[styles.headerContainer, {flexDirection: 'row'}]}>
        <View style={{flex: 1}}>
          <Text numberOfLines={1} style={styles.itemText}>{strings.viewCartScreen.totalEarnedPv}</Text>
          <Text numberOfLines={1} style={styles.totalText}>{Math.abs(this.props.cart.totalPoints).toFixed(2)}</Text>
        </View>
        <View style={{flex: 1}}>
          <Text numberOfLines={1} style={styles.itemText}>{strings.viewCartScreen.totalAmountToBePaid}</Text>
          <Text numberOfLines={1} style={styles.totalText}>{priceWithCurrency(this.props.profile.defaultAddressCountryId,totalPrice)}</Text>
        </View>
      </View>
    )
  }

  renderCncMessageItem = (item) => {
    if(item.isCncAlertDisplay) {
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
      <View style={{ flex: 1, flexDirection: 'row'}}>
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
          handleClick={async() => {
            this.setState({ isCncModalVisible: false })
            await this.generateLogAndNavigate(this.state.orders, this.state.cartIndex);
            
            // const message = await this.props.checkout.createOrder(this.state.orders)
            // if(message === '') {
            //   this.props.navigation.navigate('cartCheckout')
            // } 
            // else {
            //   this.showToast(message, Toast.type.ERROR);
            // }
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

  renderCheckoutButton = () => {
    const isGuestUser = this.props.auth.userRole === UserRole.GuestUser
    if(!isGuestUser && this.props.cart.refreshCartInfo.length > 0) {
      return (
        <View style={{ marginTop: 10, flexDirection: 'row', height: 50 }}>
          <CustomButton
            {...this.props}
            handleClick={() => this.handleImportantAlert()}
            buttonTitleStyle={styles.cartCheckoutButtonTextStyle}
            buttonContainer={styles.cartCheckoutButtonStyle}
            buttonTitle='Checkout'
            accessibilityLabel="Checkout"
          />
        </View>
      )
    }
    return null
  }

  renderHeaderShopFor = () => {
    return (
      <HeaderLeftIcons
        logo
        updateLocation
        navigation={this.props.navigation} 
      />
    )
  }

  render() {
    const isGuestUser = this.props.auth.userRole === UserRole.GuestUser
    return (
      <View style={styles.container}>
        { !this.isInternetConnected && <OfflineNotice networkStatus={(status) => this.networkStatus(status)} /> }
        <Loader loading={this.props.checkout.isLoading || this.state.isLoading} />  
        <Header
          navigation={this.props.navigation}
          hideBack
          middleComponent={this.renderHeaderShopFor()}
        />
        {(this.props.cart.isPrompt && this.props.cart.promptText && this.props.cart.promptText != '' && this.props.cart.promptText != 'null' && this.props.cart.promptText.length > 0) ? 
          (
            <View style={{width:'100%',height:40,alignItems:'center',backgroundColor:'red',justifyContent:'center'}}>
              <TextTicker
                style={{ fontSize:14, fontWeight:'700', color:'white' }}
                scrollSpeed={18}
                loop
                animationType='auto'
                repeatSpacer={50}
                // marqueeDelay={1000}
              >
                {this.props.cart.promptText}
              </TextTicker>
            </View>
          ): null
        }
        {this.props.cart.gstObjectMessage!="" &&(
            <View style={{width:'100%',alignItems:'flex-start',
           justifyContent:'center',backgroundColor:'white', padding:10}}>

              <Text style={{color:'red', fontSize:14}}>{this.props.cart.gstObjectMessage} </Text>

              </View>
        )}
           
       
        <FlatList
          accessibilityLabel="Cart_List"
          testID="Cart_List"
          data={this.props.cart.refreshCartInfo}
          renderItem={({item, index})=>(this.renderItem(item, index))}
          ListHeaderComponent={this.renderHeader(this.props.profile.activeAddress, this.props.profile.activeAddress.addressType)}
          ListFooterComponent={this.renderFooter(this.props.cart.totalPrice)}
          extraData={this.props.cart.cartInfo}
          keyExtractor={(_, index) => index.toString()}
        />
        {this.renderCheckoutButton()}
        {this.state.isShowTicketModal
          && (
            <TicketModal
              isVisible={this.state.isShowTicketModal}
              requestClose={() => this.handleTicketModalVisiblity(false)}
              data={this.state.ticketEventDetails}
              onSubmitData={this.onTicketSubmit}
            />
          )
        }
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
                  <View style={{ flexDirection: 'row', justifyContent: 'center', marginVertical: 15}}>
                    <Text style={styles.headingText}>Consistency Info</Text>
                  </View>
                )}
                ListFooterComponent={() => this.renderCncPopupFooter()}
                data={this.state.cncInfoList}
                renderItem={({item}) => this.renderCncMessageItem(item)}
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
    flex:1,
    backgroundColor: '#fff',
    marginTop: 10,
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
  itemText: {
    ...Specs.fontRegular,
    fontSize: 13,
    color: '#46586f',
    marginTop: 16,
    marginHorizontal: 11,
  },
  totalText: {
    ...Specs.fontSemibold,
    fontSize: 18,
    color: '#14aa93',
    marginTop: 5,
    marginHorizontal: 11,
    marginBottom: 15,
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
  headingText: {
    color: '#3f5886',
    fontSize: 20,
    ...Specs.fontSemiBold, 
    textAlign:'center',
    paddingBottom: 5
  },
  cartTitle: {
    ...Specs.fontMedium,
    fontSize: 16,
    color: '#373e73',
  },
  productTitle: {
    ...Specs.fontRegular,
    fontSize: 14,
    lineHeight: 18,
    color: '#6c7a87',
    marginVertical: 4,
    marginRight: 10,
  },
  shippingType:{
    flexDirection:'row',
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingHorizontal: 8, 
    paddingVertical:1, 
    borderRadius: 10, 
  }
});