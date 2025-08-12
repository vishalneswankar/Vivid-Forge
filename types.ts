

export interface Wallpaper {
  id: string;
  prompt: string;
  base64Image: string;
  type: 'image';
  aspectRatio: '9:16' | '16:9' | '1:1';
}

export interface Video {
  id: string;
  prompt: string;
  url: string;
  type: 'video';
  aspectRatio: '9:16' | '16:9' | '1:1';
  seed?: number;
}

export type View = 'generator' | 'video' | 'favorites' | 'settings';

export interface SourceImage {
    base64: string;
    mimeType: string;
}

export type FavoriteItem = Wallpaper | Video;

export interface User {
    id: string;
    name: string;
    email: string;
    picture: string;
}