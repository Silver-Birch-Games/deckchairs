import {boardUtils} from './BoardUtils';

export default function randomiseBoard(G, ctx){

    const utils = new boardUtils(7,7);

    let targets = [];
    let deckchairs = [];

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

    let cells = Array(G.width * G.height);
    for(let i=0; i<G.width*G.height; i++)
    {
        cells[i] = {target:null, contents:null, attendant: null };
    }

    for(let i=0; i<targets.length; i++){
        cells[targets[i].id].target = targets[i].playerId;
    }

    for(let i=0; i<deckchairs.length; i++){
        cells[deckchairs[i].id].contents = deckchairs[i].playerId;
    }
    
    cells[G.iceBlockCellId].contents = "Ice";

    return cells;

}