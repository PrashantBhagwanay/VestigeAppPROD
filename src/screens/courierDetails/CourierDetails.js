import React, {Component} from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Text,
  Image,
} from 'react-native';
import Loader from 'app/src/components/loader/Loader';
import { action, observable, makeObservable } from 'mobx';
import { inject, observer } from 'mobx-react';
import moment from 'moment';
import autobind from 'autobind-decorator';
import HeaderLeftIcons from 'app/src/components/navigation/HeaderLeftIcons';
import {strings} from 'app/src/utility/localization/Localized';
import { Toast } from 'app/src/components/toast/Toast';
import { dateFormat, connectedToInternet, priceWithCurrency } from 'app/src/utility/Utility';
import AlertClass from 'app/src/utility/AlertClass';
import { CustomButton } from 'app/src/components/buttons/Button';
import DateTimePicker from 'react-native-modal-datetime-picker';
import { Specs } from 'app/src/utility/Theme';
import OfflineNotice from 'app/src/components/OfflineNotice';
import LinearGradient from 'react-native-linear-gradient';
import { string } from 'prop-types';
import EmptyScreen from 'app/src/components/emptyScreen/EmptyScreen';
import { Header } from '../../components';

const calendarIcon = require('app/src/assets/images/training/calenndarIcon.png');

@inject('auth','profile', 'cart')
@observer
export default class CourierDetails extends Component{

  @observable isInternetConnected: Boolean = true;

  constructor(props){
    super(props);
    makeObservable(this);
    const fromDate = moment(new Date()).format('YYYY-MM-DD')
    const toDate = moment(new Date()).format('YYYY-MM-DD')
    this.state = {
      isFromDatePickerVisible: false,
      fromDate: fromDate,
      toDate: toDate,
      isToDatePickerVisible: false,
      fromDateIsoString: new Date().toISOString(),
      toDateIsoString:  new Date().toISOString(),
    }
  }

  async componentDidMount(){
    this.isInternetConnected = await connectedToInternet();
    this.isInternetConnected && await this.getCourierDetails();
  }

  getCourierDetails = async () => {
    const res = await this.props.cart.getCourierDetails(this.state.fromDate, this.state.toDate);
    // if(!res.success){
    //   this.showToast(strings.emptyScreenMessages.noDataFoundMessage, Toast.type.ERROR);
    // }
  }

  @autobind
  async networkStatus(status) {
    if(status) {
      this.isInternetConnected = status;
      await this.getCourierDetails();
    }
  }

  @autobind
  showToast(message: string, type: string){
    Toast.show(message, {
      duration: Toast.durations.SHORT,
      type: type,
      shadow: false,
      animation: true,
      hideOnPress: true,
      delay: 0,
    });
  }
  
  /**@description  datetime picker related operations start */

  handleToDatePicker=(date)=>{
    this.setState({
      toDateIsoString: date.toISOString(),
      toDate: moment(date,'YYYY-MM-DDTHH: mm: ss').format('YYYY-MM-DD')
    },()=>{
      this.hideDatePicker()
      setTimeout(()=>{
        this.getCourierDetails()
      },500)
    })
  }


  handleFromDatePicker=(date)=>{
    this.setState({
      fromDateIsoString: date.toISOString(),
      fromDate: moment(date,'YYYY-MM-DDTHH: mm: ss').format('YYYY-MM-DD')
    })
    this.hideDatePicker('from');
  }


  hideDatePicker=(mode)=>{
    if(mode==='from'){
      this.setState({isFromDatePickerVisible: false})
    }
    else {
      this.setState({isToDatePickerVisible: false})
    }
  }

  // clearDateValues = () => {
  //   this.setState({
  //     fromDate:'From Date',
  //     toDate:'To Date',
  //     fromDateIsoString:'',
  //     toDateIsoString:''
  //   }, () => {
  //     this.getCourierDetails()
  //   })
  // }

  renderDateCalendar(){
    return (
      <View style={{ marginBottom: 10 }}>
        <View style={{justifyContent:'space-between', flexDirection:'row', paddingHorizontal: 5}}>
          <TouchableOpacity 
            style={styles.datePicker} 
            onPress={() => {
              if(this.state.fromDateIsoString == '' || this.state.fromDateIsoString == undefined || this.state.fromDateIsoString == null){
                this.state.fromDateIsoString = new Date().toISOString();
              }
              this.setState({ isFromDatePickerVisible: true })
            }}
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
            />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.datePicker} 
            onPress={()=>{
              if(this.state.toDateIsoString == '' || this.state.toDateIsoString == undefined || this.state.toDateIsoString == null){
                this.state.toDateIsoString = new Date().toISOString();
              }
              this.setState({ isToDatePickerVisible: true })
            }}
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
            />
          </TouchableOpacity>
        </View>
        {/* <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginVertical: 10}}>
          <CustomButton
            {...this.props}
            isDisabled={false}
            handleClick={this.clearDateValues}
            linearGradient
            buttonContainer={{ 'width': 120, alignSelf: 'flex-end', height: 40 }}
            buttonTitle="Clear"
            buttonTitleStyle={styles.customButtonTitleStyle}
            primaryColor="#6895d4"
            secondaryColor="#57a5cf"
          />
        </View> */}
      </View>
    )
  }
  /**  ..........datetime picker related operations stop............... */

  courierDetailsItem = (item) => {
    if(item){
      return(
        <View 
          style={styles.listItemContainer} 
          // accessibilityLabel="Order_Item"
          // testID="Order_Item"
        >
          <LinearGradient 
            colors={['#4481eb','#04befe']} 
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }} 
            style={styles.courier}
          >
            <Text style={[styles.courierId, {color:'#fff'}]}>
              {`${strings.courierDetails.invoiceNo} : `}
                &nbsp; 
              <Text style={[styles.courierId]}>{item?.invoiceNo}</Text>
            </Text>
            {/* <TouchableOpacity onPress={()=> navigation.navigate('orderDetail', { item: item })}>
              <Text style={styles.viewDetails}>View Details</Text>
            </TouchableOpacity> */}
          </LinearGradient>
          <View style={styles.courierItemContainer}>
            <View style={styles.details}>
              <Text style={[styles.detailsData, styles.detailLabelLeftSide]}>{strings.courierDetails.amount}</Text>
              <Text style={[styles.detailsData, styles.detailLabelRightSide]}>{priceWithCurrency(this.props.profile.countryId, Number(item.paymentAmount))}</Text>
            </View>
            <View style={styles.details}>
              <Text style={[styles.detailsData, styles.detailLabelLeftSide]}>{strings.courierDetails.dispatchDate}</Text>
              <Text style={[styles.detailsData, styles.detailLabelRightSide]}>
                { item.dispatchedDate}
              </Text>
            </View>
            <View style={styles.details}>
              <Text style={[styles.detailsData, styles.detailLabelLeftSide]}>{strings.courierDetails.docketNo}</Text>
              <Text style={[styles.detailsData, styles.detailLabelRightSide]}>{item?.doketNo}</Text>
            </View>
            <View style={styles.details}>
              <Text style={[styles.detailsData, styles.detailLabelLeftSide]}>{strings.courierDetails.courierContact}</Text>
              <Text style={[styles.detailsData, styles.detailLabelRightSide]}>{item?.phone}</Text>
            </View>
            <View style={styles.details}>
              <Text style={[styles.detailsData, styles.detailLabelLeftSide]}>{strings.courierDetails.courierCompanyName}</Text>
              <Text style={[styles.detailsData, styles.detailLabelRightSide]}>{item?.courierCompanyName}</Text>
            </View>
          </View>
        </View> 
      )
    }
    else{
      return null
    }
  }

  renderCourierDetails = () => {
    return(
      <FlatList
        style={{paddingTop:0}}
        data={this.props.cart.courierDetails}
        extraData={this.props.cart.courierDetails}
        keyExtractor={(item, index) => item + index}
        ListFooterComponent={this.footer}
        renderItem={({item}) => (
          this.courierDetailsItem(item)
        )}
      />
    )
  }

  render(){

    return (
      <View style={styles.mainView}>
        { !this.isInternetConnected && <OfflineNotice networkStatus={(status) => this.networkStatus(status)} /> }
        <Loader loading={this.props.cart.isLoading} />  
        <Header
          navigation={this.props.navigation}
          screenTitle={strings.drawerScreen.courierDetails}
        />
        {this.renderDateCalendar()}
        { (this.props.cart.courierDetails.length > 0)
          ?
          this.renderCourierDetails()
          :
          (
            <EmptyScreen courierDetails />
          )
        }
      </View>
    )
  }
}

const styles = StyleSheet.create({
  mainView: {
    flex: 1,
  },
  textDatePicker: {
    marginLeft:8,
    paddingLeft:8,
    borderLeftWidth:0.5,
    borderLeftColor:'#c8c9d3',
    color:'#2B32B2',
  },
  datePicker: {
    flexDirection:'row',
    margin:12,
    // borderBottomWidth:1,
    // borderBottomColor:'#c8c9d3',
    paddingVertical:10,
    paddingHorizontal: 15,
    backgroundColor:'#fff',
    borderRadius: 18,
    elevation: 8,
    shadowOffset: { width: 0, height: 0 },
    shadowColor: '#808080',
    shadowOpacity: 0.6,
    shadowRadius: 10,
  },
  listItemContainer: {
    backgroundColor:'#fff', 
    marginBottom: 6,
    marginTop: 6,
    marginHorizontal: 10,
    paddingBottom: 12,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 15,
    shadowOffset: { width: 0, height: 0 },
    shadowColor: '#808080',
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  courier: {
    flexDirection:'row',
    justifyContent:'space-between',
    paddingHorizontal:18,
    paddingVertical:7,
    marginBottom:10,
    backgroundColor: 'yellow',
  },
  courierId: {
    ...Specs.fontBold,
    fontSize: 15,

  },
  courierItemContainer: {
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
  detailLabelLeftSide: {
    flex:0.3
  },
  detailLabelRightSide: {
    flex: 0.7
  },
})