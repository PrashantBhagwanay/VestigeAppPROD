import React from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import Banner from '../../screens/Dashboard/Banner';

/**
 * @description: Make iamge with crown on the basis of parameter
 */ 
const UserImageLevel = (parameter) =>  {
  const { userImage } = parameter;
  const { type } = parameter;
  return (
    <View style={styles.mainView}>
      <Banner
        styles={styles.profileImageView}
        resizeMode="contain"
        source={userImage}
      />
      {type==='1'?null: crownImage(parameter)}
    </View>
  )
}

/**
 * @description: Make crown image
 */
const crownImage = (parameter) => {
  const { userImage } = parameter;
  return (
    <Banner
      styles={styles.profileCrownImage}
      source={userImage}
      resizeMode="contain"
    />
  )
}

/**
 * @description: This is the custom stylesheet for current Level
 */
const styles = StyleSheet.create({
  mainView: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginLeft: 5,
  },
  profileImageView: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignSelf: 'center',
    marginTop: 10,
  },
  profileCrownImage: {
    width: 15,
    height: 15,
    position: 'absolute',
    marginLeft: 35,
    marginTop: 35,
  },
});

export default UserImageLevel;