import { StyleSheet, StatusBar } from 'react-native';
import { COLOR_CODES, Specs } from '../../../utility/Theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  main: {
    flex: 1,
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  text: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: 'bold',
    color: 'black',
  },
  inputView: {
    flex: 1,
    backgroundColor: COLOR_CODES.white,
    paddingTop: 10,
    paddingBottom: 5,
    paddingHorizontal: 5,
    marginVertical: 1,
    justifyContent: 'center',
  },
  sectionTitle: {
    ...Specs.fontSemibold,
    color: COLOR_CODES.labelGrey,
    fontSize: 14,
    marginTop: 15,
    marginBottom: 10,
  },
  mandatoryText: {
    fontSize:12, 
    color: COLOR_CODES.vividRed, 
    marginBottom: 5
  },
  mandatoryFields: {
    marginTop: 15, 
    marginBottom: 10, 
    fontSize:12, 
    color: COLOR_CODES.vividRed
  },
  textInputField: {
    height: 45,
    marginTop: 15,
    marginBottom: 5,
    // paddingLeft: 15,
    paddingRight: 10,
    justifyContent: 'center',
    borderColor: COLOR_CODES.borderDark,
    backgroundColor: COLOR_CODES.white,
    borderWidth: 0.8,
    borderRadius: 8,
  },
  warningText: {
    ...Specs.fontSemibold,
    fontSize: 13,
    color: COLOR_CODES.vividRed,
    marginHorizontal: 5,
  },
  dateInputField: {
    marginTop: 5,
    flexDirection: 'row',
    height: 45,
    marginBottom: 15,
    paddingLeft: 15,
    paddingRight: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderColor: '#3054C4',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: COLOR_CODES.white,
    borderColor: COLOR_CODES.borderDark,
  },
  inputFieldText: {
    color: COLOR_CODES.labelGrey,
    ...Specs.fontMedium,
    fontSize: 12,
  },
  button: {
    backgroundColor: COLOR_CODES.buttonBlue,
    width: '100%',
    marginTop: 10,
    height: 45,
    alignSelf: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  buttonText: {
    ...Specs.fontSemibold,
    fontSize: 14,
    textAlign: 'center',
    color: COLOR_CODES.white,
  },
  radioButtonContainer:{
    flexDirection: 'row',
    paddingBottom: 8,
  },
  overRideStyle: {
    flex: 1,
  },
});

export default styles;
