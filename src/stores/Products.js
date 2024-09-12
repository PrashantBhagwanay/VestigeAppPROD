import { observable, computed, action, makeAutoObservable, runInAction } from 'mobx';
import NetworkOps from 'app/src/network/NetworkOps';
import * as Urls from 'app/src/network/Urls';
import * as AsyncStore from 'app/src/utility/AsyncStoragesUtils';
import { strings } from 'app/src/utility/localization/Localized';
import { SESSION_CONSTANT } from 'app/src/utility/constant/Constants';
import { ProductModel, ProductDetails } from './models/ProductModel';

const ISNEWSESSION = AsyncStore.addPrefix('new_Session');
const LASTSESSIONUPDATETIME = AsyncStore.addPrefix('last_Session_UpdateTime');
const options = { headerOverrides: { 'Content-Type': 'multipart/form-data' } };

export default class Product {
  @observable isLoading: boolean = false;
  @observable showChangeAddressPrompt = false;
  @observable isChangeAddressPromptVisible = false;
  @observable productFeedbackResponse;
  @observable isProductLoading: boolean = false;
  @observable productList: Array<any> = [];
  @observable refreshList: Array<any> = [];
  @observable productWidget: Object<any> = {};
  @observable productWidgetCNC: Object<any> = {};
  @observable refreshWidget: Object<any> = {};
  @observable productDetails: string = '';
  @observable refreshProductDetails: string = '';
  @observable queryMessage:string = '';
  @observable lazyLoadUrl: string = '';
  @observable lazyLoadPage: string = 1;
  @observable notifiedStatus: boolean = true;
  @observable recentlyViewed: Array<any> = [];
  @observable recentlyViewedArray: Array<any> = [];
  @observable query: string = '';
  @observable sortingQuery: string = '';
  @observable pvRangeBar: Array<any> = []
  @observable fetchFilters: boolean = true
  @observable isNewSession: string = 'true'
  @observable isTimeOut: string = ''
  @observable initialUrl: string = ''
  @observable filterMessage: string = ''
  @observable keyValue: string = '0-25'
  @observable productReviewImageUri = ''
  @observable frequentlyBoughtTogether = []
  @observable orderFeedbackResponse: Object<any> = {};
  @observable productReviewVideoUri = ''
  @observable resolvedArray: Array = [];
  @observable productCatalogue = '';
  @observable isProductCatalogueActive = false;
  @observable filter: Object<any>  = {
    'brands':[],
    'categories': [],
    'pv': {}, 
    'price': {},
    'selectedPrice':{},
    'selectedPv' : {} 
  };
  @observable staticFilter: Object<any>  = {
    'brands':[],
    'categories': [],
    'pv': {}, 
    'price': {},
    'selectedPrice':{},
    'selectedPv' : {} 
  };

  defaultFilter = {
    'brands':[],
    'categories': [],
    'pv': {}, 
    'price': {},
    'selectedPrice':{},
    'selectedPv' : {} 
  }

  constructor(store) {
    this.store = store;
    makeAutoObservable(this);
  }

  @action setIsLoading = value => (this.isLoading = value);
  @action setShowChangeAddressPrompt = value => (this.showChangeAddressPrompt = value);
  @action setIsChangeAddressPromptVisible = value => (this.isChangeAddressPromptVisible = value);
  @action setProductFeedbackResponse = value =>{this.productFeedbackResponse=value}
  @action setIsProductLoading = value =>{this.isProductLoading=value}
  @action setProductList = value =>{this.productList=value}
  // @action setRefreshList = value =>{this.refreshList=value}
  @action setProductWidget = value =>{this.productWidget=value}
  @action setProductWidgetCNC = value =>{this.productWidgetCNC=value}
  @action setRefreshWidget = value =>{this.refreshWidget=value}
  @action setProductDetails = value =>{this.productDetails=value}
  @action setRefreshProductDetails = value =>{this.refreshProductDetails=value}
  @action setQueryMessage = value =>{this.queryMessage=value}
  @action setLazyLoadUrl = value =>{this.lazyLoadUrl=value}
  // @action setLazyLoadPage = value =>{this.lazyLoadPage=value}
  @action setNotifiedStatus = value =>{this.notifiedStatus=value}
  // @action setRecentlyViewed = value =>{this.recentlyViewed=value}
  // @action setRecentlyViewedArray = value =>{this.recentlyViewedArray=value}
  @action setQuery = value =>{this.query=value}
  // @action setSortingQuery = value =>{this.sortingQuery=value}
  @action setPvRangeBar = value =>{this.pvRangeBar=value}
  @action setFetchFilters = value =>{this.fetchFilters=value}
  @action setIsNewSession = value =>{this.isNewSession=value}
  @action setIsTimeOut = value =>{this.isTimeOut=value}
  // @action setInitialUrl = value =>{this.initialUrl=value}
  @action setFilterMessage = value =>{this.filterMessage=value}
  // @action setKeyValue = value =>{this.keyValue=value}
  // @action setProductReviewImageUri = value =>{this.productReviewImageUri=value}
  @action setFrequentlyBoughtTogether = value =>{this.frequentlyBoughtTogether=value}
  @action setOrderFeedbackResponse = value =>{this.orderFeedbackResponse=value}
  // @action setProductReviewVideoUri = value =>{this.productReviewVideoUri=value}
  @action setResolvedArray = value =>{this.resolvedArray=value}
  // @action setProductCatalogue = value =>{this.productCatalogue=value}
  // @action setIsProductCatalogueActive = value =>{this.isProductCatalogueActive=value}
  @action setFilter = value =>{this.filter=value}
  // @action setStaticFilter = value =>{this.staticFilter=value}

  @computed get topProducts():Array<any> {
    return this.productWidget.shopByPv.slice(0,4);
  }

  @computed get recentlyViewedProducts():Array<any> {
    return this.recentlyViewed;
  }

  @action updatePvRange = (value) => {
    this.keyValue = value;
  }

  updateNewSession = async (type) => {
    var time = new Date();
    switch (type) {
      case SESSION_CONSTANT.time: {
        if (!this.isTimeOut) {
          await AsyncStore.set(LASTSESSIONUPDATETIME, time);
        }
        else if (time - new Date(this.isTimeOut) > 18000) {
          await AsyncStore.set(LASTSESSIONUPDATETIME, time);
          await AsyncStore.set(ISNEWSESSION, 'true');
          this.setIsNewSession('true');
        }
        break;
      }
      case SESSION_CONSTANT.onLaunch: {
        this.setIsNewSession(await AsyncStore.get(ISNEWSESSION, 'true'));
        this.setIsTimeOut(await AsyncStore.get(LASTSESSIONUPDATETIME, time));
        break;
      }
      case SESSION_CONSTANT.session: {
        if (!this.isNewSession) {
          await AsyncStore.set(ISNEWSESSION, 'true');
          this.setIsNewSession('true');
        }
        else if (this.isNewSession === 'true') {
          await AsyncStore.set(ISNEWSESSION, 'false');
          this.setIsNewSession('false');
        }
        break;
      }
      default: {
        await AsyncStore.set(LASTSESSIONUPDATETIME, time);
        await AsyncStore.set(ISNEWSESSION, 'true');
        this.setIsNewSession('true');
      }
    }
  }

  async fetchProductList(type, param, extraData) {
    runInAction(() => {
      this.setIsLoading(true);
      this.setQuery('');
      this.resetFilters();
      // this.updateNewSession(SESSION_CONSTANT.time)
      this.lazyLoadPage = 1;
      this.productList = this.refreshList = [];
    });
    let url;
    const locationCountryParam = `${this.store.profile.location}&countryId=${this.store.profile.defaultAddressCountryId}`;
    try {
      switch (type) {
        case 'location': {
          param = `&isNewSession=${this.isNewSession}`;
          url = `${Urls.ServiceEnum.ProductList}?${locationCountryParam}${param}`;
          break;
        }
        case 'shopByPv': {
          this.setQuery(encodeURIComponent(`pvRange=${param}`));
          if (extraData) {
            this.setQuery(`${this.query},${extraData}`);
          }
          url = `${Urls.ServiceEnum.ProductList}?${locationCountryParam}&isNewSession=${this.isNewSession}&q=${this.query}`;
          break;
        }
        case 'shopByCNC': {
          this.setQuery(encodeURIComponent(`pvRange=${param}`));
          if (extraData) {
            this.setQuery(`${this.query},${extraData}`);
          }
          url = `${Urls.ServiceEnum.ProductList}?${locationCountryParam}&isNewSession=${this.isNewSession}&q=cncApplicability=1`;
          break;
        }
        case 'brandStore': {
          this.setQuery(encodeURIComponent(`brand.brandId=${param}`));
          url = `${Urls.ServiceEnum.ProductList}?${locationCountryParam}&isNewSession=${this.isNewSession}&q=${this.query}`;
          break;
        }
        case 'search': {
          this.setQuery(encodeURIComponent(`search=${param}`));
          url = `${Urls.ServiceEnum.ProductList}?${locationCountryParam}&isNewSession=${this.isNewSession}&q=${this.query}`;
          break;
        }
        case 'banner': {
          this.setQuery(encodeURIComponent(param));
          url = `${Urls.ServiceEnum.ProductList}?${locationCountryParam}&isNewSession=${this.isNewSession}&q=${this.query}`;
          break;
        }
        case 'subCategoryList': {
          this.setQuery(encodeURIComponent(param));
          url = `${Urls.ServiceEnum.ProductList}?${locationCountryParam}&isNewSession=${this.isNewSession}&q=${this.query}`;
          break;
        }
        default: {
          this.setQuery(encodeURIComponent(`categoryId=${param}`));
          url = `${Urls.ServiceEnum.ProductList}?${locationCountryParam}&isNewSession=${this.isNewSession}&q=${this.query}`;
          break;
        }
      }
      if (type === 'location') {
        runInAction(() => {
          this.lazyLoadUrl = this.initialUrl = url = `${url}&q=`;
        });
      }
      else {
        runInAction(() => {
          this.lazyLoadUrl = this.initialUrl = url;
        }) 
      }
      const res = await NetworkOps.get(`${url},${Urls.DistributorServiceEnum.InventorySort}`);
      if (!res.message && res.length > 0) {
        const data = await res.map((viewCart) => {
          return new ProductModel(viewCart, viewCart.itemCountryId);
        });
        runInAction(() => {
          this.productList = this.refreshList = data;
        })
        // this.updateNewSession(SESSION_CONSTANT.session)
      }
      this.setIsLoading(false);
    }
    catch (error) {
      this.setIsLoading(false);
    }
  }

  async fetchProductDetails(skuCode, locationId) {
    this.setNotifiedStatus(true);
    // this.updateNewSession(SESSION_CONSTANT.time)
    this.setIsLoading(true);
    let substituteProducts;
    let relatedProducts;
    let recommendedProducts;
    try {
      const params = `?locationId=${locationId}&countryId=${this.store.profile.defaultAddressCountryId}`;
      const res = await NetworkOps.get(`${Urls.ServiceEnum.ProductDetail}/${skuCode}${params}`);
      if (!res.message) {
        if (res.relatedProducts && res.relatedProducts.length > 0) {
          relatedProducts = await res.relatedProducts?.map((viewCart) => {
            return new ProductModel(viewCart, res.itemCountryId);
          });
        }
        if (res.substituteProducts && res.substituteProducts.length > 0) {
          substituteProducts = await res.substituteProducts?.map((viewCart) => {
            
            return new ProductModel(viewCart, res.itemCountryId);
          });
        }
        if (res.recommendedProducts && res.recommendedProducts.length > 0) {
          recommendedProducts = res.recommendedProducts?.map((viewCart) => {
            return new ProductModel(viewCart, res.itemCountryId);
          });
        }
        res.relatedProducts = relatedProducts;
        res.substituteProducts = substituteProducts;
        res.recommendedProducts = recommendedProducts;
        const prodDetails = new ProductDetails(res);
        this.setRefreshProductDetails(prodDetails);
        this.setProductDetails(prodDetails);
        // this.updateNewSession(SESSION_CONSTANT.session)
      }
      else {
        this.setProductDetails('');
        this.setRefreshProductDetails('');
      }
      this.setIsLoading(false);
    }
    catch (error) {
      console.log(error)
      this.setIsLoading(false);
    }
  }

  /**
   *
   * @description it is used for resolving imageviewer in case broken image url.
   */
  async imageUrlResolve(imageArray) {
    // console.log('resimagearr',imageArray)
    this.setResolvedArray(['', '', '']);
    // let index = 1;
    await imageArray.map(async (element) => {
      const response = await fetch(element.url);
      if (response.ok) {
        runInAction(() => {
          this.resolvedArray[element.imageHierarchy] = element;
        })
        // index++;
      }
    });
    // console.log('rescheckimage2',this.resolvedArray)
  }

  async getFrequentlyBoughtTogetherProducts(productId, locationId) {
    this.setIsLoading(true);
    const res=  await NetworkOps.get(`${Urls.ServiceEnum.FrequentlyBoughtTogether}/${locationId}?productIds=${productId}`);
    this.setIsLoading(false);
    // console.log(res)
    if(!res.message) {
      const data = res.map( item => new ProductModel(item, item.itemCountryId) )
      this.setFrequentlyBoughtTogether(data);
      return { success: true }
    }
    return { success: false, message: res.message }
  }

  fetchProductWidget = async (type, param, extraData) => {
    this.setShowChangeAddressPrompt(false);
    this.setIsChangeAddressPromptVisible(false);
    this.setIsLoading(true);
    //  this.updateNewSession(SESSION_CONSTANT.time)
    let url;
    const locationCountryParam = `${this.store.profile.location}&countryId=${this.store.profile.defaultAddressCountryId}`;
    switch (type) {
      case 'shopByPv': {
        url = `${Urls.ServiceEnum.ProductList}?${locationCountryParam}&isNewSession=${this.isNewSession}&q=pvRange=${param},${Urls.DistributorServiceEnum.InventorySort}`;
        break;
      }
      case 'shopByCNC': {
        url = `${Urls.ServiceEnum.ProductList}?${locationCountryParam}&isNewSession=${this.isNewSession}&q=cncApplicability=1`;
        break;
      }
      case 'isSponsored': {
        url = `${Urls.ServiceEnum.ProductList}?${locationCountryParam}&isNewSession=${this.isNewSession}&q=${Urls.DistributorServiceEnum.IsSponsored}`;
        break;
      }
      case 'isNewLaunch': {
        url = `${Urls.ServiceEnum.ProductList}?${locationCountryParam}&isNewSession=${this.isNewSession}&q=${Urls.DistributorServiceEnum.IsNewLaunch}`;
        break;
      }
      case 'mostViewed': {
        url = `${Urls.ServiceEnum.ProductList}?${locationCountryParam}&isNewSession=${this.isNewSession}&q=viewCount:DESC`;
        break;
      }
      default: {
        url = `${Urls.ServiceEnum.ProductList}?${locationCountryParam}&isNewSession=${this.isNewSession}&q=categoryId=${param}`;
        break;
      }
    }

    if (extraData) {
      url = `${url},${extraData}`;
    }
    const res = await NetworkOps.get(url);
    if (!res.message && res.length > 0) {
      const data = await res.map((viewCart) => {
        return new ProductModel(viewCart, viewCart.itemCountryId);
      });
      runInAction(() => {
      this.productWidget[type] = this.refreshWidget[type]= data;
      }) 
      //  this.updateNewSession(SESSION_CONSTANT.session)
      //  this.updateNewSession(SESSION_CONSTANT.session)
      //  this.updateNewSession(SESSION_CONSTANT.session)
    }
    else {
      runInAction(() => {
        this.productWidget[type] = this.refreshWidget[type]= [];
        }) 
      if (type === 'shopByPv' && param === '0-25') {
        this.setShowChangeAddressPrompt(true);
      }
    }
    this.setIsLoading(false);
  }

  // fetchProductCNC= async (type, param, extraData) => {
  //   this.showChangeAddressPrompt = false;
  //   this.isChangeAddressPromptVisible = false;
  //   this.isLoading = true;
  //   //  this.updateNewSession(SESSION_CONSTANT.time)
  //   const url = `${Urls.ServiceEnum.ProductList}?${this.store.profile.location}&countryId=${this.store.profile.defaultAddressCountryId}&isNewSession=${this.isNewSession}&q=cncApplicability=1`;
  //   const res = await NetworkOps.get(url);
  //   if (!res.message && res.length > 0) {
  //     const data = await res.map((viewCart) => {
  //       return new ProductModel(viewCart);
  //     })
  //     this.productWidgetCNC = data;
  //   }
  //   else {
  //     this.productWidgetCNC = [];
  //   }
  //   this.isLoading = false;
  // }

  fetchProductWidgetStoreFront = async (type, param, extraData) => {
    //  this.updateNewSession(SESSION_CONSTANT.time)
    let url;
    const locationCountryParam = `${this.store.profile.location}&countryId=${this.store.profile.defaultAddressCountryId}`;
    switch (type) {
      case 'topSelling': {
        url = `${Urls.ServiceEnum.ProductList}?${locationCountryParam}&isNewSession=${this.isNewSession}&q=isTopSellingProduct=true`
        break;
      }
      case 'isNewLaunch': {
        url = `${Urls.ServiceEnum.ProductList}?${locationCountryParam}&isNewSession=${this.isNewSession}&q=${Urls.DistributorServiceEnum.IsNewLaunch}`
        break;
      }
      case 'mostViewed': {
        url = `${Urls.ServiceEnum.ProductList}?${locationCountryParam}&isNewSession=${this.isNewSession}&q=viewCount:DESC`
        break;
      }
      default: {
        url = `${Urls.ServiceEnum.ProductList}?${locationCountryParam}&isNewSession=${this.isNewSession}&q=categoryId=${param}`
        break;
      }
    }

    if (extraData) {
      url = `${url},${extraData}`;
    }

    const res = await NetworkOps.get(url);
    if (!res.message && res.length > 0) {
      const data = await res.map((viewCart) => {
        return new ProductModel(viewCart, viewCart.itemCountryId);
      });
      //  this.updateNewSession(SESSION_CONSTANT.session)
      return data ? data : [];
    }
  }

  async updateQuery(productId, query) {
    this.setIsLoading(true);
    const data = {
      'productId': productId,
      'query': query,
      'distributorId': this.store.auth.distributorID
    };
    let url = Urls.ServiceEnum.Query
    const res = await NetworkOps.postToJson(url,data);
    if (res.message === 'success') {
      this.setQueryMessage(strings.product.queryUpdated)
    }
    this.setIsLoading(false)
    this.setQueryMessage('');
  }

  modifyRecentlyViewed() {
    if(this.recentlyViewed.length === 0) {
      this.recentlyViewed.push(this.productDetails)
      this.recentlyViewedArray.push(this.productDetails.skuCode)
    }
    else if (this.recentlyViewedArray.includes(this.productDetails.skuCode)) {
      let a = this.recentlyViewedArray.indexOf(this.productDetails.skuCode);
      this.recentlyViewed.splice(a,1);
      this.recentlyViewedArray.splice(a,1);
      this.recentlyViewed.push(this.productDetails)
      this.recentlyViewedArray.push(this.productDetails.skuCode)
    }
    else if (this.recentlyViewed.length >= 5) {
      this.recentlyViewed.shift();
      this.recentlyViewedArray.shift();
      this.recentlyViewed.push(this.productDetails);
      this.recentlyViewedArray.push(this.productDetails.skuCode);
    }
    else {
      this.recentlyViewed.push(this.productDetails);
      this.recentlyViewedArray.push(this.productDetails.skuCode);
    }
  }

  async fetchNotificationStatus(productId, productSkuCode) {
    this.setIsLoading(true);
    const data = {
      productId: productId,
      productSkuCode: productSkuCode
    };
    let url = `${Urls.ServiceEnum.ProductList}${Urls.DistributorServiceEnum.NotifyMe}`;
    const res = await NetworkOps.postToJson(url, data);
    if (res.notifyStatus === false) {
      this.setNotifiedStatus(false);
    }
    this.setIsLoading(false);
  }

  @action clearFilters() {
    this.setFilter(this.staticFilter);
  }

  @action resetFilters() {
    this.setFetchFilters(true);
    this.filter = this.staticFilter = this.defaultFilter;
  }

  async fetchFilterOptions(param) {
    this.setIsLoading(true)
    this.setFilterMessage('');
    try {
      if (this.fetchFilters) {
        const encodeUrl = encodeURIComponent(`${this.store.profile.location}`);
        const url = `${Urls.ServiceEnum.Filter}${encodeUrl},${this.query}`;
        const res = await NetworkOps.get(url);
        if (!res.message && res) {
          var brands = []
          var categories = []
          res.brands.map((userData) => {
            userData.isSelected = false;
            brands.push(userData);
          });
          res.categories.map((userData) => {
            userData.isSelected = false;
            categories.push(userData);
          });
          runInAction(() =>{
          this.staticFilter = this.filter = {
            'brands':brands,
            'categories': categories,
            'pv': res.pv, 
            'selectedPv':res.pv,
            'selectedPrice':res.price,
            'price': res.price
          }
          })
          this.setFetchFilters(false);
          if (param) {
            this.setFetchFilters(true);
          }
        }
        else {
          this.setFilterMessage(res.message);
        }
      }
      this.setIsLoading(false)
    }
    catch(error) {
      console.log(error)
      if (param) {
        this.setFetchFilters(true)
      }
      this.setIsLoading(false)
    }
  }

  pvRangeBar = async (param)  => {
    this.setPvRangeBar(param);
    if (this.pvRangeBar && this.pvRangeBar.length > 0) {
      await this.fetchProductWidget('shopByPv',this.pvRangeBar[0]);
    }
  }


  async applyFilter(brands, categories, priceRange, pvRange) {
    this.setIsLoading(true);
    let url;
    try {
      let encodeUrl;
      if (brands.length > 0 && categories.length > 0) {
        encodeUrl = encodeURIComponent(`brands=[${brands}],categories=[${categories}],priceRange=${priceRange},pvRange=${pvRange}`);
      }
      else if (brands.length === 0 && categories.length > 0) {
        encodeUrl = encodeURIComponent(`categories=[${categories}],priceRange=${priceRange},pvRange=${pvRange}`);
      }
      else if (brands.length > 0 && categories.length === 0) {
        encodeUrl = encodeURIComponent(`brands=[${brands}],priceRange=${priceRange},pvRange=${pvRange}`);
      }
      else if (!priceRange && !pvRange) {
        encodeUrl = encodeURIComponent('');
        url = `${this.initialUrl}${encodeUrl}`;
      }
      else if (!priceRange && pvRange) {
        encodeUrl = encodeURIComponent(`,pvRange=${pvRange}`);
        url = `${this.initialUrl}${encodeUrl}`;
      }
      else if (priceRange && !pvRange) {
        encodeUrl = encodeURIComponent(`,priceRange=${priceRange}`);
        url = `${this.initialUrl}${encodeUrl}`;
      }
      else {
        encodeUrl = encodeURIComponent(`,priceRange=${priceRange},pvRange=${pvRange}`);
        url = `${this.initialUrl}${encodeUrl}`;
      }
      runInAction(() => {
        this.productList = this.refreshList = [];
      })
      url = (url) ? url : `${Urls.ServiceEnum.ProductList}?${this.store.profile.location}&countryId=${this.store.profile.defaultAddressCountryId}&isNewSession=${this.isNewSession}&q=${encodeUrl}`;
     runInAction(() => {
      this.lazyLoadUrl = url;
      this.lazyLoadPage = 1;
    })
      const res = await NetworkOps.get(url);
      if (!res.message && res.length > 0) {
        const data = await res.map((viewCart) => {
          return new ProductModel(viewCart, viewCart.itemCountryId);
        });
        runInAction(() => {
          this.productList = this.refreshList = data;
        })
      }
      this.setIsLoading(false);
    }
    catch (error) {
      // console.log(error)
      this.setIsLoading(false);
    }
  }

  async lazyLoad() {
    if (this.productList.length >= 20 && (this.productList.length % 20) === 0) {
      this.setIsProductLoading(true);
      let url = `${this.lazyLoadUrl},${this.sortingQuery}&page=${this.lazyLoadPage}&size=20`;
      const res = await NetworkOps.get(url);
      if (!res.message && res.length > 0) {
        const response = await res.map((viewCart) => {
          return new ProductModel(viewCart, viewCart.itemCountryId);
        });
        var data = this.productList.concat(response);
        runInAction(() => {
          this.productList = this.refreshList = data;
          this.lazyLoadPage = this.lazyLoadPage+1;
        })
      }
      this.setIsProductLoading(false);
    }
    else {
      this.setIsProductLoading(false);
    }
  }

  async sortProducts(param) {
    let encodeUrl = encodeURIComponent(`${param}`);
    this.setIsLoading(true);
    runInAction(() => {
      this.lazyLoadPage = 1;
      this.sortingQuery = encodeUrl;
      this.productList = this.refreshList = []
    })
    let url = `${this.lazyLoadUrl},${encodeUrl}`;
    const res = await NetworkOps.get(url);
    if (!res.message && res.length > 0) {
      const data = await res.map((viewCart) => {
        return new ProductModel(viewCart, viewCart.itemCountryId);
      });
      runInAction(() => {
        this.productList = this.refreshList = data;
      }) 
    }
    this.setIsLoading(false);
  }

  async submitProductRatings(data, isEditable) {
    this.setIsLoading(true);
    const url = `${Urls.ServiceEnum.ProductRatings}`;
    const res = isEditable ? await NetworkOps.putToJson(url, data) : await NetworkOps.postToJson(url, data);
    this.setIsLoading(false);
    if (!res.message) {
      return { success: true };
    }
    return { success: false, message: res.message };
  }

  async submitOrderRatings(data, isEditable, orderNo) {
    this.setIsLoading(true);
    const url = `${Urls.ServiceEnum.OrderRatings}`;
    const res = isEditable ? await NetworkOps.putToJson(url, data) : await NetworkOps.postToJson(url, data);
    this.setIsLoading(false);
    if (!res.message) {
      await NetworkOps.putToJson(`${Urls.ServiceEnum.UpdateRatingNotification}${this.store.auth.distributorID}?orderNo=${orderNo}`);
      return { success: true };
    }
    return { success: false, message: res.message };
  }


  @action async getProductRatings(skuCode, getString, topReviews, page=0, size=5, rating) {
    this.setIsLoading(true);

    const topReviewParam = topReviews === 'topReviews' ? ',productQuality:DESC,' : ','
    const ratingNumber = rating ? `productQuality=${rating},` : ''

    const getAllReviewsQueryParam = `/code?q=productCode=${skuCode},isActionTaken=true${topReviewParam}${ratingNumber}createdOn:desc&page=${page}&size=${size}`;
    const getMyReviewQueryParam = `?q=productCode=${skuCode},distributorId=${this.store.auth.distributorID}`
    const queryParams = getString === 'getAllReviews' ? getAllReviewsQueryParam : getMyReviewQueryParam

    const url = `${Urls.ServiceEnum.ProductRatings}${queryParams}`
    const res = await NetworkOps.get(url);
    this.setIsLoading(false);
    if(!res.message) {
      this.setProductFeedbackResponse(res);
      return { success: true, data: res }
    }
    return { success: false, message: res.message }
  }

  @action async getOrderRatings(orderId) {
    this.setIsLoading(true);
    this.setOrderFeedbackResponse({})
    const url = `${Urls.ServiceEnum.GetorderRatings}${this.store.auth.distributorID}?orderId=${orderId}`
    const res = await NetworkOps.get(url);
    this.setIsLoading(false);
    if(!res.message) {
      this.setOrderFeedbackResponse(res);
      return { success: true, data: res }
    }
    return { success: false, message: res.message }
  }

  @action async getProductCatalogue(countryId) {
    this.setIsLoading(true);
    runInAction(() => {
      this.productCatalogue = '';
      this.isProductCatalogueActive = false;
    })
    const countryParam = `?countryId=${countryId}`;
    const url = `${Urls.ServiceEnum.fetchProductCatalogue}${countryParam}`;
    const res = await NetworkOps.get(url);
    this.setIsLoading(false);
    if (!res.message) {
      runInAction(() =>{
        this.productCatalogue = res.value;
        this.isProductCatalogueActive = res.isEnabled;
      })
    }
  }

  @action async submitFileUpload(data, type) {
    this.setIsLoading(true);
    const url = `${Urls.ServiceEnum.FileUpload}`
    const res = await NetworkOps.postRaw(url, data,options);
    this.setIsLoading(false);
    console.log('res',res)
    if(!res.errorMessage) {
      return { success: true, uri: res.fileUploadUri}
    }
    return { success: false, message: res.errorMessage }
  }

  @action reset() {
    this.productList = [];
    this.refreshList = [];
    this.productWidget = {};
    this.refreshWidget = {};
    this.productDetails = '';
    this.refreshProductDetails = '';
    this.queryMessage = '';
    this.lazyLoadUrl = '';
    this.lazyLoadPage = 1;
    this.recentlyViewed = [];
    this.recentlyViewedArray = [];
    this.query = '';
    this.sortingQuery = '';
    this.pvRangeBar = [];
    this.isNewSession = 'true';
    this.isTimeOut = '';
    this.initialUrl = '';
    this.keyValue = '0-25';
  }

  refresh(type) {
    switch (type) {
      case 'productList': {
        this.setProductList(this.refreshList)
        break;
      }
      case 'productDetails': {
        this.setProductDetails(this.refreshProductDetails)
        break;
      }
      default: { this.setProductWidget(this.refreshWidget) }
    }
  }

  async getBannerForStoreFront(query) {
    const countryParams = `countryId=${this.store.profile.defaultAddressCountryId}`;
    const url = `${Urls.ServiceEnum.Banners}?${countryParams}&q=${encodeURIComponent(query)}`
    const res = await NetworkOps.get(url);
    if(!res.message) {
      return res;
    }
  }
}