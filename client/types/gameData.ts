
export interface GameData {
  roomId: string;
  rtdbRoomId: string;
  results: [];
  userId: string;
  userName: string;
  playerScore: [];
  opponentName: string;
  opponentScore: [];
  opponentIsOnline: boolean;
  opponentPressedStart: boolean
}