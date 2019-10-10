import { INVALID_MOVE } from 'boardgame.io/core';
import {boardUtils} from './BoardUtils';
import {directions} from './BoardUtils';

function DeckchairsGame(width,height,targets,deckchairs,iceBlockStartPosition) {

    let cells = Array(width * height);

    for(let i=0; i<width*height; i++)
    {
        cells[i] = {target:null, contents:null, attendant: null };
    }

    
    for(let i=0; i<targets.length; i++){
        cells[targets[i].id].target = targets[i].playerId;
    }

    for(let i=0; i<deckchairs.length; i++){
        cells[deckchairs[i].id].contents = deckchairs[i].playerId;
    }
    

    cells[iceBlockStartPosition].contents = "Ice";

    const utils = boardUtils(width,height);

    const moveItem = function(state, id, direction, isIceBlock, distanceTravelled, maxDistance) {

        
        let cellIdToMoveTo = utils.cellInDirection(id, direction);

        console.log(id + " trying to move to " + cellIdToMoveTo);
        console.log("isIceBlock: " + isIceBlock);
        console.log("Distance Travlled: " + distanceTravelled + " Max Distance: " + maxDistance);
        if (state.cells[cellIdToMoveTo] == null) {
            return false;
        }
        else {
            if(state.cells[cellIdToMoveTo].attendant != null){
                //attendant in square - cannot move into it
                return false;
            }

            //deckchairs can't travel further than the thing that hit them
                
            if(!isIceBlock && distanceTravelled >= maxDistance){
                console.log("ran out of momentum");
                return false;
            }

            if(state.cells[cellIdToMoveTo].contents == null) {
                

                //empty square - move into it and try to move again
                state.cells[cellIdToMoveTo].contents = state.cells[id].contents;
                state.cells[id].contents = null;
         
                let finalDestinationId = moveItem(state,cellIdToMoveTo, direction, isIceBlock, distanceTravelled+1, maxDistance);

                if(finalDestinationId){
                    return finalDestinationId;
                }
                else{
                    return cellIdToMoveTo;
                }
            }
            else { 
                //try to move the item, if it moves then move into its cell

                if(moveItem(state, cellIdToMoveTo, direction, false, 0, distanceTravelled+1 )){
                    state.cells[cellIdToMoveTo].contents = state.cells[id].contents;
                    state.cells[id].contents = null;
                    return cellIdToMoveTo;
                }
                else{
                    return false;
                }
                

            }
        }


    }

    return {
        setup: () => ({ width: width, height:height, cells: cells, iceBlockCellId: iceBlockStartPosition }),
        turn: {moveLimit:1},

        phases: {
            playRound:{
                moves:{
                    moveDeckchair: (G, ctx, id, direction) => {

                        //players can only move their own deckchairs
                        if(G.cells[id].contents.toString() !== ctx.currentPlayer) {
                            console.log("Can't move other player's deckchair");
                            return INVALID_MOVE; 
                        }

                        //deckchairs can only be moves up, down, left or right
                        if(direction === 0 || direction === 2 || direction === 4 || direction === 6) {

                        }
                        else {
                            console.log("Can only move deckchairs up, down, left or right");
                            return INVALID_MOVE; 
                        }

                        //can't move a deckchair that has an attendant on it
                        if(G.cells[id].attendant != null) {
                            console.log("Can't move a deckchair that has an attendant on it'");
                            return INVALID_MOVE;
                        }
                               
                        let cellIdToMoveTo = utils.cellInDirection(id, direction);

                        //deckchairs can only move into an empty cell
                        if(cellIdToMoveTo == null) {
                            console.log("Can't move deckchair off board");
                            console.log(cellIdToMoveTo);
                            return INVALID_MOVE;
                        }
                        else
                        {
                            if( G.cells[cellIdToMoveTo].contents != null) {
                                console.log("Can't move onto an occupied square");
                                return INVALID_MOVE;
                            }
                        }



                        
                        //move is legal so let's do it.
                        G.cells[cellIdToMoveTo].contents = G.cells[id].contents;
                        G.cells[id].contents = null;
                        
                        
                        

                    },
                    placeAttendant: (G, ctx, id) => {
                        
                        //can't place an attendant on the ice block
                        if(G.cells[id].contents === "Ice") {
                            console.log("Can't place an attendant onto the ice block");
                            return INVALID_MOVE; 
                        }

                        //can't place an attendant onto a square that already has an attendant on it
                        if(G.cells[id].attendant !== null) {
                            console.log("Can't place an attendant onto a square that already has an attendant on it");
                            return INVALID_MOVE;
                        }

                        //move is legal so let's do it
                        G.cells[id].attendant = parseInt(ctx.currentPlayer);


                    },
                    pushIceBlock: (G, ctx, direction) => {

                        console.log("Ice position: " + G.iceBlockCellId);

                        let iceBlockPosition = G.iceBlockCellId;

                        let newIceBlockPosition = moveItem(G, iceBlockPosition, direction, true, 0,0);

                        if(newIceBlockPosition){
                            G.iceBlockCellId = newIceBlockPosition;
                        }
                         

                    },
                },
                start: true,
                next: 'playRound',
                
            }
        },

        moves: {
        
        },
    }
  };

  export default DeckchairsGame;