function moveItem(utils, state, id, direction, isIceBlock, distanceTravelled, maxDistance) {
    let cellIdToMoveTo = utils.cellInDirection(id, direction);

    //console.log(id + " trying to move to " + cellIdToMoveTo);
    //console.log("isIceBlock: " + isIceBlock);
    //console.log("Distance Travlled: " + distanceTravelled + " Max Distance: " + maxDistance);
    if (state.cells[cellIdToMoveTo] == null) {
        return null;
    }
    else {
        console.log("trying to move " + id + "(" + state.cells[id].contents + ") to " + cellIdToMoveTo + "(Attendant " + state.cells[cellIdToMoveTo].attendant + ")" );
        if(state.cells[cellIdToMoveTo].attendant != null && state.cells[cellIdToMoveTo].attendant !== state.cells[id].contents){
            //other players attendant in square - cannot move into it
            console.log("trying to move " + id + "(" + state.cells[id].contents + ") to " + cellIdToMoveTo + "(Attendant " + state.cells[cellIdToMoveTo].attendant + ")" );
            return null;
        }

        //deckchairs can't travel further than the thing that hit them
            
        if(!isIceBlock && distanceTravelled >= maxDistance){
            //console.log("ran out of momentum");
            return null;
        }

        if(state.cells[cellIdToMoveTo].contents == null) {
            

            //empty square - move into it and try to move again
            state.cells[cellIdToMoveTo].contents = state.cells[id].contents;
            state.cells[id].contents = null;

            //console.log("moved contents from " + id + " to " + cellIdToMoveTo);
     
            let finalDestinationId = moveItem(utils, state,cellIdToMoveTo, direction, isIceBlock, distanceTravelled+1, maxDistance);

            if(finalDestinationId != null){
                return finalDestinationId;
            }
            else{
                return cellIdToMoveTo;
            }
        }
        else { 
            //try to move the item, if it moves then move into its cell

            if(moveItem(utils, state, cellIdToMoveTo, direction, false, 0, distanceTravelled+1 ) != null){
                state.cells[cellIdToMoveTo].contents = state.cells[id].contents;
                state.cells[id].contents = null;
                return cellIdToMoveTo;
            }
            else{
                return null;
            }
            

        }
    }
}

export default moveItem;