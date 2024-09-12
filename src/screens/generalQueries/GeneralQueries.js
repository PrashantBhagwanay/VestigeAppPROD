import React, { Component } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import HeaderLeftIcons from 'app/src/components/navigation/HeaderLeftIcons';
import { Specs } from 'app/src/utility/Theme';
import { CustomButton } from 'app/src/components/buttons/Button';
import NetworkOps from 'app/src/network/NetworkOps';
import { showToast, isNullOrEmpty } from 'app/src/utility/Utility';
import * as Urls from 'app/src/network/Urls';
import AlertClass from 'app/src/utility/AlertClass';
import { isEmailValidate } from 'app/src/utility/Validation/Validation';
import Loader from 'app/src/components/loader/Loader';
import { strings } from 'app/src/utility/localization/Localized';
import { Header } from '../../components';
import PickerSelector from '../../components/picker/pickerSelector';
import { BottomSheetPicker } from '../../components/picker/bottomSheetPicker';

export default class GeneralQueries extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedQueryType: '',
      emailId: '',
      queryMessage: '',
      queryTypes: [],
      isLoading: false,
      isModalVisible: false,
    };
  }

  isGeneralQueryFormValid = () => {
    if (isNullOrEmpty(this.state.selectedQueryType)) {
      showToast(strings.generalQueries.typeOfQuery);
      return false;
    } else if (
      !this.state.emailId.trim() ||
      !isEmailValidate(this.state.emailId)
    ) {
      showToast(strings.generalQueries.invalidEmailId);
      return false;
    } else if (!this.state.queryMessage.trim()) {
      showToast(strings.generalQueries.invalidMessage);
      return false;
    } else {
      return true;
    }
  };

  onSubmitPress = async () => {
    const isFormValid = this.isGeneralQueryFormValid();
    if (isFormValid) {
      const data = {
        queryType: this.state.selectedQueryType,
        emailId: this.state.emailId,
        query: this.state.queryMessage,
      };
      const url = `${Urls.ServiceEnum.GeneralQuery}`;
      this.setState({ isLoading: true });
      const response = await NetworkOps.postToJson(url, data);
      this.setState({ isLoading: false });
      if (!response.message) {
        AlertClass.showAlert(
          strings.generalQueries.messageAlertTitle,
          strings.generalQueries.messageAlert,
          [{ text: 'Ok', onPress: () => this.props.navigation.goBack() }],
        );
      } else {
        showToast(response.message);
      }
    }
  };

  async componentDidMount() {
    const url = `${Urls.ServiceEnum.GeneralQueryTypes}`;
    const res = await NetworkOps.get(url);
    if (!res.message) {
      const formattedRes = res?.map(value => {
        return { label: value, value: value };
      });
      this.setState({ queryTypes: formattedRes });
    } else {
      showToast(res.message);
    }
  }

  renderSubmitButton = () => {
    return (
      <CustomButton
        handleClick={() => this.onSubmitPress()}
        linearGradient
        buttonContainer={{ backgroundColor: '#fff', paddingBottom: 15 }}
        buttonTitle={strings.generalQueries.submit}
        buttonTitleStyle={styles.customButtonTitleStyle}
        primaryColor="#6895d4"
        secondaryColor="#57a5cf"
      />
    );
  };

  handlePickerSelector = () => {
    this.handleModalVisibility(true);
  };

  handlePickerItemPress = value => {
    this.setState({ selectedQueryType: value?.value });
    this.handleModalVisibility(false);
  };

  handleModalVisibility = value => {
    this.setState({
      isModalVisible: value,
    });
  };

  render() {
    const { queryTypes, isLoading } = this.state;
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={{ flex: 1 }}>
          <Loader loading={isLoading} />
          <Header
            navigation={this.props.navigation}
            screenTitle={strings.generalQueries.screenTitle}
          />
          <View style={styles.categoryContainer}>
            <PickerSelector
              label={this.state.selectedQueryType || 'Select Category'}
              selectedValue={this.state.selectedQueryType}
              customStyle={{
                container: {
                  marginHorizontal: 20,
                  borderRadius: 0,
                  borderColor: '#60979797',
                  paddingVertical: 5,
                },
              }}
              onPickerPress={this.handlePickerSelector}
            />
          </View>
          <View style={styles.emailContainer}>
            {/* <Text style={styles.toEmailId}>To: online.vestige@gmail.com</Text> */}
            <TextInput
              style={[styles.feedbackInput, { marginVertical: 17 }]}
              value={this.state.emailId}
              maxLength={200}
              placeholderTextColor="#46586f"
              underlineColorAndroid="transparent"
              placeholder={strings.generalQueries.enterEmailId}
              onChangeText={emailId => this.setState({ emailId })}
            />
            <TextInput
              style={[
                styles.feedbackInput,
                { textAlignVertical: 'top', height: 170 },
              ]}
              value={this.state.queryMessage}
              maxLength={250}
              multiline
              placeholderTextColor="#46586f"
              underlineColorAndroid="transparent"
              placeholder={strings.generalQueries.writeHere}
              onChangeText={queryMessage => this.setState({ queryMessage })}
            />
            <Text style={styles.queryMessageLength}>
              {this.state.queryMessage.length}
              /250
            </Text>
          </View>
          {this.renderSubmitButton()}
          <BottomSheetPicker
            isVisible={this.state.isModalVisible}
            onModalClose={() => this.handleModalVisibility(false)}
            pickerItems={this.state.queryTypes}
            heightMax={400}
            onItemPress={this.handlePickerItemPress}
          />
        </View>
      </TouchableWithoutFeedback>
    );
  }
}

const styles = StyleSheet.create({
  headerTitle: {
    ...Specs.fontBold,
    fontSize: 18,
    color: '#373e73',
  },
  feedbackInput: {
    paddingLeft: 10,
    height: 42,
    borderColor: '#60979797',
    borderWidth: 1,
  },
  categoryContainer: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    marginVertical: 10,
  },
  emailContainer: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    flex: 1,
    paddingHorizontal: 20,
  },
  toEmailId: {
    color: '#414456',
    fontSize: 14,
    ...Specs.fontMedium,
  },
  queryMessageLength: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    marginTop: 5,
  },
  customButtonTitleStyle: {
    color: '#FFFFFF',
    fontSize: 16,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  pickerContainer: {
    borderWidth: 1,
    width: '90%',
    borderColor: '#60979797',
  },
});
