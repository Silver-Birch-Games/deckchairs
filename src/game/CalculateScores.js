function calculateScores(state, bonusPointsCellId){
    let roundScores = [0,0];

    for(let i=0; i<state.width*state.height; i++){
        //check for deckchair
        if(state.cells[i].contents != null && state.cells[i].contents !== "Ice"){
            //check central square 
            if(i===bonusPointsCellId){
                roundScores[state.cells[i].contents]+=4;
            }
            else if(state.cells[i].target != null){
                //check if it is own target
                if(state.cells[i].target === state.cells[i].contents){
                    roundScores[state.cells[i].target]+=2;
                }
                else{
                    roundScores[state.cells[i].contents]++;
                }
            }
        }
    }

    for(let p=0; p<roundScores.length; p++){
        state.scores[p] += roundScores[p];
    }
}

export default calculateScores;