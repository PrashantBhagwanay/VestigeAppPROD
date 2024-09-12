import { Platform } from 'react-native';
import { observable, computed, action, makeAutoObservable } from 'mobx';
import { get } from 'lodash';
import NetworkOps from 'app/src/network/NetworkOps';
import * as Urls from 'app/src/network/Urls';
import * as AsyncStore from 'app/src/utility/AsyncStoragesUtils';
import { SESSION_CONSTANT, UserRole } from 'app/src/utility/constant/Constants';
import analytics from '@react-native-firebase/analytics';
import { setUser } from 'app/src/utility/AnalyticsUtils';
import { isNullOrEmpty } from '../utility/Utility';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import * as Permissions from 'app/src/utility/permissions/Permissions';
// import { strings } from 'app/src/utility/localization/Localized';

const TOKEN_KEY = AsyncStore.addPrefix('auth_token');
const VESTIGE_UT = AsyncStore.addPrefix('vestige_ut');
const USER_TYPE = AsyncStore.addPrefix('user_type');
const DEVICE_ID = AsyncStore.addPrefix('deviceId');
const IS_BIRTHDAY_POPUP_VISIBLE = AsyncStore.addPrefix('isBirthdayVisible');
const DISTRIBUTORID = AsyncStore.addPrefix('distributor_id');
const PASSWORD = AsyncStore.addPrefix('password');
const USERNAME = AsyncStore.addPrefix('userName');
const IS_KYC = AsyncStore.addPrefix('is_kyc');
const USERROLE = AsyncStore.addPrefix('user_Role');
const DISTRIBUTOR_TYPE = AsyncStore.addPrefix('DISTRIBUTOR_TYPE');
const ISNEWSESSION = AsyncStore.addPrefix('new_Session');
const LASTSESSIONUPDATETIME = AsyncStore.addPrefix('last_Session_UpdateTime');
const SHOWCOACHMARKS = AsyncStore.addPrefix('show_coachmarks');
const RECENTSEARCHRESULTS = AsyncStore.addPrefix('RecentSearchList');
const CHECKOUTADDRESS = AsyncStore.addPrefix('checkout-address');
const SIDEMENUDATA = AsyncStore.addPrefix('SideMenuData');
const LOCALCARTS = AsyncStore.addPrefix('LOCALCARTS');
const SHOWIMPORTANTUPDATEWARNING = AsyncStore.addPrefix(
  'showImportantUpdateWarning',
);
const COUNTRY_ID = AsyncStore.addPrefix('country-id');
const BASE_LOCATION_ID = AsyncStore.addPrefix('location-id');
const LAST_BIRTHDAY_SHOWN = AsyncStore.addPrefix('birthdayShownDate');
const CURRENTPOSITION = AsyncStore.addPrefix('current_position');
const SELECTEDSHIPPINGTYPE = AsyncStore.addPrefix('selected_shipping_type');
const ISWAREHOUSESHIPPING = AsyncStore.addPrefix('is_warehouse_shipping');
const V2_ACTIVE_LOCATION = AsyncStore.addPrefix('v2_active_location');
const SHOPPABLE_COUNTRY_LIST = AsyncStore.addPrefix('shoppable_country_list');
const FCM_TOKEN = AsyncStore.addPrefix('fcmToken');
const  DIS_LEVEL_ID= AsyncStore.addPrefix('dis_level_id');

// const Analytics = Firebase.analytics();
// const DB = Firebase.database();

export default class Auth {
  @observable isLoading: boolean = false;
  @observable authToken: string;
  @observable vestigeUT: string;
  @observable logoutAlertMessage: boolean = false;
  @observable distributorID: string;
  @observable password: string;
  @observable userRole: string;
  @observable distributorType: Number;
  @observable showSkip: boolean = true;
  @observable signupRoutePath: string = '';
  @observable showCoachmarks;
  @observable navigation: any = {};
  @observable fcmToken: string = '';
  @observable username: string;
  @observable firstName: String;
  @observable lastName: String;
  @observable userType: string;
  @observable userMobileNo: String = '';
  @observable guestUserOtpInfo = {};
  @observable isCoachMarksShown = false;
  @observable showFloat: boolean = true;
  @observable screenName;
  @observable deviceId: String = '';
  @observable levelId: String ='';
  @observable locationId: String = '';
  @observable isSignupEnabled: boolean = false;
  @observable isKyc: String = '';
  @observable isRegistrationCompleted: String = '';
  @observable completeRegistrationDetails = {};
  @observable isAuthenticated = false;
  @observable isNetworkConnected;
  @observable skippableLoginKycInProcess = false;

  constructor(store) {
    this.store = store;
    makeAutoObservable(this);
  }

  @action setIsLoading = value => (this.isLoading = value);
  @action setAuthToken = value => (this.authToken = value);
  @action setVestigeUT = value => (this.vestigeUT = value);
  @action setLogoutAlertMessage = value => (this.logoutAlertMessage = value);
  @action setDistributorID = value => (this.distributorID = value);
  @action setPassword = value => (this.password = value);
  @action setUserRole = value => (this.userRole = value);
  @action setDistributorType = value => (this.distributorType = value);
  @action setShowSkip = value => (this.showSkip = value);
  @action setSignupRoutePath = value => (this.signupRoutePath = value);
  @action setShowCoachmarks = value => (this.showCoachmarks = value);
  @action setNavigation = value => (this.navigation = value);
  @action setFcmToken = value => (this.fcmToken = value);
  @action setUsername = value => (this.username = value);
  @action setLevelId = value => (this.levelId = value);
  @action setFirstName = value => (this.firstName = value);
  @action setLastName = value => (this.lastName = value);
  @action setUserType = value => (this.userType = value);
  @action setUserMobileNo = value => (this.userMobileNo = value);
  @action setGuestUserOtpInfo = value => (this.guestUserOtpInfo = value);
  @action setIsCoachMarksShown = value => (this.isCoachMarksShown = value);
  @action setShowFloat = value => (this.showFloat = value);
  @action setScreenName = value => (this.screenName = value);
  @action setDeviceId = value => (this.deviceId = value);
  @action setLocationId = value => (this.locationId = value);
  @action setIsSignupEnabled = value => (this.isSignupEnabled = value);
  @action setIsKyc = value => (this.isKyc = value);
  @action setIsRegistrationCompleted = value =>
    (this.isRegistrationCompleted = value);
  @action setCompleteRegistrationDetails = value =>
    (this.completeRegistrationDetails = value);

  /**
   * This can be used in handeling protected/unprotected route navigations for app authentication flow.
   */
  @action setIsAuthenticated = value => (this.isAuthenticated = value);

  /**
   * This method sets a observable which is used for navigation handeling of kyc screen (as per requirement).
   * Setting it true navigate to kyc screen from seprate stack route.
   */
  @action setSkippableLoginKycInProcess = value => (this.skippableLoginKycInProcess = value);

  @action setNetworkConnectivity = value => (this.isNetworkConnected = value);

  @computed get isTokenAvailable(): boolean {
    return !!this.authToken && this.authToken.length > 0;
  }

  @computed get isGuestUser() {
    return this.userRole === UserRole.GuestUser;
  }

  async init() {
    // this.store.products.updateNewSession(SESSION_CONSTANT.onLaunch);
    const { profile, appConfiguration } = this.store;
    this.setLogoutAlertMessage(true);
    this.authToken = this.setAuthToken(
      this.authToken ? this.authToken : await AsyncStore.get(TOKEN_KEY),
    );
    if (!isNullOrEmpty(this.authToken)) {
      this.setIsAuthenticated(true);
    }
    this.vestigeUT = this.setVestigeUT(
      this.vestigeUT || (await AsyncStore.get(VESTIGE_UT)),
    );
    this.userType = this.setUserType(
      this.userType || (await AsyncStore.get(USER_TYPE)),
    );
    this.distributorID = this.setDistributorID(
      this.distributorID || (await AsyncStore.get(DISTRIBUTORID)),
    );
    this.password = this.setPassword(
      this.password || (await AsyncStore.get(PASSWORD)),
    );
    
    this.username = this.setUsername(
      this.username || (await AsyncStore.get(USERNAME)),
    );
    
    this.levelId=this.setLevelId(
      this.levelId || (await AsyncStore.get(DIS_LEVEL_ID))
    )
    this.showCoachmarks = this.setShowCoachmarks(
      Number(await AsyncStore.get(SHOWCOACHMARKS)),
    );
    this.userRole = this.setUserRole(
      this.userRole || (await AsyncStore.get(USERROLE)),
    );
    this.setShowSkip(true);
    profile.currentPosition =
      profile.currentPosition || (await AsyncStore.get(CURRENTPOSITION));
    this.isKyc = this.setIsKyc(
      this.isKyc ? this.isKyc : await AsyncStore.get(IS_KYC),
    );
    appConfiguration.setV2ActiveLocationIdList(JSON.parse(
      await AsyncStore.get(V2_ACTIVE_LOCATION)
    ));
    appConfiguration.setShoppableCountryList(
      await AsyncStore.get(SHOPPABLE_COUNTRY_LIST),
    );
  }

  async getGuestUserOtp(guestUserInfo) {
    const res = await NetworkOps.postToJson(
      Urls.ServiceEnum.GuestUser,
      guestUserInfo,
    );
    if (!res.message) {
      this.setGuestUserOtpInfo(res);
      return { success: true };
    }
    return { success: false, message: res.message };
  }

  async login(user) {
    this.setIsLoading(true);
    this.setShowSkip(true);
    setTimeout(async() => {
      this.showCoachmarks = Number(await AsyncStore.get(SHOWCOACHMARKS));
    }, 100);
  
    const url =
      user.userType !== 'GUEST' || Platform.OS === 'android'
        ? Urls.ServiceEnum.Login
        : Urls.ServiceEnum.GuestLoginIos;
    const json = await NetworkOps.postToJson(url, user);
    this.setIsLoading(false);
    if (!json.message) {
      if (!isNullOrEmpty(json.outParam)) {
        return {
          message: json.outParam,
          statusmsg: 'ERROR_DI',
          status: false,
          data: json,
        };
      }
      // if(json.countryId == '2'){
      //   return {message: strings.loginScreen.otherUserLoginRestriction}
      // }
      // if(parseInt(get(json, 'user_name')) != 97134831 && parseInt(get(json, 'user_name')) != 71449249 && (parseInt(get(json, 'user_name')) != 27900006 && parseInt(get(json, 'user_name')) != 27900008)){
      //   this.isLoading = false;
      //   return {message: "DistributorId/Password is Incorrect", statusmsg: "", status: false};
      // }
      this.setPassword(user.password);
      var distributorType= get(json, 'distributorType', '0');
      // alert(distributorType);
        // if(distributorType==3){
        // return { message: 'For better experience, you may do shopping on www.myvestige.com.', statusmsg: json.statusmsg, status: false };
        // }
      
      this.setAuthToken(get(json, 'access_token'));
      this.setVestigeUT(get(json, 'ut'));
      this.setLogoutAlertMessage(true);
      this.setDistributorID(get(json, 'user_name')?.toString());
      this.setUsername(get(json, 'name'));
      this.setLevelId(get(json, 'levelId',''));
      this.setFirstName(get(json, 'firstName', ''));
      this.setLastName(get(json, 'lastName', ''));
      this.setUserType(get(json, 'userType', ''));
      this.setDistributorType(get(json, 'distributorType', '0'));
      this.setDeviceId(get(json, 'deviceId', ''));
      //this.userMobileNo = get(json, 'mobile_number', '')
      this.setIsRegistrationCompleted(get(json, 'isRegistrationCompleted', ''));
      this.setIsKyc(get(json, 'isKyc', ''));
      this.setCompleteRegistrationDetails({
        fosterId: get(json, 'fosterId', ''),
        firstName: get(json, 'firstName', ''),
        lastName: get(json, 'lastName', ''),
        countryName: get(json, 'countryName', ''),
        stateId: get(json, 'stateId', null),
        cityId: get(json, 'cityId', null),
        stateName: get(json, 'stateName', ''),
        cityName: get(json, 'cityName', ''),
        pincode: get(json, 'pincode', ''),
        emailId: get(json, 'emailId', ''),
        distributorTitle: get(json, 'distributorTitle', ''),
        distributorDob: get(json, 'distributorDob', ''),
        distributorMobile: get(json, 'distributorMobile', ''),
      });
      this.store.profile.setCountryId(Number(get(json, 'countryId', 1)));
      const countryIdd = get(json, 'countryId', 1);
      this.store.profile.setBaseLocationId(
        Number(get(json, 'locationId', '10')),
      );
      await AsyncStore.set(
        BASE_LOCATION_ID,
        String(this.store.profile.baseLocationId),
      );
      await AsyncStore.set(COUNTRY_ID, String(countryIdd));
      await this.store.profile.getUserMenuConfig(this.store.profile.countryId);
      await this.store.profile.getFlagForPvNetworkForNepal(
        this.store.profile.menuConfigList,
      );

      // analytics.setUserId(this.distributorID); // Sending DistributorID to Firebase
      // setUser(this.distributorID); // Sending DistributorID to GA

      const userRoles = get(json, 'authorities');
      let userRoleId = '2';
      if (userRoles && userRoles.length > 0) {
        if (userRoles.length === 1) {
          const firstItem = userRoles[0];
          const roleName = get(firstItem, 'name');
          if (roleName === 'ROLE_TRAINER') {
            userRoleId = '1';
          }
          if (roleName === 'ROLE_GUEST') {
            userRoleId = '4';
          }
        } else {
          const firstItem = userRoles[0];
          const secondItem = userRoles[1];
          const roleName = get(firstItem, 'name');
          const secondRoleName = get(secondItem, 'name');
          if (
            roleName === 'ROLE_TRAINER' ||
            secondRoleName === 'ROLE_TRAINER'
          ) {
            userRoleId = '3';
          }
        }
      }

      this.setUserRole(userRoleId);
      if (this.userRole == UserRole.GuestUser) {
        await this.saveLoginSessionData();
        // this.setIsLoading(false);
        return true;
      }
      if (this.isRegistrationCompleted == '1' && this.isKyc == '1') {
        await this.saveLoginSessionData();
        return true;
      }
      if (
        this.isRegistrationCompleted == '1' &&
        this.isKyc == '0' &&
        this.store.appConfiguration?.isKycSkippable
      ) {
        // below line is used to auto change route for kyc screen so that all cases be handled well. (as per requirement)
        if(distributorType!=3){
          this.setSkippableLoginKycInProcess(true);
        }else{
          this.setSkippableLoginKycInProcess(false);
        }
      
        await this.saveLoginSessionData();
        return true;
      }
      return true;
      // this.store.products.updateNewSession(SESSION_CONSTANT.default);
    }
    return { message: json.message, statusmsg: json.statusmsg, status: false };
  }

  /**
   * @description when downline complete registration,this will save login detail in asyncstorage after completion.
   */
  async saveLoginSessionData() {
    this.setIsAuthenticated(true);
    await AsyncStore.set(TOKEN_KEY, this.authToken);
    await AsyncStore.set(VESTIGE_UT, this.vestigeUT);
    await AsyncStore.set(USER_TYPE, this.userType);
    await AsyncStore.set(USERROLE, this.userRole);
    await AsyncStore.set(DISTRIBUTORID, this.distributorID);
    await AsyncStore.set(USERNAME, this.username);
    await AsyncStore.set(DEVICE_ID, this.deviceId);
    await AsyncStore.set(IS_KYC, this.isKyc);
    await AsyncStore.set(SHOWIMPORTANTUPDATEWARNING, 'false');
    await AsyncStore.set(DISTRIBUTOR_TYPE, this.distributorType);
    await AsyncStore.set(DIS_LEVEL_ID, this.levelId+'');
  }

  /**
   * @description user onboard (when comes to accept TnC)
   */
  async handleCompleteRegistration(data) {
    this.setIsLoading(true);
    const res = await NetworkOps.postToJson(
      `${Urls.ServiceEnum.completeRegistration}`,
      data,
    );
    this.setIsLoading(false);
    if (res.data == 'Success') {
      return { success: true };
    }
    return { success: false, message: res.data ? res.data : res.message };
  }

  /**
   * @description To Download distributor IdCard.
   */
  async checkDuplicateNumber(mobileNumber) {
    this.setIsLoading(true);
    const url = `${Urls.ServiceEnum.checkDuplicateNumber}/${mobileNumber}`;
    const res = await NetworkOps.get(url);
    this.setIsLoading(false);
    if (!res.message) {
      return { success: true, data: 'success' };
    }
    return { success: false, message: res.message };
  }

  /**
   * @description To verify Otp entered by user in signup screen.
   */
  async signupOtpVerification(mobile, otp) {
    this.setIsLoading(true);
    const params = `?otp=${otp}`;
    const res = await NetworkOps.get(
      `${Urls.ServiceEnum.verifySignupOtp}${mobile}${params}`,
    );
    this.setIsLoading(false);
    if (res?.otpVerified) {
      return { success: true };
    }
    return {
      success: false,
      message: res.message ? res.message : res.otpMessage,
    };
  }

  // /**
  //  * @description It will verify the otp when downline will be asked to verify otp and accept TnC.
  //  */
  // async userOtpVerification(data) {
  //   this.isLoading = true;
  //   const res = await NetworkOps.putToJson(`${Urls.ServiceEnum.userOtpVerification}`, data);
  //   this.isLoading = false;
  //   if(res.data == 'Mobile Otp Verification Successfully'){
  //     return {success: true}
  //   }
  //   else{
  //     return {success: false, message: res.data ? res.data : res.message}
  //   }
  // }

  async saveDeviceDetails(url, data) {
    this.setIsLoading(true);
    const res = await NetworkOps.postToJson(url, data);
    this.setIsLoading(false);
    if (!res.message) {
      return { success: true, statusMsg: res.statusMessage };
    }
    return { success: false, message: res.message };
  }

  async signup(user) {
    this.setIsLoading(true);
    const json = await NetworkOps.postToJson(Urls.ServiceEnum.signup, user);
    this.setIsLoading(false);
    return json;
  }

  async downlineRegistration(user) {
    this.setIsLoading(true);
    const json = await NetworkOps.postToJson(
      Urls.ServiceEnum.downlineRegistration,
      user,
    );
    this.setIsLoading(false);
    return json;
  }

  async getOtpStatus() {
    const res = await NetworkOps.get(`${Urls.ServiceEnum.OtpStatus}`);
    if (!res.message) {
      return { success: true, isOtpVerified: res.isOtpVerified };
    }
    return { success: false };
  }

  /**
   * @description This is used for sending otp to user. There is otp through sms & otp via call
   *              option available in this. ""Request body""" change for both cases.
   * @param {*} data request body
   * @param {*} isOtpOnCall used for separating otp via call or sms
   */
  async requestOTP(data, isOtpOnCall = false) {
    if (isOtpOnCall) this.setIsLoading(true);
    const res = await NetworkOps.postToJson(Urls.ServiceEnum.Otp, data);
    this.setIsLoading(false);
    if (!res.message) {
      return { success: true, data: res };
    }
    return { success: false, message: res.message };
  }

  async validateMobile(data) {
    this.setIsLoading(true);
    const res = await NetworkOps.postToJson(
      Urls.ServiceEnum.ValidateMobile,
      data,
    );
    this.setIsLoading(false);
    if (!res.message) {
      return { success: true };
    }
    return { success: false, message: res.message };
  }

  /**
   * @description This is used to send data for analysis purpose to vestige during logout.
   * @param {*} data request body
   */
  @action sendSignOutData = async () => {
    const data = {
      distributorId: this.distributorID,
      loggedInDeviceId: this.deviceId,
    };
    const res = await NetworkOps.postToJson(
      Urls.ServiceEnum.sendSignOutData,
      data,
    );
    if (!res.message) {
      return { success: true };
    }
    return { success: false, message: res.message };
  };

  /**
   * @description This is used to send data for analysis purpose to vestige during logout.
   * @param {*} data request body
   */
   @action deleteAccountData = async () => {
    const data = {
      distributorId: this.distributorID,
      loggedInDeviceId: this.deviceId,
    };
    const res = await NetworkOps.postToJson(
      Urls.ServiceEnum.sendSignOutData,
      data,
    );
    if (!res.message) {
      return { success: true };
    }
    return { success: false, message: res.message };
  };

  @action reset() {
    this.setIsLoading(false);
    this.setAuthToken(undefined);
    this.setVestigeUT(undefined);
    this.setDistributorID(undefined);
    this.setUserRole(undefined);
    this.setShowSkip(false);
    this.setLogoutAlertMessage(false);
    this.setIsKyc(undefined);
    this.setDistributorType(undefined);
    this.setIsAuthenticated(false);
    this.setLevelId(undefined);
  }

  updateLogoutAlertMessageKey = () => {
    this.setLogoutAlertMessage(false);
  };

  @action signOut = async (sendSignOutData = false) => {
    if (sendSignOutData) {
      this.sendSignOutData(); // not using await here (as per requirement)
    }
    await AsyncStore.remove(TOKEN_KEY);
    await AsyncStore.remove(VESTIGE_UT);
    await AsyncStore.remove(USER_TYPE);
    await AsyncStore.remove(DISTRIBUTORID);
    await AsyncStore.remove(COUNTRY_ID);
    await AsyncStore.remove(BASE_LOCATION_ID);
    await AsyncStore.remove(USERROLE);
    await AsyncStore.remove(LASTSESSIONUPDATETIME);
    await AsyncStore.remove(ISNEWSESSION);
    await AsyncStore.remove(RECENTSEARCHRESULTS);
    await AsyncStore.remove(CHECKOUTADDRESS);
    await AsyncStore.remove(SIDEMENUDATA);
    await AsyncStore.remove(LOCALCARTS);
    await AsyncStore.remove('isTouchId');
    await AsyncStore.remove(IS_BIRTHDAY_POPUP_VISIBLE);
    await AsyncStore.remove(LAST_BIRTHDAY_SHOWN);
    await AsyncStore.remove(CURRENTPOSITION);
    await AsyncStore.remove(SELECTEDSHIPPINGTYPE);
    await AsyncStore.remove(ISWAREHOUSESHIPPING);
    await AsyncStore.remove(IS_KYC);
    await AsyncStore.remove(DISTRIBUTOR_TYPE);
    await AsyncStore.remove(DIS_LEVEL_ID);
     await  AsyncStore.remove('lastOpenDate')

    this.reset();
    this.store.profile.reset();
    this.store.network.reset();
    this.store.cart.reset();
    this.store.wishList.reset();
    this.store.myVouchers.reset();
    this.store.myConsistency.reset();
    this.store.myFunds.reset();
    this.store.products.reset();
    this.store.search.reset();
    this.store.dashboard.reset();
    this.store.cart.ordersList = [];
    this.store.profile.firstName = '';
    this.store.profile.lastName = '';
    this.store.profile.email = '';
    this.store.profile.distributorID = '';
    this.store.profile.countryId = -1;
    this.store.profile.uplineDistributorId = '';
    this.store.profile.addresses = [];
    this.store.profile.graphPvValue = [];
    this.store.profile.recentAddress = [];
    this.store.cart.searchedResult = {};
    this.store.cart.validatedDownline = {};
    this.store.cart.ordersList = [];
    this.store.cart.recentOrders = [];
    this.store.cart.alreadyExistsDistributor = {};
    this.store.cart.orderItemsList = [];
    this.store.cart.productItemsList = [];
    this.store.cart.cartVouchers = [];
    this.store.cart.isInventoryResponseReceived = false;
    this.store.cart.responseSkuCodes = [];
    this.store.cart.shopForObjectInfo = {};
    this.store.profile.pendingJoineeList = [];
    this.store.profile.successJoineeList = [];
    this.store.B2CFlow.B2CUserList=[];
    this.store.B2CFlow.pendingListForMyMobile=[];
    return true;
  };

  @action deleteAccount = async (sendSignOutData = false) => {
    if (sendSignOutData) {
      this.deleteAccountData(); // not using await here (as per requirement)
    }
    await AsyncStore.remove(TOKEN_KEY);
    await AsyncStore.remove(VESTIGE_UT);
    await AsyncStore.remove(USER_TYPE);
    await AsyncStore.remove(DISTRIBUTORID);
    await AsyncStore.remove(COUNTRY_ID);
    await AsyncStore.remove(BASE_LOCATION_ID);
    await AsyncStore.remove(USERROLE);
    await AsyncStore.remove(LASTSESSIONUPDATETIME);
    await AsyncStore.remove(ISNEWSESSION);
    await AsyncStore.remove(RECENTSEARCHRESULTS);
    await AsyncStore.remove(CHECKOUTADDRESS);
    await AsyncStore.remove(SIDEMENUDATA);
    await AsyncStore.remove(LOCALCARTS);
    await AsyncStore.remove('isTouchId');
    await AsyncStore.remove(IS_BIRTHDAY_POPUP_VISIBLE);
    await AsyncStore.remove(LAST_BIRTHDAY_SHOWN);
    await AsyncStore.remove(CURRENTPOSITION);
    await AsyncStore.remove(SELECTEDSHIPPINGTYPE);
    await AsyncStore.remove(ISWAREHOUSESHIPPING);
    await AsyncStore.remove(IS_KYC);
    await AsyncStore.remove(DISTRIBUTOR_TYPE);

    this.reset();
    this.store.profile.reset();
    this.store.network.reset();
    this.store.cart.reset();
    this.store.wishList.reset();
    this.store.myVouchers.reset();
    this.store.myConsistency.reset();
    this.store.myFunds.reset();
    this.store.products.reset();
    this.store.search.reset();
    this.store.dashboard.reset();
    this.store.cart.ordersList = [];
    this.store.profile.firstName = '';
    this.store.profile.lastName = '';
    this.store.profile.email = '';
    this.store.profile.distributorID = '';
    this.store.profile.countryId = -1;
    this.store.profile.uplineDistributorId = '';
    this.store.profile.addresses = [];
    this.store.profile.graphPvValue = [];
    this.store.profile.recentAddress = [];
    this.store.cart.searchedResult = {};
    this.store.cart.validatedDownline = {};
    this.store.cart.ordersList = [];
    this.store.cart.recentOrders = [];
    this.store.cart.alreadyExistsDistributor = {};
    this.store.cart.orderItemsList = [];
    this.store.cart.productItemsList = [];
    this.store.cart.cartVouchers = [];
    this.store.cart.isInventoryResponseReceived = false;
    this.store.cart.responseSkuCodes = [];
    this.store.cart.shopForObjectInfo = {};
    this.store.profile.pendingJoineeList = [];
    this.store.profile.successJoineeList = [];
    return true;
  };

  async validateUplineId(uplineId) {
    this.setIsLoading(true);
    const url = `${Urls.ServiceEnum.SelectDistributor}/${Urls.DistributorServiceEnum.ValidateUpline}${uplineId}`;
    const response = await NetworkOps.get(url);
    this.setIsLoading(false);
    if (!response.message) {
      return { success: true, data: response };
    }
    return { success: false, message: response.message };
  }

  async getDistributorIdListData(countryId) {
    const url = `${Urls.ServiceEnum.SelectDistributor}/${Urls.DistributorServiceEnum.RandomDistributor}?countryId=${countryId}`;
    const response = await NetworkOps.get(url);
    if (!response.message) {
      return response;
    }
  }

  @action setActionVisibilty(status) {
    this.setShowFloat(status);
  }

  async savePushNotification(data) {
    const res = await NetworkOps.postToJson(
      `${Urls.ServiceEnum.SavePushNotification}`,
      data,
    );
    if (!res.message) {
      console.log(res);
    }
  }

  async handlePushNotification() {
    let fcmToken = '';
    let apnsToken = '';
    fcmToken = await AsyncStore.get(FCM_TOKEN);
    if (fcmToken) {
      this.setFcmToken(JSON.stringify(fcmToken));
      console.log(
        `FCM fcmToken = '${JSON.stringify(
          fcmToken,
        )}', apnsToken = '${JSON.stringify(apnsToken)}'`,
      );
      analytics().setUserProperty('UserName', this.distributorID); // Sending DistributorID to Firebase

      const notificationData = {
        userId: this.distributorID,
        device: {
          token: this.fcmToken,
          name: Platform.OS,
        },
      };
      console.log('FCM tokennnn', JSON.stringify(notificationData));
      NetworkOps.postToJson(Urls.ServiceEnum.FcmToken, notificationData);

      // const ref = DB.ref('/userDeviceInfo');
      // await Firebase.database().ref('/userDeviceInfo').set({
      //   token: JSON.stringify(fcmToken),
      // });

      return [fcmToken, apnsToken];
    }
  }
}
