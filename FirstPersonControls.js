/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 * @author paulirish / http://paulirish.com/
 */

THREE.FirstPersonControls = function ( object, scene ) {
	var sts=0;
    this.scene = scene;

    this.W = true;
    this.S = true;
    this.A = true;
    this.D = true;

    this.vector = new THREE.Vector3();
    object.getWorldDirection(this.vector);

    this.rays = [
        new THREE.Vector3(this.vector.x, this.vector.y, this.vector.z), //0=i
        new THREE.Vector3(-this.vector.x, this.vector.y, this.vector.z),
        new THREE.Vector3(-this.vector.x, -this.vector.y, this.vector.z),
        new THREE.Vector3(-this.vector.x, -this.vector.y, -this.vector.z),
        new THREE.Vector3(this.vector.x, -this.vector.y, -this.vector.z),
        new THREE.Vector3(this.vector.x, this.vector.y, -this.vector.z),
        new THREE.Vector3(-this.vector.x, this.vector.y, -this.vector.z),
        new THREE.Vector3(this.vector.x, -this.vector.y, this.vector.z),
        new THREE.Vector3(this.vector.x/2, this.vector.y, this.vector.z), //8=i
        new THREE.Vector3(this.vector.x/2, this.vector.y/2, this.vector.z),
        new THREE.Vector3(this.vector.x/2, this.vector.y/2, this.vector.z/2), //10=i == 0=i
        new THREE.Vector3(this.vector.x, this.vector.y/2, this.vector.z/2),
        new THREE.Vector3(this.vector.x, this.vector.y, this.vector.z/2),
        new THREE.Vector3(this.vector.x/2, this.vector.y, this.vector.z/2),
        new THREE.Vector3(this.vector.x, this.vector.y/2, this.vector.z),
        new THREE.Vector3(-this.vector.x/2, -this.vector.y, -this.vector.z),
        new THREE.Vector3(-this.vector.x/2, -this.vector.y/2, -this.vector.z),
        new THREE.Vector3(-this.vector.x/2, -this.vector.y/2, -this.vector.z/2), //17=i == 4=i
        new THREE.Vector3(-this.vector.x, -this.vector.y/2, -this.vector.z/2),
        new THREE.Vector3(-this.vector.x, -this.vector.y, -this.vector.z/2),
        new THREE.Vector3(-this.vector.x/2, -this.vector.y, -this.vector.z/2), //20=i
        new THREE.Vector3(-this.vector.x, -this.vector.y/2, -this.vector.z)];


    this.object = object;
	this.target = new THREE.Vector3( 0, 0, 0 );

    var domElement = undefined;
	this.domElement = ( domElement !== undefined ) ? domElement : document;

	this.movementSpeed = 1.0;
	this.lookSpeed = 0.005;

	this.lookVertical = true;
	this.autoForward = false;
	// this.invertVertical = false;

	this.activeLook = true;
    this.move = false;					///////////////!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

    this.heightSpeed = false;
	this.heightCoef = 1.0;
	this.heightMin = 0.0;
	this.heightMax = 1.0;

	this.constrainVertical = false;
	this.verticalMin = 0;
	this.verticalMax = Math.PI;

	this.autoSpeedFactor = 0.0;

	this.mouseX = 0;
	this.mouseY = 0;

	this.lat = 0;
	this.lon = 0;
	this.phi = 0;
	this.theta = 0;

	this.moveForward = false;
	this.moveBackward = false;
	this.moveLeft = false;
	this.moveRight = false;
	this.freeze = false;

	this.mouseDragOn = false;

	this.viewHalfX = 0;
	this.viewHalfY = 0;

    this.caster = new THREE.Raycaster();

    this.updateRays = function (vec) {
        this.rays = [
            new THREE.Vector3(vec.x, vec.y, vec.z), //0=i
            new THREE.Vector3(-vec.x, vec.y, vec.z),
            new THREE.Vector3(-vec.x, -vec.y, vec.z),
            new THREE.Vector3(-vec.x, -vec.y, -vec.z),
            new THREE.Vector3(vec.x, -vec.y, -vec.z),
            new THREE.Vector3(vec.x, vec.y, -vec.z),
            new THREE.Vector3(-vec.x, vec.y, -vec.z),
            new THREE.Vector3(vec.x, -vec.y, vec.z),
            new THREE.Vector3(vec.x/2, vec.y, vec.z), //8=i
            new THREE.Vector3(vec.x/2, vec.y/2, vec.z),
            new THREE.Vector3(vec.x/2, vec.y/2, vec.z/2), //10=i == 0=i
            new THREE.Vector3(vec.x, vec.y/2, vec.z/2),
            new THREE.Vector3(vec.x, vec.y, vec.z/2),
            new THREE.Vector3(vec.x/2, vec.y, vec.z/2),
            new THREE.Vector3(vec.x, vec.y/2, vec.z),
            new THREE.Vector3(-vec.x/2, -vec.y, -vec.z),
            new THREE.Vector3(-vec.x/2, -vec.y/2, -vec.z),
            new THREE.Vector3(-vec.x/2, -vec.y/2, -vec.z/2), //17=i == 4=i
            new THREE.Vector3(-vec.x, -vec.y/2, -vec.z/2),
            new THREE.Vector3(-vec.x, -vec.y, -vec.z/2),
            new THREE.Vector3(-vec.x/2, -vec.y, -vec.z/2), //20=i
            new THREE.Vector3(-vec.x, -vec.y/2, -vec.z)];
    };


	if ( this.domElement !== document ) {

		this.domElement.setAttribute( 'tabindex', -1 );

	}

	//

	this.handleResize = function () {

		if ( this.domElement === document ) {

			this.viewHalfX = window.innerWidth / 2;
			this.viewHalfY = window.innerHeight / 2;

		} else {

			this.viewHalfX = this.domElement.offsetWidth / 2;
			this.viewHalfY = this.domElement.offsetHeight / 2;

		}

	};

	this.onMouseDown = function ( event ) {

        var raycaster = new THREE.Raycaster();
        var mouse = new THREE.Vector2();


        mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

        raycaster.setFromCamera( mouse, camera );

        // calculate objects intersecting the picking ray
        var intersects = raycaster.intersectObjects( scene.children,true);

        //window.alert(intersects[0].object.name);
        if(intersects[0].object.name == 2){
            click_dol = intersects[0].distance;
        	clickE=true;
		}else if(intersects[0].object.name == "sekira_na_tleh"){
        	var teks = document.getElementById("text");
        	text.innerHTML += "<br />" +  "Sekira";
        	axe_pobrano=true;
        	axe_inv=true;
		}else if(intersects[0].object.name == "Object.1"){
			if(sts==0){
                document.getElementById("text");
                text.innerHTML += "<br />" +  "Ključ";
                key_pobrano=true;
                sts++;
			}

		}else if(intersects[0].object.name == "vlka_skatla"){
            click_dol_key = intersects[0].distance;
            click_on_bigBox=true;
		}else if(intersects[0].object.name == "steker_c"){
			if(steker){
				steker=false;
			}else{
				steker=true;
			}
		}else if(intersects[0].object.name == "steker_modr"){
			if(stek_m){
				stek_m=false;
			}else{
				stek_m=true;
			}
			platno=true;
		}else if(intersects[0].object.name == "steker_rdec"){
            if(stek_r){
                stek_r=false;
            }else{
                stek_r=true;
            }
            platno=true;
        }else if(intersects[0].object.name == "steker_zelen"){
            if(stek_z){
                stek_z=false;
            }else{
                stek_z=true;
            }
            platno=true;
        }
	};


	this.onMouseUp = function ( event ) {
/*
		event.preventDefault();
		event.stopPropagation();

		if ( this.activeLook ) {

			switch ( event.button ) {

				case 0: this.moveForward = false; break;
				case 2: this.moveBackward = false; break;

			}

		}

		this.mouseDragOn = false;
*/
	};

	this.onMouseMove = function ( event ) {
        this.object.getWorldDirection(this.vector);
        this.updateRays(this.vector);

        var vec = new THREE.Vector3();
        if ( this.domElement === document ) {

            this.mouseX = event.pageX - this.viewHalfX;
            this.mouseY = event.pageY - this.viewHalfY;
        } else {
            this.mouseX = event.pageX - this.domElement.offsetLeft - this.viewHalfX;
            this.mouseY = event.pageY - this.domElement.offsetTop - this.viewHalfY;
        }





        this.W = true;
        this.S = true;
        this.A = true;
        this.D = true;

		/*,
		 new THREE.Vector3(this.vector.x/4, this.vector.y, this.vector.z),
		 new THREE.Vector3(this.vector.x/4, this.vector.y/4, this.vector.z),
		 new THREE.Vector3(this.vector.x/4, this.vector.y/4, this.vector.z/4),
		 new THREE.Vector3(this.vector.x, this.vector.y/4, this.vector.z/4),
		 new THREE.Vector3(this.vector.x, this.vector.y, this.vector.z/4),
		 new THREE.Vector3(this.vector.x/4, this.vector.y, this.vector.z/4),
		 new THREE.Vector3(this.vector.x, this.vector.y/4, this.vector.z),
		 new THREE.Vector3(-this.vector.x/4, -this.vector.y, -this.vector.z),
		 new THREE.Vector3(-this.vector.x/4, -this.vector.y/4, -this.vector.z), //30=i
		 new THREE.Vector3(-this.vector.x/4, -this.vector.y/4, -this.vector.z/4),
		 new THREE.Vector3(-this.vector.x, -this.vector.y/4, -this.vector.z/4),
		 new THREE.Vector3(-this.vector.x, -this.vector.y, -this.vector.z/4),
		 new THREE.Vector3(-this.vector.x/4, -this.vector.y, -this.vector.z/4),
		 new THREE.Vector3(-this.vector.x, -this.vector.y/4, -this.vector.z)*//*
		 ,
		 new THREE.Vector3(0, this.vector.y, this.vector.z),
		 new THREE.Vector3(0, 0, this.vector.z),
		 new THREE.Vector3(0, 0, 0),
		 new THREE.Vector3(this.vector.x, 0, 0),
		 new THREE.Vector3(this.vector.x, this.vector.y, 0), //40=i
		 new THREE.Vector3(0, this.vector.y, 0),
		 new THREE.Vector3(this.vector.x, 0, this.vector.z),
		 new THREE.Vector3(0, -this.vector.y, -this.vector.z),
		 new THREE.Vector3(0, 0, -this.vector.z),
		 new THREE.Vector3(0, 0, 0),
		 new THREE.Vector3(-this.vector.x, 0, 0),
		 new THREE.Vector3(-this.vector.x, -this.vector.y, 0),
		 new THREE.Vector3(0, -this.vector.y, 0),
		 new THREE.Vector3(-this.vector.x, 0, -this.vector.z)*/ //49
        //];

        this.distance = 150;
        //window.alert(this.rays[0].x);
        //window.alert(this.rays[3].x);

        for(var i = 0; 0 < 4; i++){
            this.caster.set(this.object.position, this.rays[i]); // TU JE NAPAKA -.-
            this.collisions = this.caster.intersectObjects(this.scene.children, true); // AL PA TU :D
            //window.alert(this.caster.x);
            if(this.collisions.length > 0 && this.collisions[0].distance <= this.distance){
                //window.alert("ZAZNAL SEM TRK");
                if ((i === 0 || i === 7 || i === 10 || i === 12 || i === 13 || i === 14 ||i === 8 || i === 9 || i === 10 || i === 11)) {
                    this.W = false;
                    //window.alert("W");
                }
                else if ((i === 3 || i === 6 || i === 17 || i === 20 || i === 21 || i === 18 || i === 19 || i === 15 || i === 16)) {
                    this.S = false;
                    //window.alert("S");
                }
                else if ((i === 1 || i === 4)) {
                    this.A = false;
                    //window.alert("A");
                }
                else if ((i === 5 || i === 2)) {
                    this.D = false;
                    //window.alert("D");
                }
            }
        }
	};

	this.onKeyDown = function ( event ) {
        this.object.getWorldDirection(this.vector);
        this.updateRays(this.vector);
		//event.preventDefault();

		switch ( event.keyCode ) {

			case 38: /*up*/
			case 87: /*W*/ this.moveForward = true; break;

			case 37: /*left*/
			case 65: /*A*/ this.moveLeft = true; break;

			case 40: /*down*/
			case 83: /*S*/ this.moveBackward = true; break;

			case 39: /*right*/
			case 68: /*D*/ this.moveRight = true; break;

			case 82: /*R*/ this.moveUp = true; break;
			case 70: /*F*/ this.moveDown = true; break;

			case 72: /*H*/ this.help();break;

			case 74: this.test();break;

			case 81: /*Q*/ this.freeze = !this.freeze; break;

		}

	};
	this.test = function () {
		escape_room=true;
    }

	this.help = function () {
        dodaj_axe(5000, 5000, 5000, "help_axe1");
        dodaj_axe(5000, 5000, 5000,"help_axe2");
        dodaj_axe(5000, 5000, 5000,"help_axe3");
		clickHelp=true;
    };

	this.onKeyUp = function ( event ) {
        this.object.getWorldDirection(this.vector); //////////!!!!!!!!!!!
        this.updateRays(this.vector);///////////"""""""""""""""!!!!!!!!!!

		switch( event.keyCode ) {

			case 38: /*up*/
			case 87: /*W*/ this.moveForward = false; break;

			case 37: /*left*/
			case 65: /*A*/ this.moveLeft = false; break;

			case 40: /*down*/
			case 83: /*S*/ this.moveBackward = false; break;

			case 39: /*right*/
			case 68: /*D*/ this.moveRight = false; break;

			case 82: /*R*/ this.moveUp = false; break;
			case 70: /*F*/ this.moveDown = false; break;

		}

	};

	this.update = function( delta ) {

		if ( this.freeze ) {

			return;

		}

		if ( this.heightSpeed ) {

			var y = THREE.Math.clamp( this.object.position.y, this.heightMin, this.heightMax );
			var heightDelta = y - this.heightMin;

			this.autoSpeedFactor = delta * ( heightDelta * this.heightCoef );

		} else {

			this.autoSpeedFactor = 0.0;

		}

		var actualMoveSpeed = delta * this.movementSpeed;

        if ( (this.moveForward || ( this.autoForward && !this.moveBackward )) && this.W ){
            this.object.translateZ( - ( actualMoveSpeed + this.autoSpeedFactor ) );
        }
        if ( this.moveBackward && this.S){
            this.object.translateZ( actualMoveSpeed );
        }
        if ( this.moveLeft && this.A){
            this.object.translateX( - actualMoveSpeed );
        }
        if ( this.moveRight && this.D){
            this.object.translateX( actualMoveSpeed );
        }
        if ( this.moveUp ){
            this.object.translateY( actualMoveSpeed );
        }
        if ( this.moveDown ){
            this.object.translateY( - actualMoveSpeed );
        }


        var actualLookSpeed = delta * this.lookSpeed;

		if ( !this.activeLook ) {

			actualLookSpeed = 0;

		}

		var verticalLookRatio = 1;

		if ( this.constrainVertical ) {

			verticalLookRatio = Math.PI / ( this.verticalMax - this.verticalMin );

		}

		this.lon += this.mouseX * actualLookSpeed;
		if( this.lookVertical ) this.lat -= this.mouseY * actualLookSpeed * verticalLookRatio;

		this.lat = Math.max( - 85, Math.min( 85, this.lat ) );
		this.phi = THREE.Math.degToRad( 90 - this.lat );

		this.theta = THREE.Math.degToRad( this.lon );

		if ( this.constrainVertical ) {

			this.phi = THREE.Math.mapLinear( this.phi, 0, Math.PI, this.verticalMin, this.verticalMax );

		}

		var targetPosition = this.target,
			position = this.object.position;

		targetPosition.x = position.x + 100 * Math.sin( this.phi ) * Math.cos( this.theta );
		targetPosition.y = position.y + 100 * Math.cos( this.phi );
		targetPosition.z = position.z + 100 * Math.sin( this.phi ) * Math.sin( this.theta );

		this.object.lookAt( targetPosition );

	};


	this.domElement.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );

	this.domElement.addEventListener( 'mousemove', bind( this, this.onMouseMove ), false );
	this.domElement.addEventListener( 'mousedown', bind( this, this.onMouseDown ), false );
	this.domElement.addEventListener( 'mouseup', bind( this, this.onMouseUp ), false );
	this.domElement.addEventListener( 'keydown', bind( this, this.onKeyDown ), false );
	this.domElement.addEventListener( 'keyup', bind( this, this.onKeyUp ), false );

	function bind( scope, fn ) {

		return function () {

			fn.apply( scope, arguments );

		};

	};

	this.handleResize();

};
