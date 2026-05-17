import type { ISODateTime, UserId } from "../../user/types/user.model";

export type TeaId = string;

export type TeaTypeId = `teatype_${string}`;

export type KnownTeaTypeCode =
  | "green"
  | "white"
  | "white_aged"
  | "yellow"
  | "oolong"
  | "tieguanyin"
  | "yancha"
  | "dancong"
  | "gaba_oolong"
  | "red"
  | "dianhong"
  | "sheng_puer_young"
  | "sheng_puer_aged"
  | "shu_puer"
  | "heicha";

export type TeaTypeCode = KnownTeaTypeCode | (string & {});

export interface TeaType {
  id: TeaTypeId;
  code: TeaTypeCode;
  name: string;
  nameCn: string | null;
  description: string;
  typicalTempC: string;
  typicalRinseSec: number | null;
  typicalInfusions: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface Tea {
  id: TeaId;
  userId: UserId;
  name: string;
  teaType: TeaTypeCode;
  origin: string | null;
  producer: string | null;
  harvestYear: number | null;
  notes: string | null;
  archivedAt: ISODateTime | null;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}
