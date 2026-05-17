import type { Context } from "elysia";
import { NotFoundError } from "../../shared/errors";
import type { CreateDeviceInput } from "./use-cases/create-device.use-case";
import type { DeviceUseCases } from "./use-cases";
import type { DeviceTokenPrincipal } from "./types/device.model";

type ResponseSet = Context["set"];

interface CreateDeviceRequest {
  body: Omit<CreateDeviceInput, "userId">;
  userId: string;
  set: ResponseSet;
}

interface FindDeviceByIdRequest {
  params: {
    id: string;
  };
  userId: string;
}

interface DeleteDeviceRequest {
  params: {
    id: string;
  };
  userId: string;
}

export class DeviceController {
  constructor(private readonly useCases: DeviceUseCases) {}

  async listDevices(userId: string) {
    return this.useCases.ListAllDevices.exec(userId);
  }

  async createDevice({ body, userId, set }: CreateDeviceRequest) {
    const device = await this.useCases.CreateDevice.exec({ ...body, userId });
    set.status = 201;

    return device;
  }

  async findDeviceById({ params, userId }: FindDeviceByIdRequest) {
    const device = await this.useCases.FindDeviceById.exec(params.id, userId);

    if (!device) {
      throw new NotFoundError("Device not found");
    }

    return device;
  }

  async deleteDevice({ params, userId }: DeleteDeviceRequest) {
    return this.useCases.DeleteUserDevice.exec({
      deviceId: params.id,
      userId,
    });
  }

  async revokeCurrentDeviceToken(currentDevice: DeviceTokenPrincipal) {
    return this.useCases.RevokeCurrentDeviceToken.exec(currentDevice);
  }
}
