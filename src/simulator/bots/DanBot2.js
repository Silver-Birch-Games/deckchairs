import {Bot } from 'boardgame.io/ai';
import {CreateGameReducer} from 'boardgame.io/core';
import applyShipMovement from '../../game/ApplyShipMovement';
import {boardUtils} from '../../game/BoardUtils';
import calculateScores from '../../game/CalculateScores';

const utils = boardUtils(7,7);


const evaluator = ({G, ctx}) => {
    let movedCells = applyShipMovement(utils, G, G.directionCardDeck[G.roundsPlayed]);

    return calculateScores(G, movedCells, 24);
}

export default class DanBot2 extends Bot {
    constructor({
        enumerate,
        seed,
        game,
        moveTime,}) {
        super({ enumerate, seed });

        this.evaluator = evaluator;
        this.game = game;
        this.reducer = CreateGameReducer({ game });

        if(moveTime){
            this.moveTime =  moveTime;
        }
        else{
            this.moveTime = 20;
        }
            
    }

    play(state, playerID) {
        this.EndTime = Date.parse(new Date()) + this.moveTime * 1000;

        let rootNode = {
            depth: 0,
            state: state,

        };
    }

    makeNode(parentState, move, depth) {  
        
        let nodeState;
        if(move == null){
            nodeState = parentState;
        }
        else{
            nodeState = this.reducer(parentState, move);
        }
        
        return {
            depth: depth,
            state: nodeState,
            move: move,
            scores: this.evaluator({G: nodeState.G, ctx: nodeState.ctx}),
            explored: false,
        }
    }

    exploreNode(node) {

        //if we haven't explored from this node before, we need to enumerate moves for this position and generate the child nodes
        if(!node.explored){
            let moves = this.enumerate(node.state.G, node.state.ctx, node.state.ctx.currentPlayer);

            let children = [];
            for(let i=0; i<moves.length; i++){
                    let childNode = this.makeNode(node.state, moves[i], node.depth+1)
                    children.push(childNode);
            }

            node.children = children;
            node.unexploredDescendentCount = node.Children;
            node.exploredDescendentCount = 0;
            node.explored = true;
            
        }
        
        //now choose a child to explore




    }



}