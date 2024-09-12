import { observable, computed, makeAutoObservable, action } from 'mobx';
import NetworkOps from 'app/src/network/NetworkOps';
import * as Urls from 'app/src/network/Urls';
import * as AsyncStore from 'app/src/utility/AsyncStoragesUtils';
import {
  trackEvent,
  checkoutProductAction,
} from 'app/src/utility/AnalyticsUtils';
const SHOWIMPORTANTUPDATEWARNING = AsyncStore.addPrefix(
  'showImportantUpdateWarning',
);
import { get } from 'lodash';

export default class Checkout {
  @observable isLoading: boolean = false;
  @observable ordersDetail: any;
  @observable groupOrderId = '';
  @observable addressId = '';
  @observable courierWarningPrice = '';
  @observable courierWarningMessage = '';

  @action setIsLoading = value => (this.isLoading = value);
  @action setOrdersDetail = value => (this.ordersDetail = value);
  @action setGroupOrderId = value => (this.groupOrderId = value);
  @action setAddressId = value => (this.addressId = value);
  @action setCourierWarningPrice = value => (this.courierWarningPrice = value);
  @action setCourierWarningMessage = value =>
    (this.courierWarningMessage = value);

  constructor(store) {
    this.store = store;
    makeAutoObservable(this);
  }

  @computed get address() {
    const address = get(this.ordersDetail, 'shipping.address');
    let addressString = '';
    const add = get(address, 'address1');
    const cityName = get(address, 'cityName');
    const stateName = get(address, 'stateName');
    const countryName = get(address, 'countryName');
    addressString = this.makeAddress(addressString, add);
    addressString = this.makeAddress(addressString, cityName);
    addressString = this.makeAddress(addressString, stateName);
    addressString = this.makeAddress(addressString, countryName);
    return addressString;
  }

  makeAddress(addressString, value) {
    let newAddress = addressString;
    if (value.length > 0) {
      if (addressString.length > 0) {
        newAddress = addressString + ', ' + value;
      } else {
        newAddress = value;
      }
    }
    return newAddress;
  }

  @computed get totalCashAmount(): number {
    let totalPrice = 0.0;
    this.ordersDetail.orders &&
      this.ordersDetail.orders.forEach(order => {
        order.payment.forEach(payment => {
          if (
            payment.method.toUpperCase() === 'CASH' &&
            order.orderStatus.toUpperCase() === 'CONFIRMED'
          )
            totalPrice += order.orderAmount;
        });
      });
    return totalPrice;
  }

  @computed get totalOnlineAmount(): number {
    let totalPrice = 0.0;
    this.ordersDetail?.orders &&
      this.ordersDetail.orders.forEach(order => {
        order.payment.forEach(payment => {
          if (
            payment.method.toUpperCase() === 'ONLINE' &&
            order.orderStatus.toUpperCase() === 'CONFIRMED' &&
            payment.status !== 'TXN_SUCCESS'
          ) {
            totalPrice += order.orderAmount;
          }
        });
      });
    return totalPrice;
  }

  @computed get onlineOrderIds(): String {
    let onlineOrderId = [];
    this.ordersDetail.orders &&
      this.ordersDetail.orders.forEach(order => {
        order.payment.forEach(payment => {
          if (payment.method.toUpperCase() === 'ONLINE')
            onlineOrderId.push(order.orderId);
        });
      });
    return onlineOrderId.toString();
  }

  @computed get onlineCartIds(): String {
    let onlineCartIds = [];
    this.ordersDetail.orders &&
      this.ordersDetail.orders.forEach(order => {
        if (this.store.cart.isCncVoucherApplied == '1') {
          onlineCartIds.push(order.cartId);
        } else {
          order.payment.forEach(payment => {
            if (payment.method.toUpperCase() === 'ONLINE')
              onlineCartIds.push(order.cartId);
          });
        }
      });
    return onlineCartIds.toString();
  }

  @computed get cashCartIds(): String {
    let cashCartIds = [];
    this.ordersDetail.orders &&
      this.ordersDetail.orders.forEach(order => {
        if (this.store.cart.isCncVoucherApplied == '1') {
          cashCartIds.push(order.cartId);
        } else {
          order.payment.forEach(payment => {
            if (payment.method.toUpperCase() === 'CASH')
              cashCartIds.push(order.cartId);
          });
        }
      });
    return cashCartIds.toString();
  }

  @computed get bonusCartIds(): String {
    let bonusCartIds = [];
    this.ordersDetail.orders &&
      this.ordersDetail.orders.forEach(order => {
        if (this.store.cart.isCncVoucherApplied == '1') {
          bonusCartIds.push(order.cartId);
        } else {
          order.payment.forEach(payment => {
            if (payment.method.toUpperCase() === 'BONUS')
              bonusCartIds.push(order.cartId);
          });
        }
      });
    return bonusCartIds.toString();
  }

  @computed get totalPrice(): number {
    return this.totalCashAmount + this.totalOnlineAmount;
  }

  @computed get shippingAmount() {
    let shippingamount = 0.0;
    const isCourierChargeApplicable = get(
      this.ordersDetail,
      'isCourierChargeApplicable',
    );
    if (isCourierChargeApplicable === true) {
      const courierCharges = get(this.ordersDetail, 'courierCharges');
      if (courierCharges > 0) {
        shippingamount = courierCharges;
      }
    }
    return shippingamount;
  }

  @computed get expressCharge() {
    let expressCharge = 0.0;
    // const isExpressChargeApplicable = get(this.ordersDetail,'isExpressChargeApplicable')
    // if(isCourierChargeApplicable === true){
    const expressChargeAmount = get(this.ordersDetail, 'expressCharge');
    if (expressChargeAmount > 0) {
      expressCharge = expressChargeAmount;
    }
    // }
    return expressCharge;
  }

  @computed get cessAmount() {
    let cessAmount = 0;
    this.ordersDetail?.orders &&
      this.ordersDetail.orders.forEach(order => {
        cessAmount += order.cessAmount;
      });
    return cessAmount;
  }

  @computed get totalOnlineAmountWithShipping() {
    return this.totalOnlineAmount + this.shippingAmount + this.cessAmount;
  }

  @computed get totalPriceWithShipping() {
    return (
      this.totalPrice +
      this.shippingAmount +
      this.cessAmount +
      this.expressCharge
    );
  }

  @computed get ordersList() {
    let ordersList = [];
    this.ordersDetail.orders &&
      this.ordersDetail.orders.forEach(order => {
        let productList = [];
        order.subOrders.forEach(subOrder => {
          subOrder.products.forEach(product => {
            productList.push(product);
          });
        });
        const data = Object.assign(
          { data: productList },
          { title: order.orderId },
          { orderAmount: order.orderAmount },
          { paymentType: order.payment && order.payment[0].method },
          { distributorId: order.distributorId },
        );
        ordersList.push(data);
      });
    return ordersList;
  }

  @computed get isPaymentModeOnline() {
    let flag = false;
    if (this.ordersDetail.orders) {
      this.ordersDetail.orders.forEach(order => {
        order.payment.forEach(payment => {
          if (payment.method.toUpperCase() === 'ONLINE') flag = true;
        });
        if (
          order.selectedPaymentMode?.toUpperCase() === 'ONLINE' &&
          this.totalPriceWithShipping > 0
        ) {
          flag = true;
        }
      });
    }

    return flag;
  }

  async createOrder(data) {
    let isGiftVoucherApplied = false;
    let _data = data
    // console.log('before Sending data',JSON.stringify(data))
    const handleAmtForDubai = (this.store.profile.defaultAddressCountryId == 4 && this.store.cart.cartVouchers.length && this.store.cart.cartVouchers[0].giftVoucherInfo && this.store.cart.cartVouchers[0].giftVoucherInfo.length > 0);
    const handleVouchersAmount = this.store.profile.defaultAddressCountryId == 4 && this.store.cart.cartVouchers.length && this.store.cart.cartVouchers[0].giftVoucherInfo.reduce((acc, obj) =>  acc + obj.quantity, 0)
    handleAmtForDubai && ( isGiftVoucherApplied = _data.orders[0]?.vouchers.find(o => o.type === 'Gift'));
    // console.log('isGiftVoucherApplied>>>>>>>>>>>>>',isGiftVoucherApplied,handleAmtForDubai,handleVouchersAmount)
    handleAmtForDubai && isGiftVoucherApplied && Object.keys(isGiftVoucherApplied).length > 0 && (
       _data.orders[0].orderAmount = _data.orders[0].orderAmount - handleVouchersAmount < 0 ? 0 : _data.orders[0].orderAmount - handleVouchersAmount
    )
  
    handleAmtForDubai && isGiftVoucherApplied && Object.keys(isGiftVoucherApplied).length > 0 && ( 
      _data.orders[0]?.payments.forEach((item) => (item.method == 'Online' || item.method == 'Cash') && (item.totalAmount = _data.orders[0].orderAmount)
      ))
    
    
    const {isApiV2Enabled} = this.store.appConfiguration;
    let productList = [];
    let productListPayload = [];
    _data &&
    _data.orders.forEach(order => {
        productList = productList.concat(order.products);
      });
    productList.forEach(productItem => {
      const obj = {
        id: productItem.skuCode,
        name: productItem.title,
        price: productItem.unitCost,
        quantity: productItem.quantity,
      };
      productListPayload.push(obj);
    });
    // const url = `${isApiV2Enabled ? Urls.ServiceEnum.OrderChekoutApiV2 : Urls.ServiceEnum.OrderChekout}`;  // handled from Vipul side internally
    const url = `${Urls.ServiceEnum.OrderChekoutApiV2}`; 
    _data.groupOrderId = this.groupOrderId
    if (this.addressId) {
      _data.distributorAddressDTO.addressId =  this.addressId
    }
    console.log('ORDER PLACED ------>', JSON.stringify(_data));
    this.setIsLoading(true);
    
    const response = await NetworkOps.postToJson(url, _data);
    this.setIsLoading(false);
    console.log(JSON.stringify(response));
    if (!response.message) {
      // const payload = { products: productListPayload, productAction: checkoutProductAction }
      // trackEvent('CHECKOUT_EVENT', 'Click', null, payload);
      await AsyncStore.set(SHOWIMPORTANTUPDATEWARNING, 'false');
      this.setOrdersDetail(response);

      this.store.cart.setIsProdVoucherApplied('0');
      this.store.cart.setIsCncVoucherApplied('0');

      
      return '';
    } else {
      return response.message
        ? response.message
        : 'Something went wrong. Please try again.';
    }
  }

  async generateOrderLog(data) {
    const { isApiV2Enabled } = this.store.appConfiguration;
    const url = isApiV2Enabled
      ? Urls.ServiceEnum.GenerateOrderCheckoutLogApiV2
      : Urls.ServiceEnum.GenerateOrderCheckoutLog;
    this.setIsLoading(true);
    const res = await NetworkOps.postToJson(url, data);
    this.setIsLoading(false);
    // console.log(res)
    if (!res.message) {
      this.setGroupOrderId(res.groupOrderId);
      this.setCourierWarningPrice(res.courierWarningPrice);
      this.setCourierWarningMessage(res.courierWarningMessage);
      if (res.distributorAddressDTO && res.distributorAddressDTO.addressId) {
        this.setAddressId(res.distributorAddressDTO.addressId);
      } else {
        this.setAddressId('');
      }
      return { success: true };
    }
    this.setGroupOrderId('');
    return { success: false, message: res.message };
  }

  async getCheckoutAddress(): Promise<*> {
    const url = `${Urls.ServiceEnum.Distributor}/${this.store.auth.distributorID}/${Urls.DistributorServiceEnum.CheckoutAddress}`;
    const response = await NetworkOps.get(url);
    if (!response.message) {
      return response;
    }
  }
}
