import React, { Component } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { observer, inject, renderReporter } from 'mobx-react';
import { strings } from 'app/src/utility/localization/Localized';
import CustomInput from 'app/src/components/CustomInput';
import Banner from 'app/src/screens/Dashboard/Banner';
import { Specs } from 'app/src/utility/Theme';
import { VESTIGE_IMAGE } from 'app/src/utility/constant/Constants';
import { CustomButton, Checkbox } from 'app/src/components/buttons/Button';
import {
  handleLaunchCamera,
  handlelaunchImageLibrary,
} from '../../services/ImageUpload';
import ImagePickerModal from '../../components/imagePickerModal';
import moment from 'moment';
import {
  dateFormat,
  compareDates,
  showToast,
  connectedToInternet,
} from 'app/src/utility/Utility';
import AlertClass from 'app/src/utility/AlertClass';
import Loader from 'app/src/components/loader/Loader';
import DateTimePicker from 'react-native-modal-datetime-picker';
import ImageViewer from 'react-native-image-zoom-viewer';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  isNameValidator,
  isDistributorIdValidator,
  isPanCardValid,
} from 'app/src/utility/Validation/Validation';
import { observable, runInAction } from 'mobx';

const CAMERA_ICON = require('app/src/assets/images/Kyc/photo_camera.png');
const REMOVE_ICON = require('app/src/assets/images/Kyc/remove_btn.png');
const CALENDAR_ICON = require('app/src/assets/images/training/calenndarIcon.png');

const PAN_FORM_FIELDS = [
  {
    fieldName: 'distributorId',
    placeholder: strings.bankPan.pan.distributorId,
    icon: VESTIGE_IMAGE.PROFILE_ICON,
    maxLength: 8,
  },
  {
    fieldName: 'firstName',
    placeholder: strings.bankPan.pan.firstName,
    icon: VESTIGE_IMAGE.PROFILE_ICON,
    maxLength: 20,
  },
  {
    fieldName: 'lastName',
    placeholder: strings.bankPan.pan.lastName,
    icon: VESTIGE_IMAGE.PROFILE_ICON,
    maxLength: 20,
  },
  {
    fieldName: 'panNumber',
    placeholder: strings.bankPan.pan.panNumber,
    icon: require('app/src/assets/images/drawer/KYC_Icon.png'),
    maxLength: 10,
  },
  {
    fieldName: 'dob',
    placeholder: strings.bankPan.pan.dob,
    icon: VESTIGE_IMAGE.DOB_ICON,
  },
  {
    fieldName: 'file',
    placeholder: strings.bankPan.pan.dob,
  },
  {
    fieldName: 'termsAndConditions',
  },
  {
    fieldName: 'infoFields',
  },
];

@inject('auth', 'bankPan', 'profile', 'cart')
@observer
class PanForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: 'PAN Form',
      distributorId: '',
      firstName: '',
      lastName: '',
      panNumber: '',
      dob: '',
      images: [],
      panImageName: '',
      selectedModalImage: '',
      countryId: '',
      locationId: '',
      panStatus: '',
      isTermsConditionsAccepted: false,
      isTermsAndConditionsModalVisible: false,
      isPanFieldsDisabled: false,
      showImageModal: false,
      isDatePickerVisible: false,
      createdBy: '',
      createdOn: '',
      modifiedBy: '',
      modifiedOn: '',
      isValidDistributerId: true,
      isImagePickerVisible: false,
    };
    this.loggedInUserDOB = moment(this.props.profile.dob).format('DD/MM/YYYY');
  }

  componentDidMount() {
    if (this.props.submitForValue === 'Self') {
      const { panData, profile, auth } = this.props;
      this.setState(
        {
          distributorId: auth.distributorID,
          firstName: profile.firstName,
          lastName: profile.lastName,
          panNumber: panData.panNumber,
          dob: panData.distributorDOB
            ? panData.distributorDOB
            : this.loggedInUserDOB,
          panStatus: panData.panStatus,
          isPanFieldsDisabled: panData.panStatus == '1' ? true : false,
          countryId: profile.countryId,
          locationId: profile.baseLocationId,
          // panImageName: panData.panImageName,
          images: panData.panImageUrl ? [{ uri: panData.panImageUrl }] : [],
          selectedModalImage: panData.panImageUrl,
          createdBy: panData.panCreatedBy,
          createdOn: panData.panCreatedOn,
          modifiedBy: panData.panModifiedBy,
          modifiedOn: panData.panModifiedOn,
        },
        async () =>
          this.renderRejectionMessage(
            panData.panStatus,
            panData.panRejectReason,
          ),
      );
    }
  }

  handleImagePickerVisibility = value => {
    this.setState({ isImagePickerVisible: value });
  };

  formatedDate = date => {
    let dateToFormat = date.split(/\//);
    let dateJoin = [dateToFormat[2], dateToFormat[1], dateToFormat[0]].join(
      '-',
    );
    let dateToSend = new Date(dateJoin);
    //console.log('ressss',dateToSend)
    return dateToSend;
  };

  renderRejectionMessage = (panStatus, message) => {
    if (
      panStatus == '2' &&
      message != '' &&
      message != null &&
      message != undefined
    ) {
      AlertClass.showAlert('Message', message, [
        { text: strings.commonMessages.ok, onPress: () => console.log('ok') },
      ]);
    }
  };

  handleDatePicker = date => {
    let age = compareDates(date);
    if (age.years > 17) {
      this.setState({
        dob: moment(dateFormat(date), 'DD MMM YYYY').format('DD/MM/YYYY'),
        isDatePickerVisible: false,
      });
    } else {
      this.setState({ isDatePickerVisible: false }, () => {
        showToast(strings.bankPan.pan.ageLimitError);
      });
    }
  };

  onChangeText = async (item, value) => {
    this.setState({ [item.fieldName]: value }, async () => {
      if (item.fieldName === 'distributorId' && value.length == 8) {
        this.setState({ isValidDistributerId: false });
        await this.props.cart.validateDownline(
          this.state.distributorId,
          undefined,
          true,
        );
        if (Object.keys(this.props.cart.validatedDownline).length > 1) {
          this.resetFields(false);
          const selectedDownlineDOB = moment(
            this.props.cart.validatedDownline.distributorDOB,
          ).format('DD/MM/YYYY');
          this.setState({
            firstName: this.props.cart.validatedDownline.firstName,
            lastName: this.props.cart.validatedDownline.lastName,
            countryId: this.props.cart.validatedDownline.countryId,
            locationId: this.props.cart.validatedDownline.locationId,
            dob: selectedDownlineDOB,
          });
          this.setState({ isValidDistributerId: true });
          const res = await this.props.bankPan.getPanBankDetails(
            this.state.distributorId,
            this.props.profile.countryId,
          );
          if (res.success) {
            this.setState(
              {
                panNumber: res.data.panNumber,
                dob: res.data.distributorDOB
                  ? res.data.distributorDOB
                  : selectedDownlineDOB,
                panStatus: res.data.panStatus,
                isPanFieldsDisabled: res.data.panStatus == '1' ? true : false,
                // panImageName: res.data.panImageName,
                images: res.data.panImageUrl
                  ? [{ uri: res.data.panImageUrl }]
                  : [],
                selectedModalImage: res.data.panImageUrl,
                createdBy: res.data.panCreatedBy,
                createdOn: res.data.panCreatedOn,
                modifiedBy: res.data.panModifiedBy,
                modifiedOn: res.data.panModifiedOn,
                isTermsConditionsAccepted: false,
              },
              () =>
                this.renderRejectionMessage(
                  res.data.panStatus,
                  res.data.panRejectReason,
                ),
            );
          } else {
            showToast(res.message);
          }
        } else {
          if (this.props.auth.distributorID != value) {
            AlertClass.showAlert(
              'Message',
              strings.errorMessage.signUp.distributorError,
              [
                {
                  text: strings.commonMessages.ok,
                  onPress: () => console.log('ok'),
                },
              ],
            );
          }
          this.setState({
            firstName: '',
            lastName: '',
            panStatus: '',
            panNumber: '',
            dob: '',
            countryId: '',
            locationId: '',
            images: [],
            panImageName: '',
            isPanFieldsDisabled: false,
            isTermsConditionsAccepted: false,
            createdBy: '',
            createdOn: '',
            modifiedBy: '',
            modifiedOn: '',
          });
        }
      }
    });
  };

  isEditable = item => {
    if (this.state.isPanFieldsDisabled) {
      return false;
    } else if (
      (item.fieldName === 'firstName' || item.fieldName === 'lastName') &&
      this.props.submitForValue !== 'Self'
    ) {
      return false;
    } else if (
      (item.fieldName === 'firstName' ||
        item.fieldName === 'lastName' ||
        item.fieldName === 'distributorId') &&
      this.props.submitForValue == 'Self'
    ) {
      return false;
    }
    return true;
  };

  updateDocImage = (type, data) => {
    const { images } = this.state;
    type === 'insert'
      ? this.setState({ images: [data] })
      : (images.splice(data, 1),
        this.setState({ images }),
        this.setState({ panImageName: '' }));
  };

  UNSAFE_componentWillReceiveProps(nextProps) {
    //if(nextProps.submitForValue !== this.props.submitForValue) {
    if (nextProps.submitForValue === 'Self') {
      const { panData, profile, auth } = nextProps;
      this.setState(
        {
          distributorId: auth.distributorID,
          firstName: profile.firstName,
          lastName: profile.lastName,
          panNumber: panData.panNumber,
          dob: panData.distributorDOB
            ? panData.distributorDOB
            : this.loggedInUserDOB,
          panStatus: panData.panStatus,
          isPanFieldsDisabled: panData.panStatus == '1' ? true : false,
          countryId: profile.countryId,
          locationId: profile.baseLocationId,
          // panImageName: panData.panImageName,
          images: panData.panImageUrl ? [{ uri: panData.panImageUrl }] : [],
          selectedModalImage: panData.panImageUrl,
          createdBy: panData.panCreatedBy,
          createdOn: panData.panCreatedOn,
          modifiedBy: panData.panModifiedBy,
          modifiedOn: panData.panModifiedOn,
        },
        async () =>
          this.renderRejectionMessage(
            panData.panStatus,
            panData.panRejectReason,
          ),
      );
      this.setState({ isValidDistributerId: true });
    } else {
      this.resetFields(true);
    }
    //}
    if (nextProps.panNumber !== this.props.panNumber) {
      this.setState({
        panNumber: nextProps.panNumber,
        panStatus: nextProps.panStatus,
        dob: nextProps.distributorDOB,
        isPanFieldsDisabled: nextProps.isPanFieldsDisabled,
      });
    }
  }

  resetFields = isFullReset => {
    if (isFullReset === true) {
      this.setState({
        firstName: '',
        lastName: '',
        distributorId: '',
        panStatus: '',
        panNumber: '',
        dob: '',
        countryId: '',
        locationId: '',
        images: [],
        selectedModalImage: '',
        panImageName: '',
        createdBy: '',
        createdOn: '',
        modifiedBy: '',
        modifiedOn: '',
        isTermsConditionsAccepted: false,
        isPanFieldsDisabled: false,
      });
    } else {
      this.setState({
        isPanFieldsDisabled: false,
        panStatus: '',
        panNumber: '',
        dob: '',
        countryId: '',
        locationId: '',
        images: [],
        panImageName: '',
        isTermsConditionsAccepted: false,
        createdBy: '',
        createdOn: '',
        modifiedBy: '',
        modifiedOn: '',
      });
    }
  };

  validateImageUpload = () => {
    const { images, panImageName } = this.state;
    if (this.state.isPanFieldsDisabled) {
      AlertClass.showAlert(
        'Message',
        strings.bankPan.pan.detailsAlreadySubmitted,
        [{ text: strings.commonMessages.ok, onPress: () => console.log('Ok') }],
      );
    } else if (images.length >= 1 && panImageName) {
      AlertClass.showAlert(
        'Message',
        strings.bankPan.pan.singleImageUploadError,
        [{ text: strings.commonMessages.ok, onPress: () => console.log('Ok') }],
      );
    } else {
      this.handleImagePickerVisibility(true);
    }
  };

  onCameraOptionPress = async () => {
    this.handleImagePickerVisibility(false);
    setTimeout(async () => {
      const result = await handleLaunchCamera();
      if (result?.success) {
        this.uploadPhoto(result);
      }
    }, 500);
  };

  onImageLibraryPress = async () => {
    this.handleImagePickerVisibility(false);
    setTimeout(async () => {
      const result = await handlelaunchImageLibrary();
      if (result?.success) {
        this.uploadPhoto(result);
      }
    }, 500);
  };

  uploadPhoto = async response => {
    //const { imageLimit } = strings.kyc
    if (response?.data?.type == 'image/jpeg') {
      let imageToUpload = {
        uri: response?.data?.uri,
        type: response?.data?.type,
        name:
          Platform.OS === 'ios'
            ? `temp_${Math.floor(Date.now() / 1000)}.jpg`
            : response?.data?.fileName,
      };
      const uploadData = new FormData();
      uploadData.append('file1', imageToUpload);

      const resUpload = await this.props.bankPan.uploadPanDocument(
        uploadData,
        this.state.distributorId,
        this.state.countryId,
      );
      if (resUpload.success) {
        this.setState({ panImageName: resUpload.data }, () =>
          this.updateDocImage('insert', response?.data),
        );
      } else {
        showToast(
          resUpload.message
            ? resUpload.message
            : 'Something went wrong, please try again',
        );
      }
    } else {
      AlertClass.showAlert(
        'Message',
        'You can upload only .jpg or.jpeg type image.',
        [
          {
            text: strings.commonMessages.ok,
            onPress: () => console.log('Ok'),
          },
        ],
      );
    }
  };

  isPanFormValid = () => {
    if (
      !this.state.distributorId ||
      !isDistributorIdValidator(
        this.state.distributorId || !this.state.isValidDistributerId,
      )
    ) {
      return {
        success: false,
        message: strings.bankPan.pan.invalidDistributorId,
      };
    } else if (!this.state.firstName) {
      return { success: false, message: strings.bankPan.pan.invalidFirstName };
    }
    // else if(!this.state.lastName) {
    //   return  { success: false, message: strings.bankPan.pan.invalidLastName }
    // }
    else if (!this.state.panNumber || !isPanCardValid(this.state.panNumber)) {
      return { success: false, message: strings.bankPan.pan.invalidPan };
    } else if (!this.state.dob) {
      return { success: false, message: strings.bankPan.pan.emptyDob };
    } else if (!this.state.panImageName) {
      if (this.state.images?.length > 0) {
        return { success: false, message: strings.bankPan.pan.reUploadPan };
      }
      return { success: false, message: strings.bankPan.pan.uploadPan };
    } else if (!this.state.isTermsConditionsAccepted) {
      return { success: false, message: strings.bankPan.pan.acceptTNC };
    } else {
      return { success: true };
    }
  };

  upload = async () => {
    const {
      panNumber,
      firstName,
      lastName,
      dob,
      isPanFieldsDisabled,
      distributorId,
      locationId,
      countryId,
      panImageName,
    } = this.state;
    //const params = `?distributorId=${distributorId}&panNumber=${panNumber}&firstName=${firstName}&lastName=${lastName}&dob=${dobIsoString}&panStatus=pending`
    // let kyc = [];
    // this.state.images.map((data,index) => {
    //   kyc[index] = {
    //     uri: data.uri,
    //     type: data.type,
    //     name: data.fileName,
    //   }
    // });

    // const form = new FormData();
    // form.append('file1', kyc[0]);
    // //form.append('file2',kyc[1]);
    const panDetails = {
      distributorId: distributorId,
      firstName: firstName,
      lastName: lastName,
      dob: dob,
      panNo: panNumber,
      sourceUserType: '5',
      createdBy: this.props.auth.distributorID,
      locationId: locationId,
      status: '0',
      panRejectReasonId: '0',
      appRejTerBy: '0',
      modifiedBy: this.props.auth.distributorID,
      changedFromVerifiedMaster: '0',
      changedFields: '0',
      panImageName: panImageName,
      countryId: countryId,
    };

    if (isPanFieldsDisabled) {
      AlertClass.showAlert(
        'Message',
        strings.bankPan.pan.detailsAlreadySubmitted,
        [{ text: 'Ok', onPress: () => console.log('ok') }],
      );
    } else {
      const isFormValid = this.isPanFormValid();
      if (isFormValid.success) {
        const resSavePan = await this.props.bankPan.savePanDetails(panDetails);
        if (resSavePan.success) {
          AlertClass.showAlert(
            'Message',
            resSavePan.data, //strings.bankPan.pan.uploadedSuccessfully,
            [{ text: 'Ok', onPress: () => this.onSaveSuccessful() }],
          );
        } else {
          AlertClass.showAlert('Message', resSavePan.message, [
            { text: 'Ok', onPress: () => console.log('ok') },
          ]);
        }
      } else {
        AlertClass.showAlert('Message', isFormValid.message, [
          { text: 'Ok', onPress: () => console.log('ok') },
        ]);
      }
    }
  };

  onSaveSuccessful = async () => {
    const { distributorId } = this.state;
    if (distributorId == this.props.auth.distributorID) {
      this.resetFields(true);
      await this.props.fetchPanBank();
    } else {
      this.resetFields(true);
    }
  };

  renderListFooter = () => {
    return (
      <CustomButton
        buttonContainer={styles.button}
        disabled={this.state.isPanFieldsDisabled}
        handleClick={async () => {
          const isConnectedToInternet = await connectedToInternet();
          if (isConnectedToInternet) {
            this.upload();
          } else {
            showToast(strings.commonMessages.noInternet);
          }
        }}
        linearGradient
        buttonTitle={strings.kyc.docType.bank.submitButtonTitle}
        primaryColor="#6895d4"
        secondaryColor="#57a5cf"
        buttonTitleStyle={styles.customButtonTitleStyle}
      />
    );
  };

  getPanStatus = status => {
    if (status == '1') {
      return 'VERIFIED';
    } else if (status == '0') {
      return 'PENDING';
    } else if (status == '2') {
      return 'REJECTED';
    } else if (status == '3') {
      return 'DELETED';
    }
  };

  renderItem = item => {
    if (item.fieldName === 'file') {
      return (
        <View
          style={{ marginHorizontal: 17, flex: 1, flexDirection: 'column' }}>
          <View style={styles.cameraView}>
            <Text style={styles.cameraViewText}>
              {strings.bankPan.pan.uploadPan}
            </Text>
            <TouchableOpacity onPress={() => this.validateImageUpload()}>
              <Banner
                styles={styles.forwardIcon}
                resizeMode="contain"
                source={CAMERA_ICON}
              />
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', flex: 1, paddingVertical: 10 }}>
            {this.state.images.map((userdata, index) => {
              return (
                <View style={styles.imageDisplayView} key={index.toString()}>
                  {this.state.isPanFieldsDisabled ? null : (
                    <TouchableOpacity
                      onPress={() => this.updateDocImage('delete', index)}
                      style={styles.crossIconView}>
                      <Banner
                        styles={{ height: 20, width: 20 }}
                        resizeMode="contain"
                        source={REMOVE_ICON}
                      />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={{ width: '75%', height: '100%' }}
                    onPress={() =>
                      this.setState({
                        selectedModalImage: userdata.uri,
                        showImageModal: true,
                      })
                    }>
                    <Banner
                      styles={{ flex: 1 }}
                      resizeMode="contain"
                      source={{ uri: userdata.uri }}
                    />
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>
      );
    } else if (item.fieldName === 'dob') {
      return (
        <TouchableOpacity
          style={styles.datePicker}
          onPress={() =>
            !this.state.isPanFieldsDisabled
              ? this.setState({ isDatePickerVisible: true })
              : null
          }>
          <Image source={CALENDAR_ICON} style={{ marginHorizontal: 3 }} />
          <Text
            style={[
              styles.textDatePicker,
              { color: this.state.isPanFieldsDisabled ? '#C8C8C8' : '#000000' },
            ]}>
            {this.state.dob ? this.state.dob : 'DOB'}
          </Text>
          <DateTimePicker
            isVisible={this.state.isDatePickerVisible}
            onConfirm={this.handleDatePicker}
            onCancel={() => this.setState({ isDatePickerVisible: false })}
            mode="date"
            date={
              this.state.dob ? this.formatedDate(this.state.dob) : new Date()
            }
            maximumDate={new Date()}
            is24hour
          />
        </TouchableOpacity>
      );
    } else if (item.fieldName === 'termsAndConditions') {
      const { isPanFieldsDisabled, isTermsConditionsAccepted } = this.state;
      return (
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            marginHorizontal: 15,
            paddingHorizontal: 10,
          }}>
          <Checkbox
            label={strings.errorMessage.signUp.agreeTNCTitle}
            overrideStyles={{ marginRight: 0, marginLeft: 0 }}
            isSelected={isPanFieldsDisabled ? true : isTermsConditionsAccepted}
            getQuantity={() =>
              isPanFieldsDisabled
                ? null
                : this.setState({
                    isTermsConditionsAccepted:
                      !this.state.isTermsConditionsAccepted,
                  })
            }
          />
          <Text
            style={{
              marginLeft: 3,
              borderBottomWidth: 0.8,
              paddingRight: 0,
              paddingTop: 1,
            }}
            onPress={() =>
              this.setState({ isTermsAndConditionsModalVisible: true })
            }>
            {strings.errorMessage.signUp.termsNConditions}
          </Text>
        </View>
      );
    } else if (item.fieldName === 'infoFields') {
      const { createdBy, createdOn, modifiedBy, modifiedOn } = this.state;
      let infoData = [
        {
          fieldName: 'Pan Created By: ',
          value: createdBy,
        },
        {
          fieldName: 'Pan Created On: ',
          value: createdOn,
        },
        {
          fieldName: 'Pan Modified By: ',
          value: modifiedBy,
        },
        {
          fieldName: 'Pan Modified On: ',
          value: modifiedOn,
        },
      ];
      return (
        <View style={styles.infoFields}>
          {infoData.map((item, index) => {
            if (item.value) {
              return (
                <View
                  style={{ flexDirection: 'row', marginVertical: 10 }}
                  key={index.toString()}>
                  <Text style={styles.statusText}>{item.fieldName}</Text>
                  <Text style={[styles.statusText, { color: 'red' }]}>
                    {item.value}
                  </Text>
                </View>
              );
            }
          })}
        </View>
      );
    } else {
      return (
        <View style={styles.inputItem}>
          <CustomInput
            placeholder={item.placeholder}
            icon={item.icon}
            iconStyle={styles.iconStyle}
            editable={this.isEditable(item)}
            marginHorizontal={17}
            value={this.state[item.fieldName]}
            onChangeText={value => this.onChangeText(item, value)}
            keyboardType={
              item.fieldName === 'distributorId' ? 'numeric' : 'default'
            }
            maxLength={item.maxLength}
          />
        </View>
      );
    }
  };

  render() {
    const { panStatus } = this.state;
    return (
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <Loader
          loading={this.props.bankPan.isLoading || this.props.cart.isLoading}
        />
        {panStatus !== null && panStatus !== '' ? (
          <View style={styles.statusField}>
            <Text style={{ color: '#000000' }}>Status: </Text>
            <Text
              style={[
                styles.statusText,
                { color: panStatus == '1' ? '#228B22' : '#FF4500' },
              ]}>
              {this.getPanStatus(panStatus)}
            </Text>
          </View>
        ) : null}
        <FlatList
          contentContainerStyle={{ paddingBottom: 20 }}
          data={PAN_FORM_FIELDS}
          extraData={this.state}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => this.renderItem(item)}
          keyExtractor={(item, index) => index.toString()}
          ListFooterComponent={() => this.renderListFooter()}
        />
        <Modal
          animationType="slide"
          visible={this.state.isTermsAndConditionsModalVisible}
          transparent
          onRequestClose={() =>
            this.setState({ isTermsAndConditionsModalVisible: false })
          }>
          <View style={styles.mainContainerInfo}>
            <View style={[styles.containerInfo]}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  marginVertical: 15,
                }}>
                <Text style={styles.headingText}>
                  {strings.errorMessage.signUp.termsNConditions}
                </Text>
              </View>
              <ScrollView>
                <ScrollView>
                  <Text style={{ ...Specs.fontRegular }}>
                    {strings.bankPan.pan.termsAndConditions}
                  </Text>
                </ScrollView>
                <CustomButton
                  handleClick={() =>
                    this.setState({ isTermsAndConditionsModalVisible: false })
                  }
                  linearGradient
                  buttonContainer={styles.button}
                  buttonTitle="OK"
                  buttonTitleStyle={styles.customButtonTitleStyle}
                  primaryColor="#58cdb4"
                  secondaryColor="#58cdb4"
                />
              </ScrollView>
            </View>
          </View>
        </Modal>
        <Modal
          visible={this.state.showImageModal}
          transparent
          onRequestClose={() => {
            this.setState({ showImageModal: false });
          }}>
          <View style={{ flex: 1 }}>
            <TouchableOpacity
              style={styles.closeIcon}
              onPress={() => this.setState({ showImageModal: false })}>
              <Icon name="ios-close" size={34} color="#8D98A3" />
            </TouchableOpacity>
            <ImageViewer
              imageUrls={[{ url: this.state.selectedModalImage }]}
              enableSwipeDown
              enableImageZoom={false}
              backgroundColor="rgba(0,0,0,0.5)"
              onCancel={() => this.setState({ showImageModal: false })}
            />
          </View>
        </Modal>
        <ImagePickerModal
          isVisible={this.state.isImagePickerVisible}
          onCameraPress={this.onCameraOptionPress}
          onLibraryPress={this.onImageLibraryPress}
          setModalVisiblility={this.handleImagePickerVisibility}
        />
      </View>
    );
  }
}

export default PanForm;

const styles = StyleSheet.create({
  inputItem: {
    paddingBottom: 22,
    paddingTop: 10,
  },
  button: {
    backgroundColor: 'transparent',
    width: '100%',
    marginTop: 10,
  },
  statusField: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 17,
    paddingHorizontal: 8,
    borderRadius: 20,
    height: 30,
    width: 140,
    backgroundColor: '#EFF3F7',
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  forwardIcon: {
    width: 23,
    height: 20,
    resizeMode: 'contain',
    marginRight: 11,
  },
  customButtonTitleStyle: {
    fontSize: 14,
    color: '#FFFFFF',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  cameraView: {
    borderWidth: 1,
    height: 37,
    alignItems: 'center',
    borderColor: '#c8c9d3',
    marginTop: 9,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  cameraViewText: {
    color: '#9da3c2',
    fontSize: 10,
    marginLeft: 11,
    ...Specs.fontMedium,
  },
  imageDisplayView: {
    width: '45%',
    height: 120,
    backgroundColor: '#ffffff',
  },
  crossIconView: {
    height: 20,
    width: 20,
    position: 'absolute',
    zIndex: 2,
    marginLeft: '87%',
  },
  datePicker: {
    flexDirection: 'row',
    marginVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#c8c9d3',
    padding: 5,
    paddingBottom: 15,
    marginHorizontal: 15,
  },
  textDatePicker: {
    marginHorizontal: 9,
    paddingLeft: 15,
    borderLeftWidth: 0.5,
    borderLeftColor: '#c8c9d3',
    color: '#3f4967',
  },
  iconStyle: {
    marginLeft: 5,
    width: 20,
    alignSelf: 'center',
    resizeMode: 'contain',
  },
  mainContainerInfo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00000040',
  },
  containerInfo: {
    width: Dimensions.get('window').width - 30,
    marginTop: 120,
    paddingHorizontal: 20,
    marginBottom: 120,
    backgroundColor: 'white',
    borderRadius: 4,
  },
  headingText: {
    color: '#3f5886',
    fontSize: 20,
    ...Specs.fontSemiBold,
    textAlign: 'center',
  },
  closeIcon: {
    height: 32,
    width: 32,
    borderRadius: 16,
    backgroundColor: 'white',
    alignItems: 'center',
    position: 'absolute',
    justifyContent: 'center',
    right: 16,
    top: 80,
    opacity: 1,
    zIndex: 30,
  },
  infoFields: {
    flex: 1,
    marginVertical: 15,
    marginHorizontal: 17,
    paddingHorizontal: 10,
    backgroundColor: '#EFF3F7',
    borderRadius: 20,
  },
});
