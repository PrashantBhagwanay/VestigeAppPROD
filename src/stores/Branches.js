import { observable, action, makeAutoObservable } from 'mobx';
import NetworkOps from 'app/src/network/NetworkOps';
import * as Urls from 'app/src/network/Urls';

export default class Branches {
  @observable branchAddress: string;
  @observable countryList = [];
  @observable branchDetails: Array<any> = [];
  @observable isLoading: Boolean = false;
  @observable selectedBranchState = {};
  @observable selectedBranchCity = {};
  @observable selectedBranchCountry = {};

  constructor(store) {
    this.store = store;
    makeAutoObservable(this);
  }

  @action setBranchAddress = value => (this.branchAddress = value);
  @action setCountryList = value => (this.countryList = value);
  @action setBranchDetails = value => (this.branchDetails = value);
  @action setIsLoading = value => (this.isLoading = value);
  @action setSelectedBranchState = value => (this.selectedBranchState = value);
  @action setSelectedBranchCity = value => (this.selectedBranchCity = value);
  @action setSelectedBranchCountry = value =>
    (this.selectedBranchCountry = value);

  @action async fetchBranchDetails(branchType, stateId, cityId) {
    this.setIsLoading(true);
    const url = `${Urls.ServiceEnum.BranchDetails}${branchType}&stateId=${stateId}&cityId=${cityId}`;
    const res = await NetworkOps.get(url);
    this.setIsLoading(false);
    if (!res.message) {
      this.setBranchDetails(res)
      // console.log(this.branchDetails.slice());
      return { success: true };
    }
    return { success: false, message: res.message };
  }
}
