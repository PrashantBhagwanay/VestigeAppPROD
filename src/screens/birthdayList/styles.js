import {
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Specs } from 'app/src/utility/Theme';

const styles = StyleSheet.create({
  mainContainerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  containerInfo: {
    width: Dimensions.get('window').width,
    height: '100%',
    marginTop: 5,
    paddingLeft: 15,
    paddingRight: 15,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  containerInfoAndroid: {
    elevation: 15,
  },
  containerInfoIos: {
    shadowOffset: { width: 0, height: 0 },
    shadowColor: '#e1e5e6',
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  headerInfo: {
    paddingHorizontal: 20,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headingText: {
    color: '#3f5886',
    fontSize: 16,
    ...Specs.fontSemiBold,
    textAlign: 'center',
  },
  closeButton: {
    width: 30,
    height: 30,
  },
  textContainer: {
    width: Dimensions.get('window').width - 80,
    marginVertical: 10,
    marginLeft: 10,
    marginRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  titleText: {
    color: '#263241',
    fontSize: 14,
    ...Specs.fontMedium,
  },
  sendWish: {
    ...Specs.fontRegular,
    fontSize: 12,
    color: '#2b55a4',
  },
  button: {
    marginTop: '5%',
    marginLeft: 16,
    marginRight: 16,
  },
  customButtonTitleStyle: {
    fontSize: 14,
    color: '#FFFFFF',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  sendWishBtn: {
    justifyContent: 'flex-end',
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default styles;
