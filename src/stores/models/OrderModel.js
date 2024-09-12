import { _ } from 'lodash';
import { CreateCart } from './CartModel';
import store from 'app/src/stores/Store';

export default class OrderModel {
  
  constructor(payload: Array<CreateCart>, checkForValidations=true, skipPromotionsInDubai = undefined) {
    this.orders = [];
    payload.forEach((cart) => {
      if(payload && payload.length < 2 && (cart.cartProducts === null || cart.cartProducts.length === 0)) {
        this.error = 'Please Add some product in cart';
        return
      } 
      console.log('Bonus Vouchers==>',JSON.stringify(cart.bonusVoucherInfo[0]),'cart.promotions', JSON.stringify(cart.promotions),'cart.selectedPromotions', JSON.stringify(cart.selectedPromotions))
      // if(cart.bonusVoucherInfo.length && cart.bonusVoucherInfo[0]?.isCncVoucher != '1' && cart.bonusVoucherInfo[0]?.isPvbvZero !== '1' && cart.promotions?.isPromotionCompleted && cart.promotions?.applicableBillBusterPromotions().BillBusterPromotions && cart.promotions?.applicableBillBusterPromotions().BillBusterPromotions.length > 0 && cart.selectedPromotions.length === 0) {
      if(skipPromotionsInDubai === undefined || skipPromotionsInDubai === false)
      {
        if(cart.bonusVoucherInfo[0]?.isCncVoucher != '1' 
        && cart.bonusVoucherInfo[0]?.isPvbvZero !== '1'
         && cart.promotions?.isPromotionCompleted 
         && cart.promotions?.applicableBillBusterPromotions().BillBusterPromotions 
         && cart.promotions?.applicableBillBusterPromotions().BillBusterPromotions.length > 0 
         && cart.selectedPromotions.length === 0) {
          if(cart.cartTitle === 'Your Cart')
            this.error = `Please select at least one promotion to your cart to continue`;
          else
            this.error = `Please select at least one promotion to ${cart.cartTitle}'s cart to continue`;
          return
        }
      }
      if(cart.cartProducts && cart.cartProducts.length > 0) {

        if(cart.paymentMethod === '' && checkForValidations) {
          this.error = 'Please select payment option';
          return
        }
        
        let cncAmt = 0;
        if(cart.bonusVoucherInfo[0]?.isCncVoucher == '1') {
          cncAmt = payload?.[0]?.bonusVoucherInfo?.[0]?.amount || 0;
        }
        let paymentData = [];
        let vouchers = [];
        let cartCost = cart.cost;
        let products = cart.cartProducts;
        let order = {
          cartId: cart.cartId,
          orderAmount: cart.totalCost,
          distributorId: cart.cartDistributorId,
          cncVoucherAmt: cncAmt
        }

        if(cart.giftVoucherInfo && cart.giftVoucherInfo.length > 0) {
          const firstGiftVoucherItem = cart.giftVoucherInfo[0];
          const voucher = {
            type: 'Gift',
            amount: 0,
            number: firstGiftVoucherItem.voucherSerialNumber ? firstGiftVoucherItem.voucherSerialNumber : '',
            code: firstGiftVoucherItem.giftVoucherCode ? firstGiftVoucherItem.giftVoucherCode : '',
          };

          vouchers.push(voucher);
          const giftProductList = this.getGiftProducts(cart);
          products = products.concat(giftProductList);
          cartCost = cartCost + (giftProductList ? giftProductList.length : 0)
        }

        const qtyPromotions = cart.promotions.applicableQuantityPromotions;

        if((cart.selectedPromotions && cart.selectedPromotions.length > 0) || (qtyPromotions && qtyPromotions.length > 0)) {
          const promotion = {
            type:'Promotional',
            amount: 0,
            number: '',
            code: '',
          };
          vouchers.push(promotion);
          const promoProductList = this.getPromotionalProducts(cart);
          products = products.concat(promoProductList);
          promoProductList && promoProductList.forEach((promoProduct) => {
            if(store.appConfiguration.isApiV2Enabled){
              cartCost = cartCost + promoProduct.total
            }
            else{
              cartCost = cartCost + (promoProduct.quantity * promoProduct.discountPrice)
            }
          })
        }
        
        // calculating the amount for each bonus payment object in order save.(as per requirement.)
        let tempCartCost = cartCost;
        cart.bonusVoucherInfo.map( obj => {    
          const bonusVoucherData = {
            totalAmount:(tempCartCost - obj.amount > 0 ? obj.amount : tempCartCost),
            method:'Bonus',
            voucherId:obj.chequeNo ? obj.chequeNo : '',
          };
          paymentData.push(bonusVoucherData);
          tempCartCost = tempCartCost - obj.amount > 0 ? tempCartCost - obj.amount : 0;
        })
        
        //calculating the amount for payment object(non-voucher).
        let totalSum = 0
        cart.bonusVoucherInfo.map( obj => {
          totalSum = parseInt(obj.amount)+totalSum
        })
        const bonusAmount = totalSum ? totalSum : 0
        const totalPay =  {
          totalAmount: cartCost - bonusAmount > 0 ? cartCost - bonusAmount : 0,
          method: cart.paymentMethod
        };
        if (totalPay.totalAmount != 0) {
          paymentData.push(totalPay);
        }

        order.payments = paymentData;
        order.vouchers = vouchers;
        order.products = products;
        /* ..........as per vestige end requirement to handle mini dlcp and other cases... */
        order.selectedPaymentMode = cart.paymentMethod;
        // console.log("vouchersvouchers"+JSON.stringify(order.vouchers))
        this.orders.push(order);
      }
    });
  }

  getGiftProducts(cart) {
    let giftProducts = []; 
    // if(store.appConfiguration.isApiV2Enabled){
    //   if(cart.cost >= cart.giftVoucherInfo.giftVouchers?.minBuyAmount) {
    //     cart.giftVoucherInfo.itemDetails.forEach((giftProduct) => {
    //       const product = {
    //         skuCode: giftProduct.skuCode ? giftProduct.skuCode : '',
    //         productId: giftProduct.skuCode ? giftProduct.skuCode : '',
    //         pointValue: 0.0,
    //         businessVolume: 0.0,
    //         title: giftProduct.productName ? giftProduct.productName : '',
    //         quantity: giftProduct.quantity ? giftProduct.quantity : 0,
    //         unitCost: 1,
    //         total: giftProduct.quantity ? giftProduct.quantity : 0,
    //         locationId: 0,
    //         image: '',
    //         isGiftVoucher: true,
    //       }
    //       giftProducts.push(product)
    //     })
    //   }
    // }
    // else{
      cart.giftVoucherInfo.forEach((giftProduct) => {
        if(cart.cost >= giftProduct?.minBuyAmount) {
          const product = {
            // skuCode: '',
            skuCode: giftProduct.skuCode ? giftProduct.skuCode : '',
            productId: giftProduct.productId ? giftProduct.productId : '',
            pointValue: 0.0,
            businessVolume: 0.0,
            title: giftProduct.productName ? giftProduct.productName : '',
            quantity: giftProduct.quantity ? giftProduct.quantity : 0,
            unitCost: store.profile.defaultAddressCountryId == 4 ? 0 : 1,
            total: giftProduct.quantity ? giftProduct.quantity : 0,
            locationId: 0,
            image: '',
            isGiftVoucher: true,
          }
          giftProducts.push(product)
        }
      })
    // }
    return giftProducts
  }

  getPromotionalProducts(cart) {
    let promoProducts = []; 
    const isApiV2Enabled = store.appConfiguration.isApiV2Enabled;
    cart.selectedPromotions.forEach((promo) => {
      const product = {
        skuCode: promo.skuCode || '',
        productId: promo.promotionItemID || '',
        pointValue: 0.0,
        businessVolume: 0.0,
        title: promo.title || '',
        quantity: promo.quantity || 0,
        unitCost: isApiV2Enabled? 0 : promo.unitCost || 0,
        total: (promo.quantity * promo.discountPrice) || 0,
        locationId: promo.locationId,
        imageUrl: promo.imageUrl,
        isPromotional: true,
        promotionalId: promo.promotionID,
        // discountPrice: isApiV2Enabled ? ((Number(promo.unitCost)- Number(promo.discountPrice)) || 0 ) : (promo.discountPrice || 0)
        discountPrice: isApiV2Enabled ? 1 : (promo.discountPrice || 0)  // TODO: promotion unit price
      }
      promoProducts.push(product)
    })
    
    cart.qtyPromotions && cart.qtyPromotions.forEach(promo => {
      const product = {
        skuCode: promo.skuCode || '',
        productId: promo.promotionItemID || '',
        pointValue: 0.0,
        businessVolume: 0.0,
        title: promo.title || '',
        quantity: promo.quantity || 0,
        unitCost: promo.unitCost || 0,
        total: (promo.quantity * promo.discountPrice) || 0,
        locationId: promo.locationId,
        imageUrl: promo.imageUrl,
        isPromotional: true,
        promotionalId: promo.promotionID,
        discountPrice: promo.discountPrice || 0
      }
      promoProducts.push(product)
    })

    return promoProducts
  }

  // _totalCartCost = (totalCost, bonusVouchers) => {
  //   console.log('totalCost>>>>>>>>>>>>>>>.',totalCost)
  //   let _totalCost = bonusVouchers.length ? 0 : totalCost;
  //   bonusVouchers.map( obj => {
  //     if( obj.chequeNo){
  //       let _chequeNo = obj.chequeNo.substring(0, 3);
  //       if(_chequeNo.toUpperCase() === 'CNC' || _chequeNo.toUpperCase() === 'CSY'){
  //         _totalCost = totalCost === 0 ? 150 : totalCost
  //       }
  //       else {
  //         _totalCost = totalCost
  //       }
  //     } 
  //   })
  //   return _totalCost;
  // }
}