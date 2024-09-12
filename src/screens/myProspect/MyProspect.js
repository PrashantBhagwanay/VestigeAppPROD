import { computed, observable, makeObservable } from 'mobx';
import React, { Component } from 'react';
import {
  View, 
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Text
} from 'react-native';
import Loader  from 'app/src/components/loader/Loader';
import { inject, observer } from 'mobx-react';
import HeaderLeftIcons from 'app/src/components/navigation/HeaderLeftIcons';
import { Toast } from 'app/src/components/toast/Toast';
import { strings } from 'app/src/utility/localization/Localized';
import OfflineNotice from 'app/src/components/OfflineNotice';
import autobind from 'autobind-decorator';
import { Specs } from 'app/src/utility/Theme';
import { connectedToInternet } from 'app/src/utility/Utility';
import { CustomButton } from 'app/src/components/buttons/Button';
import CustomTopTab from 'app/src/components/topTab/CustomTopTab';
import EmptyScreen from 'app/src/components/emptyScreen/EmptyScreen';
import DateTimePicker from 'react-native-modal-datetime-picker';
import moment from 'moment';
// import HeaderSearchIcons from 'app/src/components/navigation/HeaderSearchIcons';
import AlertClass from 'app/src/utility/AlertClass';
import ProspectsItem from 'app/src/screens/myProspect/ProspectsItem/ProspectsItem';
import { MyProspectTabEnum } from 'app/src/utility/constant/Constants';
import { Header } from '../../components';

const calendarIcon = require('app/src/assets/images/training/calenndarIcon.png')


const prospectTabTitle = [
  { title: MyProspectTabEnum.pending },
  { title: MyProspectTabEnum.success },
];

@inject('cart','profile','auth')
@observer
export default class MyProspect extends Component {

  @observable isInternetConnected: Boolean = true;
  
  constructor(props){
    super(props);
    makeObservable(this);
    const fromDate = moment(new Date()).subtract(1, 'months')._d
    const toDate = moment(new Date())._d
    this.state={
      selectedTab: prospectTabTitle[0].title,
      isFromDatePickerVisible: false,
      fromDate: fromDate,
      toDate: toDate,
      isToDatePickerVisible: false,
      // fromDateIsoString: fromDate.toISOString(),
      // toDateIsoString:  new Date().toISOString(),
    }
    this.getNewJoinings = this.getNewJoinings.bind(this);
  }
 
  async componentDidMount(){
    this.isInternetConnected = await connectedToInternet();
    this.isInternetConnected && await this.getNewJoinings();
  }

  @autobind
  async networkStatus(status) {
    if(status) {
      this.isInternetConnected = status;
      await this.getNewJoinings();
    }
  }

  @autobind
  toast(message, type: string){
    Toast.show(message, {
      duration: Toast.durations.SHORT,
      type: type,
      shadow: false,
      animation: true,
      hideOnPress: true,
      delay: 0,
    });
  }

  getNewJoinings = async() => {
    const {fromDate, toDate, selectedTab} =  this.state;
    const isConnectedToInternet = await connectedToInternet();
    let status = '';
    selectedTab === MyProspectTabEnum.pending ? (status = 'pending') : (status = 'completed')
    if(isConnectedToInternet) {
      const res =  await this.props.profile.getNewJoiningsData(this.props.auth.distributorID, this.getDateInFormat(fromDate), this.getDateInFormat(toDate), status)
      if(!res.success && res.message ) {
        this.toast(res.message, Toast.type.ERROR)
      }
    }
    else {
      this.toast(strings.commonMessages.noInternet, Toast.type.ERROR)
    }
  }

  sendMessageReminder = async (distributorId) => {
    const isConnectedToInternet = await connectedToInternet();
    if(isConnectedToInternet) {
      const response =  await this.props.profile.prospectMessageReminder(distributorId)
      if(response.success) {
        AlertClass.showAlert('Message',
          strings.myProspect.messageSentSuccess,
          [{text: strings.commonMessages.ok, onPress: () => this.getNewJoinings()}]
        )
      }
      else{
        this.toast(`${strings.commonMessages.somethingWentWrong}${strings.commonMessages.tryAgain}`, Toast.type.ERROR)
      }
    }
    else {
      this.toast(strings.commonMessages.noInternet, Toast.type.ERROR)
    }
  }

  handleTabCallback = (type) => {
    const { selectedTab } = this.state;
    console.log('check1', type, selectedTab)
    if(type !== selectedTab){
      this.setState({
        selectedTab: type,
      })
      if(type === MyProspectTabEnum.success){
        this.setState({
          fromDate: moment(new Date()).subtract(1, 'months')._d,
          toDate : moment(new Date())._d
        }, () => {
          this.getNewJoinings();
        })
      }      
    }
  } 

  getDateInFormat = (date) => {
    const dateString = moment(date).format('YYYY-MM-DD')
    return dateString;
  }

  /**@description  datetime picker related operations */

  handleToDatePicker = (date)=>{
    this.setState({
      toDate: date
    },()=>{
      this.getNewJoinings(true);
      this.hideDatePicker()
    })
  }


  handleFromDatePicker=(date)=>{
    this.setState({
      fromDate: date
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

  renderDateCalendar(){
    return (
      <View style={{ marginBottom: 10 }}>
        <View style={styles.datePickerContainer}>
          <TouchableOpacity 
            style={styles.datePicker} 
            onPress={() => {
              this.setState({ isFromDatePickerVisible: true })
            }}
          >
            <Image source={calendarIcon} />
            <Text style={styles.textDatePicker}>{this.getDateInFormat(this.state.fromDate)}</Text>
            <DateTimePicker
              isVisible={this.state.isFromDatePickerVisible}
              onConfirm={this.handleFromDatePicker}
              onCancel={()=>this.hideDatePicker('from')}
              minimumDate={moment(new Date()).subtract(1, 'months')._d}
              maximumDate={new Date(this.state.toDate)}
              date={this.state.fromDate}
              mode='date'
              is24hour
            />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.datePicker} 
            onPress={()=>{
              this.setState({ isToDatePickerVisible: true })
            }}
          >
            <Image source={calendarIcon} />
            <Text style={styles.textDatePicker}>{this.getDateInFormat(this.state.toDate)}</Text>
            <DateTimePicker
              isVisible={this.state.isToDatePickerVisible}
              onConfirm={this.handleToDatePicker}
              onCancel={()=>this.hideDatePicker()}
              minimumDate={new Date(this.state.fromDate)}
              date={this.state.toDate}
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
            buttonContainer={{ 'width': 120, alignSelf: 'flex-end', height: 20 }}
            buttonTitle="Clear"
            buttonTitleStyle={styles.customButtonTitleStyle}
            primaryColor="#6895d4"
            secondaryColor="#57a5cf"
          />
        </View> */}
      </View>
    )
  }

  /**@description prospect list item render */

  prospectList = () => {
    const { navigation , profile} = this.props;
    const {selectedTab} =  this.state;
    let joineeList = [];
    if(selectedTab === MyProspectTabEnum.pending){
      joineeList = profile.pendingJoineeList
    }
    else{
      joineeList = profile.successJoineeList
    }

    return(
      <FlatList
        style={{paddingTop:0}}
        data={joineeList}
        extraData={joineeList}
        keyExtractor={(item, index) => item + index}
        ListEmptyComponent={
          (
            <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1}}>
              <Text style={{...Specs.fontBold, color: '#000000', opacity: 0.8}}>{strings.myProspect.noProspect}</Text>
            </View>
          )
        }
        contentContainerStyle={joineeList.length === 0 && styles.emptyScreenView}
        ListFooterComponent={this.footer}
        renderItem={({item}) => (
          <ProspectsItem 
            item={item}
            handleMessage={(value) => this.sendMessageReminder(value)}
            navigation={navigation}
          />
        )}
      />
    )
  }

  footer= () => {
    return(
      <View style={{width:'100%',height:10,backgroundColor:'#e8ebf0'}} />
    );
  }

  render(){
    const { selectedTab } = this.state;
    return(
      <View style={styles.mainView}>
        { !this.isInternetConnected && <OfflineNotice networkStatus={(status) => this.networkStatus(status)} /> }
        <Header
          navigation={this.props.navigation}
          screenTitle={strings.drawerScreen.My_Prospect}
        />
        <CustomTopTab 
          selectedValue={selectedTab} 
          showTabDivider
          handleTabCallback={this.handleTabCallback} 
          data={prospectTabTitle} 
          style={{marginBottom: 5, height: 50}}
        />
        {this.renderDateCalendar()}
        { (this.props.profile.isLoading) ? 
          <Loader loading={this.props.profile.isLoading} />  
          :
          this.prospectList()
        }
      </View>
    )
  }
}

const styles=StyleSheet.create({
  mainView: {
    flex: 1,
  },
  // distributorLevelInfoContainer: {
  //   flexDirection: 'row',
  //   justifyContent: 'space-between',
  //   alignItems: 'center',
  //   backgroundColor: '#f2f5f8'
  // },
  // distributorCurrentLevelStyle: {
  //   ...Specs.fontBold,
  //   paddingVertical: 10,
  //   fontSize: 14,
  //   color: '#474b60',
  //   marginLeft: 10,
  //   marginBottom: 5,
  //   width : '50%'
  // },
  // historyOrdersList: {
  //   // marginTop:6
  // },
  // emptyScreenView: {
  //   flex:1, 
  //   marginBottom:1,
  //   justifyContent:'center',
  //   alignItems:'center',
  // },
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
    // borderColor: '#999999',
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
  emptyScreenView: {
    flex:1, 
    marginBottom:5,
    justifyContent:'center',
    alignItems:'center',
  },
  // customButtonTitleStyle: {
  //   fontSize: 14,
  //   color: '#ffffff',
  //   ...Specs.fontMedium,
  //   alignSelf: 'center',
  //   justifyContent: 'center'
  // }
})