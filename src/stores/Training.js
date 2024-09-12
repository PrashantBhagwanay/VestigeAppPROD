/**
 * @description Training Store, calling api and some actions defined here
 */
import { observable, makeAutoObservable, action } from 'mobx';
import { Platform } from 'react-native';
import NetworkOps from 'app/src/network/NetworkOps';
import { get, _ } from 'lodash';
import * as Urls from 'app/src/network/Urls';
import { TrainingModel } from './models/Consistency';
import { isNullOrEmpty } from '../utility/Utility';
import { strings } from '../utility/localization/Localized';
import { TrainingRequestType } from '../utility/constant/Constants';

export default class Training {
  @observable myTrainingData = [];
  @observable trainingData = [];
  @observable trainingDetail = [];
  @observable countryData = [];
  @observable stateData = [];
  @observable cityData = [];
  @observable myTrainingTypes = [];
  @observable trainingNames = [];
  @observable countryName = [];
  @observable stateName = [];
  @observable cityName = [];
  @observable myCityData = [];
  @observable isLoading: boolean = false;
  @observable  expanseData = null;

  constructor(store) {
    this.store = store;
    makeAutoObservable(this);
  }

  @action setMyTrainingData = value => {
    this.myTrainingData = value;
  };
  @action setTrainingData = value => {
    this.trainingData = value;
  };
  @action setTrainingDetail = value => {
    this.trainingDetail = value;
  };
  @action setCountryData = value => {
    this.countryData = value;
  };
  @action setStateData = value => {
    this.stateData = value;
  };
  @action setCityData = value => {
    this.cityData = value;
  };
  @action setMyTrainingTypes = value => {
    this.myTrainingTypes = value;
  };
  @action setTrainingNames = value => {
    this.trainingNames = value;
  };
  @action setCountryName = value => {
    this.countryName = value;
  };
  @action setStateName = value => {
    this.stateName = value;
  };
  @action setCityName = value => {
    this.cityName = value;
  };
  @action setMyCityData = value => {
    this.myCityData = value;
  };
  @action setIsLoading = value => {
    this.isLoading = value;
  };
  @action setExpanseData =value =>{
    this.expanseData=value;
  }

  async myTrainingListAPI(type) {
    this.setIsLoading(true);
    let filterType = type;
    if (type === 'Approved') {
      filterType = 'new';
    }
    const distributorId = this.store.auth.distributorID;
    const parameter = distributorId + '/status/' + filterType;
    const res = await NetworkOps.get(
      `${Urls.ServiceEnum.MyTrainingList}${parameter}`,
    );
    this.setIsLoading(false);
    if (!res.message) {
      this.setMyTrainingData(res);
    } else {
      this.setMyTrainingData([]);
    }
    return this.myTrainingData;
  }

  async trainingListAPI() {
    if (this.trainingData.length === 0) {
      const res = await NetworkOps.get(`${Urls.ServiceEnum.TrainingList}`);
      if (!res.message) {
        this.setTrainingData(res);
      }
    }
    return this.trainingData;
  }

  async trainingCountryListAPI() {
    this.setIsLoading(true);
    const distributorId = this.store.auth.distributorID;
    const country = await NetworkOps.get(
      `${Urls.ServiceEnum.TrainingCountry}${distributorId}`,
    );
    if (country.length > 0) {
      this.setCountryData(country);
    }
    this.setIsLoading(false);
    return this.countryData;
  }

  async trainingStateList(id) {
    if (Platform.OS === 'android') {
      this.setIsLoading(true);
    }
    const distributorId = this.store.auth.distributorID;
    const parameter = distributorId + '/country/' + id;
    const state = await NetworkOps.get(
      `${Urls.ServiceEnum.TrainingState}${parameter}`,
    );
    this.setIsLoading(false);
    if (state.length > 0) {
      this.setStateData(state);
    }
    return this.stateData;
  }

  async cityList(id) {
    if (Platform.OS === 'android') {
      this.setIsLoading(true);
    }
    const distributorId = this.store.auth.distributorID;
    const parameter = distributorId + '/state/' + id;
    const city = await NetworkOps.get(
      `${Urls.ServiceEnum.TrainingCity}${parameter}`,
    );
    this.setIsLoading(false);
    if (city.length > 0) {
      this.setCityData(city);
      const data = await this.cityData.map(item => {
        return new TrainingModel(item);
      });
      this.setMyCityData(data);
    }
    return this.cityData;
  }

  async getTariningDetail(countryName, stateName, cityName) {
    this.setIsLoading(true);
    this.setMyTrainingData([]);
    const distributorId = this.store.auth.distributorID;
    let parameter = distributorId + '/status/new?countryName=' + countryName;
    if (stateName && stateName !== '') {
      parameter = parameter + '&stateName=' + stateName;
    }
    if (cityName && cityName !== '') {
      parameter = parameter + '&cityName=' + cityName;
    }
    const detail = await NetworkOps.get(
      `${Urls.ServiceEnum.TrainingDetail}${parameter}`,
    );

    if (detail.length > 0) {
      this.setMyTrainingData(detail);
    }
    this.setIsLoading(false);
    return this.myTrainingData;
  }

  // Use it for event name
  async getTariningDetailWithEvent(eventName) {
    this.setIsLoading(true);
    const detail = await NetworkOps.get(
      `${Urls.ServiceEnum.TrainingDetailWithType}${eventName}`,
    );
    this.setIsLoading(false);
    if (!detail.message) {
      this.setMyTrainingData(detail);
    }
    return this.myTrainingData;
  }

  async getTrainingTypes() {
    this.setIsLoading(true);
    const res = await NetworkOps.get(`${Urls.ServiceEnum.TrainingTypes}`);
    this.setIsLoading(false);
    if (res) {
      this.setMyTrainingTypes(res);
    }
  }

  async createNewTraining(data) {
    this.setIsLoading(true);
    const url = `${Urls.ServiceEnum.NewTraining}`;
    console.log(url);
    const res = await NetworkOps.postToJson(url, data);
    this.setIsLoading(false);
    if (res) return res;
  }

  getTrainingNames() {
    if (this.myTrainingTypes) {
      this.setTrainingNames([]);
      for (var types of this.myTrainingTypes) {
        this.trainingNames.push(types.name);
      }
    }
    return this.trainingNames.slice();
  }

  getTrainingDetail() {
    return this.myTrainingData.slice();
  }

  getCountryName() {
    if (this.countryData) {
      this.setCountryName([]);
      for (var country of this.countryData) {
        this.countryName.push(country.countryName);
      }
    }
    return this.countryName.slice();
  }
  getCountryList() {
    return this.countryData.slice();
  }

  getStateName() {
    if (this.stateData) {
      this.setStateName([]);
      for (var state of this.stateData) {
        this.stateName.push(state.stateName);
      }
    }
    return this.stateName.slice();
  }

  getStateList() {
    return this.stateData.slice();
  }

  getCityName() {
    if (this.cityData) {
      this.setCityName([]);
      for (var city of this.cityData) {
        this.cityName.push(city.cityName);
      }
    }
    return this.cityName.slice();
  }

  getCityList() {
    return this.cityData.slice();
  }

  /** @description This is used to validate trainer who is eligible to provide/request training */
  async validateTrainer(distributorID, trainingType) {
    this.setIsLoading(true);
    const params = `?distributorId=${distributorID}&trainingType=${trainingType}`;
    const url = `${Urls.ServiceEnum.validateTrainer}${params}`;
    const res = await NetworkOps.get(url);
    this.setIsLoading(false);
    if (!isNullOrEmpty(res.message)) {
      return {
        success: false,
        message: res.message,
      };
    }
    return { success: true, data: res?.[0] };
  }

  /** @description This is used to fetch requested training list which is requested & can be conducted by selected trainer. */
  async fetchRequestedTrainingList(distributorID, trainingType) {
    this.setIsLoading(true);
    const params = `?distributorId=${distributorID}&trainingType=${trainingType}`;
    const url = `${Urls.ServiceEnum.requestedTrainingList}${params}`;
    const res = await NetworkOps.get(url);
    this.setIsLoading(false);
    if (!isNullOrEmpty(res.message)) {
      return {
        success: false,
        message: res.message,
      };
    }
    return { success: true, data: res };
  }

  /** @description Fetch reject reasons: incase user wants to cancel request */
  async fetchRejectReasons() {
    this.setIsLoading(true);
    const url = `${Urls.ServiceEnum.trainingRejectReasons}`;
    const res = await NetworkOps.get(url);
    this.setIsLoading(false);
    if (!isNullOrEmpty(res.message)) {
      return {
        success: false,
        message: res.message,
      };
    }
    return { success: true, data: res };
  }

  /** @description Fetch 3 months trainer payout detals */
  async fetchTrainerPayoutDetails(distributorID) {
    this.setIsLoading(true);
    const params = `?distributorId=${distributorID}`;
    const url = `${Urls.ServiceEnum.trainerPayoutData}${params}`;
    const res = await NetworkOps.get(url);
    this.setIsLoading(false);
    if (!isNullOrEmpty(res.message)) {
      return {
        success: false,
        message: res.message,
      };
    }
    return { success: true, data: res };
  }

  /** @description Submit training FORM details */
  async submitTrainingDetails(trainingData) {
    console.log('trainingData: ', trainingData);
    this.setIsLoading(true);
    const url = `${Urls.ServiceEnum.submitTrainingDetails}`;
    const res = await NetworkOps.postToJson(url, trainingData);
    console.log('response from submitTrainingDetails',res)
    this.setIsLoading(false);
    if (!isNullOrEmpty(res) && res.length > 0 && res[0].hasOwnProperty('errMsg')) {
      return {
        success: false,
        message: res[0].errMsg,
      };
    }
    return { success: true, data: res };
  }

  /** @description CNT Trainer Details */
  async getTrainerList(distributorID) {
    this.setIsLoading(true);
    const params = `?distributorId=${distributorID}`;
    const url = `${Urls.ServiceEnum.cntTrainerList}${params}`;
    const res = await NetworkOps.get(url);
    this.setIsLoading(false);
    if (!isNullOrEmpty(res.message)) {
      return {
        success: false,
        message: res.message,
      };
    }
    return { success: true, data: res };
  }

  /** @description CNT Distributor Details */
  async fetchCntDistributorDetails(distributorID) {
    this.setIsLoading(true);
    const params = `?distributorId=${distributorID}`;
    const url = `${Urls.ServiceEnum.cntDistributorDetails}${params}`;
    const res = await NetworkOps.get(url);
    this.setIsLoading(false);
    if (!isNullOrEmpty(res.message)) {
      return {
        success: false,
        message: res.message,
      };
    }
    return { success: true, data: res };
  }

  /** @description Cancel Training request */
  async deleteTrainingRequest(requestId, cancelReasonId) {
    this.setIsLoading(true);
    const params = `?requestId=${requestId}`;
    const url = `${Urls.ServiceEnum.cancelTraining}${params}`;
    const res = await NetworkOps.delete(url);
    this.setIsLoading(false);
    if (isNullOrEmpty(res)) {
      return {
        success: false,
        message:
          res?.message ||
          `${strings.commonMessages.somethingWentWrong} ${strings.commonMessages.tryAgain}`,
      };
    }
    return { success: true, data: res };
  }

  /** @description this will fetch CNT training venue DLCP. */
  async fetchCntDlcpList(countryId, pincode) {
    this.setIsLoading(true);
    const params = `?countryId=${countryId}&pincode=${pincode}`;
    const url = `${Urls.ServiceEnum.cntDlcpList}${params}`;
    const res = await NetworkOps.get(url);
    this.setIsLoading(false);
    if (!isNullOrEmpty(res.message)) {
      return {
        success: false,
        message: res.message,
      };
    }
    return { success: true, data: res };
  }

   /** @description this will fetch CNT training venue DLCP with the help of state & city. */
   async fetchCntDlcpStateCityList(stateId, cityId) {
    this.setIsLoading(true);
    const params = `${stateId}&cityId=${cityId}`;
    const url = `${Urls.ServiceEnum.TrainingLocationWithStateCity}${params}`;
    const res = await NetworkOps.get(url);
    console.log('res from fetchCntDlcpStateCityList',res)
    this.setIsLoading(false);
    if (!isNullOrEmpty(res.message)) {
      return {
        success: false,
        message: res.message,
      };
    }
    return { success: true, data: res.Result };
  }

  

  /** @description this will fetch location list info. */
  async fetchDlcpLocationInfo(locationCode,pincode,locationName) {
    this.setIsLoading(true);
    const params = `?locationCode=${locationCode}&pincode=${pincode}&locationName=${locationName}`;
    const url = `${Urls.ServiceEnum.cntDlcpAddressInfo}${params}`;
    console.log('Url',url)
    const res = await NetworkOps.get(url);
    this.setIsLoading(false);
    if (!isNullOrEmpty(res.message)) {
      return {
        success: false,
        message: res.message,
      };
    }
    return { success: true, data: res };
  }

  /**
   * @description validating attended propects mobile
   */
  async fetchTrainingProspectsAttendedMobile(trainingId, mobileNo) {
    console.log('fetchTrainingProspectsAttendedMobile', trainingId, mobileNo);
    // =62868326&trainingId=1&trainingAttendedMobNo=9876543211
    this.setIsLoading(true);
    const distributorId = this.store.auth.distributorID;
    const url = `${Urls.ServiceEnum.TrainingProspectsMobNo}${distributorId}&trainingId=${trainingId}&trainingAttendedMobNo=${mobileNo}`;
    console.log('fetchTrainingProspectsAttendedMobile>>>>>>>>>>>', url);
    const res = await NetworkOps.get(url);
    console.log('response from fetch prospects', res, url);
    this.setIsLoading(false);
    if (res) return res;
  }

  async submitAttendedProspects(data) {
    this.setIsLoading(true);
    const url = `${Urls.ServiceEnum.TrainingProspectsAttended}`;
    console.log('Url from submit', url, JSON.stringify(data));
    const res = await NetworkOps.postToJson(url, data);
    this.setIsLoading(false);
    console.log('Response from submitAttended', res);
    if (res) return res;
  }

  /**
   * @description fetching the propesct list who have attended the traning
   */
  async fetchTrainingProspectsList(trainingId) {
    this.setIsLoading(true);
    const distributorId = this.store.auth.distributorID;
    const url = `${Urls.ServiceEnum.TrainingProspectsList}${distributorId}&trainingId=${trainingId}`;
    const res = await NetworkOps.get(url);
    console.log('response from fetch prospects', res);
    this.setIsLoading(false);
    if (!isNullOrEmpty(res.message)) {
      return {
        success: false,
        message: res.message,
      };
    }
    return { success: true, data: res };
  }

  /**
   * @description uploading the training images as the training completed
   */
  async uploadTrainingImages(data){
      /**..........sending auth-token as per requirement in completeRegistration flow.
       * .........(don't remove before verifying each cases)............ */
      const headerOptions = {
        headerOverrides: {
          'Content-Type': 'multipart/form-data',
          Authorization: `bearer ${this.store.auth.authToken}`,
          distributorId: this.store.auth.distributorID,
        },
      };
  
      this.setIsLoading(true);
      const url = `${Urls.ServiceEnum.cntTrainingImageUpload}`;
      console.log('Url',url, JSON.stringify(data))
      const res = await NetworkOps.postRaw(`${url}`, data, headerOptions);
      this.setIsLoading(false);
      // console.log('Res from kyc upload',JSON.parse(JSON.stringify(res)))
      console.log('Res from kyc upload>>>>>>>>>>>>>',res)
      if(res.statusCode == '1'){
        return { success: true, message: res.status}
      } else {
        return { success: false, message: res.status}
      }
      // if(JSON.parse(res))
  }


  async submitCntClaimFrom(data) {
    this.setIsLoading(true);
    const url = `${Urls.ServiceEnum.cntClaimFromSubmit}`;
    console.log('Url from CM', url, JSON.stringify(data));
    const res = await NetworkOps.postToJson(url, data);
    this.setIsLoading(false);
    console.log('Response from submitCntClaimFrom', res);
    if (res) return res;
  }

  /*
    use for uplaod image Reimbursement 
  */
  async uploadReimburseImageUpload(data){
    /**..........sending auth-token as per requirement in completeRegistration flow.
     * .........(don't remove before verifying each cases)............ */
    const headerOptions = {
      headerOverrides: {
        'Content-Type': 'multipart/form-data',
        Authorization: `bearer ${this.store.auth.authToken}`,
        distributorId: this.store.auth.distributorID,
      },
    };

    this.setIsLoading(true);
    const url = `${Urls.ServiceEnum.cntReimburseImageUpload}`;
    console.log('Url',url, JSON.stringify(data))
    const res = await NetworkOps.postRaw(`${url}`, data, headerOptions);
    this.setIsLoading(false);
    // console.log('Res from kyc upload',JSON.parse(JSON.stringify(res)))
    console.log('Res Image upload >>>>>>>>>>>>>',res)
    if(res!=undefined){
      return { success: true, message: 'image uploaded successfully'}
    } else {
      return { success: false, message: 'issues in image upload'}
    }
    // if(JSON.parse(res))
}

 /**
   * @description fetching get basic CNT Expense
   */
  async fetchGetbasicCNTExpense(trainingId) {
    this.setIsLoading(true);
    const distributorId = this.store.auth.distributorID;
    const url = `${Urls.ServiceEnum.getBasicCntExpense}${distributorId}&trainingId=${trainingId}`;
    const res = await NetworkOps.get(url);
    console.log('response from fetch fetchGetbasicCNTExpense', res);
    this.setIsLoading(false);
    if (!isNullOrEmpty(res.message)) {
      return {
        success: false,
        message: res.message,
      };
    }
    // alert(JSON.stringify(res[0]));
    this.setExpanseData(res[0])
    return { success: true, data: res };
  }

}