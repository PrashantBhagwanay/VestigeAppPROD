import React, { Component } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Alert,
  Platform,
  ScrollView,
} from 'react-native';
import Banner from 'app/src/screens/Dashboard/Banner';
import { CustomButton } from 'app/src/components/buttons/Button';
import { Specs } from 'app/src/utility/Theme';
import { strings } from 'app/src/utility/localization/Localized';
import {
  isAddarValidate,
  isPassPortValidate,
} from 'app/src/utility/Validation/Validation';
import { connectedToInternet, showToast } from 'app/src/utility/Utility';
import { KYC_CONSTANT } from 'app/src/utility/constant/Constants';
import ImagePickerModal from '../../components/imagePickerModal';
import {
  handleLaunchCamera,
  handlelaunchImageLibrary,
} from '../../services/ImageUpload';
import { inject, observer } from 'mobx-react';
import AutoHeightWebView from 'react-native-autoheight-webview';

const CAMERA_ICON = require('app/src/assets/images/Kyc/photo_camera.png');
const REMOVE_ICON = require('app/src/assets/images/Kyc/remove_btn.png');

class KycDetails extends Component {

  constructor(props){
    super(props);
    this.props = props;
    this.state = {
      webViewRender: 0
    }
  }

  componentDidMount(){
    setTimeout(() => {
      this.setState({webViewRender:'10'});   
        }, 500);
         }
    

  alertMessage = msg => {
    Alert.alert('', msg, [{ text: strings.commonMessages.ok }], {
      cancelable: false,
    });
  };

  validateImageUpload = () => {
    const { imageLimit } = strings.kyc;
    const { images, handleImagePickerVisibility } = this.props;
    if (images.length > 1) {
      this.alertMessage(imageLimit);
    } else {
      handleImagePickerVisibility(true);
    }
  };

  onCameraOptionPress = async () => {
    const { updateDocImage, handleImagePickerVisibility } = this.props;
    handleImagePickerVisibility(false);
    setTimeout(async () => {
      const result = await handleLaunchCamera();
      if (result?.success) {
        updateDocImage('insert', result.data);
      }
    }, 500);
  };

  onImageLibraryPress = async () => {
    const { updateDocImage, handleImagePickerVisibility } = this.props;
    handleImagePickerVisibility(false);
    setTimeout(async () => {
      const result = await handlelaunchImageLibrary();
      if (result?.success) {
        updateDocImage('insert', result.data);
      }
    }, 500);
  };

  upload = async () => {
    const { documentMissing, docNoMissing } = strings.kyc;
    const {
      data,
      images,
      docNumber,
      profile,
      distributorId,
      selectedValue,
      uplineDistributorId,
      isValidDistributerId,
    } = this.props;
    if (!isValidDistributerId) {
      this.alertMessage(strings.kyc.invalidDistID);
    } else if (
      selectedValue === KYC_CONSTANT.aadhar &&
      !isAddarValidate(docNumber)
    ) {
      this.alertMessage(strings.kyc.aadharNoInvalid);
    } else if (
      selectedValue === KYC_CONSTANT.passport &&
      !isPassPortValidate(docNumber)
    ) {
      this.alertMessage(strings.kyc.passportNoInvalid);
    } else if (
      selectedValue === KYC_CONSTANT.driverLicence &&
      docNumber.trim().length < 5
    ) {
      this.alertMessage(strings.kyc.driverNoInvalid);
    } else if (
      selectedValue === KYC_CONSTANT.voterId &&
      docNumber.trim().length < 5
    ) {
      this.alertMessage(strings.kyc.invalidVoterId);
    } else if (
      selectedValue === KYC_CONSTANT.nationalIdentityCard &&
      docNumber.trim().length < 5
    ) {
      this.alertMessage(strings.kyc.invalidNationalId);
    } else if (images.length < 1) {
      this.alertMessage(documentMissing);
    } else if (docNumber.length < 1) {
      this.alertMessage(docNoMissing);
    } else {
      var kyc = [];
      images.map((data, index) => {
        kyc[index] = {
          uri: data.uri,
          type: data.type,
          name:
            Platform.OS === 'android'
              ? data.fileName
              : `temp_${Math.floor(Date.now())+"_"+Math.floor(Math.random()*10000)}.jpg`,
        };
      });

      const form = new FormData();
      form.append('uplineDistributorId', uplineDistributorId);
      form.append('distributorId', distributorId);
      form.append('docId', data.docId);
      form.append('docNumber', docNumber);
      form.append('file1', kyc[0]);
      form.append('file2', kyc[1]);
      await profile.uploadKyc(form);
      // await profile.locationUpdate({key: 'kyc', data: form});
      this.props.updateKyc();
    }
  };

  _renderGuideLinesMessage = () => {

    const { data, images, kycGuidelines } = this.props;
    const _kycGuidelines = kycGuidelines.filter(kyc => kyc.docTypeId == data.docId)
   
    const formattedGuideLines = _kycGuidelines.length > 0 && _kycGuidelines[0]?.hasOwnProperty('kycWarningMsg') ? `<html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body>${_kycGuidelines[0]?.kycWarningMsg}</body></html>`:  `<html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body></body></html>`;
      if (this.state.webViewRender==0) { 
      return null
      } else {
        return (_kycGuidelines.length > 0 ?
          <AutoHeightWebView 
            style={[{ width: Dimensions.get('window').width - 34, marginHorizontal: 17, },images.length > 0  && { marginTop: 10  }]}
            source={{ html: formattedGuideLines }}
            scalesPageToFit={true}
            viewportContent={'width=device-width, user-scalable=no'}
            scrollEnabled
            javaScriptEnabled
            // overScrollMode="never"
          />
         : null)
      
      }
    
     
  }


  render() {
    const { documentPlaceholder, verificationMessage } = strings.kyc;
    const {
      data,
      constantData,
      docNumber,
      updateBankName,
      bankName,
      updateDocnumber,
      images,
      updateDocImage,
      keyboardType,
      maxLength,
      isImagePickerVisible,
      handleImagePickerVisibility,
      profile,
      kycGuidelines,
      kycType
    } = this.props;
    return (
      <ScrollView>
      <View style={styles.mainView}>
        <View style={{ marginHorizontal: 17 }}>
          <View style={{ display: data?.display }}>
            <TextInput
              style={styles.textInputStyle}
              placeholder={strings.kyc.textInputPlaceholder}
              onChangeText={bankName => updateBankName({ bankName })}
              value={bankName}
              underlineColorAndroid="transparent"
            />
            <View style={styles.horizontalLine} />
          </View>
          <TextInput
            style={styles.textInputStyle}
            placeholder={constantData.placeHolder}
            onChangeText={docNumber => updateDocnumber(docNumber)}
            keyboardType={keyboardType}
            maxLength={maxLength}
            value={docNumber}
            underlineColorAndroid="transparent"
          />
          <View style={styles.horizontalLine} />
          <View style={styles.documentTitle}>
            <Text style={styles.documentTitleText}>
              {constantData.documentTitle}
            </Text>
            <Text style={styles.verificationText}>{kycType}</Text>
          </View>
          <View style={styles.cameraView}>
            <Text style={styles.cameraViewText}>{documentPlaceholder}</Text>
            <TouchableOpacity onPress={() => this.validateImageUpload()}>
              <Banner
                styles={styles.forwardIcon}
                resizeMode="contain"
                source={CAMERA_ICON}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.imageView}>
            {images.map((userdata, index) => {
              return (
                <View style={styles.imageDisplayView} key={index.toString()}>
                  <TouchableOpacity
                    onPress={() => updateDocImage('delete', index)}
                    style={styles.crossIconView}>
                    <Banner
                      styles={{ height: 20, width: 20 }}
                      resizeMode="contain"
                      source={REMOVE_ICON}
                    />
                  </TouchableOpacity>
                  <View style={{ width: '95%', height: '100%' }}>
                    <Banner
                      styles={{ flex: 1 }}
                      resizeMode="contain"
                      source={{ uri: userdata.uri }}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        </View>
        {profile.uploadedKycGuidelines && this._renderGuideLinesMessage()}
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
          buttonTitle={strings.kyc.uploadButtonTitle}
          primaryColor="#6895d4"
          secondaryColor="#57a5cf"
          buttonTitleStyle={styles.customButtonTitleStyle}
        />
        <ImagePickerModal
          isVisible={isImagePickerVisible}
          onCameraPress={this.onCameraOptionPress}
          onLibraryPress={this.onImageLibraryPress}
          setModalVisiblility={handleImagePickerVisibility}
        />
      </View>
      </ScrollView>
    );
  }
}

export default KycDetails;

const styles = StyleSheet.create({
  verificationText: {
    color: '#c00118',
    fontSize: 10,
    ...Specs.fontMedium,
  },
  documentTitleText: {
    color: '#3f4967',
    fontSize: 14,
    ...Specs.fontRegular,
  },
  textInputStyle: {
    height: 50,
    ...Specs.fontRegular,
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
  customButtonTitleStyle: {
    fontSize: 14,
    color: '#FFFFFF',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  mainView: {
    backgroundColor: '#ffffff',
    height: '100%',
  },
  horizontalLine: {
    borderWidth: 1,
    borderColor: '#c8c9d3',
    marginTop: -5,
  },
  documentTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 35,
  },
  cameraView: {
    borderWidth: 1,
    height: 37,
    alignItems: 'center',
    borderColor: '#c8c9d3',
    marginTop: 9,
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  imageView: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'space-between',
  },
  kycWarningMsgStyle: {
    marginHorizontal: 17,
    color: '#3f4967',
    fontSize: 14,
    ...Specs.fontRegular, 
    marginBottom: 10
  }
});
