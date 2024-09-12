//@flow

import { observable, makeAutoObservable, action } from 'mobx';
import NetworkOps from 'app/src/network/NetworkOps';
import * as Urls from 'app/src/network/Urls';
import { strings } from "app/src/utility/localization/Localized";

export default class MyVoucher {

  @observable isLoading: boolean = false;
  @observable productVouchersList = [];
  @observable bonusVouchersList = [];
  @observable responseMessage: String;

  constructor(store) {
    this.store = store;
    makeAutoObservable(this);
  }
 
  @action setIsLoading = value=>{this.isLoading=value}
  @action setProductVouchersList = value=>{this.productVouchersList=value}
  @action setBonusVouchersList = value=>{this.bonusVouchersList=value}
  @action setResponseMessage= value=>{this.responseMessage=value}

  async getVouchersData() {
    this.setIsLoading(true);
    const url = `${Urls.ServiceEnum.Distributor}/${this.store.auth.distributorID}/${Urls.DistributorServiceEnum.MyVouchers}`
    const res = await NetworkOps.get(url);
    this.setIsLoading(false);
    if(!res.message) {
      this.setProductVouchersList(res.productVouchers);
      this.setBonusVouchersList(res.bonusVouchers);
      return true
    }
    this.setResponseMessage(res.message);
    return false;
  }

  async renewVoucher(voucherType,voucherNo){
    this.setIsLoading(true);
    const params = `?distributorId=${this.store.auth.distributorID}&voucherType=${voucherType}&voucherNo=${voucherNo}`;
    const url = `${Urls.ServiceEnum.renewVoucher}${params}`;
    const res = await NetworkOps.get(url);
    this.setIsLoading(false);
    if(!res.message){
      if(res.statusCode == '1'){
        return {success: true, message: res.statusMessage || `${strings.commonMessages.somethingWentWrong}${strings.commonMessages.tryAgain}`}
      }
      else{
        return {success:false, message: res.statusMessage}
      }
    }
    else{
      return {success:false, message: res.message}
    }
  }

  reset() {
    this.setProductVouchersList([]);
    this.setBonusVouchersList([]);
  }
}