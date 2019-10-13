

export const directions = {
    north : 0,
    northEast : 1,
    east : 2,
    southEast : 3,
    south : 4,
    southWest : 5,
    west : 6,
    northWest: 7,
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
                case directions.north:
                    coords.y--;
                    break;
                case directions.northEast: 
                    coords.y--;
                    coords.x++;
                    break;
                case directions.east: 
                    coords.x++;
                    break;
                case directions.southEast: 
                    coords.y++;
                    coords.x++;
                    break;
                case directions.south: 
                    coords.y++;
                    break;
                case directions.southWest: 
                    coords.x--;
                    coords.y++;
                    break;
                case directions.west: 
                    coords.x--;
                    break;
                case directions.northWest: 
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