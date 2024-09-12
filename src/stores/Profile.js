import { action, observable, computed, makeAutoObservable, runInAction } from 'mobx';
import NetworkOps from 'app/src/network/NetworkOps';
import * as Urls from 'app/src/network/Urls';
import * as AsyncStore from 'app/src/utility/AsyncStoragesUtils';
import { get, _ } from 'lodash';
import Address from 'app/src/stores/models/AddressModel';
import {
  UserRole,
  MENU_LIST_CONFIG_LOCAL,
  SHIPPING_TYPE,
  SHIPPING_TYPE_ID,
  DISTRIBUTOR_TYPE_ENUM,
} from 'app/src/utility/constant/Constants';
import { strings } from 'app/src/utility/localization/Localized';
import { Platform } from 'react-native';
import analytics from '@react-native-firebase/analytics';
import { isNullOrEmpty } from '../utility/Utility';

const CHECKOUTADDRESS = AsyncStore.addPrefix('checkout-address');
const SELECTEDSHIPPINGTYPE = AsyncStore.addPrefix('selected_shipping_type');
const ISWAREHOUSESHIPPING = AsyncStore.addPrefix('is_warehouse_shipping');
const COUNTRY_ID = AsyncStore.addPrefix('country-id');
const SIDEMENUDATA = AsyncStore.addPrefix('SideMenuData');
const DEPTHLEVEL = AsyncStore.addPrefix('depth_level');
const CURRENTPOSITION = AsyncStore.addPrefix('current_position');
const options = { headerOverrides: { 'Content-Type': 'multipart/form-data' } };
const IS_KYC = AsyncStore.addPrefix('is_kyc');
const DISTRIBUTOR_TYPE = AsyncStore.addPrefix('DISTRIBUTOR_TYPE');
// const Analytics = Firebase.analytics();

export default class Profile {
  @observable isLoading: boolean = false;
  @observable title: string;
  @observable firstName: string = '';
  @observable lastName: string = '';
  @observable email: string = '';
  @observable dob: string = '';
  @observable gender: string = '';
  @observable distributorID: string = '';
  @observable uplineDistributorId: string = '';
  @observable mobileNumber: string;
  @observable addresses: Array = [];
  @observable recentAddress: Array = [];
  @observable addressDto: any;
  @observable addressSaveError: string;
  @observable isNetworkCount;
  @observable showImportantUpdateWarning = false;
  @observable coDistributorTitle: string;
  @observable coDistributorFirstName: string;
  @observable coDistributorLastName: string;
  @observable coDistributorDob: string;
  @observable hierarchyLevelId: Int = 0;
  @observable countryId: Int = -1;
  @observable directorDistributorId:string='';
  @observable directorDistributorMobNo:string='';
  @observable directorDistributorName:string='';
  @observable directorDistributorEmaild:string='';
  

  //User point details
  @observable currentCumulativePointValue: string;
  @observable exclusivePointValue: string;
  @observable groupPointValue: string;
  @observable previousCumuLativePointValue: string;
  @observable selfBusinessVolume: string;
  @observable selfPointValue: string;
  @observable totalBusinessVolume: string;
  @observable totalPointValue: string;
  @observable actualPv: string;
  @observable nextLevel: string;
  @observable shortPoint: string;
  @observable previousExclusivePv: string;
  @observable previousSelfPv: string;
  @observable previousTotalPv: string;
  @observable previousMonthLevel: string;
  @observable noOfDownline: string = '';
  @observable previousActualPv = '';
  @observable kycGuidelines: Array = [];

  //User Hierachy details
  @observable currentPosition: string;
  @observable nextPosition: string;
  @observable previousPosition: string;

  @observable storeLocation: string;
  // @observable activeDeliveryType: string;
  @observable shippingPincode: string;
  @observable baseLocationId: strings;

  // @observable isEkycDone: boolean; //change this validation on aadhar number
  // @observable isLocationSet: boolean = false;
  @observable kycMessage: string = '';

  @observable latestLocation: string = 'No address selected...';
  @observable addressType: string;

  @observable isWarehouseShipping: String = '0';
  @observable warehouseDeliveryType: String = '1';
  @observable selectedShippingType: String = SHIPPING_TYPE.regularDelivery;
  @observable cateringChangeCalled: Boolean = false;

  @observable notification: Array = [];

  @observable graphPvValue = [];
  @observable lastMonthLevel: string;

  @observable profileImageSource: string;
  @observable currentLevelId;
  @observable currentBonusPercent;

  @observable skipAddress: boolean;
  @observable checkoutAddress: Address;

  @observable availableBankDetails: Array = [];
  @observable menuConfigList: Array = [];
  @observable depthLevelConfigList: Array = [];

  //......Menu & other config related observables........
  @observable isMyPvVisible: boolean = true;
  @observable isGroupPvVisible: boolean = true;
  @observable isMyNetworkVisible: boolean = true;
  @observable isReferFriend: boolean = true;
  @observable isCategoriesShow = true;
  @observable isBrandsShow = true;
  @observable isReferFreind = true;
  @observable depth_level: boolean = true;
  @observable repeat_order: boolean = true;
  @observable wishlist_icon: boolean = true;
  @observable add_new_distributor_visible: boolean = true;
  @observable location_update: boolean = true;
  @observable category_name: boolean = true;
  @observable category_visible: boolean = true;
  @observable shop_name: boolean = true;
  @observable shop_visible: boolean = true;
  @observable Instruction_visible: boolean = true;
  @observable video_flag: boolean = true;
  @observable frequently_bought_together_visible: boolean = true;
  @observable add_cart_visible: boolean = true;
  @observable notify_me_visible: boolean = true;
  @observable explore_vestige_visible: boolean = true;
  @observable isVestigeMediaShow = true;
  @observable isCarHomeTripWinnersShow = true;
  @observable isBestDealPosterShow = true;
  @observable isBannerSliderShow = true;
  @observable isVestigeDemoShow = true;
  @observable isSuccessStoriesShow = true;
  @observable isPanBankShow = true;
  @observable isCategoryBrandBannersShow = true;

  @observable successJoineeList: Array = [];
  @observable pendingJoineeList: Array = [];
  @observable newsDetails: Array = [];
  @observable dynamicAlert: String = '';

  // mini dlcp user address
  @observable miUserShopForOthersAddressList: Array = [];
  @observable miUserShopForOthersSelectedAddress: Object = {};
  @observable miUserDefaultStore: Object = {};
  @observable miUserShopForOthersType: String = '2'; // similar case like warehouseDeliveryType key
  @observable isMiUserOnlineShoppingActive = 0;
  @observable v20qualifierData: Array = [];
  @observable Isv20_qulifierData: boolean = false;
  @observable v20qualifierRegiteraionData: Array = [];
  @observable IsableToregisterv20: boolean = false;
  @observable isDirectorId: String = '0';

  constructor(store) {
    this.store = store;
    makeAutoObservable(this);
  }

  @action setIsLoading = value => (this.isLoading = value);
  @action setCountryId = value => (this.countryId = value);
  @action setBaseLocationId = value => (this.baseLocationId = value);
  @action setKycMessage = value => (this.kycMessage = value);
  @action setNotification = value => (this.notification = value);

  @action setSelectedShippingType = value => (this.selectedShippingType = value);
  @action setIsExpressAvailable = value => (this.isExpressAvailable = value);
  @action setIsWarehouseShipping = value => (this.isWarehouseShipping = value);
  @action setIsWarehouseAvailable = value => (this.isWarehouseAvailable = value);
  @action setWarehouseDeliveryType = value => (this.warehouseDeliveryType = value);
  @action setCateringChangeCalled = value => (this.cateringChangeCalled = value);

  @action setAddresses = value => (this.addresses = value);
  @action setCheckoutAddress = value => (this.checkoutAddress = value);
  @action setRecentAddress = value => (this.recentAddress = value);
  @action setAddressSaveError = value => (this.addressSaveError = value);

  @action setMiUserShopForOthersAddressList = value => (this.miUserShopForOthersAddressList = value);
  @action setMiUserShopForOthersType = value => (this.miUserShopForOthersType = value);
  @action setMiUserShopForOthersSelectedAddress = value => (this.miUserShopForOthersSelectedAddress = value);
  @action setIsMiUserOnlineShoppingActive = value => (this.isMiUserOnlineShoppingActive = value);

  @action setDepthLevelConfigList = value => (this.depthLevelConfigList = value);
  @action setAvailableBankDetails = value => (this.availableBankDetails = value);
  @action setMenuConfigList = value => (this.menuConfigList = value);
  @action setPendingJoineeList = value => (this.pendingJoineeList = value);
  @action setSuccessJoineeList = value => (this.successJoineeList = value);
  @action setNewsDetails = value => (this.newsDetails = value);
  @action setV20Data = value => (this.v20qualifierData = value);
  @action setIsV20Qulifier = value => (this.Isv20_qulifierData = value);
  @action setIsV20registration = value => (this.v20qualifierRegiteraionData = value);
  @action setIsV20ableToRegister = value => (this.IsableToregisterv20 = value);
  

  @computed get username(): string {
    if (this.firstName) return `${this.firstName} ${this.lastName}`;
    return;
  }

  @computed get storeAddresses() {
    return this.recentAddress.filter(
      item => item.addressType === 'StorePickup',
    );
  }

  @computed get defaultShippingAddress(): Address {
    const shippingAddress = this.recentAddress.filter(
      item =>
        item.addressType &&
        item.addressType === 'Shipping' &&
        item.isDefault === true,
    );
    return shippingAddress[0];
  }

  @computed get defaultShippingType() {
    if (this.fetchIsWarehouseShipping == '1') {
      return SHIPPING_TYPE.warehouseDelivery;
    }
    if (this.selectedShippingType) {
      return this.selectedShippingType;
    }
    return SHIPPING_TYPE.regularDelivery;
  }

  @computed get isRegularAvailable() {
    if (this.defaultActiveAddressType === 'Home-Delivery') {
      const regularCatering = this.activeAddress?.caterLocationDTO?.filter(
        item =>
          item.shippingType === SHIPPING_TYPE_ID.regularDelivery &&
          !item.isWarehouse,
      );
      if (regularCatering?.length >= 1) {
        return true;
      }
      return false;
    }
    return false;
  }

  @computed get isExpressAvailable() {
    if (
      this.defaultActiveAddressType === 'Home-Delivery' &&
      this.activeAddress.isExpressShipping == SHIPPING_TYPE_ID.expressDelivery
    ) {
      return true;
    }
    return false;
  }

  @computed get isWarehouseAvailable() {
    if (this.defaultActiveAddressType === 'Home-Delivery') {
      const warehouseCater = this.activeAddress?.caterLocationDTO?.filter(
        item => item.isWarehouse,
      );
      if (warehouseCater?.length >= 1) {
        return true;
      }
      return false;
    }
    return false;
  }

  /**
   * @description To be used on all the place where Mini DLCP users flow may affect
   *              otherwise we can use isWarehouseShipping key dirrectly
   */
  @computed get fetchIsWarehouseShipping() {
    if (this.isMiUserShoppingForOthers) {
      return '1';
    }
    return this.isWarehouseShipping;
  }

  /**
   * @description To be used on all the place where Mini DLCP users flow may affect
   *              otherwise we can use WarehouseDeliveryType key dirrectly
   */
  @computed get fetchWarehouseDeliveryType() {
    if (this.isMiUserShoppingForOthers) {
      return this.miUserShopForOthersType;
    }
    return this.warehouseDeliveryType;
  }

  @computed get fetchRegularCatering() {
    let defaultCaterDTO = {
      locationName: '',
      locationCode: '',
      locationId: '',
      shippingType: '',
      isWarehouse: '',
    };
    if (this.defaultActiveAddressType === 'Home-Delivery') {
      const regularCatering = this.activeAddress?.caterLocationDTO?.filter(
        item =>
          item.shippingType === SHIPPING_TYPE_ID.regularDelivery &&
          !item.isWarehouse,
      );
      if (regularCatering?.length >= 1) {
        defaultCaterDTO.locationName = regularCatering[0]?.locationName;
        defaultCaterDTO.locationCode = regularCatering[0]?.locationCode;
        defaultCaterDTO.locationId = regularCatering[0]?.locationId;
        defaultCaterDTO.shippingType = regularCatering[0]?.shippingType;
        defaultCaterDTO.isWarehouse = regularCatering[0]?.isWarehouse;
      }
    }
    return defaultCaterDTO;
  }

  @computed get fetchExpressCatering() {
    let defaultCaterDTO = {
      locationName: '',
      locationCode: '',
      locationId: '',
      shippingType: '',
      isWarehouse: '',
    };
    if (this.defaultActiveAddressType === 'Home-Delivery') {
      const expressCatering = this.activeAddress?.caterLocationDTO?.filter(
        item =>
          item.shippingType === SHIPPING_TYPE_ID.expressDelivery &&
          !item.isWarehouse,
      );
      if (expressCatering?.length >= 1) {
        defaultCaterDTO.locationName = expressCatering[0]?.locationName;
        defaultCaterDTO.locationCode = expressCatering[0]?.locationCode;
        defaultCaterDTO.locationId = expressCatering[0]?.locationId;
        defaultCaterDTO.shippingType = expressCatering[0]?.shippingType;
        defaultCaterDTO.isWarehouse = expressCatering[0]?.isWarehouse;
      }
    }
    return defaultCaterDTO;
  }

  @computed get fetchWarehouseCatering() {
    let defaultCaterDTO = {
      locationName: '',
      locationCode: '',
      locationId: '',
      shippingType: '',
      isWarehouse: '',
    };
    if (this.defaultActiveAddressType === 'Home-Delivery') {
      const warehouseCatering = this.activeAddress?.caterLocationDTO?.filter(
        item => item.isWarehouse,
      );
      if (warehouseCatering?.length >= 1) {
        defaultCaterDTO.locationName = warehouseCatering[0]?.locationName;
        defaultCaterDTO.locationCode = warehouseCatering[0]?.locationCode;
        defaultCaterDTO.locationId = warehouseCatering[0]?.locationId;
        defaultCaterDTO.shippingType = warehouseCatering[0]?.shippingType;
        defaultCaterDTO.isWarehouse = warehouseCatering[0]?.isWarehouse;
      }
    }
    return defaultCaterDTO;
  }

  /**
   * @description In case of home delivery : the default {locationId, locationName, locationCode} of current address
   *              will be used from this method as per user's selected option.
   */
  @computed get defaultCateringForShipping() {
    if (this.fetchIsWarehouseShipping == '1') {
      return this.fetchWarehouseCatering;
    }
    if (this.defaultShippingType === SHIPPING_TYPE.expressDelivery) {
      return this.fetchExpressCatering;
    }
    return this.fetchRegularCatering;
  }

  /**
   * @description It will decide default catering info according to address type.
   * (only locationId, locationName, locationCode is getting used from this. Rest address info is used from other address method )
   */
  @computed get defaultCater() {
    const addressType =
      this.activeAddress?.addressType === 'Shipping'
        ? 'Home-Delivery'
        : 'Store Pick-up';
    return addressType === 'Home-Delivery'
      ? this.defaultCateringForShipping
      : this.activeAddress;
  }

  @computed get defaultActiveAddressType() {
    const addressType =
      this.activeAddress?.addressType === 'Shipping'
        ? 'Home-Delivery'
        : 'Store Pick-up';
    return addressType;
  }

  @computed get defaultStoreAddress(): Address {
    const storeAddress = this.recentAddress.filter(
      item =>
        item.addressType &&
        item.addressType === 'StorePickup' &&
        item.isDefault === true,
    );
    return storeAddress[0];
  }

  @computed get shippingAddress(): Address {
    const address = _.filter(this.addresses, {
      addressType: 'Shipping',
      isDefault: true,
    });
    return address.length > 0 ? address[0] : new Address();
  }

  @computed get residentialAddress(): Address {
    const address = _.filter(this.addresses, {
      addressType: 'Residential',
      isDefault: true,
    });
    return address.length > 0 ? address[0] : new Address();
  }

  @computed get isMiUserShoppingForOthers(): Address {
    const { auth, cart } = this.store;
    if (
      auth.distributorType === DISTRIBUTOR_TYPE_ENUM.miniDLCP &&
      cart.shopForObjectInfo?.cartType === 'DOWNLINE'
    ) {
      return true;
    }
    return false;
  }

  @computed get activeAddress(): Address {
    if (this.isMiUserShoppingForOthers) {
      return this.miUserShopForOthersSelectedAddress;
    }
    const address = _.filter(this.addresses, add => {
      return (
        (add.addressType === 'StorePickup' || add.addressType === 'Shipping') &&
        add.isDefault
      );
    });
    return address.length > 0
      ? address[0]
      : this.checkoutAddress
      ? JSON.parse(this.checkoutAddress)
      : new Address();
  }

  /**
   * @description for shopping purpose this country method is used, so that it stays configurable
   *              based on selected location.
   */
  @computed get defaultAddressCountryId() {
    if (this.store.auth.isGuestUser) return this.countryId;
    return this.activeAddress.countryId || undefined;
  }

  /** @description Mainly used in Product search or fetch apis, promotion api etc. It can be used if required similar behaiour  */
  @computed get location() {
    let param;
    if (this.countryId == 2 || this.store.auth.isGuestUser) {
      return `locationId=${this.baseLocationId}`;
    }
    if (isNullOrEmpty(this.activeAddress.addressType)) {
      return `locationId=${10}`;
    }
    switch (
      this.activeAddress &&
      this.activeAddress.addressType.toUpperCase()
    ) {
      case 'SHIPPING': {
        param = this.defaultCater.locationId
          ? this.defaultCater.locationId
          : this.activeAddress.pincode;
        return this.defaultCater.locationId
          ? `locationId=${param}`
          : `pincode=${param}`;
      }
      case 'STOREPICKUP': {
        param = this.defaultCater.locationId;
        return `locationId=${param}`;
      }
      default:
        return `locationId=${10}`;
    }
  }


  @computed get uploadedKycGuidelines(){
    return this.kycGuidelines.length > 0 ? this.kycGuidelines : [];
  }

  titleCase = str => {
    return (
      str &&
      str.toLowerCase().replace(/\b./g, a => {
        return a.toUpperCase();
      })
    );
  };

  @action reset() {
    this.firstName = '';
    this.lastName = '';
    this.currentPosition = '';
    this.nextPosition = '';
    this.noOfDownline = undefined;
    this.groupPointValue = undefined;
    this.selfPointValue = undefined;
    this.latestLocation = 'No address selected...';
    // isEkycDone = false;
    this.addresses = [];
    this.graphPvValue = [];
    this.availableBankDetails = [];
    this.lastMonthLevel = '';
    this.checkoutAddress = undefined;
    this.countryId = 1;
    this.baseLocationId = '';
    this.menuConfigList = [];
    this.depthLevelConfigList = [];
    this.isMyPvVisible = true;
    this.isGroupPvVisible = true;
    this.isMyNetworkVisible = true;
    this.isReferFriend = true;
    this.isCategoriesShow = true;
    this.isBrandsShow = true;
    this.isReferFreind = true;
    this.isVestigeMediaShow = true;
    this.isCarHomeTripWinnersShow = true;
    this.isBestDealPosterShow = true;
    this.isBannerSliderShow = true;
    this.isVestigeDemoShow = true;
    this.isSuccessStoriesShow = true;
    this.isPanBankShow = true;
    this.isCategoryBrandBannersShow = true;
    this.isNetworkCount = false;
    this.v20qualifierData=[];
    this.Isv20_qulifierData=false;
  }

  @action resetDashboardData = () => {
    this.currentPosition =
      this.nextPosition =
      this.lastMonthLevel =
      this.firstName =
      this.lastName =
      this.previousMonthLevel =
        '';
    this.selfPointValue = this.groupPointValue = undefined;
  };

  async fetchProfile() {
    this.setCheckoutAddress(await AsyncStore.get(CHECKOUTADDRESS));
    // this.selectedShippingType = await AsyncStore.get(SELECTEDSHIPPINGTYPE);
    // this.isWarehouseShipping = await AsyncStore.get(ISWAREHOUSESHIPPING);
    let url = `${Urls.ServiceEnum.Distributor}/${this.store.auth.distributorID}/v3`;
    if (this.store.auth.userRole === UserRole.Trainer) {
      url = `${Urls.ServiceEnum.TrainerProfile}${this.store.auth.distributorID}`;
    }

    const res = await NetworkOps.get(url);
    if (!res.message) {
      runInAction(() => {
        this.title = get(res, 'title', '');
        this.firstName = get(res, 'firstName');
        this.lastName = get(res, 'lastName');
        this.email = get(res, 'emailId', '');
        this.dob = get(res, 'dob', '');
        this.gender = get(res, 'gender', '');
        this.distributorID = get(res, 'distributorId', '');
        this.hierarchyLevelId = get(res, 'hierarchyDepthLevel', '0');
        this.uplineDistributorId = get(res, 'uplineDistributorId', '');
        this.dynamicAlert = get(res, 'alertMessageCNC', '');
        this.mobileNumber = get(res, 'mobileNumber', '');
        this.profileImageSource = get(res, 'imageName');

        this.coDistributorTitle = get(res, 'coDistributorTitle', '');
        this.coDistributorFirstName = get(res, 'coDistributorFirstName', '');
        this.coDistributorLastName = get(res, 'coDistributorLastName', '');
        this.coDistributorDob = get(res, 'coDistributorDob', '');
        this.directorDistributorId = get(res, 'directorDistributorId', '');
        this.directorDistributorMobNo = get(res, 'directorDistributorMobNo', '');
        this.directorDistributorName = get(res, 'directorDistributorName', '');
        this.directorDistributorEmaild = get(res, 'directorDistributorEmaild', '');
        this.isDirectorId = get(res, 'isDirectorId', '0');
    
        this.storeLocation = get(res, 'storeLocation', '');
        // this.activeDeliveryType = get(res,'activeDeliveryType','')
        this.shippingPincode = get(res, 'shippingPincode', '');
        this.isNetworkCount = get(res, 'isNetworkCount', true);
        this.showImportantUpdateWarning = get(
          res,
          'showImportantUpdateWarning',
          true,
        );
      });
      const distributorType = get(res, 'distributorType', '0');
      if (this.store.auth.distributorType !== distributorType) {
        this.store.auth.setDistributorType(distributorType);
        await AsyncStore.set(DISTRIBUTOR_TYPE, distributorType);
      }
      // this.isLocationSet = get(res, 'activeDeliveryType')

      const isKyc = get(res, 'isKyc');
      if (isKyc && isKyc != '') {
        await AsyncStore.set(IS_KYC, isKyc);
        this.store.auth.setIsKyc(isKyc);
      }

      const shippingTypeValue = get(res, 'shippingType', '0');
      this.setSelectedShippingType(
        shippingTypeValue === '1'
          ? SHIPPING_TYPE.expressDelivery
          : SHIPPING_TYPE.regularDelivery,
      );
      await AsyncStore.set(SELECTEDSHIPPINGTYPE, this.selectedShippingType);

      const warehouseShipping = get(res, 'isWarehouseShipping', '0');
      this.setIsWarehouseShipping(warehouseShipping);
      this.setWarehouseDeliveryType(get(res, 'warehouseDeliveryType', '1'));
      // await AsyncStore.set(SELECTEDSHIPPINGTYPE, this.selectedShippingType);

      const userAddresses = get(res, 'distributorsAddress');
      const formatedAddress = await userAddresses?.map(address => {
        return new Address(address);
      });
      this.setAddresses(formatedAddress);
      // console.log('helllo', this.checkoutAddress)
      if (!this.checkoutAddress) {
        const address = _.filter(this.addresses, add => {
          return (
            (add.addressType === 'StorePickup' ||
              add.addressType === 'Shipping') &&
            add.isDefault
          );
        });
        this.setCheckoutAddress(address[0]);
        this.checkoutAddress &&
          (await AsyncStore.set(CHECKOUTADDRESS, JSON.stringify(address[0])));
      }

      // let c_ID = this.addresses[0].countryId ? this.addresses[0].countryId : 1 //JSON.parse(this.checkoutAddress).countryId ? JSON.parse(this.checkoutAddress).countryId : 1;
      // this.countryId = parseInt(c_ID)
      // await AsyncStore.set(COUNTRY_ID, String(this.countryId));
      // try{
      // let checkStore = await AsyncStore.get(SIDEMENUDATA);
      // if (checkStore == null || checkStore == undefined || checkStore == "" || checkStore.length <= 0) {
      //    this.getUserMenuConfig(this.addresses[0])
      // }
      // else {
      //   this.menuConfigList = JSON.parse(checkStore);
      //   this.getFlagForPvNetworkForNepal(this.menuConfigList)
      // }
      // }
      // catch{}
      this.fetchv20qualifier();
      // this.fetchv20Registerqualifier();
    }
  }

  async getDepthLevelInfo(countryID, hierarchyLevelId) {
    // let countryID = item.countryId ? item.countryId : 0

    const url = `${Urls.ServiceEnum.getDepthLevel + countryID}`;
    const response = await NetworkOps.get(url);
    if (!response.message) {
      this.setDepthLevelConfigList(response);

      let arrrr = response.filter(
        item =>
          item.hierarchyLevelName.toLowerCase() ==
          this.currentPosition.toLowerCase(),
      );
      if (arrrr.length > 0) {
        let objj = arrrr[0];
        var depthLevel = objj.depthLevel;
        depthLevel = depthLevel + parseInt(hierarchyLevelId);
        await AsyncStore.set(DEPTHLEVEL, String(depthLevel));
      }
    }
  }

  async getUserMenuConfig(countryID) {
    const url = `${Urls.ServiceEnum.getMenuConfig + countryID}`;
    const response = await NetworkOps.get(url);
    if (!response.message) {
      this.setMenuConfigList(response);
      // this.menuConfigManageLocally(this.menuConfigList);
      await AsyncStore.set(SIDEMENUDATA, JSON.stringify(response));
      this.getFlagForPvNetworkForNepal(this.menuConfigList);
    }
  }

  async menuConfigManageLocally(menuConfigList) {
    // for(let i = 0; i< menuConfigList.length; i++)
    //   {
    //     let obj = menuConfigList[i];
    //     if(obj.menuName == MENU_LIST_CONFIG_LOCAL.DEPTH_LEVEL){
    //       this.depth_level = obj.isActive
    //     }
    //     else if(obj.menuName == MENU_LIST_CONFIG_LOCAL.REPEAT_ORDER){
    //       this.repeat_order = obj.isActive
    //     }
    //     else if(obj.menuName == MENU_LIST_CONFIG_LOCAL.WISHLIST_ICON){
    //       this.wishlist_icon = obj.isActive
    //     }
    //     else if(obj.menuName == MENU_LIST_CONFIG_LOCAL.ADD_NEW_DISTRIBUTOR_VISIBLE){
    //       this.add_new_distributor_visible = obj.isActive
    //     }
    //     else if(obj.menuName == MENU_LIST_CONFIG_LOCAL.LOCATION_UPDATE){
    //       this.location_update = obj.isActive
    //     }
    //     else if(obj.menuName == MENU_LIST_CONFIG_LOCAL.CATEROGY_NAME){
    //       this.category_name = obj.isActive
    //     }
    //     else if(obj.menuName == MENU_LIST_CONFIG_LOCAL.CATEGORY_VISIBLE){
    //       this.category_visible = obj.isActive
    //     }
    //     else if(obj.menuName == MENU_LIST_CONFIG_LOCAL.SHOP_NAME){
    //       this.shop_name = obj.isActive
    //     }
    //     else if(obj.menuName == MENU_LIST_CONFIG_LOCAL.SHOP_VISIBLE){
    //       this.shop_visible = obj.isActive
    //     }
    //     else if(obj.menuName == MENU_LIST_CONFIG_LOCAL.INSTRUCTION_VISIBLE){
    //       this.Instruction_visible = obj.isActive
    //     }
    //     else if(obj.menuName == MENU_LIST_CONFIG_LOCAL.VIDEO_FLAG){
    //       this.video_flag = obj.isActive
    //     }
    //     else if(obj.menuName == MENU_LIST_CONFIG_LOCAL.FREQUENTLY_BOUGHT_TOGETHER_VISIBLE){
    //       this.frequently_bought_together_visible = obj.isActive
    //     }
    //     else if(obj.menuName == MENU_LIST_CONFIG_LOCAL.ADD_CART_VISIBLE){
    //       this.add_cart_visible = obj.isActive
    //     }
    //     else if(obj.menuName == MENU_LIST_CONFIG_LOCAL.NOTIFY_ME_VISIBLE){
    //       this.notify_me_visible = obj.isActive
    //     }
    //     else if(obj.menuName == MENU_LIST_CONFIG_LOCAL.EXPLORE_VESTIGE_VISIBLE){
    //       this.explore_vestige_visible = obj.isActive
    //     }
    // }
  }

  @action
  async getFlagForPvNetworkForNepal(nepalDataList) {
    if (
      nepalDataList != null &&
      nepalDataList != '' &&
      nepalDataList != undefined &&
      nepalDataList.length > 0
    ) {
      for (let i = 0; i < nepalDataList.length; i++) {
        if (nepalDataList[i].menuName === 'My Pv') {
          this.isMyPvVisible = nepalDataList[i].isActive;
        } else if (nepalDataList[i].menuName === 'My Group PV') {
          this.isGroupPvVisible = nepalDataList[i].isActive;
        } else if (nepalDataList[i].menuName === 'Refer a Friend') {
          this.isReferFriend = nepalDataList[i].isActive;
        } else if (nepalDataList[i].menuName === 'Refer a Friend') {
          this.isReferFriend = nepalDataList[i].isActive;
        } else if (nepalDataList[i].menuName === 'Categories') {
          this.isCategoriesShow = nepalDataList[i].isActive;
        } else if (nepalDataList[i].menuName === 'Brands') {
          this.isBrandsShow = nepalDataList[i].isActive;
        } else if (nepalDataList[i].menuName === 'vestige_demo') {
          this.isVestigeDemoShow = nepalDataList[i].isActive;
        } else if (nepalDataList[i].menuName === 'banner_slider') {
          this.isBannerSliderShow = nepalDataList[i].isActive;
        } else if (nepalDataList[i].menuName === 'best_deal_poster') {
          this.isBestDealPosterShow = nepalDataList[i].isActive;
        } else if (nepalDataList[i].menuName === 'car_home_trip_winners') {
          this.isCarHomeTripWinnersShow = nepalDataList[i].isActive;
        } else if (nepalDataList[i].menuName === 'vestige_media') {
          this.isVestigeMediaShow = nepalDataList[i].isActive;
        } else if (nepalDataList[i].menuName === 'success_stories') {
          this.isSuccessStoriesShow = nepalDataList[i].isActive;
        } else if (nepalDataList[i].menuName === 'pan_bank') {
          this.isPanBankShow = nepalDataList[i].isActive;
        } else if (nepalDataList[i].menuName === 'category_brand_banners') {
          this.isCategoryBrandBannersShow = nepalDataList[i].isActive;
        } else if (nepalDataList[i].menuName === 'depth_level') {
          this.depth_level = nepalDataList[i].isActive;
        } else if (nepalDataList[i].menuName === 'repeat_order') {
          this.repeat_order = nepalDataList[i].isActive;
        } else if (nepalDataList[i].menuName === 'wishlist_icon') {
          this.wishlist_icon = nepalDataList[i].isActive;
        } else if (nepalDataList[i].menuName == 'Instruction_visible') {
          this.Instruction_visible = nepalDataList[i].isActive;
        } else if (nepalDataList[i].menuName == 'explore_vestige_visible') {
          this.explore_vestige_visible = nepalDataList[i].isActive;
        } else if (nepalDataList[i].menuName == 'depth_level') {
          this.depth_level = nepalDataList[i].isActive;
        } else if (
          nepalDataList[i].menuName == 'frequently_bought_together_visible'
        ) {
          this.frequently_bought_together_visible = nepalDataList[i].isActive;
        } else if (nepalDataList[i].menuName == 'add_new_distributor_visible') {
          this.add_new_distributor_visible = nepalDataList[i].isActive;
        } else if (nepalDataList[i].menuName == 'location_update') {
          this.location_update = nepalDataList[i].isActive;
        }
      }
    }
  }

  async fetchKYCStatus() {
    const url = `${Urls.ServiceEnum.Distributor}/${this.store.auth.distributorID}/${Urls.DistributorServiceEnum.KycStatus}`;
    const response = await NetworkOps.get(url);
    if (!response.message) {
      // this.isEkycDone = get(response, "kycStatus");
    }
  }

  async skipLocation() {
    const url = `${Urls.ServiceEnum.Distributor}/${this.store.auth.distributorID}/${Urls.DistributorServiceEnum.SkipAddress}`;
    const response = await NetworkOps.get(url);
    runInAction(() => {
      this.skipAddress = response?.message ? true : false;
    });
  }

  async validateFoster(fosterId, uplineId) {
    const { auth, profile } = this.store;
    this.isLoading = true;
    const params = `?distributorId=${auth.distributorID}&uplineId=${uplineId}&fosterId=${fosterId}&locationId=${profile.defaultCater.locationId}`;
    const url = `${Urls.ServiceEnum.validateFoster}${params}`;
    const response = await NetworkOps.get(url);
    this.isLoading = false;
    if (!response?.message && Object.keys(response)?.length > 0) {
      return { success: true, data: response };
    }
    return { success: false, message: response?.data };
  }
  async validateFosterWithoutLogin(fosterId, uplineId) {
    const { auth, profile } = this.store;
    this.isLoading = true;
    const params = `?distributorId=${auth.distributorID}&uplineId=${uplineId}&fosterId=${fosterId}&locationid=${profile.defaultCater.locationId}`;
    const url = `${Urls.ServiceEnum.validateFosterWithoutLogin}${params}`;
    const response = await NetworkOps.get(url);
    this.isLoading = false;
    if (!response?.message && Object.keys(response)?.length > 0) {
      return { success: true, data: response };
    }
    return { success: false, message: response?.data };
  }

  

  
  async fetchUserAddresses() {
    this.setIsLoading(true);
    const url = `${Urls.ServiceEnum.AddressList}${this.store.auth.distributorID}/${Urls.DistributorServiceEnum.address}`;
    const response = await NetworkOps.get(url);
    if (!response.message && response && response.length) {
      try {
        const addresses = await response.map(address => {
          return new Address(address);
        });
        this.setRecentAddress(addresses);
      } catch (err) {
        this.setIsLoading(false);
        console.log('error in address saving');
      }
    }
    this.setIsLoading(false);
  }

  /**
   * @description This will fetch address saved for Mini DLCP user's Customer (i.e other user)
   */
  async fetchMiUserAddresses() {
    this.setIsLoading(true);
    const url = `${Urls.ServiceEnum.AddressList}${this.store.auth.distributorID}/${Urls.DistributorServiceEnum.miUserAddress}`;
    const response = await NetworkOps.get(url);
    this.setIsLoading(false);
    if (!response.message && response && response.length) {
      const addresses = await response.map(address => {
        return new Address(address);
      });
      this.setMiUserShopForOthersAddressList(addresses);
    } else {
      this.setMiUserShopForOthersAddressList([]);
    }
  }

  /**
   * @description This will save address for Mini DLCP user's Customer (i.e other user)
   * @param data contains address details
   * @param addressType if value is 'home' then home delivery address or if it is 'defaultStore' then delivery to default store
   */
  async saveMiUserAddress(data, addressType): boolean {
    const type = Urls.DistributorServiceEnum.saveMiUserAddress;
    const url = `${Urls.ServiceEnum.HomeDelivery}${this.store.auth.distributorID}/${type}`;
    const response = await NetworkOps.postToJson(url, data);
    if (!response.message) {
      const address = new Address(response);
      // await this.fetchMiUserAddresses();
      if (addressType === 'defaultStore') {
        this.setMiUserShopForOthersType('2');
      } else {
        this.setMiUserShopForOthersType('1');
      }
      this.setMiUserShopForOthersSelectedAddress(address);
      // await AsyncStore.set(CHECKOUTADDRESS, JSON.stringify(address));
      return true;
    }
    this.setAddressSaveError(response.message);
    return false;
  }

  /**
   * @description this will be used to alter to mini dlcp user's customer address(i.e address of other distributor)
   */
  async alterMiUserAddress(data, type) {
    let url;
    let response;
    if (type === 'delete') {
      url = `${Urls.ServiceEnum.deleteMiniDLCPUserAddress}`;
      const params = `?distributorId=${this.store.auth.distributorID}&id=${data?.id}`;
      response = await NetworkOps.delete(`${url}${params}`);
    } else {
      url = `${Urls.ServiceEnum.updateMiniDLCPUserAddress}`;
      response = await NetworkOps.postToJson(url, data);
    }
    if (!response.message) {
      await this.fetchMiUserAddresses();
      return { success: true };
    }
    return { success: false, message: response.message };
  }

  /**
   * @description This will fetch address for Mini DLCP user's store
   */
  async fetchMiUserStoreAddress(): boolean {
    this.setIsMiUserOnlineShoppingActive(0);
    const type = Urls.DistributorServiceEnum.getMiniDLCPStore;
    const url = `${Urls.ServiceEnum.AddressList}${this.store.auth.distributorID}/${type}`;
    const response = await NetworkOps.get(url);
    if (!response.message) {
      this.setIsMiUserOnlineShoppingActive(response.isMiUserOnlineActive);
      return { success: true, data: response };
    }
    this.addressSaveError(response.message);
    return false;
  }

  /** @description it will changes default selected shipping type of user and will make warehouse key to 0 or false */
  async changeShippingType(value) {
    this.setIsLoading(true);
    const shippingValue =
      value == SHIPPING_TYPE.expressDelivery
        ? SHIPPING_TYPE_ID.expressDelivery
        : SHIPPING_TYPE_ID.regularDelivery;
    const params = `?shippingType=${shippingValue}`;
    const url = `${Urls.ServiceEnum.Distributor}/${this.store.auth.distributorID}${Urls.DistributorServiceEnum.shippingType}${params}`;
    const response = await NetworkOps.putToJson(url);
    this.setIsLoading(false);
    if (!response.message) {
      if (this.isWarehouseShipping == '1') {
        await this.handleWarehouseShipping(
          '0',
          SHIPPING_TYPE_ID.warehouse.homeDelivery,
        );
      }
      this.setSelectedShippingType(value);
      await AsyncStore.set(SELECTEDSHIPPINGTYPE, value);
      this.setCateringChangeCalled(true);
      return { success: true };
    }
    return { success: false };
  }

  async expressDeliveryTnC(pincode, locationId) {
    this.setIsLoading(true);
    const params = `?pincode=${pincode}&locationId=${locationId}`;
    const url = `${Urls.ServiceEnum.Distributor}/${this.store.auth.distributorID}${Urls.DistributorServiceEnum.expressDeliveryInfo}${params}`;
    const response = await NetworkOps.get(url);
    this.setIsLoading(false);
    if (!response.message) {
      return { success: true, data: response };
    }
    return { success: false };
  }

  async fetchPanBankDetail() {
    const url = `${Urls.ServiceEnum.panBankDetailsData}${this.store.auth.distributorID}`;
    const response = await NetworkOps.get(url);
    if (!response.message && response && response.length) {
      this.setAvailableBankDetails(response);
    }
  }

  async fetch() {
    const checkStore = await AsyncStore.get(SIDEMENUDATA);
    if (!isNullOrEmpty(checkStore)) {
      this.setMenuConfigList(JSON.parse(checkStore));
    }

    await this.fetchProfile(); // To fetch the profile
    if (this.store.auth.userRole !== UserRole.Trainer) {
      this.fetchHierachyLevel(); // To fetch the user Hierachy
      this.fetchUserPointDetails(); // To fetch the user point
    }
  }

  async updateLoaction(data, addressType): boolean {
    return await this.saveAddress(data, addressType);
  }

  async alterAddress(data, type) {
    const url =
      type === 'delete'
        ? `${Urls.ServiceEnum.DeleteAddress}`
        : `${Urls.ServiceEnum.UpdateAddress}`;
    const payload = {
      ...data,
      pincode: { pincode: data.pincode },
    };
    const response = await NetworkOps.postToJson(url, type ? payload : data);
    if (!response.message) {
      await this.fetchUserAddresses();
      const changedResponse = new Address(response);
      this.changeActiveAddress(changedResponse);
      return { success: true };
    }
    return { success: false, message: response.message };
  }

  @action changeActiveAddress(response) {
    const index = this.addresses.findIndex(obj => obj.id === response.id);
    if (index >= 0) {
      this.addresses[index] = response;
      console.log(this.activeAddress);
    }
  }

  async handleWarehouseShipping(isWarehouse, warehouseDeliveryType) {
    this.setIsLoading(true);
    const params = `?warehouseShipping=${isWarehouse}&warehouseDeliveryType=${warehouseDeliveryType}`;
    const url = `${Urls.ServiceEnum.Distributor}/${this.store.auth.distributorID}${Urls.DistributorServiceEnum.warehouseShipping}${params}`;
    const response = await NetworkOps.putToJson(url);
    this.setIsLoading(false);
    if (!response.message) {
      this.setIsWarehouseShipping(isWarehouse);
      this.setWarehouseDeliveryType(warehouseDeliveryType);
      await AsyncStore.set(ISWAREHOUSESHIPPING, isWarehouse);
      return { success: true };
    } else {
      return { success: false };
    }
  }

  async fetchUserPointDetails() {
    const url = `${Urls.ServiceEnum.Distributor}/${this.store.auth.distributorID}/${Urls.DistributorServiceEnum.PointDetail}`;
    const res = await NetworkOps.get(url);
    if (!res.message) {
      runInAction(() => {
        this.currentCumulativePointValue = get(res, 'currentCumulativePv', '0');
        this.exclusivePointValue = get(res, 'exclusivePv', '0');
        this.groupPointValue = get(res, 'groupPV', '0');
        this.previousCumuLativePointValue = get(res, 'previousCumuLativePv', '0');
        this.selfBusinessVolume = get(res, 'selfBv', '0');
        this.selfPointValue = get(res, 'selfPv', '0');
        this.totalBusinessVolume = get(res, 'totalBusinessVolume', '0');
        this.totalPointValue = get(res, 'totalPv', '0');
        this.actualPv = get(res, 'actualPv');
        this.nextLevel = get(res, 'nextLevel', '0');
        this.shortPoint = get(res, 'shortPoint', '0');
        this.previousExclusivePv = get(res, 'previousExclusivePv', '0');
        this.previousSelfPv = get(res, 'previousSelfPv', '0');
        this.previousActualPv = get(res, 'previousActualPV');
        this.previousMonthLevel = this.titleCase(
          get(res, 'previousMonthLevel', ' '),
        );
        this.previousTotalPv = get(res, 'previousTotalPv', '0');
        this.currentBonusPercent = get(res, 'currentBonusPercent', '0');
        this.currentLevelId = get(res, 'currentLevelId', '0');
      });
      // const currentDate = new Date().getDate();
      // if (Number(this.currentBonusPercent) < 20 && Number(this.exclusivePointValue) > 0 && Number(this.selfPointValue) < 20 && currentDate > 25) {
      //   const shortSelfPv = 20 - Number(this.selfPointValue);
      //   alert(`Dear Distributor, please complete ${shortSelfPv.toFixed(2)} Self PV for the current business month, else your bonus will be kept on hold.`)
      // }
      // else if (((Number(this.currentBonusPercent) == 20
      //   && Number(this.currentLevelId) == 0
      //   && Number(this.exclusivePointValue) > 0
      //   && Number(this.selfPointValue) < 40) ||
      //   (Number(this.currentLevelId) > 4
      //     && Number(this.selfPointValue) < 40)) && currentDate > 25
      // ) {
      //   const shortSelfPv = 40 - Number(this.selfPointValue);
      //   alert(`Dear Distributor, please complete ${shortSelfPv.toFixed(2)} Self PV for the current business month, else your bonus will be kept on hold.`)
      // }
    } else {
      runInAction(() => {
        this.selfPointValue = this.groupPointValue = 0;
      });
    }
  }

  async fetchDownlineCount() {
    const importantParams = `?countryId=${this.countryId}&appType=GL`; //  as per requirement
    const url = `${Urls.ServiceEnum.Distributor}/${this.store.auth.distributorID}/${Urls.DistributorServiceEnum.DownlineCount}${importantParams}`;
    const res = await NetworkOps.get(url);
    runInAction(() => {
      if (!res.message) {
        this.noOfDownline = get(res, 'noOfDownline').toString();
      } else {
        this.noOfDownline = '0';
      }
    });
  }

  async fetchHierachyLevel() {
    const url = `${Urls.ServiceEnum.Distributor}/${this.store.auth.distributorID}/${Urls.DistributorServiceEnum.HierarchyLevel}`;
    const res = await NetworkOps.get(url);
    if (!res.message) {
      runInAction(() => {
        this.currentPosition = this.titleCase(get(res, 'currentPosition', ''));
        this.nextPosition = this.titleCase(get(res, 'nextPosition', ''));
        this.previousPosition = this.titleCase(get(res, 'previousPosition', ''));
      });
      analytics().setUserProperty('CurrentPosition', this.currentPosition);
      let country_Iddd = await AsyncStore.get(COUNTRY_ID);
      this.getDepthLevelInfo(country_Iddd, this.hierarchyLevelId);

      const currentLevel = await AsyncStore.get(CURRENTPOSITION);
      if (!currentLevel && this.currentPosition) {
        await AsyncStore.set(CURRENTPOSITION, this.currentPosition);
      }
    }
  }

  async fetchKycGuidelines(){
    const url = `${Urls.ServiceEnum.fetchKycGuidelines}${Urls.DistributorServiceEnum.KycGuideline}?distributorId=${this.store.auth.distributorID}&countryId=${this.countryId}`;
    this.setIsLoading(true);
    const res = await NetworkOps.get(url);
    this.setIsLoading(false);
    if(res.length && res.length > 0 && res[0]?.hasOwnProperty('warningMessage')){
      runInAction(() => {
        console.log('res.warningMessage',res.warningMessage)
        this.kycGuidelines = res[0]?.warningMessage;

      })
      return { success: true, data: res};
    } else {
        this.kycGuidelines = []
        return false;
    }
  }

  getPercentageArray() {
    const currentPosition = this.currentPosition
      .replace(/ /g, '')
      .toUpperCase();
    const desiredPercentageList = [
      {
        label: '8%',
        value: '8',
      },
      {
        label: '12%',
        value: '12',
      },
      {
        label: '16%',
        value: '16',
      },
      // {
      //   label: "14%",
      //   value: "14"
      // },
      // {
      //   label: "17%",
      //   value: "17"
      // },
      // {
      //   label: "20%",
      //   value: "20"
      // }
    ];
    return desiredPercentageList;
    // if (currentPosition === "DISTRIBUTOR") {
    //   return desiredPercentageList;
    // } else if (currentPosition === "SENIORDISTRIBUTOR") {
    //   return desiredPercentageList.slice(3);
    // } else if (currentPosition === "ASSISTANTDIRECTOR") {
    //   return desiredPercentageList.slice(4);
    // } else {
    //   return [];
    // }
  }

  async fetchUserPointHistory(distributorId) {
    this.setIsLoading(true);
    const url = `${Urls.ServiceEnum.Distributor}/${distributorId}/${Urls.DistributorServiceEnum.PointHistory}`;
    const res = await NetworkOps.get(url);
    if (!res.message) {
      if (res.length > 0) {
        runInAction(() => {
          this.graphPvValue = res.reverse();
          this.lastMonthLevel = this.titleCase(get(res[0], 'currentLevel', '--'));
        });
      } else {
        this.onEmptyGraph(strings.commonMessages.noDataFoundText, false);
      }
    } else if (res.message === 'No data found') {
      this.onEmptyGraph(strings.commonMessages.noDataFoundText, false);
    } else {
      // this.onEmptyGraph(
      //   `${strings.commonMessages.somethingWentWrong} \n ${
      //     strings.commonMessages.tryAgain
      //   }`,
      //   true
      // );
      this.onEmptyGraph(res.message, false);
    }
    this.setIsLoading(false);
  }

  onEmptyGraph = (message, retry) => {
    let date = new Date();
    this.graphPvValue = [
      {
        distributorId: this.distributorID,
        bussinessMonth: `${date.getFullYear()}-${date.getMonth() + 1}`,
        levelId: '',
        selfPv: '0',
        groupPv: '0',
        totalPv: '0',
        totalCumPv: '0',
        currentLevel: '',
        overlay: true,
        message: message,
        retry: retry,
      },
    ];
  };

  async fetchAppVersion(version) {
    const url = `${Urls.ServiceEnum.AppVersion}${
      Urls.DistributorServiceEnum.AppVersion
    }/${Platform.OS === 'ios' ? 'IOS' : 'ANDROID'}?version=${version}`;
    return await NetworkOps.get(url);
  }

  async saveAddress(data, addressType): boolean {
    const type =
      addressType === 'store'
        ? Urls.DistributorServiceEnum.Store
        : Urls.DistributorServiceEnum.HomeDelivery;
    const url = `${Urls.ServiceEnum.HomeDelivery}${this.store.auth.distributorID}/${type}`;
    const response = await NetworkOps.postToJson(url, data);
    if (!response.message) {
      const { warehouseDelivery, expressDelivery, regularDelivery } =
        SHIPPING_TYPE;
      if (
        addressType === 'store' &&
        (this.defaultShippingType == warehouseDelivery ||
          this.defaultShippingType == expressDelivery)
      ) {
        await this.changeShippingType(regularDelivery);
      }
      const address = new Address(response);
      const index = _.findIndex(this.addresses, add => {
        return (
          (add.addressType === 'StorePickup' ||
            add.addressType === 'Shipping') &&
          add.isDefault
        );
      });
      runInAction(() => {
        if (index < 0) {
          this.addresses[1] = address;
        } else {
          this.addresses[index] = address;
        }
      });
      await AsyncStore.set(CHECKOUTADDRESS, JSON.stringify(address));
      return true;
    }
    this.setAddressSaveError(response.message);
    return false;
  }

  async uploadKyc(data: Object) {
    this.setKycMessage('');

    /**..........sending auth-token as per requirement in completeRegistration flow.
     * .........(don't remove before verifying each cases)............ */
    const kycOptions = {
      headerOverrides: {
        'Content-Type': 'multipart/form-data',
        Authorization: `bearer ${this.store.auth.authToken}`,
        distributorId: this.store.auth.distributorID,
      },
    };

    this.setIsLoading(true);
    const url = `${Urls.ServiceEnum.Distributor}/${Urls.DistributorServiceEnum.KycUpload}`;
    console.log('Url',url, JSON.stringify(data))
    const res = await NetworkOps.postRaw(`${url}`, data, kycOptions);
    console.log('Res from kyc upload',res)
    const response = get(res, 'message', '');
    // console.log('uploadKyc', data, response)
    this.setIsLoading(false);
    if (response === 'KYC has been uploaded successfully') {
      this.isEkycDone = true;
      this.setKycMessage(strings.kyc.uploaded);
    } else if (response === 'KYC Already Uploaded') {
      this.isEkycDone = true;
      this.setKycMessage(strings.kyc.alreadyUploaded);
    } else {
      this.setKycMessage(response);
    }
    if(this.store.auth.distributorType==3){
      this.becomeB2cDistibutor();
    }
   

  }

  async becomeB2cDistibutor() {
    // this.isLoading=true
    const url = `${Urls.ServiceEnum.becomeB2bDistibutorUrl}${this.store.auth.distributorID}&isShowMobileNo=1`
    const res = await NetworkOps.putToJson(url)
    this.fetchProfile();
    if(!res.message) {
      return { success: true, data: res }
    }
    return { success: false, message: res.message}
   
  }

  async uploadProfilePhoto(data: Object) {

    /**..........sending auth-token as per requirement in completeRegistration flow.
     * .........(don't remove before verifying each cases)............ */
    const kycOptions = {
      headerOverrides: {
        'Content-Type': 'multipart/form-data',
        Authorization: `bearer ${this.store.auth.authToken}`,
        distributorId: this.store.auth.distributorID,
      },
    };

    this.setIsLoading(true);
    const url = `profile/api/${Urls.DistributorServiceEnum.uploadProfileImg}`;
    console.log('Url',url, JSON.stringify(data))
    const res = await NetworkOps.postRaw(`${url}`, data, kycOptions);
    console.log('Response upload profile image',res)
    const response = get(res, 'message', '');
    this.setIsLoading(false);
    await this.fetchProfile();
  }

  // async fetchCheckoutAddress() {
  //   const url = `${Urls.ServiceEnum.Distributor}/${this.store.auth.distributorID}/${Urls.DistributorServiceEnum.CheckoutAddress}`;
  //   const response = await NetworkOps.get(url);
  //   if(!response.message){
  //     this.activeDeliveryType = response.deliveryType;
  //     this.addressType = response.deliveryType;
  //     (response.deliveryType === 'StorePickup')? (this.latestLocation = get(response,'storesDTO.locationName'),this.storeLocation=get(response,'storesDTO.locationId',null), this.addressDto = get(response,'storesDTO'), this) :
  //       (this.latestLocation = get(response, 'distributorAddressDTO.address1', 'No address selected...'),this.shippingPincode = get(response,'distributorAddressDTO.pincode.pincode',null), this.addressDto = get(response,'distributorAddressDTO'));
  //   }
  // }

  async getNotification(filterKey) {
    this.setIsLoading(true);
    const url = `${Urls.ServiceEnum.Notification}?days=${filterKey}`;
    const response = await NetworkOps.get(url);
    this.setIsLoading(false);
    if (response && response.length > 0) {
      this.setNotification(response);
    } else {
      this.setNotification([]);
    }
  }

  async deleteNotification(notificationId) {
    this.setIsLoading(true);
    const url = `${Urls.ServiceEnum.NotificationDelete}${notificationId}`;
    const response = await NetworkOps.delete(url);
    this.setIsLoading(false);
    if (response && response.message) {
      return false;
    } else {
      return true;
    }
  }

  /**
   * @description To get list of prospect on the basis of status
   */
  async getNewJoiningsData(distributorId, fromDate, toDate, status) {
    this.setIsLoading(true);
    status === 'pending'
      ? this.setPendingJoineeList([])
      : this.setSuccessJoineeList([]);

    const params = `?distributorId=${distributorId}&fromDate=${fromDate}&toDate=${toDate}&status=${status}`;
    const url = `${Urls.ServiceEnum.newJoinings}${params}`;
    const response = await NetworkOps.get(url);
    //console.log("response"+JSON.stringify(response))
    this.setIsLoading(false);
    if (response && response.length > 0 && !response.message) {
      if (status === 'pending') {
        this.setPendingJoineeList(response);
      } else {
        this.setSuccessJoineeList(response);
      }
      return { success: true };
    } else {
      if (status === 'pending') {
        this.setPendingJoineeList([]);
      } else {
        this.setSuccessJoineeList([]);
      }
      return { success: false, message: response.message && response.message };
    }
  }

  /**
   * @description To send message to prospect.
   */
  async prospectMessageReminder(distributorId) {
    this.setIsLoading(true);
    const url = `${Urls.ServiceEnum.prospectMessageReminder}${distributorId}`;
    const response = await NetworkOps.get(url);
    this.setIsLoading(false);
    if (response && response.length > 0 && !response.message) {
      return { success: true };
    } else {
      return {
        success: false,
        message: response.message ? response.message : null,
      };
    }
  }

  /**
   * @description To Download distributor IdCard.
   */
  async downloadDistributorIdCard(distributorId) {
    // const options = { headerOverrides: { "Content-Type": "application/json", Accept: 'application/pdf', } };
    this.setIsLoading(true);
    const url = `${Urls.ServiceEnum.Distributor}/${distributorId}${Urls.DistributorServiceEnum.downloadIdCard}`;
    const res = await NetworkOps.get(url);
    this.setIsLoading(false);
    if (!res.message && res.statusCode === 200 && res.response.idcard) {
      return { success: true, data: res.response.idcard };
    } else {
      return {
        success: false,
        message: res.response.message
          ? res.response.message
          : `${strings.commonMessages.somethingWentWrong}${strings.commonMessages.tryAgain}`,
      };
    }
  }

  /**
   * @description To fetch distributor IdCard.
   */
  async distributorIdCard(distributorId) {
    this.setIsLoading(true);
    const url = `${Urls.ServiceEnum.Distributor}/${distributorId}${Urls.DistributorServiceEnum.idCard}`;
    const res = await NetworkOps.get(url);
    console.log('idcard==>', res);
    this.setIsLoading(false);
    if (!res.message && res.statusCode === 200 && res.response?.idcard) {
      return { success: true, data: res.response.idcard };
    } else {
      return {
        success: false,
        message: res.message
          ? res.message
          : `${strings.commonMessages.somethingWentWrong}${strings.commonMessages.tryAgain}`,
      };
    }
  }

  async fetchNews(fromDate, toDate) {
    this.setIsLoading(true);
    this.newsDetails = [];
    const params = `?status=1&fromDate=${fromDate}&toDate=${toDate}`;
    const url = `${Urls.ServiceEnum.NewsDetails}${params}`;
    const response = await NetworkOps.get(url);
    this.setIsLoading(false);
    if (response && response.length > 0 && !response.message) {
      this.setNewsDetails(response);
      return { success: true };
    } else {
      return {
        success: false,
        message: response.message ? response.message : null,
      };
    }
  }

  async fetchv20qualifier() {
    const url = `${Urls.ServiceEnum.getV20qualifier}${this.store.auth.distributorID}`;
    const res = await NetworkOps.get(url);
    runInAction(() => {
      if (res && res.length > 0 && !res.message) {
        // alert(JSON.stringify(res));
        this.setV20Data(res);
        this.setIsV20Qulifier(true)
      }else{
        this.setIsV20Qulifier(false)
      } 
    });
  }
  async fetchv20Registerqualifier() {
    const url = `${Urls.ServiceEnum.getV20RegiserationQulifyer}${this.store.auth.distributorID}`;
    const res = await NetworkOps.get(url);
    runInAction(() => {
      if (res && res.length > 0 && !res.message) {
        this.setIsV20registration(res);
        if(res[0].IsComingWithPartner==""){
          this.setIsV20ableToRegister(true);
        }else{
          this.setIsV20ableToRegister(false);
        }
      }else{
        this.setIsV20ableToRegister(false)
      } 
    });
  }

  async updatev20Registertion(isComingWithPartner) {
    const url = `${Urls.ServiceEnum.getV20RegiserationQulifyer}${this.store.auth.distributorID}`+'&&isComingWithPartner='+isComingWithPartner;
    const data = {
      'isComingWithPartner':isComingWithPartner,
    };
    const response = await NetworkOps.postToJson(url,data);
    if (!response.message) {
      return { success: true };
    }
    return { success: false, message: response.message };
  }

}
