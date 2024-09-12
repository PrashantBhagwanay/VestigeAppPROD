import React from 'react';
import { TouchableOpacity, Image } from 'react-native';

const PLACEHOLDER = require('app/src/assets/images/Brands/placeholder.png');

/**
 * @description: It shows brands 
 */
const BrandComponent = (props) =>  {
  const { imageContainer, imageStyle, image, title, brandId } = props;
  return (
    <TouchableOpacity 
      style={imageContainer}
      onPress={() => props.brandStoreClickeHandle(title, brandId)}
      accessibilityLabel={title}
      testID={title}
    >
      <Image
        style={imageStyle}
        resizeMode='contain'
        source={(image)?{uri:image}:PLACEHOLDER}
      />
     
    </TouchableOpacity>
  )
}

export default BrandComponent;