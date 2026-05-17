import { generateRandomId } from "../../../shared/id";

export class SessionPresetHelper {
  static generateUserSessionPresetId = () => generateRandomId("upr");
}
