import React, { useState } from 'react';
import { View, ActivityIndicator, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import { Header } from '../../components';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const YoutubeWebView = (props) => {

  const [visible, hideSpinner] = useState(true)

  return (
    <View style={{ flex: 1 }}>
      <Header
        navigation={props.navigation}
        screenTitle={props.route.params.screenTitle}
      />
      <WebView
        onLoad={() => hideSpinner(false)}
        style={{ flex: 1 }}
        source={{ uri: props.route.params.uri }}
        javaScriptEnabled={true}
        scrollEnabled={false}
        allowsFullscreenVideo={true}
      />
      {visible && (
        <ActivityIndicator
          style={{ position: 'absolute', top: (SCREEN_HEIGHT / 2) - 60 , left: (SCREEN_WIDTH / 2) - 20 }}
          size='large'
          color="#0000ff"
        />
      )}
    </View>
  )
}

export default YoutubeWebView;