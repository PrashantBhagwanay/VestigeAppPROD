
import ImagePicker from 'react-native-image-picker';

const options = {
  mediaType: 'photo',
  maxWidth: 1000,
  maxHeight: 1000,
  noData: true,
  storageOptions: {
    skipBackup: true,
    path: 'images',
  },
};

const imagePicker = (cb) => {
  ImagePicker.showImagePicker(options, (response) => {
    console.log('image size', response)
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
      console.log('code in final else');
      cb(response);
    }
  });
};

module.exports = imagePicker;