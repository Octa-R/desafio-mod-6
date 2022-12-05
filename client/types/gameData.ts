
export interface GameData {
  roomId: string;
  rtdbRoomId: string;
  results: [];
  userId: string;
  userName: string;
  playerScore: [];
  playerPressedStart: boolean;
  opponentName: string;
  opponentScore: [];
  opponentIsOnline: boolean;
  opponentPressedStart: boolean
}