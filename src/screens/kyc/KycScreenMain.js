import React, { Component } from 'react';
import { Text, View, StyleSheet, FlatList, ScrollView } from 'react-native';
import { observer, inject } from 'mobx-react';
import { observable, makeObservable } from 'mobx';
import { RadioButton } from 'app/src/components/buttons/Button';
import { Specs } from 'app/src/utility/Theme';
import KycDetails from 'app/src/screens/kyc/KycDetails';
import { strings } from 'app/src/utility/localization/Localized';
import { Toast } from 'app/src/components/toast/Toast';
import Loader from 'app/src/components/loader/Loader';
import {
  VESTIGE_IMAGE,
  KYC_CONSTANT,
  LOCATION_ROUTE_PATH,
} from 'app/src/utility/constant/Constants';
import CustomInput from 'app/src/components/CustomInput';
import { showToast } from 'app/src/utility/Utility';
import * as AsyncStore from 'app/src/utility/AsyncStoragesUtils';
import store from 'app/src/stores/Store';

// Navigation Icons
import HeaderRightIcons from 'app/src/components/navigation/HeaderRightIcons';
import HeaderLeftIcons from 'app/src/components/navigation/HeaderLeftIcons';
import { Header } from '../../components';

const DISTRIBUTOR_DATA = [
  {
    fieldName: 'distributorId',
    placeholder: strings.daf.distributorId,
    icon: VESTIGE_IMAGE.PROFILE_ICON,
    maxLength: 8,
  },
  {
    fieldName: 'distributorName',
    placeholder: strings.daf.distributorName,
    icon: VESTIGE_IMAGE.PROFILE_ICON,
    maxLength: 20,
  },
];

@inject('profile', 'auth', 'location', 'cart', 'appConfiguration')
@observer
class KycScreenMain extends Component {
  @observable isValidDistributerId = true;

  constructor(props) {
    super(props);
    makeObservable(this);
    this.state = {
      docNumber: '',
      bankName: '',
      images: [],
      kycFor: 'Self',
      isImagePickerVisible: false,
      distributorId: this.props.auth.distributorID,
      distributorName: this.props.auth.username,
      countryID: this.props.profile.countryId,
      selectedMode: this.createKycForm(this.props.profile.countryId)[0],
      kycGuidelines: this.props.profile.uploadedKycGuidelines,
      kycType: '',
    };
  }

  async componentDidMount() {
    const responseJSON = await this.props.profile.fetchKycGuidelines();
    if (responseJSON && responseJSON.hasOwnProperty('success')) {
      this.setState({
        kycType: responseJSON?.data[1]?.kycType,
      });
    }
    this.setState({
      kycGuidelines: this.props.profile.uploadedKycGuidelines,
    });
  }

  handleImagePickerVisibility = value => {
    this.setState({ isImagePickerVisible: value });
  };

  createKycForm = countryId => {
    const { docType } = strings.kyc;
    let kycData;
    if (countryId === 1) {
      kycData = [
        {
          label: docType.aadhar.label,
          value: KYC_CONSTANT.aadharCard,
          docId: 1,
          display: 'none',
          maxLength: 12,
          keyBoardType: 'numeric',
          countryId: 1,
        },
        {
          label: docType.driverLicence.label,
          value: KYC_CONSTANT.driverLicence,
          docId: 3,
          display: 'none',
          maxLength: 30,
          keyBoardType: 'default',
          countryId: 1,
        },
        {
          label: docType.passport.label,
          value: KYC_CONSTANT.passport,
          docId: 5,
          display: 'none',
          maxLength: 30,
          keyBoardType: 'default',
          countryId: 1,
        },
        {
          label: docType.voterId.label,
          value: KYC_CONSTANT.voterId,
          docId: 2,
          display: 'none',
          maxLength: 30,
          keyBoardType: 'default',
          countryId: 1,
        },
      ];
      return kycData;
    }
    if (countryId === 25 || countryId === 26) {
      kycData = [
        {
          label: docType.driverLicence.label,
          value: KYC_CONSTANT.driverLicence,
          docId: 4,
          display: 'none',
          maxLength: 30,
          keyBoardType: 'default',
          countryId: 1,
        },
        {
          label: docType.passport.label,
          value: KYC_CONSTANT.passport,
          docId: 4,
          display: 'none',
          maxLength: 30,
          keyBoardType: 'default',
          countryId: 1,
        },
        {
          label: docType.nationalIdentityCard.label,
          value: KYC_CONSTANT.nationalIdentityCard,
          docId: 4,
          display: 'none',
          maxLength: 30,
          keyBoardType: 'default',
          countryId: 1,
        },
      ];
      return kycData;
    }

    kycData = [
      {
        label: docType.driverLicence.label,
        value: KYC_CONSTANT.driverLicence,
        docId: 4,
        display: 'none',
        maxLength: 30,
        keyBoardType: 'default',
        countryId: this.props.profile.countryId,
      },
      {
        label: docType.passport.label,
        value: KYC_CONSTANT.passport,
        docId: 4,
        display: 'none',
        maxLength: 30,
        keyBoardType: 'default',
        countryId: this.props.profile.countryId,
      },
    ];
    return kycData;
  };

  toast(message, type) {
    Toast.show(message, {
      duration: Toast.durations.SHORT,
      position: Toast.positions.TOP,
      type: type,
      shadow: false,
      animation: true,
      hideOnPress: true,
      delay: 0,
    });
  }

  updateDocnumber = value => {
    this.setState({ docNumber: value });
  };

  updateBankName = value => {
    this.setState({ bankName: value });
  };

  updateDocImage = (type, data) => {
    const { images } = this.state;
    type === 'insert'
      ? this.setState({ images: [...images, data] })
      : (images.splice(data, 1), this.setState({ images }));
  };

  onPressSkip = () => {
    //...setting below key will automatically change route to default one. Other cases are handled. (as per requirement).....
    if (this.props.auth.distributorType == 3) {
      this.props.navigation.goBack();
    } else {
      this.props.auth.setSkippableLoginKycInProcess(false);
    }

    // this.props.navigation.navigate('Dashboard');
  };

  navigateToNextScreen = async () => {
    let isDrawer = false;
    let isLoginRoute = false;
    if (this.props.route.params) {
      isDrawer = this.props.route.params.isDrawer
        ? this.props.route.params.isDrawer
        : false;
      isLoginRoute = this.props.route.params.isLoginRoute
        ? this.props.route.params.isLoginRoute
        : false;
    }

    const { profile, navigation } = this.props;
    if (
      profile.isEkycDone &&
      !isDrawer &&
      !isLoginRoute &&
      profile.kycMessage
    ) {
      this.toast(profile.kycMessage, Toast.type.SUCCESS);
      setTimeout(() => {
        if (!profile.activeAddress.addressType) {
          this.props.location.setLocationRoutePath(LOCATION_ROUTE_PATH.next);
          navigation.navigate('location');
        } else {
          navigation.navigate('dashboard');
        }
      }, 300);
    } else if (
      isLoginRoute &&
      profile.isEkycDone &&
      !isDrawer &&
      profile.kycMessage
    ) {
      this.toast(profile.kycMessage, Toast.type.SUCCESS);

      // Below method is getting called in case of {isKycSkippable === true} already so only
      // calling in vice versa condition here. this will auto save session and auto navigate to default route.
      if (!this.props.appConfiguration?.isKycSkippable) {
        await this.props.auth.saveLoginSessionData();
      } else {
        //...setting below key will automatically change route to default one. Other cases are handled. (as per requirement).....
        if (this.props.auth.distributorType == 3) {
          this.props.navigation.goBack();
        } else {
          this.props.auth.setSkippableLoginKycInProcess(false);
        }
      }
    } else if (profile.isEkycDone && isDrawer && profile.kycMessage) {
      this.toast(profile.kycMessage, Toast.type.SUCCESS);
      setTimeout(() => {
        navigation.goBack();
      }, 300);
    } else {
      profile.kycMessage
        ? this.toast(profile.kycMessage, Toast.type.ERROR)
        : null;
    }
  };

  onChangeText = async (item, value) => {
    this.setState({ [item.fieldName]: value });
    if (item.fieldName === 'distributorId' && value.length == 8) {
      this.isValidDistributerId = false;
      await this.props.cart.validateDownline(value, undefined, true);
      if (Object.keys(this.props.cart.validatedDownline).length > 1) {
        this.isValidDistributerId = true;
        const distName = `${this.props.cart.validatedDownline.firstName} ${this.props.cart.validatedDownline.lastName}`;
        const downlineCountryId = JSON.parse(
          this.props.cart.validatedDownline?.countryId,
        );
        this.setState({
          distributorName: distName,
          countryID: downlineCountryId,
          selectedMode: this.createKycForm(downlineCountryId)[0],
        });
      } else {
        this.setState({
          distributorName: '',
        });
        showToast(strings.daf.invalidDistributorId);
      }
    }
  };

  isEditable = item => {
    const { kycFor } = this.state;
    const isDisabled =
      (kycFor === 'Self' &&
        ['distributorId', 'distributorName'].includes(item.fieldName)) ||
      'distributorName' === item.fieldName;
    return !isDisabled;
  };

  getDistributorId = () => {
    const { kycFor, distributorId } = this.state;
    const { auth } = this.props;
    const distIdForApi = kycFor === 'Self' ? auth.distributorID : distributorId;
    return distIdForApi;
  };

  onPressDocumentType = item => {
    this.setState({
      selectedMode: item,
      docNumber: '',
      bankName: '',
      images: [],
    });
  };

  renderItem = item => {
    return (
      <View style={styles.inputItem}>
        <CustomInput
          placeholder={item.placeholder}
          icon={item.icon}
          marginHorizontal={17}
          editable={this.isEditable(item)}
          value={this.state[item.fieldName]}
          onChangeText={value => this.onChangeText(item, value)}
          keyboardType={
            item.fieldName === 'distributorId' ? 'numeric' : 'default'
          }
          maxLength={item.maxLength}
        />
      </View>
    );
  };

  renderKycFor = () => {
    const { kycFor } = this.state;
    const { distributorID, username } = this.props.auth;
    const isLoginRoute = this.props.route?.params?.isLoginRoute;
    return (
      <View>
        <View style={{ backgroundColor: '#fff', paddingTop: 10 }}>
          <Text style={styles.kycFor}>KYC For</Text>
        </View>
        <View style={styles.radioKycView}>
          <RadioButton
            buttonText="Self"
            onPress={() => {
              if (this.state.kycFor !== 'Self') {
                this.isValidDistributerId = true;
                this.setState({
                  kycFor: 'Self',
                  distributorId: distributorID,
                  distributorName: username,
                  countryID: this.props.profile.countryId,
                  selectedMode: this.createKycForm(
                    this.props.profile.countryId,
                  )[0],
                });
              }
            }}
            selectedValue={kycFor}
          />
          {!isLoginRoute ? (
            <RadioButton
              buttonText="Downline"
              onPress={() => {
                if (this.state.kycFor !== 'Downline') {
                  this.isValidDistributerId = false;
                  this.setState({
                    kycFor: 'Downline',
                    distributorId: '',
                    distributorName: '',
                    countryID: this.state.countryID,
                  });
                }
              }}
              selectedValue={kycFor}
            />
          ) : null}
        </View>
        <FlatList
          contentContainerStyle={{ paddingBottom: 20, backgroundColor: '#FFF' }}
          data={DISTRIBUTOR_DATA}
          // extraData={this.props.profile.activeAddress}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => this.renderItem(item)}
          keyExtractor={(item, index) => index.toString()}
          // ListFooterComponent={()=> this.renderListFooter()}
        />
      </View>
    );
  };

  renderDocumentType = ({ item }) => {
    return (
      <View style={{ flex: 1 }}>
        <RadioButton
          buttonText={item.label}
          onPress={() => this.onPressDocumentType(item)}
          selectedValue={this.state.selectedMode?.label}
        />
      </View>
    );
  };

  renderHeaderRight = isSkipEnabled => {
    return (
      <HeaderRightIcons
        kycSkip={isSkipEnabled === false ? false : true}
        handleKycSkip={this.onPressSkip}
      />
    );
  };

  handleHeader = () => {
    const { navigation, route } = this.props;
    const isDrawer = route?.params?.isDrawer ? route?.params?.isDrawer : false;
    const isLoginRoute = route?.params?.isLoginRoute
      ? route?.params?.isLoginRoute
      : false;

    if (isDrawer) {
      return (
        <Header
          navigation={this.props.navigation}
          screenTitle={strings.kyc.title}
        />
      );
    }
    if (isLoginRoute) {
      return (
        <Header
          navigation={this.props.navigation}
          hideBack
          screenTitle={strings.kyc.title}
          rightComponent={this.renderHeaderRight(
            this.props.appConfiguration?.isKycSkippable,
          )}
        />
      );
    }
    return (
      <Header
        navigation={this.props.navigation}
        hideBack
        screenTitle={strings.kyc.title}
      />
    );
  };

  render() {
    const {
      selectedMode,
      docNumber,
      bankName,
      images,
      countryID,
      kycGuidelines,
      kycType,
    } = this.state;
    const { profile, auth } = this.props;
    const { heading, docChoice } = strings.kyc;
    return (
      <View style={{ flex: 1 }}>
        {this.handleHeader()}
        <ScrollView>
          <Loader
            loading={this.props.profile.isLoading || this.props.cart.isLoading}
          />
          <Text style={styles.kycTitle}>{heading}</Text>
          {this.renderKycFor()}
          <View style={styles.barView}>
            <Text style={styles.barViewtext}>{`${docChoice}: `}</Text>
            <View style={styles.radioButtonView}>
              <FlatList
                data={this.createKycForm(countryID)}
                keyExtractor={(item, index) => index}
                renderItem={this.renderDocumentType}
                numColumns={2}
              />
            </View>
          </View>

          <KycDetails
            distributorId={this.getDistributorId()}
            uplineDistributorId={auth.distributorID}
            isValidDistributerId={this.isValidDistributerId}
            selectedValue={selectedMode?.value}
            data={selectedMode}
            constantData={strings.kyc.docType[selectedMode?.value]}
            updateKyc={this.navigateToNextScreen}
            updateDocnumber={this.updateDocnumber}
            docNumber={docNumber}
            updateBankName={this.updateBankName}
            bankName={bankName}
            updateDocImage={this.updateDocImage}
            images={images}
            profile={profile}
            kycGuidelines={kycGuidelines}
            kycType={kycType}
            maxLength={selectedMode?.maxLength}
            keyboardType={selectedMode?.keyBoardType}
            isImagePickerVisible={this.state.isImagePickerVisible}
            handleImagePickerVisibility={this.handleImagePickerVisibility}
          />
        </ScrollView>
      </View>
    );
  }
}
export default KycScreenMain;

const styles = StyleSheet.create({
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
    // paddingHorizontal: 10
  },
  barViewtext: {
    marginHorizontal: 17,
    color: '#9da3c2',
    fontSize: 12,
    marginTop: 9,
    ...Specs.fontMedium,
  },
  radioButtonView: {
    paddingHorizontal: 15,
  },
  radioKycView: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 7,
    backgroundColor: '#FFF',
  },
  kycFor: {
    ...Specs.fontMedium,
    fontSize: 14,
    color: '#373e73',
    marginLeft: 18,
    marginTop: 10,
  },
});
