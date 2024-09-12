import React, { Component } from 'react';
import { Text, View, StyleSheet, Dimensions } from 'react-native';
import { Specs } from 'app/src/utility/Theme';
import { strings } from 'app/src/utility/localization/Localized';
import { CustomButton } from 'app/src/components/buttons/Button';
import { observer, inject } from 'mobx-react';
import {
  showToast,
  connectedToInternet,
  isNullOrEmpty,
} from '../../utility/Utility';
import { Toast } from 'app/src/components/toast/Toast';
import PickerSelector from '../../components/picker/pickerSelector';
import { BottomSheetPicker } from '../../components/picker/bottomSheetPicker';
import { Header } from '../../components';
import { PICKER_ENUM } from '../../utility/constant/Constants';
// import Loader  from 'app/src/components/loader/Loader';

const { width, height } = Dimensions.get('window');

@inject('branches', 'location')
@observer
class Branches extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedCountryName: '',
      selectedStateName: '',
      selectedCityName: '',
      selectedCountryId: '',
      selectedStateId: '',
      selectedCityId: '',
      selectPickerList: '',
      isModalVisible: false,
    };
  }

  async componentDidMount() {
    const { errorFetchingCountryListMessage } = this.props.location;
    const { selectedBranchCountry, selectedBranchState, selectedBranchCity } =
      this.props.branches;
    await this.props.location.countryList();
    await this.props.location.stateList(
      selectedBranchCountry?.countryId ||
        this.props.location.getActiveCountryListForBanch[0].countryId,
    );
    await this.props.location.cityList(
      selectedBranchState?.stateId ||
        this.props.location.getStateNameList[0]?.stateId,
    );
    this.setState({
      selectedCountryId:
        selectedBranchCountry?.countryId ||
        this.props.location.getActiveCountryListForBanch[0].countryId,
      selectedCountryName:
        selectedBranchCountry?.countryName ||
        this.props.location.getActiveCountryListForBanch[0].countryName,
      selectedStateId:
        selectedBranchState?.stateId ||
        this.props.location.getStateNameList[0].stateId ||
        '',
      selectedStateName:
        selectedBranchState?.stateName ||
        this.props.location.getStateNameList[0].stateName,
      selectedCityId:
        selectedBranchCity?.cityId ||
        this.props.location.getCityNameList[0]?.cityId ||
        '',
      selectedCityName:
        selectedBranchCity?.cityName ||
        this.props.location.getCityNameList[0]?.cityName,
    });
    if (errorFetchingCountryListMessage) {
      showToast(errorFetchingCountryListMessage, Toast.type.ERROR);
    }
  }

  renderSubmitButton = () => {
    return (
      <CustomButton
        handleClick={() => this.onPressGetDetails()}
        linearGradient
        buttonContainer={styles.button}
        buttonTitle="Get Details"
        buttonTitleStyle={styles.customButtonTitleStyle}
        primaryColor="#6895d4"
        secondaryColor="#57a5cf"
      />
    );
  };

  onPressGetDetails = () => {
    this.props.navigation.navigate('branchDetails', {
      stateId: this.state.selectedStateId,
      cityId: this.state.selectedCityId,
    });
  };

  setCountryValue = itemValue => {
    const { countryId, countryName } = itemValue || {};
    this.props.branches.selectedBranchCountry = countryId;
    this.setState(
      {
        selectedCountryId: countryId,
        selectedCountryName: countryName,
        selectedStateId: '',
        selectedStateName: '',
        selectedCityId: '',
        selectedCityName: '',
      },
      async () => {
        await this.props.location.stateList(countryId);
        await this.props.location.cityList(
          this.props.location.getStateNameList[0]?.stateId,
        );
      },
    );
  };

  setStateValue = itemValue => {
    const { stateId, stateName } = itemValue;
    this.props.branches.setSelectedBranchState({
      stateName: stateName,
      stateId: stateId,
    });
    this.setState(
      {
        selectedStateId: stateId,
        selectedStateName: stateName,
        selectedCityId: '',
        selectedCityName: '',
      },
      async () => {
        await this.props.location.cityList(stateId);
      },
    );
  };

  setCityValue = itemValue => {
    const { cityId, cityName } = itemValue;
    this.props.branches.selectedBranchCity = cityId;
    this.setState({ selectedCityId: cityId, selectedCityName: cityName });
  };

  getPickerData = () => {
    switch (this.state.selectPickerList) {
      case PICKER_ENUM.COUNTRY_PICKER:
        return this.props.location.getActiveCountryListForBanch;
      case PICKER_ENUM.STATE_PICKER:
        return this.props.location.getStateNameList;
      case PICKER_ENUM.CITY_PICKER:
        return this.props.location.getCityNameList;
      default:
        return [{}];
    }
  };

  getModalSchema = () => {
    switch (this.state.selectPickerList) {
      case PICKER_ENUM.COUNTRY_PICKER:
        return { label: 'countryName', value: 'countryId' };
      case PICKER_ENUM.STATE_PICKER:
        return { label: 'stateName', value: 'stateId' };
      case PICKER_ENUM.CITY_PICKER:
        return { label: 'cityName', value: 'cityId' };
      default:
        return { label: 'label', value: 'value' };
    }
  };

  closeBottomSheet = () => {
    this.setState({
      selectPickerList: '',
      isModalVisible: false,
    });
  };

  handlePickerSelector = type => {
    const { getActiveCountryListForBanch, getStateNameList, getCityNameList } =
      this.props.location;
    if (
      type === PICKER_ENUM.CITY_PICKER &&
      (!Array.isArray(getActiveCountryListForBanch) ||
        Array.isArray(getActiveCountryListForBanch)?.length < 1)
    ) {
      showToast(
        strings.emptyScreenMessages.noDataFoundMessage,
        Toast.type.ERROR,
      );
      return;
    }
    if (
      type === PICKER_ENUM.STATE_PICKER &&
      (!Array.isArray(getStateNameList) ||
        Array.isArray(getStateNameList)?.length < 1)
    ) {
      showToast(
        strings.emptyScreenMessages.noDataFoundMessage,
        Toast.type.ERROR,
      );
      return;
    }
    if (
      type === PICKER_ENUM.CITY_PICKER &&
      (!Array.isArray(getCityNameList) ||
        Array.isArray(getCityNameList)?.length < 1)
    ) {
      showToast(
        strings.emptyScreenMessages.noDataFoundMessage,
        Toast.type.ERROR,
      );
      return;
    }
    this.setState({
      selectPickerList: type,
      isModalVisible: true,
    });
  };

  handlePickerItemPress = item => {
    switch (this.state.selectPickerList) {
      case PICKER_ENUM.CITY_PICKER:
        this.setCityValue(item);
        break;
      case PICKER_ENUM.STATE_PICKER:
        this.setStateValue(item);
        break;
      case PICKER_ENUM.COUNTRY_PICKER:
        this.setCountryValue(item);
        break;
      default:
        break;
    }
    this.closeBottomSheet();
  };

  render() {
    return (
      <View style={styles.container}>
        {/* <Loader loading={this.props.location.isLoading} /> */}
        <Header
          navigation={this.props.navigation}
          screenTitle={strings.drawerScreen.branches}
        />
        <View style={styles.pickerContainer}>
          <View style={{ marginBottom: 15 }}>
            <Text>Country Name</Text>
            <PickerSelector
              label={this.state.selectedCountryName || 'Select a Country'}
              selectedValue={this.state.selectedCountryId}
              customStyle={{
                container: {
                  marginHorizontal: 0,
                },
              }}
              onPickerPress={() =>
                this.handlePickerSelector(PICKER_ENUM.COUNTRY_PICKER)
              }
            />
          </View>
          <View style={{ marginBottom: 15 }}>
            <Text>State Name</Text>
            <PickerSelector
              label={this.state.selectedStateName || 'Select a State'}
              selectedValue={this.state.selectedStateId}
              customStyle={{
                container: {
                  marginHorizontal: 0,
                },
              }}
              onPickerPress={() =>
                this.handlePickerSelector(PICKER_ENUM.STATE_PICKER)
              }
            />
          </View>

          <View style={{ marginBottom: 15 }}>
            <Text>City Name</Text>
            <PickerSelector
              label={this.state.selectedCityName || 'Select a City'}
              selectedValue={this.state.selectedCityId}
              customStyle={{
                container: {
                  marginHorizontal: 0,
                },
              }}
              onPickerPress={() =>
                this.handlePickerSelector(PICKER_ENUM.CITY_PICKER)
              }
            />
          </View>
        </View>
        {this.renderSubmitButton()}
        <BottomSheetPicker
          isVisible={this.state.isModalVisible}
          onModalClose={this.closeBottomSheet}
          pickerItems={this.getPickerData()}
          schema={this.getModalSchema()}
          heightMax={(2 / 3) * height}
          onItemPress={this.handlePickerItemPress}
        />
      </View>
    );
  }
}

export default Branches;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  horizontalLine: {
    borderTopColor: '#c8c9d3',
    borderTopWidth: 1,
  },
  customButtonTitleStyle: {
    color: '#FFFFFF',
    fontSize: 16,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  pickerContainer: {
    marginHorizontal: 15,
    paddingHorizontal: 10,
    marginVertical: 30,
  },
});
