import {directions} from './BoardUtils';

//return a new cells array
function applyShipMovement (utils, state, direction){
    if(direction == null){
        return state.cells;
    }

    //assign an ordering to the cells for trying to move the items on them

    let cellIds = [];

    let newCells = new Array(state.width * state.height);

    for(let i=0; i<state.width * state.height; i++){
        let originalCell = state.cells[i];
        newCells[i] = {target: originalCell.target, contents: originalCell.contents, attendant:originalCell.attendant};

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

        let cellIdToMoveTo = utils.cellInDirection(id, direction);
        //check we are not moving off the board
        if(cellIdToMoveTo != null)
        {
            //check there is a deckchair here
            if(newCells[id].contents != null && id !== state.iceBlockCellId){

                //if there is an attendant on the chair then it does not move
                if(newCells[id].attendant == null){
                    //console.log("Trying to move " + id + " to " + cellIdToMoveTo);
                    if (newCells[cellIdToMoveTo].contents == null
                        && (newCells[cellIdToMoveTo].attendant == null || newCells[cellIdToMoveTo].attendant === newCells[id].contents)
                        && cellIdToMoveTo !== state.iceBlockCellId){
                            
                        //nothing in cell so we can move there
                        newCells[cellIdToMoveTo] = {target:newCells[cellIdToMoveTo].target, contents:newCells[id].contents, attendant: newCells[cellIdToMoveTo].attendant };
                        newCells[id] = {target:newCells[id].target, contents:null, attendant: newCells[id].attendant };
                    }
                }       
            } 
        }  
    }

    return newCells;
}

export default applyShipMovement;