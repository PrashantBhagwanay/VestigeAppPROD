/**
 * @description MyFunds Store, calling api and some actions defined here
*/

import { observable, action } from 'mobx';
import NetworkOps from 'app/src/network/NetworkOps';
import * as Urls from 'app/src/network/Urls';
  
export default class GraphPv {
  @observable graphPvValue = [];
  @observable isLoading: boolean = false

  constructor(store){ 
    this.store = store;
  }
  
  @action setGraphPvValue = value=> {this.graphPvValue=value}
  @action setIsLoading = value=> {this.isLoading=value}

  async setGraphData() {
    this.setIsLoading(true);
    const url = `${Urls.ServiceEnum.Distributor}/${this.store.auth.distributorID}/${Urls.DistributorServiceEnum.PointHistory}`
    const res = await NetworkOps.get(url);
    this.setIsLoading(false);
    if(!res.message && res.length > 0){
      this.setGraphPvValue(res);
    }
  }
  
  @action reset() {
    this.setGraphPvValue([]);
  }
}