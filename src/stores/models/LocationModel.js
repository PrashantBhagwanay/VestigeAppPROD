import { get } from 'lodash';
export class City {
    id: Number;
    code: String;
    name: String;
    constructor(locationData){
      this.id=get(locationData, 'id');
      this.cityId=locationData.countryId;
      this.cityCode=locationData.countryCode;
      this.cityName=locationData.countryName;
    }
   
}

export class State {
    id: Number;
    code: String;
    name: String;
    constructor(locationData){
      this.id=locationData.id;
      this.stateId=locationData.stateId;
      this.stateCode=locationData.stateCode;
      this.stateName=locationData.countryName;
    }
}

export class Country {
    id: Number;
    code: String;
    name: String;
    constructor(locationData){
      this.id=locationData.id;
      this.countryId=locationData.countryId;
      this.countryCode=locationData.countryCode;
      this.countryName=locationData.countryName;
    }
}