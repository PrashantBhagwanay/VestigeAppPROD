import React, { Component } from 'react';
import {
  View, 
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  SectionList,
  Text,
  KeyboardAvoidingView
} from 'react-native';
import autobind from 'autobind-decorator';
import moment from 'moment';
import { VESTIGE_IMAGE, PICKER_ENUM, NewTraining_ERROR_MESSAGES } from 'app/src/utility/constant/Constants';
import { observer, inject } from 'mobx-react'; 
import {observable, makeObservable} from 'mobx'
import { Toast } from 'app/src/components/toast/Toast';
import HeaderLeftIcons from 'app/src/components/navigation/HeaderLeftIcons';
import {dateFormat} from 'app/src/utility/Utility';
import DateTimePicker from 'react-native-modal-datetime-picker';
import { Specs } from 'app/src/utility/Theme';
import CustomInput from 'app/src/components/CustomInput';
import Loader  from 'app/src/components/loader/Loader';
import SignupInput from 'app/src/screens/signup/component/SignupInput';
import SectionedMultiSelect from 'react-native-sectioned-multi-select';
import { strings } from 'app/src/utility/localization/Localized';
import { Header } from '../../components';


const calendarIcon = require('app/src/assets/images/training/calenndarIcon.png')
const cityIcon = require('app/src/assets/images/training/cityIcon.png')
const coTrainerIcon = require('app/src/assets/images/training/coTrainerId.png')
const countryIcon = require('app/src/assets/images/training/countryIcon.png')
const stateIcon = require('app/src/assets/images/training/stateIcon.png')
const targetSaleIcon = require('app/src/assets/images/training/targetSale.png')
const travelBudgetIcon = require('app/src/assets/images/training/travelBudget.png')
const hotelBudgetIcon = require('app/src/assets/images/training/hotelBudget.png')
const miscBudgetIcon = require('app/src/assets/images/training/miscBudget.png')
const foodBudgetIcon = require('app/src/assets/images/training/foodBudgetIcon.png')
const venueNameIcon = require('app/src/assets/images/training/venue_Name.png')
const trainingTypeIcon = require('app/src/assets/images/training/trainingType.png')




@inject('training','profile')
@observer
export default class NewTraining extends Component {

  @observable isloading =false;
  @observable selectedCountry =  'Country';
  @observable selectedState = 'State';
  @observable selectedCity = 'City';
  @observable selectedTargetCity = 'Target City';
  @observable selectedTrainingType = 'Training Type'
  @observable countryId = '';
  @observable stateId = '';
  @observable cityId = '';
  @observable countryName = '';
  @observable stateName = '';
  @observable cityName = '';
  @observable targetCityId = '';
  @observable trainingTypeId = '';
  @observable countryData = [];
  @observable stateData = [];
  @observable cityData = [];
  @observable trainingTypesData = [];
  @observable trainingId = '0';
  @observable date = '';
  @observable startTime = '';
  @observable endTime = '';
  @observable countryPickerVisible = false;
  @observable statePickerVisible = false;
  @observable cityPickerVisible = false;
  @observable targetCityVisible = false;
  @observable trainingTypeVisible = false;
  @observable createNewTrainingData = {}
 

  constructor(props){
    super(props);
    makeObservable(this);
    this.state={
      isDatePickerVisible: false,
      isStartTimePickerVisible: false,
      isEndTimePickerVisible: false,
      date:'Date',
      startTime:'Start Time',
      endTime:'End Time',
      venue:'',
      coTrainer:'',
      targetSale:'',
      travel:'',
      hotel:'',
      food:'',
      misc:'',
      travelFrom:'',
      travelTo:'',
      selectedItems: [],
      newSelectedItems: [],
    };

  }

  async componentDidMount(){
    const { training } = this.props;
    this.isloading = true;
    await training.trainingCountryListAPI();
    await training.getTrainingTypes();
    this.countryData = await training.getCountryName(),
    this.trainingTypesData = await training.getTrainingNames()
    if(this.props.route.params) {
      const {data} = this.props.route.params;
      this.state.date = data.trainingDate
      this.date = data.trainingDate
      this.state.startTime = data.startTime
      this.startTime = data.startTime
      this.state.endTime = data.endTime
      this.endTime = data.endTime
      this.state.coTrainer = data.coTrainerIDS
      this.state.venue = data.venue
      this.selectedCountry = data.countryName
      this.selectedState = data.stateName
      this.selectedCity = data.cityName
      this.selectedTargetCity = data.targetCities
      this.selectedTrainingType = data.trainingTypeName
      this.state.targetSale  = data.targetSale
      this.state.travel = data.aprvdBudgetForTravel
      this.state.hotel = data.aprvdBudgetForHotel
      this.state.food = data.aprvdBudgetForFood
      this.state.misc = data.aprvdBudgetForMisc
      this.state.travelFrom = data.travelFrom
      this.state.travelTo = data.travelTo
      this.trainingId = data.trainingId || '0'
      // await training.trainingStateList(data.countryId);
      // this.stateData = await training.getStateName();
      // this.countryId = data.countryId;
      // await training.cityList(data.stateId);
      // this.cityData = await training.getCityName(),
      // this.stateId = data.stateId;
    }
    this.isloading = false;
  }


  onSelectedItemsChange = newSelectedItems => {
    console.log(this.state.newSelectedItems)
    // this.setState({ selectedItems });
    this.setState({ newSelectedItems });
  };

  /**
 * @param {*} visible true, false
 * @param {*} openPickerType picker key { country, state, city, pincode }
 */
@autobind
  openPicker (visible, openPickerType){
    if(openPickerType === PICKER_ENUM.COUNTRY_PICKER)
      this.countryPickerVisible = visible;
    else if(openPickerType === PICKER_ENUM.STATE_PICKER)
      this.statePickerVisible = visible;
    else if(openPickerType === PICKER_ENUM.CITY_PICKER)
      this.cityPickerVisible = visible;
    else if(openPickerType === PICKER_ENUM.TARGETCITY_PICKER)
      this.targetCityVisible = visible;
    else if(openPickerType === PICKER_ENUM.TRAININGTYPE_PICKER)
      this.trainingTypeVisible = visible;    
  }

/**
* @param {*} selectedPickerValue selected value
* @param {*} selectedPickerIndex picker key { 0, 1,2.... }
* @param {*} selectedPickerKey picker key { country, state, city, pincode }
*/
setPickerValue = async(selectedPickerValue, selectedPickerIndex, selectedPickerKey) => {
  const { training } = this.props;
  if(selectedPickerIndex !== 0){
    this.isloading = true;
    if(selectedPickerKey === PICKER_ENUM.COUNTRY_PICKER){
      this.selectedCountry = selectedPickerValue,
      await training.getCountryList().filter(async (country)=>{
        if(country.countryName === selectedPickerValue){
          await training.trainingStateList(country.countryId);
          this.stateData = await training.getStateName();
          this.countryId = country.countryId;
          this.countryName = country.countryName;
          this.isloading = false;          
        }
      })
      this.openPicker(!this.countryPickerVisible, selectedPickerKey)
    }
    else if( selectedPickerKey === PICKER_ENUM.STATE_PICKER){
      this.selectedState = selectedPickerValue,
      await training.getStateList().filter(async (state)=>{
        if(state.stateName === selectedPickerValue){
          await training.cityList(state.stateId);
          this.cityData = await training.getCityName(),
          this.stateId = state.stateId;
          this.stateName = state.stateName;
          this.selectedCity = 'City';
          // this.state.newSelectedItems
          this.isloading = false;          
        }
      })
      this.setState({
        newSelectedItems: []
      })
      this.openPicker(!this.statePickerVisible, selectedPickerKey)
    }
    else if(selectedPickerKey === PICKER_ENUM.CITY_PICKER){
      await training.getCityList().filter(async (city)=>{
        if(city.cityName === selectedPickerValue){
          this.cityId = city.cityId;
          this.cityName = city.cityName;
          this.selectedCity = selectedPickerValue;
          console.log(this.cityId)
          this.isloading = false;
        }
      })
      this.openPicker(!this.cityPickerVisible, selectedPickerKey)
    }
    else if(selectedPickerKey === PICKER_ENUM.TRAININGTYPE_PICKER){
      await training.myTrainingTypes.filter(async(trainingType)=>{
        if(trainingType.name === selectedPickerValue){
          this.trainingTypeId = trainingType.id;
          this.selectedTrainingType = selectedPickerValue;
          this.isloading = false;
        }
      })
      this.openPicker(!this.trainingTypeVisible, selectedPickerKey)
    }
    else if(selectedPickerKey === PICKER_ENUM.TARGETCITY_PICKER) {
      await training.getCityList().filter(async(city)=>{
        if(city.cityName === selectedPickerValue){
          this.targetCityId = city.cityId;
          this.selectedTargetCity = selectedPickerValue;
          this.isloading = false;
        }
      })  
      this.openPicker(!this.targetCityVisible, selectedPickerKey)
    }
  }
}

datePicker=()=>{
  return(
    <View>
      <TouchableOpacity style={styles.datePicker} onPress={()=>this.setState({ isDatePickerVisible: true })}>
        <Image source={calendarIcon} />
        <Text style={styles.textDatePicker}>{this.state.date}</Text>
        <DateTimePicker
          isVisible={this.state.isDatePickerVisible}
          onConfirm={this.handleDatePicker}
          onCancel={this.hideDatePicker}
          mode='date'
          is24hour={true}
        />
      </TouchableOpacity>
      <TouchableOpacity style={styles.datePicker} onPress={()=>this.setState({ isStartTimePickerVisible: true })}>
        <Image style={{ height:15, width:15 }} source={VESTIGE_IMAGE.TIME_ICON} />
        <Text style={styles.textDatePicker}>{this.state.startTime}</Text>
        <DateTimePicker
          isVisible={this.state.isStartTimePickerVisible}
          onConfirm={this.handleStartTimePicker}
          onCancel={this.hideStartTimePicker}
          mode='time'
          is24hour={true}
        />
      </TouchableOpacity>
      <TouchableOpacity style={styles.datePicker} onPress={()=>this.setState({ isEndTimePickerVisible: true })}>
        <Image style={{ height:15, width:15 }} source={VESTIGE_IMAGE.TIME_ICON} />
        <Text style={styles.textDatePicker}>{this.state.endTime}</Text>
        <DateTimePicker
          isVisible={this.state.isEndTimePickerVisible}
          onConfirm={this.handleEndTimePicker}
          onCancel={this.hideEndTimePicker}
          mode='time'
          is24hour={true}
        />
      </TouchableOpacity>
    </View>
  )
}

hideDatePicker = () => this.setState({ isDatePickerVisible: false });
hideStartTimePicker = () => this.setState({ isStartTimePickerVisible: false });
hideEndTimePicker = () => this.setState({ isEndTimePickerVisible: false });


handleDatePicker = (date) => {
  console.log(date.toISOString())
  // this.date=  moment(date,'YYYY-MM-DDTHH: mm: ss').format('YYYY-MM-DD')
  this.date = date.toISOString()
  this.setState({date: moment(date,'YYYY-MM-DDTHH: mm: ss').format('YYYY-MM-DD') })
  this.hideDatePicker();
};

handleEndTimePicker = (date) => {
  this.endDateTimeValue = date;
  // console.log(moment(date).isAfter(moment(this.startDateTimeValue)))
  this.endTime=  moment(date,'YYYY-MM-DDTHH: mm: ss').format('hh:mm:ss')
  this.setState({endTime:moment(date, 'YYYY-MM-DDTHH: mm: ss').format('hh:mm A')})
  this.hideEndTimePicker();
};

handleStartTimePicker = (date) => {
  this.startDateTimeValue = date;
  this.startTime=  moment(date,'YYYY-MM-DDTHH: mm: ss').format('hh:mm:ss')
  this.setState({startTime:moment(date, 'YYYY-MM-DDTHH: mm: ss').format('hh:mm A')})
  this.hideStartTimePicker();
};

textData=(item)=>{
  return(
    <View style={styles.textData}>
      <Text>{item.item}</Text>
      <Text style={{ color:'#31cab3' }}>{item.price}</Text>
    </View>
  )
}

handleCustomInput=(value,key)=>{
  switch(key){
    case 'venue' : {
      this.setState({venue:value})
      break
    }
    case 'coTrainer' : {
      this.setState({coTrainer:value})
      break
    }
    case 'targetSale' : {
      this.setState({targetSale:value})
      break
    }
    case 'travel' : {
      this.setState({travel:value})
      break
    }
    case 'hotel' : {
      this.setState({hotel:value})
      break
    }
    case 'food' : {
      this.setState({food:value})
      break
    }
    case 'misc' : {
      this.setState({misc:value})
      break
    }
    case 'travelFrom' : {
      this.setState({travelFrom:value})
      break
    }
    case 'travelTo' : {
      this.setState({travelTo:value})
      break
    }
  }
}

renderItem=(item)=>{
  if(item.type=='inputText')
    return(
      <View>
        <CustomInput 
          placeholder={item.placeholder}
          keyboardType={item.keyboardType}
          icon={item.icon}
          value={this.state[item.key]}
          onChangeText={(value)=>this.handleCustomInput(value,item.key)}
        />
      </View>
      
    )
  if(item.type=='picker') {
    console.log(item);
    return(
      <SignupInput {...this.props} data={item} />
    )
  }
  if(item.type == 'multiselect') {
    return (
      <View style={{ flex: 1 }}>
        <SectionedMultiSelect
          items={this.props.training.myCityData}
          uniqueKey='cityId'
          // subKey='children'
          // iconKey='icon'
          single={false}
          selectText='Choose target city'
          showDropDowns={false}
          readOnlyHeadings={false}
          onSelectedItemsChange={this.onSelectedItemsChange}
          selectedItems={this.state.newSelectedItems}
          displayKey='cityName'
          showChips={false}
        />
      </View>
    )
  }
  if(item.type=='datePicker')
    return(
      this.datePicker()
    )
  else
    return(
      this.textData(item)
    )
}

isValidate = () => {
  if(!this.date) {
    this.showToast(NewTraining_ERROR_MESSAGES.date,Toast.type.ERROR)
    return false
  }
  else if(!this.startTime) {
    this.showToast(NewTraining_ERROR_MESSAGES.startTime,Toast.type.ERROR)
    return false
  }
  else if(!this.endTime) {
    this.showToast(NewTraining_ERROR_MESSAGES.endTime,Toast.type.ERROR)
    return false
  }
  else if(!this.state.coTrainer) {
    this.showToast(NewTraining_ERROR_MESSAGES.coTrainer,Toast.type.ERROR)
    return false
  }
  else if(!this.state.venue) {
    this.showToast(NewTraining_ERROR_MESSAGES.venue,Toast.type.ERROR)
    return false
  }
  else if(!this.selectedCountry || this.selectedCountry === 'Country' ) {
    this.showToast(NewTraining_ERROR_MESSAGES.selectedCountry,Toast.type.ERROR)
    return false
  }
  else if(!this.selectedState || this.selectedState === 'State') {
    this.showToast(NewTraining_ERROR_MESSAGES.selectedState,Toast.type.ERROR)
    return false
  }
  else if(!this.selectedCity || this.selectedCity === 'City') {
    this.showToast(NewTraining_ERROR_MESSAGES.selectedCity,Toast.type.ERROR)
    return false
  }
  else if(!this.state.newSelectedItems.length) {
    this.showToast(NewTraining_ERROR_MESSAGES.selectedTargetCity,Toast.type.ERROR)
    return false
  }
  else if(!this.selectedTrainingType || this.selectedTrainingType === 'Training Type') {
    this.showToast(NewTraining_ERROR_MESSAGES.selectedTrainingType,Toast.type.ERROR)
    return false
  }
  else if(!this.state.targetSale) {
    this.showToast(NewTraining_ERROR_MESSAGES.targetSale,Toast.type.ERROR)
    return false
  }
  else if(!this.state.travel) {
    this.showToast(NewTraining_ERROR_MESSAGES.travel,Toast.type.ERROR)
    return false
  }
  else if(!this.state.hotel) {
    this.showToast(NewTraining_ERROR_MESSAGES.hotel,Toast.type.ERROR)
    return false
  }
  else if(!this.state.food) {
    this.showToast(NewTraining_ERROR_MESSAGES.food,Toast.type.ERROR)
    return false
  }
  else if(!this.state.misc) {
    this.showToast(NewTraining_ERROR_MESSAGES.misc,Toast.type.ERROR)
    return false
  }
  else if(!this.state.travelFrom) {
    this.showToast(NewTraining_ERROR_MESSAGES.travelFrom,Toast.type.ERROR)
    return false
  }
  else if(!this.state.travelTo) {
    this.showToast(NewTraining_ERROR_MESSAGES.travelTo,Toast.type.ERROR)
    return false
  }
  else if(!moment(this.endDateTimeValue).isAfter(moment(this.startDateTimeValue))) {
    this.showToast('End Time should be greater than start time.',Toast.type.ERROR)
    return false
  }
  else if(this.state.coTrainer.length != 8) {
    this.showToast('Invalid Co-Trainer ID',Toast.type.ERROR)
    return false
  }
  else 
    return true
}

createNewTraining = async() => {
  if(this.isValidate()) {
  this.isloading = true;
  this.createNewTrainingData = 
    {	
      trainerId:this.props.profile.distributorID.toString(),
      trainingId:this.trainingId,
      scheduleDate:this.date,
      scheduleTimeFrom:this.startTime,
      scheduleTimeTo:this.endTime,
      venueAddress:this.state.venue,
      countryId:this.countryId,
      stateId:this.stateId,
      cityId:this.cityId,
      trainingTypeId:this.trainingTypeId,
      cityTotalSale: 25000,
      targetSale: Number(this.state.targetSale),
      budgetForVenueRent: 2500,
      budgetForTravel: Number(this.state.travel),
      budgetForHotel: Number(this.state.hotel),
      budgetForFood: Number(this.state.food),
      budgetForMisc: Number(this.state.misc),
      honorariumCharge: 0,
      modeOfTransport:'0',
      selfDrivenCarApproval:0,
      targetCityIds: this.state.newSelectedItems.toString(),
      travelFrom:this.state.travelFrom,
      travelTo:this.state.travelTo,
      cotrainerIds:this.state.coTrainer
    }
    const newTraining = await this.props.training.createNewTraining(this.createNewTrainingData)
    this.isloading = false; 
    if(newTraining.message) {
      this.showToast(newTraining.message,Toast.type.SUCCESS)
      // this.props.navigation.goBack()
    }
    else
      this.showToast(`${strings.commonMessages.somethingWentWrong}${strings.commonMessages.tryAgain}`,Toast.type.ERROR)
  }
}

@autobind
showToast(message: string , type:String) {
  // Add a Toast on screen.
  Toast.show(message, {
    duration: Toast.durations.SHORT,
    type: type?type:Toast.type.WARNING,
    shadow: false,
    animation: true,
    hideOnPress: true,
    delay: 0,
  });
}

/**
 * @description return the section list of the inputs and the data used on the scren
 */
newTrainingData = () => {
  const VENUE_PICKER=[
    { data: this.countryData, key: 'country', visible: this.countryPickerVisible, selected: this.selectedCountry, defaultValue: 'Country',inputIcon: countryIcon },
    { data: this.stateData, key: 'state', visible: this.statePickerVisible, selected: this.selectedState, defaultValue: 'State', inputIcon: stateIcon },
    { data: this.cityData, key: 'city', visible: this.cityPickerVisible, selected: this.selectedCity, defaultValue: 'City', inputIcon: cityIcon },
  ];
  const TARGET_PICKER=[
    // { data: this.cityData, key: 'targetCity', visible: this.targetCityVisible, selected: this.selectedTargetCity, defaultValue: 'Target City' },
    { data: this.trainingTypesData, key: 'trainingType', visible: this.trainingTypeVisible, selected: this.selectedTrainingType, defaultValue: 'Training Type', icon: trainingTypeIcon },
  ]
  this.dataAndTime=[
    {placeholder:'Date',type:'datePicker'}
  ];
  this.venue = [
    {placeholder:'Venue Name',key:'venue',icon: venueNameIcon,type:'inputText',keyboardType:'default'},
    {
      type: 'picker',
      inputIcon: VESTIGE_IMAGE.LOCATION_ICON,
      pickerData: VENUE_PICKER,
      handlePicker: this.openPicker,
      pickerIcon: VESTIGE_IMAGE.OPEN_PICKER_BUTTON,
      setPickerValue: this.setPickerValue,
      setPickerVisible: this.openPicker,
    }
  ]
  this.coTrainer = [
    {placeholder:'Co-Trainer Id',key:'coTrainer',type:'inputText',keyboardType:'numeric', icon: coTrainerIcon}
  ] 
  this.target = [
    {type: 'multiselect'},      
    {
      type: 'picker',
      inputIcon: VESTIGE_IMAGE.LOCATION_ICON,
      pickerData: TARGET_PICKER,
      handlePicker: this.openPicker,
      pickerIcon: VESTIGE_IMAGE.OPEN_PICKER_BUTTON,
      setPickerValue: this.setPickerValue,
      setPickerVisible: this.openPicker,
    },
    {placeholder:'Target Sale',key:'targetSale',icon: targetSaleIcon, type:'inputText',keyboardType:'numeric'},
  ]
  this.budget = [
    {item:'Budget For Venue Rent',price:2500},
    {item:'Budget For Honorarium',price:2500},  
    {placeholder:'Budget for Travel',key:'travel',icon: travelBudgetIcon,type:'inputText',keyboardType:'numeric'},
    {placeholder:'Budget for Hotel',key:'hotel',icon: hotelBudgetIcon,type:'inputText',keyboardType:'numeric'},
    {placeholder:'Budget for Food',key:'food',icon: foodBudgetIcon,type:'inputText',keyboardType:'numeric'},
    {placeholder:'Budget for Misc.',key:'misc',icon: miscBudgetIcon,type:'inputText',keyboardType:'numeric'}
  ]
  this.travel = [
    {placeholder:'Travel from',key:'travelFrom',icon: travelBudgetIcon,type:'inputText',keyboardType:'default'},
    {placeholder:'Travel to',key:'travelTo',icon: travelBudgetIcon,type:'inputText',keyboardType:'default'}
  ]
  return(
    <ScrollView keyboardShouldPersistTaps='always' style={{backgroundColor:'#f2f5f8'}}>  
      {/* <Loader loading={this.isloading} /> */}
      <SectionList 
        sections={[
          {title: 'Date and Time', data: this.dataAndTime},
          {title:'',data:this.coTrainer},
          {title: 'Venue', data: this.venue},
          {title:'Target',data:this.target},
          {title:'Budget',data:this.budget},
          {title:'Travel',data:this.travel},
        ]}
        renderSectionHeader={({section: {title}}) => {
          if(title.length!=0)  {
            return(
              <Text style={styles.cardTitle}>{title}</Text>
            )
          }
          else{
            return(
              <View style={{marginTop:12}} />
            )
          }
        }}
        renderItem={({item, index, section}) => (
          <View style={styles.cardView}>
            {this.renderItem(item)}  
          </View>  
        )
        }
      />  
      <View style={{backgroundColor:'#fff'}}>
        <TouchableOpacity
          style={styles.button}
          onPress={()=>this.createNewTraining()}
        >
          <Text style={styles.buttonTitle}>Send Request</Text>
        </TouchableOpacity>
      </View>
      
    </ScrollView>
  )
}

render(){
  return(
    <KeyboardAvoidingView style={{backgroundColor:'#f2f5f8'}}>
      <Header
        navigation={this.props.navigation}
        screenTitle={this.props.route?.params ? strings.myTrainingScreen.editTraining : strings.myTrainingScreen.newTraining}
      />
      {this.newTrainingData()}
    </KeyboardAvoidingView>
  )
}
}

const styles = StyleSheet.create({
  button: {
    alignItems:'center',
    borderRadius:24,
    backgroundColor:'#57a5cf',
    paddingVertical:12,
    marginVertical:46,
    marginHorizontal:16,
  },
  buttonTitle: {
    fontSize:16,
    ...Specs.fontMedium,
    color:'#fff'
  },
  cardView: {
    paddingVertical:12,
    backgroundColor:'#fff'
  },
  cardTitle: {
    color:'#3f5886',
    ...Specs.fontSemibold,
    padding:15,
    marginTop:12,
    borderBottomWidth:1,
    borderBottomColor:'#f1f2f3',
    backgroundColor:'#fff'
  },
  datePicker: {
    flexDirection:'row',
    marginVertical:10,
    borderBottomWidth:1,
    borderBottomColor:'#c8c9d3',
    padding:5,
    paddingBottom:15,
    marginHorizontal:15,
  },
  textDatePicker: {
    marginLeft:8,
    paddingLeft:8,
    borderLeftWidth:0.5,
    borderLeftColor:'#c8c9d3',
    color:'#3f4967'
  },
  textData: {
    paddingVertical:5,
    flexDirection:'row',
    justifyContent:'space-between',
    paddingHorizontal:15
  }
})