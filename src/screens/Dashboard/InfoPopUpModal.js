import React, { useState, useRef } from 'react';
import {
  View,
  Modal,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { isIphoneXorAbove } from 'app/src/utility/Utility';
import Banner from 'app/src/screens/Dashboard/Banner';
import Icon from 'react-native-vector-icons/Ionicons';

const CLOSE_IMAGE = require('app/src/assets/images/DashBoardHeader/close.png');

const InfoPopUpModal = (props) => {
  const { isVisible = true, data, requestClose } = props;
  const [canGoBack, setCanGoBack] = useState(false);
  const webViewRef = useRef();

  const onNavigationStateChange = (navState) => {
    setCanGoBack(navState.canGoBack);
  };

  const renderCloseIcon = () => (
    <TouchableOpacity
      style={styles.closeIcon}
      activeOpacity={1.0}
      onPress={() => requestClose(false)}
    >
      <Banner
        styles={{ width: 20, height: 20 }}
        source={CLOSE_IMAGE}
        resizeMode="contain"
      />
    </TouchableOpacity>
  );

  const renderBackButton = () => (
    <TouchableOpacity
      style={styles.backButton}
      disabled={!canGoBack}
      onPress={() => webViewRef?.goBack()}
    >
      <Icon name="ios-arrow-back" size={30} color="#3f4967" />
    </TouchableOpacity>
  );

  return (
    <Modal
      animationType="fade"
      transparent
      visible={isVisible}
      onRequestClose={() => requestClose(false)}
    >
      <View style={styles.mainContainer}>
        <View style={[styles.containerInfo, Platform.OS === 'ios' ? styles.containerInfoIos : styles.containerInfoAndroid]}>
          <View style={styles.header}>
            {renderCloseIcon()}
            {canGoBack && renderBackButton()}
          </View>
          <WebView
            ref={webViewRef}
            originWhitelist={['*']}
            source={{ uri: data }}
            scrollEnabled
            javaScriptEnabled
            startInLoadingState
            onNavigationStateChange={onNavigationStateChange}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00000050',
  },
  containerInfo: {
    width: Dimensions.get('window').width - 40,
    height: Dimensions.get('window').height - (isIphoneXorAbove() ? 230 : 165),
    backgroundColor: 'white',
    borderRadius: 6,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    height: 45,
    backgroundColor: '#e9f0f9',
    padding: 7.5,
  },
  closeIcon: {
    // position: 'absolute',
    // right: 8,
    // top: 8,
    height: 30,
    width: 30,
    backgroundColor: '#262626',
    borderRadius: 15,
    padding: 5,
  },
  containerInfoIos: {
    shadowOffset: { width: 0, height: 0 },
    shadowColor: '#e1e5e6',
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  containerInfoAndroid: {
    elevation: 15,
  },
  backButton: {
    height: 30,
    paddingHorizontal: 5,
  },
});

export default InfoPopUpModal;
