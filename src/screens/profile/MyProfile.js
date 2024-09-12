import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { observable, makeObservable } from 'mobx';
import HeaderLeftIcons from 'app/src/components/navigation/HeaderLeftIcons';
import { observer, inject } from 'mobx-react';
import UserProfile from 'app/src/components/dashBoard/UserProfile';
import autobind from 'autobind-decorator';
import { strings } from 'app/src/utility/localization/Localized';
import SignupTextInput from '../../components/signUpInputComponent/SignupTextInput';
import {
  VESTIGE_IMAGE,
  UserRole,
  TITLE_DATA,
} from '../../utility/constant/Constants';
import { dateFormat, getFocusedTabBar } from '../../utility/Utility';
import { Specs, COLOR_CODES } from '../../utility/Theme';
import { constant } from 'lodash';
import { Header } from '../../components';

const MY_PROFILE_INFO = {};

const PROFILE_SCREEN_TYPE = [
  {
    screenTitle: strings.PROFILE_SCREEN_SEGMENT_TITLE.PROFILE,
    screenTitleKey: strings.PROFILE_SCREEN_SEGMENT_TITLE.PROFILE,
  },
  {
    screenTitle: strings.PROFILE_SCREEN_SEGMENT_TITLE.PANBANK,
    screenTitleKey: strings.PROFILE_SCREEN_SEGMENT_TITLE.PANBANK,
  },
];

@inject('profile', 'auth', 'appConfiguration')
@observer
class MyProfile extends Component {
  @observable isEditable: boolean = false;

  constructor(props) {
    super(props);
    makeObservable(this);
    this.state = {
      selectedSegmentType: strings.PROFILE_SCREEN_SEGMENT_TITLE.PROFILE,
    };
  }

  /**
   * @description Function for geeting user input value from the fields
   */
  handleTextInput = (text, index) => {
    MY_PROFILE_INFO[index] = text;
  };

  getTitle = title => {
    const fetchTitle = TITLE_DATA.filter(data => data.titleId == title);
    return fetchTitle?.[0]?.title || '';
  };

  componentDidMount() {
    let response = this.props.profile.fetchPanBankDetail();
  }

  @autobind
  bankInfoForm(): Array<any> {
    const { availableBankDetails } = this.props.profile;

    const PanCardBankName = [
      {
        type: 'validUpline',
        showIcon: false,
        placeholder: availableBankDetails[0]
          ? availableBankDetails[0].bankName
          : '',
        key: 'bankName',
        maxLength: 50,
        numberOfLines: 2,
        multiline: true,
        isEditable: this.isEditable,
      },
    ];

    const IfscInfo = [
      {
        type: 'validUpline',
        showIcon: false,
        placeholder: availableBankDetails[0]
          ? availableBankDetails[0].bankBranchCode
          : '',
        key: 'bankBranchCode',
        maxLength: 20,
        isEditable: this.isEditable,
      },
    ];

    const PanCardBankAccount = [
      {
        type: 'validUpline',
        showIcon: false,
        placeholder: availableBankDetails[0]
          ? availableBankDetails[0].bankAccountNumber
          : '',
        key: 'bankAccountNumber',
        maxLength: 30,
        isEditable: this.isEditable,
      },
    ];

    const BankStatus = [
      {
        type: 'validUpline',
        showIcon: false,
        placeholder: availableBankDetails[0]
          ? availableBankDetails[0].bankstatus
          : '',
        key: 'bankstatus',
        maxLength: 10,
        isEditable: this.isEditable,
      },
    ];

    const PanCardPanAccount = [
      {
        type: 'validUpline',
        showIcon: false,
        placeholder: availableBankDetails[0]
          ? availableBankDetails[0].panNumber
          : '',
        key: 'panNumber',
        maxLength: 20,
        isEditable: this.isEditable,
      },
    ];

    const PanStatus = [
      {
        type: 'validUpline',
        showIcon: false,
        placeholder: availableBankDetails[0]
          ? availableBankDetails[0].panstatus
          : '',
        key: 'panNumber',
        maxLength: 10,
        isEditable: this.isEditable,
      },
    ];

    return [
      { title: 'PAN Status', data: PanStatus },
      { title: 'PAN Number', data: PanCardPanAccount },
      { title: 'Bank Status', data: BankStatus },
      { title: 'Bank Name', data: PanCardBankName },
      { title: 'IFSC', data: IfscInfo },
      { title: 'Account Number', data: PanCardBankAccount },
    ];
  }

  @autobind
  createForm(): Array<any> {
    const {
      firstName,
      lastName,
      dob,
      gender,
      mobileNumber,
      email,
      coDistributorFirstName,
      coDistributorLastName,
      coDistributorDob,
      distributorID,
      uplineDistributorId,
      title,
      coDistributorTitle,
      shippingAddress,
      residentialAddress,
    } = this.props.profile;
    const validUpline = [
      {
        type: 'validUpline',
        placeholder: uplineDistributorId.toString(),
        showIcon: false,
        key: 'validUpline',
        keyboardType: 'numeric',
        maxLength: 8,
        isEditable: this.isEditable,
      },
    ];

    const personalDetailsInput = [
      {
        type: 'textInputWithIcon',
        icon: VESTIGE_IMAGE.PROFILE_ICON,
        placeholder: this.getTitle(title),
        key: 'title',
        maxLength: 50,
        isEditable: this.isEditable,
      },
      {
        type: 'textInputWithIcon',
        icon: VESTIGE_IMAGE.PROFILE_ICON,
        placeholder: firstName,
        key: 'firstName',
        maxLength: 50,
        isEditable: this.isEditable,
      },
      {
        type: 'textInputWithIcon',
        icon: VESTIGE_IMAGE.PROFILE_ICON,
        placeholder: lastName,
        key: 'lastName',
        maxLength: 50,
        isEditable: this.isEditable,
      },
      {
        type: 'textInputWithIcon',
        icon: VESTIGE_IMAGE.DOB_ICON,
        placeholder: dateFormat(new Date(dob)),
        key: 'dob',
        maxLength: 50,
        isEditable: this.isEditable,
      },
      {
        type: 'textInputWithIcon',
        icon: VESTIGE_IMAGE.PROFILE_ICON,
        placeholder: gender,
        key: 'gender',
        maxLength: 50,
        isEditable: this.isEditable,
      },
    ];

    const contactDetailsInput = [
      {
        type: 'textInputWithIcon',
        icon: VESTIGE_IMAGE.PROFILE_ICON,
        placeholder: mobileNumber,
        keyboardType: 'numeric',
        key: 'mobile',
        maxLength: 50,
        isEditable: this.isEditable,
      },
      {
        type: 'textInputWithIcon',
        icon: VESTIGE_IMAGE.EMAIL_ICON,
        placeholder: email,
        keyboardType: 'email-address',
        key: 'email',
        maxLength: 50,
        isEditable: this.isEditable,
      },
    ];

    const residentialAddressDetailsInput = [
      {
        type: this.props.profile.countryId == 4 ? '' : 'textInputWithIcon',
        icon: VESTIGE_IMAGE.LOCATION_ICON,
        placeholder: residentialAddress.pincode || strings.profile.noPincode,
        key: 'residential_pincode',
        maxLength: 50,
        isEditable: this.isEditable,
      },
      {
        type: 'textInputWithIcon',
        icon: VESTIGE_IMAGE.LOCATION_ICON,
        placeholder: residentialAddress.address || strings.profile.noAddress,
        key: 'residential_address',
        maxLength: 50,
        isEditable: this.isEditable,
      },
      {
        type: 'textInputWithIcon',
        icon: VESTIGE_IMAGE.LOCATION_ICON,
        placeholder: residentialAddress.city || strings.profile.noCity,
        key: 'residential_city',
        maxLength: 50,
        isEditable: this.isEditable,
      },
      {
        type: 'textInputWithIcon',
        icon: VESTIGE_IMAGE.LOCATION_ICON,
        placeholder: residentialAddress.state || strings.profile.noState,
        key: 'residential_state',
        maxLength: 50,
        isEditable: this.isEditable,
      },
      {
        type: 'textInputWithIcon',
        icon: VESTIGE_IMAGE.LOCATION_ICON,
        placeholder: residentialAddress.country || strings.profile.noCountry,
        key: 'residential_country',
        maxLength: 50,
        isEditable: this.isEditable,
      },
    ];

    const shippingAddressDetailsInput = [
      {
        type: this.props.profile.countryId == 4 ? '' : 'textInputWithIcon',
        icon: VESTIGE_IMAGE.LOCATION_ICON,
        placeholder: shippingAddress.pincode || strings.profile.noPincode,
        key: 'shipping_pincode',
        maxLength: 50,
        isEditable: this.isEditable,
      },
      {
        type: 'textInputWithIcon',
        icon: VESTIGE_IMAGE.LOCATION_ICON,
        placeholder: shippingAddress.address || strings.profile.noAddress,
        key: 'shipping_address',
        maxLength: 50,
        isEditable: this.isEditable,
      },
      {
        type: 'textInputWithIcon',
        icon: VESTIGE_IMAGE.LOCATION_ICON,
        placeholder: shippingAddress.city || strings.profile.noCity,
        key: 'shipping_city',
        maxLength: 50,
        isEditable: this.isEditable,
      },
      {
        type: 'textInputWithIcon',
        icon: VESTIGE_IMAGE.LOCATION_ICON,
        placeholder: shippingAddress.state || strings.profile.noState,
        key: 'shipping_state',
        maxLength: 50,
        isEditable: this.isEditable,
      },
      {
        type: 'textInputWithIcon',
        icon: VESTIGE_IMAGE.LOCATION_ICON,
        placeholder: shippingAddress.country || strings.profile.noCountry,
        key: 'shipping_country',
        maxLength: 50,
        isEditable: this.isEditable,
      },
    ];

    const coDistributerInput = [
      {
        type: 'textInputWithIcon',
        icon: VESTIGE_IMAGE.PROFILE_ICON,
        placeholder: this.getTitle(coDistributorTitle),
        key: 'title',
        maxLength: 50,
        isEditable: this.isEditable,
      },
      {
        type: 'textInputWithIcon',
        icon: VESTIGE_IMAGE.PROFILE_ICON,
        placeholder: coDistributorFirstName,
        key: 'firstName',
        maxLength: 50,
        isEditable: this.isEditable,
      },
      {
        type: 'textInputWithIcon',
        icon: VESTIGE_IMAGE.PROFILE_ICON,
        placeholder: coDistributorLastName,
        key: 'lastName',
        maxLength: 50,
        isEditable: this.isEditable,
      },
      {
        type: 'textInputWithIcon',
        icon: VESTIGE_IMAGE.DOB_ICON,
        placeholder: dateFormat(new Date(coDistributorDob)),
        key: 'dob',
        maxLength: 50,
        isEditable: this.isEditable,
      },
    ];

    const distributerId = [
      {
        type: 'validUpline',
        placeholder: distributorID.toString(),
        showIcon: false,
        key: 'distributorId',
        keyboardType: 'numeric',
        maxLength: 8,
        isEditable: this.isEditable,
      },
    ];

    return [
      { title: 'MY DISTRIBUTOR ID ', data: distributerId },
      { title: 'MY UPLINE', data: validUpline },
      { title: 'PERSONAL DETAILS ', data: personalDetailsInput },
      { title: 'CONTACT DETAILS ', data: contactDetailsInput },
      { title: 'RESIDENTIAL ADDRESS ', data: residentialAddressDetailsInput },
      { title: 'SHIPPING ADDRESS ', data: shippingAddressDetailsInput },
      { title: 'CO-DISTRIBUTOR DETAILS ', data: coDistributerInput },
    ];
  }

  switchSegment = segmentData => {
    this.setState({ selectedSegmentType: segmentData.screenTitle });
  };

  tabContainerView() {
    return (
      <View style={styles.fundsTypeTabContainer}>
        {PROFILE_SCREEN_TYPE.map((screenData, index) => {
          return this.state.selectedSegmentType === screenData.screenTitle ? (
            <View
              key={screenData.screenTitleKey}
              style={[
                styles.fundsTabContainer,
                {
                  backgroundColor: '#6797d4',
                },
              ]}>
              <TouchableOpacity
                style={{ flexDirection: 'row' }}
                key={index.toString()}
                onPress={() => this.switchSegment(screenData)}>
                <Text
                  style={[styles.fundsTabTextTitleStyle, { color: 'white' }]}>
                  {screenData.screenTitle}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              key={index.toString()}
              style={[styles.fundsTabContainer, { flexDirection: 'row' }]}
              onPress={() => this.switchSegment(screenData)}>
              <Text
                style={[
                  styles.fundsTabTextTitleStyle,
                  { color: 'rgba(10,106,255,1.0)' },
                ]}>
                {screenData.screenTitle}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  @autobind
  renderHeader() {
    const { navigation, profile } = this.props;
    if (profile.countryId != 1 && profile.isPanBankShow == false) {
      return (
        <View style={styles.headerContainer}>
          <View style={styles.imageContainer}>
            <UserProfile profile={profile} navigation={navigation} isProfile />
          </View>
        </View>
      );
    } else {
      return (
        <View style={styles.headerContainer}>
          <View style={styles.imageContainer}>
            <UserProfile profile={profile} navigation={navigation} isProfile />
          </View>
          {this.tabContainerView()}
        </View>
      );
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <Header
          navigation={this.props.navigation}
          screenTitle={strings.profile.title}
        />
        <SectionList
          sections={
            this.state.selectedSegmentType ==
            strings.PROFILE_SCREEN_SEGMENT_TITLE.PROFILE
              ? this.createForm()
              : this.bankInfoForm()
          }
          keyboardShouldPersistTaps="handled"
          stickySectionHeadersEnabled={false}
          renderSectionHeader={({ section }) =>
            section.title ? (
              <View
                style={[
                  styles.detailsContainer,
                  {
                    marginTop:
                      this.state.selectedSegmentType ==
                      strings.PROFILE_SCREEN_SEGMENT_TITLE.PROFILE
                        ? 10
                        : 0,
                  },
                ]}>
                <Text style={styles.detailsContainerSection}>
                  {section.title}
                </Text>
              </View>
            ) : null
          }
          renderItem={({ item }) => (item?.type ?
            <View style={{ backgroundColor: '#FFF', minHeight: 40 }}>
              <SignupTextInput {...this.props} inputData={item} />
            </View> : null
          )}
          ListHeaderComponent={this.renderHeader}
          keyExtractor={(item, index) => index}
        />
      </View>
    );
  }
}

export default MyProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFF3F7',
    marginTop: Platform.OS == 'ios' ? 10 : 0,
  },
  headerContainer: {
    backgroundColor: '#FFF',
  },
  detailsContainer: {
    backgroundColor: '#FFF',
    marginTop: 10,
    justifyContent: 'center',
  },
  detailsContainerSection: {
    marginLeft: 10,
    paddingTop: 5,
    marginBottom: 0,
    color: '#9da3c2',
    ...Specs.fontMedium,
    fontSize: 12,
  },
  imageContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 17,
  },
  fundsTypeTabContainer: {
    alignSelf: 'center',
    flexDirection: 'row',
    backgroundColor: COLOR_CODES.white,
    width: '98%',
    height: 40,
    borderWidth: 2,
    borderColor: '#6797d4',
  },
  fundsTabTextTitleStyle: {
    color: '#6797d4',
    fontSize: 14,
    ...Specs.fontMedium,
  },
  fundsTabContainer: {
    flex: 1,
    backgroundColor: 'rgba(229,229,229,1.0)',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
