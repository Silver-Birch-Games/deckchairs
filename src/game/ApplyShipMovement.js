import {directions} from './BoardUtils';

function applyShipMovement (utils, state, direction){

    if(direction == null){
        return;
    }

    //assign an ordering to the cells for trying to move the items on them

    let cellIds = [];

    for(let i=0; i<state.width * state.height; i++){
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

        //check there is a deckchair here
        if(state.cells[id].contents != null && id !== state.iceBlockCellId){

            //if there is an attendant on the chair then it does not move
            if(state.cells[id].attendant == null){

                let cellIdToMoveTo = utils.cellInDirection(id, direction);

                //console.log("Trying to move " + id + " to " + cellIdToMoveTo);

                if (cellIdToMoveTo != null 
                    && state.cells[cellIdToMoveTo].contents == null
                    && (state.cells[cellIdToMoveTo].attendant == null || state.cells[cellIdToMoveTo].attendant === state.cells[id].contents)
                    && cellIdToMoveTo !== state.iceBlockCellId){
                        
                    //nothing in cell so we can move there
                    state.cells[cellIdToMoveTo].contents = state.cells[id].contents;
                    state.cells[id].contents = null;
                }

            }       
        } 
    }
}

export default applyShipMovement;