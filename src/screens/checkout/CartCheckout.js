import React, { Component } from 'react';
import { View, Text, StyleSheet, SectionList, BackHandler, FlatList} from 'react-native';
import { Specs } from 'app/src/utility/Theme';
import { CommonActions } from '@react-navigation/native';
import Label from 'app/src/components/customLabel/Label';
import { inject, observer } from 'mobx-react';
import Loader  from 'app/src/components/loader/Loader';
import { Toast } from 'app/src/components/toast/Toast';
import { strings } from 'app/src/utility/localization/Localized';
import AlertClass from 'app/src/utility/AlertClass';
import { priceWithCurrency, gotoHome, gotoScreenFromOtherRoute, gotoDashboard, capitalizeFirstCharacter, showToast } from 'app/src/utility/Utility';
import { CustomButton } from 'app/src/components/buttons/Button';
import autobind from 'autobind-decorator';

// Navigation Icons
import HeaderLeftIcons from 'app/src/components/navigation/HeaderLeftIcons';
import { observable ,makeObservable } from 'mobx';
import { Header } from '../../components';

@inject('checkout','profile', 'cart', 'auth')
@observer
export default class CartCheckout extends Component {
  @observable isNavigateToMakePayment: Boolean = false;

  constructor(props) {
    super(props);
    makeObservable(this);
    this.state = {
      isLoading: false
    };
    this.isNavigateToMakePayment = this.props.route?.params?.isNavigateToMakePayment || false;   
  }

  @autobind
  showToast(message: string, type: Toast.type) {
    // Add a Toast on screen.
    Toast.show(message, {
      duration: Toast.durations.SHORT,
      type: type,
      shadow: false,
      animation: true,
      hideOnPress: true,
      delay: 0,
    });
  }

  componentDidMount() {
    if (this.props.checkout.cashCartIds || this.props.checkout.onlineCartIds || this.props.checkout.bonusCartIds) {
      this.props.checkout.cashCartIds && this.props.cart.removeCart(this.props.checkout.cashCartIds);
      this.props.checkout.onlineCartIds && this.props.cart.removeCart(this.props.checkout.onlineCartIds);
      this.props.checkout.bonusCartIds && this.props.cart.removeCart(this.props.checkout.bonusCartIds);
      this.props.cart.reset();
      this.props.cart.updateShopForObject('Self', this.props.auth.distributorID.toString(), 'SELF');
      // this.props.checkout.onlineCartIds && setTimeout( ()=> this.showToast(strings.cartCheckout.cashOrdersPlacedSuccessfullyMessage, Toast.type.SUCCESS), 2000 );
    }
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
    this.showAlertMessage();
  }

  showAlertMessage(){

    AlertClass.showAlert('Alert', "Do not share the OTP over the phone. Only share it with the delivery agent at the time of order delivery", [
      {
        text: "OK",
        onPress: () => console.log('Ok Pressed'),
      },
    ]);
    
  }

  @autobind
  async payment() {
    if (this.props.checkout.totalPriceWithShipping > 0) {
      await this.payForLog();
    }
    else {
      this.props.navigation.navigate('orderConfirmation');
    }
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
  }
  handleBackButton() {
    return true;
  }

  @autobind
  payByCash() {
    console.log('pament check');
    const { cashCartIds, bonusCartIds, totalPriceWithShipping } = this.props.checkout;
    if (cashCartIds || (bonusCartIds && totalPriceWithShipping > 0)) {
      if (this.isNavigateToMakePayment) {
        const resetAction = CommonActions.reset({
          index: 0,
          actions: [
            CommonActions.navigate({ name: 'MyCart' }),
          ],
        });
        this.props.navigation.dispatch(resetAction);
        this.props.navigation.navigate('orderLog', { isCartCheckout: true });
      }
      else {
        AlertClass.showAlert('Message',
          strings.commonMessages.gotoShopping,
          [{text: 'Continue', onPress: () => gotoHome(this.props.navigation, 'Shopping') }], true);
      }
    }
    else {
      gotoHome(this.props.navigation, 'Shopping')
    }
  }

  renderHeader = () => {
    const { totalCashAmount, totalOnlineAmount, shippingAmount, totalPriceWithShipping, cessAmount, expressCharge } = this.props.checkout;
    return (
      <View>
        {/* <View style={styles.headerContainer}>
          <View style={styles.borderBottom}>
            <View style={styles.headerContent}>
              <Text style={styles.addressTitle}>
                {(this.props.profile.activeAddress.addressType === 'Shipping') ? strings.cartCheckout.deliveryAddress : strings.cartCheckout.storeAddress}
              </Text>
            </View>
          </View>
          <View style={[styles.headerContent, {marginBottom: 20}]}>
            <Text numberOfLines={2} style={styles.addressText}>{this.props.profile.activeAddress.locationName || this.props.profile.activeAddress.address}</Text>
          </View>
        </View> */}
        {/* <Text style={styles.headerNotesStyle}>Alert :-  Do not share the OTP over the phone. Only share it with the delivery agent at the time of order delivery.</Text> */}
        <Text style={styles.headerContainerStyle}>Payment Summary</Text>
        <View style={styles.headerContainer}>
          <View style={styles.headerContent}>
            <Text style={styles.itemName}>{strings.cartCheckout.totalCashAmount}</Text>
            <Text style={styles.totalPrice}>{`${priceWithCurrency(this.props.profile.defaultAddressCountryId,totalCashAmount)}`}</Text>
          </View>
          <View style={styles.headerContent}>
            <Text style={styles.itemName}>{strings.cartCheckout.totalOnlineAmount}</Text>
            <Text style={styles.totalPrice}>{`${priceWithCurrency(this.props.profile.defaultAddressCountryId,totalOnlineAmount)}`}</Text>
          </View>
          <View style={styles.headerContent}>
            <Text style={styles.itemName}>{strings.cartCheckout.shippingAmount}</Text>
            <Text style={styles.totalPrice}>{`${priceWithCurrency(this.props.profile.defaultAddressCountryId,shippingAmount)}`}</Text>
          </View>
          {(expressCharge && expressCharge != '')
            ? (
              <View style={styles.headerContent}>
                <Text style={styles.itemName}>{strings.cartCheckout.expressShippingAmount}</Text>
                <Text style={styles.totalPrice}>{`${priceWithCurrency(this.props.profile.defaultAddressCountryId, expressCharge)}`}</Text>
              </View>
            )
            : null
          }
          {/* <View style={styles.headerContent}>
            <Text style={styles.itemName}>{strings.cartCheckout.cessAmount}</Text>
            <Text style={styles.totalPrice}>{`${priceWithCurrency(this.props.profile.countryId,cessAmount)}`}</Text>
          </View> */}
          <View style={styles.headerContent}>
            <Text style={{...styles.itemName,color:'#000000'}}>{strings.cartCheckout.totalAmountToBePaid}</Text>
            <Text style={styles.totalPrice}>{`${priceWithCurrency(this.props.profile.defaultAddressCountryId,totalPriceWithShipping)}`}</Text>
          </View>
        </View>
        <Text style={styles.orderTitle}>
          Order Details (
          {this.props.checkout.groupOrderId}
          )
        </Text>
      </View>
    )
  }
 indexValue=(index,section)=>{
   const { ordersList } = this.props.checkout;
   var wholeCount=0
   var sectionCount
   if(ordersList.indexOf(section) > 0) {
     for(sectionCount=0;sectionCount<ordersList.indexOf(section) ; sectionCount++){
       wholeCount = ordersList[sectionCount].data.length+wholeCount
     }
     let value =  wholeCount+1+index
     return value  
   }
   else {
     return index+1
   }
 }

 payForLog = async(item) => {
  this.props.navigation.navigate('orderLog', {isCartCheckout: true})

  // comment code as discuss with team due to mismatch amount issue.
  //  this.setState({ isLoading: true });
  //  const res = await this.props.cart.getLogPayment(this.props.checkout.ordersDetail.groupOrderId)
  //  this.setState({ isLoading: false });
  //  console.log(res)
  //  if(res.success) {
  //    AlertClass.showAlert('Alert', 
  //      `Courier charges will be applied on Log No.: ${res.data.logNo}.Total amount to pay are as ${res.data.logAmount}+${res.data.shippingCharge}=${res.data.totalPaymentAmount}.Do you want to proceed?`, 
  //      [{text: strings.commonMessages.no, onPress: () => console.log('No Pressed')}, 
  //        {text: strings.commonMessages.yes,  onPress: () => this.props.navigation.navigate('payment', { isLogPayment: true, logItem: res.data, logObject: item, isCartCheckout: true}) }
  //       ])
  //  }
  //  else {
  //    showToast(res.message)
  //  }
 }

 handleDashbordButtonPress = () => {
  BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton)

  gotoScreenFromOtherRoute(this.props.navigation, 'dashboard');
 }

 renderHeaderLeft = () => {
   return (
    <HeaderLeftIcons 
        logo 
      />
   )
 }

 render() {
   const { ordersList, isPaymentModeOnline } = this.props.checkout;
   console.log('orderList',ordersList,this.props.cart.refreshCartInfo,this.props.auth.distributorID)
   return(
     <View style={styles.container}>
       <Loader loading={this.state.isLoading} />
       <Header
          navigation={this.props.navigation}
          hideBack
          leftComponent={this.renderHeaderLeft()}
        />
       <FlatList
         //  sections={ordersList}
         data={ordersList}
         stickySectionHeadersEnabled={false}
         renderItem={({item,index}) => {
           const selfOrder=(item.distributorId.toString()===this.props.auth.distributorID) ? true : false
           return (
             <View style={styles.listItem}>
               <View style={{flex:0.1,alignItems:'center',justifyContent:'center'}}>
                 <View style={styles.numberContainerStyle}>
                   <Text style={{color: '#373e73'}}> 
                     {`${index+1}.`}
                   </Text>
                 </View>
               </View>
               <View style={{flex:0.9}}>
                 {/* <View style={{backgroundColor: '#fff'}}>
                   <Text style={styles.itemQuantity}>
                     {this.props.checkout.groupOrderId}
                   </Text>
                 </View> */}
                 <View style={[styles.itemDetails, {paddingBottom: 0}]}>
                   {/* <Text style={styles.itemName} numberOfLines={3} ellipsizeMode='tail'>{capitalizeFirstCharacter(item.title)}</Text> */}
                   {/* <Label style={{paddingHorizontal: 9}}>{`${item.pv.toFixed(2)}${strings.product.pv}`}</Label> */}
                   <Text style={{...styles.itemName,...Specs.fontSemibold,color: '#373e73'}}>
                     {`Order for ${selfOrder? 'Self ' : ''}`}
                     <Text style={{...styles.itemName,color:'#373e73',...Specs.fontMedium}}>{`(Dist ID : ${item.distributorId})`}</Text>
                   </Text>
                 </View>
                 {/* <View style={[styles.itemDetails, { paddingBottom: 12 }]}>
                <Text style={styles.itemQuantity}>
                  {`${strings.cartCheckout.priceText}`} 
                  <Text style={[styles.itemQuantity]}>{`${priceWithCurrency(this.props.profile.countryId,item.total)}`}</Text>
                  {'      '} 
                  <Text style={[styles.itemQuantity]}>{`${strings.cartCheckout.quantityText}${item.quantity}`}</Text>
                </Text>
              </View> */}
                 <View style={{backgroundColor: '#fff',paddingHorizontal: 17,paddingBottom:10,paddingTop:5}}>
                   <Text style={styles.itemQuantity}>
                     {strings.cartCheckout.orderId}
                     <Text style={[styles.itemQuantity, {paddingTop: 2}]}>{item.title}</Text>
                   </Text>
                 </View>
               </View>
             </View>
           )
         }}
         // renderSectionFooter={({section: {orderAmount}}) => (
         //   <View style={styles.orderItemFooterContainer}>
         //     <Text style={styles.itemName}>{strings.cartCheckout.orderAmountToBePaid}</Text>
         //     <Text style={styles.totalPrice}>{`${priceWithCurrency(this.props.profile.defaultAddressCountryId,orderAmount)}`}</Text>
         //   </View>
         // )}
         // renderSectionHeader={({section: {title, paymentType}}) => (
         //   <View style={[styles.itemDetails, {marginVertical: 10}]}>
         //     <View style={{flexDirection:'row', justifyContent: 'space-between', flex: 1}}>
         //       <Text style={styles.heading}>
         //         {strings.cartCheckout.orderId}
         //         <Text style={[styles.headingDetails, {paddingTop: 2}]}>{title}</Text>
         //       </Text>
         //       <Text style={styles.totalPrice}>{paymentType}</Text>
         //     </View>
         //   </View>
         // )}
         ListHeaderComponent={this.renderHeader()}
       />
       <View style={{ marginTop: 10, flexDirection: 'row', height: 50 }}>
         {/* {
            isPaymentModeOnline && (
              <CustomButton
                {...this.props}
                handleClick={() => this.payByCash()}
                buttonTitleStyle={styles.cartCheckoutButtonTextStyle}
                buttonContainer={styles.cartCheckoutButtonStyle}
                buttonTitle={strings.cartCheckout.continueShoppingButton}
              />
            )
          }  */}
          <CustomButton
           {...this.props}
           handleClick={()=>  this.handleDashbordButtonPress()}
           buttonTitleStyle={styles.cartCheckoutButtonTextStyle}
           buttonContainer={[styles.cartCheckoutButtonStyle, {backgroundColor: '#5a83b8'}]}
           buttonTitle='Dashboard'
         />
         <CustomButton
           {...this.props}
           handleClick={()=>  gotoScreenFromOtherRoute(this.props.navigation, 'shoppingOption')}
           buttonTitleStyle={styles.cartCheckoutButtonTextStyle}
           buttonContainer={[styles.cartCheckoutButtonStyle, {backgroundColor: '#6598d3'}]}
           buttonTitle='Add To Log'
         />
         <CustomButton
           {...this.props}
           handleClick={() => (isPaymentModeOnline ? this.payment() : this.payByCash())}
           buttonTitleStyle={styles.cartCheckoutButtonTextStyle}
           buttonContainer={[styles.cartCheckoutButtonStyle, {backgroundColor: '#5a83b8'}]}
           buttonTitle={isPaymentModeOnline ? 'Confirm & Pay' : strings.cartCheckout.completeOrderText}
           //  buttonTitle='Confirm & Pay'
         />
       </View>
     </View>
   )
 }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  orderTitle: {
    ...Specs.fontSemibold,
    fontSize: 16,
    marginTop: 42,
    marginLeft: 20,
    marginBottom: 10,
    color: '#373e73',
  },
  numberContainerStyle:{
    height: 30,
    width: 30,
    borderRadius: 15,
    alignItems:'center',
    justifyContent:'center',
    borderColor: '#c8c9d359',
    borderWidth: 1,
    left:5,
  },
  listItem: {
    marginBottom: 1,
    flexDirection:'row',
    backgroundColor: '#fff',
  },
  headerContainerStyle:{
    ...Specs.fontSemibold,
    fontSize: 16,
    color: '#373e73',
    paddingLeft: 20,
    paddingTop: 46,
  },
  headerNotesStyle:{
    ...Specs.fontSemibold,
    fontSize: 14,
    color: 'red',
    paddingLeft: 20,
    paddingTop: 10,
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 17,
    paddingVertical: 10,
    paddingBottom: 7,
    backgroundColor: '#fff',
  },
  heading: {
    ...Specs.fontSemibold,
    fontSize: 14,
    color: '#373e73',
  },
  headingDetails: {
    ...Specs.fontMedium,
    color: '#46586f99',
    fontSize: 12,
  },
  itemName: {
    ...Specs.fontRegular,
    fontSize: 14,
    color: '#3f4967',
    width: '70%'
  },
  itemQuantity: {
    ...Specs.fontMedium,
    color: '#00000066',
    fontSize: 13
  },
  itemDP: {
    ...Specs.fontSemibold,
    fontSize: 14,
    color: '#6a93d7'
  },
  totalPrice: {
    ...Specs.fontSemibold,
    fontSize: 18,
    color: '#14aa93'
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: '#c8c9d359',
  },
  headerContainer: {
    backgroundColor: '#fff',
    marginTop: 10,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16, 
    marginVertical: 10,
  },
  addressTitle: {
    ...Specs.fontSemibold,
    fontSize: 14,
    color: '#373e73',
  },
  addressText: {
    ...Specs.fontReguler,
    fontSize: 14,
    color: '#515867',
  },
  cartCheckoutButtonStyle: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#6797d4',
    justifyContent: 'center',
  },
  cartCheckoutButtonTextStyle: {
    fontSize: 16,
    color: '#FFFFFF',
    alignSelf: 'center',
  },
  orderItemFooterContainer: {
    backgroundColor: '#fff', 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingHorizontal: 17, 
    paddingVertical: 8
  }
})