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
  Image,
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
import Banner from 'app/src/screens/Dashboard/Banner';
import { COLOR_CODES } from '../../../utility/Theme';
const { height } = Dimensions.get('window');
const FORWARD_IC0N = require('app/src/assets/images/productDetails/forward_icon.png');

const SurveyModelDetails = inject(
  'dashboard',
  'auth',
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
      navigation,
      visible,
      onClose,
      onSave,
      resend,
      mobileOrEmail,
      textMobileOrEmail,
    } = props;
    const [modalVisible, setModalVisible] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [dataArray, setDataArray] = useState(surveyFormList[currentIndex]);


    const handleMultiplePopUp = async () => {
      // await getSurveyFormDetails();
      setModalVisible(false);
    };


    useEffect(() => {
      if (modalVisible === false) {
      
      }
    }, [modalVisible]);

    
  

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
                    <Text style={styles.surveyTitle}>
                      {'Servery Details'}
                    </Text>
                    <TouchableOpacity
                      onPress={() => setModalVisible(false)}
                      style={{
                        position: 'absolute',
                        right: 0,
                      }}>
                      <Icon name="close" size={30} color="#3f4967" />
                    </TouchableOpacity>
                  </View>

                  <View style={{flex:1, borderRadius: 5, 
                    borderColor: 'gray',borderWidth:1}}>

                  <View style={{flexDirection:'row'}}>
                      <Text style={styles.title}>{'Vishnu Servry'} </Text>
                      <Text style={styles.title}>{'Vishnu Servry'} </Text>
                     </View>


                    </View>

            
                   
                 
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
  surveyTitle: {
    fontSize: 20,
    marginBottom: 30,
    color: '#000',
    alignSelf: 'center',
    ...Specs.fontSemibold,
  },
  title: {
    fontSize: 14,
    marginBottom: 30,
    color: '#000',
    alignSelf: 'center',
    ...Specs.fontSemibold,
  },
   forwardIcon: {
    width: 15,
    height: 18,
  },
  
});


export default SurveyModelDetails;
