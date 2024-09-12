import { StyleSheet, StatusBar, Dimensions } from 'react-native';
import { COLOR_CODES, Specs } from '../../../utility/Theme';

const deviceHeight = Dimensions.get('window').height

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  main: {
    // flex: 1,
    paddingTop: 10,
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
  textInputField: {
    height: 45,
    marginTop: 5,
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
  button: {
    backgroundColor: 'transparent',
    width: '100%',
    marginTop: 20,
  },
  customButtonTitleStyle: {
    fontSize: 14,
    color: '#FFFFFF',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
  header: {
    backgroundColor: '#4591ed',
    color: 'white',
    paddingHorizontal: 15,
    paddingVertical: 15,
    fontSize: 20,
  },

  modelView:{
    // height: '80%',
    // width: '100%',
    // height: deviceHeight/2,
    // backgroundColor: COLOR_CODES.LoaderBgColor,
    // backgroundColor: 'white',
    // marginTop:deviceHeight-330
  },
  sortHeading: { 
    marginTop:20, 
    marginLeft:15,
    marginRight:19, 
    flexDirection:'row', 
    justifyContent:'space-between'
  }
});

export default styles;
