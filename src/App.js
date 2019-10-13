import { Client } from 'boardgame.io/react';
import DeckchairsGame from './game/DeckchairsGame';
import DeckchairsBoard from './ui/Board.js';
import { AI } from 'boardgame.io/ai';
import {boardUtils} from './game/BoardUtils';
import { MCTSBot } from 'boardgame.io/ai';
import { RandomBot } from 'boardgame.io/ai';

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
  board: DeckchairsBoard,
  ai: AI({
    bot: RandomBot,
    enumerate: (G, ctx) => {
      const utils = boardUtils(G.width, G.height);
      
      let moves = [];

      let currentPlayerId = parseInt(ctx.currentPlayer);

      //console.log('Enumerating moves');

      if(ctx.phase === 'playRound'){
          //deckchair moves
        //console.log('Enumerating moves for play round');
        for(let i=0; i<G.width * G.height; i++){

          let cell = G.cells[i];

          //check for deckchair moves
          if(cell.contents === currentPlayerId){
              if(cell.attendant == null){
                for(let d=0; d<8; d+=2){
                  let targetCellId = utils.cellInDirection(i,d)

                  if(targetCellId != null){
                    let targetCell = G.cells[targetCellId];

                    if(targetCell.contents == null 
                      && (targetCell.attendant == null || targetCell.attendant === cell.contents)){
                          moves.push({move: 'moveDeckchair', args:[i,d]})
                      }
                  }
                }
              }    
          }

          //check for attendant placing move
          if(G.attendantsUsed[currentPlayerId] === 0){
              if(i !== G.bonusPointsCellId && cell.attendant == null && (cell.contents == null || cell.contents === currentPlayerId)){
                moves.push({move: 'placeAttendant', args:[i]});
              }
          }
        }

        //check what ice block moves are available
        //there needs to an empty cell somewhere in the direction until we get to the edge of the board or an attendant in order for the iceblock to be able to move  
        //(this may gloss over deckchairs that can move onto attendants of their own colour)

        for(let d=0; d<8; d++){
          let cellId = G.iceBlockCellId;
          let nextCellId = G.iceBlockCellId;
          while(cellId != null){
            nextCellId = utils.cellInDirection(cellId,d);


            if(nextCellId != null){
              if(G.cells[nextCellId].attendant != null && G.cells[nextCellId].attendant !== G.cells[cellId].contents){
                break;
              }

              if(G.cells[nextCellId].contents == null){
                //we can push the ice block in this direction
                moves.push({move: 'pushIceBlock', args:[d]});
                break;
              }
            }
            cellId = nextCellId;
          }
        }
      
      }
      else if (ctx.phase === 'scoreRound'){
        //console.log('Enumerating moves for score round');
        moves.push({move: 'endRound', args:[]});
      }
      

      return moves;
    }
  })});

export default App;