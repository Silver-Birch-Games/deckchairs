import {MCTSBot } from 'boardgame.io/ai';

/*
const objectives = () => ({
    'score': {
        checker: () => true,
        weight: (G, ctx) => (G.scores[parseInt(ctx.currentPlayer)])
    }
});
*/

/*
function objectives(G, ctx, playerID){
    //console.log(arguments);

    if(playerID !== undefined){
        console.log(playerID);
    }
    return {  
        'score': {
            checker: function(G, ctx){
                return(G.roundsPlayed > 0 && ctx.phase === 'playRound' && (ctx.turn - G.roundsPlayed * 10) === 2)
            },
            weight: function(G, ctx){  
                console.log("objective for player " + playerID + " turn " + ctx.turn);
                let weight = G.scores[parseInt(playerID)];  
                return weight;
            }
        }
    }
};
*/


//console.log(ctx.currentPlayer + " - " + weight);


const evaluator = ({G, ctx},playerId) => {
    let score = G.scores[parseInt(playerId)];
    return score;
}

export default class MaxScoreMCTSBot extends MCTSBot {

    constructor({enumerate, seed, game, iterations, playoutDepth}){

        super({enumerate, seed, evaluator, game, iterations:10000, playoutDepth:8});

    }
}