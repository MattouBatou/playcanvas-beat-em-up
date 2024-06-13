class CharacterController extends pc.ScriptType {
    isFacingRight: boolean = true;
    isMoving: boolean = false;
    isJumping: boolean = false;
    isGrounded: boolean = true;
    moveSpeed: number = 13;
    jumpSpeed: number = 5;
    jumpMaxHeight: number = 100;
    jumpAmount: number = 0; // This is the number we will change and apply to the characters Y position.
    jumpVel: number = 0;
    fallSpeed: number = 3; // NOTE(matt): This should be a gravity value that will be added later.
    moveDir: pc.Vec2;

    leftTouchButton: pc.Entity;
    rightTouchButton: pc.Entity;
    upTouchButton: pc.Entity;
    downTouchButton: pc.Entity;

    jumpTouchButton: pc.Entity;

    wasJumpTouchButtonPressed = false;

    initialize(): void {
        if(!this.leftTouchButton.button) {
            console.error("There needs to be a left touch button entity for touch controls.");
        }
        if(!this.rightTouchButton.button) {
            console.error("There needs to be a right touch button entity for touch controls.");
        }
        if(!this.upTouchButton.button) {
            console.error("There needs to be a up touch button entity for touch controls.");
        }
        if(!this.downTouchButton.button) {
            console.error("There needs to be a down touch button entity for touch controls.");
        }

        if(!this.jumpTouchButton.button) {
            console.error("There needs to be a jump touch button entity for touch controls.");
        }

        if(this.jumpTouchButton.element) {
            this.jumpTouchButton.element.on('touchstart', this.jumpTouchStart, this);
        }

        this.moveDir = new pc.Vec2(0, 0);

        if (!this.app.touch) {
            this.leftTouchButton.enabled = false;
            this.rightTouchButton.enabled = false;
            this.upTouchButton.enabled = false;
            this.downTouchButton.enabled = false;
            this.jumpTouchButton.enabled = false;
        }
    }

    update(dt: number): void {
        if(!this.entity) return;

        const entityPos = this.entity.getPosition().clone();
        const currentRotation = this.entity.getLocalEulerAngles().clone();

        this.moveDir.set(0, 0);

        // Analogue Movement
        let padStickL_X = this.app.gamepads.getAxis(pc.PAD_1, pc.PAD_L_STICK_X);
        let padStickL_Y = this.app.gamepads.getAxis(pc.PAD_1, pc.PAD_L_STICK_Y);

        if(this.leftTouchButton.button?._isPressed) {
            padStickL_X = -1;
        }
        else if(this.rightTouchButton.button?._isPressed) {
            padStickL_X = 1;
        }

        if(this.upTouchButton.button?._isPressed) {
            padStickL_Y = -1;
        }
        else if(this.downTouchButton.button?._isPressed) {
            padStickL_Y = 1;
        }

        if( padStickL_X !== 0) {
            if(padStickL_X < 0) {
                this.moveDir.x = -1;
                this.isFacingRight = false;
            }
            else if(padStickL_X > 0) {
                this.moveDir.x = 1;
                this.isFacingRight = true;
            }
        }

        if( padStickL_Y !== 0) {
            if(padStickL_Y < 0) {
                this.moveDir.y = -1;
            }
            else if(padStickL_Y > 0) {
                this.moveDir.y = 1;
            }
        }

        // Digital Movement
        if(this.app.gamepads.isPressed(pc.PAD_1, pc.PAD_LEFT) || this.app.keyboard.isPressed(pc.KEY_A)) {
            this.moveDir.x = -1;
            this.isFacingRight = false;
        }
        else if(this.app.gamepads.isPressed(pc.PAD_1, pc.PAD_RIGHT) || this.app.keyboard.isPressed(pc.KEY_D)) {
            this.moveDir.x = 1;
            this.isFacingRight = true;
        }

        if(this.app.gamepads.isPressed(pc.PAD_1, pc.PAD_UP) || this.app.keyboard.isPressed(pc.KEY_W)) {
            this.moveDir.y = -1;
        }
        else if(this.app.gamepads.isPressed(pc.PAD_1, pc.PAD_DOWN) || this.app.keyboard.isPressed(pc.KEY_S)) {
            this.moveDir.y = 1;
        }

        if(this.isFacingRight) {
            currentRotation.y = 90;
        }
        else {
            currentRotation.y = 270;
        }

        // Jumping
        if(!this.isJumping && this.isGrounded && (this.app.keyboard.wasPressed(pc.KEY_SPACE) || this.wasJumpTouchButtonPressed || this.app.gamepads.wasPressed(pc.PAD_1, pc.PAD_FACE_2))) {
            this.isJumping = true;
        }

        // Jumping Logic
        //// First half of jump travelling upwards
        if(this.isJumping) {
            this.isGrounded = false;

            if(this.jumpAmount >= this.jumpMaxHeight) {
                this.isJumping = false;
            }
            else {
                this.jumpVel += this.jumpSpeed;
            }
        }

        //// Second half of jump travelling downwards
        if(!this.isJumping && !this.isGrounded) {

            this.jumpVel -= this.fallSpeed;
            if(this.jumpAmount + this.jumpVel <= 0) {
                this.jumpVel = 0;
                this.jumpAmount = 0;
                // Snap entity back to ground
                entityPos.y = 0;
                this.entity.setPosition(entityPos);

                this.isGrounded = true;
            }
        }

        if(!this.isGrounded) {
            this.jumpAmount += this.jumpVel;
            this.moveDir.x *= 0.7;
            this.moveDir.y = 0;
        }

        this.moveDir.normalize();

        if(this.moveDir.x !== 0 || this.moveDir.y !== 0) {
            this.isMoving = true;
        }
        else {
            this.isMoving = false;
        }

        this.entity.anim?.setBoolean('moving', this.isMoving && this.isGrounded);
        this.entity.anim?.setBoolean('jumping', (this.jumpAmount > 20));

        entityPos.x = (this.moveSpeed * dt) * this.moveDir.x;
        entityPos.y = this.jumpVel * dt;
        entityPos.z = (this.moveSpeed * dt) * this.moveDir.y;

        // Translate needed for smooth movement
        this.entity.translate(entityPos);
        this.entity.setLocalEulerAngles(currentRotation);

        if(this.isGrounded && this.jumpVel !== 0) this.jumpVel = 0;

        this.wasJumpTouchButtonPressed = false;
    }

    jumpTouchStart(e: pc.TouchEvent) {
        this.wasJumpTouchButtonPressed = true;
        e.event.preventDefault();
    }
}

pc.registerScript(CharacterController);
CharacterController.attributes.add('leftTouchButton', { type: "entity", assetType: "entity", title: "left dir button"});
CharacterController.attributes.add('rightTouchButton', { type: "entity", assetType: "entity", title: "right dir button"});
CharacterController.attributes.add('upTouchButton', { type: "entity", assetType: "entity", title: "up dir button"});
CharacterController.attributes.add('downTouchButton', { type: "entity", assetType: "entity", title: "down dir button"});

CharacterController.attributes.add('jumpTouchButton', { type: "entity", assetType: "entity", title: "jump button"});