//return scores array with scores for this round
function calculateScores(G, ctx, cells, bonusPointsCellId){
    let roundScores = new Array(ctx.numPlayers).fill(0);
    
    for(let i=0; i<G.width*G.height; i++){
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