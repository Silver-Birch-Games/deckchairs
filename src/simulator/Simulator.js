
import { Simulate, RandomBot, MCTSBot } from 'boardgame.io/ai';
import DeckchairsGame from '../game/DeckchairsGame';
import EnumerateDeckchairsMoves from './EnumerateDeckchairsMoves';

export function runSimulation(G, ctx, seed){

    let targets=[];
    let deckchairs=[];
    let iceBlockPosition = 0;

    for(let i=0; i<7*7; i++){
        let cell = G.cells[i];

        if(cell.target != null){
            targets.push({id:i, playerId:cell.target});
        }

        if(cell.contents != null && cell.contents !== 'Ice'){
            deckchairs.push({id:i, playerId: cell.contents})
        }

        if(cell.contents === 'Ice'){
            iceBlockPosition = i;
        }
    }

    const game = DeckchairsGame(7,7,targets,deckchairs,iceBlockPosition, true, seed);

    console.log(iceBlockPosition);

    const mctsBot = new MCTSBot({
        iterations: 200,
        seed: seed,
        game: game,
        enumerate: EnumerateDeckchairsMoves,
    })
  
    const randomBot = new RandomBot({
        seed:seed,
        enumerate: EnumerateDeckchairsMoves
    })

    let result = Simulate({
        game: game,
        bots: [randomBot, randomBot],
        state: {G,ctx},
    })

    return result.state.G.scores;
        
}
