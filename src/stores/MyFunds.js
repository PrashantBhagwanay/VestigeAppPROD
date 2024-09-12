import { observable, action, makeAutoObservable, runInAction } from 'mobx';
import NetworkOps from 'app/src/network/NetworkOps';
import * as Urls from 'app/src/network/Urls';

export default class MyFunds {
  @observable carFund = [];
  @observable travelFund = [];
  @observable houseFund = [];
  @observable isLoading: boolean = false;

  // DONOT DELETE THIS
  constructor(store) {
    this.store = store;
    makeAutoObservable(this);
  }

  @action setCarFund = value => {
    this.carFund = value;
  };
  @action setTravelFund = value => {
    this.travelFund = value;
  };
  @action setHouseFund = value => {
    this.houseFund = value;
  };
  @action setIsLoading = value => {
    this.isLoading = value;
  };

  async fetchFundsData() {
    this.setIsLoading(true);
    this.getFundsData('carFund', 'car');
    this.getFundsData('travelFund', 'travel');
    await this.getFundsData('houseFund', 'house');
    this.setIsLoading(false);
  }

   
  getFundsData = async (fundType, apiKey) => {
    const url = `${Urls.ServiceEnum.DistributorV2}/${this.store.auth.distributorID}/${Urls.DistributorServiceEnum.MyFundsDetails}`;
    let res = await NetworkOps.get(`${url}${apiKey}`);
    if (!res.message && res.length > 0) {
      this[fundType] = res;
    }
  };

  @action reset() {
    this.setCarFund([]);
    this.setTravelFund([]);
    this.setHouseFund([]);
  }
}
