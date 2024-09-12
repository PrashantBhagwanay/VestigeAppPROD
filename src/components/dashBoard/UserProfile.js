//@flow

import React, { Component } from 'react';
import {
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
  Platform,
  Modal,
} from 'react-native';
import { Specs } from 'app/src/utility/Theme';
import { commaSeperateAmount, socialShare } from 'app/src/utility/Utility';
import Banner from 'app/src/screens/Dashboard/Banner';
import ShadowView from 'app/src/components/dashBoard/ShadowView';
import { trackEvent } from 'app/src/utility/AnalyticsUtils';
import { RECOMMENDATION_BUTTON_PRESS } from 'app/src/utility/GAEventConstants';
import { UserRole, TrainingTypeEnum } from 'app/src/utility/constant/Constants';
import autobind from 'autobind-decorator';
import { strings } from 'app/src/utility/localization/Localized';
import { observer, inject } from 'mobx-react';
import PlaceHolder from 'app/src/components/Placeholder';
import { Icon } from 'react-native-elements';
import AlertClass from 'app/src/utility/AlertClass';
import Loader from 'app/src/components/loader/Loader';
import { observable } from 'mobx';
import ImagePickerModal from '../imagePickerModal';
import {
  handleLaunchCamera,
  handlelaunchImageLibrary,
} from '../../services/ImageUpload';
import AnimatedLottieView from 'lottie-react-native';
import BenifitB2BModal from './BenifitB2BModal';
import { COLOR_CODES } from '../../utility/Theme';

const PSEPRATOR_IMAGE = require('app/src/assets/images/DashBoardHeader/seprator.png');
const PROFILE_IMAGE = require('app/src/assets/images/DashBoardHeader/profileImage.png');
const TRAINING_IMAGE = require('app/src/assets/images/drawer/training.png');
const REFRESH_IMAGE = require('app/src/assets/images/DashBoardHeader/refresh.png');
const SHARE_IMAGE = require('app/src/assets/images/DashBoardHeader/share_icon.png');
const V20_IMAGE = require('app/src/assets/images/stamp/stamp_image.png');
const file = require('../../assets/animations/new_tag.json');
@inject('auth', 'profile', 'cart','B2CFlow')
@observer
class UserProfile extends Component {
  @observable refreshButtonStatus: boolean = false;

  constructor(props) {
    super(props);
    this.state = {
      showLoader: false,
      modalVisible: false,
      isImagePickerVisible: false,
      isB2BModalShow:false
    };
    this.profileViewRef = React.createRef();
  }

  handleClick = async type => {
    const { navigation } = this.props;

    switch (type) {
      case 'myNetwork': {
        // navigation.navigate('myNetwork');
        navigation.navigate('myNetwork', {
          countryId: this.props.profile.countryId,
        });
        break;
      }
      case 'reload': {
        this.props.profile.resetDashboardData();
        this.refreshButtonStatus = true;
        await this.props.profile.fetch();
        this.refreshButtonStatus = false;
        break;
      }
      case 'myPv': {
        navigation.navigate('groupPvGraph', { type: 'selfPv' });
        break;
      }
      case 'groupPv': {
        navigation.navigate('groupPvGraph', { type: 'groupPv' });
        break;
      }
      case 'profile':
        this.handleImagePickerVisibility(true);

        break;
      default:
    }
  };

  consistancyClickHandle = type => {
    if (type === 'Consistancy') {
      const { navigation } = this.props;
      navigation.navigate('consistancy');
    }
  };

  trainningClickHandle = type => {
    const { navigation } = this.props;
    if (type === TrainingTypeEnum.Training) {
      navigation.navigate('myTrainingScreen', { isTraining: true });
    } else if (type === TrainingTypeEnum.MyTraining) {
      navigation.navigate('myTrainingScreen');
    } else if (type === TrainingTypeEnum.NewTraining) {
      navigation.navigate('training');
    }
  };

  @autobind
  openRecommendation() {
    // trackEvent(RECOMMENDATION_BUTTON_PRESS.eventCategory, RECOMMENDATION_BUTTON_PRESS.events.NAVIGATE);
    this.props.navigation.navigate('recommendation');
  }

  handleImagePickerVisibility = value => {
    this.setState({ isImagePickerVisible: value });
  };
  onCameraOptionPress = async () => {
    this.handleImagePickerVisibility(false);
    setTimeout(async () => {
      const result = await handleLaunchCamera();
      if (result?.success) {
        var kyc = [];
        kyc[0] = {
          uri: result.data.uri,
          type: result.data.type,
          name:
            Platform.OS === 'android'
              ? result.data.fileName
              : `temp_${Math.floor(Date.now() / 1000)}.jpg`,
        };

        const form = new FormData();
        form.append('distributorId', this.props.auth.distributorID);
        form.append('UploadedImage', kyc[0]);
        await this.props.profile.uploadProfilePhoto(form);
      }
    }, 500);
  };

  onImageLibraryPress = async () => {
    // alert('onImageLibraryPress');
    this.handleImagePickerVisibility(false);
    setTimeout(async () => {
      const result = await handlelaunchImageLibrary();
      if (result?.success) {
        // updateDocImage('insert', result.data);
        var kyc = [];
        kyc[0] = {
          uri: result.data.uri,
          type: result.data.type,
          name:
            Platform.OS === 'android'
              ? result.data.fileName
              : `temp_${Math.floor(Date.now() / 1000)}.jpg`,
        };

        const form = new FormData();
        form.append('distributorId', this.props.auth.distributorID);
        form.append('UploadedImage', kyc[0]);
        await this.props.profile.uploadProfilePhoto(form);
      }
    }, 500);
  };

  render() {
    let isCurrentLevelHighest;
    const {
      currentPosition,
      nextPosition,
      previousMonthLevel,
      selfPointValue,
      groupPointValue,
      profileImageSource,
      noOfDownline,
      isNetworkCount,
      isMyPvVisible,
      isGroupPvVisible,
      isMyNetworkVisible,
      isReferFriend,
    } = this.props.profile;
    const { isProfile, openClosev2 } = this.props;
    const distributorId = this.props.auth.distributorID;
    const Isv20_qulifierData = this.props.profile.Isv20_qulifierData;
    const username = this.props.auth.username || this.props.profile.username;
    const profileImage = profileImageSource
      ? { uri: profileImageSource }
      : PROFILE_IMAGE;
    if (currentPosition && nextPosition) {
      isCurrentLevelHighest =
        currentPosition.replace(/\s/g, '').toUpperCase() ===
        nextPosition.replace(/\s/g, '').toUpperCase();
    }
    let lastLevel = previousMonthLevel;
    if (previousMonthLevel?.length === 0) lastLevel = '-----';

    if (isProfile) {
      return (
        <View style={[styles.containerInfo]}>
          <View style={styles.profileImageView}>
            <TouchableWithoutFeedback onPress={() => this.handleClick()}>
              <Banner
                styles={styles.profileImage}
                source={profileImage}
                resizeMode="contain"
                imageType="Profile"
              />
            </TouchableWithoutFeedback>
          </View>
          <View style={styles.textView}>
            <Text style={[styles.nameText, { marginTop: 0 }]}>{username}</Text>
            <Text style={[styles.trainnerText, { marginBottom: 5 }]}>
              {currentPosition}
            </Text>
          </View>
        </View>
      );
    }
    // else {
    //   return (
    //     <View style={[styles.containerInfo, {backgroundColor: '#eef1f6'}]}>
    //       <View style={styles.profileImageView}>
    //         <TouchableWithoutFeedback onPress={() => this.handleClick()}>
    //           <Banner
    //             styles={styles.profileImage}
    //             source={profileImage}
    //             resizeMode='contain'
    //             imageType='Profile'
    //           />
    //         </TouchableWithoutFeedback>
    //       </View>
    //       <View style={styles.refreshView}>
    //         <TouchableOpacity onPress={() => this.handleClick()}>
    //           <Banner
    //             styles={styles.refreshIcon}
    //             source={REFRESH_IMAGE}
    //             resizeMode='contain'
    //           />
    //         </TouchableOpacity>
    //       </View>
    //       <View style={styles.textView}>
    //         <Text style={[styles.nameText, {marginTop: 0}]}>{username}</Text>
    //         <Text style={styles.trainnerText}>{strings.userProfileComponent.trainerTitle}</Text>
    //       </View>
    //       {this.props.auth.userRole === UserRole.Trainer && (
    //         <View style={styles.trainnerView}>
    //           <ShadowView title={TrainingTypeEnum.Training} topImage={TRAINING_IMAGE} handleButtonClicked={this.trainningClickHandle} />
    //           <ShadowView title={TrainingTypeEnum.MyTraining} topImage={TRAINING_IMAGE} handleButtonClicked={this.trainningClickHandle} />
    //           <ShadowView title={TrainingTypeEnum.NewTraining} topImage={TRAINING_IMAGE} handleButtonClicked={this.trainningClickHandle} />
    //         </View>
    //       )}
    //     </View>
    //   )
    // }
    return (
      <View ref={this.profileViewRef} style={styles.containerInfo}>
        <Loader loading={this.props.profile.isLoading} />
        <ImagePickerModal
          isVisible={this.state.isImagePickerVisible}
          onCameraPress={this.onCameraOptionPress}
          onLibraryPress={this.onImageLibraryPress}
          setModalVisiblility={() => {
            this.handleImagePickerVisibility(false);
          }}
        />

        {Isv20_qulifierData ? (
          <View style={styles.v20UserContainer}>
            <View
              // accessibilityLabel="v20_user"
              // testID="v20_user"
              style={{
                paddingTop: 5,
                paddingHorizontal: 20,
                paddingBottom: 20,
              }}
              // onPress={() => openClosev2(true)}
            >
              <Banner
                styles={styles.v20UserImage}
                source={V20_IMAGE}
                resizeMode="contain"
              />
            </View>
          </View>
        ) : null}

        <TouchableOpacity
          style={[styles.profileImageView, { width: 55, height: 55 }]}
          onPress={() => this.handleClick('profile')}>
          <PlaceHolder
            autoRun
            style={styles.profileImage}
            visible={!!profileImage}>
            <Banner
              styles={styles.profileImage}
              source={profileImage}
              resizeMode="contain"
              imageType="Profile"
            />
          </PlaceHolder>
          <View style={styles.editProfileImg}>
            <Icon name="edit" size={16} color="#919191" />
          </View>
        </TouchableOpacity>

        <View style={styles.refreshView}>
          <TouchableOpacity
            accessibilityLabel="Dashboard_Reload"
            testID="Dashboard_Reload"
            style={{ paddingTop: 20, paddingHorizontal: 20, paddingBottom: 10 }}
            disabled={this.refreshButtonStatus}
            onPress={() => this.handleClick('reload')}>
            <Banner
              styles={styles.refreshIcon}
              source={REFRESH_IMAGE}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityLabel="Dashboard_Share"
            testID="Dashboard_Share"
            style={{ paddingTop: 10, paddingHorizontal: 20, paddingBottom: 20 }}
            onPress={() => socialShare(this.profileViewRef)}>
            <Banner
              styles={styles.refreshIcon}
              source={SHARE_IMAGE}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
        <View style={styles.textView}>
          <PlaceHolder
            autoRun
            height={30}
            style={{ marginBottom: 4 }}
            visible={!!username}>
            <Text style={styles.nameText}>{username}</Text>
          </PlaceHolder>

         
          
          {/* <PlaceHolder autoRun visible={!!distributorId}>
            <Text style={[styles.currentPositionText, { marginBottom: 5, ...Specs.fontMedium } ]}>{`(${distributorId})`}</Text>
          </PlaceHolder> */}
          <PlaceHolder autoRun visible={!!currentPosition}>
            <Text
              style={
                styles.currentPositionText
              }>{`${currentPosition}-${distributorId}`}</Text>
          </PlaceHolder>

         <TouchableOpacity onPress={()=>this.props.navigation.navigate('B2CUserList')}>
         {this.props.profile.isDirectorId == 1 &&  this.props.B2CFlow.B2CUserList.length> 0 && <Text style={[styles.nameText,{color:'red'}]}>Know your B2C Joinee List {`(${this.props.B2CFlow.B2CUserList.length})`}</Text>}
         </TouchableOpacity>
          {this.props.auth.distributorType == 3 && (
             <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
             <TouchableOpacity
               style={styles.beComeDistibutorB2c}
               onPress={async () => this.setState({isB2BModalShow:true})}>
               <Icon
                 name="users"
                 type="feather"
                 color="#fff"
                 size={18}
                 iconStyle={{ marginRight: 5 }}
               />
               <Text style={styles.repeatOrderText}>
                 {strings.userProfileComponent.beComeB2Cdistbutor}
               </Text>
             </TouchableOpacity>
             <View style={styles.gifAnimatedImage}>
               <AnimatedLottieView
                 style={{ width: 50, height: 50 }}
                 source={file}
                 autoPlay={true}
                 loop
               />
             </View>

             
           </View>
            )}
                {this.props.auth.distributorType == 3&&(
                    <View style={{borderColor:'#c8e3f9',minWidth:250, backgroundColor:'#f3fafe', borderWidth:1,borderRadius:10, flexDirection:'column', padding:10}}>
                       <View style={{flexDirection:'row'}}>
                          <Text style={styles.leaderTittile}>
                              {'Leader ID:  '}
                          </Text>
                          <Text style={styles.leaderText}>
                              {this.props.profile.directorDistributorId}
                          </Text>
                      </View> 

                      <View style={{flexDirection:'row', marginTop:10,flexWrap: 'wrap'}}>
                          <Text style={styles.leaderTittile}>
                              {'Leader Name :  '}
                          </Text>
                          <Text style={styles.leaderText}>
                              {this.props.profile.directorDistributorName}
                          </Text>
                      </View> 

                     {this.props.profile.directorDistributorName!='HO' &&  <View style={{flexDirection:'row', marginTop:10}}>
                          <Text style={ styles.leaderTittile}>
                              {'Leader Phone: '}
                          </Text>
                          <Text style={styles.leaderText}>
                          {this.props.profile.directorDistributorMobNo==''?"xxxx-xxxx-xx":this.props.profile.directorDistributorMobNo}
                          </Text>
                      </View> }
                      {this.props.profile.directorDistributorName=='HO' &&(
                          <View style={{width:250, marginTop:2}}>
                          <Text style={{fontSize:10, color:COLOR_CODES.green}}>
                              {'Notes: Currently, the system has assigned you under Vestige HO network. By tomorrow 08:00 AM, a permanent leader would be assigned to you.'}
                            </Text>
                            </View>
                          
                      )}
                     
                      

                    </View>
                  )}
          

          {this.props.auth.userRole !== UserRole.Trainer ||
            (this.props.auth.distributorType == 3 && (
              <View>
                {isCurrentLevelHighest ? (
                  <PlaceHolder
                    autoRun
                    width={150}
                    height={30}
                    visible={!!nextPosition}>
                    <Text style={[styles.nextPositionText, { marginTop: 10 }]}>
                      {strings.userProfileComponent.highestLevel}
                    </Text>
                  </PlaceHolder>
                ) : (
                  <View style={[styles.levelView]}>
                    <PlaceHolder
                      autoRun
                      width={150}
                      height={30}
                      visible={
                        !!previousMonthLevel || previousMonthLevel?.length === 0
                      }>
                      <Text style={styles.nextPositionText}>
                        {strings.userProfileComponent.lastMonthLevelTitle +
                          '\n' +
                          lastLevel}
                      </Text>
                    </PlaceHolder>
                    <PlaceHolder
                      autoRun
                      width={150}
                      height={30}
                      visible={!!nextPosition}>
                      <Text style={styles.nextPositionText}>
                        {strings.userProfileComponent.nextLevel +
                          '\n' +
                          nextPosition}
                      </Text>
                    </PlaceHolder>
                  </View>
                )}
              </View>
            ))}
        </View>
        {this.props.auth.userRole !== UserRole.Trainer && (
            this.props.auth.distributorType != 3 && (
          <View style={styles.groupNetwork}>
            <Loader loading={this.state.showLoader} />
            {isMyPvVisible && (
              <View style={styles.group}>
                <View style={styles.groupInner}>
                  <TouchableOpacity onPress={() => this.handleClick('myPv')}>
                    <Text style={[styles.myPVText, styles.headingText]}>
                      {strings.userProfileComponent.myPv}
                    </Text>
                    <PlaceHolder
                      autoRun
                      width={100}
                      height={20}
                      visible={!!selfPointValue}>
                      <Text
                        numberOfLines={1}
                        style={[styles.myPVValuText, styles.valueText]}>
                        {commaSeperateAmount(selfPointValue)}
                      </Text>
                    </PlaceHolder>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            <View style={styles.seprator}>
              <Banner styles={{ height: 50 }} source={PSEPRATOR_IMAGE} />
            </View>
            {isGroupPvVisible == true && (
              <View style={styles.network}>
                <View style={styles.groupInner}>
                  <TouchableOpacity onPress={() => this.handleClick('groupPv')}>
                    <Text style={[styles.groupPVText, styles.headingText]}>
                      {strings.userProfileComponent.groupPv}
                    </Text>
                    <PlaceHolder
                      autoRun
                      width={100}
                      height={20}
                      visible={!!groupPointValue}>
                      <Text
                        numberOfLines={1}
                        style={[styles.groupPVValueText, styles.valueText]}>
                        {commaSeperateAmount(groupPointValue)}
                      </Text>
                    </PlaceHolder>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            {this.props.auth.distributorType != 3&&(
              <React.Fragment>
                  <View style={styles.seprator}>
                    <Banner styles={{}} source={PSEPRATOR_IMAGE} />
                  </View>
                  <View style={styles.network}>
                    <View style={styles.groupInner}>
                      <TouchableOpacity
                        onPress={() => this.handleClick('myNetwork')}>
                        <Text style={[styles.networkText, styles.headingText]}>
                          {this.props.profile.countryId != 2
                            ? strings.userProfileComponent.myNetworkTitle
                            : 'My Team'}
                        </Text>
                        <PlaceHolder
                          autoRun
                          width={100}
                          height={20}
                          visible={!!noOfDownline}>
                          <Text
                            numberOfLines={1}
                            style={[styles.networkValueText, styles.valueText]}>
                            {commaSeperateAmount(noOfDownline)}
                          </Text>
                        </PlaceHolder>
                      </TouchableOpacity>
                    </View>
                  </View>
                </React.Fragment>
            
            )}
                
          </View>
            ))}
        {this.props.auth.userRole !== UserRole.Trainer && (
          <View>
            {isReferFriend == true && (
              <View style={styles.recommendationView}>
                <TouchableOpacity
                  style={{ justifyContent: 'center' }}
                  onPress={() =>
                    this.props.navigation.navigate('recommendation')
                  }>
                  <Text
                    style={[styles.recommendationText, { textAlign: 'right' }]}>
                    {strings.userProfileComponent.recommendationTitle}
                  </Text>
                </TouchableOpacity>

                <View style={styles.referalView} />
                <TouchableOpacity
                  style={{ justifyContent: 'center' }}
                  onPress={() => this.props.navigation.navigate('shareScreen')}>
                  <Text
                    style={[styles.recommendationText, { textAlign: 'left' }]}>
                    {strings.userProfileComponent.referAFriendTitle}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            {this.props.profile.defaultAddressCountryId == 1 ? (
              <TouchableOpacity
                style={styles.repeatOrder}
                onPress={async () => {
                  this.setState({
                    showLoader: true,
                  });
                  await this.props.cart.fetchOrdersList();
                  this.setState({
                    showLoader: false,
                  });
                  const { getLastTenOrders } = this.props.cart;
                  if (getLastTenOrders && getLastTenOrders.length) {
                    this.props.navigation.navigate('repeatOrder');
                  } else {
                    AlertClass.showAlert(
                      'Message',
                      'No Order Placed till yet.',
                      [
                        {
                          text: strings.viewCartScreen.alertButtonTextOk,
                          onPress: () => console.log('OK Pressed'),
                        },
                      ],
                    );
                  }
                }}>
                <Icon
                  name="repeat"
                  type="feather"
                  color="#fff"
                  size={18}
                  iconStyle={{ marginRight: 5 }}
                />
                <Text style={styles.repeatOrderText}>
                  {strings.userProfileComponent.repeatOrder}
                </Text>
              </TouchableOpacity>
            ) : null}
           
          </View>
        )}
        {this.props.auth.userRole === UserRole.Trainer && (
          <View style={styles.trainnerView}>
            <ShadowView
              title={TrainingTypeEnum.Training}
              topImage={TRAINING_IMAGE}
              handleButtonClicked={this.trainningClickHandle}
            />
            <ShadowView
              title={TrainingTypeEnum.MyTraining}
              topImage={TRAINING_IMAGE}
              handleButtonClicked={this.trainningClickHandle}
            />
            <ShadowView
              title={TrainingTypeEnum.NewTraining}
              topImage={TRAINING_IMAGE}
              handleButtonClicked={this.trainningClickHandle}
            />
          </View>
        )}
       <BenifitB2BModal  isB2BModalShow={this.state.isB2BModalShow} setModalVisibleB2B={(d)=>this.setState({isB2BModalShow:d})}/>
      </View>
    );
  }
}

export default UserProfile;

const styles = StyleSheet.create({
  containerInfo: {
    marginTop: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  profileImageView: {
    width: 50,
    height: 50,
    marginTop: 16,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  editIconContainer: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    // backgroundColor: 'white',
    borderRadius: 10, // Half the size of the icon for a perfect circle
    padding: 4, // Adjust padding as needed
  },
  textView: {
    flex: 1,
    marginTop: 15,
    alignItems: 'center',
  },
  nameText: {
    ...Specs.fontSemibold,
    fontSize: 16,
    color: '#414456',
    marginTop: 7,
    // marginBottom: 1,
  },
  levelView: {
    marginTop: 15,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    flexDirection: 'row',
  },
  currentPositionText: {
    ...Specs.fontSemibold,
    fontSize: 12,
    textAlign: 'center',
    color: '#474b60',
  },
  nextPositionText: {
    ...Specs.fontRegular,
    fontSize: 12,
    textAlign: 'center',
    color: '#474b60',
  },
  groupNetwork: {
    width: '100%',
    marginTop: 20,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  group: {
    height: '100%',
    width: 150,
  },
  seprator: {
    height: 50,
    backgroundColor: 'white',
  },
  network: {
    height: '100%',
    width: 150,
  },
  groupInner: {
    flex: 1,
    alignSelf: 'center',
  },
  headingText: {
    ...Specs.fontRegular,
    marginBottom: 6,
    fontSize: 12,
    textAlign: 'center',
  },
  valueText: {
    ...Specs.fontMedium,
    fontSize: 18,
    textAlign: 'center',
  },
  myPVText: {
    color: '#2b55a4',
  },
  myPVValuText: {
    color: '#5988e0',
  },
  groupPVText: {
    color: '#156d5b',
  },
  groupPVValueText: {
    color: '#37bea1',
  },
  networkText: {
    color: '#d75c1a',
  },
  networkValueText: {
    color: '#ff8215',
  },
  trainnerText: {
    ...Specs.fontSemibold,
    fontSize: 12,
    textAlign: 'center',
    color: '#474b60',
    marginBottom: 20,
  },
  trainnerView: {
    width: '100%',
    height: 120,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    flexDirection: 'row',
  },
  recommendationView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginHorizontal: 4,
    marginVertical: 15,
    backgroundColor: '#f2f5f8',
    borderRadius: 20,
  },
  recommendationText: {
    color: '#000000',
    fontSize: 13,
    opacity: Platform.OS == 'ios' ? 0.8 : 0.5,
    ...Specs.fontSemibold,
  },
  referalView: {
    width: 2,
    backgroundColor: '#979797',
    marginHorizontal: 10,
  },
  refreshView: {
    position: 'absolute',
    alignSelf: 'flex-end',
  },
  refreshIcon: {
    height: 20,
    width: 20,
  },
  v20UserImage: {
    width: 80,
    height: 80,
  },
  v20UserContainer: {
    position: 'absolute',
    alignSelf: 'flex-start',
  },
  repeatOrder: {
    alignSelf: 'center',
    flexDirection: 'row',
    marginTop: 6,
    marginBottom: 15,
    paddingVertical: 8,
    width: 200,
    // paddingHorizontal: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
    backgroundColor: '#58cdb4',
  },
  gifAnimatedImage:{
    position: 'absolute',
     top: -15,
      right: -15 
  },
  beComeDistibutorB2c: {
    alignSelf: 'center',
    flexDirection: 'row',
    marginTop: 6,
    marginBottom: 15,
    paddingVertical: 8,
   
   paddingHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
    backgroundColor: '#FFA928',
  },
  repeatOrderText: {
    ...Specs.fontMedium,
    color: 'white',
    fontSize: 14,
  },
  modalv20Container: {
    width: '100%',
    height: 100,
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    bottom: 0,
  },
  editProfileImg: {
    position: 'absolute',
    right: 5,
    bottom: 5,
    borderWidth: 1,
    borderRadius: 15,
    padding: 2,
    backgroundColor: 'white',
    borderColor: '#919191',
  },
  leaderText: {
    ...Specs.fontRegular,
    fontSize: 12,
    textAlign: 'center',
    color: 'black',
  },
  leaderTittile: {
    ...Specs.fontSemibold,
    fontSize: 12,
    textAlign: 'center',
    color: 'black',
  },
  
});
