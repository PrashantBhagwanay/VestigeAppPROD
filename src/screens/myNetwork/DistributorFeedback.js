import React, { Component } from 'react';
import { View, StyleSheet, Text, TextInput, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { inject, observer } from 'mobx-react';
import { observable, makeObservable } from 'mobx';
import { Specs } from 'app/src/utility/Theme';
import { CustomButton } from 'app/src/components/buttons/Button';
import AlertClass from 'app/src/utility/AlertClass';
import { strings } from 'app/src/utility/localization/Localized';
import PickerSelector from '../../components/picker/pickerSelector';
import { BottomSheetPicker } from '../../components/picker/bottomSheetPicker';
import Loader from '../../components/loader/Loader';
import { Toast } from 'app/src/components/toast/Toast';
import autobind from 'autobind-decorator';

// Navigation Icons
import HeaderLeftIcons from 'app/src/components/navigation/HeaderLeftIcons';
import { Header } from '../../components';
import { Dimensions } from 'react-native';

@inject('network', 'profile')
@observer
export default class DistributorFeedback extends Component {

  @observable feedbackMsg: string

  constructor(props) {
    super(props)
    makeObservable(this);
    this.props = props;
    this.state = {
      isModalVisible: false,
      submitForValue: '',
      submitFor: [
        // { label: 'Good', value: 'Good' },
        // { label: 'Excellent', value: 'Excellent' },
        // { label: 'Share your mobile', value: 'Share your mobile' },
      ]
    }
  }

  async componentDidMount(){
    const responseJSON = await this.props.network.fetchDistributorFeedbackList();
    if(responseJSON.success){
      console.log('Response >>>>>>>>>>>>',responseJSON,this._submitFor(responseJSON.data))
      this.setState({
        submitFor: this._submitFor(responseJSON.data)
      })
    } else {
      this.setState({
        submitFor: []
      })
    }
    
  }

  _submitFor = data => {
    if(data.length <= 0){
      return []
    } else {
      let submitObj = [];
      data.forEach(item => submitObj.push({ label: item.message, value: item.type }))
      return submitObj
    }
  }

  handleModalVisibility = value => {
    this.setState({
      isModalVisible: value,
    });
  };

  handlePickerSelector = () => {
    this.handleModalVisibility(true);
  };

  handlePickerItemPress = item => {
    this.setState({ submitForValue: item?.label });
    this.handleModalVisibility(false);
  };

  @autobind
  showToast(message: string, type: Toast.type) {
    // Add a Toast on screen.
    Toast.show(message, {
      duration: Toast.durations.SHORT,
      type: type,
      shadow: false,
      animation: true,
      hideOnPress: true,
      delay: 0,
    });
  }
  
  // if (this.feedbackMsg && this.feedbackMsg.trim()) {
  //   const feedback = {
  //     feedBackFor: data.distributorId,
  //     feedBack: this.feedbackMsg.trim(),
  //     feedBackDistributorName: data.distributorName
  //   }
  //   const status = await this.props.network.postUserFeedback(feedback)
  //   if (status)
  //     AlertClass.showAlert(strings.distributorFeedBackScreen.successTitle, strings.distributorFeedBackScreen.feedBackCaptured,
  //       [{ text: strings.commonMessages.ok, onPress: () => { this.props.navigation.pop() } }]
  //     )
  // }
  // else {
  //   AlertClass.showAlert(strings.distributorFeedBackScreen.errorTitle, strings.distributorFeedBackScreen.writeFeedback,
  //     [{ text: strings.commonMessages.ok, onPress: () => { } }]
  //   )
  // }

  submitFeedback = async () => {
    const { data } = this.props.route.params;
    const { distributorID } = this.props.profile;
    if(this.state.submitForValue.trim().length === 0 || !this.state.submitForValue){
      this.showToast(strings.commonMessages.selectFeedbackFirst, Toast.type.ERROR)
    } 
    else if(distributorID == data.distributorId){
      this.showToast(strings.commonMessages.selfFeedback, Toast.type.ERROR)
    }
    else {
      const typeValue = this.state.submitFor.filter(item => item.label === this.state.submitForValue)
      const requestJSON = {
        distributorId: data.distributorId,
        uplineDistributorId: data.uplineId,
        message: this.state.submitForValue,
        type: typeValue.length > 0 && typeValue[0].value 
      }
      const responseJSON = await this.props.network.submitDistributorFeedback(requestJSON)
      this.showToast(responseJSON.message, responseJSON.success ? Toast.type.SUCCESS : Toast.type.ERROR)
      if(responseJSON.success){

      } else {
        this.showToast(responseJSON.message, Toast.type.ERROR)
      }
      console.log('Submit Feedback',requestJSON,responseJSON)
    }
   
  }

  render() {
    const { data } = this.props.route.params;
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.mainView}>
          <Loader loading={this.props.network.isLoading}/>
          <Header
            navigation={this.props.navigation}
            screenTitle={strings.distributorFeedBackScreen.screenTitle}
          />
          <View
            style={styles.feedbackContainer}>
            <Text style={styles.pickerTitleText}>{`${strings.distributorFeedBackScreen.giveFeedBackToPeer} ${data.distributorName}`}</Text>
            <PickerSelector
              label={this.state.submitForValue || 'Select any feedback'}
              selectedValue={this.state.submitForValue}
              customStyle={{
                container: {
                  marginHorizontal: 0,
                },
              }}
              onPickerPress={this.handlePickerSelector}
            />
          </View>
          <CustomButton
            handleClick={() => this.submitFeedback()}
            linearGradient
            buttonContainer={styles.button}
            buttonTitle={strings.distributorFeedBackScreen.submitTitle}
            buttonTitleStyle={styles.customButtonTitleStyle}
            primaryColor='#6895d4'
            secondaryColor='#57a5cf'
          />
          <BottomSheetPicker
            isVisible={this.state.isModalVisible}
            onModalClose={() => this.handleModalVisibility(false)}
            pickerItems={this.state.submitFor}
            heightMax={Dimensions.get('window').height /2.5}
            onItemPress={this.handlePickerItemPress}
          />
        </View>
      </TouchableWithoutFeedback>
    )
  }
}

const styles = StyleSheet.create({
  mainView: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
    // marginTop: 10
  },
  desc: {
    ...Specs.fontMedium,
    fontSize: 14,
    color: '#414456',
    marginVertical: 20,
    marginHorizontal: 17
  },
  input: {
    borderColor: '#979797',
    borderWidth: 1,
    width: '85%',
    marginHorizontal: 14,
    textAlignVertical: 'top',
    height: 150,
    paddingLeft: 10
  },
  button: {
    width: '100%',
    position: 'absolute',
    bottom: 30
  },
  customButtonTitleStyle: {
    color: '#FFFFFF',
    fontSize: 16,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  pickerTitleText: {
    ...Specs.fontRegular,
    color: '#545a6b',
    fontSize: 12,
  },
  feedbackContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 17,
    paddingTop: 15,
    width: '100%'
  }
});