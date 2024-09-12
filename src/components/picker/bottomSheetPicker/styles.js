import { StyleSheet } from 'react-native';
import { COLOR_CODES, Specs } from '../../../utility/Theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  list: {
    maxHeight: 400,
  },
  divider: {
    height: 2,
    backgroundColor: COLOR_CODES.ghostWhite,
  },
  cancelButtonText: {
    fontSize: 16,
    color: COLOR_CODES.white,
  },
  cancelButton: {
    height: 50,
    borderRadius: 5,
    backgroundColor: COLOR_CODES.black,
    marginHorizontal: 20,
  },
  bottomSheetTitleText: {
    color: COLOR_CODES.lightGrey,
    fontSize: 16,
    textAlign: 'center',
  },
  icon: {
    marginRight: 10,
    alignContent: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    alignItems: 'center',
  },
  bottomSheetItemText: {
    ...Specs.fontSemibold,
    color: COLOR_CODES.labelGrey,
    fontSize: 16,
    alignContent: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    alignItems: 'center',
  },
  bottomSheetItem: {
    margin: 10,
    paddingBottom: 20,
  },
  pickerItems: {
    backgroundColor: COLOR_CODES.athensGrey,
    minHeight: 50,
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
});

export default styles;
