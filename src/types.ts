export interface Slide {
  id: string;
  title: string;
  htmlContent: string;
}

export interface Presentation {
  id: string;
  title: string;
  company: string;
  createdAt: string;
  updatedAt: string;
  slides: Slide[];
}
