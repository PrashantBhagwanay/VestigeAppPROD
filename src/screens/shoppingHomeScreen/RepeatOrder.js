import React, { Component } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { observer, inject } from 'mobx-react';
import Label from 'app/src/components/customLabel/Label';
import moment from 'moment';
import { observable, makeObservable } from 'mobx';
import { Specs } from 'app/src/utility/Theme';
import { CommonActions } from '@react-navigation/native';
import Banner from 'app/src/screens/Dashboard/Banner'
import { connectedToInternet, showToast, priceWithCurrency } from 'app/src/utility/Utility';
import HeaderLeftIcons from 'app/src/components/navigation/HeaderLeftIcons';
import { UserRole } from 'app/src/utility/constant/Constants';
import AlertClass from 'app/src/utility/AlertClass';
import OfflineNotice from 'app/src/components/OfflineNotice';
import autobind from 'autobind-decorator';
import { get } from 'lodash';
import Loader  from 'app/src/components/loader/Loader';
import { strings } from 'app/src/utility/localization/Localized';
import HeaderRightIcons from 'app/src/components/navigation/HeaderRightIcons';
import { Icon } from 'react-native-elements'
import RepeatOrderProducts from './RepeatOrderProducts';
import { Header } from '../../components';


const REORDER_BANNER = require('app/src/assets/images/Banner/Reorder-Banner.png')

@inject('cart','auth','profile')
@observer

export default class RepeatOrder extends Component {

  @observable isInternetConnected: Boolean = true;
  @observable isLoading = false;

  constructor(props) {
    super(props);
    makeObservable(this);
    this.state = {
      isProductModalVisible: false,
      repeatOrderObject: null
    }
  }

  // async getLastTenOrders() {
  //   this.setState({
  //     isOrdersListLoading: true
  //   })
  //   await this.props.cart.fetchOrdersList(true);
  //   this.setState({
  //     isOrdersListLoading: false
  //   })
  // }

  async componentDidMount() {
    this.isInternetConnected = await connectedToInternet();
    if(this.isInternetConnected) {
      // this.getLastTenOrders()
    }
  }

  @autobind
  async networkStatus(status) {
    if(status) {
      this.isInternetConnected = status;
      // this.getLastTenOrders()
    }
  }

  onPressRepeatLastOrder = async() => {
    const res = await this.props.cart.repeatLastPurchase()
    if (res.success) {
      return AlertClass.showAlert(strings.order.orderDetails.successTitle, strings.order.orderDetails.orderAddedToCart,
        [{text: strings.commonMessages.no, onPress: () => console.log('No Pressed')}, 
          {text: strings.commonMessages.yes,  onPress: () => {
            if(this.props.route.params && this.props.route.params.defaultShoppingMode) {
              this.props.navigation.dispatch(CommonActions.reset({
                index: 0,
                actions: [
                  CommonActions.navigate({ name: 'Shopping'})
                ]
              }))
              this.props.navigation.dispatch(CommonActions.navigate({
                name: 'MyCart'
              }));
            }
            else {
              this.props.navigation.dispatch(CommonActions.reset({
                index: 0,
                actions: [
                  CommonActions.navigate({ name: 'MyCart'})
                ]
              }))
            }
            // this.props.navigation.dispatch(CommonActions.reset({
            //   index: 0,
            //   actions: [
            //     CommonActions.navigate({ name: 'Shopping'})
            //   ]
            // }))
          }}]
      )
    }
    else {
      showToast(res.message)
    }
  }

  // // Send item
  // repeatOrder = async(item) => {
  //   const data = {
  //     ...item,
  //     distributorId: this.props.cart.shopForObjectInfo.distributorID,
  //     cartName: this.props.cart.shopForObjectInfo.cartTitle
  //   }
  //   const res = await this.props.cart.repeatOrder(data)
  //   if(res.status === 'success') {
  //     return AlertClass.showAlert(strings.order.orderDetails.successTitle, 'Product Added to Cart. Do you wish to continue shopping?',
  //       [{text: strings.commonMessages.no, onPress: () => console.log('No Pressed')}, 
  //         {text: strings.commonMessages.yes,  onPress: () => {
  //           // this.props.navigation.navigate('MyCart')
  //           this.props.navigation.dispatch(CommonActions.reset({
  //             index: 0,
  //             actions: [
  //               CommonActions.navigate({ name: 'Shopping'})
  //             ]
  //           }))
  //         }}]
  //     )
  //   }
  //   return showToast(res.message)
  // }


  showProducts = async(item) => {
    this.isLoading=true
    const isApiV2 = item?.orderCreatedBy === 'Web_V2';
    const res = await this.props.cart.getOrderDetails(item.customerOrderNo, '', '', isApiV2)
    this.isLoading=false
    if(res) {
      this.setState({
        isProductModalVisible: true,
        repeatOrderObject: item
      })
    }
    else {
      showToast('Some error occured fetching order details.')
    }
  }

  renderItem = (item) => {
    return(
      <View 
        style={styles.listItemContainer} 
        accessibilityLabel="Order_Item"
        testID="Order_Item"
      >
        <View style={styles.order}>
          <Text style={[styles.orderNo, {color:'#373e73'}]}>
            {`${strings.order.orderDetails.orderNo} : `}
             &nbsp; 
            <Text style={[styles.orderNo]}>{item.customerOrderNo}</Text>
          </Text>
          <Label>{`${Number.parseFloat(get(item,'totalPV',0)).toFixed(2)} PV`}</Label>
        </View>
        <View style={styles.orderItemContainer}>
          <View style={styles.details}>
            <Text style={[styles.detailsData, styles.detailLabelLeftSide]}>Order Mode</Text>
            <Text style={[styles.detailsData, styles.detailLabelRightSide]}>{item.orderModeName === 'Self' ? 'Store-Pickup' : 'Courier'}</Text>
          </View>
          <View style={styles.details}>
            <Text style={[styles.detailsData, styles.detailLabelLeftSide]}>{strings.order.orderDetails.distId}</Text>
            <Text style={[styles.detailsData, styles.detailLabelRightSide]}>{item.distributorId}</Text>
          </View>
          <View style={styles.details}>
            <Text style={[styles.detailsData, styles.detailLabelLeftSide]}>{strings.order.orderDetails.distName}</Text>
            <Text style={[styles.detailsData, styles.detailLabelRightSide]}>{item.distributorName}</Text>
          </View>
          <View style={styles.details}>
            <Text style={[styles.detailsData, styles.detailLabelLeftSide]}>{strings.order.orderDetails.itemNo}</Text>
            <Text style={[styles.detailsData, styles.detailLabelRightSide]}>{Number(item.totalUnits).toFixed(0)}</Text>
          </View>
          <View style={styles.details}>
            <Text style={[styles.detailsData, styles.detailLabelLeftSide]}>{strings.order.orderDetails.orderDate}</Text>
            <Text style={[styles.detailsData, styles.detailLabelRightSide]}>
              { moment(item.createdDate).format('DD-MM-YYYY h:mm A') }
            </Text>
          </View>
          <View style={styles.details}>
            <Text style={[styles.detailsData, styles.detailLabelLeftSide]}>{strings.order.orderDetails.orderStatus}</Text>
            <Text style={[styles.detailsData, styles.detailLabelRightSide]}>{item.statusName}</Text>
          </View>
          <View style={styles.details}>
            <Text style={[styles.detailsData, styles.detailLabelLeftSide]}>{strings.order.orderDetails.orderTotal}</Text>
            <Text style={[styles.detailsData, styles.detailLabelRightSide]}>{priceWithCurrency(item.countryId, item.paymentAmount)}</Text>
          </View>
        </View>
        <View style={{ position: 'absolute', right: 0, bottom: 0 }}>
         {item.countryId == 4 ? null : 
          <TouchableOpacity
          style={[ styles.buttonContainer, { backgroundColor: '#6598d3'}]}
          onPress={() => this.showProducts(item)}
          activeOpacity={0.6}
        >
          <Icon
            name='repeat'
            type='feather'
            color='#fff'
            size={18}
            iconStyle={{marginRight: 5}}
          />
          <Text style={styles.buttonText}>
            ReOrder
          </Text>
        </TouchableOpacity>
        }
        </View>
      </View> 
    )
  }

  // skipRepeatOrder = () => {
  //   if(this.props.route.params) {
  //     var {defaultShoppingMode} = this.props.route.params
  //   }
  //   if(defaultShoppingMode) {
  //     this.props.navigation.dispatch(CommonActions.reset({
  //       index: 0,
  //       actions: [
  //         CommonActions.navigate({ name: 'Shopping'})
  //       ]
  //     }))
  //   }
  //   else {
  //     this.props.navigation.pop(3)
  //   }
  // }

  renderFooterComponent = () => {
    return (
      <View style={{ flexDirection: 'row', paddingHorizontal: 10, justifyContent: 'center'}}>
        <TouchableOpacity
          style={[styles.buttonView, { backgroundColor: '#6598d3' }]}
          accessibilityLabel="Repeat_Last_Purchase"
          testID="Repeat_Last_Purchase"
          onPress={() => {
            AlertClass.showAlert(strings.order.orderDetails.repeatAlertHeading, 
              strings.shoppingHomeScreen.repeatOrderMessage, 
              [{text: strings.commonMessages.no, onPress: () => console.log('No Pressed')}, 
                {text: strings.commonMessages.yes,  onPress: () => this.onPressRepeatLastOrder()}])
          }}
        >
          <Text style={styles.textStyle}>Repeat Last Purchase</Text>
        </TouchableOpacity>
      </View>
    )
  }

  renderHeaderRight = () => {
    return (
      <HeaderRightIcons
        defaultShoppingMode={this.props.route.params && this.props.route.params.defaultShoppingMode}
        //skipToShopping
        navigation={this.props.navigation} 
      />
    )
  }

  render() {
    const { getLastTenOrders } = this.props.cart;
    const isGuestUser = this.props.auth.userRole === UserRole.GuestUser;
    const { isProductModalVisible } = this.state;
    return (
      <View style={{ flex: 1}}>
        { !this.isInternetConnected && <OfflineNotice networkStatus={(status) => this.networkStatus(status)} /> }
        <Loader loading={this.isLoading} />
        <Header
          navigation={this.props.navigation}
          screenTitle={'ReOrder'}
          rightComponent={this.renderHeaderRight()}
        />
        <RepeatOrderProducts 
          {...this.props}
          isVisible={isProductModalVisible}
          closeProductsModal={()=> this.setState({ isProductModalVisible: false })}
          productList={this.props.cart.repeatOrderProductsWithRespectToCartModel}
          item={this.state.repeatOrderObject}
        />
        <FlatList
          data={getLastTenOrders}
          ListHeaderComponent={() => (
            <View>
              <Banner
                styles={styles.bannerView}
                resizeMode='cover'
                source={REORDER_BANNER}
              />
              <View style={{ flexDirection: 'row', marginTop: 10, marginBottom: 10}}>
                <Text style={styles.headingText}>Last Few Purchases</Text>
              </View>
            </View>
          )}
          keyExtractor={(item, index) => item + index}
          renderItem={({ item }) => this.renderItem(item)}
        />
        {/* { this.renderFooterComponent() } */}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  buttonView: {
    backgroundColor: '#1b9c81',
    borderRadius: 50,
    paddingHorizontal: 20,
    marginBottom: 10,
    height: 40,
    justifyContent: 'center',
    width: '95%'
  },
  textStyle: {
    ...Specs.fontBold,
    color: 'white', 
    fontSize: 14,
    textAlign: 'center'
  },
  headingText: {
    color: '#3f5886',
    fontSize: 20,
    ...Specs.fontBold, 
    textAlign:'center',
    paddingBottom: 5,
    paddingLeft: 15
  },
  orderNo: {
    ...Specs.fontMedium,
    fontSize: 14,
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
    marginBottom: 5,
    paddingBottom: 12,
    paddingTop: 8
  },
  detailLabelLeftSide: {
    flex:0.3
  },
  detailLabelRightSide: {
    flex: 0.7
  },
  buttonContainer : {
    paddingVertical: 8, 
    paddingHorizontal: 28, 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderTopLeftRadius: 12,
    flexDirection: 'row',
  },
  buttonText: {
    ...Specs.fontRegular,
    color: 'white', 
    fontSize: 14,
    textAlign: 'center',
  },
  bannerView: {
    width: Dimensions.get('window').width,
    height: 180
  },
})
