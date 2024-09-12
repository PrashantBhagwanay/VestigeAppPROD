import React, { Component } from 'react';
import { View, Text, TouchableOpacity, Image, Dimensions, StyleSheet } from 'react-native';
import { strings } from 'app/src/utility/localization/Localized';
import { Specs } from 'app/src/utility/Theme';
import NetInfo from '@react-native-community/netinfo';
import { checkInternetOnce } from '../utility/internetConnectivity/internetConnectivity';

const { width, height } = Dimensions.get('window');
const ERROR_IMAGE = require('app/src/assets/images/emptyScreen/Error.png');

export default class OfflineNotice extends Component {

  componentDidMount() {
    // NetInfo.getConnectionInfo().then(this.handleConnectivityChange);
    this.unsubscribe = NetInfo.addEventListener(this.handleConnectivityChange);
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  handleConnectivityChange = async () => {
    const check = await checkInternetOnce();
    this.props.networkStatus(check);
  }

  // handleConnectivityChange = isConnected => {
  //   if (isConnected) {
  //     this.setState({ isConnected });
  //   } 
  //   else {
  //     this.setState({ isConnected });
  //   }
  //   this.props.networkStatus(isConnected)
  // };

  render() {
    return (
      <View style={styles.offlineContainer}>
        <Image
          style={styles.errorImage} 
          resizeMode="cover"
          source={ERROR_IMAGE}
        />
        <Text style={styles.errorHeading}>{strings.failureScreen.errorHeading}</Text>
        <Text style={styles.errorText}>{strings.failureScreen.errorMessage}</Text>
        <TouchableOpacity style={styles.buttonContainer} onPress={() => this.handleConnectivityChange()}>
          <Text style={styles.buttonText}>{strings.failureScreen.retry}</Text>
        </TouchableOpacity>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  offlineContainer: {
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    width: width,
    height: '100%',
    position: 'absolute',
    zIndex: 1
  },
  buttonContainer: {
    marginTop: 17, 
    width:120,
    height:30,
    backgroundColor: '#14aa93', 
    borderRadius:19,
    alignItems:'center',
    justifyContent:'center',
    borderWidth:1,
    borderColor:'#979797'
  },
  buttonText: {
    ...Specs.fontSemibold,
    color: '#ffffff', 
    fontSize: 14
  },
  errorHeading: {
    fontSize: 16, 
    ...Specs.fontSemibold,
    color:'#3f4967',
    marginHorizontal:20,
    textAlign:'left',
    marginTop:33
  },
  errorText: {
    fontSize: 14, 
    ...Specs.fontRegular,
    color:'#3f4967',
    marginHorizontal:20,
    textAlign:'left',
    marginTop:10
  },
  errorImage: {
    height: 165, 
    width: 253,
    marginBottom:40
  }
});