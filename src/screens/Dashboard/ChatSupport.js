import React, {Component} from 'react';
import { 
  View, 
  Dimensions, 
  Platform, 
  StyleSheet, 
  KeyboardAvoidingView, 
  ActivityIndicator,
  ScrollView
} from 'react-native';
import HeaderLeftIcons from 'app/src/components/navigation/HeaderLeftIcons';
import { Specs } from 'app/src/utility/Theme';
import { inject, observer } from 'mobx-react';
import { WebView } from 'react-native-webview';
import Loader  from 'app/src/components/loader/Loader';
import { Header } from '../../components';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

@inject('auth', 'profile', 'dashboard')
@observer
export default class ChatSupport extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isLoading: true
    }
  }

  isLoaderVisible = (value) => {
    this.setState({
      isLoading: value
    })
  }

  getViewportScript = () => {
    if (Platform.OS === 'ios') {
      return `<meta name="viewport" content="width=width, initial-scale=1.1, maximum-scale=1.1 user-scalable=2.0">`;
    }
    return `<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">`;
  }

  render() {
    const {auth, route} = this.props;
    const userIdentity = `"${auth.distributorID}"`;
    const distributorID = auth.distributorID;
    const password = auth.password;
    const username = `"${auth.username}"`;
    const userToken = `"${auth.vestigeUT}"`;
    const authToken = `"${auth.authToken}"`;
    const latitude = route?.params?.latitude || '';
    const longitude = route?.params?.longitude || '';
    const address_coordinate = `"${latitude}-${longitude}"`;
    console.log('rescheck', address_coordinate);
    const url=`https://app.ailifebot.com/static/standalone/standalone.html?bot_key=c1947169935b4bcf&env=p&launch_flow=8B5631C5E4D444DBBB6B7CBE96C7BFA0&env=p&data_attrs={distributorid=${distributorID}::password=${password}}`;
    console.log('url====>', url);
  
    const chatBotScript = `
      <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js" type="text/javascript"></script>
      <html>
      <head>${this.getViewportScript()}</head>
      </html>
      <script src="https://chatbot.myvestige.com/bot.js">
      </script>
      <script>
      initializeBot({
        bot_key: "xJam50r5lf6BH9OJ3TP7LlfjJ8lV5ox8",
        bot_height : "600",
        bot_width: "350",
        bot_icon_url :"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRsapqs_JCwH0tK5WO4ACNnjcBWN58rEG0-sREHFr3CGw3knHliAw",
        user_info : {
        user_identity: ${userIdentity},
        user_identity_type: "email",
        user_name: ${username},
        user_phone: "9582214868",
        user_email: "eshan.suri@vestigebestdeals.com",
        user_role: ${userToken},
        user_gender: "male",
        user_city: "Delhi",
        user_dob: "",
        user_address: ${address_coordinate}
        }
      });
      buttonDiv.classList.remove("m-fadeIn");
      buttonDiv.classList.add("m-fadeOut");
      chatBar.classList.remove("close");
      window.onload = function(){
        document.getElementById('buttonBar').click();
      }
      </script>`;

    return (
      <KeyboardAvoidingView
        behavior="padding"
        enabled={Platform.OS === 'android'}
        keyboardVerticalOffset={Platform.OS === 'android'&&20}
        // contentContainerStyle={{ flex: 1 }}
        style={{ flex: 1 }}
      >
        <Loader loading={this.state.isLoading} />
        <Header
          navigation={this.props.navigation}
          screenTitle={'Chat Support'}
        />
        <WebView
          // originWhitelist={['*']}
          // source={{
          //   html: chatBotScript,
          // }}
          source={{ uri: url }} 
          style={{ marginTop: 5 }}
          scalesPageToFit
          scrollEnabled
          javaScriptEnabled
          startInLoadingState
          renderLoading={() => <Loader loading />}
          onLoad={() => this.isLoaderVisible(false)}
          onLoadEnd={() => this.isLoaderVisible(false)}
        />
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  headerTitle:{
    ...Specs.fontBold,
    fontSize:18,
    color: '#373e73',
  },
})