import React from 'react';
import { View, Text, Image, Dimensions } from 'react-native';
import { Specs } from 'app/src/utility/Theme';
const { height } = Dimensions.get('window');

const Page = ({ width, children }) => (
  <View style={{ width }}>
    {children}
  </View>
);

const PageContent = ({ children }) => (
  <View style={styles.content}>
    <View style={{ flex: 0 }}>
      {children}
    </View>
  </View>
);

const PageData = ({ isLight, image, title, subtitle, titleStyles, subtitleStyles, ...rest }) => (
  <Page {...rest}>
    <PageContent>
      <View style={styles.image}>
        <Image source={image} />
      </View>
      <Text style={[styles.title, titleStyles]}>
        {title}
      </Text>
      <Text numberOfLines={3} style={[styles.subtitle, subtitleStyles]}>
        {subtitle}
      </Text>
    </PageContent>
  </Page>
);

const styles = {
  content: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    paddingBottom: 13,
    alignItems: 'center',
  },
  title: {
    ...Specs.fontSemibold,
    textAlign: 'center',
    fontSize: 18,
    color: '#3f4967',
    paddingBottom: 10,
    marginHorizontal: 25,
  },
  subtitle: {
    ...Specs.fontRegular,
    textAlign: 'center',
    fontSize: height < 680 ? 10 : 12,
    color: '#545a6b',
    marginHorizontal: 20,
    lineHeight: 20,
  },
};

export default PageData;
