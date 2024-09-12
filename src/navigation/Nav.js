/**
 * @description defining all routes here
*/

import {
  StackNavigator,
  TabNavigator,
  TabBarBottom,
  SwitchNavigator,
  DrawerNavigator,
  NavigationActions
} from 'react-navigation';
import React from 'react';
import { StyleSheet, StatusBar, Platform,Alert } from 'react-native';
import TouchID from 'react-native-touch-id';
import Icon from 'react-native-vector-icons/Ionicons';
import { strings } from 'app/src/utility/localization/Localized';
import * as AsyncStore from "app/src/utility/AsyncStoragesUtils";

// importing all screens here
import LOGIN_SCREEN from 'app/src/screens/login/Login';
import LOGINCONFIRMDEVICEOTP from 'app/src/screens/login/LoginConfirmDeviceOtp';
import SIGNUP_SCREEN from 'app/src/screens/signup/Signup';
import DOWNLINE_REGISTRATION from 'app/src/screens/signup/DownlineRegistration';
import COMPLETE_REGISTRATION from 'app/src/screens/signup/CompleteRegistration';
import FORGOTPASSWORD_SCREEN from 'app/src/screens/forgotPassword/ForgotPassword';
import DASHBOARD_SCREEN from 'app/src/screens/Dashboard/Dashboard';
import KYC_SCREEN from 'app/src/screens/kyc/KycScreenMain';
import KYC_DETAILS from 'app/src/screens/kyc/KycDetails';
import MOBILE_NUMBER_UPDATE from 'app/src/screens/mobileNumberUpdate/MobileNumberUpdate';
import ADD_NEW_NUMBER from 'app/src/screens/mobileNumberUpdate/AddNewNumber';
import MOBILE_UPDATE_VERIFICATION from 'app/src/screens/mobileNumberUpdate/MobileUpdateVerification';
import BANK_PAN_SCREEN from 'app/src/screens/bankPan/BankPan';
import MYNETWORK_SCREEN from 'app/src/screens/myNetwork/MyNetwork';
import SHOPPING_HOME_SCREEN from 'app/src/screens/shoppingHomeScreen/ShoppingHomeScreen';
import SHOPPING_OPTION from 'app/src/screens/shoppingHomeScreen/ShoppingOption';
import REPEAT_ORDER from 'app/src/screens/shoppingHomeScreen/RepeatOrder';
import BRANDSTORE_SCREEN from 'app/src/screens/brandStore/BrandStore';
import CATEGORYLST_SCREEN from 'app/src/screens/categoryList/CategoryList';
import VIEWCART_SCREEN from 'app/src/screens/cart/ViewCart';
import CARTREVIEW_SCREEN from 'app/src/screens/cart/CartReview';
import ONBOARDING_SCREEN from 'app/src/screens/onBoarding/OnboardingMain';
import CONSISTANCY_SCREEN from 'app/src/screens/consistency/Consistency';
import PROFILE_SCREEN from 'app/src/screens/profile/MyProfile';
import DISTRIBUTOR_IDCARD from 'app/src/screens/distributorIdCard/DistributorIdCard';
import WISHLIST_SCREEN from 'app/src/screens/productList/WishList';
import BIRTHDAY_LIST from 'app/src/screens/birthdayList/BirthdayList';
import SEARCH_SCREEN from 'app/src/screens/Search/Search';
import PRODUCT_LIST from 'app/src/screens/productList/ProductList';
import PRODUCT_LIST_CNC from 'app/src/screens/productList/ProductListCNC';
import CREATECARTDOWNLINELIST_SCREEN from 'app/src/screens/createCart/CreateCartDownlineList';
import CREATEDOWNLINECART_SCREEN from 'app/src/screens/createCart/CreateDownlineCart';
import SUBMITOTP_SCREEN from 'app/src/screens/forgotPassword/SubmitOtp';
import PRODUCT_DETAILS from 'app/src/screens/productList/ProductDetails';
import Banner from 'app/src/screens/Dashboard/Banner';
import MYFUNDS_SCREEN from 'app/src/screens/funds/MyFunds';
import CART_CHECKOUT from 'app/src/screens/checkout/CartCheckout';
import CHANGE_PASSWORD from 'app/src/screens/changePassword/ChangePassword';
import SHARESCREEN from 'app/src/screens/referral-screen/ShareScreen';
import ORDER_FEEDBACK_SCREEN from 'app/src/screens/orders/OrderFeedback';
import PRODUCT_FEEDBACK_SCREEN from 'app/src/screens/orders/ProductsFeedbackScreen';
import ORDER_TYPE_FEEDBACK_SCREEN from 'app/src/screens/orders/OrderTypeFeedback';
import FAQ_SCREEN from 'app/src/screens/faq/Faq';
import FAQ_WEB_VIEW_SCREEN from 'app/src/screens/faq/faqWebView';
import CUSTOMER_REVIEW_SCREEN from 'app/src/screens/customerReviews/CustomerReview';
import ABOUT_US_WEB_VIEW_SCREEN from 'app/src/screens/aboutUs/AboutUs';
import CONTACT_US from 'app/src/screens/contactUs/ContactUs';
import STORE_FRONT_SCREEN from 'app/src/screens/store-front/StoreFront';
import DISTRIBUTOR_FEEDBACK_SCREEN from 'app/src/screens/myNetwork/DistributorFeedback';
import WELLNESS_SCREEN from 'app/src/screens/wellness/wellness'

import MYFUNDS_DETAILS_SCREEN from 'app/src/screens/funds/MyFundsDetails';
import FILTER_SCREEN from 'app/src/screens/productList/Filter';
import LOCATION_SCREEN from 'app/src/screens/location/Location';		
import { Specs } from 'app/src/utility/Theme';
import TabIcon from  'app/src/utility/TabIconUtil';

import MYVOUCHER_SCREEN from 'app/src/screens/vouchers/MyVouchers';
import GROUP_PV_GRAPH from 'app/src/screens/groupPv/GroupPvGraph';
import MYBONUS_SCREEN from 'app/src/screens/payout/MyBonus';
import MYLEVEL_SCREEN from 'app/src/screens/myLevel/MyLevel';
import LANGUAGE_LIST from 'app/src/screens/languages/LanguageList';
import MYTRAINING_SCREEN from 'app/src/screens/myTraining/MyTraining';
import SELECTTRAINING_SCREEN from 'app/src/screens/myTraining/selectTraining/SelectTraining';
import NOTIFICATION_SCREEN from 'app/src/screens/notification/Notification';
import CARTVOUCHERS_SCREEN from 'app/src/screens/cartVouchers/CartVouchers';
import ORDER_CONFIRMATION from 'app/src/screens/orderConfirmation/OrderConfirmation';
import SELECTLOCATION_SCREEN from 'app/src/screens/location/SelectLocation';
import SELECT_MIUSER_ADDRESS from 'app/src/screens/miniDLCPAddress/SelectMiUserAddress';
import ADD_MIUSER_ADDRESS from 'app/src/screens/miniDLCPAddress/addMiUserAddress';
import ORDERDETAIL_SCREEN from 'app/src/screens/orders/OrderDetails';
import ORDERVIEW_SCREEN from 'app/src/screens/orders/OrderView';
import ORDERINVOICE_SCREEN from 'app/src/screens/orders/OrderInvoice';
import MyORDERS_SCREEN from 'app/src/screens/orders/MyOrders';
import RECOMMENDATION_SCREEN from 'app/src/screens/recommendation/Recommendation';
import RECOMMENDATIONDETAIL_SCREEN from 'app/src/screens/recommendation/RecommendationDetails';
import NEWTRAINING_SCREEN from 'app/src/screens/myTraining/NewTraining';
import VBDSTORES_SCREEN from 'app/src/screens/vbdStores/VbdStores';
import BRANCHES_SCREEN from 'app/src/screens/branches/Branches';
import BRANCHDETAILS_SCREEN from 'app/src/screens/branches/BranchDetails';
import BRANCH_LOCAITON_SCREEN from 'app/src/screens/branches/BranchLocation';
import GENERAL_QUERIES_SCREEN from 'app/src/screens/generalQueries/GeneralQueries';
import SCHEME_SCREEN from 'app/src/screens/scheme/Scheme'
import GUEST_USER_SCREEN from 'app/src/screens/guestUser/GuestUser';
import PAYMENT_SCREEN from 'app/src/screens/payment/Payment';
import YOUTUBE_WEBVIEW_SCREEN from 'app/src/screens/Dashboard/YoutubeWebView';
import MYBUSINESSINSIGHTS_SCREEN from 'app/src/screens/Dashboard/MyBusinessInsights';
import TouchScreen from 'app/src/screens/touchId/TouchId';
import DAF from 'app/src/screens/daf/daf';
import ORDER_LOG_SCREEN from 'app/src/screens/orderLog/OrderLog';
import ORDER_LOG_DETAILS from 'app/src/screens/orderLog/OrderLogDetails';
import SUBMIT_PAYMENT_REF from 'app/src/screens/orderLog/updatePaymentDetails';
import DYNAMICCONTENT_SCREEN from 'app/src/screens/dynamicScreen/DynamicScreen';
import LogedinDevicesList from 'app/src/screens/LoggedinDevicesList/LoggedinDevicesList';
import DOWNLINE_PV_GRAPH from 'app/src/screens/pvAnalysis/DownlinePvGraph';
import MyProspect from 'app/src/screens/myProspect/MyProspect';
import COURIER_DETAILS from 'app/src/screens/courierDetails/CourierDetails';
import NEWS from 'app/src/screens/news/News';
import SELECT_SHIPPING_TYPE from 'app/src/screens/location/SelectShippingType';
import ChatSupport from 'app/src/screens/Dashboard/ChatSupport';
import DrawerScreen from './DrawerScreen';
// Defining Tab-bar icons here active or non-active
const MYVESTIGE_ACTIVE = require('../assets/images/tabIcons/dashboard_active_icon.png');
const MYVESTIGE_INACTIVE= require('../assets/images/tabIcons/dashboard_inactive_icon.png');
const COUNTRY_ID = AsyncStore.addPrefix("country-id");

const SHOPPING_ACTIVE = require('../assets/images/tabIcons/shopping_active_icon.png');
const SHOPPING_INACTIVE = require('../assets/images/tabIcons/shopping_inactive_icon.png');

const SEARCH_ACTIVE = require('../assets/images/tabIcons/search_active_icon.png');
const SEARCH_INACTIVE = require('../assets/images/tabIcons/search_inactive_icon.png');

const SCHEME_ACTIVE = require('../assets/images/scheme/schemeActive.png');
const SCHEME_INACTIVE = require('../assets/images/scheme/scheme.png');

const MYCART_ACTIVE = require('../assets/images/tabIcons/cart_active_icon.png');
const MYCART_INACTIVE = require('../assets/images/DashBoardHeader/cart.png');

const isTouchIdSupported = async() => {
  try{
    const type = await TouchID.isSupported()
    console.log(type)
    if(Platform.OS === 'android') {
      return type
    }
    else {
      if(type === 'TouchID' || type === 'FaceID' ) {
        return true
      }
      else {
        return false
      }
    }
  }
  catch(error) {
    return false
  }
}

const styles = StyleSheet.create({
  tabIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  headerTitle:{
    ...Specs.fontBold,
    fontSize:18,
    color: '#373e73',
  },
});

const Dashboard = StackNavigator({
  touchId: { 
    screen: TouchScreen
  },
  Dashboard: {
    screen: DASHBOARD_SCREEN,
    navigationOptions: () => ({
      tabBarLabel: 'Dashboard',
      headerTintColor: 'white',
    })
  },
  kycImage: {
    screen: KYC_SCREEN,
    navigationOptions: {
      headerStyle: {
        backgroundColor: '#fafbfc',
      },
      headerTitle: 'My KYC',
      headerTitleStyle: styles.headerTitle,
    },
  },
  kycDetailsScreen: {
    screen: KYC_DETAILS,
  },
  mobileNumberUpdate: {
    screen: MOBILE_NUMBER_UPDATE,
  },
  addNewNumber:{
    screen: ADD_NEW_NUMBER
  },
  mobileUpdateVerification: {
    screen: MOBILE_UPDATE_VERIFICATION
  },
  bankPanScreen: {
    screen: BANK_PAN_SCREEN,
  },
  news: {
    screen: NEWS,
  },
  Wishlist: {
    screen: WISHLIST_SCREEN,
    navigationOptions:{
      headerTitle: 'Wishlist',
    }
  },
  birthdayList: {
    screen: BIRTHDAY_LIST,
  },
  viewCart: {
    screen: VIEWCART_SCREEN,
  },
  cartReview: {
    screen:CARTREVIEW_SCREEN
  },
  createCartDownlineList: {
    screen: CREATECARTDOWNLINELIST_SCREEN,
  },
  createDownlineCart: {
    screen: CREATEDOWNLINECART_SCREEN,
  },
  myNetwork: {
    screen: MYNETWORK_SCREEN,
    // navigationOptions: {
    //   drawerLockMode: 'locked-closed',
    //   headerStyle: {
    //     backgroundColor: '#fafbfc',
    //   },
    //   headerTitle: 'My Networks',
    //   headerTitleStyle: styles.headerTitle,
    // },
  },
  brandStore: {
    screen: BRANDSTORE_SCREEN,
  },
  categoryList: {
    screen: CATEGORYLST_SCREEN
  },
  consistancy: {
    screen: CONSISTANCY_SCREEN,
    navigationOptions: {
      drawerLockMode: 'locked-closed',
      headerStyle: {
        backgroundColor: '#fafbfc',
      },
      headerTitle: 'My Consistency',
      headerTitleStyle: styles.headerTitle,
    }
  },
  signup: {
    screen: SIGNUP_SCREEN,
  },
  downlineRegistration: {
    screen: DOWNLINE_REGISTRATION
  },
  productList : {
    screen: PRODUCT_LIST,
  },
  productListCNC: {
    screen: PRODUCT_LIST_CNC
  },
  submitOtp: {
    screen: SUBMITOTP_SCREEN,
  },
  productDetails : {
    screen: PRODUCT_DETAILS
  },
  myBonus: {
    screen: MYBONUS_SCREEN,
    navigationOptions: {
      drawerLockMode: 'locked-closed',
      headerStyle: {
        backgroundColor: '#fafbfc',
      },
      headerTitle: 'My Bonus',
      headerTitleStyle: styles.headerTitle,
    }
  },
  myVoucher: {
    screen: MYVOUCHER_SCREEN,
    navigationOptions: {
      drawerLockMode: 'locked-closed',
      headerStyle: {
        backgroundColor: '#fafbfc',
      },
      headerTitle: 'My Vouchers',
      headerTitleStyle: styles.headerTitle,
    }
  },
  courierDetails: {
    screen: COURIER_DETAILS,
    navigationOptions:{
      headerTitle: 'Courier Details',
    }
  },
  myFunds: {
    screen: MYFUNDS_SCREEN,
    navigationOptions: {
      drawerLockMode: 'locked-closed',
      headerStyle: {
        backgroundColor: '#fafbfc',
      },
      headerTitle: 'My Funds',
      headerTitleStyle: styles.headerTitle,
    },
  },
  location: {
    screen: LOCATION_SCREEN
  },
  selectShippingType:{
    screen: SELECT_SHIPPING_TYPE
  },
  selectLocation: {
    screen: SELECTLOCATION_SCREEN,
  },
  selectMiUserAddress: {
    screen: SELECT_MIUSER_ADDRESS,
  },
  addMiUserAddress: {
    screen: ADD_MIUSER_ADDRESS,
  },
  myFundsDetails: {
    screen: MYFUNDS_DETAILS_SCREEN
  },
  groupPvGraph:{
    screen: GROUP_PV_GRAPH
  },
  downlinePvGraph:{
    screen: DOWNLINE_PV_GRAPH
  },
  mylevel: {
    screen: MYLEVEL_SCREEN,
    navigationOptions: {
      headerTitle: 'My Level'
    },
  },
  filterScreen:{		
    screen: FILTER_SCREEN		
  },
  myTrainingScreen:{		
    screen: MYTRAINING_SCREEN		
  },
  selectTrainingScreen:{		
    screen: SELECTTRAINING_SCREEN		
  },
  notificationScreen:{		
    screen: NOTIFICATION_SCREEN
  },
  training:{
    screen:NEWTRAINING_SCREEN
  },
  recommendation: {
    screen: RECOMMENDATION_SCREEN
  },
  recommendationDetails: {
    screen: RECOMMENDATIONDETAIL_SCREEN
  },
  cartVouchersScreen: {
    screen: CARTVOUCHERS_SCREEN
  },
  changePassword: {
    screen: CHANGE_PASSWORD,
  },
  cartCheckout:{
    screen: CART_CHECKOUT,
  },
  orders:{		
    screen: MyORDERS_SCREEN		
  },
  payment: {
    screen: PAYMENT_SCREEN,
  },
  orderConfirmation: {		
    screen: ORDER_CONFIRMATION		
  },
  vbdStores:{
    screen: VBDSTORES_SCREEN
  },
  orderView:{		
    screen: ORDERVIEW_SCREEN	
  },
  orderDetail:{		
    screen: ORDERDETAIL_SCREEN	
  },
  orderInvoice:{		
    screen: ORDERINVOICE_SCREEN,	
  },
  orderFeedbackScreen: {
    screen: ORDER_FEEDBACK_SCREEN
  },
  productFeedbackScreen: {
    screen: PRODUCT_FEEDBACK_SCREEN
  },
  orderTypeFeedbackScreen: {
    screen: ORDER_TYPE_FEEDBACK_SCREEN
  },
  shareScreen: {		
    screen: SHARESCREEN,
    navigationOptions: {
      drawerLockMode: 'locked-closed',
      headerStyle: {
        backgroundColor: '#fafbfc',
      },
      headerTitle: 'Refer A Friend',
      headerTitleStyle: styles.headerTitle,
    },
  },	
  MyProfile: { screen: PROFILE_SCREEN,  
  },
  distributorIdCard: {
    screen: DISTRIBUTOR_IDCARD,
  },
  branches: {
    screen: BRANCHES_SCREEN,
  },
  branchDetails: {
    screen: BRANCHDETAILS_SCREEN
  },
  branchLocation: {
    screen: BRANCH_LOCAITON_SCREEN
  },
  aboutUs: {
    screen: ABOUT_US_WEB_VIEW_SCREEN
  },
  contactUs: {
    screen : CONTACT_US
  },
  wellness:{
    screen : WELLNESS_SCREEN
  },
  storeFront: {
    screen: STORE_FRONT_SCREEN
  },
  distributorFeedback: {
    screen: DISTRIBUTOR_FEEDBACK_SCREEN
  },
  customerReviewListing: {
    screen: CUSTOMER_REVIEW_SCREEN
  },
  generalQueries: {
    screen: GENERAL_QUERIES_SCREEN
  },
  dynamicScreen: { 
    screen: DYNAMICCONTENT_SCREEN,
    // navigationOptions: ({ navigation }) =>  ({
    //   headerStyle: {
    //     backgroundColor: '#fafbfc',
    //   },
    //   headerTitle: 'Extra Data',
    //   headerTitleStyle: styles.headerTitle,
    //   tabBarVisible: false,
    //   headerLeft: <Icon name='ios-arrow-back' size={30} color='#3f4967' style={{ marginLeft: 16 }} onPress={() => { navigation.goBack() }} />,
    // }),
  },
  youtubeListing: {
    screen: YOUTUBE_WEBVIEW_SCREEN,
    navigationOptions: ({ navigation }) =>  ({
      headerStyle: {
        backgroundColor: '#fafbfc',
      },
      headerTitleStyle: styles.headerTitle,
      tabBarVisible: false,
      headerLeft: <Icon name='ios-arrow-back' size={30} color='#3f4967' style={{ marginLeft: 16 }} onPress={() => { navigation.goBack() }} />,
    }),
  },
  myBusinessInsights: {
    screen: MYBUSINESSINSIGHTS_SCREEN,
    navigationOptions: ({ navigation }) =>  ({
      headerStyle: {
        backgroundColor: '#fafbfc',
      },
      headerTitleStyle: styles.headerTitle,
      tabBarVisible: false,
      headerLeft: <Icon name='ios-arrow-back' size={30} color='#3f4967' style={{ marginLeft: 16 }} onPress={() => { navigation.goBack() }} />,
    }),
  },
  daf: {
    screen: DAF
  },
  chatSupport: {
    screen: ChatSupport
  },
  shoppingOption: {
    screen: SHOPPING_OPTION
  },
  repeatOrder: {
    screen: REPEAT_ORDER
  },
  orderLog: {
    screen: ORDER_LOG_SCREEN
  },
  orderLogDetails: {
    screen: ORDER_LOG_DETAILS
  },
  updatePaymentDetails: {
    screen: SUBMIT_PAYMENT_REF,
  },
  LogedinDevicesList: {
    screen: LogedinDevicesList,
    navigationOptions: {
      headerStyle: {
        backgroundColor: '#fafbfc',
      },
      headerTitle: strings.drawerScreen.LoggedIn_Devices,
      headerTitleStyle: styles.headerTitle,
    },
  },
  MyProspect: {
    screen: MyProspect,
    navigationOptions: {
      headerStyle: {
        backgroundColor: '#fafbfc',
      },
      headerTitle: strings.drawerScreen.My_Prospect,
      headerTitleStyle: styles.headerTitle,
    },
  }, 
  // MyCart: {
  //   screen: VIEWCART_SCREEN,
  // }
}, {
  navigationOptions: (props)=> ({
    headerForceInset: { top: 'never', bottom: 'never' },
  })
})
// },  {initialRouteName: isTouchIdSupported() ? 'touchId' : 'Dashboard'  });
// },  {initialRouteName: isTouchIdSupported() ? 'bankPan' : 'bankPan'  });


const Shopping = StackNavigator({
  // touchId: { 
  //   screen: TouchScreen
  // },
  // shoppingOption: {
  //   screen: SHOPPING_OPTION
  // },
  // repeatOrder: {
  //   screen: REPEAT_ORDER
  // },
  // Wishlist: {
  //   screen: WISHLIST_SCREEN,
  //   navigationOptions:{
  //     headerTitle: 'Wishlist',
  //   }
  // },
  Shopping: {
    screen: SHOPPING_HOME_SCREEN,
    navigationOptions: () => ({
      tabBarLabel: 'Shopping',
      headerTintColor: 'white',
    })
  },
  kycImage: {
    screen: KYC_SCREEN,
    navigationOptions: {
      headerStyle: {
        backgroundColor: '#fafbfc',
      },
      headerTitle: 'My KYC',
      headerTitleStyle: styles.headerTitle,
    },
  },
  news: {
    screen: NEWS,
  },
  Wishlist: {
    screen: WISHLIST_SCREEN,
    navigationOptions:{
      headerTitle: 'Wishlist',
    }
  },
  birthdayList: {
    screen: BIRTHDAY_LIST,
  },
  kycDetailsScreen: {
    screen: KYC_DETAILS,
  },
  mobileNumberUpdate: {
    screen: MOBILE_NUMBER_UPDATE,
  },
  addNewNumber:{
    screen: ADD_NEW_NUMBER
  },
  mobileUpdateVerification: {
    screen: MOBILE_UPDATE_VERIFICATION
  },
  bankPanScreen: {
    screen: BANK_PAN_SCREEN,
  },
  viewCart: {
    screen: VIEWCART_SCREEN,
  },
  cartReview: {
    screen:CARTREVIEW_SCREEN
  },
  createCartDownlineList: {
    screen: CREATECARTDOWNLINELIST_SCREEN,
  },
  createDownlineCart: {
    screen: CREATEDOWNLINECART_SCREEN,
  },
  myNetwork: {
    screen: MYNETWORK_SCREEN,
    navigationOptions: {
      drawerLockMode: 'locked-closed',
      headerStyle: {
        backgroundColor: '#fafbfc',
      },
      headerTitle: 'My Networks',
      headerTitleStyle: styles.headerTitle,
    },
  },
  courierDetails: {
    screen: COURIER_DETAILS,
    // navigationOptions:{
    //   headerTitle: 'Courier Details',
    // }
  },
  brandStore: {
    screen: BRANDSTORE_SCREEN,
  },
  categoryList: {
    screen: CATEGORYLST_SCREEN
  },
  consistancy: {
    screen: CONSISTANCY_SCREEN,
    navigationOptions: {
      drawerLockMode: 'locked-closed',
      headerStyle: {
        backgroundColor: '#fafbfc',
      },
      headerTitle: 'My Consistency',
      headerTitleStyle: styles.headerTitle,
    }
  },
  signup: {
    screen: SIGNUP_SCREEN,
  },
  downlineRegistration: {
    screen: DOWNLINE_REGISTRATION
  },
  productList : {
    screen: PRODUCT_LIST,
  },
  productListCNC : {
    screen: PRODUCT_LIST_CNC,
  },
  submitOtp: {
    screen: SUBMITOTP_SCREEN,
  },
  productDetails : {
    screen: PRODUCT_DETAILS
  },
  myBonus: {
    screen: MYBONUS_SCREEN,
    navigationOptions: {
      drawerLockMode: 'locked-closed',
      headerStyle: {
        backgroundColor: '#fafbfc',
      },
      headerTitle: 'My Bonus',
      headerTitleStyle: styles.headerTitle,
    }
  },
  myVoucher: {
    screen: MYVOUCHER_SCREEN,
    navigationOptions: {
      drawerLockMode: 'locked-closed',
      headerStyle: {
        backgroundColor: '#fafbfc',
      },
      headerTitle: 'My Vouchers',
      headerTitleStyle: styles.headerTitle,
    }
  },
  myFunds: {
    screen: MYFUNDS_SCREEN,
    navigationOptions: {
      drawerLockMode: 'locked-closed',
      headerStyle: {
        backgroundColor: '#fafbfc',
      },
      headerTitle: 'My Funds',
      headerTitleStyle: styles.headerTitle,
    },
  },
  location: {
    screen: LOCATION_SCREEN
  },
  selectShippingType:{
    screen: SELECT_SHIPPING_TYPE
  },
  selectLocation: {
    screen: SELECTLOCATION_SCREEN,
  },
  selectMiUserAddress: {
    screen: SELECT_MIUSER_ADDRESS,
  },
  addMiUserAddress: {
    screen: ADD_MIUSER_ADDRESS,
  },
  myFundsDetails: {
    screen: MYFUNDS_DETAILS_SCREEN
  },
  groupPvGraph:{
    screen: GROUP_PV_GRAPH
  },
  downlinePvGraph:{
    screen: DOWNLINE_PV_GRAPH
  },
  mylevel: {
    screen: MYLEVEL_SCREEN,
    navigationOptions: {
      headerTitle: 'My Level'
    },
  },
  filterScreen:{		
    screen: FILTER_SCREEN		
  },
  myTrainingScreen:{		
    screen: MYTRAINING_SCREEN		
  },
  selectTrainingScreen:{		
    screen: SELECTTRAINING_SCREEN		
  },
  notificationScreen:{		
    screen: NOTIFICATION_SCREEN
  },
  training:{
    screen:NEWTRAINING_SCREEN
  },
  recommendation: {
    screen: RECOMMENDATION_SCREEN
  },
  recommendationDetails: {
    screen: RECOMMENDATIONDETAIL_SCREEN
  },
  cartVouchersScreen: {
    screen: CARTVOUCHERS_SCREEN
  },
  changePassword: {
    screen: CHANGE_PASSWORD,
  },
  cartCheckout:{
    screen: CART_CHECKOUT,
  },
  orders:{		
    screen: MyORDERS_SCREEN		
  },
  payment: {
    screen: PAYMENT_SCREEN,
  },
  orderConfirmation: {		
    screen: ORDER_CONFIRMATION		
  },
  vbdStores:{
    screen: VBDSTORES_SCREEN
  },
  orderView:{		
    screen: ORDERVIEW_SCREEN	
  },
  orderDetail:{		
    screen: ORDERDETAIL_SCREEN	
  },
  MyProfile: { screen: PROFILE_SCREEN, 
    
  },
  distributorIdCard: {
    screen: DISTRIBUTOR_IDCARD,
  },
  branches: {
    screen: BRANCHES_SCREEN,
  },
  branchDetails: {
    screen: BRANCHDETAILS_SCREEN
  },
  branchLocation: {
    screen: BRANCH_LOCAITON_SCREEN
  },
  aboutUs: {
    screen: ABOUT_US_WEB_VIEW_SCREEN
  },
  contactUs: {
    screen : CONTACT_US
  },
  wellness:{
    screen : WELLNESS_SCREEN
  },
  storeFront: {
    screen: STORE_FRONT_SCREEN
  },
  customerReviewListing: {
    screen: CUSTOMER_REVIEW_SCREEN
  },
  generalQueries: {
    screen: GENERAL_QUERIES_SCREEN
  },
  daf: {
    screen: DAF
  },
  chatSupport: {
    screen: ChatSupport
  },
  youtubeListing: {
    screen: YOUTUBE_WEBVIEW_SCREEN,
    navigationOptions: ({ navigation }) =>  ({
      headerStyle: {
        backgroundColor: '#fafbfc',
      },
      headerTitleStyle: styles.headerTitle,
      tabBarVisible: false,
      headerLeft: <Icon name='ios-arrow-back' size={30} color='#3f4967' style={{ marginLeft: 16 }} onPress={() => { navigation.goBack() }} />,
    }),
  },
  myBusinessInsights: {
    screen: MYBUSINESSINSIGHTS_SCREEN,
    navigationOptions: ({ navigation }) =>  ({
      headerStyle: {
        backgroundColor: '#fafbfc',
      },
      headerTitleStyle: styles.headerTitle,
      tabBarVisible: false,
      headerLeft: <Icon name='ios-arrow-back' size={30} color='#3f4967' style={{ marginLeft: 16 }} onPress={() => { navigation.goBack() }} />,
    }),
  },
  orderLog: {
    screen: ORDER_LOG_SCREEN
  },
  orderLogDetails: {
    screen: ORDER_LOG_DETAILS
  },
  updatePaymentDetails: {
    screen: SUBMIT_PAYMENT_REF,
  },
  dynamicScreen: { 
    screen: DYNAMICCONTENT_SCREEN,
  },
  // Dashboard: {
  //   screen: DASHBOARD_SCREEN,
  //   // navigationOptions: () => ({
  //   //   // tabBarLabel: 'Dashboard',
  //   //   headerTintColor: 'white',
  //   // })
  // },
  // MyCart: {
  //   screen: VIEWCART_SCREEN,
  // },
  shareScreen: {		
    screen: SHARESCREEN,
    navigationOptions: {
      drawerLockMode: 'locked-closed',
      headerStyle: {
        backgroundColor: '#fafbfc',
      },
      headerTitle: 'Refer A Friend',
      headerTitleStyle: styles.headerTitle,
    },
  },
  LogedinDevicesList: {
    screen: LogedinDevicesList,
    navigationOptions: {
      headerStyle: {
        backgroundColor: '#fafbfc',
      },
      headerTitle: strings.drawerScreen.LoggedIn_Devices,
      headerTitleStyle: styles.headerTitle,
    },
  },
  MyProspect: {
    screen: MyProspect,
    navigationOptions: {
      headerStyle: {
        backgroundColor: '#fafbfc',
      },
      headerTitle: strings.drawerScreen.My_Prospect,
      headerTitleStyle: styles.headerTitle,
    },
  }, 
}, {
  navigationOptions: (props)=> ({
    headerForceInset: { top: 'never', bottom: 'never' },
  })
}
);

const Search = StackNavigator({
  Search: {
    screen: SEARCH_SCREEN,
    navigationOptions: () => ({
      tabBarLabel: 'Search'
    })
  },
  kycImage: {
    screen: KYC_SCREEN,
    navigationOptions: {
      headerStyle: {
        backgroundColor: '#fafbfc',
      },
      headerTitle: 'My KYC',
      headerTitleStyle: styles.headerTitle,
    },
  },
  news: {
    screen: NEWS,
  },
  kycDetailsScreen: {
    screen: KYC_DETAILS,
  },
  mobileNumberUpdate: {
    screen: MOBILE_NUMBER_UPDATE,
  },
  addNewNumber:{
    screen: ADD_NEW_NUMBER
  },
  mobileUpdateVerification: {
    screen: MOBILE_UPDATE_VERIFICATION
  },
  bankPanScreen: {
    screen: BANK_PAN_SCREEN,
  },
  viewCart: {
    screen: VIEWCART_SCREEN,
  },
  cartReview: {
    screen:CARTREVIEW_SCREEN
  },
  createCartDownlineList: {
    screen: CREATECARTDOWNLINELIST_SCREEN,
  },
  createDownlineCart: {
    screen: CREATEDOWNLINECART_SCREEN,
  },
  myNetwork: {
    screen: MYNETWORK_SCREEN,
    navigationOptions: {
      drawerLockMode: 'locked-closed',
      headerStyle: {
        backgroundColor: '#fafbfc',
      },
      headerTitle: 'My Networks',
      headerTitleStyle: styles.headerTitle,
    },
  },
  courierDetails: {
    screen: COURIER_DETAILS,
    // navigationOptions:{
    //   headerTitle: 'Courier Details',
    // }
  },
  brandStore: {
    screen: BRANDSTORE_SCREEN,
  },
  categoryList: {
    screen: CATEGORYLST_SCREEN
  },
  consistancy: {
    screen: CONSISTANCY_SCREEN,
    navigationOptions: {
      drawerLockMode: 'locked-closed',
      headerStyle: {
        backgroundColor: '#fafbfc',
      },
      headerTitle: 'My Consistency',
      headerTitleStyle: styles.headerTitle,
    }
  },
  signup: {
    screen: SIGNUP_SCREEN,
  },
  downlineRegistration: {
    screen: DOWNLINE_REGISTRATION
  },
  productList : {
    screen: PRODUCT_LIST,
  },
  productListCNC: {
    screen: PRODUCT_LIST_CNC
  },
  submitOtp: {
    screen: SUBMITOTP_SCREEN,
  },
  productDetails : {
    screen: PRODUCT_DETAILS
  },
  myBonus: {
    screen: MYBONUS_SCREEN,
    navigationOptions: {
      drawerLockMode: 'locked-closed',
      headerStyle: {
        backgroundColor: '#fafbfc',
      },
      headerTitle: 'My Bonus',
      headerTitleStyle: styles.headerTitle,
    }
  },
  myVoucher: {
    screen: MYVOUCHER_SCREEN,
    navigationOptions: {
      drawerLockMode: 'locked-closed',
      headerStyle: {
        backgroundColor: '#fafbfc',
      },
      headerTitle: 'My Vouchers',
      headerTitleStyle: styles.headerTitle,
    }
  },
  myFunds: {
    screen: MYFUNDS_SCREEN,
    navigationOptions: {
      drawerLockMode: 'locked-closed',
      headerStyle: {
        backgroundColor: '#fafbfc',
      },
      headerTitle: 'My Funds',
      headerTitleStyle: styles.headerTitle,
    },
  },
  location: {
    screen: LOCATION_SCREEN
  },
  selectShippingType:{
    screen: SELECT_SHIPPING_TYPE
  },
  selectLocation: {
    screen: SELECTLOCATION_SCREEN,
  },
  selectMiUserAddress: {
    screen: SELECT_MIUSER_ADDRESS,
  },
  addMiUserAddress: {
    screen: ADD_MIUSER_ADDRESS,
  },
  myFundsDetails: {
    screen: MYFUNDS_DETAILS_SCREEN
  },
  groupPvGraph:{
    screen: GROUP_PV_GRAPH
  },
  downlinePvGraph:{
    screen: DOWNLINE_PV_GRAPH
  },
  mylevel: {
    screen: MYLEVEL_SCREEN,
    navigationOptions: {
      headerTitle: 'My Level'
    },
  },
  filterScreen:{		
    screen: FILTER_SCREEN		
  },
  myTrainingScreen:{		
    screen: MYTRAINING_SCREEN		
  },
  selectTrainingScreen:{		
    screen: SELECTTRAINING_SCREEN		
  },
  notificationScreen:{		
    screen: NOTIFICATION_SCREEN	
  },
  training:{
    screen:NEWTRAINING_SCREEN
  },
  recommendation: {
    screen: RECOMMENDATION_SCREEN
  },
  recommendationDetails: {
    screen: RECOMMENDATIONDETAIL_SCREEN
  },
  cartVouchersScreen: {
    screen: CARTVOUCHERS_SCREEN
  },
  changePassword: {
    screen: CHANGE_PASSWORD,
  },
  cartCheckout:{
    screen: CART_CHECKOUT,
  },
  orders:{		
    screen: MyORDERS_SCREEN		
  },
  payment: {
    screen: PAYMENT_SCREEN,
  },
  orderConfirmation: {		
    screen: ORDER_CONFIRMATION		
  },
  vbdStores:{
    screen: VBDSTORES_SCREEN
  },
  orderView:{		
    screen: ORDERVIEW_SCREEN	
  },
  orderDetail:{		
    screen: ORDERDETAIL_SCREEN	
  },
  MyProfile: { screen: PROFILE_SCREEN, 
    
  },
  distributorIdCard: {
    screen: DISTRIBUTOR_IDCARD,
  },
  myBusinessInsights: {
    screen: MYBUSINESSINSIGHTS_SCREEN,
    navigationOptions: ({ navigation }) =>  ({
      headerStyle: {
        backgroundColor: '#fafbfc',
      },
      headerTitleStyle: styles.headerTitle,
      tabBarVisible: false,
      headerLeft: <Icon name='ios-arrow-back' size={30} color='#3f4967' style={{ marginLeft: 16 }} onPress={() => { navigation.goBack() }} />,
    }),
  },
  faq: {
    screen: FAQ_SCREEN,
  },
  faqWebView: {
    screen: FAQ_WEB_VIEW_SCREEN,
    navigationOptions: {
      drawerLockMode: 'locked-closed',
      headerStyle: {
        backgroundColor: '#fafbfc',
      },
      headerTitle: 'FAQ',
      headerTitleStyle: styles.headerTitle,
    }
  },
  branches: {
    screen: BRANCHES_SCREEN,
  },
  branchDetails: {
    screen: BRANCHDETAILS_SCREEN
  },
  branchLocation: {
    screen: BRANCH_LOCAITON_SCREEN
  },
  aboutUs: {
    screen: ABOUT_US_WEB_VIEW_SCREEN
  },
  contactUs: {
    screen : CONTACT_US
  },
  wellness:{
    screen : WELLNESS_SCREEN
  },
  customerReviewListing: {
    screen: CUSTOMER_REVIEW_SCREEN
  },
  generalQueries: {
    screen: GENERAL_QUERIES_SCREEN
  },
  shoppingOption: {
    screen: SHOPPING_OPTION
  },
  repeatOrder: {
    screen: REPEAT_ORDER
  },
  orderLog: {
    screen: ORDER_LOG_SCREEN
  },
  orderLogDetails: {
    screen: ORDER_LOG_DETAILS
  },
  updatePaymentDetails: {
    screen: SUBMIT_PAYMENT_REF,
  },
  LogedinDevicesList: {
    screen: LogedinDevicesList,
    navigationOptions: {
      headerStyle: {
        backgroundColor: '#fafbfc',
      },
      headerTitle: strings.drawerScreen.LoggedIn_Devices,
      headerTitleStyle: styles.headerTitle,
    },
  },
  MyProspect: {
    screen: MyProspect,
    navigationOptions: {
      headerStyle: {
        backgroundColor: '#fafbfc',
      },
      headerTitle: strings.drawerScreen.My_Prospect,
      headerTitleStyle: styles.headerTitle,
    },
  }, 
}, {
  navigationOptions: (props)=> ({
    headerForceInset: { top: 'never', bottom: 'never' },
  })
}
);

const Scheme = StackNavigator({
  scheme : {
    screen : SCHEME_SCREEN,
    navigationOptions: () => ({
      tabBarLabel: 'Schemes',
    })
  },
  kycImage: {
    screen: KYC_SCREEN,
    navigationOptions: {
      headerStyle: {
        backgroundColor: '#fafbfc',
      },
      headerTitle: 'My KYC',
      headerTitleStyle: styles.headerTitle,
    },
  },
  news: {
    screen: NEWS,
  },
  kycDetailsScreen: {
    screen: KYC_DETAILS,
  },
  mobileNumberUpdate: {
    screen: MOBILE_NUMBER_UPDATE,
  },
  addNewNumber:{
    screen: ADD_NEW_NUMBER
  },
  mobileUpdateVerification: {
    screen: MOBILE_UPDATE_VERIFICATION
  },
  bankPanScreen: {
    screen: BANK_PAN_SCREEN,
  },
  birthdayList: {
    screen: BIRTHDAY_LIST,
  },
  viewCart: {
    screen: VIEWCART_SCREEN,
  },
  cartReview: {
    screen:CARTREVIEW_SCREEN
  },
  createCartDownlineList: {
    screen: CREATECARTDOWNLINELIST_SCREEN,
  },
  createDownlineCart: {
    screen: CREATEDOWNLINECART_SCREEN,
  },
  myNetwork: {
    screen: MYNETWORK_SCREEN,
    navigationOptions: {
      drawerLockMode: 'locked-closed',
      headerStyle: {
        backgroundColor: '#fafbfc',
      },
      headerTitle: 'My Networks',
      headerTitleStyle: styles.headerTitle,
    },
  },
  brandStore: {
    screen: BRANDSTORE_SCREEN,
  },
  categoryList: {
    screen: CATEGORYLST_SCREEN
  },
  consistancy: {
    screen: CONSISTANCY_SCREEN,
    navigationOptions: {
      drawerLockMode: 'locked-closed',
      headerStyle: {
        backgroundColor: '#fafbfc',
      },
      headerTitle: 'My Consistency',
      headerTitleStyle: styles.headerTitle,
    }
  },
  signup: {
    screen: SIGNUP_SCREEN,
  },
  downlineRegistration: {
    screen: DOWNLINE_REGISTRATION
  },
  productList : {
    screen: PRODUCT_LIST,
  },
  productListCNC: {
    screen: PRODUCT_LIST_CNC
  },
  submitOtp: {
    screen: SUBMITOTP_SCREEN,
  },
  productDetails : {
    screen: PRODUCT_DETAILS
  },
  myBonus: {
    screen: MYBONUS_SCREEN,
    navigationOptions: {
      drawerLockMode: 'locked-closed',
      headerStyle: {
        backgroundColor: '#fafbfc',
      },
      headerTitle: 'My Bonus',
      headerTitleStyle: styles.headerTitle,
    }
  },
  courierDetails: {
    screen: COURIER_DETAILS,
  },
  myVoucher: {
    screen: MYVOUCHER_SCREEN,
    navigationOptions: {
      drawerLockMode: 'locked-closed',
      headerStyle: {
        backgroundColor: '#fafbfc',
      },
      headerTitle: 'My Vouchers',
      headerTitleStyle: styles.headerTitle,
    }
  },
  myFunds: {
    screen: MYFUNDS_SCREEN,
    navigationOptions: {
      drawerLockMode: 'locked-closed',
      headerStyle: {
        backgroundColor: '#fafbfc',
      },
      headerTitle: 'My Funds',
      headerTitleStyle: styles.headerTitle,
    },
  },
  location: {
    screen: LOCATION_SCREEN
  },
  selectShippingType:{
    screen: SELECT_SHIPPING_TYPE
  },
  selectLocation: {
    screen: SELECTLOCATION_SCREEN,
  },
  selectMiUserAddress: {
    screen: SELECT_MIUSER_ADDRESS,
  },
  addMiUserAddress: {
    screen: ADD_MIUSER_ADDRESS,
  },
  myFundsDetails: {
    screen: MYFUNDS_DETAILS_SCREEN
  },
  groupPvGraph:{
    screen: GROUP_PV_GRAPH
  },
  downlinePvGraph:{
    screen: DOWNLINE_PV_GRAPH
  },
  mylevel: {
    screen: MYLEVEL_SCREEN,
    navigationOptions: {
      headerTitle: 'My Level'
    },
  },
  filterScreen:{		
    screen: FILTER_SCREEN		
  },
  myTrainingScreen:{		
    screen: MYTRAINING_SCREEN		
  },
  selectTrainingScreen:{		
    screen: SELECTTRAINING_SCREEN		
  },
  notificationScreen:{		
    screen: NOTIFICATION_SCREEN		
  },
  training:{
    screen:NEWTRAINING_SCREEN
  },
  recommendation: {
    screen: RECOMMENDATION_SCREEN
  },
  recommendationDetails: {
    screen: RECOMMENDATIONDETAIL_SCREEN
  },
  cartVouchersScreen: {
    screen: CARTVOUCHERS_SCREEN
  },
  changePassword: {
    screen: CHANGE_PASSWORD,
  },
  cartCheckout:{
    screen: CART_CHECKOUT,
  },
  orders:{		
    screen: MyORDERS_SCREEN		
  },
  payment: {
    screen: PAYMENT_SCREEN,
  },
  orderConfirmation: {		
    screen: ORDER_CONFIRMATION		
  },
  vbdStores:{
    screen: VBDSTORES_SCREEN
  },
  orderView:{		
    screen: ORDERVIEW_SCREEN	
  },
  orderDetail:{		
    screen: ORDERDETAIL_SCREEN	
  },
  MyProfile: { screen: PROFILE_SCREEN, 
  },
  distributorIdCard: {
    screen: DISTRIBUTOR_IDCARD,
  },
  myBusinessInsights: {
    screen: MYBUSINESSINSIGHTS_SCREEN,
    navigationOptions: ({ navigation }) =>  ({
      headerStyle: {
        backgroundColor: '#fafbfc',
      },
      headerTitleStyle: styles.headerTitle,
      tabBarVisible: false,
      headerLeft: <Icon name='ios-arrow-back' size={30} color='#3f4967' style={{ marginLeft: 16 }} onPress={() => { navigation.goBack() }} />,
    }),
  },
  branches: {
    screen: BRANCHES_SCREEN,
  },
  branchDetails: {
    screen: BRANCHDETAILS_SCREEN
  },
  branchLocation: {
    screen: BRANCH_LOCAITON_SCREEN
  },
  aboutUs: {
    screen: ABOUT_US_WEB_VIEW_SCREEN
  },
  contactUs: {
    screen : CONTACT_US
  },
  wellness:{
    screen : WELLNESS_SCREEN
  },
  customerReviewListing: {
    screen: CUSTOMER_REVIEW_SCREEN
  },
  generalQueries: {
    screen: GENERAL_QUERIES_SCREEN
  },
  shoppingOption: {
    screen: SHOPPING_OPTION
  },
  orderLog: {
    screen: ORDER_LOG_SCREEN
  },
  orderLogDetails: {
    screen: ORDER_LOG_DETAILS
  },
  updatePaymentDetails: {
    screen: SUBMIT_PAYMENT_REF,
  },
  repeatOrder: {
    screen: REPEAT_ORDER
  },
  LogedinDevicesList: {
    screen: LogedinDevicesList,
    navigationOptions: {
      headerStyle: {
        backgroundColor: '#fafbfc',
      },
      headerTitle: strings.drawerScreen.LoggedIn_Devices,
      headerTitleStyle: styles.headerTitle,
    },
  },
  MyProspect: {
    screen: MyProspect,
    navigationOptions: {
      headerStyle: {
        backgroundColor: '#fafbfc',
      },
      headerTitle: strings.drawerScreen.My_Prospect,
      headerTitleStyle: styles.headerTitle,
    },
  }, 
}, {
  navigationOptions: (props)=> ({
    headerForceInset: { top: 'never', bottom: 'never' },
  })
}
);

const MyCart = StackNavigator({
  MyCart: {
    screen: VIEWCART_SCREEN,
  },
  cartReview: {
    screen:CARTREVIEW_SCREEN
  },
  kycImage: {
    screen: KYC_SCREEN,
    navigationOptions: {
      headerStyle: {
        backgroundColor: '#fafbfc',
      },
      headerTitle: 'My KYC',
      headerTitleStyle: styles.headerTitle,
    },
  },
  news: {
    screen: NEWS,
  },
  kycDetailsScreen: {
    screen: KYC_DETAILS,
  },
  mobileNumberUpdate: {
    screen: MOBILE_NUMBER_UPDATE,
  },
  addNewNumber:{
    screen: ADD_NEW_NUMBER
  },
  mobileUpdateVerification: {
    screen: MOBILE_UPDATE_VERIFICATION
  },
  bankPanScreen: {
    screen: BANK_PAN_SCREEN,
  },
  birthdayList: {
    screen: BIRTHDAY_LIST,
  },
  createCartDownlineList: {
    screen: CREATECARTDOWNLINELIST_SCREEN,
  },
  createDownlineCart: {
    screen: CREATEDOWNLINECART_SCREEN,
  },
  myNetwork: {
    screen: MYNETWORK_SCREEN,
    navigationOptions: {
      drawerLockMode: 'locked-closed',
      headerStyle: {
        backgroundColor: '#fafbfc',
      },
      headerTitle: 'My Networks',
      headerTitleStyle: styles.headerTitle,
    },
  },
  brandStore: {
    screen: BRANDSTORE_SCREEN,
  },
  categoryList: {
    screen: CATEGORYLST_SCREEN
  },
  consistancy: {
    screen: CONSISTANCY_SCREEN,
    navigationOptions: {
      drawerLockMode: 'locked-closed',
      headerStyle: {
        backgroundColor: '#fafbfc',
      },
      headerTitle: 'My Consistency',
      headerTitleStyle: styles.headerTitle,
    }
  },
  signup: {
    screen: SIGNUP_SCREEN,
  },
  downlineRegistration: {
    screen: DOWNLINE_REGISTRATION
  },
  productList : {
    screen: PRODUCT_LIST,
  },
  productListCNC: {
    screen: PRODUCT_LIST_CNC
  },
  submitOtp: {
    screen: SUBMITOTP_SCREEN,
  },
  productDetails : {
    screen: PRODUCT_DETAILS
  },
  myBonus: {
    screen: MYBONUS_SCREEN,
    navigationOptions: {
      drawerLockMode: 'locked-closed',
      headerStyle: {
        backgroundColor: '#fafbfc',
      },
      headerTitle: 'My Bonus',
      headerTitleStyle: styles.headerTitle,
    }
  },
  myVoucher: {
    screen: MYVOUCHER_SCREEN,
    navigationOptions: {
      drawerLockMode: 'locked-closed',
      headerStyle: {
        backgroundColor: '#fafbfc',
      },
      headerTitle: 'My Vouchers',
      headerTitleStyle: styles.headerTitle,
    }
  },
  myFunds: {
    screen: MYFUNDS_SCREEN,
    navigationOptions: {
      drawerLockMode: 'locked-closed',
      headerStyle: {
        backgroundColor: '#fafbfc',
      },
      headerTitle: 'My Funds',
      headerTitleStyle: styles.headerTitle,
    },
  },
  courierDetails: {
    screen: COURIER_DETAILS,
  },
  location: {
    screen: LOCATION_SCREEN
  },
  selectShippingType:{
    screen: SELECT_SHIPPING_TYPE
  },
  selectLocation: {
    screen: SELECTLOCATION_SCREEN,
  },
  selectMiUserAddress: {
    screen: SELECT_MIUSER_ADDRESS,
  },
  addMiUserAddress: {
    screen: ADD_MIUSER_ADDRESS,
  },
  myFundsDetails: {
    screen: MYFUNDS_DETAILS_SCREEN
  },
  groupPvGraph:{
    screen: GROUP_PV_GRAPH
  },
  downlinePvGraph:{
    screen: DOWNLINE_PV_GRAPH
  },
  mylevel: {
    screen: MYLEVEL_SCREEN,
    navigationOptions: {
      headerTitle: 'My Level'
    },
  },
  filterScreen:{		
    screen: FILTER_SCREEN		
  },
  myTrainingScreen:{		
    screen: MYTRAINING_SCREEN		
  },
  selectTrainingScreen:{		
    screen: SELECTTRAINING_SCREEN		
  },
  notificationScreen:{		
    screen: NOTIFICATION_SCREEN	
  },
  training:{
    screen:NEWTRAINING_SCREEN
  },
  recommendation: {
    screen: RECOMMENDATION_SCREEN
  },
  recommendationDetails: {
    screen: RECOMMENDATIONDETAIL_SCREEN
  },
  cartVouchersScreen: {
    screen: CARTVOUCHERS_SCREEN
  },
  changePassword: {
    screen: CHANGE_PASSWORD,
  },
  cartCheckout:{
    screen: CART_CHECKOUT,
  },
  orders:{		
    screen: MyORDERS_SCREEN		
  },
  payment: {
    screen: PAYMENT_SCREEN,
  },
  orderConfirmation: {		
    screen: ORDER_CONFIRMATION		
  },
  vbdStores:{
    screen: VBDSTORES_SCREEN
  },
  orderFeedbackScreen: {
    screen: ORDER_FEEDBACK_SCREEN
  },
  productFeedbackScreen: {
    screen: PRODUCT_FEEDBACK_SCREEN
  },
  orderTypeFeedbackScreen: {
    screen: ORDER_TYPE_FEEDBACK_SCREEN
  },
  orderView:{		
    screen: ORDERVIEW_SCREEN	
  },
  orderDetail:{		
    screen: ORDERDETAIL_SCREEN	
  },
  MyProfile: { screen: PROFILE_SCREEN 
  },
  distributorIdCard: {
    screen: DISTRIBUTOR_IDCARD,
  },
  myBusinessInsights: {
    screen: MYBUSINESSINSIGHTS_SCREEN,
    navigationOptions: ({ navigation }) =>  ({
      headerStyle: {
        backgroundColor: '#fafbfc',
      },
      headerTitleStyle: styles.headerTitle,
      tabBarVisible: false,
      headerLeft: <Icon name='ios-arrow-back' size={30} color='#3f4967' style={{ marginLeft: 16 }} onPress={() => { navigation.goBack() }} />,
    }),
  },
  branches: {
    screen: BRANCHES_SCREEN,
  },
  branchDetails: {
    screen: BRANCHDETAILS_SCREEN
  },
  branchLocation: {
    screen: BRANCH_LOCAITON_SCREEN
  },
  aboutUs: {
    screen: ABOUT_US_WEB_VIEW_SCREEN
  },
  contactUs: {
    screen : CONTACT_US
  },
  wellness:{
    screen : WELLNESS_SCREEN
  },
  customerReviewListing: {
    screen: CUSTOMER_REVIEW_SCREEN
  },
  generalQueries: {
    screen: GENERAL_QUERIES_SCREEN
  },
  shoppingOption: {
    screen: SHOPPING_OPTION
  },
  repeatOrder: {
    screen: REPEAT_ORDER
  },
  viewCart: {
    screen: VIEWCART_SCREEN,
  },
  orderLog: {
    screen: ORDER_LOG_SCREEN
  },
  orderLogDetails: {
    screen: ORDER_LOG_DETAILS
  },
  updatePaymentDetails: {
    screen: SUBMIT_PAYMENT_REF,
  },
  LogedinDevicesList: {
    screen: LogedinDevicesList,
    navigationOptions: {
      headerStyle: {
        backgroundColor: '#fafbfc',
      },
      headerTitle: strings.drawerScreen.LoggedIn_Devices,
      headerTitleStyle: styles.headerTitle,
    },
  },
  MyProspect: {
    screen: MyProspect,
    navigationOptions: {
      headerStyle: {
        backgroundColor: '#fafbfc',
      },
      headerTitle: strings.drawerScreen.My_Prospect,
      headerTitleStyle: styles.headerTitle,
    },
  }, 
}, {
  navigationOptions: (props)=> ({
    headerForceInset: { top: 'never', bottom: 'never' },
  })
}
);
const getAllVisibleTab = () => {
  
}

const CongifurableTabMenu = TabNavigator(
  {
  Dashboard: { screen: Dashboard },
  Search: { screen: Search },
}
,
{
  navigationOptions: ({ navigation }) => ({
    tabBarIcon: ({ focused }) => {
      const { routeName } = navigation.state;
      let iconName;
      if (routeName === 'Dashboard') {
        iconName = focused ? MYVESTIGE_ACTIVE : MYVESTIGE_INACTIVE;
      } 
      else if (routeName === 'Shopping') {
        iconName = focused ? SHOPPING_ACTIVE : SHOPPING_INACTIVE;
      }
      else if (routeName === 'Search') {
        iconName = focused ? SEARCH_ACTIVE : SEARCH_INACTIVE;
      }
      else if (routeName === 'Schemes') {
        iconName = focused ? SCHEME_ACTIVE : SCHEME_INACTIVE;
      }
      else if (routeName === 'MyCart') {
        iconName = focused ? MYCART_ACTIVE : MYCART_INACTIVE;
      }

      // You can return any component that you like here! We usually use an
      return <TabIcon resizeMode='contain' source={iconName} routeName={routeName} />;
    },
    tabBarOnPress: async ({ previousScene, scene }) => {
      let country_Id = await AsyncStore.get(COUNTRY_ID);
      const tabRoute = scene.route.routeName;
      const prevRouteName = previousScene.routes[0].routeName;
      if(prevRouteName === 'Shopping') {
        navigation.popToTop()
      }
      if (prevRouteName !== tabRoute) {
        navigation.dispatch(NavigationActions.navigate({
          routeName: tabRoute
        }));
      }
      else {
        navigation.popToTop()
      }
    }
  }),
  tabBarOptions : {
    activeTintColor: '#567bc7',
    inactiveTintColor: '#515867',
    labelStyle: {
      fontSize: 12,
    },
    allowFontScaling: false
  },
  tabBarComponent: TabBarBottom,
  tabBarPosition: 'bottom',
  animationEnabled: false,
  swipeEnabled: false,
})

const TabOtherCountry = TabNavigator(
  {
  Dashboard: { screen: Dashboard },
  Search: { screen: Search },
}
,
{
  navigationOptions: ({ navigation }) => ({
    tabBarIcon: ({ focused }) => {
      const { routeName } = navigation.state;
      let iconName;
      if (routeName === 'Dashboard') {
        iconName = focused ? MYVESTIGE_ACTIVE : MYVESTIGE_INACTIVE;
      } 
      else if (routeName === 'Shopping') {
        iconName = focused ? SHOPPING_ACTIVE : SHOPPING_INACTIVE;
      }
      else if (routeName === 'Search') {
        iconName = focused ? SEARCH_ACTIVE : SEARCH_INACTIVE;
      }
      else if (routeName === 'Schemes') {
        iconName = focused ? SCHEME_ACTIVE : SCHEME_INACTIVE;
      }
      else if (routeName === 'MyCart') {
        iconName = focused ? MYCART_ACTIVE : MYCART_INACTIVE;
      }

      // You can return any component that you like here! We usually use an
      return <TabIcon resizeMode='contain' source={iconName} routeName={routeName} />;
    },
    tabBarOnPress: async ({ previousScene, scene }) => {
      let country_Id = await AsyncStore.get(COUNTRY_ID);
      // if((scene.index == 1 || scene.index == 3 || scene.index == 4) && country_Id == "2"){
      //     Alert.alert(
      //       "Info", "Currently this module is not enable for Nepal distributors.",
      //       [
      //         { text: 'OK', onPress: () => console.log('OK Pressed') },
      //       ],
      //       { cancelable: false },
      //     );

      //   return
      // }
      const tabRoute = scene.route.routeName;
      const prevRouteName = previousScene.routes[0].routeName;
      if(prevRouteName === 'Shopping') {
        navigation.popToTop()
      }
      if (prevRouteName !== tabRoute) {
        navigation.dispatch(NavigationActions.navigate({
          routeName: tabRoute
        }));
      }
      else {
        navigation.popToTop()
      }
    }
  }),
  tabBarOptions : {
    activeTintColor: '#567bc7',
    inactiveTintColor: '#515867',
    labelStyle: {
      fontSize: 12,
    },
    allowFontScaling: false
  },
  tabBarComponent: TabBarBottom,
  tabBarPosition: 'bottom',
  animationEnabled: false,
  swipeEnabled: false,
})

const Tab = TabNavigator(
  {
  // Shopping: { screen: Shopping },
  Dashboard: { screen: Dashboard },
  Shopping: { screen: Shopping },
  Search: { screen: Search },
  Schemes : {screen : Scheme},
  MyCart: { screen: MyCart },

}
,
{
  navigationOptions: ({ navigation }) => ({
    tabBarIcon: ({ focused }) => {
      const { routeName } = navigation.state;
      let iconName;
      if (routeName === 'Dashboard') {
        iconName = focused ? MYVESTIGE_ACTIVE : MYVESTIGE_INACTIVE;
      } 
      else if (routeName === 'Shopping') {
        iconName = focused ? SHOPPING_ACTIVE : SHOPPING_INACTIVE;
      }
      else if (routeName === 'Search') {
        iconName = focused ? SEARCH_ACTIVE : SEARCH_INACTIVE;
      }
      else if (routeName === 'Schemes') {
        iconName = focused ? SCHEME_ACTIVE : SCHEME_INACTIVE;
      }
      else if (routeName === 'MyCart') {
        iconName = focused ? MYCART_ACTIVE : MYCART_INACTIVE;
      }

      // You can return any component that you like here! We usually use an
      return <TabIcon resizeMode='contain' source={iconName} routeName={routeName} />;
    },
    tabBarOnPress: async ({ previousScene, scene }) => {
      let country_Id = await AsyncStore.get(COUNTRY_ID);
      if((scene.index == 1 || scene.index == 3 || scene.index == 4) && country_Id == "2"){
          // Alert.alert(
          //   "Info", "Currently this module is not enable for Nepal distributors.",
          //   [
          //     { text: 'OK', onPress: () => console.log('OK Pressed') },
          //   ],
          //   { cancelable: false },
          // );

        return
      }
      const tabRoute = scene.route.routeName;
      const prevRouteName = previousScene.routes[0].routeName;
      if(prevRouteName === 'Shopping') {
        navigation.popToTop()
      }
      if (prevRouteName !== tabRoute) {
        navigation.dispatch(NavigationActions.navigate({
          routeName: tabRoute
        }));
      }
      else {
        navigation.popToTop()
      }
    }
  }),
  tabBarOptions : {
    activeTintColor: '#567bc7',
    inactiveTintColor: '#515867',
    labelStyle: {
      fontSize: 12,
    },
    allowFontScaling: false
  },
  tabBarComponent: TabBarBottom,
  tabBarPosition: 'bottom',
  animationEnabled: false,
  swipeEnabled: false,
})

const signedOutStack = StackNavigator({
  // languageListing: {
  //   screen: LANGUAGE_LIST,
  //   navigationOptions: {
  //     header: null,
  //   }
  // },
  // loginConfirmDeviceOtp: {
  //   screen: LOGINCONFIRMDEVICEOTP,
  //   navigationOptions: {
  //     header: null,
  //   }
  // },
  onBoarding: {
    screen: ONBOARDING_SCREEN,
    navigationOptions: {
      header: null,
    }
  },
  login: {
    screen: LOGIN_SCREEN,
    navigationOptions: {
      header: null,
    }
  },
  guestUser: {
    screen: GUEST_USER_SCREEN,
    navigationOptions: {
      header: null,
    }
  },
  signup: {
    screen: SIGNUP_SCREEN,
  },
  forgotPassword: {		
    screen: FORGOTPASSWORD_SCREEN,
    navigationOptions: {
      header: null,
    },
  },
  kycImage: {
    screen: KYC_SCREEN,
    navigationOptions: {
      headerStyle: {
        backgroundColor: '#fafbfc',
      },
      headerTitle: 'My KYC',
      headerTitleStyle: styles.headerTitle,
    },
  },
  kycDetailsScreen: {
    screen: KYC_DETAILS,
  },
  mobileNumberUpdate: {
    screen: MOBILE_NUMBER_UPDATE,
  },
  addNewNumber:{
    screen: ADD_NEW_NUMBER
  },
  mobileUpdateVerification: {
    screen: MOBILE_UPDATE_VERIFICATION
  },
  bankPanScreen: {
    screen: BANK_PAN_SCREEN,
  },
  location: {
    screen: LOCATION_SCREEN,
  },
  selectShippingType:{
    screen: SELECT_SHIPPING_TYPE
  },
  loginConfirmDeviceOtp: {
    screen: LOGINCONFIRMDEVICEOTP,
    navigationOptions: {
      header: null,
    }
  },
  completeRegistration: {
    screen: COMPLETE_REGISTRATION,
  }
});


const AllCountryTab = DrawerNavigator({
  configurableDashboard: {
    screen: CongifurableTabMenu,
  }
},{
  contentComponent: props => <DrawerScreen {...props} />
});

const SignedInOtherCountry = DrawerNavigator({
  dashboard: {
    screen: TabOtherCountry,
  }
},{
  contentComponent: props => <DrawerScreen {...props} />
});

const DrawerNav = DrawerNavigator({
  dashboard: {
    screen: Tab,
  }
},{
  contentComponent: props => <DrawerScreen {...props} />
});

const defaultGetStateForAction = DrawerNav.router.getStateForAction;

DrawerNav.router.getStateForAction = (action, state) => {
  if(state && action.type === 'Navigation/NAVIGATE' && action.routeName !== 'DrawerOpen') {
    Platform.OS === 'ios' && StatusBar.setHidden(false);
  }

  if(state && action.type === 'Navigation/NAVIGATE' && action.routeName === 'DrawerOpen') {
    Platform.OS === 'ios' && StatusBar.setHidden(true);
  }

  return defaultGetStateForAction(action, state);
};

const createRootNavigator = (signedIn = false,countryId = 1) => {
  return SwitchNavigator(
    {
      SignedIn: {
        screen: DrawerNav
      },
      SignedInOtherCountry: {
        screen: SignedInOtherCountry
      },
      AllCountryTab:{
        screen: AllCountryTab
      },
      SignedOut: {
        screen:  signedOutStack
      }
    },{
      initialRouteName: (signedIn == true && countryId == 2) ? 'SignedInOtherCountry' : (signedIn == true && countryId != 2) ? 'SignedIn' : 'SignedOut'
    }
  );
};

export default createRootNavigator;