import { StyleSheet, StatusBar, Dimensions } from 'react-native';
import { COLOR_CODES, Specs } from '../../../utility/Theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBar: {
    backgroundColor: '#f0eded',
    paddingHorizontal: 30,
    paddingVertical: Platform.OS === 'android' ? undefined : 15,
  },
  header: {
    backgroundColor: '#4591ed',
    color: 'white',
    paddingHorizontal: 15,
    paddingVertical: 15,
    fontSize: 20,
  },
  textInputStyle: {
    height: 50,
    borderWidth: 1,
    paddingLeft: 20,
    // margin: 5,
    borderRadius: 10,
    margin: 10,
    borderColor: COLOR_CODES.darkGrey,
    backgroundColor: '#FFFFFF',
  },
});

export default styles;
