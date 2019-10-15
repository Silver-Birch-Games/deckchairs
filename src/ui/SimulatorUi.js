import React from 'react';
import {runSimulation} from '../simulator/Simulator';

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
       
        let iterations = parseInt(this.state.iterationsString);

        if(iterations){

            let scores = [];

            for(let iteration=1; iteration<=iterations; iteration++){

                if(parseInt(this.state.iterationsString)){
                    let newScores = runSimulation(this.props.G, this.props.ctx, iteration+iterations);

                    scores.push(newScores);
                    
                    let maxScores = [0, 0];
                    let minScores = [10000000,10000000];
                    let totalScores = [0,0];
                    let scoreDifferences = [];
                    let wins = [0,0]
                    let draws = 0;
                    for(let i = 0; i< scores.length; i++){

                        if(scores[i][0] > scores[i][1]){
                            wins[0]++;
                        }
                        else if(scores[i][0] < scores[i][1]){
                            wins[1]++;
                        }
                        else{
                            draws++;
                        }

                        totalScores[0] += scores[i][0];
                        totalScores[1] += scores[i][1];

                        maxScores[0] = Math.max(maxScores[0], scores[i][0] );
                        maxScores[1] = Math.max(maxScores[1], scores[i][1] );

                        minScores[0] = Math.min(minScores[0], scores[i][0] );
                        minScores[1] = Math.min(minScores[1], scores[i][1] );

                        scoreDifferences[i] = Math.abs(scores[i][0] - scores[i][1]);
                    }

                    let maxDifference = 0;
                    let minDifference = 10000000;
                    let totalDifference = 0;

                    for(let i=0;i<scoreDifferences.length;i++){
                        maxDifference = Math.max(maxDifference, scoreDifferences[i]);
                        minDifference = Math.min(minDifference, scoreDifferences[i]);
                        totalDifference += scoreDifferences[i];
                    }

                    let winPercentages = [0,0];
                    let totalWins = 0;
                    for(let i=0; i<wins.length;i++){
                        winPercentages[i] = (100*wins[i] / iteration).toFixed(2);
                        totalWins += wins[i];
                    }

                    let drawPercentage = (100*(iteration - totalWins)/iteration).toFixed(2);

                    let results={
                        wins:wins,
                        draws: draws,
                        winPercentages: winPercentages,
                        drawPercentage: drawPercentage,
                        maxScores: maxScores,
                        minScores: minScores,
                        meanScores: [totalScores[0]/iteration, totalScores[1]/iteration],
                        maxDifference: maxDifference,
                        minDifference: minDifference,
                        meanDifference: totalDifference/iteration,
                    };
                    
                    this.setStateNow({...this.state, iterationsRun: iteration, results:results});
                }
                await this.sleep(100);
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

                {this.state && this.state.results && 
                
                    <div>
                        Tests run: {this.state.iterationsRun}
                            <table>
                                <thead>
                                    <tr>
                                        <td></td>
                                        <td>P0</td>
                                        <td>P1</td>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td style={resultsRowTitleStyle}>Wins</td>
                                        <td>{this.state.results.wins[0]}</td>
                                        <td>{this.state.results.wins[1]}</td>
                                    </tr>
                                    <tr>
                                        <td style={resultsRowTitleStyle}>Win Rate</td>
                                        <td>{this.state.results.winPercentages[0]}%</td>
                                        <td>{this.state.results.winPercentages[1]}%</td>
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
                                        <td style={resultsRowTitleStyle}>Minimum Score</td>
                                        <td>{this.state.results.minScores[0]}</td>
                                        <td>{this.state.results.minScores[1]}</td>
                                    </tr>
                                    <tr>
                                        <td style={resultsRowTitleStyle}>Maximum Score</td>
                                        <td>{this.state.results.maxScores[0]}</td>
                                        <td>{this.state.results.maxScores[1]}</td>
                                    </tr>
                                    <tr>
                                        <td style={resultsRowTitleStyle}>Mean Score</td>
                                        <td>{this.state.results.meanScores[0].toFixed(2)}</td>
                                        <td>{this.state.results.meanScores[1].toFixed(2)}</td>
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