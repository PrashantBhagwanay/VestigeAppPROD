import { observable, action, makeAutoObservable, runInAction } from 'mobx';
import NetworkOps from 'app/src/network/NetworkOps';
import * as Urls from 'app/src/network/Urls';

export default class MyConsistency {
  @observable consistencyData: any;
  @observable isLoading: boolean = true;
  @observable vouchersList = [];
  @observable invoiceInfoList = [];
  @observable invoiceDate = '';
  @observable errorMessage: String = '';
  
  constructor(store) {
    this.store = store;
    makeAutoObservable(this);
  }

  @action setConsistencyData = value =>{this.consistencyData=value}
  @action setIsLoading= value =>{this.isLoading=value}
  @action setVouchersList = value =>{this.vouchersList=value}
  @action setInvoiceInfoList= value =>{this.invoiceInfoList=value}
  @action setInvoiceDate= value =>{this.invoiceDate=value}
  @action setErrorMessage= value =>{this.errorMessage=value}

  async fetchConsistencyDetail() {
    this.setIsLoading(true)
    const res = await NetworkOps.get(`${Urls.ServiceEnum.consistencyDetail}${this.store.auth.distributorID}`);
    this.setIsLoading(false);
    if(!res.message) {
      return { success: true, data: res}
    }
    return { success: false, message: res.message}
  }

 
  async getSkipMonthData() {
    this.setIsLoading(true)
    const url = `${Urls.ServiceEnum.Distributor}/${this.store.auth.distributorID}/skip-month`
    const res = await NetworkOps.get(url)
    this.setIsLoading(false)
    console.log(res)
    if(!res.message) {
      return { success: true, data: res }
    }
    return { success: false, message: res.message}
  }

  async putSkipMonth(businessMonth) {
    // this.isLoading=true
    const url = `${Urls.ServiceEnum.Distributor}/${this.store.auth.distributorID}/skip-month?businessMonth=${businessMonth}`
    const res = await NetworkOps.putToJson(url)
    console.log(res)
    if(!res.message) {
      return { success: true, data: res }
    }
    return { success: false, message: res.message}
  }

  async fetchMyConsistencyData() {
    this.setIsLoading(true);
    const res = await NetworkOps.get(`${Urls.ServiceEnum.Distributor}/${this.store.auth.distributorID}/${Urls.DistributorServiceEnum.Consistency}`);
    this.setIsLoading(false);
    if(!res.message){
      this.setConsistencyData(res.consistencyData);
      this.setVouchersList(res.vouchersDetail ? res.vouchersDetail : []);
      this.setInvoiceInfoList(res.qualifyInvoiceInfo ? res.qualifyInvoiceInfo.reverse() : []);
      return true;
    }
    this.setErrorMessage(res.message);
    return false
  }

  async redeemVoucher(item){
    this.setIsLoading(true);
    const res = await NetworkOps.postToJson(`${Urls.ServiceEnum.Distributor}/${this.store.auth.distributorID}/${Urls.DistributorServiceEnum.CncVoucher}?invoiceDate=${item.businessMonth}&combinationId=${item.combinationId}`,{});
    this.setIsLoading(false);
    if(res.length) {
      setTimeout(()=>{
        alert('Voucher has been generated successfully')
      },200)
    }
  }

  @action reset() {
    runInAction(() => {
      this.setVouchersList([]);
      this.setInvoiceInfoList([]);
      this.setErrorMessage('');
      this.setConsistencyData(undefined);
    })
  }
}
