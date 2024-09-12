import React, {Component} from 'react';
import { Text, View, TouchableOpacity, StyleSheet, Modal, TouchableHighlight, Platform } from 'react-native';
import { observer,inject } from 'mobx-react';
import { observable, makeObservable} from 'mobx';
import { Specs } from 'app/src/utility/Theme';
import VideoPlayer from 'app/src/screens/Dashboard/VideoPlayer';
import { UserRole } from 'app/src/utility/constant/Constants';
import Icon from 'react-native-vector-icons/FontAwesome';
import Orientation from 'react-native-orientation-locker';
import { strings } from 'app/src/utility/localization/Localized';
import autobind from 'autobind-decorator';
import * as AsyncStore from 'app/src/utility/AsyncStoragesUtils';
import { Toast } from 'app/src/components/toast/Toast';
import Banner from './Banner';
import { connectedToInternet } from '../../utility/Utility';

const IMAGEPATH = require('../../assets/images/video_icon.png');
const url = 'https://s3.ap-south-1.amazonaws.com/vstg-mobileapp-prod/videos/CorporateVideo.mp4'

@inject('profile', 'auth')

@observer
export default class DemoVideo extends Component {
  @observable isInternetConnected: any;
  
  constructor(props){
    super(props);
    makeObservable(this);
    this.state={
      modalVisible: false,
      paused: false
    }
  }

  async componentDidMount() {
    this.isInternetConnected = await connectedToInternet();
  }

  @autobind
  onVideoEnd() {
    this.videoPlayer.seek(0);
    this.setState({currentTime: 0, paused: true});
  }

  @autobind
  onVideoLoad(e) {
    this.setState({currentTime: e.currentTime, duration: e.duration});
  }

  @autobind
  onProgress(e) {
    this.setState({currentTime: e.currentTime});
  }

  @autobind
  playOrPauseVideo(paused) {
    this.setState({paused: !paused});
  }

  setModalVisible(visible,orientation) {
    if(orientation === 'show'){
      Orientation.lockToLandscape();
    }
    else{
      Orientation.lockToPortrait();
    }
    this.setState({modalVisible: visible});
  }

  @autobind
  modalClose(){
    this.setState({modalVisible: false});
    Orientation.lockToPortrait();
  }

  @autobind
  showToast(message: string, toastType:Toast.type) {
    // Add a Toast on screen.
    Toast.show(message, {
      duration: Toast.durations.SHORT,
      type: toastType,
      shadow: false,
      animation: true,
      hideOnPress: true,
      delay: 0,
    })
  }

  render() {
    const { newMemberClickedHandle } = this.props;
    const demoVideoFlag = this.props.profile.countryId == 1 ? true : this.props.profile.isVestigeDemoShow;
    const addDistributorFlag = this.props.profile.countryId == 1 ? true : this.props.profile.add_new_distributor_visible;
    const isGuestUser = this.props.auth.userRole === UserRole.GuestUser;
    return (
      <View style={styles.backgroundView}>
        {/* {(demoVideoFlag == true) &&
        <Text style={styles.staticText}>{strings.dashboard.demoVideo.quoteText}</Text>
        }
        {(demoVideoFlag == true) &&
        <View style={styles.mainView}>
          <View style={styles.lineDesign} />
          <View>
            <TouchableOpacity
              style={styles.videoContainer}
              onPress={() =>  {
                if(this.isInternetConnected) {
                  this.setModalVisible(true, 'show')
                }
                else {
                  setTimeout(() => {this.showToast(strings.commonMessages.noInternet, Toast.type.ERROR)}, 200)
                }
              }}
            >
              <Banner
                styles={styles.videoIcon}
                resizeMode="cover"
                source={IMAGEPATH}
              />
              <Text style={styles.videoContainerText}>{strings.dashboard.demoVideo.videoContainerText}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.lineDesign} />
        </View>
        } */}
        {(!isGuestUser && addDistributorFlag == true&& this.props.auth.distributorType != 3 ) &&
        <View style={styles.registrationView}>
          <TouchableOpacity
            style={styles.buttonView}
            onPress={() => 
              newMemberClickedHandle()}
            testID='Demo_Video_button'
            accessibilityLabel='Demo_Video_button'
          >
            <Text style={styles.textStyle}>
              Add New Distributor
            </Text>
          </TouchableOpacity>
        </View>
      }
        <Modal
          animationType="slide"
          transparent
          visible={this.state.modalVisible}
          onRequestClose={()=> this.modalClose()}
          shadowOpacity={0.5}
          supportedOrientations={['portrait', 'landscape', 'landscape-left', 'landscape-right']}
        >
          <View style={styles.modalVideoContainer}>
            <TouchableHighlight
              style={styles.videoCloseIcon}
              onPress={() => {
                Orientation.lockToPortrait();
                this.setModalVisible(!this.state.modalVisible, 'hide');
              }}
            >
              <Icon name='close' style={styles.iconStyle} />
            </TouchableHighlight>
            <VideoPlayer
              source={url}
              paused={false}
            />
          </View>
        </Modal>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  backgroundView: {
    backgroundColor: '#eef1f6',
  },
  mainView: {
    flexDirection: 'row',
    height: 33,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 5,
  },
  lineDesign: {
    backgroundColor: '#A2A2A2',
    height: 2,
    flex: 1
  },
  videoIcon: {
    height: 14,
    width: 19,
  },
  videoContainer: {
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: 4,
    width: 157,
    height: 33,
    borderColor: '#9aadb8',
    borderWidth: 2,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  videoContainerText: {
    color: '#5e7899',
    marginLeft: 8,
    ...Specs.fontMedium,
    fontSize: 14
  },
  staticText: {
    marginTop: 20,
    marginBottom: 5,
    textAlign: 'center',
    color: '#3f4967',
    ...Specs.fontRegular,
    fontSize: 12,
  },
  registrationView: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonView: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#6895d4',
    borderRadius: 50,
    marginLeft: 16,
    marginRight: 16,
    marginTop: 14,
    marginBottom: 10,
    width: 328,
    height: 48,
    justifyContent: 'center',
  },
  textStyle: {
    ...Specs.fontMedium,
    color: 'white', 
    fontSize: 16
  },
  modalVideoContainer: {
    backgroundColor: 'black', 
    flex:1
  },
  videoCloseIcon: {
    zIndex: 1, 
    top: 20,
    position: 'absolute', 
    right: 20, 
    padding: 10
  },
  iconStyle: {
    fontSize: 30, 
    color: '#FFFFFF'
  },
  videoStyle: {
    zIndex: 0, 
    flex: 1 ,
    backgroundColor: Platform.select({ios: '#000', android:'transparent'}) 
  },

  videoView: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  demoVideoContainer: {
    width: '100%',
    height: '100%'
  }
});