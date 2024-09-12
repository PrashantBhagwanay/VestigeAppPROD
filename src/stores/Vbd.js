/**
 * @description VbdStore Store, calling api and some actions defined here
*/
import {
  observable,
  action,
  makeAutoObservable,
} from 'mobx';
import NetworkOps from 'app/src/network/NetworkOps';
import * as Urls from 'app/src/network/Urls';
import { _ } from 'lodash';

export default class Vbd {
  @observable isLoading = false;
  @observable vbdStoresData = [];
  @observable storeId = 0;
  @observable state = '' || 'Bihar'  //get stateName from location store

  constructor(store) {
    this.store = store;
    makeAutoObservable(this);
  }

  @action setIsLoading = value => {this.isLoading=value};
  @action setVbdStoresData = value => {this.vbdStoresData=value};
  @action setStoreId = value => {this.storeId=value};
  @action setState = value => {this.state=value};

  @action fetchVbdStoresData = async (stateName) => {
    const data = {
      state: stateName
    };
    this.setIsLoading(true);
    const res = await NetworkOps.postToJson(Urls.ServiceEnum.GetAllStoresByState, data);
    if(res.data && res.data.length > 0)
      this.setVbdStoresData( _.orderBy(res.data, ['warehouseName'],['asc']));
    this.setIsLoading(false);
    return this.vbdStoresData
  }
}