import React, { Component } from 'react';
import { View, Text, ScrollView,TouchableOpacity, StyleSheet, Image, Modal, Linking } from 'react-native';
import { Specs } from 'app/src/utility/Theme';
import PropTypes from 'prop-types';
import { CategoryTypeEnum, OfferTypeEnum } from 'app/src/utility/constant/Constants';
import { strings } from 'app/src/utility/localization/Localized';
import { trackEvent } from 'app/src/utility/AnalyticsUtils';
import Loader  from 'app/src/components/loader/Loader';
import { observer, inject } from 'mobx-react';
import { CONSISTENCY_BUTTON_PRESS, 
  MYFUND_BUTTON_PRESS, 
  MYNETWORK_BUTTON_PRESS,
  MYVOUCHER_BUTTON_PRESS,
  MYBONUS_BUTTON_PRESS,
  MYTRAINING_BUTTON_PRESS,
  MYGROUPPV_BUTTON_PRESSED,
  VIEW_MORE_CATEGORIES_BUTTON_PRESS,
  CATEGORY_ICON_PRESSED,
  ORDER_BUTTON_PRESSED
} from 'app/src/utility/GAEventConstants';
import AlertClass from 'app/src/utility/AlertClass';

const PRODUCT_PLACEHOLDER = require('app/src/assets/images/productList/placeHolder.png');
const AR_IMAGES = require('app/src/assets/images/arImages.png');

const PRODUCT_PLACEHOLDER_NEPAL = require('app/src/assets/images/productList/placeHolder_nepal.png');

@inject('cart','profile')
@observer
export default class Category extends Component<any, any> {

  static Props = {
    title: PropTypes.string,
    type: PropTypes.string,
    data: PropTypes.array 
  };

  constructor(props) {
    super(props);
    this.props = props;
    this.state={
      modalVisible:false,
      showLoader: false
    }
  }

  notification = (count) => {
    if(!count || count==0) {
      return null
    } 
    else{
      return (
        <View style={styles.notificationView}>
          <Text style={styles.notificationText}>
            {count}
          </Text>
        </View>
      )
    }
  }

  viewMoreClickHandle = () => {
    // trackEvent(VIEW_MORE_CATEGORIES_BUTTON_PRESS.eventCategory, VIEW_MORE_CATEGORIES_BUTTON_PRESS.events.NAVIGATE);
    this.props.navigation.navigate('categoryList');
  }

  itemClickHandle = async(item) => {
    const { type } = this.props;
    const { navigation } = this.props;
    if (type === CategoryTypeEnum.Offer) {
      if(item.name === OfferTypeEnum.VestigeAr){
        Linking.openURL('https://play.google.com/store/apps/details?id=com.vestige.ar');
      }else if(item.name === OfferTypeEnum.MyConsistency){
        // trackEvent(CONSISTENCY_BUTTON_PRESS.eventCategory, CONSISTENCY_BUTTON_PRESS.events.NAVIGATE);
        // navigation.navigate('consistancy', { showConsistencyData: true });
        navigation.navigate('dynamicScreen', { showConsistencyData: true });
      }
      else if(item.name === OfferTypeEnum.MyLevel){
        // navigation.navigate('mylevel');
      }
      else if(item.name === OfferTypeEnum.MyNetwork){
        // trackEvent(MYNETWORK_BUTTON_PRESS.eventCategory, MYNETWORK_BUTTON_PRESS.events.NAVIGATE);
        // navigation.navigate('myNetwork');
        navigation.navigate('myNetwork',{'countryId':this.props.profile.countryId});
      }
      else if(item.name === OfferTypeEnum.OrderLog){
        // trackEvent(MYNETWORK_BUTTON_PRESS.eventCategory, MYNETWORK_BUTTON_PRESS.events.NAVIGATE);
        navigation.navigate('orderLog');
      }
      else if(item.name === OfferTypeEnum.MyFund){
        // trackEvent(MYFUND_BUTTON_PRESS.eventCategory, MYFUND_BUTTON_PRESS.events.NAVIGATE);
        navigation.navigate('myFunds');
      }
      else if(item.name === OfferTypeEnum.MyVoucher){
        // trackEvent(MYVOUCHER_BUTTON_PRESS.eventCategory, MYVOUCHER_BUTTON_PRESS.events.NAVIGATE);
        navigation.navigate('myVoucher');
      }
      // else if(item.name === OfferTypeEnum.MyBonus){
      //   navigation.navigate('myBonus');
      // }
      else if(item.name === OfferTypeEnum.MyBonus){
        // trackEvent(MYBONUS_BUTTON_PRESS.eventCategory, MYBONUS_BUTTON_PRESS.events.NAVIGATE);
        navigation.navigate('myBonus');
      }
      else if(item.name === OfferTypeEnum.MyGroupPV){
        // trackEvent(MYGROUPPV_BUTTON_PRESSED.eventCategory, MYGROUPPV_BUTTON_PRESSED.events.NAVIGATE);
        navigation.navigate('groupPvGraph',{type:'groupPv'});
      }
      else if(item.name === OfferTypeEnum.MyTraining){
        // trackEvent(MYTRAINING_BUTTON_PRESS.eventCategory, MYTRAINING_BUTTON_PRESS.events.NAVIGATE);
        navigation.navigate('myTrainingScreen', {isTraining: false});
      }
      else if(item.name === OfferTypeEnum.Orders){
        // trackEvent(ORDER_BUTTON_PRESSED.eventCategory, ORDER_BUTTON_PRESSED.events.NAVIGATE);
        navigation.navigate('orders');
      }
      else if(item.name === OfferTypeEnum.DynamicScreen){
        navigation.navigate('dynamicScreen', { showConsistencyData: false, isDynamicScreen: true });
      } 
      else if(item.name === OfferTypeEnum.RepeatOrder){
        this.setState({
          showLoader: true
        })
        await this.props.cart.fetchOrdersList();
        this.setState({
          showLoader: false
        })
        const { getLastTenOrders } = this.props.cart
        if(getLastTenOrders && getLastTenOrders.length){
          // this.navigateToAddressListing('repeatOrder')
          navigation.navigate('repeatOrder');
        }
        else {
          AlertClass.showAlert('Message', 
            'No Order Placed till yet.', 
            [{text: strings.viewCartScreen.alertButtonTextOk, onPress: () => console.log('OK Pressed')}])
        }
      }
    }
    else if (type === CategoryTypeEnum.ShopByCategory) {
      // trackEvent(CATEGORY_ICON_PRESSED.eventCategory, `${'Navigated to '}${item.name}${' Product Listing'}`);
      navigation.navigate('productList',{type:'categoryList', param: item.categoryId, title: item.name});
    }
    else if (type === CategoryTypeEnum.CategoryStoreFront) {
      // trackEvent(CATEGORY_ICON_PRESSED.eventCategory, `${'Navigated to '}${item.name}${' Store Front'}`);
      navigation.navigate('storeFront', {data: item});
    }
  }

  renderItem = (item, index) => {
    const image = item.imageUrl ? {uri:item.imageUrl} :  item.name==="Vestige AR" ? AR_IMAGES: item.avatar
    return (
      <TouchableOpacity
        onPress={() => this.itemClickHandle(item)}
        style={[styles.imageContainer]} 
        key={index}
        accessibilityLabel={'Navigate to'+item.name+'Screen'}
        testID={'Navigate to'+item.name+'Screen'}
      >
        {item.notification ? this.notification(item.notification) : null}
        <Image 
          style={styles.imageStyle}
          resizeMode='contain'
          // source={(image) ? image : PRODUCT_PLACEHOLDER}
          source={(image)?image:(this.props.profile.countryId != 2 ? 
           PRODUCT_PLACEHOLDER : PRODUCT_PLACEHOLDER_NEPAL)}
        />
   
        <Text style={styles.containerText}>
        {(item.name == "My Network" && this.props.profile.countryId == 2) ? "My Team" : (item.name != "My Network") ? item.name : item.name}
        </Text>
      
      </TouchableOpacity>
    );
  }

  render() {
    const {  title, data } = this.props;
    return(
      <View style={styles.mainView}>
        <Loader loading={this.state.showLoader} />
        { title && (
          <View style={styles.titleView}> 
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={() => this.viewMoreClickHandle()}>
              <Text style={styles.viewMoreText}>{strings.dashboard.viewMore}</Text>
            </TouchableOpacity>
          </View>
        )} 
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.scrollView}
          keyboardShouldPersistTaps='always'
        >
          {data.map(this.renderItem)}
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  mainView: {
    backgroundColor: '#ffffff',
    borderRadius: 5,
    marginTop: 10,
  },
  titleView: {
    flexDirection: 'row',
    marginTop: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    ...Specs.fontSemibold,
    marginLeft: 15,
    fontSize: 18,
    color: '#373e73',
    fontWeight: 'bold',
  },
  viewMoreText: {
    marginRight: 15,
    fontSize: 12,
    color: '#000000',
  },
  scrollView: {
    paddingVertical: 22 , 
  },
  imageContainer: {
    width: 96,
    height: 80,
    backgroundColor: '#ffffff',
    marginHorizontal:8,
    borderRadius: 4,
    elevation: 8,
    shadowOffset: { width: 0, height: 10 },
    shadowColor: '#808080',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    marginVertical:3
  },
  imageStyle: {
    marginTop: 15,
    height: 27,
    width: 29,
    marginBottom: 5,
    alignSelf: 'center',
  },
  containerText: {
    ...Specs.fontMedium,
    fontSize: 12,
    textAlign: 'center',
    alignSelf: 'center',
  },
  notificationView: {
    marginTop: -10,
    width: 20,
    height: 20,
    backgroundColor: '#f22a5c',
    borderRadius: 2,
    position: 'absolute',
    marginLeft: 75
  },
  notificationText: {
    fontSize: 10,
    marginTop: 2,
    color: '#ffffff',
    alignSelf: 'center',
  },
});