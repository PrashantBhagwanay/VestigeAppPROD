
export default class Brand {
  constructor(payload: any) {
    const { brandId, image, name  } = payload;

    this.name = name;
    this.id = brandId;
    this.image = image;
  }
}