class TimerBasic extends pc.ScriptType {
    text: string;
    entityLink : pc.Entity | null;
    elapsedTime: number = 0;

    initialize(): void {
        if(this.entityLink && this.entityLink.element) {
            this.entityLink.element.text = this.text;
        }
    }

    update(dt: number): void {
        this.elapsedTime += dt;
        if(this.entityLink && this.entityLink.element) {
            this.entityLink.element.text = this.elapsedTime.toFixed(0).toString();
        }
    }
};

pc.registerScript(TimerBasic);
TimerBasic.attributes.add('text', {type: 'string'});
TimerBasic.attributes.add('entityLink', {type : 'entity'});
