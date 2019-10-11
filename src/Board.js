import React from 'react';

class DeckchairsBoard extends React.Component {

    constructor(props) {
        super(props);
        this.state = {selectedCellId: null};
      }

    onCellClick = id => {
        if(id === this.state.selectedCellId){
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

    render() {
        let width = this.props.G.width;
        let height = this.props.G.height;

        const cellStyleEmpty = {
            border: '1px solid #555',
            width: '50px',
            height: '50px',
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
            top: '0px',
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

                        <div style={contentsStyleForCell}>
                            {this.props.G.cells[id].contents===0 || this.props.G.cells[id].contents===1?"C":this.props.G.cells[id].contents}
                        </div>

                        <div style={attendantStyleForCell}>
                        {this.props.G.cells[id].attendant===0 || this.props.G.cells[id].attendant===1?"A":null}
                        </div>
                    </td>
                )
            }
            tbody.push(<tr key={y}>{cells}</tr>);
            
        }

        return (
            <div>
                <table id="board">
                    <tbody>{tbody}</tbody>
                </table>

                <div>
                    <table id="controls">
                        <tbody>
                            <tr>
                                <td style={cellStyleEmpty}
                                    onClick={() => this.onDirectionClick(7)}></td>
                                <td style={cellStyleEmpty}
                                    onClick={() => this.onDirectionClick(0)}></td>
                                <td style={cellStyleEmpty}
                                    onClick={() => this.onDirectionClick(1)}></td>
                            </tr>
                            <tr>
                                <td style={cellStyleEmpty}
                                    onClick={() => this.onDirectionClick(6)}></td>
                                <td style={cellStyleEmpty}
                                    onClick={() => this.onPlaceAttendantClick()}></td>
                                <td style={cellStyleEmpty}
                                    onClick={() => this.onDirectionClick(2)}></td>
                            </tr>
                            <tr>
                                <td style={cellStyleEmpty}
                                    onClick={() => this.onDirectionClick(5)}></td>
                                <td style={cellStyleEmpty}
                                    onClick={() => this.onDirectionClick(4)}></td>
                                <td style={cellStyleEmpty}
                                    onClick={() => this.onDirectionClick(3)}></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

        )
    }

}

export default DeckchairsBoard;