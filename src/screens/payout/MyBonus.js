/**
 * @description MyBonus Details Screen showing bonus details here 
*/

import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet
} from 'react-native';
import autobind from 'autobind-decorator';
import { inject, observer } from 'mobx-react';
import { Toast } from 'app/src/components/toast/Toast';
import { Specs, COLOR_CODES } from 'app/src/utility/Theme';
import HeaderLeftIcons from 'app/src/components/navigation/HeaderLeftIcons';
import { VESTIGE_IMAGE, MyBonusEnum, MONTH_DATA } from 'app/src/utility/constant/Constants';
import { getMonthsIndex, dateFormatMonthWithYear, getYearList, connectedToInternet, showToast } from 'app/src/utility/Utility';
import EmptyScreen from 'app/src/components/emptyScreen/EmptyScreen';
import { observable, makeObservable } from 'mobx';
import OfflineNotice from 'app/src/components/OfflineNotice';
import Loader  from '../../components/loader/Loader';
import GenerateBonus from './component/GenerateBonus';
import { strings } from '../../utility/localization/Localized';
import { Header } from '../../components';


const BONUS_TYPE= [{
  bonusTypeTitle: 'Bonus Details',
  bonusTypeData: 'bonusDetails',
},{
  bonusTypeTitle: 'Transfer Details',
  bonusTypeData: 'transferDetails',
}];

@inject('myBonus','auth')
@observer
export default class MyBonus extends Component {

  @observable isInternetConnected: Boolean = true;

  @observable YEAR_DATA = [];
  @observable bonusData = {};

  constructor(props){
    super(props);
    makeObservable(this);
    this.state = {
      selectedMyBonusTitle: '',
      modalVisible: false,
      selectedMonth: 'Select Month',
      selectedYear: 'Select Year',
      monthPickerVisible: false,
      yearPickerVisible: false,
      isEnabled: false,
      selectedBonusData: [],
    }
  }

  async componentDidMount(){
    this.isInternetConnected = await connectedToInternet();
    this.getComponentData();
  }

  @autobind
  networkStatus(status) {
    if(status) {
      this.isInternetConnected = status;
      this.getComponentData();
    }
  }

  @autobind
  getComponentData() {
    const yearMonth = this.getLastYearMonth();
    this.getDataDetails(yearMonth, MyBonusEnum.BonusTitle)
    this.YEAR_DATA = getYearList();
  }

  getLastYearMonth = () => {
    const date = new Date();
    let monthIndex = ''; // VMP-3143
    if(date.getDate() >= 10){
      monthIndex = date.getMonth()-1;
    } else {
      monthIndex = date.getMonth()-2;
    }
    let year = date.getFullYear()
    
    if(monthIndex === 0) {
      monthIndex = 12 - monthIndex;
      year = year - 1;
    } 

    if(monthIndex < 10) {
      // monthIndex='0'+(monthIndex + 1);
      monthIndex >= 9 ? monthIndex = (monthIndex + 1) : monthIndex='0'+(monthIndex + 1);
    }
    return year+'-'+monthIndex;
  }

  getYearMonth = (year, month) => {
    let monthIndex = getMonthsIndex(month);
    if(monthIndex<10){
      monthIndex='0'+(monthIndex);
    }
    return year+'-'+monthIndex
  }

  @autobind
  showToast(message: string) {
    // Add a Toast on screen.
    Toast.show(message, {
      duration: Toast.durations.SHORT,
      position: Toast.positions.TOP,
      type: Toast.type.ERROR,
      shadow: false,
      animation: true,
      hideOnPress: true,
      delay: 0,
    });
  }

  getDataDetails = async(yearMonth, bonusType) => {
    if(bonusType === MyBonusEnum.BonusTitle) {
      await this.props.myBonus.fetchBonusDetails(this.props.auth.distributorID, yearMonth);
    }
    else {
      await this.props.myBonus.fetchTransferDetails(this.props.auth.distributorID, yearMonth);
    }

    this.setState({
      selectedBonusData: bonusType === MyBonusEnum.BonusTitle ? await this.props.myBonus.generatedBonusDetailData : await this.props.myBonus.generatedTransferDetailData,
      selectedMyBonusTitle: bonusType
    });
  }

  @autobind
  openPicker (visible, openPickerType){
    if(openPickerType === 'month')
      this.setState({ monthPickerVisible: visible});
    if(openPickerType === 'year'){
      this.setState({ yearPickerVisible: visible});
    }
  }

  setPickerValue = async(selectedPickerValue, selectedPickerIndex, selectedPickerKey) => {
    const { monthPickerVisible, yearPickerVisible } = this.state;
    if(selectedPickerIndex !== 0){
      if( selectedPickerKey === 'month'){
        await this.setState({
          selectedMonth: selectedPickerValue
        })
        this.openPicker(!monthPickerVisible, selectedPickerKey)
      }
      else if( selectedPickerKey === 'year'){
        await this.setState({
          selectedYear: selectedPickerValue
        })
        this.openPicker(!yearPickerVisible, selectedPickerKey)
      }
    }
    this.checkIsEnabled();  
  }

  checkIsEnabled = () => {
    const { selectedMonth, selectedYear } = this.state;
    if(selectedMonth !== 'Select Month' && selectedYear !== 'Select Year'){
      this.setState({
        isEnabled: true
      })
    }
  }

  setSelectedFunds = async(fundsData) => {
    const { selectedMonth, selectedYear } = this.state;
    let yearMonth = this.getLastYearMonth();
    if(fundsData === 'bonusDetails') {
      if(selectedMonth !== 'Select Month' && selectedYear !== 'Select Year') {
        yearMonth = this.getYearMonth(selectedYear, selectedMonth);
      }
      await this.getDataDetails(yearMonth, MyBonusEnum.BonusTitle); 
    }

    if(fundsData === 'transferDetails') {
      if (selectedMonth !== 'Select Month' && selectedYear !== 'Select Year') {
        yearMonth = this.getYearMonth(selectedYear, selectedMonth);
      }
      await this.getDataDetails(yearMonth, MyBonusEnum.TransferTitle); 
    }
  }

  setModalVisible = (visible) => {
    this.setState({ modalVisible: visible });
  }

  generateBonus = async(visible) => {
    this.setModalVisible(visible);
    const { selectedMonth, selectedYear, selectedMyBonusTitle } = this.state;
    const currentMonthIndex = new Date().getMonth()+1;
    const selectedMonthIndex = getMonthsIndex(selectedMonth)
    const currentYear = new Date().getFullYear();

    if( (currentMonthIndex >= selectedMonthIndex && currentYear === selectedYear) || (currentYear > selectedYear)){
      const yearMonthParams = this.getYearMonth(selectedYear, selectedMonth);
      if(selectedMyBonusTitle === MyBonusEnum.BonusTitle) {
        await this.getDataDetails(yearMonthParams, MyBonusEnum.BonusTitle); 
      }
      else {
        await this.getDataDetails(yearMonthParams, MyBonusEnum.TransferTitle); 
      }
    }
    else {
      this.showToast(strings.commonMessages.validMonth);
    }
  }

  render() {
    const { selectedMyBonusTitle, 
      selectedBonusData, 
      modalVisible, 
      selectedMonth, 
      selectedYear, 
      monthPickerVisible, 
      yearPickerVisible,
      isEnabled,
    } = this.state;
    const  BONUS_DATA=[
      { data: MONTH_DATA, key: 'month', visible: monthPickerVisible, selected: selectedMonth, defaultValue: 'Select Month' },
      { data: this.YEAR_DATA.slice().reverse(), key: 'year', visible: yearPickerVisible, selected: selectedYear, defaultValue: 'Select Year' },
    ];
    return (
      <View style={styles.container}>
        { !this.isInternetConnected && <OfflineNotice networkStatus={(status) => this.networkStatus(status)} /> }
        <Loader loading={this.props.myBonus.isLoading} />
        <Header
          navigation={this.props.navigation}
          screenTitle={strings.drawerScreen.bonus}
        />
        <View style={styles.fundsTypeTabContainer}>
          { BONUS_TYPE.map((bonus,index) => {
            return((selectedMyBonusTitle === bonus.bonusTypeTitle) ? (
              <View key={index.toString()} style={styles.fundsTabContainer}>
                <View style={{ flexDirection: 'row' }}>
                  <Text 
                    style={[styles.fundsTabTextTitleStyle, { color: '#6797d4'}]}
                    onPress={() => this.setSelectedFunds(bonus.bonusTypeData)}
                  >
                    {bonus.bonusTypeTitle}
                  </Text>
                </View>
                <View style={styles.selectedFundsTabHorizontalLine} />
              </View>
            ) : (
              <View key={index.toString()} style={[styles.fundsTabContainer, {flexDirection: 'row'}]}>
                <Text 
                  style={[styles.fundsTabTextTitleStyle, { color: '#cbcbcb'}]}
                  onPress={() => this.setSelectedFunds(bonus.bonusTypeData)}
                >
                  {bonus.bonusTypeTitle}
                </Text>
              </View>
            ))
          })
          }
        </View>
        <View style={[styles.nameContainer]}>
          <Text style={[styles.yearMonthTextStyle, { marginLeft: 10, opacity: 0.8 }]}>
            {`Distributor Name : `}
          </Text>
          <Text style={[styles.yearMonthTextStyle, { flex: 1, marginLeft: 5, opacity: 0.8 }]}>
            {`${this.props.auth.username} ( ${this.props.auth.distributorID} ) `}
          </Text>
        </View>
        <View style={styles.yearMonthContainer}>
          <Text style={[styles.yearMonthTextStyle,{ marginLeft: 18,  opacity: 0.6 }]}>
            {(selectedMonth==='Select Month' && selectedYear=='Select Year') ?
              dateFormatMonthWithYear(new Date(this.getLastYearMonth())) : `${selectedMonth} ${selectedYear}`
            }
          </Text>
          <TouchableOpacity
            style={styles.selectYearMonthModal}
            onPress={()=>{
              this.setModalVisible(true)
            }}
          >
            <Image style={{ height: 17, width: 17, marginRight: 10 }} source={VESTIGE_IMAGE.DOB_ICON} />
            <Text style={[styles.yearMonthTextStyle,{ marginLeft: 2,textDecorationLine: 'underline', opacity: 0.8 }]}>History</Text>
          </TouchableOpacity>
        </View>
        {(selectedBonusData && selectedBonusData.length > 0) ? (
          <ScrollView keyboardShouldPersistTaps='always' style={{ marginTop: 10, flex: 1 }}> 
            { selectedBonusData.map((bonusData, index) => {
              const backgroundColor = (bonusData.title === 'Net Pay' || bonusData.title === 'Total Payable') && {backgroundColor: '#0000000D'}
              const font = (bonusData.title === 'Net Pay' || bonusData.title === 'Total Payable') ? {...Specs.fontBold, fontSize: 18} : {...Specs.fontRegular}
              return (
                <View style={backgroundColor} key={index.toString()}>
                  <View style={[styles.bonusDetailContainer]}>
                    <Text style={[{color: '#414456', fontSize: 14}, font]}>{bonusData.title}</Text>
                    <Text style={[{color: '#414456', fontSize: 14}, font]}>{bonusData.value}</Text>
                  </View>
                  <View style={styles.bottomHorizontalLineStyle} />
                </View>
              )
            })}
          </ScrollView>
        ) : this.props.myBonus.isLoading ? null : <EmptyScreen searchResults />
        }
        
        <GenerateBonus
          modalVisible={modalVisible}
          setModalVisible={this.setModalVisible}
          openPicker={this.openPicker}
          setPickerValue={this.setPickerValue}
          bonusData={BONUS_DATA}
          isEnabled={isEnabled}
          generateBonus={async() => {
            const isConnectedToInternet = await connectedToInternet();
            if(isConnectedToInternet) {
              this.generateBonus()
            }
            else {
              showToast(strings.commonMessages.noInternet)
            }
          }
          }
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  backButtonIconImageStyle: {
    height: 18,
    width: 10,
    margin: 17,
  },
  fundsTypeTabContainer: {
    flexDirection: 'row',
    backgroundColor: COLOR_CODES.white,
    borderTopColor: '#c8c9d3',
    borderTopWidth: 0.2,
    height: 60,
  },
  fundsTabTextTitleStyle: {
    color: '#6797d4',
    fontSize: 14,
    ...Specs.fontMedium,
  },
  selectedFundsTabHorizontalLine: {
    borderBottomWidth: 2,
    borderBottomColor: '#6797d4',
    width: '90%',
    position: 'absolute',
    bottom: 1,
  },
  fundsTabContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameContainer: {
    height: 45,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#EFF3F7',
  },
  bonusDetailContainer: {
    marginLeft: 18,
    marginRight: 25,
    height: 35,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bottomHorizontalLineStyle: {
    width: '100%',
    borderBottomColor: '#EAEAEA',
    borderBottomWidth: 1,
    flexDirection: 'row',
  },
  yearMonthContainer: {
    height: 45,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EFF3F7'
  },
  yearMonthTextStyle: {
    color: '#3f4967',
    fontSize: 12,
  },
  selectYearMonthModal: {
    justifyContent: 'center',
    flexDirection: 'row', 
    alignItems: 'center', 
    marginRight: 18
  }
});