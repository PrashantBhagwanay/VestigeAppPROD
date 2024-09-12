/**
 * @description MyBonus Store api calling
*/

import { observable, computed, makeAutoObservable, action } from 'mobx';
import NetworkOps from 'app/src/network/NetworkOps';
import * as Urls from 'app/src/network/Urls';

const options = { headerOverrides: { 'Content-Type': 'multipart/form-data' } };


export default class B2CFlow {
  
  @observable isLoading: boolean = false;
  @observable B2CUserList = [];
  @observable pendingListForMyMobile = [];

  constructor(store) {
    this.store = store;
    makeAutoObservable(this);
  }
  
  @action setIsLoading = value => {this.isLoading=value}
  @action setB2CUserList = value => {this.B2CUserList=value}
  @action setPendingListForMyMobile = value => {this.pendingListForMyMobile=value}


  // get b2c user list for UCD user on pending request for mobile
   getUserB2cUserList= async(distributorId,type) =>{
    const formdata = new FormData();
    formdata.append("distributorId", distributorId);
     formdata.append("type", type);
   console.log("data==>"+JSON.stringify(formdata));
    this.setIsLoading(true);
    const url = Urls.ServiceEnum.b2cUserPendingList
    const response = await NetworkOps.postRaw(url,formdata,options);
    this.setIsLoading(false);
    if(!response.message) {
        this.setB2CUserList(response)  
    }
  }


  // set Mobile Number request for other user
  setB2CMobileNoRequest= async(distributorId,type,reqAcceptBy) =>{
    const formdata = new FormData();
    formdata.append("distributorId", distributorId);
     formdata.append("type", type);
     formdata.append("reqRaisedBy", reqAcceptBy);
   
    this.setIsLoading(true);
    const url = Urls.ServiceEnum.requestForMobileNoShare
    const response = await NetworkOps.postRaw(url,formdata,options);
    this.setIsLoading(false);
    if(!response.message) {
        return true
    }else{
        return false
    }
  }

   // set Approved for my mobile number 
  setApproveRequestForMobileNo= async(distributorId,type,reqAcceptBy) =>{
    const formdata = new FormData();
    formdata.append("distributorId", distributorId);
     formdata.append("type", type);
     formdata.append("reqAcceptBy", reqAcceptBy);
   
    this.setIsLoading(true);
    const url = Urls.ServiceEnum.requestAcceptMobileApi
    const response = await NetworkOps.postRaw(url,formdata,options);
    this.setIsLoading(false);
    if(!response.message) {
        return true
    }else{
        return false
    }
  }


 // get UCD user list for mobile number on B2Cuser for approved
  getPendingListForMyMobile= async(distributorId,type) =>{
    const formdata = new FormData();
    formdata.append("distributorId", distributorId);
     formdata.append("type", type);
   console.log("data==>"+JSON.stringify(formdata));
    this.setIsLoading(true);
    const url = Urls.ServiceEnum.pendingListForMyMobileNo
    const response = await NetworkOps.postRaw(url,formdata,options);
    this.setIsLoading(false);
    if(!response.message) {
        this.setPendingListForMyMobile(response)  
    }
  }
  


}