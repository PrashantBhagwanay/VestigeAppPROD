import React, { Component } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Icon } from 'react-native-elements';
import { observer, inject } from 'mobx-react';
import { Specs } from 'app/src/utility/Theme';
import moment from 'moment';
import { strings } from 'app/src/utility/localization/Localized';
import AlertClass from 'app/src/utility/AlertClass';

const FEEDBACKICON = require('app/src/assets/images/feedbackIcon.png');


const ProspectsItem = ({item, handleMessage}) => {
  const kycStatusColor = item?.kycStatus == 1 ? '#42c28d' : '#d44633'
  const tncStatusColor = item?.tncStatus == 1 ? '#42c28d' : '#d44633'
  return(
    <View 
      style={styles.listItemContainer} 
      // accessibilityLabel="Order_Item"
      // testID="Order_Item"
    >
      <View style={styles.order}>
        <Text style={[styles.orderNo, {color:'#373e73'}]}>
          {`${strings.myProspect.prospectName} : `}
            &nbsp; 
          <Text style={[styles.orderNo]}>{item?.distributorFirstName + ' ' + item?.distributorLastName}</Text>
        </Text>
      </View>
      <View style={styles.prospectItemContainer}>
        <View style={styles.details}>
          <Text style={[styles.detailsData, styles.detailLabelLeftSide]}>{strings.myProspect.prospectId}</Text>
          <Text style={[styles.detailsData, styles.detailLabelRightSide]}>{Number(item.distributorId)}</Text>
        </View>
        <View style={styles.details}>
          <Text style={[styles.detailsData, styles.detailLabelLeftSide]}>{strings.myProspect.registeredOn}</Text>
          <Text style={[styles.detailsData, styles.detailLabelRightSide]}>
            { item.createdDate }
          </Text>
        </View>
        <View style={styles.details}>
          <Text style={[styles.detailsData, styles.detailLabelLeftSide]}>{strings.myProspect.tncStatus}</Text>
          <Text style={[styles.detailsData, styles.detailLabelRightSide, {color: tncStatusColor}]}>{item?.tncStatus == "1" ? "Approved" : "Pending"}</Text>
        </View>
        {/* <View style={styles.details}>
          <Text style={[styles.detailsData, styles.detailLabelLeftSide]}>{strings.myProspect.ekycStatus}</Text>
          <Text style={[styles.detailsData, styles.detailLabelRightSide, {color: kycStatusColor}]}>{item?.kycStatus == "1" ? "Approved" : "Pending"}</Text>
        </View> */}
        {(item?.maxSmsSent > item.smsCountSent) ?
          (
            <View style={[styles.details, {marginTop:5}]}>
              <Text onPress={() => handleMessage(item.distributorId)} style={[styles.detailsData, styles.detailLabelLeftSide, {color : '#3288c2', textDecorationLine: 'underline'}]}>{strings.myProspect.sendMessage}</Text>
              <Text style={[styles.detailsData, styles.detailLabelRightSide]}>{`${Number(item?.maxSmsSent) - Number(item?.smsCountSent)} Attempts left`}</Text>
            </View>
          ): null
        }
      </View>
    </View>
  )
}

const styles=StyleSheet.create({
  listItemContainer: {
    backgroundColor:'#fff', 
    marginBottom: 6,
    marginTop: 6,
    marginHorizontal: 10,
    paddingBottom: 12,
    borderRadius: 8,
    elevation: 15,
    shadowOffset: { width: 0, height: 0 },
    shadowColor: '#808080',
    shadowOpacity: 0.4,
    shadowRadius: 5,
  },
  order: {
    flexDirection:'row',
    justifyContent:'space-between',
    marginHorizontal:18,
    marginTop:7,
    marginBottom:10 
  },
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
  prospectItemContainer: {
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

export default ProspectsItem;