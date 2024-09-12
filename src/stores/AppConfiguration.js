/**
 * @description App configuration detail is available in this Model
 */
import { observable, computed, makeAutoObservable, action } from 'mobx';
import { Platform } from 'react-native';
import { APP_CONFIG } from 'app/src/utility/constant/Constants';
import NetworkOps from 'app/src/network/NetworkOps';
import * as AsyncStore from 'app/src/utility/AsyncStoragesUtils';
import * as Urls from 'app/src/network/Urls';
// import * as AsyncStore from 'app/src/utility/AsyncStoragesUtils';
// import { SESSION_CONSTANT, UserRole } from 'app/src/utility/constant/Constants';
// import { strings } from 'app/src/utility/localization/Localized';

const V2_ACTIVE_LOCATION = AsyncStore.addPrefix('v2_active_location');
const SHOPPABLE_COUNTRY_LIST = AsyncStore.addPrefix('shoppable_country_list');

export default class AppConfiguration {
  @observable configurationDetails: Array = [];
  @observable skipKycButton: Object = {};
  @observable bankPanScreen: Object = {};
  @observable starredDownlineCount: Object = {};
  // @observable isApiV2Enabled : Boolean = false;
  @observable v2ActiveLocationIdList : Array = [];
  @observable chatSupport: Object = {};
  @observable shoppableCountryList = [];
  @observable makePaymentScreenWarning = '';
  @observable onCallOtpLimit = 0;

  @observable selectedTabRoute = null;
  @observable lastTabRoute = '';

  @action setLastTabRoute = value => (this.lastTabRoute = value);
  @action setSelectedTabRoute = value => (this.selectedTabRoute = value);

  // @computed get kycSkipButton() {
  //   let kycSkipDetails = this.configurationDetails?.filter((data) => {
  //     data.key === APP_CONFIG.SKIP_KYC_BUTTON
  //   })
  //   console.log('reskyc',this.configurationDetails, kycSkipDetails)
  //   return kycSkipDetails[0]
  // }

  @computed get isKycSkippable() {
    return this.skipKycButton?.isEnabled || false;
  }

  constructor(store) {
    this.store = store;
    makeAutoObservable(this);
  }

  @action setConfigurationDetails = value => {
    this.configurationDetails = value;
  };
  @action setSkipKycButton = value => {
    this.skipKycButton = value;
  };
  @action setBankPanScreen = value => {
    this.bankPanScreen = value;
  };
  @action setStarredDownlineCount = value => {
    this.starredDownlineCount = value;
  };
  @action setChatSupport = value => {
    this.chatSupport = value;
  };
  @action setShoppableCountryList = value => {
    this.shoppableCountryList = value;
  };
  @action setMakePaymentScreenWarning = value => {
    this.makePaymentScreenWarning = value;
  };
  @action setOnCallOtpLimit = value => {
    this.onCallOtpLimit = value;
  };
  @action setV2ActiveLocationIdList = value => {
    this.v2ActiveLocationIdList = value;
  };

  @computed get isApiV2Enabled() {
    console.log('log 1', this.v2ActiveLocationIdList);
    const isV2Active = this.v2ActiveLocationIdList.findIndex(
      item => item == this.store.profile.defaultCater.locationId,
    );
    console.log('log 2', isV2Active);
    console.log('log 3', this.store.profile.defaultCater.locationId);
    if (isV2Active === -1) {
      return false;
    }
    return true;
  }
  @computed get isShoppingActiveOnSelectedAddress() {
    const check = this.shoppableCountryList?.includes(
      this.store.profile.defaultAddressCountryId?.toString(),
    );
    return check;
  }

  fetchAppConfiguration = async version => {
    this.isLoading = true;
    const params = `?os=${
      Platform.OS === 'android' ? 'ANDROID' : 'IOS'
    }&version=${version}`;
    const res = await NetworkOps.get(
      `${Urls.ServiceEnum.appConfiguration}${params}`,
    );
    this.isLoading = false;
    if (!res.message && res?.length > 0) {
      this.setConfigurationDetails(res);
      this.configurationDetails.forEach(async data => {
        // console.log('check', data)
        switch (data.key) {
          case APP_CONFIG.SKIP_KYC_BUTTON: {
            this.setSkipKycButton(data);
            break;
          }
          case APP_CONFIG.BANK_PAN_SCREEN: {
            this.setBankPanScreen(data);
            break;
          }
          case APP_CONFIG.STARRED_DOWNLINE_COUNT: {
            this.setStarredDownlineCount(data);
            break;
          }
          case APP_CONFIG.V2_ACTIVE_LOCATION: {
            if (data.isEnabled) {
              this.v2ActiveLocationIdList = data.value?.split(',');
              if (this.v2ActiveLocationIdList.length > 0) {
                await AsyncStore.set(V2_ACTIVE_LOCATION, JSON.stringify(this.v2ActiveLocationIdList));
              }
              else {
                await AsyncStore.remove(V2_ACTIVE_LOCATION);
              }
            }
            break;
          }
          case APP_CONFIG.CHAT_SUPPORT: {
            this.setChatSupport(data);
            break;
          }
          case APP_CONFIG.SHOPPABLE_COUNTRY: {
            if (data.isEnabled) {
              this.setShoppableCountryList(data.value?.split(','));
              if (this.shoppableCountryList.length > 0) {
                await AsyncStore.set(
                  SHOPPABLE_COUNTRY_LIST,
                  JSON.stringify(this.shoppableCountryList),
                );
              } else {
                await AsyncStore.remove(SHOPPABLE_COUNTRY_LIST);
              }
            }
            break;
          }
          case APP_CONFIG.MAKE_PAYMENT_WARNING: {
            this.setMakePaymentScreenWarning(data.value);
            break;
          }
          case APP_CONFIG.ON_CALL_OTP_LIMIT: {
            this.setOnCallOtpLimit(Number(data.value));
            break;
          }
          default: {
            break;
          }
        }
      });
    }
  };
}
