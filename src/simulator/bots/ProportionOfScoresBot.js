import {MCTSBot } from 'boardgame.io/ai';



const evaluator = ({G, ctx},playerId) => {

    let id = parseInt(playerId)

    if(G.scores[0] + G.scores[1] === 0){
        return 0;
    }
      
    //console.log(ctx);
    //console.log(G);
    let result = 100 * G.scores[id] / G.scores[0] + G.scores[1];
    //console.log(result);
    return result;
    
}

export default class ProportionOfScoresBot extends MCTSBot {

    constructor({enumerate, seed, game, iterations, playoutDepth}){

        super({enumerate, seed, evaluator, game, iterations:1000, playoutDepth:16});

    }
}