import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import CustomModal from '../customModal';
import styles from './styles';
import { strings } from '../../utility/localization/Localized';

const ImagePickerModal = props => {
  const { isVisible, onCameraPress, onLibraryPress, setModalVisiblility } = props;

  return (
    <CustomModal isVisible={isVisible}>
      <View style={styles.main}>
        <View>
          <View style={styles.modalOptions}>
            <TouchableOpacity style={styles.button} onPress={onCameraPress}>
              <Text style={styles.buttonText}>Take Photo</Text>
            </TouchableOpacity>
            <View style={styles.seperator} />
            <TouchableOpacity style={styles.button} onPress={onLibraryPress}>
              <Text style={styles.buttonText}>Choose From Library</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.cancel}
            onPress={() => setModalVisiblility?.(false)}>
            <Text style={styles.buttonText}>
              {strings.commonMessages.cancel}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </CustomModal>
  );
};

export default ImagePickerModal;
