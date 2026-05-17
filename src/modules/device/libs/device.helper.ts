import { generateRandomId } from "../../../shared/id";

export class DeviceHelper {
  static generateDeviceId = () => generateRandomId("dev");

  static generateDeviceTokenId = () => generateRandomId("dtk");
}
