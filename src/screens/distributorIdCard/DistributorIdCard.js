import React, { Component } from 'react';
import {
  Text,
  View,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
  Platform,
  ScrollView,
  PermissionsAndroid,
} from 'react-native';
import { inject, observer } from 'mobx-react';
import ImageViewer from 'react-native-image-zoom-viewer';
// import RNFetchBlob from 'rn-fetch-blob';
import ReactNativeBlobUtil from 'react-native-blob-util';
import Share from 'react-native-share';
import autobind from 'autobind-decorator';
import { observable , makeObservable} from 'mobx';
import Loader from 'app/src/components/loader/Loader';
import HeaderLeftIcons from 'app/src/components/navigation/HeaderLeftIcons';
import { checkAndroidPermission } from 'app/src/utility/permissions/Permissions';
import HeaderRightIcons from 'app/src/components/navigation/HeaderRightIcons';
import ImageViewModal from 'app/src/components/image/ImageViewModal';
import { Specs } from 'app/src/utility/Theme';
import OfflineNotice from 'app/src/components/OfflineNotice';
import { strings } from 'app/src/utility/localization/Localized';
import AlertClass from 'app/src/utility/AlertClass';
import { VESTIGE_IMAGE } from 'app/src/utility/constant/Constants';
import * as Urls from 'app/src/network/Urls';
import { Header } from '../../components';


const { width, height } = Dimensions.get('window');

@inject('profile', 'auth')
@observer
export default class DistributorIdCard extends Component {
  @observable isInternetConnected: Boolean = true;
  @observable imageList: Array = [];

  constructor(props) {
    super(props);
    makeObservable(this);
    this.props = props;
    this.state = {
      idcardUrl: '',
      isImageModalVisible: false,
      isLoading: false
    }
  }

  async componentDidMount() {
    const res = await this.props.profile.distributorIdCard(this.props.auth.distributorID)
    if (res.success) {
      this.imageList = [{
        path: `data:image/png;base64,${res.data}`
      }]
      this.setState({
        idcardUrl: res.data
      })
    }
    else {
      AlertClass.showAlert('Alert',
        res.message,
        [{ text: strings.commonMessages.ok, onPress: () => this.props.navigation.pop() }]
      )
    }
  }

  @autobind
  async networkStatus(status) {
    if (status) {
      this.isInternetConnected = status;
      await this.handleOrderDetails();
    }
  }

  closeModal = () => {
    this.setState({
      isImageModalVisible: false
    })
  }

  saveIdCard = async () => {
    const url = Urls.urlFor(`${Urls.ServiceEnum.Distributor}/${this.props.auth.distributorID}${Urls.DistributorServiceEnum.downloadIdCard}`);
    console.log('url', url) 
    const deviceDir = ReactNativeBlobUtil.fs.dirs;
    let currentDate = new Date();
    let formattedDate = currentDate.getTime();
    const fileName = 'VestigeId' + '_' + formattedDate;
    let pathToSave = deviceDir.DownloadDir + '/' + fileName + '.pdf';
    if (Platform.OS === 'android') {
      this.setState({ isLoading: true });
    }
    ReactNativeBlobUtil.config({
      //path: pathToSave,
      addAndroidDownloads: {
        path: pathToSave,
        title: fileName,
        description: `${fileName}`,
        mediaScannable: false,
        mime: 'application/pdf',
        useDownloadManager: true,
        notification: true
      },
      fileCache: true
    }).fetch("GET", url, {
      "Cache-Control": "no-store",
      Authorization: `bearer ${this.props.auth.authToken}`,
      distributorId: this.props.auth.distributorID
    }).then(async (res) => {
      if (Platform.OS === 'ios') {
        const shareData = {
          message: 'Please use your Distributor Id as password to access it.',
          title: 'Distributor Id Card',
          url: `data:pdf/pdf;base64, ${await res.base64()}`,
        }
        Share.open(shareData).then((resp) => {
          console.log(resp);
        })
          .catch((err) => {
            err && console.log(err);
          });
      } 
      else if (Platform.OS === 'android' && Platform.Version < 29) {
        res.path();
        this.setState({ isLoading: false });
        AlertClass.showAlert('Alert',
          `Your Id Card has been saved to device on : ${pathToSave}. \nPlease use your Distributor Id as password to access it.`,
          [{ text: strings.commonMessages.ok, onPress: () => console.log('Ok') }]
        )
      }
      else {
        let result = await ReactNativeBlobUtil.MediaCollection.copyToMediaStore({
          name: fileName, // name of the file
          parentFolder: '', // subdirectory in the Media Store, e.g. HawkIntech/Files to create a folder HawkIntech with a subfolder Files and save the image within this folder
          mimeType: 'application/pdf' // MIME type of the file
          },
          'Download', // Media Collection to store the file in ("Audio" | "Image" | "Video" | "Download")
          res.path() // Path to the file being copied in the apps own storage
        );
        this.setState({ isLoading: false });
        AlertClass.showAlert('Alert',
          `Your Id Card has been saved to device Downloads. \nPlease use your Distributor Id as password to access it.`,
          [{ text: strings.commonMessages.ok, onPress: () => console.log('Ok') }]
        )
      }
    }).catch((err) => {
      console.log('rnfb', err);
      this.setState({ isLoading: false });
    })
  }

  handleSaveIdCard = async () => {
    if (Platform.OS === 'android') {
      const checkPermission = await checkAndroidPermission(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE, 'Write Permission', 'Vestige needs access to your storage');
      if (Platform.Version < 29) {
        checkPermission?.granted && this.saveIdCard();
      } else {
        this.saveIdCard();
      }
    }
    else {
      this.saveIdCard();
    }
  }

  renderSaveIdCard = () => {
    return (
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          activeOpacity={0.6}
          onPress={() => this.handleSaveIdCard()}
          style={styles.saveButton}
        >
          <Text style={{ ...Specs.fontBold, color: '#fff' }}>Export PDF</Text>
        </TouchableOpacity>
      </View>
    )
  }

  render() {
    let source = `data:image/png;base64,${this.state.idcardUrl}`;
    const { isImageModalVisible, idcardUrl } = this.state;
    return (
      <View style={{ flex: 1 }}>
        {!this.isInternetConnected && <OfflineNotice networkStatus={(status) => this.networkStatus(status)} />}
        <Loader loading={this.props.profile.isLoading || this.state.isLoading} />
        <Header
          navigation={this.props.navigation}
          screenTitle={strings.drawerScreen.distributorIdCard}
        />
        {(idcardUrl != '') && this.renderSaveIdCard()}
        {(idcardUrl != '') &&
          (
            <ScrollView style={{ marginBottom: 5 }}>
              <TouchableOpacity
                style={{ height: height }}
                onPress={() => this.setState({ isImageModalVisible: true })}
              >
                <Image
                  source={{ uri: source }}
                  style={styles.image}
                  // resizeMethod='scale'
                  resizeMode='stretch'
                />
              </TouchableOpacity>
            </ScrollView>
          )
        }
        {(isImageModalVisible) &&
          (
            <ImageViewModal
              isVisible={isImageModalVisible}
              imageUrls={this.imageList}
              onClose={this.closeModal}
              index={0}
            />
          )
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  headerTitle: {
    ...Specs.fontBold,
    fontSize: 18,
    color: '#373e73',
  },
  image: {
    width: Dimensions.get('window').width,
    height: '100%',
  },
  buttonContainer: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    padding: 8,
    backgroundColor: '#fff',
    marginBottom: 2
  },
  saveButton: {
    // position: 'absolute',
    // bottom: 15,
    // right: 15,
    // width: 50,
    height: 35,
    alignItems: 'center',
    justifyContent: 'center',
    //alignSelf: 'center',
    paddingHorizontal: 20,
    borderRadius: 25,
    backgroundColor: '#6895d4',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 6,
  }
})