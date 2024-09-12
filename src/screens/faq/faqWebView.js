import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import HeaderLeftIcons from 'app/src/components/navigation/HeaderLeftIcons';
import { Header } from '../../components';

export default class FaqWebView extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        {/* <Text>{this.props.route.params.qno}</Text> */}
        <Header navigation={this.props.navigation} screenTitle={'FAQ'} />
        <WebView source={{ html: this.props.route.params.answer }} />
      </View>
    );
  }
}
