export interface Newsletter {
  id: number;
  title: string;
  content: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  publishedAt?: string;
  thumbnailImg?: string;
  thumbnail?: string;
  summary?: string;
}
