export enum Status {
  APPROVED = 'APPROVED',
  PENDING = 'PENDING',
  REJECTED = 'REJECTED',
}

export type CreateItemParams = {
  title: string;
  description: string;
  status: Status;
  catagory?: string;
  tags?: string[];
  quality_score: number;
  created_by: string;
  approved_by?: string;
};

export type UpdateItemParams = {
  id: string;
  status: Status;
  approved_by: string;
};

export type ExpectedAIResponse = {
  title_suggestions: string[];
  description_suggestions: string[];
};
