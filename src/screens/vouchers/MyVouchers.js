import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import { observer, inject } from 'mobx-react';
import VoucherList from 'app/src/screens/vouchers/component/voucherList';
import Loader  from 'app/src/components/loader/Loader';
import { MyVouchersEnum } from 'app/src/utility/constant/Constants';
import { Toast } from 'app/src/components/toast/Toast';
import CustomTopTab from 'app/src/components/topTab/CustomTopTab';
import autobind from 'autobind-decorator';
import { _ } from 'lodash';
import OfflineNotice from 'app/src/components/OfflineNotice';
import { observable, computed, makeObservable } from 'mobx';
import { connectedToInternet } from 'app/src/utility/Utility';
import AlertClass from 'app/src/utility/AlertClass';
import { strings } from 'app/src/utility/localization/Localized';

// Navigation Icons
import HeaderLeftIcons from 'app/src/components/navigation/HeaderLeftIcons';
import { Header } from '../../components';

const voucherTypes = [
  { title: MyVouchersEnum.ProductVouchers },
  { title: MyVouchersEnum.BonusVouchers },
];

@inject('myVouchers')
@observer

export default class MyVouchers extends Component {

  @observable isInternetConnected: Boolean = true;

   
  constructor(props){
    super(props);
    makeObservable(this);
    this.state={
      selectedVoucherType: voucherTypes[0].title,
    }
  }

  @computed get bonusVouchersData() {
    const data = _.filter(this.props.myVouchers.bonusVouchersList, (voucher)=>{
      return voucher.voucherNo != 'null'
    });
    return data
  }

  @computed get productVouchersData() {
    const data = _.filter(this.props.myVouchers.productVouchersList, (voucher)=>{
      return voucher.voucherNo != 'null'
    });
    return data
  }

  @autobind
  showToast(message: string, toastType:Toast.type) {
    // Add a Toast on screen.
    Toast.show(message, {
      duration: Toast.durations.SHORT,
      type: toastType,
      shadow: false,
      animation: true,
      hideOnPress: true,
      delay: 0,
    })
  }

  async componentDidMount(){
    this.isInternetConnected = await connectedToInternet();
    if(this.isInternetConnected){
      await this.getComponentData()
    }
  }

  @autobind
  async networkStatus(status) {
    if(status) {
      this.isInternetConnected = status;
      await this.getComponentData();
    }
  }

  @autobind
  async getComponentData() {
    const res = await this.props.myVouchers.getVouchersData();
    if(!res) {
      this.showToast(this.props.myVouchers.responseMessage, Toast.type.ERROR);
    }
  }

  handleTabCallback = (type) => {
    const { selectedVoucherType } = this.state;
    if(type!==selectedVoucherType){
      this.setState({
        selectedVoucherType: type,
      })
    }
  }

  handleRenewVoucher = async (item) => {
    const voucherTypeKey = this.state.selectedVoucherType === MyVouchersEnum.ProductVouchers ? MyVouchersEnum.productVouchersKey : MyVouchersEnum.bonusVouchersKey;
    const res = await this.props.myVouchers.renewVoucher(voucherTypeKey,item.voucherNo);
    if(res.success){
      AlertClass.showAlert('', 
        res.message, 
        [{text: strings.commonMessages.ok, onPress: () => this.getComponentData()}]
      )
    }
    else{
      this.showToast(res.message, Toast.type.ERROR);
    }
  }

  render(){
    const { selectedVoucherType } = this.state;
    return(
      <View style={styles.container}>
        { !this.isInternetConnected && <OfflineNotice networkStatus={(status) => this.networkStatus(status)} /> }
        <Loader loading={this.props.myVouchers.isLoading} />
        <Header
          navigation={this.props.navigation}
          screenTitle={'My Vouchers'}
        />
        <CustomTopTab 
          showTabDivider
          selectedValue={selectedVoucherType}                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   
          handleTabCallback={this.handleTabCallback} 
          data={voucherTypes} 
        />
        <VoucherList 
          voucherDataList={selectedVoucherType === MyVouchersEnum.ProductVouchers ? this.productVouchersData : this.bonusVouchersData} 
          isLoading={this.props.myVouchers.isLoading}
          handleRenewVoucher={this.handleRenewVoucher}
        />
      </View>
    );
  }
}

const styles=StyleSheet.create({ 
  container: {
    flex: 1,
    backgroundColor: '#EFF3F7',
  },
})