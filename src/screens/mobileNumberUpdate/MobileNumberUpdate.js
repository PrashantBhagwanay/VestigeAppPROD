import React, { Component } from 'react';
import { View, 
  ScrollView, 
  StyleSheet, 
  Dimensions,
  Image, 
  Linking, 
  TouchableOpacity,
  KeyboardAvoidingView,
  Text,
  Platform
} from 'react-native';
import { inject, observer } from 'mobx-react';
import { observable, makeObservable } from 'mobx';
import autobind from 'autobind-decorator';
import LinearGradient from 'react-native-linear-gradient';
// import {UserRole} from 'app/src/utility/constant/Constants';
import AlertClass from 'app/src/utility/AlertClass';
import { Specs } from 'app/src/utility/Theme';
import { strings } from 'app/src/utility/localization/Localized';
import { connectedToInternet } from 'app/src/utility/Utility';
import Loader  from 'app/src/components/loader/Loader';
import OfflineNotice from 'app/src/components/OfflineNotice';
import HeaderLeftIcons from 'app/src/components/navigation/HeaderLeftIcons';
import { Header } from '../../components';

// const device_width = Dimensions.get('window').width;
// const device_height = Dimensions.get('window').height;

const BLUE_ARROW = require('app/src/assets/images/mobileNumberUpdate/blue_arrow.png');

const updateViaWebsiteSteps = [
  {id:1, data:'- Sign in with login credentials.'},
  {id:2, data:'- Select Request/Change option from menu bar.'},
  {id:3, data:'- In request type select Mobile & Email ID change.'},
  {id:4, data:'- Upload required documents & submit.'}
];

@inject('profile','auth', 'mobileNumberUpdate')
@observer
export default class MobileNumberUpdate extends Component {

  @observable isInternetConnected: Boolean = true;

  constructor(props) {
    super(props);
    makeObservable(this);
    this.props = props;
    this.state = {
      isLoading : false,
    }
  }

  async componentDidMount() {
    this.isInternetConnected = await connectedToInternet();
    // this.checkMobileUpdateStatus();
  }

  checkMobileUpdateStatus = async () => {
    const res = await this.props.mobileNumberUpdate.fetchMobileNumberUpdateStatus();
    if (!res.success) {
      const errorMessage = res.message ? res.message : `${strings.mobileNumberUpdate.errorMessage.mobileUpdateRestrictionPart1}${res.data?.days}${strings.mobileNumberUpdate.errorMessage.mobileUpdateRestrictionPart2}`;
      AlertClass.showAlert('', 
        errorMessage, 
        [{text: strings.commonMessages.ok, onPress: () => null}]
      );
    }
    else {
      this.props.navigation.navigate('addNewNumber', {type: 'mobile'})
    }
  }

  @autobind
  async networkStatus(status) {
    if(status) {
      this.isInternetConnected = status;
    }
  }

  headingInfo = () => {
    return (
      <View style={{width: '100%'}}>
        <LinearGradient
          style={styles.headingInfoView}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          colors={['#6C93D4', '#3054C4']}
        >
          <Text style={styles.headingText}>
            {strings.mobileNumberUpdate.mobileNumberUpdateHeading.toUpperCase()}
          </Text>
        </LinearGradient>
      </View>
    );
  }

  renderUpdateViaRegisteredNumber = () => {
    return (
      <View style={styles.updateViaNumberOrEmail}>
        <View style={{flex:1, justifyContent:'center', paddingRight:15}}>
          <Text style={styles.inBoldText}>{strings.mobileNumberUpdate.optionViaMobileTitle}</Text>
          <Text style={styles.descriptionText}>{strings.mobileNumberUpdate.optionViaMobileDescription}</Text>
        </View>
        <TouchableOpacity 
          style={{width:70, justifyContent:'center'}}
          onPress={() => this.checkMobileUpdateStatus()}
        >
          <Image 
            source={BLUE_ARROW} 
            style={styles.arrowImage} 
          />
        </TouchableOpacity>
      </View>
    )
  }

  // renderUpdateViaRegisteredEmail = () => {
  //   return (
  //     <View style={styles.updateViaNumberOrEmail}>
  //       <View style={{flex:1, justifyContent:'center', paddingRight:15}}>
  //         <Text style={styles.inBoldText}>Option via Registered Email Address</Text>
  //         <Text style={styles.descriptionText}>You can update your number via OTP verification on your registered Email ID and new mobile number. This process usually takes only a few minutes to complete.</Text>
  //       </View>
  //       <TouchableOpacity 
  //         style={{width:70, justifyContent:'center'}}
  //         onPress={() => this.props.navigation.navigate('addNewNumber', {type: 'email'})}
  //       >
  //         <Image source={BLUE_ARROW} resizeMode='contain' style={styles.arrowImage} />
  //       </TouchableOpacity>
  //     </View>
  //   )
  // }

  renderUpdateViaWebsite = () => {
    return(
      <View style={styles.updateViaWebsite}>
        <Text style={[styles.inBoldText, {marginBottom: 8}]}>{strings.mobileNumberUpdate.optionViaWebsiteTitle}</Text>
        <Text style={[styles.descriptionText, {...Specs.fontSemiBold, fontSize: 12}]}>{strings.mobileNumberUpdate.optionViaWebsiteSubTitle}</Text>
        <View style={{paddingLeft:15}}>
          <Text 
            style={[styles.descriptionText, {fontSize:12}]}
            onPress={() => Linking.openURL('https://www.myvestige.com')}
          >
            {`- Go to `}
            <Text style={{color:'#3054C4'}}>www.myvestige.com</Text>
          </Text>
          {updateViaWebsiteSteps.map((item) => {
            return(
              <Text key={item.id} style={[styles.descriptionText, {fontSize:12}]}>{item.data}</Text>
            )
          })}
        </View>
      </View>
    )
  }

  viewSeparator = () => {
    return(
      <View style={{flex:1, margin:15, flexDirection: 'row', alignItems: 'center'}}>
        <View style={styles.separatorLine} />
        <Text style={[styles.inBoldText, {marginHorizontal:10}]}>OR</Text>
        <View style={styles.separatorLine} />
      </View>
    )
  }

  render() {
    return (
      <KeyboardAvoidingView
        style={styles.mainContainer}
        behavior={Platform.OS==='ios' ? 'padding' : 'padding'}
        enabled={Platform.OS === 'ios'}
        keyboardVerticalOffset={70}
      >
        { !this.isInternetConnected && <OfflineNotice networkStatus={(status) => this.networkStatus(status)} /> }
        <Loader loading={this.state.isLoading || this.props.mobileNumberUpdate.isLoading} />
        <Header
          navigation={this.props.navigation}
          screenTitle={strings.mobileNumberUpdate.mobileNumberUpdateScreenTitle}
        />
        <ScrollView keyboardShouldPersistTaps="handled">
          {this.headingInfo()}
          {this.renderUpdateViaRegisteredNumber()}
          {this.viewSeparator()}
          {/* {this.renderUpdateViaRegisteredEmail()} */}
          {/* {this.viewSeparator()} */}
          {this.renderUpdateViaWebsite()}
        </ScrollView>
      </KeyboardAvoidingView>
    )
  }
}

const styles = StyleSheet.create({
  mainContainer :{
    flex: 1,
    backgroundColor: '#fff',
    flexDirection:'column'
  },
  headerTitle:{
    ...Specs.fontBold,
    fontSize:18,
    color: '#373e73',
    width: Dimensions.get('window').width-100
  },
  headingInfoView:{
    height: 140,
    paddingVertical: 8, 
    paddingHorizontal: 15,
    justifyContent: 'center',
  },
  headingText:{
    textAlign:'center',
    ...Specs.fontBold,
    fontSize: 20,
    color: '#fff'
  },
  updateViaNumberOrEmail:{
    flex:1,
    flexDirection:'row',
    margin: 15,
    justifyContent:'center',
    flexWrap:'wrap', 
  },
  arrowImage:{
    height:50,
    width: 50,
    alignSelf: 'flex-end'
  },
  inBoldText:{
    ...Specs.fontBold,
    fontSize: 14,
    color:'#3f4967',
    marginBottom: 5
  },
  descriptionText:{
    ...Specs.fontRegular,
    fontSize: 11,
    color:'#00000060'
  },
  separatorLine:{
    flex:1,
    height:1,
    backgroundColor: '#DDDDDD',
  },
  updateViaWebsite:{
    flex:1,
    margin: 15,
  }
})