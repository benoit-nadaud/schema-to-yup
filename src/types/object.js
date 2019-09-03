import { YupMixed } from "./mixed";
// import { buildYup } from "../";

export class ObjectHandler {
  constructor(config) {
    this.config = config;
  }

  isObject(obj) {
    return this.config.isObject(obj);
  }

  handle(obj) {
    return this.isObject(obj) && YupObject.create(obj).createSchemaEntry();
  }
}

export function createObjectHandler(config = {}) {
  return new ObjectHandler(config);
}


export function toYupObject(obj, config = {}) {
  return obj && new ObjectHandler(config).handle(obj);
}

// Allow recursive schema
export class YupObject extends YupMixed {
  constructor(obj) {
    super(obj);
    this.type = "object";
    this.base = this.yup.object();
    this.properties = this.value.properties;
  }

  static create(obj) {
    return new YupObject(obj);
  }

  convert() {
    if (!this.properties) return this;
    this.noUnknown();
    this.camelCase().constantCase();

    // recursive definition
    if (this.value) {
      const schema = this.config.buildYup(this.value);
      this.base.shape(schema);
    }
    return this;
  }

  camelCase() {
    return this.addConstraint("camelCase");
  }

  constantCase() {
    return this.addConstraint("constantCase");
  }

  noUnknown() {
    const { noUnknown, propertyNames } = this.value;
    const $names = noUnknown || propertyNames;
    const newBase =
      $names &&
      this.base.noUnknown(
        $names,
        this.valErrMessage("propertyNames") || this.valErrMessage("noUnknown")
      );
    this.base = newBase || this.base;
    return this;
  }
}

