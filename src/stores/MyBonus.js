/**
 * @description MyBonus Store api calling
*/

import { observable, computed, makeAutoObservable, action } from 'mobx';
import NetworkOps from 'app/src/network/NetworkOps';
import * as Urls from 'app/src/network/Urls';
import { priceWithCurrency, commaSeperateAmount } from 'app/src/utility/Utility';
import moment from 'moment';
import { _ } from 'lodash';

var bonusTitle = {
  performanceBonus:'Performance Bonus',
  directorBonus:'Director Bonus',
  leadershipBonus:'Leadership Bonus',
  travelFund:'Travel Fund',
  carFund:'Car Fund',
  houseFund:'House Fund',
  schemeFund:'Scheme Fund',
  totalPayable: 'Total Payable',
  tds: 'TDS',
  netPay:'Net Pay',
  // eliteBonus: 'Elite Bonus'
}
  
const transferTitle = {
  bvm:'Bonus Month', 
  paid:'Net Pay',
  modeOfPayment: 'Type',
  vchChqNo:'Cheque/Voucher No',
  chqDate:'Cheque Date',
}

export default class MyBonus {
  
  @observable isLoading: boolean = false;
  @observable transferData = {};
  @observable bonusData = {};

  constructor(store) {
    this.store = store;
    makeAutoObservable(this);
  }
  
  @action setIsLoading = value => {this.isLoading=value}
  @action setTransferData = value => {this.transferData=value}
  @action setBonusData = value => {this.bonusData=value}

  async fetchBonusDetails(distributorId, year_month) {
    this.setIsLoading(true);
    const url = `${Urls.ServiceEnum.BonusDetails}${distributorId}/${'bonus-detail?yearmonth='}${year_month}`
    const response = await NetworkOps.get(url);
    this.setIsLoading(false);
    if(!response.message) {
      this.setBonusData(response)
      if(response.directorBonusLabel) {
        bonusTitle['directorBonus'] = response.directorBonusLabel
      }
      if(this.bonusData['eliteBonus'] == '0') {
        delete bonusTitle['eliteBonus']
      }
      else {
        bonusTitle = this.addKey('eliteBonus','Elite Club Bonus', bonusTitle, 7);
      }
      if(this.bonusData['teamBuildingBonus'] == '0') {
        delete bonusTitle['teamBuildingBonus']
      }
      else {
        const position = Object.keys(bonusTitle).length === 10 ? 7 : 8;
        bonusTitle = this.addKey('teamBuildingBonus','Team Building Bonus', bonusTitle, position);
      }
      if(this.bonusData['teamBuildingBonus'] == '0') {
        delete bonusTitle['teamBuildingBonus']
      }
      else {
        const position = Object.keys(bonusTitle).length === 10 ? 7 : 8;
        bonusTitle = this.addKey('teamBuildingBonus','Team Building Bonus', bonusTitle, position);
      }
    } 
    else {
      this.setBonusData({});
    }
  }

  addKey(key,value,currentObject,position){
    return Object.keys(currentObject).reduce((newObject,newKey,index) => {
      if(index === position) newObject[key] = value;
      newObject[newKey] = currentObject[newKey]; 
      return newObject;
    },{})
  }

  @computed get generatedBonusDetailData(){
    let generatedBonusDetails = [];
    const isBonusData = !Object.values(this.bonusData).every(o => !o)
    if(isBonusData) {
      for(const title in bonusTitle) {
        const object = {
          title: bonusTitle[title],
          value: this.bonusData[title]
        }
        generatedBonusDetails.push(object);
      }
    }
    return generatedBonusDetails;
  }

  async fetchTransferDetails(distributorId, year_month) {
    this.setIsLoading(true);
    const url = `${Urls.ServiceEnum.Distributor}/${distributorId}/${Urls.DistributorServiceEnum.PayoutsMonthly}${year_month}`
    const response = await NetworkOps.get(url);
    this.setIsLoading(false);
    if(!response.message){
      this.setTransferData(response);
    }
    else {
      this.setTransferData({});
    }
  }

  @computed get generatedTransferDetailData():Array {
    let generatedTransferDetails = [];
    if(!_.isEmpty(this.transferData)) {
      for(const title in transferTitle){        
        let transferValue = this.transferData[title]
        // if(transferTitle[title] === 'Net Pay') {
        //   transferValue = this.transferData[title] ? commaSeperateAmount(priceWithCurrency(this.transferData[title].toFixed(2))) : ''
        // } 
        // else if (transferTitle[title] === 'Cheque Date') {
        //   transferValue = (this.transferData[title] && this.transferData[title] !== '') ? moment(this.transferData[title]).format('DD-MMM-YYYY') : ''
        // }
        if (transferTitle[title] === 'Cheque/Voucher No') {
          transferValue = this.transferData['chqNo']
          if(this.transferData['vchChqNo'] !== '') {
            transferValue = this.transferData['vchChqNo']
          }
        }
  
        const object = {
          title: transferTitle[title],
          value: transferValue
        }
        generatedTransferDetails.push(object);
      }
    }
    return generatedTransferDetails;
  }
}