import { observable, action, makeAutoObservable, runInAction } from 'mobx';
import NetworkOps from 'app/src/network/NetworkOps';
import { showToast } from 'app/src/utility/Utility';
import * as Urls from 'app/src/network/Urls';
import { strings } from 'app/src/utility/localization/Localized';
import * as AsyncStore from 'app/src/utility/AsyncStoragesUtils';

const FAVORITE_LIST = AsyncStore.addPrefix('favorite_downlines');
const DEPTHLEVEL = AsyncStore.addPrefix("depth_level");
const DISTRIBUTORID = AsyncStore.addPrefix('distributor_id');


export default class Network {
  @observable isLoading: boolean = false;
  @observable downLineData = [];
  @observable networkData = [];
  @observable expandCell: string = '';
  @observable selectedPersonDistributorName: string = '';
  @observable selectedPersonDistributorID: string = '';
  @observable selectedUCDID: string = '';
  @observable favoriteDownlineData = [];
  
  constructor(store) {
    this.store = store;
    makeAutoObservable(this);
  }

  @action setIsLoading = value => {this.isLoading=value}
  @action setDownLineData= value => {this.downLineData=value}
  @action setNetworkData = value => {this.networkData=value}
  @action setExpandCell = value => {this.expandCell=value}
  @action setSelectedPersonDistributorName = value => {this.selectedPersonDistributorName=value}
  @action setSelectedPersonDistributorID = value => {this.selectedPersonDistributorID=value}
  @action setSelectedUcdID=value=>{this.selectedUCDID=value}
  @action setFavoriteDownlineData = value=>{this.favoriteDownlineData=value};

  @action async fetchNetworkDownline(item) {
    this.setIsLoading(true);
    let url, res;
    url = `${Urls.ServiceEnum.Distributor}/${item.distributorId}/${Urls.DistributorServiceEnum.Downline}`;
    res = await NetworkOps.get(url);
    this.setIsLoading(false);
    if (res.length) {
      this.setNetworkData(res);
      this.setSelectedPersonDistributorID(item.distributorId);
      this.setSelectedPersonDistributorName(item.distributorName);
      this.setExpandCell('');
      return true;
    }
    else {
      return false;
    }
  }

  @action async fetchSearchData(searchId) {
    this.setIsLoading(true);
    let url, res;
    if(isNaN(searchId)){
      url = `${Urls.ServiceEnum.Distributor}/${this.store.auth.distributorID}/${Urls.DistributorServiceEnum.downlineSearchName}${searchId}`;
      res = await NetworkOps.get(url);

    }else{
      url = `${Urls.ServiceEnum.Distributor}/${this.store.auth.distributorID}/${Urls.DistributorServiceEnum.downlineParams}${searchId}`;
      res = await NetworkOps.get(url);
    }
    this.setIsLoading(false);
    if (res.length && res[0].uplineId) {
      let d_level = await AsyncStore.get(DEPTHLEVEL)
      let depthLevel = d_level ? parseInt(d_level) : 0;
      let hLevel = res[0].hierarchyLevel ? parseInt(res[0]?.hierarchyLevel) : 0

      if ((this.store.profile?.countryId == 2 && this.store.profile.depth_level == false) && depthLevel < hLevel) {
        showToast(strings.errorMessage.signUp.restrictedDownlineFoundForUser) 
      }
      else {
        this.setNetworkData(res);
        this.setSelectedPersonDistributorName(res[0].upline);
        this.setSelectedPersonDistributorID(res[0].uplineId);
        this.setExpandCell('');
        return true;
      }
    }
    else {
      // this.networkData = []
      // this.selectedPersonDistributorName = '';
      // this.selectedPersonDistributorID = '';
      showToast(strings.errorMessage.signUp.noDownlineFound)
      // return false;
    }
  }



  @action async fetchSearchDataByUcdNameSearch(searchId) {
    this.setIsLoading(true);
    let url, res;
    // if(isNaN(searchId)){
    //   url = `${Urls.ServiceEnum.Distributor}/${this.store.auth.distributorID}/${Urls.DistributorServiceEnum.downlineSearchName}${searchId}`;
    //   res = await NetworkOps.get(url);

    // }else{
      url = `${Urls.ServiceEnum.DistributorSearchByUcd}${searchId}&loginDistributorId=${this.store.auth.distributorID}&ucdId=${this.selectedUCDID}`;
      res = await NetworkOps.get(url);
    // }
  
    this.setIsLoading(false);
    if (res.length && res[0].uplineId) {
    
      let d_level = await AsyncStore.get(DEPTHLEVEL)
      let depthLevel = d_level ? parseInt(d_level) : 0;
      let hLevel = res[0].hierarchyLevel ? parseInt(res[0]?.hierarchyLevel) : 0

      if ((this.store.profile?.countryId == 2 && this.store.profile.depth_level == false) && depthLevel < hLevel) {
        showToast(strings.errorMessage.signUp.restrictedDownlineFoundForUser) 
      }
      else {
        this.setNetworkData(res);
        this.setSelectedPersonDistributorName(res[0].upline);
        this.setSelectedPersonDistributorID(res[0].uplineId);
        this.setExpandCell('');
        return true;
      }
    }
    else {
      // this.networkData = []
      // this.selectedPersonDistributorName = '';
      // this.selectedPersonDistributorID = '';
      showToast(strings.errorMessage.signUp.noDownlineFound)
      // return false;
    }
  }

  @action async fetchGetUcdID(item) {
    this.setIsLoading(true);
    let url, res;
    url = `${Urls.ServiceEnum.DistributorUCDId}${this.store.auth.distributorID}`;
    res = await NetworkOps.get(url);
    this.setIsLoading(false);
    if (res.length&&res[0].distributorId) {
      this.setSelectedUcdID(res[0].distributorId);
      // alert(JSON.stringify(res[0].distributorId))
      return true;
    }
    else {
      this.setSelectedUcdID('');
      return false;
    }
  }

  @action async fetchUplineData(item) {
    this.setIsLoading(true);
    let url, res;
    url = `${Urls.ServiceEnum.Distributor}/${item.uplineId}/${Urls.DistributorServiceEnum.uplineParams}${this.store.auth.distributorID}`;
    res = await NetworkOps.get(url);
    this.setIsLoading(false);
    if (res.length) {
      this.setNetworkData(res);
      this.setSelectedPersonDistributorName(res[0].upline);
      this.setSelectedPersonDistributorID(res[0].uplineId);
      this.setExpandCell('');
      return true;
    }
    else {
      return false;
    }
  }

  @action async fetchNetworkData(type) {
    this.setIsLoading(true);
    this.setSelectedPersonDistributorName(this.store.profile.username);
    this.setSelectedPersonDistributorID(this.store.auth.distributorID);
    const url = `${Urls.ServiceEnum.Distributor}/${this.store.auth.distributorID}/${type}`;
    const res = await NetworkOps.get(url);
    this.setIsLoading(false);
    if (res.length) {
      this.setDownLineData(res);
      this.setNetworkData(this.downLineData);
      this.setExpandCell('');
      return true
    }
    else {
      return false;
    }
  }

  async postUserFeedback(data) {
    this.setIsLoading(true);
    const url = `${Urls.ServiceEnum.PostDistributorFeedback}`;
    const response = await NetworkOps.postToJson(url, data);
    this.setIsLoading(false);
    if (response.distributorId)
      return true
    else
      return false
  }

  async fetchDistributorFeedbackList(){
    this.setIsLoading(true);
    const url = `${Urls.ServiceEnum.fetchFeedbackList}`;
    console.log('Url',url)
    const response = await NetworkOps.get(url);
    console.log('fetchDistributorFeedbackList',response, response.status)
    this.setIsLoading(false);
    if (response.status)
      return { success: true, data: response.data}
    else
      return { success: false, data: response}
  }

  async submitDistributorFeedback(data){
    this.setIsLoading(true);
    const url = `${Urls.ServiceEnum.submitFeedback}`;
    console.log('Url',url)
    const response = await NetworkOps.postToJson(url,data);
    console.log('submitDistributorFeedback',response)
    this.setIsLoading(false);
    if (response && response.length > 0 && !response?.[0].hasOwnProperty('errMsg'))
      return { success: true, message: response?.[0]?.msg}
    else
      return { success: false, message: response?.[0]?.errMsg}
  }

  @action async fetchStarredDownline(item) {
    this.setIsLoading(true);
    let url, res;
    url = `${Urls.ServiceEnum.Distributor}/${Urls.DistributorServiceEnum.staredDownlines}?distributorId=${item.distributorId}/`;
    res = await NetworkOps.get(url);
    this.setIsLoading(false);
    if (res.length) {
      this.setNetworkData(res);
      this.setSelectedPersonDistributorID(item.distributorId);
      this.setSelectedPersonDistributorName(item.distributorName);
      this.setExpandCell('');
      return true;
    }
    else {
      return false;
    }
  }

  @action async fetchPvAnalysisData(fromDate, toDate, downlineIDs) {
    this.setIsLoading(true);
    let url, res;
    url = `${Urls.ServiceEnum.Distributor}/${this.store.auth.distributorID}/${Urls.DistributorServiceEnum.pvComparison}?fromDate=${fromDate}&toDate=${toDate}&downlineId=${downlineIDs}`;
    res = await NetworkOps.get(url);
    this.setIsLoading(false);
    // alert(JSON.stringify(this.favoriteDownlineData))
    this.favoriteDownlineData.forEach((favoriteDownline, index) => {
      var updatedPvData = res.find((analysedData) =>
        analysedData.distributorId == favoriteDownline.distributorId
      )
      if (updatedPvData) {
        // alert(JSON.stringify(updatedPvData));
        const fetchUpdatedPvData = { date1PV: updatedPvData.date1PV, 
          date2PV: updatedPvData.date2PV, 
          percentageChange: updatedPvData.percentageChange,
          date1APV:updatedPvData.date1APV,
          date2APV:updatedPvData.date2APV,
          percentageChangeAPV:updatedPvData.percentageChangeAPV,

        }
        runInAction(()=>{
          this.favoriteDownlineData[index] = { ...this.favoriteDownlineData[index], ...fetchUpdatedPvData }
        })
        
      }
      else {
        const defaultValue = { date1PV: 0, date2PV: 0, percentageChange: 0 ,
          date2PV: 0,date2APV: 0 , date1APV: 0 }
        runInAction(()=>{
          this.favoriteDownlineData[index] = { ...this.favoriteDownlineData[index], ...defaultValue }
        })
        
      }
    })
  }    
  
  
  /**
   * @description will fetch pvData of multiple downline.
   */
  @action async fetchMultipleDownlineData(downlineIds){
    this.setIsLoading(true);

    let url, res;
    const params = `?downlineIds=${downlineIds}`;
    url = `${Urls.ServiceEnum.Distributor}/${this.store.auth.distributorID}/${Urls.DistributorServiceEnum.multipleDownlineData}${params}`;
    res = await NetworkOps.get(url);
    this.setIsLoading(false);
    if(!res.message && Array.isArray(res) && res.length > 0){
      this.favoriteDownlineData.forEach((favoriteDownline, index) => {
        var updatedPvData = res.find((analysedData) =>
          analysedData.distributorId == favoriteDownline.distributorId
        )
        if(updatedPvData){
          runInAction(()=>{
            this.favoriteDownlineData[index] = { ...this.favoriteDownlineData[index], ...updatedPvData }
          })
          
        }
      });
    }
  }

  /**
   * @description will update pvData of downline on expanding cell
   */
  @action async updateStarredDownlineData(downlineId){
    this.setIsLoading(true);
    let url, res;
    url = `${Urls.ServiceEnum.Distributor}/${this.store.auth.distributorID}/${Urls.DistributorServiceEnum.downlineParams}${downlineId}`;
    res = await NetworkOps.get(url);
    this.setIsLoading(false);
    this.favoriteDownlineData.forEach((favoriteDownline, index) => {
      var updatedPvData = res.find((analysedData) =>
        analysedData.distributorId == favoriteDownline.distributorId
      )
      if (updatedPvData) {
        runInAction(()=>{
          this.favoriteDownlineData[index] = { ...this.favoriteDownlineData[index], ...updatedPvData }
        })
        
      }
    })
  }

  /**
   * @description will fetch pvData of single downline.
   */
  @action async fetchSingleDownlineData(downlineId){
    this.setIsLoading(true);
    let url, res;
    url = `${Urls.ServiceEnum.Distributor}/${this.store.auth.distributorID}/${Urls.DistributorServiceEnum.downlineParams}${downlineId}`;
    res = await NetworkOps.get(url);
    this.setIsLoading(false);
    if(!res.message & res.length > 0){
      return {success: true, data:res}
    }
    else{
      return {success: false, message: res.message}
    }
  }

  /**
   * @description Use for sending CNC skip reminder to downline.
   */
  async sendConsistencyNotification(data){
    this.setIsLoading(true);
    const url = `${Urls.ServiceEnum.notifyForConsistency}`;
    const res = await NetworkOps.postToJson(url, data);
    this.setIsLoading(false);
    if(!res.message && res.statusCode === '200')  {
      return {success: true, data : res.data ? res.data : ''}
    }  
    else{
      return {success: false, message: res.message ? res.message : `${strings.commonMessages.somethingWentWrong}${strings.commonMessages.tryAgain}`}
    }
  }

  async starLoggedinUser() {
    this.setIsLoading(true);
    const currentDistributor = await AsyncStore.get(DISTRIBUTORID);
    const url = `${Urls.ServiceEnum.Distributor}/${this.store.auth.distributorID}/${Urls.DistributorServiceEnum.downlineParams}${currentDistributor}`;
    const res = await NetworkOps.get(url);
    this.setIsLoading(false);
    if (res?.length > 0 && res[0].distributorId) {
      return { success: true, data: res[0] };
    }
  }

  async init() {
    const tempFavoriteDownlineString = await AsyncStore.get(`${FAVORITE_LIST}`);   // To be removed. done due to temporary requirement
    const favoriteDownlineString = await AsyncStore.get(`${FAVORITE_LIST}${this.store.auth.distributorID}`);
    if (!tempFavoriteDownlineString && favoriteDownlineString) {
      this.setFavoriteDownlineData(await JSON.parse(favoriteDownlineString));
      //console.log('resFavDataInit',this.favoriteDownlineData)
    }
    else if (tempFavoriteDownlineString) {
      this.setFavoriteDownlineData(await JSON.parse(tempFavoriteDownlineString));
      //console.log('resFavDataInitTemp',this.favoriteDownlineData)
    }
    // adding logged-in user to async as star marked as per requirement.
    const currentDistributor = await AsyncStore.get(DISTRIBUTORID);
    let alreadyAdded = false;
    this.favoriteDownlineData.forEach((item) => {
      if (item.distributorId == currentDistributor) {
        alreadyAdded = true;
      }
    });
    if (!alreadyAdded) {
      const loggedinUserData = await this.starLoggedinUser();
      if (loggedinUserData?.success) {
        const combinedData = [loggedinUserData.data, ...this.favoriteDownlineData];
        this.setFavoriteDownlineData(combinedData);
      }
    }
  }

  @action reset() {
    //AsyncStore.remove(FAVORITE_LIST);
    this.setDownLineData([]);
    this.setNetworkData([]);
    this.setFavoriteDownlineData([]);
    this.setExpandCell('');
    this.setSelectedPersonDistributorID('');
    this.setSelectedPersonDistributorName('');
  }
}
