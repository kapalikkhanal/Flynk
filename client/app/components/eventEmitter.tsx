class CustomEventEmitter {
    events: any;
    constructor() {
        this.events = {};
    }

    on(eventName: string, callback: (changedSetting: any) => void) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName].push(callback);
    }

    off(eventName: string, callback: (changedSetting: any) => void) {
        if (!this.events[eventName]) return;
        this.events[eventName] = this.events[eventName].filter((cb: any) => cb !== callback);
    }

    emit(eventName: string, data: { [x: string]: boolean; }) {
        if (!this.events[eventName]) return;
        this.events[eventName].forEach((callback: (arg0: any) => void) => {
            callback(data);
        });
    }
}

const eventEmitter = new CustomEventEmitter();

export default eventEmitter;