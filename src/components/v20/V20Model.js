
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
const PROFILE_IMAGE = require('app/src/assets/images/DashBoardHeader/profileImage.png');
const CLOSE_IMAGE = require('../../assets/images/DashBoardHeader/close.png');

@inject('auth', 'profile')
@observer
export default class V20Model extends Component {
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
        const { modalVisible, openClosev2 } = this.props;
        const { Isv20_qulifierData, v20qualifierData, profileImageSource } = this.props.profile;
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
                    <View style={{ height: 300 }}>
                        <Image
                            resizeMode='stretch'
                            style={{ height: 300, width: '100%', position: 'absolute' }}
                            source={V20_IMAGE} />
                        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', width: '100%' }}>
                            <TouchableOpacity style={{ padding: 10, }} onPress={() => setTimeout(() => {
                                openClosev2(!modalVisible)
                            }, 100)}>
                                <Image
                                    style={styles.closeButton}
                                    source={CLOSE_IMAGE}
                                    tintColor='white'
                                    resizeMode="contain"
                                />
                            </TouchableOpacity>
                        </View>


                    </View>



                    <View style={{ flexDirection: 'column', backgroundColor: 'white' }}>

                        <Banner
                            styles={{
                                width: '100%',
                                height: 200,
                                position: 'absolute',
                            }}
                            resizeMode='stretch'
                            source={V20_BG_PASSPORT}
                        />

                        <Text style={{ fontSize: 20, padding: 10, textAlign: 'center', color: '#707686', fontWeight: 'bold' }}>
                            {strings.v20User.v20_title}
                        </Text>

                        <View style={{ flexDirection: 'row', marginTop: 5, padding: 10, }}>

                            <View style={{}}>

                                <PlaceHolder
                                    autoRun
                                    style={{ height: 120, width: 120, }}
                                    visible={!!profileImage}>
                                    <Banner
                                        styles={{ height: 120, width: 120, }}
                                        source={profileImage}
                                        resizeMode="contain"
                                        imageType="Profile"
                                    />
                                </PlaceHolder>
                            </View>

                            <View style={{ flexDirection: 'column', marginLeft: 20, alignSelf: 'center' }}>

                                <View style={{ flexDirection: 'row', }}>
                                    <Text style={{ fontSize: 15, textAlign: 'left', color: '#707686', fontWeight: 'bold' }}>
                                        {'Name :'}
                                    </Text>
                                    <Text style={{ fontSize: 15, marginLeft: 10, textAlign: 'left', color: '#707686', fontWeight: 'bold' }}>
                                        {v20qualifierData[0]?.DistributorName}
                                    </Text>

                                </View>

                                <View style={{ flexDirection: 'row', marginTop: 10 }}>
                                    <Text style={{ fontSize: 15, textAlign: 'center', color: '#707686', fontWeight: 'bold' }}>
                                        {'ID :'}
                                    </Text>
                                    <Text style={{ fontSize: 15, marginLeft: 10, textAlign: 'center', color: '#707686', fontWeight: 'bold' }}>
                                        {v20qualifierData[0]?.DistributorID}
                                    </Text>

                                </View>

                                <View style={{ flexDirection: 'row', marginTop: 10 }}>
                                    <Text style={{ fontSize: 15, textAlign: 'center', color: '#707686', fontWeight: 'bold' }}>
                                        {'Level :'}
                                    </Text>
                                    <Text style={{ fontSize: 15, marginLeft: 10, textAlign: 'center', color: '#707686', fontWeight: 'bold' }}>
                                        {v20qualifierData[0]?.LevelName}
                                    </Text>

                                </View>
                            </View>

                        </View>
                        <View style={{ backgroundColor: 'black', padding: 0, marginTop: 10, alignContent: 'center' }}>
                            <View style={{ flexDirection: 'row' }}>

                                <View style={{ alignContent: 'flex-end', flexDirection: 'column', padding: 10, flex: 0.5 }}>
                                    <Text style={{ fontSize: 18, textAlign: 'right', color: 'white', fontWeight: 'normal' }}>
                                        {'Event Date:'}
                                    </Text>
                                    <Text style={{ fontSize: 20, textAlign: 'right', color: 'white', fontWeight: 'bold', }}>
                                        {v20qualifierData[0]?.EventDate}
                                    </Text>

                                </View>
                                <View style={{ height: 60, width: 1, marginTop: 5, marginLeft: 10, marginRight: 10, backgroundColor: 'white' }}>

                                </View>

                                <View style={{ alignContent: 'flex-start', flexDirection: 'column', padding: 10, flex: 0.5, }}>
                                    <Text style={{ fontSize: 18, textAlign: 'left', color: 'white', fontWeight: 'normal' }}>
                                        {'Event Location:'}
                                    </Text>
                                    <Text style={{ fontSize: 20, textAlign: 'left', color: 'white', fontWeight: 'bold', }}>
                                        {v20qualifierData[0]?.EventVenue}
                                    </Text>

                                </View>


                            </View>





                        </View>

                    </View>



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
        backgroundColor: '#00000040',
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
});