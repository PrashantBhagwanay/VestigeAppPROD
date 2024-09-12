import { observable, action, makeAutoObservable } from 'mobx';
import NetworkOps from 'app/src/network/NetworkOps';
import * as Urls from 'app/src/network/Urls';

export default class MobileNumberUpdate {
    @observable isLoading: Boolean = false;

    constructor(store) {
      this.store = store;
      makeAutoObservable(this);
    }

    @action setIsLoading = value =>{this.isLoading=value}

    async fetchMobileNumberUpdateStatus() {
      this.setIsLoading(true);
      const url = `${Urls.ServiceEnum.checkMobileNumberUpdateStatus}${this.store.auth.distributorID}`;
      const res = await NetworkOps.get(url);
      this.setIsLoading(false);
      if(res.message){
        return {success: false, message: res.message}
      }
      else if(res.status === '1'){
        return {success : true, data: res}
      }
      else{
        return {success: false, data: res }
      }
    }

    async sendOtpToUpdateNumber(mobileNumber, resendType) {
      this.setIsLoading(true);
      const params = `?distributorNewMob=${mobileNumber}&resendType=${resendType}`;
      const url = `${Urls.ServiceEnum.sendOtpToUpdateNumber}${this.store.auth.distributorID}${params}`;
      const res = await NetworkOps.get(url);
      this.setIsLoading(false);
      if(!res.message && res.statusMessage?.toUpperCase() === 'SUCCESS'){
        return {success : true, data: res}
      }
      else{
        return {success: false, message: res.message ? res.message : res.statusMessage }
      }
    }

    async updateMobileNumber(mobileNumber, existingNumberOTP, newNumberOTP) {
      this.setIsLoading(true);
      const params = `?distributorMob=${mobileNumber}&registeredOtp=${existingNumberOTP}&newPhoneOtp=${newNumberOTP}`
      const url = `${Urls.ServiceEnum.updateMobileNumber}${this.store.auth.distributorID}${params}`;
      const res = await NetworkOps.get(url);
      this.setIsLoading(false);
      if(!res.message && res.statusMessage?.toUpperCase() === 'SUCCESS'){
        return {success : true, data: res}
      }
      else{
        return {success: false, message: res.message ? res.message : res.statusMessage }
      }
    }
}