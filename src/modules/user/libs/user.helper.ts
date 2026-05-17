import { generateRandomId } from "../../../shared/id";

export class UserHelper {
  static generateUserId = () => generateRandomId("usr");
}
