import React from 'react';
import { View, Text } from 'react-native';

const PageCheckmark = ({ style }) => (
  <Text style={{ ...styles.element, ...styles.elementCheck, ...style }}>✓</Text>
);

const PageDot = ({ isLight, selected }) => (
  <View
    style={{
      ...styles.element,
      ...styles.elementDot,
      // backgroundColor: (selected ? '#6ed390' : '#185377')
      backgroundColor: isLight ? (selected ? '#acbfd7' : '#ced8e4') : (selected ? '#fff' : 'rgba(255, 255, 255, 0.5)'),
      width: selected ? 15 : 6
    }}
  />
);

const PageDots = ({ isLight, pages, currentPage }) => (
  <View style={styles.container}>
    {Array.from(new Array(pages), (x, i) => i).map(page => (
      <PageDot key={page} selected={page === currentPage} isLight={isLight} />
    ))}
  </View>
);

const styles = {
  container: {
    flex: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  element: {
    marginHorizontal: 3,
  },
  elementCheck:  {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '900',
  },
  elementDot: {
    // width: 6,
    height: 6,
    borderRadius: 7.5,
  },
};

export default PageDots;
