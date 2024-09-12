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
  Dimensions,
  Alert,
  Modal
} from 'react-native';
import { Specs } from 'app/src/utility/Theme';
import VideoPlayer from 'app/src/screens/Dashboard/VideoPlayer';
import { observable, makeObservable } from 'mobx';
import CustomInput from 'app/src/components/CustomInput';
import HeaderLeftIcons from 'app/src/components/navigation/HeaderLeftIcons';
import { CustomButton } from 'app/src/components/buttons/Button';
import { inject, observer } from 'mobx-react';
import { Toast } from 'app/src/components/toast/Toast';
import { connectedToInternet, showToast } from 'app/src/utility/Utility';
import AlertClass from 'app/src/utility/AlertClass';
import { strings } from 'app/src/utility/localization/Localized';
import StarRating from '../../lib/starRating';
import { Icon } from 'react-native-elements'
import Loader from 'app/src/components/loader/Loader';
import { EventRegister } from 'react-native-event-listeners';
import { Header } from '../../components';
import ImagePickerModal from '../../components/imagePickerModal';
import {
  handleLaunchCamera,
  handlelaunchImageLibrary,
} from '../../services/ImageUpload';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const REMOVE_ICON = require('app/src/assets/images/Kyc/remove_btn.png');
const Image_Upload_Icon = require('app/src/assets/images/ic_img_upload.png');
const Video_Upload_Icon = require('app/src/assets/images/ic_video_upload.png');
const CHECK_MARK = require('app/src/assets/images/ProductsRating/checkMark.png');

const CAMERA_OPTIONS = {
  mediaType: 'photo'
};
const VIDEO_OPTIONS = {
  mediaType: 'video',
  durationLimit: 15,
  videoQuality: 'medium',
}

@inject('products', 'auth', 'cart')
@observer
export default class OrderTypeFeedback extends Component {
  @observable myRatingObject

  constructor(props) {
    super(props);
    makeObservable(this);
    this.state = {
      isImagePickerVisible:false,
      mediaTypeOption: {},
      feedbackText: '',
      isEditable: false,
      productReviewImageUri: '',
      productReviewVideoUri: '',
      submitModalVisible: false,
      isLoading: false,
      reviewLabelsOnlineDelivery: [
        {
          name: 'Delivery Quality',
          value: 0
        },
        {
          name: 'Packaging Quality',
          value: 0
        },
        {
          name: 'Speed of Delivery',
          value: 0
        }
      ],
      reviewLabelsStorePickup: [
        {
          name: 'Store Ambience',
          value: 0
        },
        {
          name: 'Service Level',
          value: 0
        },
        {
          name: 'Staff Behaviour',
          value: 0
        }
      ]
    }
  }

  getReviewsValueArrayList = (type) => {
    const reviewArrrayList = type === 'Shipping' ? this.state.reviewLabelsOnlineDelivery : this.state.reviewLabelsStorePickup
    reviewArrrayList[0].value = type === 'Shipping' ? this.myRatingObject.deliveryQuality : this.myRatingObject.storeAmbience
    reviewArrrayList[1].value = type === 'Shipping' ? this.myRatingObject.packagingQuality : this.myRatingObject.serviceLevel
    reviewArrrayList[2].value = type === 'Shipping' ? this.myRatingObject.speedOfDelivery : this.myRatingObject.staffBehaviour
    return reviewArrrayList
  }

  async componentDidMount() {
    // const res = await this.props.products.getOrderRatings(this.props.route.params?.orderId);
    // if (res.success) {
    //   this.myRatingObject = this.props.products.orderFeedbackResponse
    //   console.log("this.myRatingObject" + JSON.stringify(this.props.products.orderFeedbackResponse))
    //   if (this.myRatingObject) {
    //     this.setState({
    //       feedbackText: this.myRatingObject.reviewDetail,
    //       isEditable: true,
    //       ...(this.myRatingObject.reviewImages ? { 'productReviewImageUri': this.myRatingObject.reviewImages[0].imageUrl } : {}),
    //       ...(this.myRatingObject.reviewVideos ? { 'productReviewVideoUri': this.myRatingObject.reviewVideos[0].videoUrl } : {}),
    //       ...(this.myRatingObject.deliveryType === 'Shipping' ? { 'reviewLabelsOnlineDelivery': this.getReviewsValueArrayList(this.myRatingObject.deliveryType) } : { 'reviewLabelsStorePickup': this.getReviewsValueArrayList(this.myRatingObject.deliveryType) }),
    //     })
    //   }
    // }
  }

  onSubmitHandle = async () => {
    const isConnectedToInternet = await connectedToInternet();
    const { locationCode, productName, orderModeName, locationId, orderId, customerOrderNo,allProducts } = this.props.route.params
    let storePickUpKeys, onlineDeliveryKeys
    let totalRating0 = orderModeName === 'Self' ? this.state.reviewLabelsStorePickup[0].value : this.state.reviewLabelsOnlineDelivery[0].value
    let totalRating1 = orderModeName === 'Self' ? this.state.reviewLabelsStorePickup[1].value : this.state.reviewLabelsOnlineDelivery[1].value
    let totalRating2 = orderModeName === 'Self' ? this.state.reviewLabelsStorePickup[2].value : this.state.reviewLabelsOnlineDelivery[2].value
    var isCommentMendetory = ((totalRating0 > 3) && (totalRating1 > 3) && (totalRating2 > 3))
    
    if (isConnectedToInternet) {
      if (
        (orderModeName === 'Self' && this.state.reviewLabelsStorePickup[0].value != 0 && this.state.reviewLabelsStorePickup[1].value != 0 && this.state.reviewLabelsStorePickup[2].value != 0) 
        ||
        (orderModeName != 'Self' && this.state.reviewLabelsOnlineDelivery[0].value != 0 && this.state.reviewLabelsOnlineDelivery[1].value != 0 && this.state.reviewLabelsOnlineDelivery[2].value != 0)
        ) {
          if(isCommentMendetory || this.state.feedbackText.length > 0){
            if (/^\s+$/.test(this.state.feedbackText)) {
              showToast(strings.order.orderFeedback.giveSomefeedbackMessage, Toast.type.ERROR)
            }
            else{
              if (orderModeName === 'Self') {
                storePickUpKeys = {
                  'storeAmbience': this.state.reviewLabelsStorePickup[0].value,
                  'serviceLevel': this.state.reviewLabelsStorePickup[1].value,
                  'staffBehaviour': this.state.reviewLabelsStorePickup[2].value,
                  'deliveryType': 'StorePickup',
                  'locationId': locationId,
                  'locationCode': locationCode,
                  'orderId': orderId,
                  'orderNo': customerOrderNo
                }
              }
              else {
                onlineDeliveryKeys = {
                  'deliveryQuality': this.state.reviewLabelsOnlineDelivery[0].value,
                  'packagingQuality': this.state.reviewLabelsOnlineDelivery[1].value,
                  'speedOfDelivery': this.state.reviewLabelsOnlineDelivery[2].value,
                  'deliveryType': 'Shipping',
                  'locationId': locationId,
                  'locationCode': locationCode,
                  'orderId': orderId,
                  'orderNo': customerOrderNo
                }
              }
              const data = {
                ...(this.state.isEditable ? { ...this.myRatingObject } : {}),
                ...(orderModeName === 'Self' ? storePickUpKeys : onlineDeliveryKeys),
                'distributorId': this.props.auth.distributorID,
                'distributorName': this.props.auth.username,
                'reviewDetail': this.state.feedbackText,
                'productName': productName,
                ...(this.state.productReviewImageUri ? { 'reviewImages': [{ 'imageUrl': this.state.productReviewImageUri }] } : { 'reviewImages': null }),
                ...(this.state.productReviewVideoUri ? { 'reviewVideos': [{ 'videoUrl': this.state.productReviewVideoUri }] } : { 'reviewVideos': null }),
                locationId: locationId,
              }
              this.setState({ isLoading: true })
              // const res = await this.props.products.submitOrderRatings(data, this.state.isEditable)
              const res = await this.props.products.submitOrderRatings(data, this.state.isEditable, customerOrderNo)
              await this.props.cart.fetchRecentOrders();
              this.setState({ isLoading: false })
              if (res.success) {
                // this.props.navigation.navigate('productFeedbackScreen',
                //       { productSkuCode: "0",
                //         orderModeName: orderModeName,
                //         productName: "item.productName",
                //         locationId: locationId,
                //         allProducts:allProducts
                //       })
              //   setTimeout(()=>{

                
              //   Alert.alert(
              //     "Review & Rating",
              //     "Do you want to rating products?",
              //     [
              //       { text: strings.commonMessages.ok, onPress: () => {
              //         this.props.navigation.navigate('productFeedbackScreen',
              //         { productSkuCode: "0",
              //           orderModeName: orderModeName,
              //           productName: "item.productName",
              //           locationId: locationId,
              //           allProducts:allProducts
              //         })
              //       }},
              //       { text: strings.commonMessages.cancel, onPress: () => { this.props.navigation.goBack()} }
              //     ],
              //     { cancelable: false }
              //   )
              // },200)
                setTimeout(()=>{
                  this.setState({ submitModalVisible: true });
                },200)

                // AlertClass.showAlert('',
                //   strings.order.orderFeedback.ratingAndReviewSubmitted,
                //   [{ text: strings.commonMessages.ok, onPress: () => { this.props.navigation.pop(2) } }])
              }
              else {
                showToast(res.message, Toast.type.ERROR)
              }
            }
        }
        else {
            showToast(strings.order.orderFeedback.giveSomefeedbackMessage, Toast.type.ERROR)
          // showToast(strings.order.orderFeedback.giveSomefeedbackMessage, Toast.type.ERROR)
        }
      }
      else{
        showToast(strings.order.orderFeedback.provideStarRating, Toast.type.ERROR)
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

  handleImagePickerVisibility = value => {
    this.setState({ isImagePickerVisible: value });
  };

  validateImageUpload = (data) => {
    this.setState({
      mediaTypeOption: data,
    });
    this.handleImagePickerVisibility(true);
  }

  onCameraOptionPress = async () => {
    this.handleImagePickerVisibility(false);
    setTimeout(async () => {
      const result = await handleLaunchCamera(this.state.mediaTypeOption);
      if (result?.success) {
        this.uploadImageOrVideo(result,this.state.mediaTypeOption);
      }
    }, 500);
  };

  onImageLibraryPress = async () => {
    this.handleImagePickerVisibility(false);
    setTimeout(async () => {
      const result = await handlelaunchImageLibrary(this.state.mediaTypeOption);
      if (result?.success) {
        this.uploadImageOrVideo(result,this.state.mediaTypeOption);
      }
    }, 500);
  };

  uploadImageOrVideo =  async(response,options) => {
        let check = response.data?.fileName?.split('.').pop()
        console.log('res',check)
        if(check == 'jpg'){
          response.data.type = "image/jpeg"
        }
        console.log('ImagePicker Image: ', response.data.uri);

        if (1024 * 1024 * 5 <= response.data.fileSize) {
          alert(strings.order.orderFeedback.imageMaxSizeMessage);
          return;
        }
        const data = {
          uri: response?.data?.uri,
          name: options.mediaType === 'photo' ? Platform.OS === 'android' ? response.data.fileName : `temp_${Math.floor(Date.now() / 1000)}` : `temp_${Math.floor(Date.now() / 1000)}.mp4`,
          type: options.mediaType === 'photo' ? response.data.type : 'video/mp4'
        }
        const uploadData = new FormData();
        uploadData.append('file', data);
        uploadData.append('filetype', options.mediaType === 'photo' ? 'IMAGE' : 'VIDEOS');
        this.setState({
          isLoading: true
        })
        console.log('resupload',JSON.stringify(uploadData))
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
        else {
          showToast(res.message, Toast.type.ERROR)
        }
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
      <>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <>
          <Header
            navigation={this.props.navigation}
            screenTitle={this.props.route?.params?.orderModeName == 'Self' ? strings.order.orderFeedback.storePickUpTitle : strings.order.orderFeedback.couriedDeviveryTitle}
          />
          <ScrollView style={styles.mainContainer}>
            <Loader loading={this.state.isLoading} />
            <View style={styles.ratingHeaderDescriptionView}>
              <Text style={{ fontSize: 14, fontWeight: '400', textAlign: 'center', color: 'rgba(0,0,0,0.6)' }}>{strings.order.orderFeedback.ratingHeaderDescription}</Text>
            </View>
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
              <Text style={{ marginLeft: 15, marginBottom: 15, fontSize: 14, fontWeight: '600', textAlign: 'center', color: 'rgba(0,0,0,.8)' }}>{strings.order.orderFeedback.comment}</Text>
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
            </View>
            <Text style={styles.feedBackLengthCount}>{`${this.state.feedbackText.length}/200`}</Text>
            
            <View style={{width:'100%',paddingHorizontal:18, marginVertical:10}}>
              <Text style={[styles.reviewLabelStyles, {alignSelf: 'flex-start', height:25, color:'#000000'}]}>{strings.order.orderFeedback.uploadImagesAndVideos}</Text>
              <Text style={[styles.reviewLabelStyles, {alignSelf: 'flex-start', textAlign:'left', height:40, fontWeight:'300', color:'#000000'}]}>
              {strings.order.orderFeedback.maximumUploadDescription}
              </Text>
            </View>
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

            <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1, flexDirection: 'row' }}>
              <View style={{ width: 150, alignItems: 'center', justifyContent: 'center' }}>
                <TouchableOpacity
                  style={{ width: 100, height: 100, backgroundColor: '#6896D4', borderRadius: 50, alignItems: 'center', justifyContent: 'center' }}
                  onPress={() => this.validateImageUpload(CAMERA_OPTIONS)}
                >
                  <Image resizeMode={'contain'}
                    style={{ width: 40, height: 40 }}
                    source={Image_Upload_Icon} />
                </TouchableOpacity>
                <Text style={[styles.buttonText,{marginTop:20}]}>{strings.order.orderFeedback.uploadImage}</Text>
              </View>
              <View style={{ width: 150, alignItems: 'center', justifyContent: 'center' }}>
                <TouchableOpacity
                  style={{ width: 100, height: 100, backgroundColor: '#6896D4', borderRadius: 50, alignItems: 'center', justifyContent: 'center' }}
                  onPress={() => this.validateImageUpload(VIDEO_OPTIONS)}
                >
                  <Image resizeMode={'contain'}
                    style={{ width: 40, height: 40 }}
                    source={Video_Upload_Icon} />
                </TouchableOpacity>
                <Text style={[styles.buttonText,{marginTop:20}]}>{strings.order.orderFeedback.uploadVideo}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.submitButtomContainer}
            onPress={() => { this.onSubmitHandle() }}
            >
              <Text style={{fontSize:18,fontWeight:'700',color:'white'}} >{strings.order.orderFeedback.saveAndContinue}</Text>
            </TouchableOpacity>
            <Modal style={{ position: 'absolute' }}
              animationType="slide"
              visible={this.state.submitModalVisible}
              transparent
              onRequestClose={() => this.setState({ submitModalVisible: false })}
              >
                <View style={styles.modalMainContainer}>
                  <View style={styles.modalsubViewContainer}>
                    <View style={styles.modalsubViewTopContainer}>
                      <Image style={{ marginTop: 40, width: 50, height: 50 }}
                        source={CHECK_MARK}
                      />
                      <Text style={styles.modalTextThankYou}>{"Thank You!"}</Text>
                      <Text style={styles.modalTextPopupDescription}>{strings.order.orderFeedback.ratingAndReviewSubmitted}</Text>
                    </View>
                    <TouchableOpacity style={styles.modalSubmitButton} onPress={() => {
                      this.setState({ submitModalVisible: false },function(){
                        EventRegister.emit('orderRatingStatus', false);
                        this.props.navigation.goBack();
                      })
                    }}>
                      <Text style={styles.modalSubmitText}>{"DONE"}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
          </ScrollView>
          </>
        </TouchableWithoutFeedback>
        <ImagePickerModal
          isVisible={this.state.isImagePickerVisible}
          onCameraPress={this.onCameraOptionPress}
          onLibraryPress={this.onImageLibraryPress}
          setModalVisiblility={this.handleImagePickerVisibility}
        />
      </>
    )
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    marginTop: 10,
  },
  ratingHeaderDescriptionView: { 
    width: '100%',
    height: 70,
    borderBottomColor: 'rgba(110,110,110,0.3)',
    borderBottomWidth: 1, 
    alignItems: 'center', 
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor:'white'
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
    borderRadius: 10
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
    color: 'rgba(0,0,0,0.8)',
    fontSize: 12
  },
  inputContainer: {
    alignItems: 'flex-start',
    paddingTop: 20,
    width: SCREEN_WIDTH - 30,
    // borderTopColor: '#f2f5f8',
    // borderTopWidth: 10
  },
  feedbackInput: {
    borderColor: '#979797',
    backgroundColor: 'white',
    borderWidth: 1,
    marginHorizontal: 14,
    width: '100%',
    textAlignVertical: 'top',
    height: 90,
    paddingLeft: 10
  },
  submitButtomContainer: {
    flexDirection: 'row',
    flex: 1,
    height:50,
    backgroundColor:'#6895d4',
    alignItems: 'center',
    justifyContent:'center',
    marginTop:20,
    marginBottom:0,
    // position: 'absolute',
    // bottom:1
    //borderRadius:5
  },
  feedBackLengthCount: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    marginRight: 20,
    marginTop: 3
  },
  flatListContainer: {
    // height: 280,
    backgroundColor:'white',
    paddingVertical: 10
  },
  reviewLabelContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 10
  },
  uploadImageStyles: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    flex: 1,
    marginHorizontal: 14,
    marginBottom: 20
  },
  reviewLabelStyles: {
    fontSize: 14,
    height: 30,
    textAlign: 'center',
    ...Specs.fontRegular,
    alignSelf: 'center',
    fontWeight: '700',
    color: '#373E73'
  },
  removeIcon: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    position: 'absolute',
    // left: 86, 
    top: -18
  },
  modalMainContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalsubViewContainer: {
    width: SCREEN_WIDTH - 60,
    height: 280,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalsubViewTopContainer: {
    width: '100%',
    height: 200,
    padding: 10,
    borderTopRightRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSubmitText: {
    fontSize: 14,
    fontWeight: '700',
    color: 'white'

  },
  modalTextThankYou: {
    marginTop: 20,
    fontSize: 24,
    fontWeight: '500',
    color: '#222222'
  },
  modalTextPopupDescription: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    fontWeight: '400',
    color: '#999999'
  },
  modalSubmitButton: {
    marginBottom: 0,
    backgroundColor: '#6597D2',
    width: '100%',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',

  }
})    