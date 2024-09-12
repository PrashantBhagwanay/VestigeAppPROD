import { _, get } from 'lodash';
import { VESTIGE_IMAGE } from 'app/src/utility/constant/Constants';
import { observable, computed, makeAutoObservable } from 'mobx';
import Promotion from '../Promotion';

export class DownlineDistributor {
  distributorName: string;
  distributorId: string;
  distributorImage: any;
  
  constructor(downlineDistributorInfo: any){
    this.distributorName = get(downlineDistributorInfo, 'distributorName');
    this.distributorId = get(downlineDistributorInfo, 'distributorId');
    this.distributorImage = get(downlineDistributorInfo, 'distributorIcon', VESTIGE_IMAGE.DISTRIBUTOR_ICON)
  }
}

export class CreateCart {
  cartTitle: string;
  cartId: number;
  cartDistributorId: string;
  cartProducts: Array;
  cartStatus: string;
  totalPVPoint: number;
  showInfo: Boolean;
  @observable cost: number;

  @observable giftVoucherInfo: Array<any>;
  @observable bonusVoucherInfo: Array = [];
  @observable appliedBonusVoucher: Array = [];
  @observable appliedGiftVoucher: String = ''

  @observable paymentMethod: string;
  @observable promotions: Promotion;

  @observable selectedPromotions: Array = [];
  @observable qtyPromotions: Array = [];

  @computed get promotionCost() {
    let finalCost = 0;
    if(this.selectedPromotions && this.selectedPromotions.length > 0) {
      this.selectedPromotions.forEach((promo) => {
        finalCost = finalCost + (Number(promo.quantity) * Number(promo.discountPrice));
      });
    }

    if(this.qtyPromotions && this.qtyPromotions.length > 0) {
      this.qtyPromotions.forEach((qtyPromotion) => {
        finalCost = finalCost + Number(qtyPromotion.discountPrice * qtyPromotion.quantity);
      });
    }
    return finalCost
  }

  @computed get totalCost() {
    let finalCost = this.cost + this.promotionCost;
    if(this.giftVoucherInfo && this.giftVoucherInfo.length > 0){
      this.giftVoucherInfo.forEach((giftProduct) => {
        if(this.cost >= giftProduct.minBuyAmount) {
          finalCost = finalCost + 1;
        }
      });
    } 

    // if(this.selectedPromotions && this.selectedPromotions.length > 0) {
    //   this.selectedPromotions.forEach((promo) => {
    //     finalCost = finalCost + (Number(promo.quantity) * Number(promo.discountPrice));
    //   });
    // }

    // if(this.qtyPromotions && this.qtyPromotions.length > 0) {
    //   this.qtyPromotions.forEach((qtyPromotion) => {
    //     finalCost = finalCost + Number(qtyPromotion.discountPrice * qtyPromotion.quantity);
    //   });
    // }

    if(this.bonusVoucherInfo.length > 0) {
      let i = 0
      for (i = 0; i< this.bonusVoucherInfo.length ; i++) {
      const discountAmount = this.bonusVoucherInfo[i].amount || 0
      finalCost = finalCost - discountAmount > 0 ? finalCost - discountAmount : 0;
      }
    } 

    return finalCost
  }

  @computed get totalCartItems() {
    let totalCount = 0;
    if(this.cartProducts && this.cartProducts.length > 0){
      this.cartProducts.forEach((product) => {
        totalCount = totalCount + Number(product.quantity)
      });
    } 

    if(this.selectedPromotions && this.selectedPromotions.length > 0) {
      this.selectedPromotions.forEach((promo) => {
        totalCount = totalCount + Number(promo.quantity);
      });
    }

    if(this.qtyPromotions && this.qtyPromotions.length > 0) {
      this.qtyPromotions.forEach((qtyPromotion) => {
        totalCount = totalCount + Number(qtyPromotion.quantity);
      });
    }

    if(this.giftVoucherInfo && this.giftVoucherInfo.length > 0){
      totalCount = totalCount + Number(this.giftVoucherInfo.length);
    }

    return totalCount;
  }

  @computed get giftVouchers() {
    let giftVoucherArray = []
    if(this.giftVoucherInfo && this.giftVoucherInfo.length > 0){
      this.giftVoucherInfo.forEach((giftProduct) => {
        giftVoucherArray.push({
          'quantity': get(giftProduct, 'quantity'),
          'unitCost': get(giftProduct, 'unitCost',1),
          'title': get(giftProduct, 'productName'),
          'pointValue': get(giftProduct, 'pointValue', 0.0),
          'imageUrl': get(giftProduct, 'imageUrl',null),
        }
        )
      });
    } 
    return giftVoucherArray
  }

  @computed get checkVoucherApplied() {
    if(this.giftVoucherInfo && this.giftVoucherInfo.length > 0){
      return true
    } 
    else if(this.bonusVoucherInfo.length > 0){
      return true
    }
    else if(this.selectedPromotions && this.selectedPromotions.length > 0) {
      return true
    }
    return false
  }

  constructor(cartList: any, store: any, enablePromotion = false, index){
    makeAutoObservable(this);
    this.cartTitle = get(cartList, 'cartName');
    this.cartId = get(cartList, 'cartId');
    this.cartDistributorId = get(cartList, 'distributorId');
    this.cartProducts = get(cartList, 'products');
    this.cartStatus = get(cartList, 'status')
    this.cost = get(cartList, 'totalCost');
    this.totalPVPoint = get(cartList, 'totalPointValue');
    this.isPrompt = get(cartList, 'isPrompt');
    this.isCartPopup = get(cartList, 'isCartPopup');
    this.promptText = get(cartList, 'promptText');
    this.cartPopText = get(cartList, 'cartPopText');
    // this.showInfo = index === 0 ? true : false
    this.showInfo = true;
    this.paymentMethod = '';
    this.giftVoucherInfo = [];
    this.bonusVoucherInfo = [];
    this.promotions = new Promotion();
    if(enablePromotion) {
      this.promotions.init(this.cartProducts, this.cartDistributorId, store.profile.distributorID, store.profile.location, store)
    }
  }
}

export class CartProductModel {
  
  productId : string;
  quantity: string;
  unitCost: number;
  title: string;
  imageUrl: string;
  pointValue: number;
  businessVolume: number;
  quantity: number;
  maxQuantity: number;
  skuCode: string;
  locationId: string;
  promotionParticipation: number;
  categoryName: string;
  categoryId: number;
  brand: number; 
  cncApplicability: String;
  cncMOQ: String;

  constructor(productDetail, selectedQuantity) {
    this.productId = get(productDetail, 'productId');
    this.quantity = get(selectedQuantity, 'quantity' , 1);
    this.locationId = get(productDetail, 'locationId' , null);
    this.unitCost = get(productDetail, 'unitCost');
    this.title = get(productDetail, 'productName');
    this.imageUrl = get(productDetail, 'imageUrl');
    this.pointValue = get(productDetail, 'associatedPv', 0);
    this.businessVolume = get(productDetail, 'associatedBv', 0)
    this.maxQuantity= get(productDetail,'maxQuantity',0)
    this.skuCode = get(productDetail, 'skuCode');
    this.promotionParticipation = get(productDetail,'promotionParticipation',0)
    this.categoryName = get(productDetail,'categoryName', '')
    this.categoryId = get(productDetail, 'categoryId', null)
    this.brand = get(productDetail, 'brand', null)
    this.cncApplicability = get(productDetail, 'cncApplicability', "0")
    this.cncMOQ = get(productDetail, 'cncMOQ', "0")
  }
}