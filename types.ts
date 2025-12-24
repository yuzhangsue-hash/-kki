
export interface WishResponse {
  message: string;
  luxuryGift: string;
  affirmation: string;
}

export enum UIStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  RESULT = 'RESULT',
  ERROR = 'ERROR'
}

export enum TreeState {
  SCATTERED = 'SCATTERED',
  TREE_SHAPE = 'TREE_SHAPE'
}
