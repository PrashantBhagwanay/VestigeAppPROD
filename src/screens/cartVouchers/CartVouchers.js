import React, { Component } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  Text,
  ActivityIndicator,
  FlatList,
  Dimensions,
  TextInput,
} from 'react-native';
import Banner from 'app/src/screens/Dashboard/Banner';
import { inject, observer } from 'mobx-react';
import { observable, action, runInAction, makeObservable } from 'mobx';
import autobind from 'autobind-decorator';
import {
  showToast,
  priceWithCurrency,
  capitalizeFirstCharacter,
  connectedToInternet,
} from 'app/src/utility/Utility';
import { isBonusOrGiftVouchersValid } from 'app/src/utility/Validation/Validation';
import { Specs, COLOR_CODES } from 'app/src/utility/Theme';
import { CartCouponType } from 'app/src/utility/constant/Constants';
import { Toast } from 'app/src/components/toast/Toast';
import OfflineNotice from 'app/src/components/OfflineNotice';
import Icon from 'react-native-vector-icons/FontAwesome';
import { strings } from 'app/src/utility/localization/Localized';
import { _ } from 'lodash';
import { CustomButton } from 'app/src/components/buttons/Button';

// Navigation Icons
import HeaderLeftIcons from 'app/src/components/navigation/HeaderLeftIcons';
import Loader from '../../components/loader/Loader';
import { Header } from '../../components';
const portWidth = Dimensions.get('window').width;

const PLACEHOLDER = require('app/src/assets/images/productList/placeHolder.png');

@inject('cart', 'profile')
@observer
class CartVouchers extends Component {
  @observable data = undefined;
  @observable isLoading = false;
  // @observable isInternetConnected: Boolean = true;

  @action setData = value => {this.data=value}
  @action setIsLoading = value => {this.isLoading=value}
  constructor(props) {
    super(props);
    makeObservable(this);
    this.cart = this.props.route.params.cart;
    this.index = this.props.route.params.index;
    let bonusC =
      this.cart.appliedBonusVoucher.length > 0
        ? this.cart.appliedBonusVoucher[0]
        : '';
    let appliedFlag = bonusC.length > 0 ? true : false;
    this.state = {
      isRefreshing: true,
      giftCoupon: this.cart.appliedGiftVoucher,
      bonusCoupon:
        this.cart.appliedBonusVoucher.length > 0
          ? this.cart.appliedBonusVoucher[0]
          : '',
      selectedPromotionKey:
        this.cart.selectedPromotions.length > 0
          ? `${this.cart.selectedPromotions[0].PTBuyQtyFrom}+${this.cart.selectedPromotions[0].PTBuyQtyTo}`
          : 'NoValue',
      arrAppliedBonusVoucher: [{ bonusCoupon: bonusC, isApplied: appliedFlag }],
      promotionList: undefined,
      promotionLength: 25,
    };
    this.isInternetConnected = true;
  }

  async componentDidMount() {
    this.checkAppliedBonusVouchers();
    this.isInternetConnected = await connectedToInternet();
    await this.getPromotions();
  }

  checkAppliedBonusVouchers() {
    var arrr = [];
    for (let i = 0; i < this.cart.appliedBonusVoucher.length; i++) {
      let item = this.cart.appliedBonusVoucher[i];
      arrr.push({ bonusCoupon: item, isApplied: true });
    }
    if (arrr.length > 0) {
      this.setState({ arrAppliedBonusVoucher: arrr });
    }
  }

  @autobind
  async networkStatus(status) {
    if (status) {
      this.isInternetConnected = status;
      await this.getPromotions();
    }
  }

  @autobind
  async getPromotions() {
    const billBusterPromotions =
      this.cart.promotions.applicableBillBusterPromotions()
        .BillBusterPromotions &&
      this.cart.promotions
        .applicableBillBusterPromotions()
        .BillBusterPromotions.slice();
    let promotions =
      this.cart.promotions &&
      this.cart.promotions.isPromotionCompleted &&
      billBusterPromotions;
    if (promotions?.length > 0) {
      const productsIds = promotions.map(obj => obj.promotionItemID);
      const promoProducts = await this.cart.promotions.getProductsInfo(
        productsIds.toString(),
        this.props.profile.location,
      );

      for (let i = 0; i < promotions.length; i++) {
        promoProducts.forEach(product => {
          if (promotions[i].promotionItemID == product.productId) {
            promotions[i].title = product.productName;
            promotions[i].imageUrl = product.imageUrl;
            promotions[i].skuCode = product.skuCode;
            promotions[i].unitCost = product.productCost;
          }
        });
      }

      if (promotions && promotions.length > 0) {
        this.setData(promotions);
        this.setState({
          promotionList: this.data.slice(0, 25),
          promotionLength: 25,
        });
      }

      if (
        this.cart.promotions.isPromotionCompleted &&
        this.state.promotionList === undefined
      ) {
        setTimeout(() => {
          this.setState({ promotionList: [] });
        }, 4000);
      }
    } else {
      this.setState({ promotionList: [] });
    }
  }

  couponInput = async (value, type, index) => {
    if (type === CartCouponType.Gift) {
      this.setState({ giftCoupon: value });
    } else {
      let item = this.state.arrAppliedBonusVoucher[index];
      item.bonusCoupon = value;
      this.state.arrAppliedBonusVoucher[index] = item;
      this.setState({
        bonusCoupon: value,
        arrAppliedBonusVoucher: this.state.arrAppliedBonusVoucher,
      });
    }
  };

  @autobind
  showToast(message: string, type) {
    // Add a Toast on screen.
    Toast.show(message, {
      duration: Toast.durations.SHORT,
      type: type,
      shadow: false,
      animation: true,
      hideOnPress: true,
      delay: 0,
    });
  }

  @autobind
  async clearCouppons(type, index) {
    if (type === CartCouponType.Gift) {
      this.setState({ giftCoupon: '' });
      this.props.cart.clearVoucher(this.index, type, this.cart);
    } else {
      let item = this.state.arrAppliedBonusVoucher[index];
      item.bonusCoupon = '';
      item.isApplied = false;
      if (this.state.arrAppliedBonusVoucher.length == 1) {
        this.state.arrAppliedBonusVoucher[index] = item;
      } else {
        this.state.arrAppliedBonusVoucher.splice(index, 1);
      }
      this.setState({
        arrAppliedBonusVoucher: this.state.arrAppliedBonusVoucher,
      });
      this.props.cart.clearVoucher(index, type, this.cart, index);
      this.props.cart.setIsBonusVoucherPvBvZero('0');
      this.props.cart.setIsCncVoucherApplied('0');
      this.props.cart.setIsProdVoucherApplied('0');
      this.props.cart.setIsShowMoqStrip(false);
    }
  }

  @autobind
  getManualEnterVoucherCodeView(title, type) {
    let disable = false;
    let couponCode;
    if (type === CartCouponType.Gift) {
      disable = this.cart.appliedGiftVoucher === '' ? false : true;
      couponCode = this.state.giftCoupon;
    } else {
      // disable = this.cart.appliedBonusVoucher === '' ? false : true;
      couponCode = this.state.bonusCoupon;
    }
    return (
      <View style={styles.enterVoucherView}>
        <View style={{ flex: 1 }}>
          <TextInput
            disabled={disable}
            placeholder={title}
            style={styles.enterCode}
            onChangeText={value => this.couponInput(value, type)}
            value={couponCode}
            default
            maxLength={28}
            autoCapitalize="characters"
          />
        </View>
        <TouchableOpacity
          style={disable ? { justifyContent: 'center' } : styles.applyView}
          onPress={() => {
            Keyboard.dismiss();
            {
              !disable ? this.applyClickHandle(type) : this.clearCouppons(type);
            }
          }}>
          {disable ? (
            <Icon name="close" style={[styles.iconStyle]} />
          ) : (
            <Text style={styles.title}>Apply</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  @autobind
  getManualEnterVoucherCodeViewBonus(title, type, item, index) {
    let disable = false;
    let couponCode;
    // disable = this.cart.appliedBonusVoucher === '' ? false : true;
    // couponCode = this.state.bonusCoupon
    // let item = {"disable":disable,"couponCode":couponCode}
    // disable = item.appliedBonusVoucher === '' ? false : true;
    disable = item.isApplied;
    couponCode = item.bonusCoupon;
    return (
      <View style={styles.enterVoucherView}>
        <View style={{ flex: 1 }}>
          <TextInput
            placeholder={title}
            editable={!disable}
            value={couponCode}
            style={styles.enterCode}
            onChangeText={value => this.couponInput(value, type, index)}
            keyboardType={'default'}
            maxLength={28}
            autoCapitalize="characters"
          />
        </View>
        <TouchableOpacity
          style={disable ? { justifyContent: 'center' } : styles.applyView}
          onPress={() => {
            Keyboard.dismiss();
            {
              !disable
                ? this.applyClickHandle(type, index)
                : this.clearCouppons(type, index);
            }
          }}>
          {disable ? (
            <Icon name="close" style={[styles.iconStyle]} />
          ) : (
            <Text style={styles.title}>Apply</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }
  // addToCartPress = _.debounce(async(product) => {
  applyClickHandle = _.debounce(
    async (type, index) => {
      const { giftCoupon, bonusCoupon } = this.state;
      if (type === CartCouponType.Gift) {
        console.log(giftCoupon);
        if (
          giftCoupon.trim().length < 4 ||
          !isBonusOrGiftVouchersValid(giftCoupon)
        ) {
          this.showToast(
            strings.errorMessage.cartVoucher.validGiftVoucher,
            Toast.type.ERROR,
          );
        } else {
          const response = await this.props.cart.applyCoupon(
            type,
            giftCoupon,
            this.cart,
            this.index,
          );
          console.log('Cart Vouchers screen',response)
          if (response) {
            this.showToast(
              strings.errorMessage.cartVoucher.successfullyApplied,
              Toast.type.SUCCESS,
            );
          }
          else {
            this.showToast(
              strings.errorMessage.cartVoucher.invalidCoupon,
              Toast.type.ERROR,
            );
          }
        }
      } else {
        const { totalCost } = this.cart;
        let isAlreadyAdded = false;
        for (let i = 0; i < this.cart.appliedBonusVoucher.length; i++) {
          if (
            this.cart.appliedBonusVoucher[i] ==
            this.state.arrAppliedBonusVoucher[index].bonusCoupon
          ) {
            isAlreadyAdded = true;
          }
        }
        if (isAlreadyAdded) {
          this.showToast(
            this.state.arrAppliedBonusVoucher[index].bonusCoupon +
              ' ' +
              strings.errorMessage.cartVoucher.alreadyAddedVoucher,
            Toast.type.ERROR,
          );
          return;
        }

        if (totalCost == 0) {
          this.showToast(
            strings.errorMessage.cartVoucher.canNotAddMoreVouchers,
            Toast.type.ERROR,
          );
          return;
        }

        if (
          this.state.arrAppliedBonusVoucher[index].bonusCoupon.trim().length <
            5 ||
          !isBonusOrGiftVouchersValid(
            this.state.arrAppliedBonusVoucher[index].bonusCoupon,
          )
        ) {
          this.showToast(
            strings.errorMessage.cartVoucher.validBonusVoucher,
            Toast.type.ERROR,
          );
        } else {
          const response = await this.props.cart.applyCoupon(
            type,
            this.state.arrAppliedBonusVoucher[index].bonusCoupon,
            this.cart,
            this.index,
            index,
          );
          console.log('Cart Vouchers screen applied voucher',response)
          if (response) {
            if (response == 2) {
              this.showToast(
                strings.errorMessage.cartVoucher.cncNotAplicable,
                Toast.type.ERROR,
              );
            } else {
              let itemm = this.state.arrAppliedBonusVoucher[index];
              itemm.bonusCoupon = this.cart.appliedBonusVoucher[index];
              itemm.isApplied = true;
              this.state.arrAppliedBonusVoucher[index] = itemm;
              this.setState({
                arrAppliedBonusVoucher: this.state.arrAppliedBonusVoucher,
              });
              this.showToast(
                strings.errorMessage.cartVoucher.successfullyApplied,
                Toast.type.SUCCESS,
              );
            }
          } else {
            this.showToast(
              strings.errorMessage.cartVoucher.invalidCoupon,
              Toast.type.ERROR,
            );
          }
        }
      }
    },
    2000,
    { leading: true, trailing: false },
  );

  @autobind
  async updateBBPromotions(item) {
    this.setState({
      selectedPromotionKey: `${item.PTBuyQtyFrom}+${item.PTBuyQtyTo}`,
    });

    this.cart.selectedPromotions = _.filter(this.data, {
      PTBuyQtyFrom: item.PTBuyQtyFrom,
      PTBuyQtyTo: item.PTBuyQtyTo,
    });
  }

  @autobind
  renderItem(item) {
    return (
      <View style={{ marginHorizontal: 22, marginTop: 10 }}>
        <TouchableWithoutFeedback
          onPress={() => {
            // alert(JSON.stringify(this.props.cart.isProdVoucherApplied));
            if (this.props.cart.isBonusVoucherPvBvZero == '1') {
              alert(
                'You cannot apply any promotion with the selected bonus voucher.',
              );
              return;
            } else if (this.props.cart.isCncVoucherApplied == '1') {
              showToast(strings.errorMessage.cartVoucher.otherVoucherMessage);
              return;
            }else if (this.props.cart.isProdVoucherApplied == '1') {
              showToast(strings.errorMessage.cartVoucher.otherVoucherMessage);
              return;
            }
            this.updateBBPromotions(item);
          }}>
          <View style={{ flexDirection: 'row' }}>
            <View style={styles.leftViewPromotion}>
              <View style={styles.radioView}>
                {this.state.selectedPromotionKey ===
                `${item.PTBuyQtyFrom}+${item.PTBuyQtyTo}` ? (
                  <View style={styles.selectedRadioButton} />
                ) : null}
              </View>
            </View>
            <Banner
              styles={styles.productImage}
              resizeMode="contain"
              source={item.imageUrl ? { uri: item.imageUrl } : PLACEHOLDER}
            />
            <View style={[styles.leftViewPromotion, { flex: 1 }]}>
              <Text
                style={[
                  styles.promotionText,
                  { ...Specs.fontSemibold, color: '#14aa93', fontSize: 14 },
                ]}>
                {item.promotionName}
              </Text>
              <Text numberOfLines={2} style={styles.promotionText}>
                {capitalizeFirstCharacter(item.title)}
              </Text>
              <Text
                style={
                  styles.promotionText
                }>{`${strings.cartVouchersScreen.itemCode} : ${item.skuCode}`}</Text>
              <Text style={styles.promotionText}>
                {priceWithCurrency(
                  this.props.profile.defaultAddressCountryId,
                  Number.parseFloat(item.discountPrice).toFixed(2),
                )}
              </Text>
              <Text
                style={
                  styles.promotionText
                }>{`${strings.cartVouchersScreen.quantityKey} : ${item.quantity}`}</Text>
            </View>
          </View>
        </TouchableWithoutFeedback>
        <View style={{ height: 1, marginTop: 5, backgroundColor: '#c8c9d3' }} />
      </View>
    );
  }

  lazyload = () => {
    if (
      this.state.promotionList &&
      this.state.promotionList.length % 25 === 0
    ) {
      this.setIsLoading(true);
      let data = this.data.slice(
        this.state.promotionLength,
        this.state.promotionLength + 25,
      );
      this.setState(prevState => {
        return {
          promotionList: prevState.promotionList?.concat(data),
          promotionLength: prevState.promotionLength + 25,
        };
      });
    }
    this.setIsLoading(false);
  };

  renderHeader = () => {
    return (
      <View
        style={{
          height: 54,
          backgroundColor: '#fafbfc',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Text style={{ color: '#414456', ...Specs.fontSemibold }}>
          {strings.cartVouchersScreen.promotionsKey}
        </Text>
      </View>
    );
  };

  render() {
    return (
      <View style={{ flex: 1 }}>
        <Loader loading={this.props.cart.isLoading} />
        <Header
          navigation={this.props.navigation}
          screenTitle={strings.cartVouchersScreen.screenTitle}
        />
        {!this.isInternetConnected && (
          <OfflineNotice networkStatus={status => this.networkStatus(status)} />
        )}
        <TouchableWithoutFeedback
          onPress={Keyboard.dismiss}
          accessible={false}
          style={styles.mainView}>
          <View style={styles.mainView}>
            <View style={[styles.mainView, { height: 75 }]}>
              {this.getManualEnterVoucherCodeView(
                strings.cartVouchersScreen.enterGiftVoucherCode,
                CartCouponType.Gift,
              )}
            </View>
            <FlatList
              style={{ backgroundColor: '#f2f5f8' }}
              data={this.state.arrAppliedBonusVoucher}
              removeClippedSubviews={false}
              keyExtractor={(item, index) => item + index}
              renderItem={({ item, index }) =>
                this.getManualEnterVoucherCodeViewBonus(
                  strings.cartVouchersScreen.enterBonusVoucherCode,
                  CartCouponType.Bonus,
                  item,
                  index,
                )
              }
            />
            {this.state.arrAppliedBonusVoucher[
              this.state.arrAppliedBonusVoucher.length - 1
            ].isApplied == true &&
              this.state.arrAppliedBonusVoucher.length < 5 &&
              this.props.cart.isCncVoucherApplied != '1' && (
                <TouchableOpacity
                  style={{
                    borderRadius: 5,
                    backgroundColor: '#6797d4',
                    width: 40,
                    height: 30,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: 10,
                    marginBottom: 5,
                    marginLeft: portWidth - 60,
                  }}
                  onPress={() => {
                    Keyboard.dismiss();
                    let arr = this.state.arrAppliedBonusVoucher;
                    arr.push({ bonusCoupon: '', isApplied: false });
                    this.setState({ arrAppliedBonusVoucher: arr });
                  }}>
                  <Text
                    style={{ fontSize: 20, fontWeight: '700', color: 'white' }}>
                    +
                  </Text>
                </TouchableOpacity>
              )}
          </View>
        </TouchableWithoutFeedback>
        <FlatList
          style={{ backgroundColor: '#f2f5f8' }}
          data={this.state.promotionList}
          renderItem={({ item }) => this.renderItem(item)}
          onEndReached={() => this.lazyload()}
          onEndReachedThreshold={0.7}
          keyExtractor={(item, index) => index.toString()}
          ListHeaderComponent={this.renderHeader}
          ListEmptyComponent={
            !this.cart.promotions.isPromotionCompleted ? (
              <View style={{ alignItems: 'center', marginTop: 120 }}>
                <Text style={{ color: '#3f496799' }}>
                  {strings.cartVouchersScreen.noPromotionsAvailableTextMessage}
                </Text>
                <TouchableOpacity
                  style={styles.buttonContainer}
                  onPress={() => this.getPromotions()}>
                  <Text style={styles.buttonText}>
                    {strings.cartVouchersScreen.pleaseTryAgainMessage}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : this.state.promotionList && this.state.promotionList.length === 0 ? (
              <View style={{ alignItems: 'center', marginTop: 120 }}>
                <Text style={{ color: '#3f496799' }}>
                  {strings.cartVouchersScreen.noPromotionsFoundForYou}
                </Text>
              </View>
            ) : (
              <View style={{ alignItems: 'center', marginTop: 120 }}>
                <ActivityIndicator size="large" color="#5988e0" />
              </View>
            )
          }
          stickyHeaderIndices={[0]}
          ListFooterComponent={() =>
            this.isLoading ? (
              <ActivityIndicator size="large" color="#5988e0" />
            ) : null
          }
          extraData={this.data}
        />
        <View style={{ marginTop: 10, flexDirection: 'row', height: 50 }}>
          <CustomButton
            handleClick={() => {
              // if(this.props.cart.isBonusVoucherPvBvZero == '1') {
              //   this.cart.qtyPromotions = []
              //   this.cart.selectedPromotions = []
              // }
              this.props.navigation.goBack();
            }}
            buttonTitleStyle={styles.cartCheckoutButtonTextStyle}
            buttonContainer={styles.cartCheckoutButtonStyle}
            buttonTitle={strings.cartVouchersScreen.proceedButtonTitle}
          />
        </View>
      </View>
    );
  }
}

export default CartVouchers;

const styles = StyleSheet.create({
  mainView: {
    backgroundColor: '#f2f5f8',
    // height: 150
  },
  enterVoucherView: {
    flexDirection: 'row',
    marginHorizontal: 22,
    marginTop: 10,
    backgroundColor: '#f2f5f8',
    alignItems: 'center',
    borderBottomWidth: 0.6,
    borderBottomColor: COLOR_CODES.borderDark,
  },
  applyView: {
    width: 70,
    height: 24,
    justifyContent: 'center',
    marginLeft: 15,
    borderRadius: 15,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#6797d4',
  },
  title: {
    width: '100%',
    fontSize: 14,
    textAlign: 'center',
    color: '#6797d4',
    ...Specs.fontSemibold,
  },
  iconStyle: {
    fontSize: 20,
    alignSelf: 'center',
    marginLeft: 15,
    color: 'green',
  },
  enterCode: {
    fontSize: 12,
    color: '#3f4967',
    ...Specs.fontRegular,
  },
  promotionText: {
    color: '#414456',
    ...Specs.fontRegular,
    fontSize: 13,
  },
  radioView: {
    justifyContent: 'center',
    borderRadius: 20,
    height: 20,
    width: 20,
    borderWidth: 1,
    borderColor: '#58cdb4',
    marginHorizontal: 14,
    marginVertical: 10,
  },
  leftViewPromotion: {
    justifyContent: 'center',
  },
  selectedRadioButton: {
    borderRadius: 20,
    height: 14,
    width: 14,
    backgroundColor: '#58cdb4',
    alignSelf: 'center',
  },
  buttonContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#6598d3',
    borderRadius: 30,
  },
  buttonText: {
    ...Specs.fontMedium,
    color: 'white',
    fontSize: 16,
  },
  cartCheckoutButtonStyle: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#6797d4',
    justifyContent: 'center',
  },
  cartCheckoutButtonTextStyle: {
    fontSize: 16,
    color: '#FFFFFF',
    alignSelf: 'center',
  },
  productImage: {
    width: 60,
    height: 79,
    marginRight: 10,
  },
  emptyScreenView: {
    flex: 1,
    marginBottom: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
