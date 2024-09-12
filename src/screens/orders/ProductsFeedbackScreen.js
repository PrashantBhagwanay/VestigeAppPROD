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
import ImagePicker from 'react-native-image-picker';
import StarRating from '../../lib/starRating';
import { Icon } from 'react-native-elements'
import Banner from 'app/src/screens/Dashboard/Banner';
import Loader from 'app/src/components/loader/Loader';
import { Header } from '../../components';
// import { Colors } from 'react-native/Libraries/NewAppScreen';

const SCREEN_WIDTH = Dimensions.get('window').width;
const REMOVE_ICON = require('app/src/assets/images/Kyc/remove_btn.png');
const PLACEHOLDER = require('app/src/assets/images/productList/placeHolder.png');
const THUMBS_DOWN_SELECTED = require('app/src/assets/images/ProductsRating/thumbsDownSelected.png');
const THUMBS_DOWN_UNSELECTED = require('app/src/assets/images/ProductsRating/thumbsDownUnselected.png');
const THUMBS_UP_SELECTED = require('app/src/assets/images/ProductsRating/thumbsUpSelected.png');
const THUMBS_UP_UNSELECTED = require('app/src/assets/images/ProductsRating/thumbsUpUnselected.png');
const CHECK_MARK = require('app/src/assets/images/ProductsRating/checkMark.png');
const Image_Upload_Icon = require('app/src/assets/images/ic_img_upload.png');
const Video_Upload_Icon = require('app/src/assets/images/ic_video_upload.png');

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
};

// const productsRatingItems = [
//     {
//         name: 'Product Quality',
//         value: 0
//     },
//     {
//         name: 'Delivery Quallity',
//         value: 0
//     },
//     {
//         name: 'Packaging Quality',
//         value: 0
//     }
// ]


@inject('products', 'auth')
@observer
export default class ProductsFeedbackScreen extends Component {
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
          submitModalVisible: false,
          arrOrderProducts: this.props.route.params.allProducts,
          reviewLabelsOnlineDelivery: [
              {
                  name: 'Product Quality',
                  value: 0
              },
              {
                  name: 'Delivery Quallity',
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
                  name: 'Delivery Quallity',
                  value: 0
              },
              {
                  name: 'Packaging Quality',
                  value: 0
              }
          ]
      }
  }

  getReviewsValueArrayList = (type) => {
      const reviewArrrayList = type === 'Shipping' ? this.state.reviewLabelsOnlineDelivery : this.state.reviewLabelsStorePickup
      reviewArrrayList[0].value = this.myRatingObject.productQuality
      reviewArrrayList[1].value = type === 'Shipping' ? this.myRatingObject.deliveryQuality : this.myRatingObject.storeAmbience
      reviewArrrayList[2].value = type === 'Shipping' ? this.myRatingObject.packagingQuality : this.myRatingObject.serviceLevel
      return reviewArrrayList
  }

  async componentDidMount() {
      var arr = this.state.arrOrderProducts
      arr.map((product, index) => {
          let item = product
          let productsRating = [{
              name: 'Product Quality',
              value: 0,
              skuCode: product.skuCode
          },
          {
              name: 'Delivery Quallity',
              value: 0,
              skuCode: product.skuCode
          },
          {
              name: 'Packaging Quality',
              value: 0,
              skuCode: product.skuCode
          }]
          item["reviewLabelsOnlineDelivery"] = productsRating
          item["feedbackText"] = ""
          item["isExpend"] = false
          item["isPositiveRateClicked"] = 0
          item["productReviewImageUri"] = 0
          item["productReviewVideoUri"] = 0
          return item
      })
      this.setState({ arrOrderProducts: arr })
  }

  onSubmitHandle = async () => {
      this.setState({ submitModalVisible: true });
      return
      const isConnectedToInternet = await connectedToInternet();
      const { productSkuCode, productName, orderModeName, locationId } = this.props.route.params
      let storePickUpKeys, onlineDeliveryKeys

      if (isConnectedToInternet) {
          if (this.state.feedbackText) {
              if (orderModeName === 'Self') {
                  storePickUpKeys = {
                      'productQuality': this.state.reviewLabelsStorePickup[0].value,
                      'deliveryQuality': this.state.reviewLabelsStorePickup[1].value,
                      'packagingQuality': this.state.reviewLabelsStorePickup[2].value,
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
                  ...(this.state.isEditable ? { ...this.myRatingObject } : {}),
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

  onStarRatingPress(rating,item, indexxx) {
      console.log("dataaa"+JSON.stringify(indexxx))
      let arr = this.state.arrOrderProducts
      
        let aaaa = arr.map((product, index) => {
          if(product.skuCode == item.skuCode){
              let prodItem = product
              let ittt = product["reviewLabelsOnlineDelivery"]
              ittt[indexxx].value = rating
              prodItem["reviewLabelsOnlineDelivery"] = ittt
              
              return prodItem
          }
          else{
              return product
          }
      })
      this.setState({arrOrderProducts:aaaa})
      
  }

  clickedOnPositiveReview(itemObj, index, isPositive) {
      let obj = itemObj //this.state.arrOrderProducts[index]
      obj.isExpend = true
      obj.isPositiveRateClicked = isPositive
      this.state.arrOrderProducts[index] = obj
      this.setState({ arrOrderProducts: this.state.arrOrderProducts })
  }

  OnChangeTextItem (value,item,index) {
      let itemCurrent  = item
      itemCurrent["feedbackText"] = value
      this.state.arrOrderProducts[index] = itemCurrent
      this.setState({arrOrderProducts:this.state.arrOrderProducts})
  }

  uploadImageOrVideo = async (options,item,index) => {
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
                      let productObj = item
                  if (options.mediaType === 'photo') {
                      productObj["productReviewImageUri"] = res.uri
                      this.state.arrOrderProducts[index] = productObj
                  }
                  else {
                      productObj["productReviewVideoUri"] = res.uri
                      this.state.arrOrderProducts[index] = productObj
                      // this.setState({ productReviewVideoUri: res.uri })
                  }
                  this.setState({ arrOrderProducts: this.state.arrOrderProducts })

              }
          }
      });
  }

  renderProducts = (item, index) => {
      return (
          <View>
              <View>
                  <View style={styles.itemCard}>
                      <View style={{ flexDirection: 'row', flex: 1, paddingBottom: 10, backgroundColor: 'white',paddingTop:10 }}>
                          <View style={styles.shadowContainer}>
                              <View style={{ width: '100%', height: '100%', backgroundColor: 'white', borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}>
                                  <Banner
                                      styles={styles.itemImage}
                                      resizeMode="contain"
                                      source={item.url ? { uri: item.url } : PLACEHOLDER}
                                  />
                              </View>
                          </View>

                          <View style={{ flex: 2, paddingHorizontal: 10, justifyContent: 'center' }}>
                              <Text numberOfLines={2} style={styles.itemName}>{item.productName}</Text>
                          </View>
                          <View style={{ flexDirection: 'row', flex: 1, alignItems: 'center', height: '100%', justifyContent: 'space-between' }}>
                              <TouchableOpacity style={styles.LikeDislkeUI}
                                  onPress={() => { this.clickedOnPositiveReview(item, index, 1) }}
                              >
                                  <Image style={{ width: 30, height: 30 }}
                                      source={(item.isPositiveRateClicked == 1) ? THUMBS_UP_SELECTED : THUMBS_UP_UNSELECTED}
                                  />
                              </TouchableOpacity>
                              <TouchableOpacity style={styles.LikeDislkeUI}
                                  onPress={() => { this.clickedOnPositiveReview(item, index, 2) }}
                              >
                                  <Image style={{ width: 30, height: 30 }}
                                      source={(item.isPositiveRateClicked == 2) ? THUMBS_DOWN_SELECTED : THUMBS_DOWN_UNSELECTED}
                                  />
                              </TouchableOpacity>
                          </View>
                      </View>
                      {item.isExpend &&
                          <View style={{ flex: 1, alignItems: 'center', height: 40, backgroundColor: 'white' }}>
                              <Text style={styles.itemName}>{(item.isPositiveRateClicked == 1) ? strings.order.orderFeedback.postiveReviewHeader : (item.isPositiveRateClicked == 2) ? strings.order.orderFeedback.negativeReviewHeader : ""}</Text>
                          </View>
                      }
                      {item.isExpend &&
                          <FlatList
                              data={item.reviewLabelsOnlineDelivery}
                              keyExtractor={(item, index) => item + index}
                              // renderItem={({ item, index }) => this.renderReviewLabel(item, index)}
                              renderItem={({ item, index }) => (
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
                                          selectedStar={(rating) => this.onStarRatingPress(rating,item, index)}
                                      />
                                  </View>
                              )}
                              scrollEnabled={false}
                              extraData={this.state}
                          />
                      }

                  </View>
                  {item.isExpend &&
                      <View style={{ flex: 1 }}>
                          <View style={styles.inputContainer}>
                              <TextInput
                                  style={styles.feedbackInput}
                                  value={item.feedbackText}
                                  maxLength={200}
                                  multiline
                                  placeholderTextColor='#46586f'
                                  // editable={this.isTextInputEditable(orderModeName === 'Self' ? this.state.reviewLabelsStorePickup : this.state.reviewLabelsOnlineDelivery)}
                                  underlineColorAndroid='transparent'
                                  placeholder={strings.order.orderFeedback.writeReview}
                                  onChangeText={(value) => {this.OnChangeTextItem(value,item,index)}}
                              />
                          </View>
                          <Text style={styles.feedBackLengthCount}>{`${this.state.feedbackText.length} / 200`}</Text>


                          {item.productReviewImageUri ? (
                              <View style={styles.uploadImageStyles}>
                                  <Image
                                      style={{ width: 90, height: 110 }}
                                      source={{ uri: item.productReviewImageUri }}
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
                              item.productReviewVideoUri ? (
                                  <View style={[styles.uploadImageStyles, { width: SCREEN_WIDTH * 0.7 }]}>
                                      <VideoPlayer
                                          source={item.productReviewVideoUri}
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
                              <View style={{ marginBottom: 40, width: 150, alignItems: 'center', justifyContent: 'center' }}>
                                  <TouchableOpacity
                                      style={{ width: 100, height: 100, backgroundColor: '#6896D4', borderRadius: 50, alignItems: 'center', justifyContent: 'center' }}
                                      onPress={() => this.uploadImageOrVideo(CAMERA_OPTIONS,item,index)}
                                  >
                                      <Image resizeMode={'contain'}
                                          style={{ width: 40, height: 40 }}
                                          source={Image_Upload_Icon} />
                                  </TouchableOpacity>
                                  <Text style={[styles.buttonText, { marginTop: 20 }]}>{"Upload Image"}</Text>
                              </View>
                              <View style={{ marginBottom: 40, width: 150, alignItems: 'center', justifyContent: 'center' }}>
                                  <TouchableOpacity
                                      style={{ width: 100, height: 100, backgroundColor: '#6896D4', borderRadius: 50, alignItems: 'center', justifyContent: 'center' }}
                                      onPress={() => this.uploadImageOrVideo(VIDEO_OPTIONS,item,index)}
                                  >
                                      <Image resizeMode={'contain'}
                                          style={{ width: 40, height: 40 }}
                                          source={Video_Upload_Icon} />
                                  </TouchableOpacity>
                                  <Text style={[styles.buttonText, { marginTop: 20 }]}>{"Upload Video"}</Text>
                              </View>
                          </View>

                      </View>}
              </View>

          </View>
      )
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
    const { orderModeName, allProducts } = this.props.route.params
    const { productReviewImageUri, productReviewVideoUri } = this.state
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <Header
          navigation={this.props.navigation}
          screenTitle={strings.order.orderFeedback.screenTitleProductRating}
        />
        <ScrollView style={styles.mainContainer}>
          <Loader loading={this.state.isLoading} />
          <View style={{ width: '100%', height: 70, borderBottomColor: 'rgba(110,110,110,0.5)', borderBottomWidth: 1.5, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 }}>
              <Text style={{ fontSize: 14, fontWeight: '400', textAlign: 'center', color: 'rgba(0,0,0,0.6)' }}>{strings.order.orderFeedback.ratingHeaderDescription}</Text>
          </View>
          <View style={styles.flatListContainer}>
            <FlatList
              data={allProducts}
              keyExtractor={(item, index) => item + index}
              renderItem={({ item, index }) => this.renderProducts(item, index)}
              scrollEnabled={false}
              extraData={this.state}
            />
          </View>
          <View style={styles.submitButtomContainer}>
            <TouchableOpacity style={styles.button}
                onPress={() => { this.onSubmitHandle() }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: 'white' }}>{strings.order.orderFeedback.submit}</Text>
            </TouchableOpacity>

            {/* <CustomButton
                handleClick={() => { this.onSubmitHandle() }}
                linearGradient
                buttonContainer={styles.button}
                buttonTitle={strings.order.orderFeedback.submit}
                buttonTitleStyle={styles.customButtonTitleStyle}
                primaryColor="#6895d4"
                secondaryColor="#57a5cf"
            /> */}
          </View>

          <Modal style={{ position: 'absolute' }}
            animationType="slide"
            visible={this.state.submitModalVisible}
            transparent
            onRequestClose={() => this.setState({ submitModalVisible: false })}
          >
            <View style={styles.modelMainContainer}>
              <View style={styles.modelsubViewContainer}>
                <View style={styles.modelsubViewTopContainer}>
                  <Image style={{ marginTop: 40, width: 50, height: 50 }}
                      source={CHECK_MARK}
                  />
                  <Text style={styles.modelTextThankYou}>{"Thank You!"}</Text>
                  <Text style={styles.modelTextPopupDescription}>{"Your review and rating has been submitted successfully"}</Text>
                </View>
                <TouchableOpacity style={styles.modelSubmitButton} onPress={() => {
                    this.setState({ submitModalVisible: false })
                }}>
                  <Text style={styles.modelSubmitText}>{"DONE"}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </ScrollView>
      </TouchableWithoutFeedback>
    )
  }
}

const styles = StyleSheet.create({
  mainContainer: {
      flex: 1,
      // backgroundColor: '#fff',
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
      width: SCREEN_WIDTH,
      height: 60,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#6895d4',
      borderBottomLeftRadius: 30,
      borderBottomRightRadius: 30,
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
      backgroundColor: 'white',
      borderWidth: 0.5,
      borderColor: 'rgba(0,0,0,0.3)',
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
      marginTop: 20,
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
      color: '#373E73',
      ...Specs.fontRegular,
      fontWeight: '500',
      alignSelf: 'center'
  },
  removeIcon: {
      paddingVertical: 10,
      paddingHorizontal: 10,
      position: 'absolute',
      // left: 86, 
      top: -18
  }, itemName: {
      color: 'rgba(0,0,0,0.8)',
      fontSize: 14,
      ...Specs.fontMedium
  },
  itemCard: {
      flexDirection: 'column',
      flex: 1,
  },
  shadowContainer: {
      height: 60,
      width: 60,
      elevation: 2,
      borderRadius: 20,
      shadowOffset: { width: 1, height: 2 },
      shadowColor: 'gray',
      shadowOpacity: 0.7,
      shadowRadius: 5,
      margin: 10
  },
  itemImage: {
      height: 50,
      width: 50,
      borderRadius: 5,
  },
  LikeDislkeUI: {
      height: 50,
      width: 50
  },
  modelMainContainer: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.2)',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
  },
  modelsubViewContainer: {
      width: SCREEN_WIDTH - 60,
      height: 280,
      borderTopLeftRadius: 10,
      borderTopRightRadius: 10,
      backgroundColor: 'white',
      alignItems: 'center',
      justifyContent: 'space-between',
  },
  modelsubViewTopContainer: {
      width: '100%',
      height: 200,
      padding: 10,
      borderTopRightRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
  },
  modelSubmitText: {
      fontSize: 14,
      fontWeight: '700',
      color: 'white'

  },
  modelTextThankYou: {
      marginTop: 20,
      fontSize: 24,
      fontWeight: '500',
      color: '#222222'
  },
  modelTextPopupDescription: {
      textAlign: 'center',
      marginTop: 20,
      fontSize: 16,
      fontWeight: '400',
      color: '#999999'
  },
  modelSubmitButton: {
      marginBottom: 0,
      backgroundColor: '#6597D2',
      width: '100%',
      height: 50,
      alignItems: 'center',
      justifyContent: 'center',

  }
})    