import { observable, action, makeAutoObservable } from 'mobx';
import NetworkOps from 'app/src/network/NetworkOps';
import * as Urls from 'app/src/network/Urls';
import { BankPanModel } from './models/BankpanModel';

const options = { headerOverrides: { 'Content-Type': 'multipart/form-data' } };
export default class BankPan {
  @observable isLoading: Boolean = false;
  @observable bankPanDetails = '';
  @observable isPanFieldDisabled: Boolean = false;
  @observable isBankFieldDisabled: Boolean = false;

  constructor(store) {
    this.store = store;
    makeAutoObservable(this);
  }

  @action setIsLoading = value => (this.isLoading = value);
  @action setBankPanDetails = value => (this.bankPanDetails = value);
  @action setIsPanFieldDisabled = value => (this.isPanFieldDisabled = value);
  @action setIsBankFieldDisabled = value => (this.isBankFieldDisabled = value);

  @action resetBankPan() {
    this.setBankPanDetails('');
    this.setIsBankFieldDisabled(false);
    this.setIsPanFieldDisabled(false);
  }
  /**
   * @description - To get the already saved Pan and Bank details.
   */
  async getPanBankDetails(distributorId, countryId) {
    this.setIsLoading(true);
    this.resetBankPan();
    const params = `?distributorId=${distributorId}&loginId=${this.store.auth.distributorID}&countryId=${countryId}`;
    const url = `${Urls.ServiceEnum.panBankDetails}${params}`;
    const res = await NetworkOps.get(url);
    this.setIsLoading(false);
    if (!res.title && !res.message) {
      if (Array.isArray(res) && res.length == 0) {
        return { success: false, message: 'No data found' };
      }

      const bankPanData = new BankPanModel(res[0]);
      this.setBankPanDetails(bankPanData);

      console.log('bankpandetails', this.bankPanDetails.panStatus);
      return { success: true, data: bankPanData };
    }
    return { success: false, message: res.title ? res.title : res.message };
  }

  // async verifyLogin(distributorId) {
  //   this.isLoading = true;
  //   const url = `${Urls.ServiceEnum.verifyLogin}?distributorId=${distributorId}`;
  //   const res = await NetworkOps.get(url);
  //   this.isLoading = false;
  //   if(!res.message && distributorId == res.distributorId) {
  //     return { success: true , data : res}
  //   }
  //   return { success: false, message: res.message }
  // }

  /**
   * @description - It Uploads pan image, name in response will be used in saving pan .
   */
  async uploadPanDocument(data, distributorId, countryId) {
    this.setIsLoading(true);
    const param = `?distributorId=${distributorId}&countryId=${countryId}`;
    const url = `${Urls.ServiceEnum.panUpload}${param}`;
    const res = await NetworkOps.postRaw(url, data, options);
    this.setIsLoading(false);
    if (res.data) {
      return { success: true, data: res.data };
    }
    return { success: false, message: res.title };
  }

  async savePanDetails(data) {
    this.setIsLoading(true);
    const url = `${Urls.ServiceEnum.savePanDetails}`;
    const res = await NetworkOps.postToJson(url, data);
    this.setIsLoading(false);
    if (res.data) {
      //if(res.data == 'PAN details verified successfully.'){
      return { success: true, data: res.data };
      // }
      // else{
      //   return { success: false, message: res.data }
      // }
    } else {
      return { success: false, message: res.title };
    }
  }

  /**
   * @description - It is used to fetch bankname & bankId which can be used to get bankBranch.
   */
  async getBankList(ifsc, countryId) {
    this.setIsLoading(true);
    const params = `?countryId=${countryId}&ifscCode=${ifsc}`;
    const url = `${Urls.ServiceEnum.getBankList}${params}`;
    const res = await NetworkOps.get(url);
    this.setIsLoading(false);
    if (!res.message) {
      return { success: true, data: res[0] ? res[0] : res };
    }
    return { success: false, message: res.title };
  }

  async getBankBranches(ifsc, bankId) {
    this.setIsLoading(true);
    const params = `?bankId=${bankId}&ifscCode=${ifsc}`;
    const url = `${Urls.ServiceEnum.getBankBranch}${params}`;
    const res = await NetworkOps.get(url);
    this.setIsLoading(false);
    if (!res.title) {
      return { success: true, data: res };
    }
    return { success: false, message: res.title };
  }

  async checkAccNoLength(bankId) {
    this.setIsLoading(true);
    const url = `${Urls.ServiceEnum.checkAccNoLength}?bankId=${bankId}`;
    const res = await NetworkOps.get(url);
    this.setIsLoading(false);
    if (!res.title) {
      return { success: true, data: res[0] ? res[0] : res };
    }
    return { success: false, message: res.title };
  }

  /**
   * @description - It Uploads bank doc image, name in response will be used in saving bank details .
   */
  async uploadBankDocument(data, distributorId, countryId) {
    this.setIsLoading(true);
    const params = `?distributorId=${distributorId}&countryId=${countryId}`;
    const url = `${Urls.ServiceEnum.uploadBankDocument}${params}`;
    const res = await NetworkOps.postRaw(url, data, options);
    this.setIsLoading(false);
    if (res.data) {
      return { success: true, data: res.data };
    }
    return { success: false, message: res.title };
  }

  async saveBankDetails(data) {
    this.setIsLoading(true);
    const url = Urls.ServiceEnum.saveBankDetails;
    const res = await NetworkOps.postToJson(url, data);
    this.setIsLoading(false);
    if (res.data) {
      // if(res.data == 'BANK details verified successfully.'){
      return { success: true, data: res.data };
      // }
      // else{
      //   return { success: false, message: res.data }
      // }
    } else {
      return { success: false, message: res.title };
    }
  }

  async dafUpload(data) {
    this.setIsLoading(true);
    const url = Urls.ServiceEnum.dafUpload;
    const res = await NetworkOps.postRaw(url, data, options);
    console.log(res);
    this.setIsLoading(false);
    if (res.message) {
      return { success: false, message: res.message };
    }
    return { success: true, message: res.Description };
  }
}
