// @flow
import AsyncStorage from '@react-native-async-storage/async-storage';


export const PREFIX:string = 'VESTIGE:';

export const addPrefix = (name:string):string => {
  return `${PREFIX}${name}`;
};

export const get = async (key:string):Promise<?string> => {
  try {
    return await AsyncStorage.getItem(key);
  }
  catch (err) {
    console.log(err);
  }
};

export const multiGet = async (keys:Array<string>):Promise<any> => {
  // const keyString = keys.join(', ');
  try {
    const keyValue = await AsyncStorage.multiGet(keys);
    // just return the values
    return keyValue.map(keyVal => keyVal[1])
  }
  catch (err) {
    console.log(err);
  }
};

export const set = async (key:string, value:string):Promise<*> => {
  try {
    return await AsyncStorage.setItem(key, value);
  }
  catch (err) {
    console.log(err);
  }
};
  
export const remove = async (key:string):Promise<*> => {
  try {
    const status = await AsyncStorage.removeItem(key);
    return status
  }
  catch (err) {
    console.log(err);
  }
};