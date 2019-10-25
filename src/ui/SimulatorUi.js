import React from 'react';
import {runSimulation} from '../simulator/Simulator';
import { numberLiteralTypeAnnotation } from '@babel/types';

class SimulatorUi extends React.Component {
    constructor(props) {
        super(props);
        this.state = {iterationsString: '100', iterationsRun:0};
    }


    setStatePromise = (state) => new Promise(resolve => {
        this.setState(state, () => {
            setTimeout(() => resolve(), 1);
        });
    });

    async setStateNow(state){
        await this.setStatePromise(state);
    }

    sleep (time) {
        return new Promise((resolve) => setTimeout(resolve, time));
    }

    async onSimulateClick(){

        let numPlayers = this.props.ctx.numPlayers;
       
        let iterations = parseInt(this.state.iterationsString);

        if(iterations){

            let scores = [];
            let maxScores = new Array(numPlayers).fill(0);
            let minScores = new Array(numPlayers).fill(Infinity);
            let totalScores = new Array(numPlayers).fill(0);
            let scoreDifferences = [];
            let wins = new Array(numPlayers).fill(0);
            let sharedWins = new Array(numPlayers).fill(0);
            let totalSharedWins = 0;
            let sharedWinPercentages = new Array(numPlayers).fill(0);
            let draws = 0;
            let totalHighScorers = 0;

            let maxDifference = 0;
            let minDifference = Infinity;
            let totalDifference = 0;

            for(let iteration=1; iteration<=iterations; iteration++){

                if(parseInt(this.state.iterationsString)){
                    let newScores = runSimulation(this.props.G, this.props.ctx, iteration+iterations);

                    scores.push(newScores);
                    
                    let maxScore = 0;
                    let minScore = Infinity;
                    for(let p=0; p<numPlayers; p++){
                        totalScores[p] += newScores[p];
                        maxScores[p] = Math.max(maxScores[p], newScores[p] );
                        minScores[p] = Math.min(minScores[p], newScores[p] );
                        
                        if(newScores[p] > maxScore){
                            maxScore = newScores[p];
                        }

                        if(newScores[p] < minScore){
                            minScore = newScores[p];
                        }
                    }

                    let scoreDifference = maxScore - minScore;

                    scoreDifferences.push(scoreDifference);

                    if(scoreDifference > maxDifference){
                        maxDifference = scoreDifference;
                    }

                    if(scoreDifference < minDifference){
                        minDifference = scoreDifference;
                    }

                    totalDifference += scoreDifference;

                    let numWinners = 0;
                    let winner = null;
                    for(let p=0; p<numPlayers; p++){
                        if(newScores[p] === maxScore){
                            numWinners++;
                            totalHighScorers++;
                            winner = p;
                        }
                    }

                    if(numWinners === numPlayers){
                        draws++;
                    }
                    else if(numWinners === 1){
                        wins[winner]++;
                    }
                    else{
                        totalSharedWins++;
                        for(let p=0; p<numPlayers; p++){
                            if(scores[iteration-1][p] === maxScore){
                                sharedWins[p]++;
                            }
                        }       
                    }

                    
                        
                    

                    let allWins = new Array(numPlayers).fill(0);
                    let allWinRates = new Array(numPlayers).fill(0);

                    for(let i=0;i<wins.length;i++){
                        allWins[i] = wins[i] + sharedWins[i];
                        allWinRates[i] = (allWins[i] / iteration).toFixed(2);
                    }

                    let winPercentages = new Array(numPlayers).fill(0);
                    
                    let totalWins = 0;
                    for(let i=0; i<wins.length;i++){
                        winPercentages[i] = (100*wins[i] / iteration).toFixed(2);
                        totalWins += wins[i];

                        sharedWinPercentages[i] = (100*sharedWins[i] / iteration).toFixed(2);
                    }

                    let winShares = new Array(numPlayers).fill(0);
                    let expectedShare = 100 / numPlayers;
                    let chiSquaredTotal = 0;
                    for(let i=0; i<wins.length;i++){
                        let share = (100*wins[i] / totalWins)
                        winShares[i] = share.toFixed(2);

                        chiSquaredTotal += ((share- expectedShare ) * (share-expectedShare))/expectedShare;
                    }

                    let chiSquared = chiSquaredTotal.toFixed(2);

                    let chiSquaredCriticalValues;

                    if(numPlayers === 2){
                        chiSquaredCriticalValues = [0.016, 0.004, 0.001];
                    }
                    else if(numPlayers === 3){
                        chiSquaredCriticalValues = [0.211, 0.103, 0.051];
                    }
                    else if(numPlayers === 4){
                        chiSquaredCriticalValues = [0.584, 0.352, 0.216];
                    }

                    let testPassed = null;
                    for(let i=0; i<3; i++){
                        if(chiSquaredTotal <= chiSquaredCriticalValues[i]){
                            testPassed = i;
                        }
                    }

                    let chiSquaredMessage = "Not enough evidence to say this board is fair";
                    switch(testPassed){
                        case 0:
                            chiSquaredMessage = "90% sure this board is fair";
                            break;
                        case 1:
                            chiSquaredMessage = "95% sure this board is fair";
                            break;
                        case 2:
                            chiSquaredMessage = "99% sure this board is fair";
                            break;       
                        default:
                    }

                    /*
                    if(numPlayers === 2){
                        chiSquaredCriticalValues = [2.706, 3.841, 5.024, 6.635, 10.828];
                    }
                    else if(numPlayers === 3){
                        chiSquaredCriticalValues = [4.605, 5.991, 7.378, 9.210, 13.816];
                    }
                    else if(numPlayers === 4){
                        chiSquaredCriticalValues = [6.251, 7.815, 9.348, 11.345, 16.266];
                    }

                    let testFailed = null;
                    for(let i=0; i<5; i++){
                        if(chiSquaredTotal > chiSquaredCriticalValues[i]){
                            testFailed = i;
                        }
                    }

                    let chiSquaredMessage = "More than 10% of tests of fair boards will show this level of unfairness";
                    switch(testFailed){
                        case 0:
                            chiSquaredMessage = "5% - 10% of tests of fair boards will show this level of unfairness";
                            break;
                        case 1:
                            chiSquaredMessage = "2.5% - 5% of tests of fair boards will show this level of unfairness";
                            break;
                        case 2:
                            chiSquaredMessage = "1% - 2.5% of tests of fair boards will show this level of unfairness";
                            break;
                        case 3:
                                chiSquaredMessage = "0.1% - 1% of tests of fair boards will show this level of unfairness";
                                break;
                        case 4:
                                chiSquaredMessage = "Less than 0.1% of tests of fair boards will show this level of unfairness";
                                break;           
                        default:
                    }
                    */



                    //error at 99% confidence
                    let z= 2.5759;
                    let winShareError = (100 * z / (2 * Math.sqrt(totalWins))).toFixed(2);
            
                    let drawPercentage = (100*(draws)/iteration).toFixed(2);
                    let sharedWinPercentage = (100*(totalSharedWins)/iteration).toFixed(2);

                    let meanHighScorers = (totalHighScorers / iteration).toFixed(2);

                    let meanScores = new Array(numPlayers).fill(0);
                    for(let i=0; i<meanScores.length;i++){
                        meanScores[i] = (totalScores[i]/iteration).toFixed(2);
                    }

                    let results={
                        wins:wins,
                        draws: draws,
                        winPercentages: winPercentages,
                        winShares: winShares,
                        sharedWins: sharedWins,      
                        allWins: allWins, 
                        allWinRates: allWinRates,    
                        sharedWinPercentages: sharedWinPercentages,
                        totalSharedWins: totalSharedWins,
                        sharedWinPercentage: sharedWinPercentage,
                        winShareError: winShareError,
                        drawPercentage: drawPercentage,
                        meanHighScorers: meanHighScorers,
                        maxScores: maxScores,
                        minScores: minScores,
                        meanScores: meanScores,
                        maxDifference: maxDifference,
                        minDifference: minDifference,
                        meanDifference: totalDifference/iteration,
                        chiSquared:chiSquared,
                        chiSquaredMessage:chiSquaredMessage,
                    };
                    
                    this.setStateNow({...this.state, iterationsRun: iteration, results:results});
                }
                await this.sleep(1);
            }
        }
        
        
        

    }

    onIterationsChange = (event) => {
            this.setState({...this.state, iterationsString: event.target.value, })
        
    }

    render(){

        const resultsRowTitleStyle = {
            //border: '1px solid #555',
            textAlign: 'right',
            position: 'relative',
          };

        return(
            <div>

                <input type="text" value={this.state.iterationsString} onChange={this.onIterationsChange}/>

                <button onClick={() => this.onSimulateClick()}>Simulate</button>

                {this.state && this.state.results && this.state.results.wins &&
                
                    <div>
                        Tests run: {this.state.iterationsRun}
                            <table>
                                <thead>
                                    <tr>
                                        <td></td>
                                        {this.state.results.wins.map((value,i) => <td key={i}>P{i}</td>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td style={resultsRowTitleStyle}>Individual Wins</td>
                                        {this.state.results.wins.map((value,i) => <td key={i}>{value}</td>)}
                                    </tr>
                                    <tr>
                                        <td style={resultsRowTitleStyle}>Shared Wins</td>
                                        {this.state.results.sharedWins.map((value,i) => <td key={i}>{value}</td>)}
                                    </tr>
                                    <tr>
                                        <td style={resultsRowTitleStyle}>All Wins</td>
                                        {this.state.results.allWins.map((value,i) => <td key={i}>{value}</td>)}
                                    </tr>
                                    <tr></tr>
                                    <tr>
                                        <td style={resultsRowTitleStyle}>Individual Win Rate</td>
                                        {this.state.results.winPercentages.map((value,i) => <td key={i}>{value}%</td>)}
                                    </tr>
                                    <tr>
                                        <td style={resultsRowTitleStyle}>Shared Win Rate</td>
                                        {this.state.results.sharedWinPercentages.map((value,i) => <td key={i}>{value}%</td>)}
                                    </tr>

                                    <tr>
                                        <td style={resultsRowTitleStyle}>Overall shared win rate</td>
                                        <td>{this.state.results.sharedWinPercentage}%</td>
                                    </tr>

                                    <tr>
                                        <td style={resultsRowTitleStyle}>Draws</td>
                                        <td>{this.state.results.draws}</td>

                                    </tr>
                                    <tr>
                                        <td style={resultsRowTitleStyle}>Draw Rate</td>
                                        <td>{this.state.results.drawPercentage}%</td>

                                    </tr>

                                    <tr>
                                        <td style={resultsRowTitleStyle}>Share of wins</td>
                                        {this.state.results.winShares.map((value,i) => <td key={i}>{value}%</td>)}
                                    </tr>
                                    <tr>
                                        <td style={resultsRowTitleStyle}>Chi Squared for win shares</td>
                                        <td>{this.state.results.chiSquared}</td>
                                        <td>{this.state.results.chiSquaredMessage}</td>

                                    </tr>


                                    
                                    
                                    <tr>
                                        <td style={resultsRowTitleStyle}>Mean high scoring players</td>
                                        <td>{this.state.results.meanHighScorers}</td>

                                    </tr>

                                    

                                    <tr>
                                        <td style={resultsRowTitleStyle}>Minimum Score</td>
                                        {this.state.results.minScores.map((value,i) => <td key={i}>{value}</td>)}
                                    </tr>
                                    <tr>
                                        <td style={resultsRowTitleStyle}>Maximum Score</td>
                                        {this.state.results.maxScores.map((value,i) => <td key={i}>{value}</td>)}
                                    </tr>
                                    <tr>
                                        <td style={resultsRowTitleStyle}>Mean Score</td>
                                        {this.state.results.meanScores.map((value,i) => <td key={i}>{value}</td>)}
                                    </tr>

                                    <tr><td/></tr>

                                    <tr>
                                        <td style={resultsRowTitleStyle}>Maximum Score Difference</td>
                                        <td>{this.state.results.maxDifference}</td>
                                    </tr>
                                    <tr>
                                        <td style={resultsRowTitleStyle}>Minimum Score Difference</td>
                                        <td>{this.state.results.minDifference}</td>
                                    </tr>
                                    <tr>
                                        <td style={resultsRowTitleStyle}>Mean Score Difference</td>
                                        <td>{this.state.results.meanDifference.toFixed(2)}</td>
                                    </tr>


                                </tbody>
                            </table>

                            <table>
                                <tbody>
                                    
                                   
                                </tbody>
                            </table>
                    </div>
                }
            </div>
            )
    }

}

export default SimulatorUi;