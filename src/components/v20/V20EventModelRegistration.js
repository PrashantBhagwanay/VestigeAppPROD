import React, { Component } from 'react';
import {
  View,
  Modal,
  Text,
  Image,
  Alert,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Platform,
  StyleSheet,
  ScrollView,
  ImageBackground,
  Dimensions,
} from 'react-native';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { CustomButton, RadioButton } from 'app/src/components/buttons/Button';
import { isIphoneXorAbove } from 'app/src/utility/Utility';
import { Specs } from 'app/src/utility/Theme';
import { strings } from 'app/src/utility/localization/Localized';
import AlertClass from 'app/src/utility/AlertClass';
import Icon from 'react-native-vector-icons/Ionicons';
import { VESTIGE_IMAGE } from '../../utility/constant/Constants';
import Loader from '../loader/Loader';
import Banner from 'app/src/screens/Dashboard/Banner';
import PlaceHolder from 'app/src/components/Placeholder';

const V20_IMAGE = require('app/src/assets/images/stamp/v20_banner.jpeg');
const V20_BG_PASSPORT = require('app/src/assets/images/stamp/v2_passport_bg.png');
const V20_EVENT = require('app/src/assets/images/stamp/v20_event.png');
const V20_EVENT_ZERO = require('app/src/assets/images/stamp/V20_count_0.jpg');
const V20_EVENT_1_DAY = require('app/src/assets/images/stamp/v20_count_day_1.png');

const PROFILE_IMAGE = require('app/src/assets/images/DashBoardHeader/profileImage.png');
const CLOSE_IMAGE = require('../../assets/images/DashBoardHeader/close.png');

@inject('auth', 'profile')
@observer
export default class V20EventModelRegistration extends Component {
  static propTypes = {
    modalVisible: PropTypes.bool,
  };

  static defaultProps = {
    modalVisible: false,
  };

  constructor(props) {
    super(props);
    this.props = props;
    this.state = {
        selectedLabel:'Yes'
    }
  }
  render() {
    const { modalVisible, openClosev2, v20SubmitData,days } =
      this.props;
    const {
      Isv20_qulifierData,
      v20qualifierRegiteraionData,
      profileImageSource,
    } = this.props.profile;
    const profileImage = profileImageSource
      ? { uri: profileImageSource }
      : PROFILE_IMAGE;
    return (
      <Modal
        animationType="fade"
        transparent
        visible={modalVisible}
        onRequestClose={() => {
          openClosev2(!modalVisible);
        }}>
        <View style={styles.modalv20Container}>
          <View
            style={[
              styles.containerInfo,
        
            ]}>
            <View style={{  alignItems: 'center' }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                  width: '100%',
                }}>
                <TouchableOpacity
                  style={{ padding: 10 }}
                  onPress={() =>
                    setTimeout(() => {
                      openClosev2(!modalVisible);
                    }, 100)
                  }>
                  <Image
                    style={styles.closeButton}
                    source={CLOSE_IMAGE}
                    tintColor="black"
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>

              <View
                style={{
                  flexDirection: 'column',
                  alignSelf: 'center',
                }}>
                <View style={{ flexDirection: 'row' ,}}>
                  <Text
                    style={{
                    //   flex: 0.5,
                      fontSize: 14,
                      textAlign: 'left',
                      color: '#707686',
                      fontWeight: 'normal',
                    }}>
                    {'Name :'}
                  </Text>
                  <Text
                    style={{
                    marginLeft:10,
                      fontSize: 14,
                      textAlign: 'left',
                      color: '#707686',
                      fontWeight: 'normal',
                      
                    }}>
                    {v20qualifierRegiteraionData[0]?.DistributorName}
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', marginTop: 15 }}>
                  <Text
                    style={{
                    //   flex: 0.5,
                      fontSize: 14,
                      textAlign: 'left',
                      color: '#707686',
                      fontWeight: 'normal',
                    }}>
                    {'DistibutorID :'}
                  </Text>
                  <Text
                    style={{
                        marginLeft:10,
                      fontSize: 14,
                      textAlign: 'left',
                      color: '#707686',
                      fontWeight: 'normal',
                    }}>
                    {v20qualifierRegiteraionData[0]?.DistributorID}
                  </Text>
                </View>

                <View style={{ flexDirection: 'row',  marginTop: 15  }}>
                  <Text
                    style={{
                    
                      fontSize: 14,
                      textAlign: 'left',
                      color: '#707686',
                      fontWeight: 'normal',
                    }}>
                    {'Level :'}
                  </Text>
                  <Text
                    style={{
                        marginLeft:10,
                      fontSize: 14,
                      textAlign: 'left',
                      color: '#707686',
                      fontWeight: 'normal',
                    }}>
                     {v20qualifierRegiteraionData[0]?.HighestLevel}
                  </Text>
                </View>


                <View style={{ flexDirection: 'row',  marginTop: 15  }}>
                  <Text
                    style={{
                      fontSize: 14,
                      marginTop:10,
                      textAlign: 'center',
                      color: '#707686',
                      fontWeight: 'normal',
                    }}>
                    {'Is Coming with partner'}
                  </Text>

                  <View style={{ flexDirection: 'row' }}>
                    <RadioButton
                      buttonText="Yes"
                      onPress={() => {
                        this.setState({ selectedLabel: 'Yes' });

                      }}
                      selectedValue={this.state.selectedLabel}
                    />
                    <RadioButton
                      buttonText="No"
                      onPress={() => {
                        this.setState({ selectedLabel: 'No' });
                      }}
                      selectedValue={this.state.selectedLabel}
                    />
                  </View>
                </View>
              </View>
            </View>
                <View style={{marginTop:10,alignItems:'center', alignSelf:'center', alignSelf:'center'}}>
                
                    
                        <CustomButton
                        {...this.props}
                        isDisabled={true}
                        handleClick={() => v20SubmitData(this.state.selectedLabel)}
                        linearGradient
                        buttonContainer={styles.button}
                        buttonTitle={'Submit'}
                        buttonTitleStyle={styles.customButtonTitleStyle}
                        primaryColor="#6895d4"
                        secondaryColor="#57a5cf"
                        accessibilityLabel="Login_Button"
                        />

            </View>

           
          </View>
        </View>
      </Modal>
    );
  }
}
const styles = StyleSheet.create({
  modalv20Container: {
    width: '100%',
    height: '100%',
    padding: 10,
    flexDirection: 'column',
    // alignItems: 'center',
    backgroundColor: '#00000066',
    justifyContent: 'center',
  },
  containerInfo: {
    width: Dimensions.get('window').width - 20,
    // height: 350,
    marginTop: isIphoneXorAbove() ? 70 : 40,
    marginBottom: isIphoneXorAbove() ? 110 : 65,
    // marginLeft: 15,
    // marginRight: 15,
    // alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 4,
  },

  closeButton: {
    width: 30,
    height: 30,
    color: '#000',
  },
  customButtonTitleStyle: {
    fontSize: 14,
    color: '#FFFFFF',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  customButtonTitleStyle: {
    fontSize: 16,
    color: '#FFFFFF',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  button: {
    width: 300,
    marginTop: '5%',
    marginLeft: 16,
    marginRight: 16,
  },
});
