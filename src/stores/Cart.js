import { observable, computed, action, makeAutoObservable, runInAction } from 'mobx';
import AlertClass from 'app/src/utility/AlertClass';
import NetworkOps from 'app/src/network/NetworkOps';
import * as Urls from 'app/src/network/Urls';
import autobind from 'autobind-decorator';
import { flatMap, _ } from 'lodash';
import { strings } from 'app/src/utility/localization/Localized';
import { CartCouponType, SHIPPING_TYPE } from 'app/src/utility/constant/Constants';
import { showToast, searchFromArray, importantUpdateAlert } from 'app/src/utility/Utility';
import { trackEvent, addProductAction, removeProductAction } from 'app/src/utility/AnalyticsUtils';
import * as AsyncStore from 'app/src/utility/AsyncStoragesUtils';
import moment from 'moment';
import { CART_CREATED_PRESSED } from 'app/src/utility/GAEventConstants';
import { CreateCart } from './models/CartModel';
import { ProductModel } from './models/ProductModel';

const LOCALCARTS = AsyncStore.addPrefix('LOCALCARTS');
const SHOWIMPORTANTUPDATEWARNING = AsyncStore.addPrefix('showImportantUpdateWarning');
const DEVICE_ID = AsyncStore.addPrefix('deviceId');

export default class Cart {
      
  @observable cartInfo: Array<CreateCart> = [];
  @observable localCarts: Array<CreateCart> = [];
  @observable refreshCartInfo: Array<CreateCart> = [];
  @observable isLoading: boolean = false;      
  @observable searchedResult = {};
  @observable validatedDownline = {};
  @observable ordersList: Array = [];
  @observable offlineOrdersList: Array = [];
  @observable alreadyExistsDistributor = {};
  @observable orderItemsList = [];
  @observable productItemsList = [];
  @observable cartVouchers: Array =[];
  @observable isInventoryResponseReceived: Boolean = false;
  @observable responseSkuCodes = [];
  @observable cancellationAndReturnPolicy;
  @observable cancellationAndReturnPolicyTitle: string;
  @observable shopForObjectInfo = {};
  @observable originalCartInfo;
  @observable isBonusVoucherPvBvZero = '0'
  @observable deviceId = ''
  @observable isShowMoqStrip : Boolean = false;
  @observable isCncVoucherApplied = '0';
  @observable isProdVoucherApplied = '0';
  @observable lazyLoadPage : Number = 0
  @observable isPrompt = false;
  @observable isCartPopup = false;
  @observable promptText = "";
  @observable cartPopText = "";
  @observable recentOrders : Array = [];
  @observable courierDetails : Array = [];
  @observable movingToBaseLocation : Boolean = false;
  @observable courierTrackingDetails = {};
  @observable orderStatusDetails : Array;
  @observable gstObjectMessage='' ;

  /**
   * This variable will be used to identify origin api of selected log which can be either ApiV1 or ApiV2.
   */
  @observable isApiV2Payment = false;

  constructor(store) {
    this.store = store;
    makeAutoObservable(this);
  }

  @action setCourierTrackingDetails = value => (this.courierTrackingDetails = value);
  @action setOrderStatusDetails = value => (this.orderStatusDetails = value);
  @action setRecentOrder = value => (this.recentOrders = value);
  @action setIsApiV2Payment = value => (this.isApiV2Payment = value);
  @action setLocalCarts = value => (this.localCarts = value);
  @action setIsLoading = value => (this.isLoading = value);
  @action setIsCncVoucherApplied = value => (this.isCncVoucherApplied = value);
  @action setIsProdVoucherApplied = value => (this.isProdVoucherApplied = value);
  @action setIsInventoryResponseReceived = value => (this.isInventoryResponseReceived = value);
  @action setOrdersList = value => (this.ordersList = value);
  @action setOfflineOrdersList = value => (this.offlineOrdersList = value);
  @action setIsBonusVoucherPvBvZero = value => (this.isBonusVoucherPvBvZero = value);
  @action setIsShowMoqStrip = value => (this.isShowMoqStrip = value);
  @action setGstMessage = value => (this.gstObjectMessage = value);

  @action reset() {
    // this.ordersList = [];
    this.cartInfo = [];
    // this.refreshCartInfo = []
    this.cartVouchers = [];
    this.localCarts = [];
    this.searchedResult = {}
  }

  @action setApiV2Payment = value => {
    this.setIsApiV2Payment(value == 'Web_V2');
  };

  @computed get selectingCarts() {
    return this.usersCart.filter(cart => cart.cartDistributorId != this.store.auth.distributorID)
  }

  @computed get usersCart() {
    return [...this.cartInfo, ...this.localCarts];
  }

  @computed get totalPrice() {
    let totalPrice = 0
    this.cartInfo && this.cartInfo.forEach((cart) => {
      totalPrice += cart.totalCost
    })
    return totalPrice
  }

  @computed get totalPoints() {
    let totalPoints = 0
    if (this.isCncVoucherApplied == '0') {
      this.cartInfo && this.cartInfo.forEach((cart) => {
        totalPoints += cart.totalPVPoint
      })
    }
    return totalPoints;
  }

  /** @description this will handle inventory message as per selected address type and shipping type */
  @computed get getInventoryMessage() {
    const {fetchIsWarehouseShipping, isWarehouseAvailable, defaultActiveAddressType} = this.store.profile
    if (fetchIsWarehouseShipping != '1' && isWarehouseAvailable && defaultActiveAddressType === 'Home-Delivery') {
      return strings.viewCartScreen.cartInventoryMessageWithSuggestion;
    }
    return strings.viewCartScreen.singleCartInventoryMessage;
  }

  //*****************Generating distinct skuCodes list from CartInfo Object.************************

  @computed get skuCodes() {
    let skuCodes = [];
    this.cartInfo && this.cartInfo.forEach((cartObject) => {
      cartObject.cartProducts && cartObject.cartProducts.forEach((cartProduct) => {
        if (skuCodes.indexOf(cartProduct.skuCode) === -1) {
          skuCodes.push(cartProduct.skuCode);
        }
      })
    })
    return skuCodes;
  }

  //*****************Getting Inventory for the products added in Cart.************************

  @action async checkInventory(data, showInventoryLoader, warehouseLocationId) {
    if(showInventoryLoader) {
      this.setIsLoading(true);
    }
    this.setIsInventoryResponseReceived(false);
    const handleInventoryEnum = this.store.appConfiguration.isApiV2Enabled
      ? Urls.ServiceEnum.InventoryCheckApiV2
      : Urls.ServiceEnum.InventoryCheck;
    const locationIdInfo = warehouseLocationId
      ? `locationId=${warehouseLocationId}`
      : this.store.profile.location;
    const url = `${handleInventoryEnum}${locationIdInfo}${Urls.DistributorServiceEnum.ProductCodeParams}${data.toString()}`;
    const response = await NetworkOps.get(url);
    if(showInventoryLoader) {
      this.setIsLoading(false);
    }
    if(!response.message) {
      this.responseSkuCodes = response;
      this.setIsInventoryResponseReceived(true);
      return true;
    }
    return false;
  }

  //*****************marking & Deleting out of stock products from cart.************************

  @action async OutOfStockProducts(products) {
    this.setIsLoading(true);
    console.log('resprod', JSON.stringify(products))
    const removeOutOfStockResponse = await NetworkOps.postToJson(`${Urls.ServiceEnum.outOfStock}`, products);
    console.log('resdelete',removeOutOfStockResponse);
    this.setIsLoading(false);
  }

  //****************Deleting multiple products from cart at once.************************

  @action async deleteMultipleProducts(products) {
    this.setIsLoading(true);
    console.log('resprod', JSON.stringify(products))
    const res = await NetworkOps.postToJson(`${Urls.ServiceEnum.removeMultipleProduct}`, products);
    console.log('resdelete',res);
    this.setIsLoading(false);
  }

  //*****************Generating a list of objects with required total quantity and SkuCodes from cartInfo.************************

  @computed get getSkuCodesAndTotalQuantity() {
    let skuCodesAndProductQuantityList = [];
    let skuCodeQuantityObj = { 
      skuCode: '',
      quantity: 0
    }
    this.cartInfo.forEach((cartObject) => {
      cartObject.cartProducts && cartObject.cartProducts.forEach((cartProduct) => {
        const index = skuCodesAndProductQuantityList.findIndex(x => x.skuCode === cartProduct.skuCode);
        if(index === -1 ) {
          skuCodeQuantityObj = {
            skuCode: cartProduct.skuCode,
            quantity: cartProduct.quantity
          }
          skuCodesAndProductQuantityList.push(skuCodeQuantityObj)
        }
        else {
          skuCodesAndProductQuantityList[index].quantity = skuCodesAndProductQuantityList[index].quantity + cartProduct.quantity
        }
      })
    })
    return skuCodesAndProductQuantityList
  }

  //*****************Checking Cart Products against the Inventory received from the API.************************

  @computed get noInventoryProducts() {
    let noInventoryProductsList = [];
    this.getSkuCodesAndTotalQuantity && this.getSkuCodesAndTotalQuantity.forEach( (obj) => {
      if(this.isInventoryResponseReceived) {
        const index = this.responseSkuCodes.findIndex( x => x.itemCode === obj.skuCode );
        if(index === -1 ) {
          noInventoryProductsList.push(obj.skuCode);
        }
        else {
          if(obj.quantity > this.responseSkuCodes[index].availableQuantity) {
            noInventoryProductsList.push(obj.skuCode);
          }
        } 
      }
    })
    return noInventoryProductsList
  }

  @computed get totalProductsCount() {
    let count = 0;
    this.cartInfo.forEach( (cart) => {
      cart.cartProducts && cart.cartProducts.forEach( (cartProduct) => {
        count = count + cartProduct.quantity
      })
    })
    return count 
  }

  @computed get getSelfCartProductsList() {
    const selfCartObject = this.cartInfo.find( obj => obj.cartDistributorId == this.store.auth.distributorID )
    if(selfCartObject) {
      return selfCartObject.cartProducts
    }
    return []
  }

  @action updateShopForObject(selfOrDownlineCartName = 'Self', distributorID, cartType = 'SELF') {
    this.shopForObjectInfo = {
      cartTitle: selfOrDownlineCartName == 'Self' ? 'Your Cart' : selfOrDownlineCartName,
      distributorID: distributorID,
      cartType: cartType,
    };
  }

  async moveCartLocalToServer(){
    this.cartInfo.forEach(cart=>{
      this.localCarts.forEach((localCartItem, index)=>{
        if(localCartItem.cartId === cart.cartId) {
          this.localCarts.splice(index,1);
        }
      })
    })
    await AsyncStore.set(LOCALCARTS, JSON.stringify(this.localCarts.slice()));
  }

  async fetchCartData(promotionEnabled) {
    this.setIsLoading(true);
    await this.fetchCart(promotionEnabled);
    this.setIsLoading(false);
  }


  async fetchPromoData(index) {
    console.log(index)
    const viewCartInfo = index === undefined ? this.originalCartInfo : [this.originalCartInfo[index]];
    console.log(viewCartInfo)
    const data = viewCartInfo.map((viewCart,index) => {
      return new CreateCart(viewCart, this.store, true, index)
    })
    runInAction(() => {
      this.refreshCartInfo = this.cartInfo = data;
      console.log(JSON.stringify(data))
      this.setIsInventoryResponseReceived(false);
    });
    await this.moveCartLocalToServer();
  }


  async fetchCart(promotionEnabled, index) {
    const existingCarts = JSON.parse(await AsyncStore.get(LOCALCARTS));
    if(existingCarts && existingCarts.length > 0) {
    runInAction(() => {
      this.localCarts = existingCarts.map((cart) => {
        return new CreateCart(cart)
      })})
    }
    this.setLocalCarts(existingCarts ? existingCarts : []);
    const cartEnum = this.store.appConfiguration.isApiV2Enabled ? Urls.ServiceEnum.CartApiV2 : Urls.ServiceEnum.Cart;
    const shoppigForDownlineParams = `?downlineId=${this.shopForObjectInfo.distributorID}`
    const viewCartInfo = await NetworkOps.get(`${cartEnum}/${Urls.CartServiceEnum.ViewCart}/${this.store.auth.distributorID}${shoppigForDownlineParams}`);
    // console.log("responseresponse"+JSON.stringify(viewCartInfo))
    if(!viewCartInfo.message) {
      this.originalCartInfo = viewCartInfo;
      if(index) {
        viewCartInfo.map((data, index) => {
          this.modifyCartInfo('INIT', index);
        });
      }
      const data = await viewCartInfo.map((viewCart,index) => {
        return new CreateCart(viewCart, this.store, promotionEnabled, index)
      })
      runInAction(() => {
        this.refreshCartInfo = this.cartInfo = data;
        if (this.refreshCartInfo.length > 0) {
          this.isPrompt = this.refreshCartInfo[0].isPrompt;
          this.isCartPopup = this.refreshCartInfo[0].isCartPopup;
          this.promptText = this.refreshCartInfo[0].promptText;
          this.cartPopText = this.refreshCartInfo[0].cartPopText;
        }
        this.setIsInventoryResponseReceived(false);
      });
      // if(this.originalCartInfo.length > 0){
      //   // this.originalCartInfo[0].isCartPopup
      //   console.log("responseresponse"+JSON.stringify(this.originalCartInfo[0].isCartPopup))
      // }
      await this.moveCartLocalToServer();
      this.cartInfo && promotionEnabled && this.skuCodes.length > 0 && this.checkInventory(this.skuCodes);
    }
    else {
      runInAction(() => {
        this.refreshCartInfo = this.cartInfo = [];
      });
    }

    this.getCheckGstDistributor(this.shopForObjectInfo.distributorID);

  }

  /**
   * @description Used for validating the downline, used in kyc, daf, pan/bank module currently
   */
  async validateDownline (distributorId, submitButton, upline) {
    this.validatedDownline = {};
    if(distributorId === this.store.auth.distributorID) {
      AlertClass.showAlert('', strings.addToCart.downlineSearchError);
    }
    else {
      this.setIsLoading(true);
      this.invalidDistributorID = false;
      const url=`${Urls.ServiceEnum.Distributor}/${Urls.DistributorServiceEnum.ValidateDistributor}${distributorId}${'&upLineId='}${this.store.auth.distributorID}`;
      try{
        if(submitButton) {
          this.store.network.isLoading = true;
        }
        const response = await NetworkOps.get(url);
        this.setIsLoading(false);
        if(!response.message) {
          // console.log(JSON.stringify(response))
          this.validatedDownline = response;
          if(submitButton) {
            let downLineObject = {
              distributorName: response.firstName+ ' '+response.lastName,
              distributorId: response.downlineId
            }
            const isDownlineAvailable = await this.store.network.fetchNetworkDownline(downLineObject);
            !isDownlineAvailable && showToast(strings.errorMessage.signUp.noDownlineFound);
          }
        }
        else {
          if(submitButton) {
            this.store.network.isLoading = false;
          }
          this.setIsLoading(false);
          if(upline){
            return response;
          }
          else{
            showToast(response.message);
          }
        }
      }
      catch(error){
        this.setIsLoading(false);
        this.store.network.isLoading = false;
      }
    }
  }

  /**
   * @description As per the requirement, Almost same as validateDownline api but with some
   *              diffrent validations. currently used in signup and shoping module.
   */
  async validateUser (distributorId, submitButton, upline) {
    this.validatedDownline = {};
    if (distributorId === this.store.auth.distributorID) {
      // AlertClass.showAlert('', strings.addToCart.downlineSearchError);
      return { success: false, message: strings.addToCart.downlineSearchError };
    }
    else {
      this.setIsLoading(true);
      this.invalidDistributorID = false;
      const params = `?uplineId=${this.store.auth.distributorID}&downlineId=${distributorId}&locationId=${this.store.profile.defaultCater.locationId}`
      const url=`${Urls.ServiceEnum.validateUser}${params}`;
      try{
        // if(submitButton) {
        //   this.store.network.isLoading = true;
        // }
        const response = await NetworkOps.get(url);
        this.setIsLoading(false);
        if(!response.message) {
          this.validatedDownline = response;
          // if(submitButton) {
          //   let downLineObject = {
          //     distributorName: response.firstName+ ' '+response.lastName,
          //     distributorId: response.downlineId
          //   }
          //   const isDownlineAvailable = await this.store.network.fetchNetworkDownline(downLineObject);
          //   !isDownlineAvailable && showToast(strings.errorMessage.signUp.noDownlineFound);
          // }
        }
        else {
          // if(submitButton) {
          //   this.store.network.isLoading = false;
          // }
          this.setIsLoading(false);
          if(upline){
            return response;
          }
          else{
            showToast(response.message);
          }
        }
      }
      catch(error){
        this.setIsLoading(false);
        // this.store.network.isLoading = false;
      }
    }
  }

  /**
   * @description Used only for mini DLCP user, same signature as validateUser but will only validate if distributor is a registered in vestige
   *              and other shopping related validation.
   */
  async validateOtherUser(distributorId, submitButton, upline) {
    this.validatedDownline = {};
    if (distributorId === this.store.auth.distributorID) {
      AlertClass.showAlert('', strings.addToCart.downlineSearchError);
    }
    else {
      this.setIsLoading(true);
      this.invalidDistributorID = false;
      const params = `?uplineId=${this.store.auth.distributorID}&downlineId=${distributorId}&locationId=${this.store.profile.defaultCater.locationId}`;
      const url = `${Urls.ServiceEnum.validateOtherUser}${params}`;
      try {
        const response = await NetworkOps.get(url);
        this.setIsLoading(false);
        if (!response.message) {
          this.validatedDownline = response;
        }
        else {
          this.setIsLoading(false);
          if (upline) {
            return response;
          }
          showToast(response.message);
        }
      }
      catch (error) {
        this.setIsLoading(false);
      }
    }
  }

  async updateLocationOnCartAdd(cartId) {
    const createCartResponse = await  NetworkOps.putToJson(`${Urls.ServiceEnum.CartIdURL}${cartId}${Urls.ServiceEnum.CartAddress}`+this.store.profile.activeAddress.id,{});
    this.fetchCartData(false)
    
  }

  async createCart(createCartInfo) {
    this.setIsLoading(true);
    const createCartResponse = await NetworkOps.postToJson(`${Urls.ServiceEnum.Cart}`, createCartInfo);
    this.setIsLoading(false);
    console.log(createCartInfo)
    if(!createCartResponse.message){
      const newCart = {
        ...createCartResponse,
        createCartTime: moment().unix()
      }
      // trackEvent(CART_CREATED_PRESSED.eventCategory, CART_CREATED_PRESSED.events.NAVIGATE);
      runInAction(() =>{
        this.localCarts = [...this.localCarts, new CreateCart(newCart, this.store)]
      })
      await AsyncStore.set(LOCALCARTS, JSON.stringify(this.localCarts.slice()));
    }
    else {
      this.setIsLoading(false);
      return createCartResponse.message;
    }
  }

  async addProductToCart(products, value, cartId, cartDistributorID) {
    let cartProducts = [];
    let cartObject = {
      cartId: cartId,
      products: [],
      uplineId: this.store.auth.distributorID,
      distributorId: cartDistributorID,
      locationId: this.store.profile.defaultCater.locationId,
      deviceId: await AsyncStore.get(DEVICE_ID),
    };
    this.setIsLoading(true);
    let response;
    try{
      const url = `${Urls.ServiceEnum.Cart}/${Urls.CartServiceEnum.Product}`
      if(value && cartId) {
        products.quantity = value;
        cartObject.products.push(products);
        cartProducts.push(cartObject);
        const cartProduct = cartProducts[0].products[0]
        this.product = {
          id: cartProduct.skuCode,
          name: cartProduct.title,
          price: cartProduct.unitCost,
          quantity: 1,
        };
        // console.log(cartProducts)
        response = await NetworkOps.postToJson(url, cartProducts);
      }
      else {
        const productItem = products[0].products[0]
        products[0].locationId = this.store.profile.defaultCater.locationId
        products[0].deviceId = await AsyncStore.get(DEVICE_ID)
        this.product = {
          id: productItem.skuCode,
          name: productItem.title,
          price: productItem.unitCost,
          quantity: productItem.quantity,
        };
        response = await NetworkOps.postToJson(url, products);
      }
      this.setIsLoading(false);
      let responseAddedStatus = [];
      let cartNames = [];
      response && response.forEach(res=> {
        responseAddedStatus.push(res.addedStatus)
      })
      response && response.forEach(res=> {
        if(res.addedStatus == 0) {
          cartNames.push(res.distributorId);
        }
      })
      
      const allProductsAdded = responseAddedStatus.every(x => x === 1);
      const selfKycNotCompleted = responseAddedStatus.includes(2)
      const uplineDoingShopping = responseAddedStatus.includes(0)
      const productAdded = responseAddedStatus.includes(1)
      const showWarning = await AsyncStore.get(SHOWIMPORTANTUPDATEWARNING);

      if(!response.message) {
        // const payload = { products: [ this.product ], productAction: value === -1 ? removeProductAction : addProductAction }
        // trackEvent('CART_UPDATE_EVENT', 'Click', null, payload);
        if(response.length > 0 && (response[0].cartId != null && response[0].cartId != undefined)){
        this.updateLocationOnCartAdd(response[0].cartId)
        }
        await this.updateCart(response, false)
        if(allProductsAdded) {
          // if(this.store.profile.showImportantUpdateWarning && showWarning == 'false') {
          //   await importantUpdateAlert();
          // }
          // if(this.store.profile.isCartPopup){
          //   await importantUpdateAlert(this.store.profile.cartPopText);
          // }
          return { success: true, toast: 'Products added to Cart Successfully'}
        }
        else if(selfKycNotCompleted) {
          return { success: true, alert: 'Your KYC is not completed. Please complete your KYC to do shopping.', kycLink: true}
        }
        else if(productAdded && uplineDoingShopping) {
          // if(this.store.profile.showImportantUpdateWarning && showWarning == 'false') {
          //   await importantUpdateAlert();
          // }
          // if(this.store.profile.isCartPopup){
          //   await importantUpdateAlert(this.store.profile.cartPopText);
          // }
          return { success: true, toast: 'Products added to Cart Successfully', alert: `Product cannot be added to ${cartNames.toString()} Cart as some upline is already doing shopping for him/her.`}
        }
        else if(productAdded) {
          // if(this.store.profile.showImportantUpdateWarning && showWarning == 'false') {
          //   await importantUpdateAlert();
          // }
          // if(this.store.profile.isCartPopup){
          //   await importantUpdateAlert(this.store.profile.cartPopText);
          // }
          return { success: true,  toast: 'Product added to Cart Successfully'}
        }
        else if(uplineDoingShopping) {
          return { success: true,  alert: `Product cannot be added to ${cartNames.toString()} Cart as some upline is already doing shopping for him/her.`}
        }
        else {
          return { success: true, toast: 'There is an issue while adding product into any of the selected carts '}
        }
      }
      return { success: false, alert: response.message }
    }
    catch(error) {
      this.setIsLoading(false);
      return { success: false, alert: response.message }
    }
  }

  async removeProduct(cartID, product) {
    this.setIsLoading(true);
    console.log('Remove product')
    const productItem = {
      id: product.skuCode,
      name: product.title,
      price: product.unitCost,
      quantity: product.quantity,
    }
    let url;
    if (this.store.appConfiguration.isApiV2Enabled) {
      url = `${Urls.ServiceEnum.removeProduct}/${cartID}?skuCode=${product.skuCode}`;
    }
    else{
      url = `${Urls.ServiceEnum.Cart}/${cartID}?productid=${product.productId}`;
    }
    const response = await NetworkOps.delete(url);
    if(!response.message) {
      // const payload = { products: [ productItem ], productAction: removeProductAction }
      // trackEvent('DELETE_PRODUCT_EVENT', 'Click', null, payload);
      const cartToBeDeactivated = this.cartInfo.find(item =>  item.cartId === cartID)
      await this.updateCart(response, false)
      if(cartToBeDeactivated.cartProducts && cartToBeDeactivated.cartProducts.length === 1) {
        await this.removeCart(cartID)
      }
    }
    this.setIsLoading(false);
  }

  @autobind
  async updateCart(response, isPromotionsEnabled = false) {
    this.originalCartInfo = response
    const updatedCart = _.filter(response, {addedStatus : 1});
    const newCarts = await updatedCart.map((cart) => {
      return new CreateCart(cart, this.store, isPromotionsEnabled)
    })
    newCarts && newCarts.forEach(cart => {
      const index = this.cartInfo.map(e => e.cartId).indexOf(cart.cartId);
      if(index >= 0) {
        runInAction(() => {
          this.cartInfo[index] = cart;
          if(this.cartVouchers.length > 0) {
            this.cartInfo[index].giftVoucherInfo = this.cartVouchers[index].giftVoucherInfo;
          }
          if(this.cartInfo[index].giftVoucherInfo.length > 0) {
            this.cartInfo[index].appliedGiftVoucher = this.cartInfo[index].giftVoucherInfo[0].voucherSerialNumber
          }
        })
      } 
      else {
        this.cartInfo.push(cart);
      }
    })
    runInAction(() => {
      this.refreshCartInfo = this.cartInfo;
      this.setIsInventoryResponseReceived(false);
    });
    // this.cartInfo && this.skuCodes.length > 0 && this.checkInventory(this.skuCodes);
    await this.moveCartLocalToServer();
  }

  async removeCart(cartID) {
    this.setIsLoading(true);
    const { isApiV2Enabled } = this.store.appConfiguration;
    const url = `${isApiV2Enabled ? `${Urls.ServiceEnum.CartApiV2}/carts` : Urls.ServiceEnum.Cart}/delete?cartId=${cartID}&deletedBy=${this.store.auth.distributorID}`
    const response = await NetworkOps.delete(url);
    if (!response.message) {
      runInAction(() => {
        this.localCarts = this.localCarts.slice().filter(cart => cart.cartId != cartID)
        this.refreshCartInfo = this.cartInfo = this.cartInfo.slice().filter(cart => cart.cartId != cartID)
        this.cartVouchers = [];
      });
      await AsyncStore.set(LOCALCARTS, JSON.stringify(this.localCarts.slice()));
      if (this.store.profile.isWarehouseShipping == '1' && this.refreshCartInfo.length < 1) {
        this.store.profile.changeShippingType(SHIPPING_TYPE.regularDelivery)
      }
    }
    console.log(this.localCarts, this.refreshCartInfo, this.cartInfo)
    this.setIsLoading(false);
  }

  @action setCartInfo = (index: number, data) => {
    if(this.cartInfo[index] !== undefined) {
      this.cartInfo[index].paymentMethod = this.refreshCartInfo[index].paymentMethod = data.paymentType;
      this.cartInfo[index].giftVoucherInfo = this.refreshCartInfo[index].giftVoucherInfo = data.giftVoucherInfo;
    }
  }

  @action modifyCartInfo = (type: string, index: number, paymentType: string = '') => {
    switch (type) {
      case 'INIT' : {
        this.cartVouchers[index] = { 'paymentType': paymentType, giftVoucherInfo:[]}
        break;
      }
      case 'PAYMENTTYPE' : {
        this.cartVouchers[index].paymentType = paymentType
        break;
      }
      default: this.cartVouchers[index].giftVoucherInfo = []
    }
  }

  @action setSearchedResult(){
    this.searchedResult = {};
  }

  async searchDownline(downline,uplineValidate){
    this.setIsLoading(true);
    this.searchedResult = {};
    if(downline.trim()) {
      await this.validateDownline(downline,uplineValidate)
      this.searchedResult = this.validatedDownline;
      this.setIsLoading(false);
    }
    this.alreadyExistsDistributor = searchFromArray(this.searchedResult.downlineId,[...this.cartInfo,...this.localCarts]);    
  }

  @computed get getLastTenOrders() {
    let confirmedInvoiced =  this.ordersList.filter( item => item.statusName?.toUpperCase() === 'CONFIRMED' || item.statusName?.toUpperCase() === 'INVOICED' || item.statusName?.toUpperCase() === 'DELIVERED')
    const confirmedInvoicedSortedList = confirmedInvoiced.sort(function(a,b){
      return new Date(b.date) - new Date(a.date);
    });
    return confirmedInvoicedSortedList.slice(0, 10)
  }

  @computed get getConfirmedOrders() {
    let confirmedOrders =  this.ordersList.filter( item => item.statusName?.toUpperCase() === 'CONFIRMED')
    const confirmedOrdersSortedList = confirmedOrders.sort(function(a,b){
      return new Date(b.date) - new Date(a.date);
    });
    return confirmedOrdersSortedList;
  }

  @computed get getCancelledOrders() {
    let cancelledOrders =  this.ordersList.filter( item => item.statusName?.toUpperCase() === 'CANCELLED')
    const cancelledOrdersSortedList = cancelledOrders.sort(function(a,b){
      return new Date(b.date) - new Date(a.date);
    });
    return cancelledOrdersSortedList;
  }

  @computed get getInvoicedOrders() {
    let invoicedOrders =  this.ordersList.filter( item => item.statusName?.toUpperCase() === 'INVOICED')
    const invoicedOrdersSortedList = invoicedOrders.sort(function(a,b){
      return new Date(b.date) - new Date(a.date);
    });
    return invoicedOrdersSortedList;
  }

  @computed get getCreatedOrders() {
    let createdOrders =  this.ordersList.filter( item => item.statusName.toUpperCase() === 'CREATED')
    const createdOrdersSortedList = createdOrders.sort(function(a,b){
      return new Date(b.date) - new Date(a.date);
    });
    return createdOrdersSortedList;
  }

  @computed get getDeliveredOrders() {
    let deliveredOrders =  this.ordersList.filter( item => item.statusName?.toUpperCase() === 'DELIVERED')
    const deliveredOrdersSortedList = deliveredOrders.sort(function(a,b){
      return new Date(b.date) - new Date(a.date);
    });
    return deliveredOrdersSortedList;
  }

  @computed get repeatOrderProducts() {
    const isPromoKey = this.store.appConfiguration.isApiV2Enabled ? '0' : 'NO';
    const products = this.productItemsList.filter(product => product.isPromo === isPromoKey)
    const permittedValues = products.map(product => {
      return {quantity: product.quantity, skuCode: product.skuCode, isPromo: product.isPromo}
    });
    return permittedValues;
  }

  @computed get repeatOrderProductsWithRespectToCartModel() {
    const isPromoKey = this.store.appConfiguration.isApiV2Enabled ? 'NO' : 'NO';
    const products = this.productItemsList.filter(product => product.isPromo.toLocaleUpperCase() === isPromoKey.toLocaleUpperCase() && product.skuCode !== 'CR001') 
    const permittedValues = products.map(product => {
      return {
        quantity: product.quantity, 
        skuCode: product.skuCode, 
        imageUrl: product.url,
        isPromo: product.isPromo,
        productName: product.productName,
        discountPrice: product.productAmount,
        unitCost: product.unitCost,
      }
    });
    return permittedValues;
  }

  /**
   * @description This is used to fetch orders list. 
   * Note: ApiV2 will be used only as backend is handeling both ApiV1 & ApiV2 in same. (to fullfil requirement)
   */
  async fetchOrdersList(fromDate, toDate) {
    this.setIsLoading(true);
    this.setOrdersList([]);
    let url = '';
    // const params = `?fromOrderDate=${fromDate}&toOrderDate=${toDate}`;
    // if(this.store.appConfiguration.isApiV2Enabled){
    const distributorParams = `?distributorId=${this.store.auth.distributorID}&countryId=${ this.store.profile.defaultAddressCountryId}`;
    const paramsApiV2 = `?distributorId=${this.store.auth.distributorID}&fromOrderDate=${fromDate}&toOrderDate=${toDate}&countryId=${ this.store.profile.defaultAddressCountryId}`;
    url = `${Urls.ServiceEnum.TrackOrderApiV2}${fromDate  === 'From Date' ? distributorParams : paramsApiV2}`;
    // }
    // else{
    //   url = `${Urls.ServiceEnum.TrackOrder}/${this.store.auth.distributorID}${fromDate  === 'From Date' ? '' : params}`;
    // }
    const response = await NetworkOps.get(url);
    if(!response.message) {
      // const data = response.filter( item => !(item.paidOrder=='0' && item.tenderType == '2') )
      // const descendingDateOrderList = response.sort(function(a,b){
      //   return new Date(b.date) - new Date(a.date);
      // });
      this.setOrdersList(response);
    }
    this.setIsLoading(false);
  }

  async fetchOfflineOrdersList(fromDate, toDate) {
    this.setIsLoading(true);
    this.setOfflineOrdersList([]);
    let url = '';

    const distributorParams = `?distributorId=${this.store.auth.distributorID}&countryId=${ this.store.profile.defaultAddressCountryId}`;
    const paramsApiV2 = `?distributorid=${this.store.auth.distributorID}&fromdate=${fromDate}&todate=${toDate}&countryId=${ this.store.profile.defaultAddressCountryId}`;
    // url = `${Urls.ServiceEnum.OfflineOrderApi}${fromDate  === 'From Date' ? distributorParams : paramsApiV2}`;
    url = `${Urls.ServiceEnum.OfflineOrderApi}${paramsApiV2}`;

    const response = await NetworkOps.get(url);
    if(!response.message) {
      this.setOfflineOrdersList(response);
    }
    this.setIsLoading(false);
  }

  async getOrderDetails(orderNumber, invoiceNumber, logNumber, isApiV2) {
    const orderEnum = isApiV2 ? Urls.ServiceEnum.OrderDetailsApiV2 : Urls.ServiceEnum.OrderDetails;
    const url = `${orderEnum}/${this.store.auth.distributorID}${Urls.DistributorServiceEnum.OrderDetailParams}${orderNumber}&invoiceNo=${invoiceNumber || ''}&logNo=${logNumber}`;
    const response = await NetworkOps.get(url);
    if(response.length) {
      this.productItemsList = response;
      return true;
    }
    return false;
  }

  async getOrderInvoice(orderNumber, invoiceNumber) {
    this.setIsLoading(true);
    const countryId = this.store.profile.countryId;
    const url = `${Urls.ServiceEnum.DownloadInvoice}${Urls.CartServiceEnum.OrderID}${orderNumber}&invoiceNo=${invoiceNumber}&countryId=${countryId}`;
    const response = await NetworkOps.get(url);
    this.setIsLoading(false);
    if(response.url) {
      return response.url;
    }
    return undefined;
  }

  async getLogPayment(logNumber) {
    // const { isApiV2Enabled } = this.store.appConfiguration;
    const isApiV2Enabled = this.store.cart.isApiV2Payment;
    const logPaymentEnum = isApiV2Enabled ? Urls.ServiceEnum.getLogPaymentApiV2 : Urls.ServiceEnum.getLogPayment;
    const url = `${logPaymentEnum}${logNumber}`;
    const response = await NetworkOps.get(url);
    if(!response.message) {
      return { success: true, data: response }
    }
    return { success: false, message: response.message}
  }

  /**
   * @description This is used to fetch log list. 
   * Note: ApiV2 will be used only as backend is handeling both ApiV1 & ApiV2 in same. (to fullfil requirement)
   */
  async fetchOrderLogList(fromDate, toDate) {
    // const {isApiV2Enabled} = this.store.appConfiguration;
    const dateString = `fromDate=${fromDate}&toDate=${toDate}`
    // const url = `${isApiV2Enabled ? Urls.ServiceEnum.OrderLogListApiV2 : Urls.ServiceEnum.OrderLogList}${this.store.auth.distributorID}?${dateString}`;
    const url = `${Urls.ServiceEnum.OrderLogListApiV2}${this.store.auth.distributorID}?${dateString}`;
    let response = await NetworkOps.get(url);
    // console.log('CHECK', typeof response, Object.getOwnPropertyNames(response))
    if(!response.message && response?.name !== 404 && Object.keys(response)?.length > 0) {
      const data = []
      for(let key in response) {
        console.log('hello', key, response[key])
        if(key.trim() && response.hasOwnProperty(key)) {
          const item = {
            logNumber: key,
            [key]: response[key]
          }
          data.push(item)
        }
      }
      return { success: true, data: data }
    } 
    return { success: false, message: response?.message || `${strings.emptyScreenMessages.noDataFoundMessage}` }
  }

  updateMiUserLedger = async (logNumber) => {
    this.setIsLoading(true);
    const params = `?distributorId=${this.store.auth.distributorID}&logNumber=${logNumber}`;
    const url = `${Urls.ServiceEnum.miUserUpdateLedger}${params}`;
    const response = await NetworkOps.get(url);
    this.setIsLoading(false);
    if (!response.message) {
      return { success: true, data: response[0]?.data }
    }
    return { success: false, message: response.message}
  }

  //Voucher methods 
  async applyCoupon(voucherType, voucherCode, cart, index, itemIndex): boolean {
    const {isApiV2Enabled} = this.store.appConfiguration;
    this.setIsLoading(true);
    const handleDistributorEndPoint = isApiV2Enabled ? Urls.ServiceEnum.DistributorApiV2 : Urls.ServiceEnum.Distributor;
    const url = `${handleDistributorEndPoint}/${cart.cartDistributorId}${Urls.DistributorServiceEnum.CartGiftVoucher}${voucherType}?voucherNo=${voucherCode}&countryId=${this.store.profile.defaultAddressCountryId}`
    // const productRequest = {
    //   products: cart.cartProducts
    // }
    const response = await NetworkOps.get(url);
    // const response = {
    //   "giftVouchers": [
    //     {
    //       "giftVoucherCode": "GVD/23/00002",
    //       "voucherSerialNumber": "75H200223711A",
    //       "seriesId": 12,
    //       "distributorId": 11111251,
    //       "issueDate": "2023-10-05T17:00:27.623Z",
    //       "availedDate": null,
    //       "applicablefrom": "2022-10-06T12:14:41.047Z",
    //       "applicableTo": "2025-10-06T12:14:41.047Z",
    //       "voucherName": "testingvoucherdubai",
    //       "voucherDiscription": "Voucher for dubai",
    //       "minBuyAmount": 5,
    //       "productId": 1856,
    //       "quantity": 1,
    //       "productName": "Vestige Glucosamine 450 mg Tablets 60's",
    //       "distributorPrice": 0,
    //       "merchHierarchyDetailId": null,
    //       "promotionParticipation": true,
    //       "availed": false,
    //       "productImageUrl": null,
    //       "skuCode": "DB21001"
    //     },
    //     {
    //       "giftVoucherCode": "GVD/23/00002",
    //       "voucherSerialNumber": "75H200223711A",
    //       "seriesId": 12,
    //       "distributorId": 11111251,
    //       "issueDate": "2023-10-05T17:00:27.623Z",
    //       "availedDate": null,
    //       "applicablefrom": "2022-10-06T12:14:41.047Z",
    //       "applicableTo": "2025-10-06T12:14:41.047Z",
    //       "voucherName": "testingvoucherdubai",
    //       "voucherDiscription": "Voucher for dubai",
    //       "minBuyAmount": 5,
    //       "productId": 1878,
    //       "quantity": 1,
    //       "productName": "Vestige Colostrum 400 mg capsules",
    //       "distributorPrice": 0,
    //       "merchHierarchyDetailId": null,
    //       "promotionParticipation": true,
    //       "availed": false,
    //       "productImageUrl": null,
    //       "skuCode": "DB20008"
    //     }
    //   ]
    // };

    this.setIsLoading(false);
    console.log('Response from apply coupon',response)
    if (response && response.giftVouchers && response.giftVouchers.length > 
      0 && response.giftVouchers[0].distributorId === cart.cartDistributorId 
      && voucherType === CartCouponType.Gift) {
      // if (this.store.appConfiguration.isApiV2Enabled) {
      //   const giftMinBuyAmount = response.giftVouchers.minBuyAmount || response.giftVouchers[0].minBuyAmount;
      //   const giftAvailed = response.giftVouchers.availed || response.giftVouchers[0].availed;
      //   // if (cart.cost >= giftMinBuyAmount && !giftAvailed) {
      //     if (cart.cost >= response.giftVouchers.minBuyAmount && !response.giftVouchers.availed) {
      //     cart.giftVoucherInfo = this.cartVouchers[index].giftVoucherInfo = response
      //     cart.appliedGiftVoucher = voucherCode;
      //     return true;
      //   }
      // }
      // else {
        for (const giftProduct of response.giftVouchers) {
          if (cart.cost >= giftProduct.minBuyAmount && !giftProduct.availed) {
            cart.giftVoucherInfo = this.cartVouchers[index].giftVoucherInfo = response.giftVouchers
            cart.appliedGiftVoucher = voucherCode
            return true
          }
        }
      }
    // }
    else if (response && response.bonusVouchers && response.bonusVouchers.length > 0 && voucherType !== CartCouponType.Gift) {
      const bonusVoucher = response.bonusVouchers[0];
      const bonusCheck = this.store.appConfiguration.isApiV2Enabled
        ? bonusVoucher.status == 0 && cart.cartDistributorId === bonusVoucher.distributorId
        : bonusVoucher.status && bonusVoucher.canBeUsedAgain && cart.cartDistributorId === bonusVoucher.distributorId;

      if (bonusCheck) {
        // cart.appliedBonusVoucher = voucherCode
        if (bonusVoucher.isCncVoucher == '1' && cart.appliedBonusVoucher.length > 0) {
          return 2;
        }
     
        cart.appliedBonusVoucher.push(voucherCode)
        cart.bonusVoucherInfo.push(bonusVoucher)
        this.isBonusVoucherPvBvZero = bonusVoucher.isPvbvZero
        this.setIsCncVoucherApplied(bonusVoucher.isCncVoucher);
        if (bonusVoucher.chequeNo.toString().includes('PROD/')){
          this.setIsProdVoucherApplied('1');
          cart.bonusVoucherInfo[0].isCncVoucher=1;
        }
        if (bonusVoucher.isPvbvZero === '1' || bonusVoucher.isCncVoucher == '1' || bonusVoucher.chequeNo.toString().includes('PROD/')) {
          if (bonusVoucher.isCncVoucher == '1' && (cart.selectedPromotions.length || cart.qtyPromotions.length)) {
            setTimeout(() => showToast(strings.errorMessage.cartVoucher.SchemeBenefitMessage), 200);
          }

          if (bonusVoucher.chequeNo.toString().includes('PROD/')&&(cart.selectedPromotions.length || cart.qtyPromotions.length)) {
            this.setIsProdVoucherApplied('1');
            setTimeout(() => showToast(strings.errorMessage.cartVoucher.SchemeBenefitMessage), 200);
          }
          cart.qtyPromotions = [];
          cart.selectedPromotions = [];
        }
        return true;
      }
    }
    return false
  }

  async cancellationAndReturnPolicyInfo() {
    const url = `${Urls.ServiceEnum.AboutUs}/type/DeliveryCharges`
    const res = await NetworkOps.get(url);
    if (!res.message) {
      runInAction(() => {
        this.cancellationAndReturnPolicyTitle = res.title
        const aboutUsContent = '<html><head><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0"></head><body></body></html>' + res.description;
        this.cancellationAndReturnPolicy = aboutUsContent
      })
      return { status: true }
    }
    return { status: false, message: res.message }
  }

  async getCheckGstDistributor (distibutorId){
    const url = `${Urls.ServiceEnum.checkGstDistributor}?distributorId=${distibutorId}`
    // http://13.232.167.44:8080/cart/api/v1/checkGstDistributor?distributorId=62868326
    const data = {
      distributorId: distibutorId,
    
    }
    const response = await NetworkOps.get(url);
   
    if(response!=undefined && response.length>0){
      var gstNumber=response[0].gstNo;
      var message=response[0].isApplicableForGstInvoice;
      // alert(JSON.stringify(message));
      if(gstNumber!=undefined && gstNumber!=""){
        this.setGstMessage(message);
      }
    }else{
      this.setGstMessage("");
    }
    // if(response) {
      
    // }
    // this.setGstMessage('');
  }

  @action clearVoucher(index, type, cart){
    if(type === CartCouponType.Gift){
      cart.giftVoucherInfo = []
      cart.appliedGiftVoucher = ''
      this.modifyCartInfo('default', index)
    } 
    else {
      if(cart.appliedBonusVoucher.length == 1){
        cart.appliedBonusVoucher = []
        cart.bonusVoucherInfo = []
      }
      else{
        cart.bonusVoucherInfo.splice(index,1)
        cart.appliedBonusVoucher.splice(index,1)  
      }
    }
  }

  @action updateCartInfo() {
    this.refreshCartInfo = this.cartInfo;
  }

  @action refreshcartInfo() {
    this.refreshCartInfo = []
  }

  async cancelOrder(logNumber, amount, orderId, isApiV2){
    this.setIsLoading(true);
    const cancelOrder = isApiV2 ? Urls.ServiceEnum.CancelOrderApiV2 : Urls.ServiceEnum.CancelOrder;
    const url = `${cancelOrder}${this.store.auth.distributorID}/${Urls.DistributorServiceEnum.CancelOrder}${logNumber}&amount=${amount}&orderId=${orderId}`;
    const response = await NetworkOps.get(url);
    if(!response.message) {
      // await this.fetchOrdersList();
      this.setIsLoading(false);
      return {status: 'success', message: response.status};
    }
    this.setIsLoading(false);
    return {status: 'error', message: response.message };
  }

  async repeatOrder(lastOrder, repeatOrderScreenValues){
    this.setIsLoading(true);
    const cartEnum = this.store.appConfiguration.isApiV2Enabled ? Urls.ServiceEnum.CartApiV2 : Urls.ServiceEnum.Cart;
    const url = `${cartEnum}/${Urls.CartServiceEnum.RepeatOrder}`;
    const repeatOrderData = {
      uplineId: this.store.auth.distributorID,
      distributorId: lastOrder.distributorId,
      locationId: this.store.profile.defaultCater.locationId,
      cartName: lastOrder.distributorName,
      cartDetails: repeatOrderScreenValues ? repeatOrderScreenValues : this.repeatOrderProducts
    }
    //console.log('resrepeat', JSON.stringify(repeatOrderData))
    const response = await NetworkOps.postToJson(url, repeatOrderData);
    this.setIsLoading(false);
    const showWarning = await AsyncStore.get(SHOWIMPORTANTUPDATEWARNING);
    if(!response.message) {
      await this.updateCart(response, false)
      // if(this.store.profile.showImportantUpdateWarning && showWarning == 'false') {
      //   await importantUpdateAlert();
      // }
      // if(this.store.profile.isCartPopup){
      //   await importantUpdateAlert(this.store.profile.cartPopText);
      // }
      return {status: 'success', message: 'Products of last order successfully added to the cart.'};
    }
    return {status: 'error', message: response.message };
  }

  async repeatLastPurchase() {
    // this.isLoading = true;
    const repeatLastPurchaseEnum = this.store.appConfiguration.isApiV2Enabled ? Urls.ServiceEnum.RepeatLastOrderApiV2 : Urls.ServiceEnum.RepeatLastOrder;
    const url = `${repeatLastPurchaseEnum}/${this.store.profile.defaultCater.locationId}`
    const res = await NetworkOps.get(url);
    // this.isLoading = false;
    if(!res.message) {
      await this.updateCart(res, false)
      return { success: true }
    }
    return { success: false, message: res.message}
  }

  async searchProducts(val) {
    // const queryParams = `?${this.store.profile.location}&q=search=`;
    const queryParams = `?${this.store.profile.location}&countryId=${this.store.profile.defaultAddressCountryId}&isNewSession=${this.store.products.isNewSession}&q=search=`;
    const url = `${Urls.ServiceEnum.ProductList}${queryParams}${val}`;
    const res = await NetworkOps.get(url);
    if(!res.message) {
      const data = res.map((item) => {
        return new ProductModel(item)
      })
      return { success: true, data}
    }
    return { success: false, message: res.message}
  }

  /**
   * @description This is used to fetch recent order. 
   * Note: ApiV2 will be used only, as backend is handeling both ApiV1 & ApiV2 in same. (to fullfil requirement)
   */
  async fetchRecentOrders() {
    this.setIsLoading(true);
    this.setRecentOrder([]);
    // const trackOrderParams = this.store.appConfiguration.isApiV2Enabled ? Urls.ServiceEnum.TrackOrderApiV2 : Urls.ServiceEnum.TrackOrder;
    const trackOrderUrl = Urls.ServiceEnum.TrackOrderApiV2;
    const url = `${trackOrderUrl}/${this.store.auth.distributorID}${Urls.DistributorServiceEnum.RecentOrders}`;
    const res = await NetworkOps.get(url);
    this.setIsLoading(false);
    if(!res.message) {
      this.setRecentOrder(res);
      return { success: true }
    }
    return { success: false, message: res.message}
  }

  /**
   * @description This is implemented for nepal only at the moment.
   */
  async getCourierDetails(fromDate, toDate){
    this.setIsLoading(true);
    this.courierDetails = [];
    const url = `${Urls.ServiceEnum.CourierDetails}?distributorId=${this.store.auth.distributorID}&fromDate=${fromDate}&toDate=${toDate}`
    const res = await NetworkOps.get(url);
    this.setIsLoading(false);
    if(!res.message && res.length) {
      this.courierDetails = res;
      return { success: true }
    }
    return { success: false, message: res.message}
  }

  // /**
  //  * @description Tracking courier status using third party API of holisol
  //  */
  // async fetchHolisolCourierStatus(trackingNumber){
  //   this.isLoading = true;
  //   this.courierTrackingDetails = {};
  //   let request = {
  //     method: 'GET',
  //     header: {
  //       Accept: 'application/json',
  //       'Content-Type': 'application/json',
  //     },    
  //   };
  //   const url= `http://holisoldelivery.com/api/tracking/TrackMyOrder?awbNo=${trackingNumber}`;
  //   console.log('CourierstatusUrl',url)
  //   const resRaw = await fetch(url, request);
  //   this.isLoading = false;
  //   try{
  //     if(resRaw?.ok){
  //       const resText = await resRaw.text();
  //       const res = await JSON.parse(resText);
  //       console.log('resCourierstatus2',res)

  //       if(res && Object.keys(res).length > 1){
  //         this.courierTrackingDetails = res
  //         return { success: true}
  //       }
  //       else{
  //         return { success: false}
  //       }
  //     }
  //     else{
  //       return { success: false}
  //     }
  //   }
  //   catch(error){
  //     return {success: false}
  //   }
  // }

  /**
   * @description This will be used to show order Tracking status in myorder.
   */
  async orderStatusTracking(orderNumber, isApiV2){
    this.setIsLoading(true);
    this.setOrderStatusDetails([]);
    const params = `?orderNumber=${orderNumber}`
    const orderStatusEnum = isApiV2 ? Urls.ServiceEnum.orderStatusTrackingApiV2 : Urls.ServiceEnum.orderStatusTracking;
    const url = `${orderStatusEnum}${params}`;
    const res = await NetworkOps.get(url);
    this.setIsLoading(false);
    if(!res.message && Object.keys(res).length > 0) {
      this.orderStatusDetails = res;
      return { success: true, data: res }
    }
    return { success: false, message: res.message}
  }

  /**
   * @description This will be used to show shipment/courier Tracking status for order in myorder.
   */
  async courierTracking(data){
    this.setIsLoading(true);
    this.courierTrackingDetails = {};
    this.setCourierTrackingDetails({});
    const url = `${Urls.ServiceEnum.courierTracking}`
    const res = await NetworkOps.postToJson(url, data);
    this.setIsLoading(false);
    if(res.status == '200' && Object.keys(res.tracking).length > 0) {
      this.setCourierTrackingDetails(res.tracking);
      return { success: true }
    }
    else{
      return { success: false, message: res.message || res.statusMsg}
    }
  }

  /**
   * @description This will be used to submit transaction detail of payment made for log.( currently for philipines only)
   */
   async submitPaymentDetails(data){
    this.setIsLoading(true);
    const { isApiV2Enabled } = this.store.appConfiguration;
    const url = `${isApiV2Enabled ? Urls.ServiceEnum.submitPaymentDetailsV2 : Urls.ServiceEnum.submitPaymentDetails}/${this.store.auth.distributorID}`
    const res = await NetworkOps.postToJson(url, data);
    this.setIsLoading(false);
    if(!res.message) {
      return { success: true, data: res.data }
    }
    else{
      return { success: false, message: res.message}
    }
  }

  /**
   * @description This will be used to submit transaction detail of payment made for log.( currently for philipines only)
   */
  async fetchTicketEventDetails(data){
    this.setIsLoading(true);
    const url = `${Urls.ServiceEnum.fetchTicketEvents}/${this.store.auth.distributorID}`
    const res = await NetworkOps.postToJson(url, data);
    this.setIsLoading(false);
    if(!res.message) {
      return { success: true, data: res.data }
    }
    else{
      return { success: false, message: res.message}
    }
  }

  // @action async updateLocalCarts() {
  //   const existingCarts = JSON.parse(await AsyncStore.get(LOCALCARTS));
  //   const carts = _.filter(existingCarts, (cart) => {
  //     const currentDateTime = moment(new Date).unix();
  //     const hoursDiff = moment.duration(currentDateTime.diff(cart.createCartTime)).asHours() 
  //     return (hoursDiff < 4)
  //   });
  //   console.log(carts);
  // }
}