import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-elements';
import { Specs } from 'app/src/utility/Theme';
import AlertClass from 'app/src/utility/AlertClass';
import { priceWithCurrency } from 'app/src/utility/Utility';
import { getTaxableString } from '../../utility/Utility';

export const OrderLogItem = ({ orderItem, cancelOrder, navigation, payForLog, isApiV2Enabled, submitTransactionDetails }) => {
  const [isCollapsible, setCollapsible] = useState(false);
  /**
   * @description this will return order mode name as per the value from api.
   * @param item order/log details
   */
  const fetchorderMode = (item) => {
    if (item.orderMode == '1' || item.orderMode == '3') {
      return 'Store Pickup';
    }
    return 'Home Delivery';
  };

  /**
   * @description this will return final location name of the placed order.
   * @param item order/log details
   */
  const fetchLocation = (item) => {
    if (isApiV2Enabled) {
      if (item.orderMode == '3' && item.baseStore) {
        return item.baseStore;
      }
      return item.locationName;
    }
    return item.locationName;
  };

  const handlePayButtonValidation = (obj, isMiUserCashActive) => {
    if (obj.status?.toUpperCase() === 'CONFIRMED' && obj.paidOrder?.toUpperCase() === 'UNPAID' && obj.orderPaymentType?.toUpperCase() === 'ONLINE') {
      return true;
    }
    if (obj.status?.toUpperCase() === 'CONFIRMED' && obj.paidOrder?.toUpperCase() === 'UNPAID' && isMiUserCashActive) {
      return true;
    }
    return false;
  };


  /** @description This method will render button based on country for payment, details submission etc. */
  const showPayButton = (item) => {
    const logNo = item.logNumber;
    const isMiUserCashActive = item?.[logNo]?.some?.(obj => obj.isMiUserCashActive);
    const isShowPayButton = item?.[logNo]?.some?.(obj => handlePayButtonValidation(obj, isMiUserCashActive));
    const isShowUpdatePayment = item?.[logNo]?.some?.(obj => obj.isSubmitReferenceNo === 1);
    const logCountryId = item?.[logNo]?.[0]?.countryId;

    if ((logCountryId === 1 || logCountryId === 4) && isShowPayButton) {
      return (
        <TouchableOpacity
          style={[styles.buttonContainer, { borderRadius: 15, backgroundColor: '#58cdb4', paddingHorizontal: 20 }]}
          // onPress={() => alert('In Progress')}
          onPress={() => payForLog(item)}
        >
          <Text style={styles.buttonText}>Pay</Text>
        </TouchableOpacity>
      );
    }
    if ((logCountryId === 25|| logCountryId === 26) && isShowUpdatePayment) {
      return (
        // <TouchableOpacity
        //   style={[ styles.buttonContainer, { borderRadius: 15, backgroundColor: '#fff', paddingHorizontal: 15 }]}
        //   // onPress={() => alert('In Progress')}
        //   onPress={() => submitTransactionDetails()}
        // >
        <Text
          onPress={() => submitTransactionDetails(item)}
          style={{ ...Specs.fontBold, fontSize: 14, color: '#58cdb4', textDecorationLine: 'underline' }}
        >
          Update Payment
        </Text>
        // </TouchableOpacity>
      );
    }
    return null;
  };

  const getDescriptionView = (item) => {
    const orderList = item.logNumber;
    return (
      item[orderList] && item[orderList].map((item, index, array) => {
        return (
          <View 
            key={index} 
            style={[styles.orderItem, {...(index !== array.length - 1) && {borderBottomWidth: 1, borderBottomColor: '#c8c9d359'}}]}
          >
            <View style={styles.networkDistributorDetails}>
              <Text style={styles.textHeading}>Order No</Text>
              <Text style={styles.text}>{item.customerOrderNo}</Text>
            </View>
            <View style={styles.networkDistributorDetails}>
              <Text style={styles.textHeading}>Status</Text>
              <Text style={styles.text}>{item.status}</Text>
            </View>
            <View style={styles.networkDistributorDetails}>
              <Text style={styles.textHeading}>Distributor ID</Text>
              <Text style={styles.text}>{item.distributorId}</Text>
            </View>
            <View style={styles.networkDistributorDetails}>
              <Text style={styles.textHeading}>Payment Method</Text>
              <Text style={styles.text}>{item.orderPaymentType}</Text>
            </View>
            <View style={styles.networkDistributorDetails}>
              <Text style={styles.textHeading}>Order Mode</Text>
              <Text style={styles.text}>{fetchorderMode(item)}</Text>
            </View>
            <View style={styles.networkDistributorDetails}>
              <Text style={styles.textHeading}>Amount {getTaxableString(item.countryId)}</Text>
              <Text style={styles.text}>{`${priceWithCurrency(item.countryId, item.paymentAmount)}`}</Text>
            </View>
            <View style={styles.networkDistributorDetails}>
              <Text style={styles.textHeading}>Distributor Name</Text>
              <Text style={[styles.text, { flex: 1, textAlign: 'right' }]}>{item.distributorName}</Text>
            </View>
            <View style={styles.networkDistributorDetails}>
              <Text style={styles.textHeading}>Date</Text>
              <Text style={styles.text}>{item.date}</Text>
            </View>
            <View style={styles.networkDistributorDetails}>
              <Text style={styles.textHeading}>Country</Text>
              <Text style={styles.text}>{item.countryName}</Text>
            </View>
            <View style={styles.networkDistributorDetails}>
              <Text style={styles.textHeading}>Catering Branch</Text>
              <Text style={[styles.text, { flex: 1, textAlign: 'right' }]}>{fetchLocation(item)}</Text>
            </View>
            <View style={styles.networkDistributorDetails}>
              <Text style={[styles.textHeading, { width: '50%' }]} numberOfLines={2}>Catering Contact No.</Text>
              <Text style={styles.text}>{item.mobileNo}</Text>
            </View>
            <View style={{ paddingVertical: 22, flexDirection: 'row', justifyContent: 'space-evenly' , alignItems: 'center' }}>
              {
                item.status == 'Confirmed' && (item.paidOrder === 'Unpaid' || item.paidOrder === '0') ? (
                  <TouchableOpacity
                    style={[ styles.buttonContainer, { backgroundColor: '#6598d3'}]}
                    onPress={() => {
                      AlertClass.showAlert('Warning', 'Are you sure you want to cancel order?', [
                        {
                          text: 'No',
                          onPress: () => {
                            console.log('Ok')
                          }
                        },
                        {
                          text: 'Yes',
                          onPress: () => {
                            cancelOrder(item)
                          }
                        }
                      ])
                    }}
                  >
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                ) : null
              }
              <TouchableOpacity
                style={[styles.buttonContainer, { backgroundColor: '#58cdb4' }]}
                onPress={()=> navigation.navigate('orderLogDetails', { item: item, isOrderLogItem: true})}
                // onPress={() => toggleOrderDetails()}
              >
                <Text style={styles.buttonText}>Order Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        )
      })
    )
  }

  const showArrowIcon = () => {
    return (
      <Icon
        name={isCollapsible ? 'arrow-up' : 'arrow-down'}
        type="simple-line-icon"
        color="black"
        size={16}
      />
    );
  };

  const orderList = (item) => {
    const logValue = item.logNumber;
    if (item[logValue].length) {
      const countryId =  item[logValue][0]?.countryId;
      const logAdd = item[logValue][0].logAddress;
      let mAddress = '';
      if (countryId == 4) {
        const removePincode = logAdd.replace(/\d{6}/, '')
        const removeHyphen = removePincode.replace(/-/g, "");
        mAddress = `LOG ADDRESS - ${removeHyphen}`;
      } else {
        mAddress = `LOG ADDRESS - ${logAdd}`;
      }
      
      return mAddress;
    }
    return '';
  };

  return (
    <React.Fragment>
      <View style={[styles.textView, styles.cellView ]}>
        <View style={[styles.titleView, {alignItems: 'center'}]}>
          <Text style={[styles.pvTargetValueText, {marginBottom: 0}]}>
            {orderItem.logNumber}
          </Text>
          {showPayButton(orderItem)}
        </View>
        <View>
          <Text style={[styles.pvTargetValueText, { fontSize: 12, marginTop: 2, color: '#515867' }]}>
            {orderList(orderItem)}
          </Text>
        </View>
        {isCollapsible && getDescriptionView(orderItem)}
      </View>
      <TouchableOpacity
        onPress={() =>{ setCollapsible(!isCollapsible) }}
        style={styles.accordionArrow}
      >
        {showArrowIcon()}
      </TouchableOpacity>
    </React.Fragment>
  );
};

const styles = StyleSheet.create({
  cellView: {
    zIndex: -1,
    paddingBottom: 22,
    paddingTop: 12,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginTop: 8,
    borderRadius: 5,
    elevation: 2,
    shadowOffset: { width: 0, height: 4 },
    shadowColor: '#80c2c6cf',
    shadowOpacity: 0.2,
  },
  orderItem: {
    marginTop: 20,
    // marginBottom: 5
  },
  textView: {
    flex: 1,
    // marginLeft: 30,
    // marginRight: 8,
    // marginTop: 11,
    backgroundColor: '#fff'
  },
  titleView: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  accordionArrow: {
    elevation: 3,
    shadowOffset: { width: 2, height: 4 },
    shadowColor: '#80646464',
    shadowOpacity: 0.2,
    zIndex: 1, 
    alignSelf:'center', 
    justifyContent:'center', 
    top: -15, 
    backgroundColor: '#fff', 
    width: 30, 
    height: 30, 
    borderRadius: 50
  },
  networkDistributorDetails: {
    flexDirection:'row', 
    flex:1, 
    justifyContent: 'space-between', 
  },
  textHeading: {
    ...Specs.fontRegular,
    fontSize: 14,
    color: '#6c7a87',
    marginRight: 10
  },
  text: {
    ...Specs.fontMedium,
    fontSize: 14,
    color: '#6c7a87',
  },
  pvTargetValueText: {
    color: '#f5a623',
    ...Specs.fontMedium,
    fontSize: 16,
    marginBottom: 7
  },
  buttonContainer : {
    paddingVertical: 7, 
    paddingHorizontal: 25, 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderRadius: 30
  },
  buttonText: {
    ...Specs.fontMedium,
    color: 'white', 
    fontSize: 16
  },
});
export default OrderLogItem