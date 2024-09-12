/**
 * @description Defining all the navigation routes here
 */

import React from 'react';
import { StyleSheet, StatusBar, Platform, Alert } from 'react-native';
import { observer } from 'mobx-react';
import {
  NavigationContainer,
  useNavigation,
  CommonActions,
  getFocusedRouteNameFromRoute,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import TouchID from 'react-native-touch-id';
import Icon from 'react-native-vector-icons/Ionicons';
import store from '../stores/Store';
import { strings } from 'app/src/utility/localization/Localized';
import { Specs } from 'app/src/utility/Theme';
import { navigationRef } from './NavigationService';
import * as AsyncStore from 'app/src/utility/AsyncStoragesUtils';
import TabIcon from 'app/src/utility/TabIconUtil';

// importing all screens here
import DrawerScreen from './DrawerScreen';
import LOGIN_SCREEN from 'app/src/screens/login/Login';
import ONBOARDING_SCREEN from 'app/src/screens/onBoarding/OnboardingMain';
import FORGOTPASSWORD_SCREEN from 'app/src/screens/forgotPassword/ForgotPassword';
import LOGINCONFIRMDEVICEOTP from 'app/src/screens/login/LoginConfirmDeviceOtp';
import SIGNUP_SCREEN from 'app/src/screens/signup/Signup';
import DOWNLINE_REGISTRATION from 'app/src/screens/signup/DownlineRegistration';
import COMPLETE_REGISTRATION from 'app/src/screens/signup/CompleteRegistration';
import GUEST_USER_SCREEN from 'app/src/screens/guestUser/GuestUser';
import DASHBOARD_SCREEN from 'app/src/screens/Dashboard/Dashboard';
import TouchScreen from 'app/src/screens/touchId/TouchId';
import KYC_SCREEN from 'app/src/screens/kyc/KycScreenMain';
// import KYC_DETAILS from 'app/src/screens/kyc/KycDetails';
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
// import SUBMITOTP_SCREEN from 'app/src/screens/forgotPassword/SubmitOtp';
import PRODUCT_DETAILS from 'app/src/screens/productList/ProductDetails';
// import Banner from 'app/src/screens/Dashboard/Banner';
import MYFUNDS_SCREEN from 'app/src/screens/funds/MyFunds';
import CART_CHECKOUT from 'app/src/screens/checkout/CartCheckout';
import CHANGE_PASSWORD from 'app/src/screens/changePassword/ChangePassword';
import SHARESCREEN from 'app/src/screens/referral-screen/ShareScreen';
// import ORDER_FEEDBACK_SCREEN from 'app/src/screens/orders/OrderFeedback';
import PRODUCT_FEEDBACK_SCREEN from 'app/src/screens/orders/ProductsFeedbackScreen';
import ORDER_TYPE_FEEDBACK_SCREEN from 'app/src/screens/orders/OrderTypeFeedback';
import FAQ_SCREEN from 'app/src/screens/faq/Faq';
import FAQ_WEB_VIEW_SCREEN from 'app/src/screens/faq/faqWebView';
import CUSTOMER_REVIEW_SCREEN from 'app/src/screens/customerReviews/CustomerReview';
import ABOUT_US_WEB_VIEW_SCREEN from 'app/src/screens/aboutUs/AboutUs';
import CONTACT_US from 'app/src/screens/contactUs/ContactUs';
import WELLNESS_SCREEN from 'app/src/screens/wellness/wellness'
import STORE_FRONT_SCREEN from 'app/src/screens/store-front/StoreFront';
import DISTRIBUTOR_FEEDBACK_SCREEN from 'app/src/screens/myNetwork/DistributorFeedback';

import MYFUNDS_DETAILS_SCREEN from 'app/src/screens/funds/MyFundsDetails';
import FILTER_SCREEN from 'app/src/screens/productList/Filter';
import LOCATION_SCREEN from 'app/src/screens/location/Location';

import MYVOUCHER_SCREEN from 'app/src/screens/vouchers/MyVouchers';
import GROUP_PV_GRAPH from 'app/src/screens/groupPv/GroupPvGraph';
import MYBONUS_SCREEN from 'app/src/screens/payout/MyBonus';
import MYLEVEL_SCREEN from 'app/src/screens/myLevel/MyLevel';
// import LANGUAGE_LIST from 'app/src/screens/languages/LanguageList';
import MYTRAINING_SCREEN from 'app/src/screens/myTraining/MyTraining';
import SELECTTRAINING_SCREEN from 'app/src/screens/myTraining/selectTraining/SelectTraining';
import TRAINING_DASHBOARD from '../screens/trainingDashboard/index';
import TRAINING_REQUEST_FORM from '../screens/trainingDashboard/TrainingRequestForm/index';
import TRAINING_REQUEST_LIST from '../screens/trainingDashboard/TrainingRequestList/index';
import COMPLETED_TRAINING_LIST from '../screens/trainingDashboard/CompletedTrainingList/index';
import CLAIMALLOWANCES from '../screens/trainingDashboard/ClaimForm/ClaimAllowances/index';
import CLAIMENTINFO from '../screens/trainingDashboard/ClaimForm/ClaimentInfo/index';
import CLAIMOTHERSTOTAL from '../screens/trainingDashboard/ClaimForm/ClaimOthersTotal/index';
import CONTACT_LIST_SCREEN from '../screens/trainingDashboard/ContactList/index';
import ADD_PROSPECTS from '../screens/trainingDashboard/AddProspects/index';
import VIEW_PROSPECTS from '../screens/trainingDashboard/ViewProspects/index';
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
import BRANCH_LOCATION_SCREEN from 'app/src/screens/branches/BranchLocation';
import GENERAL_QUERIES_SCREEN from 'app/src/screens/generalQueries/GeneralQueries';
import SCHEME_SCREEN from 'app/src/screens/scheme/Scheme';
import PAYMENT_SCREEN from 'app/src/screens/payment/Payment';
import YOUTUBE_WEBVIEW_SCREEN from 'app/src/screens/Dashboard/YoutubeWebView';
import MYBUSINESSINSIGHTS_SCREEN from 'app/src/screens/Dashboard/MyBusinessInsights';
import DAF from 'app/src/screens/daf/daf';
import ORDER_LOG_SCREEN from 'app/src/screens/orderLog/OrderLog';
import ORDER_LOG_DETAILS from 'app/src/screens/orderLog/OrderLogDetails';
import SUBMIT_PAYMENT_REF from 'app/src/screens/orderLog/updatePaymentDetails';
import DYNAMICCONTENT_SCREEN from 'app/src/screens/dynamicScreen/DynamicScreen';
import LOGGED_IN_DEVICES from 'app/src/screens/LoggedinDevicesList/LoggedinDevicesList';
import DOWNLINE_PV_GRAPH from 'app/src/screens/pvAnalysis/DownlinePvGraph';
import MY_PROSPECT from 'app/src/screens/myProspect/MyProspect';
import COURIER_DETAILS from 'app/src/screens/courierDetails/CourierDetails';
import NEWS from 'app/src/screens/news/News';
import SELECTEDSHIPPINGTYPE from 'app/src/screens/location/SelectShippingType';
import CHAT_SUPPORT from 'app/src/screens/Dashboard/ChatSupport';
import B2C_USER_LIST from '../screens/b2cUser/B2CUserList';

// Defining Tab-bar icons here active or non-active
const MYVESTIGE_ACTIVE = require('../assets/images/tabIcons/dashboard_active_icon.png');
const MYVESTIGE_INACTIVE = require('../assets/images/tabIcons/dashboard_inactive_icon.png');
const SHOPPING_ACTIVE = require('../assets/images/tabIcons/shopping_active_icon.png');
const SHOPPING_INACTIVE = require('../assets/images/tabIcons/shopping_inactive_icon.png');
const SEARCH_ACTIVE = require('../assets/images/tabIcons/search_active_icon.png');
const SEARCH_INACTIVE = require('../assets/images/tabIcons/search_inactive_icon.png');
const SCHEME_ACTIVE = require('../assets/images/scheme/schemeActive.png');
const SCHEME_INACTIVE = require('../assets/images/scheme/scheme.png');
const MYCART_ACTIVE = require('../assets/images/tabIcons/cart_active_icon.png');
const MYCART_INACTIVE = require('../assets/images/DashBoardHeader/cart.png');

const COUNTRY_ID = AsyncStore.addPrefix('country-id');

const styles = StyleSheet.create({
  tabIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  headerTitle: {
    ...Specs.fontBold,
    fontSize: 18,
    color: '#373e73',
  },
});

const Drawer = createDrawerNavigator();
const BottomTab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const DashboardStack = createNativeStackNavigator();
const ShoppingStack = createNativeStackNavigator();
const SearchStack = createNativeStackNavigator();
const SchemeStack = createNativeStackNavigator();
const CartStack = createNativeStackNavigator();

const handleTabBarIcon = (route, focused) => {
  const routeName = route.name;
  let iconName = focused ? MYVESTIGE_ACTIVE : MYVESTIGE_INACTIVE;
  if (routeName === 'Dashboard') {
    iconName = focused ? MYVESTIGE_ACTIVE : MYVESTIGE_INACTIVE;
  } else if (routeName === 'Shopping') {
    iconName = focused ? SHOPPING_ACTIVE : SHOPPING_INACTIVE;
  } else if (routeName === 'Search') {
    iconName = focused ? SEARCH_ACTIVE : SEARCH_INACTIVE;
  } else if (routeName === 'Schemes') {
    iconName = focused ? SCHEME_ACTIVE : SCHEME_INACTIVE;
  } else if (routeName === 'MyCart') {
    iconName = focused ? MYCART_ACTIVE : MYCART_INACTIVE;
  }
  // You can return any component that you like here! We usually use an
  return (
    <TabIcon resizeMode="contain" source={iconName} routeName={routeName} />
  );
};

const commonRoutes = [
  { name: 'kycImage', component: KYC_SCREEN },
  { name: 'mobileNumberUpdate', component: MOBILE_NUMBER_UPDATE },
  { name: 'addNewNumber', component: ADD_NEW_NUMBER },
  { name: 'mobileUpdateVerification', component: MOBILE_UPDATE_VERIFICATION },
  { name: 'bankPanScreen', component: BANK_PAN_SCREEN },
  { name: 'news', component: NEWS },
  { name: 'Wishlist', component: WISHLIST_SCREEN },
  { name: 'birthdayList', component: BIRTHDAY_LIST },
  { name: 'viewCart', component: VIEWCART_SCREEN },
  { name: 'cartReview', component: CARTREVIEW_SCREEN },
  { name: 'cartCheckout', component: CART_CHECKOUT },
  { name: 'createCartDownlineList', component: CREATECARTDOWNLINELIST_SCREEN },
  { name: 'createDownlineCart', component: CREATEDOWNLINECART_SCREEN },
  { name: 'myNetwork', component: MYNETWORK_SCREEN },
  { name: 'brandStore', component: BRANDSTORE_SCREEN },
  { name: 'categoryList', component: CATEGORYLST_SCREEN },
  { name: 'consistancy', component: CONSISTANCY_SCREEN },
  { name: 'downlineRegistration', component: DOWNLINE_REGISTRATION },
  { name: 'productList', component: PRODUCT_LIST },
  { name: 'productListCNC', component: PRODUCT_LIST_CNC },
  { name: 'productDetails', component: PRODUCT_DETAILS },
  { name: 'myBonus', component: MYBONUS_SCREEN },
  { name: 'myVoucher', component: MYVOUCHER_SCREEN },
  { name: 'courierDetails', component: COURIER_DETAILS },
  { name: 'myFunds', component: MYFUNDS_SCREEN },
  { name: 'myFundsDetails', component: MYFUNDS_DETAILS_SCREEN },
  { name: 'location', component: LOCATION_SCREEN },
  { name: 'selectShippingType', component: SELECTEDSHIPPINGTYPE },
  { name: 'selectLocation', component: SELECTLOCATION_SCREEN },
  { name: 'selectMiUserAddress', component: SELECT_MIUSER_ADDRESS },
  { name: 'addMiUserAddress', component: ADD_MIUSER_ADDRESS },
  { name: 'groupPvGraph', component: GROUP_PV_GRAPH },
  { name: 'downlinePvGraph', component: DOWNLINE_PV_GRAPH },
  { name: 'mylevel', component: MYLEVEL_SCREEN },
  { name: 'filterScreen', component: FILTER_SCREEN },
  { name: 'myTrainingScreen', component: MYTRAINING_SCREEN },
  { name: 'trainingDashboard', component: TRAINING_DASHBOARD },
  { name: 'trainingRequestForm', component: TRAINING_REQUEST_FORM },
  { name: 'trainingRequestList', component: TRAINING_REQUEST_LIST },
  { name: 'completedRequestList', component: COMPLETED_TRAINING_LIST },
  { name: 'claimAllowances', component: CLAIMALLOWANCES },
  { name: 'claimentInfo', component: CLAIMENTINFO },
  { name: 'claimOthersTotal', component: CLAIMOTHERSTOTAL },
  { name: 'contactList', component: CONTACT_LIST_SCREEN},
  { name: 'addProspects', component: ADD_PROSPECTS},
  { name: 'viewProspects',component: VIEW_PROSPECTS},
  { name: 'selectTrainingScreen', component: SELECTTRAINING_SCREEN },
  { name: 'training', component: NEWTRAINING_SCREEN },
  { name: 'notificationScreen', component: NOTIFICATION_SCREEN },
  { name: 'recommendation', component: RECOMMENDATION_SCREEN },
  { name: 'recommendationDetails', component: RECOMMENDATIONDETAIL_SCREEN },
  { name: 'cartVouchersScreen', component: CARTVOUCHERS_SCREEN },
  { name: 'changePassword', component: CHANGE_PASSWORD },
  { name: 'orders', component: MyORDERS_SCREEN },
  { name: 'orderView', component: ORDERVIEW_SCREEN },
  { name: 'orderDetail', component: ORDERDETAIL_SCREEN },
  { name: 'orderInvoice', component: ORDERINVOICE_SCREEN },
  // { name: 'orderFeedbackScreen', component: ORDER_FEEDBACK_SCREEN },
  { name: 'orderTypeFeedbackScreen', component: ORDER_TYPE_FEEDBACK_SCREEN },
  { name: 'productFeedbackScreen', component: PRODUCT_FEEDBACK_SCREEN },
  { name: 'payment', component: PAYMENT_SCREEN },
  { name: 'orderConfirmation', component: ORDER_CONFIRMATION },
  { name: 'vbdStores', component: VBDSTORES_SCREEN },
  { name: 'shareScreen', component: SHARESCREEN },
  { name: 'MyProfile', component: PROFILE_SCREEN },
  { name: 'distributorIdCard', component: DISTRIBUTOR_IDCARD },
  { name: 'branches', component: BRANCHES_SCREEN },
  { name: 'branchDetails', component: BRANCHDETAILS_SCREEN },
  { name: 'branchLocation', component: BRANCH_LOCATION_SCREEN },
  { name: 'aboutUs', component: ABOUT_US_WEB_VIEW_SCREEN },
  { name: 'contactUs', component: CONTACT_US },
  { name: 'wellness', component: WELLNESS_SCREEN },
  { name: 'storeFront', component: STORE_FRONT_SCREEN },
  { name: 'distributorFeedback', component: DISTRIBUTOR_FEEDBACK_SCREEN },
  { name: 'customerReviewListing', component: CUSTOMER_REVIEW_SCREEN },
  { name: 'generalQueries', component: GENERAL_QUERIES_SCREEN },
  { name: 'dynamicScreen', component: DYNAMICCONTENT_SCREEN },
  { name: 'youtubeListing', component: YOUTUBE_WEBVIEW_SCREEN },
  { name: 'myBusinessInsights', component: MYBUSINESSINSIGHTS_SCREEN },
  { name: 'daf', component: DAF },
  { name: 'chatSupport', component: CHAT_SUPPORT },
  { name: 'shoppingOption', component: SHOPPING_OPTION },
  { name: 'repeatOrder', component: REPEAT_ORDER },
  { name: 'orderLog', component: ORDER_LOG_SCREEN },
  { name: 'orderLogDetails', component: ORDER_LOG_DETAILS },
  { name: 'updatePaymentDetails', component: SUBMIT_PAYMENT_REF },
  { name: 'LogedinDevicesList', component: LOGGED_IN_DEVICES },
  { name: 'MyProspect', component: MY_PROSPECT },
  { name: 'faq', component: FAQ_SCREEN },
  { name: 'faqWebView', component: FAQ_WEB_VIEW_SCREEN },
  { name: 'B2CUserList', component: B2C_USER_LIST },
];

const dashboardRoutes = [
  { name: 'touchId', component: TouchScreen },
  { name: 'dashboard', component: DASHBOARD_SCREEN },
  ...commonRoutes,
];

const shoppingRoutes = [
  { name: 'shopping', component: SHOPPING_HOME_SCREEN },
  ...commonRoutes,
];

const searchRoutes = [
  { name: 'search', component: SEARCH_SCREEN },
  ...commonRoutes,
];

const schemeRoutes = [
  { name: 'scheme', component: SCHEME_SCREEN },
  ...commonRoutes,
];

const cartRoutes = [
  { name: 'myCart', component: VIEWCART_SCREEN },
  ...commonRoutes,
];

const DashboardRouteStack = () => {
  return (
    <DashboardStack.Navigator>
      {dashboardRoutes.map(item => (
        <DashboardStack.Screen
          key={item.name + 'key'}
          name={item.name}
          component={item.component}
          options={{ headerShown: false }}
        />
      ))}
    </DashboardStack.Navigator>
  );
};

const ShoppingRouteStack = () => {
  return (
    <ShoppingStack.Navigator>
      {shoppingRoutes.map(item => (
        <ShoppingStack.Screen
          key={item.name + 'key'}
          name={item.name}
          component={item.component}
          options={{ headerShown: false }}
        />
      ))}
    </ShoppingStack.Navigator>
  );
};

const SearchRouteStack = () => {
  return (
    <SearchStack.Navigator>
      {searchRoutes.map(item => (
        <SearchStack.Screen
          key={item.name + 'key'}
          name={item.name}
          component={item.component}
          options={{ headerShown: false }}
        />
      ))}
    </SearchStack.Navigator>
  );
};

const SchemeRouteStack = () => {
  return (
    <SchemeStack.Navigator>
      {schemeRoutes.map(item => (
        <SchemeStack.Screen
          key={item.name + 'key'}
          name={item.name}
          component={item.component}
          options={{ headerShown: false }}
        />
      ))}
    </SchemeStack.Navigator>
  );
};

const MyCartRouteStack = () => {
  return (
    <CartStack.Navigator>
      {cartRoutes.map(item => (
        <CartStack.Screen
          key={item.name + 'key'}
          name={item.name}
          component={item.component}
          options={{ headerShown: false }}
        />
      ))}
    </CartStack.Navigator>
  );
};

/**
 * @description Nepal speicifc tab navigator for proj, all the routes will be defined/intialized in this.
 */
const TabNavigatorNepal = () => {
  return (
    <BottomTab.Navigator
      screenOptions={({ navigation, route }) => ({
        tabBarIcon: ({ focused, color, size }) =>
          handleTabBarIcon(route, focused),
        headerShown: false,
        tabBarAllowFontScaling: false,
      })}>
      <BottomTab.Screen
        name="Dashboard"
        component={DashboardRouteStack}
        options={({ route, navigation }) => ({
          tabBarStyle: { display: getTabBarVisibility(route, navigation) },
        })}
        listeners={({ navigation, route }) => ({
          tabPress: e => handleTabPress(e, route, navigation),
        })}
      />
      <BottomTab.Screen
        name="Search"
        component={SearchRouteStack}
        options={({ route, navigation }) => ({
          tabBarStyle: { display: getTabBarVisibility(route, navigation) },
        })}
        listeners={({ navigation, route }) => ({
          tabPress: e => handleTabPress(e, route, navigation),
        })}
      />
    </BottomTab.Navigator>
  );
};

/**
 * @description this will decide which screen will have tab bar hidden.
 */
const getTabBarVisibility = (route, navigation) => {
  const routeName = getFocusedRouteNameFromRoute(route);
  if (navigation.getState()?.index === 0 && routeName === undefined) {
    // this will hide tab screen for 'touchid' screen as routename for initial tab screen is not returned by
    // navigator. (as per documentation of react navigation 6)
    return 'none';
  }
  // console.log('checkNav =>', navigation.getState());
  // console.log('checkRoute', route);
  // console.log('checkRouteName', routeName);
  const hideTabOnScreens = [
    'selectLocation',
    'location',
    'selectShippingType',
    'cartReview',
    'cartVouchersScreen',
    'selectMiUserAddress',
    'addMiUserAddress',
    'youtubeListing',
    'myBusinessInsights',
    'distributorFeedback',
    'notificationScreen',
    'orderConfirmation',
    'orderLog',
    'orderLogDetails',
    'updatePaymentDetails',
    'orderDetail',
    'orderInvoice',
    'payment',
    'shareScreen',
    'repeatOrder',
    'shoppingOption',
    'cartCheckout',
  ];
  return hideTabOnScreens.indexOf(routeName) <= -1 ? 'flex' : 'none';
};

const handleTabPress = (event, route, navigation) => {
  const { appConfiguration } = store;
  // console.log('tab press =>', event, '\n', navigation, '\n', route);
  // console.log('cehck nav ==> ', navigation?.getState());
  store.appConfiguration?.setLastTabRoute(appConfiguration?.selectedTabRoute);
  store.appConfiguration?.setSelectedTabRoute(route);
  console.log(
    'last tab -- selected tab \n',
    appConfiguration?.lastTabRoute,
    '\n--\n',
    appConfiguration?.selectedTabRoute,
  );
};

/**
 * @description Default tab navigator for proj, all the routes will be defined/intialized in this.
 */
const TabNavigator = () => {
  return (
    <BottomTab.Navigator
      screenOptions={({ navigation, route }) => ({
        tabBarIcon: ({ focused, color, size }) =>
          handleTabBarIcon(route, focused, navigation),
        headerShown: false,
        tabBarAllowFontScaling: false,
      })}>
      <BottomTab.Screen
        name="Dashboard"
        component={DashboardRouteStack}
        options={({ route, navigation }) => ({
          tabBarStyle: { display: getTabBarVisibility(route, navigation) },
        })}
        listeners={({ navigation, route }) => ({
          tabPress: e => handleTabPress(e, route, navigation),
        })}
      />
      <BottomTab.Screen
        name="Shopping"
        component={ShoppingRouteStack}
        options={({ route, navigation }) => ({
          tabBarStyle: { display: getTabBarVisibility(route, navigation) },
        })}
        listeners={({ navigation, route }) => ({
          tabPress: e => handleTabPress(e, route, navigation),
        })}
      />
      <BottomTab.Screen
        name="Search"
        component={SearchRouteStack}
        options={({ route, navigation }) => ({
          tabBarStyle: { display: getTabBarVisibility(route, navigation) },
        })}
        listeners={({ navigation, route }) => ({
          tabPress: e => handleTabPress(e, route, navigation),
        })}
      />
      <BottomTab.Screen
        name="Schemes"
        component={SchemeRouteStack}
        options={({ route, navigation }) => ({
          tabBarStyle: { display: getTabBarVisibility(route, navigation) },
        })}
        listeners={({ navigation, route }) => ({
          tabPress: e => handleTabPress(e, route, navigation),
        })}
      />
      <BottomTab.Screen
        name="MyCart"
        component={MyCartRouteStack}
        options={({ route, navigation }) => ({
          tabBarStyle: { display: getTabBarVisibility(route, navigation) },
        })}
        listeners={({ navigation, route }) => ({
          tabPress: e => handleTabPress(e, route, navigation),
        })}
      />
    </BottomTab.Navigator>
  );
};

/**
 * @description This is for nepal specific users, nepal specific tab navigator is nested inside it.
 */
const DrawerNavigatorNepal = () => {
  return (
    <Drawer.Navigator drawerContent={props => <DrawerScreen {...props} />}>
      <Drawer.Screen
        name="mainNepal"
        component={TabNavigatorNepal}
        options={{ headerShown: false }}
      />
    </Drawer.Navigator>
  );
};

/**
 * @description Drawer is used as main navigator in this proj, tab navigator is nested inside it.
 */
const DrawerNavigator = () => {
  return (
    <Drawer.Navigator drawerContent={props => <DrawerScreen {...props} />}>
      <Drawer.Screen
        name="main"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
    </Drawer.Navigator>
  );
};

/**
 * @description this is Root navigator which handle authentication flow screens between logged in
 * and logged out case. Also, Kyc screen is having an extra route just to fulfill requirement.
 */
const createRootNavigator = observer(({ auth, profile }) => {
  const { isAuthenticated, skippableLoginKycInProcess } = auth;
  const { countryId } = profile;

  const signedOutRoutes = [
    { name: 'onBoarding', component: ONBOARDING_SCREEN },
    { name: 'login', component: LOGIN_SCREEN },
    { name: 'loginConfirmDeviceOtp', component: LOGINCONFIRMDEVICEOTP },
    { name: 'completeRegistration', component: COMPLETE_REGISTRATION },
    { name: 'guestUser', component: GUEST_USER_SCREEN },
    { name: 'signup', component: SIGNUP_SCREEN },
    { name: 'forgotPassword', component: FORGOTPASSWORD_SCREEN },
    { name: 'kycImage', component: KYC_SCREEN },
  ];
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator>
        {skippableLoginKycInProcess ? (
          <Stack.Screen
            name="kycImage"
            component={KYC_SCREEN}
            options={{ headerShown: false }}
            initialParams={{ isLoginRoute: true }}
          />
        ) : isAuthenticated ? (
          <Stack.Screen
            name="rootStack"
            component={
              Number(countryId) === 2 ? DrawerNavigatorNepal : DrawerNavigator
            }
            options={{ headerShown: false }}
          />
        ) : (
          signedOutRoutes.map(item => (
            <Stack.Screen
              key={item.name + 'key'}
              name={item.name}
              component={item.component}
              options={{ headerShown: false }}
            />
          ))
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
});

export default createRootNavigator;
