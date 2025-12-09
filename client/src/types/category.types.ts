export interface Category {
  id: number;
  userId: number | null;
  name: string;
  icon: string;
  color: string;
  isDefault: boolean;
  createdAt: string;
}

export interface CreateCategoryRequest {
  name: string;
  icon?: string;
  color?: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  icon?: string;
  color?: string;
}
