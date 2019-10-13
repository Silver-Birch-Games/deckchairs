import { Client } from 'boardgame.io/react';
import DeckchairsGame from './game/DeckchairsGame';
import DeckchairsBoard from './ui/Board.js';

const testMode = false;

let targets = [];
let deckchairs = [];

if(testMode){
  targets = [
    {id:0, playerId:0},
    {id:1, playerId:1},
    {id:7, playerId:0},
    {id:8, playerId:1},
    {id:14, playerId:0},
    {id:15, playerId:1},
    {id:21, playerId:0},
    {id:22, playerId:1},
    {id:28, playerId:0},
    {id:29, playerId:1},
    {id:17, playerId:0},
    {id:5, playerId:1},
  ];
  
  
  deckchairs = [
    {id:1, playerId:0},
    {id:7, playerId:1},
    {id:8, playerId:0},
    {id:9, playerId:1},
    {id:15, playerId:0},
    {id:16, playerId:1},
    {id:20, playerId:0},
    {id:21, playerId:1},
    {id:27, playerId:0},
    {id:28, playerId:1},
    {id:42, playerId:0},
    {id:48, playerId:1},
  ];
}

const iceBlockStartPosition = 0;

const App = Client({  
  game: DeckchairsGame(7,7, targets, deckchairs, iceBlockStartPosition, testMode),
  board: DeckchairsBoard });

export default App;