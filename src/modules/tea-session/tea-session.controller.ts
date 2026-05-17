import { NotFoundError } from "../../shared/errors";
import type {
  TeaSessionUseCases,
  TeaSessionUseCasesTransactionFactory,
} from "./use-cases";

interface FindTeaSessionByIdRequest {
  params: {
    id: string;
  };
  userId: string;
}

interface PatchTeaSessionRequest {
  params: {
    id: string;
  };
  userId: string;
  body: {
    teaId: string | null;
  };
}

export class TeaSessionController {
  constructor(
    private readonly useCases: TeaSessionUseCases,
    private readonly useCasesFactory: TeaSessionUseCasesTransactionFactory,
  ) {}

  async listTeaSessions(userId: string) {
    return this.useCases.ListUserTeaSessions.exec(userId);
  }

  async findTeaSessionById({ params, userId }: FindTeaSessionByIdRequest) {
    const session = await this.useCases.FindTeaSessionById.exec(
      params.id,
      userId,
    );

    if (!session) {
      throw new NotFoundError("Tea session not found");
    }

    return session;
  }

  async PatchTeaSession({ params, userId, body }: PatchTeaSessionRequest) {
    const session = await this.useCasesFactory.createPatchTeaSession().exec({
      sessionId: params.id,
      userId,
      teaId: body.teaId,
    });

    if (!session) {
      throw new NotFoundError("Tea session not found");
    }

    return session;
  }
}
