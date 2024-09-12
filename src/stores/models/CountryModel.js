export default class CountryModel {
    id: string;
    countryId: Number;
    countryCode: String;
    countryName: String;
    constructor(locationData){
      this.id=locationData.id;
      this.countryId=locationData.countryId;
      this.countryCode=locationData.countryCode;
      this.countryName=locationData.countryName;
    }
}