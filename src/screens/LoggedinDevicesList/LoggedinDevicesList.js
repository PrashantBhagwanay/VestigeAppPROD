import React, { Component } from 'react';
import { View, StyleSheet, FlatList, Text } from 'react-native';
import { connectedToInternet, getUniqueID } from 'app/src/utility/Utility';
import { observer, inject } from 'mobx-react';
import DeviceItem from 'app/src/screens/LoggedinDevicesList/DeviceItem/DeviceItem';
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
import checkInternetConnectivity from '../../utility/internetConnectivity/internetConnectivity';
import * as AsyncStore from 'app/src/utility/AsyncStoragesUtils';
import { Header } from '../../components';

@inject('deviceListing', 'auth')
@observer

export default class LogedinDevicesList extends Component {

  @observable isInternetConnected: Boolean = true;

  constructor(props) {
    super(props);
    makeObservable(this);
    this.getLoggedInDeviceData = this.getLoggedInDeviceData.bind(this)
  }

  async componentDidMount() {
    let DEVICE_ID = AsyncStore.addPrefix('deviceId');
    this.deviceIDD = await AsyncStore.get(DEVICE_ID)
    this.isInternetConnected = await connectedToInternet();
    if(this.isInternetConnected){
      let deviceData = {
        "distributorId": this.props.auth.distributorID,
        "deviceId":"",
        "distMobileNumber" : "",
        "type" : "Search"
      }
      await this.getLoggedInDeviceData(deviceData);
    }
  }

  @autobind
  async networkStatus(status) {
    if(status) {
      this.isInternetConnected = status;
      let deviceData = {
        "distributorId": his.props.auth.distributorID,
        "distMobileNumber" : "",
        "deviceId":"",
        "type" : "Search"
      }
      await this.getLoggedInDeviceData(deviceData);
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

 

  
  getLoggedInDeviceData = async(deviceData) => {
    const isConnectedToInternet = await connectedToInternet();
    if(isConnectedToInternet) {
      const status =  await this.props.deviceListing.getDeviceDataList(deviceData)
      if(status) {
        this.toast(status, Toast.type.ERROR)
      }
    }
    else {
      this.toast(strings.commonMessages.noInternet, Toast.type.ERROR)
    }
  }

  postDeviceUnregister(selectedData) {
    let deviceData = {
      distributorId: selectedData.distributorId,
      deviceId: selectedData.deviceId,
      distMobileNumber: selectedData.distMobileNumber,
      type: 'UnRegister',
      loggedInUserDeviceId: this.props.auth.deviceId,
    };
    this.getLoggedInDeviceData(deviceData);
  }

  footer= () => {
    return(
    <View style={{width:'100%',height:10,backgroundColor:'#e8ebf0'}}>
    </View>);
  }

  render() {
    const { isLoading } = this.props.deviceListing;
    const { navigation } = this.props;
    return(
      <View style={styles.mainView}>
        { !this.isInternetConnected && <OfflineNotice networkStatus={(status) => this.networkStatus(status)} /> }
        <Loader loading={isLoading} />
        <Header
          navigation={this.props.navigation}
          screenTitle={strings.drawerScreen.LoggedIn_Devices}
        />
        <FlatList
          style={{paddingTop:0}}
          data={this.props.deviceListing.deviceListData}
          extraData={this.props.deviceListing.deviceListData}
          keyExtractor={(item, index) => item + index}
          ListFooterComponent={this.footer}
          renderItem={({item}) => (
            <DeviceItem 
              item={item}
              deviceId={this.deviceIDD}
              postDeviceUnregister={()=>{this.postDeviceUnregister(item)}} 
              navigation={navigation}
            />
          )}
        />
      </View>
    );
  }
}
const styles = StyleSheet.create({
  mainView: {
    backgroundColor: '#ffffff',
    flex: 1
  },
  distributorLevelInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f2f5f8'
  },
  distributorCurrentLevelStyle: {
    ...Specs.fontBold,
    paddingVertical: 10,
    fontSize: 14,
    color: '#474b60',
    marginLeft: 10,
    marginBottom: 5,
    width : '50%'
  },
});