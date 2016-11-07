export interface INotification {
    stream: string;
    type: string;
    success: boolean;
    created: Date;
    notification: string;
}