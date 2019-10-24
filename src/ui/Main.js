import React from 'react';
import { Client } from 'boardgame.io/react';
import DeckchairsGame from '../game/DeckchairsGame';
import DeckchairsBoard from './Board.js';
import { AI } from 'boardgame.io/ai';

import DanBot from '../simulator/bots/DanBot';
import EnumerateDeckchairsMoves from '../simulator/EnumerateDeckchairsMoves';
import {boardUtils} from '../game/BoardUtils';

class Main extends React.Component {

    constructor(props) {
        super(props);
        this.state = {numPlayersString: '2',};
    }

    onNumPlayersChange = (event) => {
        this.setState({...this.state, numPlayersString: event.target.value, })
    }   

    render() {  

        const iceBlockStartPosition = 24;

        const testMode = false;
        const randomBoard = true;

        let targets = [];
        let deckchairs = [];

        let numPlayers = parseInt(this.state.numPlayersString);

        if(numPlayers == null || numPlayers < 2 || numPlayers > 4){
            numPlayers = 2;
        }

        if(testMode){
        
            if(randomBoard){

                const utils = new boardUtils(7,7);

                for(let t=0; t<12; t++){
                let i = null;
                
                while(i == null || targets.map((target) => target.id).includes(i) || i === 24){

                    let x = 1 + Math.floor(Math.random() * 5);
                    let y = 1 + Math.floor(Math.random() * 5);

                    i = utils.coordsToId(x,y);
                }
                targets.push( {id: i, playerId: t%2});
                }

                for(let c=0; c<12; c++){
                let i = null;
                
                while(i == null || targets.map((target) => target.id).includes(i) 
                    || deckchairs.map((deckchair) => deckchair.id).includes(i)
                    || i === 24 ){
                    
                    let x = 1 + Math.floor(Math.random() * 5);
                    let y = 1 + Math.floor(Math.random() * 5);

                    i = utils.coordsToId(x,y);
                }
                deckchairs.push( {id: i, playerId: c%2});
                }

            }
            else{
                targets = [
                {id:0, playerId:1},
                {id:4, playerId:1},
                {id:8, playerId:1},
                {id:16, playerId:1},
                {id:20, playerId:1},
                {id:24, playerId:1},
                {id:28, playerId:0},
                {id:32, playerId:0},
                {id:36, playerId:0},
                {id:40, playerId:0},
                {id:44, playerId:0},
                {id:48, playerId:0},
                ];
                
                deckchairs = [
                {id:1, playerId:1},
                {id:5, playerId:1},
                {id:9, playerId:1},
                {id:17, playerId:1},
                {id:21, playerId:1},
                {id:25, playerId:1},
                {id:29, playerId:0},
                {id:33, playerId:0},
                {id:37, playerId:0},
                {id:41, playerId:0},
                {id:43, playerId:0},
                {id:47, playerId:0},
                ];
            }
        }




        const TheClient = Client({  
            game: DeckchairsGame(numPlayers, 7,7, targets, deckchairs, iceBlockStartPosition, testMode, (+new Date()).toString(36).slice(-10)),
            numPlayers: numPlayers,
            board: DeckchairsBoard,
            ai: AI({
              bot: DanBot,
              enumerate: EnumerateDeckchairsMoves
            })});



        return (
            <div>
                <div>
                    Number of players:
                    <input type="text" value={this.state.numPlayersString} onChange={this.onNumPlayersChange}/>
                </div>
                
                <TheClient />
            </div>
        )

    }
}

export default Main;