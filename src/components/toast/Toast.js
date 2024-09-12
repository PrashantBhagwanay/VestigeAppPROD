import React, { Component } from 'react';
import { Alert } from 'react-native';

import RootSiblings from 'react-native-root-siblings';
import { strings } from 'app/src/utility/localization/Localized';
import  ToastContainer, {positions, durations, type} from './ToastContainer';

// export { RootSiblings as Manager };

export class Toast extends Component {
  static displayName = 'Toast';
  static propTypes = ToastContainer.propTypes;
  static positions = positions;
  static durations = durations;
  static type = type;

  static show = (message, options = {position: positions.TOP, duration: durations.SHORT, type: type.SUCCESS}) => {
    return new RootSiblings(<ToastContainer {...options} visible>{message}</ToastContainer>);
  };

  static hide = toast => {
    if (toast instanceof RootSiblings) {
      toast.destroy();
    }
    else {
      console.log(`Toast.hide expected a \`RootSiblings\` instance as argument.\nBut got \`${typeof toast}\` instead.`);
    }
  };

  _toast = null;

  UNSAFE_componentWillMount = () => {
    this._toast = new RootSiblings(<ToastContainer {...this.props} duration={0} />);
  };

  UNSAFE_componentWillReceiveProps = nextProps => {
    this._toast.update(<ToastContainer {...nextProps} duration={0} />);
  };

  componentWillUnmount = () => {
    this._toast.destroy();
  };

  render() {
    return null;
  }
}

export class AlertMessage extends Component {
  static showAlert = (message, navigation) => {
    return (
      Alert.alert(
        '',
        message,
        [
          {text: strings.commonMessages.skip, onPress: () => console.log('Skip pressed')},
          {text: strings.commonMessages.continue, onPress: () => navigation.navigate('kycImage',{isDrawer:true})},
        ],
        { cancelable: false }
      )
    );
  };

  render() {
    return null;
  }
}
