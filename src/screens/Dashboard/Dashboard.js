import React, { Component } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Platform,
  Dimensions,
  RefreshControl,
  TouchableWithoutFeedback,
  Image,
  Linking,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  Modal,
  Alert,
} from 'react-native';
import { inject, observer } from 'mobx-react';
import { observable, action, runInAction, makeObservable } from 'mobx';
import autobind from 'autobind-decorator';
import Geolocation from '@react-native-community/geolocation';
import CoachMarks from 'app/src/components/coachmarks/CoachMarks';
import * as Permissions from '../../utility/permissions/Permissions';
import moment from 'moment';
import DeviceInfo from 'react-native-device-info';

// Navigation Icons
import HeaderLeftIcons from 'app/src/components/navigation/HeaderLeftIcons';
import HeaderRightIcons from 'app/src/components/navigation/HeaderRightIcons';
import SidescrollComponent from 'app/src/components/sidescrollComponent/SidescrollComponent';

import {
  WinnerEnum,
  CategoryTypeEnum,
  OfferTypeEnum,
  SIGNUP_ROUTE,
  UserRole,
} from 'app/src/utility/constant/Constants';
import UserProfile from 'app/src/components/dashBoard/UserProfile';
import BannerView from 'app/src/components/dashBoard/BannerView';
import WinnersView from 'app/src/components/dashBoard/WinnersView';
import VideoLiveFeed from 'app/src/components/dashBoard/VideoLiveFeed';
import Loader from 'app/src/components/loader/Loader';
import { strings } from 'app/src/utility/localization/Localized';
import Brands from 'app/src/screens/Dashboard/Brands';
import DemoVideo from 'app/src/screens/Dashboard/DemoVideo';
import Category from 'app/src/screens/Dashboard/Category';
import ShopByPv from 'app/src/screens/Dashboard/Shopbypv';
import ShopByCnc from 'app/src/screens/Dashboard/Shopbycnc';
import ReviewRating from 'app/src/screens/Dashboard/ReviewRating';
import LocationHeader from 'app/src/components/locationHeader/LocationHeader';
import * as AsyncStore from 'app/src/utility/AsyncStoragesUtils';
import { Toast } from 'app/src/components/toast/Toast';
import OfflineNotice from 'app/src/components/OfflineNotice';
import getPopupModalViewForWinnerDetail from './WinnerDetail';
import SuccessStories from './SuccessStories';
import DistributorFeedback from './components/DistributorFeedback';
import BirthdayListModal from './BirthdayListModal';
import InfoPopUpModal from './InfoPopUpModal';
import { Header } from '../../components';
import { COLOR_CODES } from '../../utility/Theme';
import {
  promptToOpenSettings,
  connectedToInternet,
  showToast,
  isNullOrEmpty,
} from '../../utility/Utility';
// import { trackEvent } from 'app/src/utility/AnalyticsUtils';
// import {
//   NEW_MEMBER_REGISTRATION_BUTTON_PRESS,
//   VIEW_ALL_BRANDS_BUTTON_PRESS,
//   INDIVIDUAL_BRAND_PRESSED,
//   VBD_BANNER_PRESSED,
// } from 'app/src/utility/GAEventConstants';
import YoutubeListView from './components/youtubeListView';
import V20Model from '../../components/v20/V20Model';
import V20EventModel from '../../components/v20/V20EventModel';
import V20EventModelRegistration from '../../components/v20/V20EventModelRegistration';
import SurveyModal from './components/SurveyModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BenifitB2BModal from '../../components/dashBoard/BenifitB2BModal';
import SurveyModelDetails from './components/SurveyModelDetails';
// import StoreLocationSuggestor from './StoreLocationSuggestor';
// import { truncate } from 'lodash';
// import failureScreen from 'app/src/utility/FailureScreen';
// import Funds from 'app/src/utility/Funds';
// import Testimonial from 'app/src/components/dashBoard/Testimonial';
// import Banner from 'app/src/screens/Dashboard/Banner';
// import PromotionModal from './PromotionModal';
// import VideoPlayer from './VideoPlayer';

const { width, height } = Dimensions.get('window');

const CONSISTENCY_IMAGE = require('app/src/assets/images/drawer/consistency.png');
const FUNDS_IMAGE = require('app/src/assets/images/drawer/funds.png');
const GROUPPV_IMAGE = require('app/src/assets/images/drawer/grouppv.png');
const NETWORK_IMAGE = require('app/src/assets/images/drawer/network.png');
const VOUCHER_IMAGE = require('app/src/assets/images/drawer/voucher.png');
const BOUNS_IMAGE = require('app/src/assets/images/drawer/bouns.png');
const TRAINING_IMAGE = require('app/src/assets/images/drawer/training.png');
const ORDERS_IMAGE = require('app/src/assets/images/drawer/shopping.png');

const DASHBOARD_ICON = require('app/src/assets/images/tabIcons/dashboard_active_icon.png');
const SHOPPING_ICON = require('app/src/assets/images/tabIcons/shopping_active_icon.png');
const SEARCH_ICON = require('app/src/assets/images/tabIcons/search_active_icon.png');
const WISHLIST_ICON = require('app/src/assets/images/tabIcons/wishlist_active_icon.png');
const MYCART_ICON = require('app/src/assets/images/tabIcons/cart_active_icon.png');

const VICTOR_ICON = require('app/src/assets/images/victor/victor.png');

const VBD_BANNER = require('app/src/assets/images/Banner/VBD-sponsored.png');


const SIDEMENUDATA = AsyncStore.addPrefix('SideMenuData');
const COUNTRY_ID = AsyncStore.addPrefix('country-id');
const BASE_LOCATION_ID = AsyncStore.addPrefix('location-id');
const LAST_BIRTHDAY_SHOWN = AsyncStore.addPrefix('birthdayShownDate');

// const PROMOTION_OFFER = require('app/src/assets/images/promotionOffer.jpg');
// const VBDANDROIDAPPURL = 'https://play.google.com/store/apps/details?id=com.myvestige.vestigedeal';
// const VBDIOSAPPURL = 'https://itunes.apple.com/in/app/best-deals-vestige/id1191411032?mt=8';

const OFFERLIST = [
  {
    name: OfferTypeEnum.DynamicScreen,
    avatar: ORDERS_IMAGE,
  },
  {
    name: OfferTypeEnum.Orders,
    avatar: ORDERS_IMAGE,
  },
  // {
  //   name: OfferTypeEnum.RepeatOrder,
  //   avatar: ORDERS_IMAGE,
  // },
  {
    name: OfferTypeEnum.OrderLog,
    avatar: ORDERS_IMAGE,
  },
  // {
  //   name: OfferTypeEnum.MyConsistency,
  //   avatar: CONSISTENCY_IMAGE,
  // },
  {
    name: OfferTypeEnum.MyConsistency,
    avatar: CONSISTENCY_IMAGE,
  },
  {
    name: OfferTypeEnum.MyFund,
    avatar: FUNDS_IMAGE,
  },
  {
    name: OfferTypeEnum.MyGroupPV,
    avatar: GROUPPV_IMAGE,
  },
  {
    name: OfferTypeEnum.MyNetwork,
    avatar: NETWORK_IMAGE,
  },
  {
    name: OfferTypeEnum.MyVoucher,
    avatar: VOUCHER_IMAGE,
  },
  {
    name: OfferTypeEnum.MyBonus,
    avatar: BOUNS_IMAGE,
  },
  {
    name: OfferTypeEnum.MyTraining,
    avatar: TRAINING_IMAGE,
  },
];

const THRESHOLD = 100;

@inject(
  'dashboard',
  'profile',
  'auth',
  'products',
  'location',
  'cart',
  'appConfiguration',
  'B2CFlow'
)
@observer
class Dashboard extends Component {
  @observable videoPlayOrPause: any;
  // @observable isChangeAddressPromptVisible;
  // @observable isInternetConnected: Boolean = true;
  @observable position = {
    start: null,
    end: null,
  };
  @observable winnersList;
  @observable winnersLength = 20;
  @observable latitude;
  @observable longitude;
  @observable coachmarksStatus = !!this.props.auth.showCoachmarks;
  // @observable showFailureScreen = false;

  @action setWinnersList = value => (this.winnersList = value);

  constructor(props) {
    super(props);
    makeObservable(this);
    this.props = props;
    this.state = {
      showV20:false,
      showV20Event:false,
      showV20EventRegistation:false,
      eventDays:"",
      showWinner: false,
      winnerType: WinnerEnum.CarWinner,
      vestigeDemo: false,
      refreshing: false,
      pauseMyVideo: true,
      showAuthModal: true,
      // showPromotionModal: false,
      // isPromotionModalShown: false,
      isBirthdayModalShown: false,
      isLocationSuggestor: false,
      isLoadingStatic: true,
      isLoading: false,
      isB2BModalShow:false
      // isChangeAddressPromptVisible: false,
    };
    this.props.auth.setShowSkip(false);
    this.isInternetConnected = true;
  }

  @autobind
  showToast(message: string, toastType: Toast.type) {
    // Add a Toast on screen.
    Toast.show(message, {
      duration: Toast.durations.SHORT,
      type: toastType,
      shadow: false,
      animation: true,
      hideOnPress: true,
      delay: 0,
    });
  }

  componentWillUnmount() {
    this.linkingSubscription?.remove();
    this.blurListenerUnsubscribe?.();
    this.focusListenerUnsubscribe?.();
  }

  handleOpenURL = event => {
    console.log('eventevent' + event.url);
    // alert("testingtesting");
    // this.navigate(event.url);
  };

  async componentDidMount() {
    if (Platform.OS === 'ios') {
      const url = await Linking.getInitialURL();
      //alert(url);
    }
    // if (Platform.OS === 'android') {
    //   await Linking.getInitialURL().then(async url => {
    //     // alert("url"+url)
    //   });
    // }
    // alert(JSON.stringify(await AsyncStore.get('dis_level_id')))
    this.getV20EventDate();
    this.props.dashboard.getSurveyFormDetails()
    
    this.linkingSubscription = Linking.addEventListener(
      'url',
      this.handleOpenURL,
    );
    const loc = await AsyncStore.get(BASE_LOCATION_ID);
    this.props.profile.baseLocationId = isNullOrEmpty(loc) ? 10 : loc;
    this.configeForNepal();
    this.isInternetConnected = await connectedToInternet();
    if (this.isInternetConnected) {
      await this.props.dashboard.fetchDashboardData();
      this.handleMultiplePopUp();
      this.props.cart.updateShopForObject(
        'Self',
        this.props.auth.distributorID.toString(),
        'SELF',
      );
      this.dynamicAlert(this.props.profile.dynamicAlert);
    }
    this.blurListenerUnsubscribe = this.props.navigation.addListener(
      'blur',
      () => {
        this.setState({ pauseMyVideo: true });
      },
    );

    this.focusListenerUnsubscribe = this.props.navigation.addListener(
      'focus', async () => {
        this.props.products.refresh('widget');
        if(this.props.profile.defaultAddressCountryId)  {
          await this.props.dashboard.fetchBanners(
            'screenTypes=[DASHBOARD,SHOPPING,SCHEMES]',
            this.props.profile.defaultAddressCountryId,
          );
        }
      },
    );
    // this.props.dashboard.promotionPopup && setTimeout(() => this.setState({ showPromotionModal: true }), 1000 )
    this.props.auth.setNavigation(this.props.navigation);
    const coachmarksStatus = !!this.props.auth.showCoachmarks;
    if (coachmarksStatus || Platform.OS === 'ios') {
      await this.props.auth.handlePushNotification();
      this.handleEmptyAddress();
    }
    setTimeout(() => {
      this.setState({ isLoadingStatic: false });
    }, 5000);

    if(this.props.auth.distributorType == 3 && this.props.profile.directorDistributorName!='HO'){
      AsyncStorage.getItem('lastOpenDate')
      .then((storedTimestamp) => {
        if (storedTimestamp) {
          const storedDate = new Date(parseInt(storedTimestamp, 10)).toDateString();
          const today = new Date().toDateString();
          if (storedDate !== today) {
            this.setState({isB2BModalShow:true})
            AsyncStorage.setItem('lastOpenDate', Date.now().toString());
          }
        } else {
            this.setState({isB2BModalShow:true})
          AsyncStorage.setItem('lastOpenDate', Date.now().toString());
        }
      })
      .catch((error) => console.error('Error retrieving data from AsyncStorage: ', error));
    }
     
   await  this.props.B2CFlow.getUserB2cUserList(this.props.auth.distributorID,2) 

  }

  handleMultiplePopUp = async () => {
    await this.props.dashboard.getBirthdayList();
    await this.props.dashboard.fetchInfoMessageUrl();
  };

  handleEmptyAddress = () => {
    if (!this.props.auth.isGuestUser) {
      const { defaultCater } = this.props.profile;
      if (
        isNullOrEmpty(defaultCater?.locationCode) ||
        isNullOrEmpty(defaultCater?.locationName)
      ) {
        showToast('Please save the address again', Toast.type.ERROR);
        // this.props.navigation.navigate('MyProfile');
        this.props.navigation.navigate('selectLocation');
      }
    }
  };

  async getV20EventDate(){          // Get today's date
       // Get the current date
       await this.props.profile.fetchv20Registerqualifier();
      const today = new Date().setHours(0, 0, 0, 0);
      console.log(`today==>: ${today}`);
      // Set the target date to June 2, 2024
      const targetDate = new Date('2024-06-02');
      console.log(`targetDate==>: ${targetDate}`);
      // Calculate the difference in milliseconds
      const differenceMs = targetDate - today;

      // Convert milliseconds to days
      const differenceDays = Math.floor(differenceMs / (1000 * 60 * 60 * 24));

              console.log(`Days until June 2, 2024: ${differenceDays}`);

       if(differenceDays>0 || differenceDays==0){
        this.setState({ showV20Event: true });
        this.setState({eventDays:differenceDays+""})

       }else{
        this.setState({eventDays:differenceDays+""})
       }

  }

  updatev20Registertion = async (item) => {
    const res = await this.props.profile.updatev20Registertion(item);
    if (res.success) {
      this.showToast('v20 registered successfully', Toast.type.SUCCESS);
    }
    else {
      this.showToast(res.message, Toast.type.ERROR);
    }
  }

  async configeForNepal() {
    try {
      const checkStore = await AsyncStore.get(SIDEMENUDATA);
      const localCountryId = await AsyncStore.get(COUNTRY_ID);
      let countryId = 1;
      if (!isNullOrEmpty(localCountryId)) {
        countryId = Number(localCountryId);
        this.props.profile.setCountryId(countryId);
      }
      if (isNullOrEmpty(checkStore) || checkStore.length <= 0) {
        await this.props.profile.getUserMenuConfig(countryId);
      } else {
        this.props.profile.setMenuConfigList(JSON.parse(checkStore));
        this.props.profile.menuCongifManageLocally(
          this.props.profile.menuConfigList,
        );
        let arr = [
          this.props.profile.depth_level,
          this.props.profile.repeat_order,
          this.props.profile.wishlist_icon,
          this.props.profile.add_new_distributor_visible,
          this.props.profile.location_update,
          this.props.profile.category_name,
          this.props.profile.category_visible,
          this.props.profile.shop_name,
          this.props.profile.shop_visible,
          this.props.profile.Instruction_visible,
          this.props.profile.video_flag,
          this.props.profile.frequently_bought_together_visible,
          this.props.profile.add_cart_visible,
          this.props.profile.notify_me_visible,
          this.props.profile.explore_vestige_visible,
        ];
        await this.props.profile.getFlagForPvNetworkForNepal(
          this.props.profile.menuConfigList,
        );
      }
    } catch {}
  }

  dynamicAlert = message => {
    if (message && message != '') {
      Alert.alert('Information', `${message}`, [
        {
          text: strings.commonMessages.ok,
          onPress: () => console.log('ok'),
        },
      ]);
    }
  };

  _onRefresh = async () => {
    await this.props.profile.getUserMenuConfig(this.props.profile.countryId);
    await this.props.dashboard.fetchDashboardData();
    this.dynamicAlert(this.props.profile.dynamicAlert);
    //  await this.props.dashboard.fetchReloadData();
  };

  onBrandPress = (title, param) => {
    // trackEvent(INDIVIDUAL_BRAND_PRESSED.eventCategory, `${'Brand Icon '}${title}${' pressed on Brand Store Front.'}`);
    // this.props.navigation.navigate('productList',{type:'brandStore', param:param, title:title});
    const data = {
      brandId: param,
      name: title,
    };
    this.props.navigation.navigate('storeFront', { data: data });
  };

  onBrandViewAllPress = () => {
    // trackEvent(VIEW_ALL_BRANDS_BUTTON_PRESS.eventCategory, VIEW_ALL_BRANDS_BUTTON_PRESS.events.NAVIGATE);
    this.props.navigation.navigate('brandStore');
  };

  onVestigeDemoPress = () => {
    // alert('from Dashboard')
    //   if(Platform.OS === 'ios'){
    //     YouTubeStandaloneIOS.playVideo('CJoKEVkv4Ug').then(() => console.log('Standalone Player Exited')).catch(errorMessage => console.error(errorMessage))
    //   }
    //   else{
    //     YouTubeStandaloneAndroid.playVideo({
    //       apiKey: YOUTUBE_KEY,        // Your YouTube Developer API Key
    //       videoId: 'CJoKEVkv4Ug',     // YouTube video ID
    //       autoplay: true,             // Autoplay the video
    //     })
    //       .then(() => console.log('Standalone Player Exited'))
    //       .catch(errorMessage => console.error(errorMessage))
    //   }
    // // Add a Toast on screen.
    // Toast.show('This is a message', {
    //   duration: Toast.durations.SHORT,
    //   position: Toast.positions.CENTER,
    //   type: Toast.type.ERROR,
    //   shadow: false,
    //   animation: true,
    //   hideOnPress: true,
    //   delay: 0,
    //   onShow: () => {
    //     // calls on toast\`s appear animation start
    //   },
    //   onShown: () => {
    //     // calls on toast\`s appear animation end.
    //   },
    //   onHide: () => {
    //     // calls on toast\`s hide animation start.
    //   },
    //   onHidden: () => {
    //     // calls on toast\`s hide animation end.
    //   }
    // });
  };

  winnerHandler = async (type: WinnerEnum) => {
    // this.videoPlayOrPause.pause();
    // switch(type) {
    //   case WinnerEnum.CarWinner: {
    //     this.props.dashboard.winners = Funds.carFunds;
    //     this.winnersList =  Funds.carFunds.slice(0 , 20)
    //     break;
    //   }
    //   case WinnerEnum.HomeWinner: {
    //     this.props.dashboard.winners = Funds.houseFunds;
    //     this.winnersList =  Funds.houseFunds.slice(0 , 20)
    //     break;
    //   }
    //   default:
    //     this.props.dashboard.winners = Funds.travelFunds;
    //     this.winnersList =  Funds.travelFunds.slice(0 , 20)
    // }
    this.setState({ isLoading: true });
    this.setWinnersList([]);
    const res = await this.props.dashboard.fetchWinners(type);
    if (res.success) {
      this.setWinnersList(res.data);
      this.setState({
        isLoading: false,
        showWinner: true,
        winnerType: type,
      });
    } else {
      const errorMessage =
        res.message && res.message != '' ? res.message : 'No records found';
      Alert.alert(strings.faqScreen.errorAlertTitle, errorMessage, [
        {
          text: strings.commonMessages.ok,
          onPress: () => this.setState({ isLoading: false }),
        },
      ]);
    }
  };

  newMemberClickedHandle = () => {
    const { isGuestUser } = this.props.auth;
    this.props.auth.setSignupRoutePath(
      isGuestUser ? SIGNUP_ROUTE.LOGIN_ROUTE : SIGNUP_ROUTE.DASHBOARD_ROUTE,
    );
    // trackEvent(NEW_MEMBER_REGISTRATION_BUTTON_PRESS.eventCategory, NEW_MEMBER_REGISTRATION_BUTTON_PRESS.events.NAVIGATE);
    this.props.navigation.navigate('downlineRegistration');
  };

  handleVideoLayout = e => {
    this.position.start = e.nativeEvent.layout.y - height + THRESHOLD;
    this.position.end =
      e.nativeEvent.layout.y + e.nativeEvent.layout.height - THRESHOLD;
  };

  handleScroll = e => {
    const scrollPosition = e.nativeEvent.contentOffset.y;
    // const paused = this.state.paused;
    const { start, end } = this.position;
    if (scrollPosition > end || scrollPosition < start) {
      this.setState({ pauseMyVideo: true });
    }
    // if (scrollPosition > start && scrollPosition < end ) {
    //   // this.videoPlayOrPause.play();
    //   // this.setState({pauseMyVideo: false})
    // }
    // else if ((scrollPosition > end || scrollPosition < start)) {
    //   // this.videoPlayOrPause.pause();
    //   this.setState({pauseMyVideo: true})
    // }
  };

  isIphoneXorAbove = () => {
    return Platform.OS === 'ios' && DeviceInfo.hasNotch();
  };

  renderCoachMarks() {
    const CM = [];
    CM.push(
      {
        tooltip: strings.coachMarksInformation.menuTooltipTitle,
        position: {
          top: Platform.select({
            ios: this.isIphoneXorAbove() ? 42 : 17,
            android: 5,
          }),
          left: 3,
        },
        tooltipPosition: {
          width: 350,
          height: 120,
          top: this.isIphoneXorAbove() ? 130 : 110,
          left: (width - 350) / 2,
        },
        style: {
          width: 50,
          height: 50,
        },
      },
      {
        tooltip: strings.coachMarksInformation.notificationsTooltipTitle,
        position: {
          top: Platform.select({
            ios: this.isIphoneXorAbove() ? 45 : 20,
            android: 5,
          }),
          left: width - 44,
        },
        tooltipPosition: {
          width: 350,
          height: 150,
          top: this.isIphoneXorAbove() ? 130 : 110,
          left: (width - 350) / 2,
        },
        style: {
          width: 40,
          height: 40,
        },
      },
      {
        icon: DASHBOARD_ICON,
        tooltip: strings.coachMarksInformation.dashboardTooltipTitle,
        description: `${strings.coachMarksInformation.dashBoardDescriptionInfo.firstPoint}\n${strings.coachMarksInformation.dashBoardDescriptionInfo.secondPoint}\n${strings.coachMarksInformation.dashBoardDescriptionInfo.thirdPoint}\n${strings.coachMarksInformation.dashBoardDescriptionInfo.fourthPoint}\n${strings.coachMarksInformation.dashBoardDescriptionInfo.fifthPoint}`,
        position: {
          top:
            height -
            Platform.select({
              ios: this.isIphoneXorAbove() ? 80 : 60,
              android: 80,
            }),
          left: width - (width - 2),
        },
        tooltipPosition: {
          width: 350,
          left: (width - 350) / 2,
        },
        style: {
          width: width - 4,
          height: 60,
        },
      },
      {
        icon: SHOPPING_ICON,
        tooltip: strings.coachMarksInformation.shoppingTooltipTitle,
        description: `${strings.coachMarksInformation.shoppingTabInfo.firstPoint}\n${strings.coachMarksInformation.shoppingTabInfo.secondPoint}\n${strings.coachMarksInformation.shoppingTabInfo.thirdPoint}\n${strings.coachMarksInformation.shoppingTabInfo.fourthPoint}`,
        position: {
          top:
            height -
            Platform.select({
              ios: this.isIphoneXorAbove() ? 80 : 60,
              android: 80,
            }),
          left: width - (width - 2),
        },
        tooltipPosition: {
          width: 350,
          left: (width - 350) / 2,
        },
        style: {
          width: width - 4,
          height: 60,
        },
      },
      {
        icon: SEARCH_ICON,
        tooltip: strings.coachMarksInformation.searchAnItemTitle,
        description: `${strings.coachMarksInformation.searchTabInfo.firstPoint}\n${strings.coachMarksInformation.searchTabInfo.secondPoint}\n${strings.coachMarksInformation.searchTabInfo.thirdPoint}`,
        position: {
          top:
            height -
            Platform.select({
              ios: this.isIphoneXorAbove() ? 80 : 60,
              android: 80,
            }),
          left: width - (width - 2),
        },
        tooltipPosition: {
          width: 350,
          left: (width - 350) / 2,
        },
        style: {
          width: width - 4,
          height: 60,
        },
      },
      {
        icon: WISHLIST_ICON,
        tooltip: strings.coachMarksInformation.wishlistTitle,
        description: strings.coachMarksInformation.wishListDescription,
        position: {
          top:
            height -
            Platform.select({
              ios: this.isIphoneXorAbove() ? 80 : 60,
              android: 80,
            }),
          left: width - (width - 2),
        },
        tooltipPosition: {
          width: 350,
          left: (width - 350) / 2,
        },
        style: {
          width: width - 4,
          height: 60,
        },
      },
      {
        icon: MYCART_ICON,
        tooltip: strings.coachMarksInformation.yourCartTitle,
        description: `${strings.coachMarksInformation.yourCartTabInfo.firstPoint}\n${strings.coachMarksInformation.yourCartTabInfo.secondPoint}\n${strings.coachMarksInformation.yourCartTabInfo.thirdPoint}`,
        position: {
          top:
            height -
            Platform.select({
              ios: this.isIphoneXorAbove() ? 80 : 60,
              android: 80,
            }),
          left: width - (width - 2),
        },
        tooltipPosition: {
          width: 350,
          left: (width - 350) / 2,
        },
        style: {
          width: width - 4,
          height: 60,
        },
      },
    );
    return (
      <CoachMarks
        numberOfSteps={CM.length}
        coachMarks={CM}
        congratsText={'Welcome to Vestige.\nWe will guide you to use the app.'}
        visible
        onClose={async () => {
          this.props.auth.setShowCoachmarks(false);
          this.props.auth.setIsCoachMarksShown(true);
          await this.props.auth.handlePushNotification();
          this.handleEmptyAddress();
          setTimeout(() => {
            this.props.dashboard.showBirthdayPopUp();
          }, 0);
          console.log('isBirthdaypopVisible',this.props.dashboard.isBirthdayPopUpVisble, await this.props.dashboard.isBirthdayPopUpVisibileToday())
          // !await this.props.dashboard.isBirthdayPopUpVisibileToday() &&  !this.props.dashboard.isBirthdayPopUpVisble && setTimeout(() => {
       
          //   }, 1000)
          this.nearbyStores();
        }}
      />
    );
  }

  changeModalState = () => {
    setTimeout(() => {
      this.setState({ showWinner: false });
    }, 100);
    console.log('ChangeModalState',this.props.dashboard.infoMessageUrl)
    // if (!isNullOrEmpty(this.props.dashboard.infoMessageUrl)) {
    //   setTimeout(() => this.props.dashboard.setInfoPopUpVisibility(true), 1000);
    // }
  
  };

  @action lazyload = () => {
    if (this.winnersList && this.winnersList.length % 20 === 0) {
      const data = this.props.dashboard.winners.slice(
        this.winnersLength,
        this.winnersLength + 20,
      );
      this.setWinnersList(this.winnersList.concat(data));
      this.winnersLength += 20;
    }
  };

  @autobind
  async networkStatus(status) {
    if (status) {
      this.isInternetConnected = status;
      this._onRefresh();
    }
  }

  filterSideMenuData(existingCategory) {
    const arrr = this.props.profile.menuConfigList;
    if (!isNullOrEmpty(arrr) && arrr.length > 0) {
      let newArr2 = [];
      for (let i = 0; i < arrr.length; i++) {
        const gfgf = existingCategory.map((obj, index) => {
          if (
            arrr[i].menuType === 'SideMenu' &&
            arrr[i].menuName === obj.name &&
            arrr[i].isActive
          ) {
            newArr2.push(obj);
            // console.log('check2', obj)
          }
        });
      }
      return newArr2;
    }
    return existingCategory;
  }

  handleExtraData = data => {
    if (this.props.dashboard.dynamicScreenList.length) return data;
    const removeExtraData = data.filter(item => {
      return item.name !== OfferTypeEnum.DynamicScreen;
    });
    return removeExtraData;
  };
  openClosev2=(value)=>{
    // alert(1);
    this.setState({ showV20: value });

  }
 
  openClosev20Event=(value)=>{
    this.setState({ showV20Event: value });
  }
  openClosev20EventShow2=(value)=>{
    this.setState({ showV20Event: false });
    this.setState({ showV20EventRegistation: true });
    
  }

  openClosev20EventRegistrationClose=(data)=>{
    this.setState({ showV20EventRegistation: false });
  }
  v20SubmitData=(data)=>{
    this.setState({ showV20EventRegistation: false });
    var payload= data=='Yes'?'1':'0'
    this.updatev20Registertion(payload)
  }

  openGallaryEvent=(value)=>{
    alert(value);

    
  }

  checkGuestUser = () => {
    const { navigation, profile } = this.props;
    const trainingRole =
      this.props.auth.userRole === UserRole.Trainer ? true : false;
    var arrForCountry = this.filterSideMenuData(OFFERLIST);
     arrForCountry.unshift({'name':"Vestige AR","avatar":48})

    // const isExtraDataPresent = this.props.dashboard.dynamicScreenList.length ? OFFERLIST: OFFERLIST.slice(1)
    const formatedData = this.handleExtraData(arrForCountry);
    if (!this.props.auth.isGuestUser) {
      return (
        <React.Fragment>

        <V20Model
            modalVisible={this.state.showV20}
            openClosev2={this.openClosev2}
          />
          <UserProfile profile={profile} navigation={navigation} openClosev2={this.openClosev2}
/>
          {(trainingRole === false && this.props.profile.countryId != 2) ||
          (trainingRole === false &&
            this.props.profile.countryId == 2 &&
            this.state.isLoadingStatic == false) ? (
            <Category
              type={CategoryTypeEnum.Offer}
              data={formatedData}
              navigation={navigation}
            />
          ) : null}
        </React.Fragment>
      );
    }
    return null;
  };

  renderGuestUserView = () => {
    const { navigation } = this.props;
    const { isGuestUser } = this.props.auth;
    const { dashboardScreenBanners } = this.props.dashboard;
    const flagShowBanner =
      this.props.profile.defaultAddressCountryId == 1
        ? true
        : this.props.profile.isBannerSliderShow;
    const flagShowDemo =
      this.props.profile.defaultAddressCountryId == 1
        ? true
        : this.props.profile.isVestigeDemoShow;
    if (isGuestUser) {
      return (
        <>
          {flagShowBanner &&
            dashboardScreenBanners &&
            dashboardScreenBanners.length > 0 && (
              <BannerView
                countryId={this.props.profile.defaultAddressCountryId}
                navigation={navigation}
                bannerData={dashboardScreenBanners}
              />
            )}
          <DemoVideo
            newMemberClickedHandle={this.newMemberClickedHandle}
            onVestigeDemoPress={this.onVestigeDemoPress}
            vestigeDemo={this.state.vestigeDemo}
          />
        </>
      );
    }
    return (
      <>
        <DemoVideo
          newMemberClickedHandle={this.newMemberClickedHandle}
          onVestigeDemoPress={this.onVestigeDemoPress}
          vestigeDemo={this.state.vestigeDemo}
        />
        {this.props.cart.recentOrders.length > 0 ? (
          <ReviewRating
            isRatings
            cart={this.props.cart}
            navigation={this.props.navigation}
            orderList={this.props.cart.recentOrders}
            //loading={this.props.cart.isLoading}
          />
        ) : null}
        {flagShowBanner &&
          dashboardScreenBanners &&
          dashboardScreenBanners.length > 0 && (
            <BannerView
              countryId={this.props.profile.defaultAddressCountryId}
              navigation={navigation}
              bannerData={dashboardScreenBanners}
            />
          )}
      </>
    );
  };

  getGeoLocation = async openChatbot => {
    const permissionType =
      Platform.OS === 'android'
        ? Permissions.PERMISSION_TYPES.android.LOCATION
        : Permissions.PERMISSION_TYPES.ios.LOCATION;
    const response = await Permissions.requestPermission(permissionType);
    if (response === Permissions.StatusEnum.GRANTED) {
      Geolocation.getCurrentPosition(
        async position => {
          runInAction(() => {
            this.latitude = position.coords.latitude;
            this.longitude = position.coords.longitude;
          });
          if (openChatbot) {
            this.props.navigation.navigate('chatSupport', {
              latitude: this.latitude,
              longitude: this.longitude,
            });
            return;
          }
          this.detectLocation(this.latitude, this.longitude);
        },
        () => {
          if (openChatbot) {
            this.props.navigation.navigate('chatSupport', {
              latitude: this.latitude,
              longitude: this.longitude,
            });
          }
          // this.showToast(strings.errorMessage.location.enableLocation,Toast.type.ERROR)
        },
      );
    } else if (response === Permissions.StatusEnum.BLOCKED) {
      promptToOpenSettings(
        strings.errorMessage.location.locationPermission1,
        strings.errorMessage.location.locationPermission2,
      );
    }
  };

  detectLocation = async (lat, lon) => {
    const status = await this.props.location.autoDetectStoreLocation(lat, lon);
    if (!status) {
      Alert.alert(
        strings.errorMessage.location.noStorePickupAvailable1,
        strings.errorMessage.location.noStorePickupAvailable2,
        [
          {
            text: strings.commonMessages.cancel,
            style: 'cancel',
          },
        ],
      );
    } else {
      this.setState({ isLocationSuggestor: true });
    }
  };

  selectStorePickup = async item => {
    const selectStore = {
      distributorId: this.props.auth.distributorID,
      address1: item.address,
      pincode: {
        pincode: item.pincode,
      },
      cityId: item.cityId,
      stateId: item.stateId,
      countryId: item.countryId,
      locationId: item.locationId,
      locationCode: item.locationCode,
      locationName: item.locationName,
      timings: item.timings,
      distance: item.distance,
      isOnlinePayment: item.isOnlinePayment,
    };
    const status = await this.props.profile.updateLoaction(
      selectStore,
      'store',
    );
    if (status) {
      this.showToast(
        strings.errorMessage.location.locationSave,
        Toast.type.SUCCESS,
      );
      this.props.dashboard.onAddressChange();
      this.setState({ isLocationSuggestor: false });
    } else {
      this.showToast(this.props.profile.addressSaveError, Toast.type.ERROR);
    }
  };

  isLocationHeaderActive = () => {
    const { profile } = this.props;
    if (this.props.auth.isGuestUser) return false;
    if (profile.countryId === 2 && profile.location_update === true)
      return true;
    if (profile.countryId === 1 || profile.countryId === 25|| profile.countryId === 4) return true;
    return false;
  };

  renderVideoGallery = () => {
    const { videoGalleryList } = this.props.dashboard;
    return (
      <React.Fragment>
        {/* {videoGalleryList.length > 0 ? (
          <VideoLiveFeed 
            // pauseVideo={this.state.pauseMyVideo} 
            // onPlayPress={()=>this.myfunction()}
            // ref={child => {this.videoPlayOrPause = child}} 
            {...this.props} 
            videoId={this.props.dashboard.youtubeVideoId}
            // videoGalleryList={videoGalleryList}
          />
        ) : (<ActivityIndicator style={{marginLeft: 30}} animating color='#5988e0' />)} */}
        {/* <TouchableOpacity 
          style={styles.galleryButtonBackground}
          onPress={()=> this.props.navigation.navigate('youtubeListing')}
        >
          <Text 
            style={styles.videoGalleryText}
          >
              Vestige Video Gallery
          </Text>
        </TouchableOpacity> */}
      </React.Fragment>
    );
  };

  nearbyStores = () => {
    if (
      this.props.products.showChangeAddressPrompt &&
      !this.props.products.isChangeAddressPromptVisible
    ) {
      this.props.products.isChangeAddressPromptVisible = true;
      this.getGeoLocation();
    }
  };

  handleChatBotClick = async () => {
    await this.getGeoLocation(true);
    //   this.props.navigation.navigate('chatSupport', { latitude: this.latitude, longitude: this.longitude });
  };

  /** @description It is used to open chatbot screen */
  renderVictorIcon = () => {
    return (
      <TouchableOpacity
        activeOpacity={0.6}
        onPress={() => this.handleChatBotClick()}
        style={styles.victorIcon}>
        <Image
          style={{ width: 90, height: 110 }}
          resizeMode="contain"
          source={VICTOR_ICON}
        />
      </TouchableOpacity>
    );
  };

  renderHeaderShopFor = () => {
    return (
      <HeaderLeftIcons logo updateLocation navigation={this.props.navigation} />
    );
  };

  renderHeaderNotificationIcon = () => {
    return <HeaderRightIcons notification navigation={this.props.navigation} />;
  };

  render() {
    const { navigation, dashboard, profile, products } = this.props;
    const {
      categoryList,
      brandListForDashdoard,
      videoInfo,
      testimonial,
      banners,
      winners,
      successStoriesList,
      distributorFeedbacks,
      promotionPopup,
      birthdayList,
      vbdStaticBanner,
      isInfoPopUpVisible,
      setInfoPopUpVisibility,
      infoMessageUrl,
      isBirthdayPopUpVisble,
      setBirthdayPopUpVisibility,
      youtubeVids,
    } = dashboard;
    const {
      vestigeDemo,
      winnerType,
      showWinner,
      showAuthModal,
      isLocationSuggestor,
      showPromotionModal,
    } = this.state;
    const trainingRole = this.props.auth.userRole === UserRole.Trainer;
    const coachmarksStatus =
      !!this.props.auth.showCoachmarks || this.props.auth.isCoachMarksShown;
    const { isGuestUser } = this.props.auth;
    const { storeListData } = this.props.location;

    const showlocationFlag = this.isLocationHeaderActive();
    const flagHideShowMedia =
      this.props.profile.countryId == 1
        ? true
        : this.props.profile.isVestigeMediaShow;
    const flagHideShowTripWinner =
      this.props.profile.countryId == 1
        ? true
        : this.props.profile.isCarHomeTripWinnersShow;
    const flagHideBestDealPoster =
      this.props.profile.countryId == 1
        ? true
        : this.props.profile.isBestDealPosterShow;
    const flagHideSuccessStories =
      this.props.profile.countryId == 1
        ? true
        : this.props.profile.isSuccessStoriesShow;
    if (coachmarksStatus && !isGuestUser) {
      this.nearbyStores();
    }

    return (
      <View style={{ flex: 1 }}>
        {!this.isInternetConnected && (
          <OfflineNotice networkStatus={status => this.networkStatus(status)} />
        )}
        {/* {(!this.props.dashboard.isLoading) && failureScreen(this)} */}
        <Loader loading={this.state.isLoading} />
        <Header
          navigation={navigation}
          hideBack
          showDrawer
          middleComponent={this.renderHeaderShopFor()}
          rightComponent={this.renderHeaderNotificationIcon()}
        />

        {showlocationFlag == true && <LocationHeader navigation={navigation} />}
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this._onRefresh}
            />
          }
          style={
            !isGuestUser && this.props.profile.countryId != 2
              ? { marginBottom: 5 }
              : null
          }
          scrollEventThrottle={16}
          onScroll={this.handleScroll}
          keyboardShouldPersistTaps="always">
          {this.checkGuestUser()}
          {this.renderGuestUserView()}
          {this.props.profile.isCategoriesShow == true &&
            categoryList.length > 0 && (
              <Category
                title={
                  this.props.profile.countryId != 2 &&
                  this.props.profile.countryId != -1
                    ? strings.dashboard.titleCategory
                    : 'Items By Category'
                }
                type={CategoryTypeEnum.CategoryStoreFront}
                navigation={navigation}
                data={categoryList}
              />
            )}
          {flagHideBestDealPoster == true && vbdStaticBanner && (
            <TouchableWithoutFeedback
              onPress={() => {
                // trackEvent(VBD_BANNER_PRESSED.eventCategory, VBD_BANNER_PRESSED.events.NAVIGATE);
                Linking.openURL(vbdStaticBanner.deepLinkUrl);
              }}>
              <Image
                style={{ width: width, height: width / 3.75 }}
                resizeMode="contain"
                source={
                  vbdStaticBanner
                    ? { uri: vbdStaticBanner.bannerUrl }
                    : VBD_BANNER
                }
              />
            </TouchableWithoutFeedback>
          )}
          {this.props.profile.countryId != 2 &&
            this.props.profile.countryId != -1 && (
              <ShopByPv
                title={strings.dashboard.titlePv}
                shareIcon="flex"
                navigation={navigation}
              />
            )}
          {(this.props.profile.countryId != 2 &&
            this.props.profile.countryId != -1) || (this.props.profile.countryId != 4 || this.props.profile.defaultAddressCountryId != 4) && (
              <ShopByCnc
                title={strings.dashboard.titleCnc}
                shareIcon="flex"
                navigation={navigation}
              />
            )}
          {products.productWidget.isNewLaunch &&
            products.productWidget.isNewLaunch.length > 0 && (
              <SidescrollComponent
                title="Newly Launched Products"
                navigation={navigation}
                item={products.productWidget.isNewLaunch}
              />
            )}
          {this.props.profile.isBrandsShow == true &&
            brandListForDashdoard.length > 0 && (
              <Brands
                data={brandListForDashdoard}
                onBrandViewAllPress={this.onBrandViewAllPress}
                onBrandPress={this.onBrandPress}
                accessibilityLabel="Dashboard_View_More"
              />
            )}
          {flagHideShowTripWinner && (
            <WinnersView winnerHandler={this.winnerHandler} />
          )}
          {distributorFeedbacks && distributorFeedbacks.length > 0 && (
            <DistributorFeedback feedbacks={distributorFeedbacks.slice()} />
          )}
          {/* { this.renderVideoGallery() } */}
          {flagHideShowMedia && <VideoLiveFeed {...this.props} />}
          {youtubeVids?.length > 0 && flagHideShowMedia ? (
            <YoutubeListView
              youtubeVids={youtubeVids}
              navigation={this.props.navigation}
            />
          ) : (
            false
          )}
          {flagHideSuccessStories &&
            successStoriesList &&
            successStoriesList.length > 0 && (
              <SuccessStories successStoriesList={successStoriesList} />
            )}
           
        </ScrollView>
        {this.renderVictorIcon()}
        {this.props.appConfiguration?.chatSupport?.isEnabled
          ? this.renderVictorIcon()
          : null}
  
 
          {
          getPopupModalViewForWinnerDetail(
          winnerType,
          showWinner,
          winners,
          this.changeModalState,
          this.lazyload,
          this.winnersList,
          this.props.dashboard.winners.length)}
         
        <BirthdayListModal
          isVisible={isBirthdayPopUpVisble}
          closeBirthdayPopup={() => {
              setBirthdayPopUpVisibility(false);
              if (!isNullOrEmpty(infoMessageUrl)) {
                setTimeout(() => setInfoPopUpVisibility(true), 1000);
              }
          }}
        /> 
          {this.props.dashboard.surveyFormList.length>0 &&  <SurveyModal />}

          
        {
        (this.props.profile.countryId == 1 ||
          this.props.profile.Instruction_visible === true) &&
        this.props.profile.countryId != -1 &&
        // // Platform.OS !== 'ios' &&
        !coachmarksStatus? 
        this.renderCoachMarks()
          : false
          }
          
        {!isNullOrEmpty(infoMessageUrl) && this.state.showWinner === false && (
          <InfoPopUpModal
            isVisible={isInfoPopUpVisible}
            requestClose={setInfoPopUpVisibility}
            data={infoMessageUrl}
          />
        )}

        {<V20EventModel  
            modalVisible={this.state.showV20Event}
            days={this.state.eventDays}
            openClosev2={this.openClosev20Event}
            openClosev20EventShow2={this.openClosev20EventShow2}
            />}

            {
              <V20EventModelRegistration
              modalVisible={this.state.showV20EventRegistation}
              days={this.state.eventDays}
              openClosev2={this.openClosev20EventRegistrationClose}
              v20SubmitData={this.v20SubmitData}
             />

            }
       
       
        {/* <PromotionModal 
          showPromotionModal={showPromotionModal} 
          onPressCloseIcon={()=> this.setState({ showPromotionModal: false })} 
          promotionItem={promotionPopup && promotionPopup[0]}
          navigation={navigation}
        /> */}
        {/* {(this.props.profile.countryId != 2 && this.props.profile.countryId != -1) && 
        <StoreLocationSuggestor
          isVisible={isLocationSuggestor}
          closeStoreLocationSuggestor={()=> this.setState({ isLocationSuggestor: false })}
          nearbyStoreList={storeListData}
          selectStorePickup={(item)=> this.selectStorePickup(item)}
        /> } */}
      <BenifitB2BModal  isB2BModalShow={this.state.isB2BModalShow} setModalVisibleB2B={(d)=>this.setState({isB2BModalShow:d})}/>

      </View>
    );
  }
}

export default Dashboard;

const styles = StyleSheet.create({
  // galleryButtonBackground: {
  //   padding: 10,
  //   marginTop: 10,
  //   borderRadius: 30,
  //   backgroundColor: '#58cdb4',
  //   flexDirection: 'row',
  //   alignSelf: 'center',
  // },
  // videoGalleryText: {
  //   ...Specs.fontMedium,
  //   color: 'white',
  //   fontSize: 16
  // },
  victorIcon: {
    position: 'absolute',
    bottom: 0,
    right: 5,
  },
  modalv20Container: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    backgroundColor: '#00000040',
    justifyContent: 'center',
  },
});
