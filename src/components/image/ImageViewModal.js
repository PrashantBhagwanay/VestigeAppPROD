import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Image,
  Modal,
  Dimensions,
  TouchableOpacity
} from 'react-native';

import ImageViewer from 'react-native-image-zoom-viewer';
import { VESTIGE_IMAGE } from 'app/src/utility/constant/Constants';

const { width, height } = Dimensions.get('window');

export default class ImageViewModal extends Component {

  render() {
    let { isVisible, imageUrls, index, onClose} = this.props;
    const imageData = imageUrls?.map(item => {
      const data = {};
      data.url = item?.path;
      return data
    });
    console.log('resimagecheck', isVisible, imageData)
    
    return (
      <Modal
        visible={isVisible}
        transparent
        animationType="none"
        onRequestClose={() => onClose()}
      >
        <View style={{flex:1}}>
          <TouchableOpacity 
            activeOpacity={1} 
            style={styles.closeButton} 
            onPress={() => onClose()}
          >
            <Image source={VESTIGE_IMAGE.CLOSE_COLORED_ICON} />
          </TouchableOpacity>
          <ImageViewer
            index={index}
            saveToLocalByLongPress={false}
            imageUrls={imageData}
          />
        </View>
      </Modal>
    )
  }
}

const styles = StyleSheet.create({

  closeButton: {
    position: 'absolute',
    top: 18,
    right: 15,
    zIndex: 99,
    height: 60,
    width: 30,
    justifyContent: 'center',
    alignItems: 'center'
  },
});