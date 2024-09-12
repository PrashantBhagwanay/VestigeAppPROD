import React, { Component } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { inject, observer } from 'mobx-react';
import { Specs } from 'app/src/utility/Theme';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import { strings } from 'app/src/utility/localization/Localized';
import { capitalizeFirstCharacter } from 'app/src/utility/Utility';
import { Toast } from 'app/src/components/toast/Toast';
import EmptyScreen from 'app/src/components/emptyScreen/EmptyScreen';
import Banner from './Banner';

const PRODUCT_PLACEHOLDER = require('app/src/assets/images/productList/placeHolder.png');
const BACKGROUND_IMAGE = require('app/src/assets/images/productList/backgroundShadow.png');
const WISHLIST_ICON = require('app/src/assets/images/DashBoardHeader/wishlist_icon.png');
const WISHLIST_SELECTED_ICON = require('app/src/assets/images/DashBoardHeader/wishlist_red.png');

const PVRANGE = [{
  value: '0-25',
  range: '0-25'
},{
  value: '25-50',
  range: '25-50'
},{
  value: '50-100',
  range: '50-100'
},{
  value: '100+',
  range: '100-200'
}];

@inject('products', 'wishList', 'profile', 'auth')
@observer
export default class ShopByPv extends Component {
  
  static propTypes = {
    title: PropTypes.string,
    shareIcon: PropTypes.string,
    rangeBar: PropTypes.string,
    extraData: PropTypes.string
  };
  
  static defaultProps = {
    title: 'flex',
    shareIcon: 'flex',
    rangeBar: 'flex',
    extraData: undefined
  };

  constructor(props) {
    super(props);
    this.state = {
      update: false
    };
  }

  handleClick = async(value) => {
    this.props.products.updatePvRange(value)
    await this.props.products.fetchProductWidget('shopByPv', value, this.props.extraData);
  }

  async updateWishList(item, type) {
    const {wishList} = this.props;
    await this.props.wishList.updateWishList(item, type)
    if (wishList.isMessage && wishList.isMessage !== '') {
      (wishList.isUpdate) ? item.isFavourite=true : '';
      this.toast(wishList.isMessage, 'SUCCESS')
      this.setState({update: !this.state.update})
    }
  }

  createPvCart = () =>{
    const { products } = this.props;
    const { isGuestUser } = this.props.auth;
    const { shopByPv } = products.productWidget;
    var shopByPvWidget= []
    let length = shopByPv.length > 4?4:shopByPv.length
    for (let i = 0; i < length; i++) {
      shopByPvWidget.push(
        <TouchableOpacity 
          onPress={() => this.props.navigation.navigate('productDetails',{skuCode:shopByPv[i].skuCode, locationId:shopByPv[i].locationId, productId: shopByPv[i].productId })}
          style={styles.dataContainer}
          key={i.toString()}
        >
          {( get(shopByPv[i],'maxQuantity',0) < 1)?
            (
              <View style={styles.barContainer2}>
                <Text style={styles.textStyle}>
                  {strings.product.outOfStock}
                </Text>
              </View>
            )
            : <View />}
          <Banner
            styles={styles.backgroundShadow} 
            resizeMode='cover'
            source={BACKGROUND_IMAGE}
          />
          <View style={styles.itemImageView}>
            <View />
            <Banner
              styles={styles.imageDesign}
              resizeMode='contain'
              source={(shopByPv[i].imageUrl) ? {uri:shopByPv[i].imageUrl} : PRODUCT_PLACEHOLDER}
            />
            {!isGuestUser && (this.props.profile.countryId == 1 || this.props.profile.wishlist_icon == true) &&
            <TouchableOpacity
              onPress={() => this.updateWishList(shopByPv[i], 'add')}
              style={{ alignSelf: 'flex-end',}}
            >
              <Banner
                styles={styles.favouriteIcon}
                resizeMode="contain"
                source={(shopByPv[i].isFavourite) ? WISHLIST_SELECTED_ICON : WISHLIST_ICON}
              />
            </TouchableOpacity>
            }
          </View>
          <Text style={[styles.dataHeading,{marginTop:18}]}>{`${Number.parseFloat(get(shopByPv[i],'associatedPv',0)).toFixed(2)} PV`}</Text>
          <Text style={styles.dataHeading}>{`${strings.product.itemCode}: ${shopByPv[i].skuCode}`}</Text>
          <Text style={styles.dataName} numberOfLines={2}>{capitalizeFirstCharacter(shopByPv[i].productName)}</Text>
        </TouchableOpacity>
      );
    }
    return shopByPvWidget;

  }
  
  toast(message){
    Toast.show(message, {
      duration: Toast.durations.SHORT,
      position: Toast.positions.TOP,
      type: Toast.type.SUCCESS,
      shadow: false,
      animation: true,
      hideOnPress: true,
      delay: 0,
    });
  }
  
  render() {
    const { title, rangeBar, navigation, products } = this.props;
    return (
      <View style={styles.mainView}>
        <View style={styles.headingView}>
          <Text style={styles.heading}>{title}</Text>
        </View>
        <View style={[styles.pvRangeview, { display: rangeBar }]}>
          {
            PVRANGE.map((data, key) => (
              <View 
                style={styles.rowView} 
                key={key.toString()} 
                pointerEvents={(products.isLoading) ? 'none' : 'auto'}
              >
                <Text
                  style={[styles.rangeTextSelected ,(products.keyValue === data.range) ? {color:'#ffffff',backgroundColor:'#6ab9ec'} : {color:'#606588', backgroundColor:'#9aadb8'}]}
                  onPress={() => { this.handleClick(data.range)}}
                  // accessibilityLabel={data}
                  // testID={data}
                >
                  {data.value}
                </Text>
              </View>
            ))
          }
        </View>
        {(products.isLoading) ? (
          <View style={{height:280, justifyContent:'center'}}>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        ) : 
          ((products.productWidget.shopByPv && products.productWidget.shopByPv.length > 0)?
            (
              <View>
                <View style={styles.productList}>
                  {this.createPvCart()}
                </View>
                <TouchableOpacity
                  style={styles.buttonContainer}
                  onPress={() => navigation.navigate('productList', {type:'shopByPv', title:'Shop By PV', param: products.keyValue, extraData: this.props.extraData})}
                >
                  <Text style={styles.buttonTextColor}>{strings.dashboard.viewMore}</Text>
                </TouchableOpacity>
              </View>
            ):
            (
              <View style={{marginVertical:15}}>
                <EmptyScreen products /> 
              </View>
            ))}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  mainView: {
    backgroundColor: '#ffffff',
    marginTop: 12,
  },
  headingView: {
    marginTop: 12,
    marginHorizontal: 15,
    flexDirection: 'row',
  },
  heading: {
    ...Specs.fontSemibold,
    fontSize: 18,
    color: '#373e73',
  },
  pvRangeview: {
    flexDirection: 'row',
    marginVertical: 16,
    flex:1,
    alignItems:'center',
    justifyContent: 'space-evenly' 
  },
  rangeTextSelected: {
    ...Specs.fontMedium,
    backgroundColor: '#6ab9ec',
    fontSize: 16,
    color: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 3,
    textAlign: 'center',
    borderRadius: 12.5,
    overflow:'hidden'
  },
  productList: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginHorizontal: 16,
  },
  dataContainer: {
    width: '48%',
    height: 210,
    backgroundColor: '#ffffff',
    marginTop: 8,
    marginBottom: 10,
    paddingLeft: 10,
    borderRadius: 4,
    elevation: 15,
    shadowOffset: { width: 0, height: 0 },
    shadowColor: '#808080',
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  imageDesign: {
    alignSelf: 'center',
    marginTop: 13,
    height: 94,
    width: 70,
  },
  dataHeading: {
    fontSize: 14,
    marginLeft: 10,
    color: '#14aa93',
    ...Specs.fontSemibold
  },
  dataName: {
    marginTop: 1,
    marginHorizontal: 10,
    fontSize: 12,
    color: '#6c7a87',
    ...Specs.fontMedium,
  },
  itemImageView:{
    flexDirection:'row',
    justifyContent:'space-evenly',
    marginRight:8
  },
  backgroundShadow:{
    height:118,
    width:'100%',
    position:'absolute',
    zIndex:-1,
  },
  favouriteIcon: { 
    height: 15, 
    width: 15,
  },
  buttonContainer: {
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: 50,
    marginTop: 10,
    marginBottom: 18,
    marginLeft: 114,
    marginRight: 111,
    width: 110,
    height: 32,
    borderColor: '#9aadb8',
    borderWidth: 1,
    justifyContent: 'center',
  },
  buttonTextColor: {
    color: '#9aadb8',
  },
  rowView: {
    flexDirection: 'row',
    alignItems:'center'
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
});