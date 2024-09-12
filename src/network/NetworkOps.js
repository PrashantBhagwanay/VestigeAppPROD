// @flow
import { Platform, StatusBar } from 'react-native';
import { get } from 'lodash';
import Auth from 'app/src/stores/Auth';
import { strings } from 'app/src/utility/localization/Localized';
import * as AsyncStore from 'app/src/utility/AsyncStoragesUtils';
import AlertClass from 'app/src/utility/AlertClass';
import { observable } from 'mobx';
import { urlFor } from './Urls';
import type { ServiceType } from './Urls';
import { connectedToInternet } from '../utility/Utility';
import { showLog } from '../utility/logger/Logger';

const setNetworkActivityIndicatorVisible = (value) => {
  if (Platform.OS === 'ios') {
    StatusBar.setNetworkActivityIndicatorVisible(value);
  }
};

export class NetworkOps {
  @observable alertPresent = false;

  auth: Auth;

  async init(auth: Auth) {
    this.auth = auth;
    await this.auth.init();
  }

  async getRequest(type, options?): any {
    const headerOverrides = get(options, 'headerOverrides', {});
    let request = {
      method: type,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...headerOverrides,
      },
    };

    if (this.auth.isAuthenticated && this.auth.authToken) {
      // console.log('authToken==>'+this.auth.authToken);
      request.headers = {
        ...request.headers,
        Authorization: `bearer ${this.auth.authToken}`,
        distributorId: this.auth.distributorID,
      };  
    }
    return request;
  }

  async wrapperWithOptions(url:string, request:any) {
    setNetworkActivityIndicatorVisible(true);
    try {
      const isInternetConnected = await connectedToInternet();
      if (isInternetConnected) {
        // console.warn(url)
        const response = await fetch(url, request);
        // showLog('Full-request', JSON.stringify(request));
        if (!response?.ok) {
          if (response?.status === 401) {
            // console.log('Token==>'+this.auth.authToken )
            if (this.auth.authToken && this.auth.logoutAlertMessage) {
              const logout = await this.auth.signOut();
              logout && this.auth.navigation.navigate({ name: 'login', key: 'login'});
              this.auth.updateLogoutAlertMessageKey();
              if (!this.alertPresent) {
                this.alertPresent = true;
                setTimeout(async () => {
                  const err = await response.json();
                  return AlertClass.showAlert('',
                    get(err, 'title'),
                    [{ text: 'Ok', onPress: () => { this.alertPresent = false; } }]);
                }, 300);
              }
            }
          }
          else if (response.status === 500 && response.status === 400) {
            showLog('Got 500 or 400,', response);
          }
          // else if (response.status === 504) {
          //   showLog('Got 504,', response);
          //   const newError = new Error(strings.commonMessages.parsingError);
          //   newError.name = response.status;
          //   newError.statusmsg = 'Server Exception!';
          //   throw newError;
          // }
          const err = await response.json();
          const newError = new Error(get(err, 'title'));
          newError.name = response.status;
          // newError.message = get(err, 'title') || '';
          newError.statusmsg = err.statusmsg;
          showLog('error url', url, '\n', newError);
          throw newError;
        }
        else {
          const res = await response?.text?.();
          showLog('url', url);
          showLog('response', JSON.stringify(JSON.parse(res)));
          return JSON.parse(res);
        }
      }
      else {
        // showToast(strings.commonMessages.noInternet);
        const newError = new Error(strings.commonMessages.noInternet);
        newError.name = 'noInternet';
        throw newError;
      }
    }
    catch (error) {
      showLog('Exception', error);
      return error;
    }
    finally {
      setNetworkActivityIndicatorVisible(false);
    }
  }

  postToJson = async (service: ServiceType, data: any): Promise<*> => {
    try {
      const JSONData = JSON.stringify(data);
      return this.postRaw(service, JSONData)
    }
    catch (err) {
      throw err;
    }
  }

  postRaw = async (service: ServiceType, data: any, options?: any): Promise<*> => {
    try {
      const request = await this.getRequest('POST', options);
      request.body = data;
      showLog('post request', JSON.stringify(data))
      showLog('url==>',urlFor(service));
      return this.wrapperWithOptions(urlFor(service),request)
    }
    catch (err) {
      throw err;
    }
  }

  putToJson = async (service: ServiceType, data: any): Promise<*> => {
    try {
      const request = await this.getRequest('PUT');
      request.body = JSON.stringify(data);
      showLog('put request',data)
      return this.wrapperWithOptions(urlFor(service),request)
    }
    catch (err) {
      throw err;
    }
  }

  get = async (service: ServiceType, options?: any): Promise<*> => {
    try {
      const request = await this.getRequest('GET', options);
      return this.wrapperWithOptions(urlFor(service),request)
    }
    catch (err) {
      throw err;
    }
  }

  delete = async (service: ServiceType): Promise<*> => {
    try {
      const request = await this.getRequest('DELETE');
      showLog('delete request', service)
      return this.wrapperWithOptions(urlFor(service),request)
    }
    catch (err) {
      throw err;
    }
  }

  getRaw = async (service: string): Promise<*> => {
    try {
      const request = await this.getRequest('GET');
      return this.wrapperWithOptions(service, request)
    }
    catch (err) {
      throw err;
    }
  }
}

export default new NetworkOps();
