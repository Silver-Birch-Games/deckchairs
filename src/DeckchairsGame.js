import { INVALID_MOVE } from 'boardgame.io/core';
import {boardUtils} from './BoardUtils';
import {directions} from './BoardUtils';
import { TurnOrder } from 'boardgame.io/core';

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

    const actionsPerRound = 8;
    const roundsPerGame = 8;
    const bonusPointsCellId = 24;

   // cells[iceBlockStartPosition].contents = "Ice";

    const utils = boardUtils(width,height);

    const moveItem = function(state, id, direction, isIceBlock, distanceTravelled, maxDistance) {
        let cellIdToMoveTo = utils.cellInDirection(id, direction);

        //console.log(id + " trying to move to " + cellIdToMoveTo);
        //console.log("isIceBlock: " + isIceBlock);
        //console.log("Distance Travlled: " + distanceTravelled + " Max Distance: " + maxDistance);
        if (state.cells[cellIdToMoveTo] == null) {
            return null;
        }
        else {
            console.log("trying to move " + id + "(" + state.cells[id].contents + ") to " + cellIdToMoveTo + "(Attendant " + state.cells[cellIdToMoveTo].attendant + ")" );
            if(state.cells[cellIdToMoveTo].attendant != null && state.cells[cellIdToMoveTo].attendant !== state.cells[id].contents){
                //other players attendant in square - cannot move into it
                console.log("trying to move " + id + "(" + state.cells[id].contents + ") to " + cellIdToMoveTo + "(Attendant " + state.cells[cellIdToMoveTo].attendant + ")" );
                return null;
            }

            //deckchairs can't travel further than the thing that hit them
                
            if(!isIceBlock && distanceTravelled >= maxDistance){
                //console.log("ran out of momentum");
                return null;
            }

            if(state.cells[cellIdToMoveTo].contents == null) {
                

                //empty square - move into it and try to move again
                state.cells[cellIdToMoveTo].contents = state.cells[id].contents;
                state.cells[id].contents = null;

                //console.log("moved contents from " + id + " to " + cellIdToMoveTo);
         
                let finalDestinationId = moveItem(state,cellIdToMoveTo, direction, isIceBlock, distanceTravelled+1, maxDistance);

                if(finalDestinationId != null){
                    return finalDestinationId;
                }
                else{
                    return cellIdToMoveTo;
                }
            }
            else { 
                //try to move the item, if it moves then move into its cell

                if(moveItem(state, cellIdToMoveTo, direction, false, 0, distanceTravelled+1 ) != null){
                    state.cells[cellIdToMoveTo].contents = state.cells[id].contents;
                    state.cells[id].contents = null;
                    return cellIdToMoveTo;
                }
                else{
                    return null;
                }
                

            }
        }
    }

    const applyShipMovement = function(state, direction){

        if(direction == null){
            return;
        }

        //assign an ordering to the cells for trying to move the items on them

        let cellIds = [];

        for(let i=0; i<state.width * state.height; i++){
            let coords = utils.idToCoords(i);
            switch(direction){
                case directions.north:
                    //ordering is y value
                    cellIds.push({id:i, order:coords.y});
                    break;
                case directions.east:
                    //ordering is reversed x value
                    cellIds.push({id:i, order: state.width - coords.x});
                    break;
                case directions.south:
                        //ordering is reversed y value
                        cellIds.push({id:i, order: state.height - coords.y});
                        break;
                case directions.west:
                    //ordering is x value
                    cellIds.push({id:i, order:coords.x});
                    break;

                case directions.northEast:
                    //ordering is reversed x plus y
                    cellIds.push({id:i, order: state.width - coords.x + coords.y});
                    break;

                case directions.southEast:
                    //ordering is reversed x plus reversed y
                    cellIds.push({id:i, order: state.width - coords.x + state.height - coords.y});
                    break;

                case directions.southWest:
                    //ordering is x plus reversed y
                    cellIds.push({id:i, order: coords.x + state.height - coords.y});
                    break;

                case directions.northWest:
                        //ordering is x plus y
                        cellIds.push({id:i, order: coords.x + coords.y});
                        break;

                default:
            }
        }

        cellIds.sort((a,b)=>(a.order - b.order));

        //now try to move the item in each cell 

        for(let i=0; i<state.width * state.height; i++){

            let id=cellIds[i].id;

            //check there is a deckchair here
            if(state.cells[id].contents != null && id !== state.iceBlockCellId){

                //if there is an attendant on the chair then it does not move
                if(state.cells[id].attendant == null){

                    let cellIdToMoveTo = utils.cellInDirection(id, direction);

                    //console.log("Trying to move " + id + " to " + cellIdToMoveTo);
    
                    if (cellIdToMoveTo != null 
                        && state.cells[cellIdToMoveTo].contents == null
                        && (state.cells[cellIdToMoveTo].attendant == null || state.cells[cellIdToMoveTo].attendant === state.cells[id].contents)
                        && cellIdToMoveTo !== state.iceBlockCellId){
                            
                            console.log("Succeed");
                        //nothing in cell so we can move there
                        state.cells[cellIdToMoveTo].contents = state.cells[id].contents;
                        state.cells[id].contents = null;
                    }

                }

                
            }

            
        }


    }

    const calculateScores = function(state){
        let roundScores = [0,0];

        for(let i=0; i<state.width*state.height; i++){
            //check for deckchair
            if(state.cells[i].contents != null && state.cells[i].contents !== "Ice"){
                //check central square 
                if(i===bonusPointsCellId){
                    roundScores[state.cells[i].contents]+=4;
                }
                else if(state.cells[i].target != null){
                    //check if it is own target
                    if(state.cells[i].target === state.cells[i].contents){
                        roundScores[state.cells[i].target]+=2;
                    }
                    else{
                        roundScores[state.cells[i].contents]++;
                    }
                }
            }
        }

        for(let p=0; p<roundScores.length; p++){
            state.scores[p] += roundScores[p];
        }
    }

    const removeAttendants = function(state){
        for(let i=0; i<state.width*state.height; i++){
            state.cells[i].attendant = null;
        }

        state.attendantsUsed = [0,0];
    }

    const setup = (ctx) => {

        let directionCardDeck = [0,1,2,3,4,5,6,7];

        //let shuffledDeck = [null, ...ctx.random.Shuffle(directionCardDeck)];

        let shuffledDeck = directionCardDeck;

        return { width: width, height:height, cells: cells, iceBlockCellId: iceBlockStartPosition, actionsTakenInRound:0, directionCardDeck:shuffledDeck, roundsPlayed:0, scores:[0,0], bonusPointsCellId:bonusPointsCellId, attendantsUsed: [0,0] }
    }

    return {
        setup: setup,
        turn: {
            moveLimit:1,
            order: {
                first: (G, ctx) => (G.roundsPlayed % ctx.numPlayers),
                next: (G, ctx) => (ctx.playOrderPos + 1) % ctx.numPlayers,
            }
        },

        phases: {
            placeTargets:{
                start: true,
                turn:{
                    moveLimit:6,
                    order: TurnOrder.ONCE
                },
                moves:{
                    placeTarget: (G, ctx,id) => {
                        G.cells[id].target = parseInt(ctx.currentPlayer);
                    }
                },
                next: 'placeDeckchairs',
            },
            placeDeckchairs:{
                turn:{
                    moveLimit:6,
                    order: TurnOrder.ONCE
                },
                moves:{
                    placeDeckchair: (G, ctx,id) => {
                        G.cells[id].contents = parseInt(ctx.currentPlayer);
                    }
                },
                next: 'placeIceBlock',
            },
            placeIceBlock:{
                turn:{
                    moveLimit:1
                },
                moves:{
                    placeIceBlock: (G, ctx,id) => {
                        G.iceBlockCellId = id;
                        G.cells[id].contents = "Ice";
                        ctx.events.endPhase();
                    }
                },
                next: 'playRound'
            },
            playRound:{
                
                moves:{
                    moveDeckchair: (G, ctx, id, direction) => {

                        console.log("ID:" + id + " Direction:" + direction)
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

                        //can't move a deckchair onto an opponents attendant
                        if(G.cells[cellIdToMoveTo].attendant != null && G.cells[cellIdToMoveTo].attendant !== G.cells[id].contents){
                            console.log("Can't move a deckchair onto an opponents attendant");
                            return INVALID_MOVE;
                        }

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


                        console.log("Moving " + id + " to " + cellIdToMoveTo );
                        
                        //move is legal so let's do it.
                        G.cells[cellIdToMoveTo].contents = G.cells[id].contents;
                        G.cells[id].contents = null;
                        
                        
                        G.actionsTakenInRound++;

                    },
                    placeAttendant: (G, ctx, id) => {
                        
                        //can't place an attendant if already done this round
                        if(G.attendantsUsed[parseInt(ctx.currentPlayer)] > 0){
                            console.log("Already used attendant this round");
                            return INVALID_MOVE; 
                        }


                        //can't place an attendant on the ice block
                        if(G.cells[id].contents === "Ice") {
                            console.log("Can't place an attendant onto the ice block");
                            return INVALID_MOVE; 
                        }

                        if(id === G.bonusPointsCellId){
                            console.log("Can't place an attendant onto the bonus points square");
                            return INVALID_MOVE; 
                        }

                        //can't place an attendant onto a square that already has an attendant on it
                        if(G.cells[id].attendant !== null) {
                            console.log("Can't place an attendant onto a square that already has an attendant on it");
                            return INVALID_MOVE;
                        }

                        //move is legal so let's do it
                        G.cells[id].attendant = parseInt(ctx.currentPlayer);
                        G.attendantsUsed[parseInt(ctx.currentPlayer)]++;

                        G.actionsTakenInRound++;
                    },
                    pushIceBlock: (G, ctx, direction) => {

                        //console.log("Ice position: " + G.iceBlockCellId);

                        let iceBlockPosition = G.iceBlockCellId;

                        let newIceBlockPosition = moveItem(G, iceBlockPosition, direction, true, 0,0);

                        if(newIceBlockPosition != null && newIceBlockPosition !== iceBlockPosition){
                            //console.log("Ice block has moved from " + G.iceBlockCellId + " to " + newIceBlockPosition)
                            G.iceBlockCellId = newIceBlockPosition;
                            G.actionsTakenInRound++;
                        }
                        else{
                            console.log("Pushing ice block must result in it moving");
                            return INVALID_MOVE;
                        }
                         
                        
                    },
                    testCalculateScores: (G, ctx) => {
                        calculateScores(G);
                    }
                },
                endIf: (G, ctx) => (G.actionsTakenInRound >= actionsPerRound),
                onBegin: (G, ctx) => {console.log("Beginning round");},
                onEnd: (G, ctx) => { console.log("Round ended")},
                next: 'scoreRound',
                
            },
            scoreRound:{
                onBegin: (G, ctx) => {console.log("Beginning scoring")},
                moves: {
                    endRound: (G, ctx) => {
                        G.actionsTakenInRound=0;

                        //apply ship movement
                        applyShipMovement(G, G.directionCardDeck[G.roundsPlayed]);


                        //calculate scores
                        calculateScores(G);

                        //remove attendants
                        removeAttendants(G);
                        
                        G.roundsPlayed++;

                        ctx.events.endPhase();
                    }
                },
                next: 'playRound'
            }
        },

        moves: {
        
        },
        endIf: (G, ctx) => {
            if(G.roundsPlayed === roundsPerGame){
                ///winner is the player with the highest score
                let highScore = 0;
                let highScorePlayers = [];

                for(let i=0; i<G.scores.length; i++){
                    if(G.scores[i] > highScore){
                        highScore = G.scores[i];
                        highScorePlayers = [i];
                    }
                    else if(G.scores[i] === highScore){
                        highScorePlayers.push(i);
                    }
                }

                if(highScorePlayers.length === 0 || highScorePlayers.length > 1){
                    return {draw:true};
                }
                else{
                    return {winner: highScorePlayers[0].toString()};
                }
            }
        },
    }
  };

  export default DeckchairsGame;