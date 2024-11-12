export interface FamilyGroup {
  id: string;
  FAMILY_NAME: string;
}

export interface UserBatikDetails {
  id: string;
  NAME: string;
  FAMILY_NAME: string;
  SHIRT_SIZE: Size;
  CUTTING: Cutting;
}

export interface TotalUserBatikSize{
  SHIRT_SIZE: string;
  count:number;
}

export interface Size {
  SIZE: string;
  id: string;
  status: string;
}

export interface Cutting {
  CUTTING: string;
  id: string;
}
