// @flow
/* global __DEV__ */

const PRODUCTION_ENDPOINT_DOMAIN = 'http://vstg-gateway-prod-1532961163.ap-south-1.elb.amazonaws.com:80';
// const PRODUCTION_ENDPOINT_DOMAIN = 'https://gateway.myvestige.com';

// const STAGE_ENDPOINT_DOMAIN = 'http://vstgl-gateway-load-1830349154.ap-south-1.elb.amazonaws.com:80';

const LOAD_TESTING = 'http://3.111.161.241:8080';

const QA_ENDPOINT_DOMAIN = 'http://13.232.167.44:8080'; // Primary Testing server
const DEV_ENDPOINT_DOMAIN = 'http://3.108.189.213:8080'; // Secondary Testing server (Used for RDS Upgrade)
const PREDEV_ENDPOINT_DOMAIN = 'http://15.207.73.177:8080'; // Alternative server {v2 implementation}

const AUTOMATION_TESTING = 'http://35.154.190.62:8080';
const WEBSITE_QA_SERVER='https://qawebsite-gateway.myvestige.com';
const WEBSITE_PRODUCTION_SERVER='http://vstg-gateway-prod-956432471.ap-south-1.elb.amazonaws.com';

export const ACTIVE_HOST = PRODUCTION_ENDPOINT_DOMAIN //QA_ENDPOINT_DOMAIN //PRODUCTION_ENDPOINT_DOMAIN;

export const TESLON_CONFIG={
  DOAMIN:"vestigestaging.carenation.in",
  API_KEY:"479868b2-7783-4fe2-96f1-519d1106cfd0",
}

const PREFIX = {
  Cart: 'cart/',
  Product: 'product/',
  Notification: 'notification/',
  Promotion: 'promotion/',
  Order: 'order/',
  Common: 'common/',
  Profile: 'profile/',
  Wishlist: 'product/',
  Uaa: 'uaa/',
  Normal: '',
};

export const ServiceEnum /*:{[string]:ServiceType}*/ = {
  Otp: (PREFIX.Uaa + 'api/v1/send/otp-v4' /*:ServiceType*/),
  Login: (PREFIX.Normal + 'auth/login/v5' /*:ServiceType*/),
  // Login: (PREFIX.Normal + 'auth/login/v2'/*:ServiceType*/),
  // Login: (PREFIX.Normal + 'auth/login'/*:ServiceType*/),
  appConfiguration: PREFIX.Common + 'api/getApp-Data',
  GuestLoginIos: PREFIX.Normal + 'auth/guest-login'/*:ServiceType*/,
  changePassword: PREFIX.Uaa + 'api/v1/account/change-password-v3',
  ConfirmDevice: PREFIX.Profile + 'api/v2/distributors/confirm-device',
  ConfirmMobile: PREFIX.Profile + 'api/v2/distributors/confirm-mobile',
  ConfirmMobileOtp: PREFIX.Profile + 'api/v2/distributors/confirm-mobile-otp',
  DistributorApiV2:PREFIX.Profile + 'api/version2/distributors' /*:ServiceType*/,
  Distributor: (PREFIX.Profile + 'api/v1/distributors' /*:ServiceType*/),
  // signup: (PREFIX.Profile + 'api/v3/distributors' /*:ServiceType*/),
  signup: (PREFIX.Profile + 'api/v4/distributors'/*:ServiceType*/),
  DistributorSearchByUcd: (PREFIX.Profile + 'api/distributor-upline-ucd-name-search?searchName=' /*:ServiceType*/),
  DistributorUCDId: (PREFIX.Profile + 'api/search-network-ucd?distributorId=' /*:ServiceType*/),
  HomeDelivery: PREFIX.Profile + 'api/v1/distributors/',
  DeleteAddress: PREFIX.Profile + 'api/v1/distributors/delete-address',
  UpdateAddress: PREFIX.Profile + 'api/v1/distributors/update-address',
  deleteMiniDLCPUserAddress: PREFIX.Profile + 'api/v1/distributors/delete-minidlcp-addresses',
  updateMiniDLCPUserAddress: PREFIX.Profile + 'api/v1/distributors/update-minidlcp-addresses',
  MyTrainingList: PREFIX.Profile + 'api/v1/training/details-CNT/',
  TrainingList: PREFIX.Profile + 'api/v1/training/types',
  TrainingCountry: PREFIX.Profile + 'api/v1/training/country/trainer/',
  TrainingState: PREFIX.Profile + 'api/v1/training/state/trainer/',
  TrainingCity: PREFIX.Profile + 'api/v1/training/city/trainer/',
  TrainingDetail: PREFIX.Profile + 'api/v1/training/details-CNT/',
  TrainingProspectsList: `${PREFIX.Profile}api/v1/training-prospect-user-list?distributorId=`,
  TrainingProspectsMobNo: `${PREFIX.Profile}api/v1/training-attended-users-mob?distributorId=`,
  TrainingProspectsAttended: `${PREFIX.Profile}api/v1/submit-training-attended-users`,
  TrainingDetailWithType: PREFIX.Profile + 'api/v1/training/types/',
  TrainingLocationWithStateCity: `${PREFIX.Profile}api/v1/cnt-state-city-dlcp-list?stateId=`,
  WhatTheySaid: PREFIX.Profile + 'api/v1/distributors/what-they-said',
  Wishlist: PREFIX.Wishlist + 'api/wishlists',
  BonusDetails: PREFIX.Profile + 'api/v2/distributors/',
  TrainingTypes: PREFIX.Profile + 'api/v1/training/types',
  NewTraining: PREFIX.Profile + 'api/v1/training/details',
  TrainerProfile: PREFIX.Profile + 'api/v1/trainer/',
  BirthdayList: PREFIX.Profile + 'api/v1/distributors/',
  CategoryList: PREFIX.Product + 'api/v1/categories',
  ProductList: PREFIX.Product + 'api/v1/products-v2' /*ServiceType*/,
  ProductDetail: PREFIX.Product + 'api/v1/products-v2/code',
  FrequentlyBoughtTogether: PREFIX.Product + 'api/v1/bought-togethers',
  BrandList: PREFIX.Product + 'api/v1/products/brands' /*ServiceType*/,
  Query: PREFIX.Product + 'api/v1/products/query',
  StoreList: PREFIX.Product + 'api/v1/stores/city-v2/',
  ProductRatings: PREFIX.Product + 'api/v1/product-ratings',
  OrderRatings: PREFIX.Order + 'api/v1/order-ratings',
  GetorderRatings: PREFIX.Order + 'api/v1/ratings/',
  CourierDetails: PREFIX.Order + 'api/nepal/courier-details',
  Recommendation: PREFIX.Profile + 'api/v1/distributors' /*:ServiceType*/,
  AutoDetectLocation: PREFIX.Product + 'api/v1/stores/locations?longitude=',
  Filter: PREFIX.Product + 'api/v1/products/filters?q=',
  VbdStores: PREFIX.Product + 'api/v1/vbd/stores?state=',
  GetAllStoresByState: PREFIX.Product + 'GetAllStoresByState',
  InventoryCheck: PREFIX.Product + 'api/v1/products/inventory?',
  InventoryCheckApiV2: PREFIX.Product + 'api/v1/products/version2/inventory?',
  Cart: PREFIX.Cart + 'api/v1/carts',
  CartApiV2: PREFIX.Cart + 'api/v1/version2',
  CartIdURL: PREFIX.Cart + 'api/v1/carts/',
  CartAddress: '/address?addressId=',
  removeProduct: PREFIX.Cart + 'api/v1/version2/removeProduct',
  OrderChekout: PREFIX.Order + 'api/v2/orders-checkouts/v3',
  // OrderChekoutApiV2: PREFIX.Order + 'api/version2/orders-checkouts-v2',
  OrderChekoutApiV2: PREFIX.Order + 'api/version2/orders-checkouts-v2/uae',
  GenerateOrderCheckoutLog:
    PREFIX.Order + 'api/v3/order-checkout/orders-generate-log',
  GenerateOrderCheckoutLogApiV2:
    PREFIX.Order + 'api/version2/order-checkout-v2/orders-generate-log',
  TrackOrderApiV2: PREFIX.Order + 'api/version2/track-order-v2',
  OfflineOrderApi: PREFIX.Order + 'api/getDistributorOfflineOrder',
  TrackOrder: PREFIX.Order + 'api/v1/track-order-v4',
  OrderDetails: PREFIX.Order + 'api/v1/order/product-detail/v3',
  OrderDetailsApiV2: PREFIX.Order + 'api/version2/getOrderDetail',
  FetchSingleOrder: PREFIX.Order + 'api/v1/fetch-order-v3',
  FetchSingleOrderApiV2: PREFIX.Order + 'api/version2/fetch-order-v3',
  DownloadInvoice: PREFIX.Order + 'api/v1/order/pdf',
  PaymentDetails: PREFIX.Order + 'api/v2/orders-checkouts/payment-details',
  DistributorV2:'profile/api/v2/distributors',
  // PaymentDetailsApiV2:
  //   PREFIX.Order + 'api/version2/orders-checkouts/payment-details',
  PaymentDetailsApiV2:
PREFIX.Order + 'api/version2/orders-checkouts/payment-details/uae',
  OrderLogListApiV2: PREFIX.Order + 'api/version2/log-order-details/',
  PaymentVerifictionPaytmDetails: PREFIX.Order + 'api/v2/orders-checkouts/payment-details-check-status',
  OrderLogList: PREFIX.Order + 'api/v4/log-order-details/',
  getLogPayment: PREFIX.Order + 'api/v2/distributor/payment/v3?logNo=',
  getLogPaymentApiV2: PREFIX.Order + 'api/version2/distributor/payment?logNo=',
  PromotionsProductList: PREFIX.Product + 'api/v1/products/ids?',
  CountryList: PREFIX.Common + 'api/v1/countries',
  StateList: PREFIX.Common + 'api/v1/states/country/',
  CityList: PREFIX.Common + 'api/v1/cities/state/',
  Pincode: PREFIX.Common + 'api/v1/pincodes/country/',
  CountryStateCity: PREFIX.Common + 'api/v1/pincodes/location/',
  CountryStateCityId: PREFIX.Common + 'api/v1/cities/',
  AboutUs: PREFIX.Common + 'api/v1/static-content',
  // Paytm: PREFIX.Order + 'api/v1/paytm/checksum/v3',
  // PaytmHash: PREFIX.Order + 'api/v1/paytm/checksum/v3',
  Paytm: PREFIX.Order + 'api/v1/paytm/checksum/v4',
  PaytmHash: PREFIX.Order + 'api/v1/paytm/checksum/v4',
  // PaytmHashApiV2: PREFIX.Order + 'api/v1/paytm/checksum/version2',
  PaytmHashApiV2: PREFIX.Order + 'api/v1/telr/checksum',
  PaytmHashVerify: PREFIX.Order + 'api/v1/paytm/checksum/v4/verification',
  PaytmHashVerifyApiV2: PREFIX.Order + 'api/v1/paytm/checksum/verification',
  FileUpload: PREFIX.Common + 'api/v1/file-upload-new',
  GeneralQueryTypes: PREFIX.Common + 'api/v1/general-queries/query-type',
  GeneralQuery: PREFIX.Common + 'api/v1/general-queries',
  Faq: PREFIX.Common + 'api/v1/app-faqs?search=keyword=',
  SelectDistributor: PREFIX.Profile + 'api/v1/distributors',
  AddressList: PREFIX.Profile + 'api/v1/distributor/',
  Banners: PREFIX.Promotion + 'api/v2/promotion-banners-new',
  OrdersPromotion: PREFIX.Promotion + 'api/v1/orders-promotion',
  VideoGallery:
    PREFIX.Promotion + 'promotion-0.0.1-SNAPSHOT/api/v1/video-galleries',
  CancelOrder: PREFIX.Order + 'api/v1/distributor/',
  CancelOrderApiV2: PREFIX.Order + 'api/version2/distributor/',
  AppVersion: PREFIX.Profile + 'api/v2/',
  Notification: PREFIX.Notification + 'api/v1/push-notifications/mobile',
  NotificationDelete: PREFIX.Notification + 'api/v1/push-notifications/delete/',
  ValidateMobile: PREFIX.Notification + 'api/v1/send/otp/v3',
  VerifyMobile: PREFIX.Notification + 'api/v1/verify/mobile',
  checkDuplicateNumber: PREFIX.Notification + 'api/v1/check-valid-number',
  FcmToken: PREFIX.Notification + 'api/v1/push-notifications',
  SavePushNotification:
    PREFIX.Notification + 'api/v1/push-notification/mobile/save',
  BranchDetails: PREFIX.Wishlist + 'api/v1/stores-v2/branch-details?branchType=',
  PostDistributorFeedback: PREFIX.Profile + 'api/v1/distributors-feedbacks',
  DistributorFeedbacks:
    PREFIX.Profile + 'api/v1/distributors-feedbacks/uplines',
  GuestUser: PREFIX.Uaa + 'api/v1/guest-users',
  RepeatLastOrder: PREFIX.Cart + 'api/v1/carts/repeat-order',
  RepeatLastOrderApiV2: PREFIX.Cart + 'api/v1/version2/repeat-order',
  OtpStatus: PREFIX.Notification + 'api/v1/otp/verification/status',
  SendSms: PREFIX.Notification + 'api/v1/send-sms',
  panUpload: PREFIX.Profile + 'api/v1/distributors/panUpload',
  savePanDetails: PREFIX.Profile + 'api/v1/distributors/save-pan-details',
  panBankDetails: PREFIX.Profile + 'api/v1/distributors/panbankdetails',
  getBankList: PREFIX.Profile + 'api/v2/distributors/getBankList',
  getBankBranch: PREFIX.Profile + 'api/v2/distributors/getBranchIFSC',
  verifyLogin:
    PREFIX.Profile + 'api/v1/distributors/distributorId/verify-login',
  uploadBankDocument: PREFIX.Profile + 'api/v2/distributors/bankUpload',
  saveBankDetails: PREFIX.Profile + 'api/v1/distributors/save-bank-details',
  checkAccNoLength: PREFIX.Profile + 'api/v1/distributors/accountNumber-length',
  dafUpload: PREFIX.Profile + 'api/v1/distributors/daf-upload',
  dynamicScreen: PREFIX.Profile + 'api/v1/distributors/dynamic-screen/',
  consistencyDetail:
    PREFIX.Profile + 'api/v1/distributors/consistency-details/',
  panBankDetailsData:
    PREFIX.Profile + 'api/v1/distributors/pan-bank-details?distributorId=',
  registerUnregSearchDeviceId:
    PREFIX.Profile + 'api/v2/distributor/reg-unreg-search-device-id',
  getMenuConfig: PREFIX.Common + 'api/v1/get-menu-config?countryId=',
  getDepthLevel: PREFIX.Common + 'api/v1/get-depth-level?countryId=',
  outOfStock: PREFIX.Cart + 'api/v1/carts/products/out-of-stock',
  removeMultipleProduct: PREFIX.Cart + 'api/v1/carts/products/deleteByIds',
  UpdateRatingNotification:
    PREFIX.Notification + 'api/v1/notification/update-rating/',
  userOtpVerification: PREFIX.Notification + 'api/v1/verify/mobile/sign-up',
  completeRegistration:
    PREFIX.Profile + 'api/v1/distributors/completeRegistration-v3',
  newJoinings: PREFIX.Profile + 'api/distributor/new-joining',
  prospectMessageReminder: PREFIX.Profile + 'api/distributor/my-prospect/',
  NewsDetails: PREFIX.Profile + 'api/distributor/news-data',
  // downlineRegistration: PREFIX.Profile + 'api/v1/distributors/downlineRegistration',
  downlineRegistration: (PREFIX.Profile + 'api/v4/distributors/downlineRegistration'),  
  verifySignupOtp: PREFIX.Notification + 'api/v1/verify/mobile-signup-otp/',
  orderStatusTracking: PREFIX.Order + 'api/v1/order-tracking',
  orderStatusTrackingApiV2: PREFIX.Order + 'api/version2/order-tracking',
  courierTracking: PREFIX.Order + 'api/v1/courier-tracking',
  notifyForConsistency: PREFIX.Notification + 'api/v1/consistency-notification',
  checkMobileNumberUpdateStatus:
    PREFIX.Profile + 'api/v1/distributors/mobUpdateValidation/',
  sendOtpToUpdateNumber:
    PREFIX.Profile + 'api/v1/distributors/distributorGetOTP/',
  updateMobileNumber:
    PREFIX.Profile + 'api/v1/distributors/distributorMobUpdate/',
  validateUser: PREFIX.Profile + 'api/v1/distributors/validate-downline',
  validateOtherUser: PREFIX.Profile + 'api/v1/distributors/mini-dlcp-info',
  validateFoster: (PREFIX.Profile + 'api/v1/distributors/foster-details'),
  validateFosterWithoutLogin: (PREFIX.Profile + 'api/v1/distributors/foster-details-without-login'),
  renewVoucher: PREFIX.Profile + 'api/v1/distributors/renew-voucher',
  contactUs: PREFIX.Common + 'api/v1/contactus',
  miUserUpdateLedger: PREFIX.Order + 'api/v1/update-ledger',
  submitPaymentDetails: PREFIX.Order + 'api/v1/submit-payment-details',
  submitPaymentDetailsV2: PREFIX.Order + 'api/version2/submit-payment-details',
  fetchProductCatalogue: PREFIX.Common + 'api/catalogue-data',
  sendSignOutData: PREFIX.Uaa + 'api/v1/signout-details',
  fetchInfoMessage: PREFIX.Profile + 'api/v1/dashboard-popup',
  fetchTicketEvents: PREFIX.Product + 'api/v1/fetch-ticket-events',
  fetchYoutubeVids: `${PREFIX.Profile}api/v1/distributors/youtube-videos`,
  fetchFeedbackList: `${PREFIX.Profile}api/v1/list-distributor-feedback`,
  submitFeedback: `${PREFIX.Profile}api/v1/submit-distributor-feedback`,
  fetchFeedbacks: `${PREFIX.Profile}api/v1/list-distributor-feedback-data?distributorId=`,
  shareDistributorMobile: `${PREFIX.Profile}api/v1/share-feedback-distributor-mobile-number?distributorId=`,
  validateTrainer: `${PREFIX.Profile}api/v1/validate-trainer`,
  requestedTrainingList: `${PREFIX.Profile}api/v1/cnt-training-list`,
  trainingRejectReasons: `${PREFIX.Profile}api/v1/event-reject`,
  trainerPayoutData: `${PREFIX.Profile}api/v1/trainer-payout-details`,
  submitTrainingDetails: `${PREFIX.Profile}api/v1/submit-training`,
  cntTrainerList: `${PREFIX.Profile}api/v1/cnt-trainer-list`,
  cntDistributorDetails: `${PREFIX.Profile}api/v1/cnt-distributor-details`,
  cancelTraining: `${PREFIX.Profile}api/v1/cancel-training`,
  cntDlcpList: `${PREFIX.Profile}api/v1/dlcp-list-cnt`,
  cntDlcpAddressInfo: `${PREFIX.Profile}api/v1/training-location-info`,
  cntTrainingImageUpload: `${PREFIX.Profile}api/v1/cnt-training-image`,
  fetchKycGuidelines: `${PREFIX.Profile}api/v1/`,
  cntClaimFromSubmit: `${PREFIX.Profile}api/submit-cnt-claim-form`,
  cntReimburseImageUpload: `${PREFIX.Profile}api/training-reimburse-img-upload`,
  getBasicCntExpense: `${PREFIX.Profile}api/get-basic-cnt-expense?distributorId=`,
  getV20qualifier: `${PREFIX.Profile}api/v20-qualifier?distributorId=`,
  getV20RegiserationQulifyer: `${PREFIX.Profile}api/v20-anniversary?distributorId=`,
  getSurveyFormDetails:`${PREFIX.Profile}api/getEligibleSurvey`,
  saveSurveyFormDetails:`${PREFIX.Profile}api/submitSurvey`,
  uploadSurveyImage:`${PREFIX.Profile}api/uploadSurveyImg`,
  b2cUserPendingList:`${PREFIX.Profile}api/pendingReqOfB2BB2CId`,
  requestAcceptMobileApi:`${PREFIX.Profile}api/shareMobileNo`,
  requestForMobileNoShare:`${PREFIX.Profile}api/b2bB2CMobileNoShareReq`,
  pendingListForMyMobileNo:`${PREFIX.Profile}api/pendingReqAcceptB2BB2CId`,
  becomeB2bDistibutorUrl:`${PREFIX.Profile}api/isShowMobileNo?distributorId=`,
  checkGstDistributor: PREFIX.Cart + 'api/v1/checkGstDistributor',
  
};

export const DistributorServiceEnum /*:{[string]:ServiceType}*/ = {
  MyFundsDetails: 'funds?fundtype=',
  MyVouchers: 'vouchers',
  Payouts: 'payouts',
  UserDownline: 'downline',
  HierarchyLevel: 'hierarchy-level',
  uploadProfileImg: 'uploadProfileImg',
  UploadedKyc: 'uploaded-kyc',
  KycUpload: 'kyc-upload',
  KycStatus: 'kyc-status',
  KycGuideline: 'kyc-guidelines',
  kycPreCheck: 'check-data',
  kycOcrApprove: 'kycAutoApprove',
  kycVerifyAadhaar: 'kycVerifyAadhaar',
  PointDetail: 'point-details',
  Consistency: 'consistency',
  CncVoucher: 'cnc-voucher',
  FeedVideo: 'video-feed',
  WishlistRemove: 'remove-product',
  Downline: 'downline',
  PointHistory: 'point-history',
  PayoutsMonthly: 'payouts?yearmonth=',
  CheckoutAddress: 'checkoutaddress',
  WinnersList: 'achievers?achieveType=',
  IsSponsored: 'isSponsored=true',
  IsNewLaunch: 'isNewLaunch=true',
  NotifyMe: '/notify-me',
  NotificationIsActive: '?isActive=true',
  CartGiftVoucher: '/voucher-details/',
  ValidateDistributor: 'downline-infos?downLineId=',
  orderLogNumber: '?logNumber=',
  uplineParams: 'upline?clientId=',
  downlineParams: 'downline?clientId=',
  downlineSearchName: 'searchName?name=',
  multipleDownlineData: 'multipleDownlineData',
  OrderDetailsParamsLogNumber: 'my-order?logNumber=',
  OrderDetailsParamsOrderNumber: '&orderNumber=',
  OrderDetailParams: '?orderNumber=',
  RecentOrders: '/recent-one',
  RandomDistributor: 'random',
  desiredLevelParams: 'desired-level?levelId=',
  desiredPercentageParams: 'desired-percentage?desiredPercentage=',
  address: 'addresses/v3',
  miUserAddress: 'minidlcp-addresses',
  saveMiUserAddress: 'save-minidlcp-addresses',
  getMiniDLCPStore: 'minidlcp-store',
  ProductCodeParams: '&sku=',
  ValidateUpline: 'upline/validate/',
  Store: 'store',
  HomeDelivery: 'homedeliveryaddress/v3',
  DownlineCount: 'downline-count',
  CancelOrder: 'cancel-order?logNumber=',
  ProductIds: '&productIds=',
  AppVersion: 'app-versions',
  InventorySort: 'availableQuantity:DESC',
  SkipAddress: 'skip-address',
  VideoList: 'feeds/videos',
  staredDownlines: 'starred-downlines',
  pvComparison: 'pv-comparison',
  shippingType: '/shippingType',
  expressDeliveryInfo: '/expressDeliveryInfo-v2',
  warehouseShipping: '/warehouseShipping',
  idCard: '/idcard',
  downloadIdCard: '/downloadIdCardPDF',

};

export const PromotionServiceEnum /*:{[string]:ServiceType}*/ = {
  MerchHierarchy: 'merchHierarchy',
  DownlineInfo: 'login/distributor/downline-Info',
  CartPromotionDetails: 'promotion-detail',
  miUserDownlineInfo: 'login/distributor/mini-dlcp-downline-Info',
};

export const CartServiceEnum /*:{[string]:ServiceType}*/ = {
  ViewCart: 'distributor',
  Product: 'products',
  RepeatOrder: 'repeat-order',
  OrderID: '?orderNumber=',
};

export const urlFor = (service /*:ServiceType*/): ?string => {
  if (service && service.includes('GetAllStoresByState')) {
    return `https://www.vestigebestdeals.com/api/rest/GetAllStoresByState`;
  }
  if (service && !service.includes('GetAllStoresByState')) {
    return `${ACTIVE_HOST}/${service}`;
  }
  return undefined;
};
