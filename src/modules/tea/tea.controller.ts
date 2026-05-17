import type { Context } from "elysia";
import { NotFoundError } from "../../shared/errors";
import type { CreateTeaInput } from "./use-cases/create-tea.use-case";
import type { TeaUseCases } from "./use-cases";

type ResponseSet = Context["set"];

interface CreateTeaRequest {
  body: Omit<CreateTeaInput, "userId">;
  userId: string;
  set: ResponseSet;
}

interface FindTeaByIdRequest {
  params: {
    id: string;
  };
  userId: string;
}

interface FindTeaTypeByIdRequest {
  params: {
    id: string;
  };
}

export class TeaController {
  constructor(private readonly useCases: TeaUseCases) {}

  async listTeaTypes() {
    return this.useCases.ListTeaTypes.exec();
  }

  async findTeaTypeById({ params }: FindTeaTypeByIdRequest) {
    const teaType = await this.useCases.FindTeaTypeById.exec(params.id);

    if (!teaType) {
      throw new NotFoundError("Tea type not found");
    }

    return teaType;
  }

  async listTeas(userId: string) {
    return this.useCases.ListUserTeas.exec(userId);
  }

  async createTea({ body, userId, set }: CreateTeaRequest) {
    const tea = await this.useCases.CreateTea.exec({ ...body, userId });
    set.status = 201;

    return tea;
  }

  async findTeaById({ params, userId }: FindTeaByIdRequest) {
    const tea = await this.useCases.FindTeaById.exec(params.id, userId);

    if (!tea) {
      throw new NotFoundError("Tea not found");
    }

    return tea;
  }

  async archiveTea({ params, userId }: FindTeaByIdRequest) {
    const tea = await this.useCases.ArchiveTea.exec(params.id, userId);

    if (!tea) {
      throw new NotFoundError("Tea not found");
    }

    return tea;
  }
}
