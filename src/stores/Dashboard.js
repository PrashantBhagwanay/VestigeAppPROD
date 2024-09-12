import { observable, computed, action, makeAutoObservable } from 'mobx';
import DeviceInfo from 'react-native-device-info';
import moment from 'moment';
import * as AsyncStore from 'app/src/utility/AsyncStoragesUtils';
import NetworkOps from 'app/src/network/NetworkOps';
import * as Urls from 'app/src/network/Urls';
import Brand from 'app/src/stores/models/Brand';
import { strings } from '../utility/localization/Localized';
import { isNullOrEmpty } from 'app/src/utility/Utility';

const LAST_BIRTHDAY_SHOWN = AsyncStore.addPrefix('birthdayShownDate');

const options = { headerOverrides: { 'Content-Type': 'multipart/form-data' } };


export default class Dashboard {
  @observable isLoading: boolean = false;
  @observable categoryList: Array<any> = [];
  @observable brandList: Array<Brand> = [];
  @observable winners: Array<Brand> = [];
  @observable banners: Array<any> = [];
  @observable videoGalleryList = [];
  @observable videoInfo = {};
  @observable testimonial = {};
  @observable aboutUs;
  @observable aboutUsFetchError: String = '';
  @observable successStoriesList = [];
  @observable distributorFeedbacks = [];
  @observable birthdayList;
  @observable isBirthdayPopUpVisble = false;
  @observable dynamicScreenList = [];
  @observable isBirthdayLoader = false;
  @observable isInfoPopUpVisible = false;
  @observable youtubeVids = [];
  @observable surveyFormList = [];

  constructor(store) {
    this.store = store;
    makeAutoObservable(this);
  }

  @action setIsLoading = value => (this.isLoading = value);
  @action setCategoryList = value => (this.categoryList = value);
  @action setBrandList = value => (this.brandList = value);
  @action setWinners = value => (this.winners = value);
  @action setBanners = value => (this.banners = value);
  @action setVideoGalleryList = value => (this.videoGalleryList = value);
  @action setVideoInfo = value => (this.videoInfo = value);
  @action setTestimonial = value => (this.testimonial = value);
  @action setAboutUs = value => (this.aboutUs = value);
  @action setAboutUsFetchError = value => (this.aboutUsFetchError = value);
  @action setSuccessStoriesList = value => (this.successStoriesList = value);
  @action setDistributorFeedbacks = value =>
    (this.distributorFeedbacks = value);
  @action setBirthdayList = value => (this.birthdayList = value);
  @action setIsBirthdayPopUpVisble = value =>
    (this.isBirthdayPopUpVisble = value);
  @action setDynamicScreenList = value => (this.dynamicScreenList = value);
  @action setIsBirthdayLoader = value => (this.isBirthdayLoader = value);
  @action setIsInfoPopUpVisible = value => (this.isInfoPopUpVisible = value);
  @action setSurveyFormList = value => (this.surveyFormList = value);

  @computed get brandListForDashdoard() {
    return this.brandList.slice(0, 8);
  }

  @computed get dashboardScreenBanners() {
    if (this.banners.length) {
      const dashboardShoppingBannersList = this.banners.filter(
        item =>
          item.bannerType.toUpperCase() !== 'VBD_STATIC_CONTENT' &&
          !item.isPopup &&
          item.screenTypes &&
          item.screenTypes.includes('DASHBOARD'),
      );
      const dashboardVbdIndex = dashboardShoppingBannersList.findIndex(
        item => item.bannerType.toUpperCase() === 'VBD',
      );
      if (dashboardVbdIndex !== -1) {
        // To add the VBD BANNER at 3rd position
        const element = dashboardShoppingBannersList[dashboardVbdIndex];
        dashboardShoppingBannersList.splice(dashboardVbdIndex, 1);
        dashboardShoppingBannersList.splice(2, 0, element);
      }
      dashboardShoppingBannersList.sort(this.sortBanner);
      return dashboardShoppingBannersList;
    }
    return [];
  }

  @computed get schemeScreenBanners() {
    if (this.banners.length) {
      const schemeShoppingBannersList = this.banners.filter(
        item =>
          item.bannerType.toUpperCase() == 'SCHEMES' &&
          !item.isPopup &&
          item.screenTypes &&
          item.screenTypes.includes('SCHEMES'),
      );
      const schemeVbdIndex = schemeShoppingBannersList.findIndex(
        item => item.bannerType.toUpperCase() === 'VBD',
      );
      if (schemeVbdIndex !== -1) {
        // To add the VBD BANNER at 3rd position
        const element = schemeShoppingBannersList[schemeVbdIndex];
        schemeShoppingBannersList.splice(schemeVbdIndex, 1);
        schemeShoppingBannersList.splice(2, 0, element);
      }
      schemeShoppingBannersList.sort(this.sortBanner);
      return schemeShoppingBannersList;
    }
    return [];
  }

  sortBanner(a, b) {
    if (a.priorityNumber < b.priorityNumber) {
      return -1;
    }
    if (a.priorityNumber > b.priorityNumber) {
      return 1;
    }
    return 0;
  }

  @computed get shoppingScreenBanners() {
    if (this.banners.length) {
      const shoppingScreenBannersList = this.banners.filter(
        item =>
          item.bannerType.toUpperCase() !== 'VBD_STATIC_CONTENT' &&
          !item.isPopup &&
          item.screenTypes &&
          item.screenTypes.includes('SHOPPING'),
      );
      const shoppingVbdIndex = shoppingScreenBannersList.findIndex(
        item => item.bannerType.toUpperCase() === 'VBD',
      );
      if (shoppingVbdIndex !== -1) {
        const element = shoppingScreenBannersList[shoppingVbdIndex];
        shoppingScreenBannersList.splice(shoppingVbdIndex, 1);
        shoppingScreenBannersList.splice(3, 0, element);
      }
      shoppingScreenBannersList.sort(this.sortBanner);
      return shoppingScreenBannersList;
    }
    return [];
  }

  @computed get vbdStaticBanner() {
    if (this.banners.length) {
      const bannerInfo = this.banners.find(
        item => item.bannerType.toUpperCase() === 'VBD_STATIC_CONTENT',
      );
      return bannerInfo;
    }
    return null;
  }

  @computed get promotionPopup() {
    if (this.banners.length) {
      return this.banners.filter(item => item.isPopup);
    }
    return undefined;
  }

  @computed get youtubeVideoId() {
    if (this.videoGalleryList.length) {
      const selectedVideoIndex =
        this.videoGalleryList.length &&
        this.videoGalleryList.findIndex(obj => obj.selected === true);
      if (selectedVideoIndex !== -1) {
        const regExp =
          /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
        const match =
          this.videoGalleryList[selectedVideoIndex].videoUrl.match(regExp);
        return match && match[7].length == 11 ? match[7] : '8wo1gIWJbKM';
      }
      return '8wo1gIWJbKM';
    }
    return '8wo1gIWJbKM';
  }

  // async fetchDashboardRefreshData() {
  //   this.isLoading = true;
  //   // this.store.products.productWidget = {}
  //   await this.store.profile.fetch();
  //   this.isLoading = false;
  // }

  async fetchDashboardShoppingData() {
    this.setIsLoading(true);
    this.store.products.productWidget = {};
    await this.store.profile.fetch();
    this.setIsLoading(false);
    this.fetchBanners(
      'screenTypes=[DASHBOARD,SHOPPING,SCHEMES]',
      this.store.profile.defaultAddressCountryId,
    );
    this.fetchCategoryList();
    this.fetchBrandList();
    this.fetchAboutUs();
    this.store.products.fetchProductWidget('shopByPv', '0-25');
    this.store.wishList.fetchWishList('update');
    this.store.cart.fetchCart();
  }

  async fetchDashboardData() {
    this.store.auth.setShowSkip(false);
    this.setIsLoading(true);
    this.store.products.productWidget = {};
    await this.store.profile.fetch(); // To fetch the profile data
    this.setIsLoading(false);
    this.fetchCategoryList(); // To fetch the category data
    this.store.wishList.fetchWishList('update');
    // this.store.cart.fetchRecentOrders();
    this.fetchBanners(
      'screenTypes=[DASHBOARD,SHOPPING,SCHEMES]',
      this.store.profile.defaultAddressCountryId,
    );
    await this.store.products.fetchProductWidget('shopByPv', '0-25', undefined);
    await this.store.products.fetchProductWidget('shopByCNC', '', undefined);
    // this.store.products.fetchProductCNC();
    this.store.products.getProductCatalogue(this.store.profile.countryId);
    this.fetchBrandList();
    this.fetchVideo();
    this.fetchAboutUs();
    this.fetchSuccessStories();
    this.fetchDistributorFeedbacks();
    this.store.profile.isNetworkCount &&
      this.store.profile.fetchDownlineCount();
    this.getDynamicScreenData();
    // this.fetchVideoGallery();
    this.store.cart.fetchCart();// To fetch the cart info of the user logged in
    this.fetchYoutubeVids();
  }

  // fetchReloadData() {
  //   // this.isLoading() = true;
  //   this.fetchDashboardShoppingData()
  //   this.fetchDashboardData()
  // }

  async fetchCategoryList() {
    const params = `?countryId=${this.store.profile.defaultAddressCountryId}`;
    const res = await NetworkOps.get(
      `${Urls.ServiceEnum.CategoryList}${params}`,
    );
    if (!res.message) {
      this.setCategoryList(res);
    }
  }

  async getDynamicScreenData() {
    this.setDynamicScreenList([]);
    const res = await NetworkOps.get(
      `${Urls.ServiceEnum.dynamicScreen}${this.store.auth.distributorID}`,
    );
    if (!res.message && Array.isArray(res)) {
      this.setDynamicScreenList(res);
    }
  }

  @action setBirthdayPopUpVisibility = value => {
    this.setIsBirthdayPopUpVisble(value);
  };

  async getBirthdayList() {
    // if (this.store.profile.defaultAddressCountryId == 4) return;

    this.setIsBirthdayLoader(true);
    const res = await NetworkOps.get(
      `${Urls.ServiceEnum.BirthdayList}${this.store.auth.distributorID}/downline-birthday`,
    );
    this.setIsBirthdayLoader(false);
    if (!res.message) {
      if (Array.isArray(res) && res.length) {
        const birthdaylist = res.map(item => {
          item.isSendWish = false;
          return item;
        });
        this.setBirthdayList(birthdaylist);
      }
      const coachmarksStatus =
        !!this.store.auth.showCoachmarks || this.store.auth.isCoachMarksShown;
      if (coachmarksStatus) this.showBirthdayPopUp();
    }
  }

  /**
   * To check if birthday pop up is visible for today as the require allow it to be visible only
   * once in a day.
   */
  @action isBirthdayPopUpVisibileToday = async () => {
    const currentDate = moment().format('DD/MM/YYYY');
    const birthdayShownDate = await AsyncStore.get(LAST_BIRTHDAY_SHOWN);
    if (!birthdayShownDate || birthdayShownDate != currentDate) {
      return true;
    }
    return false;
  };

  /**
   * It will make birthday pop up visiblity true and also mark it as shown for current date.
   */
  showBirthdayPopUp = async () => {
    const {
      birthdayList,
      promotionPopup,
      setBirthdayPopUpVisibility,
      isBirthdayPopUpVisibileToday,
    } = this;
    const { isGuestUser } = this.store.auth;
    if (!isGuestUser && birthdayList?.length > 0 && 
      // (this.store.profile.defaultAddressCountryId != 4 || this.store.profile.countryId != 4) && 
      (await isBirthdayPopUpVisibileToday())) {
      const currentDate = moment().format('DD/MM/YYYY');
      setBirthdayPopUpVisibility(true);
      AsyncStore.set(LAST_BIRTHDAY_SHOWN, currentDate);
    }
    // if (promotionPopup && promotionPopup.length && birthdayList && birthdayList.length === 0 && !isGuestUser) {
    //   this.setState({ showPromotionModal: true });
    // }
  };

  @action reset() {
    this.setBirthdayList([]);
    this.setDynamicScreenList([]);
    this.infoMessageUrl = '';
    this.setIsInfoPopUpVisible(false);
    this.setDistributorFeedbacks([])
  }

  @action async sendBirtdhayWish(item) {
    this.setIsBirthdayLoader(true);
    const res = await NetworkOps.postToJson(
      `${Urls.ServiceEnum.SendSms}`,
      item,
    );
    this.setIsBirthdayLoader(false);
    if (!res.message && res.length) {
      if (item.length === 1) {
        const index = this.birthdayList.findIndex(
          x => x.mobileNo == item[0].phoneNo,
        );
        this.birthdayList[index].isSendWish = true;
        this.setBirthdayList([...this.birthdayList]);
      } else {
        this.setBirthdayList([
          ...this.birthdayList.map(item => {
            item.isSendWish = true;
            return item;
          }),
        ]);
      }
      return { success: true };
    }
    return {
      success: false,
      message:
        res.message ||
        `${strings.commonMessages.somethingWentWrong}${strings.commonMessages.tryAgain}`,
    };
  }

  async fetchAboutUs() {
    const url = `${Urls.ServiceEnum.AboutUs}/type/AboutUs`;
    const res = await NetworkOps.get(url);
    if (!res.message) {
      this.setAboutUs(res);
    }
    this.setAboutUsFetchError(res.message);
  }

  async fetchBanners(query, countryId) {
    this.setBanners([]);
    const countryParam = `countryId=${countryId}`;
    const url = `${
      Urls.ServiceEnum.Banners
    }?${countryParam}&q=${encodeURIComponent(query)},status=true`;
    const res = await NetworkOps.get(url);
    if (!res.message) {
      this.setBanners(res);
    }
  }

  async fetchBrandList() {
    const params = `?countryId=${this.store.profile.defaultAddressCountryId}`;
    const res = await NetworkOps.get(`${Urls.ServiceEnum.BrandList}${params}`);
    if (!res.message) {
      const data = await res.map(object => {
        return new Brand(object);
      });
      this.setBrandList(data);
    }
  }

  async fetchVideo() {
    const url = `${Urls.ServiceEnum.Distributor}/${Urls.DistributorServiceEnum.VideoList}`;
    const res = await NetworkOps.get(url);
    if (!res.message) {
      // this.videoGalleryList = [
      //   { selected: true,
      //     videoId: 0,
      //     videoThumbnail: 'https://images.pexels.com/photos/248797/pexels-photo-248797.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500',
      //     videoUrl: 'https://www.youtube.com/watch?v=5kOgJGl6-yg'
      //   }
      // ];
      this.setVideoGalleryList(res);
      // this.videoGalleryList = [
      //   {selected: false,  videoId: 0, videoThumbnail: 'https://images.pexels.com/photos/248797/pexels-photo-248797.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500',videoUrl: 'https://s3.ap-south-1.amazonaws.com/vstg-mobileapp-prod/videos/Vestige.mp4'},
      //   {selected: false, videoId: 1, videoThumbnail: 'https://article.images.consumerreports.org/prod/content/dam/CRO%20Images%202018/Electronics/May/CR-Elecrtonics-Inlinehero-streaming-services-0518', videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'},
      //   {selected: false, videoId: 2, videoThumbnail: 'https://cohesive.net/wp-content/uploads/2016/05/video-icon.png',videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'},
      //   {selected: true, videoId: 3, videoThumbnail: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSGTVf63Vm3XgOncMVSOy0-jSxdMT8KVJIc8WiWaevuWiPGe0Pm',videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'},
      //   {selected: false, videoId: 4, videoThumbnail: 'https://www.gettyimages.ie/gi-resources/images/Homepage/Hero/UK/CMS_Creative_164657191_Kingfisher.jpg',videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'},
      //   {selected: false, videoId: 5, videoThumbnail: 'https://images.unsplash.com/photo-1535498730771-e735b998cd64?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&w=1000&q=80',videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4'},
      //   {selected: false, videoId: 6, videoThumbnail: 'https://roadtovrlive-5ea0.kxcdn.com/wp-content/uploads/2015/03/youtube-logo2.jpg',videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4'},
      // ]
      this.setVideoInfo(res.video ? res.video : {});
      this.setTestimonial(res.whatTheySaid);
    }
  }

  async fetchSuccessStories() {
    const url = `${Urls.ServiceEnum.WhatTheySaid}?q=createdOn:desc,status=true`;
    const res = await NetworkOps.get(url);
    if (!res.message) {
      this.setSuccessStoriesList(res);
      return { success: true };
    }
    return { success: false, message: res.message };
  }

  async fetchDistributorFeedbacks() {
    // const url = `${Urls.ServiceEnum.DistributorFeedbacks}`;
    const url = `${Urls.ServiceEnum.fetchFeedbacks}${this.store.auth.distributorID}`;
    const res = await NetworkOps.get(url);
    console.log('res from feedbacks',res)
    if (res.status == 1) {
      this.setDistributorFeedbacks(res.data);
      return { success: true };
    }
    return { success: false, message: res.message };
  }

  async shareDistributorMobileNo(rowId){
    const url = `${Urls.ServiceEnum.shareDistributorMobile}${this.store.auth.distributorID}&rowId=${rowId}`;
    const res = await NetworkOps.get(url);
    console.log('response from shareDistributorMobileNo',res)
    if(res[0].hasOwnProperty('errMsg')){
        return { success: false, message: res[0].errMsg };
    } else {
      await this.fetchDistributorFeedbacks();
      return { success: true, message: res[0].msg };
    }
  }

  // @computed get getSelectedVideoData() {
  //   const url = 'https://s3.ap-south-1.amazonaws.com/vstg-mobileapp-prod/videos/Vestige.mp4'
  //   // const selectedVideoIndex =  this.videoGalleryList.length && this.videoGalleryList.findIndex((obj) =>  obj.isSelected === true )
  //   // console.log(this.videoGalleryList[selectedVideoIndex].videoUrl)
  //   // let selectedVideoData = {
  //   //   videoUrl: this.videoGalleryList[selectedVideoIndex].videoUrl,
  //   //   description: this.videoGalleryList[selectedVideoIndex].description,
  //   //   locationName: this.videoGalleryList[selectedVideoIndex].locationName
  //   // }
  //   return url;
  // }

  @computed get getSelectedVideoUrl() {
    const url =
      'https://s3.ap-south-1.amazonaws.com/vstg-mobileapp-prod/videos/Vestige.mp4';
    const selectedVideoIndex =
      this.videoGalleryList.length &&
      this.videoGalleryList.findIndex(obj => obj.selected === true);
    if (selectedVideoIndex > -1) {
      console.log(this.videoGalleryList[selectedVideoIndex].videoUrl);
      return this.videoGalleryList[selectedVideoIndex].videoUrl;
    }
    return url;
  }

  @action changeVideo(selectedVideo) {
    this.videoGalleryList.map(video => {
      if (video.videoId === selectedVideo.videoId) {
        video.selected = true;
      } else {
        video.selected = false;
      }
    });
  }

  async fetchWinners(param) {
    this.setIsLoading(true);
    this.setWinners([]);
    const url = `${Urls.ServiceEnum.Distributor}/${this.store.auth.distributorID}/${Urls.DistributorServiceEnum.WinnersList}${param}`;
    const res = await NetworkOps.get(url);
    this.setIsLoading(false);
    if (!res.message && res.length > 0) {
      this.setWinners(res);
      return { success: true, data: res };
    } else {
      return { success: false, message: res.message };
    }
  }

  async onAddressChange() {
    this.store.wishList.setWishLists([]);
    this.store.products.fetchProductWidget(
      'shopByPv',
      this.store.products.keyValue,
    );
    await this.store.products.fetchProductWidget('shopByCNC', '', undefined);
    // this.store.products.fetchProductCNC();
    this.fetchCategoryList();
    this.fetchBrandList();
    this.store.wishList.fetchWishList();
    this.store.search.setSearchInputValue('');
    this.store.cart.setIsInventoryResponseReceived(false);
    // this.store.cart.skuCodes.length > 0 && this.store.cart.checkInventory(this.store.cart.skuCodes)
    this.store.cart.cartVouchers.map((userData, index) => {
      this.store.cart.modifyCartInfo('INIT', index);
    });
    setTimeout(() => {
      this.store.products.fetchProductWidget('isNewLaunch');
      this.store.products.fetchProductWidget('isSponsored');
    }, 500);
  }

  @action setInfoPopUpVisibility = value => {
    setTimeout(() => {
      this.setIsInfoPopUpVisible(value);
    }, 100);
  };

  @action fetchInfoMessageUrl = async () => {
    this.setIsLoading(true);
    const version = DeviceInfo.getVersion();
    const params = `?distributorId=${this.store.auth.distributorID}&countryId=${this.store.profile.countryId}&appVersion=${version}`;
    const url = `${Urls.ServiceEnum.fetchInfoMessage}${params}`;
    const res = await NetworkOps.get(url);
    this.setIsLoading(false);
    if (!res.message && !isNullOrEmpty(res?.webUrl)) {
      this.infoMessageUrl = res.webUrl;
      const isBirthdayVisibleToday = await this.isBirthdayPopUpVisibileToday();
      if (
        !this.isBirthdayPopUpVisble &&
        (!this.birthdayList?.length || !isBirthdayVisibleToday)
      ) {
        this.setInfoPopUpVisibility(true);
      }
    } else if (this.isInfoPopUpVisible) {
      this.setInfoPopUpVisibility(false);
    }
  }

  @action fetchYoutubeVids = async () => {
    this.isLoading = true;
    const params = `?countryId=${this.store.profile.countryId}`;
    const url = `${Urls.ServiceEnum.fetchYoutubeVids}${params}`;
    const res = await NetworkOps.get(url);
    this.isLoading = false;
    if (!res.message) {
      // success, if error message is not present
      this.youtubeVids = res;
    }
  }

  getSurveyFormDetails= async()=>{
    const params = `?distributorId=${this.store.auth.distributorID}`;
    const url = `${Urls.ServiceEnum.getSurveyFormDetails}${params}`;
   
    const res = await NetworkOps.get(url);
    
    if (!res.message) {
      if (Array.isArray(res) && res.length) {
      //   const data=[
      //   {
      //     "servery_name": "ThailandsdsdfsdfTrop",
      //     "servery_id": "12",
      //     "question": [
      //         {
      //             "servery_id": "12",
      //             "question_title": "What is your name sir",
      //             "question_type": "Input",
      //             "question_id": "8",
      //             "option_value": []
      //         },
      //         {
      //             "servery_id": "12",
      //             "question_title": "Whats your gender ?",
      //             "question_type": "Radiobutton",
      //             "question_id": "9",
      //             "option_value": [
      //                 "\"Male\"",
      //                 "\"Female\""
      //             ]
      //         },
      //         {
      //             "servery_id": "12",
      //             "question_title": "Select your city ?",
      //             "question_type": "DropDown",
      //             "question_id": "12",
      //             "option_value": [
      //                 "\"New Delhi\"",
      //                 "\"Jaipur\"",
      //                 "\"Kolkata\"",
      //                 "\"Chandigarh\""
      //             ]
      //         },
      //         {
      //           "servery_id": "12",
      //           "question_title": "Select your city ?",
      //           "question_type": "DatePiker",
      //           "question_id": "14",
      //           "option_value": [
                    
      //           ]
      //       },
      //       {
      //         "servery_id": "12",
      //         "question_title": "Select your city ?",
      //         "question_type": "DatePiker",
      //         "question_id": "16",
      //         "option_value": [
                  
      //         ]
      //     },
              
      //     ]
      // }
      // ]
        this.setSurveyFormList(res)
        console.log("asdasd",JSON.stringify(res))
      }
      
     
    }
  }


  saveSurveyFormDetails= async(data)=>{
    const url = `${Urls.ServiceEnum.saveSurveyFormDetails}`;
    const res = await NetworkOps.postToJson(url,data);

    if (res.msg) {
      return true
    }else{
      return false
    }
  }

  uploadSurveyImage= async(data)=>{
    const url = `${Urls.ServiceEnum.uploadSurveyImage}`;
    const res = await NetworkOps.postRaw(url,data,options);
    if (res.imgUrl) {
      return {success:true,data:res}
    }else{
      return {success:false}
    }
  }

}
