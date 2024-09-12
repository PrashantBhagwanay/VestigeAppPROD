import React, { Component } from 'react';
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import { StackActions } from '@react-navigation/native';
// import { Card } from 'react-native-elements';
import { observer, inject } from 'mobx-react';
import PropTypes from 'prop-types';
import { Specs } from 'app/src/utility/Theme';
import Banner from 'app/src/screens/Dashboard/Banner';
import AddToCart from 'app/src/components/cartComponent/AddToCart';
import { strings } from 'app/src/utility/localization/Localized';
import { searchFromArray, priceWithCurrency, capitalizeFirstCharacter, connectedToInternet, isShoppingItemActiveInCountry } from 'app/src/utility/Utility';
import autobind from 'autobind-decorator';
import Label from 'app/src/components/customLabel/Label';
import AlertClass from 'app/src/utility/AlertClass';
import { Toast, AlertMessage } from 'app/src/components/toast/Toast';
import { UserRole, KYC_ERROR_MESSAGE } from 'app/src/utility/constant/Constants';
import Stepper from 'app/src/components/buttons/Stepper';
import { CartProductModel } from 'app/src/stores/models/CartModel';
import { get } from 'lodash';
import { _ } from 'lodash';
import { getMrpType } from '../../utility/Utility';
// This is the static product image
const PRODUCT_PLACEHOLDER = require('app/src/assets/images/productList/placeHolder.png');
const BACKGROUND_IMAGE = require('app/src/assets/images/productList/backgroundShadow.png');
const ADD_TO_CART = require('app/src/assets/images/productList/addToCart.png');
const REMOVE_ICON = require('app/src/assets/images/Kyc/remove_btn.png');
const COLORED_RATING_ICON = require('app/src/assets/images/coloured_Star.png')
const GREY_RATING_ICON = require('app/src/assets/images/grey_star.png')

/**
 * 
 * @param {item, ratingIcon, addIcon, buyIcon, wishlistIcon, favouriteIcon, mainView} 
 * item: data to be displayed in the product list
 * ratingIcon, addIcon, buyIcon, wishlistIcon, favouriteIcon : these are the images to be displayed in grid view
 * mainView: styling for the main card View 
 * @description: It contains grid view product listing using cards 
 */

@inject('products', 'cart', 'auth', 'wishList','profile', 'appConfiguration')
@observer
export default class Product extends Component {

  static propTypes = {
    wishListDisplay: PropTypes.string,
    productListDisplay: PropTypes.string,
    productDetailView: PropTypes.bool,
  }

  static defaultProps = {
    wishListDisplay: 'none',
    productListDisplay: 'none',
    productDetailView:false
  };
   
  constructor(props){
    super(props)
    this.state= {
      quantity:1,
      modalVisible: false,
      selectedCheckBox: [],
      productAddToCart: [],
      selectedProduct: ''
    }
  }
 
  openBuyingPreferenceVisible = visible => {
    if(visible === false){
      this.setState({
        selectedCheckBox : [],
        productAddToCart: [],
        selectedProduct: ''
      })
    }
    this.setState({ modalVisible: visible });
  }

  createCartForDownline = () => {
    const { modalVisible } = this.state;
    this.props.navigation.navigate('createCartDownlineList');
    this.openBuyingPreferenceVisible(!modalVisible);
  }
  // onAddTocartPress = _.debounce(async(type, product, cartId, distributorID) => {
  //   this.props.cart.addProductToCart(type, product, cartId, distributorID)
  //   }, 1000, { leading: true, trailing: false })
  // @autobind
  addToCartPress = _.debounce(async(product) => { 
    // if(!this.props.profile.isEkycDone){
    //   AlertMessage.showAlert( KYC_ERROR_MESSAGE.kycError, this.props.navigation)
    //   return;
    // }
    // this.setState({
    //   modalVisible: true,
    //   selectedProduct: Object.assign(new CartProductModel(product, selectedQuantity={quantity:this.state.quantity})) 
    // });
    const selectedProduct = Object.assign(new CartProductModel(product, {quantity:this.state.quantity})) 
    const result = searchFromArray(this.props.cart.shopForObjectInfo.cartTitle, this.props.cart.usersCart.slice());
    console.log(result)
    const productToBeAdded = {
      cartId: result.cartId || 0, 
      uplineId: this.props.auth.distributorID,
      products: [selectedProduct],
      // distributorId: result.cartDistributorId ? result.cartDistributorId : this.props.auth.distributorID
      distributorId: this.props.cart.shopForObjectInfo.distributorID
    }
    // const {productAddToCart } = this.state;
    this.setState({
      productAddToCart: [productToBeAdded]
    });
    this.startShoppingPress()
  }, 1000, { leading: true, trailing: false })

  
  /**
   * @function open a modal from downward for all available cart
   * @param {*} visible
   */
  openBuyingPreference = () => {
    this.setState({
      modalVisible: true,
    });
  }

  @autobind
  async startShoppingPress() {
    const isConnectedToInternet = await connectedToInternet();
    if(isConnectedToInternet) {
      if (this.state.productAddToCart.length < 1) {
        AlertClass.showAlert('', 
          strings.product.selectProduct, 
          [{text: 'OK', onPress: () => console.log('OK Pressed')}])
        return;
      }
      await this.props.cart.refreshcartInfo();
      const { isGuestUser } = this.props.auth;
      if(isGuestUser) {
        this.openBuyingPreferenceVisible(false);
        AlertClass.showAlert('', 
          strings.commonMessages.guestUserMessage, 
          [
          // {text: strings.onboardingScreen.buttonSignUp, onPress: () => this.props.navigation.navigate('signup') },
            {text: strings.commonMessages.ok, onPress: () => console.log('OK Pressed') }], true)
      }
      else if(this.props.profile.countryId == 2){
        AlertClass.showAlert('', 
        strings.commonMessages.restrictAddCartCountryMessage, 
          [
            // {text: strings.onboardingScreen.buttonSignUp, onPress: () => this.props.navigation.navigate('signup') },
            {text: strings.commonMessages.ok, onPress: () => console.log('OK Pressed') }], true)
      }
      else {
        const status = await this.props.cart.addProductToCart(this.state.productAddToCart)
        const { navigationFromWishlist, item } = this.props;
        if(status.success && navigationFromWishlist) {        
          this.updateWishList(item, 'remove', 'update')
          this.openBuyingPreferenceVisible(false);
          if(status.toast && status.alert) {
            this.toast(status.toast, Toast.type.SUCCESS)
            AlertClass.showAlert('' , status.alert, [{text: 'OK', onPress: () => status.kycLink ? this.props.navigation.navigate('kycImage') : console.log('OK Pressed') }] )
          }
          else if(status.alert) {
            AlertClass.showAlert('', status.alert, [{text: 'OK', onPress: () => status.kycLink ? this.props.navigation.navigate('kycImage') : console.log('OK Pressed') }])
          }
          else {
            this.toast(status.toast, Toast.type.SUCCESS)
          }
        } 
        else if(status.success) {
          this.openBuyingPreferenceVisible(false);
          if(!!status.toast && !!status.alert) {
            this.toast(status.toast, Toast.type.SUCCESS)
            AlertClass.showAlert('' , status.alert, [{text: 'OK', onPress: () => status.kycLink ? this.props.navigation.navigate('kycImage') : console.log('OK Pressed') }] )
          }
          else if(status.alert) {
            AlertClass.showAlert('', status.alert, [{text: 'OK', onPress: () => status.kycLink ? this.props.navigation.navigate('kycImage') : console.log('OK Pressed') }])
          }
          else {
            this.toast(status.toast, Toast.type.SUCCESS)
          }
        }
        else {
          this.openBuyingPreferenceVisible(false);
          AlertClass.showAlert('', status.alert, [{text: 'OK', onPress: () => console.log('OK Pressed') }])
        }
      }
    }
    else {
      this.toast(strings.commonMessages.noInternet, Toast.type.ERROR)
    }
  }

  /**
   * @function confirmBuyer and open cart according to buyer
   * @param {*} visible
   */
  confirmBuyerCart = async(buyer) => {
    const result = searchFromArray(buyer, this.props.cart.usersCart.slice());
    const productToBeAdded = {
      cartId: result.cartId || 0, 
      uplineId: this.props.auth.distributorID,
      products: [this.state.selectedProduct],
      distributorId: result.cartDistributorId ? result.cartDistributorId : this.props.auth.distributorID
    }
    const { selectedCheckBox, productAddToCart } = this.state;
    await this.setState({
      selectedCheckBox: [...selectedCheckBox, buyer],
      productAddToCart: [...productAddToCart, productToBeAdded]
    });
  }

  setConfirmBuyer = async(buyer) => {
    const { selectedCheckBox, productAddToCart } = this.state;
    let selectedCheckBoxBackup = [...selectedCheckBox];
    let productToBeAdded = [...productAddToCart];
    const removeBuyer = selectedCheckBox.indexOf(buyer);
    selectedCheckBoxBackup.splice(removeBuyer, 1);
    productToBeAdded.splice(removeBuyer, 1)
    await this.setState({
      selectedCheckBox: selectedCheckBoxBackup,
      productAddToCart: productToBeAdded
    });
  }

  toast(message, toastType: Toast.type, ){
    Toast.show(message, {
      duration: Toast.durations.SHORT,
      type: toastType,
      shadow: false,
      animation: true,
      hideOnPress: true,
      delay: 0,
    });
  }

  async updateWishList(item, type, update) {
    const { wishList } = this.props;
    (update === 'update') ? await this.props.wishList.updateWishList(item, type, update) : await this.props.wishList.updateWishList(item, type)
    if(wishList.isMessage && wishList.isMessage !== ''){
      (wishList.isUpdate) ? item.isFavourite=true : ''
      if(update !== 'update'){
        this.toast(wishList.isMessage, Toast.type.SUCCESS)
      }
    }
  }

  onWishlistUpdate = () => {
    this.props.getComponentData && this.props.getComponentData()
  }

  showOtherOptionMessage = () => {
    AlertClass.showAlert('Alert!', 
      `${strings.product.otherOptionMessage}`, 
      [{text: 'OK', onPress: () => console.log('OK Pressed')}])
  }

  renderAddToCartButtonView = (item) => {
    return(
      <View 
        style={[styles.buttonMainView,(item.maxQuantity<1 || this.props.auth.userRole === UserRole.Trainer) ? {opacity:0.5} : {opacity:1}]}
        pointerEvents={(item.maxQuantity<1 || this.props.auth.userRole === UserRole.Trainer) ? 'none' : 'auto'}
      >
        <Stepper 
          getQuantity={(value)=>this.setState({ quantity:value })} 
          isDisabled={(item.maxQuantity)?false:true} 
          availableQuantity={item.maxQuantity}
          maxLimitReached={this.toast}
          style={{width: '65%',height:'100%'}}
        >
          {this.state.quantity}
        </Stepper>
        <TouchableOpacity 
          onPress={() => this.addToCartPress(item)}  
          style={styles.addToCart}
          accessibilityLabel="Add_To_Cart_Product_Grid"
          testID="Add_To_Cart_Product_Grid"
        >
          <Banner
            styles={styles.buyIcon}
            resizeMode="cover"
            source={ADD_TO_CART}
          />
        </TouchableOpacity>
      </View>
    )
  }

  handleButtonView = (item, navigation, defaultActiveAddressType) => {
    if( defaultActiveAddressType === 'Home-Delivery' && 
        this.props.profile.fetchIsWarehouseShipping !== '1' && 
        this.props.profile.isWarehouseAvailable && 
        item.isMovableToWarehouse && item.maxQuantity < 1 && 
        this.props.auth.userRole !== UserRole.Trainer
    ){
      return(
        <TouchableOpacity
          style={[styles.buttonMainView, {backgroundColor:'#6797d4', justifyContent: 'center', borderRadius:2}]}
          onPress={() => navigation.navigate('productDetails',{skuCode:item.skuCode, locationId:item.locationId,productId: item.productId, onWishlistUpdate: this.onWishlistUpdate, isMovableToWarehouse: true})}
        >
          <Text style={{alignSelf:'center', ...Specs.fontBold, color:'#fff', fontSize:15}}>{strings.product.orderHere}</Text>
        </TouchableOpacity>
      )
    }
    else if(
      defaultActiveAddressType === 'Home-Delivery' && 
      this.props.profile.fetchIsWarehouseShipping !== '1' && 
      !item.isMovableToWarehouse &&
      this.props.profile.isWarehouseAvailable && item.maxQuantity < 1 && 
      this.props.auth.userRole !== UserRole.Trainer
    ){
      return(
        <TouchableOpacity
          style={[styles.buttonMainView, {backgroundColor:'#DBB957', justifyContent: 'center', borderRadius:2}]}
          onPress={() => this.showOtherOptionMessage()}
        >
          <Text style={{alignSelf:'center', ...Specs.fontBold, color:'#fff', fontSize:15}}>{strings.product.infoButton}</Text>
        </TouchableOpacity>
      )
    }
    else{
      return this.renderAddToCartButtonView(item)
    }
  }

  onPressGrid = async () => {
    const { item, navigation, routeName } = this.props;
    if (routeName === 'productDetails') {
      const pushAction = StackActions.replace('productDetails',{skuCode:item.skuCode, locationId:item.locationId, productId: item.productId, onWishlistUpdate: this.onWishlistUpdate})
      navigation.dispatch(pushAction);
    } else {
      navigation.navigate('productDetails',{skuCode:item.skuCode, locationId:item.locationId, productId: item.productId, onWishlistUpdate: this.onWishlistUpdate})
    }
  }
  
  render() {
    const {
      item,
      ratingIcon,
      wishlistIcon,
      wishlistSelectedIcon,
      mainView,
      navigation,
      productListDisplay,
      wishListDisplay,
      productDetailView,
      wishList,
      updatedCountryId,
      coloredRatingIcon,
      greyRatingIcon } = this.props;
    const { quantity,modalVisible, selectedCheckBox } = this.state;
    const {pv, dealerPrice} = strings.product;
    const { isGuestUser } = this.props.auth;
    const {defaultActiveAddressType, isWarehouseAvailable, fetchIsWarehouseShipping} = this.props.profile;
    return (
      <View style={mainView}>
        <TouchableOpacity onPress={() => this.onPressGrid()}>  
          {(item.maxQuantity < 1 && ((!item.isMovableToWarehouse) || (fetchIsWarehouseShipping === '1') || (!isWarehouseAvailable))) ? (
            <View style={styles.barContainer2}>
              <Text style={styles.textStyle}>
                {strings.product.outOfStock}
              </Text>
            </View>
          ) : <View />}
          <View>
            <Banner
              styles={styles.backgroundShadow} 
              resizeMode="cover"
              source={BACKGROUND_IMAGE}
            />
            <View style={styles.topBarView}>
              <View />
              <View style={{flex: 1, flexDirection: 'row', marginHorizontal: 8, marginVertical: 8, height: 20}}>
                {wishListDisplay !== 'none' ? (
                  <TouchableOpacity 
                    style={[styles.crossIconStyle]}
                    onPress={async() => {
                      const isConnectedToInternet = await connectedToInternet();
                      if(isConnectedToInternet) {
                        this.updateWishList(item, 'remove')
                      }
                      else {
                        this.toast(strings.commonMessages.noInternet, Toast.type.ERROR)
                      }
                    }
                    }
                  >
                    <Banner
                      styles={styles.removeIcon}
                      resizeMode="contain"
                      source={REMOVE_ICON}
                    />
                  </TouchableOpacity>
                ) : (
                  <View style={{flex: 1, flexDirection: 'row', alignSelf: 'center'}}>
                    <Banner
                      styles={[styles.ratingIcon, {marginRight: item.rating ? 0 : 7}]}
                      resizeMode="contain"
                      source={item.rating ? COLORED_RATING_ICON : GREY_RATING_ICON}
                    />
                    { 
                      item.rating ? <Text style={[styles.dataAmount]}>{item.rating}</Text> : null
                    }
                  </View>
                )}
                <Label style={styles.pvContainer}>{`${Number.parseFloat(get(item,'associatedPv',0)).toFixed(2)} ${pv}`}</Label>
              </View>
            </View>
            <View style={styles.itemImageView}>
              {(productDetailView)?
                (
                  <Banner
                    styles={styles.imageDesign}
                    resizeMode="contain"
                    source={(item.image)?{uri:item.image}:PRODUCT_PLACEHOLDER}
                  />
                )
                :
                (
                  <Banner
                    styles={styles.imageDesign}
                    resizeMode="contain"
                    source={(item.imageUrl)?{uri:item.imageUrl}:PRODUCT_PLACEHOLDER} 
                  />
                )
              }
              {!isGuestUser && (this.props.profile.countryId == 1 || this.props.profile.wishlist_icon == true) &&
                (
                  <TouchableOpacity 
                    style={{ alignSelf: 'flex-end', paddingTop: 12, paddingLeft: 10, paddingBottom: 2 }}
                    accessibilityLabel="Wishlist_Add_Product_Grid"
                    testID="Wishlist_Add_Product_Grid"
                    onPress={async() => {
                      const isConnectedToInternet = await connectedToInternet();
                      if(isConnectedToInternet) {
                        this.updateWishList(item,'add')
                      }
                      else {
                        this.toast(strings.commonMessages.noInternet, Toast.type.ERROR)
                      }
                    }}
                  >
                    <Banner
                      styles={[styles.favouriteIcon,{display: productListDisplay}]}
                      resizeMode="contain"
                      source={(item.isFavourite)?wishlistSelectedIcon:wishlistIcon}
                    />
                  </TouchableOpacity>
                )
              }
            </View>
          </View>
          <View style={styles.archiveView}>
            <View style={{ flexDirection:'row', justifyContent: 'space-between'}}>
              <View>
                <Text 
                  numberOfLines={2}  
                  style={styles.dataName}
                  accessibilityLabel={item.productName}
                  testID={item.productName}
                >
                  {capitalizeFirstCharacter(item.productName)}
                </Text>
              </View>
            </View>        
          </View>
          <View style={{ height: 100, marginBottom: 5 }}>
            <Text style={[styles.dataHeading, {marginLeft:10, marginRight:20}]}>
              {`${strings.product.itemCode}: ${item.skuCode}`}
            </Text>
            <Text style={[styles.dataHeading, {marginLeft:10, marginRight:25}]}>
              {`Net Content: ${item.netContent}`}
            </Text>
            <Text style={[styles.dataHeading, {marginLeft:10, marginRight:25}]}>
              {`${getMrpType(updatedCountryId ? updatedCountryId : item.countryId)}: ${priceWithCurrency(updatedCountryId ? updatedCountryId : item.countryId,item.mrp.toFixed(2))} `}
              <Text style={styles.inclusiveStyles}>{item.countryId != 4 && strings.product.inclOfAllTaxes}</Text>
            </Text>
            <Text style={[styles.dataHeading, {marginLeft:10, marginRight:25}]}>
              {`${dealerPrice}: ${priceWithCurrency(updatedCountryId ? updatedCountryId : item.countryId,item.unitCost.toFixed(2))} `}
              <Text style={styles.inclusiveStyles}>{item.countryId != 4 && strings.product.inclOfAllTaxes}</Text>
            </Text>
          </View>
          <View style={styles.rattingView}>
            <Text style={styles.dataAmount}>
              {/* {item.variant} */}
            </Text>
            <View style={{flexDirection:'row' }}>
              <Banner
                styles={styles.ratingIcon}
                resizeMode="contain"
                source={ratingIcon}
              />
              <Text style={styles.dataAmount}>
                {/* {item.rating} */}
              </Text>
            </View>
          </View>
          {isShoppingItemActiveInCountry(this.props.profile.countryId, this.props.appConfiguration.isShoppingActiveOnSelectedAddress)
            && this.handleButtonView(item, navigation, defaultActiveAddressType)
          }
          <AddToCart 
            modalVisible={modalVisible}
            openBuyingPreferenceVisible={this.openBuyingPreferenceVisible}
            confirmBuyerCart={this.confirmBuyerCart}
            setConfirmBuyer={this.setConfirmBuyer}
            createCartForDownline={this.createCartForDownline}
            selectedCheckBox={selectedCheckBox}
            startShopping={this.startShoppingPress}
          />
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  imageDesign: {
    alignSelf: 'center',
    marginTop: 3,
    height: 79,
    width: 105,
  },
  dataName: {
    marginTop: 3,
    // marginLeft: 10,
    marginRight: 10,
    fontSize: 12,
    color: '#6c7a87',
    width: 107,
    height: 36,
    ...Specs.fontMedium,
  },
  dataAmount: {
    // marginTop: 3,
    marginLeft: 2,
    opacity: 0.7,
    fontSize: 10,
    color: '#000',
    // height: 18,
    // marginRight:8,
  },
  pvContainer: {
    flex: 1,
    alignSelf: 'flex-end',
  },
  buttonMainView: {
    marginHorizontal: 17,
    width: '80%',
    flexDirection: 'row',
    marginTop: 10,
    marginBottom: 15,
    height: 30,
    borderRadius: 2,
    justifyContent:'space-between',
  },
  archiveView: {
    marginLeft: 10,
    marginRight: 8,
    width: '85%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  addToCart: {
    width: '30%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignSelf: 'center',
    height: '100%',
    backgroundColor:'#6797d4',
    borderRadius:2
  },
  buyIcon: {
    alignSelf: 'center',
    height: 18,
    width: 18,
  },
  dataHeading: {
    fontSize: 11,
    color: '#31cab3',
    ...Specs.fontSemibold,
  },
  backgroundShadow:{
    height:118,
    width:'100%',
    position:'absolute',
    zIndex:-1,
  },   
  ratingIcon: {
    // alignSelf: 'center',
    // position: 'absolute',
    // borderWidth: 1,
    height: 10,
    width: 10,
    marginRight: 1,
    marginTop: 1
  },
  rattingView: {
    flexDirection: 'row',
    justifyContent:'space-between',
    width:'95%',
    marginLeft: 8,
    display:'none'
  },
  favouriteIcon: { 
    height: 15, 
    width: 15,
  },
  removeIcon:{
    height: 22, 
    width: 23,
  },
  itemImageView:{
    flexDirection:'row',
    justifyContent:'space-between',
    marginRight:8
  },
  topBarView: {
    flexDirection:'row',
    width:'100%',
    justifyContent:'space-between',
  },
  crossIconStyle:{
    flex: 1,
    alignSelf: 'center',
  },
  barContainer2: {
    width:'100%',
    zIndex: 2,
    alignItems:'center',
    flexDirection: 'row',
    position:'absolute',
    justifyContent:'center',
    opacity: 0.87,
    marginTop:55,
    backgroundColor:'#ffffff',
  },
  textStyle:{
    color:'#d0021b',
    fontSize:12,
    textAlign:'center',
    marginVertical:4,
    ...Specs.fontSemibold,
  },
  inclusiveStyles: {
    fontSize: 9,
    color: '#31cab3',
    ...Specs.fontMedium,
    marginLeft: 2
  }
});