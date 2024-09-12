
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
} from 'react-native';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { CustomButton } from 'app/src/components/buttons/Button';
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
export default class V20EventModel extends Component {
    static propTypes = {
        modalVisible: PropTypes.bool,
    };

    static defaultProps = {
        modalVisible: false,
    };

    constructor(props) {
        super(props);
        this.props = props;
    }
    render() {
        const { modalVisible, openClosev2 ,openClosev20EventShow2,days} = this.props;
        const { Isv20_qulifierData, v20qualifierRegiteraionData, profileImageSource } = this.props.profile;
        const profileImage = profileImageSource ? { uri: profileImageSource } : PROFILE_IMAGE;
        return (
            <Modal
                animationType="fade"
                transparent
                visible={modalVisible}
                onRequestClose={() => {
                    openClosev2(!modalVisible)
                }}
            >
                <View style={styles.modalv20Container}>
                    <View style={{ height: 300,  alignItems:'center'}}>
                        {days!=0?  
                        <Image
                            resizeMode='stretch'
                            style={{ height: 300, width: 300, position: 'absolute' }}
                            source={days!=1?V20_EVENT:V20_EVENT_1_DAY} /> 
                            : 
                            <Image
                            resizeMode='stretch'
                            style={{ height: 300, width: 300, position: 'absolute' }}
                            source={V20_EVENT_ZERO} />}
                     
                           
                        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', width: '100%' , 
                       }}>
                            <TouchableOpacity style={{ padding: 10, }} onPress={() => setTimeout(() => {
                                openClosev2(!modalVisible)
                            }, 100)}>
                             
                             <View style={{backgroundColor:'red',borderRadius:15}}>
                             <Image
                                    style={styles.closeButton}
                                    source={CLOSE_IMAGE}
                                    tintColor='white'
                                    resizeMode="contain"
                                />
                                </View>
                             
                            </TouchableOpacity>
                        </View>
                        {days!=0? 
                        <Text style={{fontSize:100, color:'#f7bd4b', fontWeight: 'bold' , marginTop:-15}}>{days}</Text>:
                         <Text style={{fontSize:100, color:'#f7bd4b', fontWeight: 'bold' , marginTop:-15}}>{''}</Text>}

                    </View>
                    {v20qualifierRegiteraionData.length>0&& 
                    v20qualifierRegiteraionData[0].IsComingWithPartner==" "&&(
                    <View style={{flexDirection:'column'}}>
                    <Text style={{fontSize:16, color:'#f7bd4b', fontWeight: 'bold' , marginTop:10,
                     alignSelf:'center'}}>{'click on button for v20 Registration'}</Text>
                    <CustomButton
                        {...this.props}
                        isDisabled={true}
                        handleClick={() => openClosev20EventShow2(modalVisible)}
                        linearGradient
                        buttonContainer={styles.button}
                        buttonTitle={'V20 Registration'}
                        buttonTitleStyle={styles.customButtonTitleStyle}
                        primaryColor="#58cdb4"
                        secondaryColor="#58cdb4"
                        accessibilityLabel="Login_Button"
                        />

                    </View>                    
             
                    )}


                </View>
            </Modal>

        )
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
    v20BannerImage: {
        height: 300,
        width: '100%'
    },
    closeButton: {
        width: 30,
        height: 30,
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
        marginTop: '5%',
        marginLeft: 16,
        marginRight: 16,
      },
});