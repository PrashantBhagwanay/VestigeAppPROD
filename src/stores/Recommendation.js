//@flow

import { observable, makeAutoObservable, action } from 'mobx';
import NetworkOps from 'app/src/network/NetworkOps';
import * as Urls from 'app/src/network/Urls';

export default class Recommendation {
  @observable isLoading: boolean = false;
  @observable recommendationData={};
  @observable responseMessage = '';

  constructor(store: any) {
    this.store = store;
    makeAutoObservable(this);
  }
    
  @action setIsLoading = value => {this.isLoading=value}
  @action setRecommendationData = value => {this.recommendationData = value}
  @action setResponseMessage = value => {this.responseMessage=value}

  async fetchRecommendationData(type: string, value: string) {
    this.setIsLoading(true);
    let url;
    switch(type) {
      case 'desiredLevel': {
        url = `${Urls.ServiceEnum.Recommendation}/${this.store.auth.distributorID}/${Urls.DistributorServiceEnum.desiredLevelParams}${value}`;
        break;
      }
      case 'desiredPercentage': {
        url = `${Urls.ServiceEnum.Recommendation}/${this.store.auth.distributorID}/${Urls.DistributorServiceEnum.desiredPercentageParams}${value}`;
        break;
      }
    }
    const res = await NetworkOps.get(url);
    this.setIsLoading(false);
    if(!res.message) {
      this.setRecommendationData(type === 'desiredPercentage' ? res.data : res);
      return true;
    }
    else {
      this.setResponseMessage(res.message);
      return false;
    }
  }
}