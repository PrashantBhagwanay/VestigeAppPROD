/**
 * @description AddToCart scrren 
 */
import React, { Component } from 'react';
import {
  View,
  Modal,
  Text,
  Image,
  Alert,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Platform,
  StyleSheet,
  Dimensions,
  FlatList
} from 'react-native';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import autobind from 'autobind-decorator';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { CustomButton } from 'app/src/components/buttons/Button';
import Stepper from 'app/src/components/buttons/Stepper';
import Banner from 'app/src/screens/Dashboard/Banner';
import Label from 'app/src/components/customLabel/Label';
import { Specs } from 'app/src/utility/Theme';
import { strings } from 'app/src/utility/localization/Localized';
import AlertClass from 'app/src/utility/AlertClass';
import Icon from 'react-native-vector-icons/Ionicons';
import { VESTIGE_IMAGE } from 'app/src/utility/constant/Constants';
import Loader from 'app/src/components/loader/Loader';
import { isIphoneXorAbove, showToast, priceWithCurrency, capitalizeFirstCharacter, connectedToInternet } from 'app/src/utility/Utility';

const PLACEHOLDER = require('app/src/assets/images/productList/placeHolder.png');

@inject('auth', 'cart', 'profile')
@observer
export default class SuggestiveCart extends Component{
    
  static propTypes = {
    modalVisible: PropTypes.bool,
  };
      
  static defaultProps = {
    modalVisible: false,
  };

  constructor(props){
    super(props);
    this.props = props;
  }

  handleProceed = async () => {
    await this.props.addProductToCart();
  }

  renderHeader = () =>{
    return(
      <View>
        <View style={{paddingVertical:10, paddingHorizontal:5}}>
          <Text style={{...Specs.fontBold, fontSize:20, color:'#373E73', textAlign:'center'}}>Are you sure to proceed?</Text>
          <Text style={styles.infoText}>{`The Courier delivery from this location can take upto 3-4 additional working days.\n\nPlease verify the cart status below before adding this product to cart.`}</Text>
        </View>
        <View style={styles.cartStatus}>
          <Text 
            numberOfLines={3} 
            style={[styles.cartStatusText, { width: '98%' }]}
          >
            {`Your updated`}
            <Text style={[styles.cartStatusText, {...Specs.fontBold}]}>{` Cart Status`}</Text>
            {`\non the new catering location:\n`}
            <Text style={[styles.cartStatusText, {...Specs.fontBold}]}>{`${this.props.profile.fetchWarehouseCatering?.locationName} - ${this.props.profile.fetchWarehouseCatering?.locationCode}`}</Text>
          </Text>
          <View style={{backgroundColor:'#707070', margin: 5, height:0.8}} />
          <View style={{flexDirection:'row', paddingHorizontal:5}}>
            <View style={{flex: 1}}>
              <Text numberOfLines={1} style={styles.itemText}>{strings.viewCartScreen.totalEarnedPv}</Text>
              <Text numberOfLines={1} style={styles.totalText}>{Math.abs(this.props.cart.totalPoints).toFixed(2)}</Text>
            </View>
            <View style={{flex: 1}}>
              <Text numberOfLines={1} style={styles.itemText}>{strings.viewCartScreen.totalAmountToBePaid}</Text>
              <Text numberOfLines={1} style={styles.totalText}>{priceWithCurrency(this.props.profile.defaultAddressCountryId,this.props.cart.totalPrice)}</Text>
            </View>
          </View>
        </View>
      </View>
    )
  }

  @autobind
  renderItem(product, index) {
    let isProductOutOfInventory = false;
    if (this.props.cart.noInventoryProducts) {
      isProductOutOfInventory = this.props.cart.noInventoryProducts.includes(product.skuCode);
    }
    return (
      <TouchableOpacity
        style={[styles.borderBottom]}
        disabled
        onPress={() => console.log('disabled')}
        // key={product.skuCode}
      >
        <View 
          pointerEvents='none' 
          style={[{marginVertical:10, flexDirection: 'row'}]}
        >
          <Banner
            styles={[styles.productImage]}
            resizeMode="contain"
            source={product.productImageUrl ? { uri: product.productImageUrl } : product.imageUrl ? { uri: product.imageUrl } : PLACEHOLDER}
          />
          <View style={[styles.productDetailContainer]}>
            <Label>{`${product.pointValue || 0} PV`}</Label>
            <Text numberOfLines={2} style={[styles.productTitle]}>{capitalizeFirstCharacter(product.title || product.productName)}</Text>
            <Text style={styles.productPrice}>
              {`${strings.productDetails.dealerPrice}: ${priceWithCurrency(this.props.profile.defaultAddressCountryId, product.unitCost)}`}
              {/* {reviewCart ? <Text style={styles.productPrice}>{`     Quantity: ${product.quantity}`}</Text> : null} */}
            </Text>
            {/* {(gift) ? <Text style={[styles.productTitle, { color: '#6c7a87' }]}>{`${strings.productDetails.quantityHeading}: ${product.quantity}`}</Text> : null} */}
            <Text style={[styles.itemName,styles.price,{marginTop:5}]}>
              {'Item Code: '}
              <Text style={styles.price}>
                {product?.skuCode}
              </Text>
            </Text>
          </View>
          <View style={styles.productQuantityContainer}>
            <View>
              <Stepper
                isDelete
                style={{ marginVertical: 8, width: 75 }}
                isDisabled
                getQuantity={(value) => { console.log('resvalue', value) }}
                availableQuantity={product.maxQuantity}
                //maxLimitReached={this.toast}
                onDeletePress={() => null}
                addOrRemoveProduct={(type) => null}
              >
                {product.quantity}
              </Stepper>
            </View>
            {(isProductOutOfInventory) ?
              (
                <View>
                  <Text style={[styles.price, {color:'red', fontSize:13}]}>Out of Stock</Text>
                </View>
              )
              : null
            }
          </View>
        </View>
      </TouchableOpacity>
    )
  }
   
  render(){
    const {
      modalVisible,
      handleModal
    } = this.props;
    const { selectingCarts } = this.props.cart;
    return(
      <Modal
        animationType="fade"
        transparent
        visible={modalVisible}
        onRequestClose={() => null}
      >
        <View style={styles.mainContainer}>
          <View style={[styles.containerInfo, Platform.OS === 'ios' ? styles.containerInfoIos : styles.containerInfoAndroid]}>
            <Loader loading={this.props.cart.isLoading} />
            <View style={{flex:1, backgroundColor:'#EC9346', justifyContent:'center',alignItems:'center', paddingHorizontal: 15}}>
              <MaterialCommunityIcons 
                name='help-circle-outline' 
                size={45} 
                color='#fff'
              />
            </View>
            <View style={{flex:7.7, backgroundColor:'#fff', paddingHorizontal: 15}}>
              <FlatList
                accessibilityLabel="Suggestive_Cart_List"
                testID="Suggestive_Cart_List"
                data={this.props.cart.refreshCartInfo[0]?.cartProducts}
                renderItem={({item, index})=> this.renderItem(item)}
                ListHeaderComponent={this.renderHeader()}
                // ListFooterComponent={this.renderFooter(this.props.cart.totalPrice)}
                extraData={this.props.cart.cartInfo}
                keyExtractor={(_, index) => index.toString()}
              />
            </View>
            <View style={{flex:1.3, flexDirection:'row', justifyContent:'space-evenly', backgroundColor:'#F0EFF4', paddingHorizontal: 15}}>
              <CustomButton
                buttonContainer={[styles.button, {backgroundColor: '#15AA94'}]}
                //disabled={}
                handleClick={async () => handleModal(false)}
                buttonTitle='CANCEL'
                // linearGradient
                //primaryColor="#15AA94"
                // secondaryColor="#15AA94"
                buttonTitleStyle={styles.customButtonTitleStyle}
              />
              <CustomButton
                buttonContainer={[styles.button, {backgroundColor: '#6797D4'}]}
                //disabled={}
                handleClick={async () => this.handleProceed()}
                buttonTitle='PROCEED' 
                // linearGradient
                // primaryColor="#6797D4"
                // secondaryColor="#6797D4"
                buttonTitleStyle={styles.customButtonTitleStyle}
              />
            </View>
          </View> 
        </View>
      </Modal>
    )
  }
}
 
const styles = StyleSheet.create({
  mainContainer:{
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00000040',
  },
  containerInfo: {
    width: Dimensions.get('window').width - 40,
    height: Dimensions.get('window').height - (isIphoneXorAbove() ? 230 : 165),
    backgroundColor: 'white',
    borderRadius: 6,
    overflow:'hidden'
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
  customButtonTitleStyle: {
    fontSize: 18,
    ...Specs.fontSemibold,
    alignSelf: 'center',
    color:'#fff',
  },
  button: {
    height: 40,
    // width: '90%',
    alignSelf: 'center',
    alignItems:  'center',
    justifyContent: 'center',
    backgroundColor: '#4DA1CC',
    // marginBottom: 10,
    paddingHorizontal: 25,
    // paddingVertical: 10,
    borderRadius:5
  },
  cartStatus:{
    backgroundColor:'#F0EFF4',
    padding:5,
    borderRadius:5,
  },
  cartStatusText:{
    textAlign: 'center',
    ...Specs.fontRegular,
    fontSize: 15,
    color: '#373E73',
  },
  infoText: {
    ...Specs.fontRegular, 
    fontSize:12, 
    color:'#373E73', 
    textAlign:'center'
  },
  borderBottom: {
    borderBottomWidth: 0.5,
    borderColor: '#c8c9d359',
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
  productTitle: {
    ...Specs.fontMedium,
    fontSize: 12,
    lineHeight: 18,
    color: '#6c7a87',
    // color: 'red',
    marginVertical: 4,
    marginRight: 10,
  },
  productPrice: {
    flexDirection: 'row',
    ...Specs.fontSemibold,
    color: '#14aa93',
    fontSize: 12,
    lineHeight: 18,
  },
  itemName: {
    color: '#6c7a87',
    fontSize: 12,
    ...Specs.fontMedium
  },
  itemText: {
    ...Specs.fontRegular,
    fontSize: 13,
    color: '#46586f',
    marginTop: 5,
  },
  totalText: {
    ...Specs.fontSemibold,
    fontSize: 18,
    color: '#14aa93',
    marginTop: 5,
    marginBottom: 5,
  },
  productQuantityContainer: {
    alignItems: 'center',
    flexDirection: 'column',
    marginRight: 15,
  },
  price:{
    justifyContent: 'flex-end',
    color:'#31cab3',
    ...Specs.fontSemibold,
  },
});