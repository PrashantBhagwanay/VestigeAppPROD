import { observable, action, computed, makeAutoObservable } from 'mobx';
import NetworkOps from 'app/src/network/NetworkOps';
import * as Urls from 'app/src/network/Urls';

export default class Faq {
    @observable isLoading: Boolean = false;
    @observable faqResultList: Array = [];
    @observable faqSearchedResultList: Array = [];
    @observable searchInputValue: string = '';

    constructor(store) {
      this.store = store;
      makeAutoObservable(this);
    }

    @action setIsLoading = value => {this.isLoading=value}
    @action setFaqResultList= value => {this.faqResultList=value}
    @action setFaqSearchedResultList= value => {this.faqSearchedResultList=value}
    @action setSearchInputValue= value => {this.searchInputValue=value}

    @action async fetchFaqSearchResults(value: String='') {
      this.setIsLoading(true);
      const url = `${Urls.ServiceEnum.Faq}${value}`;
      const res = await NetworkOps.get(url);
      this.setIsLoading(false);
      if(!res.message) {                                                                                                                                                                                                                                              
        this.setFaqResultList(res);
        this.setFaqSearchedResultList(res);
        return { success: true }
      }
      return { success: false, message: res.message }
    }

    @action async changeInputValue(val) {
      this.setSearchInputValue(val);
      console.log(this)
      await this.fetchFaqSearchResults(this.searchInputValue)
    }

    resetFaqSearchedResultList() {
      this.setFaqSearchedResultList([]);
    }
}