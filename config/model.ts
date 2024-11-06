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

export interface Size {
  SIZE: string;
  id: string;
}

export interface Cutting {
  CUTTING: string;
  id: string;
}
