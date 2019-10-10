

export const directions = {
    up : 0,
    upRight : 1,
    right : 2,
    downRight : 3,
    down : 4,
    downLeft : 5,
    left : 6,
    upLeft : 7,
}


export function boardUtils(width, height) {
    return {
        idToCoords: function(id) {
            let x = id%width;
            let y = (id-x) / width;
            return {x:x,y:y};
        },

        coordsToId: function(x,y) {
            return width*y + x;
        },

        cellInDirection: function(id, direction) {
            
            let coords = this.idToCoords(id);
            
            switch(direction) {
                case directions.up:
                    coords.y--;
                    break;
                case directions.upRight: 
                    coords.y--;
                    coords.x++;
                    break;
                case directions.right: 
                    coords.x++;
                    break;
                case directions.downRight: 
                    coords.y++;
                    coords.x++;
                    break;
                case directions.down: 
                    coords.y++;
                    break;
                case directions.downLeft: 
                    coords.x--;
                    coords.y++;
                    break;
                case directions.left: 
                    coords.x--;
                    break;
                case directions.upLeft: 
                    coords.x--;
                    coords.y--;
                    break;
                default:
                    return null;
            }

            if(coords.x <0 || coords.x >= width || coords.y<0 || coords.y >= height) {
                return null;
            }
            else {
                return this.coordsToId(coords.x, coords.y);
            }
        }
    }
}