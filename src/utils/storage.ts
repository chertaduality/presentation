import { Presentation } from '../types';

const STORAGE_KEY = 'presenta_pro_data';

export const savePresentation = (presentation: Presentation): void => {
  const data = getAllPresentations();
  const index = data.findIndex(p => p.id === presentation.id);
  presentation.updatedAt = new Date().toISOString();
  if (index >= 0) {
    data[index] = presentation;
  } else {
    data.push(presentation);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const getAllPresentations = (): Presentation[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const deletePresentation = (id: string): void => {
  const data = getAllPresentations().filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const encodePresentationToURL = (presentation: Presentation): string => {
  const json = JSON.stringify(presentation);
  return btoa(unescape(encodeURIComponent(json)));
};

export const decodePresentationFromURL = (encoded: string): Presentation | null => {
  try {
    const json = decodeURIComponent(escape(atob(encoded)));
    return JSON.parse(json);
  } catch {
    return null;
  }
};

export const generateShareLink = (presentation: Presentation): string => {
  const encoded = encodePresentationToURL(presentation);
  const base = window.location.origin + window.location.pathname;
  return `${base}?share=${encoded}`;
};
