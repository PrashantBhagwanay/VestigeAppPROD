import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
  Platform,
  Image,
  FlatList,
  TextInput,
  ScrollView,
  Dimensions
} from 'react-native';
import { Specs } from 'app/src/utility/Theme';
import VideoPlayer from 'app/src/screens/Dashboard/VideoPlayer';
import { observable, makeObservable} from 'mobx';
import CustomInput from 'app/src/components/CustomInput';
import HeaderLeftIcons from 'app/src/components/navigation/HeaderLeftIcons';
import { CustomButton } from 'app/src/components/buttons/Button';
import { inject, observer } from 'mobx-react';
import { Toast } from 'app/src/components/toast/Toast';
import { connectedToInternet, showToast } from 'app/src/utility/Utility';
import AlertClass from 'app/src/utility/AlertClass';
import { strings } from 'app/src/utility/localization/Localized';
import ImagePicker from 'react-native-image-picker';
import StarRating from '../../lib/starRating';
import { Icon } from 'react-native-elements'
import Loader from 'app/src/components/loader/Loader';
import { Header } from '../../components';

const SCREEN_WIDTH = Dimensions.get('window').width;
const REMOVE_ICON = require('app/src/assets/images/Kyc/remove_btn.png');

const CAMERA_OPTIONS = {
  title: 'Upload Photo',
  takePhotoButtonTitle: 'Take Photo',
  storageOptions: {
    skipBackup: true,
    path: 'images',
  },
  mediaType: 'photo'
};

const VIDEO_OPTIONS = {
  title: 'Upload Video',
  takePhotoButtonTitle: 'Take Video',
  storageOptions: {
    skipBackup: true,
    path: 'images',
  },
  mediaType: 'video',
  durationLimit: 15,
  videoQuality: 'medium',
  allowsEditing: true
}

@inject('products', 'auth')
@observer
export default class OrderFeedback extends Component {
  @observable myRatingObject

  constructor(props) {
    super(props);
    makeObservable(this);
    this.state = {
      feedbackText: '',
      isEditable: false,
      productReviewImageUri: '',
      productReviewVideoUri: '',
      isLoading: false,
      reviewLabelsOnlineDelivery: [
        {
          name: 'Product Quality',
          value: 0
        },
        {
          name: 'Delivery Quality',
          value: 0
        },
        {
          name: 'Packaging Quality',
          value: 0
        }
      ],
      reviewLabelsStorePickup: [
        {
          name: 'Product Quality',
          value: 0
        },
        {
          name: 'Store Ambience',
          value: 0
        },
        {
          name: 'Service Level',
          value: 0
        }
      ]
    }
  }

  getReviewsValueArrayList = (type) => {
    const reviewArrrayList = type === 'Shipping' ? this.state.reviewLabelsOnlineDelivery : this.state.reviewLabelsStorePickup
    reviewArrrayList[0].value = this.myRatingObject.productQuality
    reviewArrrayList[1].value = type === 'Shipping' ?  this.myRatingObject.deliveryQuality : this.myRatingObject.storeAmbience
    reviewArrrayList[2].value = type === 'Shipping' ? this.myRatingObject.packagingQuality : this.myRatingObject.serviceLevel
    return reviewArrrayList
  }

  async componentDidMount() {
    const res = await this.props.products.getProductRatings(this.props.route.params.productSkuCode, 'getMyReview');
    if (res.success) {
      this.myRatingObject = this.props.products.productFeedbackResponse.length && this.props.products.productFeedbackResponse[0]
      if (this.myRatingObject) {
        this.setState({
          feedbackText: this.myRatingObject.reviewDetail,
          isEditable: true,
          ...(this.myRatingObject.reviewImages ? { 'productReviewImageUri': this.myRatingObject.reviewImages[0].imageUrl } : {}),
          ...(this.myRatingObject.reviewVideos ? { 'productReviewVideoUri': this.myRatingObject.reviewVideos[0].videoUrl } : {}),
          ...(this.myRatingObject.deliveryType === 'Shipping' ? { 'reviewLabelsOnlineDelivery': this.getReviewsValueArrayList(this.myRatingObject.deliveryType) } : { 'reviewLabelsStorePickup' : this.getReviewsValueArrayList(this.myRatingObject.deliveryType) }),
        })
      }
    }
  }

  onSubmitHandle = async () => {
    const isConnectedToInternet = await connectedToInternet();
    const { productSkuCode, productName, orderModeName, locationId } = this.props.route.params
    let storePickUpKeys, onlineDeliveryKeys

    if (isConnectedToInternet) {
      if (this.state.feedbackText) {
        if (orderModeName === 'Self') {
          storePickUpKeys = {
            'productQuality': this.state.reviewLabelsStorePickup[0].value,
            'storeAmbience': this.state.reviewLabelsStorePickup[1].value,
            'serviceLevel': this.state.reviewLabelsStorePickup[2].value,
            'deliveryType': 'StorePickup'
          }
        }
        else {
          onlineDeliveryKeys = {
            'productQuality': this.state.reviewLabelsOnlineDelivery[0].value,
            'deliveryQuality': this.state.reviewLabelsOnlineDelivery[1].value,
            'packagingQuality': this.state.reviewLabelsOnlineDelivery[2].value,
            'deliveryType': 'Shipping'
          }
        }

        const data = {
          ...(this.state.isEditable ? {...this.myRatingObject} : {}),
          'productCode': productSkuCode,
          ...(orderModeName === 'Self' ? storePickUpKeys : onlineDeliveryKeys),
          'distributorId': this.props.auth.distributorID,
          'reviewDetail': this.state.feedbackText,
          'productName': productName,
          ...(this.state.productReviewImageUri ? { 'reviewImages': [{ 'imageUrl': this.state.productReviewImageUri }] } : { 'reviewImages': null }),
          ...(this.state.productReviewVideoUri ? { 'reviewVideos': [{ 'videoUrl': this.state.productReviewVideoUri }] } : { 'reviewVideos': null }),
          locationId: locationId,
        }
        this.setState({ isLoading: true })
        const res = await this.props.products.submitProductRatings(data, this.state.isEditable)
        this.setState({ isLoading: false })
        if (res.success) {
          AlertClass.showAlert('',
            strings.order.orderFeedback.ratingAndReviewSubmitted,
            [{ text: strings.commonMessages.ok, onPress: () => { this.props.navigation.goBack() } }])
        }
        else {
          showToast(res.message, Toast.type.ERROR)
        }
      }
      else {
        showToast(strings.order.orderFeedback.giveSomefeedbackMessage, Toast.type.ERROR)
      }
    }
    else {
      showToast(strings.commonMessages.noInternet, Toast.type.ERROR)
    }
  }

  onStarRatingPress(rating, index) {
    const { orderModeName } = this.props.route.params
    let reviewLabelsOnlineDelivery = orderModeName === 'Self' ? this.state.reviewLabelsStorePickup : this.state.reviewLabelsOnlineDelivery
    reviewLabelsOnlineDelivery[index].value = rating
    this.setState({ reviewLabelsOnlineDelivery })
  }

  uploadImageOrVideo = async (options) => {
    ImagePicker.showImagePicker(options, async (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      }
      else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      }
      else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      }
      else {
        console.log('ImagePicker Image: ', response.uri);

        if (1024 * 1024 * 8 <= response.fileSize) {
          alert(strings.order.orderFeedback.imageMaxSizeMessage);
          return;
        }
        const data = {
          uri: response.uri,
          name: options.mediaType === 'photo' ? Platform.OS === 'android' ? response.fileName : `temp_${Math.floor(Date.now() / 1000)}` : `temp_${Math.floor(Date.now() / 1000)}.mp4`,
          type: options.mediaType === 'photo' ? response.type : 'video/mp4'
        }
        const uploadData = new FormData();
        uploadData.append('file', data);
        uploadData.append('filetype', options.mediaType === 'photo' ? 'IMAGE' : 'VIDEOS');
        this.setState({
          isLoading: true
        })
        const res = await this.props.products.submitFileUpload(uploadData, options.mediaType === 'photo' ? 'IMAGE' : 'VIDEOS')
        this.setState({
          isLoading: false
        })
        if (res.success) {
          if (options.mediaType === 'photo') {
            this.setState({ productReviewImageUri: res.uri })
          }
          else {
            this.setState({ productReviewVideoUri: res.uri })
          }
        }
      }
    });
  }

  renderReviewLabel = (item, index) => {
    return (
      <View style={styles.reviewLabelContainer}>
        <Text style={styles.reviewLabelStyles}>{item.name}</Text>
        <StarRating
          disabled={false}
          maxStars={5}
          // containerStyle={{ width: 200, borderWidth: 1 }}
          starStyle={{ paddingHorizontal: 2 }}
          rating={item.value}
          startSize={5}  //Not working
          emptyStar='ios-star-outline'
          fullStar='ios-star'
          halfStar='ios-star-half'
          iconSet='Ionicons'
          fullStarColor='#f2b01e'
          selectedStar={(rating) => this.onStarRatingPress(rating, index)}
        />
      </View>
    )
  }

  isTextInputEditable = (reviewLabelsArray) => {
    // Disabling the text input if any of the rating is empty.
    const found = reviewLabelsArray.some(el => el.value === 0)
    if (found) {
      return false
    }
    return true
  }

  render() {
    const { orderModeName } = this.props.route.params
    const { productReviewImageUri, productReviewVideoUri } = this.state
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <Header
          navigation={this.props.navigation}
          screenTitle={strings.order.orderFeedback.screenTitle}
        />
        <ScrollView style={styles.mainContainer}>
          <Loader loading={this.state.isLoading} />
          <Text style={styles.feedbackText}>{strings.order.orderFeedback.productFeatureRatings}</Text>
          <View style={styles.flatListContainer}>
            <FlatList
              data={orderModeName === 'Self' ? this.state.reviewLabelsStorePickup : this.state.reviewLabelsOnlineDelivery}
              keyExtractor={(item, index) => item + index}
              renderItem={({ item, index }) => this.renderReviewLabel(item, index)}
              scrollEnabled={false}
              extraData={this.state}
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.feedbackInput}
              value={this.state.feedbackText}
              maxLength={200}
              multiline
              placeholderTextColor='#46586f'
              editable={this.isTextInputEditable(orderModeName === 'Self' ? this.state.reviewLabelsStorePickup : this.state.reviewLabelsOnlineDelivery)}
              underlineColorAndroid='transparent'
              placeholder={strings.order.orderFeedback.writeReview}
              onChangeText={(value) => this.setState({ feedbackText: value })}
            />
            {/* <CustomInput 
              placeholder='Your Feedback is valuable to us...'
              marginHorizontal={17}
              showIcon={false}
              numberOfLines={4}
              maxLength={100}
              style={{ height: 10, borderWidth: 1 }}
              multiline
              editable={!!this.state.starCount}
              value={this.state.feedbackText}
              onChangeText={(value) => this.setState({ feedbackText: value })}
            /> */}
          </View>
          <Text style={styles.feedBackLengthCount}>{`${this.state.feedbackText.length} / 200`}</Text>
          <TouchableOpacity
            style={[styles.buttonContainer, { marginTop: 20, marginBottom: 20 }]}
            onPress={() => this.uploadImageOrVideo(CAMERA_OPTIONS)}
          >
            <Text style={styles.buttonText}>{strings.order.orderFeedback.uploadPhoto}</Text>
            <Icon
              name='cloud-upload'
              type='simple-line-icon'
              color='#979797'
            />
          </TouchableOpacity>
          {
            productReviewImageUri ? (
              <View style={styles.uploadImageStyles}>
                <Image
                  style={{ width: 90, height: 110 }}
                  source={{ uri: productReviewImageUri }}
                />
                <TouchableOpacity
                  style={[styles.removeIcon, { left: 86 }]}
                  onPress={() => this.setState({ productReviewImageUri: '' })}
                >
                  <Image
                    style={{ width: 20, height: 20 }}
                    source={REMOVE_ICON}
                  />
                </TouchableOpacity>
              </View>
            ) : null
          }
          <TouchableOpacity
            style={[styles.buttonContainer, { marginBottom: 50 }]}
            onPress={() => this.uploadImageOrVideo(VIDEO_OPTIONS)}
          >
            <Text style={styles.buttonText}>{strings.order.orderFeedback.uploadVideo}</Text>
            <Icon
              name='cloud-upload'
              type='simple-line-icon'
              color='#979797'
            />
          </TouchableOpacity>
          {
            productReviewVideoUri ? (
              <View style={[styles.uploadImageStyles, { width: SCREEN_WIDTH * 0.7 }]}>
                <VideoPlayer
                  source={productReviewVideoUri}
                  style={{ height: 220 }}
                  paused
                  disableSeekbar
                  disablePlayPause
                />
                <TouchableOpacity
                  style={[styles.removeIcon, { left: SCREEN_WIDTH * 0.65 }]}
                  onPress={() => this.setState({ productReviewVideoUri: '' })}
                >
                  <Image
                    style={{ width: 20, height: 20 }}
                    source={REMOVE_ICON}
                  />
                </TouchableOpacity>
              </View>
            ) : null
          }
          <View style={styles.submitButtomContainer}>
            <CustomButton
              handleClick={() => { this.onSubmitHandle() }}
              linearGradient
              buttonContainer={styles.button}
              buttonTitle={strings.order.orderFeedback.submit}
              buttonTitleStyle={styles.customButtonTitleStyle}
              primaryColor="#6895d4"
              secondaryColor="#57a5cf"
            />
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    )
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 10
  },
  feedbackText: {
    ...Specs.fontMedium,
    paddingTop: 16,
    marginBottom: 15,
    paddingLeft: 17,
    color: '#373e73',
    fontSize: 16
  },
  button: {
    width: '100%',
  },
  customButtonTitleStyle: {
    color: '#FFFFFF',
    fontSize: 16,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    paddingVertical: 11,
    paddingHorizontal: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    borderWidth: 1,
    marginHorizontal: 14,
    borderColor: '#979797',
  },
  buttonText: {
    ...Specs.fontMedium,
    color: '#46586f',
    fontSize: 12
  },
  inputContainer: {
    paddingTop: 20,
    borderTopColor: '#f2f5f8',
    borderTopWidth: 10
  },
  feedbackInput: {
    borderColor: '#979797',
    borderWidth: 1,
    marginHorizontal: 14,
    textAlignVertical: 'top',
    height: 90,
    paddingLeft: 10
  },
  submitButtomContainer: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'flex-end'
  },
  feedBackLengthCount: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    marginRight: 20,
    marginTop: 3
  },
  flatListContainer: {
    height: 150,
    paddingBottom: 5
  },
  reviewLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    paddingHorizontal: 16
  },
  uploadImageStyles: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    flex: 1,
    marginHorizontal: 14,
    marginBottom: 20
  },
  reviewLabelStyles: {
    fontSize: 16,
    ...Specs.fontRegular,
    alignSelf: 'center'
  },
  removeIcon: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    position: 'absolute',
    // left: 86, 
    top: -18
  }
})    