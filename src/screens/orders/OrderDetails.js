import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Dimensions,
  Image,
  Platform,
} from 'react-native';
import { Specs } from 'app/src/utility/Theme';
import { CustomButton } from 'app/src/components/buttons/Button';
import { inject, observer } from 'mobx-react';
import HeaderLeftIcons from 'app/src/components/navigation/HeaderLeftIcons';
import { Toast } from 'app/src/components/toast/Toast';
import AlertClass from 'app/src/utility/AlertClass';
import Loader from 'app/src/components/loader/Loader';
import autobind from 'autobind-decorator';
import moment from 'moment';
import { observable, makeObservable } from 'mobx';
import StarRating from '../../lib/starRating';
import { Header } from '../../components';
import {
  priceWithCurrency,
  connectedToInternet,
} from 'app/src/utility/Utility';
import { strings } from 'app/src/utility/localization/Localized';
import Banner from 'app/src/screens/Dashboard/Banner';
import OfflineNotice from 'app/src/components/OfflineNotice';
import VideoPlayer from 'app/src/screens/Dashboard/VideoPlayer';
// import OrderTracking from 'app/src/screens/orders/OrderTracking';
import { EventRegister } from 'react-native-event-listeners';
import ImagePickerModal from '../../components/imagePickerModal';
import {
  handleLaunchCamera,
  handlelaunchImageLibrary,
} from '../../services/ImageUpload';
import { getTaxableString } from '../../utility/Utility';
const SCREEN_WIDTH = Dimensions.get('window').width;

const PLACEHOLDER = require('app/src/assets/images/productList/placeHolder.png');
const REMOVE_ICON = require('app/src/assets/images/Kyc/remove_btn.png');
const THUMBS_DOWN_SELECTED = require('app/src/assets/images/ProductsRating/thumbsDownSelected.png');
const THUMBS_DOWN_UNSELECTED = require('app/src/assets/images/ProductsRating/thumbsDownUnselected.png');
const THUMBS_UP_SELECTED = require('app/src/assets/images/ProductsRating/thumbsUpSelected.png');
const THUMBS_UP_UNSELECTED = require('app/src/assets/images/ProductsRating/thumbsUpUnselected.png');
const CHECK_MARK = require('app/src/assets/images/ProductsRating/checkMark.png');
const Image_Upload_Icon = require('app/src/assets/images/ic_img_upload.png');
const Video_Upload_Icon = require('app/src/assets/images/ic_video_upload.png');
const COLORED_RATING_ICON = require('app/src/assets/images/coloured_Star.png');

const CAMERA_OPTIONS = {
  title: 'Upload Photo',
  takePhotoButtonTitle: 'Take Photo',
  storageOptions: {
    skipBackup: true,
    path: 'images',
  },
  mediaType: 'photo',
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
  allowsEditing: true,
};
@inject('cart', 'profile','auth','products','appConfiguration')
@observer
class OrderDetails extends Component {
  @observable isProductDetailFetched: Boolean = false;
  @observable orderObject: Object;
  @observable showCancelOrderButton: Boolean = false;
  @observable isInternetConnected: Boolean = true;
  @observable orderStatusDetails: Object;

  constructor(props) {
    super(props);
    makeObservable(this);
    this.orderObject = this.props.item;
    this.isApiV2Enabled = this.props.appConfiguration.isApiV2Enabled;
    this.state = {
      isLoading: false,
      mediaTypeOption: {},
      selectedPickerItem: null,
      selectedPickerIndex: null,
      submitModalVisible: false,
      arrAcordianProducts: [],
      isFeedbackButtonVisible: false,
      // isOrderTrackingVisible: false
    };
    this.isRepeatButtonShow = false;
  }

  async componentDidMount() {
    this.isInternetConnected = await connectedToInternet();
    if (this.isInternetConnected) {
      await this.getComponentData();
    }
  }

  @autobind
  async networkStatus(status) {
    if (status) {
      this.isInternetConnected = status;
      await this.getComponentData();
    }
  }

  @autobind
  async getComponentData() {
    this.setState({ isLoading: true });
    this.isProductDetailFetched = this.props.isProductDetailFetched;
    this.orderStatusDetails = this.props.cart.orderStatusDetails;
    // this.isProductDetailFetched = await this.props.cart.getOrderDetails(this.orderObject.customerOrderNo, this.orderObject.invoiceNo);
    const productItemsList = this.props.cart.productItemsList;
    if (productItemsList.length >= 1) {
      productItemsList[0].isRating == false
        ? this.setState({ isFeedbackButtonVisible: true })
        : this.setState({ isFeedbackButtonVisible: false });
    }
    this.createAcordianUI(productItemsList);
    this.setState({ isLoading: false });
    // if (!this.isProductDetailFetched) {
    //   this.showToast(strings.commonMessages.noProductRelated, Toast.type.ERROR)
    // }
    this.listener = EventRegister.addEventListener(
      'orderRatingStatus',
      flag => {
        this.setState({
          isFeedbackButtonVisible: flag,
        });
      },
    );
    // console.log("this.orderObject.distributorId"+this.orderObject.distributorId)
    // console.log("this.orderObject.distributorId"+this.props.auth.distributorID)
  }

  async componentDidUpdate(prevProps) {
    if (this.props.isProductDetailFetched != prevProps.isProductDetailFetched) {
      await this.getComponentData();
    }
  }

  componentWillUnmount() {
    EventRegister.removeEventListener(this.listener);
  }

  @autobind
  showToast(message: string, toastType: Toast.type) {
    // Add a Toast on screen.
    Toast.show(message, {
      duration: Toast.durations.SHORT,
      type: toastType,
      shadow: false,
      animation: true,
      hideOnPress: true,
      delay: 0,
    });
  }

  @autobind
  async cancelOrder() {
    const { navigation } = this.props;
    const { logNo, paymentAmount, customerOrderNo } = this.orderObject || {};
    const isApiV2 = this.orderObject?.orderCreatedBy === 'Web_V2';
    const res = await this.props.cart.cancelOrder(
      logNo,
      paymentAmount,
      customerOrderNo,
      isApiV2,
    );
    if (res.status === 'success') {
      this.showToast(res.message, Toast.type.SUCCESS);
      navigation.goBack();
      this.showCancelOrderButton = true;
    } else {
      this.showToast(res.message, Toast.type.ERROR);
    }
  }

  @autobind
  async repeatOrder() {
    console.log(this.orderObject);
    const data = {
      ...this.orderObject,
      distributorId: this.props.cart.shopForObjectInfo.distributorID,
      cartName: this.props.cart.shopForObjectInfo.cartTitle,
    };
    console.log(JSON.stringify(data));
    const res = await this.props.cart.repeatOrder(data);
    if (res.status === 'success') {
      AlertClass.showAlert(
        strings.order.orderDetails.successTitle,
        strings.order.orderDetails.orderAddedToCart,
        [
          {
            text: strings.commonMessages.no,
            onPress: () => console.log('No Pressed'),
          },
          {
            text: strings.commonMessages.yes,
            onPress: () => {
              this.props.navigation.popToTop();
              this.props.navigation.navigate('MyCart');
            },
          },
        ],
      );
    } else {
      this.showToast(res.message, Toast.type.ERROR);
    }
  }

  @autobind
  renderButton() {
    this.props.cart.productItemsList.forEach(object => {
      if (object.isPromo.toUpperCase() != 'YES') {
        this.isRepeatButtonShow = true;
      }
    });
    return this.orderObject.statusName === 'Confirmed' ? (
      <View
        style={{
          paddingVertical: 27,
          flexDirection: 'row',
          justifyContent: 'space-evenly',
          alignItems: 'center',
        }}>
        <TouchableOpacity
          style={[styles.buttonContainer, { backgroundColor: '#6598d3' }]}
          onPress={() => {
            AlertClass.showAlert(
              strings.order.orderDetails.cancelAlertHeading,
              strings.order.orderDetails.cancelAlertMessage,
              [
                {
                  text: strings.commonMessages.no,
                  onPress: () => console.log('No Pressed'),
                },
                {
                  text: strings.commonMessages.yes,
                  onPress: () => this.cancelOrder(),
                },
              ],
            );
          }}>
          <Text style={styles.buttonText}>
            {strings.order.orderDetails.cancelButton}
          </Text>
        </TouchableOpacity>
        {this.isRepeatButtonShow && this.orderObject.countryId == 1 ? (
          <TouchableOpacity
            style={[styles.buttonContainer, { backgroundColor: '#58cdb4' }]}
            onPress={() => {
              AlertClass.showAlert(
                strings.order.orderDetails.repeatAlertHeading,
                strings.order.orderDetails.repeatAlertMessage,
                [
                  {
                    text: strings.commonMessages.no,
                    onPress: () => console.log('No Pressed'),
                  },
                  {
                    text: strings.commonMessages.yes,
                    onPress: () => this.repeatOrder(),
                  },
                ],
              );
            }}>
            <Text style={styles.buttonText}>
              {strings.order.orderDetails.repeatButton}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    ) : ( this.orderObject.countryId == 1 ?
      <CustomButton
        handleClick={() => {
          AlertClass.showAlert(
            strings.order.orderDetails.repeatAlertHeading,
            strings.order.orderDetails.repeatAlertMessage,
            [
              {
                text: strings.commonMessages.no,
                onPress: () => console.log('No Pressed'),
              },
              {
                text: strings.commonMessages.yes,
                onPress: () => this.repeatOrder(),
              },
            ],
          );
        }}
        linearGradient
        buttonContainer={styles.button}
        buttonTitle={strings.order.orderDetails.repeatButton}
        buttonTitleStyle={styles.customButtonTitleStyle}
        primaryColor="#6895d4"
        secondaryColor="#57a5cf"
      /> :
      null
    );
  }

  getPaymentMode = tenderType => {
    if (tenderType == '2' || tenderType == 'ONLINE') {
      return this.isApiV2Enabled ? 'ONLINE' : 'Online';
    }
    if (tenderType == '5') {
      return 'Bonus';
    }
    if (!tenderType || tenderType == '1' || tenderType == 'CASH') {
      return this.isApiV2Enabled ? 'CASH' : 'Cash';
    }
  };

  renderFeedBackFloatingButton = () => {
    if (
      this.orderObject.statusName === 'Delivered' &&
      this.orderObject.distributorId == this.props.auth.distributorID
    ) {
      return (
        <View
          style={{
            width: '100%',
            height: 80,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(230,230,230,0.0)',
          }}>
          <TouchableOpacity
            style={styles.giveOrderFeedbackContainer}
            onPress={() => {
              this.props.navigation.navigate('orderTypeFeedbackScreen', {
                locationCode: this.orderObject.pCCode,
                orderModeName: this.orderObject.orderModeName,
                // productName: item.productName,
                locationId: this.orderObject.pCId,
                orderId: this.orderObject.logNo,
                customerOrderNo: this.orderObject.customerOrderNo,
                allProducts: this.props.cart.productItemsList,
              });
            }}>
            <Text style={styles.giveOrderFeedbackStyles}>
              Rate Your Purchase
            </Text>
          </TouchableOpacity>
        </View>
      );
    }
  };

  // Setup rate for products
  createAcordianUI(arrAc) {
    var arr = arrAc;
    arr.map((product, index) => {
      let item = product;
      let productQuality =
        product.productRatingDetails?.productQuality != null
          ? product.productRatingDetails.productQuality
          : 0;
      let easeOfShopping =
        product.productRatingDetails?.easeOfShopping != null
          ? product.productRatingDetails.easeOfShopping
          : 0;
      let valueOfMoney =
        product.productRatingDetails?.valueOfMoney != null
          ? product.productRatingDetails.valueOfMoney
          : 0;
      let reviewImages =
        product.productRatingDetails?.reviewImages != null
          ? product.productRatingDetails.reviewImages[0]?.imageUrl
          : '';
      let reviewVideos =
        product.productRatingDetails?.reviewVideos != null
          ? product.productRatingDetails.reviewVideos[0]?.videoUrl
          : '';
      let reviewDetail =
        product.productRatingDetails?.reviewDetail != null
          ? product.productRatingDetails.reviewDetail
          : '';
      let isThumbsUp =
        product.productRatingDetails?.isThumbsUp != null
          ? product.productRatingDetails.isThumbsUp
          : false;
      var isPositiveRatedProduct = 0;
      if (productQuality == 0) {
        isPositiveRatedProduct = 0;
      } else if (productQuality > 0 && isThumbsUp == true) {
        isPositiveRatedProduct = 1;
      } else if (productQuality > 0 && isThumbsUp == false) {
        isPositiveRatedProduct = 2;
      }
      let productsRating = [
        {
          name: 'Product Quality',
          value: productQuality,
          skuCode: product.skuCode,
        },
        {
          name: 'Ease of Shopping',
          value: easeOfShopping,
          skuCode: product.skuCode,
        },
        {
          name: 'Value for Money',
          value: valueOfMoney,
          skuCode: product.skuCode,
        },
      ];
      item['reviewLabelsOnlineDelivery'] = productsRating;
      item['feedbackText'] = reviewDetail;
      item['isExpend'] = false;
      item['isEditable'] = productQuality != 0 ? false : true;
      item['isPositiveRateClicked'] = isPositiveRatedProduct;
      item['productReviewImageUri'] = reviewImages;
      item['productReviewVideoUri'] = reviewVideos;
      return item;
    });
    console.log('rescheckedit', arr);
    this.setState({ arrAcordianProducts: arr });
  }

  renderProducts = (item, index) => {
    // console.log('itemcheck',item)
    return (
      <View>
        <View>
          <View style={styles.itemCard}>
            <View
              style={{
                flexDirection: 'row',
                flex: 1,
                paddingBottom: 10,
                backgroundColor: 'white',
                paddingTop: 10,
              }}>
              <View style={styles.shadowContainer}>
                <View
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'white',
                    borderRadius: 10,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Banner
                    styles={styles.itemImage}
                    resizeMode="contain"
                    source={item.url ? { uri: item.url } : PLACEHOLDER}
                  />
                </View>
              </View>

              <View
                style={{
                  flex: 2,
                  paddingHorizontal: 10,
                  justifyContent: 'center',
                }}>
                <Text numberOfLines={2} style={styles.itemName}>
                  {item.productName}
                </Text>
                <Text style={[styles.itemName, { paddingTop: 5 }]}>
                  {'Qty: '}
                  <Text style={styles.price}>{item.quantity}</Text>
                </Text>
                <Text style={[styles.itemName, { paddingTop: 5 }]}>
                  {'Item Code: '}
                  <Text style={styles.price}>{item.skuCode}</Text>
                </Text>
                <Text style={[styles.itemName, { paddingTop: 5 }]}>
                  {'Is Promotion Item: '}
                  <Text style={styles.price}>{item.isPromo}</Text>
                </Text>
              </View>
              <View
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                }}>
                <View
                  style={{
                    flex: 1,
                    height: '30%',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Text style={styles.price}>
                    {`${priceWithCurrency(
                      this.orderObject.countryId,
                      item.productAmount,
                    )}`}
                  </Text>
                </View>
                {this.orderObject.statusName === 'Delivered' &&
                  this.orderObject.distributorId ==
                    this.props.auth.distributorID && (
                    <View
                      style={{
                        flexDirection: 'row',
                        flex: 1,
                        alignItems: 'center',
                        height: '70%',
                        justifyContent: 'space-between',
                      }}>
                      <TouchableOpacity
                        style={styles.LikeDislkeUI}
                        onPress={() => {
                          this.clickedOnPositiveReview(item, index, 1);
                        }}>
                        <Image
                          style={{ width: 30, height: 30 }}
                          source={
                            item.isPositiveRateClicked == 1
                              ? THUMBS_UP_SELECTED
                              : THUMBS_UP_UNSELECTED
                          }
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.LikeDislkeUI}
                        onPress={() => {
                          this.clickedOnPositiveReview(item, index, 2);
                        }}>
                        <Image
                          style={{ width: 30, height: 30 }}
                          source={
                            item.isPositiveRateClicked == 2
                              ? THUMBS_DOWN_SELECTED
                              : THUMBS_DOWN_UNSELECTED
                          }
                        />
                      </TouchableOpacity>
                    </View>
                  )}
              </View>
            </View>
            {!item.isEditable &&
            item.averageRating != '0.0' &&
            item.averageRating != '0' &&
            item.averageRating != null &&
            item.averageRating != undefined &&
            this.orderObject.distributorId == this.props.auth.distributorID ? (
              <View style={[styles.ratingStatus]}>
                <Text style={[styles.ratingStatusText, { color: '#349e4d' }]}>
                  {strings.order.orderDetails.orderAlreadyProduct}
                  {item.averageRating}
                </Text>
                <Banner
                  styles={[styles.ratingIcon, { top: 0 }]}
                  resizeMode="contain"
                  source={COLORED_RATING_ICON}
                />
              </View>
            ) : null}
            {item.isExpend && (
              <View
                style={{
                  flex: 1,
                  paddingTop: 10,
                  alignItems: 'center',
                  height: 40,
                  backgroundColor: 'white',
                }}>
                <Text style={[styles.itemName, { fontWeight: '600' }]}>
                  {item.isPositiveRateClicked == 1
                    ? strings.order.orderFeedback.postiveReviewHeader
                    : item.isPositiveRateClicked == 2
                    ? strings.order.orderFeedback.negativeReviewHeader
                    : ''}
                </Text>
              </View>
            )}
            {item.isExpend && (
              <FlatList
                data={item.reviewLabelsOnlineDelivery}
                keyExtractor={(item, index) => item + index}
                renderItem={({ item, index }) => (
                  <View style={styles.reviewLabelContainer}>
                    <Text style={styles.reviewLabelStyles}>{item.name}</Text>
                    <StarRating
                      //disabled={item?.value <= 0}
                      maxStars={5}
                      // containerStyle={{ width: 200, borderWidth: 1 }}
                      starStyle={{ paddingHorizontal: 2 }}
                      rating={item.value}
                      startSize={5} //Not working
                      emptyStar="ios-star-outline"
                      fullStar="ios-star"
                      halfStar="ios-star-half"
                      iconSet="Ionicons"
                      fullStarColor="#f2b01e"
                      selectedStar={rating =>
                        this.onStarRatingPress(rating, item, index)
                      }
                    />
                  </View>
                )}
                scrollEnabled={false}
                extraData={this.state}
              />
            )}
          </View>

          {item.isExpend && (
            <View style={{ flex: 1 }}>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.feedbackInput}
                  value={item.feedbackText}
                  maxLength={200}
                  multiline
                  placeholderTextColor="#46586f"
                  editable={item.isEditable}
                  underlineColorAndroid="transparent"
                  placeholder={strings.order.orderFeedback.writeReview}
                  onChangeText={value => {
                    this.OnChangeTextItem(value, item, index);
                  }}
                />
              </View>
              <Text
                style={
                  styles.feedBackLengthCount
                }>{`${item.feedbackText.length}/200`}</Text>
              {item.isEditable && (
                <View
                  style={{
                    width: '100%',
                    paddingHorizontal: 15,
                    paddingVertical: 10,
                  }}>
                  <Text
                    style={[
                      styles.reviewLabelStyles,
                      { alignSelf: 'flex-start', color: '#000000' },
                    ]}>
                    {strings.order.orderFeedback.uploadImagesAndVideos}
                  </Text>
                  <Text
                    style={[
                      styles.reviewLabelStyles,
                      { fontWeight: '300', color: '#000000' },
                    ]}>
                    {strings.order.orderFeedback.maximumUploadDescription}
                  </Text>
                </View>
              )}
              {item.productReviewImageUri ? (
                <View style={styles.uploadImageStyles}>
                  <Image
                    style={{ width: 90, height: 110 }}
                    source={{ uri: item.productReviewImageUri }}
                  />
                  {item.isEditable && (
                    <TouchableOpacity
                      style={[styles.removeIcon, { left: 86 }]}
                      onPress={() => [
                        (item.productReviewImageUri = ''),
                        this.setState({}),
                      ]}>
                      <Image
                        style={{ width: 20, height: 20 }}
                        source={REMOVE_ICON}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              ) : null}

              {item.productReviewVideoUri ? (
                <View
                  style={[
                    styles.uploadImageStyles,
                    { width: SCREEN_WIDTH * 0.7 },
                  ]}>
                  <VideoPlayer
                    source={item.productReviewVideoUri}
                    style={{ height: 220 }}
                    paused
                    disableSeekbar
                    disablePlayPause
                  />
                  {item.isEditable && (
                    <TouchableOpacity
                      style={[styles.removeIcon, { left: SCREEN_WIDTH * 0.65 }]}
                      onPress={() => [
                        (item.productReviewVideoUri = ''),
                        this.setState({}),
                      ]}>
                      <Image
                        style={{ width: 20, height: 20 }}
                        source={REMOVE_ICON}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              ) : null}
              {/* {item.isEditable &&
              <View style={{width:'100%',paddingHorizontal:15,height:40,alignItems:'flex-start',justifyContent:'center'}}>
                <Text style={{color:'#000000',fontWeight:'700',fontSize:12}}>Upload Image & Video</Text>
              </View>
              } */}
              {item.isEditable && (
                <View
                  style={{
                    marginTop: 20,
                    alignItems: 'center',
                    justifyContent: 'center',
                    flex: 1,
                    flexDirection: 'row',
                  }}>
                  <View
                    style={{
                      marginBottom: 40,
                      width: 150,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <TouchableOpacity
                      style={{
                        width: 100,
                        height: 100,
                        backgroundColor: '#6896D4',
                        borderRadius: 50,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      onPress={() =>
                        this.validateImageUpload(CAMERA_OPTIONS, item, index)
                      }>
                      <Image
                        resizeMode={'contain'}
                        style={{ width: 40, height: 40 }}
                        source={Image_Upload_Icon}
                      />
                    </TouchableOpacity>
                    <Text style={[styles.buttonText, { marginTop: 20 }]}>
                      {strings.order.orderFeedback.uploadImage}
                    </Text>
                  </View>
                  <View
                    style={{
                      marginBottom: 40,
                      width: 150,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <TouchableOpacity
                      style={{
                        width: 100,
                        height: 100,
                        backgroundColor: '#6896D4',
                        borderRadius: 50,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      onPress={() =>
                        this.validateImageUpload(VIDEO_OPTIONS, item, index)
                      }>
                      <Image
                        resizeMode={'contain'}
                        style={{ width: 40, height: 40 }}
                        source={Video_Upload_Icon}
                      />
                    </TouchableOpacity>
                    <Text style={[styles.buttonText, { marginTop: 20 }]}>
                      {strings.order.orderFeedback.uploadVideo}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          )}
        </View>
        {item.isExpend && (
          <View style={styles.submitButtonContainer}>
            <TouchableOpacity
              style={[
                styles.buttonSubmit,
                { opacity: item.isEditable ? 1.0 : 0.4 },
              ]}
              onPress={() => {
                if (item.isEditable == true) {
                  this.onSubmitHandle(item, index);
                }
              }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: 'white' }}>
                {strings.order.orderFeedback.submit.toUpperCase()}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={{ height: 1, backgroundColor: '#DDDDDD' }} />
      </View>
    );
  };

  onSubmitHandle = async (item, index) => {
    const isConnectedToInternet = await connectedToInternet();
    const { productSkuCode, productName, orderModeName, locationId } =
      this.props.route.params || {};
    let storePickUpKeys, onlineDeliveryKeys;
    let totalRating0 = item.reviewLabelsOnlineDelivery[0].value;
    let totalRating1 = item.reviewLabelsOnlineDelivery[1].value;
    let totalRating2 = item.reviewLabelsOnlineDelivery[2].value;
    var isCommentMendetory =
      totalRating0 > 3 && totalRating1 > 3 && totalRating2 > 3;

    if (isConnectedToInternet) {
      if (
        item.reviewLabelsOnlineDelivery[0].value != 0 &&
        item.reviewLabelsOnlineDelivery[1].value != 0 &&
        item.reviewLabelsOnlineDelivery[2].value != 0
      ) {
        if (isCommentMendetory || item.feedbackText.length > 0) {
          if (/^\s+$/.test(item.feedbackText)) {
            this.showToast(
              strings.order.orderFeedback.giveSomefeedbackMessage,
              Toast.type.ERROR,
            );
          } else {
            if (this.orderObject.orderModeName === 'Self') {
              storePickUpKeys = {
                productQuality: item.reviewLabelsOnlineDelivery[0].value,
                easeOfShopping: item.reviewLabelsOnlineDelivery[1].value,
                valueOfMoney: item.reviewLabelsOnlineDelivery[2].value,
                deliveryType: 'StorePickup',
              };
            } else {
              onlineDeliveryKeys = {
                productQuality: item.reviewLabelsOnlineDelivery[0].value,
                easeOfShopping: item.reviewLabelsOnlineDelivery[1].value,
                valueOfMoney: item.reviewLabelsOnlineDelivery[2].value,
                deliveryType: 'Shipping',
              };
            }

            const data = {
              ...(item.isEditable ? { ...this.myRatingObject } : {}),
              productCode: item.skuCode,
              isThumbsUp: item.isPositiveRateClicked == 1 ? true : false,
              ...(this.orderObject.orderModeName === 'Self'
                ? storePickUpKeys
                : onlineDeliveryKeys),
              distributorId: this.props.auth.distributorID,
              distributorName: this.props.auth.username,
              reviewDetail: item.feedbackText,
              productName: item.productName,
              ...(item.productReviewImageUri
                ? { reviewImages: [{ imageUrl: item.productReviewImageUri }] }
                : { reviewImages: null }),
              ...(item.productReviewVideoUri
                ? { reviewVideos: [{ videoUrl: item.productReviewVideoUri }] }
                : { reviewVideos: null }),
              locationId: this.orderObject.pCId,
            };
            console.log('submit request' + JSON.stringify(data));
            this.setState({ isLoading: true });
            const res = await this.props.products.submitProductRatings(
              data,
              false,
            );
            this.setState({ isLoading: false });
            if (res.success) {
              setTimeout(() => {
                this.state.arrAcordianProducts[index].isEditable = false;
                this.state.arrAcordianProducts[index].isExpend = false;
                this.state.arrAcordianProducts[index].isPositiveRateClicked =
                  item.isPositiveRateClicked;
                this.setState({ submitModalVisible: true });
              }, 200);

              // AlertClass.showAlert('',
              //   strings.order.orderFeedback.ratingAndReviewSubmitted,
              //   [{ text: strings.commonMessages.ok, onPress: () => { this.props.navigation.goBack() } }])
            } else {
              this.showToast(res.message, Toast.type.ERROR);
            }
          }
        } else {
          this.showToast(
            strings.order.orderFeedback.giveSomefeedbackMessage,
            Toast.type.ERROR,
          );
          // this.showToast(strings.order.orderFeedback.giveSomefeedbackMessage, Toast.type.ERROR)
        }
      } else {
        this.showToast(
          strings.order.orderFeedback.provideStarRating,
          Toast.type.ERROR,
        );
      }
    } else {
      this.showToast(strings.commonMessages.noInternet, Toast.type.ERROR);
    }
  };

  onStarRatingPress(rating, item, indexxx) {
    let productQuality =
      item?.productRatingDetails?.productQuality != null
        ? item?.productRatingDetails.productQuality
        : 0;
    // if((productQuality == 0)){
    //   if(item?.value <= 0){
    let arr = this.state.arrAcordianProducts;
    let aaaa = arr.map((product, index) => {
      if (product.isEditable && product.skuCode == item.skuCode) {
        let prodItem = product;
        let ittt = product['reviewLabelsOnlineDelivery'];
        ittt[indexxx].value = rating;
        prodItem['reviewLabelsOnlineDelivery'] = ittt;
        return prodItem;
      } else {
        return product;
      }
    });
    this.setState({ arrAcordianProducts: aaaa });
    // }
    // }
  }

  clickedOnPositiveReview(itemObj, indexxx, isPositive) {
    if (itemObj.isEditable) {
      this.state.arrAcordianProducts.map((product, index) => {
        let obj1 = product;
        if (indexxx != index) {
          obj1.isExpend = false;
          //  if(!obj1.productRatingDetails){
          //    obj1.isPositiveRateClicked = 0
          //  }
        } else {
          obj1.isExpend = obj1.isExpend ? !obj1.isExpend : true;
          obj1.isPositiveRateClicked = isPositive;
        }
        return obj1;
      });
      this.setState({ arrAcordianProducts: this.state.arrAcordianProducts });
    } else {
      this.state.arrAcordianProducts.map((product, index) => {
        let obj1 = product;
        if (indexxx != index) {
          obj1.isExpend = false;
        } else {
          obj1.isExpend = obj1.isExpend ? !obj1.isExpend : true;
        }
        return obj1;
      });
      this.setState({ arrAcordianProducts: this.state.arrAcordianProducts });
    }
  }

  OnChangeTextItem(value, item, index) {
    let itemCurrent = item;
    itemCurrent['feedbackText'] = value;
    this.state.arrAcordianProducts[index] = itemCurrent;
    this.setState({ arrAcordianProducts: this.state.arrAcordianProducts });
  }

  validateImageUpload = (data, item, index) => {
    const { handleImagePickerVisibility } = this.props;
    this.setState({
      mediaTypeOption: data,
      selectedPickerItem: item,
      selectedPickerIndex: index,
    });
    handleImagePickerVisibility(true);
  };

  onCameraOptionPress = async () => {
    const { handleImagePickerVisibility } = this.props;
    handleImagePickerVisibility(false);
    setTimeout(async () => {
      const result = await handleLaunchCamera(this.state.mediaTypeOption);
      this.uploadImagesOrVideos(result);
    }, 500);
  };

  onImageLibraryPress = async () => {
    const { handleImagePickerVisibility } = this.props;
    handleImagePickerVisibility(false);
    setTimeout(async () => {
      const result = await handlelaunchImageLibrary(this.state.mediaTypeOption);
      this.uploadImagesOrVideos(result);
    }, 500);
  };

  uploadImagesOrVideos = async result => {
    if (result?.success) {
      console.log(
        'this.state.mediaTypeOption.mediaType',
        this.state.mediaTypeOption.mediaType,
      );
      const data = {
        uri: result?.data.uri,
        name:
          this.state.mediaTypeOption.mediaType === 'photo'
            ? Platform.OS === 'android'
              ? result?.data.fileName
              : `temp_${Math.floor(Date.now() / 1000)}`
            : `temp_${Math.floor(Date.now() / 1000)}.mp4`,
        type:
          this.state.mediaTypeOption.mediaType === 'photo'
            ? result?.data.type
            : 'video/mp4',
      };
      const uploadData = new FormData();
      uploadData.append('file', data);
      uploadData.append(
        'filetype',
        this.state.mediaTypeOption.mediaType === 'photo' ? 'IMAGE' : 'VIDEOS',
      );
      this.setState({
        isLoading: true,
      });
      const res = await this.props.products.submitFileUpload(
        uploadData,
        this.state.mediaTypeOption.mediaType === 'photo' ? 'IMAGE' : 'VIDEOS',
      );
      this.setState({
        isLoading: false,
      });
      if (res.success) {
        let productObj = this.state.selectedPickerItem;
        if (this.state.mediaTypeOption.mediaType === 'photo') {
          productObj['productReviewImageUri'] = res.uri;
          this.state.arrAcordianProducts[this.state.selectedPickerIndex] =
            productObj;
        } else {
          productObj['productReviewVideoUri'] = res.uri;
          this.state.arrAcordianProducts[this.state.selectedPickerIndex] =
            productObj;
          // this.setState({ productReviewVideoUri: res.uri })
        }
        this.setState({ arrAcordianProducts: this.state.arrAcordianProducts });
      } else {
        this.showToast(res.message, Toast.type.ERROR);
      }
    }
  };
  // handleTrackingModalVisibility = async (value) => {
  //   if(value){
  //     const resStatus = await this.props.cart.fetchHolisolCourierStatus(this.orderObject.doketNo);
  //     if(resStatus.success){
  //       this.setState({
  //         isOrderTrackingVisible: true
  //       })
  //     }
  //     else{
  //       console.log('rerror')
  //     }
  //   }
  //   else{
  //     this.setState({
  //       isOrderTrackingVisible: false
  //     })
  //   }
  // }

  /**
   * @description this will return final location name of the placed order.
   * @param item order/log details
   */
    fetchLocation = () => {
      if (this.isApiV2Enabled) {
        if (this.orderObject.orderMode == '3' && this.orderObject.baseStore) {
          return this.orderObject.baseStore;
        }
        return this.orderObject.locationCode;
      }
      return this.orderObject.locationCode;
    };

  render() {
    return (
      <View style={{ flex: 1 }}>
        {!this.isInternetConnected && (
          <OfflineNotice networkStatus={status => this.networkStatus(status)} />
        )}
        <Loader loading={this.state.isLoading || this.props.cart.isLoading} />
        {/* <Header
          navigation={this.props.navigation}
          screenTitle={strings.order.orderDetails.heading}
        /> */}
        {this.isProductDetailFetched ? (
          <ScrollView>
            <View>
              <View style={styles.container}>
                {/* <Text style={styles.titleContainer}>
                    {`${strings.order.orderDetails.orderNo} : `}
                &nbsp;
                    <Text style={[styles.titleContainer, { color: '#31cab3' }]}>{this.orderObject.customerOrderNo}</Text>
                  </Text> */}

                <View style={styles.orderDetails}>
                  <Text style={styles.orderDetailLabel}>
                    {strings.order.orderDetails.itemNo}
                  </Text>
                  <Text style={styles.orderDetailValue}>
                    {Number(this.orderObject.totalUnits).toFixed(0)}
                  </Text>
                </View>
                {/* <View style={styles.orderDetails}>
                    <Text style={styles.orderDetailLabel}>{strings.order.orderDetails.orderDate}</Text>
                    <Text style={styles.orderDetailValue}>
                      {moment(this.orderObject.createdDate).format('DD-MM-YYYY h:mm A')}
                    </Text>
                  </View> */}
                <View style={styles.orderDetails}>
                  <Text style={styles.orderDetailLabel}>
                    {strings.order.orderDetails.orderTotal}
                  </Text>
                  <Text style={styles.orderDetailValue}>
                    {priceWithCurrency(
                      this.orderObject.countryId,
                      this.orderObject.paymentAmount,
                    )}
                  </Text>
                </View>
                <View style={styles.orderDetails}>
                  <Text style={styles.orderDetailLabel}>
                    {strings.order.orderDetails.countryLabel}
                  </Text>
                  <Text style={styles.orderDetailValue}>
                    {this.orderObject.countryName}
                  </Text>
                </View>
                <View style={styles.orderDetails}>
                  <Text style={styles.orderDetailLabel}>
                    {strings.order.orderDetails.deliveyMode}
                  </Text>
                  <Text style={styles.orderDetailValue}>
                    {this.orderObject.orderModeName}
                  </Text>
                </View>
                <View style={styles.orderDetails}>
                  <Text style={styles.orderDetailLabel}>
                    {strings.order.orderDetails.paymentMode}
                  </Text>
                  <Text style={styles.orderDetailValue}>
                    {this.getPaymentMode(this.orderObject.tenderType)}
                  </Text>
                </View>
                <View style={styles.orderDetails}>
                  <Text style={styles.orderDetailLabel}>
                    {strings.order.orderDetails.distId}
                  </Text>
                  <Text style={styles.orderDetailValue}>
                    {this.orderObject.distributorId}
                  </Text>
                </View>
                <View style={styles.orderDetails}>
                  <Text style={styles.orderDetailLabel}>
                    {strings.order.orderDetails.distName}
                  </Text>
                  <Text style={styles.orderDetailValue}>
                    {this.orderObject.distributorName}
                  </Text>
                </View>
                <View style={styles.orderDetails}>
                  <Text style={styles.orderDetailLabel}>Branch Phone No</Text>
                  <Text style={styles.orderDetailValue}>
                    {this.orderObject.mobileNo ? this.orderObject.mobileNo : ''}
                  </Text>
                </View>
              </View>
              {this.orderObject.orderModeName?.toUpperCase() === 'COURIER' ? (
                <View style={styles.container}>
                  <Text style={styles.titleContainer}>Track Order</Text>
                  <View style={styles.orderDetails}>
                    <Text style={styles.orderDetailLabel}>Docket Number</Text>

                    <Text style={styles.orderDetailValue}>
                   
                      { this.orderStatusDetails && Object.keys(this.orderStatusDetails).length &&  this.orderStatusDetails.courierDetail && this.orderStatusDetails.courierDetail.length > 0 && this.orderStatusDetails.courierDetail[0].hasOwnProperty('docketNo')
                        ? this.orderStatusDetails.courierDetail[0].docketNo
                        : 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.orderDetails}>
                    <Text style={styles.orderDetailLabel}>
                      Courier Company Name
                    </Text>
                    <Text style={styles.orderDetailValue}>
                    {this.orderStatusDetails && Object.keys(this.orderStatusDetails).length &&  this.orderStatusDetails.courierDetail && this.orderStatusDetails.courierDetail.length > 0 && this.orderStatusDetails.courierDetail[0].hasOwnProperty('courierPartner')
                        ? this.orderStatusDetails.courierDetail[0].courierPartner
                        : 'N/A'}
                      {/* {this.orderObject.courierCompanyName
                        ? this.orderObject.courierCompanyName
                        : 'N/A'} */}
                    </Text>
                  </View>
                  <View style={styles.orderDetails}>
                    <Text style={styles.orderDetailLabel}>Location Code</Text>
                    <Text style={styles.orderDetailValue}>
                      {this.orderObject.locationCode
                        ? this.orderObject.locationCode
                        : 'N/A'}
                    </Text>
                  </View>
                  {/* <View style={styles.courierStatusView}>
                        { (this.orderObject.isHolisoleCourier) ? 
                          (
                            <TouchableOpacity
                              onPress={() => this.handleTrackingModalVisibility(true)}
                              style={styles.courierStatusButton}
                            >
                              <Text style={styles.courierStatus}>Courier Status</Text>
                            </TouchableOpacity>
                          )
                          : null
                      }
                      </View> */}
                </View>
              ) : null}
              {this.orderObject.orderModeName === 'Self' ? (
                <View style={styles.container}>
                  <Text style={styles.titleContainer}>
                    {strings.order.orderDetails.storePick}
                  </Text>
                  <Text style={{ fontSize: 12 }}>{this.fetchLocation()}</Text>
                </View>
              ) : (
                <View style={styles.container}>
                  <Text style={styles.titleContainer}>
                    {strings.order.orderDetails.shipping}
                  </Text>
                  <Text style={{ fontSize: 12 }}>
                    {this.orderObject.distributorAddress}
                  </Text>
                </View>
              )}
            </View>
            {this.state.isFeedbackButtonVisible
              ? this.renderFeedBackFloatingButton()
              : null}
            <View style={styles.container}>
              <Text style={styles.titleContainer}>
                {strings.order.orderDetails.productName}
              </Text>
              <FlatList
                style={{ marginTop: 10 }}
                data={this.state.arrAcordianProducts}
                keyExtractor={(item, index) => item + index}
                renderItem={({ item, index }) =>
                  this.renderProducts(item, index)
                }
              />
            </View>
            <View style={[styles.container, styles.endContainer]}>
              {this.orderObject.discountAmount ? (
                <Text style={{ marginBottom: 10, fontSize: 14 }}>
                  {`${strings.order.orderDetails.discount} : `}
                  &nbsp;
                  {priceWithCurrency(
                    this.orderObject.countryId,
                    this.orderObject.discountAmount,
                  )}
                </Text>
              ) : null}
              <Text style={{ ...Specs.fontBold }}>
                {`${strings.order.orderDetails.totalAmount} ${getTaxableString(this.orderObject.countryId)}:`}
                &nbsp;
                {priceWithCurrency(
                  this.orderObject.countryId,
                  this.orderObject.paymentAmount,
                )}
              </Text>
              {(this.orderObject.statusName === 'Delivered' ||
                this.orderObject.statusName === 'Invoiced') && (
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                    marginTop: 30,
                  }}>
                  <Text
                    style={[styles.downloadInvoice]}
                    onPress={async () => {
                      const url = await this.props.cart.getOrderInvoice(
                        this.orderObject.customerOrderNo,
                        this.orderObject.invoiceNo,
                      );
                      this.props.navigation.navigate('orderInvoice', {
                        url: url,
                      });
                    }}>
                    {strings.order.orderDetails.downloadInvoice}
                  </Text>
                </View>
              )}
            </View>
            <View>
              {this.orderObject.statusName === 'Cancelled'
                ? null
                : this.renderButton()}
            </View>
          </ScrollView>
        ) : null}
        <Modal
          style={{ position: 'absolute' }}
          animationType="slide"
          visible={this.state.submitModalVisible}
          transparent
          onRequestClose={() => this.setState({ submitModalVisible: false })}>
          <View style={styles.modelMainContainer}>
            <View style={styles.modelsubViewContainer}>
              <View style={styles.modelsubViewTopContainer}>
                <Image
                  style={{ marginTop: 40, width: 50, height: 50 }}
                  source={CHECK_MARK}
                />
                <Text style={styles.modelTextThankYou}>{'Thank You!'}</Text>
                <Text style={styles.modelTextPopupDescription}>
                  {strings.order.orderFeedback.ratingAndReviewSubmitted}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.modelSubmitButton}
                onPress={() => {
                  this.setState({ submitModalVisible: false });
                }}>
                <Text style={styles.modelSubmitText}>{'DONE'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        {/* <OrderTracking 
          modalVisible={this.state.isOrderTrackingVisible}
          handleTrackingModal={(value) => this.handleTrackingModalVisibility(value)}
          trackingData={this.props.cart.courierTrackingDetails}
          courierCompanyName={this.orderObject?.courierCompanyName}
        /> */}
        <ImagePickerModal
          isVisible={this.props.isImagePickerVisible}
          onCameraPress={this.onCameraOptionPress}
          onLibraryPress={this.onImageLibraryPress}
          setModalVisiblility={this.props.handleImagePickerVisibility}
        />
      </View>
    );
  }
}

export default OrderDetails;

const styles = StyleSheet.create({
  titleContainer: {
    color: '#373e73',
    marginBottom: 8,
    ...Specs.fontMedium,
  },
  container: {
    marginTop: 10,
    paddingTop: 13,
    paddingHorizontal: 18,
    backgroundColor: '#F7F7F7',
    paddingBottom: 8,
  },
  endContainer: {
    marginTop: 1,
    alignItems: 'flex-end',
    paddingBottom: 26,
  },
  price: {
    justifyContent: 'flex-end',
    color: '#31cab3',
    ...Specs.fontSemibold,
  },
  button: {
    marginTop: 30,
  },
  customButtonTitleStyle: {
    color: '#FFFFFF',
    fontSize: 16,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  orderDetails: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-around',
    marginVertical: 2,
  },
  itemName: {
    color: '#6c7a87',
    fontSize: 12,
    ...Specs.fontMedium,
  },
  itemCard: {
    flexDirection: 'row',
    flex: 1,
  },
  itemImage: {
    height: 60,
    width: 50,
    marginRight: 12,
  },
  orderDetailLabel: {
    flex: 0.4,
    fontSize: 12,
  },
  orderDetailValue: {
    flex: 0.6,
    fontSize: 12,
  },
  giveFeedbackContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  giveOrderFeedbackContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    width: '80%',
    alignSelf: 'center',
    borderRadius: 10,
    backgroundColor: '#6598d3',
  },
  giveFeedbackStyles: {
    ...Specs.fontMedium,
    color: '#165d52',
    fontSize: 14,
    textDecorationLine: 'underline',
    opacity: 0.8,
    marginBottom: 50,
  },
  giveOrderFeedbackStyles: {
    ...Specs.fontMedium,
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  buttonContainer: {
    paddingVertical: 11,
    paddingHorizontal: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
  },
  buttonText: {
    ...Specs.fontMedium,
    color: 'white',
    fontSize: 16,
  },
  downloadInvoice: {
    ...Specs.fontMedium,
    textDecorationLine: 'underline',
    color: '#373e73',
    fontSize: 14,
    paddingVertical: 8,
  },
  // feedbackText: {
  //   ...Specs.fontMedium,
  //   paddingTop: 16,
  //   marginBottom: 15,
  //   paddingLeft: 17,
  //   color: '#373e73',
  //   fontSize: 16
  // },
  buttonSubmit: {
    width: '100%',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6895d4',
    borderRadius: 5,
    // borderBottomLeftRadius: 30,
    // borderBottomRightRadius: 30,
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
    fontSize: 12,
  },
  inputContainer: {
    paddingTop: 20,
    marginBottom: 10,
    //borderTopColor: '#f2f5f8',
    //borderTopWidth: 10,
  },
  feedbackInput: {
    backgroundColor: 'white',
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.3)',
    marginHorizontal: 14,
    textAlignVertical: 'top',
    height: 90,
    paddingLeft: 10,
  },
  submitButtonContainer: {
    flexDirection: 'row',
    flex: 1,
    marginBottom: 10,
    alignItems: 'center',
  },
  feedBackLengthCount: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    marginRight: 20,
    marginBottom: 20,
  },
  flatListContainer: {
    marginTop: 20,
    paddingBottom: 5,
  },
  reviewLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 5,
    paddingTop: 10,
    paddingHorizontal: 0,
  },
  uploadImageStyles: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    flex: 1,
    marginHorizontal: 14,
    marginBottom: 20,
  },
  reviewLabelStyles: {
    fontSize: 14,
    color: '#373E73',
    ...Specs.fontRegular,
    fontWeight: '500',
    alignSelf: 'center',
  },
  removeIcon: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    position: 'absolute',
    // left: 86,
    top: -18,
  },
  itemName: {
    color: 'rgba(0,0,0,0.8)',
    fontSize: 14,
    ...Specs.fontMedium,
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
    margin: 10,
  },
  itemImage: {
    height: 50,
    width: 50,
    borderRadius: 5,
  },
  LikeDislkeUI: {
    height: 50,
    width: 50,
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
    color: 'white',
  },
  modelTextThankYou: {
    marginTop: 20,
    fontSize: 24,
    fontWeight: '500',
    color: '#222222',
  },
  modelTextPopupDescription: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    fontWeight: '400',
    color: '#999999',
  },
  modelSubmitButton: {
    marginBottom: 0,
    backgroundColor: '#6597D2',
    width: '100%',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingStatusText: {
    ...Specs.fontMedium,
    fontSize: 12,
    color: '#6c7a87',
  },
  ratingStatus: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    alignContent: 'center',
    paddingRight: 10,
    backgroundColor: 'white',
    paddingVertical: 3,
  },
  ratingIcon: {
    height: 15,
    width: 15,
    marginHorizontal: 2,
    alignSelf: 'baseline',
  },
  courierStatus: {
    color: '#fff',
    ...Specs.fontBold,
    fontSize: 17,
    textAlign: 'center',
  },
  courierStatusView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingVertical: 10,
  },
  courierStatusButton: {
    height: 30,
    paddingHorizontal: 10,
    backgroundColor: '#31cab3',
    borderRadius: 5,
    justifyContent: 'center',
  },
});
