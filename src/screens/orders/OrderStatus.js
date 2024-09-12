import React, { Component } from 'react'
import { View, StyleSheet, Text, Image, TouchableOpacity } from 'react-native'
import { inject, observer } from 'mobx-react'
import { get } from 'lodash'
import moment from 'moment'
// import { ExtraImages } from 'app/src/utils/ImageConst'
import { Specs } from 'app/src/utility/Theme';
import { Toast } from 'app/src/components/toast/Toast';
import autobind from 'autobind-decorator';
import OrderTracking from 'app/src/screens/orders/OrderTracking';

// const Names = {
//   pending: { title: 'Placed', desc: 'We have received your order.' },
//   payment_review: { title: 'Pending Payment', desc: 'Your order is in payment review.' },
//   holded: { title: 'Confirmed', desc: 'Your order has been confirmed.' },
//   onhold: { title: 'Confirmed', desc: 'Your order has been confirmed.' },
//   processing: { title: 'Processed', desc: 'We are preparing your order.', desc1: 'We have prepared your order.' },
//   shipment_ready: { title: 'Dispatched', desc: 'Your order is on the way.', desc1: 'Tap below to track your order.' },
//   complete: { title: 'Dispatched', desc: 'Your order is on the way.', desc1: 'Tap below to track your order.' },
//   dispatched: { title: 'Dispatched', desc: 'Your order is on the way.', desc1: 'Tap below to track your order.' },
//   delivered: { title: 'Delivered', desc: 'Enjoy your shopping!' },
//   shipped_returned: { title: 'Returned', desc: 'We are sorry, you did not like.' },
//   shipped_refunded: { title: 'Refunded', desc: 'Your Order Refunded. Continue Shopping!' },
//   closed: { title: 'Cancelled', desc: 'You order has been cancelled.' },
//   canceled: { title: 'Cancelled', desc: 'You order has been cancelled.' },
//   cancelled: { title: 'Cancelled', desc: 'You order has been cancelled.' },
//   cancelRefund: { title: 'Cancelled', desc: 'You order has been cancelled & refunded.' },
// }

const GREEN_CHECK  = require('app/src/assets/images/order/green_check.png')

@inject('cart', 'auth')
@observer
export default class OrderStatus extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isOrderTrackingVisible: false,
      courierCompanyName: '',
      docketNo: ''
    }
  }

  @autobind
  showToast(message: string, toastType: Toast.type) {
    // Add a Toast on screen.
    Toast.show(message, {
      duration: Toast.durations.SHORT,
      type: toastType,
      shadow: false,
      animation: true,
      hideOnPress: true,
      delay: 0,
    });
  }

  handleTrackingModalVisibility = async (isVisible, courierCompanyName, docketNo) => {
    if(isVisible){
      // const resStatus = await this.props.cart.fetchHolisolCourierStatus(docketNo);
      const data = {
        distributorId: this.props.auth.distributorID,
        courierPatnerName: courierCompanyName,//'XPRESSBEES'
        docketNumber: docketNo//'12969549738' 
      }
      const resCourier = await this.props.cart.courierTracking(data);
      if(resCourier.success){
        this.setState({
          courierCompanyName: courierCompanyName,
          docketNo: docketNo,
          isOrderTrackingVisible: true
        })
      }
      else{
        this.showToast(resCourier.message, Toast.type.ERROR)
      }
    }
    else{
      this.setState({
        isOrderTrackingVisible: false
      })
    }
  }

  renderTrackShipment = (item, isDispatched, shipmentDetails) => {
    if(item?.eventName?.toUpperCase() === 'INVOICED' || item?.eventName === 'Order Invoiced'){
      return(
        <View style={styles.shipmentContainer}>
          {isDispatched && (shipmentDetails.map((data, index) => {
            const keyValue = index + 0.1;
            if(data.docketNo != '' && data.courierPartner != '') {
              return (
                <TouchableOpacity 
                  style={styles.trackShipmentButton} 
                  key={keyValue}
                  onPress={() => this.handleTrackingModalVisibility(true, data.courierPartner, data.docketNo)}
                >
                  <Text style={styles.shipmentText}>{`Track Shipment ${(index + 1)}`}</Text>
                </TouchableOpacity>
              )
            }
          }))}
        </View>
      )
    }
  }

  render() {
    const { cart } = this.props
    const data = cart.orderStatusDetails;
    const orderStatusDTO = get(data, 'orderStatus', []);
    const isDispatched = get(data, 'isDispatched', false);
    const shipmentDetails = get(data, 'courierDetail', []);

    return (
      <View style={{ padding: 20}}>
        {/* {this.showStatus()} */}
        {(!cart?.isLoading && orderStatusDTO?.length > 0) ? orderStatusDTO.map((item, index) => {
          return (
            <View key={index} style={{ flexDirection: 'row' }}>
              <View style={{ width: 25 }}>
                <Image
                  source={GREEN_CHECK}
                  resizeMode='contain'
                />
                {(index >= 0 && (index + 1) < orderStatusDTO.length) ?
                  <View style={{ backgroundColor: '#7ED321', width: 4, height: 60, alignSelf: 'center' }} />
                  : null
                }
              </View>
              <View style={{ marginLeft: 20 }}>
                <View style={{ flexDirection: 'row' }}>
                  <Text style={styles.statusHeader(index >= 0)}>{`${item.eventName}`}</Text>
                  <Text style={[styles.statusTxt, {alignSelf: 'center'}]}>{` - ${moment(item.eventDate)?.format('DD MMM YYYY, hh:mm A')}`}</Text>
                </View>
                <Text style={styles.statusTxt}>{item.message}</Text>
                {this.renderTrackShipment(item, isDispatched, shipmentDetails)}
              </View>
            </View>
          )
        }) : null}
        { cart.courierTrackingDetails?.length && 
          (
            <OrderTracking 
              modalVisible={this.state.isOrderTrackingVisible}
              handleTrackingModal={(value) => this.handleTrackingModalVisibility(value)}
              trackingData={cart.courierTrackingDetails}
              courierCompanyName={this.state.courierCompanyName}
              docketNo={this.state.docketNo}
            />
          )
        }
      </View>
    )
  }

}

const styles = StyleSheet.create({
  statusHeader: (value) => ({
    color: '#373e73',
    fontSize: 13,
    ...Specs.fontRegular
  }),
  statusTxt:{
    color: '#000000',
    fontSize: 12,
    ...Specs.fontRegular,
  },
  shipmentContainer: {
    flex: 1,
    marginVertical: 5,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start'
  },
  trackShipmentButton: {
    width: 120,
    height:22,
    backgroundColor:'#ffffff',
    elevation:5,
    borderRadius: 6,
    shadowOffset: { width: 0, height: 0 },
    shadowColor: '#e1e5e6',
    shadowOpacity: 0.5,
    shadowRadius: 5,
    justifyContent: 'center'
  },
  shipmentText: {
    color: '#135BBD',
    fontSize: 12,
    ...Specs.fontSemibold,
    textAlign: 'center',
  }
})