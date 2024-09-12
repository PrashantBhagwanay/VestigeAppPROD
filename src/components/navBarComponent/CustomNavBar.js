/**
 * @description custom navbar used throughout the application
 */

// 'use strict';
import React from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
} from 'react-native';


// custom navbar css

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: '#EFF3F7',
  },
  iconContainer: {
    justifyContent: 'center',
  },
  backButtonIconImageStyle: {
    height: 30,
    width: 30,
    margin: 10,
  },
  textTitleContainer: {
    marginLeft: 25,
    justifyContent: 'center',
    height: 60,
  },
  textTitleStyle: {
    color: '#414456',
    fontSize: 18,
  }
});

const BACK_BUTTON = require('../../assets/images/Splash/back.png');

const customNavBar = (params) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Image style={styles.backButtonIconImageStyle} source={BACK_BUTTON} />
      </View>

      <View style={styles.textTitleContainer}>
        <Text style={styles.textTitleStyle}>
          {params.textTitle}
        </Text>
      </View>
    </View>
  );
};


export default customNavBar;
