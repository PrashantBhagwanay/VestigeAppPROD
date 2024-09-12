import React, { Component } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { RadioButton } from 'app/src/components/buttons/Button';
import { observer, inject } from 'mobx-react';
import HeaderLeftIcons from 'app/src/components/navigation/HeaderLeftIcons';
import { Specs } from 'app/src/utility/Theme';
import Loader from 'app/src/components/loader/Loader';
import { Toast } from 'app/src/components/toast/Toast';
import AlertClass from 'app/src/utility/AlertClass';
import autobind from 'autobind-decorator';
import { strings } from 'app/src/utility/localization/Localized';
import { Header } from '../../components';
import { RECOMMENDATION_CONFIG } from '../../utility/constant/Constants';
import PickerSelector from '../../components/picker/pickerSelector';
import { BottomSheetPicker } from '../../components/picker/bottomSheetPicker';

const { width, height } = Dimensions.get('window');

const desiredLevelOptions = [
  {
    levelId: '0',
    levelName: 'NON QUALIFIED DIRECTOR',
  },
  {
    levelId: '1',
    levelName: 'DISTRIBUTOR',
  },
  {
    levelId: '2',
    levelName: 'SENIOR DISTRIBUTOR',
  },
  {
    levelId: '3',
    levelName: 'ASST. DIRECTOR',
  },
  {
    levelId: '4',
    levelName: 'DIRECTOR',
  },
  {
    levelId: '5',
    levelName: 'SILVER DIRECTOR',
  },
  {
    levelId: '6',
    levelName: 'GOLD DIRECTOR',
  },
  {
    levelId: '7',
    levelName: 'STAR DIRECTOR',
  },
  {
    levelId: '8',
    levelName: 'DIAMOND DIRECTOR',
  },
  {
    levelId: '9',
    levelName: 'CROWN DIRECTOR',
  },
  {
    levelId: '10',
    levelName: 'UNIVERSAL CROWN DIRECTOR',
  },
  {
    levelId: '11',
    levelName: 'DOUBLE CROWN',
  },
  {
    levelId: '12',
    levelName: 'DOUBLE UNIVERSAL CROWN',
  },
];

@inject('auth', 'recommendation', 'profile', 'dashboard')
@observer
class Recommendation extends Component {
  constructor(props) {
    super(props);
    let percentageArray = this.props.profile.getPercentageArray();
    this.state = {
      selectedValue: RECOMMENDATION_CONFIG.LEVEL,
      disablePercentagePicker: true,
      disableLevelPicker: false,
      selectedPercentageValue: percentageArray?.[0]?.value || '',
      selectedLevelValue: '0',
      selectedPercentageLabel: percentageArray?.[0]?.label || '',
      selectedLevelLabel: desiredLevelOptions[0]?.levelName,
      desiredPercentageOptions: percentageArray,
      isModalVisible: false,
    };
  }

  @autobind
  toast(message, type) {
    Toast.show(message, {
      duration: Toast.durations.SHORT,
      type: type,
      shadow: false,
      animation: true,
      hideOnPress: true,
      delay: 0,
    });
  }

  radioButton = item => {
    if (item === RECOMMENDATION_CONFIG.PERCENTAGE) {
      this.setState({
        selectedValue: item,
        disablePercentagePicker: false,
        disableLevelPicker: true,
      });
    } else {
      this.setState({
        selectedValue: item,
        disableLevelPicker: false,
        disablePercentagePicker: true,
      });
    }
  };

  navigateToDetails = async () => {
    if (this.state.selectedValue === RECOMMENDATION_CONFIG.PERCENTAGE) {
      const status = await this.props.recommendation.fetchRecommendationData(
        'desiredPercentage',
        this.state.selectedPercentageValue,
      );
      if (!status) {
        this.toast(this.props.recommendation.responseMessage, Toast.type.ERROR);
      } else {
        this.props.navigation.navigate('recommendationDetails', {
          type: 'desiredPercentage',
        });
      }
    } else {
      const status = await this.props.recommendation.fetchRecommendationData(
        'desiredLevel',
        this.state.selectedLevelValue,
      );
      if (!status) {
        this.toast(this.props.recommendation.responseMessage, Toast.type.ERROR);
      } else {
        this.props.navigation.navigate('recommendationDetails', {
          type: 'desiredLevel',
        });
      }
    }
  };

  getPickerItems = () => {
    if (this.state.selectedValue === RECOMMENDATION_CONFIG.LEVEL) {
      return desiredLevelOptions;
    }
    return this.state.desiredPercentageOptions;
  };

  getModalSchema = () => {
    if (this.state.selectedValue === RECOMMENDATION_CONFIG.LEVEL) {
      return { label: 'levelName', value: 'levelId' };
    }
    return { label: 'label', value: 'value' };
  };

  handlePickerSelector = () => {
    this.handleModalVisibility(true);
  };

  handlePickerItemPress = item => {
    const getValue = this.getModalSchema();
    if (this.state.selectedValue === RECOMMENDATION_CONFIG.LEVEL) {
      this.setState({
        selectedLevelValue: item?.[getValue.value],
        selectedLevelLabel: item?.[getValue.label],
      });
    } else {
      this.setState({
        selectedPercentageValue: item?.[getValue.value],
        selectedPercentageLabel: item?.[getValue.label],
      });
    }
    this.handleModalVisibility(false);
  };

  handleModalVisibility = value => {
    this.setState({
      isModalVisible: value,
    });
  };

  render() {
    const { selectedValue, desiredPercentageOptions } = this.state;
    const { isLoading } = this.props.recommendation;
    return (
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <Loader loading={isLoading} />
        <Header
          navigation={this.props.navigation}
          screenTitle={strings.recommendation.title}
        />
        <View style={{ backgroundColor: '#f2f5f8' }}>
          <View style={styles.topView}>
            <Text style={styles.textDistributer}>
              {strings.recommendation.distId}
            </Text>
            <View style={{ flexDirection: 'row' }}>
              <Text
                style={{ fontSize: 14, color: '#3f4967', ...Specs.fontMedium }}>
                {this.props.auth.distributorID}
              </Text>
            </View>
          </View>
        </View>
        <View style={{ marginTop: 21, paddingHorizontal: 25 }}>
          <TouchableOpacity
            activeOpacity={1}
            style={{ flexDirection: 'row' }}
            onPress={() => {
              if (!desiredPercentageOptions.length) {
                AlertClass.showAlert(
                  'Message',
                  `You are already on 20 percentile.`,
                  [
                    {
                      text: strings.viewCartScreen.alertButtonTextOk,
                      onPress: () => console.log('OK Pressed'),
                    },
                  ],
                );
              } else {
                this.radioButton('percentage');
              }
            }}>
            <RadioButton
              showButtonText={false}
              buttonText="percentage"
              onPress={() => {
                if (!desiredPercentageOptions.length) {
                  AlertClass.showAlert(
                    'Message',
                    `You are already on a higher percentage.`,
                    [
                      {
                        text: strings.viewCartScreen.alertButtonTextOk,
                        onPress: () => console.log('OK Pressed'),
                      },
                    ],
                  );
                } else {
                  this.radioButton('percentage');
                }
              }}
              selectedValue={selectedValue}
              radioButtonStyles={styles.overRideStyle}
              radioText={styles.radioText}
            />
            <Text style={{ marginTop: 13, ...Specs.fontRegular }}>
              {strings.recommendation.setTarget}
              <Text style={{ ...Specs.fontSemibold }}>
                {' ' + strings.recommendation.percentage}
              </Text>
            </Text>
          </TouchableOpacity>
          <PickerSelector
            isDisabled={this.state.disablePercentagePicker}
            label={this.state.selectedPercentageLabel || 'Select any Value'}
            selectedValue={this.state.selectedPercentageValue}
            customStyle={{
              container: {
                marginHorizontal: 0,
              },
            }}
            onPickerPress={this.handlePickerSelector}
          />
          <Text style={styles.orText}>{strings.recommendation.or}</Text>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => this.radioButton('level')}
            style={{ flexDirection: 'row' }}>
            <RadioButton
              showButtonText={false}
              buttonText="level"
              onPress={() => this.radioButton('level')}
              selectedValue={selectedValue}
              radioButtonStyles={styles.overRideStyle}
              radioText={styles.radioText}
            />
            <Text style={{ marginTop: 13, ...Specs.fontRegular }}>
              {strings.recommendation.setTarget}
              <Text style={{ ...Specs.fontSemibold }}>
                {' ' + strings.recommendation.title}
              </Text>
            </Text>
          </TouchableOpacity>
          <PickerSelector
            isDisabled={this.state.disableLevelPicker}
            label={this.state.selectedLevelLabel || 'Select any Value'}
            selectedValue={this.state.selectedLevelValue}
            customStyle={{
              container: {
                marginHorizontal: 0,
              },
            }}
            onPickerPress={value => this.handlePickerSelector()}
          />
        </View>
        <TouchableOpacity
          style={styles.button}
          onPress={() => this.navigateToDetails()}>
          <Text style={styles.buttonText}>{strings.recommendation.go}</Text>
        </TouchableOpacity>
        <BottomSheetPicker
          isVisible={this.state.isModalVisible}
          onModalClose={() => this.handleModalVisibility(false)}
          pickerItems={this.getPickerItems()}
          schema={this.getModalSchema()}
          heightMax={(2 / 3) * height}
          onItemPress={this.handlePickerItemPress}
        />
      </View>
    );
  }
}

export default Recommendation;

const styles = StyleSheet.create({
  textDistributer: {
    ...Specs.fontRegular,
    fontSize: 14,
    color: '#3f4967',
  },
  topView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 26,
    marginBottom: 21,
    borderBottomWidth: 1,
    borderBottomColor: '#c8c9d3',
    marginHorizontal: 18,
    paddingBottom: 7,
  },
  horizontalLine: {
    borderTopColor: '#c8c9d3',
    borderTopWidth: 1,
  },
  button: {
    backgroundColor: '#57a5cf',
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 24,
    alignItems: 'center',
    bottom: 21,
    position: 'absolute',
    width: '90%',
  },
  buttonText: {
    ...Specs.fontMedium,
    color: '#fff',
    fontSize: 16,
  },
  radioText: {
    ...Specs.fontRegular,
    color: '#3f4967',
    fontSize: 14,
  },
  overRideStyle: {
    marginLeft: 0,
    marginRight: 13,
  },
  orText: {
    alignSelf: 'center',
    paddingVertical: 28,
    ...Specs.fontMedium,
  },
});
