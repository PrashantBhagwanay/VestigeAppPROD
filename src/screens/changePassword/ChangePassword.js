import React, { Component } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList, 
  Platform,
  Text
} from 'react-native';
import CustomInput from 'app/src/components/CustomInput';
import { strings } from 'app/src/utility/localization/Localized';
import { CustomButton } from 'app/src/components/buttons/Button';
import { COLOR_CODES, Specs } from 'app/src/utility/Theme';
import HeaderLeftIcons from 'app/src/components/navigation/HeaderLeftIcons';
import { observer, inject } from 'mobx-react'; 
import { Toast } from 'app/src/components/toast/Toast';
import autobind from 'autobind-decorator';
import Loader  from 'app/src/components/loader/Loader';
import { isPasswordValidate } from 'app/src/utility/Validation/Validation';
import { ChangePassword_ERROR_MESSAGE } from 'app/src/utility/constant/Constants'
import OfflineNotice from 'app/src/components/OfflineNotice';
import AlertClass from 'app/src/utility/AlertClass';
import LinearGradient from 'react-native-linear-gradient';
import { 
  connectedToInternet, 
  showToast,
} from 'app/src/utility/Utility';
import { Header } from '../../components';

const passwordIcon = require('app/src/assets/images/Signup/password.png');

@inject('changePassword', 'auth')
@observer
export default class ChangePassword extends Component {

  constructor(props){
    super(props);
    this.state = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      secureCurrentPass: true,
      secureNewPass: true,
      secureConfirmPass:true
    }
    this.isInternetConnected = true;
  }

  @autobind
  async networkStatus(status) {
    if(status) {
      this.isInternetConnected = status;
    }
  }
  
  handleInput = (value, type) => {
    if(type === 'currentPassword'){
      this.setState({
        currentPassword: value.replace(/\s/g, '')
      })
    }
    else if(type === 'newPassword') {
      this.setState({
        newPassword: value.replace(/\s/g, '')
      })
    }
    else{
      this.setState({
        confirmPassword: value.replace(/\s/g, '')
      })
    }
  }

  isValidate = () => {
    const {currentPassword, newPassword, confirmPassword} = this.state
    if(!currentPassword) {
      this.showToast(strings.changePassword.emptyCurrentPassword, Toast.type.ERROR);
      return false
    }
    // else if(!isPasswordValidate(currentPassword)) {
    //   this.showToast(ChangePassword_ERROR_MESSAGE.currentPassword, Toast.type.ERROR);
    //   return false
    // }
    else if (!newPassword) {
      this.showToast(strings.changePassword.emptyNewPassword, Toast.type.ERROR);
      return false
    }
    else if(!isPasswordValidate(newPassword)) {
      this.showToast(ChangePassword_ERROR_MESSAGE.newPassword,Toast.type.ERROR);
      return false
    }
    else if (!confirmPassword) {
      this.showToast(strings.changePassword.emptyConfirmPassword, Toast.type.ERROR);
      return false
    }
    // else if(!isPasswordValidate(confirmPassword)) {
    //   this.showToast(ChangePassword_ERROR_MESSAGE.confirmPassword, Toast.type.ERROR);
    //   return false
    // }
    else if(newPassword !== confirmPassword) {
      this.showToast(ChangePassword_ERROR_MESSAGE.matchPassword, Toast.type.ERROR);
      return false
    }
    else if(currentPassword === newPassword){
      this.showToast(ChangePassword_ERROR_MESSAGE.samePassword, Toast.type.ERROR);
      return false
    }
    return true
  }

  signOutUser = async () => {
    const logout = await this.props.auth.signOut();
    logout && this.props.navigation.navigate('login');
  }

  changePasswordOnPress = async() => {
    const {currentPassword, newPassword} = this.state
    if(this.isValidate()) {
      const status = await this.props.changePassword.changePassword({
        'currentPassword':currentPassword,
        'newPassword':newPassword,
        'deviceId': this.props.auth.deviceId,
      })
      if(status) {
        //this.showToast(this.props.changePassword.resMessage,Toast.type.SUCCESS);
        AlertClass.showAlert('', 
          this.props.changePassword.resMessage, 
          [{text: strings.commonMessages.ok, onPress: () => this.signOutUser()}])
      }
      else {
        this.showToast(this.props.changePassword.resMessage,Toast.type.ERROR) 
      }
    }
  }

  @autobind
  showToast(message: string , type:String) {
    // Add a Toast on screen.
    Toast.show(message, {
      duration: Toast.durations.SHORT,
      type: type?type:Toast.type.WARNING,
      shadow: false,
      animation: true,
      hideOnPress: true,
      delay: 0,
    });
  }

  /**
   * @description show password
   * @param passwordField return {true,false}
   * @param passwordInput return {key for the state to update}
   */
  showHidePassword = (passwordInput, passwordField) => {
    console.log('checkit', passwordInput,passwordField, this.state.secureCurrentPass)
    this.setState({
      [passwordInput] : passwordField
    })
  }

  formInputData(){
    const inputFields = [
      {
        type: 'currentPassword',
        placeholder: strings.changePassword.currentPasswordTitle,
        secureTextEntry: this.state.secureCurrentPass,
        secureTextKey: 'secureCurrentPass'
      },
      {
        type: 'newPassword',
        placeholder: strings.changePassword.newPasswordTitle,
        secureTextEntry: this.state.secureNewPass,
        secureTextKey: 'secureNewPass'
      },
      {
        type: 'confirmPassword',
        placeholder: strings.signUpScreen.passwordDetails.confirmPassword,
        secureTextEntry: this.state.secureConfirmPass,
        secureTextKey: 'secureConfirmPass'
      }
    ]
    return inputFields;
  }

  onPressChangePassword = async () => {
    const isConnectedToInternet = await connectedToInternet();
    if(isConnectedToInternet) {
      this.changePasswordOnPress()
    }
    else {
      showToast(strings.commonMessages.noInternet)
    }
  }

  // headingInfo = () => {
  //   return(
  //     <View style={{width:'100%'}}>
  //       <LinearGradient 
  //         style={styles.headingInfoView}
  //         start={{ x: 0, y: 0 }}
  //         end={{ x: 1, y: 0 }}
  //         colors={['#6C93D4','#3054C4']}
  //       >
  //         <Text style={styles.headingText}>
  //           demo text will be here
  //         </Text>
  //       </LinearGradient>
  //     </View>  
  //   )
  // }

  /**
   * @description It can be used to show material type message view design
   * @param {*} message Message text to show
   * @param {*} backgroundColor Background color of view
   * @param {*} textColor text color of view
   */
  renderMessageView = (message, backgroundColor, textColor) => {
    if(message && message.trim() != ''){
      return(
        <View style={[styles.messageView, {backgroundColor: '#fff'}]}>
          <Text style={[styles.messageText, {color: textColor}]}>{message}</Text>
          {/* <View style={styles.separateLine} /> */}
        </View>  
      )
    }
  }

  render(){
    return(
      <View style={styles.container}>
        { !this.isInternetConnected && <OfflineNotice networkStatus={(status) => this.networkStatus(status)} /> }
        {/* {this.headingInfo()} */}
        <Header
          navigation={this.props.navigation}
          screenTitle={strings.changePassword.screenTitle}
        />
        <View style={styles.inputContainer}>
          <Loader loading={this.props.changePassword.isLoading} />  
          {this.renderMessageView(ChangePassword_ERROR_MESSAGE.newPassword,'#ECFAF7','#00000090')}
          <FlatList
            data={this.formInputData()}
            extraData={this.state}
            keyboardShouldPersistTaps='handled'
            renderItem={({item}) =>(
              <View style={styles.inputItem}>
                <CustomInput 
                  placeholder={item.placeholder}
                  icon={passwordIcon}
                  showPassword
                  showPasswordPress={(value) => this.showHidePassword(item.secureTextKey, !value)}
                  secureEntry={item.secureTextEntry}
                  marginHorizontal={12}
                  maxLength={20}
                  value={this.state[item.type]}
                  onChangeText={(value) => this.handleInput(value, item.type)}
                />
              </View>
            )}
            keyExtractor={(item, index) => index.toString()}
          />
          {this.renderMessageView(strings.changePassword.warningMessage,'#FFE9EE','#FF3763')}
        </View>
        <CustomButton
          handleClick={this.onPressChangePassword}
          linearGradient
          buttonContainer={styles.button}
          buttonTitle={strings.changePassword.buttonTitle}
          buttonTitleStyle={styles.customButtonTitleStyle}
          primaryColor="#6C93D4"
          secondaryColor="#4062CA"
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },  
  inputContainer: {
    backgroundColor: '#fff',
    marginTop: 9,
    marginHorizontal: 10,
    borderRadius:7,
    elevation: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowColor: '#808080',
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  button: {
    marginTop: 20,
  },
  customButtonTitleStyle: {
    ...Specs.fontBold,
    fontSize: 15,
    color: '#FFFFFF',
    alignSelf: 'center',
    justifyContent: 'center'
  },
  inputItem: {
    paddingBottom: 15, 
    paddingTop: 10,
  },
  messageView: {
    padding:5, 
    borderRadius:8, 
    marginTop: 5,
    marginBottom:5, 
    marginHorizontal:12, 
    backgroundColor: '#ECFAF7',
    justifyContent: 'center'
  },
  messageText:{
    ...Specs.fontSemibold, 
    color:'#58CDB4',
    fontSize:13,
    textAlign: 'left'
  },
  // separateLine: {
  //   height: 1.5, 
  //   // marginHorizontal: 12, 
  //   backgroundColor: '#80808040', 
  //   marginVertical:4
  // },
})