import React from 'react';
import Modal from 'react-native-modal';

const CustomModal = props => {
  const { isVisible, children, onBackdropPress } = props;
  return isVisible ? (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onBackdropPress}
      onmodal
      transparent
      backdropOpacity={0.6}
      useNativeDriver
      {...props}>
      {children}
    </Modal>
  ) : null;
};

export default CustomModal;
