
import NetInfo from '@react-native-community/netinfo';
import * as AsyncStore from 'app/src/utility/AsyncStoragesUtils';
import store from '../../stores/Store';
import { showLog } from '../logger/Logger';

export default function checkInternetConnectivity() {
  const unsubscribe = NetInfo.addEventListener((state) => {
    // console.log('check net state', state.isConnected);
    // AsyncStore.set('isConnected', JSON.stringify(state.isConnected));
    store.auth.setNetworkConnectivity(state.isConnected);
  });
  return unsubscribe;
}

export const checkInternetOnce = async () => {
  // const status = await NetInfo.fetch().then((state) => {
  //   console.log('recheck net state', state);
  //   store.auth.setNetworkConnectivity(state.isConnected);
  // });
  const status = await NetInfo.fetch();
  // console.log('recheck net state', status);
  store.auth.setNetworkConnectivity(status.isConnected);
  return status.isConnected;
};
