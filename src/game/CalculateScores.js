//return scores array with scores for this round
function calculateScores(state, cells, bonusPointsCellId){
    let roundScores = [0,0];
    


    for(let i=0; i<state.width*state.height; i++){
        //check for deckchair
        if(cells[i].contents != null && cells[i].contents !== "Ice"){
            //check central square 
            if(i===bonusPointsCellId){
                roundScores[cells[i].contents]+=4;
            }
            else if(cells[i].target != null){
                //check if it is own target
                if(cells[i].target === cells[i].contents){
                    roundScores[cells[i].target]+=2;
                }
                else{
                    roundScores[cells[i].contents]++;
                }
            }
        }
    }

    return roundScores;
}

export default calculateScores;