import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import * as io from "socket.io-client";

import { ISocketPin } from "./socket.pin.interface";
import { INotification } from "../../models/notification.model";

@Injectable()
export class SocketService {
    private name: string;
    private host: string = window.location.protocol + "//" + window.location.hostname + ":" + window.location.port;
    socket: SocketIOClient.Socket;

    /**
     * Constructor.
     *
     * @class SocketService
     * @constructor
     */
    constructor() {}

     /**
      * Get pins observable
      *
      * @class SocketService
      * @method get
      * @param name string
      * @return Observable<any>
      */
    get(name: string): Observable<any> {
        this.name = name;
        let socketUrl = this.host + "/" + this.name;
        this.socket = io.connect(socketUrl);
        this.socket.on("connect", () => this.connect());
        this.socket.on("disconnect", () => this.disconnect());
        this.socket.on("error", (error: string) => {
            console.log(`ERROR: "${error}" (${socketUrl})`);
        });

        // Return observable which follows "create" and "remove" signals from socket stream
        return Observable.create((observer: any) => {
            this.socket.on("create", (pin: any) => observer.next({ action: "create", pin: pin }) );
            this.socket.on("remove", (pin: any) => observer.next({ action: "remove", pin: pin }) );
            return () => this.socket.close();
        });
    }

    /**
     * Create signal
     *
     * @class SocketService
     * @method create
     * @param name string
     * @return void
     */
    create(name: string) {
        this.socket.emit("create", name);
    }

    /**
     * Remove signal
     *
     * @class SocketService
     * @method remove
     * @param name string
     * @return void
     */
    remove(name: string) {
        this.socket.emit("remove", name);
    }

    /**
     * Handle connection opening
     *
     * @class SocketService
     * @method connect
     * @return void
     */
    private connect() {
        console.log(`Connected to "${this.name}"`);

        // Request initial list when connected
        this.socket.emit("list");
    }

    /**
     * Handle connection closing
     *
     * @class SocketService
     * @method disconnect
     * @return void
     */
    private disconnect() {
        console.log(`Disconnected from "${this.name}"`);
    }
}
