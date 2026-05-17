import { CreateDeviceUseCase } from "./create-device.use-case";
import { DeleteUserDeviceUseCase } from "./delete-user-device.use-case";
import { FindDeviceByIdUseCase } from "./find-device-by-id.use-case";
import { ListAllDevicesUseCase } from "./list-all-devices.use-case";
import { RevokeCurrentDeviceTokenUseCase } from "./revoke-current-device-token.use-case";
import type { DeviceRepository } from "../device.repository";
import type { DeviceTokenRepository } from "../device-token.repository";

export interface DeviceUseCases {
  ListAllDevices: ListAllDevicesUseCase;
  FindDeviceById: FindDeviceByIdUseCase;
  CreateDevice: CreateDeviceUseCase;
  DeleteUserDevice: DeleteUserDeviceUseCase;
  RevokeCurrentDeviceToken: RevokeCurrentDeviceTokenUseCase;
}

export const createDeviceUseCases = (
  repository: DeviceRepository,
  deviceTokenRepository: DeviceTokenRepository,
): DeviceUseCases => {
  const listAllDevicesUseCase = new ListAllDevicesUseCase(repository);
  const findDeviceByIdUseCase = new FindDeviceByIdUseCase(repository);
  const createDeviceUseCase = new CreateDeviceUseCase(repository);
  const deleteUserDeviceUseCase = new DeleteUserDeviceUseCase(repository);
  const revokeCurrentDeviceTokenUseCase = new RevokeCurrentDeviceTokenUseCase(
    deviceTokenRepository,
  );

  return {
    ListAllDevices: listAllDevicesUseCase,
    FindDeviceById: findDeviceByIdUseCase,
    CreateDevice: createDeviceUseCase,
    DeleteUserDevice: deleteUserDeviceUseCase,
    RevokeCurrentDeviceToken: revokeCurrentDeviceTokenUseCase,
  };
};
