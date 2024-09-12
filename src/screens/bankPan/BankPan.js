import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { observer, inject } from 'mobx-react';
import { observable } from 'mobx';
import PickerSelector from '../../components/picker/pickerSelector';
import { BottomSheetPicker } from '../../components/picker/bottomSheetPicker';
import { Specs } from 'app/src/utility/Theme';
import { RadioButton } from 'app/src/components/buttons/Button';
import { strings } from 'app/src/utility/localization/Localized';
import { showToast } from 'app/src/utility/Utility';
import moment from 'moment';
import store from 'app/src/stores/Store';

import AlertClass from 'app/src/utility/AlertClass';
import BankForm from './BankForm';
import PanForm from './PanForm';
import { Header } from '../../components';

const SUBMIT_FOR = [
  { label: 'Self', value: 'Self' },
  { label: 'Downline', value: 'Downline' },
];

/**
 * @description This will manage screen title according to configuration
 * @param {*} config {0:'bank & Pan, 1:'pan', 2:'bank'}
 */
const manageScreenTitle = config => {
  switch (config) {
    case '0': {
      return strings.bankPan.pan.screenTitleMain;
    }
    case '1': {
      return strings.bankPan.pan.screenTitlePan;
    }
    case '2': {
      return strings.bankPan.pan.screenTitleBank;
    }
    default: {
      return strings.bankPan.pan.screenTitleMain;
    }
  }
};

@inject('auth', 'bankPan', 'profile', 'appConfiguration')
@observer
class BankPan extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedLabel: '',
      submitForValue: 'Self',
      bankPanData: '',
      isModalVisible: false,
    };
    this.loggedInUserDOB = moment(this.props.profile.dob).format('DD/MM/YYYY');
    this.invalidValues = ['', undefined, 'undefined', null, 'null'];
    this.defaultConfig = this.props.appConfiguration?.bankPanScreen?.value;
  }

  async componentDidMount() {
    this.handleDefaultSelectedLabel();
    await this.fetchPanBankDetails();
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
    this.setState({ submitForValue: item?.value });
    this.handleModalVisibility(false);
  };

  handleDefaultSelectedLabel = () => {
    switch (this.defaultConfig) {
      case '0': {
        this.setState({ selectedLabel: strings.kyc.docType.pan.label });
        break;
      }
      case '1': {
        this.setState({ selectedLabel: strings.kyc.docType.pan.label });
        break;
      }
      case '2': {
        this.setState({ selectedLabel: strings.kyc.docType.bank.label });
        break;
      }
      default: {
        this.setState({ selectedLabel: strings.kyc.docType.pan.label });
        break;
      }
    }
  };

  fetchPanBankDetails = async () => {
    const resBankPan = await this.props.bankPan.getPanBankDetails(
      this.props.auth.distributorID,
      this.props.profile.countryId,
    );
    if (resBankPan.success) {
      this.setState({
        bankPanData: resBankPan.data,
      });
    } else {
      showToast(resBankPan.message);
    }
  };

  renderBankPanSelector = () => {
    const { docChoice, docType } = strings.kyc;
    const { selectedLabel } = this.state;

    const bankPanConfig = store.appConfiguration?.bankPanScreen?.value;
    if (bankPanConfig && bankPanConfig === '0') {
      return (
        <View style={styles.barView}>
          <Text style={styles.barViewtext}>{`${docChoice}: `}</Text>
          <View style={styles.radioButtonView}>
            <RadioButton
              buttonText={docType.pan.label}
              onPress={() =>
                this.setState({ selectedLabel: docType.pan.label })
              }
              selectedValue={selectedLabel}
            />
            <RadioButton
              buttonText={docType.bank.label}
              onPress={() =>
                this.setState({ selectedLabel: docType.bank.label })
              }
              selectedValue={selectedLabel}
            />
          </View>
        </View>
      );
    }
  };

  render() {
    const { docType } = strings.kyc;
    const { selectedLabel, submitForValue, bankPanData } = this.state;
    // const { distributorID } = this.props.auth
    // console.log('rescheck',this.state.panStatus)
    return (
      <View style={{ flex: 1 }}>
        {/* <Text style={styles.kycTitle}>
          {heading}
        </Text> */}
        <Header
          navigation={this.props.navigation}
          screenTitle={manageScreenTitle(
            store.appConfiguration?.bankPanScreen?.value,
          )}
        />
        {this.renderBankPanSelector()}
        <ScrollView>
          <View
            style={{
              backgroundColor: '#fff',
              paddingHorizontal: 17,
              paddingTop: 15,
            }}>
            <Text style={styles.pickerTitleText}>Submit Details For:</Text>
            <PickerSelector
              label={this.state.submitForValue || 'Select any Mode'}
              selectedValue={this.state.submitForValue}
              customStyle={{
                container: {
                  marginHorizontal: 0,
                },
              }}
              onPickerPress={this.handlePickerSelector}
            />
          </View>
          {selectedLabel === docType.pan.label && (
            <PanForm
              {...this.props}
              panData={bankPanData}
              fetchPanBank={() => this.fetchPanBankDetails()}
              submitForValue={submitForValue}
              isImagePickerVisible={this.state.isImagePickerVisible}
            />
          )}
          {selectedLabel === docType.bank.label && (
            <BankForm
              {...this.props}
              submitForValue={submitForValue}
              bankData={this.state.bankPanData}
              fetchPanBank={() => this.fetchPanBankDetails()}
              isImagePickerVisible={this.state.isImagePickerVisible}
            />
          )}
        </ScrollView>
        <BottomSheetPicker
          isVisible={this.state.isModalVisible}
          onModalClose={() => this.handleModalVisibility(false)}
          pickerItems={SUBMIT_FOR}
          heightMax={180}
          onItemPress={this.handlePickerItemPress}
        />
      </View>
    );
  }
}

export default BankPan;

const styles = StyleSheet.create({
  headerTitle: {
    ...Specs.fontBold,
    fontSize: 18,
    color: '#373e73',
  },
  kycTitle: {
    fontSize: 18,
    color: '#3f4967',
    marginHorizontal: 16,
    marginTop: 12,
    ...Specs.fontMedium,
  },
  barView: {
    marginBottom: 7,
    backgroundColor: 'white',
    marginTop: 14,
    paddingVertical: 5,
  },
  barViewtext: {
    marginHorizontal: 17,
    color: '#9da3c2',
    fontSize: 12,
    marginTop: 9,
    ...Specs.fontMedium,
  },
  radioButtonView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginRight: 26,
    paddingHorizontal: 5,
    paddingVertical: 3,
  },
  horizontalLine: {
    borderTopColor: '#c8c9d3',
    borderTopWidth: 1,
  },
  pickerTitleText: {
    ...Specs.fontRegular,
    color: '#545a6b',
    fontSize: 12,
  },
});
