
entitySetup = function() {
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

	snailGroup.scale(0.1);


	/* Virtual class, adds attributes to an item. (this.item must be defined) */
	this.Entity = function() {
		/* 0 = left
		   1 = right (default) */
		this.direction = 1;
		
		/* The place the entity is moving to. */
		this.destination = view.center;
		
		this.moving = true;

		/* Function to move the entity every frame. */
		this.move = function() {
			if (!this.moving)
				return;
			/* The vector is the difference between the position of the item
			   and it's destination. */ 
			var vector = new Point(this.destination.subtract(this.item.position));
			if (vector.size < 5)
				this.moving = false;
			  
			/* Move the item 1/10th of the distance towards the destination. */ 
			this.item.translate(vector.divide(10)); 
		}
		
		/* Set the Entity's destination, flip it if necessary. */
		this.setDestination = function(destination) {
			this.destination = destination;
			direction = this.destination.x - this.item.position.x;
			if (direction > 0 && this.direction < 0) {
				this.flip();
			} else if (direction < 0 && this.direction >= 0) {
				this.flip();
			}
			this.direction = direction;
		}

		/* Move the Entity to the origin, flip it, then move it back. */ 
		this.flip = function() {
			position = this.item.position;
			this.item.translate(this.item.position.multiply(-1));
			this.item.transform(flipHorizontalMatrix);
			this.item.translate(position);
		}
	}

	/* Creates a group of entities. (used for groups of snails) */
	this.SnailGroup = function(noOfEntities) {
		this.item = new Group();
		for (var i = 0; i < noOfEntities; i++)
			this.item.addChild(new Snail(Point.random().multiply(100)).item);
	}
	SnailGroup.prototype = new Entity();


	this.Snail = function(position) {
	    this.item = snailSymbol.place(position);
		this.destination = position;
	}
	Snail.prototype = new Entity();
	




	/* Animates the snail's eyes */
	this.snailUpdate = function() {
		rightEye.segments[0].point = rightStart.add(new Point(Math.random() * -20 + 50, Math.random() * -150 + 10));
		for (var i = 0; i < size - 2; i++) {
			var nextSegment = rightEye.segments[i + 1];
			var position = rightEye.segments[i].point;
			var angle = (position.subtract(nextSegment.point)).angle;
			var vector = new Point({ angle: angle, length: 35 });
			nextSegment.point = position.subtract(vector);
		}
		
		leftEye.segments[0].point = leftStart.add(new Point(Math.random() * -50 + 20, Math.random() * -150 + 10));
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

}


