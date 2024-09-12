import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  Button,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import CheckBox from '@react-native-community/checkbox';
import {
  handleLaunchCamera,
  handlelaunchImageLibrary,
} from '../../../services/ImageUpload';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { CustomButton, RadioButton } from '../../../components/buttons/Button';
import { Specs } from 'app/src/utility/Theme';
import { inject, observer } from 'mobx-react';
import { ScrollView } from 'react-native-gesture-handler';
import DateTimePicker from 'react-native-modal-datetime-picker';
import moment from 'moment';
import AlertClass from '../../../utility/AlertClass';
import { showToast } from '../../../utility/Utility';
import Loader from '../../../components/loader/Loader';
import { COLOR_CODES } from '../../../utility/Theme';
import WebView from 'react-native-webview';

const { height } = Dimensions.get('window');

const SurveyModal = inject(
  'dashboard',
  'auth',
  'location',
)(
  observer(props => {
    const {
      dashboard: {
        getSurveyFormDetails,
        surveyFormList,
        saveSurveyFormDetails,
        uploadSurveyImage,
      },
      auth: { distributorID },
      location: {
        countryList,
        stateList,
        cityListApi,
        countryListData,
        stateListData,
        cityListData,
      },
      navigation,
      visible,
      onClose,
      onSave,
      resend,
      mobileOrEmail,
      textMobileOrEmail,
    } = props;
    const [modalVisible, setModalVisible] = useState(true);
    const [formData, setFormData] = useState({});
    const [currentIndex, setCurrentIndex] = useState(0);
    const [dataArray, setDataArray] = useState(surveyFormList[currentIndex]);
    const [openDatePicker, setOpenDatePicker] = useState(false);
    const [openTimePicker, setOpenTimPicker] = useState(false);
    const [date, setDate] = useState(new Date().toISOString());
    const [currentQID, setcurrentQID] = useState(-1);
    const [isLoaderImage, setIsLoaderImage] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isChecked, setIsChecked] = useState(false);
    const [showWebview, setShowWebview] = useState(false);
    const customStyles = `
    <style>
      p {
        font-family: 'Arial, sans-serif';
        font-size: 20px;
        color: #333;
        margin: 10px 0;
      }
      /* Add more custom styles for <p> tags or other elements here */
    </style>
  `;
    const handleMultiplePopUp = async () => {
      // await getSurveyFormDetails();
      setModalVisible(false);
    };

    useEffect(() => {
      getCountryList();
      setTimeout(() => {
        getStateList(1);
      }, 3000);
    }, []);

    const getStateList = async id => {
      await stateList(id);
    };

    const getCountryList = async () => {
      await countryList();
    };
    const getCityListData = async id => {
      await cityListApi(id);
    };


    const checkValidtion = async () => {
      var isValid = true;
      const dataArrayS = dataArray.question;
      for (let i = 0; i < dataArrayS.length; i++) {

        var answer=formData[dataArrayS[i].question_id];

        if(answer==undefined){
          alert(`Please enter value  In  \nQuestion: '${dataArrayS[i].question_title}'`);
          isValid = false;
          break;
        }
        // if (dataArrayS[i].question_type === 'File') {

        //  }

        if (
          dataArrayS[i].question_type === ' ' ||
          dataArrayS[i].question_type === 'Input'
        ) {

          
        

          if (dataArrayS[i].validation.length > 0) {
            var validationType = dataArrayS[i].validation.find(
              rule => rule.name === 'validationType',
            );
            if (
              validationType != undefined &&
              validationType.value == 'pancard'
            ) {
              const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
              if (panRegex.test(formData[dataArrayS[i].question_id]) == false) {
                alert('Please enter valid pancard');
                isValid = false;
              }
            }

            if (
              validationType != undefined &&
              validationType.value == 'email'
            ) {
              // const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
              const panRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
              if (panRegex.test(formData[dataArrayS[i].question_id]) == false) {
                alert('Please enter valid email id ');
                isValid = false;
              }
            }

            if (
              validationType != undefined &&
              validationType.value == 'aadhar card'
            ) {
              const panRegex = /^\d{12}$/;
              if (panRegex.test(formData[dataArrayS[i].question_id]) == false) {
                alert('Please enter valid aadhar card');
                isValid = false;
              }
            }

            if (
              validationType != undefined &&
              validationType.value == 'driving licence'
            ) {
              const panRegex = /^[A-Z]{2}[0-9]{2}[0-9]{7,13}$/;
              if (panRegex.test(formData[dataArrayS[i].question_id]) == false) {
                alert('Please enter valid driving licence');
                isValid = false;
              }
            }
            if (
              validationType != undefined &&
              validationType.value == 'voterId'
            ) {
              const panRegex = /^[A-Z]{3}[0-9]{7}$/;
              if (panRegex.test(formData[dataArrayS[i].question_id]) == false) {
                alert('Please enter valid voter ID');
                isValid = false;
              }
            }
            if (
              validationType != undefined &&
              validationType.value == 'passport'
            ) {
              const panRegex = /^[A-Z]{1}[0-9]{7}$/;
              if (panRegex.test(formData[dataArrayS[i].question_id]) == false) {
                alert('Please enter valid passport');
                isValid = false;
              }
            }
          }
          var minLength = dataArrayS[i].validation.find(
            rule => rule.name === 'min_length',
          );
           
          if(minLength!=undefined && minLength.value&& formData[dataArrayS[i].question_id]!=undefined){
            var length= formData[dataArrayS[i].question_id].length??0;
            if(length<minLength.value){
              alert(`Please enter valid input, minimum ${minLength.value} Characters In  \nQuestion: '${dataArrayS[i].question_title}'`);
              isValid = false;
            }

          }
       
          if(dataArrayS[i].input_type=="text"){
            // const regex = /^[a-zA-Z\s!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/;
            const regex = /^[a-zA-Z\s]*$/; // Regular expression to match only alphabetic characters
            if (regex.test(formData[dataArrayS[i].question_id])==false) {
              alert(`Please enter only alphabet In  \nQuestion: '${dataArrayS[i].question_title}'`);
              isValid = false;
            }
          }
         
          
        

          if (!isValid) {
            break;
          }
        }
      }

      if (isValid) {
        submitData();
      }
    };

    const submitData = async () => {
      let dataForm = [];
      dataForm = Object.keys(formData);
      const dataArrayS = dataArray.question;

      let modalHide = false;
      for (let i = 0; i < dataArrayS.length; i++) {
        if (dataForm.includes(dataArrayS[i].question_id)) {
          if (dataArrayS[i].question_type === 'DatePicker') {
            dataArrayS[i].answer = moment(
              formData[dataArrayS[i].question_id],
            ).format('DD-MM-YYYY');
          } else if (dataArrayS[i].question_type === 'TimePicker') {
            dataArrayS[i].answer = moment(
              formData[dataArrayS[i].question_id],
            ).format('HH:MM A');
          } else if (dataArrayS[i].question_type === 'Checkbox') {
            dataArrayS[i].answer =
              formData[dataArrayS[i].question_id].join(',');
          } else if (dataArrayS[i].question_type === 'Priority') {
            dataArrayS[i].answer =
              formData[dataArrayS[i].question_id].join(',');
          } else {
            dataArrayS[i].answer = formData[dataArrayS[i].question_id];
          }
          dataArrayS[i].servery_id = dataArray.servery_id;
          dataArrayS[i].distributor_id = distributorID;
        } else {
          alert('Please answer all question');
          modalHide = true;
          break;
        }
      }
      if (modalHide == true) {
        return;
      }
      const data = {
        question: dataArrayS,
      };
      console.log('dfgsdgg', data);
    

      if(dataArray.servery_terms != '' && isChecked==false){
        alert('Please acccept terms and condition');
        return;
      }
      setIsLoading(true);
      if (await saveSurveyFormDetails(data)) {
        setIsLoading(false);
        alert('Survery submited successfully.');
        if (modalHide === false) {
          setModalVisible(false);
          setFormData({});
          getSurveyFormDetails();
          if (
            surveyFormList.length > 1 
          ) {
            // setCurrentIndex(currentIndex + 1);
            // setDataArray(surveyFormList[currentIndex + 1]);
            setTimeout(() => {
              setModalVisible(true);
            }, 1000);
          }
        }
      } else {
        alert('Not saved data');
      }
    };

    useEffect(() => {
      // if (currentIndex>1) {
      setDataArray(surveyFormList[currentIndex]);
      setModalVisible(true);
      setFormData({});

      // }
    }, [currentIndex]);

    useEffect(() => {
      if (modalVisible === false) {
        setFormData({});
      }
    }, [modalVisible]);

    useEffect(() => {
      console.log('dsfgsdfsdf', formData);
    }, [formData]);

    const handleInputChange = (question_id, value) => {
      setFormData({ ...formData, [question_id]: value });
    };

    const handleCheckboxChange = (question_id, option) => {
      const currentOptions = formData[question_id] || [];
      if (currentOptions.includes(option)) {
        handleInputChange(
          question_id,
          currentOptions.filter(opt => opt !== option),
        );
      } else {
        handleInputChange(question_id, [...currentOptions, option]);
      }
    };

    function renameFile(oldFilename) {
      let newFilename = oldFilename.slice(-18); // Extracting the last 8 characters, assuming the length of 'data.png'
      return '......' + newFilename;
    }

    function extractFilenameFromURL(url) {
      // Split the URL by '/' and get the last part
      const parts = url.split('/');
      return parts[parts.length - 1];
    }

    const uploadPhoto = async (question_id, response) => {
      //const { imageLimit } = strings.kyc
      // console.log('resimage', response.data);
      if (
        response.data.type == 'image/png' ||
        response.data.type == 'image/jpg' ||
        response.data.type == 'image/jpeg'
      ) {
        let imageToUpload = {
          uri: response?.data?.uri,
          type: response?.data?.type,
          name:
            Platform.OS === 'ios'
              ? `temp_${Math.floor(Date.now() / 1000)}.jpg`
              : response?.data?.fileName,
        };
        const uploadData = new FormData();
        uploadData.append('UploadedImage', imageToUpload);
        uploadData.append('distributorId', distributorID);
        setIsLoaderImage(true);
        const resUpload = await uploadSurveyImage(uploadData);
        setIsLoaderImage(false);
        if (resUpload.success) {
          handleInputChange(question_id, resUpload.data.imgUrl);
        } else {
          alert('Something went wrong, please try again');
        }
      } else {
        AlertClass.showAlert(
          'Message',
          'You can upload only .png,.jpg or.jpeg type image.',
          [
            {
              text: 'ok',
              onPress: () => console.log('Ok'),
            },
          ],
        );
      }
    };

    onImageLibraryPress = async question_id => {
      setTimeout(async () => {
        const result = await handlelaunchImageLibrary();
        if (result?.success) {
          uploadPhoto(question_id, result);
          //handleInputChange(question_id, renameFile(result.data.fileName));
        }
      }, 500);
    };

    onCameraOptionPress = async question_id => {
      setTimeout(async () => {
        const result = await handleLaunchCamera();
        if (result?.success) {
          uploadPhoto(question_id, result);
        }
      }, 500);
    };

    const handleToDatePicker = date => {
      //setDate(date.toISOString())
      handleInputChange(currentQID, date.toISOString());
      setOpenDatePicker(false);
      setOpenTimPicker(false);
    };

    useEffect(() => {
      if (openDatePicker || openTimePicker) {
        if (formData[currentQID] !== undefined) {
          setDate(formData[currentQID]);
          console.log('sdfsdf', moment(formData[currentQID]).format('HH:MM A'));
        } else {
          setDate(new Date().toISOString());
        }
      }
    }, [openDatePicker, currentQID, formData, openTimePicker]);

    // hideDatePicker = mode => {
    //   if (mode === 'from') {
    //     this.setState({ isFromDatePickerVisible: false });
    //   } else {
    //     this.setState({ isToDatePickerVisible: false });
    //   }
    // };

    const getMaxLength = rules => {
      const maxLengthRule = rules.find(rule => rule.name === 'max_length');
      return maxLengthRule ? parseInt(maxLengthRule.value) : 5000;
    };
    const getMaxLengthValue = rules => {
      const maxLengthRule = rules.find(rule => rule.name === 'max_length');
      return maxLengthRule ? parseInt(maxLengthRule.value) : undefined;
    };

    const renderRadio = option => (
      <FlatList
        data={option.option_value}
        renderItem={({ item }) => (
          <RadioButton
            buttonText={item}
            onPress={() => handleInputChange(option.question_id, item)}
            selectedValue={formData[option.question_id]}
          />
        )}
        numColumns={2}
      />
    );

    return (
      <View>
        {/* <Button title="Show Modal" onPress={() => setModalVisible(true)} /> */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            {
            }
          }}>
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <ScrollView contentContainerStyle={styles.scrollViewContainer}>
                <View style={{ width: '100%' }}>
                  <View
                    style={{ flexDirection: 'row', justifyContent: 'center' }}>
                      <View style={styles.headerStyle}>
                          <Text style={styles.surveyTitle}>
                          {dataArray.servery_name}
                        </Text>
                        <Text style={{fontSize:10, marginTop:5, color:'black'}}>
                          {"(" +moment(dataArray.servery_start_date).format('DD-MM-YYYY HH:MM A')  +" To "+ moment(dataArray.servery_end_date).format('DD-MM-YYYY HH:MM A') +")"}
                        </Text>
                        </View>
                   
                    <TouchableOpacity
                      onPress={() => setModalVisible(false)}
                      style={{
                        position: 'absolute',
                        right: 0,
                      }}>
                      <Icon name="close" size={30} color="#3f4967" />
                    </TouchableOpacity>
                    {surveyFormList.length > 0 && (
                      <View
                        style={{
                          position: 'absolute',
                          left: 0,
                          flexDirection: 'row',
                        }}>
                        <TouchableOpacity
                          onPress={() => {
                            setCurrentIndex(currentIndex - 1);
                          }}>
                          <Text
                            style={(styles.previouSurvey, [{ color: 'red' }])}>
                            {currentIndex != 0 ? '<< ' : ''}
                          </Text>
                        </TouchableOpacity>

                        <Text style={styles.totalSuery}>
                          {currentIndex + 1 + '/' + surveyFormList.length}
                        </Text>
                        <TouchableOpacity
                          onPress={() => {
                            setCurrentIndex(currentIndex + 1);
                            // alert(currentIndex+1)
                          }}>
                          <Text
                            style={(styles.previouSurvey, [{ color: 'red' }])}>
                            {surveyFormList.length != currentIndex + 1
                              ? '  >>  '
                              : ''}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                  <FlatList
                    data={dataArray.question}
                    keyExtractor={item => item.question_id}
                    renderItem={({ item, index }) => (
                      <View
                        key={item.question_id}
                        style={styles.questionContainer}>
                        <View style={styles.headerView}>
                          <Text style={styles.questionTitle}>
                            {`${index+1}. ${item.question_title}`}
                          </Text>
                          {item.question_type === 'File' && (
                            <View style={{ flexDirection: 'row' }}>
                              {isLoaderImage && (
                                <ActivityIndicator
                                  size="small"
                                  color="#0000ff"
                                />
                              )}
                              <TouchableOpacity
                                onPress={() =>
                                  onImageLibraryPress(item.question_id)
                                }>
                                <Icon
                                  name="camera-front"
                                  style={{ paddingHorizontal: 5 }}
                                  size={30}
                                  color="#3f4967"
                                />
                              </TouchableOpacity>
                              <TouchableOpacity
                                onPress={() =>
                                  onCameraOptionPress(item.question_id)
                                }>
                                <Icon
                                  name="camera"
                                  style={{ paddingHorizontal: 5 }}
                                  size={30}
                                  color="#3f4967"
                                />
                              </TouchableOpacity>
                            </View>
                          )}
                        </View>
                        {(item.question_type === ' ' ||
                          item.question_type === 'Input') && (
                          <View style={{ flexDirection: 'column' }}>
                            <TextInput
                              style={styles.input}
                              maxLength={
                                item.validation != undefined
                                  ? getMaxLength(item.validation)
                                  : 5000
                              }
                              keyboardType={
                                item.input_type != undefined &&
                                item.input_type == 'numeric'
                                  ? 'numeric'
                                  : 'default'
                              }
                              onChangeText={text =>
                                handleInputChange(item.question_id, text)
                              }
                              value={formData[item.question_id] || ''}
                            />
                            {item.validation != undefined &&
                              getMaxLengthValue(item.validation) != undefined}
                            <Text style={styles.counterText}>
                              {formData[item.question_id] == undefined
                                ? '0/' + getMaxLength(item.validation)
                                : formData[item.question_id].length +
                                  '/' +
                                  getMaxLength(item.validation)}
                            </Text>
                          </View>
                        )}
                        {item.question_type === 'Checkbox' &&
                          item.option_value.map((option, idx) => (
                            <View key={idx} style={styles.checkboxContainer}>
                              <CheckBox
                                value={
                                  formData[item.question_id]?.includes(
                                    option,
                                  ) || false
                                }
                                onValueChange={() =>
                                  handleCheckboxChange(item.question_id, option)
                                }
                                tintColors={{
                                  true: '#6895d4',
                                  false: '#6895d4',
                                }}
                              />
                              <Text style={styles.radioButtonLabel}>
                                {option}
                              </Text>
                            </View>
                          ))}
                        {item.question_type === 'Radiobutton' &&
                          renderRadio(item)}
                        {item.question_type === 'DropDown' && (
                          <View
                            style={{
                              borderColor: 'grey',
                              borderWidth: 1,
                              paddingBottom: 4,
                            }}>
                            <RNPickerSelect
                              onValueChange={value =>
                                handleInputChange(item.question_id, value)
                              }
                              items={item.option_value.map(option => ({
                                label: option,
                                value: option,
                              }))}
                              style={pickerSelectStyles}
                              value={formData[item.question_id] || ''}
                            />
                          </View>
                        )}

                        {item.question_type === 'Country' && (
                          <View
                            style={{
                              borderColor: 'grey',
                              borderWidth: 1,
                              paddingBottom: 4,
                            }}>
                            <RNPickerSelect
                              onValueChange={value => {
                                if (value != undefined) {
                                  var selectedcounty = countryListData.find(
                                    data => data.countryName === value,
                                  );
                                  // alert(JSON.stringify(selectedcounty));
                                  handleInputChange(item.question_id, value);
                                  getStateList(selectedcounty?.id);
                                }

                                handleInputChange(item.question_id, value);
                              }}
                              items={countryListData.map(option => ({
                                label: option.countryName,
                                value: option.countryName,
                              }))}
                              style={pickerSelectStyles}
                              value={formData[item.question_id] || ''}
                            />
                          </View>
                        )}

                        {item.question_type === 'State' && (
                          <View
                            style={{
                              borderColor: 'grey',
                              borderWidth: 1,
                              paddingBottom: 4,
                            }}>
                            <RNPickerSelect
                              onValueChange={value => {
                                if (value != undefined) {
                                  var stateData = stateListData.find(
                                    data => data.stateName === value,
                                  );

                                  handleInputChange(item.question_id, value);
                                  getCityListData(stateData?.id);
                                }
                              }}
                              items={stateListData.map(option => ({
                                label: option.stateName,
                                value: option.stateName,
                              }))}
                              style={pickerSelectStyles}
                              value={formData[item.question_id] || ''}
                            />
                          </View>
                        )}

                        {item.question_type === 'City' && (
                          <View
                            style={{
                              borderColor: 'grey',
                              borderWidth: 1,
                              paddingBottom: 4,
                            }}>
                            <RNPickerSelect
                              onValueChange={value =>
                                handleInputChange(item.question_id, value)
                              }
                              items={cityListData.map(option => ({
                                label: option.cityName,
                                value: option.cityName,
                              }))}
                              style={pickerSelectStyles}
                              value={formData[item.question_id] || ''}
                            />
                          </View>
                        )}

                        {item.question_type === 'File' && (
                          <Text style={{ ...Specs.fontRegular }}>
                            {formData[item.question_id] != undefined
                              ? extractFilenameFromURL(
                                  formData[item.question_id],
                                )
                              : ''}
                          </Text>
                        )}

                        {item.question_type === 'Priority' && (
                          <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}>
                            {item.option_value.map((option, idx) => {
                              const isEnable =
                                formData[item.question_id]?.includes(option);
                              return (
                                <TouchableOpacity
                                  onPress={() =>
                                    handleCheckboxChange(
                                      item.question_id,
                                      option,
                                    )
                                  }
                                  style={{
                                    borderColor: isEnable ? '#6895d4' : 'black',
                                    borderWidth: 1,
                                    padding: 5,
                                    borderRadius: 5,
                                    marginHorizontal: 5,
                                    backgroundColor: isEnable
                                      ? '#6895d4'
                                      : 'white',
                                  }}>
                                  <Text
                                    style={[
                                      styles.radioButtonLabel,
                                      {
                                        color: isEnable ? 'white' : 'black',
                                        fontSize: 18,
                                      },
                                    ]}>
                                    {option}
                                  </Text>
                                </TouchableOpacity>
                              );
                            })}
                          </ScrollView>
                        )}

                        {item.question_type === 'Priority' && (
                          <ScrollView
                            horizontal
                            style={{ marginTop: 15 }}
                            contentContainerStyle={{
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}
                            showsHorizontalScrollIndicator={false}>
                            {formData[item.question_id] &&
                              formData[item.question_id].length > 0 && (
                                <Text style={{ color: '#6895d4' }}>
                                  Selected priority:-
                                </Text>
                              )}
                            {formData[item.question_id]?.map((item, index) => (
                              <View
                                style={{
                                  borderColor: 'black',
                                  borderWidth: 1,
                                  padding: 5,
                                  borderRadius: 5,
                                  marginHorizontal: 5,
                                }}>
                                <Text>
                                  {index + 1}:{item}
                                </Text>
                              </View>
                            ))}
                          </ScrollView>
                        )}

                        {item.question_type === 'TimePicker' && (
                          <>
                            <TouchableOpacity
                              style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                borderColor: 'black',
                                borderWidth: 1,
                                alignItems: 'center',
                                paddingVertical: 5,
                              }}
                              onPress={() => {
                                setOpenTimPicker(true);
                                setcurrentQID(item.question_id);
                              }}>
                              <Text
                                style={{
                                  ...Specs.fontRegular,
                                  marginLeft: 10,
                                }}>
                                {formData[item.question_id] !== undefined
                                  ? moment(formData[item.question_id]).format(
                                      'hh:mm A',
                                    )
                                  : ''}
                              </Text>

                              <Icon
                                name="calendar"
                                style={{ paddingHorizontal: 5 }}
                                size={30}
                                ma
                                color="#3f4967"
                              />
                            </TouchableOpacity>

                            <DateTimePicker
                              isVisible={openTimePicker}
                              onConfirm={date => handleToDatePicker(date)}
                              onCancel={() => setOpenTimPicker(false)}
                              date={new Date(date)}
                              // maximumDate={new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())}
                              // maximumDate={new Date()}
                              mode="time"
                              is24hour
                            />
                          </>
                        )}

                        {item.question_type === 'DatePicker' && (
                          <>
                            <TouchableOpacity
                              style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                borderColor: 'black',
                                borderWidth: 1,
                                alignItems: 'center',
                                paddingVertical: 5,
                              }}
                              onPress={() => {
                                setOpenDatePicker(true);
                                setcurrentQID(item.question_id);
                              }}>
                              <Text
                                style={{
                                  ...Specs.fontRegular,
                                  marginLeft: 10,
                                }}>
                                {formData[item.question_id] !== undefined
                                  ? moment(formData[item.question_id]).format(
                                      'DD-MM-YYYY',
                                    )
                                  : ''}
                              </Text>

                              <Icon
                                name="calendar"
                                style={{ paddingHorizontal: 5 }}
                                size={30}
                                color="#3f4967"
                              />
                            </TouchableOpacity>

                            <DateTimePicker
                              isVisible={openDatePicker}
                              onConfirm={date => handleToDatePicker(date)}
                              onCancel={() => setOpenDatePicker(false)}
                              date={new Date(date)}
                              // maximumDate={new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())}
                              // maximumDate={new Date()}
                              mode="date"
                              is24hour
                            />
                          </>
                        )}
                      </View>
                    )}
                  />
                  {dataArray.servery_terms != '' && (
                    <View style={{ flexDirection: 'column' }}>
                      <View style={{ flexDirection: 'row' }}>
                        <CheckBox
                          value={isChecked}
                          onValueChange={value => {
                            setIsChecked(value);
                          }}
                          tintColors={{
                            true: '#6895d4',
                            false: '#6895d4',
                          }}
                        />
                        <TouchableOpacity onPress={()=>{
                          var data=showWebview;
                            setShowWebview(!data);
                          
                        }}>


                        <Text style={{ marginTop: 5, fontSize: 14 }}>
                          {'Please see our terms and conditions '}
                          <Text
                            style={{
                              marginTop: 5,
                              fontSize: 14,
                              color: COLOR_CODES.red,
                            }}>
                          
                             click here
                          </Text>
                        </Text>
                        </TouchableOpacity>
                      </View>

                      {showWebview &&(
                            <View
                            style={{
                              padding: 10,
                              flex: 1,
                              flexDirection: 'column',
                            }}>
                            <WebView
                              style={{ height: 50 }}
                              source={{ html: `${customStyles}${dataArray.servery_terms}`}}
                              domStorageEnabled={true}
                              javaScriptEnabled={true}
                              scalesPageToFit
                            />
                          </View>

                      )}

                    
                    </View>
                  )}

                  <TouchableOpacity
                    disabled={isLoading}
                    style={styles.buttonStyle}
                    onPress={() => checkValidtion()}>
                    <Text style={styles.styleSubmit}>Submit</Text>
                    {isLoading == true ? (
                      <ActivityIndicator
                        style={{ marginLeft: 10 }}
                        color={COLOR_CODES.white}
                      />
                    ) : null}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    );
  }),
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    width: Dimensions.get('window').width - 40,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    maxHeight: Dimensions.get('window').height - 80,
  },
  scrollViewContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centeredContent: {
    justifyContent: 'center',
    alignItems: 'center',
    height: Dimensions.get('window').height / 2, // Adjust the height as needed
  },
  text: {
    fontSize: 20,
    textAlign: 'center',
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: height, // Ensure the height of ScrollView is at least the height of the screen
  },
  centeredView: {
    backgroundColor: 'red',
    padding: 20,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  text: {
    fontSize: 18,
    color: '#333',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  styleSubmit: {
    color: '#fff',
    fontSize: 20,
    ...Specs.fontMedium,
  },
  buttonStyle: {
    backgroundColor: '#6895d4',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginTop: 20,
    flexDirection: 'row',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  headerView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalView: {
    width: '95%',
    marginBottom: 20,
    backgroundColor: 'blue',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },

  questionContainer: {
    marginBottom: 20,
  },
  questionTitle: {
    fontSize: 18,
    marginBottom: 10,
    ...Specs.fontMedium,
  },
  headerStyle:{
    marginBottom: 30,
    flexDirection:'column'
  },
  surveyTitle: {
    fontSize: 16,
    
    color: '#000',
    alignSelf: 'center',
    ...Specs.fontSemibold,
  },
  input: {
    height: 40,
    borderColor: 'black',
    borderWidth: 1,
    paddingHorizontal: 10,
    ...Specs.fontRegular,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    marginLeft: 10,
  },
  radioButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  radioButton: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'gray',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: 'gray',
  },
  radioButtonLabel: {
    ...Specs.fontRegular,
    color: '#545a6b',
    fontSize: 12,
  },
  button: {
    backgroundColor: 'transparent',
    width: '100%',
    marginTop: 10,
  },
  customButtonTitleStyle: {
    fontSize: 14,
    color: '#FFFFFF',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  totalSuery: {
    fontSize: 10,
    color: '#000',
    marginTop: 2,
    alignSelf: 'center',
    ...Specs.fontSemibold,
  },
  previouSurvey: {
    fontSize: 10,

    alignSelf: 'center',
    ...Specs.fontSemibold,
  },
  counterText: {
    fontSize: 10,
    // marginBottom: 5,
    marginTop: 10,
    color: 'red',
    // alignSelf: 'center',
    ...Specs.fontSemibold,
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
    fontFamily: 'Montserrat-Regular',
  },
  inputAndroid: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
    fontFamily: 'Montserrat-Regular',
  },
  placeholder: {
    color: 'gray',
    fontFamily: 'Montserrat-Regular',
  },
});

export default SurveyModal;
