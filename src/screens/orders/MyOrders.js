import { computed, observable, makeObservable } from 'mobx';
import React, { Component } from 'react';
import {
  View, 
  StyleSheet,
  SectionList,
  TouchableOpacity,
  Image,
  Text,
  Platform,
  FlatList
} from 'react-native';
import Loader  from 'app/src/components/loader/Loader';
import moment from 'moment';
import { inject, observer } from 'mobx-react';
import HeaderLeftIcons from 'app/src/components/navigation/HeaderLeftIcons';
import CustomTopTab from 'app/src/components/topTab/CustomTopTab';
import DateTimePicker from 'react-native-modal-datetime-picker';
import { Specs } from 'app/src/utility/Theme';
import { MyOrdersEnum } from 'app/src/utility/constant/Constants';
import OrderItem from 'app/src/screens/orders/OrderItem';
import { strings } from 'app/src/utility/localization/Localized';
import EmptyScreen from 'app/src/components/emptyScreen/EmptyScreen';
import OfflineNotice from 'app/src/components/OfflineNotice';
import autobind from 'autobind-decorator';
import { connectedToInternet } from 'app/src/utility/Utility';
import { CustomButton } from 'app/src/components/buttons/Button';
import { Header } from '../../components';
import OrderItemOffline from './OrderItemOffline';

const calendarIcon = require('app/src/assets/images/training/calenndarIcon.png')


const myOrdersTabTitle = [
  { title: MyOrdersEnum.Confirmed },
  { title: MyOrdersEnum.Cancelled },
  { title: MyOrdersEnum.Invoiced },
  { title: MyOrdersEnum.Delivered },
  { title: MyOrdersEnum.Offline }
];

@inject('cart','profile','auth','appConfiguration')
@observer
export default class MyOrders extends Component {

  @observable isInternetConnected: Boolean = true;
  
  constructor(props){
    super(props);
    makeObservable(this);
    this.isApiV2Enabled = this.props.appConfiguration.isApiV2Enabled;
    const fromDate = moment(new Date()).format(this.handleDateFormat())
    const toDate = moment(new Date()).format(this.handleDateFormat())
    this.state={
      selectedMyOrders: myOrdersTabTitle[0].title,
      isFromDatePickerVisible: false,
      fromDate: fromDate,
      toDate: toDate,
      isToDatePickerVisible: false,
      fromDateIsoString: new Date().toISOString(),
      toDateIsoString:  new Date().toISOString(),
    }
  }
 
  async componentDidMount() {
    this.isInternetConnected = await connectedToInternet();
    this.isInternetConnected && await this.getMyOrders()
    // this.isInternetConnected && await this.props.cart.fetchOrdersList();
  }

  handleDateFormat = () => {
    // return this.isApiV2Enabled ? 'DD/MM/YYYY' : 'YYYY-MM-DD';
    // ....... using v2 api format for both v1 and v2, things will be handled from backend..........
    return this.isApiV2Enabled ? 'DD/MM/YYYY' : 'DD/MM/YYYY';
  }

  @autobind
  async networkStatus(status) {
    if(status) {
      this.isInternetConnected = status;
      await this.getMyOrders()
      // await this.props.cart.fetchOrdersList();
    }
  }

  handleTabCallback = (type) => {
    const { selectedMyOrders } = this.state;
    if(type !== selectedMyOrders){
      this.setState({
        selectedMyOrders: type,
      })      
    }

    if(type==MyOrdersEnum.Offline ){
      this.getMyOfflineOrder();
      // alert(1); 
    }
  
   
    
  }

  @computed get historySections() {
    if(this.props.cart.ordersList.length) {
      if(this.state.selectedMyOrders === MyOrdersEnum.Confirmed ) {
        return [{title: '', data: this.props.cart.getConfirmedOrders.slice()}]
      }
      else if(this.state.selectedMyOrders === MyOrdersEnum.Cancelled)  {
        return [{title: '', data: this.props.cart.getCancelledOrders.slice()}]
      }
      else if(this.state.selectedMyOrders === MyOrdersEnum.Invoiced)  {
        return [{title: '', data: this.props.cart.getInvoicedOrders.slice()}]
      } else if(this.state.selectedMyOrders === MyOrdersEnum.Offline)  {
        // alert('ahdasdg');
        alert(JSON.stringify(this.props.cart.offlineOrdersList));
        return this.props.cart.offlineOrdersList;
        // return [{title: '', data: this.props.cart.getInvoicedOrders.slice()}]
      }

      else {
        return [{title: '', data: this.props.cart.getDeliveredOrders.slice()}]
      }
    } 
    return []
  } 


  current = () => {
    this.orderItem  = this.props.cart.ordersList[0];
    if(this.orderItem) {
      return (
        <OrderItem 
          countryId={this.props.profile.countryId}
          item={this.orderItem}
          distributorID={this.props.auth.distributorID}
          navigation={this.props.navigation}
          isApiV2Enabled={this.isApiV2Enabled}
        />
      )
    }
    return this.props.cart.isLoading ? null : <EmptyScreen myOrders />
  }

  async lazyload() {
    // console.log('reslazyurl')
    await this.props.cart.lazyLoadOrderList(this.state.fromDate, this.state.toDate)
  }

  History = () => {
    return(
      <SectionList 
        accessibilityLabel="Order_List"
        testID="Order_List"
        style={styles.historyOrdersList}
        contentContainerStyle={this.historySections.length === 0 && styles.emptyScreenView}
        // ListEmptyComponent={this.props.cart.isLoading ? null : <EmptyScreen myOrders />} 
        renderItem={({item}) =>  <OrderItem countryId={this.props.profile.countryId} item={item} distributorID={this.props.auth.distributorID} navigation={this.props.navigation} />}
        sections={this.historySections}
        keyExtractor={(item, index) => item + index}
        // onEndReached={() => this.lazyload()}
        // onEndReachedThreshold={0.8}
      />
    )
  }

  OfflineOrder = () => {
    console.log("OFFLINE ====");
    return(
     
      <FlatList
      data={this.props.cart.offlineOrdersList}
      contentContainerStyle={styles.bottomSheetItem}
      renderItem={({ item }) => {
        return (
          <OrderItemOffline countryId={this.props.profile.countryId} item={item} distributorID={this.props.auth.distributorID} navigation={this.props.navigation} />
        );
      }}
      keyExtractor={(_, i) => i.toString()}
      ItemSeparatorComponent={() => <View style={{ height:6 }} />}
    />
    
      // <SectionList 
      //   accessibilityLabel="Order_List"
      //   testID="Order_List"
      //   style={styles.historyOrdersList}
      //   contentContainerStyle={this.props.cart.offlineOrdersList.length === 0 && styles.emptyScreenView}
      //   // ListEmptyComponent={this.props.cart.isLoading ? null : <EmptyScreen myOrders />} 
      //   renderItem={({item}) =>  <OrderItem countryId={this.props.profile.countryId} item={item} distributorID={this.props.auth.distributorID} navigation={this.props.navigation} />}
      //   sections={this.props.cart.offlineOrdersList}
      //   keyExtractor={(item, index) => item + index}
      //   // onEndReached={() => this.lazyload()}
      //   // onEndReachedThreshold={0.8}
      // />
    )
  }

  getMyOrders = async() => {
    await this.props.cart.fetchOrdersList(this.state.fromDate, this.state.toDate)
  }

  getMyOfflineOrder =async ()=>{
    //2024-04-23
    // var toDate=moment().format('YYYY-MM-DD');
    // var fromDate= moment().subtract(2, 'months').format('YYYY-MM-DD');
    var toDate=this.state.toDate;
    var fromDate = this.state.fromDate;
    if(fromDate!="From Date"){
      fromDate = moment(this.state.fromDate, 'DD/MM/YYYY').format('YYYY-MM-DD');
    }
    if(toDate!="To Date"){
      toDate = moment(this.state.toDate, 'DD/MM/YYYY').format('YYYY-MM-DD');
    }
    // var toDate=moment(this.state.toDate, 'DD/MM/YYYY').format('YYYY-MM-DD');
    // var fromDate = moment(this.state.fromDate, 'DD/MM/YYYY').format('YYYY-MM-DD');
    await this.props.cart.fetchOfflineOrdersList(fromDate, toDate)
  }

  
  handleToDatePicker=(date)=>{
    this.setState({
      toDateIsoString: date.toISOString(),
      toDate: moment(date,'YYYY-MM-DDTHH: mm: ss').format(this.handleDateFormat())
    },()=>{
      this.hideDatePicker()
      setTimeout(()=>{
        if(this.state.selectedMyOrders==MyOrdersEnum.Offline){
          this.getMyOfflineOrder()
        }else{
          this.getMyOrders()
        }
        
      },500)
    })
  }


  handleFromDatePicker=(date)=>{
    this.setState({
      fromDateIsoString: date.toISOString(),
      fromDate: moment(date,'YYYY-MM-DDTHH: mm: ss').format(this.handleDateFormat())
    },()=>{
      this.hideDatePicker('from');
      setTimeout(()=>{
        if(this.state.selectedMyOrders==MyOrdersEnum.Offline){
          this.getMyOfflineOrder()
        }else{
          this.getMyOrders()
        }
      
      },500)
    })
   
  }


  hideDatePicker=(mode)=>{
    if(mode==='from'){
      this.setState({isFromDatePickerVisible: false})
    }
    else {
      this.setState({isToDatePickerVisible: false})
    }
  }

  clearDateValues = () => {
    this.setState({
      fromDate:'From Date',
      toDate:'To Date',
      fromDateIsoString:'',
      toDateIsoString:''
    }, () => {
      if(this.state.selectedMyOrders==MyOrdersEnum.Offline){
        this.getMyOfflineOrder()
      }else{
        this.getMyOrders()
      }

    })
  }


  renderDateCalendar(){
    return (
      <View style={{ marginBottom: 5 }}>
        <View style={styles.datePickerContainer}>
          <TouchableOpacity 
            style={styles.datePicker} 
            onPress={()=>{
              if(this.state.fromDateIsoString == "" || this.state.fromDateIsoString == undefined || this.state.fromDateIsoString == null){
                this.state.fromDateIsoString = new Date().toISOString();
              }
              this.setState({ isFromDatePickerVisible: true })}
            }
          >
            <Image source={calendarIcon} />
            <Text style={styles.textDatePicker}>{this.state.fromDate}</Text>
            <DateTimePicker
              isVisible={this.state.isFromDatePickerVisible}
              onConfirm={this.handleFromDatePicker}
              onCancel={()=>this.hideDatePicker('from')}
              // minimumDate={new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()-4)}
              // maximumDate={new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()+30)}
              maximumDate={new Date()}
              date={new Date(this.state.fromDateIsoString)}
              mode='date'
              is24hour
              display={Platform.OS === 'ios' ? 'inline' : 'default'}    
            />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.datePicker} 
            onPress={()=>{
              if(this.state.toDateIsoString == "" || this.state.toDateIsoString == undefined || this.state.toDateIsoString == null){
                this.state.toDateIsoString = new Date().toISOString();
              }
              this.setState({ isToDatePickerVisible: true })}
            }
          >
            <Image source={calendarIcon} />
            <Text style={styles.textDatePicker}>{this.state.toDate}</Text>
            <DateTimePicker
              isVisible={this.state.isToDatePickerVisible}
              onConfirm={this.handleToDatePicker}
              onCancel={()=>this.hideDatePicker()}
              minimumDate={new Date(this.state.fromDateIsoString)}
              date={new Date(this.state.toDateIsoString)}
              // maximumDate={new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())}
              maximumDate={new Date()}
              mode='date'
              is24hour
              display={Platform.OS === 'ios' ? 'inline' : 'default'} 
            />
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginVertical: 5, marginHorizontal: 5}}>
          <CustomButton
            {...this.props}
            isDisabled={false}
            handleClick={this.clearDateValues}
            linearGradient
            buttonContainer={{ 'width': 100, alignSelf: 'flex-end', height: 40 }}
            buttonTitle="Clear"
            buttonTitleStyle={styles.customButtonTitleStyle}
            primaryColor="#6895d4"
            secondaryColor="#57a5cf"
          />
        </View>
      </View>
    )
  }


  render(){
    const { selectedMyOrders } = this.state;
    return(
      <View style={styles.mainView}>
        { !this.isInternetConnected && <OfflineNotice networkStatus={(status) => this.networkStatus(status)} /> }
        <Loader loading={this.props.cart.isLoading} />  
        <Header
          navigation={this.props.navigation}
          screenTitle={strings.order.myOrder.heading}
        />
        <CustomTopTab 
          selectedValue={selectedMyOrders} 
          showTabDivider
          handleTabCallback={this.handleTabCallback} 
          selectedTextStyle={[styles.selectedTabText]}
          unSelectedTextStyle={[styles.unselectedTabText]}
          data={myOrdersTabTitle} 
          style={{marginBottom: 5}}
        />

        {this.renderDateCalendar()}
        {/* {this.state.selectedMyOrders !== MyOrdersEnum.Offline?:null} */}
        { this.state.selectedMyOrders === MyOrdersEnum.Offline?this.OfflineOrder(): this.History() }
      </View>
    )
  }
}

const styles=StyleSheet.create({
  mainView: {
    flex: 1,
  },
  unselectedTabText: {
    marginLeft: 5,
    color: '#999999',
    marginRight: 5,
    fontSize:11,
    ...Specs.fontMedium,
  },
  selectedTabText: {
    marginLeft: 5,
    color: '#266ac7',
    marginRight: 5,
    fontSize:11,
    ...Specs.fontMedium,
  },
  historyOrdersList: {
    // marginTop:6
  },
  emptyScreenView: {
    flex:1, 
    marginBottom:1,
    justifyContent:'center',
    alignItems:'center',
  },
  textDatePicker: {
    marginLeft:8,
    paddingLeft:8,
    borderLeftWidth:0.5,
    borderLeftColor:'#c8c9d3',
    color:'#3f4967'
  },
  datePickerContainer:{
    justifyContent:'space-between',
    flexDirection:'row',
    backgroundColor: 'white',
    // borderWidth: 1.5,
    // borderColor: '#999999'
    borderRadius: 5,
    marginVertical: 5,
    marginHorizontal: 10,
    shadowOffset: { width: 0, height: 0 },
    shadowColor: '#808080',
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 4,
  },
  datePicker: {
    flexDirection:'row',
    marginTop:7,
    padding:8,
    marginBottom:7,
    marginHorizontal:8,
    // borderBottomWidth:1,
    // borderBottomColor:'#c8c9d3',
    backgroundColor: '#f1f3f4',
    borderRadius: 5
  },
  customButtonTitleStyle: {
    fontSize: 14,
    color: '#ffffff',
    ...Specs.fontMedium,
    alignSelf: 'center',
    justifyContent: 'center'
  }
})