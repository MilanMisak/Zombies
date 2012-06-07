
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

    stairBarricadeSymbol = new Symbol(new Raster('stairBarricade'));
    stairBarricadeSymbol.definition.scale(0.4);

    doorBarricadeSymbol = new Symbol(new Raster('doorBarricade'));
    doorBarricadeSymbol.definition.scale(0.3);

    /* Virtual class, adds attributes to an item. (this.item must be defined) */
    this.Entity = function() {
        
        this.facingRight = true;

        this.destinations = new Array();
  
        /* The place the entity is moving to. */
        //this.destination = this.item.position;

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
            
            if (vector.length < 1) {
                if (this.destinations.length > 0) {
                    this.setDestination(this.destinations.shift());
		    this.faceTarget();
                } else {
                    this.moving = false;
                }
            }
            
            /* Move the item 1/10th of the distance towards the destination. */ 
            this.item.translate(vector.divide(5)); 
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
            
            this.setRoom(this.room.left);
            this.pushDestination(this.room.position);
        }
        
        this.moveRight = function() {
            if (this.room.right == null) 
                return;
            
            this.setRoom(this.room.right);
            this.pushDestination(this.room.position);
        }
        
        this.moveUp = function() {
            if (this.room.up == null) 
                return;
            
            this.moveUpStairs(this.room.upStairs);
            this.setRoom(this.room.up);
            this.pushDestination(this.room.position);
        }
        
        this.moveDown = function() {
            if (this.room.down == null) 
                return;
            
            this.moveDownStairs(this.room.downStairs);
            this.setRoom(this.room.down);
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
        
        this.setRoom = function(room) {
            this.room = room;
        }
    }

    /* Creates a group of entities. (used for groups of snails) */
    this.SnailGroup = function(noOfEntities, room) {
        this.room = room;
        this.item = new Group();
        for (var i = 0; i < noOfEntities; i++) {
            var snail = new Snail(room); 
            snail.pushDestination(room.position.add(
                            new Point(Math.random() * 100 - 50, Math.random() * 5)));
            this.item.addChild(snail.item);
        }

        this.destination = this.item.position;

        this.pushDestination = function(destination) {
            for (var i = 0; i < noOfEntities; i++) {
                var snail = this.item.children[i].Parent;
                snail.pushDestination(destination);
            }
        }
        
        this.move = function() {
            for (var i = 0; i < noOfEntities; i++) {
                var snail = this.item.children[i].Parent;
                if (!snail.moving)
                    snail.pushDestination(snail.room.position.add(
                                new Point(Math.random() * 300 - 150, 0)));
                    snail.move();
            }
        }
        
        this.setRoom = function(room) {
            this.room = room;
            for (var i = 0; i < noOfEntities; i++) 
                this.item.children[i].Parent.setRoom(room);
        }

    }
    SnailGroup.prototype = new Entity();


    this.Snail = function(room) {
        this.item = snailSymbol.place(room.position.add(new Point(0, 70)));
        this.item.Parent = this;
        this.room = room;
        this.rotation = 0;
        this.destination = this.item.position;
        this.pushDestination = function(destination) {
            this.destinations.push(destination.add(new Point(0, 70)));
            this.moving = true;
        }
        
        this.faceTarget = function() {
            this.item.rotate(this.rotation);
            var direction = new Point(this.destination.subtract(this.item.position));
            this.rotation = 0;
            if ((direction.y > 200 && direction.x < -50) || (direction.y < -200 && direction.x > 50)) { 
                this.rotation = -45;    
            } else {
                if ((direction.y > 200 && direction.x > 50) || (direction.y < -200 && direction.x < -50)) {
                    this.rotation = 45;
                }
            }
            this.item.rotate(this.rotation);
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

    this.StairBarricade = function(position) {
        this.item = stairBarricadeSymbol.place(position);
    }
    StairBarricade.prototype = new Entity(); 


    this.doorBarricade = function(position) {
        this.item = doorBarricadeSymbol.place(position);
    }
    
    /* Declaration of room positions */
    mainRoom = new Room(view.center.add(new Point(0, 753)));
    floor1Room1 = new Room(view.center.add(new Point(-1130, 755)));
    floor1Room2 = new Room(view.center.add(new Point(-680, 755)));
    floor1Room3 = new Room(view.center.add(new Point(680, 755)));
    floor1Room4 = new Room(view.center.add(new Point(1130, 755)));
    floor2Room1 = new Room(view.center.add(new Point(-680, 450)));
    floor2Room2 = new Room(view.center.add(new Point(680, 450)));
    floor2Room3 = new Room(view.center.add(new Point(1130, 450)));
    floor3Room1 = new Room(view.center.add(new Point(-680, 150)));
    floor3Room2 = new Room(view.center.add(new Point(-230, 150)));
    floor3Room3 = new Room(view.center.add(new Point(230, 150)));
    floor3Room4 = new Room(view.center.add(new Point(680, 150)));
    floor3Room5 = new Room(view.center.add(new Point(1130, 150)));
    floor4Room1 = new Room(view.center.add(new Point(-680, -150)));
    floor4Room2 = new Room(view.center.add(new Point(-230, -150)));
    floor4Room3 = new Room(view.center.add(new Point(230, -150)));
    floor4Room4 = new Room(view.center.add(new Point(830, -150)));
    floor5Room1 = new Room(view.center.add(new Point(-250, -450)));
    floor5Room2 = new Room(view.center.add(new Point(430, -450)));
    floor6Room1 = new Room(view.center.add(new Point(-100, -750)));

    /* Stairs are numbered left to right, bottom to top. */

    /*First floor initialisation */
    mainRoom.setDoorLeadingLeft(floor1Room2);
    mainRoom.setDoorLeadingRight(floor1Room3);

    floor1Room1.setDoorLeadingRight(floor1Room2);
    
    stairs1 = new Stairs(floor1Room2.position.add(new Point(110, 0)),
                         floor2Room1.position.add(new Point(-175, 0)));
    floor1Room2.setUpStairs(floor2Room1, stairs1);
    floor1Room2.setDoorLeadingLeft(floor1Room1);
    floor1Room2.setDoorLeadingRight(mainRoom);
    
    stairs2 = new Stairs(floor1Room3.position.add(new Point(110, 0)),
                         floor2Room2.position.add(new Point(-185, 0)));
    floor1Room3.setUpStairs(floor2Room2, stairs2);
    floor1Room3.setDoorLeadingLeft(mainRoom);
    floor1Room3.setDoorLeadingRight(floor1Room4);
    
    floor1Room4.setDoorLeadingLeft(floor1Room3);


    /* Second Floor initialisation. */
    stairs3 = new Stairs(floor2Room1.position.add(new Point(110, 0)),
                         floor3Room1.position.add(new Point(-175, 0)));
    floor2Room1.setUpStairs(floor3Room1, stairs3);
    floor2Room1.setDownStairs(floor1Room2, stairs1);
    
    floor2Room2.setDownStairs(floor1Room3, stairs2);
    floor2Room2.setDoorLeadingRight(floor2Room3);

    stairs4 = new Stairs(floor2Room3.position.add(new Point(-110, 0)),
                         floor3Room5.position.add(new Point(175, 0)));
    floor2Room3.setUpStairs(floor3Room5, stairs4);
    floor2Room3.setDoorLeadingLeft(floor2Room2);

    /* Third Floor initialization. */
    stairs5 = new Stairs(floor3Room1.position.add(new Point(110, 0)),
                         floor4Room1.position.add(new Point(-175, 0)));
    floor3Room1.setUpStairs(floor4Room1, stairs5);
    floor3Room1.setDownStairs(floor2Room1, stairs3);
    floor3Room1.setDoorLeadingRight(floor3Room2);

    floor3Room2.setDoorLeadingLeft(floor3Room1);
    floor3Room2.setDoorLeadingRight(floor3Room3);

    floor3Room3.setDoorLeadingLeft(floor3Room2);
    floor3Room3.setDoorLeadingRight(floor3Room4);

    stairs6 = new Stairs(floor3Room4.position.add(new Point(-110, 0)),
                         floor4Room4.position.add(new Point(35, 0)));
    floor3Room4.setUpStairs(floor4Room4, stairs6);
    floor3Room4.setDoorLeadingLeft(floor3Room3);
    floor3Room4.setDoorLeadingRight(floor3Room5);
    
    floor3Room5.setDownStairs(floor2Room3, stairs4);
    floor3Room5.setDoorLeadingLeft(floor3Room4);


    /* Fourth Floor initialization. */
    stairs7 = new Stairs(floor4Room1.position.add(new Point(120, 0)),
                         floor5Room1.position.add(new Point(-615, 0)));
    floor4Room1.setUpStairs(floor5Room1, stairs7);
    floor4Room1.setDownStairs(floor3Room1, stairs5);
    floor4Room1.setDoorLeadingRight(floor4Room2);

    floor4Room2.setDoorLeadingLeft(floor4Room1);
    floor4Room2.setDoorLeadingRight(floor4Room3);

    stairs8 = new Stairs(floor4Room3.position.add(new Point(100, 0)),
                         floor5Room2.position.add(new Point(-385, 0)));
    floor4Room3.setUpStairs(floor5Room2, stairs8);
    floor4Room3.setDoorLeadingLeft(floor4Room2);
    floor4Room3.setDoorLeadingRight(floor4Room4);

    floor4Room4.setDownStairs(floor3Room4, stairs6);
    floor4Room4.setDoorLeadingLeft(floor4Room3);

    /* Fifth Floor initialization. */
    stairs9 = new Stairs(floor5Room1.position.add(new Point(-95, 0)),
                         floor6Room1.position.add(new Point(60, 0)));
    floor5Room1.setUpStairs(floor6Room1, stairs9);
    floor5Room1.setDownStairs(floor4Room1, stairs7);
    floor5Room1.setDoorLeadingRight(floor5Room2);

    floor5Room2.setDownStairs(floor4Room3, stairs8);
    floor5Room2.setDoorLeadingLeft(floor5Room1);

    /* Sixth Floor initialization. */
    floor6Room1.setDownStairs(floor5Room1, stairs9);


    /* Stair Barricade initialization. */
    stairBarricade1 = new StairBarricade(stairs1.startPoint.add(new Point(-100, -50)));
    stairBarricade2 = new StairBarricade(stairs2.startPoint.add(new Point(-110, -50)));
    stairBarricade3 = new StairBarricade(stairs3.startPoint.add(new Point(-100, -50)));
    stairBarricade4 = new StairBarricade(stairs4.startPoint.add(new Point(100, -50)));
    stairBarricade4.flip();
    stairBarricade5 = new StairBarricade(stairs5.startPoint.add(new Point(-100, -50)));
    stairBarricade6 = new StairBarricade(stairs6.startPoint.add(new Point(100, -50)));
    stairBarricade6.flip();
    stairBarricade7 = new StairBarricade(stairs7.startPoint.add(new Point(-110, -50)));
    stairBarricade8 = new StairBarricade(stairs8.startPoint.add(new Point(-100, -50)));
    stairBarricade9 = new StairBarricade(stairs9.startPoint.add(new Point(120, -50)));
    stairBarricade9.flip();

    doorBarricade1 = new doorBarricade(floor1Room1.position.add(new Point(-200, -20)));

   
    /* Ammo box initialization. */
    ammoBox.position = mainRoom.position.add(new Point(0, 70));

}


