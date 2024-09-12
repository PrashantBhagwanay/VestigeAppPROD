import React, { Component } from 'react';
import { View, StyleSheet, FlatList, Text, Image, TouchableOpacity } from 'react-native';
import autobind from 'autobind-decorator';
import moment from 'moment';
import { observer, inject } from 'mobx-react';
import DateTimePicker from 'react-native-modal-datetime-picker';
import { CustomButton } from 'app/src/components/buttons/Button';
import HeaderLeftIcons from 'app/src/components/navigation/HeaderLeftIcons';
import Loader from 'app/src/components/loader/Loader';
import { showToast } from 'app/src/utility/Utility';
import AlertClass from 'app/src/utility/AlertClass';
import CustomInput from 'app/src/components/CustomInput';
import { Specs } from 'app/src/utility/Theme';
import { strings } from 'app/src/utility/localization/Localized';
import { Toast } from 'app/src/components/toast/Toast';
import { isAlphaNumeric, isValidAmount } from 'app/src/utility/Validation/Validation';
import { Header } from '../../components';

const HEADING_IMAGE = require('app/src/assets/images/order/updatePayment.jpg');
const CALENDER_ICON = require('app/src/assets/images/training/calenndarIcon.png');

@inject('cart', 'profile', 'auth', 'appConfiguration')
@observer
export default class OrderLog extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      visibleDateValue: '',
      transactionDate: '',
      dateIsoString: new Date().toISOString(),
      isDatePickerVisible: false,
      amount: '',
      transactionId: '',
    };
    this.logItem = this.props.route?.params?.logItem || {};
    this.logPaymentDetails = this.props.route?.params?.logPaymentDetails || {};
  }

  /**
  * @description method to handle text input
  */
  handleTextInput = async (item, text) => {
    this.setState({
      [item.key]: text,
    });
  }

  isValidate = () => {
    const { transactionId, transactionDate, amount } = this.state;
    if (!transactionId?.trim() || !isAlphaNumeric(transactionId?.trim())) {
      return strings.order.updatePaymentDetails.invalidTransactionDetails;
    }
    if (!transactionDate || transactionDate == '') {
      return strings.order.updatePaymentDetails.invalidDate;
    }
    if (!amount?.trim() || !isValidAmount(amount?.trim())) {
      return strings.order.updatePaymentDetails.invalidAmount;
    }
    if (amount?.trim() !== this.logPaymentDetails?.totalPaymentAmount) {
      return strings.order.updatePaymentDetails.amountMismatch;
    }
    return null;
  }

  handleNavigation = () => {
    this.props.navigation.popToTop();
  }

  /**
  * @description method to submit trasaction details
  */
  submitPaymentDetails = async () => {
    const logValue = this.logItem?.logNumber;
    const logDistributorId = logValue && this.logItem[logValue][0].distributorId;
    const errorMessage = this.isValidate();
    if (errorMessage) {
      showToast(errorMessage, Toast.type.ERROR);
    }
    else {
      const data = {
        distributorId: logDistributorId || '',
        logNumber: logValue,
        payAmount: this.state.amount?.trim(),
        referenceNumber: this.state.transactionId?.trim(),
        createdDate: this.state.transactionDate || '',
      };
      const res = await this.props.cart.submitPaymentDetails(data);
      if (res.success) {
        AlertClass.showAlert('Alert',
          res.data,
          [
            { text: strings.commonMessages.ok, onPress: () => this.handleNavigation() },
          ]);
      }
      else {
        showToast(res.message, Toast.type.ERROR);
      }
    }
  }

  handleDatePicker= (date) => {
    this.setState({
      dateIsoString: date.toISOString(),
      visibleDateValue: moment(date, 'YYYY-MM-DDTHH: mm: ss').format('DD/MM/YYYY'),
      transactionDate: moment(date, 'YYYY-MM-DDTHH: mm: ss').format('YYYY-MM-DD'),
    });
    this.hideDatePicker();
  }

  hideDatePicker= () => {
    this.setState({ isDatePickerVisible: false });
  }

  @autobind
  createInputForm () {
    const { updatePaymentDetails } = strings.order;
    const inputForm = [
      {
        placeholder: updatePaymentDetails.transactionId,
        type: 'textInput',
        handleFunction: this.handleTextInput,
        key: 'transactionId',
        value: this.state.transactionId,
        maxLength: 16,
        keyboardType: 'default',
      },
      {
        placeholder: updatePaymentDetails.date,
        type: 'datePicker',
        handleFunction: this.handleDateField,
        key: 'transactionDate',
        value: this.state.transactionDate,
        // maxLength: 16,
      },
      {
        placeholder: updatePaymentDetails.amount,
        type: 'textInput',
        handleFunction: this.handleTextInput,
        key: 'amount',
        value: this.state.amount,
        maxLength: 10,
        keyboardType: 'numeric',
      },
    ];
    return inputForm;
  }

  renderHeaderImage = () => {
    return (
      <View style={{ marginBottom: 5 }}>
        <Image
          style={styles.headingImage}
          source={HEADING_IMAGE}
          resizeMode="stretch"
        />
      </View>
    );
  }

  renderLogDetails = () => {
    const logValue = this.logItem?.logNumber;
    // const selectedLog = this.logItem[logValue];
    return (
      <View style={{ flexDirection: 'row', marginBottom: 15, alignItems: 'center' }}>
        <Text style={[styles.titleText, { fontSize: 16 }]}>{`Log No.: `}</Text>
        <Text style={[styles.descriptionText, { fontSize: 16 }]}>{logValue}</Text>
      </View>
    );
  }

  renderItem = (item) => {
    if (item.type === 'datePicker') {
      const dateFieldText = this.state.visibleDateValue || strings.order.updatePaymentDetails.date;
      return (
        <TouchableOpacity
          style={styles.dateInputField}
          onPress={() => this.setState({ isDatePickerVisible: true })}
        >
          <Text style={styles.inputFieldText}>{dateFieldText}</Text>
          <Image source={CALENDER_ICON} />
          <DateTimePicker
            isVisible={this.state.isDatePickerVisible}
            onConfirm={this.handleDatePicker}
            onCancel={() => this.hideDatePicker()}
            minimumDate={moment(new Date()).subtract(1, 'months')._d}
            date={new Date(this.state.dateIsoString)}
            maximumDate={new Date()}
            mode="date"
            is24hour
          />
        </TouchableOpacity>
      );
    }
    if (item.type === 'textInput') {
      return (
        <View style={styles.textInputField}>
          <CustomInput
            placeholder={item.placeholder}
            showIcon={false}
            textStyle={{ color: '#373e73', fontSize: 12 }}
            hideBottomLine
            keyboardType={item.keyboardType}
            placeholderTextColor="#373e73"
            value={item.value}
            onChangeText={(value) => this.handleTextInput(item, value)}
            maxLength={item.maxLength}
          />
        </View>
      );
    }
    return null;
  }

  renderSubmitButton = () => {
    return (
      <>
        <View style={styles.disclaimer}>
          <Text style={[styles.descriptionText, {color: '#3054C4', fontSize: 12}]}>
            {strings.order.updatePaymentDetails.disclaimer}
          </Text>
        </View>
        <CustomButton
          handleClick={() => this.submitPaymentDetails()}
          buttonContainer={styles.buttonContainer}
          linearGradient
          buttonGradientStyle={styles.button}
          buttonTitleStyle={styles.customButtonTitleStyle}
          buttonTitle="Submit"
          primaryColor="#6C93D4"
          secondaryColor="#3054C4"
        />
      </>
    );
  }

  renderInputContainer = () => {
    return (
      <View>
        <FlatList
          data={this.createInputForm()}
          renderItem={({ item }) => this.renderItem(item)}
          ListFooterComponent={({ item }) => this.renderSubmitButton(item)}
          keyExtractor={(_, index) => index.toString()}
        />
      </View>
    );
  }

  render() {
    return (
      <View style={styles.container}>
        <Loader loading={this.state.isLoading || this.props.cart.isLoading} />
        <Header
          navigation={this.props.navigation}
          screenTitle={strings.order.updatePaymentDetails.screenTitle}
        />
        {this.renderHeaderImage()}
        {this.renderLogDetails()}
        {this.renderInputContainer()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 5,
    // marginHorizontal: 10,
    paddingTop: 5,
    paddingHorizontal: 20,
    // borderRadius: 10,
  },
  headingImage: {
    height: 200,
    width: '100%',
    alignSelf: 'center',
  },
  titleText: {
    color: '#FF9201',
    ...Specs.fontBold,
    fontSize: 14,
  },
  descriptionText: {
    color: '#FF9201',
    ...Specs.fontSemiBold,
    fontSize: 14,
  },
  dateInputField: {
    flexDirection: 'row',
    height: 45,
    marginBottom: 15,
    paddingLeft: 15,
    paddingRight: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderColor: '#3054C4',
    borderWidth: 1,
    borderRadius: 8,
  },
  textInputField: {
    height: 45,
    marginBottom: 15,
    // paddingLeft: 15,
    paddingRight: 10,
    justifyContent: 'center',
    borderColor: '#3054C4',
    borderWidth: 1,
    borderRadius: 8,
  },
  inputFieldText: {
    color: '#373e73',
    ...Specs.fontMedium,
    fontSize: 12,
  },
  disclaimer: {
    marginTop: 10,
    marginHorizontal: 10,
    backgroundColor: '#3054C410',
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  buttonContainer: {
    height: 50,
    width: '100%',
    marginVertical: 10,
    justifyContent: 'center',
  },
  button: {
    height: 40,
    width: '100%',
    alignSelf: 'center',
    // borderWidth: 1,
    backgroundColor: '#4DA1CC',
    borderColor: '#4DA1CC',
    borderRadius: 10,
    marginBottom: 0,
  },
  customButtonTitleStyle: {
    fontSize: 16,
    color: '#FFFFFF',
    alignSelf: 'center',
    justifyContent: 'center',
  },
});
