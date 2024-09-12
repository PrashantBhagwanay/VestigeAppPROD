import { StyleSheet } from 'react-native';
import { COLOR_CODES, Specs } from '../../utility/Theme';

const styles = StyleSheet.create({
  main: {
    flex: 1,
    flexDirection: 'column-reverse',
    // justifyContent: 'flex-end',
  },
  modalOptions: {
    borderRadius: 5,
    height: 100,
    justifyContent: 'space-around',
    backgroundColor: COLOR_CODES.white,
  },
  seperator: {
    height: 1,
    backgroundColor: COLOR_CODES.whiteSmoke,
  },
  button: {
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancel: {
    borderRadius: 5,
    height: 45,
    marginTop: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLOR_CODES.white,
  },
  buttonText: {
    ...Specs.fontBold,
    fontSize: 16,
  },
});

export default styles;
