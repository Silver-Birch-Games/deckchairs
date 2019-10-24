import { INVALID_MOVE } from 'boardgame.io/core';
import {boardUtils} from './BoardUtils';
import { TurnOrder } from 'boardgame.io/core';
import moveItem from './MoveItem.js';
import applyShipMovement from './ApplyShipMovement';
import calculateScores from './CalculateScores';
import randomiseBoard from './RandomiseBoard';

function DeckchairsGame(width,height,targets,deckchairs,iceBlockStartPosition,testMode,seed) {
    const actionsPerRound = 8;
    const roundsPerGame = 8;
    const bonusPointsCellId = 24;

    const utils = boardUtils(width,height);

    const removeAttendants = function(state){
        for(let i=0; i<state.width*state.height; i++){
            state.cells[i].attendant = null;
        }

        state.attendantsUsed = [0,0];
    }

    function setup(ctx){
        let cells = Array(width * height);
        for(let i=0; i<width*height; i++)
        {
            cells[i] = {target:null, contents:null, attendant: null };
        }

        if(testMode){
            for(let i=0; i<targets.length; i++){
                cells[targets[i].id].target = targets[i].playerId;
            }
        
            for(let i=0; i<deckchairs.length; i++){
                cells[deckchairs[i].id].contents = deckchairs[i].playerId;
            }
            cells[iceBlockStartPosition].contents = "Ice";
        }

        let directionCardDeck = [0,1,2,3,4,5,6,7];

        let shuffledDeck = [null, ...ctx.random.Shuffle(directionCardDeck)];

        let scores = new Array(ctx.numPlayers).fill(0);

        return { width: width, height:height, cells: cells, iceBlockCellId: iceBlockStartPosition, actionsTakenInRound:0, directionCardDeck:shuffledDeck, roundsPlayed:0, scores:scores, bonusPointsCellId:bonusPointsCellId, attendantsUsed: scores }
    }

    return {
        setup: setup,
        seed: seed,
        turn: {
            moveLimit:1,
            order: {
                first: (G, ctx) => (G.roundsPlayed % ctx.numPlayers),
                next: (G, ctx) => (ctx.playOrderPos + 1) % ctx.numPlayers,
            }
        },

        phases: {
            placeTargets:{
                start: !testMode,
                turn:{
                    moveLimit:6,
                    order: TurnOrder.ONCE
                },
                moves:{
                    placeTarget: (G, ctx,id) => {
                        G.cells[id].target = parseInt(ctx.currentPlayer);
                    },
                    randomiseBoard: (G,ctx) => {
                        G.cells = randomiseBoard(G, ctx);
                        ctx.events.setPhase('playRound');
                    },
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
                start: testMode,
                moves:{
                    moveDeckchair: (G, ctx, id, direction) => {

                        //console.log("ID:" + id + " Direction:" + direction)
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


                        //console.log("Moving " + id + " to " + cellIdToMoveTo );
                        
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

                        let newIceBlockPosition = moveItem(utils, G, iceBlockPosition, direction, true, 0,0);

                        if(newIceBlockPosition != null && newIceBlockPosition !== iceBlockPosition){
                            //console.log("Ice block has moved from " + G.iceBlockCellId + " to " + newIceBlockPosition)
                            G.iceBlockCellId = newIceBlockPosition;
                            G.actionsTakenInRound++;
                        }
                        else{
                            console.log("Pushing ice block must result in it moving");
                            console.log("Position: " + G.iceBlockCellId + "Direction: " + direction);
                            return INVALID_MOVE;
                        }
                         
                        
                    },
                    testCalculateScores: (G, ctx) => {
                        let roundScores = calculateScores(G, ctx, G.cells, bonusPointsCellId);

                        for(let i in roundScores){
                            G.scores[i] += roundScores[i];
                        }
                    },
                    testShipMovement: (G, ctx, direction) => {
                        console.log(applyShipMovement(utils, G, direction));
                    }
                },
                endIf: (G, ctx) => (G.actionsTakenInRound >= actionsPerRound),
                //onBegin: (G, ctx) => {console.log("Beginning round");},
                //onEnd: (G, ctx) => { console.log("Round ended")},
                next: 'scoreRound',
                
            },
            scoreRound:{
                //onBegin: (G, ctx) => {console.log("Beginning scoring")},
                moves: {
                    endRound: (G, ctx) => {
                        //apply ship movement
                        let cells = applyShipMovement(utils, G, G.directionCardDeck[G.roundsPlayed]);

                        for(let i in cells){
                            G.cells[i] = {target: cells[i].target, contents: cells[i].contents, attendant: cells[i].attendant};
                        }
                        
                        //calculate scores
                        let roundScores = calculateScores(G, ctx, cells, bonusPointsCellId);

                        for(let i in roundScores){
                            G.scores[i] += roundScores[i];
                        }

                        //remove attendants
                        removeAttendants(G);
                        
                        G.actionsTakenInRound=0;
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