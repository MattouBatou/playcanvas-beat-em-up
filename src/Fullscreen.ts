class Fullscreen extends pc.ScriptType {
    pressedState: boolean = false;

    initialize(): void {
        if(this.entity.button){
            this.entity?.button.on('click', (event) => {
                if(!this.pressedState) {
                    pc.app?.graphicsDevice.canvas.requestFullscreen();
                }
                else {
                    document.exitFullscreen();
                }

                this.pressedState = !this.pressedState;
            }, this);
        }
    }
};

pc.registerScript(Fullscreen);
