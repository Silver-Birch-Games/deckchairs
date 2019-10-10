import React from 'react';

class DeckchairsBoard extends React.Component {

    render() {
        let width = this.props.G.width;
        let height = this.props.G.height;

        const cellStyleEmpty = {
            border: '1px solid #555',
            width: '50px',
            height: '50px',
            position: 'relative',
          };


        let cellStyleTarget0 = {...cellStyleEmpty, backgroundColor: '#ffbbbb'};

        let cellStyleTarget1 = {...cellStyleEmpty, backgroundColor: '#bbbbff'};

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
                    cellStyle = cellStyleTarget0;
                }
                
                if(this.props.G.cells[id].target === 1){
                    cellStyle = cellStyleTarget1;
                }

                let textColor = this.props.G.cells[id].contents === 0?'#ff0000':this.props.G.cells[id].contents === 1?'#0000ff':'#000000';
                let contentsStyleForCell = {...contentsStyle, color: textColor };

                let attendantTextColor = this.props.G.cells[id].attendant === 0?'#ff0000':this.props.G.cells[id].attendant === 1?'#0000ff':'#000000';
                let attendantStyleForCell = {...attendantStyle, color: attendantTextColor}

                cells.push(
                    <td style={cellStyle} key={id}>

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
            </div>
        )
    }

}

export default DeckchairsBoard;