
entitySetup = function() {

    /* Drawing of white background. */    
    var background = new Path.Rectangle(view.center.add(new Point(-8000, 8000)),
                                        view.center.add(new Point(8000, -8000)));
    background.fillColor = 'white';

    /* Layer for everything movable by scrolling. */
    var houseLayer = new Layer();	

    var house = new Raster('house');
    house.position = view.center;
    
    /* Code for the snail symbol */
    var raster = new Raster('snail');
    raster.position = view.center;

    flipHorizontalMatrix = new Matrix(-1, 0, 0, 1, 0, 0);

    /* Snail eye stalk style. */
    eyeStyle = {
    strokeColor: 'green',
    strokeWidth: 5,
    };
    var size = 3;

    /* Snail eye initialization. */
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


    /* Snail Symbol initialization. */
    snailGroup = new Group([raster, rightEye, rightEyeball, leftEye, leftEyeball]);
    snailSymbol = new Symbol(snailGroup);
    snailGroup.scale(0.2);

    /* Code for the ghost symbol */
    ghostSymbol = new Symbol(new Raster('ghost'));
    ghostSymbol.definition.scale(0.2);
    ghostBoxSymbol = new Symbol(new Raster('ghostbox'));
    ghostBoxSymbol.definition.scale(0.2);


    /* First ammo box initialization. */
    ammoBox = new Raster('ammobox');
    ammoBox.scale(0.2);

    /* Barricade Symbol initialization. */
    stairBarricadeSymbol = new Symbol(new Raster('stairBarricade'));
    stairBarricadeSymbol.definition.scale(0.4);

    doorBarricadeSymbol = new Symbol(new Raster('doorBarricade'));
    doorBarricadeSymbol.definition.scale(0.4);


    /* Virtual class, adds attributes to an item. (this.item must be defined) */
    this.Entity = function() {
        
        this.facingRight = true;

        this.destinations = new Array();
  
        this.moving = true;

        this.faceTarget = function() {
        }

        /* Function to move the entity every frame. */
        this.move = function() {
            if (!this.moving)
                return;
            /* The vector is the difference between the position of the item
               and its destination. */ 
            var vector = new Point(this.destination.subtract(this.item.position));
            
            if (vector.length < 1) {
                if (this.destinations.length > 0) {
                    this.setDestination(this.destinations.shift());
		    this.faceTarget();
                } else {
                    this.moving = false;
                }
            }
            
            /* Move the item 1/7th of the distance towards the destination. */ 
            this.item.translate(vector.divide(7)); 
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
            this.moving = true;
            this.destinations.push(destination);
        }

        /* Move the Entity to the origin, flip it, then move it back. */ 
        this.flip = function() {
            position = this.item.position;
            var flipMatrix = Matrix.getTranslateInstance(position);
            flipMatrix.concatenate(flipHorizontalMatrix);
            flipMatrix.translate(position.multiply(-1));
            this.item.transform(flipMatrix);
        }

        this.canMove = function(direction) {
            switch (direction) {
                case "Left":
                    return (this.room.left != null && !this.room.leftBarricade.exists)
                    break;
                case "Right":
                    return (this.room.right != null && !this.room.rightBarricade.exists)
                    break;
                case "Up":
                    return (this.room.up != null && !this.room.upStairs.barricade.exists)
                    break;
                case "Down":
                    return (this.room.down != null && !this.room.downStairs.barricade.exists)
                    break;
            }          
        }

        this.kill = function() {
            //TODO - remove from whatever list is containing it, maybe not here. */
            this.item.remove();
        }	

        this.moveLeft = function() {
            this.setRoom(this.room.left);
            this.pushDestination(this.room.position);
        }
        
        this.moveRight = function() {
            this.setRoom(this.room.right);
            this.pushDestination(this.room.position);
        }
        
        this.moveUp = function() {
            this.moveUpStairs(this.room.upStairs);
            this.setRoom(this.room.up);
            this.pushDestination(this.room.position);
        }
        
        this.moveDown = function() {
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
    this.SnailGroup = function(noOfEntities, room, strength) {
        this.room = room;
        this.strength = strength;
        this.item = new Group();
        for (var i = 0; i < noOfEntities; i++) {
            var snail = new Snail(room); 
            snail.pushDestination(room.position.add(
                            new Point(Math.random() * 100 - 50, Math.random() * 5)));
            this.item.addChild(snail.item);
        }

        this.destination = this.item.position;

        /* Adds a new destination for the snails to move to. */
        this.pushDestination = function(destination) {
            for (var i = 0; i < noOfEntities; i++) {
                var snail = this.item.children[i].Parent;
                snail.pushDestination(destination);
            }
        }
        
        /* Animates the snails, should be called every frame. */
        this.move = function() {
            for (var i = 0; i < noOfEntities; i++) {
                var snail = this.item.children[i].Parent;
                if (!snail.moving)
                    snail.pushDestination(snail.room.position.add(
                                new Point(Math.random() * 300 - 150, 0)));
                    snail.move();
            }
        }
        
        this.hurt = function(damage) {
            this.strength -= damage;
            if (this.strength <= 0)
                this.kill;
        }
        
        this.kill = function() {
            this.item.remove();
            this.room.removeSnailGroup(this);
        }
 
        this.setStrength = function(newStrength) {
            this.strength = newStrength;
        }
        
        this.attack = function(barricade) {
            barricade.damage(this.strength);
        }

        this.setRoom = function(room) {
            this.room.removeSnailGroup(this);
            this.room = room;
            this.room.addSnailGroup(this);
            for (var i = 0; i < noOfEntities; i++) 
                this.item.children[i].Parent.setRoom(room);
        }


    }
    SnailGroup.prototype = new Entity();
    
    /* Snail factory. */
    SnailGroup.spawn = function(id, noOfEntities, room, strength) {
        return new SnailGroup(id, noOfEntities, room, strength);
    }


    this.Snail = function(room, strength) {
        this.item = snailSymbol.place(room.position.add(new Point(0, 70)));
        this.item.Parent = this;
        this.room = room;
        this.rotation = 0;
        this.destination = this.item.position;
        this.pushDestination = function(destination) {
            this.destinations.push(destination.add(new Point(0, 70)));
            this.moving = true;
        }        
       
        /* Rotates snails for stair movement, MUST move in a zig zag motion. */ 
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
        this.ammo = 5;

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

        this.canPickUp = function() {
            return (ammoBox.visible && (this.room == ammoBox.room));
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
            ammoBox.room = this.room;
            ammoBox.visible = true; 
            this.holdingBox = false; 
        }

        this.canDrop = function() {
            return this.holdingBox;
        }   

        this.canBarricade = function(direction) {
            switch (direction) {
                case "Left":
                    return (this.room.left != null && !this.room.left.containsSnails())
                    break;
                case "Right":
                    return (this.room.right != null && !this.room.right.containsSnails())
                    break;
                case "Up":
                    return (this.room.up != null && !this.room.up.containsSnails())
                    break;
                case "Down":
                    return (this.room.down != null && !this.room.down.containsSnails())
                    break;
            }
        }

        /* Code for damaging adjacent snails, no animation as yet. */
        this.shoot = function(direction){
            var room;
            switch(direction) {
                case "Left":
                    room = this.room.left;
                    break;
                case "Right":
                    room = this.room.right;
                    break;
                case "Up":
                    room = this.room.up;
                    break;
                case "Down":
                    room = this.room.down;
                    break;
            }
            room.snails[0].hurt(20);
        }

        this.canShoot = function(direction) {
            if (this.ammo == 0)
                return false;

            switch(direction) {
                case "Left":
                    return (this.room.left != null && this.room.containsSnails())
                    break;
                case "Right":
                    return (this.room.right != null && this.room.containsSnails())
                    break;
                case "Up":
                    return (this.room.up != null && this.room.containsSnails())
                    break;
                case "Down":
                    return (this.room.down != null && this.room.containsSnails())
                    break;
            }
        }

        this.canBreak = function(direction) {
            switch(direction) {
                case "Left":
                    return (this.room.left != null && this.room.leftBarricade.exists)
                    break;
                case "Right":
                    return (this.room.right != null && this.room.rightBarricade.exists)
                    break;
                case "Up":
                    return (this.room.up != null && this.room.upStairs.barricade.exists)
                    break;
                case "Down":
                    return (this.room.down != null && this.room.downStairs.barricade.exists)
                    break;
            }
        }
        
        this.breakBarricade = function(direction) {
            switch(direction) {
                case "Left":
                    this.breakBarLeft();
                    break;
                case "Right":
                    this.breakBarRight();
                    break;
                case "Up":
                    this.breakBarUp();
                    break;
                case "Down":
                    this.breakBarDown();
                    break;
            }
        }

        this.reload = function() {
            this.ammo = 5;
        }

        /* Can only reload if ammo is not full, and the ammo box is on the floor in the same room
            as the ghost. */
        this.canReload = function() {
            return ((this.room == ammoBox.room) && this.ammo < 5);
        }

        this.barricadeUp = function() {
            if (this.room.up != null) {
                this.room.upStairs.barricade.make();
            }
        }
        this.barricadeDown = function() {
            if (this.room.down != null) {
                this.room.downStairs.barricade.make();
            }
        }
        this.barricadeLeft = function() {
            if (this.room.left != null) {
                this.room.leftBarricade.make();
            }
        }
        this.barricadeRight = function() {
            if (this.room.right != null) {
                this.room.rightBarricade.make();
            }
        }

        this.breakBarUp = function() {
            if (this.room.up != null) {
                this.room.upStairs.barricade.destroy();
            }
        }
        this.breakBarDown = function() {
            if (this.room.down != null) {
                this.room.downStairs.barricade.destroy();
            }
        }
        this.breakBarLeft = function() {
            if (this.room.left != null) {
                this.room.leftBarricade.destroy();
            }
        }
        this.breakBarRight = function() {
            if (this.room.right != null) {
                this.room.rightBarricade.destroy();
            }
        }
    }
    Ghost.prototype = new Entity();


    /* Animates the snail's eyes, called every frame */
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
        this.snails = new Array();

        this.setUpStairs = function(room, stairs) {
            this.up = room;
            this.upStairs = stairs;	
        }

        this.setDownStairs = function(room, stairs) {
            this.down = room;
            this.downStairs = stairs;
        }

        this.setDoorLeadingRight = function(room, doorBarricade) {
            this.right = room;
            this.rightBarricade = doorBarricade;   
        }

        this.setDoorLeadingLeft = function(room, doorBarricade) {
            this.left = room;
            this.leftBarricade = doorBarricade;
        } 

        this.containsSnails = function() {
            return (this.snails.length > 0);
        }
        
        this.addSnailGroup = function(snails) {
            this.snails.push(snails);
        }
    
        this.removeSnailGroup = function(snails) {
            this.snails.remove(snails);
        }        
    }
    
    this.Stairs = function(startPoint, endPoint) {
        this.startPoint = startPoint;
        this.endPoint = endPoint;
        
        this.setBarricade = function(stairBarricade) {
            this.barricade = stairBarricade;
        }
    }


    this.Barricade = function() {
        this.item = doorBarricadeSymbol.place(view.center);
        this.exists = false;
        this.health = 0;

        /* Repairs or makes the Barricade */
        this.make = function() {
            if (this.health > 0) {
                this.health = 100;
                return;
            }
            this.exists = true;
            this.item.visible = true;
        }
   
        /* Damages the barricade, TODO - increase optipacy. */ 
        this.damage = function(damageDealt) {
            this.health -= damageDealt;
            if (this.health <= 0)
                this.destroy;
        }
    
        /* Destroys the barricade image, the object still exits with 0 health. */
        this.destroy = function() {
            this.health = 0;
            this.exists = false;
            this.item.visible = false;
        }
    }
    Barricade.prototype = new Entity();

    this.StairBarricade = function(position) {
        this.item.remove();
        this.item = stairBarricadeSymbol.place(position);
        this.item.visible = false;
        this.exsts = false;
    }
    StairBarricade.prototype = new Barricade(); 


    this.DoorBarricade = function(position) {
        this.item.remove();
        this.item = doorBarricadeSymbol.place(position);
        this.item.visible = false;
        this.exists = false;
    }
    DoorBarricade.prototype = new Barricade();
    
    /* Declaration of room positions */
    mainRoom = new Room(view.center.add(new Point(0, 753)));
    outsideLeft = new Room(view.center.add(new Point(-1600, 755)));
    outsideRight = new Room(view.center.add(new Point(1600, 755)));
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


    /* Barricade Initialization. */    

    /* First Floor Barricades. */
    doorBarricade1 = new DoorBarricade(floor1Room1.position.add(new Point(-250, 10)));
    doorBarricade2 = new DoorBarricade(floor1Room2.position.add(new Point(-230, 10)));
    doorBarricade3 = new DoorBarricade(mainRoom.position.add(new Point(-440, 10)));
    doorBarricade4 = new DoorBarricade(floor1Room3.position.add(new Point(-230, 10)));
    doorBarricade5 = new DoorBarricade(floor1Room4.position.add(new Point(-230, 10)));
    doorBarricade6 = new DoorBarricade(floor1Room4.position.add(new Point(250, 10)));

    /* Second Floor Barricades. */
    doorBarricade7 = new DoorBarricade(floor2Room2.position.add(new Point(230, 10)));
   
    /* Third Floor Barricades. */
    doorBarricade8 = new DoorBarricade(floor3Room1.position.add(new Point(230, 10)));
    doorBarricade9 = new DoorBarricade(floor3Room2.position.add(new Point(230, 10)));
    doorBarricade10 = new DoorBarricade(floor3Room3.position.add(new Point(230, 10)));
    doorBarricade11 = new DoorBarricade(floor3Room4.position.add(new Point(230, 10)));

    /* Fourth Floor Barricades. */
    doorBarricade12 = new DoorBarricade(floor4Room1.position.add(new Point(230, 10)));
    doorBarricade13 = new DoorBarricade(floor4Room2.position.add(new Point(230, 10)));
    doorBarricade14 = new DoorBarricade(floor4Room3.position.add(new Point(230, 10)));

    /* Fifth Floor Barricades. */
    doorBarricade15 = new DoorBarricade(floor5Room1.position.add(new Point(240, 10)));



    /*First floor initialisation */
    /* Stairs are numbered left to right, bottom to top. */
    mainRoom.setDoorLeadingLeft(floor1Room2, doorBarricade3);
    mainRoom.setDoorLeadingRight(floor1Room3, doorBarricade4);

    outsideLeft.setDoorLeadingRight(floor1Room1, doorBarricade1);

    floor1Room1.setDoorLeadingRight(floor1Room2, doorBarricade2);
    floor1Room1.setDoorLeadingLeft(outsideLeft, doorBarricade1);
    
    stairs1 = new Stairs(floor1Room2.position.add(new Point(110, 0)),
                         floor2Room1.position.add(new Point(-175, 0)));
    floor1Room2.setUpStairs(floor2Room1, stairs1);
    floor1Room2.setDoorLeadingLeft(floor1Room1, doorBarricade2);
    floor1Room2.setDoorLeadingRight(mainRoom, doorBarricade3);
    
    stairs2 = new Stairs(floor1Room3.position.add(new Point(110, 0)),
                         floor2Room2.position.add(new Point(-185, 0)));
    floor1Room3.setUpStairs(floor2Room2, stairs2);
    floor1Room3.setDoorLeadingLeft(mainRoom, doorBarricade4);
    floor1Room3.setDoorLeadingRight(floor1Room4, doorBarricade5);
    
    floor1Room4.setDoorLeadingLeft(floor1Room3, doorBarricade5);
    floor1Room4.setDoorLeadingRight(outsideRight, doorBarricade6);
    
    outsideRight.setDoorLeadingLeft(floor1Room4, doorBarricade6);


    /* Second Floor initialisation. */
    stairs3 = new Stairs(floor2Room1.position.add(new Point(110, 0)),
                         floor3Room1.position.add(new Point(-175, 0)));
    floor2Room1.setUpStairs(floor3Room1, stairs3);
    floor2Room1.setDownStairs(floor1Room2, stairs1);
    
    floor2Room2.setDownStairs(floor1Room3, stairs2);
    floor2Room2.setDoorLeadingRight(floor2Room3, doorBarricade7);

    stairs4 = new Stairs(floor2Room3.position.add(new Point(-110, 0)),
                         floor3Room5.position.add(new Point(175, 0)));
    floor2Room3.setUpStairs(floor3Room5, stairs4);
    floor2Room3.setDoorLeadingLeft(floor2Room2, doorBarricade7);

    /* Third Floor initialization. */
    stairs5 = new Stairs(floor3Room1.position.add(new Point(110, 0)),
                         floor4Room1.position.add(new Point(-175, 0)));
    floor3Room1.setUpStairs(floor4Room1, stairs5);
    floor3Room1.setDownStairs(floor2Room1, stairs3);
    floor3Room1.setDoorLeadingRight(floor3Room2, doorBarricade8);

    floor3Room2.setDoorLeadingLeft(floor3Room1, doorBarricade8);
    floor3Room2.setDoorLeadingRight(floor3Room3, doorBarricade9);

    floor3Room3.setDoorLeadingLeft(floor3Room2, doorBarricade9);
    floor3Room3.setDoorLeadingRight(floor3Room4, doorBarricade10);

    stairs6 = new Stairs(floor3Room4.position.add(new Point(-110, 0)),
                         floor4Room4.position.add(new Point(35, 0)));
    floor3Room4.setUpStairs(floor4Room4, stairs6);
    floor3Room4.setDoorLeadingLeft(floor3Room3, doorBarricade10);
    floor3Room4.setDoorLeadingRight(floor3Room5, doorBarricade11);
    
    floor3Room5.setDownStairs(floor2Room3, stairs4);
    floor3Room5.setDoorLeadingLeft(floor3Room4, doorBarricade11);


    /* Fourth Floor initialization. */
    stairs7 = new Stairs(floor4Room1.position.add(new Point(120, 0)),
                         floor5Room1.position.add(new Point(-615, 0)));
    floor4Room1.setUpStairs(floor5Room1, stairs7);
    floor4Room1.setDownStairs(floor3Room1, stairs5);
    floor4Room1.setDoorLeadingRight(floor4Room2, doorBarricade12);

    floor4Room2.setDoorLeadingLeft(floor4Room1, doorBarricade12);
    floor4Room2.setDoorLeadingRight(floor4Room3, doorBarricade13);

    stairs8 = new Stairs(floor4Room3.position.add(new Point(100, 0)),
                         floor5Room2.position.add(new Point(-385, 0)));
    floor4Room3.setUpStairs(floor5Room2, stairs8);
    floor4Room3.setDoorLeadingLeft(floor4Room2, doorBarricade13);
    floor4Room3.setDoorLeadingRight(floor4Room4, doorBarricade14);

    floor4Room4.setDownStairs(floor3Room4, stairs6);
    floor4Room4.setDoorLeadingLeft(floor4Room3, doorBarricade14);

    /* Fifth Floor initialization. */
    stairs9 = new Stairs(floor5Room1.position.add(new Point(-95, 0)),
                         floor6Room1.position.add(new Point(60, 0)));
    floor5Room1.setUpStairs(floor6Room1, stairs9);
    floor5Room1.setDownStairs(floor4Room1, stairs7);
    floor5Room1.setDoorLeadingRight(floor5Room2, doorBarricade15);

    floor5Room2.setDownStairs(floor4Room3, stairs8);
    floor5Room2.setDoorLeadingLeft(floor5Room1, doorBarricade15);

    /* Sixth Floor initialization. */
    floor6Room1.setDownStairs(floor5Room1, stairs9);


    /* Stair Barricade initialization. */
    stairBarricade1 = new StairBarricade(stairs1.startPoint.add(new Point(-100, -50)));
    stairs1.setBarricade(stairBarricade1);
    stairBarricade2 = new StairBarricade(stairs2.startPoint.add(new Point(-110, -50)));
    stairs2.setBarricade(stairBarricade2);
    stairBarricade3 = new StairBarricade(stairs3.startPoint.add(new Point(-100, -50)));
    stairs3.setBarricade(stairBarricade3);
    stairBarricade4 = new StairBarricade(stairs4.startPoint.add(new Point(100, -50)));
    stairBarricade4.flip();
    stairs4.setBarricade(stairBarricade4);
    stairBarricade5 = new StairBarricade(stairs5.startPoint.add(new Point(-100, -50)));
    stairs5.setBarricade(stairBarricade5);
    stairBarricade6 = new StairBarricade(stairs6.startPoint.add(new Point(100, -50)));
    stairBarricade6.flip();
    stairs6.setBarricade(stairBarricade6);
    stairBarricade7 = new StairBarricade(stairs7.startPoint.add(new Point(-110, -50)));
    stairs7.setBarricade(stairBarricade7);
    stairBarricade8 = new StairBarricade(stairs8.startPoint.add(new Point(-100, -50)));
    stairs8.setBarricade(stairBarricade8);
    stairBarricade9 = new StairBarricade(stairs9.startPoint.add(new Point(120, -50)));
    stairBarricade9.flip();
    stairs9.setBarricade(stairBarricade9);


    /* Ammo box initialization. */
    ammoBox.position = mainRoom.position.add(new Point(0, 70));
    ammoBox.room = mainRoom;


    /* Entity for the local player. */
    player = new Ghost('blue', mainRoom);

    /* Action code. */
    this.canMove = function(direction) {
        return player.canMove(direction);
    }	

    this.Move = function(direction) {
        switch (direction) {
            case "Left":
                player.moveLeft();
                break;
            case "Right":
                player.moveRight();
                break;
            case "Up":
                player.moveUp();
                break;
            case "Down":
                player.moveDown();
                break;
        }
                
    }

    this.canBarricade = function(direction) {
        return player.canBarricade(direction);
    }

    this.Barricade = function(direction) {
        switch (direction) {
            case "Left":
                player.barricadeLeft();
                break;
            case "Right":
                player.barricadeRight();
                break;
            case "Up":
                player.barricadeUp();
                break;
            case "Down":
                player.barricadeDown();
                break;
        }
    }
    
    this.canShoot = function(direction) {
        return player.canShoot(direction);
    }

    this.shoot = function(direction) {
        player.shoot(direction);
    }

    this.canReload = function() {
        return player.canReload();   
    }

    this.reload = function() {
        player.reload();
    }

    this.canPickUp = function() {
        return player.canPickUp();
    }
    
    this.pickUp = function() {
        player.pickUp();
    }
    
    this.canDrop = function() {
        return player.canDrop();
    }
    
    this.drop = function() {
        player.drop();
    }
    
    this.canBreakBarricade = function(direction) {
        return player.canBreak(direction);
    }   
    
    this.breakBarricade = function(direction) {
        player.breakBarricade(direction);
    }

    this.spawnSnailGroup = function(id, side, strength, noOfEntities) {
        switch (side) {
            case "Left" :
                SnailGroup.spawn(id, outsideLeft, strength, noOfEntities);
            break;
            case "Right":
                SnailGroup.spawn(id, outsideRight, strength, noOfEntities);
            break;
        }
    }   

}

/* Removes an element from an array by value. */
Array.prototype.remove= function(){
    var what, a= arguments, L= a.length, ax;
    while(L && this.length){
        what= a[--L];
        while((ax= this.indexOf(what))!= -1){
            this.splice(ax, 1);
        }
    }
    return this;
}


