import { StyleSheet, StatusBar, Dimensions } from 'react-native';
import { COLOR_CODES, Specs } from '../../../utility/Theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listItemContainer: {
    backgroundColor: '#fff',
    marginBottom: 10,
    borderRadius: 8,
    elevation: 5,
    shadowOffset: { width: 0, height: 0 },
    shadowColor: COLOR_CODES.shadowGrey,
    shadowOpacity: 0.4,
    shadowRadius: 5,
    overflow: 'hidden',
  },
  detailView: {
    marginVertical: 5,
    marginHorizontal: 15,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailsData: {
    ...Specs.fontMedium,
    fontSize: 12,
    marginBottom: 4,
    color: COLOR_CODES.labelGrey,
  },
  detailLabelLeftSide: {
    flex: 0.3,
    paddingRight: 5,
    ...Specs.fontSemibold,
  },
  noOfProspects: {
    height: 40, 
    width: 150, 
    borderRadius: 10, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#4D9CFF', 
    alignSelf: 'flex-end',
    marginRight: 10,
    marginVertical: 10,
    // position: 'absolute', 
    // bottom: 20,
    // right: 20, 
    shadowColor: '#000',
    shadowOpacity: 1,
    shadowOffset: {
      width: 3,
      height: 3,
    }, borderColor: '#ACDDDE'
  },
  noProspectsFound: {
    justifyContent: 'center', 
    alignItems: 'center', 
    marginVertical: Dimensions.get('window').height/2.5
  },
  totalPropspectsCount: {
    fontSize: 14, 
    ...Specs.fontBold, 
    color: COLOR_CODES.white,
  }
});

export default styles;
