import {
  observable,
  action,
  computed,
  makeAutoObservable,
  runInAction,
} from 'mobx';
import NetworkOps from 'app/src/network/NetworkOps';
import * as Urls from 'app/src/network/Urls';
import * as AsyncStore from 'app/src/utility/AsyncStoragesUtils';
import { SESSION_CONSTANT } from 'app/src/utility/constant/Constants';
import { strings } from 'app/src/utility/localization/Localized';
import { ProductModel } from './models/ProductModel';

const RECENTSEARCHRESULTS = AsyncStore.addPrefix('RecentSearchList');

export default class Search {
  @observable isLoading: boolean = false;
  @observable searchInputValue: string = '';
  @observable searchResultsList = [];
  @observable recentSearchResults = [];
  @observable noResultsFound: boolean = false;
  @observable initialQuantity = 1;
  @observable searchResultSuggestions = [];

  // @computed get showClearIcon() {
  //   if(this.searchInputValue){
  //     return true;
  //   }
  //   return false;
  // }

  constructor(store) {
    this.store = store;
    makeAutoObservable(this);
    this.init();
    this.timeout = 0;
  }

  @action setIsLoading = value => {
    this.isLoading = value;
  };
  @action setSearchInputValue = value => {
    this.searchInputValue = value;
  };
  @action setSearchResultsList = value => {
    this.searchResultsList = value;
  };
  @action setRecentSearchResults = value => {
    this.recentSearchResults = value;
  };
  @action setNoResultsFound = value => {
    this.noResultsFound = value;
  };
  @action setInitialQuantity = value => {
    this.initialQuantity = value;
  };
  @action setSearchResultSuggestions = value => {
    this.searchResultSuggestions = value;
  };

  async init() {
    const asyncStoreData = await AsyncStore.get(RECENTSEARCHRESULTS);
    this.setRecentSearchResults(
      this.recentSearchResults.length
        ? this.recentSearchResults
        : JSON.parse(asyncStoreData) || [],
    );
  }

  // @action clearData = () => {
  //   setTimeout( () => {
  //     this.searchResultSuggestions = [];
  //     this.searchResultsList = [];
  //     this.noResultsFound = false;
  //   }, 100 )
  // }

  @action async fetchSearchResults() {
    // this.store.products.updateNewSession(SESSION_CONSTANT.time)
    const queryParams = `?${this.store.profile.location}&countryId=${this.store.profile.defaultAddressCountryId}&isNewSession=${this.store.products.isNewSession}&q=search=`;
    this.setSearchResultSuggestions([]);
    this.setNoResultsFound(false);
    try {
      // if(this.searchInputValue.trim().length > 3) {
      // this.setIsLoading(true);
      // this.initialQuantity = 1;
      const url = `${
        Urls.ServiceEnum.ProductList
      }${queryParams}${this.searchInputValue.trim()}`;
      const res = await NetworkOps.get(url);
      this.setSearchResultSuggestions([]);
      if (!res.length) {
        this.setIsLoading(false);
        this.setNoResultsFound(true);
        this.setSearchResultsList([]);
      } else {
        // this.store.products.updateNewSession(SESSION_CONSTANT.session)
        // this.initialQuantity = 1;
        const data = res.slice(0, 10).map(viewCart => {
          return new ProductModel(viewCart, viewCart.itemCountryId);
        });
        // this.initialQuantity = 1;
        this.setSearchResultsList(data);
        console.log(this.searchInputValue);
        const item = {
          url: this.searchResultsList[0].imageUrl,
          name: this.searchInputValue.split(' ').slice(0, 2).join(' '),
        };
        // let d_level = await AsyncStore.get(DEPTHLEVEL )
        // var depthLevel = d_level ? parseInt(d_level) : 0;
        // let hLevel = item.hierarchyLevel ? parseInt(item.hierarchyLevel) : 0
        // if((depthLevel < hLevel) && this.store.profile.countryId == 2){
        //   this.toast("You can't access more downline's.", Toast.type.ERROR)
        //   return
        // }
        // *****************Saving the recent search items in AsyncStorage.************************
        if (this.recentSearchResults.length <= 8) {
          let arr = [];
          this.recentSearchResults.forEach(item => {
            arr.push(item.name);
          });
          if (!arr.includes(item.name)) {
            this.recentSearchResults.push(item);
            await AsyncStore.set(
              RECENTSEARCHRESULTS,
              JSON.stringify(this.recentSearchResults),
            );
          }
        } else {
          this.recentSearchResults.shift();
          this.recentSearchResults.unshift(item);
          await AsyncStore.set(
            RECENTSEARCHRESULTS,
            JSON.stringify(this.recentSearchResults),
          );
        }
        this.setIsLoading(false);
        this.setNoResultsFound(false);
      }
      // }
      // else {
      //   alert(strings.commonMessages.searchLimit)
      // }
    } catch (error) {
      console.log(error);
      this.setIsLoading(false);
    }
  }

  @action async fetchSearchSuggestions(value) {
    this.setSearchInputValue(value);
    // this.store.products.updateNewSession(SESSION_CONSTANT.time)
    if (this.searchInputValue.trim().length >= 3) {
      // this.fetchSearchResults()
      if (this.timeout) clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        // this.initialQuantity = 1;
        this.fetchSearchResults();
      }, 1000);
    }
    // this.searchResultsList = [];
    // this.noResultsFound = false;
    // const queryParams = `?${this.store.profile.location}&page=0&size=10&isNewSession=false&q=search=`;
    // if(this.searchInputValue.trim().length>=3) {
    //   const url = `${Urls.ServiceEnum.ProductList}${queryParams}${this.searchInputValue}`;
    //   const res = await NetworkOps.get(url);
    //   if(!res.message) {
    //     // this.store.products.updateNewSession(SESSION_CONSTANT.session)
    //     this.searchResultSuggestions = res;
    //   }
    // }
    // else {
    //   this.searchResultsList = [];
    //   this.noResultsFound = false;
    //   // this.clearData();
    // }
  }

  @action reset() {
    this.setRecentSearchResults([]);
    this.setSearchResultSuggestions([]);
    this.setSearchResultsList([]);
    this.setSearchInputValue('');
    this.setNoResultsFound(false);
  }
}
