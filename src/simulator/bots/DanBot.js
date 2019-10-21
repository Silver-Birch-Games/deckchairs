import {Bot } from 'boardgame.io/ai';
import {CreateGameReducer} from 'boardgame.io/core';
import applyShipMovement from '../../game/ApplyShipMovement';
import {boardUtils} from '../../game/BoardUtils';
import calculateScores from '../../game/CalculateScores';
import sizeof from '../sizeof';

const utils = boardUtils(7,7);

const evaluator = ({G, ctx}) => {
    let movedCells = applyShipMovement(utils, G, G.directionCardDeck[G.roundsPlayed]);

    return calculateScores(G, movedCells, 24);
}

export default class DanBot extends Bot {
    constructor({
        enumerate,
        seed,
        game,
        moveTime,
      }) {
        super({ enumerate, seed });

        this.evaluator = evaluator;
        this.game = game;
        this.reducer = CreateGameReducer({ game });

        if(moveTime){
            this.moveTime =  moveTime;
        }
        else{
            this.moveTime = 1;
        }
            
      }

      play(state, playerID) {
        //console.log("Choosing Move for player " + playerID);
        this.EndTime = Date.parse(new Date()) + this.moveTime * 1000;

        let rootNode = this.makeNode(state, 0);

        //if there is only one move, we have to make it
        let moves = this.enumerate(state.G, state.ctx, state.ctx.currentPlayer);
        //console.log(moves);
        if(moves.length === 1){
            return {action: moves[0]};
        }

        //console.log(this.EndTime);
        //console.log(Date.parse(new Date()));
        //expand the tree as much as time allows
        let iterations = 0;
        let totalDepths = 0;
        let totalNodes = 0;
        while(Date.parse(new Date()) < this.EndTime){
            //take a trip down the tree
            let result = this.expandTree(rootNode, 0, 1);
            iterations++;
            totalDepths += result.depth;
            totalNodes += result.newNodesCount;
        }

        console.log("Performed " + iterations + " iterations");
        console.log("Max depth reached: " + rootNode.maxDepth );
        console.log("Average depth: " + totalDepths / iterations);
        console.log("Total game poitions evaluated: " + totalNodes);
        //console.log("Memory usage:" + sizeof(rootNode));

        //time's up, now get the best move 
        let bestMove = null;
        let bestScore = -1;
        for(let i in rootNode.children){
            if(rootNode.children[i].node){
                let nodeScore = rootNode.children[i].node.scores[parseInt(playerID)];
                //console.log(nodeScore + " - " + rootNode.children[i].move.payload.type + " " + rootNode.children[i].move.payload.args + " Depth " + rootNode.children[i].node.maxDepth);
                if(nodeScore > bestScore){
                    bestMove = rootNode.children[i].move;
                    bestScore = nodeScore;
                }
            }
        }

        //console.log(bestMove);
        //console.log(rootNode.children);
        return {action: bestMove};


        //const moves = this.enumerate(G, ctx, playerID);
        //return { action: this.random(moves) };
      }

      makeNode(state, depth) {

          let moves = this.enumerate(state.G, state.ctx, state.ctx.currentPlayer);

          let children = [];
          for(let i=0; i<moves.length; i++){
                children.push({move: moves[i], node: null});
          }

          //score this position for each player
          let nodeScores = this.evaluator({G: state.G, ctx: state.ctx}).map((score) => (score));

          return {
              state: state,
              children: children,
              scores: nodeScores,
              expanded: false,
              maxDepth: depth,
              descendentCount: children.length,
              exploredDescendentCount: 0,
          }
      }

      expandTree(node, depth, exploreDepth) {

            //do not try to go beyond the end of the game
            if(node.state.ctx.gameover){
                return {scores:node.scores, maxDepth:depth, depth:depth, newNodesCount: 0};
            }


            //console.log("expandTree");
            //console.log(node);
            if(!node.expanded  && exploreDepth <= 0){
                //first time we have been here
                node.expanded = true;

                return {scores:node.scores, depth:depth, maxDepth: node.maxDepth, newNodesCount: 0};
            }

            // 1 - choose a child to expand

            //normalise all the scores to between 1 and the maximum score, then divide by the sum
            let totalScores = 0;
            let maximumScore = 0;
            let minimumScore = 10000000;

            let scores = [];

            let currentPlayerId = node.state.ctx.currentPlayer;

            let newNodesCount = 0;

            for(let i in node.children){
                let child = node.children[i];

                //if this node has not been created yet, create it
                if(child.node == null){
                    const childState = this.reducer(node.state, child.move);
                    node.children[i].node = this.makeNode(childState, depth+1);
                    node.descendentCount += node.children[i].node.descendentCount;
                    newNodesCount++;
                }

                //let childScore = child.node.scores[currentPlayerId] - child.node.scores[currentPlayerId+1%2];

                let totalScores = child.node.scores[0] + child.node.scores[1];
                let childScore 
                
                if(totalScores > 0){
                    childScore = child.node.scores[currentPlayerId] / (child.node.scores[0] + child.node.scores[1]);
                } 
                else{
                    childScore = 0;
                }

                scores.push(childScore);
                if(childScore > maximumScore){
                    maximumScore = childScore;
                }
                if(childScore < minimumScore){
                    minimumScore = childScore;
                }
            }

            //normalise the scores in the range 1 to maximum score
            for(let i in scores){
                scores[i] = (1 + (maximumScore-1)*((scores[i]-minimumScore)/maximumScore));
                totalScores += scores[i];
            }

            for(let i in scores){
                scores[i] = scores[i] / totalScores;
            }

            let selectedIndex = 0;

            let sum = 0, r=Math.random();
            for(let i in scores){
                sum += scores[i];
                if(r <= sum){
                    selectedIndex = i;
                    break;
                }
            }

            //console.log("Selected:" + selectedIndex + " with random value " + r);

            let selectedChild = node.children[selectedIndex];

            let iterationDepth = depth;

            if(selectedChild != null){
                let expandResult = this.expandTree(selectedChild.node, depth+1, exploreDepth - 1);

                newNodesCount += expandResult.newNodesCount;

                iterationDepth = expandResult.depth;

                let childScores = expandResult.scores;

                
                if(expandResult.maxDepth > node.maxDepth){
                    node.maxDepth = expandResult.maxDepth;
                }

                // if the new position is better for the current player, set this nodes score to those it returned
                let currentPlayerId = parseInt(node.state.ctx.currentPlayer);

                //console.log("ChildScores: " + childScores);
                //console.log("Node Scores: " + node.scores);
                //console.log(expandResult);
                if(childScores[currentPlayerId] >  node.scores[currentPlayerId]){
                    node.scores = childScores;
                }

                /*
                for(let i in childScores){
                    if(node.scores[i] < childScores[i]){
                        node.scores[i] = childScores[i];
                    }
                }
                */
            }
            
            return {scores:node.scores, maxDepth:node.maxDepth, depth:iterationDepth, newNodesCount:newNodesCount};
        
      }
}