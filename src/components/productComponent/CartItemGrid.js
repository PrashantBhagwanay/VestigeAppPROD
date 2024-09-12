import React, { Component } from 'react';
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import { Card } from 'react-native-elements'

import { Specs } from 'app/src/utility/Theme';
import Banner from 'app/src/screens/Dashboard/Banner';
import { strings } from 'app/src/utility/localization/Localized';
import { priceWithCurrency, capitalizeFirstCharacter } from 'app/src/utility/Utility';
import Label from 'app/src/components/customLabel/Label';
import { observer, inject } from 'mobx-react';

// This is the static product image
const PRODUCT_PLACEHOLDER = require('app/src/assets/images/productList/placeHolder.png');
const BACKGROUND_IMAGE = require('app/src/assets/images/productList/backgroundShadow.png');

@inject('auth', 'profile', 'cart')
@observer
export default class Product extends Component {
  constructor(props){
    super(props)
    this.props=props;
  }

  onPressGrid = () => {
    const {item , navigation } = this.props;
    navigation.navigate('productDetails',{skuCode:item.skuCode, locationId:item.locationId, productId: item.productId})
  }
  
  render(){

    const {item ,mainView, navigation, updatedCountryId  } = this.props;
    const {pv, dealerPrice} = strings.product;
    return(
      <View style={mainView}>
        <TouchableOpacity onPress={() => this.onPressGrid()}>
          <View>
            <Banner
              styles={styles.backgroundShadow} 
              resizeMode="cover"
              source={BACKGROUND_IMAGE}
            />
            <View style={styles.topBarView}>
              <Label style={styles.pvContainer}>{`${item.pointValue} ${pv}`}</Label>
            </View>
            <View style={styles.itemImageView}>
              <Banner
                styles={styles.imageDesign}
                resizeMode="contain"
                source={(item.imageUrl)?{uri:item.imageUrl}:PRODUCT_PLACEHOLDER}
              />
            </View>
          </View>
          <View style={styles.archiveView}>
            <View style={{flexDirection:'row'}}>
              <Text style={styles.dataHeading}>
                {`${dealerPrice}: ${priceWithCurrency(updatedCountryId ? updatedCountryId : this.props.profile.defaultAddressCountryId,item.unitCost)}`}
              </Text>
              <Text style={styles.itemPriceText}>
                {dealerPrice}
                {' '}
                {item.unitCost}
              </Text>
            </View>
          </View>
          <Text style={[styles.dataHeading, {marginLeft:10, marginRight:25}]}>
            {`${strings.product.itemCode}: ${item.skuCode}`}
          </Text>
          <Text 
            numberOfLines={2}  
            style={styles.dataName}
          >
            {capitalizeFirstCharacter(item.title)}
          </Text>
          <Text 
            numberOfLines={2}  
            style={styles.dataName}
          >
            {` Qty: ${item.quantity}`}
          </Text>
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
    marginLeft: 10,
    marginRight: 25,
    fontSize: 12,
    color: '#6c7a87',
    width: 107,
    height: 36,
    ...Specs.fontMedium,
  },
 
  pvContainer: {
   
    marginTop: 8,
    marginRight: 8,
  },
  archiveView: {
    marginLeft: 10,
    marginRight: 8,
    width: '90%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  dataHeading: {
    fontSize: 12,
    color: '#31cab3',
    ...Specs.fontSemibold,
  },
  backgroundShadow:{
    height:118,
    width:'100%',
    position:'absolute',
    zIndex:-1,
  },   
  itemImageView:{
    flexDirection:'row',
    justifyContent:'space-around',
    marginRight:8
  },
  itemPriceText: {
    fontSize: 10,
    marginLeft:3, 
    color:'#b5b5b5',
    textDecorationLine: 'line-through',
    textDecorationStyle: 'solid',
    display:'none'
  },
  topBarView: {
    flexDirection:'row',
    width:'100%',
    justifyContent:'flex-end',
  }
});