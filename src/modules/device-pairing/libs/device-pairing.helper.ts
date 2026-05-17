import { AuthHelper } from "../../auth/libs";
import { generateRandomId } from "../../../shared/id";

const USER_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const readNumberEnv = (name: string, fallback: number) => {
  const raw = Bun.env[name];

  if (!raw) {
    return fallback;
  }

  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? value : fallback;
};

export class DevicePairingHelper {
  static generatePairingId = () => generateRandomId("dpr");

  static generatePairingSecret = () => `dps_${AuthHelper.generateToken()}`;

  static generateDeviceToken = () => `dt_${AuthHelper.generateToken()}`;

  static generateUserCode = () => {
    const bytes = new Uint8Array(8);
    crypto.getRandomValues(bytes);
    const value = Array.from(bytes, (byte) => {
      const index = byte % USER_CODE_ALPHABET.length;
      return USER_CODE_ALPHABET[index] ?? "A";
    }).join("");

    return `${value.slice(0, 4)}-${value.slice(4)}`;
  };

  static normalizeUserCode = (code: string) =>
    code.toUpperCase().replace(/[^A-Z0-9]/g, "");

  static hashUserCode = (normalizedUserCode: string) => {
    const pepper =
      Bun.env.DEVICE_PAIRING_CODE_PEPPER ??
      Bun.env.JWT_SECRET ??
      Bun.env.AUTH_JWT_SECRET;

    if (!pepper) {
      throw new Error(
        "DEVICE_PAIRING_CODE_PEPPER or JWT_SECRET is required to hash pairing codes",
      );
    }

    return AuthHelper.hashToken(`${pepper}:${normalizedUserCode}`);
  };

  static pairingExpiresAt = () => {
    const minutes = readNumberEnv("DEVICE_PAIRING_EXPIRES_MINUTES", 10);

    return new Date(Date.now() + minutes * 60 * 1000);
  };

  static pollIntervalSec = () =>
    readNumberEnv("DEVICE_PAIRING_POLL_INTERVAL_SEC", 3);

  static maxActivePairingsPerDevice = () =>
    readNumberEnv("DEVICE_PAIRING_MAX_ACTIVE_PER_DEVICE", 3);

  static activePairingWindowMinutes = () =>
    readNumberEnv("DEVICE_PAIRING_ACTIVE_WINDOW_MINUTES", 15);

  static activePairingWindowStart = () =>
    new Date(
      Date.now() -
        DevicePairingHelper.activePairingWindowMinutes() * 60 * 1000,
    );

  static verificationUri = (userCode: string) => {
    const baseUrl =
      Bun.env.DEVICE_PAIRING_VERIFICATION_URL ??
      "http://localhost:5173/devices/register";
    const url = new URL(baseUrl);

    url.searchParams.set("code", userCode);

    return url.toString();
  };

  static defaultDeviceName = (model: string, deviceUid: string) => {
    const suffix = deviceUid.slice(-4);

    return suffix ? `${model} ${suffix}` : model;
  };
}
