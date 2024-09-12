/**
 * @description Cart List Component returns Owner cart & the downline cart
*/

import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions
} from 'react-native';
import { _ } from 'lodash';
import Banner from 'app/src/screens/Dashboard/Banner';
import { Specs } from 'app/src/utility/Theme';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Label from 'app/src/components/customLabel/Label';
import Stepper from 'app/src/components/buttons/Stepper';
import { strings } from 'app/src/utility/localization/Localized';
import { Toast } from 'app/src/components/toast/Toast';
import { CustomButton, CustomRadioButton } from 'app/src/components/buttons/Button';
import { SHIPPING_TYPE, SHIPPING_TYPE_ID } from 'app/src/utility/constant/Constants';
import autobind from 'autobind-decorator';
import { observer, inject } from 'mobx-react';
import { priceWithCurrency, capitalizeFirstCharacter, socialShare } from 'app/src/utility/Utility';
import AlertClass from 'app/src/utility/AlertClass';
import LottieView from 'lottie-react-native';
import Loader from 'app/src/components/loader/Loader';

const PLACEHOLDER = require('app/src/assets/images/productList/placeHolder.png');
const SHARE_IMAGE = require('app/src/assets/images/DashBoardHeader/share_icon.png');
const LOADERFILE = require('../../assets/animations/cartAnimation.json')

const { width } = Dimensions.get('window');

@inject('auth', 'profile', 'cart')
@observer
class CartListComponent extends Component<any, any> {

  cartView: any;

  constructor(props) {
    super(props);
    this.props = props;
    this.fetchNoInventoryProducts = '';
    this.state = {
      isLoading: false
    }
    this.outOfStockList = [];
  }

  toast(message, toastType: Toast.type,) {
    Toast.show(message, {
      duration: Toast.durations.SHORT,
      type: toastType,
      shadow: false,
      animation: true,
      hideOnPress: true,
      delay: 0,
    });
  }

  @autobind
  cartProduct(product, index, gift) {
    const { navigation, reviewCart, isShowMoqStrip } = this.props;
    let isProductOutOfInventory = false;
    if (this.props.cart.noInventoryProducts) {
      isProductOutOfInventory = this.props.cart.noInventoryProducts.includes(product.skuCode);
    }
    let isProductExceedsMoq = false
    if (isShowMoqStrip && product.cncApplicability && product.cncApplicability == '1' && product.quantity > product.cncMOQ) {
      isProductExceedsMoq = true;
    }
    let tempPromotionPrice = product?.promotionType === "1" && product?.locationId === "1954" ? 0 : (gift ? product.discountPrice : product.unitCost); // TODO: temp solution for DUBAI promotion
    tempPromotionPrice = (typeof tempPromotionPrice === 'undefined') ? 0 : tempPromotionPrice;

    return (
      <TouchableOpacity
        style={[!reviewCart ? styles.borderBottom : (index !== 0) ? styles.borderTop : null]}
        disabled={gift}
        onPress={() => navigation.navigate('productDetails', { skuCode: product.skuCode, locationId: product.locationId, productId: product.productId })}
        key={product.skuCode}
      >
        <View style={[!reviewCart ? styles.cart : styles.reviewCart]}>
          <Banner
            styles={[styles.productImage, reviewCart ? { marginTop: 14 } : null]}
            resizeMode="contain"
            source={product.productImageUrl ? { uri: product.productImageUrl } : product.imageUrl ? { uri: product.imageUrl } : PLACEHOLDER}
          />
          <View style={[styles.productDetailContainer, (reviewCart) ? { marginTop: 16 } : null]}>
            <Label>{`${product.pointValue || 0} PV`}</Label>
            <Text numberOfLines={2} style={[styles.productTitle, { color: isProductOutOfInventory ? 'red' : '#6c7a87' }]}>{capitalizeFirstCharacter(product.title || product.productName)}</Text>
            <Text style={styles.productPrice}>
              {/* {`${strings.productDetails.dealerPrice}: ${priceWithCurrency(this.props.profile.defaultAddressCountryId, (gift ? product.discountPrice : product.unitCost) || 1.00)}`} */}
              {`${strings.productDetails.dealerPrice}: ${priceWithCurrency(this.props.profile.defaultAddressCountryId, Number(tempPromotionPrice))}`}
              {reviewCart ? <Text style={styles.productPrice}>{`     Quantity: ${product.quantity}`}</Text> : null}
            </Text>
            {/* {(gift) ? <Text style={[styles.productTitle, { color: '#6c7a87' }]}>{`${strings.productDetails.quantityHeading}: ${product.quantity}`}</Text> : null} */}
            <Text style={[styles.itemName,styles.price,{marginTop:5}]}>
              {'Item Code: '}
              <Text style={styles.price}>
                {product?.skuCode}
              </Text>
            </Text>
          </View>
          {!reviewCart ? (
            <View style={styles.productQuantityContainer}>
              <View>
                {(gift) ? null : (
                  <Stepper
                    isDelete
                    style={{ marginVertical: 8, width: 75 }}
                    isDisabled={gift || (isProductOutOfInventory)}
                    getQuantity={(value) => { console.log('resvalue', value) }}
                    availableQuantity={product.maxQuantity}
                    maxLimitReached={this.toast}
                    onDeletePress={() => this.removeProduct(this.props.userCart.cartId, product)}
                    addOrRemoveProduct={(type) => this.props.addOrRemoveProduct(product, type, this.props.userCart.cartId, this.props.userCart.cartDistributorId)}
                  >
                    {product.quantity}
                  </Stepper>
                )}
                {(gift || product.quantity === 1) ? null : (
                  <TouchableOpacity
                    style={{ paddingVertical: 10, alignSelf: 'center' }}
                    onPress={() => this.removeProduct(this.props.userCart.cartId, product)}
                  >
                    <FontAwesome name='trash-o' size={18} color='#01000250' />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ) : null}
        </View>
        {(!reviewCart && isProductExceedsMoq)
          ?
          <View style={{ backgroundColor: '#c8c9d359', paddingBottom: 2 }}>
            <View style={styles.maxQuantityAllowed}>
              <Text style={styles.textAlert}>{`Maximum quantity allowed : ${product.cncMOQ}`}</Text>
            </View>
          </View>
          : null}
      </TouchableOpacity>
    )
  }

  @autobind
  removeProduct(cartId, product) {
    if (this.props.userCart.cartTitle != 'Your Cart' && this.props.userCart.cartProducts.length == 1) {
      AlertClass.showAlert('Warning',
        'Deleting this product will also delete the downline cart. Do you want to continue as self ?',
        [
          {
            text: 'Yes', onPress: () => {
              this.props.cart.updateShopForObject('Self', this.props.auth.distributorID.toString(), 'SELF');
              this.props.removeProduct(cartId, product)
            }
          },
          { text: 'No', onPress: () => console.log('Ok pressed') }
        ])
    }
    else {
      Alert.alert(
        strings.cartListProduct.alertMessageHeading,
        strings.cartListProduct.removeItem,
        [
          { text: strings.commonMessages.ok, onPress: () => this.props.removeProduct(cartId, product) },
          { text: strings.commonMessages.cancel, onPress: () => { } }
        ],
        { cancelable: false }
      )
    }
  }

  @autobind
  removeCart(cartId) {
    if (this.props.userCart.cartTitle != 'Your Cart') {
      AlertClass.showAlert('Warning',
        'Deleting this cart will delete the downline cart. Do you want to continue as self ?',
        [
          {
            text: 'Yes', onPress: () => {
              this.props.cart.updateShopForObject('Self', this.props.auth.distributorID.toString(), 'SELF');
              this.props.removeCart(cartId)
            }
          },
          { text: 'No', onPress: () => console.log('Ok pressed') }
        ])
    }
    else {
      Alert.alert(
        strings.cartListProduct.alertMessageHeading,
        strings.cartListProduct.removeItem,
        [
          { text: strings.commonMessages.ok, onPress: () => this.props.removeCart(cartId) },
          { text: strings.commonMessages.cancel, onPress: () => { } }
        ],
        { cancelable: false }
      )
    }

  }

  showAlert = () => {
    return (
      Alert.alert(
        '',
        strings.cartListProduct.onlineDisabled,
        [
          { text: strings.commonMessages.ok, onPress: () => console.log('Skip pressed') },
        ],
        { cancelable: false }
      )
    );
  }

  updateQTYPromotions = async () => {
    let data = this.props.userCart.promotions.applicableQuantityPromotions
    const productsIds = data.map(obj => obj.promotionItemID);
    const promoProducts = await this.props.userCart.promotions.getProductsInfo(productsIds.toString(), this.props.profile.location)

    if (data.length === promoProducts.length) {
      for (let i = 0; i < data.length; i++) {
        promoProducts.forEach((product) => {
          if (data[i].promotionItemID == product.productId) {
            data[i].title = product.productName
            data[i].imageUrl = product.imageUrl
            data[i].skuCode = product.skuCode
            data[i].unitCost = product.productCost
          }
        })
      }
    }
    this.props.userCart.qtyPromotions = data;
  }

  getTotalNumberOfGiftVouchers = (getTotalNumberOfGiftVouchers) => {
    if (this.props.profile.defaultAddressCountryId == 4) return 0;  
    var total = 0;
    for (let i = 0; i < getTotalNumberOfGiftVouchers.length; i++) {
      let item = getTotalNumberOfGiftVouchers[i];
      total = total + item.quantity
    }
    return total
  }
  renderViewOrderSummary() {
    const {
      cost,
      bonusVoucherInfo,
      giftVoucherInfo,
      totalCartItems,
      totalCost,
      promotionCost,
      totalPVPoint,
      checkVoucherApplied,
    } = this.props.userCart;
    return (
      <View>
        <View style={[styles.borderBottom]}>
          <View style={styles.cartSummary}>
            <View>
              <Text style={styles.itemText}>{`${strings.cartListProduct.itemsKey} (${totalCartItems || 0})`}</Text>
              <Text style={[styles.itemText, { paddingTop: 10 }]}>
                {`${strings.cartListProduct.totalPV} : `}
                <Text style={styles.rupeesTextStyle}>{totalPVPoint.toFixed(2)}</Text>
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={[styles.priceView]}>
                <Text style={[styles.itemText]}>{`${strings.cartListProduct.total} : `}</Text>
                <Text style={[styles.rupeesTextStyle, styles.itemStyle]}>{`${priceWithCurrency(this.props.profile.defaultAddressCountryId, cost)}`}</Text>
              </View>
              {bonusVoucherInfo.length > 0 && (
                bonusVoucherInfo.map((item, index) => {
                  return ( <View style={[styles.priceView, { paddingTop: 10, }]}>
                    <Text style={[styles.itemText]}>{`${strings.cartListProduct.bonusDiscount} : `}</Text>
                    <Text style={[styles.rupeesTextStyle, styles.itemStyle]}>{`${priceWithCurrency(this.props.profile.defaultAddressCountryId, item.amount ? '-' + item.amount : 0)}`}</Text>
                  </View>);
                })
                
              )}
              {giftVoucherInfo.length > 0 && (
                <View style={[styles.priceView, { paddingTop: 10, }]}>
                  <Text style={[styles.itemText]}>{`${strings.cartListProduct.giftVoucher} : `}</Text>
                  <Text style={[styles.rupeesTextStyle, styles.itemStyle]}>{`${priceWithCurrency(this.props.profile.defaultAddressCountryId, this.getTotalNumberOfGiftVouchers(giftVoucherInfo))}`}</Text>
                </View>
              )}
              {promotionCost > 0 && (
                <View style={[styles.priceView, { paddingTop: 10, }]}>
                  <Text style={[styles.itemText]}>{`${strings.cartListProduct.promoCost} : `}</Text>
                  <Text style={[styles.rupeesTextStyle, styles.itemStyle]}>{`${priceWithCurrency(this.props.profile.defaultAddressCountryId, promotionCost)}`}</Text>
                </View>
              )}
              <View style={[styles.priceView, { paddingTop: 10, }]}>
                <Text style={[styles.itemText]}>{`${strings.cartListProduct.orderTotal} : `}</Text>
                <Text style={[styles.rupeesTextStyle, styles.itemStyle]}>{`${priceWithCurrency(this.props.profile.defaultAddressCountryId, totalCost)}`}</Text>
              </View>
              {
                this.props.showPromotionLoader && (
                  <Text
                    onPress={() => this.props.applyVoucher(this.props.userCart)}
                    style={[styles.itemText, { paddingTop: 26, textAlign: 'right', color: checkVoucherApplied ? '#31cab3' : '#e92020' }]}
                  >
                    {checkVoucherApplied ? strings.cartListProduct.vouchersAppliedTitle : strings.cartListProduct.vouchersNotAppliedTitle}
                  </Text>
                )
              }

            </View>
          </View>
          <View style={{ height: 15 }} />
        </View>
      </View>
    )
  }

  renderReviewCartSummary() {
    const {
      cost,
      bonusVoucherInfo,
      giftVoucherInfo,
      totalCartItems,
      cartTitle,
      promotionCost,
      totalPVPoint
    } = this.props.userCart;
    return (
      <View>
        <Text style={{ ...styles.orderSummaryTitle }}>{`Order Summary (For ${cartTitle === 'Your Cart' ? 'Self' : cartTitle})`}</Text>
        <View style={styles.borderContainer}>
          <View style={{ ...styles.reviewCartStyle, paddingTop: 19 }}>
            <Text style={styles.itemText}>{`DP (${totalCartItems || 0} items)`}</Text>
            <Text style={[styles.rupeesTextStyle, styles.itemStyle]}>{`${priceWithCurrency(this.props.profile.defaultAddressCountryId, cost)}`}</Text>
          </View>
          {/* {!_.isEmpty(bonusVoucherInfo) && (
            <View style={[styles.reviewCartStyle, { paddingTop: 10 }]}>
              <Text style={[styles.itemText]}>{`${strings.cartListProduct.bonusDiscount} : `}</Text>
              <Text style={[styles.rupeesTextStyle, styles.itemStyle]}>{`${priceWithCurrency(this.props.profile.countryId, bonusVoucherInfo.amount ? '-' + bonusVoucherInfo.amount : 0)}`}</Text>
            </View>
          )} */}
          {bonusVoucherInfo.length > 0 && (
            bonusVoucherInfo.map((item, index) => {
              return ( 
                <View style={[styles.reviewCartStyle, { paddingTop: 10 }]}>
                  <Text style={[styles.itemText]}>{`${strings.cartListProduct.bonusDiscount} : `}</Text>
                  <Text style={[styles.rupeesTextStyle, styles.itemStyle]}>{`${priceWithCurrency(this.props.profile.defaultAddressCountryId, item.amount ? '-' + item.amount : 0)}`}</Text>
                </View>
              );
            })      
          )}
          {giftVoucherInfo.length > 0 && (
            <View style={[styles.reviewCartStyle, { paddingTop: 10, }]}>
              <Text style={[styles.itemText]}>{`${strings.cartListProduct.giftVoucher} : `}</Text>
              <Text style={[styles.rupeesTextStyle, styles.itemStyle]}>{`${priceWithCurrency(this.props.profile.defaultAddressCountryId, this.getTotalNumberOfGiftVouchers(giftVoucherInfo))}`}</Text>
            </View>
          )}
          {promotionCost > 0 && (
            <View style={[styles.reviewCartStyle, { paddingTop: 10, }]}>
              <Text style={[styles.itemText]}>{`${strings.cartListProduct.promoCost} : `}</Text>
              <Text style={[styles.rupeesTextStyle, styles.itemStyle]}>{`${priceWithCurrency(this.props.profile.defaultAddressCountryId, promotionCost)}`}</Text>
            </View>
          )}
          <View style={[styles.reviewCartStyle, { paddingBottom: 19 }]}>
            <Text style={[styles.itemText, { paddingTop: 10 }]}>
              {`${strings.cartListProduct.totalPV}`}
            </Text>
            <Text style={{ ...styles.rupeesTextStyle, paddingLeft: 16, paddingTop: 10 }}>{(this.props.cart.isCncVoucherApplied == '0' ? totalPVPoint.toFixed(2) : 0)}</Text>
          </View>
        </View>
        {this.renderVoucherContainer()}
      </View>
    )
  }

  renderVoucherContainer() {
    return (
      <TouchableOpacity style={styles.voucherContainer} onPress={() => this.props.applyVoucher(this.props.userCart)}>
        <Text style={[styles.cartTitle, { color: '#6797d4' }]}>{strings.cartListProduct.vouchersNotAppliedTitle}</Text>
        <FontAwesome name='chevron-right' size={18} color='#6797d4' />
      </TouchableOpacity>

    )
  }

  handleContainer() {
    const { cartId } = this.props.userCart
    console.warn(cartId)
    _.map(this.props.cart.refreshCartInfo, (element) => {
      if (cartId === element.cartId) {
        element.showInfo = !element.showInfo
      }
    })
    this.props.cart.refreshCartInfo = [... this.props.cart.refreshCartInfo]
  }

  handleBaseLocationMovement = async () => {
    if(this.props.profile.isWarehouseShipping == '1' && this.props.cart?.refreshCartInfo?.length < 1){
      await this.props.profile.changeShippingType(SHIPPING_TYPE.regularDelivery)
      this.toast(strings.viewCartScreen.movingToBaseLocationMessage);
      this.props.navigation.navigate('Dashboard')
    }
  }

  async deleteOutOfStock() {
    const {
      cartId,
      cartDistributorId,
      cartProducts
    } = await this.props.userCart;
    let isProductOutOfInventory = false;
    //let outOfStockList = [];
    cartProducts.map(async (product, index) => {
      if (this.props.cart.noInventoryProducts) {
        isProductOutOfInventory = this.props.cart.noInventoryProducts.includes(product.skuCode);
      }
      if (isProductOutOfInventory) {
        console.log('resisproduc', isProductOutOfInventory)
        this.outOfStockList.push(product)
        isProductOutOfInventory = false;
      }
    })
    let products = [{
      "cartId": cartId,
      "uplineId": cartDistributorId,
      "products": this.outOfStockList,
      "distributorId": cartDistributorId
    }]
    AlertClass.showAlert('Warning',
      'It will delete all out of stock products from cart',
      [
        {
          text: 'Yes', onPress: async () => {
            this.setState({ isLoading: true });
            await this.props.cart.OutOfStockProducts(products);
            await this.props.cart.fetchCartData(false);
            await this.props.cart.checkInventory(this.props.cart.skuCodes, true);
            this.fetchNoInventoryProducts = await this.props.cart.noInventoryProducts;
            await this.props.cart.updateCartInfo();
            this.handleBaseLocationMovement();
            this.setState({ isLoading: false });
          }
        },
        { text: 'No', onPress: () => console.log('Ok pressed') }
      ])
  }

  async deleteAllCNCProducts() {
    const {
      cartId,
      cartDistributorId,
      cartProducts
    } = await this.props.userCart;
    let isProductOutOfInventory = false;
    let cncProductsList = [];
    cartProducts.map(async (product, index) => {
      if (product.cncApplicability && product.cncApplicability == "1") {
        if (this.props.cart.noInventoryProducts) {
          isProductOutOfInventory = this.props.cart.noInventoryProducts.includes(product.skuCode);
        }
        if (!isProductOutOfInventory) {
          cncProductsList.push(product)
        }
      }
    })
    let products = [{
      "cartId": cartId,
      "uplineId": cartDistributorId,
      "products": cncProductsList,
      "distributorId": cartDistributorId
    }]
    AlertClass.showAlert('Warning',
      'It will delete all CNC products from cart',
      [
        {
          text: 'Yes', onPress: async () => {
            this.setState({ isLoading: true });
            await this.props.cart.deleteMultipleProducts(products);
            await this.props.cart.updateShopForObject('Self', this.props.auth.distributorID.toString(), 'SELF');
            await this.props.cart.fetchCartData(false);
            await this.props.cart.checkInventory(this.props.cart.skuCodes, true);
            await this.props.cart.updateCartInfo();
            this.handleBaseLocationMovement();
            this.setState({ isLoading: false });
          }
        },
        { text: 'No', onPress: () => console.log('Ok pressed') }
      ])
  }

  async deleteAllOthersProduct() {
    const {
      cartId,
      cartDistributorId,
      cartProducts
    } = await this.props.userCart;
    let isProductOutOfInventory = false;
    let otherProductsList = [];
    cartProducts.map(async (product) => {
      if (!product.cncApplicability || product.cncApplicability != '1') {
        if (this.props.cart.noInventoryProducts) {
          isProductOutOfInventory = this.props.cart.noInventoryProducts.includes(product.skuCode);
        }
        if (!isProductOutOfInventory) {
          otherProductsList.push(product)
        }
      }
    })
    let products = [{
      "cartId": cartId,
      "uplineId": cartDistributorId,
      "products": otherProductsList,
      "distributorId": cartDistributorId
    }]
    AlertClass.showAlert('Warning',
      'It will delete all product into "Others product" section from cart',
      [
        {
          text: 'Yes', onPress: async () => {
            this.setState({ isLoading: true });
            await this.props.cart.deleteMultipleProducts(products);
            await this.props.cart.updateShopForObject('Self', this.props.auth.distributorID.toString(), 'SELF');
            await this.props.cart.fetchCartData(false);
            await this.props.cart.checkInventory(this.props.cart.skuCodes, true);
            await this.props.cart.updateCartInfo();
            this.handleBaseLocationMovement();
            this.setState({ isLoading: false });
          }
        },
        { text: 'No', onPress: () => console.log('Ok pressed') }
      ])
  }

  renderOutOfStockInfo() {
    return (
      <View style={[styles.productTypeInfo]}>
        <View style={[styles.titleView]}>
          <View style={{ flexDirection: 'row' }}>
            <Text style={styles.cartTitle}>{strings.product.outOfStock}</Text>
          </View>
          {!this.props.reviewCart ?
            <TouchableOpacity
              onPress={() => this.deleteOutOfStock()}>
              <FontAwesome name='trash-o' size={18} color='#373e73' />
            </TouchableOpacity>
            : null
          }
        </View>
      </View>
    )
  }

  renderCNCProductsInfo() {
    return (
      <View style={[styles.productTypeInfo]}>
        <View style={styles.titleView}>
          <View style={{ flexDirection: 'row' }}>
            <Text style={styles.cartTitle}>{"CNC applicable products"}</Text>
          </View>
          {!this.props.reviewCart ?
            <TouchableOpacity
              onPress={() => this.deleteAllCNCProducts()}>
              <FontAwesome name='trash-o' size={18} color='#373e73' />
            </TouchableOpacity>
            : null
          }
        </View>
      </View>
    )
  }

  renderOthersProductInfo() {
    return (
      <View style={[styles.productTypeInfo]}>
        <View style={styles.titleView}>
          <View style={{ flexDirection: 'row' }}>
            <Text style={styles.cartTitle}>{"Other products"}</Text>
          </View>
          {!this.props.reviewCart ?
            <TouchableOpacity
              onPress={() => this.deleteAllOthersProduct()}>
              <FontAwesome name='trash-o' size={18} color='#373e73' />
            </TouchableOpacity>
            : null
          }
        </View>
      </View>
    )
  }

  render() {
    const {
      cartId,
      cartTitle,
      totalCost,
      cost,
      cartProducts,
      cartDistributorId,
      totalPVPoint,
      checkVoucherApplied,
      qtyPromotions,
      selectedPromotions,
      bonusVoucherInfo,
      giftVoucherInfo,
      totalCartItems,
      promotionCost,

    } = this.props.userCart;
    const { index, updatePayment, reviewCart, showInfo, fetchNoInventoryProducts } = this.props
    // if(this.props.userCart.promotions.applicableQuantityPromotions.length > 0 && qtyPromotions.length === 0) {
    //   this.updateQTYPromotions()
    // }
    if (this.props.userCart.promotions.applicableQuantityPromotions.length > 0 && qtyPromotions.length === 0 && this.props.cart.isBonusVoucherPvBvZero != '1' && this.props.cart.isCncVoucherApplied == '0') {
      this.updateQTYPromotions()
    }
    const isCncProductAvailable = cartProducts.findIndex(x => (x.cncApplicability && x.cncApplicability == '1'))
    const tempSelectedPromotions = selectedPromotions.map(val => {
      const unitCost = val?.promotionType === "1" && val?.locationId === "1954" ? 1 : val.unitCost ; // TODO: temp solution for DUBAI promotion
      return { ...val, unitCost };
    });

    return (
      <View
        accessibilityLabel="Cart_Item"
        testID="Cart_Item"
        ref={screenShot => (this.cartView = screenShot)}
        style={styles.container}
      >
        <Loader loading={this.state.isLoading} />
        <View style={styles.borderBottom}>
          <View style={styles.titleView}>

            {!reviewCart ? (
              <View style={{ flexDirection: 'row' }}>
                <Text style={[styles.cartTitle, { maxWidth: width * 60 / 100 }]} numberOfLines={2}>{cartTitle}</Text>
                <Text style={styles.cartTitle}>{` - ${strings.cartListProduct.cartDistributorID}: ${cartDistributorId}`}</Text>
              </View>
            ) : (
                <View style={{ flexDirection: 'row' }}>
                  <View style={styles.numberContainerStyle}>
                    <Text style={{ color: '#373e73' }}>
                      {`${index + 1}.`}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', width: '60%' }}>
                    <Text style={{ ...styles.cartTitle, paddingLeft: 12, paddingTop: 5 }}>{`Order for ${cartTitle === 'Your Cart' ? 'Self' : cartTitle}`}</Text>
                    <Text style={{ paddingTop: 5 }}>{`- (Dist ID: ${cartDistributorId})`}</Text>
                  </View>
                </View>
              )}

            {cartProducts && cartProducts.length > 0 && (
              <TouchableOpacity onPress={() => {
                !reviewCart ? socialShare(this.cartView) : this.handleContainer()
              }
              }
              >
                {!reviewCart ? (
                  <Banner
                    styles={styles.refreshIcon}
                    source={SHARE_IMAGE}
                    resizeMode='contain'
                  />
                ) : (
                    <View style={{ paddingTop: 6 }}>
                      {showInfo ? <FontAwesome name='minus' size={18} color='#373e73' /> : <FontAwesome name='plus' size={18} color='#373e73' />}
                    </View>
                  )}
              </TouchableOpacity>

            )}
          </View>
        </View>

        {showInfo && cartProducts && cartProducts.length > 0 ?
          (
            <View>
              {(fetchNoInventoryProducts && fetchNoInventoryProducts.length)
                ?
                [
                  this.renderOutOfStockInfo(),
                  cartProducts.map((product, index) => {
                    let isProductOutOfInventory = fetchNoInventoryProducts.includes(product.skuCode);
                    if(isProductOutOfInventory){
                      return this.cartProduct(product, index)
                    }
                  })
                ]
                : null
              }
              {(isCncProductAvailable != -1)
                ?
                [
                  this.renderCNCProductsInfo(),
                  cartProducts.map((product, index) => {
                    if (!fetchNoInventoryProducts) {
                      if(product.cncApplicability == '1'){
                        return this.cartProduct(product, index)
                      }
                    } 
                    else{
                      let isProductOutOfInventory = fetchNoInventoryProducts.includes(product.skuCode);
                      if(!isProductOutOfInventory && product.cncApplicability == '1'){
                        return this.cartProduct(product, index)
                      }
                    }
                  })
                ]
                : null
              }

              {
                this.renderOthersProductInfo()}
              {/* {cartProducts.map((product, index) => (!product.cncApplicability || !product.cncApplicability == "0") ? this.cartProduct(product, index) : null)} */}
              {
                cartProducts.map((product, index) => {
                  if(fetchNoInventoryProducts && fetchNoInventoryProducts.length){
                    let isProductOutOfInventory = fetchNoInventoryProducts.includes(product.skuCode)
                    if(!isProductOutOfInventory && (!product.cncApplicability || product.cncApplicability != "1")){
                      return this.cartProduct(product, index)
                    }
                  }
                  else{
                    if((!product.cncApplicability || product.cncApplicability != "1")){
                      return this.cartProduct(product, index)
                    }
                  }
                })
              }

              {(qtyPromotions.length > 0 || selectedPromotions.length > 0) && (
                <View style={styles.titleView}>
                  <Text style={styles.cartTitle}>{strings.cartListProduct.promotionalProducts}</Text>
                </View>
              )}
              {qtyPromotions.map((product, index) => this.cartProduct(product, index, true))}
              {tempSelectedPromotions.map((product, index) => this.cartProduct(product, index, true))}
              {this.props.cart.cartVouchers[index] && this.props.cart.cartVouchers[index].giftVoucherInfo && this.props.cart.cartVouchers[index].giftVoucherInfo.length > 0 && (
                <View style={styles.titleView}>
                  <Text style={styles.cartTitle}>{strings.cartListProduct.giftProducts}</Text>
                </View>
              )}
              {this.props.cart.cartVouchers[index] && this.props.cart.cartVouchers[index].giftVoucherInfo && this.props.cart.cartVouchers[index].giftVoucherInfo.length > 0 && this.props.cart.cartVouchers[index].giftVoucherInfo.map((product, index) => this.cartProduct(product, index, true))}
              {!reviewCart ? this.renderViewOrderSummary() : this.renderReviewCartSummary()}

            </View>
          ) :
          !reviewCart ? (
            <View style={[styles.borderBottom, { justifyContent: 'center', alignItems: 'center' }]}>
              <Text style={[styles.itemText, { padding: 30 }]}>{strings.cartListProduct.emptyCartTitle}</Text>
            </View>
          ) : null
        }
        {!reviewCart && cartProducts && cartProducts.length > 0 && this.props.showPromotionLoader && (
          <View style={styles.borderBottom}>
            <View style={[styles.titleView]}>
              <Text style={[styles.paymentText]}>{`${strings.cartListProduct.paymentMethod} : `}</Text>
              <CustomRadioButton
                overrideStyle={styles.radioButton}
                buttonText={strings.cartListProduct.cashButton}
                accessibilityLabel={strings.cartListProduct.cashButton}
                onPress={() => {
                  (this.props.profile.activeAddress.addressType === 'Shipping') ? alert(strings.cartListProduct.cashOnShipping) : updatePayment(index, 'Cash')
                }}
                isSelected={this.props.cart.cartVouchers[index].paymentType.toUpperCase() === 'CASH' ? true : false}
              />
              <CustomRadioButton
                overrideStyle={styles.radioButton}
                buttonText={strings.cartListProduct.onlineButton}
                accessibilityLabel={strings.cartListProduct.onlineButton}
                onPress={() => {
                  console.log(this.props.profile.activeAddress.isOnlinePayment)
                  if (!this.props.profile.activeAddress.isOnlinePayment) {
                    alert(strings.cartListProduct.onlineDisabled)
                  }
                  else {
                    updatePayment(index, 'Online')
                    // alert(strings.cartListProduct.onlineOnShipping)
                  }
                }}
                isSelected={this.props.cart.cartVouchers[index].paymentType.toUpperCase() === 'ONLINE' ? true : false}
              />
            </View>
          </View>
        )}
        <View style={styles.borderBottom}>
          {!reviewCart ? (
            <View style={[styles.titleView]}>
              {(this.props.auth.distributorID !== cartDistributorId.toString()) && (
                <Text
                  style={[styles.deleteButton]}
                  onPress={() => this.removeCart(cartId)}
                >
                  {strings.cartListProduct.deleteCartText}
                </Text>
              )}
              <View style={{ flex: 1 }} />
              {/* <CustomButton
                handleClick={() => this.props.handleClick(index)}
                buttonContainer={styles.checkoutButton}
                buttonTitleStyle={styles.checkoutButtonTitle}
                buttonTitle={strings.cartListProduct.checkoutButtonText}
              /> */}
            </View>
          ) : null}
        </View>
        {!this.props.userCart.promotions.isPromotionCompleted && this.props.showPromotionLoader && (
          <View style={styles.overlay}>
            <LottieView
              source={LOADERFILE}
              cacheStrateg='strong'
              autoPlay
              style={{ marginBottom: 35 }}
              loop
            />
            <Text>Loading Promotions</Text>
          </View>
        )}
      </View>
    );
  }
}

export default CartListComponent;

/**
 * @description CartListComponent CSS defined here
*/
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    marginTop: 10,
  },
  numberContainerStyle: {
    height: 30,
    width: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#c8c9d359',
    borderWidth: 1
  },
  borderContainer: {
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderColor: '#c8c9d359',
  },
  orderSummaryTitle: {
    ...Specs.fontBold,
    fontSize: 18,
    marginLeft: 15,
    marginTop: 19,
    marginBottom: 12,
    color: '#92909B',

  },
  voucherContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex: 1,
    paddingHorizontal: 15,
    marginVertical: 19
  },
  titleView: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 10,
  },
  cartTitle: {
    ...Specs.fontSemibold,
    fontSize: 14,
    color: '#373e73',
  },
  cart: {
    flexDirection: 'row',
    marginTop: 14,
    paddingBottom: 10,
  },
  reviewCart: {
    flexDirection: 'row',
    paddingBottom: 10,
  },
  borderBottom: {
    borderBottomWidth: 0.5,
    borderColor: '#c8c9d359',
  },
  productTypeInfo: {
    borderBottomWidth: 0.5,
    borderTopWidth: 3,
    borderColor: '#c8c9d359',
    backgroundColor: '#edf3ff'
  },
  borderTop: {
    borderTopWidth: 1,
    borderTopColor: '#c8c9d359',
  },
  productDetailContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  productImage: {
    width: 60,
    height: 79,
    alignItems: 'flex-start',
    marginLeft: 15,
    marginRight: 10,
  },
  productTitle: {
    ...Specs.fontMedium,
    fontSize: 12,
    lineHeight: 18,
    color: '#6c7a87',
    // color: 'red',
    marginVertical: 4,
    marginRight: 10,
  },
  reviewCartStyle: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 15
  },
  productPrice: {
    flexDirection: 'row',
    ...Specs.fontSemibold,
    color: '#14aa93',
    fontSize: 12,
    lineHeight: 18,
  },
  maxQuantityAllowed: {
    height: 25,
    backgroundColor: 'red',
    justifyContent: 'center',
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    // shadowColor: '#c8c9d359',
    // shadowOffset: { width: 1, height: 1 },
    // shadowOpacity:  0.8,
    // shadowRadius: 3,
    // elevation: 3,
  },
  textAlert: {
    flexDirection: 'row',
    ...Specs.fontSemibold,
    color: '#fff',
    fontSize: 12,
    lineHeight: 18,
    alignSelf: 'center',
  },
  productQuantityContainer: {
    alignItems: 'center',
    flexDirection: 'column',
    marginRight: 15,
  },
  cartSummary: {
    flexDirection: 'row',
    marginHorizontal: 15,
    marginTop: 15,
  },
  priceView: {
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  itemText: {
    ...Specs.fontRegular,
    fontSize: 14,
    color: '#46586f',
  },
  itemStyle: {
    textAlign: 'right',
  },
  paymentText: {
    ...Specs.fontMeduim,
    fontSize: 16,
    color: '#00000080',
    alignSelf: 'center',
  },
  radioButton: {
    ...Specs.fontMeduim,
    fontSize: 14,
    color: '#00000080',
  },
  deleteButton: {
    ...Specs.fontMeduim,
    fontSize: 14,
    color: '#00000080',
    paddingVertical: 4
  },
  checkoutButton: {
    justifyContent: 'center',
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
    height: 25,
    borderColor: '#6797d4',
    borderRadius: 30,
  },
  checkoutButtonTitle: {
    ...Specs.fontMedium,
    fontSize: 14,
    color: '#6797d4',
    paddingHorizontal: 10,
  },
  rupeesTextStyle: {
    color: '#31cab3',
    fontSize: 14,
    fontWeight: 'bold',
    minWidth: 55,
  },
  overlay: {
    width: width,
    height: '100%',
    backgroundColor: '#fff',
    position: 'absolute',
    zIndex: 98,
    opacity: 0.9,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  refreshIcon: {
    height: 20,
    width: 20,
  },
  itemName: {
    color: '#6c7a87',
    fontSize: 12,
    ...Specs.fontMedium
  },
  price:{
    justifyContent: 'flex-end',
    color:'#31cab3',
    ...Specs.fontSemibold,
  },
});