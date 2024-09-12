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
import {
  VESTIGE_IMAGE,
  INPUT_COMPONENT_TYPE,
  PICKER_ENUM,
} from 'app/src/utility/constant/Constants';
import { strings } from 'app/src/utility/localization/Localized';
import Banner from 'app/src/screens/Dashboard/Banner';
import CustomInput from 'app/src/components/CustomInput';
import { CustomButton, Checkbox } from 'app/src/components/buttons/Button';
import { showToast, connectedToInternet } from 'app/src/utility/Utility';
import AlertClass from 'app/src/utility/AlertClass';
import { Specs } from 'app/src/utility/Theme';
import Loader from 'app/src/components/loader/Loader';
import { observer, inject } from 'mobx-react';
import moment from 'moment';
import {
  isNameValidator,
  isDistributorIdValidator,
  isPanCardValid,
  isIFSC,
  isSpecialCharacterValidator,
} from 'app/src/utility/Validation/Validation';
import { observable, action } from 'mobx';
import ImageViewer from 'react-native-image-zoom-viewer';
import Icon from 'react-native-vector-icons/Ionicons';
import SignupPickerInput from 'app/src/components/signUpInputComponent/SignupPickerInput';
import { value } from 'jsonpath';
import {
  handleLaunchCamera,
  handlelaunchImageLibrary,
} from '../../services/ImageUpload';
import ImagePickerModal from '../../components/imagePickerModal';

const CAMERA_ICON = require('app/src/assets/images/Kyc/photo_camera.png');
const REMOVE_ICON = require('app/src/assets/images/Kyc/remove_btn.png');

const BANK_FORM_FIELDS = [
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
    fieldName: 'ifsc',
    placeholder: strings.bankPan.pan.ifsc,
    icon: VESTIGE_IMAGE.PROFILE_ICON,
    maxLength: 11,
  },
  {
    fieldName: 'bankName',
    placeholder: strings.bankPan.pan.bankName,
    icon: VESTIGE_IMAGE.PROFILE_ICON,
    maxLength: 20,
  },
  {
    fieldName: 'branchPicker',
    icon: VESTIGE_IMAGE.LOCATION_ICON,
    pickerIcon: VESTIGE_IMAGE.OPEN_PICKER_BUTTON,
  },
  {
    fieldName: 'accountNo',
    placeholder: strings.bankPan.pan.accountNo,
    icon: VESTIGE_IMAGE.PROFILE_ICON,
    //maxLength: 18
  },
  {
    fieldName: 'reEnterAccountNo',
    placeholder: strings.bankPan.pan.reEnterAccountNo,
    icon: VESTIGE_IMAGE.PROFILE_ICON,
    //maxLength: 18
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

const bankFormFields = isBankData => {
  return isBankData
    ? BANK_FORM_FIELDS.filter(item => {
        return item.fieldName !== 'reEnterAccountNo';
      })
    : BANK_FORM_FIELDS;
};

@inject('auth', 'bankPan', 'profile', 'cart')
@observer
class BankForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      distributorId: '',
      firstName: '',
      lastName: '',
      locationId: '',
      countryId: '',
      bankStatus: '',
      ifsc: '',
      bankName: '',
      selectedBranch: '',
      branchCode: '',
      accountNo: '',
      reEnterAccountNo: '',
      accMinLength: '',
      accMaxLength: '',
      bankId: '',
      bankImageName: '',
      imageToShow: '',
      images: [],
      branchPickerVisible: false,
      isBankFieldsDisabled: false,
      isTermsConditionsAccepted: false,
      isTermsAndConditionsModalVisible: false,
      showImageModal: false,
      createdBy: '',
      createdOn: '',
      modifiedBy: '',
      modifiedOn: '',
      isLoading: false,
      isIFSCValid: false,
      isValidDistributerId: true,
      bankBranches: [],
      branchList: [],
      isImagePickerVisible: false,
    };
  }

  componentDidMount() {
    let newState = this.state;
    const { bankData, auth, profile } = this.props;
    if (this.props.submitForValue === 'Self') {
      newState.distributorId = this.props.auth.distributorID;
      if (Object.keys(bankData).length > 1) {
        newState.distributorId = auth.distributorID;
        newState.firstName = profile.firstName;
        newState.lastName = profile.lastName;
        newState.ifsc = bankData.ifscCode;
        newState.bankId = bankData.bankID;
        newState.bankName = bankData.bankName;
        newState.branchCode = bankData.branchCode;
        newState.selectedBranch = bankData.bankBranch;
        newState.accountNo = bankData.bankAccountNumber;
        newState.reEnterAccountNo = bankData.bankAccountNumber;
        newState.countryId = profile.countryId;
        newState.locationId = profile.baseLocationId;
        // newState.bankImageName = bankData.bankImageName;
        newState.images = bankData.bankImageUrl
          ? [{ uri: bankData.bankImageUrl }]
          : [];
        newState.imageToShow = bankData.bankImageUrl;
        newState.bankStatus = bankData.bankStatus;
        newState.isBankFieldsDisabled =
          bankData.bankStatus == '1' ? true : false;
        newState.createdBy = bankData.bankCreatedBy;
        newState.createdOn = bankData.bankCreatedOn;
        newState.modifiedBy = bankData.bankModifiedBy;
        newState.modifiedOn = bankData.bankModifiedOn;

        bankData.bankBranch
          ? (newState.branchList = Array(bankData.bankBranch))
          : null;
        bankData.ifscCode ? (newState.isIFSCValid = true) : null;
      }
      this.setState({ newState });
    }
    this.renderRejectionMessage(bankData.bankStatus, bankData.bankRejectReason);
  }

  renderRejectionMessage = (bankStatus, message) => {
    if (
      bankStatus == '2' &&
      message != '' &&
      message != null &&
      message != undefined
    ) {
      AlertClass.showAlert('Message', message, [
        { text: strings.commonMessages.ok, onPress: () => console.log('ok') },
      ]);
    }
  };

  handleImagePickerVisibility = value => {
    this.setState({ isImagePickerVisible: value });
  };

  updateDocImage = (type, data) => {
    const { images } = this.state;
    type === 'insert'
      ? this.setState({ images: [data] })
      : (images.splice(data, 1),
        this.setState({ images }),
        this.setState({ bankImageName: '' }));
  };

  uploadPhoto = async response => {
    //const { imageLimit } = strings.kyc
    // console.log('resimage', response.data);
    if (response.data.type == 'image/jpeg') {
      let imageToUpload = {
        uri: response?.data?.uri,
        type: response?.data?.type,
        name:
          Platform.OS === 'ios'
            ? `temp_${Math.floor(Date.now() / 1000)}.jpg`
            : response?.data?.fileName,
      };
      const uploadData = new FormData();
      uploadData.append('file', imageToUpload);

      const resUpload = await this.props.bankPan.uploadBankDocument(
        uploadData,
        this.state.distributorId,
        this.state.countryId,
      );
      if (resUpload.success) {
        this.setState({ bankImageName: resUpload.data }, () =>
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

  resetFields = async (fullreset = true) => {
    if (fullreset == true) {
      this.setState({
        firstName: '',
        lastName: '',
        images: [],
        ifsc: '',
        bankName: '',
        selectedBranch: '',
        branchCode: '',
        accountNo: '',
        accMinLength: '',
        accMaxLength: '',
        bankId: '',
        reEnterAccountNo: '',
        countryId: '',
        bankImageName: '',
        branchPickerVisible: false,
        bankStatus: '',
        isBankFieldsDisabled: false,
        isTermsConditionsAccepted: false,
        createdBy: '',
        createdOn: '',
        modifiedBy: '',
        modifiedOn: '',
        isIFSCValid: false,
        bankBranches: [],
        branchList: [],
      });
    } else {
      this.setState({
        images: [],
        ifsc: '',
        bankName: '',
        selectedBranch: '',
        branchCode: '',
        accountNo: '',
        accMinLength: '',
        accMaxLength: '',
        bankId: '',
        reEnterAccountNo: '',
        countryId: '',
        bankImageName: '',
        bankStatus: '',
        isBankFieldsDisabled: false,
        branchPickerVisible: false,
        isTermsConditionsAccepted: false,
        createdBy: '',
        createdOn: '',
        modifiedBy: '',
        modifiedOn: '',
        isIFSCValid: false,
        bankBranches: [],
        branchList: [],
      });
    }
  };

  onChangeText = async (item, value) => {
    this.setState({ [item.fieldName]: value });
    if (item.fieldName === 'distributorId' && value.length == 8) {
      this.setState({ isValidDistributerId: true });
      await this.props.cart.validateDownline(value, undefined, true);
      if (Object.keys(this.props.cart.validatedDownline).length > 1) {
        this.resetFields(false);
        this.setState({
          firstName: this.props.cart.validatedDownline.firstName,
          lastName: this.props.cart.validatedDownline.lastName,
          countryId: this.props.cart.validatedDownline.countryId,
          locationId: this.props.cart.validatedDownline.locationId,
        });
        this.setState({ isValidDistributerId: true });
        const res = await this.props.bankPan.getPanBankDetails(
          this.state.distributorId,
          this.props.profile.countryId,
        );
        if (res.success) {
          this.setState(
            {
              ifsc: res.data.ifscCode,
              bankName: res.data.bankName,
              selectedBranch: res.data.bankBranch,
              branchCode: res.data.branchCode,
              bankId: res.data.bankId,
              accountNo: res.data.bankAccountNumber,
              reEnterAccountNo: res.data.bankAccountNumber,
              // bankImageName : res.data.bankImageName,
              images: res.data.bankImageUrl
                ? [{ uri: res.data.bankImageUrl }]
                : [],
              imageToShow: res.data.bankImageUrl,
              bankStatus: res.data.bankStatus,
              isBankFieldsDisabled: res.data.bankStatus == '1' ? true : false,
              createdBy: res.data.bankCreatedBy,
              createdOn: res.data.bankCreatedOn,
              modifiedBy: res.data.bankModifiedBy,
              modifiedOn: res.data.bankModifiedOn,
            },
            () =>
              this.renderRejectionMessage(
                res.data.bankStatus,
                res.data.bankRejectReason,
              ),
          );
          res.data.bankBranch
            ? this.state.branchList.push(res.data.bankBranch)
            : null;
          res.data.ifscCode ? this.setState({ isIFSCValid: true }) : null;
        } else {
          showToast(res.message);
        }
      } else {
        this.props.auth.distributorID != value
          ? AlertClass.showAlert(
              'Message',
              strings.errorMessage.signUp.distributorError,
              [
                {
                  text: strings.commonMessages.ok,
                  onPress: () => this.resetFields(),
                },
              ],
            )
          : this.resetFields();
      }
    }

    if (item.fieldName === 'ifsc' && value.length == 11) {
      if (isIFSC(value)) {
        const resbankList = await this.props.bankPan.getBankList(
          value,
          this.props.profile.countryId,
        );
        if (resbankList.success) {
          this.setState({
            bankName: resbankList.data.bankName,
            bankId: resbankList.data.bankId,
            selectedBranch: '',
            accountNo: '',
            reEnterAccountNo: '',
            isIFSCValid: true,
            branchList: [],
            bankBranches: [],
          });
          const resBankBranch = await this.props.bankPan.getBankBranches(
            value,
            this.state.bankId,
          );
          if (resBankBranch.success) {
            resBankBranch.data.forEach(branch => {
              this.state.branchList.push(branch.branchName);
            });
            this.setState({ bankBranches: resBankBranch.data });
            if (this.state.bankBranches?.length == 1) {
              this.setState({
                selectedBranch: this.state.bankBranches?.[0].branchName,
                branchCode: this.state.bankBranches?.[0].branchCode,
              });
            }
          }
          const resAccLength = await this.props.bankPan.checkAccNoLength(
            this.state.bankId,
          );
          if (resAccLength.success) {
            this.setState({
              accMaxLength: resAccLength.data.MaxLength,
              accMinLength: resAccLength.data.MinLength,
            });
          }
        } else {
          this.setState({
            bankName: '',
            selectedBranch: '',
            branchCode: '',
            accountNo: '',
            accMinLength: '',
            accMaxLength: '',
            bankId: '',
            reEnterAccountNo: '',
            branchPickerVisible: false,
            isTermsConditionsAccepted: false,
            isIFSCValid: false,
            branchList: [],
            bankBranches: [],
          });
          showToast(strings.bankPan.pan.invalidIfsc);
        }
      } else {
        this.setState({
          bankName: '',
          selectedBranch: '',
          branchCode: '',
          accountNo: '',
          accMinLength: '',
          accMaxLength: '',
          bankId: '',
          reEnterAccountNo: '',
          branchPickerVisible: false,
          isIFSCValid: false,
          branchList: [],
          bankBranches: [],
        });
        showToast(strings.bankPan.pan.invalidIfsc);
      }
    }
  };

  isEditable = item => {
    const { submitForValue } = this.props;
    const { isBankFieldsDisabled } = this.state;
    if (isBankFieldsDisabled)
      return submitForValue !== 'Self' && item.fieldName === 'distributorId'
        ? true
        : false;
    const isEditable =
      (submitForValue === 'Self' && item.fieldName === 'distributorId') ||
      ['bankName', 'firstName', 'lastName'].includes(item.fieldName);
    return isEditable ? false : true;
  };

  UNSAFE_componentWillReceiveProps(nextProps) {
    //if(nextProps.submitForValue !== this.props.submitForValue) {
    if (nextProps.submitForValue === 'Self') {
      const { bankData, profile, auth } = nextProps;
      this.setState(
        {
          distributorId: auth.distributorID,
          firstName: profile.firstName,
          lastName: profile.lastName,
          ifsc: bankData.ifscCode,
          bankName: bankData.bankName,
          bankId: bankData.bankID,
          selectedBranch: bankData.bankBranch,
          branchCode: bankData.branchCode,
          accountNo: bankData.bankAccountNumber,
          reEnterAccountNo: bankData.bankAccountNumber,
          countryId: profile.countryId,
          bankStatus: bankData.bankStatus,
          // bankImageName : bankData.bankImageName,
          images: bankData.bankImageUrl ? [{ uri: bankData.bankImageUrl }] : [],
          imageToShow: bankData.bankImageUrl,
          isBankFieldsDisabled: bankData.bankStatus == '1' ? true : false,
          createdBy: bankData.bankCreatedBy,
          createdOn: bankData.bankCreatedOn,
          modifiedBy: bankData.bankModifiedBy,
          modifiedOn: bankData.bankModifiedOn,
        },
        () =>
          this.renderRejectionMessage(
            bankData.bankStatus,
            bankData.bankRejectReason,
          ),
      );
      bankData.bankBranch
        ? this.setState({ branchList: Array(bankData.bankBranch) })
        : null;
      bankData.ifscCode ? this.setState({ isIFSCValid: true }) : null;
      this.setState({ isValidDistributerId: true });
    } else {
      this.setState({ distributorId: '' });
      this.resetFields();
    }
    //}
  }

  /**
   * @param {*} visible true, false
   */
  openPicker(visible) {
    this.setState({ branchPickerVisible: visible });
  }

  setPickerValue = value => {
    if (value == '' || value == null) {
      this.setState({
        branchPickerVisible: !this.state.branchPickerVisible,
      });
    } else {
      this.setState({
        branchPickerVisible: !this.state.branchPickerVisible,
      });
      this.state.bankBranches.forEach(branch => {
        if (branch.branchName == value) {
          this.setState({
            selectedBranch: branch.branchName,
            branchCode: branch.branchCode,
          });
          return;
        }
      });
    }
  };

  validateImageUpload = () => {
    const { images, bankImageName } = this.state;
    if (this.state.isBankFieldsDisabled) {
      AlertClass.showAlert(
        'Message',
        strings.bankPan.pan.detailsAlreadySubmitted,
        [{ text: strings.commonMessages.ok, onPress: () => console.log('Ok') }],
      );
    } else if (images.length >= 1 && bankImageName) {
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

  renderItem = item => {
    if (item.fieldName === 'file') {
      return (
        <View
          style={{ marginHorizontal: 17, flex: 1, flexDirection: 'column' }}>
          <View style={styles.cameraView}>
            <Text style={styles.cameraViewText}>
              {strings.bankPan.pan.uploadSingleBankImage}
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
            {this.state.images.map((userData, index) => {
              return (
                <View style={styles.imageDisplayView} key={index.toString()}>
                  {this.state.isBankFieldsDisabled ? null : (
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
                        imageToShow: userData.uri,
                        showImageModal: true,
                      })
                    }>
                    <Banner
                      styles={{ flex: 1 }}
                      resizeMode="contain"
                      source={{ uri: userData.uri }}
                    />
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>
      );
    } else if (item.fieldName == 'branchPicker') {
      return (
        <View style={{ marginHorizontal: 7, marginBottom: 2, marginTop: 10 }}>
          <SignupPickerInput
            disabled={this.state.isBankFieldsDisabled ? true : false}
            inputIcon={item.icon}
            iconStyle={styles.iconStyle}
            pickerContainer={styles.pickerContainer}
            pickerInputContainer={styles.pickerInputContainer}
            openPicker={() => this.openPicker(true)}
            pickerText={
              this.state.selectedBranch == null ||
              this.state.selectedBranch == ''
                ? 'Bank Branch'
                : this.state.selectedBranch
            }
            pickerIcon={item.pickerIcon}
            customPickerKey={'branch'}
            cutomPickerDefaultValue={'Select Branch'}
            customPickerVisible={this.state.branchPickerVisible}
            customPickerData={this.state.branchList}
            setPickerValue={this.setPickerValue}
            setPickerVisible={() =>
              this.openPicker(!this.state.branchPickerVisible)
            }
          />
        </View>
      );
    } else if (item.fieldName === 'termsAndConditions') {
      const { isBankFieldsDisabled, isTermsConditionsAccepted } = this.state;
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
            isSelected={isBankFieldsDisabled ? true : isTermsConditionsAccepted}
            getQuantity={() =>
              isBankFieldsDisabled
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
      const infoData = [
        {
          fieldName: 'Created By: ',
          value: this.state.createdBy,
        },
        {
          fieldName: 'Created On: ',
          value: this.state.createdOn,
        },
        {
          fieldName: 'Modified By: ',
          value: this.state.modifiedBy,
        },
        {
          fieldName: 'Modified On: ',
          value: this.state.modifiedOn,
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
            marginHorizontal={17}
            editable={this.isEditable(item)}
            contextMenuHidden={item.fieldName === 'accountNo' ? true : false}
            value={this.state[item.fieldName]}
            onChangeText={value => this.onChangeText(item, value)}
            keyboardType={
              item.fieldName === 'distributorId' ? 'numeric' : 'default'
            }
            maxLength={
              item.fieldName === 'accountNo' ||
              item.fieldName === 'reEnterAccountNo'
                ? this.state.accMaxLength
                  ? Number(this.state.accMaxLength)
                  : 18
                : item.maxLength
            }
          />
        </View>
      );
    }
  };

  isBankFormValid = () => {
    const {
      distributorId,
      ifsc,
      bankName,
      branchCode,
      selectedBranch,
      accountNo,
      reEnterAccountNo,
      accMaxLength,
      accMinLength,
      bankImageName,
      isIFSCValid,
      isValidDistributerId,
    } = this.state;
    if (
      !distributorId ||
      !isDistributorIdValidator(distributorId) ||
      !isValidDistributerId
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
    else if (!ifsc || !isIFSC(ifsc) || !isIFSCValid) {
      return { success: false, message: strings.bankPan.pan.invalidIfsc };
    } else if (!bankName || !isNameValidator(bankName)) {
      return { success: false, message: strings.bankPan.pan.invalidBankName };
    } else if (!selectedBranch || !branchCode) {
      return {
        success: false,
        message: strings.bankPan.pan.invalidBranchNumber,
      };
    } else if (!accountNo || isSpecialCharacterValidator(accountNo)) {
      return {
        success: false,
        message: strings.bankPan.pan.invalidAccountNumber,
      };
    } else if (
      accMaxLength &&
      (accountNo.length > Number(accMaxLength) ||
        accountNo.length < Number(accMinLength))
    ) {
      if (Number(accMinLength) == Number(accMaxLength)) {
        return {
          success: false,
          message: `Account number must be of ${accMinLength} characters.`,
        };
      } else {
        return {
          success: false,
          message: `Account number must be betweeen ${accMinLength}-${accMaxLength} characters.`,
        };
      }
    } else if (!reEnterAccountNo) {
      return {
        success: false,
        message: strings.bankPan.pan.confirmAccountNumber,
      };
    } else if (accountNo !== reEnterAccountNo) {
      return {
        success: false,
        message: strings.bankPan.pan.accountNumberMismatch,
      };
    } else if (!this.state.bankImageName) {
      if (this.state.images?.length > 0) {
        return {
          success: false,
          message: strings.bankPan.pan.reUploadSingleBankImage,
        };
      }
      return {
        success: false,
        message: strings.bankPan.pan.uploadSingleBankImage,
      };
    } else if (!this.state.isTermsConditionsAccepted) {
      return { success: false, message: strings.bankPan.pan.acceptTNC };
    } else {
      return { success: true };
    }
  };

  /**
   * @description To save bank details
   */
  upload = async () => {
    const {
      distributorId,
      ifsc,
      bankName,
      branchCode,
      bankImageName,
      selectedBranch,
      accountNo,
      images,
      isBankFieldsDisabled,
      firstName,
      lastName,
      bankId,
      countryId,
      locationId,
    } = this.state;

    if (isBankFieldsDisabled) {
      return AlertClass.showAlert(
        'Message',
        strings.bankPan.pan.detailsAlreadySubmitted,
        [{ text: 'Ok', onPress: () => console.log('ok') }],
      );
    }

    const bankDetails = {
      distributorId: distributorId,
      firstName: firstName,
      lastName: lastName,
      bankId: bankId,
      ifscCode: ifsc,
      branchCode: branchCode,
      accountNumber: accountNo,
      sourceUserType: '5',
      createdBy: this.props.auth.distributorID,
      locationId: locationId,
      status: '0',
      bankRejectionReasonId: '0',
      bankAppRejDelBy: '0',
      bankModeifiedBy: this.props.auth.distributorID,
      bankChangedFrom: '0',
      bankChangeFields: '0',
      bankImageName: bankImageName,
      dailyFilingNo: '0',
      countryId: countryId,
    };

    const isFormValid = this.isBankFormValid();
    if (isFormValid.success) {
      ///console.log('reqbank',JSON.stringify(bankDetails))
      const resSaveBank = await this.props.bankPan.saveBankDetails(bankDetails);
      if (resSaveBank.success) {
        AlertClass.showAlert(
          'Message',
          resSaveBank.data, //strings.bankPan.pan.uploadedSuccessfully,
          [{ text: 'Ok', onPress: () => this.onSaveSuccessful() }],
        );
      } else {
        AlertClass.showAlert('Message', resSaveBank.message, [
          { text: 'Ok', onPress: () => console.log('ok') },
        ]);
      }
    } else {
      //showToast(isFormValid.message)
      AlertClass.showAlert('Message', isFormValid.message, [
        { text: 'Ok', onPress: () => console.log('ok') },
      ]);
    }
  };

  onSaveSuccessful = async () => {
    const { distributorId } = this.state;
    if (distributorId == this.props.auth.distributorID) {
      this.setState({ distributorId: '' });
      this.resetFields();
      await this.props.fetchPanBank();
    } else {
      this.setState({ distributorId: '' });
      this.resetFields();
    }
  };

  renderListFooter = () => {
    return (
      <CustomButton
        buttonContainer={styles.button}
        disabled={this.state.isBankFieldsDisabled}
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

  getBankStatus = status => {
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

  render() {
    const { isBankFieldsDisabled, bankStatus } = this.state;
    //console.log('res',this.state.branchCode)
    return (
      <View style={styles.container}>
        <Loader
          loading={
            this.state.isLoading ||
            this.props.bankPan.isLoading ||
            this.props.cart.isLoading
          }
        />
        {bankStatus !== null && bankStatus !== '' ? (
          <View style={styles.statusField}>
            <Text style={{ color: '#000000' }}>Status: </Text>
            <Text
              style={[
                styles.statusText,
                { color: bankStatus == '1' ? '#228B22' : '#FF4500' },
              ]}>
              {this.getBankStatus(bankStatus)}
            </Text>
          </View>
        ) : null}
        <FlatList
          removeClippedSubviews={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          data={bankFormFields(isBankFieldsDisabled)}
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
              imageUrls={[{ url: this.state.imageToShow }]}
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

export default BankForm;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  customButtonTitleStyle: {
    fontSize: 14,
    color: '#FFFFFF',
    alignSelf: 'center',
    justifyContent: 'center',
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
  inputItem: {
    paddingBottom: 22,
    paddingTop: 10,
  },
  button: {
    backgroundColor: 'transparent',
    width: '100%',
    marginTop: 10,
  },
  forwardIcon: {
    width: 23,
    height: 20,
    resizeMode: 'contain',
    marginRight: 11,
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
  pickerContainer: {
    marginHorizontal: 18,
    flex: 1,
  },
  pickerInputContainer: {
    flexDirection: 'row',
  },
  iconStyle: {
    marginLeft: 5,
    width: 17,
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
