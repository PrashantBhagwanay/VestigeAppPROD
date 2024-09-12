import React, { Component } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Text,
  ScrollView,
  Platform,
} from 'react-native';
import { observer, inject } from 'mobx-react';
import { observable, makeObservable } from 'mobx';
import HeaderLeftIcons from 'app/src/components/navigation/HeaderLeftIcons';
import { Specs } from 'app/src/utility/Theme';
import Loader from 'app/src/components/loader/Loader';
import { VESTIGE_IMAGE } from 'app/src/utility/constant/Constants';
import { strings } from 'app/src/utility/localization/Localized';
import { CustomButton, RadioButton } from 'app/src/components/buttons/Button';
import { showToast, connectedToInternet } from 'app/src/utility/Utility';
import CustomInput from 'app/src/components/CustomInput';
import { Icon } from 'react-native-elements';
import Banner from 'app/src/screens/Dashboard/Banner';
import AlertClass from 'app/src/utility/AlertClass';
import {
  isNameValidator,
  isDistributorIdValidator,
} from 'app/src/utility/Validation/Validation';
import ImagePickerModal from '../../components/imagePickerModal';
import { Header } from '../../components';
import {
  handleLaunchCamera,
  handlelaunchImageLibrary,
} from '../../services/ImageUpload';

const CAMERA_OPTIONS = {
  mediaType: 'photo',
};

const DAF_FORM = [
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
  {
    fieldName: 'file',
    placeholder: strings.bankPan.pan.dob,
  },
];

@inject('cart', 'profile', 'auth', 'bankPan')
@observer
class Daf extends Component {
  @observable isValidDistributerId = true;
  @observable isFormFilled = false;

  constructor(props) {
    super(props);
    makeObservable(this);
    this.state = {
      documentType: null,
      isImagePickerVisible: false,
      selectedLabel: 'Self',
      images: [],
      distributorId: this.props.auth.distributorID,
      distributorName: this.props.profile.username,
      signedDafFile: null,
      signedIDProof: null,
    };
  }

  isFormValid = () => {
    const { distributorId, distributorName, signedDafFile, signedIDProof } =
      this.state;
    const { isValidDistributerId } = this;
    if (
      !distributorId ||
      !isDistributorIdValidator(distributorId) ||
      !isValidDistributerId
    ) {
      return { success: false, message: strings.daf.invalidDistributorId };
    } else if (!distributorName) {
      return { success: false, message: strings.daf.invalidName };
    } else if (!signedDafFile || !signedIDProof) {
      return { success: false, message: strings.daf.uploadRequiredDocs };
    } else {
      return { success: true };
    }
  };

  upload = async () => {
    const { distributorId, signedDafFile, signedIDProof } = this.state;

    if (this.isFormFilled) {
      return AlertClass.showAlert(
        'Message',
        strings.daf.detailsAlreadyUploaded,
        [{ text: 'Ok', onPress: () => this.props.navigation.pop() }],
      );
    }

    const isFormValid = this.isFormValid();
    const form = new FormData();
    if (isFormValid.success) {
      form.append('file1', {
        uri: signedDafFile?.uri,
        type: signedDafFile?.type,
        name: signedDafFile?.fileName,
      });
      form.append('file2', {
        uri: signedIDProof?.uri,
        type: signedIDProof?.type,
        name: signedIDProof?.fileName,
      });
      form.append('distributorId', distributorId);
      const res = await this.props.bankPan.dafUpload(form);
      if (res.success) {
        AlertClass.showAlert('Message', res.message, [
          { text: 'Ok', onPress: () => this.props.navigation.pop() },
        ]);
      } else {
        showToast(res.message);
      }
    } else {
      showToast(isFormValid.message);
    }
  };

  renderListFooter = () => {
    return (
      <CustomButton
        buttonContainer={styles.button}
        handleClick={async () => {
          const isConnectedToInternet = await connectedToInternet();
          if (isConnectedToInternet) {
            this.upload();
          } else {
            showToast(strings.commonMessages.noInternet);
          }
        }}
        linearGradient
        buttonTitle={strings.daf.submitBtn}
        primaryColor="#6895d4"
        secondaryColor="#57a5cf"
        buttonTitleStyle={styles.customButtonTitleStyle}
      />
    );
  };

  updateDocImage = (type, data) => {
    console.log('check 1', type, modData)
    const modData = { ...data };
    if (Platform.OS === 'ios') {
      modData.fileName = `Daf_${Math.floor(Date.now() / 1000)}.jpg`;
    }
    console.log('check 2', type, modData)
    this.setState({
      [type]: modData,
    });
  };

  isEditable = item => {
    const { selectedLabel } = this.state;
    const isDisabled =
      (selectedLabel === 'Self' &&
        ['distributorId', 'distributorName'].includes(item.fieldName)) ||
      'distributorName' === item.fieldName;
    return !isDisabled;
  };

  onChangeText = async (item, value) => {
    this.setState({ [item.fieldName]: value });
    if (item.fieldName === 'distributorId' && value.length == 8) {
      this.isValidDistributerId = false;
      await this.props.cart.validateDownline(value, undefined, true);
      if (Object.keys(this.props.cart.validatedDownline).length > 1) {
        this.isValidDistributerId = true;
        const distName = `${this.props.cart.validatedDownline.firstName} ${this.props.cart.validatedDownline.lastName}`;
        this.setState({
          distributorName: distName,
        });
      } else {
        showToast(strings.daf.invalidDistributorId);
      }
    }
  };

  handleImagePickerVisibility = value => {
    this.setState({ isImagePickerVisible: value });
  };

  validateImageUpload = data => {
    this.setState({
      documentType: data,
    });
    this.handleImagePickerVisibility(true);
  };

  onCameraOptionPress = async () => {
    this.handleImagePickerVisibility(false);
    setTimeout(async () => {
      const result = await handleLaunchCamera();
      if (result?.success) {
        this.updateDocImage(this.state.documentType, result?.data);
      }
    }, 500);
  };

  onImageLibraryPress = async () => {
    this.handleImagePickerVisibility(false);
    setTimeout(async () => {
      const result = await handlelaunchImageLibrary();
      if (result?.success) {
        this.updateDocImage(this.state.documentType, result?.data);
      }
    }, 500);
  };

  renderItem = item => {
    console.log('check', this.state.signedDafFile)
    if (item.fieldName === 'file') {
      return (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            marginHorizontal: 10,
            marginBottom: 10,
          }}>
          {this.state.signedDafFile ? (
            <Banner
              styles={styles.imageDoc}
              resizeMode="contain"
              source={{ uri: this.state.signedDafFile?.uri }}
            />
          ) : (
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={() => this.validateImageUpload('signedDafFile')}>
              <Icon
                name="cloud-upload"
                type="simple-line-icon"
                color="#979797"
                size={20}
              />
              <Text style={[styles.uploadText, { paddingTop: 20 }]}>
                {strings.daf.uploadSignedDafFile}
              </Text>
            </TouchableOpacity>
          )}
          {this.state.signedIDProof ? (
            <Banner
              styles={styles.imageDoc}
              resizeMode="contain"
              source={{ uri: this.state.signedIDProof?.uri }}
            />
          ) : (
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={() => this.validateImageUpload('signedIDProof')}>
              <Icon
                name="cloud-upload"
                type="simple-line-icon"
                color="#979797"
                size={20}
              />
              <Text style={[styles.uploadText, { paddingTop: 16 }]}>
                {strings.daf.uploadNotes}
              </Text>
            </TouchableOpacity>
          )}
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
    const { selectedLabel } = this.state;
    const { distributorID } = this.props.auth;
    const { username } = this.props.profile;
    return (
      <ScrollView>
        <Loader
          loading={this.props.cart.isLoading || this.props.bankPan.isLoading}
        />
        <Header
          navigation={this.props.navigation}
          screenTitle={strings.daf.headerTitle}
        />
        <View style={styles.radioButtonView}>
          <RadioButton
            buttonText="Self"
            onPress={() => {
              if (this.state.selectedLabel !== 'Self') {
                this.setState({
                  selectedLabel: 'Self',
                  distributorId: distributorID,
                  distributorName: username,
                  signedDafFile: null,
                  signedIDProof: null,
                });
              }
            }}
            selectedValue={selectedLabel}
          />
          <RadioButton
            buttonText="Downline"
            onPress={() => {
              if (this.state.selectedLabel !== 'Downline') {
                this.setState({
                  selectedLabel: 'Downline',
                  distributorId: '',
                  distributorName: '',
                  signedIDProof: null,
                  signedDafFile: null,
                });
              }
            }}
            selectedValue={selectedLabel}
          />
        </View>
        <FlatList
          contentContainerStyle={{ paddingBottom: 20, backgroundColor: '#FFF' }}
          data={DAF_FORM}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => this.renderItem(item)}
          keyExtractor={(item, index) => index.toString()}
          ListFooterComponent={() => this.renderListFooter()}
        />
        <View style={{ padding: 10 }}>
          <Text style={{ marginBottom: 10 }}>Note:</Text>
          <Text>{strings.daf.uploadPointOne}</Text>
          <Text>{strings.daf.uploadPointTwo}</Text>
        </View>
        <ImagePickerModal
          isVisible={this.state.isImagePickerVisible}
          onCameraPress={this.onCameraOptionPress}
          onLibraryPress={this.onImageLibraryPress}
          setModalVisiblility={this.handleImagePickerVisibility}
        />
      </ScrollView>
    );
  }
}

export default Daf;

const styles = StyleSheet.create({
  headerTitle: {
    ...Specs.fontBold,
    fontSize: 18,
    color: '#373e73',
  },
  radioButtonView: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 7,
    backgroundColor: '#FFF',
    marginTop: 14,
  },
  customButtonTitleStyle: {
    fontSize: 14,
    color: '#FFFFFF',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: 'transparent',
    width: '100%',
    marginTop: 10,
  },
  inputItem: {
    paddingBottom: 22,
    paddingTop: 10,
  },
  uploadButton: {
    borderWidth: 0.5,
    flex: 1,
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 12,
    paddingHorizontal: 10,
    marginHorizontal: 10,
  },
  imageDoc: {
    width: 150,
    height: 150,
    paddingBottom: 12,
    paddingHorizontal: 10,
    marginHorizontal: 10,
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
  uploadText: {
    ...Specs.fontRegular,
    fontSize: 12,
    color: '#3f4967',
    paddingTop: 10,
    textAlign: 'center',
  },
});
