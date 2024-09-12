
import React, { Component } from 'react';
import { Text, View, TouchableOpacity,Dimensions, StyleSheet, Modal, FlatList, Image, ActivityIndicator, Keyboard } from 'react-native';
import { observer, inject } from 'mobx-react';
import { observable, makeObservable } from 'mobx';
import Banner from 'app/src/screens/Dashboard/Banner';
import ProductLinear from 'app/src/components/productComponent/ProductLinear';
import LocationHeader from 'app/src/components/locationHeader/LocationHeader';
import ProductGrid from 'app/src/components/productComponent/ProductGrid';
import EmptyScreen from 'app/src/components/emptyScreen/EmptyScreen';
import { RadioButton } from 'app/src/components/buttons/Button';
import { Specs } from 'app/src/utility/Theme';
import { LOCATION_ROUTE_PATH, UserRole } from 'app/src/utility/constant/Constants';
import { connectedToInternet } from 'app/src/utility/Utility';
import OfflineNotice from 'app/src/components/OfflineNotice';
// Navigation Icons
import HeaderLeftIcons from 'app/src/components/navigation/HeaderLeftIcons';
import autobind from 'autobind-decorator';
import { strings } from '../../utility/localization/Localized';
import { Header } from '../../components';



const deviceHeight = (Dimensions.get('window').height)
const BUY_ICON = require('app/src/assets/images/DashBoardHeader/buy_Item.png');
const WISHLIST_ICON = require('app/src/assets/images/DashBoardHeader/wishlist_icon.png');
const WISHLIST_SELECTED_ICON = require('app/src/assets/images/DashBoardHeader/wishlist_red.png');
const LINEAR_VIEW_ICON = require('app/src/assets/images/productList/linear_view_icon.png');
const GRID_VIEW_ICON = require('app/src/assets/images/productList/grid_menu.png');
const SORT_ICON = require('app/src/assets/images/productList/sort_icon.png');
const FILTER_ICON = require('app/src/assets/images/productList/filter_icon.png');
const FAVOURITE_ICON = require('app/src/assets/images/productList/favourite_icon.png');
const RATING_ICON = require('app/src/assets/images/productList/rating_icon.png');
const ADD_TO_CART = require('app/src/assets/images/productList/addToCart.png');
const REMOVE_ICON = require('app/src/assets/images/Kyc/remove_btn.png');


const sorting = [
  {
    type:'Price - High to Low',
    value:'price.mrp:desc'  
  },
  {
    type:'Price - Low to High',
    value:'price.mrp:asc'  
  },
  {
    type:'Pv - High to Low',
    value:'associatedPv:desc'  
  },
  {
    type:'Pv - Low to High',
    value:'associatedPv:asc'  
  },
  {
    type: 'Rating - High to Low',
    value: 'rating:desc'
  },
  {
    type: 'Rating - Low to High',
    value: 'rating:asc'
  }
]
/**
 * @description It contains the complete Dashboard design
 */

@inject('products', 'profile', 'location', 'auth', 'cart')
@observer
export default class ProductList extends Component {

  @observable isInternetConnected: boolean = true;

  constructor(props) {
    super(props);
    makeObservable(this);
    this.state = {
      linearType:false,
      selected:false,
      modalVisible:false,
      selectedValue:'',
      isLazyloadCalled: true
    }
  }

  getComponentData = async () => {
    const {type, param, extraData} = this.props.route.params;
    const isGuestUser = this.props.auth.userRole === UserRole.GuestUser;
    // console.log(this.props.profile.activeAddress.addressType)
    if(this.props.profile.activeAddress.addressType || isGuestUser) {
      await this.props.products.fetchProductList(type, param, extraData);
      this.props.navigation.addListener('willFocus', () => {
        this.props.products.refresh('productList');
      });
    }
  }

  @autobind
  async networkStatus(status) {
    if(status) {
      this.isInternetConnected = status;
      await this.getComponentData()
    }
    // else {
    //   this.props.location.setLocationRoutePath(LOCATION_ROUTE_PATH.back)
    //   this.props.navigation.navigate('location',{updateLocation : async(update) => {
    //     if(update)
    //       await this.props.products.fetchProductList(type, param);
    //   }});  
    // }
  }


  onSelect = data => {
    this.setState({selectedValue:'', selected:!this.state.selected});
  };
  
  async componentDidMount() { 
    this.isInternetConnected = await connectedToInternet();
    Keyboard.dismiss();
    if(this.isInternetConnected) {
      this.getComponentData();

      this.willFocusSubscription = this.props.navigation.addListener(
        'willFocus', async () => {
          if(this.props.profile.cateringChangeCalled){
            this.getComponentData();
            this.props.profile.setCateringChangeCalled(false);
          }
        });

        this.focusListenerUnsubscribe = this.props.navigation.addListener(
          'focus', async() => {
            if(this.props.profile.defaultAddressCountryId) {
              this.getComponentData();
            }
          },
        );
    }
    // this.props.cart.updateLocalCarts();
  }

  async lazyload() {
    await this.props.products.lazyLoad();
  }
  
  componentWillUnmount() {
    this.props.products.resetFilters();
    this.willFocusSubscription && this.willFocusSubscription.remove?.();
    this.focusListenerUnsubscribe?.();
  }

  createList = () => {
    const { linearType } = this.state;
    const { navigation, products } = this.props;
    var productLists = products.productList;
    let productList = productLists ? productLists.filter((v,i,a)=>a.findIndex(t=>(t.skuCode === v.skuCode))===i) : []
    return (
      <FlatList
        key={(linearType ? 'v': 'h')}
        numColumns={(linearType ? 1: 2)}
        showsVerticalScrollIndicator={false}
        style={styles.flatList}
        contentContainerStyle={productList.length === 0 ? styles.emptyScreenView : {justifyContent: 'center'}}
        onEndReached={() => this.setState({isLazyloadCalled: true})}
        onEndReachedThreshold={.7}
        onMomentumScrollEnd={() => {
          this.state.isLazyloadCalled && this.lazyload();
          this.setState({isLazyloadCalled : false})
        }}
        data={(productList.length > 0) ? productList.slice() : []}
        extraData={this.state.selected || products.isProductLoading}
        ListFooterComponent={() => ((products.isProductLoading) ? <ActivityIndicator size="large" color="#5988e0" /> : null )}
        ListEmptyComponent={this.props.products.isLoading ? <ActivityIndicator size="large" color="#5988e0" /> : <EmptyScreen products />} 
        ref={(ref) => { this.flatListRef = ref; }}
        keyExtractor={(item, index) => item + index}
        renderItem={({ item }) => {
          return(
            (linearType) ?
              ( 
                <ProductLinear
                  item={item} 
                  ratingIcon={RATING_ICON}
                  buyIcon={BUY_ICON}
                  wishlistIcon={WISHLIST_ICON}
                  wishlistSelectedIcon={WISHLIST_SELECTED_ICON}
                  favouriteIcon={FAVOURITE_ICON}
                  addtoCartIcon={ADD_TO_CART}
                  navigation={navigation}
                  getComponentData={()=> this.getComponentData()}
                /> 
              ) : ( 
                <ProductGrid
                  item={item} 
                  ratingIcon={RATING_ICON}
                  buyIcon={BUY_ICON}
                  wishlistIcon={WISHLIST_ICON}
                  wishlistSelectedIcon={WISHLIST_SELECTED_ICON}
                  favouriteIcon={FAVOURITE_ICON}
                  mainView={styles.mainView}
                  navigation={navigation}
                  addtoCartIcon={ADD_TO_CART}
                  productListDisplay='flex'
                  getComponentData={()=> this.getComponentData()}
                /> 
              )
          );
        }
        }
      />
    );    
  }

  radioButton = async(item) => {
    this.setState({
      selectedValue: item.type,
      modalVisible: false
    });
    this.flatListRef.scrollToIndex({animated: true,index:0});
    await this.props.products.sortProducts(item.value);
  }


  renderRadioButton = ({item}) => {
    const { selectedValue } = this.state;
    return (
      <RadioButton
        textStyle={styles.sortingLabel}
        buttonText={item.type}
        onPress={() => this.radioButton(item)}
        selectedValue={selectedValue}
      />
    )
  }

  render() {
    const { linearType, selectedValue } = this.state;
    const { navigation } = this.props;
    const showlocationFlag = this.props.profile.countryId == 1 ? true : this.props.profile.location_update;
    return (
      <View style={{flex:1}}>
        { !this.isInternetConnected && <OfflineNotice networkStatus={(status) => this.networkStatus(status)} /> }
        <Header
          navigation={this.props.navigation}
          screenTitle={this.props.route?.params?.title || "Product List"}
        />
        {(showlocationFlag == true) && <LocationHeader navigation={this.props.navigation} /> }
        <View style={styles.bottomView}>
          <TouchableOpacity
            style={styles.bottomViewButton}
            onPress={() => {
              this.setState({linearType: !linearType})
            }}
          >
            <Banner
              styles={styles.tabIcon}
              resizeMode='contain'
              source={(linearType)?GRID_VIEW_ICON:LINEAR_VIEW_ICON}
            />
            <Text style={styles.bottomButtonText}>
              {strings.product.view}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.bottomViewButton}
            onPress={() => this.setState({modalVisible:true})}
          >
            <Banner
              styles={styles.tabIcon}
              resizeMode='contain'
              source={SORT_ICON}
            />
            <Text style={styles.bottomButtonText}>
              {strings.product.sort}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.bottomViewButton}
            onPress={() => navigation.navigate('filterScreen',{ onSelect: this.onSelect })}
          >
            <Banner
              styles={styles.tabIcon}
              resizeMode='contain'
              source={FILTER_ICON}
            />
            <Text style={styles.bottomButtonText}>
              {strings.product.filter}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={{flex:9.3, marginBottom:1, }}>
          { this.createList() }
          <Modal
            animationType="slide"
            transparent
            visible={this.state.modalVisible}
            onRequestClose={() => {}}
          > 
            <View style={styles.modelView}>
              <View style={styles.sortHeading}>
                <Text style={styles.sortHeadingText}>
                  {strings.product.sortBy}
                </Text>
                <TouchableOpacity onPress={() => {this.setState({modalVisible:!this.state.modalVisible})}}>
                  <Image
                    style={styles.sortingCross}
                    resizeMode="contain"
                    source={REMOVE_ICON}
                  />
                </TouchableOpacity>
              </View>
              <FlatList 
                data={sorting}
                style={{ paddingVertical:10}}
                renderItem={this.renderRadioButton}
                keyExtractor={(item, index) => item + index}
                extraData={selectedValue} 
              />
            </View>
          </Modal>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  tabIcon: {
    width: 18,
    height: 12,
    marginRight:5,
    resizeMode: 'contain',
  },
  flatList: {
    flex: 1,
    marginHorizontal:'2%',
    backgroundColor:'#f2f5f8',
  },
  emptyScreenView: {
    flex:1, 
    marginBottom:1,
    justifyContent:'center',
    alignItems:'center',
  },
  sortingCross:{
    height: 20, 
    width: 20,
  },
  bottomView: {
    flex:0.7, 
    flexDirection:'row',
    backgroundColor:'#ffffff',
    elevation: 5
  },
  bottomViewButton:{
    flex:1,
    borderRightWidth:0.5 ,
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'center',
    borderRightColor:'#979797'
  },
  bottomButtonText: {
    ...Specs.fontBold,
    color:'#515867',
  },
  mainView: {
    width: '49%',
    marginHorizontal: '1%',
    marginTop: 10,
    backgroundColor:'#ffffff',
    // marginLeft:0,
    padding : 0,
    borderRadius: 4,
  },
  sortingLabel: { fontSize: 14,
    color: '#46586f', 
    ...Specs.fontRegular,
  },
  modelView:{
    height: 330,
    backgroundColor:'white',
    // backgroundColor: 'rgba(0,0,0,0.5)',
    marginTop:deviceHeight-330
  },
  sortHeading: { 
    marginTop:20, 
    marginLeft:15,
    marginRight:19, 
    flexDirection:'row', 
    justifyContent:'space-between'
  },
  sortHeadingText:{
    fontSize:16,
    color:'#373e73',
    ...Specs.fontSemibold,
  }
});
