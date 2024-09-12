import { observable, action, computed, makeAutoObservable, runInAction } from 'mobx';
import NetworkOps from 'app/src/network/NetworkOps';
import * as Urls from 'app/src/network/Urls';
import { strings } from 'app/src/utility/localization/Localized';
import { ProductModel } from './models/ProductModel';

export default class WishList {
  @observable isLoading: boolean = false;
  @observable wishLists: Array<any> = [];
  @observable isMessage: string = '';
  @observable isUpdate: boolean = false;

  constructor(store) {
    this.store = store;
    makeAutoObservable(this);
  }

  @action setIsLoading = value => {
    this.isLoading = value;
  };
  @action setWishLists = value => {
    this.wishLists = value;
  };
  @action setIsMessage = value => {
    this.isMessage = value;
  };
  @action setIsUpdate = value => {
    this.isUpdate = value;
  };

  @action reset() {
    this.setWishLists([]);
  }

  updateWishListIcon = async response => {
    const { refreshWidget, refreshList } = this.store.products;
    const widgets = Object.keys(this.store.products.refreshWidget);
    if (
      response &&
      response.length > 0 &&
      response[0].productId &&
      response[0].skuCode
    ) {
      for (let key of widgets) {
        for (let i in refreshWidget[key]) {
          const data = refreshWidget[key][i];
          if (
            data.skuCode === response[0].skuCode &&
            data.productId === response[0].productId
          ) {
            refreshWidget[key][i].isFavourite = false;
          }
        }
      }
      for (let data of refreshList) {
        if (
          data.skuCode === response[0].skuCode &&
          data.productId === response[0].productId
        ) {
          data.isFavourite = false;
        }
      }
    }
  };

  @computed get getwishlistCount() {
    return this.wishLists.length;
  }

  async fetchWishList(param) {
    if (param === 'update') {
      this.setIsLoading(true);
    }
    this.productList = [];
    // this.wishLists = [];
    const countryParam = `?countryId=${this.store.profile.defaultAddressCountryId}`;
    const url = `${Urls.ServiceEnum.Wishlist}/${this.store.auth.distributorID}${countryParam}`;
    const res = await NetworkOps.get(url);
    this.setIsLoading(false);
    if (!res.message && res.products) {
      const data = await res.products.map(viewCart => {
        return new ProductModel(viewCart);
      });
      this.setWishLists(data);
    } else {
      this.setIsLoading(false);
      this.setWishLists([]);
    }
  }

  async updateWishList(item, action, addtoCart) {
    if (addtoCart !== 'update') {
      this.setIsLoading(true);
    }
    this.setIsUpdate(false);
    this.setIsMessage('');
    const data = this.getWishListData(item);
    let url;

    if (action === 'remove') {
      url = `${Urls.ServiceEnum.Wishlist}/${Urls.DistributorServiceEnum.WishlistRemove}`;
    } else {
      url = `${Urls.ServiceEnum.Wishlist}`;
    }
    const res = await NetworkOps.postToJson(url, data);
    if (!res.message) {
      this.setIsLoading(false);

      action === 'remove' &&
        runInAction(() => {
          this.updateWishListIcon(res.products);
        });
      this.setIsMessage(
        action === 'remove'
          ? strings.product.removeWishList
          : strings.product.addWishList,
      );
      this.setIsUpdate(true);
      this.setIsLoading(false);
      this.fetchWishList();
    } else {
      if (res.message === 'This product is already added to Wishlist') {
        this.setIsUpdate(true);
      }
      this.setIsMessage(res.message);
      this.setIsLoading(false);
    }
  }

  getWishListData(item) {
    return {
      distributorId: this.store.auth.distributorID,
      products: [
        {
          id: null,
          versionId: null,
          productId: item.productId,
          productName: item.productName,
          associatedPv: item.associatedPv,
          associatedBv: item.associatedBv,
          brand: {
            id: null,
            brandId: item.brand,
            image: null,
            name: '',
            createdBy: null,
            createdOn: null,
            modifiedBy: null,
            modifiedOn: null,
          },
          skuCode: item.skuCode,
          hsnId: null,
          locationId: item.locationId,
          attributes: null,
          price: {
            mrp: item.mrp,
            listPrice: null,
            discountPrice: item.unitCost,
          },
          careIntructions: null,
          howItWorks: null,
          variant: null,
          categoryId: item.categoryId,
          categoryName: item.categoryName,
          subCategoryId: null,
          subCategoryName: null,
          subSubCategoryId: null,
          subSubCategoryName: null,
          rating: item.rating,
          shortDesc: null,
          longDesc: null,
          vendorName: null,
          isSponsored: item.isSponsored,
          isNewLaunch: null,
          substituteProducts: null,
          relatedProducts: null,
          assets: {
            images: [
              {
                size: '220 x 220',
                isDefault: null,
                url: item.imageUrl,
              },
            ],
            videos: null,
          },
          isSaleable: null,
          isReturnable: null,
          isExpressShipping: null,
          isFreeShipping: null,
          isActive: null,
          isDeleted: null,
          createdBy: null,
          createdOn: null,
          updatedBy: null,
          updatedOn: null,
          deleteBy: null,
          deletedOn: null,
          availableQuantity: item.maxQuantity,
          isFavourite: item.isFavourite,
          netContent: item.netContent,
          itemCountryId: item.countryId?.toString(),
        },
      ],
    };
  }
}
