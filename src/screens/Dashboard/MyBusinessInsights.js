import React, { useState } from 'react';
import { View, ActivityIndicator, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import { Header } from '../../components';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const MyBusinessInsights = (props) => {

  const [visible, hideSpinner] = useState(true);
  const {distributorID, token } = props.route.params;
  // console.log('scikiqurl : https://scikiq.myvestige.com/vestige/ambassador-dashboard-mobile/?str_t='+token);
  return (
    <View style={{ flex: 1 }}>
      <Header
        navigation={this.props.navigation}
        screenTitle={props.route.params.screenTitle}
      />
      <WebView
        onLoad={() => hideSpinner(false)}
        style={{ flex: 1 }}
        source={{ uri: `https://scikiq.myvestige.com/vestige/ambassador-dashboard-mobile/?str_t=${token}` }}
        injectedJavaScript={`const meta = document.createElement('meta'); meta.setAttribute('content', 'width=width, initial-scale=1.0, maximum-scale=1.0, user-scalable=2.0'); meta.setAttribute('name', 'viewport'); document.getElementsByTagName('head')[0].appendChild(meta); `}
        scalesPageToFit
      />
      {visible && (
        <ActivityIndicator
          style={{ position: 'absolute', top: (SCREEN_HEIGHT / 2) - 60, left: (SCREEN_WIDTH / 2) - 20 }}
          size="large"
          color="#0000ff"
        />
      )}
    </View>
  );
};

export default MyBusinessInsights;
