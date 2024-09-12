

import React, { useState } from 'react';
import 
{
  StyleSheet,
  Text, 
  View,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  ImageBackground,
  ActivityIndicator
} from 'react-native';
import { strings } from 'app/src/utility/localization/Localized';
import { Specs } from 'app/src/utility/Theme';
import { OrderViewEnum } from 'app/src/utility/constant/Constants';
import moment from 'moment';
//import Loader  from 'app/src/components/loader/Loader';
import Banner from 'app/src/screens/Dashboard/Banner';

const REVIEW_RATING_BG = require('app/src/assets/images/ReviewRating/rate_order_bg.png');
const PRODUCT_PLACEHOLDER = require('app/src/assets/images/productList/placeHolder.png');


const SCREEN_WIDTH = Dimensions.get('window').width;

export default function ReviewRating(props) {
  //console.log('rescehck', props.orderList)
  // const [imageUrl, setImageUrl] = useState('');

  const handleRatingButtonPress = async (item) => {
    props.navigation.navigate('orderView', {item:item, defaultSelectedTab: OrderViewEnum.orderDetails})
  }

  const renderOrderItem = (item) =>{
    let imagePosition= 0;
    let imageViewStartPosition = (item.productdetails?.length == 1 ? (SCREEN_WIDTH / 2 - 35) : item.productdetails?.length == 2 ? (SCREEN_WIDTH / 2 - 52.5) : (SCREEN_WIDTH / 2 - 80))
    let ratingDynamicContent = item.orderModeName == 'Courier' ? 'Delivery' : 'Store Service';
    
    return(
      <View> 
        <View style={styles.orderNumberView}>
          <Text style={styles.regularText}>Order No. </Text>
          <Text style={styles.boldText}>{`#${item.customerOrderNo}`}</Text>
        </View>
        <View style={styles.orderDateView}>
          <Text style={styles.regularText}>Order Date: </Text>
          <Text style={styles.boldText}>{moment(item.createdDate).format('DD-MM-YYYY')}</Text>
        </View>
        <View style={styles.mainView}>
          <View style={{ flex: 0.8, width: Dimensions.get('window').width}}>
            <View style={{ position: 'absolute', left: imageViewStartPosition,flexDirection: 'row', height: 70}}>
              {item.productdetails?.map((item, index) => {
                index == 0 ? imagePosition = 0 : imagePosition = imagePosition + 45;
                if(index < 3){
                  return (
                    <View style={[styles.imageIconView, {left:imagePosition}]}>
                      {/* <Image
                        source={(imageUrl ? imageUrl : item.imageUrl ? {uri: item.imageUrl} : PRODUCT_PLACEHOLDER)}
                        //resizeMode={'stretch'}
                        onError={() => setImageUrl(PRODUCT_PLACEHOLDER)}
                        style={styles.imageIcon}
                      /> */}
                      <Banner
                        styles={styles.imageIcon}
                        resizeMode='contain'
                        source={(item.imageUrl ? {uri: item.imageUrl} : PRODUCT_PLACEHOLDER)}
                      />
                    </View>
                  )
                }
              })
              }
            </View>
          </View>
          <Text style={[styles.boldText, {fontSize: 22}]}>How was your Order?</Text>
          <Text style={[styles.regularText]}>{`Leave feedback about your product(s) and ${ratingDynamicContent}`}</Text> 
        </View>
        <TouchableOpacity
          style={styles.rateOrderButton}
          onPress={() => handleRatingButtonPress(item)}
        >
          <Text style={styles.buttonTextStyle}>Rate Your Order</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <ImageBackground
      source={REVIEW_RATING_BG} 
      style={styles.container}
    >
      {renderOrderItem(props.orderList[0])}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 12,
    height: 210,
    shadowColor: '#9D9D9D80',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    elevation: 3,
  },
  orderNumberView:{
    flexDirection: 'row',
    position: 'absolute',
    top: 5,
    left: 8,
    alignItems: 'baseline'
  },
  orderDateView:{
    flexDirection: 'row',
    position: 'absolute',
    top: 5,
    right: 8,
    alignItems: 'baseline'
  },
  regularText:{
    color: '#F5F5F5',
    ...Specs.fontRegular,
    fontSize: 12,
  },
  boldText:{
    color: '#fff',
    ...Specs.fontBold,
    fontSize: 13,
  },
  mainView:{
    marginTop : 25,
    marginBottom: 65,
    height : 120,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  imageIconView:{
    height: 60,
    width: 60,
    borderRadius: 30,
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderColor: 'purple',
    borderWidth :2,
    position: 'absolute',
    justifyContent: 'center',
    alignItems:'center',
    overflow: 'hidden',
    left: 0
  },
  imageIcon:{
    resizeMode: 'contain',
    height: 50,
    width: 50,
    position: 'relative',
  },
  rateOrderButton:{
    position: 'absolute',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    bottom: 10,
    height: 40,
    width: 240,   
    borderRadius: 50,
    shadowColor: '#9D9D9D80',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    elevation: 3,
    backgroundColor: '#6895d4',
  },
  buttonTextStyle: {
    ...Specs.fontMedium,
    color: 'white', 
    fontSize: 16
  },
  ratingIcon: {
    height: 18,
    width: 18,
    margin: 2,
    alignSelf: 'center'
  }
});
