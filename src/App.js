import { Client } from 'boardgame.io/react';
import DeckchairsGame from './game/DeckchairsGame';
import DeckchairsBoard from './ui/Board.js';
import { AI } from 'boardgame.io/ai';

import { MCTSBot } from 'boardgame.io/ai';
import { RandomBot } from 'boardgame.io/ai';
import EnumerateDeckchairsMoves from './simulator/EnumerateDeckchairsMoves';

const testMode = false;

let targets = [];
let deckchairs = [];

if(testMode){
  targets = [
    {id:0, playerId:1},
    {id:7, playerId:1},
    {id:14, playerId:1},
    {id:21, playerId:1},
    {id:28, playerId:1},
    {id:35, playerId:1},
    {id:6, playerId:0},
    {id:13, playerId:0},
    {id:20, playerId:0},
    {id:27, playerId:0},
    {id:34, playerId:0},
    {id:41, playerId:0},
  ];
  
  deckchairs = [
    {id:0, playerId:1},
    {id:7, playerId:1},
    {id:14, playerId:1},
    {id:21, playerId:1},
    {id:28, playerId:1},
    {id:35, playerId:1},
    {id:6, playerId:0},
    {id:13, playerId:0},
    {id:20, playerId:0},
    {id:27, playerId:0},
    {id:34, playerId:0},
    {id:41, playerId:0},
  ];
}

const iceBlockStartPosition = 24;

const App = Client({  
  game: DeckchairsGame(7,7, targets, deckchairs, iceBlockStartPosition, testMode, (+new Date()).toString(36).slice(-10)),
  board: DeckchairsBoard,
  ai: AI({
    bot: RandomBot,
    enumerate: EnumerateDeckchairsMoves
  })});

export default App;