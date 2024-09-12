import React, { Component } from 'react';
import { StyleSheet,Text,View,TouchableOpacity, TouchableHighlight, TextInput,Dimensions, Platform, BackHandler, Modal, Linking} from 'react-native';
import ScrollableImages from 'app/src/components/scrollableImages/ScrollableImages';
import { Specs } from 'app/src/utility/Theme';
import { Icon } from 'react-native-elements';
import Banner from 'app/src/screens/Dashboard/Banner';
import Loader  from 'app/src/components/loader/Loader';
import SidescrollComponent from 'app/src/components/sidescrollComponent/SidescrollComponent';
import Label from 'app/src/components/customLabel/Label'
import { strings } from 'app/src/utility/localization/Localized';
import { observer, inject } from 'mobx-react';
import { observable } from 'mobx';
import AddToCart from 'app/src/components/cartComponent/AddToCart';
import SuggestiveCart from 'app/src/components/cartComponent/SuggestiveCart';
import { searchFromArray, priceWithCurrency, capitalizeFirstCharacter, connectedToInternet, isShoppingItemActiveInCountry } from 'app/src/utility/Utility';
import autobind from 'autobind-decorator';
import { Toast } from 'app/src/components/toast/Toast';
import { UserRole, SHIPPING_TYPE } from 'app/src//utility/constant/Constants';
import EmptyScreen from 'app/src/components/emptyScreen/EmptyScreen';
import AlertClass from 'app/src/utility/AlertClass';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { CartProductModel } from 'app/src/stores/models/CartModel';
import { get } from 'lodash';
import OfflineNotice from 'app/src/components/OfflineNotice';
import { trackEvent, productDetailAction } from 'app/src/utility/AnalyticsUtils';
import Share from 'react-native-share';
import ReactNativeBlobUtil from 'react-native-blob-util';
import HeaderLeftIcons from 'app/src/components/navigation/HeaderLeftIcons';
import ProductFeedback from './component/ProductFeedback';
import * as AsyncStore from 'app/src/utility/AsyncStoragesUtils';
import { _ } from 'lodash';
import ImageViewer from 'react-native-image-zoom-viewer';
import LinearGradient from 'react-native-linear-gradient';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import VideoPlayer from 'app/src/screens/Dashboard/VideoPlayer';
import Orientation from 'react-native-orientation-locker';

import { string } from 'prop-types';
import { Header } from '../../components';
import { getMrpType } from '../../utility/Utility';

// Navigation Icons

const UP_ARROW = require('app/src/assets/images/productList/arrow_up.png');
const DOWN_ARROW = require('app/src/assets/images/productList/arrow_down.png');
const PRODUCTIMAGE = require('app/src/assets/images/productList/productImage.png');
const WISHLIST_ICON = require('app/src/assets/images/DashBoardHeader/wishlist_icon.png');
const SHARE_ICON = require('app/src/assets/images/DashBoardHeader/share_icon.png');
const WISHLIST_SELECTED_ICON = require('app/src/assets/images/DashBoardHeader/wishlist_red.png');
const PRODUCT_PLACEHOLDER = require('app/src/assets/images/productList/placeHolder.png');

const deviceWidth = (Dimensions.get('window').width)*0.7
const deviceHeight = Dimensions.get('window').height

const REACT_ICON = 'data:image/png;base64,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';
const COLORED_RATING_ICON = require('app/src/assets/images/coloured_Star.png')
const GREY_RATING_ICON = require('app/src/assets/images/grey_star.png')

@inject('products', 'wishList', 'cart', 'auth', 'profile', 'appConfiguration')
@observer
export default class ProductDetail extends Component {

  constructor(props) {
    super(props)
    this.state = {
      query:'',
      showproductDetails:true,
      quantity:1,
      isLoading:true,
      modalVisible: false,
      selectedCheckBox: [],
      productAddToCart: [],
      selectedProduct: '',
      showImageModal: false,
      imageUrls: [],
      suggestiveCartModal: false,
      isAlternateWarehouseButtonShown: false,
      videoModalVisible: false,
      paused: false,
      autoRotation: false,
      startOrientationListener: false,
    }

    this.isMovableToWarehouse = this.props.route?.params?.isMovableToWarehouse;
    // this.updateQuantity = _.debounce(this.updateQuantity, 1000);
    // this.addToCartOnPress = _.debounce(this.addToCartOnPress, 1000);
    this.isInternetConnected = true;
  }

  async componentDidMount() {
    this.isInternetConnected = await connectedToInternet();
    if(this.isInternetConnected) {
      await this.getComponentData();
      await this.checkWarehouseProductInventory();
    }
    this.props.navigation.addListener('focus',async () => {
      this.props.products.refresh('productDetails');
      if (this.props.profile.cateringChangeCalled || this.isMovableToWarehouse) {
        await this.getComponentData();
        await this.checkWarehouseProductInventory();
        this.props.profile.setCateringChangeCalled(false);
      }
    });
    // BackHandler.addEventListener('hardwareBackPress', this.onAndroidBackPress);
    Orientation.addDeviceOrientationListener(this._onOrientationDidChange);
  }

  _onOrientationDidChange = (orientation) => {
    if (orientation != 'UNKNOWN') {
      //this allows to check if the system autolock is enabled or not.
      Orientation.getAutoRotateState((res) => {
        if (res != this.state.autoRotation) {
          this.setState({autoRotation : res});
        }
      });
    }
  };

  /**
   * @description it will check if warehouse (vellino type) product is availble on warehouse
   */
  checkWarehouseProductInventory = async (onButtonPress) => {
    if (this.isMovableToWarehouse) {
      const {navigation, profile, cart, products, route} = this.props;

      if (onButtonPress) {
        await cart.checkInventory(route?.params?.skuCode, true, profile.fetchWarehouseCatering?.locationId);
        const index = await cart.responseSkuCodes?.findIndex(x => x.itemCode === route?.params?.skuCode);
        if (index === -1) {
          AlertClass.showAlert('Alert', 
            strings.productDetails.quantityNotAvailableInWarehouse,
            [{text: 'OK', onPress: () => console.log('OK Pressed')}])
          return {success: false};
        }
        else {
          if (cart.responseSkuCodes[index].availableQuantity < this.state.quantity) {
            AlertClass.showAlert('Alert', 
              strings.productDetails.quantityNotAvailableInWarehouse, 
              [{text: 'OK', onPress: () => console.log('OK Pressed')}])
            return {success: false};
          }
          else{
            return {success: true};
          }
        }
      }
      else {
        if (products?.productDetails?.maxQuantity < 1) {
          this.setState({isAlternateWarehouseButtonShown : false})
        }
        else {
          this.setState({isAlternateWarehouseButtonShown : true})
        }
        // const index = await cart.responseSkuCodes?.findIndex(x => x.itemCode === navigation.state?.params?.skuCode);
        // if(index === -1){
        //   this.setState({isAlternateWarehouseButtonShown : false})
        // }
        // else{
        //   if(cart.responseSkuCodes[index].availableQuantity < 1){
        //     this.setState({isAlternateWarehouseButtonShown : false})
        //   }
        //   else{
        //     this.setState({isAlternateWarehouseButtonShown : true})
        //   }
        // }
      }
    }
  }

  onAndroidBackPress = () => {
    const { navigation, route } = this.props;
    navigation.goBack()
    route.params.onWishlistUpdate && route.params.onWishlistUpdate()
    return true;
  }

  componentWillUnmount() {
    // BackHandler.removeEventListener('hardwareBackPress', this.onAndroidBackPress);
    Orientation.lockToPortrait();
    Orientation.removeAllListeners();
  }

  getComponentData = async () => {
    const { navigation, products, profile, route } = this.props;
    let fetchLocationId = '';
    if (!this.isMovableToWarehouse) {
      fetchLocationId = route.params.locationId;
    }
    else {
      fetchLocationId = profile.fetchWarehouseCatering?.locationId;
    }
    // console.log(this.props.route.params.productId)
    await products.fetchProductDetails(route.params.skuCode, fetchLocationId);
    await products.imageUrlResolve(this.props.products.productDetails.imageArray);
    await products.getFrequentlyBoughtTogetherProducts(route.params.productId, fetchLocationId);
    if (products.productDetails && products.productDetails !== '') {
      products.modifyRecentlyViewed();
    }
    const eventMetadata = { label: 'Product' };
    const { skuCode, productName, categoryName } = products.productDetails;
    const product = {
      id: skuCode,
      name: productName,
      category: categoryName
    };
    // const payload = { products: [ product ], productAction: productDetailAction };
    // console.log(payload);
    // products.productDetails && trackEvent('Product Details Screen', 'Click', eventMetadata, payload);
    this.setState({ isLoading:false });
  }

  // addToCartOnPress = (product) => {
    addToCartOnPress = _.debounce(async(product) => {
      if (this.props.auth.userRole===UserRole.Trainer) {
        return;
      }
      // if(!this.props.profile.isEkycDone){
      //   AlertMessage.showAlert( KYC_ERROR_MESSAGE.kycError, this.props.navigation)
      //   return;
      // }
      const {products} = this.props;
      if(products.productDetails.maxQuantity < 1 ) {
        products.fetchNotificationStatus(products.productDetails.productId,products.productDetails.skuCode)
      }
      else {
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
        // this.isMovableToWarehouse ? productToBeAdded.products[0].locationId = this.props.profile.defaultCater.locationId : null;
        console.log(productToBeAdded)
        // const {productAddToCart } = this.state;
        this.setState({
          productAddToCart: [productToBeAdded]
        });
        this.startShoppingPress()
      }
    // (products.productDetails.maxQuantity < 1) ? 
    //   products.fetchNotificationStatus(products.productDetails.productId,products.productDetails.skuCode) :
    //   (
    //     this.setState({
    //       modalVisible: true,
    //       selectedProduct: Object.assign(new CartProductModel(product, selectedQuantity={quantity:this.state.quantity})) 
    //     })
    //   )
    }, 1000, { leading: true, trailing: false })

  @autobind
    async networkStatus(status) {
      if(status) {
        this.isInternetConnected = status;
        this.getComponentData()
      }
    }

  updateQuantity(param) {
    const {quantity} = this.state;
    const {maxQuantity} = this.props.products.productDetails;

    if (param === 'add') {
      (quantity>= maxQuantity) ? this.toast(`${strings.product.productsAvailable1} ${maxQuantity} ${strings.product.productsAvailable2}`, Toast.type.ERROR) :
        this.setState(previousState => {
          return { quantity: previousState.quantity + 1 };
        });
    }
    else {
      (quantity > 1)?
        this.setState(previousState => { 
          return { quantity: previousState.quantity - 1 };
        }):''
    }
  }

  // openBuyingPreferenceVisible = visible => {
  //   if(visible === false){
  //     this.setState({
  //       selectedCheckBox : [],
  //       productAddToCart: [],
  //       selectedProduct: ''
  //     })
  //   }
  //   this.setState({ modalVisible: visible });
  // }

  // createCartForDownline = () => {
  //   const { modalVisible } = this.state;
  //   this.props.navigation.navigate('createCartDownlineList');
  //   this.openBuyingPreferenceVisible(!modalVisible);
  // }

  openBuyingPreferenceVisible = visible => {
    if (visible === false) {
      this.setState({
        selectedCheckBox : [],
        productAddToCart: [],
        selectedProduct: ''
      });
    }
    this.setState({ modalVisible: visible });
  }

  fetchCart = async () => {
    const DEVICE_ID = AsyncStore.addPrefix('deviceId');
    const {fetchWarehouseCatering} = this.props.profile;
    this.deviceId = await AsyncStore.get(DEVICE_ID);
    this.isInternetConnected = await connectedToInternet();
    if (this.isInternetConnected) {
      this.setState({isLoading : true})
      if (_.isEmpty(this.props.cart.shopForObjectInfo)) {
        this.props.cart.updateShopForObject('Self', this.props.auth.distributorID.toString());
      }
      await this.props.cart.fetchCartData(false);
      await this.props.cart.checkInventory(this.props.cart.skuCodes, true, fetchWarehouseCatering?.locationId);
      // this.fetchNoInventoryProducts = await this.props.cart.noInventoryProducts;
      await this.props.cart.updateCartInfo();
      this.setState({isLoading : false})
    }
  }

  handleSuggestiveCartModal = async (value) =>{
    if (value == false) {
      this.setState({
        suggestiveCartModal: false
      })
    }
    else{
      const checkInventory = await this.checkWarehouseProductInventory(true);
      if (checkInventory.success) {
        await this.fetchCart();
        this.setState({
          suggestiveCartModal: true
        })
      }
    }
  }

  /**
   * @description this will first chnage shipping type to regular and then warehouse delivery true.
   * after that we are fetching product detail again with the latest catering location id and then adding product.
   */
  handleSuggestivePurchase = async (productDetails) => {
    await this.props.profile.changeShippingType(SHIPPING_TYPE.regularDelivery);
    await this.props.profile.handleWarehouseShipping('1');
    //await this.getComponentData();
    await this.addToCartOnPress(productDetails);
    this.handleSuggestiveCartModal(false);
  }

  createCartForDownline = () => {
    const { modalVisible } = this.state;
    this.props.navigation.navigate('createCartDownlineList');
    this.openBuyingPreferenceVisible(!modalVisible);
  }

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
  toast(message, toastType: Toast.type, ){
    Toast.show(message, {
      duration: Toast.durations.SHORT,
      position: Toast.positions.TOP,
      type: toastType,
      shadow: false,
      animation: true,
      hideOnPress: true,
      delay: 0,
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
      const isGuestUser = this.props.auth.userRole === UserRole.GuestUser;
      if(isGuestUser) {
        this.openBuyingPreferenceVisible(false);
        // AlertClass.showAlert('Message', 
        //   'You need to login or Sign up To continue Shopping', 
        //   [{text: 'Sign In', onPress: () => this.props.navigation.navigate('login') },{
        //     text: 'Sign Up', onPress: () => this.props.navigation.navigate('signup')
        //   }], true)
        AlertClass.showAlert('', 
          strings.commonMessages.guestUserMessage, 
          [
            // {text: strings.onboardingScreen.buttonSignUp, onPress: () => this.props.navigation.navigate('signup') },
            {text: strings.commonMessages.ok, onPress: () => console.log('OK Pressed') }], true)
      }
      else if (this.props.profile.countryId == 2) {
        AlertClass.showAlert('', 
          strings.commonMessages.restrictAddCartCountryMessage, 
          [
            // {text: strings.onboardingScreen.buttonSignUp, onPress: () => this.props.navigation.navigate('signup') },
            {text: strings.commonMessages.ok, onPress: () => console.log('OK Pressed') }], true)
      }
      else {
        const status = await this.props.cart.addProductToCart(this.state.productAddToCart)
        if(status.success) {
          this.openBuyingPreferenceVisible(false);
          if(status.toast && status.alert) {
            this.toast(status.toast, Toast.type.SUCCESS)
            AlertClass.showAlert('', status.alert, [{text: 'OK', onPress: () => status.kycLink ? this.props.navigation.navigate('kycImage') : console.log('OK Pressed') }])
          }
          else if(status.alert) {
            AlertClass.showAlert('', status.alert, [{text: 'OK', onPress: () => status.kycLink ? this.props.navigation.navigate('kycImage') : console.log('OK Pressed') }])
          }
          else {
            this.toast(status.toast, Toast.type.SUCCESS)
          }
        }
        else{
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
    console.log(buyer)
    const result = searchFromArray(buyer, this.props.cart.usersCart.slice());
    console.log(result)
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
    console.log(buyer)
  }

  setConfirmBuyer = async(buyer) => {
    const { selectedCheckBox, productAddToCart } = this.state;
    let selectedCheckBoxBackup = [...selectedCheckBox];
    console.log(buyer)
    let productToBeAdded = [...productAddToCart];
    const removeBuyer = selectedCheckBox.indexOf(buyer);
    selectedCheckBoxBackup.splice(removeBuyer, 1);
    productToBeAdded.splice(removeBuyer, 1)
    await this.setState({
      selectedCheckBox: selectedCheckBoxBackup,
      productAddToCart: productToBeAdded
    });
  }

  createQuantity = () => {
    const {quantityHeading} = strings.productDetails;
    const {quantity} = this.state;
    const {maxQuantity} = this.props.products.productDetails;
    return(
      <View style={styles.cardStyle}>
        <View style={styles.headingView}>
          <Text style={styles.headingwithFlex}>
            {quantityHeading}
          </Text>
          <View style={styles.quantityButtonView}>
            <TouchableOpacity 
              style={styles.quantityButtons}
              onPress={() => {this.updateQuantity('subtract')}}
            >
              <Icon
                name='minus'
                type='entypo'
                color={(quantity < 2)?'#808080':'#517fa4'}
              />
            </TouchableOpacity>
            <Text style={styles.quantityText}>
              {quantity}
            </Text>
            <TouchableOpacity 
              style={styles.quantityButtons}
              onPress={() => {this.updateQuantity('add')}}
            >
              <Icon
                name='plus' 
                type='entypo'
                color={(quantity >= maxQuantity) ? '#808080' : '#517fa4'}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  createProductDetail = (item) => {
    let { showproductDetails } = this.state;
    const {heading,description,unit,type,disclaimer} = strings.productDetails.productsDetail;

    return(
      <View style={styles.cardStyle}>
        <View style={styles.offerView}>
          <Text style={styles.headingwithFlex}>
            {heading}
          </Text>
          <TouchableOpacity 
            style={styles.showHideStyle}
            onPress={()=> this.setState({showproductDetails:!showproductDetails})}
          >
            <Banner
              styles={styles.upIconStyle}
              source={(showproductDetails)?UP_ARROW:DOWN_ARROW}
              resizeMode='contain'
            />
          </TouchableOpacity>
        </View>
        <View style={{display:(showproductDetails)?'flex':'none'}}>
          <View style={styles.lineView} />
          <Text style={styles.productDetailHeading}>{description}</Text>
          <Text style={styles.productDetaildata}>{item.longDesc}</Text>
          <Text style={styles.productDetailHeading}>{unit}</Text>
          <Text style={styles.productDetaildata}>{item.variant}</Text>

          {/* <Text style={styles.productDetailHeading}>{type}</Text>
          <Text style={styles.productDetaildata}>{type}</Text>
          <Text style={[styles.productDetailHeading,{fontSize:12}]}>{disclaimer}</Text>
          <Text style={[styles.productDetaildata,{fontSize:12,marginBottom:16}]}>{disclaimer}</Text> */}
        </View>
      </View>
    );
  }

  createQuestionAnswer = () => {
    let {query} = this.state;
    const { products } = this.props;
    const {queryText,submit} = strings.productDetails.questions;

    return(
      <View style={[styles.cardStyle,{marginBottom:34}]}>
        <View style={{marginHorizontal:15,marginVertical:24}}>
          <Text style={styles.heading}>
            {queryText}
          </Text>
          <TextInput
            placeholder='Type Query'
            onChangeText={(query)=> this.setState({query})}
            value={query}
          />
          <TouchableOpacity 
            onPress={() => {products.updateQuery(products.productDetails.productId,query), this.state.query = ''}}
            disabled={(query.trim().length < 1)?true:false}
          >
            <Text style={[styles.submitQuery,(query.trim().length <1 ? {opacity:0.6}: null)]}>
              {submit}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  shareItem = async(item) => {
    const data = await ReactNativeBlobUtil.fetch('GET', item.imageUrl);
    const shareData = {
      message: `${capitalizeFirstCharacter(item.productName)}\nPV: ${item.associatedPv}\nPrice: ${priceWithCurrency(item.countryId,item.unitCost)}`,
      title: capitalizeFirstCharacter(item.productName),
      url: `data:image/jpeg;base64, ${data.base64()}`,
    }
    Share.open(shareData);
  }

  renderImageModal(imageUrls) {
    return (
      // <View style={{ ...StyleSheet.absoluteFillObject,backgroundColor:'rgba(0,0,0,0.5)',justifyContent:'center',alignItems:'center'}}>
      //   <TouchableOpacity style={styles.closeIcon} onPress={()=>this.setState({showImage:false})}>
      //     <Icon name='ios-close' size={34} color='#8D98A3' />
      //   </TouchableOpacity>
      // //   <Image
      //     style={{...styles.bannerView,width:'94%'}}
      //     resizeMode={(imageUrl) ? 'cover' : 'contain'}
      //     source={imageUrl}
      //   />
      // </View>
      <Modal 
        visible={this.state.showImageModal} 
        transparent
        onRequestClose={() => {
          this.setState({ showImageModal: false })
        }}
      >
        <View style={{flex:1}}>
          <TouchableOpacity style={styles.closeIcon} onPress={()=>this.setState({showImageModal:false})}>
            <Icon name='close' size={34} color='#8D98A3' />
          </TouchableOpacity>
          <ImageViewer 
            imageUrls={[{url:  imageUrls}]}
            enableSwipeDown
            enableImageZoom ={false}
            backgroundColor='rgba(0,0,0,0.5)'
            onCancel={()=> this.setState({ showImageModal: false })}
          />
        </View>
      </Modal>
    )
  }

  updateImageUrls = (item) => {
    this.setState({
      imageUrls: item,
      showImageModal: true
    })
  }

  handleVideoModalVisibility = (value) => {
    if(value === true){
      this.setState({videoModalVisible: value});
    }
    else{
      Orientation.lockToPortrait();
      this.setState({videoModalVisible: value});
    }
  }


  renderVideoButton = (item) => {
    // console.log('resitemcehck',item);
    const { productVideo } = strings.productDetails;
    if (item.productVideoUrl && item.productVideoUrl?.trim() != '') {
      return (
        <View>
          <View style={{marginVertical: 5, marginHorizontal: 10, alignItems:'flex-end'}}>
            <LinearGradient 
              style={styles.videoButtonContainer}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              colors={['#6797d4', '#5585c2']}
            >
              <TouchableOpacity 
                style={styles.videoButton}
                onPress={() => this.handleVideoModalVisibility(true)}
              >
                <FontAwesome5 name='play-circle' size={30} color='#fff' /> 
                <Text style={styles.videoContainerText}>{productVideo}</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
          <View style={[styles.lineView, {height:0.8}]} />
        </View>
      )
    }
  }

  renderVideoPlaybackModal = (item) => {
    // const url = 'https://vestdata.s3.ap-southeast-1.amazonaws.com/dafTest/Vestige+U-Control+_+Product+AV+_+Launch+Video.mp4'
    if (item.productVideoUrl && item.productVideoUrl?.trim() != '') {
      if (this.state.videoModalVisible) {
        this.state.autoRotation ? Orientation.unlockAllOrientations() : Orientation.lockToPortrait();
      }
      return(
        <Modal
          animationType="slide"
          transparent
          visible={this.state.videoModalVisible}
          onRequestClose={() => this.handleVideoModalVisibility(false)}
          shadowOpacity={0.5}
          supportedOrientations={['portrait', 'landscape', 'landscape-left', 'landscape-right']}
        >
          <View style={styles.modalVideoContainer}>
            <TouchableHighlight
              style={styles.videoCloseIcon}
              onPress={() => this.handleVideoModalVisibility(false)}
            >
              <Icon name='close' style={styles.iconStyle} color='#fff' />
            </TouchableHighlight>
            <VideoPlayer
              source={item.productVideoUrl}
              paused={false}
              resizeMode='contain'
            />
          </View>
        </Modal>
      )
    }
  }
  
  createProductDetailsView = (item) =>{
    const { isGuestUser } = this.props.auth;
    const {pv, dealerPrice} = strings.productDetails;
    console.log('this.props.products.resolvedArray',JSON.stringify(item))
    const isImageValid  = this.props.products.resolvedArray.some(item => item)
    return (
      <View style={styles.cardStyle}>
        {this.renderVideoButton(item)}
        <View style={styles.productDetailsView}>
          <View />
          <View style={{width:deviceWidth,height:'100%',justifyContent: 'center', alignItems: 'center'}}>
            {
              this.props.products.resolvedArray && this.props.products.resolvedArray.length && isImageValid ? (
                <ScrollableImages 
                countryId={this.props.profile.countryId} 
                /*images={get(item,'imageArray',[{url:null}])}*/ 
                images={this.props.products.resolvedArray.length ? this.props.products.resolvedArray : [{url:null}]} 
                outOfStock={parseInt(item.maxQuantity)} 
                updateImageUrls={this.updateImageUrls} 
                isMovableToWarehouse={item.isMovableToWarehouse} 
                isWarehouseShipping={this.props.profile.fetchIsWarehouseShipping}
                isWarehouseAvailable={this.props.profile.isWarehouseAvailable}
              />
              ) :  <Banner
                    styles={styles.imageDesign}
                    resizeMode="contain"
                    source={PRODUCT_PLACEHOLDER}
                  />
            }
         
           
            {/* <ImageViewer 
              backgroundColor="white" 
              flipThreshold="30"
              menus={() => null}
              pageAnimateTime="50"
              saveToLocalByLongPress="false"
              imageUrls={get(item,'imageArray',[{url:null}])}/> */}
          </View> 
          <View style={{justifyContent:'flex-end'}}>
            <TouchableOpacity style={{padding: 10}} onPress={() => {this.shareItem(item)}}>
              <Banner
                styles={[styles.productDetailsIcon, {opacity: 0.7}]}
                source={SHARE_ICON}
                resizeMode='contain'
              />
            </TouchableOpacity>
            {(!isGuestUser && this.props.profile.countryId != 2) &&
              (
                <TouchableOpacity style={{padding: 10}} onPress={() => this.updateWishList(item, 'add')}>
                  <Banner
                    styles={styles.productDetailsIcon}
                    source={(item.isFavourite)?WISHLIST_SELECTED_ICON:WISHLIST_ICON}
                    resizeMode='contain'
                  />
                </TouchableOpacity>
              )
            }
          </View>
        </View>
        <View style={styles.lineView} />
        <View style={{marginHorizontal:15,marginTop:17,marginBottom:13}}>
          <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between'}}>
            <Label style={{ }}>{`${Number.parseFloat(get(item,'associatedPv',0)).toFixed(2)} ${pv}`}</Label>
            <View style={{ flexDirection: 'row', alignSelf: 'center'}}>
              <Banner
                styles={[styles.ratingIcon, {marginRight: item.rating ? 0 : 7}]}
                resizeMode="contain"
                source={item.rating ? COLORED_RATING_ICON : GREY_RATING_ICON}
              />
              { 
                item.rating ? <Text style={[styles.dataAmount]}>{item.rating}</Text> : null
              }
            </View>
          </View>
          <Text style={{fontSize:18,marginTop:13,color:'#6c7a87',...Specs.fontMedium}}>
            {capitalizeFirstCharacter(item.productName)}
          </Text>
          <Text style={styles.price}>
            {`${strings.product.itemCode}: ${item.skuCode}`}
          </Text>
          <Text style={styles.price}>
            {`Net Content: ${item.netContent}`}
          </Text>
          <Text style={styles.price}>
            {`${getMrpType(item.countryId)}: ${priceWithCurrency(item.countryId,item.mrp.toFixed(2))}  `}
            <Text style={styles.inclusiveStyles}>{item.countryId != 4 && strings.product.inclOfAllTaxes}</Text>
          </Text>
          <Text style={styles.price}>
            {`${dealerPrice}: ${priceWithCurrency(item.countryId,item.unitCost.toFixed(2))}  `}
            <Text style={styles.inclusiveStyles}>{item.countryId != 4 && strings.product.inclOfAllTaxes}</Text>
          </Text>
        </View>
      </View>
    );
  }

  async updateWishList(item, type) {
    const {wishList} = this.props;
    await this.props.wishList.updateWishList(item, type)
    if(wishList.isMessage && wishList.isMessage !== ''){
      (wishList.isUpdate) ? item.isFavourite=true : ''
      this.toast(wishList.isMessage, Toast.type.SUCCESS)
    }
  }

  showOtherOptionMessage = () => {
    AlertClass.showAlert('Alert!', 
      `${strings.product.otherOptionMessage}`, 
      [{text: 'OK', onPress: () => console.log('OK Pressed')}])
  }

  /**@description used on the place of notify button as per requirement */
  renderInfoButton = (products) => {
    const {profile, appConfiguration} = this.props;
    if(this.props.profile.defaultActiveAddressType === 'Home-Delivery' && 
        products.productDetails.maxQuantity < 1 && 
        isShoppingItemActiveInCountry(profile.countryId, appConfiguration.isShoppingActiveOnSelectedAddress) && 
        this.props.profile.isWarehouseAvailable &&
        this.props.profile.fetchIsWarehouseShipping == '0' && !this.isMovableToWarehouse 
    ){
      return(
        <TouchableOpacity
          accessibilityLabel="Prooduct_Details_Add_Cart"
          testID="Prooduct_Details_Add_Cart"
          disabled={this.props.auth.userRole===UserRole.Trainer?true:false}
          style={[styles.buttonMainView,(this.props.auth.userRole===UserRole.Trainer?{opacity:0.5}:{opacity:1}), {backgroundColor: '#DBB957'}]} 
          onPress={() => this.showOtherOptionMessage()}
        >
          <Text style={[styles.buyButtonText, {...Specs.fontBold}]}>
            {strings.product.infoButton}
          </Text>
        </TouchableOpacity>
      )
    }
  }

  // renderNotifyButton = (products, notify) => {
  //   const {isWarehouseShipping, isWarehouseAvailable, defaultActiveAddressType} = this.props.profile;
  //   if(products.productDetails.maxQuantity < 1 && 
  //     this.props.profile.countryId != 2 && !this.isMovableToWarehouse &&
  //     (isWarehouseShipping == '1' || !isWarehouseAvailable || defaultActiveAddressType === 'Store Pick-up')
  //   ){
  //     return(
  //       <TouchableOpacity
  //         accessibilityLabel="Prooduct_Details_Add_Cart"
  //         testID="Prooduct_Details_Add_Cart"
  //         disabled={this.props.auth.userRole===UserRole.Trainer?true:false}
  //         style={[styles.buttonMainView,(this.props.auth.userRole===UserRole.Trainer?{opacity:0.5}:{opacity:1, backgroundColor: (products.notifiedStatus) ? '#6797d4' : '#808080' })]} 
  //         onPress={() => {this.addToCartOnPress(products.productDetails)}}
  //       >
  //         <Text style={styles.buyButtonText}>
  //           {notify}
  //         </Text>
  //       </TouchableOpacity>
  //     )
  //   }
  // }

  handleAlternateWarehouseOptions = ( products, buyFromAnotherLocation, outOfStockCurrentLoc ) => {
    const { profile, appConfiguration } = this.props;
    if(isShoppingItemActiveInCountry(profile.countryId, appConfiguration.isShoppingActiveOnSelectedAddress) && this.isMovableToWarehouse){
      if(products.productDetails.maxQuantity >= 1 && this.state.isAlternateWarehouseButtonShown){
        return(
          <View style={{flex:1.5}}>
            <View style={{flex:0.5, backgroundColor:'#FB004490', justifyContent:'center'}}>
              <Text style={{textAlign: 'center', color: '#fff', ...Specs.fontSemibold}}>{outOfStockCurrentLoc}</Text>
            </View>
            <LinearGradient 
              style={{flex:1}}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              colors={['#233329', '#63d471']}  // #034732, #008148 optional color
            >
              <TouchableOpacity
                accessibilityLabel="Prooduct_Details_Add_Cart_warehouse"
                testID="Prooduct_Details_Add_Cart_warehouse"
                disabled={this.props.auth.userRole===UserRole.Trainer?true:false}
                style={[{flex:1, justifyContent:'center'},(this.props.auth.userRole===UserRole.Trainer?{opacity:0.5}:{opacity:1})]} 
                onPress={() => {this.handleSuggestiveCartModal(true, products.productDetails)}}
              >
                <Text style={[styles.buyButtonText, {paddingVertical:3, marginVertical:0, textAlign: 'center', fontSize:17}]}>
                  {buyFromAnotherLocation}
                </Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        )
      }
      else{
        return(
          <View style={{flex:0.5}}>
            <View style={{flex:1, backgroundColor:'#FB004490', justifyContent:'center'}}>
              <Text style={{textAlign: 'center', color: '#fff', ...Specs.fontSemibold}}>{outOfStockCurrentLoc}</Text>
            </View>
          </View>
        )
      }
    }
  }

  renderAddToCartButton = ( products , addToCart ) => {
    if(products.productDetails.maxQuantity >= 1 && this.props.profile.countryId != 2 && !this.isMovableToWarehouse){
      return(
        <TouchableOpacity
          accessibilityLabel="Prooduct_Details_Add_Cart"
          testID="Prooduct_Details_Add_Cart"
          disabled={this.props.auth.userRole===UserRole.Trainer?true:false}
          style={[styles.buttonMainView,(this.props.auth.userRole===UserRole.Trainer?{opacity:0.5}:{opacity:1, backgroundColor: (products.notifiedStatus) ? '#6797d4' : '#808080' })]} 
          onPress={() => {this.addToCartOnPress(products.productDetails)}}
        >
          <Text style={styles.buyButtonText}>
            {addToCart} 
          </Text>
        </TouchableOpacity>
      )
    }
  }

  updateWishListIcon = () => {
    const { navigation, route } = this.props;
    navigation.goBack();
    route.params.onWishlistUpdate && route.params.onWishlistUpdate()
  }

  render() {
    const { navigation, products, wishList } = this.props;
    const { isGuestUser } = this.props.auth;
    const {addToCart, notify, notified, buyFromAnotherLocation, outOfStockCurrentLoc} = strings.productDetails;
    if(products.queryMessage && products.queryMessage !== ''){
      this.toast(products.queryMessage,Toast.type.SUCCESS)
    }
    if(this.state.isLoading && this.isInternetConnected){
      return (
        <>
          <Header
            navigation={this.props.navigation}
            screenTitle={strings.productDetails.title}
            onBackPress={this.updateWishListIcon}
          />
          <Loader loading={this.state.isLoading} />  
        </>
      )
    }
    else{
      return ((products.productDetails)?
        (
          <View style={{flex:1}}>
            <Loader loading={this.props.cart.isLoading || this.props.profile.isLoading} /> 
            <Header
              navigation={this.props.navigation}
              screenTitle={strings.productDetails.title}
              onBackPress={this.updateWishListIcon}
            />
            <View style={{flex:9}}>
              <KeyboardAwareScrollView 
                contentContainerStyle={{flexGrow: 1}} 
                keyboardShouldPersistTaps='handled'
                enableOnAndroid
                enableAutomaticScroll
                keyboardOpeningTime={0}
                extraHeight={Platform.select({ android: 140 })}
              >
                {this.createProductDetailsView(products.productDetails)}
                {((products.productDetails.maxQuantity > 1 || (this.isMovableToWarehouse && this.state.isAlternateWarehouseButtonShown)) && (this.props.profile.countryId != 2)) ? this.createQuantity() : null} 
                {this.createProductDetail(products.productDetails)}
                {(products.productDetails.substituteProducts!==null && products.productDetails.substituteProducts.length > 0)?
                  <SidescrollComponent routeName={this.props.route?.name}  title={strings.productDetails.similiarProducts} navigation={navigation} item={products.productDetails.substituteProducts} productDetailView /> 
                  :null
                }
                {(this.props.profile.countryId == 1 || this.props.profile.frequently_bought_together_visible == true) && (products.frequentlyBoughtTogether && products.frequentlyBoughtTogether.length)?
                  <SidescrollComponent routeName={this.props.route?.name} title='Frequently Bought Together' navigation={navigation} item={products.frequentlyBoughtTogether} productDetailView /> 
                  :null
                }  
                {(products.productDetails.relatedProducts !== null && products.productDetails.relatedProducts.length > 0 )?
                  <SidescrollComponent routeName={this.props.route?.name} title={strings.productDetails.relatedProducts} navigation={navigation} item={products.productDetails.relatedProducts} productDetailView /> 
                  :null
                }
                {(products.productDetails.recommendedProducts && products.productDetails.recommendedProducts.length)?
                  (
                    <SidescrollComponent 
                      title='Recommended Products' 
                      navigation={navigation} 
                      item={products.productDetails.recommendedProducts} 
                      productDetailView 
                      routeName={this.props.route?.name}
                    /> 
                  )
                  :null
                } 
                <ProductFeedback 
                  skuCode={products.productDetails.skuCode} 
                  overAllRating={products.productDetails.rating}
                  {...this.props} 
                />
                {!isGuestUser && this.createQuestionAnswer()}
              </KeyboardAwareScrollView>
            </View>
            {/* {this.renderNotifyButton( products, notify )} */}
            {this.renderInfoButton( products, notify )}
            {this.handleAlternateWarehouseOptions( products, buyFromAnotherLocation, outOfStockCurrentLoc )}
            {this.renderAddToCartButton( products, addToCart)}
            <AddToCart 
              modalVisible={this.state.modalVisible}
              openBuyingPreferenceVisible={this.openBuyingPreferenceVisible}
              confirmBuyerCart={this.confirmBuyerCart}
              setConfirmBuyer={this.setConfirmBuyer}
              createCartForDownline={this.createCartForDownline}
              selectedCheckBox={this.state.selectedCheckBox}
              startShopping={this.startShoppingPress}
            />
            <SuggestiveCart 
              modalVisible={this.state.suggestiveCartModal} 
              handleModal={(value) => this.handleSuggestiveCartModal(value)}
              productDetails={products.productDetails}
              addProductToCart={() => this.handleSuggestivePurchase(products.productDetails)}
            />
            {this.renderVideoPlaybackModal(products.productDetails)}
            {this.renderImageModal(this.state.imageUrls)}
          </View> 
        ) : (
          <View style={styles.emptyScreenView}>
            { !this.isInternetConnected && <OfflineNotice networkStatus={(status) => this.networkStatus(status)} /> }
            <EmptyScreen products />
          </View>
        )
      );
    }
  }
}

const styles = StyleSheet.create({
  productDetailsIcon:{
    alignSelf:'center',
  },
  productDetailsView: {
    flexDirection:'row',
    marginHorizontal:15,
    marginVertical:20,
    height:260,
    justifyContent:'space-between'
  },
  cardStyle: {
    marginTop: 10,
    backgroundColor: '#ffffff',
  },
  offerView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal:15,
    alignItems:'center',
    marginVertical:16,
  },
  heading: {
    color: '#373e73',
    fontSize: 14,
    ...Specs.fontSemibold,
  },
  headingwithFlex: {
    color: '#373e73',
    fontSize: 14,
    flex:2,
    ...Specs.fontSemibold,
  },
  buyButtonText: {
    fontSize: 16,
    color: '#ffffff',
    marginVertical: 17,
    alignSelf: 'center',
    ...Specs.fontMedium,
  },
  buttonMainView: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flex:1
  },
  upIconStyle: { 
    width: 15,
    height: 10 
  },
  lineView:{
    height:0.5,
    backgroundColor:'#c8c9d3'
  },
  headingView: { 
    flexDirection: 'row', 
    marginHorizontal:15,
    justifyContent: 'space-between',
    alignItems: 'center',
    flex:1
  },
  quantityButtons:{
    alignItems: 'center', 
    justifyContent: 'center',
    width: 33, 
    height: 33,
    borderRadius:33,
    borderWidth:1,
    borderColor:'#c8c9d3'
  },
  productDetailHeading:{
    color: '#46586f', 
    fontSize: 14, 
    ...Specs.fontMedium,
    marginTop:16,
    marginHorizontal:15
  },
  productDetaildata:{
    marginHorizontal:15,
    color: '#46586f',
    fontSize: 14 ,
    ...Specs.fontRegular,
  },
  quantityButtonView:{ 
    flexDirection: 'row',
    flex:1,
    justifyContent:'space-between',
    marginVertical:17,
  },
  quantityText: { 
    color: '#46586f',
    fontSize: 20,
    ...Specs.fontMedium,
  },
  showHideStyle: {
    flex:1,
    alignItems:'flex-end'
  },
  submitQuery:{
    fontSize:16,
    color:'#6797d4',
    textAlign:'right',
    ...Specs.fontSemibold,
  },
  emptyScreenView: {
    flex:9.3, 
    marginBottom:1,
    justifyContent:'center',
    alignItems:'center'
  },
  price: {
    fontSize: 14,
    marginTop: 4 ,
    color:'#31cab3',
    ...Specs.fontSemibold
  },
  inclusiveStyles: {
    fontSize: 13,
    color: '#31cab3',
    ...Specs.fontMedium,
    marginLeft: 2
  },
  closeIcon:{
    height:32,
    width:32,
    borderRadius:16,
    backgroundColor:'white',
    alignItems:'center',
    position:'absolute',
    justifyContent:'center',
    right:16,
    top: deviceHeight*0.5-150,
    opacity:1,
    zIndex:30
  },
  videoButtonContainer: {
    height: 40,
    width: 170,
    // borderTopLeftRadius: 20,
    // borderBottomLeftRadius: 20,
    borderRadius: 10,
    elevation: 8,
    shadowOffset: { width: 0, height: 0 },
    shadowColor: '#808080',
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  videoButton:{
    flexDirection: 'row',
    flex: 1,
    // backgroundColor: '#6797d4',
    // paddingLeft: 5,
    // paddingRight: 10,
    paddingHorizontal:5,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  videoContainerText: {
    color: '#fff',
    marginLeft: 8,
    ...Specs.fontMedium,
    fontSize: 18
  },
  modalVideoContainer: {
    backgroundColor: 'black', 
    flex:1
  },
  videoCloseIcon: {
    zIndex: 99, 
    top: 20,
    position: 'absolute', 
    right: 20, 
    padding: 10
  },
  iconStyle: {
    fontSize: 30, 
    color: '#FFFFFF'
  },
  imageDesign: {
    alignSelf: 'center',
    marginTop: 3,
    height: '40%',
    width: deviceWidth,
  },
});