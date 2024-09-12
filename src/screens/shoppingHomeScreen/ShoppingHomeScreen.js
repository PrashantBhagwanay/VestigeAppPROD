
import React, { Component } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Text, Image, Platform, Dimensions, Alert, Linking } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { inject, observer } from 'mobx-react';
import { observable, makeObservable } from 'mobx';
import Geolocation from '@react-native-community/geolocation';
import autobind from 'autobind-decorator';
import { promptToOpenSettings, connectedToInternet } from '../../utility/Utility';
import AlertClass from 'app/src/utility/AlertClass';
import { Specs } from 'app/src/utility/Theme';
import { Icon } from 'react-native-elements'

// Navigation Icons
import HeaderLeftIcons from 'app/src/components/navigation/HeaderLeftIcons';
import HeaderRightIcons from 'app/src/components/navigation/HeaderRightIcons';
import CoachMarks from 'app/src/components/coachmarks/CoachMarks';
import * as Permissions from '../../utility/permissions/Permissions';
import * as AsyncStore from 'app/src/utility/AsyncStoragesUtils';

import { CategoryTypeEnum, UserRole } from 'app/src/utility/constant/Constants';
import Category from 'app/src/screens/Dashboard/Category';
import ShopByPv from 'app/src/screens/Dashboard/Shopbypv';
import { strings } from 'app/src/utility/localization/Localized';
// import { trackEvent } from 'app/src/utility/AnalyticsUtils';
import { SHOPPING_TAB_PRESS } from 'app/src/utility/GAEventConstants';
import Brands from 'app/src/screens/Dashboard/Brands';
import SidescrollComponent from 'app/src/components/sidescrollComponent/SidescrollComponent';
import BannerView from 'app/src/components/dashBoard/BannerView';
import Loader  from 'app/src/components/loader/Loader';
import OfflineNotice from 'app/src/components/OfflineNotice';
import Banner from 'app/src/screens/Dashboard/Banner';
import LocationHeader from 'app/src/components/locationHeader/LocationHeader'
import { Header } from '../../components';

import Share from 'react-native-share';
import { Toast } from 'app/src/components/toast/Toast';
import PromotionModal from '../Dashboard/PromotionModal'
import BirthdayListModal from '../Dashboard/BirthdayListModal';
import StoreLocationSuggestor from '../Dashboard/StoreLocationSuggestor';

const SHARE_IMAGE = require('app/src/assets/images/DashBoardHeader/share_icon.png');
const DASHBOARD_ICON = require('app/src/assets/images/tabIcons/dashboard_active_icon.png');
const SHOPPING_ICON = require('app/src/assets/images/tabIcons/shopping_active_icon.png');
const SEARCH_ICON = require('app/src/assets/images/tabIcons/search_active_icon.png');
const WISHLIST_ICON = require('app/src/assets/images/tabIcons/wishlist_active_icon.png');
const MYCART_ICON = require('app/src/assets/images/tabIcons/cart_active_icon.png');
const IS_BIRTHDAY_POPUP_VISIBLE = AsyncStore.addPrefix('isBirthdayVisible');
const PROFILE_IMAGE = require('app/src/assets/images/DashBoardHeader/profileImage.png');



const { width, height } = Dimensions.get('window');

@inject('dashboard', 'products', 'cart', 'profile', 'auth', 'wishList', 'location')
@observer
export default class ShoppingHomeScreen extends Component {
  @observable isInternetConnected: Boolean = true;
  @observable mostViewed: [];
  @observable topSelling: [];
  @observable isLoading: boolean = true;

  constructor(props) {
    super(props);
    makeObservable(this);
    // props.navigation.addListener(
    //   'didBlur', () => {
    //     // this.props.products.productWidget = {}
    //   });
    this.props = props;
    this.state = {
      update :false,
      isBirthdayPopupVisble: false,
      isBirthdayModalShown: false,
      showPromotionModal: false,
      isLocationSuggestor: false
    }
    // trackEvent(SHOPPING_TAB_PRESS.eventCategory, SHOPPING_TAB_PRESS.events.NAVIGATE);
  }

  async componentDidMount() {
    this.props.auth.setShowFloat(true)
    this.isInternetConnected = await connectedToInternet();
    if(this.isInternetConnected) {
      this.callAPIS()
    }
    this.willFocusSubscription = this.props.navigation.addListener('willFocus', () => {
      this.setState({update: !this.state.update})
      this.props.products.refresh('widget')
    });
    this.props.auth.setNavigation(this.props.navigation)  
    // const coachmarksStatus = !!this.props.auth.showCoachmarks
    // if(coachmarksStatus) {
    //   await this.props.auth.handlePushNotification()
    // }

    this.focusListenerUnsubscribe = this.props.navigation.addListener(
      'focus', async() => {
        if(this.props.profile.defaultAddressCountryId) {
          await this.props.dashboard.fetchBanners(
            'screenTypes=[DASHBOARD,SHOPPING,SCHEMES]',
            this.props.profile.defaultAddressCountryId,
          );
        }
      },
    );
  }

  componentWillUnmount() {
    this.willFocusSubscription && this.willFocusSubscription.remove?.();
    this.focusListenerUnsubscribe?.();
  }

  onBrandPress = (title, param) => {
    const data = {
      brandId: param,
      name: title
    }
    this.props.navigation.navigate('storeFront', {data: data});
    // this.props.navigation.navigate('productList',{type:'brandStore', param:param, title:title});
  }

  onBrandViewAllPress = () => {
    this.props.navigation.navigate('brandStore');
  }

  @autobind
  async networkStatus(status) {
    if(status) {
      this.isInternetConnected = status;
      this.callAPIS();
    }
  }

  // async callAPIS(){
  //   this.isLoading = true;
  //   // this.props.products.productWidget = {}
  //   // await this.props.profile.fetch();   // To fetch the profile data
  //   // this.props.dashboard.fetchBanners('screenTypes=[SHOPPING,DASHBOARD]');
  //   // this.props.dashboard.fetchCategoryList(); 
  //   // this.props.dashboard.fetchBrandList();
  //   // this.props.products.fetchProductWidget('shopByPv','0-25');
  //   const isGuestUser = this.props.auth.userRole === UserRole.GuestUser
  //   if(isGuestUser) {
  //     this.props.dashboard.fetchDashboardShoppingData()
  //   }
  //   this.props.products.fetchProductWidget('isNewLaunch');
  //   this.props.products.fetchProductWidget('isSponsored');
  //   this.isLoading = false;

  //   const [mostViewed, topSelling] = await Promise.all([
  //     this.props.products.fetchProductWidgetStoreFront('mostViewed', ''),
  //     this.props.products.fetchProductWidgetStoreFront('topSelling', '')
  //   ])
  //   // this.mostViewed = await this.props.products.fetchProductWidgetStoreFront('mostViewed', ''); 
  //   // this.topSelling = await this.props.products.fetchProductWidgetStoreFront('topSelling', ''); 
  //   this.mostViewed = mostViewed;
  //   this.topSelling = topSelling;
  //   // this.props.wishList.fetchWishList('update');
  //   // this.props.cart.fetchCart();
  //   this.props.dashboard.getBirthdayList()
  // }

  async callAPIS(){
    // await this.props.dashboard.fetchDashboardShoppingData()
    // this.props.cart.updateShopForObject('Self', this.props.auth.distributorID.toString());
    // this.isLoading = true;
    // this.props.products.productWidget = {}
    // await this.props.profile.fetch();   // To fetch the profile data
    // this.props.dashboard.fetchBanners('screenTypes=[SHOPPING,DASHBOARD]');
    // this.props.dashboard.fetchCategoryList(); 
    // this.props.dashboard.fetchBrandList();
    // this.props.products.fetchProductWidget('shopByPv','0-25');
    this.props.products.fetchProductWidget('isNewLaunch');
    this.props.products.fetchProductWidget('isSponsored');
    // this.isLoading = false;
    const [mostViewed, topSelling] = await Promise.all([
      this.props.products.fetchProductWidgetStoreFront('mostViewed', ''),
      this.props.products.fetchProductWidgetStoreFront('topSelling', '')
    ])
    this.mostViewed = mostViewed;
    this.topSelling = topSelling;
    // this.props.wishList.fetchWishList('update');
    // this.props.cart.fetchCart();
    // this.props.dashboard.getBirthdayList()
  }



  @autobind
  showToast(message: string, toastType:Toast.type) {
    // Add a Toast on screen.
    Toast.show(message, {
      duration: Toast.durations.SHORT,
      type: toastType,
      shadow: false,
      animation: true,
      hideOnPress: true,
      delay: 0,
    })
  }

  // onPressRepeatLastOrder = async() => {
  //   const res = await this.props.cart.repeatLastPurchase()
  //   if (res.success) {
  //     AlertClass.showAlert(strings.generalQueries.messageAlertTitle, strings.order.orderDetails.orderAddedToCart,
  //       [{text: strings.commonMessages.no, onPress: () => console.log('No Pressed')}, 
  //         {text: strings.commonMessages.yes,  onPress: () => {
  //           this.props.navigation.navigate('MyCart')
  //         } }]
  //     )
  //   }
  //   else {
  //     showToast(res.message)
  //   }
  // }

  // isIphoneXorAbove = () => {
  //   return (
  //     Platform.OS === 'ios' &&
  //     !Platform.isPad &&
  //     !Platform.isTVOS &&
  //     ((height === 812 || width === 812) || (height === 896 || width === 896))
  //   );
  // }

  // showBirthdayList = async() => {
  //   const { birthdayList, promotionPopup } = this.props.dashboard;
  //   const isGuestUser = this.props.auth.userRole === UserRole.GuestUser
  //   const isBirthdayModalShown = await AsyncStore.get(IS_BIRTHDAY_POPUP_VISIBLE);
  //   // console.log(isBirthdayModalShown)
  //   if(birthdayList && birthdayList.length  && !this.state.isBirthdayModalShown && !isGuestUser && isBirthdayModalShown!= 'true'){
  //     this.setState({ isBirthdayPopupVisble: true, isBirthdayModalShown: true })
  //     await AsyncStore.set(IS_BIRTHDAY_POPUP_VISIBLE, 'true');
  //   }
  //   if(promotionPopup && promotionPopup.length && birthdayList && birthdayList.length === 0 && !isGuestUser ) {
  //     this.setState({ showPromotionModal: true })
  //   }
  // }

  // nearbyStores = () => {
  //   if(this.props.products.showChangeAddressPrompt && !this.props.products.isChangeAddressPromptVisible) {
  //     this.props.products.isChangeAddressPromptVisible = true
  //     this.getGeoLocation()
  //   }
  // }

  getGeoLocation = async () => {
    const permissionType =
      Platform.OS === 'android'
        ? Permissions.PERMISSION_TYPES.android.LOCATION
        : Permissions.PERMISSION_TYPES.ios.LOCATION;
    const response = await Permissions.requestPermission(permissionType);
    if (response === Permissions.StatusEnum.GRANTED) {
      Geolocation.getCurrentPosition(
        async (position) => {
          // this.latitude = position.coords.latitude,
          // this.longitude = position.coords.longitude,
          this.detectLocation(position.coords.latitude, position.coords.longitude);
        },
        () => {
          // this.showToast(strings.errorMessage.location.enableLocation,Toast.type.ERROR)
        },
      );
    } else if (response === Permissions.StatusEnum.BLOCKED) {
      promptToOpenSettings(
        strings.errorMessage.location.locationPermission1,
        strings.errorMessage.location.locationPermission2,
      );
    }
  }

  detectLocation = async(lat, lon) => {
    const status = await this.props.location.autoDetectStoreLocation(lat, lon);
    if(!status) {
      Alert.alert(strings.errorMessage.location.noStorePickupAvailable1,
        strings.errorMessage.location.noStorePickupAvailable2,
        [
          {
            text: strings.commonMessages.cancel, style: 'cancel'
          }
        ]
      );
    }
    else {
      this.setState({ isLocationSuggestor: true })
    }
  }

  selectStorePickup = async(item) => {
    const selectStore = {
      distributorId: this.props.auth.distributorID,
      address1: item.address,
      pincode: {
        pincode: item.pincode
      },
      cityId: item.cityId,
      stateId: item.stateId,
      countryId: item.countryId,
      locationId: item.locationId,
      locationCode: item.locationCode,
      locationName: item.locationName,
      timings : item.timings,
      distance: item.distance,
      isOnlinePayment: item.isOnlinePayment,
    }
    const status = await this.props.profile.updateLoaction(selectStore, 'store')
    if(status){
      this.showToast(strings.errorMessage.location.locationSave, Toast.type.SUCCESS);
      this.props.dashboard.onAddressChange()
      this.setState({ isLocationSuggestor: false })
    }
    else {
      this.showToast(this.props.profile.addressSaveError, Toast.type.ERROR)
    }    
  }


  // renderCoachMarks() {
  //   const CM = [];
  //   CM.push({
  //     tooltip: strings.coachMarksInformation.menuTooltipTitle,
  //     position: {
  //       top: Platform.select({ios: this.isIphoneXorAbove() ? 42 : 17, android: 5}),
  //       left:  3,
  //     },
  //     tooltipPosition: {
  //       width: 350,
  //       height: 120,
  //       top: this.isIphoneXorAbove() ? 130 : 110,
  //       left: (width - 350) / 2,
  //     },
  //     style: {
  //       width: 50,
  //       height: 50,
  //     },
  //   },{
  //     tooltip: strings.coachMarksInformation.notificationsTooltipTitle,
  //     position: {
  //       top: Platform.select({ios: this.isIphoneXorAbove() ? 45 : 20, android: 5}),
  //       left: width -44,
  //     },
  //     tooltipPosition: {
  //       width: 350,
  //       height: 150,
  //       top: this.isIphoneXorAbove() ? 130 : 110,
  //       left: (width - 350) / 2,
  //     },
  //     style: {
  //       width: 40,
  //       height: 40,
  //     },
  //   },{
  //     icon: SHOPPING_ICON,
  //     tooltip: strings.coachMarksInformation.shoppingTooltipTitle,
  //     description: strings.coachMarksInformation.shoppingTabInfo.firstPoint+'\n'+ strings.coachMarksInformation.shoppingTabInfo.secondPoint+'\n'+ strings.coachMarksInformation.shoppingTabInfo.thirdPoint +'\n'+ strings.coachMarksInformation.shoppingTabInfo.fourthPoint,
  //     position: {
  //       top: height - Platform.select({ios: this.isIphoneXorAbove() ? 80 : 60, android: 80}),
  //       left: width - (width - 2),
  //     },
  //     tooltipPosition: {
  //       width: 350,
  //       left: (width - 350) / 2,
  //     },
  //     style: {
  //       width: width - 4,
  //       height: 60,
  //     },
  //   },
  //   {
  //     icon: DASHBOARD_ICON,
  //     tooltip: strings.coachMarksInformation.dashboardTooltipTitle,
  //     description: strings.coachMarksInformation.dashBoardDescriptionInfo.firstPoint +'\n'+ strings.coachMarksInformation.dashBoardDescriptionInfo.secondPoint +'\n'+ strings.coachMarksInformation.dashBoardDescriptionInfo.thirdPoint +'\n'+ strings.coachMarksInformation.dashBoardDescriptionInfo.fourthPoint +'\n'+ strings.coachMarksInformation.dashBoardDescriptionInfo.fifthPoint,
  //     position: {
  //       top: height - Platform.select({ios: this.isIphoneXorAbove() ? 80 : 60, android: 80}),
  //       left: width - (width - 2),
  //     },
  //     tooltipPosition: {
  //       width: 350,
  //       left: (width - 350) / 2,
  //     },
  //     style: {
  //       width: width - 4,
  //       height: 60,
  //     },
  //   },
  //   {
  //     icon: SEARCH_ICON,
  //     tooltip: strings.coachMarksInformation.searchAnItemTitle,
  //     description: strings.coachMarksInformation.searchTabInfo.firstPoint+'\n'+ strings.coachMarksInformation.searchTabInfo.secondPoint +'\n'+ strings.coachMarksInformation.searchTabInfo.thirdPoint,
  //     position: {
  //       top: height - Platform.select({ios: this.isIphoneXorAbove() ? 80 : 60, android: 80}),
  //       left: width - (width - 2),
  //     },
  //     tooltipPosition: {
  //       width: 350,
  //       left: (width - 350) / 2,
  //     },
  //     style: {
  //       width: width - 4,
  //       height: 60,
  //     },
  //   },{
  //     icon: WISHLIST_ICON,
  //     tooltip: strings.coachMarksInformation.wishlistTitle,
  //     description: strings.coachMarksInformation.wishListDescription,
  //     position: {
  //       top: height - Platform.select({ios: this.isIphoneXorAbove() ? 80 : 60, android: 80}),
  //       left: width - (width - 2),
  //     },
  //     tooltipPosition: {
  //       width: 350,
  //       left: (width - 350) / 2,
  //     },
  //     style: {
  //       width: width - 4,
  //       height: 60,
  //     },
  //   },{
  //     icon: MYCART_ICON,
  //     tooltip: strings.coachMarksInformation.yourCartTitle,
  //     description: strings.coachMarksInformation.yourCartTabInfo.firstPoint +'\n'+ strings.coachMarksInformation.yourCartTabInfo.secondPoint +'\n'+  strings.coachMarksInformation.yourCartTabInfo.thirdPoint,
  //     position: {
  //       top: height - Platform.select({ios: this.isIphoneXorAbove() ? 80 : 60, android: 80}),
  //       left: width - (width - 2),
  //     },
  //     tooltipPosition: {
  //       width: 350,
  //       left: (width - 350) / 2,
  //     },
  //     style: {
  //       width: width - 4,
  //       height: 60,
  //     },
  //   },
  //   );
  //   return (
  //     <CoachMarks
  //       numberOfSteps={CM.length}
  //       coachMarks={CM}
  //       congratsText={'Welcome to Vestige.\nWe will guide you to use the app.'}
  //       visible
  //       onClose={async() => {
  //         await this.props.auth.handlePushNotification()
  //         this.showBirthdayList()
  //         this.nearbyStores()
  //         this.props.auth.isCoachMarksShown = true
  //       }}
  //     />
  //   )
  // }

  getUserPointView = () => {
    const profileImage = this.props.profile.profileImageSource ? {uri:this.props.profile.profileImageSource} : PROFILE_IMAGE;
    const username = this.props.auth.username || this.props.profile.username;
    const currentPosition = this.props.profile.currentPosition;
    const { selfPointValue } = this.props.profile
    return (
      <TouchableOpacity
        onPress={() => this.props.navigation.navigate('Dashboard')}
        activeOpacity={0.5}
        // style={{ backgroundColor: '#fff', flexDirection: 'row', marginTop: 10, paddingVertical: 10, flex: 1, paddingHorizontal: 15, justifyContent: 'space-between'}}
      >
        {/* <Banner
          styles={styles.profileImage}View
          source={profileImage}
          resizeMode='contain'
          imageType='Profile'
        /> */}
        <LinearGradient 
          style={{ flexDirection: 'row', marginTop: 10, paddingVertical: 8, flex: 1, paddingHorizontal: 15, justifyContent: 'space-between'}}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          colors={['#6C94D5', '#668ECF', '#3054C4']}
        >
          <View style={{ flex: 0.8 }}>
            <Text numberOfLines={2} style={[styles.nameText]}>{username}</Text>
            <Text style={styles.currentPositionText}>{currentPosition}</Text>
          </View>
          <View style={{ flexDirection: 'row', flex: 0.2, justifyContent: 'flex-end' }}>
            <View style={{ marginRight: 14, alignItems: 'center' }}>
              <Text style={styles.nameText}>MY PV</Text>
              <Text style={{ ...styles.currentPositionText, marginBottom:6 }}>{selfPointValue}</Text>
            </View>
            <Icon
              name="ios-arrow-forward"
              type="ionicon"
              color="#fff"
              size={24}
              iconStyle={{ marginLeft: 3, marginTop: 4 }}
            />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    )
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

  renderHeaderNotificationIcon = () => {
    return (
      <HeaderRightIcons
        notification
        navigation={this.props.navigation}
      />
    )
  }

  render() {
    const { navigation, dashboard, products, cart } = this.props;
    const { isLoading, categoryList, brandListForDashdoard, banners, shoppingScreenBanners, promotionPopup } = dashboard;
    const { getSelfCartProductsList } = cart
    const { isBirthdayPopupVisble, showPromotionModal, isLocationSuggestor  } = this.state;
    // const coachmarksStatus = !!this.props.auth.showCoachmarks || this.props.auth.isCoachMarksShown
    const { storeListData } = this.props.location;
    const isGuestUser = this.props.auth.userRole === UserRole.GuestUser;
    const showlocationFlag = this.props.profile.countryId == 1 ? true : this.props.profile.location_update;
    // if(coachmarksStatus && !isGuestUser) {
    //   this.showBirthdayList()
    //   this.nearbyStores()
    // }

    return (
      <View style={styles.mainView}>
        { !this.isInternetConnected && <OfflineNotice networkStatus={(status) => this.networkStatus(status)} /> }
        <Loader loading={this.props.dashboard.isLoading} />
        <Header
          navigation={navigation}
          hideBack
          showDrawer
          middleComponent={this.renderHeaderShopFor()}
          rightComponent={this.renderHeaderNotificationIcon()}
        />
        {/* <BirthdayListModal
          isVisible={isBirthdayPopupVisble}
          closeBirthdayPopup={()=>{
            this.setState({ isBirthdayPopupVisble: false }, ()=> {
              if(promotionPopup && promotionPopup.length) {
                setTimeout(() => this.setState({ showPromotionModal: true }), 2000 )
              }
            }) 
          }}
        /> */}
        {/* <PromotionModal 
          showPromotionModal={showPromotionModal} 
          onPressCloseIcon={()=> this.setState({ showPromotionModal: false })} 
          promotionItem={promotionPopup && promotionPopup[0]}
          navigation={navigation}
        /> */}
        {/* <StoreLocationSuggestor 
          isVisible={isLocationSuggestor}
          closeStoreLocationSuggestor={()=> this.setState({ isLocationSuggestor: false })}
          nearbyStoreList={storeListData}
          selectStorePickup={(item)=> this.selectStorePickup(item)}
        /> */}
        {(showlocationFlag == true) && <LocationHeader navigation={this.props.navigation} /> }

        <ScrollView keyboardShouldPersistTaps='always' style={!isGuestUser ? {marginBottom:10} : null}>
          { shoppingScreenBanners && shoppingScreenBanners.length > 0 &&  <BannerView countryId={this.props.profile.defaultAddressCountryId} navigation={navigation} bannerData={shoppingScreenBanners} />}
          { categoryList.length > 0 && <Category title={strings.shoppingHomeScreen.title.category} type={CategoryTypeEnum.CategoryStoreFront} navigation={navigation} data={categoryList} /> }
          {!isGuestUser && this.getUserPointView()}
          {/* {
            !isGuestUser && shoppingScreenBanners && shoppingScreenBanners.length>0 && (
              <TouchableOpacity
                style={styles.buttonView}
                accessibilityLabel="Repeat_Last_Order"
                testID="Repeat_Last_Order"
                onPress={() => {
                  AlertClass.showAlert(strings.order.orderDetails.repeatAlertHeading, 
                    strings.shoppingHomeScreen.repeatOrderMessage, 
                    [{text: strings.commonMessages.no, onPress: () => console.log('No Pressed')}, 
                      {text: strings.commonMessages.yes,  onPress: () => this.onPressRepeatLastOrder()}])
                }}
              >
                <Text style={styles.textStyle}>Repeat your Last Purchase</Text>
              </TouchableOpacity>
            )
          } */}
          { this.props.profile.isBrandsShow && brandListForDashdoard.length > 0 && <Brands data={brandListForDashdoard} onBrandViewAllPress={this.onBrandViewAllPress} onBrandPress={this.onBrandPress} accessibilityLabel='Shopping_View_More' /> }
          { products.productWidget.shopByPv && this.props.profile.activeAddress.addressType && <ShopByPv title={strings.shoppingHomeScreen.title.pv} navigation={navigation} /> }     
          { products.productWidget.isNewLaunch && products.productWidget.isNewLaunch.length > 0 && <SidescrollComponent title={strings.shoppingHomeScreen.title.new} navigation={navigation} item={products.productWidget.isNewLaunch} /> }
          { products.productWidget.isSponsored && products.productWidget.isSponsored.length > 0 && <SidescrollComponent title={strings.shoppingHomeScreen.title.sponsor} navigation={navigation} item={products.productWidget.isSponsored} /> }
          { this.mostViewed && this.mostViewed.length > 0 && <SidescrollComponent title={`${strings.storeFront.title.mostlyViewed}`} navigation={navigation} item={this.mostViewed} /> }
          { this.topSelling && this.topSelling.length > 0 && <SidescrollComponent title={`${strings.storeFront.title.topSelling}`} navigation={navigation} item={this.topSelling} /> }
          { products.recentlyViewed && products.recentlyViewed.length > 0 && <SidescrollComponent title={strings.shoppingHomeScreen.title.recentView} navigation={navigation} item={products.recentlyViewedProducts} update={this.state.update} /> }
          { getSelfCartProductsList &&  getSelfCartProductsList.length > 0 && <SidescrollComponent title={strings.shoppingHomeScreen.title.inCart} navigation={navigation} item={getSelfCartProductsList} update={this.state.update} type reduceHeight /> }
          {
            (shoppingScreenBanners?.length > 0 && products.isProductCatalogueActive) && (
              <View style={styles.registrationView}>
                <TouchableOpacity
                  style={styles.buttonView}
                  onPress={() => {
                    const shareData = {
                      failOnCancel: false,
                      // url: 'https://www.myvestige.com/Images/DownloadPdfFile/Product-Catalogue-India-English.pdf',
                      // url: 'https://www.myvestige.com/Images/DownloadPdfFile/Product-Catalogue-India2Aug20-English.pdf',
                      url: products.productCatalogue,
                      title: 'Share Product Catalogue!',
                    }
                    Share.open(shareData);
                  }}
                >
                  <Text style={styles.textStyle}>Share Product Catalogue with your friends</Text>
                  <Image
                    source={SHARE_IMAGE}
                    style={styles.shareIcon}
                    resizeMode='contain'
                  />
                </TouchableOpacity>
              </View>
            )
          }
        </ScrollView>
        {/* {!coachmarksStatus && this.renderCoachMarks() }  */}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  mainView: {
    flex:1
  },
  shareIcon: {
    height:20, 
    width:20, 
    marginLeft: 10,
    tintColor: '#ffffffd6'
  },
  registrationView: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonView: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#1b9c81',
    borderRadius: 50,
    paddingHorizontal: 20,
    marginTop: 14,
    marginBottom: 10,
    height: 48,
    justifyContent: 'center',
  },
  textStyle: {
    ...Specs.fontBold,
    color: 'white', 
    fontSize: 12,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginLeft: 18,
    marginRight: 30,
  },
  currentPositionText: {
    ...Specs.fontSemibold,
    fontSize: 12,
    // textAlign: 'center',
    // alignSelf: 'center',
    color: '#fff',
  },
  nameText: {
    ...Specs.fontSemibold,
    fontSize: 16,
    color: '#fff', 
    marginTop: 7,
  },
  textView: {
    // flex: 1,
    // marginTop: 15,
    // alignItems: 'center',
  }
});