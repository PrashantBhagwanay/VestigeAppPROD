import React, { Component } from 'react';
import {
  Image,
} from 'react-native';
import PropTypes from 'prop-types';
import { observer, inject } from 'mobx-react';

/**
 * @param {*style , resizeMode , source} props
 * source: It contains image path
 * resizeMode : Image display type
 * @description It
 *  can be called for image display
 */

const PRODUCT_PLACEHOLDER = require('app/src/assets/images/productList/placeHolder.png');
const PRODUCT_PLACEHOLDER_NEPAL = require('app/src/assets/images/productList/placeHolder_nepal.png');
const PROFILE_IMAGE = require('app/src/assets/images/DashBoardHeader/profileImage.png');
@inject('profile')
@observer
export default class Banner extends Component<any, any> {
  
  static propTypes = {
    styles: PropTypes.oneOfType([PropTypes.object, PropTypes.number, PropTypes.array]),
    resizeMode: PropTypes.string,
    source: PropTypes.oneOfType([PropTypes.string, PropTypes.object, PropTypes.number]),
    imageType: PropTypes.string
  }

  static defaultProps = {
    styles: { height: 50, width: 50 },
    resizeMode: null,
    source: null,
    imageType: null,
  };

  constructor(props) {
    super(props);
    this.props = props;
    this.state = {
      imageUrl: null
    }
  }
 
  render() {
    const { styles, resizeMode, source, imageType } = this.props;
    return(
      <Image
        style={styles}
        resizeMode={(this.state.imageUrl)? 'contain' : resizeMode}
        source={(this.state.imageUrl)? this.state.imageUrl : source}
        onError={() => this.setState({imageUrl: (imageType === 'Profile') ? PROFILE_IMAGE : (this.props.profile.countryId != 2 ? PRODUCT_PLACEHOLDER : PRODUCT_PLACEHOLDER_NEPAL)})}
      />
    )
  }
}