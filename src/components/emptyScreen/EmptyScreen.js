import React, { Component } from 'react';
import { StyleSheet, View, Text, Image,TouchableOpacity, Dimensions} from 'react-native';
import { VESTIGE_IMAGE } from 'app/src/utility/constant/Constants';
import { strings } from 'app/src/utility/localization/Localized';
import { Specs } from '../../utility/Theme';

const data ={
  myCart:{
    image:require('app/src/assets/images/emptyScreen/cart.png'),
    text: strings.emptyScreenMessages.cartEmptyMessage
  },
  myOrders:{
    image:require('app/src/assets/images/emptyScreen/my_orders.png'),
    text: strings.emptyScreenMessages.orderListEmpty
  },
  myVouchers:{
    image:require('app/src/assets/images/emptyScreen/voucher_icon.png'),
    text: strings.emptyScreenMessages.noVouchersMessage
  },
  notifications:{
    image:require('app/src/assets/images/emptyScreen/notification_bell_icon.png'),
    text: strings.emptyScreenMessages.noNotificationsMessage
  },
  searchResults: {
    image:require('../../assets/images/searchIcons/magnifying_glass.png'),
    text: strings.emptyScreenMessages.noResultFoundMessage
  },
  products:{
    image:require('app/src/assets/images/emptyScreen/noProductFound.png'),
    text: strings.emptyScreenMessages.noProductsFoundMessage
  },
  graph:{
    image:require('app/src/assets/images/emptyScreen/noProductFound.png'),
    text: strings.emptyScreenMessages.noDataFoundMessage
  },
  distributorCart: {
    image: VESTIGE_IMAGE.EMPTY_DISTRIBUTOR_CART,
    text: strings.emptyScreenMessages.emptyDownlineCartMessage
  },
  schemes:{
    image:require('app/src/assets/images/emptyScreen/noProductFound.png'),
    text: 'No Schemes Found'
  },
  courierDetails:{
    image:require('app/src/assets/images/emptyScreen/my_orders.png'),
    text: strings.emptyScreenMessages.noDataFoundMessage
  },
  news:{
    image:require('app/src/assets/images/searchIcons/magnifying_glass.png'),
    text: strings.emptyScreenMessages.noDataFoundMessage
  },
}

export default class EmptyScreen extends Component {

  constructor(props) {
    super(props);
    this.props = props;
    this.width = Dimensions.get('window').width;
    this.height =   Dimensions.get('window').height
  }

  shoppingIcon =()=> {
    return(
      <TouchableOpacity 
        style={styles.buttonShopping}
        onPress={()=>alert('###')}
      >
        <Text style={styles.buttonText}>Continue Shopping</Text>
      </TouchableOpacity>
    )
  }


  render(){
    const { myCart, myOrders, myVouchers, notifications, products, searchResults, distributor, graph, schemes, courierDetails, news } = this.props;
    { 
      return(
        <View style={{flex:1}}>
          {
            myCart && (
              <View style={{flex:1}}>
                <View style={styles.mainView}>
                  <Image source={data.myCart.image} />
                  <Text style={styles.text}>{data.myCart.text}</Text>
                </View>
                {this.shoppingIcon()}
              </View>
            )} 
          {
            myOrders && (
              <View style={styles.mainView}>
                <Image source={data.myOrders.image} />
                <Text style={styles.text}>{data.myOrders.text}</Text>
              </View>
            )}
          {
            myVouchers && (
              <View style={styles.mainView}>
                <Image source={data.myVouchers.image} />
                <Text style={styles.text}>{data.myVouchers.text}</Text>
              </View>
            )}
          {
            notifications && (
              <View style={styles.mainView}>
                <Image source={data.notifications.image} />
                <Text style={styles.text}>{data.notifications.text}</Text>
              </View>
            )}
          {
            searchResults && (
              <View style={styles.mainView}>
                <Image source={data.searchResults.image} />
                <Text style={styles.text}>{data.searchResults.text}</Text>
              </View>
            )}
          {
            products && (
              <View style={styles.mainView}>
                <Image source={data.products.image} />
                <Text style={styles.text}>{data.products.text}</Text>
              </View>
            )}
          {
            graph && (
              <View style={styles.mainView}>
                <Image source={data.graph.image} />
                <Text style={styles.text}>{data.graph.text}</Text>
              </View>
            )}
          {
            distributor && (
              <View style={styles.mainView}>
                <Image source={data.distributorCart.image} />
                <Text style={[styles.text, { textAlign: 'center', marginHorizontal: 20, color: '#3f4967' }]} numberOfLines={2}>{data.distributorCart.text.toUpperCase()}</Text>
              </View>
            )}
          {
            schemes && (
              <View style={styles.mainView}>
                <Image source={data.schemes.image} />
                <Text style={[styles.text, { textAlign: 'center', marginHorizontal: 20, color: '#3f4967' }]} numberOfLines={2}>{data.schemes.text.toUpperCase()}</Text>
              </View>
            )}
          {
            courierDetails && (
              <View style={styles.mainView}>
                <Image source={data.courierDetails.image} />
                <Text style={styles.text}>{data.courierDetails.text}</Text>
              </View>
            )}
          {
            news && (
              <View style={styles.mainView}>
                <Image source={data.news.image} />
                <Text style={styles.text}>{data.news.text}</Text>
              </View>
            )}
        </View>
      )
    }
  }
}  
  
const styles = StyleSheet.create({
  mainView:{
    
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text:{
    fontSize: 12,
    marginTop: 18,
    ...Specs.fontRegular
  },
  buttonShopping:{
    borderWidth:1,
    borderColor:'#00b0e9',
    alignSelf: 'center',
    borderRadius:30,
    marginBottom:29
    
  },
  buttonText:{
    color:'#00b0e9',
    fontSize: 14,
    marginHorizontal:15,
    marginTop:8,
    marginBottom:7,
    ...Specs.fontMedium
  }
  
})
