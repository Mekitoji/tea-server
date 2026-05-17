import { ArchiveTeaUseCase } from "./archive-tea.use-case";
import { CreateTeaUseCase } from "./create-tea.use-case";
import { FindTeaTypeByIdUseCase } from "./find-tea-type-by-id.use-case";
import { FindTeaByIdUseCase } from "./find-tea-by-id.use-case";
import { ListTeaTypesUseCase } from "./list-tea-types.use-case";
import { ListUserTeasUseCase } from "./list-user-teas.use-case";
import type { TeaRepository } from "../tea.repository";
import type { TeaTypeRepository } from "../tea-type.repository";

export interface TeaUseCases {
  ArchiveTea: ArchiveTeaUseCase;
  CreateTea: CreateTeaUseCase;
  FindTeaById: FindTeaByIdUseCase;
  FindTeaTypeById: FindTeaTypeByIdUseCase;
  ListTeaTypes: ListTeaTypesUseCase;
  ListUserTeas: ListUserTeasUseCase;
}

export const createTeaUseCases = (
  teaRepository: TeaRepository,
  teaTypeRepository: TeaTypeRepository,
): TeaUseCases => {
  const archiveTeaUseCase = new ArchiveTeaUseCase(teaRepository);
  const createTeaUseCase = new CreateTeaUseCase(teaRepository);
  const findTeaByIdUseCase = new FindTeaByIdUseCase(teaRepository);
  const findTeaTypeByIdUseCase = new FindTeaTypeByIdUseCase(teaTypeRepository);
  const listTeaTypesUseCase = new ListTeaTypesUseCase(teaTypeRepository);
  const listUserTeasUseCase = new ListUserTeasUseCase(teaRepository);

  return {
    ArchiveTea: archiveTeaUseCase,
    CreateTea: createTeaUseCase,
    FindTeaById: findTeaByIdUseCase,
    FindTeaTypeById: findTeaTypeByIdUseCase,
    ListTeaTypes: listTeaTypesUseCase,
    ListUserTeas: listUserTeasUseCase,
  };
};
