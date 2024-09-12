import react, { useEffect, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Keyboard,
  Dimensions
} from 'react-native';
import { inject, observer } from 'mobx-react';
import { Header } from '../../../../components';
import { strings } from '../../../../utility/localization/Localized';
import { COLOR_CODES, Specs } from '../../../../utility/Theme';
import styles from './style';
import Loader from 'app/src/components/loader/Loader';
import ImagePickerModal from '../../../../components/imagePickerModal';
import { CustomButton } from '../../../../components/buttons/Button';
import {
  handleLaunchCamera,
  handlelaunchImageLibrary,
} from '../../../../services/ImageUpload';
import Banner from '../../../Dashboard/Banner';
import CustomInput from '../../../../components/CustomInput';
import PickerSelector from '../../../../components/picker/pickerSelector';
import { BottomSheetPicker } from '../../../../components/picker/bottomSheetPicker';
import { showToast } from '../../../../utility/Utility';
const CLOSE_IMAGE = require('../../../../assets/images/DashBoardHeader/close.png');
const CAMERA_ICON = require('../../../../assets/images/Kyc/photo_camera.png');
const REMOVE_ICON = require('../../../../assets/images/Kyc/remove_btn.png');
//pp/src/components/toast/Toast
import { Toast } from '../../../../../src/components/toast/Toast';

const ClaimentOthersTotal = (props) => {
  const { width, height } = Dimensions.get('window');
  const [isImagePickerVisible, setIsImagePickerVisible] = useState(false);
  const [isModalVisible, setIsModelVisible] = useState(false);



  const [images, setImages] = useState([]);
  const [billTitle, setBillTitle] = useState('');
  const [selectedBillType, setSelectedType] = useState('')
  const [typeOfBilling, setTypeOfBilling] = useState([{ 'labelName': 'Allowance' },
  { 'labelName': 'Accomodation' }, { 'labelName': 'HallRent' }, { 'labelName': 'Toll' }, { 'labelName': 'other' }])

  useEffect(() => {

  }, [])

  const onCameraOptionPress = async () => {
    handleImagePickerVisibility(false);
    setTimeout(async () => {
      const result = await handleLaunchCamera();
      if (result?.success) {
        updateDocImage('insert', result.data);
      }
    }, 500);
  };

  const onImageLibraryPress = async () => {
    handleImagePickerVisibility(false);
    setTimeout(async () => {
      const result = await handlelaunchImageLibrary();
      if (result?.success) {
        updateDocImage('insert', result.data);
      }
    }, 500);
  };

  const handleImagePickerVisibility = value => {
    setIsImagePickerVisible(value)
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

  handleHomeBtn = async () => {
    const {navigation,navigationParams,route}=props;
     props.navigation.pop(4);

  }

  handleSubmitBtn = async () => {
    Keyboard.dismiss()
    const { firstName, lastName, distributorID } = props.profile;
    const {navigationParams,route}=props
    var  trainingId =route.params.trainingId;
    var reimburseId=route.params.reimburseId;
    // alert(reimburseId+"--"+trainingId);

    if(billTitle==""){
      showToast(
        'Please enter Bill name',
        Toast.type.ERROR,
      );
      return;
    }
    if(selectedBillType==""){
      showToast(
        'Please select bill type',
        Toast.type.ERROR,
      );
      return;
    }

    if(images.length==0){

      showToast(
        'Please select image for upload .',
        Toast.type.ERROR,
      );
      return;
    }
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
    form.append('trainingId', trainingId);
    form.append('reimbursementId', reimburseId);
    form.append('distributorId', distributorID);
    form.append('file', trainingImages[0])
    form.append('title', billTitle);
    form.append('type', selectedBillType);

    const responseJSON = await props.training.uploadReimburseImageUpload(form);
    if (responseJSON.success) {
      // setIsVisible(false);
      setImages([]);
      setBillTitle('');
      setSelectedType('');
      showToast(responseJSON.message, Toast.type.SUCCESS);
    } else {
      showToast(responseJSON.message, Toast.type.ERROR);
    }

    // selectedSearchType === 'Add prospects manually' ? props.navigation.navigate('addProspects',{ trainingId: TrainingRequestID }) : props.navigation.navigate('contactList')
  }

  const handleTextInput = (value) => {
    setBillTitle(value);

  }
  const closeBottomSheet = () => {
    setIsModelVisible(false);
  };


  return (
    <SafeAreaView style={styles.container}>
      <Loader loading={props.training.isLoading} />
      <Header
        navigation={props.navigation}
        screenTitle={'CNT Upload Image'}
      />
      <View style={{ flexDirection: 'column', flex: 1, margin: 10 }}>


        <View style={[styles.textInputField, { height: 45 }]}>
          {/* <Text style={{ position: 'absolute', top: -10, left: 10, backgroundColor: COLOR_CODES.white}}>item?.placeholder</Text> */}
          <CustomInput
            placeholder={'Enter Bill Name (Mileage Claim/ Petrol /Toll / Travel / Fare/Etc.)'}
            editable={true}
            value={billTitle}
            showIcon={false}
            textStyle={{ color: COLOR_CODES.labelGrey, fontSize: 12 }}
            hideBottomLine
            keyboardType={'default'}
            placeholderTextColor={COLOR_CODES.labelGrey}
            onChangeText={value => handleTextInput(value)}
            maxLength={50}
          />
        </View>

        <View style={{ marginBottom: 15 }}>
          <Text>Select Type</Text>
          <PickerSelector
            label={selectedBillType || 'Select Bill Type'}
            selectedValue={selectedBillType}
            customStyle={{
              container: {
                marginHorizontal: 0,
              },
            }}
            onPickerPress={() => setIsModelVisible(true)}
          />

        </View>



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
         
        </View>

        {images.length === 0 && (
              <TouchableOpacity onPress={()=>setIsImagePickerVisible(true)}>
                  <View style={{ justifyContent: 'center', alignItems: 'center', height:100 ,
                       backgroundColor: COLOR_CODES.lightGrey_back}}>  
                                 <Text style={{ fontSize: 14, marginHorizontal: 10, textAlign: 'center', ...Specs.fontRegular }}>Click here for select Image</Text>
                </View>
                </TouchableOpacity>
          
          )}


        <CustomButton
          {...this.props}
          handleClick={handleSubmitBtn}
          linearGradient
          buttonContainer={styles.button}
          buttonTitle={'Upload Image'}
          buttonTitleStyle={styles.customButtonTitleStyle}
          primaryColor="#58cdb4"
          secondaryColor="#58cdb4"
          accessibilityHint="navigate to Guest user form"
          accessibilityLabel="Navigate_To_Guest_User_Login_Screen"
        />


        <CustomButton
          {...this.props}
          handleClick={handleHomeBtn}
          linearGradient
          buttonContainer={styles.button}
          buttonTitle={'View Reimburse status'}
          buttonTitleStyle={styles.customButtonTitleStyle}
          primaryColor="#58cdb4"
          secondaryColor="#58cdb4"
          accessibilityHint="navigate to Guest user form"
          accessibilityLabel="Navigate_To_Guest_User_Login_Screen"
        />


        <ImagePickerModal
          isVisible={isImagePickerVisible}
          onCameraPress={onCameraOptionPress}
          onLibraryPress={onImageLibraryPress}
          setModalVisiblility={handleImagePickerVisibility}
        />

        <BottomSheetPicker
          isVisible={isModalVisible}
          onModalClose={closeBottomSheet}
          pickerItems={typeOfBilling}
          schema={{ label: 'labelName', value: 'labelID' }}
          heightMax={(2 / 3) * height}
          onItemPress={(value) => {
            setSelectedType(value.labelName);
            setIsModelVisible(false);

          }}
        />


      </View>

    </SafeAreaView>
  )
}

export default inject('training', 'profile')(observer(ClaimentOthersTotal));