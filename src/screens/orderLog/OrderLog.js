import React, { Component } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  Modal,
  Dimensions,
} from 'react-native';
import HeaderLeftIcons from 'app/src/components/navigation/HeaderLeftIcons';
import Loader from 'app/src/components/loader/Loader';
import { observer, inject } from 'mobx-react';
import { showToast } from 'app/src/utility/Utility';
import AlertClass from 'app/src/utility/AlertClass';
import moment from 'moment';
import { Specs } from 'app/src/utility/Theme';
import LinearGradient from 'react-native-linear-gradient';
import { strings } from 'app/src/utility/localization/Localized';
import { Toast } from 'app/src/components/toast/Toast';

import PickerSelector from '../../components/picker/pickerSelector';
import { BottomSheetPicker } from '../../components/picker/bottomSheetPicker';
import OrderItem from './OrderLogItem';
import { Header } from '../../components';

const dateFilterList = [
  { label: 'Today', value: 'Today' },
  { label: 'Last Week', value: 'Last Week' },
  { label: 'Month', value: 'Month' },
];

@inject('cart', 'profile', 'auth', 'appConfiguration')
@observer
class OrderLog extends Component {
  constructor(props) {
    super(props);
    this.isApiV2Enabled = this.props.appConfiguration.isApiV2Enabled;
    this.state = {
      isLoading: false,
      orderLogList: [],
      selectedDateString: 'Today',
      fromDate: moment(new Date()).format(this.handleDateFormat()),
      currentDate: moment(new Date()).format(this.handleDateFormat()),
      isModalVisible: false,
    };
  }

  async componentDidMount() {
    await this.getOrderLogList();
  }

  handleDateFormat = () => {
    // return this.isApiV2Enabled ? 'DD/MM/YYYY' : 'YYYY-MM-DD';
    // ....... using v2 api format for both v1 and v2, things will be handled from backend..........
    return this.isApiV2Enabled ? 'DD/MM/YYYY' : 'DD/MM/YYYY';
  }

  cancelOrder = async item => {
    const { logNo, paymentAmount, customerOrderNo, orderCreatedBy } = item
    this.setState({ isLoading: true })
    const isApiV2 = orderCreatedBy === 'Web_V2';
    const res = await this.props.cart.cancelOrder(
      logNo,
      paymentAmount,
      customerOrderNo,
      isApiV2
    );
    this.setState({ isLoading: false })
    if (res.status === 'success') {
      setTimeout(async () => {
        await this.getOrderLogList()
        showToast(res.message, Toast.type.SUCCESS);
      }, 500);
    } else {
      setTimeout(() => {
        AlertClass.showAlert('', res.message);
      }, 200);
      //  showToast(res.message, Toast.type.ERROR);
    }
  };

  getOrderLogList = async () => {
    this.setState({ isLoading: true });
    const res = await this.props.cart.fetchOrderLogList(
      this.state.fromDate,
      this.state.currentDate,
    );
    this.setState({ isLoading: false });
    if (res.success) {
      this.setState({ orderLogList: res.data });
    } else {
      this.setState({ orderLogList: [] });
      AlertClass.showAlert('', res.message);
    }
  };

  setDateFilterValue = itemValue => {
    let date = new Date();
    if (itemValue === 'Today') {
      this.setState(
        {
          fromDate: moment(date).format(this.handleDateFormat()),
          selectedDateString: itemValue,
        },
        async () => await this.getOrderLogList(),
      );
    } else if (itemValue === 'Last Week') {
      date.setDate(date.getDate() - 7);
      this.setState(
        {
          fromDate: moment(date.toISOString().split('T')[0]).format(this.handleDateFormat()),
          selectedDateString: itemValue,
        },
        async () => await this.getOrderLogList(),
      );
    } else if (itemValue === 'Month') {
      date.setDate(date.getDate() - 30);
      this.setState(
        {
          fromDate: moment(date.toISOString().split('T')[0]).format(this.handleDateFormat()),
          selectedDateString: itemValue,
        },
        async () => await this.getOrderLogList(),
      );
    }
  };

  /** @description This will be used to handle payment for philippines user. */
  submitTransactionDetails = async item => {
    this.payForLog(item, 'PH');
    // this.props.navigation.navigate('updatePaymentDetails', { logItem: item });
  };

  /** @description this is handle mini dlcp user cash payment by using their ledger amount. */
  handleMiUserCashPayment = async item => {
    this.setState({ isLoading: true });
    const res = await this.props.cart.updateMiUserLedger(item.logNumber);
    this.setState({ isLoading: false });
    if (res.success) {
      AlertClass.showAlert(
        'Success!',
        `Your order is confirmed & payment will be deducted from ledger balance. \nYou can download invoice from My Order section after few minutes.`,
        [
          {
            text: strings.commonMessages.ok,
            onPress: () => this.getOrderLogList(),
          },
        ],
      );
    } else {
      showToast(res.message, Toast.type.ERROR);
    }
  };

  /**
   * @description  This method will handle payment navigation based on country code.
   * @param {*} item log details will be here
   * @param {*} paymentDetails log payment details will be here
   * @param {*} countryCode country code will be here for validation.
   */
  handlePaymentNavigation = (item, paymentDetails, countryCode) => {
    const { logNumber } = item;
    const orderList = item[logNumber];
    if (countryCode === 'IN') {
      const isMiUserCashActive = orderList?.some(obj => obj.isMiUserCashActive);
      if (isMiUserCashActive) {
        this.handleMiUserCashPayment(item);
      } else {
        const data = {
          isLogPayment: true,
          logItem: paymentDetails.data,
          logObject: item,
          isCartCheckout: this.props.route?.params?.isCartCheckout,
        };
        this.props.navigation.navigate('payment', data);
      }
    } else if (countryCode === 'PH') {
      this.props.navigation.navigate('updatePaymentDetails', {
        logItem: item,
        logPaymentDetails: paymentDetails.data,
      });
    }
  };

  /** @description This method is used to show payment details and will proceed for payment */
  payForLog = async (item, countryCode = 'IN') => {
    this.setState({ isLoading: true });
    const res = await this.props.cart.getLogPayment(item.logNumber);
    this.setState({ isLoading: false });
    let paymentForDubai = undefined;
    if(item[item.logNumber] && item[item.logNumber].length){
      paymentForDubai = item[item.logNumber].some(item => item.countryId == 4)
    }
    if (res.success) {
      const {
        shippingCharge,
        expressCharge,
        logNo,
        logAmount,
        totalPaymentAmount,
        courierChargesMessage,
      } = res.data || {};
      const expressWarningMessage =
        expressCharge != '0'
          ? 'If order placed before 1:00pm will be delivered same day else will be consider for next business working day.\n\n'
          : '';

      const calculatedPrice = `${
        shippingCharge != '0' ? `\nCourier charges: ${shippingCharge}` : ''
      }${
        expressCharge != '0'
          ? `\nExpress delivery charges: ${expressCharge}`
          : ''
      }`;
      const formatedCourierMessage =
        courierChargesMessage?.replaceAll('&amp; ', '\n') || '';
        courierChargesMessage?.replaceAll('&amp;', '\n') || '';

      AlertClass.showAlert(
        'Information',
        `${expressWarningMessage}Below is the break up of total amount to be paid for Log No.: ${logNo}\nOrder charges: ${logAmount}${calculatedPrice}\nTotal: ${totalPaymentAmount}${paymentForDubai ? ' (Inclusive 5% VAT)' : ''}\n\n${formatedCourierMessage}`, // VMP-3146 || totalPaymentAmount: Can cause issues in case of India
        [
          {
            text: strings.commonMessages.no,
            onPress: () => console.log('No Pressed'),
          },
          {
            text: strings.commonMessages.yes,
            onPress: () => this.handlePaymentNavigation(item, res, countryCode),
          },
        ],
      );
    } else {
      setTimeout(() => {
        AlertClass.showAlert('', res.message);
      }, 200);
    }
  };

  /** @description this is used to give warning, if the payment already done and in pending state */
  checkPendingPayment = async item => {
    const logValue = item.logNumber;
    const selectedLog = item[logValue];
    const logApiType = selectedLog?.[0]?.orderCreatedBy;
    this.props.cart.setApiV2Payment(logApiType);
    const { pendingPaymentFirst, pendingPaymentSecond, pendingPaymentThird } =
      strings.order.makePayment;
    if (selectedLog[0].paymentPending) {
      AlertClass.showAlert(
        'Alert',
        `${pendingPaymentFirst}${item.logNumber}${pendingPaymentSecond}${item.logNumber}${pendingPaymentThird}`,
        [
          {
            text: strings.commonMessages.no,
            onPress: () => console.log('No Pressed'),
          },
          {
            text: strings.commonMessages.yes,
            onPress: () => this.payForLog(item),
          },
        ],
      );
    } else {
      this.payForLog(item);
    }
  };

  headingInfo = () => {
    const { profile, appConfiguration } = this.props;
    if (
      (profile.countryId === 25 || profile.defaultAddressCountryId === 25) &&
      appConfiguration.makePaymentScreenWarning != ''
    ) {
      return (
        <View style={{ width: '100%' }}>
          <LinearGradient
            style={styles.headingInfoView}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            colors={['#6C93D4', '#3054C4']}>
            <Text style={styles.headingText}>
              {appConfiguration.makePaymentScreenWarning}
            </Text>
          </LinearGradient>
        </View>
      );
    }
    return null;
  };

  handlePickerSelector = () => {
    this.handleModalVisibility(true);
  };

  handlePickerItemPress = item => {
    this.setDateFilterValue(item?.value);
    this.handleModalVisibility(false);
  };

  handleModalVisibility = value => {
    this.setState({
      isModalVisible: value,
    });
  };

  render() {
    return (
      <View style={styles.container}>
        <Loader loading={this.state.isLoading} />
        <Header
          navigation={this.props.navigation}
          screenTitle={strings.drawerScreen.orderLog}
        />
        {this.headingInfo()}
        <PickerSelector
          label={this.state.selectedDateString || 'Select any Range'}
          selectedValue={this.state.selectedDateString}
          customStyle={{
            container: {
              marginHorizontal: 20,
            },
          }}
          onPickerPress={this.handlePickerSelector}
        />
        <FlatList
          data={this.state.orderLogList}
          extraData={this.state.orderLogList}
          keyExtractor={(item, index) => item + index}
          renderItem={({ item }) => (
            <OrderItem
              countryId={this.props.profile.countryId}
              distributorID={this.props.auth.distributorID}
              navigation={this.props.navigation}
              orderItem={item}
              cancelOrder={this.cancelOrder}
              submitTransactionDetails={this.submitTransactionDetails}
              payForLog={this.checkPendingPayment}
            />
          )}
        />
        <BottomSheetPicker
          isVisible={this.state.isModalVisible}
          onModalClose={() => this.handleModalVisibility(false)}
          pickerItems={dateFilterList}
          heightMax={250}
          onItemPress={this.handlePickerItemPress}
        />
      </View>
    );
  }
}

export default OrderLog;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headingInfoView: {
    // flex: 1,
    paddingVertical: 15,
    paddingHorizontal: 15,
    justifyContent: 'center',
  },
  headingText: {
    textAlign: 'center',
    ...Specs.fontSemibold,
    fontSize: 13,
    color: '#fff',
  },
  horizontalLine: {
    borderTopColor: '#c8c9d3',
    borderTopWidth: 1,
  },
  pickerContainer: {
    // width: '88%',
    margin: 20,
    borderRadius: 5,
    elevation: 2,
    shadowOffset: { width: 0, height: 4 },
    shadowColor: '#80c2c6cf',
    shadowOpacity: 0.2,
    backgroundColor: '#fff',
    alignSelf: 'flex-end',
    flexDirection: 'row',
  },
});
