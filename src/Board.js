import React from 'react';
import DirectionIcon from './DirectionIcon.js';
import DeckchairIcon from './DeckchairIcon.js';
import MeepleIcon from './MeepleIcon.js';

class DeckchairsBoard extends React.Component {

    constructor(props) {
        super(props);
        this.state = {selectedCellId: null};
      }

    onCellClick = id => {

        if(this.props.ctx.phase === "placeTargets"){
            this.props.moves.placeTarget(id);
        }
        else if(this.props.ctx.phase === "placeDeckchairs"){
            this.props.moves.placeDeckchair(id);
        }
        else if(this.props.ctx.phase === "placeIceBlock"){
            this.props.moves.placeIceBlock(id);
        }
        else if(id === this.state.selectedCellId){
            this.setState({selectedCellId:null});
        }
        else {
            this.setState({selectedCellId:id});
        }
        
    }

    onDirectionClick = direction => {

        if(this.state.selectedCellId != null){
            console.log("Contents: " + this.props.G.cells[this.state.selectedCellId].contents);
            if(this.props.G.cells[this.state.selectedCellId].contents != null){
                console.log(this.props.G.cells[this.state.selectedCellId].contents);
                if(this.props.G.cells[this.state.selectedCellId].contents === "Ice"){
                    this.props.moves.pushIceBlock(direction);
                    this.setState({selectedCellId:null});
                }
                else {
                    this.props.moves.moveDeckchair(this.state.selectedCellId, direction);
                    this.setState({selectedCellId:null});
                }
            }
        }
    }

    onPlaceAttendantClick = () => {
        if(this.state.selectedCellId != null){
            this.props.moves.placeAttendant(this.state.selectedCellId);
            this.setState({selectedCellId:null});
        }
    }

    onEndRoundClick = () => {
        this.props.moves.endRound();
    }

    render() {
        let width = this.props.G.width;
        let height = this.props.G.height;

        const cellStyleEmpty = {
            border: '1px solid #555',
            width: '50px',
            height: '50px',
            position: 'relative',
          };

          const cardStyle = {
            border: '1px solid #555',
            width: '50px',
            height: '100px',
            position: 'relative',
          };



        const cellIdStyle = {
            position: 'absolute',
            top: '0px',
            left: '0px',
            width: '100%',
            height: '100%',
            fontSize: '12px',
        };

        const contentsStyle = {
            position: 'absolute',
            top: '10px',
            left: '0px',
            width: '100%',
            height: '100%',
            fontSize: '20px',
            textAlign: 'center',
            lineHeight: '50px',
        }

        const attendantStyle = {
            position: 'absolute',
            bottom: '0px',
            right: '0px',
            fontSize: '20px',
        };

        let tbody = [];
        for (let y=0; y<height; y++) {
            let cells = [];
            for(let x=0; x<width; x++) {
                const id = width*y + x;

                let cellStyle = cellStyleEmpty;
                
                if(this.props.G.cells[id].target === 0){
                    cellStyle = {...cellStyleEmpty, backgroundColor: '#ffbbbb'};
                }
                
                if(this.props.G.cells[id].target === 1){
                    cellStyle = {...cellStyleEmpty, backgroundColor: '#bbbbff'};
                }

                if(id === this.state.selectedCellId){
                    cellStyle = {...cellStyle, backgroundColor: '#ffff00'}
                }

                let textColor = this.props.G.cells[id].contents === 0?'#ff0000':this.props.G.cells[id].contents === 1?'#0000ff':'#000000';
                let contentsStyleForCell = {...contentsStyle, color: textColor };

                let attendantTextColor = this.props.G.cells[id].attendant === 0?'#ff0000':this.props.G.cells[id].attendant === 1?'#0000ff':'#000000';
                let attendantStyleForCell = {...attendantStyle, color: attendantTextColor}

                cells.push(
                    <td style={cellStyle} key={id}
                        onClick={() => this.onCellClick(id)}>

                        <div style={cellIdStyle}>{id}</div>

                        
                        {id === this.props.G.bonusPointsCellId && 
                                <div style={contentsStyleForCell}>
                                    <img width="50" height="50" alt="*" src="images/star.png"></img>
                                </div>                     
                        }

                        <div style={contentsStyleForCell}>
                            

                            {(this.props.G.cells[id].contents===0 || this.props.G.cells[id].contents===1) &&

                                <DeckchairIcon color={textColor}/>

                            }

                            {this.props.G.cells[id].contents === "Ice" &&
                                <img width="50" height="50" alt="Ice" src="images/iceBlock.png"/>
                            }

                        
                        </div>

                        

                        <div style={attendantStyleForCell}>

                        {this.props.G.cells[id].attendant != null &&
                            <MeepleIcon color={attendantTextColor }/>
                        
                        }
                        </div>
                    </td>
                )
            }
            tbody.push(<tr key={y}>{cells}</tr>);
            
        }

        return (
            <div>
                <table>
                    <tbody>
                    <tr>
                        <td>
                            
                            <div>

                                {!this.props.ctx.gameover && 
                                    <div style={{color:this.props.ctx.currentPlayer==='0'?'#ff0000':'#0000ff'}}>
                                        {this.props.ctx.phase === "playRound" && 
                                            <h2>Round {this.props.G.roundsPlayed+1} Action {(this.props.G.actionsTakenInRound + 2 - this.props.G.actionsTakenInRound%2)/2 }</h2>
                                        }

                                        {this.props.ctx.phase === "scoreRound" && 
                                            <h2>Round {this.props.G.roundsPlayed+1} Ship Movement and Scoring</h2>
                                        }

                                        {this.props.ctx.phase === "placeTargets" && 
                                            <h2>Click target squares</h2>
                                        }

                                        {this.props.ctx.phase === "placeDeckchairs" && 
                                            <h2>Click squares to add deckchairs</h2>
                                        }

                                        {this.props.ctx.phase === "placeIceBlock" && 
                                            <h2>Click square to add ice block</h2>
                                        }
                                    </div>
                                    
                                }

                                {this.props.ctx.gameover && 
                                    <h2>Game Over!</h2>
                                }


                                <table id="scores">
                                    <thead>
                                        <tr>
                                        {this.props.G.scores.map((score, i) => <td style={{textAlign:'center', color:i===0?'#ff0000':'#0000ff'}} key={i}>Player {i}</td>)} 
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            {this.props.G.scores.map((score, i) => <td style={{textAlign:'center', color:i===0?'#ff0000':'#0000ff'}} key={i}>{score}</td>)} 
                                        </tr>
                                    </tbody>
                                </table>

                                <br/>
                            </div>

                            <table id="board">
                                <tbody>{tbody}</tbody>
                            </table>
                        </td>


                        <td>

                            {this.props.ctx.phase === "playRound" && 
                            <div>
                                <h3>Actions</h3>
                                <table id="controls">
                                    <tbody>
                                        <tr>
                                            <td style={cellStyleEmpty}
                                                onClick={() => this.onDirectionClick(7)}><DirectionIcon direction="7"/> </td>
                                            <td style={cellStyleEmpty}
                                                onClick={() => this.onDirectionClick(0)}><DirectionIcon direction="0"/></td>
                                            <td style={cellStyleEmpty}
                                                onClick={() => this.onDirectionClick(1)}><DirectionIcon direction="1"/></td>
                                        </tr>
                                        <tr>
                                            <td style={cellStyleEmpty}
                                                onClick={() => this.onDirectionClick(6)}><DirectionIcon direction="6"/></td>
                                            <td style={{...cellStyleEmpty, textAlign:'center'}}
                                                onClick={() => this.onPlaceAttendantClick()}><MeepleIcon color={this.props.ctx.currentPlayer==='0'?'#ff0000':'#0000ff'}/></td>
                                            <td style={cellStyleEmpty}
                                                onClick={() => this.onDirectionClick(2)}><DirectionIcon direction="2"/></td>
                                        </tr>
                                        <tr>
                                            <td style={cellStyleEmpty}
                                                onClick={() => this.onDirectionClick(5)}><DirectionIcon direction="5"/></td>
                                            <td style={cellStyleEmpty}
                                                onClick={() => this.onDirectionClick(4)}><DirectionIcon direction="4"/></td>
                                            <td style={cellStyleEmpty}
                                                onClick={() => this.onDirectionClick(3)}><DirectionIcon direction="3"/></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            }

                            {this.props.ctx.phase === "scoreRound" &&
                                <div>
                                    <button onClick={() => this.onEndRoundClick()}>Do ship movement and add scores</button>
                                </div>
                            }

                            <div>
                                <h3>Ship Movement Cards</h3>
                                <table id="shipMovementCards">
                                    <thead>
                                        <tr>
                                            <td>1</td>
                                            <td>2</td>
                                            <td>3</td>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td style={cardStyle}><DirectionIcon direction={this.props.G.directionCardDeck[this.props.G.roundsPlayed]}/></td>
                                            <td style={cardStyle}><DirectionIcon direction={this.props.G.directionCardDeck[this.props.G.roundsPlayed + 1]}/></td>
                                            <td style={cardStyle}><DirectionIcon direction={this.props.G.directionCardDeck[this.props.G.roundsPlayed + 2]}/></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>




                        </td>
                    </tr>
                    </tbody>            
                </table>
                 
                    

                    

                    

                    
                    <br/>
                    <br/>
                    <br/>
                    <br/>
                    
                    <div>Deckchair icon made by <a href="https://www.flaticon.com/authors/freepik" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/"             title="Flaticon">www.flaticon.com</a></div>
                    <div>Ice block icon is rock by Orpheus Studios from the Noun Project</div>
                    <div>Star by businessicons13 from the Noun Project</div>
                </div>
                 
        )
    }

}

export default DeckchairsBoard;