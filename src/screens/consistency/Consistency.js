import React, { Component } from 'react';
import { View, StyleSheet, FlatList, Text,  TouchableOpacity, Clipboard } from 'react-native';
import CustomTopTab from 'app/src/components/topTab/CustomTopTab';
import ConsistencyStarComponent from 'app/src/screens/consistency/consistencyComponent/ConsistencyStarComponent';
import { ConsistencyEnum } from 'app/src/utility/constant/Constants';
import Loader  from 'app/src/components/loader/Loader';
import { Specs } from 'app/src/utility/Theme';
import { observer, inject } from 'mobx-react'; 
import { Icon } from 'react-native-elements';
import { Toast } from 'app/src/components/toast/Toast';
import { strings } from 'app/src/utility/localization/Localized';
import autobind from 'autobind-decorator';
import AlertClass from 'app/src/utility/AlertClass';
import EmptyScreen from 'app/src/components/emptyScreen/EmptyScreen';
import { ConsistencyDateFormat, showToast, priceWithCurrency, connectedToInternet } from 'app/src/utility/Utility';
import OfflineNotice from 'app/src/components/OfflineNotice';
import { action, observable, makeObservable} from 'mobx';
import DynamicScreen from  'app/src/screens/dynamicScreen/DynamicScreen'

// Navigation Icons
import HeaderLeftIcons from 'app/src/components/navigation/HeaderLeftIcons';
import {CustomButton} from '../../components/buttons/Button'
import { Header } from '../../components';

const data = [
  { title: ConsistencyEnum.Achieved },
  { title: ConsistencyEnum.Vouchers}
];

// const voucherData = [
//   {
//     quantity: 1,
//     PV: 100
//   },
//   {
//     quantity: 2,
//     PV: 100
//   }
// ]

const voucherData = [
  {
    distributorId: '11000597',
    businessMonth: '2020-06-30 23:59:00',
    code: '100 PV',
    voucherCount: '1',
    pvCombination60: '1*60',
    pvCombinations100: '0',
    amount: '2500',
    voucherAmount: '2500',
    combinationId: '10'
  }
]
@inject('myConsistency')
@observer
export default class Consistency extends Component {
  showAlert = false;
  @observable isInternetConnected: Boolean = true;
  
  constructor(props) {
    super(props);
    makeObservable(this);
    this.state = {
      selectedConsistencyType: ConsistencyEnum.Achieved,
    };
  }

  @autobind
  toast(message, type){
    Toast.show(message, {
      duration: Toast.durations.SHORT,
      type: type,
      shadow: false,
      animation: true,
      hideOnPress: true,
      delay: 0,
    });
  }

  async componentDidMount() {
    this.isInternetConnected = await connectedToInternet();
    // this.isInternetConnected && await this.getComponentData();
  }

  @autobind
  async networkStatus(status) {
    if(status) {
      this.isInternetConnected = status;
      await this.getComponentData()
    }
  }
  
  @autobind
  async getComponentData() {
    const status = await this.props.myConsistency.fetchMyConsistencyData(); 
    if(!status) {
      this.toast(this.props.myConsistency.errorMessage, Toast.type.ERROR)
    }
  }
  

  handleTabCallback = (type) => {
    const { selectedConsistencyType } = this.state;
    if(type!==selectedConsistencyType){
      this.setState({
        selectedConsistencyType:type,
      })
    }
  }

  showDetailedCell=(item)=>{
    if(item.invoiceDate && this.props.myConsistency.invoiceDate !== item.invoiceDate){
      this.props.myConsistency.setInvoiceDate(item.invoiceDate);
    } 
    else{
      this.props.myConsistency.setInvoiceDate('');
    }
  }

  showArrowIcon=(item)=>{
    if (item.invoiceDate === this.props.myConsistency.invoiceDate) {
      return(
        <Icon
          name='arrow-up'
          type='simple-line-icon'
          color='black'
          size={16}
        />
      );
    }
    else{
      return(
        <Icon
          name='arrow-down'
          type='simple-line-icon'
          color='black'
          size={16}
        />
      )
    }
  }

  detailedCell=(item)=>{
    if (item.invoiceDate === this.props.myConsistency.invoiceDate) {
      return (
        <FlatList 
          data={item.invoices}
          keyExtractor={(item, index) => item + index}
          ListHeaderComponent={()=> (
            <View style={[styles.detailedCell,styles.detailedCellHeader]}>
              <Text style={styles.invoiceListHeader}>{strings.consistencyScreen.invoiceNumber}</Text>
              <Text style={styles.invoiceListHeader}>{strings.consistencyScreen.amount}</Text>  
            </View>
          )}
          renderItem={({item}) => (
            <View style={styles.detailedCell}>
              <Text style={styles.invoiceData}>{item.invoiceNumber}</Text>
              <Text style={styles.invoiceData}>{item.amount}</Text>
            </View>
          )}    
        />
      );
    } 
    else {
      return null
    }
  }

  calculateCurrentMonthInvoices = () => {
    let filteredArray, cncCount;
    if(this.props.myConsistency.consistencyData &&  this.props.myConsistency.consistencyData.currentMonthInvoices) {
      filteredArray = this.props.myConsistency.consistencyData.currentMonthInvoices.filter(function(el) { return el; })
      cncCount = filteredArray.length
    }
    let cncResultList = this.props.myConsistency.consistencyData ? this.props.myConsistency.consistencyData.cnc.sort(function(a, b){return b-a}) : [];
    let numberOfTimesTobeSwapped = [];
    let initialNumberOfConsistencies = 0;
    let finalNumberOfConsistency = 0;
    cncResultList && cncResultList.forEach( (cncNumber, index)=>{
      if(cncNumber) {
        initialNumberOfConsistencies = initialNumberOfConsistencies + 1
      }
      if(cncNumber >= 4) {
        numberOfTimesTobeSwapped.push(index);
        cncResultList[index] = 0;
      }
    })
    cncResultList = cncResultList.concat(cncResultList.splice(0,numberOfTimesTobeSwapped.length))
    cncResultList && cncResultList.forEach( (cncNumber, index)=> {
      if(cncCount) {
        cncResultList[index] = cncNumber + 1
      }
      cncCount = cncCount - 1
      cncCount = cncCount < 0 ? 0 : cncCount
      if(cncNumber) {
        finalNumberOfConsistency = finalNumberOfConsistency + 1
      }
    })
    let differenceNumberOfConsistencies = initialNumberOfConsistencies- (this.props.myConsistency.consistencyData &&  this.props.myConsistency.consistencyData.currentMonthInvoices &&  this.props.myConsistency.consistencyData.currentMonthInvoices.length)
    if(differenceNumberOfConsistencies > 0 && this.showAlert ) {
      this.showAlert = false;
      // AlertClass.showAlert('Consistency Message', 
      //   `You need to make ${differenceNumberOfConsistencies} more invoices of more than ${priceWithCurrency(2500)} to maintain your last month consistency.`, 
      //   [{text: 'OK', onPress: () => console.log('OK Pressed')}]) 
    }
    return cncResultList ;
  }
  
  getConsistencyData = () => {
    const { consistencyData, invoiceInfoList, isLoading } = this.props.myConsistency;
    return(
      <View style={{flex: 1}}>
        <ConsistencyStarComponent consistencyData={consistencyData} cncDataList={this.calculateCurrentMonthInvoices()} />
        <View style={{paddingBottom: 80}}>
          <FlatList
            data={invoiceInfoList}
            keyExtractor={(item, index) => item + index}
            stickyHeaderIndices={[0]}
            extraData={this.props.myConsistency.invoiceDate}
            contentContainerStyle={invoiceInfoList.length === 0 && styles.emptyScreenView}
            ListEmptyComponent={isLoading ? null : <EmptyScreen myVouchers />} 
            ListHeaderComponent={()=> (
              <View style={styles.listHeader}>
                <Text style={styles.listHeaderText}>{strings.consistencyScreen.monthTitle}</Text>
                <Text style={styles.listHeaderText}>{strings.consistencyScreen.totalInvoiceTitle}</Text>  
              </View>
            )}
            renderItem={({item}) => (
              <View style={{paddingBottom:15, marginBottom: 7}}>
                <View style={styles.cellView}>
                  <View style={{flex:1,flexDirection:'row',justifyContent:'space-between'}}>
                    <Text style={{fontSize:16,...Specs.fontRegular}}>{ConsistencyDateFormat(new Date(item.invoiceDate))}</Text>
                    <Text style={{fontSize:16,...Specs.fontRegular}}>{item.totalAmount}</Text>
                  </View>
                  {this.detailedCell(item)}
                </View>
                <TouchableOpacity
                  style={styles.accordionArrow}
                  onPress={()=>this.showDetailedCell(item)}
                >
                  {this.showArrowIcon(item)}
                </TouchableOpacity>
              </View>
            )
            }
          />
        </View>
      </View>
    )
  }

  showRedeemAlert=(item)=>{
    if(!this.showAlert){
      this.showAlert=true
      AlertClass.showAlert('',`Are you sure you want to redeem ${item.code} ?`, [
        {
          text: strings.commonMessages.cancel,
          onPress: () => {
            this.showAlert = false;
          }
        },
        {
          text: strings.commonMessages.redeem,
          onPress: () => {
            (this.showAlert = false)
            this.props.myConsistency.redeemVoucher(item)
          }
        }
      ])
    }
  }

  getVouchers(item){
    if(item.pvCombinations100=== '0'){
      return item.pvCombination60
    }
    return item.pvCombinations100
  }

  getVouchersData = (vouchersList=[], value) => {
    const { isLoading } = this.props.myConsistency;
    if(!value){
      return(
        <FlatList 
          data={vouchersList}
          style={{marginTop:10}}
          contentContainerStyle={vouchersList.length === 0 && styles.emptyScreenView}
          ListEmptyComponent={isLoading ? null : <EmptyScreen myVouchers />}   
          keyExtractor={(item, index) => item + index}
          renderItem={({item}) => (
            <View key={item.voucherNo} style={styles.listComponentContainer}>
              <Text 
                style={styles.VoucherNoTitleStyle}  
                onPress={async ()=> { 
                  await Clipboard.setString(item.voucherNumber)
                  showToast(strings.referralScreen.copiedToCLipBoardTitle, Toast.type.SUCCESS) 
                }}
              >
                {`${strings.consistencyScreen.voucherNo}${item.voucherNumber}`}
              </Text>
              <View style={styles.voucherInfo}>
                <View style={styles.listTextRowContainer}>
                  <View style={styles.textRowContainer}>
                    <Text style={styles.leftTextStyle}>{strings.consistencyScreen.voucherType}</Text>
                    <Text style={styles.rightTextStyle}>{item.type}</Text>
                  </View>
                  <View style={styles.textRowContainer}>
                    <Text style={styles.leftTextStyle}>{strings.consistencyScreen.voucherStatus}</Text>
                    <Text style={styles.rightTextStyle}>{item.status}</Text>
                  </View>
                  <View style={styles.textRowContainer}>
                    <Text style={styles.leftTextStyle}>{strings.consistencyScreen.invoiceNo}</Text>
                    <Text style={styles.rightTextStyle}>{item.invoiceNumber}</Text>
                  </View>
                </View>
              </View>
            </View>
          )}
        />
      ) 
    }
    else {
      return (
        <FlatList 
          data={voucherData}
          style={{marginTop:10}}
          contentContainerStyle={voucherData.length === 0 && styles.emptyScreenView}
          ListEmptyComponent={isLoading ? null : <EmptyScreen myVouchers />}   
          ListHeaderComponent={()=> <Text style={{...styles.newVoucherText,marginBottom:10}}>{voucherData.length > 0 ? `Total ${voucherData[0].code}` : ''}</Text>}
          renderItem={({item, index}) => (
            <View style={styles.voucherListContainer}>
              <View style={{flex:0.5,paddingLeft:13,paddingTop:8}}>
                <Text style={{...styles.newVoucherText,textAlign:'left'}}>{`Voucher ${index+1}`}</Text>
                <Text style={styles.newPvText}>
                  {`${this.getVouchers(item)} PV`}
                </Text>
                <Text style={{...styles.newPvText}}>
                  ₹
                  {item.voucherAmount}
                </Text>
              </View>
              <CustomButton buttonContainer={styles.redeemButton} accessibilityLabel="Redeem Button" handleClick={() => this.showRedeemAlert(item)} buttonTitle="Redeem" buttonTitleStyle={styles.redeemButtonText} />
            </View>
          )}
          keyExtractor={(item, index) => index.toString()}
        />
     
      )
    }
  }

  render() {
    let { selectedConsistencyType } = this.state;
    const { isLoading } = this.props.myConsistency;
    return(
      <View style={styles.mainView}>
        { !this.isInternetConnected && <OfflineNotice networkStatus={(status) => this.networkStatus(status)} /> }
        <Header
          navigation={this.props.navigation}
          screenTitle={strings.consistencyScreen.myConsistency}
        />
        {/* { this.isInternetConnected && <Loader loading={isLoading} />} */}
        {/* <CustomTopTab selectedValue={selectedConsistencyType} showTabDivider handleTabCallback={this.handleTabCallback} data={data} />
        { (selectedConsistencyType === ConsistencyEnum.Achieved) 
          ? (this.getConsistencyData()) : (this.getVouchersData(this.props.myConsistency.vouchersList, false)) } */}
        <DynamicScreen />
      </View>
    );
  }
}
const styles = StyleSheet.create({
  mainView: {
    backgroundColor: '#fff',
    flex: 1
  },
  cellView: {
    zIndex: -1,
    backgroundColor: '#fff',
    padding: 15,
    marginTop: 5,
    borderRadius: 2,
    elevation: 2,
    shadowOffset: { width: 0, height: 4 },
    shadowColor: '#80c2c6cf',
    shadowOpacity: 0.2,
  },
  listHeader: {
    zIndex:-1, 
    padding:12, 
    flex:1, 
    backgroundColor:'#FAFAFA', 
    flexDirection:'row', 
    justifyContent:'space-between',
  },
  listHeaderText:{
    fontSize:12,
    ...Specs.fontMedium
  },
  newPvText:{
    ...Specs.fontMedium,
    fontSize: 14,
    paddingTop: 13,
    paddingLeft:30
  },
  detailedCell: {
    flexDirection:'row',
    justifyContent:'space-around',
  },
  detailedCellHeader: {
    marginTop:'3%',
    marginBottom:'1%',
    borderTopWidth:0.5,
    paddingTop:10
  },
  accordionArrow: {
    elevation: 3,
    shadowOffset: { width: 2, height: 4 },
    shadowColor: '#80646464',
    shadowOpacity: 0.2,
    zIndex: 1, 
    alignSelf:'center', 
    justifyContent:'center', 
    position:'absolute', 
    bottom: 3, 
    backgroundColor: '#fff', 
    width: 30, 
    height: 30, 
    borderRadius: 50
  },
  invoiceListHeader:{
    ...Specs.fontSemibold,
    fontSize:12,
  },
  invoiceData:{
    ...Specs.fontRegular,
    fontSize:16
  },
  listComponentContainer: {
    backgroundColor: '#FFFFFF',
    marginTop: 1,
    paddingTop:13
  },
  voucherListContainer:{
    backgroundColor: '#FFFFFF',
    marginTop: 5,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: '#c8c9d359',
  },
  VoucherNoTitleStyle: {
    ...Specs.fontSemibold,
    marginLeft: 18,
    fontSize: 14
  },
  newVoucherText:{
    ...Specs.fontMedium,
    fontSize: 18,
    textAlign:'center',
    paddingTop:5
  },
  redeemButtonText:{
    ...Specs.fontSemibold,
    color: '#fff'
  },
  redeemButton:{
    backgroundColor: '#1D72FF',
    alignItems: 'center',
    justifyContent:'center',
    height:40,
    marginTop: 15,
  },
  listTextRowContainer: {
    flexDirection: 'column',
    marginTop: 10
  },
  textRowContainer: {
    flexDirection: 'row',
    marginLeft: 18,
    marginTop:4
  },
  leftTextStyle: {
    ...Specs.fontRegular,
    color: '#3f4967',
    fontSize: 12,
    flex: 0.4,
  },
  rightTextStyle: {
    ...Specs.fontMedium,
    color: '#3f4967',
    fontSize: 12,
    flex: 0.6,
  },
  voucherInfo: {
    paddingBottom:11
  },
  emptyScreenView: {
    flex:1, 
    marginBottom:1,
    justifyContent:'center',
    alignItems:'center',
  },
});
