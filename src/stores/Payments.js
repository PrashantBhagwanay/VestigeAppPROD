import { observable, makeAutoObservable, action } from 'mobx';
import NetworkOps from 'app/src/network/NetworkOps';
import * as Urls from 'app/src/network/Urls';
import { isNullOrEmpty } from '../utility/Utility';
import { PAYMENT_TYPE_PAYTM } from '../screens/payment/PaymentConstants';

export default class Payments {
  @observable paymentSaveError: String = '';

  constructor(store) {
    this.store = store;
    makeAutoObservable(this);
  }

  @action setPaymentSaveError = value => {
    this.paymentSaveError = value;
  };

  async createHash(data) {
    const orderDetails = {
      mid: data?.mid,
      orderId: data?.orderId,
      custId: data?.custId,
      amount: data?.amount,
      websiteName: data?.websiteName,
      email: data?.email,
      mobile: data?.mobile,
      callbackUrl: data?.callbackUrl,
    };
    
    if (this.store.cart.isApiV2Payment) {
      const url = `${Urls.ServiceEnum.PaytmHashApiV2}?orderId=${orderDetails?.orderId}`;
      const response = await NetworkOps.postToJson(url);
      return response?.txnToken;
    } else {
      const url = Urls.ServiceEnum.PaytmHash;
      const response = await NetworkOps.postToJson(url, orderDetails);
      return response?.txnToken;
    }
  }

  async verifyHash(data): Boolean {
    const response = await NetworkOps.postToJson(
      Urls.ServiceEnum.PaytmHashVerify,
      data,
    );
    return response.isValidCheckSum;
  }

  async savePaymentDetails(paymentResponse, pendingLogPaymentItem, paymentType) {
    let paymentDetailObject = [];
    let onlineOrderIDString, groupOrderId;
    console.log(pendingLogPaymentItem);
    if (pendingLogPaymentItem) {
      // const orderList = pendingLogPaymentItem['logNumber']
      // const orderIdList = []
      // console.log(pendingLogPaymentItem)
      // pendingLogPaymentItem[orderList].forEach((item)=> orderIdList.push(item.customerOrderNo))
      // onlineOrderIDString = orderIdList.toString()
      onlineOrderIDString = pendingLogPaymentItem.orders;
      groupOrderId = pendingLogPaymentItem.logNo;
    } else {
      onlineOrderIDString = this.store.checkout.onlineOrderIds;
      groupOrderId = this.store.checkout.ordersDetail.groupOrderId;
    }

    let paymentDetails = {};
    if (paymentType === PAYMENT_TYPE_PAYTM) {
      paymentDetails = {
        logNumber: groupOrderId,
        orderNumber: onlineOrderIDString,
        totalPay: paymentResponse['TXNAMOUNT'],
        transId: paymentResponse['TXNID'],
        bankReferenceNumber: paymentResponse['BANKTXNID'],
        distributorId: this.store.profile.distributorID.toString(),
        responseText: paymentResponse['RESPMSG'],
        responseCode: paymentResponse['RESPCODE'],
        status: paymentResponse['STATUS'],
        vestigeTransactionId: paymentResponse['ORDERID'],
      };
    } else {
      const telrOrderId = `${pendingLogPaymentItem?.logNo?.replace(/\//g,'-',)}${'-'}${Date.now()}`;
      paymentDetails = {
        logNumber: groupOrderId,
        orderNumber: onlineOrderIDString,
        totalPay: pendingLogPaymentItem?.totalPaymentAmount,
        transId: paymentResponse?.tranref,
        bankReferenceNumber: paymentResponse?.trace,
        distributorId: this.store.profile.distributorID.toString(),
        responseText: paymentResponse?.message,
        responseCode: paymentResponse?.status,
        status: paymentResponse?.status,
        vestigeTransactionId: telrOrderId,
      };
    }
    
    paymentDetailObject.push(paymentDetails);
    const paymentDetailsEnum = this.store.cart.isApiV2Payment
      ? Urls.ServiceEnum.PaymentDetailsApiV2
      : Urls.ServiceEnum.PaymentDetails;
    const response = await NetworkOps.postToJson(
      paymentDetailsEnum,
      paymentDetailObject,
    );
    if (response?.statusCode == 200) { // isNullOrEmpty(response?.message)
      return true;
    }
    this.setPaymentSaveError(response?.message || 'Something went wrong');
    return false;
  }

  async paymentDetailsCheckStatus(data) {
    const response = await NetworkOps.postToJson(
      Urls.ServiceEnum.PaymentVerifictionPaytmDetails,
      data,
    );
    if (isNullOrEmpty(response.message)) {
      return true;
    }
    this.setPaymentSaveError(response.message);
    return false;
  }

}
