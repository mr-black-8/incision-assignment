export class Item {
  id: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  title: string;
  description: string;
  tags: string[];
  catagory?: string;
  quality_score?: number;
  created_by: string;
  approved_by?: string;
  created_at: number;
  updated_at?: number;
}
