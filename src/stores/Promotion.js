import {
  observable,
  computed,
  action,
  runInAction,
  makeAutoObservable,
} from 'mobx';
import { _ } from 'lodash';
import NetworkOps from 'app/src/network/NetworkOps';
import * as Urls from 'app/src/network/Urls';
import { DISTRIBUTOR_TYPE_ENUM } from 'app/src/utility/constant/Constants';

// ON PROMOTION
const PROMOTION_CATEGORY = {
  BILLBUSTER: '1',
  LINE: '2',
  QUANTITY: '3',
  VOLUME: '4',
};
const PROMOTION_APPLICABILITY = {
  FIRST_PURCHASE: 1,
  REPURCHASE: 2,
  APPLY_ALWAYS: 3,
};
const CONDITION_OPERAND = { AND: 1, OR: 2 };

// ON CONDITIONS
const CONDITION_TYPE = { BUY: 1, GET: 2 };
const CONDITION_ON = { PRODUCTGROUP: 2, MERCHANDISING: 3, PRODUCT: 1 };
const DISCOUNT_TYPE = {
  FREE_ITEM: 1,
  PERCENT_OFF: 2,
  VALUE_OFF: 3,
  FIXED_PRICE: 4,
};
const newLocal = 'contains';

export default class Promotion {
  @observable ordersPromotion: any;
  @observable merchHierarchy: any;
  @observable cartPromotionDetails: Array<any>;
  @observable promotionApplicability: string;
  @observable isFirstOrderTaken;

  constructor(store) {
    this.store = store;
    makeAutoObservable(this);
  }

  // @action setMerchHierarchy = value => (this.merchHierarchy = value);
  @action setOrdersPromotion = value => {
    this.ordersPromotion = value;
  };
  @action setMerchHierarchy = value => {
    this.merchHierarchy = value;
  };
  @action setCartPromotionDetails = value => {
    this.cartPromotionDetails = value;
  };
  @action setPromotionApplicability = value => {
    this.promotionApplicability = value;
  };
  @action setIsFirstOrderTaken = value => {
    this.isFirstOrderTaken = value;
  };

  @computed get customerOrder() {
    return _.filter(this.cartPromotionDetails, { promotionParticipation: 1 });
  }

  @computed get billBusterPromotions() {
    return _.filter(this.ordersPromotion, {
      PromotionCategory: PROMOTION_CATEGORY.BILLBUSTER,
      promotionApplicability: this.promotionApplicability,
    });
  }

  @computed get linePromotions() {
    return _.filter(this.ordersPromotion, {
      PromotionCategory: PROMOTION_CATEGORY.LINE,
      promotionApplicability: this.promotionApplicability,
    });
  }

  @computed get quantityPromotions() {
    return _.filter(this.ordersPromotion, {
      PromotionCategory: PROMOTION_CATEGORY.QUANTITY,
      promotionApplicability: this.promotionApplicability,
    });
  }

  @computed get volumePromotions() {
    return _.filter(this.ordersPromotion, {
      PromotionCategory: PROMOTION_CATEGORY.VOLUME,
      promotionApplicability: this.promotionApplicability,
    });
  }

  @computed get isPromotionCompleted(): boolean {
    // const checkValue = !!this.ordersPromotion && !!this.merchHierarchy && !!this.promotionApplicability && !!this.cartPromotionDetails;
    // console.log('Checccckkkk VvVvaaallluuueee', checkValue)
    return (
      !!this.ordersPromotion &&
      !!this.merchHierarchy &&
      !!this.promotionApplicability &&
      !!this.cartPromotionDetails
    );
  }

  @computed get applicableQuantityPromotions() {
    let applicablePromotions = [];
    if (this.isPromotionCompleted) {
      if (this.quantityPromotions.length > 0) {
        applicablePromotions = this.getQuantityPromotions(this.customerOrder);
      }
    }
    return applicablePromotions;
  }

  @action async init(
    cartProducts,
    downlineDistributorID,
    distributorId,
    locationId,
    store,
  ) {
    this.getDownlineInfo(downlineDistributorID, distributorId, store);
    // console.log('resprom',cartProducts)
    this.setCartPromotionDetails(cartProducts);
    this.getMerchHierarchy(distributorId, locationId);
    this.getOrdersPromotion(distributorId, locationId);
  }

  async getOrdersPromotion(distributorId, locationId) {
    const url = `${Urls.ServiceEnum.OrdersPromotion}?username=${distributorId}&${locationId}`;
    let res = await NetworkOps.get(url);
    console.log('orderPromotions')
    if (res && res.length > 0) {
      this.setOrdersPromotion(res);
      this.ordersPromotion && this.ordersPromotion.slice();
    } else {
      this.setOrdersPromotion([]);
    }
  }

  async getMerchHierarchy(distributorId, locationId) {
    const url = `${Urls.ServiceEnum.OrdersPromotion}/${Urls.PromotionServiceEnum.MerchHierarchy}/${distributorId}?${locationId}`;
    let res = await NetworkOps.get(url);
    if (res && res.length > 0) {
      this.setMerchHierarchy(res);
      this.merchHierarchy.slice();
    } else {
      this.setMerchHierarchy([]);
    }
  }

  async getDownlineInfo(downlineDistributorID, distributorId, store) {
    const downlineInfo =
      store?.auth?.distributorType === DISTRIBUTOR_TYPE_ENUM.miniDLCP
        ? Urls.PromotionServiceEnum.miUserDownlineInfo
        : Urls.PromotionServiceEnum.DownlineInfo;
    const url = `${Urls.ServiceEnum.OrdersPromotion}/${downlineInfo}/${distributorId}?distributor_no=${downlineDistributorID}&locationId=${store?.profile?.defaultCater.locationId}`;
    const res = await NetworkOps.get(url);
    if (res && !_.isEmpty(res, true)) {
      this.setPromotionApplicability(res.PromotionApplicability);
      this.setIsFirstOrderTaken(res.FirstOrderTaken);
    }
  }

  @action applicableBillBusterPromotions() {
    let applicablePromotions = {};
    console.log('billBusterPromotions>>>>>>.',this.billBusterPromotions)
    if (this.billBusterPromotions.length > 0) {
      const promotions = this.getBillBusterPromotions(this.customerOrder);
      applicablePromotions['BillBusterPromotions'] = promotions;
    }
    return applicablePromotions;
  }

  getBillBusterPromotions(): any {
    let pAwardPromotionItems = Array();
    let oQtyForPromotion = 0;
    let oValueForPromotion = 0;
    let reformedOrder;
    let isPromotionApplicable = false;
    // Go through All Promotions and See BillBuster is to be Applied

    for (const promotion of this.billBusterPromotions) {
      oValueForPromotion = 0;
      oQtyForPromotion = 0;
      reformedOrder = this.cartPromotionDetails.slice(0);
      console.log('reformedOrder>>>>>>>>>>>>',this.cartPromotionDetails)
      if (promotion.PCConditionON != 1) {
        reformedOrder = this.reformatedOrder(
          reformedOrder,
          promotion.PromotionId,
        );
      }

      for (const orderItem of reformedOrder) {
        if (orderItem.promotionParticipation == 1) {
          oQtyForPromotion = +oQtyForPromotion + +orderItem.quantity;
          oValueForPromotion = +oValueForPromotion + +orderItem.total;
        }
      }

      if (oValueForPromotion >= +promotion.PTBuyQtyFrom) {
        isPromotionApplicable = true;
        let applicableQuantity = 1;

        const integerPart = Math.floor(
          oValueForPromotion / +promotion.PTBuyQtyFrom,
        );
        applicableQuantity = integerPart; // Change by Parveen.
        applicableQuantity = integerPart * promotion.PTQty;
        applicableQuantity = this.checkRequiredItemsAndOrCondition(
          promotion,
          applicableQuantity,
          reformedOrder,
        );

        if (applicableQuantity > 0) {
          const discountedItem = new PromotionModel(
            promotion,
            applicableQuantity,
          );
          pAwardPromotionItems.push(discountedItem);
        }
      }
    }
    return pAwardPromotionItems;
  }

  reformatedOrder(reformedorder, promotionId) {
    let promotionApplicablityRow;
    for (const promotion of this.merchHierarchy) {
      if (promotionId == promotion.PromotionID) {
        promotionApplicablityRow = promotion;
      }
    }
    var newReformedAraay = [];
    for (const orderItem of reformedorder) {
      if (orderItem.promotionParticipation == 1) {
        if (
          this.itemExistInPromotionHirarchy(
            orderItem.productId,
            promotionApplicablityRow,
          )
        ) {
          newReformedAraay.push(orderItem);
        }
      }
    }
    return newReformedAraay;
  }

  itemExistInPromotionHirarchy(itemId, promotionApplicablityRow) {
    if (
      promotionApplicablityRow &&
      promotionApplicablityRow.ItemId.indexOf(itemId) >= 0
    ) {
      return true;
    }
    return false;
  }

  checkRequiredItemsAndOrCondition(
    promotion,
    applicableQuantity,
    reformedOrder,
  ) {
    let response = 0;
    if (
      (promotion.BuyAndCondition == null || promotion.BuyAndCondition == '') &&
      (promotion.BuyOrCondition == null || promotion.BuyOrCondition == '')
    ) {
      response = applicableQuantity;
    } else if (
      (promotion.BuyAndCondition == null || promotion.BuyAndCondition == '') &&
      (promotion.BuyOrCondition != null || promotion.BuyOrCondition != '')
    ) {
      const quantityForOrCondition = this.billBusterOrCondition(
        reformedOrder,
        promotion.BuyOrCondition,
        promotion.QuantitySet,
      );
      response = Math.min(applicableQuantity, quantityForOrCondition);
    } else {
      const quantityForAndCondition = this.billBusterAndCondition(
        reformedOrder,
        promotion.BuyAndCondition,
        promotion.QuantitySet,
      );
      response = Math.min(applicableQuantity, quantityForAndCondition);
    }
    return response;
  }

  //*********************************Bill Buster AND Condition Start****************************************
  billBusterAndCondition(reformedorder, sepratedByItemId, quantitySet) {
    const seprateItemId = sepratedByItemId.split(',');
    let quantityArray = [];
    let purchaseQuantity = 0;

    for (const itemId of seprateItemId) {
      const isProductPresent = reformedorder.findIndex(
        item => item.productId == itemId,
      );
      if (_.includes(reformedorder, itemId) || isProductPresent !== -1) {
        const sepratedQuantity = quantitySet.split(',');
        const promoQuantity = sepratedQuantity[seprateItemId.indexOf(itemId)];

        for (const order of reformedorder) {
          if (order.productId == itemId) {
            purchaseQuantity = order.quantity;
          }
        }
        quantityArray.push(parseInt(purchaseQuantity / promoQuantity));
      } else {
        quantityArray.push(0);
      }
    }

    const result = Math.min.apply(null, quantityArray);
    if (result < 1) {
      return 0;
    } else {
      return result;
    }
  }
  //*********************************Bill Buster And Condition End****************************************

  //*********************************Bill Buster Or Condition Start****************************************
  billBusterOrCondition(reformedorder, sepratedByItemId, quantitySet) {
    const seprateItemId = sepratedByItemId.split(',');
    let quantityArray = [];
    let purchaseQuantity = 0;

    for (const itemId of seprateItemId) {
      const isProductPresent = reformedorder.findIndex(
        item => item.productId == itemId,
      );
      if (_.includes(reformedorder, itemId) || isProductPresent !== -1) {
        const sepratedQuantity = quantitySet.split(',');
        const promoQuantity = sepratedQuantity[seprateItemId.indexOf(itemId)];

        for (const order of reformedorder) {
          if (order.productId == itemId) {
            purchaseQuantity = order.quantity;
          }
        }
        quantityArray.push(parseInt(purchaseQuantity / promoQuantity));
        purchaseQuantity = 0;
      } else {
        quantityArray.push(0);
      }

      const result = quantityArray.reduce(function (a, b) {
        return a + b;
      });

      if (result < 1) {
        return 0;
      } else {
        return result;
      }
    }
  }
  //*********************************Bill Buster Or Condition End****************************************

  getQuantityPromotions(order) {
    let pAwardPromotionItems = Array();
    let oQtyForPromotion = 0;
    let oValueForPromotion = 0;
    let reformattedOrderItems = {};
    let reformedOrder;
    // Go through All Promotions and See Quantity is to be Applied

    let isPromotionApplicable = false;
    let previousPromotion;
    let isItemPresentInOrder = 0; // 0 Not Sure, 1 So far available for all items, 2 Not found in Order for at least one item
    let qualifiedQtyForPromotion = 0;
    let promotionGETs = [];

    for (const promotionIndex in this.quantityPromotions) {
      if (
        this.getOrderAmount(order) >
        this.quantityPromotions[promotionIndex].MaxOrdeQty
      ) {
        reformedOrder = this.cartPromotionDetails.slice(0);
        if (this.quantityPromotions[promotionIndex].PCConditionON != 1) {
          reformedOrder = this.reformatedOrder(
            reformedOrder,
            this.quantityPromotions[promotionIndex].PromotionId,
          );
        }

        for (const orderItem of reformedOrder) {
          // Reformatting Order Item for easy search
          reformattedOrderItems[orderItem.productId] = orderItem;
        }

        let promotion = this.quantityPromotions[promotionIndex];
        let conditionOperand = promotion.conditPMConditionType;

        if (promotionIndex == 0) {
          previousPromotion = promotion; // For First Time Consider previous and Current Promotions are same
        } else if (+previousPromotion.PromotionId != +promotion.PromotionId) {
          if (isItemPresentInOrder == 1) {
            for (const getIndex in promotionGETs) {
              if (getIndex != newLocal) {
                let discountedItem;
                let addPromotion = promotionGETs[getIndex];
                if (this.quantityPromotions[promotionIndex].MaxOrdeQty == 0) {
                  discountedItem = new PromotionModel(
                    addPromotion,
                    qualifiedQtyForPromotion,
                  );
                } else {
                  let temQty = Math.floor(
                    this.getOrderAmount(order) /
                      this.quantityPromotions[promotionIndex].MaxOrdeQty,
                  );
                  qualifiedQtyForPromotion = Math.min(
                    temQty,
                    qualifiedQtyForPromotion,
                  );
                  discountedItem = new PromotionModel(
                    addPromotion,
                    qualifiedQtyForPromotion,
                  );
                }
                // Push Item in Array to give the Promotion
                pAwardPromotionItems.push(discountedItem);
              }
            }
            promotionGETs = [];
            qualifiedQtyForPromotion = 0;
          } else {
            promotionGETs = [];
          }
          previousPromotion = promotion; // For First Time Consider previous and Current Promotions are same
          isItemPresentInOrder = 0;
        }

        if (+previousPromotion.PromotionId == +promotion.PromotionId) {
          if (isItemPresentInOrder == 2) {
            continue; // No need to check more conditions for same promotion ID
          }

          if (+promotion.PCConditionType == CONDITION_TYPE.GET) {
            promotionGETs.push(promotion);
            continue; // This is what user will GET and not to be tested for purchase
          }

          if (this.quantityPromotions[promotionIndex].PCConditionON == 1) {
            let itemDetail = reformattedOrderItems[promotion.PCCOnditionCode];
            if (typeof itemDetail === 'undefined') {
              // item not found
              isItemPresentInOrder = 2;
              isPromotionApplicable = false;
            } else {
              if (+itemDetail.quantity >= +promotion.PCGetQty) {
                // Continue to check Other Items
                isItemPresentInOrder = 1;

                // Find out how many promotional items qualify
                // Implement Logic here
                // Find out how many promotional items qualify
                // Implement Logic here
                const qtyForAssociatedPromotion =
                  this.getQuantityForQuantityPromotion(promotion.PromotionId);
                const maxQualificationQty =
                  Math.floor(+itemDetail.quantity / +promotion.PCGetQty) *
                  qtyForAssociatedPromotion;
                qualifiedQtyForPromotion =
                  qualifiedQtyForPromotion == 0
                    ? maxQualificationQty
                    : Math.min(maxQualificationQty, qualifiedQtyForPromotion);
              } else {
                isItemPresentInOrder = 2;
                isPromotionApplicable = false;
              }
            }
          } else {
            let getTotalqtyFromOrders = this.getQtyFromOrder(reformedOrder);
            if (+getTotalqtyFromOrders >= +promotion.PCGetQty) {
              // Continue to check Other Items
              isItemPresentInOrder = 1;

              // Find out how many promotional items qualify
              // Implement Logic here
              // Find out how many promotional items qualify
              // Implement Logic here
              let qtyForAssociatedPromotion =
                this.getQuantityForQuantityPromotion(promotion.PromotionId);

              let maxQualificationQty =
                Math.floor(+getTotalqtyFromOrders / +promotion.PCGetQty) *
                qtyForAssociatedPromotion;
              qualifiedQtyForPromotion =
                qualifiedQtyForPromotion == 0
                  ? maxQualificationQty
                  : Math.min(maxQualificationQty, qualifiedQtyForPromotion);
            } else {
              isItemPresentInOrder = 2;
              isPromotionApplicable = false;
            }
          }
        }

        if (
          isItemPresentInOrder == 1 &&
          this.quantityPromotions.length == +promotionIndex + 1
        ) {
          // ADD Promotion
          for (var getIndex in promotionGETs) {
            if (getIndex != newLocal) {
              let discountedItem;
              let addPromotion = promotionGETs[getIndex];
              if (this.quantityPromotions[promotionIndex].MaxOrdeQty == 0) {
                discountedItem = new PromotionModel(
                  addPromotion,
                  qualifiedQtyForPromotion,
                );
              } else {
                let temQty = Math.floor(
                  this.getOrderAmount(order) /
                    this.quantityPromotions[promotionIndex].MaxOrdeQty,
                );
                qualifiedQtyForPromotion = Math.min(
                  temQty,
                  qualifiedQtyForPromotion,
                );
                discountedItem = new PromotionModel(
                  addPromotion,
                  qualifiedQtyForPromotion,
                );
              }
              // Push Item in Array to give the Promotion
              pAwardPromotionItems.push(discountedItem);
            }
          }

          promotionGETs = [];
          // Next Promotional ID needs to qualify again
          isPromotionApplicable == false;
          qualifiedQtyForPromotion = 0;
          isItemPresentInOrder = 0;
        }
      }
    }
    console.log('pAwardPromotionItems>>>>>>>>>>>>>>',pAwardPromotionItems)
    return pAwardPromotionItems;
  }

  getOrderAmount(order) {
    let oQtyForPromotion = 0;
    let oValueForPromotion = 0;
    for (const orderItem of order) {
      //Get Quantity and Order Value of All Items Participating in PROMOTION
      if (orderItem.promotionParticipation == 1) {
        //+in front of variable makes it number
        oQtyForPromotion = +oQtyForPromotion + +orderItem.quantity;
        oValueForPromotion = +oValueForPromotion + +orderItem.total;
      }
    }
    return oValueForPromotion;
  }

  getQuantityForQuantityPromotion(forPromotionID) {
    let qtyToReturn = 0;
    for (const promotion of this.quantityPromotions) {
      if (forPromotionID == +promotion.PromotionId) {
        if (+promotion.PCConditionType == 2) {
          qtyToReturn = +promotion.PCGetQty;
          break;
        }
      }
    }
    return qtyToReturn;
  }

  getQtyFromOrder(reformedOrder) {
    let oQtyForPromotion = 0;
    for (const orderItem of reformedOrder) {
      // Get Quantity and Order Value of All Items Participating in PROMOTION
      if (orderItem.promotionParticipation == 1) {
        //+in front of variable makes it number
        oQtyForPromotion = +oQtyForPromotion + +orderItem.quantity;
        // oValueForPromotion = +oValueForPromotion +  (+orderItem.Price);
      }
    }
    return oQtyForPromotion;
  }

  async getProductsInfo(productsIds, locationId) {
    const url = `${Urls.ServiceEnum.PromotionsProductList}${locationId}${Urls.DistributorServiceEnum.ProductIds}${productsIds}`;
    const response = await NetworkOps.get(url);
    if (!response.message) {
      return response;
    }
  }
}

class PromotionModel {
  promotionID: string;
  promotionItemID: string;
  promotionType: string;
  PTBuyQtyFrom: string;
  PTBuyQtyTo: string;
  quantity: string;
  title: string;
  promotionName: string;
  imageUrl: string;
  pointValue: number;
  discountPrice: number;
  locationId: string;

  constructor(item, applicableQuantity) {
    const value =
      (item.PTDiscountValue && parseInt(item.PTDiscountValue).toFixed(2)) ||
      (item.PCDiscountValue && parseInt(item.PCDiscountValue).toFixed(2));
    this.promotionID = item.PromotionId;
    this.promotionItemID = item.PTConditionCode || item.PCCOnditionCode;
    this.promotionType = item.PTDiscountType || item.PCDiscountType;
    this.PTBuyQtyFrom = item.PTBuyQtyFrom;
    this.PTBuyQtyTo = item.PTBuyQtyTo;
    this.quantity = applicableQuantity;
    this.discountPrice = value;
    this.title = item.PromotionName;
    this.promotionName = item.PromotionName;
    this.imageUrl = '';
    this.pointValue = 0;
    this.locationId = item.LocationId;
  }
}
