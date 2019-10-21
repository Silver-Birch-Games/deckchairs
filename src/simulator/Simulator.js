
import { Simulate, RandomBot, MCTSBot } from 'boardgame.io/ai';
import DeckchairsGame from '../game/DeckchairsGame';
import EnumerateDeckchairsMoves from './EnumerateDeckchairsMoves';
import MaxScoreMCTSBot from './bots/MaxScoreMCTSBot';
import DanBot from './bots/DanBot';


function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
  
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
  
      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
  
    return array;
  }

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

    //we need to randomise the ship movement cards

    let directionCardDeck = [0,1,2,3,4,5,6,7];

    let shuffledDeck = [null, ...shuffle(directionCardDeck)];

    let newG = {...G, directionCardDeck:shuffledDeck};

    const mctsBot = new MCTSBot({
        iterations: 200,
        seed: seed,
        game: game,
        enumerate: EnumerateDeckchairsMoves,
    })

    const maxscoreBot = new MaxScoreMCTSBot({
        iterations: 100,
        playoutDepth: 10,
        seed: seed,
        game: game,
        enumerate: EnumerateDeckchairsMoves
    })

    const danBot = new DanBot({
        moveTime: 5,
        seed: seed,
        game: game,
        enumerate: EnumerateDeckchairsMoves
    })
  
    const randomBot = new RandomBot({
        seed:seed,
        enumerate: EnumerateDeckchairsMoves
    })

    let result = Simulate({
        game: game,
        bots: [randomBot, randomBot],
        state: {G:newG,ctx},
    })

    return result.state.G.scores;
        
}
