import React, { useEffect, useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Modal,
  Keyboard,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import FeatherIcons from 'react-native-vector-icons/Feather';
import Geolocation from '@react-native-community/geolocation';
import { Specs } from '../../../../utility/Theme';
import { strings } from '../../../../utility/localization/Localized';
import { COLOR_CODES } from '../../../../utility/Theme';
import { TRAINING_STATUS_ENUM } from '..';
import { isIphoneXorAbove } from 'app/src/utility/Utility';
import Banner from 'app/src/screens/Dashboard/Banner';
import { RadioButton } from 'app/src/components/buttons/Button';
import Icon from 'react-native-vector-icons/Ionicons';
import moment from 'moment';
import ImagePickerModal from '../../../../components/imagePickerModal';
import CustomInput from '../../../../components/CustomInput';
import * as Permissions from 'app/src/utility/permissions/Permissions';
import { promptToOpenSettings, showToast } from 'app/src/utility/Utility';
import {
  handleLaunchCamera,
  handlelaunchImageLibrary,
} from '../../../../services/ImageUpload';
import { inject, observer } from 'mobx-react';

const CLOSE_IMAGE = require('app/src/assets/images/DashBoardHeader/close.png');
const CAMERA_ICON = require('app/src/assets/images/Kyc/photo_camera.png');
const REMOVE_ICON = require('app/src/assets/images/Kyc/remove_btn.png');

const options = ['Add prospects manually', 'Import from contacts'];
import { observable, action, runInAction, makeObservable } from 'mobx';
import { Toast } from '../../../../components/toast/Toast';

const CustomButton = props => {
  const { text, onPress, buttonStyle, buttonTextStyle, disabled } = props || {};
  return (
    <TouchableOpacity
      key={Math.random()}
      style={[styles.button, buttonStyle, { backgroundColor: disabled ? COLOR_CODES.extraLightGrey:  COLOR_CODES.buttonBlue }]}
      disabled={disabled}
      onPress={() => onPress()}>
      <Text style={[styles.buttonText, buttonTextStyle, {color: disabled  ? COLOR_CODES.lightGrey :  COLOR_CODES.white,}]}>{text}</Text>
    </TouchableOpacity>
  );
};


const TrainingRequestListItem = props => {
  //  @observable latitude;
  // @observable longitude;
  const { item, handleCancelPress, handleEditPress, handleRequestAgainPress } =
    props;
  const { trainingRequestList } = strings?.trainingRequestScreen;
  const {
    DistributorId,
    TrainingRequestID,
    Trainer,
    Status,
    Time,
    Venue,
    Address,
    City,
    State,
    District,
    EventDate,
    LocationName,
    Pincode,
    RejectReason
  } = item || {};
  const [expand, setExpand] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isImagePickerVisible, setIsImagePickerVisible] = useState(false);
  const [images, setImages] = useState([]);
  const [selectedSearchType, setSelectedSearchType] = useState('Add prospects manually')
  const [noOfAttendees, setNoOfAttendees] = useState(0)
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [markAsCompletedEnabled, setMarkAsCompletedEnabled] = useState(true);
  const [data, setData] = useState(props.data);

  const isEditEnabled = false;
  const isRequestAgainEnabled = false;
  const isCancelEnabled =
    Status?.toUpperCase() === TRAINING_STATUS_ENUM.PENDING?.toUpperCase();
  const isApprovedEnabled = Status?.toUpperCase() === TRAINING_STATUS_ENUM.APPROVED?.toUpperCase();
  const isCompletedEnabled = Status?.toUpperCase() === TRAINING_STATUS_ENUM.COMPLETED?.toUpperCase();
  const isAnyButtonEnabled =
    isEditEnabled || isRequestAgainEnabled || isCancelEnabled || isApprovedEnabled || isCompletedEnabled;

  useEffect(() => {
    getGeoLocation();
  }, [latitude, longitude])

  useEffect(()=>{
    if(EventDate){
      let arr = EventDate.match(/(\d{2})[\/](\d{2})[\/](\d{4})/);
      const date = new Date(`${arr[3]}-${arr[2]}-${arr[1]}`);
      const today = new Date()
      setMarkAsCompletedEnabled(dateCompare(date, today))
    }
  },[markAsCompletedEnabled, EventDate])
 
  useEffect( () => {
    console.log('Item',item)
      setData(props.item);
  }, [props.item]); 


  const dateCompare = (d1, d2) => {
    const date1 = new Date(d1);
    const date2 = new Date(d2);
    if(date1.toDateString() > date2.toDateString()){
        return true
    } else if(date1.toDateString() < date2.toDateString()){
        return true
    } else{
        return false
    }
}

  const showArrowIcon = () => {
    if (expand) {
      return <FeatherIcons name="chevron-up" color="black" size={30} />;
    } else {
      return <FeatherIcons name="chevron-down" color="black" size={30} />;
    }
  };

  const renderItem = (title, value) => {
    return (
      <View style={styles.details}>
        <Text style={[styles.detailsData, styles.detailLabelLeftSide]}>
          {title}
        </Text>
        <Text style={[styles.detailsData, styles.detailLabelRightSide]}>
          {value}
        </Text>
      </View>
    );
  };

  const renderCloseIcon = () => (
    <TouchableOpacity
      style={styles.closeIcon}
      activeOpacity={1.0}
      onPress={() => { setIsVisible(false), resetFields()}}
    >
      <Banner
        styles={{ width: 30, height: 30 }}
        source={CLOSE_IMAGE}
        resizeMode="contain"
      />
    </TouchableOpacity>
  );


  const radioButton = async (i) => {
    Keyboard.dismiss()
    setSelectedSearchType(options[i])
  }


  isValidate = () => {
    if (!images || images.length === 0) {
      return 'Please upload valid training image'
    }
    else if (!latitude || !longitude) {
      return 'Not able to locate you'
    }
    else if (!noOfAttendees || noOfAttendees == '0' || noOfAttendees >= 1000) {
      return 'Please enter valid no of attendees'
    }
  }

  onPressSubmit = async () => {
    Keyboard.dismiss()
    const {
      DistributorId,
      TrainingRequestID,
    } = item || {};
    const errorMessage = isValidate();
    if (isValidate()) {
      showToast(errorMessage, Toast.type.ERROR)
    } else {
    
      const form = new FormData();
      var trainingImages = [];
      images.map((data, index) => {
        trainingImages[index] = {
          uri: data.uri,
          type: data.type,
          name:
            Platform.OS === 'android'
              ? data.fileName
              : `temp_${Math.floor(Date.now() / 1000)}.jpg`,
        };
      });
      form.append('numberOfAttendant', noOfAttendees);
      form.append('latitude', latitude);
      form.append('longitude', longitude);
      form.append('trainingId', TrainingRequestID);
      form.append('distributorId', DistributorId);
      form.append('file1', trainingImages[0])
      form.append('file2', trainingImages && trainingImages.length > 1 ? trainingImages[1] : '')
      form.append('isStatus', '1')
      const responseJSON = await props.training.uploadTrainingImages(form);
      if(responseJSON.success){
        setIsVisible(false);
        showToast(responseJSON.message, Toast.type.SUCCESS)
      
        resetFields()
        props.onRefresh()
      } else {
        showToast(responseJSON.message, Toast.type.ERROR)
      }
    }

    // selectedSearchType === 'Add prospects manually' ? props.navigation.navigate('addProspects',{ trainingId: TrainingRequestID }) : props.navigation.navigate('contactList')
  }

  const resetFields = () => {
    setImages([]);
    setNoOfAttendees(0)
    setLatitude('');
    setLongitude('');
  }


  const onCameraOptionPress = async () => {
    handleImagePickerVisibility(false);
    setTimeout(async () => {
      const result = await handleLaunchCamera();
      if (result?.success) {
        updateDocImage('insert', result.data);
        setIsVisible(true)
      }
    }, 500);
  };

  const onImageLibraryPress = async () => {
    handleImagePickerVisibility(false);
    setTimeout(async () => {
      const result = await handlelaunchImageLibrary();
      if (result?.success) {
        updateDocImage('insert', result.data);
        setIsVisible(true);
      }
    }, 500);
  };

  const handleImagePickerVisibility = value => {
    setIsVisible(false)
    setIsImagePickerVisible(value);
    
  };

  alertMessage = msg => {
    Alert.alert('', msg, [{ text: strings.commonMessages.ok }], {
      cancelable: false,
    });
  };

  const validateImageUpload = () => {
    const { imageLimit } = strings.kyc;
    // const { images, handleImagePickerVisibility } = this.props;
    if (images.length > 1) {
      alertMessage(imageLimit);
    } else {
      handleImagePickerVisibility(true);
    }
  };

  updateDocImage = (type, data) => {
    if (type === 'insert' && data.fileSize > 1024 * 1024 * 5) {
      showToast(strings.errorMessage.cnt.imageMaxSizeMessage, Toast.type.ERROR)
      return;
    } else {
      let _images = JSON.parse(JSON.stringify(images));
      type === 'insert'
        ? (_images.push(data), setImages(_images))
        : (
          _images.splice(data, 1),
          setImages(_images)
        );
    }
  };

  const getGeoLocation = async () => {
    const permissionType =
      Platform.OS === 'android'
        ? Permissions.PERMISSION_TYPES.android.LOCATION
        : Permissions.PERMISSION_TYPES.ios.LOCATION;
    const response = await Permissions.requestPermission(permissionType);
    if (response === Permissions.StatusEnum.GRANTED) {
      Geolocation.getCurrentPosition(
        async (position) => {
          runInAction(() => {
            setLatitude(position.coords.latitude);
            setLongitude(position.coords.longitude);
          })
          // this.detectLocation();
        },
        () => {
          // this.showToast(strings.errorMessage.location.enableLocation, Toast.type.ERROR)
        },
        { enableHighAccuracy: true },
      );
    } else if (response === Permissions.StatusEnum.BLOCKED) {
      promptToOpenSettings(
        strings.errorMessage.location.locationPermission1,
        strings.errorMessage.location.locationPermission2,
      );
    }
  }


  const _renderOptions = () => {
    const { documentPlaceholder, verificationMessage } = strings.kyc;
    return <Modal
      animationType="fade"
      transparent
      visible={isVisible}
      onRequestClose={() => setIsVisible(false)}
    >
      <View style={styles.mainContainer}>

        <View style={[styles.containerInfo, Platform.OS === 'ios' ? styles.containerInfoIos : styles.containerInfoAndroid]}>
          <View style={styles.header}>
            {renderCloseIcon()}
            <Text style={{ fontSize: 20, ...Specs.fontMedium }}>{strings.order.orderFeedback.uploadImage}</Text>
          </View>
          <Text style={{ fontSize: 15, ...Specs.fontBold, marginLeft: 10, marginTop: 10, color: COLOR_CODES.vividRed }}>Note:</Text>
          <Text style={styles.cameraViewText}>{`\u25CF Please include atleast one photo capture during the training.`}</Text>
          <Text style={[styles.cameraViewText]}>{`\u25CF A single image must not exceed 4 MB, and the overall file size must not exceed 8 MB.`}</Text>
          <Text style={[styles.cameraViewText, { marginBottom: 10 }]}>{`\u25CF For the successful completion of training, upload an image from the venue only, and then click on 'Submit'.`}</Text>
          <TouchableOpacity style={styles.cameraView} activeOpacity={1} onPress={() => validateImageUpload()}>
            <TouchableOpacity style={{ marginHorizontal: 10 }} onPress={() => validateImageUpload()}>
              <Banner
                styles={styles.forwardIcon}
                resizeMode="contain"
                source={CAMERA_ICON}
              />
            </TouchableOpacity>
            <Text style={{ fontSize: 14, ...Specs.fontRegular }}>Please upload the training image</Text>
          </TouchableOpacity>
          <View style={styles.imageView}>
            {images.map((userdata, index) => {
              return (
                <View style={styles.imageDisplayView} key={index.toString()}>
                  <TouchableOpacity
                    onPress={() => updateDocImage('delete', index)}
                    style={styles.crossIconView}>
                    <Banner
                      styles={{ height: 30, width: 30 }}
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
            {/* {images.length === 0 && (
              <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                <Text style={{ fontSize: 14, marginHorizontal: 10, textAlign: 'center', ...Specs.fontRegular }}>No Image uploaded yet</Text>
              </View>
            )} */}
          </View>


          <View style={styles.textInputField}>
            {/* <Text style={{ position: 'absolute', top: -10, left: 10, backgroundColor: COLOR_CODES.white}}>item?.placeholder</Text> */}
            <CustomInput
              placeholder={'No of attendees attended in the training'}
              // editable={item?.isEditable}
              value={noOfAttendees}
              showIcon={false}
              textStyle={{ color: COLOR_CODES.labelGrey, fontSize: 12, ...Specs.fontRegular }}
              hideBottomLine
              keyboardType={'numeric'}
              placeholderTextColor={COLOR_CODES.labelGrey}
              onChangeText={value => setNoOfAttendees(value)}
              maxLength={3}
            />
          </View>
          <TouchableOpacity
            style={[styles.customButton]}
            onPress={() => this.onPressSubmit()}>
            <Text style={[styles.customButtonText]}>SUBMIT</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  }

  return (
    <View style={styles.listItemContainer}>
      <TouchableOpacity
        style={styles.accordionArrow}
        onPress={() => setExpand(!expand)}>
        {showArrowIcon(item)}
      </TouchableOpacity>
      <View style={styles.detailView}>
        {renderItem(trainingRequestList.distributorId, DistributorId)}
        {renderItem(trainingRequestList.trainingRequestId, TrainingRequestID)}
        {renderItem(trainingRequestList.status, Status)}
        {Status?.toUpperCase() === TRAINING_STATUS_ENUM.REJECTED?.toUpperCase() && renderItem(trainingRequestList.rejectReason, RejectReason)}
        {renderItem(trainingRequestList.eventDate, EventDate)}
        {renderItem(trainingRequestList.eventTime, Time)}
        {renderItem(trainingRequestList.trainer, Trainer)}
      </View>
      {expand && (
        <View style={styles.detailView}>
          {renderItem(trainingRequestList.venue, Venue)}
          {renderItem(trainingRequestList.locationName, LocationName)}
          {renderItem(trainingRequestList.address, Address)}
          {renderItem(trainingRequestList.pincode, Pincode)}
          {renderItem(trainingRequestList.state, State)}
          {renderItem(trainingRequestList.city, City)}
          {renderItem(trainingRequestList.district, District)}
        </View>
      )}
      {isAnyButtonEnabled && (
        <View style={[styles.footerContainer, { height: isEditEnabled ? 40 : 50 }]}>
          {isEditEnabled && (
            <CustomButton text="Edit" onPress={() => handleEditPress} />
          )}
          {isRequestAgainEnabled && (
            <CustomButton
              text="Request Again"
              onPress={() => handleRequestAgainPress()}
            />
          )}
          {isCancelEnabled && (
            <CustomButton
              text="Delete"
              onPress={() => handleCancelPress(item)}
            />
          )}
          {isApprovedEnabled && (<View style={{ justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row', flex: 1 }}>
            {<CustomButton
              text="Mark as Complete"
              buttonStyle={{ width: Dimensions.get('window').width / 3 - 25, height: 40 }}
              buttonTextStyle={{ padding: 3 }}
              disabled={markAsCompletedEnabled}
              onPress={() => {

                setIsVisible(true)
              }} //props.navigation.navigate('addProspects',{ trainingId: TrainingRequestID })}//
            />}
            <CustomButton
              text="Add Prospects"
              buttonStyle={{ width: Dimensions.get('window').width / 3 - 25, height: 40 }}
              buttonTextStyle={{ padding: 3 }}
              onPress={() => props.navigation.navigate('addProspects', { trainingId: TrainingRequestID })}//setIsVisible(true)}
            />
            <CustomButton
              text="View Prospects"
              buttonTextStyle={{ padding: 3 }}
              buttonStyle={{ width: Dimensions.get('window').width / 3 - 25, height: 40 }}
              // buttonContainer={[styles.button, { marginTop: '3%'}]}
              onPress={() => props.navigation.navigate('viewProspects', { trainingId: TrainingRequestID })}
            />
          </View>)}
          {isCompletedEnabled && (<View style={{ justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row'}}>
          {<CustomButton
              text="Mark as Complete"
              buttonStyle={{ width: Dimensions.get('window').width / 3 - 25, height: 40 }}
              buttonTextStyle={{ padding: 3 }}
              disabled={markAsCompletedEnabled || isCompletedEnabled}
              onPress={() => {
                setIsVisible(true)
              }} //props.navigation.navigate('addProspects',{ trainingId: TrainingRequestID })}//
            />}
            <CustomButton
              text="Add Prospects"
              buttonStyle={{ width: Dimensions.get('window').width / 3 - 25, height: 40 }}
              buttonTextStyle={{ padding: 3 }}
              disabled={markAsCompletedEnabled || isCompletedEnabled}
              onPress={() => props.navigation.navigate('addProspects', { trainingId: TrainingRequestID })}//setIsVisible(true)}
            />
          <CustomButton
              text="View Prospects"
              buttonStyle={{ width: Dimensions.get('window').width / 3 - 25, height: 40 }}
              // buttonTextStyle={{ padding: 3 }}
              onPress={() => props.navigation.navigate('viewProspects', { trainingId: TrainingRequestID })}
            />
          </View>)}
        </View>
      )}
      {_renderOptions()}
      <ImagePickerModal
        isVisible={isImagePickerVisible}
        onCameraPress={onCameraOptionPress}
        onLibraryPress={onImageLibraryPress}
        setModalVisiblility={handleImagePickerVisibility}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  listItemContainer: {
    backgroundColor: '#fff',
    marginVertical: 10,
    borderRadius: 8,
    elevation: 5,
    shadowOffset: { width: 0, height: 0 },
    shadowColor: COLOR_CODES.shadowGrey,
    shadowOpacity: 0.4,
    shadowRadius: 5,
    overflow: 'hidden',
  },
  detailView: {
    marginVertical: 5,
    marginHorizontal: 15,
  },
  titleHeading: {
    ...Specs.fontMedium,
    fontSize: 14,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailsData: {
    ...Specs.fontMedium,
    fontSize: 12,
    marginBottom: 4,
    color: COLOR_CODES.labelGrey,
  },
  detailLabelLeftSide: {
    flex: 0.3,
    paddingRight: 5,
    ...Specs.fontSemibold,
  },
  detailLabelRightSide: {
    flex: 0.7,
  },
  accordionArrow: {
    backgroundColor: COLOR_CODES.cultured,
    zIndex: 1,
    justifyContent: 'center',
    position: 'absolute',
    right: 5,
    top: 5,
    bottom: -10,
    width: 30,
    height: 30,
    borderRadius: 30,
    elevation: 3,
    shadowOffset: { width: 2, height: 4 },
    shadowColor: COLOR_CODES.shadowGrey,
    shadowOpacity: 0.2,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
    backgroundColor: COLOR_CODES.cultured,
    paddingHorizontal: 10,
  },
  button: {
  
    minWidth: 70,
    height: 28,
    alignSelf: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
    borderRadius: 15,
    paddingHorizontal: 10,
  },
  buttonText: {
    ...Specs.fontSemibold,
    fontSize: 13,
    textAlign: 'center',
  },
  mainContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00000050',
  },
  containerInfoIos: {
    shadowOffset: { width: 0, height: 0 },
    shadowColor: '#e1e5e6',
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  containerInfoAndroid: {
    elevation: 15,
  },
  containerInfo: {
    width: Dimensions.get('window').width - 40,
    // height: Dimensions.get('window').height - (isIphoneXorAbove() ? 230 : 165),
    backgroundColor: 'white',
    borderRadius: 6,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    height: 45,
    backgroundColor: '#e9f0f9',
    padding: 7.5,
  },
  radioButtonContainer: {
    // flexDirection: 'row',
    paddingBottom: 8,
  },
  overRideStyle: {
    // flex: 1,
  },
  customButton: {
    backgroundColor: COLOR_CODES.buttonBlue,
    width: '95%',
    marginTop: 10,
    marginBottom: 25,
    height: 45,
    alignSelf: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  customButtonText: {
    ...Specs.fontSemibold,
    fontSize: 14,
    textAlign: 'center',
    color: COLOR_CODES.white,
  },
  cameraView: {
    borderWidth: 1,
    marginHorizontal: 10,
    height: 37,
    alignItems: 'center',
    borderColor: '#c8c9d3',
    marginTop: 9,
    flexDirection: 'row',
    // justifyContent: 'space-between',
  },
  cameraViewText: {
    color: COLOR_CODES.vividRed,
    fontSize: 12,
    marginLeft: 11,
    ...Specs.fontMedium,
  },
  forwardIcon: {
    width: 23,
    height: 20,
    resizeMode: 'contain',
    marginRight: 11,
  },
  imageView: {
    flexDirection: 'row',
    // marginTop: 20,
    marginVertical: 20
    // marginRight: 
    // justifyContent: 'space-between',
  },
  imageDisplayView: {
    width: '38%',
    height: 120,
    backgroundColor: '#ffffff',
    marginLeft: 20,
    //  borderWidth: 1
  },
  crossIconView: {
    // borderWidth: 1,
    height: 20,
    width: 20,
    position: 'absolute',
    zIndex: 2,
    marginLeft: '77%',
    marginTop: '-5%',
  },
  textInputField: {
    height: 45,
    marginTop: 5,
    marginHorizontal: 10,
    marginBottom: 5,
    // paddingLeft: 15,
    paddingRight: 10,
    justifyContent: 'center',
    borderColor: COLOR_CODES.borderDark,
    backgroundColor: COLOR_CODES.white,
    borderWidth: 0.8,
    borderRadius: 8,
  },
});

export default inject('training')(observer(TrainingRequestListItem));
