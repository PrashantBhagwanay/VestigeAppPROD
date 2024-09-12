import { get } from 'lodash';
import { observable } from 'mobx';

export class ProductModel {
    @observable productId : string;
    @observable isFavourite: boolean;
    @observable unitCost: number;
    @observable productName: string;
    @observable name: string;
    @observable imageUrl: string;
    @observable associatedPv: number;
    @observable associatedBv: number;
    @observable quantity: number;
    @observable maxQuantity: number;
    @observable skuCode: string;
    @observable locationId: string;
    @observable categoryId: string;
    @observable categoryName: string;
    @observable isSponsored: boolean;
    @observable brand: string;
    @observable promotionParticipation: number;
    @observable rating: number
    @observable netContent: String;
    @observable mrp;
    @observable cncApplicability:String;
    @observable cncMOQ:String;
    @observable isMovableToWarehouse:Boolean;
    @observable countryId: Number;

    constructor(productDetail, countryId) {
      this.productId = get(productDetail, 'productId');
      this.productName = get(productDetail, 'productName');
      this.name = get(productDetail, 'name');
      this.associatedPv = get(productDetail, 'associatedPv', 0);
      this.skuCode = get(productDetail, 'skuCode');
      this.locationId = get(productDetail, 'locationId', 10);
      this.unitCost = productDetail.price.discountPrice ? productDetail.price.discountPrice : 0;
      // this.unitCost = get(productDetail, 'price.discountPrice',0);
      this.image = get(productDetail, 'image', null);
      this.imageUrl = get(productDetail, 'assets.images[0].url', null);
      this.associatedBv = get(productDetail, 'associatedBv', 0);
      this.maxQuantity= get(productDetail, 'availableQuantity', 0);
      this.isFavourite = get(productDetail, 'isFavourite');
      this.categoryId = get(productDetail, 'categoryId');
      this.categoryName = get(productDetail, 'categoryName');
      this.isSponsored = get(productDetail, 'isSponsored', false);
      this.brand = get(productDetail, 'brand.brandId', false);
      this.rating = get(productDetail, 'rating', 0);
      this.promotionParticipation = get(productDetail, 'promotionParticipation', 0);
      this.netContent = get(productDetail, 'netContent', '');
      this.mrp = get(productDetail, 'price.mrp', 0);
      this.mrp = get(productDetail, 'price.mrp', 0);
      this.mrp = get(productDetail, 'price.mrp', 0);
      this.mrp = get(productDetail, 'price.mrp', 0);
      this.cncApplicability = get(productDetail, 'cncApplicability', '0');
      this.cncMOQ = get(productDetail, 'cncMOQ', '0');
      this.isMovableToWarehouse = get(productDetail, 'isMoveabletoWarehouse', false);
      this.countryId = Number(countryId);
    }
}

export class ProductDetails {
  @observable productId : string;
  @observable isFavourite: boolean;
  @observable unitCost: number;
  @observable productName: string;
  @observable imageUrl: string;
  @observable imageArray: Array;
  @observable associatedPv: number;
  @observable associatedBv: number;
  @observable quantity: number;
  @observable maxQuantity: number;
  @observable skuCode: string;
  @observable locationId: string;
  @observable categoryId: string;
  @observable categoryName: string;
  @observable isSponsored: boolean;
  @observable brand: string;
  @observable substituteProducts: Array;
  @observable relatedProducts: Array;
  @observable variant: number;
  @observable rating: string;
  @observable longDesc: string;
  @observable promotionParticipation: number;
  @observable netContent: String;
  @observable mrp;
  @observable cncApplicability:String;
  @observable cncMOQ:String;
  @observable isMovableToWarehouse:Boolean;
  @observable productVideoUrl : String
  @observable countryId: Number;
  
  constructor(productDetail) {
    this.productId = get(productDetail, 'productId');
    this.productName = get(productDetail, 'productName');
    this.associatedPv = get(productDetail, 'associatedPv', 0);
    this.skuCode = get(productDetail, 'skuCode');
    this.locationId = get(productDetail, 'locationId', 10);
    this.unitCost = get(productDetail, 'price.discountPrice', '');
    this.productVideoUrl = get(productDetail, 'productVideoUrl', '');
    this.imageUrl = get(productDetail, 'assets.images[0].url', null);
    const imageArray = (productDetail.assets.images && productDetail.assets.images.filter(item => item.imageType === 'HERO'));
    //const imageArray = productDetail.skuCode != '20010' ? (productDetail.assets.images && productDetail.assets.images.filter(item => item.imageType === 'HERO')) : (productDetail.imagesURL.images && productDetail.imagesURL.images.filter(item => item.imageType === 'HERO'))
    // this.imageArray = get(productDetail, 'assets.images',null);
    this.imageArray = imageArray;
    this.associatedBv = get(productDetail, 'associatedBv', 0);
    this.maxQuantity= get(productDetail, 'availableQuantity', 0);
    this.isFavourite = get(productDetail, 'isFavourite');
    this.categoryId = get(productDetail, 'categoryId');
    this.categoryName = get(productDetail, 'categoryName');
    this.isSponsored = get(productDetail, 'isSponsored', false);
    this.brand = get(productDetail, 'brand.brandId', false);
    this.substituteProducts = get(productDetail, 'substituteProducts', []);
    this.relatedProducts = get(productDetail, 'relatedProducts', []);
    this.recommendedProducts = get(productDetail, 'recommendedProducts', []);
    this.variant = get(productDetail, 'variant', '');
    this.rating = get(productDetail, 'rating', 0);
    this.longDesc = get(productDetail, 'longDesc', '');
    this.promotionParticipation = get(productDetail, 'promotionParticipation', 0);
    this.netContent = get(productDetail, 'netContent', '');
    this.mrp = get(productDetail, 'price.mrp', 0);
    this.cncApplicability = get(productDetail, 'cncApplicability', '0');
    this.cncMOQ = get(productDetail, 'cncMOQ', '0');
    this.isMovableToWarehouse = get(productDetail, 'isMoveabletoWarehouse', false);
    this.countryId = Number(get(productDetail, 'itemCountryId', ''));
  }
}