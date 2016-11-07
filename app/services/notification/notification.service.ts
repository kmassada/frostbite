import { ReplaySubject } from "rxjs";
import { List } from "immutable";

import { SocketService, ISocketPin } from "../socket";

import { INotification } from "../../models/notification.model";

export class NotificationService {
    notifications: ReplaySubject<any> = new ReplaySubject(1);
    streams: List<any> = List();
    private socketService: SocketService;

    /**
     * Constructor.
     *
     * @class NotificationService
     * @constructor
     * @param stream string
     */
    constructor(private stream: string) {
        this.socketService = new SocketService();
        this.socketService
            .get("notifications/" + encodeURIComponent(this.stream))
            .subscribe(
                (socketPin: ISocketPin) => {
                    let notification: INotification = socketPin.pin;
                    this.streams = this.streams.push(notification);
                    this.notifications.next(this.streams);
                },
                error => console.log(error)
            );
    }

    /**
     * Emit notification using socket service
     *
     * @class NotificationService
     * @method create
     * @param from string
     * @param notification string
     * @return void
     */
    create(from: string, notification: string): void {
        this.socketService.socket.emit("create", {
            stream: this.stream,
            created: new Date(),
            from: from,
            to: "",
            notification: notification
        });
    }
}