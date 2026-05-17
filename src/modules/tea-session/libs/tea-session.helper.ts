import { generateRandomId } from "../../../shared/id";

export class TeaSessionHelper {
  static generateTeaSessionId = () => generateRandomId("sr");

  static unixSecondsToDate = (value: number | null | undefined) =>
    value ? new Date(value * 1000) : null;
}
