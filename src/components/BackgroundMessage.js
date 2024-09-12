import firebase from '@react-native-firebase/app';
import messaging, { RemoteMessage } from '@react-native-firebase/messaging';

export default async(message: RemoteMessage) => {
  try {
    console.log(message); 
    return Promise.resolve();
  }
  catch (err) {
    console.log(err); 
  }
};

