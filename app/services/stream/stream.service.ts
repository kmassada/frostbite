import { Injectable } from "@angular/core";
import { ReplaySubject } from "rxjs";
import { List } from "immutable";

import { SocketService, ISocketPin } from "../socket";
import { NotificationService } from "../notification";

import { IStream } from "../../models/stream.model";

@Injectable()
export class StreamService {
    streams: ReplaySubject<any> = new ReplaySubject(1);
    private list: List<any> = List();

    /**
     * Constructor.
     *
     * @class StreamService
     * @constructor
     * @param socketService SocketService
     * @param notificationService notificationService
     */
    constructor(
        private socketService: SocketService,
        private notificationService: NotificationService
    ) {
        this.socketService
            .get("stream")
            .subscribe(
                (socketPin: ISocketPin) => {
                    let stream: IStream = socketPin.pin;
                    let index: number = this.findIndex(stream.name);
                    if (socketPin.action === "remove") {
                        // Remove
                        this.list = this.list.delete(index);
                    } else {
                        if (index === -1) {
                            // Create
                            this.list = this.list.push(stream);
                        } else {
                            // Update
                            this.list = this.list.set(index, stream)
                        }
                    }
                    this.streams.next(this.list);
                },
                error => console.log(error)
            );
    }

    /**
     * Join stream
     *
     * @class StreamService
     * @method join
     * @param name string
     * @return void
     */
    join(name: string): void {
        for (let streamIndex in this.notificationService.streams) {
            let stream = this.notificationService.streams[streamIndex];
            if (stream.name === name) {
                return;
            }
        }
        let index = this.findIndex(name);
        if (index !== -1) {
            let stream = this.list.get(index);
            this.notificationService.streams.push(stream);
        }
    }

    /**
     * Leave stream
     *
     * @class StreamService
     * @method leave
     * @param name string
     * @return void
     */
    leave(name: string) {
        // First remove the stream from notification joined streams
        for (var i = 0; i < this.notificationService.streams.count(); i++) {
            let stream = this.notificationService.streams[i];
            if (stream.name === name) {
                this.notificationService.streams.splice(i, 1);
            }
        }
    }

    /**
     * Create stream
     *
     * @class StreamService
     * @method create
     * @param name string
     * @return void
     */
    create(name: string) {
        this.socketService.create(name);
    }

    /**
     * Remove stream
     *
     * @class StreamService
     * @method remove
     * @param name string
     * @return void
     */
    remove(name: string) {
        // First remove the stream from notification joined streams
        for (var i = 0; i < this.notificationService.streams.count(); i++) {
            let stream = this.notificationService.streams[i];
            if (stream.name === name) {
                this.notificationService.streams.splice(i, 1);
            }
        }

        // Send signal to remove the stream
        this.socketService.remove(name);
    }

    /**
     * Find matching stream
     *
     * @class StreamService
     * @method findIndex
     * @param name string
     * @return number
     */
    private findIndex(name: string): number {
        return this.list.findIndex((stream: IStream) => {
            return stream.name === name;
        });
    }
}