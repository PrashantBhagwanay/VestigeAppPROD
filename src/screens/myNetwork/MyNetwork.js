import React, { Component } from 'react';
import { View, StyleSheet, FlatList, Text, TouchableOpacity, Image, Dimensions } from 'react-native';
import { connectedToInternet } from 'app/src/utility/Utility';
import { observer, inject } from 'mobx-react';
import MyNetworkComponent from 'app/src/screens/myNetwork/myNetworkComponent/MyNetworkComponent';
import Loader from 'app/src/components/loader/Loader';
import * as Urls from 'app/src/network/Urls';
import { Toast } from 'app/src/components/toast/Toast';
import { Specs } from 'app/src/utility/Theme';
import HeaderSearchIcons from 'app/src/components/navigation/HeaderSearchIcons';
import HeaderLeftIcons from 'app/src/components/navigation/HeaderLeftIcons';
import autobind from 'autobind-decorator';
import { strings } from 'app/src/utility/localization/Localized';
import OfflineNotice from 'app/src/components/OfflineNotice';
import { observable, makeObservable } from 'mobx';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import DateTimePicker from 'react-native-modal-datetime-picker';
import moment from 'moment';
import * as AsyncStore from 'app/src/utility/AsyncStoragesUtils';
import { func, string } from 'prop-types';
import { times } from 'lodash';
import { Header } from '../../components';
import HeaderSearchNameUcdID from '../../components/navigation/HeaderSearchNameUcdID';

const calendarIcon = require('app/src/assets/images/training/calenndarIcon.png');
const FAVORITE_LIST = AsyncStore.addPrefix('favorite_downlines');

const DEPTHLEVEL = AsyncStore.addPrefix("depth_level");
const DISTRIBUTORID = AsyncStore.addPrefix('distributor_id');

@inject('network', 'profile', 'auth', 'appConfiguration')
@observer

export default class MyNetwork extends Component {

  @observable isInternetConnected: Boolean = true;
  @observable starredCountConfig: String = '';

  constructor(props) {
    super(props);
    makeObservable(this);
    this.state = {
      selectedValue: 'myNetwork',
      selectedBy: 'distributorId',//distributorId, byUcdid
      isDatePickerVisible: false,
      isListRefreshing: false,
      dateType: 'From',
      toDate: new Date(),
      fromDate: moment(new Date()).subtract(1, 'months')._d
    }
    this.depthLevel = 0;
    this.starredCountConfig = this.props.appConfiguration?.starredDownlineCount?.value;
  }

  async componentDidMount() {
    let d_level = await AsyncStore.get(DEPTHLEVEL)
    this.depthLevel = d_level ? parseInt(d_level) : 0;

    this.isInternetConnected = await connectedToInternet();
    if (this.isInternetConnected) {
      await this.props.network.init();
      await this.getMainUplineData();
      await this.getPvAnalysisData()
      await this.props.network.fetchGetUcdID();
      // await this.refreshStarredList(this.props.network.favoriteDownlineData);
    }
  }

  @autobind
  async networkStatus(status) {
    if (status) {
      this.isInternetConnected = status;
      await this.getMainUplineData();
    }
  }

  @autobind
  toast(message, type: string) {
    Toast.show(message, {
      duration: Toast.durations.SHORT,
      type: type,
      shadow: false,
      animation: true,
      hideOnPress: true,
      delay: 0,
    });
  }

  getPvAnalysisData = async () => {
    const { fromDate, toDate } = this.state
    const downlineIds = this.props.network.favoriteDownlineData.map((downline) =>
      downline.distributorId
    ).join(',')
    await this.props.network.fetchPvAnalysisData(this.getDateInFormat(fromDate), this.getDateInFormat(toDate), downlineIds)
    this.setState({})
    this.updateAsync();
    AsyncStore.remove(FAVORITE_LIST);
  }

  refreshStarredList = async () => {
    const downlineIds = this.props.network.favoriteDownlineData.map((downline) =>
      downline.distributorId
    ).join(',');
    await this.props.network.fetchMultipleDownlineData(downlineIds);
    this.setState({})
    this.updateAsync();
  }

  getCellDownlineData = async (item) => {

    let hLevel = item.hierarchyLevel ? parseInt(item.hierarchyLevel) : 0
    if (((this.depthLevel <= hLevel) && this.props.profile.countryId == 2) && this.props.profile.depth_level == false) {
      this.toast(strings.errorMessage.signUp.restrictedDownlineFoundForUser, Toast.type.ERROR)
      return
    }

    const isConnectedToInternet = await connectedToInternet();
    if (isConnectedToInternet) {
      const status = await this.props.network.fetchNetworkDownline(item);
      if (!status) {
        this.toast(strings.errorMessage.signUp.noDownlineFound, Toast.type.ERROR)
      }
      else {
        this.setData('myNetwork')
      }
    }
    else {
      this.toast(strings.commonMessages.noInternet, Toast.type.ERROR)
    }
  }

  getMainUplineData = async () => {
    const isConnectedToInternet = await connectedToInternet();
    if (isConnectedToInternet) {
      const status = await this.props.network.fetchNetworkData(Urls.DistributorServiceEnum.UserDownline);
      if (!status) {
        this.toast(strings.errorMessage.signUp.noDownlineForLoggedInDistributor, Toast.type.ERROR)
      }
      else {
        this.setData('myNetwork')
      }
    }
    else {
      this.toast(strings.commonMessages.noInternet, Toast.type.ERROR)
    }
  }

  getCellUplineData = async (item) => {
    const isConnectedToInternet = await connectedToInternet();
    if (isConnectedToInternet) {
      const status = await this.props.network.fetchUplineData(item)
      if (!status) {
        this.toast(strings.errorMessage.signUp.noUpline, Toast.type.ERROR)
      }
      else {
        this.setData('myNetwork')
      }
    }
    else {
      this.toast(strings.commonMessages.noInternet, Toast.type.ERROR)
    }
  }

  renderTabs = () => {
    const { selectedValue } = this.state;
    return (
      <View style={styles.tabsView}>
        <TouchableOpacity
          style={(selectedValue === 'myNetwork') ? styles.selectedButton : styles.unselectedButton}
          onPress={() => { this.setData('myNetwork') }}
        >
          <Text style={(selectedValue === 'myNetwork') ? styles.selectedTabText : styles.unselectedTabText}>
            {strings.myNetworkScreen.myNetwork}
          </Text>
        </TouchableOpacity>
        <View style={styles.tabDivider} />
        <TouchableOpacity
          style={(selectedValue === 'starred') ? styles.selectedButton : styles.unselectedButton}
          onPress={() => this.setData('starred')}
        >
          <Text style={(selectedValue === 'starred') ? styles.selectedTabText : styles.unselectedTabText}>
            {this.props.network.favoriteDownlineData.length > 0 ? strings.myNetworkScreen.starred + "(" + this.props.network.favoriteDownlineData.length + ")" : strings.myNetworkScreen.starred}
          </Text>
        </TouchableOpacity>
      </View>
    )
  }

  setData = async (type) => {
    if (this.state.selectedValue !== type) {
      this.setState({
        selectedValue: type
      }, async () => {
        if (type == 'starred') {
          // this.isInternetConnected = await connectedToInternet();
          // if (this.isInternetConnected) {
          //   await this.props.network.init()
          //   await this.getMainUplineData();
          //   await this.getPvAnalysisData()
          // }
          await this.refreshStarredList();
        }
      }
      )
    }
  }

  getDateInFormat = (date) => {
    const dateString = moment(date).format('YYYY-MM-DD')
    return dateString;
  }

  renderDatePickerButton = (type) => {
    return (
      <TouchableOpacity
        style={styles.datePicker}
        onPress={() =>
          this.setState({
            isDatePickerVisible: true,
            dateType: type
          })}
      >
        <Text style={{ marginHorizontal: 5 }}>{type}</Text>
        <Image source={calendarIcon} />
        <Text style={styles.textDatePicker}>
          {type === 'From' ? this.getDateInFormat(this.state.fromDate) : this.getDateInFormat(this.state.toDate)}
        </Text>
        {/* <Text style={styles.textDatePicker}>{type === 'From' ? this.state.fromDate : this.state.toDate}</Text> */}
      </TouchableOpacity>
    )
  }

  renderDatePicker = (type) => {
    return (
      <DateTimePicker
        isVisible={this.state.isDatePickerVisible}
        onConfirm={this.handleDatePicker}
        onCancel={this.hideDatePicker}
        minimumDate={type === 'To' ? new Date(this.state.fromDate) : moment(new Date()).subtract(1, 'months')._d}
        maximumDate={type === 'From' ? new Date(this.state.toDate) : new Date()}
        date={type === 'From' ? this.state.fromDate : this.state.toDate}  // default date
        mode='date'
        is24hour
      />
    )
  }

  hideDatePicker = () => this.setState({ isDatePickerVisible: false });

  handleDatePicker = (date) => {
    const { dateType } = this.state
    if (dateType === 'From') {
      this.setState({
        fromDate: date
      });
      console.log('from date', date)
    }
    else {
      this.setState({
        toDate: date,
      })
    }
    this.hideDatePicker();
    setTimeout(() => {
      this.getPvAnalysisData()
    }, 200);
  };

  onStarPress = (isFavorite, item) => {
    if (isFavorite) {
      this.removeFavorite(item);
    }
    else {
      if (this.props.network.favoriteDownlineData.length >= Number(this.starredCountConfig)) {
        this.toast(`You can star-mark maximum of ${this.starredCountConfig} downlines.`, Toast.type.ERROR)
      }
      else {
        this.addToFavorite(item);
      }
    }
  }


  addToFavorite = (item) => {
    this.props.network.favoriteDownlineData.push(item);
    this.updateAsync()
    this.getPvAnalysisData()
    this.setState({})
  }

  removeFavorite = async (item) => {
    const currentDistributor = await AsyncStore.get(DISTRIBUTORID);
    if (item.distributorId != currentDistributor) {
      const indexOfItem = this.props.network.favoriteDownlineData.findIndex((obj) => obj.distributorId === item.distributorId)
      if (indexOfItem > -1) {
        this.props.network.favoriteDownlineData.splice(indexOfItem, 1);
      }
      this.updateAsync()
      this.setState({})
    }
  }

  updateAsync = () => {
    console.log('asycupdate')
    const arrayToStore = this.props.network.favoriteDownlineData.slice()
    const stringToStore = JSON.stringify(arrayToStore)
    AsyncStore.set(`${FAVORITE_LIST}${this.props.auth.distributorID}`, stringToStore);
  }

  noDownline = () => {
    const { height } = Dimensions.get('window')
    const { selectedValue } = this.state
    return (
      <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1, height: height * 0.5 }}>
        {
          selectedValue === 'myNetwork' ?
            null :
            (
              <View>
                <Text>No Starred downlines Found.</Text>
                {/* <Text>No Starred downlines Found.</Text> */}
              </View>
            )
        }
      </View>
    )
  }

  onListRefresh = async () => {
    this.setState({
      isListRefreshing: true
    }, async function () {
      await this.props.network.init();
      await this.getMainUplineData();
      await this.getPvAnalysisData();
      // await this.refreshStarredList(this.props.network.favoriteDownlineData);
    })
    this.setState({
      isListRefreshing: false
    })
  }

  handleConsistencyNotification = async (item) => {
    let userData;
    const resDownlineData = await this.props.network.fetchSingleDownlineData(item.distributorId);
    if (resDownlineData.success) {
      userData = resDownlineData.data[0];
    }
    else {
      this.toast(resDownlineData.message, Toast.type.ERROR);
      return;
    }
    if (Object.keys(userData).length > 0 &&
      (userData?.smsCount > 0 || userData?.alertCount > 0 || userData?.notificationCount > 0)) {
      const data = {
        uplineId: this.props.auth.distributorID,
        downlineId: item.distributorId,
        smsCount: userData?.smsCount,
        alertCount: userData?.alertCount,
        notificationCount: userData?.notificationCount,
        startDate: userData?.cncMsgStartDate,
        endDate: userData?.cncMsgEndDate
      }
      const res = await this.props.network.sendConsistencyNotification(data);
      if (res.success) {
        res.data != '' ? this.toast(res.data, Toast.type.SUCCESS) : null
      }
      else {
        this.toast(res.message, Toast.type.ERROR);
      }
    }
  }

  render() {
    const { isLoading, selectedPersonDistributorName, selectedPersonDistributorID, favoriteDownlineData } = this.props.network;
    const { navigation } = this.props;
    return (
      <View style={styles.mainView}>
        {!this.isInternetConnected && <OfflineNotice networkStatus={(status) => this.networkStatus(status)} />}
        <Loader loading={isLoading} />
        <Header
          navigation={this.props.navigation}
          screenTitle={this.props.route.params.countryId != 2 ? 'My Networks' : 'My Team'}
        />
        {this.renderTabs()}
        {this.state.selectedValue !== 'starred' && (
          <View style={{ flexDirection: 'row', margin: 10 }}>
            <View style={{ flexDirection: 'row', marginLeft: 10, marginRight: 10, flex: 1 }}>
              <TouchableOpacity
               
                onPress={() => this.setState({ selectedBy:'distributorId'})}
              >
                <Text style={this.state.selectedBy=='distributorId'? 
                styles.selectedText :  styles.unselectedText}>
                  {'Search By Distributor ID'}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', marginLeft: 10, marginRight: 10, flex: 1 }}>
              <TouchableOpacity
                    onPress={() => this.setState({ selectedBy:'byUcdid'})} >
                <Text style={this.state.selectedBy=='byUcdid'? 
                styles.selectedText :  styles.unselectedText}>
                  {this.props.network.selectedUCDID!=""?`Search By UCD ID ( ${this.props.network.selectedUCDID} )`:
                  `Search By UCD ID`}
                </Text>
              </TouchableOpacity>

            </View>

          </View>
        )

        }
        {this.state.selectedValue == 'starred'
          ?
          (
            <View style={{ flexDirection: 'row' }}>
              {this.renderDatePickerButton('From')}
              {this.renderDatePickerButton('To')}
              {this.state.dateType === 'From' ? this.renderDatePicker('From') : this.renderDatePicker('To')}
            </View>
          )
          : this.state.selectedBy=='distributorId'?
            (
              <HeaderSearchIcons
                submitButtonText='Search'
                distributorSearchHeader
              />
            ) :
            (
              <HeaderSearchNameUcdID
                submitButtonText='Search'
                distributorSearchHeader
              />
            )
        }
        <View style={styles.distributorLevelInfoContainer}>
          <Text numberOfLines={2} style={styles.distributorCurrentLevelStyle}>{selectedPersonDistributorName ? selectedPersonDistributorName : ' '}</Text>
          <Text style={[styles.distributorCurrentLevelStyle], { justifyContent: 'flex-end' }}>
            {selectedPersonDistributorID ? strings.dashboard.DistributorID + selectedPersonDistributorID : ''}
          </Text>
        </View>
        <FlatList
          style={{ paddingTop: 0 }}
          data={this.state.selectedValue === 'myNetwork' ? this.props.network.networkData : this.props.network.favoriteDownlineData}
          extraData={this.props.network.networkData}
          // refreshing={this.state.isListRefreshing}
          // onRefresh={() => this.onListRefresh()}
          keyExtractor={(item, index) => item + index}
          ListEmptyComponent={this.noDownline()}
          renderItem={({ item }) => {
            const isFavorite = favoriteDownlineData.some((obj) => obj.distributorId === item.distributorId)
            return (
              <MyNetworkComponent
                item={item}
                navigation={navigation}
                fetchDownlineData={this.getCellDownlineData}
                fetchMainUplineData={this.getMainUplineData}
                fetchCellUplineData={this.getCellUplineData}
                onStarPress={this.onStarPress}
                handleConsistencyNotification={this.handleConsistencyNotification}
                isFavorite={isFavorite}
                selectedTab={this.state.selectedValue}
                updateAsyncValue={this.updateAsync}
                goToDetailPage={() =>
                  navigation.navigate('downlinePvGraph', {
                    pvData: item,
                    startDate: this.getDateInFormat(this.state.fromDate),
                    endDate: this.getDateInFormat(this.state.toDate),
                  })
                }
              />
            )
          }}
        />
        {this.state.selectedValue == 'myNetwork'
          ?
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={() => this.onListRefresh()}
            style={styles.touchableOpacityStyle}>
            <FontAwesome
              name={'refresh'}
              size={35}
              color={'#fff'}
            />
          </TouchableOpacity>
          : null
        }

      </View>
    );
  }
}
const styles = StyleSheet.create({
  mainView: {
    backgroundColor: '#ffffff',
    flex: 1
  },
  tabsView: {
    flexDirection: 'row',
  },
  unselectedButton: {
    flex: 0.49,
    justifyContent: 'center',
    paddingVertical: 10,
  },
  selectedButton: {
    flex: 0.49,
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderColor: '#4a90e2',
    justifyContent: 'center',
  },
  unselectedTabText: {
    marginHorizontal: 17,
    color: '#615e5e',
    fontSize: 15,
    alignSelf: 'center',
    ...Specs.fontMedium
  },
  selectedTabText: {
    marginHorizontal: 17,
    color: '#4a90e2',
    fontSize: 17,
    alignSelf: 'center',
    ...Specs.fontSemibold
  },
  tabDivider: {
    height: 22,
    width: '0.5%',
    marginVertical: 10,
    backgroundColor: '#979797',
  },
  distributorLevelInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f2f5f8',
    padding: 10
  },
  distributorCurrentLevelStyle: {
    ...Specs.fontBold,
    fontSize: 14,
    color: '#474b60',
    marginBottom: 5,
    flex: 1,
  },
  datePicker: {
    flexDirection: 'row',
    marginVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#c8c9d3',
    padding: 5,
    paddingBottom: 15,
    marginHorizontal: 15,
    flex: 1,
    // alignItems:'center',
    // backgroundColor: 'red'
  },
  textDatePicker: {
    marginLeft: 8,
    paddingLeft: 8,
    borderLeftWidth: 0.5,
    borderLeftColor: '#c8c9d3',
    color: '#3f4967'
  },
  headerTitle: {
    ...Specs.fontBold,
    fontSize: 18,
    color: '#373e73',
  },
  touchableOpacityStyle: {
    position: 'absolute',
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    //alignSelf: 'center',
    bottom: 15,
    right: 15,
    borderRadius: 25,
    backgroundColor: '#4a90e2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.6,
    shadowRadius: 3,
    elevation: 3,
  },
  unselectedText: {
    color: '#373e73',
    fontSize: 14,
    padding: 10,
  },
  selectedText: {
    color: '#14aa93',
    fontSize: 14,
    padding: 10,
  },
});