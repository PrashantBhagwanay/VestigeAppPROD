import React, { Component } from 'react';

import {
  View,
  Image,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Platform,
  Linking,
  TextInput,
  KeyboardAvoidingView,
  Keyboard
} from 'react-native';
import { Specs } from 'app/src/utility/Theme';
import { observer, inject } from 'mobx-react';
import { isIphoneXorAbove, showToast, priceWithCurrency, capitalizeFirstCharacter, connectedToInternet } from 'app/src/utility/Utility';
import { strings } from 'app/src/utility/localization/Localized';
import Banner from 'app/src/screens/Dashboard/Banner';
import Label from 'app/src/components/customLabel/Label';
import Stepper from 'app/src/components/buttons/Stepper';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AlertClass from 'app/src/utility/AlertClass';
import { Icon } from 'react-native-elements'
import { CommonActions } from '@react-navigation/native';
import { VESTIGE_IMAGE } from '../../utility/constant/Constants';

const deviceWidth = (Dimensions.get('window').width)
const CLOSE_IMAGE = require('app/src/assets/images/DashBoardHeader/close.png');
const PLACEHOLDER = require('app/src/assets/images/productList/placeHolder.png');
const PRODUCT_PLACEHOLDER = require('app/src/assets/images/productList/placeHolder.png');


@inject('cart','profile')
@observer
export default class RepeatOrderProducts extends Component {

  constructor(props) {
    super(props)
    this.state = {
      searchInputValue: '',
      searchedProductList: [],
      productList: [],
      keyboardSpace:0
    }
    this.timeout =  0;
    Keyboard.addListener('keyboardDidShow',(frames)=>{
      if (!frames.endCoordinates) return;
      this.setState({keyboardSpace: frames.endCoordinates.height});
    });
    Keyboard.addListener('keyboardDidHide',(frames)=>{
      this.setState({keyboardSpace:0});
    });
  }

removeProduct = (product) => {
  // console.log(this.state.productList)
  AlertClass.showAlert(strings.cartListProduct.alertMessageHeading, 
    strings.cartListProduct.removeItem, [
      {text: strings.commonMessages.ok, onPress: () => {
        let productList = this.state.productList;
        const index = productList.findIndex((item) => item.skuCode === product.skuCode)
        productList.splice(index, 1);
        this.setState({ productList })
      }},
      {text: strings.commonMessages.cancel, onPress: () => {}}
    ]);
}

addOrSubtractProduct = (product, value) => {
  console.log(product, this.state.productList)
  const productList = this.state.productList;
  const index = productList.findIndex((item) => item.skuCode === product.skuCode)
  productList[index].quantity =  productList[index].quantity + value
  this.setState({ productList})
}

cartProduct = (product) => {
  // const {navigation} = this.props;
  // let isProductOutOfInventory = false;
  // if(this.props.cart.noInventoryProducts) {
  //   isProductOutOfInventory =  this.props.cart.noInventoryProducts.includes(product.skuCode);
  // }
  return (
    <TouchableOpacity 
      style={[styles.cart, styles.borderBottom]} 
      key={product.skuCode}
      activeOpacity={1}
    >
      <Banner
        styles={styles.productImage} 
        resizeMode="contain"
        source={product.imageUrl ? {uri: product.imageUrl} : PLACEHOLDER}
      />
      <View style={styles.productDetailContainer}>
        {/* <Label>{`${product.pointValue || 0} PV`}</Label> */}
        {/* <Text numberOfLines={2} style={[styles.productTitle, {color: isProductOutOfInventory ? 'red': '#6c7a87' } ]}>{capitalizeFirstCharacter(product.title || product.productName)}</Text> */}
        <Text numberOfLines={2} style={styles.productTitle}>{capitalizeFirstCharacter(product.productName)}</Text>
        <Text style={styles.productPrice}>{`${strings.productDetails.dealerPrice}: ${priceWithCurrency(this.props.item?.countryId, product.unitCost)}`}</Text>
        <Text style={styles.productPrice}>{`Item Code: ${product.skuCode}`}</Text>
        {/* {(gift) ? <Text style={[styles.productTitle, {color:'#6c7a87'} ]}>{`${strings.productDetails.quantityHeading}: ${product.quantity}`}</Text> : null } */}
      </View>
      <View style={styles.productQuantityContainer}>
        <Stepper 
          isDelete 
          style={{marginVertical: 8, width: 75}} 
          // isDisabled={gift} 
          getQuantity={(value)=>{console.log(value)}}
          // availableQuantity={product.maxQuantity}
          // maxLimitReached={this.toast}
          onDeletePress={()=> this.removeProduct(product)}
          addOrRemoveProduct={(val) => this.addOrSubtractProduct(product, val)}
        >
          {product.quantity}
        </Stepper>
        
        {(product.quantity === 1) ? null : (
          <TouchableOpacity 
            style={{paddingVertical: 10, paddingHorizontal: 8}}
            onPress={()=>this.removeProduct(product)}
          >
            <FontAwesome name='trash-o' size={18} color='#ff5040' />    
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>   
  )
}

renderModalHeader = () => {
  return (
    <View>
      <View style={{flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingVertical: 10}}>
        <View style={styles.headerInfo}>
          <Text style={styles.headingText}>Order Details</Text>
        </View>
        <TouchableOpacity 
          style={{ marginRight: 10, borderWidth: 0.3, borderRadius: 50, justifyContent: 'center', alignItems: 'center', padding: 2}} 
          onPress={() =>{ 
            this.setState({ searchedProductList: [] })
            this.props.closeProductsModal()
          }}
        >
          <Image
            style={styles.closeButton}
            source={CLOSE_IMAGE}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    </View>
  )
} 

checkout = async() => {
  if(this.state.productList.length) {
    console.log(this.state.productList)
    const data = {
      ...this.props.item,
      distributorId: this.props.cart.shopForObjectInfo.distributorID,
      cartName: this.props.cart.shopForObjectInfo.cartTitle
    }
    const permittedValues = this.state.productList.map(product => {
      return {quantity: product.quantity, skuCode: product.skuCode, isPromo: product.isPromo}
    });
    console.log(data, permittedValues)
    const res = await this.props.cart.repeatOrder(data, permittedValues)
    if(res.status === 'success') {
      console.log(this.props.route.params)
      return AlertClass.showAlert(strings.order.orderDetails.successTitle, strings.order.orderDetails.orderAddedToCart,
        [{text: 'Add More', onPress: () => console.log('No Pressed')}, 
          {text: strings.commonMessages.yes,  onPress: () => {
            // this.props.navigation.navigate('MyCart')
            this.props.closeProductsModal()
            if(this.props.route.params && this.props.route.params.defaultShoppingMode) {
              this.props.navigation.dispatch(CommonActions.reset({
                index: 0,
                actions: [
                  CommonActions.navigate({ name: 'Shopping'})
                ]
              }))
              this.props.navigation.dispatch(CommonActions.navigate({
                name: 'MyCart'
              }));
            }
            else {
              // this.props.navigation.dispatch(CommonActions.reset({
              //   index: 0,
              //   actions: [
              //     CommonActions.navigate({ name: 'viewCart'})
              //   ],
              //   // key: null
              // }))
              // const resetAction = CommonActions.reset({
              //   index: 0,
              //   key: null, // THIS LINE
              //   actions: [
              //     CommonActions.navigate({ name: 'MyCart'})
              //   ],
              // })
              this.props.navigation.popToTop()
              this.props.navigation.navigate('MyCart')
            }
          }}]
      )
    }
    else {
      alert(res.message)
    }
  }
  else {
    alert('Please add some products.')
  }
}

renderBottomButtons = () => {
  return (
    <View style={{ flexDirection: 'row', paddingHorizontal: 10, justifyContent: 'center', paddingBottom: 20}}>
      {/* <TouchableOpacity
        style={[styles.buttonView, { backgroundColor: '#6598d3' }]}
        onPress={() => {
          this.setState({ searchedProductList: [] })  
          this.props.closeProductsModal()
        }}
      >
        <Text style={styles.textStyle}>Cancel</Text>
      </TouchableOpacity> */}
      <TouchableOpacity
        style={[styles.buttonView, { backgroundColor: '#6598d3' }]}
        onPress={() => this.checkout()}
      >
        <Text style={styles.textStyle}>Add To Cart</Text>
      </TouchableOpacity>
    </View>
  )
}

searchProducts = async(value) => {
  this.setState({ searchInputValue: value })
  if(value.trim().length>2) {
    if(this.timeout) clearTimeout(this.timeout);
    this.timeout = setTimeout(async() => {
      const res = await this.props.cart.searchProducts(value)
      if(res.success) {
        this.setState({ searchedProductList: res.data }, ()=>{ if(!this.state.searchInputValue.trim()) { this.setState({ searchedProductList: [] }) } })
      }
      else {
        showToast(res.message)
      }
    }, 500);
  } 
  else {
    this.setState({ searchedProductList: [] })
  }
}

onAddItemPress = (item, index) => {
  console.log(this.state.productList, item)
  let searchedList = this.state.searchedProductList;
  searchedList[index].checked = true;
  // this.setState({
  //   searchedProductList: searchedList
  // })
  this.setState({
    searchedProductList: [],
    searchInputValue: ''
  })
  const isSearchedItemInProductListIndex = this.state.productList.findIndex( (product) => product.skuCode === item.skuCode)
  if(isSearchedItemInProductListIndex != -1) {
    const productList = this.state.productList;
    productList[isSearchedItemInProductListIndex].quantity = productList[isSearchedItemInProductListIndex].quantity + 1;
    this.setState ({ productList:  productList})
  }
  else {
    const addItemToProductList = {
      'quantity': 1,
      'skuCode': item.skuCode,
      'imageUrl': item.imageUrl,
      // 'isPromo': 'NO',
      'productName': item.productName,
      'discountPrice': item.unitCost
    }
    this.setState({ productList: [  addItemToProductList, ...this.state.productList] })
  }
}

searchItem = (item, index) => {
  return(
    <TouchableOpacity 
      style={[styles.cart, styles.borderBottom]} 
      activeOpacity={1}
      key={item.skuCode}
    >
      <Banner
        styles={styles.productImage} 
        resizeMode="contain"
        source={item.imageUrl ? {uri: item.imageUrl} : PRODUCT_PLACEHOLDER}
      />
      <View style={styles.productDetailContainer}>
        <Label>{`${item.associatedPv} PV`}</Label>
        {/* <Text numberOfLines={2} style={[styles.productTitle, {color: isProductOutOfInventory ? 'red': '#6c7a87' } ]}>{capitalizeFirstCharacter(product.title || product.productName)}</Text> */}
        <Text numberOfLines={2} style={styles.productTitle}>{capitalizeFirstCharacter(item.productName.split(' ').slice(0, 4).join(' '))}</Text>
        <Text style={styles.productPrice}>{`${strings.productDetails.dealerPrice}: ${priceWithCurrency(this.props.profile.defaultAddressCountryId, item.unitCost)}`}</Text>
        <Text style={styles.productPrice}>{`Item Code: ${item.skuCode}`}</Text>
        {/* {(gift) ? <Text style={[styles.productTitle, {color:'#6c7a87'} ]}>{`${strings.productDetails.quantityHeading}: ${product.quantity}`}</Text> : null } */}
      </View>
      <View style={{ justifyContent: 'center'}}>
        {
          item.checked ? (
            <TouchableOpacity 
              style={[styles.addItem, {backgroundColor: '#a6c3e7'}]}
              disabled
              // onPress={()=> this.onAddItemPress(item)}
            >
              <Text style={styles.addItemText}>Added</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.addItem}
              onPress={()=> this.onAddItemPress(item, index)}
            >
              <Text style={styles.addItemText}>Add Item</Text>
            </TouchableOpacity>
          )
        }
       
      </View>
    </TouchableOpacity>
  )
}

UNSAFE_componentWillReceiveProps(nextProps) {
  if (nextProps.productList !== this.props.productList) {
    this.setState({ productList: nextProps.productList });
  }
}

render () {
  const { isVisible, closeProductsModal} = this.props;
  const { searchedProductList, searchInputValue, productList } = this.state;
  console.log('checkitem', this.props.item)
  return (
    <Modal 
      animationType="slide" 
      visible={isVisible} 
      transparent 
      onRequestClose={() =>{ 
        this.setState({ searchedProductList: [] })
        closeProductsModal()
      }}
    >
      <View style={styles.mainContainerInfo}>
        <View style={[styles.containerInfo, { marginTop: this.state.keyboardSpace ? 90 : 0},  Platform.OS === 'ios' ? styles.containerInfoIos : styles.containerInfoAndroid]}>
          {this.renderModalHeader()}
          <View style={styles.searchBarContainer}>
            <View style={{ flexDirection: 'row', flex: 1}}>
              <TextInput
                value={searchInputValue}
                placeholder="Add More Items"
                placeholderTextColor='gray'
                underlineColorAndroid='transparent'
                style={styles.searchCartInputContainer}
                onChangeText={value => this.searchProducts(value)}
              />
              <Icon
                name='ios-search'
                type='ionicon'
                color='#3f5886'
                size={18}
                iconStyle={{ position: 'absolute', right: deviceWidth- 90 }}
              />
            </View>
            {
              searchInputValue.trim() ? (
                <TouchableOpacity 
                  onPress={()=> this.setState({ searchInputValue: '', searchedProductList: [] })}
                  style={{ position: 'absolute', right: 16, top: 4}}
                >
                  <Text style={styles.clearText}>Clear</Text>
                </TouchableOpacity>
              )  : null
            }
          </View>
          {
            searchedProductList.length ? (
              <FlatList
                keyExtractor={(item, index) => index.toString()}
                data={searchedProductList}
                extraData={this.state}
                renderItem={({item, index}) => this.searchItem(item, index)}
                keyboardShouldPersistTaps='handled'
              />
            ) : (
              <FlatList
                keyExtractor={(item, index) => index.toString()}
                data={productList}
                extraData={this.state}
                renderItem={({item}) => this.cartProduct(item)}
                keyboardShouldPersistTaps='handled'
              />
            )
          }
          {this.renderBottomButtons()}
        </View>
      </View>
    </Modal>
  );
}
}

/**
 * @description: This is the Popup modal stylesheet
 */
const styles = StyleSheet.create({
  buttonView: {
    backgroundColor: '#1b9c81',
    borderRadius: 50,
    paddingHorizontal: 10,
    // marginTop: 14,
    marginBottom: 2,
    height: 40,
    justifyContent: 'center',
    width: '94%'
  },
  mainContainerInfo: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00000040',
  },
  containerInfo: {
    width: Dimensions.get('window').width - 50,
    height: Dimensions.get('window').height - (isIphoneXorAbove() ? 250 : 185),
    backgroundColor: 'white',
    borderRadius: 4,
  },
  containerInfoAndroid: {
    elevation: 15,
  },
  containerInfoIos: {
    shadowOffset: { width: 0, height: 0 },
    shadowColor: '#e1e5e6',
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  headerInfo: {
    paddingLeft: 15,
    // paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headingText: {
    color: '#3f5886',
    fontSize: 20,
    ...Specs.fontBold, 
    textAlign:'center',
  },
  closeButton: {
    width: 25,
    height: 25,
  },
  cart: {
    flexDirection: 'row',
    marginTop: 12.9,
    paddingBottom: 10,
  },
  borderBottom: {
    borderBottomWidth: 5,
    borderBottomColor: '#c8c9d359',
  },
  productImage: {
    width: 60,
    height: 79,
    alignItems: 'flex-start',
    marginLeft: 15,
    marginRight: 10,
  },
  productDetailContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  productQuantityContainer: {
    alignItems: 'center',
    // justifyContent: 'center',
    flexDirection: 'column',
    marginRight: 15,
    // backgroundColor: 'red'
  },
  productPrice: {
    flexDirection: 'row',
    ...Specs.fontSemibold,
    color: '#14aa93',
    fontSize: 12,
    lineHeight: 18,
  },
  textStyle: {
    ...Specs.fontMedium,
    color: 'white', 
    fontSize: 16,
    textAlign: 'center'
  },
  searchCartInputContainer: {
    height: 40,
    fontSize: 14,
    color: '#a6a8b8',
    paddingLeft: 40,
    backgroundColor: '#fff',
    paddingRight: 18,
    flex: 1,
    marginHorizontal: 10,
    borderRadius: 30,
    shadowOffset: { width: 0, height: 3 },
    shadowColor: '#a6a8b8',
    shadowOpacity: 1,
  },
  clearText: {
    color: '#14aa93', 
    fontSize: 16, 
    padding: 10
  },
  addItem: {
    paddingHorizontal: 10,
    paddingVertical: 5, 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderRadius: 30,
    backgroundColor: '#6598d3', 
    marginRight: 10
    // marginHorizontal: 10
  },
  addItemText: {
    ...Specs.fontRegular,
    color: 'white', 
    fontSize: 12,
    paddingHorizontal: 5,
    // borderWidth: 1,
    // width: '100%',
    textAlign: 'center'
  },
  searchBarContainer: {
    borderWidth: 1, 
    borderColor: '#e6e6e6', 
    flexDirection: 'row', 
    paddingVertical: 7,
    backgroundColor: '#ebeaef',
    justifyContent: 'center'
  }
});
