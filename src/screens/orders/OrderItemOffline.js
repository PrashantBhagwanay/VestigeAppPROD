import React from 'react';
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import moment from 'moment';
import { Specs } from 'app/src/utility/Theme';
import { strings } from 'app/src/utility/localization/Localized';
import { priceWithCurrency } from 'app/src/utility/Utility';
import { OrderViewEnum } from 'app/src/utility/constant/Constants';
import Banner from 'app/src/screens/Dashboard/Banner';
import { getTaxableString } from '../../utility/Utility';
const COLORED_RATING_ICON = require('app/src/assets/images/coloured_Star.png');

const OrderItemOffline = ({ countryId, item, distributorID, navigation, isApiV2Enabled }) => {
  // console.log(distributorID)
  // console.log(JSON.stringify(item.customerOrderNo));
  if (item) {
    const color = item.StatusName?.toUpperCase() === 'CANCELLED' ? {color:'#d0021b'} : {color:'#31cab3'};
    return (
      <View
        style={styles.listItemContainer}
        accessibilityLabel="Order_Item"
        testID="Order_Item"
      >
        <View style={styles.order}>
          <Text style={[styles.orderNo, {color:'#373e73'}]}>
            {`${strings.order.orderDetails.orderNo} : `}
             &nbsp;
            <Text style={[styles.orderNo, color]}>{item.CustomerOrderNo}</Text>
          </Text>
          <TouchableOpacity onPress={()=> {

                var data= {
                  'customerOrderNo':item.CustomerOrderNo,
                  'paymentAmount':item.PaymentAmount,
                  'invoiceNo':item.InvoiceNo,
                  'totalUnits':item.TotalUnits,
                  'distributorAddress':item.DistributorAddress,
                  'statusName':item.StatusName,
                  'countryId':item.CountryId,
                  'countryName':item.countryName,
                  'orderModeName':item.OrderModeName,
                  'distributorName':item.DistributorName,
                  'distributorId':item.DistributorId,
                  'mobileNo':item.MobileNo,
                  'locationCode':item.LocationCode,
                }

               navigation.navigate('orderView', { item: data , defaultSelectedTab: item?.countryId == 4 ? OrderViewEnum.orderDetails : OrderViewEnum.orderStatus})}
          }
          >
            <Text style={styles.viewDetails}>View Details</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.orderItemContainer}>
          <View style={styles.details}>
            <Text style={[styles.detailsData, styles.detailLabelLeftSide]}>{strings.order.orderDetails.shopFor}</Text>
            <Text style={[styles.detailsData, styles.detailLabelRightSide]}>{item.DistributorId}</Text>
          </View>
          <View style={styles.details}>
            <Text style={[styles.detailsData, styles.detailLabelLeftSide]}>{strings.order.orderDetails.itemNo}</Text>
            <Text style={[styles.detailsData, styles.detailLabelRightSide]}>{Number(item.TotalUnits).toFixed(0)}</Text>
          </View>
          <View style={styles.details}>
            <Text style={[styles.detailsData, styles.detailLabelLeftSide]}>{strings.order.orderDetails.countryLabel}</Text>
            <Text style={[styles.detailsData, styles.detailLabelRightSide]}>{item.countryName}</Text>
          </View>
          <View style={styles.details}>
            <Text style={[styles.detailsData, styles.detailLabelLeftSide]}>{strings.order.orderDetails.orderDate}</Text>
            <Text style={[styles.detailsData, styles.detailLabelRightSide]}>
              { moment(item.CreatedDate).format(isApiV2Enabled ? 'DD/MM/YYYY h:mm A' : 'DD-MM-YYYY h:mm A') }
            </Text>
          </View>
          <View style={styles.details}>
            <Text style={[styles.detailsData, styles.detailLabelLeftSide]}>{strings.order.orderDetails.orderStatus}</Text>
            <Text style={[styles.detailsData, styles.detailLabelRightSide]}>{item.StatusName}</Text>
          </View>
          <View style={styles.details}>
            <Text style={[styles.detailsData, styles.detailLabelLeftSide]}>{strings.order.orderDetails.orderTotal} {getTaxableString(item.countryId)}</Text>
            <Text style={[styles.detailsData, styles.detailLabelRightSide]}>{priceWithCurrency(item.countryId, item.PaymentAmount)} </Text>
          </View>

          {item.otp!=undefined && item.otp!="" &&(
       
          <View style={styles.details}>
          <Text style={[styles.detailsData, styles.detailLabelLeftSide]}>{strings.order.orderDetails.OTP}</Text>
          <Text style={[styles.detailsData, styles.detailLabelRightSide,{color:'#d0021b'}]}>{`Your OTP is ${item.otp}`}</Text>
         </View>
          )}
        
          { ((item.statusName?.toUpperCase() === 'DELIVERED' && item.isRating == true) && (distributorID == item.distributorId))
            ?
            (
              <View style={styles.ratingStatus}>
                <Text style={[styles.ratingStatusText, {color: '#349e4d', marginBottom : 0}]}>
                  {strings.order.orderDetails.orderAlreadyRated}
                  {item.averageRating}
                </Text>
                <Banner
                  styles={[styles.ratingIcon]}
                  resizeMode="contain"
                  source={COLORED_RATING_ICON}
                />
              </View>
            )
            : null
          }
        </View>
      </View>
    )
  }
  else 
    return null;
}

const styles=StyleSheet.create({
  orderNo: {
    ...Specs.fontMedium,
    fontSize: 14,
  },
  viewDetails: {
    ...Specs.fontMedium,
    color:'#b1becb',
    fontSize: 12,
    textDecorationLine: 'underline'
  },
  orderItemContainer: {
    marginLeft:18
  },
  details: {
    flexDirection:'row',
    justifyContent:'space-between',
  },
  detailsData: {
    ...Specs.fontMedium,
    fontSize:12,
    marginBottom:4,
    color:'#6c7a87'
  },
  order: {
    flexDirection:'row',
    justifyContent:'space-between',
    marginHorizontal:18,
    marginTop:7,
    marginBottom:13 
  },
  listItemContainer: {
    backgroundColor:'#fff', 
    marginBottom: 10,
    paddingBottom: 12
  },
  detailLabelLeftSide: {
    flex:0.3
  },
  detailLabelRightSide: {
    flex: 0.7
  },
  ratingStatus: {
    flexDirection:'row',
    justifyContent: 'flex-end',
    alignItems : 'center',
    alignContent: 'center',
    paddingRight : 10,
    backgroundColor: 'white',
    paddingVertical: 2,
  },
  ratingStatusText: {
    ...Specs.fontMedium,
    fontSize:12,
    color:'#6c7a87'
  },
  ratingIcon: {
    height: 15,
    width: 15,
    marginHorizontal: 2,
    alignSelf: 'baseline'
  }
})

export default OrderItemOffline;