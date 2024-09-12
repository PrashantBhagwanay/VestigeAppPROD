import { Alert } from 'react-native';

export class AlertClass {
  showAlert = (title, message, buttons, cancelable) => {
    setTimeout(() => {
      return Alert.alert(title, message, buttons, {
        cancelable: cancelable ? cancelable : false,
      });
    }, 100);
  };
}

export default new AlertClass();
