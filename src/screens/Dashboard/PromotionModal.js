import React, {  } from 'react'
import {
  StyleSheet,
  Modal,
  View,
  Dimensions,
  TouchableOpacity,
  ImageBackground
} from 'react-native';
import { isIphoneXorAbove } from 'app/src/utility/Utility';
import Banner from 'app/src/screens/Dashboard/Banner'
const PROMOTION_OFFER = require('app/src/assets/images/promotionOffer.jpg');
const CLOSE_IMAGE = require('app/src/assets/images/DashBoardHeader/close.png');

export default function PromotionModal({showPromotionModal, onPressCloseIcon, promotionItem, navigation}) {
  return (
    <Modal 
      animationType="slide" 
      visible={showPromotionModal} 
      transparent
      onRequestClose={() => onPressCloseIcon()}
    >
      <View style={styles.modalParent}>
        <TouchableOpacity 
          onPress={() => {
            onPressCloseIcon()
            const {actionUrl, landingScreen} = promotionItem
            const params = `${actionUrl.key === 'brandId' ? 'brand.brandId' : actionUrl.key}=${actionUrl.keyId}`
            navigation.navigate('productList',{type: 'banner', param: params, title: landingScreen});
          }}
          style={styles.modalContainer}
        >
          <ImageBackground 
            source={ promotionItem ? {uri: promotionItem.bannerUrl} : PROMOTION_OFFER } 
            style={{width: '100%', height: '100%'}}
          >
            <TouchableOpacity 
              style={{ position: 'absolute', right: -10, top: -15, backgroundColor: '#fff', zIndex: 1, borderRadius: 60, padding: 5}} 
              activeOpacity={1.0}
              onPress={() => onPressCloseIcon()}
            >
              <Banner
                styles={{ width: 30, height: 30 }}
                source={CLOSE_IMAGE}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </ImageBackground>
        </TouchableOpacity>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalContainer: {
    width: Dimensions.get('window').width - 150,
    height: Dimensions.get('window').height - (isIphoneXorAbove() ? 250 : 180),
    // marginBottom: isIphoneXorAbove() ? 110 : 65,
    // marginLeft: 15,
    // marginRight: 15,
    borderRadius: 4,
    // borderWidth: 1
  },
  modalParent: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    backgroundColor: '#00000040',
    justifyContent: 'center',
  }
})