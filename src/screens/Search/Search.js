import React, { Component } from 'react';
import { 
  Text, 
  View, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
  Platform,
  Linking,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { observer, inject } from 'mobx-react';
import Voice from '@react-native-voice/voice';
import { observable, makeObservable} from 'mobx';
import { Specs } from 'app/src/utility/Theme';
import HeaderSearchIcons from 'app/src/components/navigation/HeaderSearchIcons';
import Stepper from 'app/src/components/buttons/Stepper';
import { CartButton, CustomButton } from 'app/src/components/buttons/Button';
import Loader  from 'app/src/components/loader/Loader';
import AlertClass from 'app/src/utility/AlertClass';
import AddToCart from 'app/src/components/cartComponent/AddToCart';
import autobind from 'autobind-decorator';
import { UserRole,KYC_ERROR_MESSAGE } from 'app/src//utility/constant/Constants';
import { CartProductModel } from 'app/src/stores/models/CartModel';
import LocationHeader from 'app/src/components/locationHeader/LocationHeader';
import { Toast } from 'app/src/components/toast/Toast';
import EmptyScreen from 'app/src/components/emptyScreen/EmptyScreen';
// import { trackEvent } from 'app/src/utility/AnalyticsUtils';
import { SEARCH_TAB_PRESS } from 'app/src/utility/GAEventConstants';
import HeaderLeftIcons from 'app/src/components/navigation/HeaderLeftIcons';
import HeaderRightIcons from 'app/src/components/navigation/HeaderRightIcons';
import { strings } from 'app/src/utility/localization/Localized';
import OfflineNotice from 'app/src/components/OfflineNotice';
import SidescrollComponent from 'app/src/components/sidescrollComponent/SidescrollComponent';
import Banner from 'app/src/screens/Dashboard/Banner';
import * as Permissions from '../../utility/permissions/Permissions';
import { _ } from 'lodash';
import { Header } from '../../components';
import {
  promptToOpenSettings,
  searchFromArray,
  priceWithCurrency,
  connectedToInternet,
  isShoppingItemActiveInCountry,
  capitalizeFirstCharacter,
} from '../../utility/Utility';

const PRODUCT_PLACEHOLDER = require('app/src/assets/images/productList/placeHolder.png');

@inject('search', 'cart', 'auth', 'products', 'profile', 'appConfiguration')
@observer
export default class Search extends Component {
  
  @observable isInternetConnected: Boolean = true;
  @observable mostViewed: [];
  @observable topSelling: [];

  constructor(props) {
    super(props);
    makeObservable(this);
    this.props = props;
    this.state={
      modalVisible: false,
      selectedCheckBox: [],
      productAddToCart: [],
      selectedProduct: '',
      // pitch: '',
      error: '',
      end: '',
      started: '',
      results: [],
      // partialResults: [],
      micColour: '#3f4967',
      countryId: undefined,
      isLoading: false,
      isLoadingMostViewedWidget: false,
    }


    // trackEvent(SEARCH_TAB_PRESS.eventCategory, SEARCH_TAB_PRESS.events.NAVIGATE);
    Voice.onSpeechStart = this.onSpeechStart;
    Voice.onSpeechEnd = this.onSpeechEnd;
    Voice.onSpeechError = this.onSpeechError;
    Voice.onSpeechResults = this.onSpeechResults;
    this.timeout =  0;
    // Voice.onSpeechPartialResults = this.onSpeechPartialResults;
    // Voice.onSpeechVolumeChanged = this.onSpeechVolumeChanged;
  }

  async componentDidMount(){
    this.isInternetConnected = await connectedToInternet();
    this.setState({ isLoadingMostViewedWidget: true })
    const [topSelling, mostViewed] = await Promise.all([this.props.products.fetchProductWidgetStoreFront('topSelling', ''), this.props.products.fetchProductWidgetStoreFront('mostViewed', '')])
    this.topSelling = topSelling;
    console.log('MostViewed>>>>>>>>>>>>>>>>>>>>>',mostViewed)
    this.mostViewed = mostViewed;
    this.setState({ isLoadingMostViewedWidget: false })
    
    // this.willFocusSubscription = this.props.navigation.addListener(
    //   'willFocus', async () => {
    //     if(this.props.profile.cateringChangeCalled){
    //       this.setState({ isLoadingMostViewedWidget: true })
    //       const [topSelling, mostViewed] = await Promise.all([this.props.products.fetchProductWidgetStoreFront('topSelling', ''), this.props.products.fetchProductWidgetStoreFront('mostViewed', '')])
    //       this.topSelling = topSelling;
    //       this.mostViewed = mostViewed;
    //       this.props.profile.setCateringChangeCalled(false);
    //       this.setState({ isLoadingMostViewedWidget: false })
    //     }
    //   });

      this.focusSubscription = this.props.navigation.addListener(
        'focus',
        async() => {
          this.setState({
            countryId: this.props.profile.defaultAddressCountryId
          })

          this.setState({ isLoadingMostViewedWidget: true })
          const [topSelling, mostViewed] = await Promise.all([this.props.products.fetchProductWidgetStoreFront('topSelling', ''), this.props.products.fetchProductWidgetStoreFront('mostViewed', '')])
          this.topSelling = topSelling;
          this.mostViewed = mostViewed;
          this.props.profile.setCateringChangeCalled(false);
          this.setState({ isLoadingMostViewedWidget: false })
        }
      );
  }

  componentWillUnmount() {
    //destroy the process after switching the screen 
    Voice.destroy().then(Voice.removeAllListeners);
    this.focusSubscription();
  }

  onSpeechStart = e => {
    //Invoked when .start() is called without error
    console.log('onSpeechStart: ', e);
    this.setState({
      started: '√',
      micColour: '#7CFC00'
    });
  };
 
  onSpeechEnd = e => {
    //Invoked when SpeechRecognizer stops recognition
    console.log('onSpeechEnd: ', e);
    this.setState({
      end: '√',
      micColour: '#3f4967'
    });
  };
 
  onSpeechError = e => {
    //Invoked when an error occurs. 
    console.log('onSpeechError: ', e);
    this.setState({
      micColour: '#3f4967',
      error: JSON.stringify(e.error),
    });
  };
 
  onSpeechResults = async (e) => {
    //Invoked when SpeechRecognizer is finished recognizing
    console.log('onSpeechResults: ', e.value);
    if(e.value && e.value.length && e.value[0].trim().length >=3  ) {
      this.props.search.setSearchInputValue(e.value[0])
      this.props.search.fetchSearchResults()
    }
    else {
      this.showToast(strings.searchScreen.tryAgain, Toast.type.SUCCESS)
    }
    await Voice.stop()
  };
 
  // onSpeechPartialResults = e => {
  //   //Invoked when any results are computed
  //   console.log('onSpeechPartialResults: ', e);
  //   this.setState({
  //     partialResults: e.value,
  //   });
  // };
 
  // onSpeechVolumeChanged = e => {
  //   //Invoked when pitch that is recognized changed
  //   console.log('onSpeechVolumeChanged: ', e);
  //   this.setState({
  //     pitch: e.value,
  //   });
  // };

  async getAudioPermission() {
    const permissionType =
      Platform.OS === 'android'
        ? Permissions.PERMISSION_TYPES.android.LOCATION
        : Permissions.PERMISSION_TYPES.ios.LOCATION;
    const response = await Permissions.requestPermission(permissionType);
    console.log('check ==> ', response)
    if (response === Permissions.StatusEnum.GRANTED) {
      this._startRecognizing();
    } else if (response === Permissions.StatusEnum.BLOCKED || response === Permissions.StatusEnum.UNAVAILABLE) {
      promptToOpenSettings(
        strings.voiceFeature.microphonePermission,
        strings.voiceFeature.microphonePermissionSettings,
      );
    }
  }
 
  _startRecognizing = async () => {
    //Starts listening for speech for a specific locale
    console.log('--------------------Start-----------------')
    this.setState({
      pitch: '',
      error: '',
      started: '',
      results: [],
      // partialResults: [],
      end: '',
      // micColour: '#7CFC00'
    });
 
    try {
      await Voice.start('en-US');
    }
    catch (e) {
      //eslint-disable-next-line
      console.log(e);
    }
  };
 
  _stopRecognizing = async () => {
    //Stops listening for speech
    try {
      await Voice.stop();
    }
    catch (e) {
      //eslint-disable-next-line
      console.log(e);
    }
  };
 
  _cancelRecognizing = async () => {
    //Cancels the speech recognition
    try {
      await Voice.cancel();
    }
    catch (e) {
      //eslint-disable-next-line
      console.log(e);
    }
  };
 
  _destroyRecognizer = async () => {
    //Destroys the current SpeechRecognizer instance
    try {
      await Voice.destroy();
    }
    catch (e) {
      //eslint-disable-next-line
      console.log(e);
    }
    this.setState({
      pitch: '',
      error: '',
      started: '',
      results: [],
      // partialResults: [],
      end: '',
    });
  };

  allProductsButtonPress = () => {
    const {search, navigation} = this.props;
    navigation.navigate('productList',{type:'search', param:search.searchInputValue,title:search.searchInputValue});
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

  @autobind
  showToast(message: string, toastType: Toast.type,) {
    // Add a Toast on screen.
    Toast.show(message, {
      duration: Toast.durations.SHORT,
      type: toastType,
      shadow: false,
      animation: true,
      hideOnPress: true,
      delay: 0,
    });
  }

  // @autobind
  addToCartPress = _.debounce(async(product) => {
    if(!product.maxQuantity || this.props.auth.userRole === UserRole.Trainer){
      return
    }
    // if(!this.props.profile.isEkycDone){
    //   AlertMessage.showAlert( KYC_ERROR_MESSAGE.kycError, this.props.navigation)
    //   return;
    // }
    // this.setState({
    //   modalVisible: true,
    //   selectedProduct: Object.assign(new CartProductModel(product, selectedQuantity={quantity: this.props.search.initialQuantity})) 
    // });
    const selectedProduct = Object.assign(new CartProductModel(product, {quantity: this.props.search.initialQuantity})) 
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
  }, 500, { leading: true, trailing: false })

  /**
   * @function open a modal from downward for all available cart
   * @param {*} visible
   */
  openBuyingPreference = () => {
    this.setState({
      modalVisible: true,
    });
  }

  renderSeparator = () => {
    return (
      <View
        style={{
          height: 0.8,
          width: '100%',
          backgroundColor: '#a3a9b4',
        }}
      />
    );
  };

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
      const isGuestUser = this.props.auth.userRole === UserRole.GuestUser
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
        if(status.success) {
          this.openBuyingPreferenceVisible(false);
          if(status.toast && status.alert) {
            this.showToast(status.toast, Toast.type.SUCCESS)
            AlertClass.showAlert('', status.alert, [{text: 'OK', onPress: () => status.kycLink ? this.props.navigation.navigate('kycImage') : console.log('OK Pressed') }])
          }
          else if(status.alert) {
            AlertClass.showAlert('', status.alert, [{text: 'OK', onPress: () => status.kycLink ? this.props.navigation.navigate('kycImage') : console.log('OK Pressed') }])
          }
          else {
            this.showToast(status.toast, Toast.type.SUCCESS)
          }
        }
        else{
          AlertClass.showAlert('', status.alert, [{text: 'OK', onPress: () => console.log('OK Pressed') }])
          this.openBuyingPreferenceVisible(false);
        }
      }
    }
    else {
      this.showToast(strings.commonMessages.noInternet, Toast.type.ERROR)
    }  
  }
 
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

  getRecentSearchesList = (recentSearch) => {
    if(recentSearch && recentSearch.length) {
      return(
        <View style={styles.recentSearchesContainer}>
          <Text style={styles.recentSearchesLabel}>{strings.product.recent}</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            keyboardShouldPersistTaps='handled'
            data={this.props.search.recentSearchResults}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item})=>(
              <TouchableWithoutFeedback>
                <View style={styles.recentSearchItem}>
                  <TouchableOpacity 
                    onPress={()=>this.props.navigation.navigate('productList',{type:'search', param: item.name, title: item.name})}
                    style={{borderRadius: 20, borderWidth:1, borderColor: '#d1d3d6'}}
                  >
                    <Banner 
                      source={(item.url) ? {uri: item.url} : PRODUCT_PLACEHOLDER}
                      styles={{ width: 40, height: 40}}
                      resizeMode='contain'
                    />
                  </TouchableOpacity>
                  <Text 
                    numberOfLines={2}
                    onPress={()=>this.props.navigation.navigate('productList',{type:'search', param: item.name, title: item.name})}
                    style={styles.itemLabel}
                  >
                    {item.name}
                  </Text>
                </View>
               
              </TouchableWithoutFeedback>
            )}
          /> 
        </View>
      )
    }
  }

  @autobind
  async networkStatus(status) {
    if(status) {
      this.isInternetConnected = status;
    }
  }
  
  @autobind
  renderSearchResultSuggestions() {
    return ( 
      <FlatList
        data={this.props.search.searchInputValue.length > 2 ? this.props.search.searchResultsList : []}
        keyExtractor={(item, index) => index.toString()}
        ItemSeparatorComponent={this.renderSeparator}
        keyboardShouldPersistTaps='handled' 
        extraData={this.props.search.searchInputValue}
        // ListEmptyComponent={this.props.search.noResultsFound && this.props.search.searchInputValue && this.showToast('No products found', Toast.type.ERROR)}
        // contentContainerStyle={this.props.search.searchResultsList.length === 0 && styles.emptyScreenView}
        // renderItem={({item}) => 
        //   (
        //     <Text 
        //       onPress={()=> {
        //         this.props.search.searchInputValue = item.productName.split(' ').slice(0, 3).join(' ')
        //         this.props.search.fetchSearchResults()
        //       }}
        //       style={styles.searchSuggestionsResult}
        //     >
        //       {capitalizeFirstCharacter(item.productName.split(' ').slice(0, 3).join(' '))} 
        //     </Text>
        //   )
        // }
        renderItem={({item}) => this.renderSearchResults(item)}
      /> 
    )
  }

  renderExploreVestige() {
    return (
      <TouchableOpacity 
        style={{
          marginLeft: 17 , 
          width: 130, 
          paddingHorizontal: 7, 
          paddingVertical: 12, 
          borderRadius: 10, 
          borderWidth: 1,
          borderColor: '#373e73',
          flexDirection: 'row',
          justifyContent: 'center',
          marginTop: 11
        }}
        onPress={()=> this.props.navigation.navigate('faq')}
      >
        <Text style={{ fontSize: 12, ...Specs.fontSemibold, color: '#373e73' }}>{strings.searchScreen.exploreVestige}</Text>
      </TouchableOpacity>
    )
  }

  handleSearchSuggestionsCallback = (val) => {
    this.props.search.setInitialQuantity(1);
    this.props.search.fetchSearchSuggestions(val);
  }

  fetchSearchResults = () => {
    this.props.search.fetchSearchResults()
  }

  showOtherOptionMessage = () => {
    AlertClass.showAlert('Alert!', 
      `${strings.product.otherOptionMessage}`, 
      [{text: 'OK', onPress: () => console.log('OK Pressed')}])
  }

  renderAddToCartButtonView = (item) => {
    return(
      <View style={[styles.searchItemDetails, styles.overrideItemDetails]}>
        <Stepper 
          getQuantity={(value)=> this.props.search.setInitialQuantity(value)} 
          isDisabled={(item.maxQuantity)?false:true} 
          availableQuantity={item.maxQuantity}
          maxLimitReached={this.showToast}
          style={{width: 88, marginBottom: 7}}
        >
          {this.props.search.initialQuantity}
        </Stepper>
        <CartButton 
          style={{width: 88, paddingVertical: 5,opacity:(item.maxQuantity && this.props.auth.userRole!==UserRole.Trainer)? 1:0.5}} 
          addToCart={()=>this.addToCartPress(item)}
        />  
      </View> 
    )
  }

  handleButtonView = (item, defaultActiveAddressType) => {
    if (
      defaultActiveAddressType === 'Home-Delivery' && 
      this.props.profile.fetchIsWarehouseShipping !== '1' && 
      this.props.profile.isWarehouseAvailable  && 
      item.isMovableToWarehouse && item.maxQuantity < 1 && 
      this.props.auth.userRole !== UserRole.Trainer
    ) {
      return (
        <TouchableOpacity
          style={[styles.viewOptionButton, {backgroundColor:'#6797d4', justifyContent: 'center', borderRadius:3}]}
          onPress={() => this.props.navigation.navigate('productDetails',{skuCode:item.skuCode, locationId:item.locationId,productId: item.productId, isMovableToWarehouse: true})}
        >
          <Text numberOfLines={2} style={{alignSelf:'center', textAlign:'center', ...Specs.fontBold, color:'#fff', fontSize:15}}>{strings.product.orderHere}</Text>
        </TouchableOpacity>
      );
    }
    if (
      defaultActiveAddressType === 'Home-Delivery' && 
      this.props.profile.fetchIsWarehouseShipping !== '1' && 
      this.props.profile.isWarehouseAvailable  && 
      !item.isMovableToWarehouse && item.maxQuantity < 1 && 
      this.props.auth.userRole !== UserRole.Trainer
    ) {
      return (
        <TouchableOpacity
          style={[styles.viewOptionButton, {backgroundColor:'#DBB957', justifyContent: 'center', borderRadius:3}]}
          onPress={() => this.showOtherOptionMessage()}
        >
          <Text numberOfLines={2} style={{alignSelf:'center', textAlign:'center', ...Specs.fontBold, color:'#fff', fontSize:15}}>{strings.product.infoButton}</Text>
        </TouchableOpacity>
      );
    }
    return this.renderAddToCartButtonView(item);
  }

  renderSearchResults = (item) => {
    const { profile, appConfiguration} = this.props;
    const {defaultActiveAddressType, countryId} = profile;
    // console.log(item)
    return(
      <TouchableOpacity onPress={()=>this.props.navigation.navigate('productDetails',{skuCode:item.skuCode, locationId:item.locationId, productId: item.productId})} activeOpacity={1} style={styles.searchResultItem}>
        <View style={{alignSelf: 'center'  }}>
          <Banner 
            source={(item.imageUrl)?{uri:item.imageUrl}:PRODUCT_PLACEHOLDER} 
            styles={styles.searchItemImage}
            resizeMode='contain'
          />
        </View>
        <View style={[styles.searchItemDetails, { paddingVertical: 5 }]}>
          <Text style={styles.itemPrice}>
            {`${strings.product.dealerPrice}: ${priceWithCurrency(item.countryId,item.unitCost)}`}
          </Text>
          <Text accessibilityLabel={item.productName} testID={item.productName} style={styles.itemName}>{capitalizeFirstCharacter(item.productName.split(' ').slice(0, 4).join(' '))}</Text>
          <Text style={styles.itemPrice}>
            {`Item Code: ${(item.skuCode)}`}
          </Text>
          {/* <Text style={styles.itemPrice}>
            {`Available Quantity: ${(item.maxQuantity)}`}
          </Text> */}
          {(item.maxQuantity || item.isMovableToWarehouse)?null:(<Text style={{color:'red'}}>{strings.product.outOfStock}</Text>)}
        </View>
        {isShoppingItemActiveInCountry(countryId, appConfiguration.isShoppingActiveOnSelectedAddress) && this.handleButtonView(item,defaultActiveAddressType)}
      </TouchableOpacity>
      
    )
  }

  renderHeaderShopFor = () => {
    return (
      <HeaderLeftIcons
        logo
        updateLocation
        navigation={this.props.navigation} 
      />
    )
  }

  renderHeaderNotificationIcon = () => {
    return (
      <HeaderRightIcons
        notification
        navigation={this.props.navigation}
      />
    )
  }

  render() {
    const { isLoading, searchResultsList, searchResultSuggestions, searchInputValue } = this.props.search;
    const { navigation } = this.props;
    const {dealerPrice} = strings.product;
    const showlocationFlag = this.props.profile.countryId == 1 ? true : this.props.profile.location_update;
    return (
      !this.isInternetConnected ? <OfflineNotice networkStatus={(status) => this.networkStatus(status)} /> : (
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View style={{ flex: 1 }}>
            <Header
              navigation={navigation}
              hideBack
              showDrawer
              middleComponent={this.renderHeaderShopFor()}
              rightComponent={this.renderHeaderNotificationIcon()}
            />
            {(showlocationFlag == true) && <LocationHeader navigation={navigation} /> }
            <ScrollView>
              <View style={styles.searchItemContainer}>
                <Loader loading={this.state.isLoading} />
                <HeaderSearchIcons
                  showSearch
                  onChangeText={(val)=>this.handleSearchSuggestionsCallback(val)}
                  onSubmitEditing={async()=>{
                    if(this.props.search.searchInputValue.trim().length > 3)  {
                      this.setState({
                        isLoading: true
                      })
                      await this.fetchSearchResults()
                      this.setState({
                        isLoading: false
                      })
                    }
                  // else {
                  //   alert(strings.commonMessages.searchLimit)
                  // }
                  }}
                  value={this.props.search.searchInputValue}
                  placeholder={strings.searchScreen.searchPlaceholder}
                  onMicPress={() => this.getAudioPermission()}
                  micColor={this.state.micColour}
                />
                { !this.props.search.searchInputValue && this.getRecentSearchesList(this.props.search.recentSearchResults) }
                { (this.props.profile.countryId == 1 || this.props.profile.explore_vestige_visible == true) && !this.props.search.searchInputValue && this.renderExploreVestige() }
                {/* { !this.props.search.searchInputValue && this.mostViewed && this.mostViewed.length > 0 && <SidescrollComponent title={`${strings.storeFront.title.mostlyViewed}`} navigation={navigation} item={this.mostViewed} /> } */}
                { this.state.isLoadingMostViewedWidget ? (
                  <View style={{ marginTop: 100}}>
                    <ActivityIndicator size="small" color="#0000ff" />
                  </View>
                ) : (!this.props.search.searchInputValue && this.topSelling && this.topSelling.length > 0 && <SidescrollComponent title={`${strings.storeFront.title.topSelling}`} navigation={navigation} item={this.topSelling} updatedCountryId={this.state.countryId}/>) }
                { this.state.isLoadingMostViewedWidget ? (
                  <View style={{ marginTop: 100}}>
                    <ActivityIndicator size="small" color="#0000ff" />
                  </View>
                ) : (!this.props.search.searchInputValue && this.mostViewed && this.mostViewed.length > 0 && <SidescrollComponent title={`${strings.storeFront.title.mostlyViewed}`} navigation={navigation} item={this.mostViewed} updatedCountryId={this.state.countryId} />) }
                { this.renderSearchResultSuggestions() }
                {/* {
                searchResultSuggestions.length ? this.renderSearchResultSuggestions():  (
                  <View style={{flex: 1}}>
                    <FlatList
                      accessibilityLabel="Search_List"
                      testID="Search_List"
                      data={searchResultsList}
                      keyExtractor={(item, index) => index.toString()}
                      contentContainerStyle={this.props.search.searchResultsList.length === 0 && styles.emptyScreenView}
                      ListEmptyComponent={this.props.search.noResultsFound && <EmptyScreen searchResults />} 
                      keyboardShouldPersistTaps='handled'
                      extraData={this.props.search.searchInputValue}
                      renderItem={({item}) => this.renderSearchResults(item)}
                    /> 
                  </View>
                )
              } */}
                {
                  searchInputValue.length > 2 && this.props.search.searchResultsList.length?(
                    <CustomButton
                      handleClick={() => this.allProductsButtonPress()}
                      linearGradient
                      buttonContainer={[styles.button, {paddingBottom: 10, marginBottom:15}]}
                      buttonTitle={strings.searchScreen.viewAllProductsTitle}
                      buttonTitleStyle={styles.customButtonTitleStyle}
                      primaryColor="#6895d4"
                      secondaryColor="#57a5cf"
                    />
                  ):null}

                <AddToCart 
                  modalVisible={this.state.modalVisible}
                  openBuyingPreferenceVisible={this.openBuyingPreferenceVisible}
                  confirmBuyerCart={this.confirmBuyerCart}
                  setConfirmBuyer={this.setConfirmBuyer}
                  createCartForDownline={this.createCartForDownline}
                  selectedCheckBox={this.state.selectedCheckBox}
                  startShopping={this.startShoppingPress}
                />
              </View>
            </ScrollView>
          </View>
        </TouchableWithoutFeedback>
      )
    );
  }
}

const styles=StyleSheet.create({
  searchItemContainer: {
    flex: 1, 
    marginBottom: 20
  },
  searchResultItem: {
    flexDirection: 'row',
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 10,
    paddingLeft: 18,
    paddingRight: 10,
    paddingVertical: 14,
    borderColor: '#18afb3b9',
    // borderWidth: 0.2,    // Please do not remove, this needs to be tested for IOS.
    shadowColor: '#809fa7b1',
    shadowOffset: {width: 0, height: 3 },
    elevation: 6,
  },
  searchItemDetails: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    flex:1,
    paddingVertical: 8
  },
  overrideItemDetails: {
    position: 'absolute', 
    right: 9, 
    alignSelf: 'center'
  },    
  itemPrice: {
    ...Specs.fontSemibold,
    color: '#31cab3',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 2
  },
  itemName: {
    ...Specs.fontMedium,
    color: '#6c7a87',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 2
  },
  button: {
    paddingTop: 10
  },
  customButtonTitleStyle: {
    fontSize: 16,
    color: '#FFFFFF',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  recentSearchesLabel: {
    ...Specs.fontBold,
    color: '#373e73',
    fontSize: 16,
    marginLeft:10,
  },
  recentSearchesContainer: {
    flexDirection: 'column', 
    backgroundColor: '#ffffff', 
    paddingTop: 12, 
    paddingBottom: 10,
    marginTop: 10
  },
  itemLabel: {
    ...Specs.fontMedium,
    color: '#6c7a87',
    fontSize: 12,
    marginTop: 6,
    // width: '95%',
    // borderWidth: 1,
    textAlign: 'center'
  },
  recentSearchItem: {
    paddingLeft: 5,
    marginLeft: 15,
    paddingRight: 5, 
    paddingTop: 15,
    paddingBottom: 12,
    // width: '90%',
    // borderWidth: 1, 
    flexDirection: 'column', 
    // justifyContent: 'space-between', 
    alignItems: 'center',
  },
  searchItemImage: {
    width: 38, 
    height: 52, 
    marginRight: 10,
  },
  searchSuggestionsResult: {
    ...Specs.fontRegular,
    color: '#474b60',
    paddingVertical: 10,
    paddingLeft: 20,
    fontSize: 14,
    backgroundColor: '#fff'
  },
  emptyScreenView: {
    flex:1, 
    marginBottom:1,
    justifyContent:'center',
    alignItems:'center',
  },
  viewOptionButton:{
    width:70,
    paddingVertical: 5,
    marginVertical: 10
  }
})

