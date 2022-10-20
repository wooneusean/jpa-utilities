export default interface ToastMessage {
    message: string;
    type: 'warning' | 'error' | 'info' | 'info-square' | 'success' | 'warning-alt';
}
