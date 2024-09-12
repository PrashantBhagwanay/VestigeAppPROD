// @flow
/* global __DEV__ */

import React, { Component } from 'react';
import {
  TouchableOpacity,
  View,
  Image,
  Platform,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import AllInOneSDKManager from 'paytm_allinone_react-native';
import { Specs } from 'app/src/utility/Theme';
import {
  priceWithCurrency,
  connectedToInternet,
} from 'app/src/utility/Utility';
import { _, has } from 'lodash';
import Icon from 'react-native-vector-icons/Ionicons';
import { observable, makeObservable, action } from 'mobx';
import { inject, observer } from 'mobx-react';
import Loader from 'app/src/components/loader/Loader';
import { Toast } from 'app/src/components/toast/Toast';
import autobind from 'autobind-decorator';
import { strings } from 'app/src/utility/localization/Localized';
import AlertClass from 'app/src/utility/AlertClass';
import { Header } from '../../components';
import { isNullOrEmpty } from '../../utility/Utility';
import { showLog } from '../../utility/logger/Logger';
import TelrSdk from 'rn-telr-sdk';
import * as AsyncStore from 'app/src/utility/AsyncStoragesUtils';
import { PAYMENT_TYPE_PAYTM, PAYMENT_TYPE_TELR } from './PaymentConstants';
import DeviceInfo from 'react-native-device-info';

// const { PayTm, PayuMoney } = NativeModules;

const PAYTM = require('app/src/assets/images/payment/paytm.png');
const TELR_ICON = require('app/src/assets/images/payment/icon_telr.png');

/*  ............Paytm key for QA environment testing....................... */

// const paytmTESTConfig = {
//   isStaging: true,
//   MID: 'ftoivG62525477684225', // Satyam Paytm stagging key',
//   CHANNEL_ID: 'WAP',
//   INDUSTRY_TYPE_ID: 'Retail',
//   WEBSITE: 'WEBSTAGING',
//   CALLBACK_URL: 'https://securegw-stage.paytm.in/theia/paytmCallback?ORDER_ID=',
// };

// const paytmPRODConfig = {
//   isStaging: true,
//   MID: 'ftoivG62525477684225', // Satyam Paytm stagging key',
//   CHANNEL_ID: 'WAP',
//   INDUSTRY_TYPE_ID: 'Retail',
//   WEBSITE: 'WEBSTAGING',
//   CALLBACK_URL: 'https://securegw-stage.paytm.in/theia/paytmCallback?ORDER_ID=',
// };

/* .............................ended......................................................... */

/*  ............Paytm key for PRODUCTION environment testing/deployment....................... */

const paytmTESTConfig = {
  isStaging: false,
  MID: 'Vestig61362625557171', // Vestige Prod key (should be activated for live)
  CHANNEL_ID: 'WAP',
  INDUSTRY_TYPE_ID: 'Retail109',
  WEBSITE: 'VestigWEB',
  CALLBACK_URL: 'https://securegw.paytm.in/theia/paytmCallback?ORDER_ID=',
};

const paytmPRODConfig = {
  isStaging: false,
  MID: 'Vestig61362625557171', // Vestige Prod key (should be activated for live)
  CHANNEL_ID: 'WAP',
  INDUSTRY_TYPE_ID: 'Retail109',
  WEBSITE: 'VestigWEB',
  CALLBACK_URL: 'https://securegw.paytm.in/theia/paytmCallback?ORDER_ID=',
};

/* .............................ended......................................................... */

@inject('payments', 'checkout', 'profile', 'cart')
@observer
class Payment extends Component {
  @observable isLoading: boolean = false;

  @action setIsLoading = value => (this.isLoading = value);

  // paytmEvent = null;

  constructor(props) {
    super(props);
    makeObservable(this);
    this.props = props;
    this.state = {
      telrModalVisible: false,
      paymentRequest: null,
    };
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

@autobind 
async onPaymentFailer(data){
  const { logObject, logItem, isCartCheckout } =
  this.props.route?.params || {};

  let onlineOrderIDString;
  console.log(logItem);
  if (logItem) {
    onlineOrderIDString = logItem.orders;
  } else {
    onlineOrderIDString = this.props.checkout.onlineOrderIds;
  
  }

  var paymentData={ orderId: data?.orderId,
    distributorId: this.props.profile.distributorID.toString(), orderNumber: onlineOrderIDString}
    this.setIsLoading(true);
  const isPaymentDetailSaved =
  await this.props.payments.paymentDetailsCheckStatus(paymentData);
// await this.props.cart.removeCart(this.props.checkout.onlineCartIds);
this.props.cart.reset();
this.setIsLoading(false);
if (isPaymentDetailSaved) {
  // await this.props.cart.removeCart(this.props.checkout.onlineCartIds);
  // this.props.cart.reset()
  // this.setIsLoading(false);
  this.props.navigation.navigate('orderConfirmation', {
    logItem,
    isCartCheckout,
  });
} else {
  AlertClass.showAlert(
    'Payment failed',
    this.props.payments.paymentSaveError,
    [
      {
        text: strings.viewCartScreen.alertButtonTextOk,
        onPress: () => console.log('OK Pressed'),
      },
    ],
  );
}


}

  @autobind
  async onPaymentResponse(responseData) {
    const { logObject, logItem, isCartCheckout } =
      this.props.route?.params || {};
    showLog('Paytm Response', responseData);
    showLog('Paytm Response Msg', responseData?.RESPMSG);
    this.setIsLoading(true);
    if (
      Object.keys(responseData).length &&
      responseData.STATUS == 'TXN_SUCCESS'
    ) {
      const isHashVerified = await this.props.payments.verifyHash(responseData);
      if (isHashVerified) {
        const isPaymentDetailSaved =
          await this.props.payments.savePaymentDetails(
            responseData,
            logItem,
            PAYMENT_TYPE_PAYTM,
          );
        // await this.props.cart.removeCart(this.props.checkout.onlineCartIds);
        this.props.cart.reset();
        this.setIsLoading(false);
        if (isPaymentDetailSaved) {
          // await this.props.cart.removeCart(this.props.checkout.onlineCartIds);
          // this.props.cart.reset()
          // this.setIsLoading(false);
          this.props.navigation.navigate('orderConfirmation', {
            logItem,
            isCartCheckout,
          });
        } else {
          AlertClass.showAlert(
            responseData.STATUS,
            this.props.payments.paymentSaveError,
            [
              {
                text: strings.viewCartScreen.alertButtonTextOk,
                onPress: () => console.log('OK Pressed'),
              },
            ],
          );
        }
      }
    } else if (responseData.STATUS === 'PENDING') {
      const isPaymentDetailSaved = await this.props.payments.savePaymentDetails(
        responseData,
        logItem,
        PAYMENT_TYPE_PAYTM,
      );
      if (isPaymentDetailSaved) {
        // await this.props.cart.removeCart(this.props.checkout.onlineCartIds);
      }
      AlertClass.showAlert(responseData.STATUS, responseData.RESPMSG, [
        {
          text: strings.viewCartScreen.alertButtonTextOk,
          onPress: () => console.log('OK Pressed'),
        },
      ]);
    } else if (responseData.STATUS == 'TXN_FAILURE') {
      const isPaymentDetailSaved = await this.props.payments.savePaymentDetails(
        responseData,
        logItem,
        PAYMENT_TYPE_PAYTM,
      );
      if (!isPaymentDetailSaved) {
        await this.props.payments.savePaymentDetails(
          responseData,
          logItem,
          PAYMENT_TYPE_PAYTM,
        );
      }
      AlertClass.showAlert('Status!!', responseData.RESPMSG, [
        {
          text: strings.viewCartScreen.alertButtonTextOk,
          onPress: () => console.log('OK Pressed'),
        },
      ]);
    } else if (responseData.SystemStatus) {
      AlertClass.showAlert('Status!!', responseData.MSG, [
        {
          text: strings.viewCartScreen.alertButtonTextOk,
          onPress: () => console.log('OK Pressed'),
        },
      ]);
    }
    this.setIsLoading(false);
  }

  async onTelrPaymentResponse(responseData) {
    const { logObject, logItem, isCartCheckout } =
      this.props.route?.params || {};
    this.setIsLoading(true);

    if (responseData?.message === 'Authorised' && responseData?.status === 'A') {
      // SUCCESS
      const paymentStatus = await this.props.payments.savePaymentDetails(
        responseData,
        logItem,
        PAYMENT_TYPE_TELR,
      );
      this.props.cart.reset();
      this.setIsLoading(false);
      if (!this.props.payments.paymentSaveError) {
        this.props.navigation.navigate('orderConfirmation', {
          logItem,
          isCartCheckout,
        });
      } else {
        AlertClass.showAlert(
          'Error',
          this.props.payments.paymentSaveError,
          [
            {
              text: strings.viewCartScreen.alertButtonTextOk,
              onPress: () => console.log('OK Pressed'),
            },
          ],
        );
      }
    } else {
      // TODO: REJECTED or FAILURE // PENDING - need to generate it, don't know HOW?
      await this.props.payments.savePaymentDetails(
        responseData,
        logItem,
        PAYMENT_TYPE_TELR,
      );
      AlertClass.showAlert('Alert', responseData?.message, [
        {
          text: strings.viewCartScreen.alertButtonTextOk,
          onPress: () => console.log('OK Pressed'),
        },
      ]);
    }

    this.setIsLoading(false);
  }

  async runTransactionForPayTm(orderId) {
    let amountToPay;
    if (this.props.route?.params?.isLogPayment) {
      const { logItem } = this.props.route.params;
      amountToPay = Number(logItem?.totalPaymentAmount).toFixed(2); // logAmount
    } else {
      amountToPay =
        this.props.checkout.totalOnlineAmountWithShipping.toFixed(2);
    }
    const newOrderId = `${orderId?.replace(/\//g, '-')}${'-'}${Date.now()}`;
    const callbackUrl = `${
      __DEV__ ? paytmTESTConfig.CALLBACK_URL : paytmPRODConfig.CALLBACK_URL
    }${newOrderId}`;
    const details = {
      isStaging: __DEV__
        ? paytmTESTConfig.isStaging
        : paytmPRODConfig.isStaging,
      restrictAppInvoke: true,
      mid: __DEV__ ? paytmTESTConfig.MID : paytmPRODConfig.MID,
      orderId: newOrderId,
      custId: this.props.profile.distributorID.toString(),
      email: this.props.profile.email,
      mobile: this.props.profile.mobileNumber,
      // industryType: __DEV__
      //   ? paytmTESTConfig.INDUSTRY_TYPE_ID
      //   : paytmPRODConfig.INDUSTRY_TYPE_ID,
      // channel: __DEV__
      //   ? paytmTESTConfig.CHANNEL_ID
      //   : paytmPRODConfig.CHANNEL_ID,
      // amount : (this.props.checkout.totalOnlineAmountWithShipping).toFixed(2),
      amount: amountToPay,
      websiteName: __DEV__ ? paytmTESTConfig.WEBSITE : paytmPRODConfig.WEBSITE,
      callbackUrl: callbackUrl,
      // tranxToken: '', // From your server using PayTM Checksum Utility /
    };
    this.setIsLoading(true);
    const hash = await this.props.payments.createHash(details);
    this.setIsLoading(false);
    if (hash) {
      const data = {
        ...details,
        txnToken: hash,
      };
      console.log('check ==> ', data);
      AllInOneSDKManager.startTransaction(
        data?.orderId,
        data?.mid,
        data?.txnToken,
        data?.amount,
        data?.callbackUrl,
        data?.isStaging,
        data?.restrictAppInvoke,
        '',
      )
        .then(result => {
          console.log("result==>"+JSON.stringify(result));
          if (!isNullOrEmpty(result)) {
            this.onPaymentResponse(result);
          }else{
          this.onPaymentFailer(data)
          }
        })
        .catch(err => {
          console.log('paytm error', err);
        });
    } else {
      AlertClass.showAlert(
        'Message',
        strings.commonMessages.somethingWentWrong,
        [
          {
            text: strings.viewCartScreen.alertButtonTextOk,
            onPress: () => console.log('ok'),
          },
        ],
      );
    }
  }

  // async runTransactionForPayU() {
  //   const details = {
  //     mkey: 'ClLUBIVe',
  //     mid: '4678919',
  //     txnID: 'order1',
  //     productInfo: 'iPhone7',
  //     name: 'Ankur',
  //     amount: '100.00',
  //     environment: 'TESTING',
  //     email: 'username@emailprovider.com', // String
  //     phone: '7777777777', // String
  //     surl: 'https://www.payumoney.com/mobileapp/payumoney/success.php',
  //     furl: 'https://www.payumoney.com/mobileapp/payumoney/failure.php',
  //     hashValue:
  //       'bc0315b8ae143f663dbee4b957bd00e6a3368e2b7f9e66a2b014e3be360236ac09aaf3c8c35773e107cfe171e06556295992435bdf6f061fdb20c268f2b05dee', //From your server using PayTM Checksum Utility /
  //   };
  //   PayuMoney.payUPayment(details).then(volume => alert(volume));
  // }

  componentDidMount() {
    // if (Platform.OS === 'ios') {
    //   this.paytmEvent = new NativeEventEmitter(PayTm);
    //   this.paytmEvent.addListener('PayTMResponse', this.onPaymentResponse);
    // }
    // else {
    //   this.paytmEvent = DeviceEventEmitter.addListener('PayTMResponse', this.onPaymentResponse);
    // }
  }

  telrModalClose = () => {
    this.setState({ telrModalVisible: false });
    Alert.alert('Transaction aborted by user');
  };

  didFailWithError = message => {
    this.setState({ telrModalVisible: false });
    Alert.alert(message);
  };

  didPaymentSuccess = response => {
    this.setState({ telrModalVisible: false });
    // Alert.alert(response.message);
    this.onTelrPaymentResponse(response);
  };

  runTransactionForTelr = async orderId => {
    const newOrderId = `${orderId?.replace(/\//g, '-')}${'-'}${Date.now()}`;
    let amountToPay;
    if (this.props.route?.params?.isLogPayment) {
      const { logItem } = this.props.route.params;
      amountToPay = Number(logItem?.totalPaymentAmount).toFixed(2);
    } else {
      amountToPay =
        this.props.checkout.totalOnlineAmountWithShipping.toFixed(2);
    }
    const details = {
      // isStaging: '',
      // restrictAppInvoke: '',
      // mid: '',
      orderId: newOrderId,
      // custId: this.props.profile.distributorID.toString(),
      // email: this.props.profile.email,
      // mobile: this.props.profile.mobileNumber,
      // amount: amountToPay,
      // websiteName: '',
      // callbackUrl: '',
    };
    const hash = await this.props.payments.createHash(details);
    if (hash) {
      const routeParam = this.props.route?.params || {};
      const { logObject, logItem, isLogPayment } =
        this.props.route?.params || {};
      const address =
        logObject[logItem?.logNo]?.logAddress ||
        logObject[logItem?.logNo][0]?.logAddress;
      const DEVICE_ID = AsyncStore.addPrefix('deviceId');
      const deviceId = await AsyncStore.get(DEVICE_ID);
      const countryName =
        logObject[logItem?.logNo]?.countryName ||
        logObject[logItem?.logNo][0]?.countryName;
      const cityName =
        logObject[logItem?.logNo]?.cityName ||
        logObject[logItem?.logNo][0]?.cityName;
      const appVersion = DeviceInfo.getVersion();
     
      var paymentRequest = {
        // framed: "0", // open card frame pass 1, and for webview pass 0
        sdk_env: 'prod', //prod --> use this with your telr store //dev --> for telr store
        something_went_wrong_message: 'Something went wrong',
        store_id: '28429', // prod: 28429, dev: 15996
        key: 'J4LgJ#XB5v^fLLZb', // prod: J4LgJ#XB5v^fLLZb, dev: pQ6nP-7rHt@5WRFv
        device_type: Platform.OS, // Android/iOS
        device_id: deviceId,
        app_name: 'VestigeMobileApp', //enter app name
        app_version: appVersion, //app version
        app_user: this.props.profile.distributorID.toString(), // app user
        app_id: this.props.profile.distributorID.toString(), // app user id
        tran_test: '0', // 1=test, 0=production CHANGE this for testing and production envs
        tran_type: 'sale', // sale
        tran_class: 'paypage',
        tran_cartid: `${newOrderId}`, //enter cart id it shoud be unique for every transaction //1234567890
        tran_description: JSON.stringify(logItem), // enter tran description
        tran_currency: 'AED',
        tran_amount: String(amountToPay),
        tran_language: 'en',
        // tran_firstref: '',
        // billing_name_title: '',
        billing_name_first: this.props.profile.firstName,
        billing_name_last: this.props.profile.lastName,
        billing_address_line1: address,
        billing_address_city: cityName,
        // billing_address_region: "",
        // billing_address_country: countryName,
        billing_address_country: 'AE', //temp fixed by vishnu
        billing_custref: this.props.profile.distributorID.toString(),
        billing_email: this.props.profile.email,
        billing_phone: this.props.profile.mobileNumber,
        repeat_amount: '',
        repeat_interval: '',
        repeat_period: '',
        repeat_term: '',
        repeat_final: '',
        repeat_start: '',
      };

      this.setState({ telrModalVisible: true, paymentRequest: paymentRequest });
    } else {
      AlertClass.showAlert(
        'Message',
        strings.commonMessages.somethingWentWrong,
        [
          {
            text: strings.viewCartScreen.alertButtonTextOk,
            onPress: () => console.log('ok'),
          },
        ],
      );
    }
  };

  onPressPaytmOption = _.debounce(
    async groupOrderId => {
      const internetStatus = await connectedToInternet();
      if (internetStatus) {
        // this.runTransactionForPayTm(this.props.checkout.ordersDetail.groupOrderId)
        this.runTransactionForPayTm(groupOrderId);
      } else {
        this.showToast(strings.commonMessages.noInternet, Toast.type.ERROR);
      }
    },
    1000,
    { leading: true, trailing: false },
  );

  renderPaytmOption = groupOrderId => {
    return (
      <TouchableOpacity
        style={styles.paymentStrip}
        onPress={async () => this.onPressPaytmOption(groupOrderId)}>
        <Image source={PAYTM} resizeMode="contain" style={styles.image} />
        <Icon
          name="ios-arrow-forward"
          size={30}
          color="#3f4967"
          style={styles.arrowIcon}
        />
      </TouchableOpacity>
    );
  };

  onPressTelrOption = _.debounce(
    async groupOrderId => {
      const internetStatus = await connectedToInternet();
      if (internetStatus) {
        this.runTransactionForTelr(groupOrderId);
      } else {
        this.showToast(strings.commonMessages.noInternet, Toast.type.ERROR);
      }
    },
    1000,
    { leading: true, trailing: false },
  );

  renderTelrOption = groupOrderId => {
    return (
      <TouchableOpacity
        style={styles.paymentStrip}
        onPress={async () => this.onPressTelrOption(groupOrderId)}>
        <Image source={TELR_ICON} resizeMode="contain" style={styles.image} />
        <Icon
          name="ios-arrow-forward"
          size={30}
          color="#3f4967"
          style={styles.arrowIcon}
        />
      </TouchableOpacity>
    );
  };

  render() {
    let totalAmountToPay;
    let selectedGroupOrderId;
    let countryId;
    const { logObject, logItem, isLogPayment } = this.props.route?.params || {};
    if (isLogPayment) {
      totalAmountToPay = logItem?.totalPaymentAmount; // logAmount
      selectedGroupOrderId = logItem?.logNo;
      countryId =
        logObject[logItem?.logNo]?.countryId ||
        logObject[logItem?.logNo][0]?.countryId;
    } else {
      const { totalOnlineAmountWithShipping, groupOrderId } = this.props.checkout;
      totalAmountToPay = totalOnlineAmountWithShipping;
      selectedGroupOrderId = groupOrderId;
    }

    return (
      <>
        <View style={styles.container}>
          <Loader loading={this.isLoading} />
          <Header
            navigation={this.props.navigation}
            screenTitle={strings.payment.title}
          />
          <View style={styles.paymentTextStrip}>
            <Text style={styles.text}>{strings.payment.amountToPay}</Text>
            <Text style={styles.amount}>{`${priceWithCurrency(
              countryId,
              totalAmountToPay,
            )}`}</Text>
          </View>
          <View style={styles.paymentOptions}>
            <Text style={styles.placeHolderText}>
              {strings.payment.selectMethod}
            </Text>
            {countryId === 4
              ? this.renderTelrOption(selectedGroupOrderId)
              : this.renderPaytmOption(selectedGroupOrderId)}
          </View>
        </View>

        <TelrSdk
          backButtonText={'Back'}
          buttonBackStyle={styles.buttonBackStyle}
          buttonBackColor={styles.buttonBackColor}
          backButtonTextStyle={styles.backButtonTextStyle}
          paymentRequest={this.state.paymentRequest}
          telrModalVisible={this.state.telrModalVisible}
          telrModalClose={this.telrModalClose}
          didFailWithError={this.didFailWithError}
          didPaymentSuccess={this.didPaymentSuccess}
        />
      </>
    );
  }
}

export default Payment;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  paymentTextStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginTop: 10,
  },
  text: {
    marginLeft: 11,
    paddingVertical: 19,
    fontSize: 14,
    ...Specs.fontRegular,
  },
  amount: {
    marginRight: 11,
    fontSize: 18,
    ...Specs.fontSemibold,
    color: '#14aa93',
  },
  paymentOptions: {
    marginTop: 13,
  },
  placeHolderText: {
    marginLeft: 11,
    paddingVertical: 11,
    fontSize: 12,
    ...Specs.fontMedium,
    color: '#3f496780',
  },
  paymentStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 54,
    backgroundColor: '#fff',
  },
  image: {
    marginLeft: 11,
    width: 100,
    height: 30,
  },
  arrowIcon: {
    marginRight: 16,
  },
  buttonBackStyle: {
    padding: 5,
    backgroundColor: 'white'
  },
  backButtonTextStyle: {
    fontSize: 16,
    backgroundColor: 'white',
    fontWeight: 'bold',
    color: 'black'
  },
  buttonBackColor: {
    backgroundColor: 'white'
  }
});
