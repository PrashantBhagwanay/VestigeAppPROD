/**
 * @description
 * list of keys used for storage
 */
import { strings } from 'app/src/utility/localization/Localized';

export const VESTIGE_ASYNCSTORAGE_KEYS = {
  VESTIGE_LANGUAGE_STORAGE_KEY: 'LANGUAGE',
  VESTIGE_IS_USER_LOGGED_IN: 'isUserLoggedIn',
  VESTIGE_ACCESS_TOKEN: 'accessToken',
  VESTIGE_DISTRIBUTOR_ID: 'distributorId',
};

export const VESTIGE_API_METHODS = {
  VESTIGE_GET_METHOD: 'GET',
  VESTIGE_POST_METHOD: 'POST',
  VESTIGE_DELETE_METHOD: 'DELETE',
  VESTIGE_PUT_METHOD: 'PUT',
};

export const DASHBOARD_CONSTANT = {
  NEWMEMBER: 'NEW MEMBER REGISTRATION',
};

export const NetworkEnum/*:{[string]:Upline or downline}*/ = {
  Upline: ('upline'),
  Downline: ('downline'),
  UserDistributedId: ('userDistributedId'),
}

export const ConsistencyEnum/*:{[string]:Achieved or History}*/ = {
  Achieved: ('Achieved'),
  Vouchers: ('Vouchers'),
}

export const DISTRIBUTOR_TYPE_ENUM = {
  normal: '0',
  miniDLCP: '1',
  employess :'2',
  b2cDistibutor:'3',
};

export const WinnerEnum/*:{[string]:CarWinner, TripWinner or HomeWinner}*/ = {
  CarWinner: ('1'),
  TripWinner: ('2'),
  HomeWinner: ('3'),
}

export const OrderLogKeyMap = {
  customerOrderNo: 'Order No',
  status: 'Status',
  mobileNo: 'Contact No',
}

export const CategoryTypeEnum/*:{[string]:ShopByCategory, or Offer}*/ = {
  ShopByCategory: ('ShopByCategory'),
  CategoryStoreFront: ('CategoryStoreFront'),
  Offer: ('TripWinner'),
}
export const OfferTypeEnum = {
  MyFund: ('My Fund'),
  MyConsistency: ('Consistency'),
  MyGroupPV: ('My Group PV'),
  MyNetwork: ('My Network'),
  MyLevel: ('My Level'),
  MyVoucher: ('My Voucher'),
  MyBonus: ('My Bonus'),
  MyTraining: ('My Training'),
  MyReferral: ('My Referral'),
  MyPayout: ('My Payout'),
  Coupons: ('Coupons'),
  Orders: ('My Orders'),
  DynamicScreen: ('Extra Data'),
  RepeatOrder: ('Repeat Order'),
  OrderLog: ('Make Payment'),
  PVAnalysis: ('PV Analysis'),
  VestigeAr: ('Vestige AR'),
}

export const MyBonusEnum = {
  BonusTitle: 'Bonus Details',
  TransferTitle: 'Transfer Details'
}

export const MyOrdersEnum = {
  Confirmed: 'Confirmed',
  Cancelled: 'Cancelled',
  Invoiced: 'Invoiced',
  Delivered: 'Delivered',
  Offline: 'Offline'
}

export const OrderViewEnum = {
  orderStatus: 'Track Order',
  orderDetails: 'Order Details',
}

// export const OrderStatusInfo = {

// }

export const MyProspectTabEnum = {
  pending: 'Pending',
  success: 'Success'
}
export const TrainingTypeEnum = {
  MyTraining: ('My  Training'),
  Training: ('Training'),
  NewTraining: ('New Training'),
}

export const B2CUserListTypeEnum = {
  B2CJoinee: ('B2C Joinee'),
  B2CRequest: ('Pending Request'),
}

export const UCDUserListTypeEnum = {
  B2CJoinee: ('Know your Leader'),
  B2CRequest: ('Pending Request'),
}

export const MyTrainingTypeEnum = {
  Pending: ('Pending'),
  Approved: ('Approved'),
  Closed: ('Closed'),
  Rejected: ('Rejected'),
}

export const TrainingRequestType = {
  CNT: 'CNT',
};

export const UserRole = {
  Trainer: ('1'),
  Distributor: ('2'),
  Both: ('3'),
  GuestUser: '4'
}

export const MyVouchersEnum = {
  ProductVouchers: ('Product Vouchers'),
  BonusVouchers: ('Bonus Vouchers'),
  productVouchersKey: 'giftvoucherExtension',
  bonusVouchersKey: 'bonusvoucherExtension'
}

/**
 * @description defining all keys used in the Vestige
 */
export const VESTIGE_GOOGLE_KEYS = {
  VESTIGE_ANDROID_KEY: '835135520321-bebr6cut9svfh41dfpnqb1ldci5bt2um.apps.googleusercontent.com',
  VESTIGE_IOS_KEY: '835135520321-rvgm796vr7ce6442fo8fbk92eu6eu6n8.apps.googleusercontent.com',
  VESTIGE_ANDROID_MAP_KEY: 'AIzaSyBo_UFwo3rMnmuoiYODOLaPjDmO2v0TanY',
  VESTIGE_ENCRYPTION_KEY: '9mMPIi1LIuBX59nphrzlVg==',
};

export const CartCouponType = {
  Gift: ('gift'),
  Bonus: ('bonus'),
}

/**
 * @description Defining all contants image used in the Vestige Application
 */
export const VESTIGE_IMAGE = {
  LOCATION_ICON: require('../../assets/images/location/location.png'),
  STORE_LOCATION_ICON: require('../../assets/images/location/store_location.png'),
  OPEN_PICKER_BUTTON: require('../../assets/images/DashBoardHeader/down_arrow_icon.png'),
  BACK_BUTTON: require('../../assets/images/DashBoardHeader/left_arrow_icon.png'),
  DOB_ICON: require('../../assets/images/Signup/calendar.png'),
  GENDER_ICON: require('../../assets/images/Signup/gender.png'),
  EMAIL_ICON: require('../../assets/images/Signup/email.png'),
  MOBILE_ICON: require('../../assets/images/Signup/mobile.png'),
  PASSWORD_ICON: require('../../assets/images/Signup/password.png'),
  PROFILE_ICON: require('../../assets/images/Signup/profile.png'),
  FOOTER_BACKGROUND_IMAGE: require('../../assets/images/Splash/footerBackground.png'),
  LOGO: require('../../assets/images/logo/logo.png'),
  SIDE_MENU_ICON: require('../../assets/images/DashBoardHeader/hamburger_menu_icon.png'),
  EDIT_ICON: require('../../assets/images/Cart/edit.png'),
  NOTIFICATION_ICON: require('../../assets/images/DashBoardHeader/notification_bell_icon.png'),
  SEARCH_ICON: require('../../assets/images/DashBoardHeader/search_inactive_icon.png'),
  CART_ICON: require('../../assets/images/Cart/cart.png'),
  CLOSE_ICON: require('../../assets/images/DashBoardHeader/close.png'),
  ADD_ICON: require('../../assets/images/Cart/add.png'),
  FORWARD_ICON: require('../../assets/images/Cart/forward.png'),
  CONFIRM_ICON: require('../../assets/images/Cart/tick.png'),
  SHARE_ICON: require('../../assets/images/DashBoardHeader/share_icon.png'),
  //DISTRIBUTOR_ICON: require('../../assets/images/Cart/profileImage.png'),
  DISTRIBUTOR_ICON: require('../../assets/images/DashBoardHeader/profileImage.png'),
  EMPTY_DISTRIBUTOR_CART: require('../../assets/images/Cart/emptyCart.png'),
  TIME_ICON: require('../../assets/images/DashBoardHeader/time.png'),
  CLOSE_COLORED_ICON: require('../../assets/images/common/close.png'),
  CALL_ICON: require('../../assets/images/mobileNumberUpdate/call_icon.png'),
  ADD_MORE_ICON: require('../../assets/images/add.png'),
  REMOVE_ICON: require('../../assets/images/remove.png'),
  CONTACTS_ICON: require('../../assets/images/contact-book.png')
};

/**
 * @description Defining all contants image used in the Vestige Application
 */
export const CONTACT_US_IMAGES = {
  LETS_CONNECT: require('../../assets/images/contactUs/letsConnect.png'),
  PHONE_CALL: require('../../assets/images/contactUs/phoneCall.png'),
  LOCATION: require('../../assets/images/contactUs/location.png'),
  EMAIL: require('../../assets/images/contactUs/mail.png'),
  INSTAGRAM: require('../../assets/images/contactUs/instagram.png'),
  FACEBOOK: require('../../assets/images/contactUs/facebook.png'),
  TWITTER: require('../../assets/images/contactUs/twitter.png'),
  YOUTUBE: require('../../assets/images/contactUs/youtube.png'),
};


/**
 * @description defining the contants used in the signup screen
 */
export const PICKER_ENUM = {
  TITLE_PICKER: 'title',
  COUNTRY_PICKER: 'country',
  STATE_PICKER: 'state',
  CITY_PICKER: 'city',
  GENDER_PICKER: 'gender',
  CODISTRIBUTOR_PICKER: 'coTitle',
  DISTRIBUTOR_PICKER: 'distributor',
  TARGETCITY_PICKER: 'targetCity',
  TRAININGTYPE_PICKER: 'trainingType'
}

export const APP_VALIDATION_CONST = {
  DISTRIBUTOR_MAX_LENGTH: 8,
}

export const SIGNUP_ROUTE = {
  DASHBOARD_ROUTE : 'dashboard',
  LOGIN_ROUTE: 'login',
  ONBOARDING_ROUTE: 'onboarding',
}

export const MOBILE_NUMBER_UPDATE_KEY = {
  EXISTING_NUMBER: 'existingNumber',
  NEW_NUMBER: 'newNumber'
}

export const SIGNUP_KEY_ENUM = {
  DISTRIBUTOR_ID:  'distributorId',
  FOSTER_ID: 'fosterId',
  REFERAL_CODE: 'referalCode',
  SEPERATOR: 'seperator',
  FIRSTNAME: 'firstName',
  LASTNAME: 'lastName',
  DOB: 'dob',
  MOBILE_NUMBER: 'mobileNumber',
  EMAIL_ID: 'emailId',
  PINCODE: 'pincode',
  ADDRESS: 'address',
  PASSWORD: 'password',
  CONFIRM_PASSWORD: 'confirm_password',
  CO_DISTRIBUTOR_FIRSTNAME: 'coDistributorFirstName',
  CO_DISTRIBUTOR_LASTNAME: 'coDistributorLastName',
  CO_DISTRIBUTOR_DOB: 'coDistributorDob',
  RELATIONSHIP: 'relationship',
  ADDRESS1: 'address1',
  ADDRESS2: 'addres2',
  SPOUSE_NAME: 'spouseName',
  PO_BOX_NUMBER: 'poBoxNumber',
  DIGITAL_ADDRESS_GHANA: 'digitalAddressGhana'
}

export const LOGIN_KEY_ENUM = {
  password: 'Password',
  otp: 'Verification code',
  deviceNotRegistered: ['ERROR_DI', 'CONFIRM_FIRST_OTP', 'ERROR_DN'],
  // currentDeviceNotRegistered: 'ERROR_DI', // (Confirm Device OTP, New device found but not yet registered i.e if user is trying to login with another device)
  // confirm_Otp: 'CONFIRM_FIRST_OTP', // (Confirm Device OTP, New device found but not yet registered i.e if user is trying to login with another device)
  // noDeviceRegistered: 'ERROR_DN' , // when any device is not associated with user.
  mobileNotRegistered: 'ERROR_MB'  // When mobile is not registered.
}

export const INPUT_COMPONENT_TYPE = {
  VALID_FOSTER: 'signupValidUpline',
  SIGNUP_VALID_UPLINE: 'signupValidUpline',
  VALID_UPLINE: 'validUpline',
  SEPERATOR:'seperator',
  // REFERAL_CODE: 'referalCode',
  PICKER: 'picker',
  TEXTINPUT_WITH_ICON: 'textInputWithIcon',
  DATE_PICKER: 'datePicker',
  TEXTINPUT_WITH_ICON_WITH_ICON: 'textInputWithIconWithIcon',
  TERMS_AND_CONDITIONS: 'termsAndConditions',
  USER_DECLARATION: 'userDeclaration'
}

/**
 * Month January-December
 */
export const Month = [
  'Jan', 'Feb', 'Mar',
  'Apr', 'May', 'Jun', 'Jul',
  'Aug', 'Sep', 'Oct',
  'Nov', 'Dec'
];

export const MONTH_DATA = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const TITLE_DATA=[
  {titleId: 1, title: 'Mr.'},
  {titleId: 2, title: 'Mrs.'},
  {titleId: 3, title: 'Dr.'},
  {titleId: 4, title: 'Ms.'},
  {titleId: 8, title: 'Mx.'}
];

// export const GENDER_DATA=[
//   'Male',
//   'Female',
//   'Others',
// ];

export const GENDER_DATA = [
  { 'titleId': 1, 'title': 'Male' },
  { 'titleId': 2, 'title': 'Female' },
  { 'titleId': 3, 'title': 'Others' }
];

// export const VESTIGE_NAVIGATION_ROUTE_NAME = {
//   LOCATION_ROUTE: location,
// }

export const ERROR_MESSAGE = {
  invalidUpline: 'Invalid Upline id, please enter valid Upline. It must be of 8 numbers long.No Special characters allowed.',
  invalidName: 'Invalid Name, please enter valid Name',
  invalidUserTitle: 'Please select your title.',
  invalidLastName: 'Invalid Last name, please enter valid last name',
  invalidUserGender: 'Please select your gender.',
  invalidPhoneNumber: 'Invalid Phone Number',
  invalidAddress: 'Invalid Address, please enter valid address, It must be 1 characters long',
  invalidEmail: 'Invalid Email Id!!! please enter valid email',
  invalidPassword: 'Password must be minimum 6 characters.Spaces are not allowed',
  invalidConfirmPassword: 'Confirm password must be minimum 6 characters. Spaces are not allowed',
  invalidMatchPassword: 'Password doesn\'t match',
  invalidDistributorId: 'Invalid id, please enter valid id. It must be 8 numbers',
  invalidDob: 'Invalid dob, You are not eligible, your age is below 18',
  invalidPanNumber: 'Invalid Pan Number, Please enter valid pan number',
  invalidCoDistributorTitle: 'Please select co-destributor title.',
  invalidCodistributorDob: 'Invalid co-distributor dob, Co-distributor age is below 18',
  invalidCoDistributorName: 'Invalid co-distributor name, please Enter valid co-distributor name',
  invalidCoDistributorLastName: 'Invalid co-distributor last name, please Enter valid co-distributor last name',
  invalidPinCode: 'Please provide valid pincode',
  invalidCountry: 'Please select your country',
  invalidState: 'Please select your state',
  invalidCity: 'Please select your city',
  invalidDistributor: 'Please select your Distributor ID',
  noDownlineFound: 'No downline found for this user!',
  noDownlineForLoggedInDistributor: 'No downline found for you!',
  noUpline: 'No Upline found for this user!',
  noDeviceLoggedIn: "No Device found for this user!",
};

export const ChangePassword_ERROR_MESSAGE = {
  currentPassword : strings.changePassword.errCurrentPassword,
  newPassword : strings.changePassword.errNewPassword,
  confirmPassword : strings.changePassword.errConfirmPassword,
  matchPassword : strings.changePassword.errMatchPassword
}

export const NewTraining_ERROR_MESSAGES = {
  date : 'please select your training Date',
  startTime : 'please select Start Time',
  endTime : 'please select End Time',
  coTrainer : 'please fill your Co-Trainer Id',
  venue : 'please fill your Venue Name',
  selectedCountry : 'please select your Country',
  selectedState : 'please select your State',
  selectedCity : 'please select your City',
  selectedTargetCity : 'please select your Target City',
  selectedTrainingType : 'please select your Training Type',
  targetSale : 'please fill your target sale',
  travel : 'please fill your Budget for travel',
  hotel : 'please fill your Budget for hotel',
  food  : 'please fill your Budget for food',
  misc : 'please fill your Budget for misc',
  travelFrom : 'please fill Travel from',
  travelTo : 'please fill Travel to'
}

export const KYC_ERROR_MESSAGE = {
  kycError: 'Your kyc is not completed. Please press continue to complete your kyc'
}

/**
 * @description defining all route path for location screen
 */
export const LOCATION_ROUTE_PATH = {
  back: 'pop',
  parentBack: 'address',
  next: 'navigate',
}

export const SHIPPING_TYPE = {
  regularDelivery: 'Regular Delivery',
  expressDelivery: 'Express Delivery',
  warehouseDelivery: 'Warehouse Delivery'
}

export const SHIPPING_TYPE_ID = {
  regularDelivery: '0',
  expressDelivery: '1',
  warehouse:{
    homeDelivery: '1',
    storePickup: '2'
  }
}

export const KYC_CONSTANT = {
  aadharCard: 'aadhar',
  voterId: 'voterId',
  passport: 'passport',
  driverLicence: 'driverLicence',
  nationalIdentityCard: 'nationalIdentityCard',
};

export const SESSION_CONSTANT = {
  session: 'SESSION',
  time: 'TIME_OUT',
  onLaunch: 'ON_LAUNCH',
  default: ''
}

export const GA_CONSTANT = {
  trackingId: 'UA-130014442-1',
  tracker_interval: 5
}

export const MYFUND_CONSTANT =  {
  fundType:{
    carFund:{
      apiKey:'carfund',
      type:'carFund',
    },
    travelFund:{
      apiKey:'travelfund',
      type:'travelFund',
    },
    houseFund:{
      apiKey:'housefund',
      type:'houseFund',
    }
  }
}

export const UAE_JSON = [
  {
    'ID': '1',
    'PinCode': '100001',
    'Countryid': '4',
    'Stateid': '54',
    'City': '37325',
    'Zoneid': '9',
    'PincodeLabel': 'Dubai',
    'stateName': 'Dubai'
  },
  {
    'ID': '2',
    'PinCode': '100002',
    'Countryid': '4',
    'Stateid': '55',
    'City': '37331',
    'Zoneid': '9',
    'PincodeLabel': 'Abu Dhabi',
    'stateName': 'Abu_Dhabi'
  },
  {
    'ID': '3',
    'PinCode': '100003',
    'Countryid': '4',
    'Stateid': '57',
    'City': '37333',
    'Zoneid': '9',
    'PincodeLabel': 'Sharjah',
    'stateName': 'Sharjah'
  },
  {
    'ID': '4',
    'PinCode': '100004',
    'Countryid': '4',
    'Stateid': '58',
    'City': '37334',
    'Zoneid': '9',
    'PincodeLabel': 'Ajman',
    'stateName': 'Ajman'
  },
  {
    'ID': '5',
    'PinCode': '100005',
    'Countryid': '4',
    'Stateid': '59',
    'City': '37335',
    'Zoneid': '9',
    'PincodeLabel': 'Um Al Quwain',
    'stateName': 'Um_Al_Quwain'
  },
  {
    'ID': '6',
    'PinCode': '100006',
    'Countryid': '4',
    'Stateid': '60',
    'City': '37336',
    'Zoneid': '9',
    'PincodeLabel': 'Ras Al Khaimah',
    'stateName': 'Ras_Al_Khaimah'
  },
  {
    'ID': '7',
    'PinCode': '100007',
    'Countryid': '4',
    'Stateid': '61',
    'City': '37337',
    'Zoneid': '9',
    'PincodeLabel': 'Al Fujairah',
    'stateName': 'Al_Fujairah',

  }
]

export const APP_CONFIG = {
  SKIP_KYC_BUTTON: 'skip_kyc',
  BANK_PAN_SCREEN: 'bankPan_accessibility',
  STARRED_DOWNLINE_COUNT: 'starred_downln_count',
  V2_ACTIVE_LOCATION: 'v2_active_location',
  CHAT_SUPPORT: 'chat_support',
  SHOPPABLE_COUNTRY: 'shoppable_country_list',
  MAKE_PAYMENT_WARNING: 'make_payment_warning',
  ON_CALL_OTP_LIMIT: 'on_call_otp_limit',
}

export const RECOMMENDATION_CONFIG = {
  LEVEL: 'level',
  PERCENTAGE: 'percentage',
}

export const MENU_LIST_CONFIG_LOCAL = {
  DEPTH_LEVEL:'depth_level', 
  REPEAT_ORDER:'repeat_order',
  WISHLIST_ICON:'wishlist_icon',
  ADD_NEW_DISTRIBUTOR_VISIBLE:'add_new_distributor_visible',
  LOCATION_UPDATE:'location_update',
  CATEROGY_NAME: 'category_name',
  CATEGORY_VISIBLE: 'category_visible',
  SHOP_NAME:'shop_name',
  SHOP_VISIBLE:'shop_visible',
  INSTRUCTION_VISIBLE: 'Instruction_visible',
  VIDEO_FLAG: 'video_flag',
  FREQUENTLY_BOUGHT_TOGETHER_VISIBLE:'frequently_bought_together_visible',
  ADD_CART_VISIBLE: 'add_cart_visible',
  NOTIFY_ME_VISIBLE: 'notify_me_visible',
  EXPLORE_VESTIGE_VISIBLE:'explore_vestige_visible'
}