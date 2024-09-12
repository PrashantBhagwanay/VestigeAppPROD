import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import HeaderLeftIcons from 'app/src/components/navigation/HeaderLeftIcons';
import { Specs } from 'app/src/utility/Theme';
import { Header } from '../../components';

export default class AboutUsWebView extends Component {

  constructor(props) {
    super(props)
  }

  render() {
    return (
      <>
        <Header
          navigation={this.props.navigation}
          screenTitle={this.props.route.params.title}
        />
        <View style={{padding: 20, flex: 1, backgroundColor: '#fff'}}>
          <WebView
            source={{ html: this.props.route.params.answer }}
            injectedJavaScript={`const meta = document.createElement('meta'); meta.setAttribute('content', 'width=width, initial-scale=1.0, maximum-scale=1.0, user-scalable=2.0'); meta.setAttribute('name', 'viewport'); document.getElementsByTagName('head')[0].appendChild(meta); `}
            scalesPageToFit
          />
        </View>
      </>
    );
  }
}

const styles = StyleSheet.create({
  headerTitle: {
    ...Specs.fontBold,
    fontSize: 18,
    color: '#373e73',
  },
});
