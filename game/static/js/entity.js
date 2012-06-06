
entitySetup = function() {
    	
    var house = new Raster('house');
    house.position = view.center;
    /* Code for the snail symbol */
    var raster = new Raster('snail');
    raster.position = view.center;

    flipHorizontalMatrix = new Matrix(-1, 0, 0, 1, 0, 0);

    eyeStyle = {
    strokeColor: 'green',
    strokeWidth: 5,
    };
    var size = 3;

    var rightEye = new Path();
    rightEye.style = eyeStyle;
    for (var i = 0; i < size; i++)
        rightEye.add(new Point(130, (size - (i + 1))-15).add(view.center));
    var rightStart = new Point(rightEye.segments[0].point);


    var rightEyeball = new Path.Circle(rightEye.segments[0].point, 10);
    rightEyeball.fillColor = 'black';       


    var leftEye = new Path();
    leftEye.style = eyeStyle;
    for (var i = 0; i < size; i++)
        leftEye.add(new Point(100, (size - (i + 1))-15).add(view.center));
    var leftStart = new Point(leftEye.segments[0].point);

    var leftEyeball = new Path.Circle(leftEye.segments[0].point, 10);
    leftEyeball.fillColor = 'black'; 


    snailGroup = new Group([raster, rightEye, rightEyeball, leftEye, leftEyeball]);
    snailSymbol = new Symbol(snailGroup);
    snailGroup.scale(0.2);

    ghostSymbol = new Symbol(new Raster('ghost'));
    ghostSymbol.definition.scale(0.2);
    ghostBoxSymbol = new Symbol(new Raster('ghostbox'));
    ghostBoxSymbol.definition.scale(0.2);


    ammoBox = new Raster('ammobox');
    ammoBox.scale(0.2);
    ammoBox.position = view.center;

    /* Virtual class, adds attributes to an item. (this.item must be defined) */
    this.Entity = function() {
        
        this.facingRight = true;

        this.destinations = new Array();
  
        /* The place the entity is moving to. */
        this.destination = view.center;

        this.moving = true;

	this.faceTarget = function() {
	}

        /* Function to move the entity every frame. */
        this.move = function() {
            if (!this.moving)
                return;
            /* The vector is the difference between the position of the item
               and it's destination. */ 
            var vector = new Point(this.destination.subtract(this.item.position));
            
            if (vector.length < 10) {
                if (this.destinations.length > 0) {
                    this.setDestination(this.destinations.shift());
		    this.faceTarget();
                } else {
                    this.moving = false;
                }
            }
            
            /* Move the item 1/10th of the distance towards the destination. */ 
            this.item.translate(vector.divide(10)); 
        }

        /* Set the Entity's destination, flip it if necessary. */
        this.setDestination = function(destination) {
            this.destination = destination;
            facingRight = this.destination.x >= this.item.position.x;
            if (facingRight ? !this.facingRight : this.facingRight) {
                this.flip();
                this.facingRight = !this.facingRight;
            }
        }

        /* Adds a destination to the entity's queue. */
        this.pushDestination = function(destination) {
            this.destinations.push(destination);
            this.moving = true;
        }

        /* Move the Entity to the origin, flip it, then move it back. */ 
        this.flip = function() {
            position = this.item.position;
            var flipMatrix = Matrix.getTranslateInstance(position);
            flipMatrix.concatenate(flipHorizontalMatrix);
            flipMatrix.translate(position.multiply(-1));
            this.item.transform(flipMatrix);
        }

        this.moveLeft = function() {
            if (this.room.left == null) 
                return;
            
            this.room = this.room.left;
            this.pushDestination(this.room.position);
        }
        
        this.moveRight = function() {
            if (this.room.right == null) 
                return;
            
            this.room = this.room.right;
            this.pushDestination(this.room.position);
        }
        
        this.moveUp = function() {
            if (this.room.up == null) 
                return;
            
            this.moveUpStairs(this.room.upStairs);
            this.room = this.room.up;
            this.pushDestination(this.room.position);
        }
        
        this.moveDown = function() {
            if (this.room.down == null) 
                return;
            
            this.moveDownStairs(this.room.downStairs);
            this.room = this.room.down;
            this.pushDestination(this.room.position);
        }

        this.moveUpStairs = function(stairs) {
            this.pushDestination(stairs.startPoint);
            this.pushDestination(stairs.endPoint);
        }
        
        this.moveDownStairs = function(stairs) {
            this.pushDestination(stairs.endPoint);
            this.pushDestination(stairs.startPoint);
        }
    }

    /* Creates a group of entities. (used for groups of snails) */
    this.SnailGroup = function(noOfEntities, room) {
	this.room = room;
        this.item = new Group();
        for (var i = 0; i < noOfEntities; i++)
            this.item.addChild(
	    snailSymbol.place(room.position.add(
	    new Point(Math.random() * 120 - 60, Math.random() * 18))));
	this.destination = this.item.position.add(new Point(0, 65));
        
	this.pushDestination = function(destination) {
            this.destinations.push(destination.add(new Point(0, 65)));
            this.moving = true;
	}
    }
    SnailGroup.prototype = new Entity();


    this.Snail = function(room) {
        this.item = snailSymbol.place(room.position.add(new Point(0, 70)));
	this.room = room;
        this.pushDestination = function(destination) {
            this.destinations.push(destination.add(new Point(0, 70)));
            this.moving = true;
	}
    }
    Snail.prototype = new Entity();

    this.Ghost = function(colour, room) {
        var position = room.position;
        this.hat = triangle(colour);
        this.hat.scale(0.6);
        this.raster = ghostSymbol.place(position);
        this.hat.position = position.add(new Point(11, -75));
        this.item = new Group(this.raster, this.hat);
        this.destination = position;
        this.room = room;
        this.holdingBox = false;

        /* Animation for ghost picking up box */
        this.pickUp = function() {
            if (this.holdingBox)
                return;

            var destroy = this.raster;
            this.raster = ghostBoxSymbol.place(this.raster.position);
            this.item.addChild(this.raster);
            destroy.remove();

            hatDestroy = this.hat;
            this.hat = this.hat.clone();
            this.item.addChild(this.hat);
            hatDestroy.remove(); 

            ammoBox.visible = false;
            this.holdingBox = true;
        }

        /* Animation for ghost dropping box */
        this.drop = function() {
            if (!this.holdingBox)
                return;

            var destroy = this.raster;
            this.raster = ghostSymbol.place(this.raster.position);
            this.item.addChild(this.raster);
            destroy.remove();

            hatDestroy = this.hat;
            this.hat = this.hat.clone();
            this.item.addChild(this.hat);
            hatDestroy.remove(); 

            ammoBox.position = this.item.position.add(new Point(-10, 65));
            ammoBox.visible = true; 
            this.holdingBox = false; 
        }
    }
    Ghost.prototype = new Entity();


    /* Animates the snail's eyes */
    this.snailUpdate = function() {
        rightEye.segments[0].point = 
        rightStart.add(new Point(Math.random() * -20 + 50, Math.random() * -150 + 10));
        
        for (var i = 0; i < size - 2; i++) {
            var nextSegment = rightEye.segments[i + 1];
            var position = rightEye.segments[i].point;
            var angle = (position.subtract(nextSegment.point)).angle;
            var vector = new Point({ angle: angle, length: 35 });
            nextSegment.point = position.subtract(vector);
        }

        leftEye.segments[0].point = 
        leftStart.add(new Point(Math.random() * -50 + 20, Math.random() * -150 + 10));
        
        for (var i = 0; i < size - 2; i++) {
            var nextSegment = leftEye.segments[i + 1];
            var position = leftEye.segments[i].point;
            var angle = (position.subtract(nextSegment.point)).angle;
            var vector = new Point({ angle: angle, length: 35 });
            nextSegment.point = position.subtract(vector);
        }

        rightEyeball.position = rightEye.segments[0].point;
        leftEyeball.position = leftEye.segments[0].point;
    }

    this.triangle = function(colour) {
        var triangle = new Path.RegularPolygon(new Point(80, 30), 3, 40);
        triangle.fillColor = colour;
	    return triangle;
    }

    this.Room = function(position) {
        this.position = position;
        this.up = null;
        this.down = null;
        this.left = null;
        this.right = null;

        this.setUpStairs = function(room, stairs) {
            this.up = room;
            this.upStairs = stairs;	
        }

        this.setDownStairs = function(room, stairs) {
            this.down = room;
            this.downStairs = stairs;
        }

        this.setDoorLeadingRight = function(room) {
            this.right = room;
        }

        this.setDoorLeadingLeft = function(room) {
            this.left = room;
        }   
    }
    
    this.Stairs = function(startPoint, endPoint) {
        this.startPoint = startPoint;
        this.endPoint = endPoint;
    }

}


