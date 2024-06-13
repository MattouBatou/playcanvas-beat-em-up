class Follow extends pc.ScriptType {
    target: pc.Entity;
    followPos: pc.Vec3;
    distance: number;
    CameraX: number;
    CameraY: number;
    CameraZ: number;
    CameraSpeed: number;

    initialize(): void {
       this.followPos = new pc.Vec3(0, 0, 0); 
    }

    postUpdate(dt:number):void {
        if(!this.target) return;

        const targetPos = this.target.getPosition().clone();
        // prevents camera from following or looking along y axis;
        targetPos.y = 0;
        targetPos.z = 0;

        const newCameraPos = targetPos.clone();
        newCameraPos.x += this.CameraX * this.distance;
        newCameraPos.y += this.CameraY * this.distance;
        newCameraPos.z += this.CameraZ * this.distance;

        // smoothly interpolate towards the target position
        this.followPos.lerp(this.followPos, newCameraPos, 1 * this.CameraSpeed);

        // set the position for this entity
        this.entity.setPosition(this.followPos);
        this.entity.lookAt(targetPos);
    }
}

pc.registerScript(Follow);
Follow.attributes.add('target', {type: 'entity', description: 'Target to follow'});
Follow.attributes.add('distance', {
    type: 'number',
    default: 4,
    title: 'Distance',
    description: 'How far from the Entity should the follower be'
});


Follow.attributes.add('CameraX', {
    type: 'number',
    default: 0.2,
    title: 'Camera X Position',
    description: 'X position of the camera from target'
});


Follow.attributes.add('CameraY', {
    type: 'number',
    default: 2,
    title: 'Camera Y Position',
    description: 'Y position of the camera from target'
});

Follow.attributes.add('CameraZ', {
    type: 'number',
    default: 5,
    title: 'Camera Z Position',
    description: 'Z position of the camera from target'
});

Follow.attributes.add('CameraSpeed', {
    type: 'number',
    default: 0.2,
    title: 'Camera Move Speed',
    description: 'Speed of camera when it moves'
});