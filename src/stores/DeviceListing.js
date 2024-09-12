/**
 * @description MyFunds Store, calling api and some actions defined here
 */

import { observable, action, computed, makeAutoObservable } from 'mobx';
import * as AsyncStore from 'app/src/utility/AsyncStoragesUtils';
import { showToast } from 'app/src/utility/Utility';
import { strings } from 'app/src/utility/localization/Localized';
import { VESTIGE_GOOGLE_KEYS } from 'app/src/utility/constant/Constants';
import NetworkOps from 'app/src/network/NetworkOps';
import * as Urls from 'app/src/network/Urls';

export default class DeviceListing {
  @observable isLoading: boolean = false;
  @observable deviceListData = [];
  @observable errorFetchingDeviceListMessage: String = '';

  constructor(store) {
    this.store = store;
    makeAutoObservable(this);
  }

  @action setIsLoading = value => {
    this.isLoading = value;
  };
  @action setDeviceListData = value => {
    this.deviceListData = value;
  };
  @action setErrorFetchingDeviceListMessage = value => {
    this.errorFetchingDeviceListMessage = value;
  };
  //   @computed get getDeviceName(){
  //     let deviceName = [];
  //     if(this.deviceListData){
  //       for(const device of this.deviceListData){
  //         (device.status === true)?
  //           deviceName.push(device.deviceName): null
  //       }
  //     }
  //     return deviceName.slice();
  //   }

  @action setDeviceListOrder = async response => {
    let DEVICE_ID = AsyncStore.addPrefix('deviceId');
    const deviceID = await AsyncStore.get(DEVICE_ID);
    if (response.length > 1) {
      const yourDeviceIndex = response.findIndex(
        item => item.deviceId === deviceID,
      );
      response.splice(0, 0, response.splice(yourDeviceIndex, 1)[0]);
      // console.log('setDeviceListOrder response',yourDeviceIndex, response, deviceID)
    }
    this.setDeviceListData(response);
  };

  @action async getDeviceDataList(params) {
    this.setDeviceListData([]);
    this.setIsLoading(true);
    const response = await NetworkOps.postToJson(
      Urls.ServiceEnum.registerUnregSearchDeviceId,
      params,
    );
    this.setIsLoading(false);
    if (!response.message) {
      if (params.type == 'Search') {
        this.setDeviceListOrder(response);
      } else {
        const deviceData = {
          distributorId: params.distributorId,
          deviceId: params.deviceId,
          distMobileNumber: params.distMobileNumber,
          type: 'Search',
        };
        this.setIsLoading(true);
        this.getDeviceDataList(deviceData);
      }
    } else if (response.name === 'noInternet') {
      return response.message;
    } else if (response.message) {
      return response.message;
    } else {
      return 'no device found';
    }
  }

  @action clearDeviceListData() {
    this.storeListData = [];
  }
}
