import React from 'react';
import { View, Image } from 'react-native';

import PageDots from './PageDots';

const getDefaultStyle = (isLight) => ({
  color: isLight ? 'rgba(0, 0, 0, 0.8)' : '#fff',
});

// const SHARE_ICON = require('../../../assets/images/OnBoarding/share_icon.png');

const Paginator = ({ isLight, pages, currentPage }) => (
  <View style={{ ...styles.container }}>
    <PageDots isLight={isLight} pages={pages} currentPage={currentPage} />
    {/* <Image source={SHARE_ICON} style={{position:'absolute', right: 17}} /> */}
  </View>
);

const styles = {
  container: {
    height: 38,
    paddingHorizontal: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  containerOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
};

export default Paginator;
