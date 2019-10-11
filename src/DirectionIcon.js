import React from 'react';

class DirectionIcon extends React.Component {


    render(){

        let filename = "images/directions/" + this.props.direction + ".png";

        let directionText = ""; //TODO: put actual direction name in here

        return <img alt={directionText} src={filename}/>
    }
}

export default DirectionIcon;