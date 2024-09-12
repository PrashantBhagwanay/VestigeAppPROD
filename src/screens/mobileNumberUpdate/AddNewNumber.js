import React, { Component } from 'react';
import { View, 
  ScrollView, 
  StyleSheet, 
  Platform, 
  Dimensions,
  Keyboard,
  TouchableWithoutFeedback, 
  Image, 
  TouchableOpacity,
  KeyboardAvoidingView,
  Text,
} from 'react-native';
import { inject, observer } from 'mobx-react';
import { observable, makeObservable } from 'mobx';
import autobind from 'autobind-decorator';
import { VESTIGE_IMAGE } from 'app/src/utility/constant/Constants';
import { Specs } from 'app/src/utility/Theme';
import AlertClass from 'app/src/utility/AlertClass';
import { strings } from 'app/src/utility/localization/Localized';
import { connectedToInternet, showToast, getMaskedMobileNumber } from 'app/src/utility/Utility';
import { Toast } from 'app/src/components/toast/Toast';
import Loader  from 'app/src/components/loader/Loader';
import OfflineNotice from 'app/src/components/OfflineNotice';
import HeaderLeftIcons from 'app/src/components/navigation/HeaderLeftIcons';
import CustomInput from 'app/src/components/CustomInput';
import { CustomButton} from 'app/src/components/buttons/Button';
import {isMobileNumberValid } from 'app/src/utility/Validation/Validation';
import { Header } from '../../components';

const UPDATE_MOBILE_IMAGE = require('app/src/assets/images/mobileNumberUpdate/mobile_update_image.png');

const updateTypeName = {
  email: 'email',
  mobile: 'mobile'
};

const mobileInputDetails = {
  fieldName: 'newMobileNumber',
  placeholder: strings.mobileNumberUpdate.newMobileInputPlaceholder,
  icon: VESTIGE_IMAGE.CALL_ICON,
  // maxLength: 10
};

@inject('profile','auth','mobileNumberUpdate')
@observer
export default class AddNewNumber extends Component {

  @observable isInternetConnected: Boolean = true;

  constructor(props) {
    super(props);
    makeObservable(this);
    this.props = props;
    this.state = {
      isLoading : false,
      newMobileNumber: '',
      mobileNumberLimit: 10
    }
    this.updateType = this.props.route?.params?.type;
  }

  async componentDidMount(){
    this.isInternetConnected = await connectedToInternet();
  }

  onChangeText = async (item, value) => {
    this.setState({[item.fieldName]: value})
  }


  @autobind
  async networkStatus(status) {
    if(status) {
      this.isInternetConnected = status;
    }
  }

  getISDCode = (countryId = 1) => {
    if(countryId === 1){
      return '+91';
    }
  }

  isValidate = () => {
    const {newMobileNumber, mobileNumberLimit} = this.state;
    if(newMobileNumber?.trim().length != mobileNumberLimit || !isMobileNumberValid(newMobileNumber?.trim())){
      return strings.mobileNumberUpdate.errorMessage.validMobileNumber;
    }
  }

  handleButtonClick = async () => {
    const errorMessage = this.isValidate();
    if(errorMessage){
      showToast(errorMessage, Toast.type.ERROR)
    }
    else{
      const res = await this.props.mobileNumberUpdate.sendOtpToUpdateNumber(this.state.newMobileNumber);
      if(res.success){
        this.props.navigation.navigate('mobileUpdateVerification', 
          {
            newMobileNumber: this.state.newMobileNumber,
            existingMobileNumber: this.props.profile.mobileNumber
          }
        );
      }
      else{
        AlertClass.showAlert('',
          res.message,
          [{text: strings.commonMessages.ok, onPress: () => null}]
        )
      }
    }
    
  }

  renderHeading = () => {
    if(this.updateType === updateTypeName.mobile){
      return(
        <View style={styles.headingView}>
          <Text style={styles.headingText}>{strings.mobileNumberUpdate.updateUsingMobileTitle1}</Text>
          <Text style={styles.descriptionText}>
            {strings.mobileNumberUpdate.updateUsingMobileTitle2a}
            <Text style={[styles.descriptionText,{...Specs.fontBold}]}>{strings.mobileNumberUpdate.updateUsingMobileTitle2b}</Text>
            {strings.mobileNumberUpdate.updateUsingMobileTitle2c}
          </Text>
        </View>
      )
    }
  }

  mobileUpdateDesignImage = () => {
    return(
      <View style={{flex:1, margin: 15}}>
        <Image 
          style={styles.mobileUpdateImage} 
          source={UPDATE_MOBILE_IMAGE}
          resizeMode='contain'
        />
      </View>
    )
  }

  renderRegisteredMobileOrEmail = () => {
    if(this.updateType === updateTypeName.mobile){
      return(
        <View style={styles.registeredMobileEmailView}>
          <Text style={styles.descriptionText}>{strings.mobileNumberUpdate.registeredMobileNumberText}</Text>
          <Text style={[styles.descriptionText, {color: '#9DA3C2', fontSize:18}]}>
            {`${this.getISDCode(1)} ${getMaskedMobileNumber(this.props.profile.mobileNumber, [0,1,8,9])}`}
          </Text>
        </View>
      )
    }
  }

  renderMobileNumberInput = (item) => {
    return(
      <View style={styles.mobileInputView}>
        <CustomInput 
          placeholder={item.placeholder}
          icon={item.icon}
          editable
          value={this.state[item.fieldName]}
          onChangeText={(value) => this.onChangeText(item, value)}
          keyboardType={item.fieldName === 'newMobileNumber' ? 'numeric' : 'default'}
          maxLength={this.state.mobileNumberLimit}
        />
      </View>
    )
  }

  renderGetOtpButton = () => {
    return(
      <View style={styles.buttonContainer}>
        <CustomButton
          buttonContainer={styles.button}
          disabled={this.state.newMobileNumber?.trim() == ''}
          handleClick={() => this.handleButtonClick()}
          linearGradient
          buttonTitle={strings.mobileNumberUpdate.getOtpButton}
          primaryColor="#6895d4"
          secondaryColor="#6896D4"
          buttonTitleStyle={styles.customButtonTitleStyle}
        />
      </View>
    )
  }

  tryAnotherWay = () => {
    return(
      <View style={styles.tryAnotherWayLink}>
        <Text 
          style={[styles.customButtonTitleStyle, {color:'#58CDB4'}]}
          onPress={() => this.props.navigation.pop()}
        >
          {strings.mobileNumberUpdate.tryAnotherWay}
        </Text>
      </View>
    )
  }

  render(){
    return(
      <KeyboardAvoidingView 
        style={styles.mainContainer}
        behavior={Platform.OS === 'ios' ? 'padding': 'padding'} 
        enabled={Platform.OS === 'ios'} 
        keyboardVerticalOffset={70}
      >
        { !this.isInternetConnected && <OfflineNotice networkStatus={(status) => this.networkStatus(status)} /> }
        <Loader loading={this.state.isLoading || this.props.mobileNumberUpdate.isLoading} />
        <Header
          navigation={this.props.navigation}
          screenTitle={strings.mobileNumberUpdate.mobileNumberUpdateScreenTitle}
        />
        <ScrollView keyboardShouldPersistTaps='handled'>
          {this.renderHeading()}
          {this.mobileUpdateDesignImage()}
          {this.renderRegisteredMobileOrEmail()}
          {this.renderMobileNumberInput(mobileInputDetails)}
          {this.renderGetOtpButton()}
          {this.tryAnotherWay()}
        </ScrollView>
      </KeyboardAvoidingView>
    )
  }
}

const styles = StyleSheet.create({
  mainContainer :{
    flex: 1,
    backgroundColor:'#fff',
    flexDirection:'column'
  },
  headerTitle:{
    ...Specs.fontBold,
    fontSize:18,
    color: '#373e73',
    width: Dimensions.get('window').width-100
  },
  headingView:{
    flex: 1,
    margin:15,
    justifyContent: 'center'
  },
  headingText:{
    ...Specs.fontBold,
    fontSize: 18,
    color:'#3f4967',
    marginBottom: 5,
    textAlign: 'center'
  },
  descriptionText:{
    ...Specs.fontRegular,
    color:'#00000060', 
    fontSize:16,
    marginBottom: 5,
    textAlign: 'center'
  },
  mobileUpdateImage:{
    height:200,
    width: 160,
    alignSelf: 'center'
  },
  registeredMobileEmailView:{
    flex: 1,
    marginHorizontal:15,
    marginBottom: 10,
    marginTop: 5,
    justifyContent: 'center'
  },
  mobileInputView:{
    flex: 1,
    marginHorizontal:15,
    marginBottom: 10,
    marginTop: 5,
    justifyContent: 'center'
  },
  buttonContainer:{
    flex: 1,
    marginHorizontal:15,
    marginBottom: 5,
    marginTop: 5,
    justifyContent: 'center'
  },
  button:{
    width:'100%',
  },
  customButtonTitleStyle:{
    ...Specs.fontBold,
    fontSize: 16,
    color: '#FFFFFF',
    alignSelf: 'center',
    justifyContent: 'center'
  },
  tryAnotherWayLink:{
    flex:1,
    marginHorizontal: 15,
    marginVertical:5,
    justifyContent: 'center'
  }
})