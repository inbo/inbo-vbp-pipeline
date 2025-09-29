import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from "@mui/material";

export function ActionConfirmationModal({
    title,
    message,
    onConfirm,
    onCancel,
}: {
    title: string;
    message: string;
    actionLabel: string;
    onConfirm: () => void;
    onCancel: () => void;
}) {
    return (
        <Dialog
            open={true}
            onClose={onCancel}
            aria-labelledby="action-confirmation-dialog-title"
            aria-describedby="action-confirmation-dialog-description"
        >
            <DialogTitle id="action-confirmation-dialog-title">
                {title}
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="action-confirmation-dialog-description">
                    {message}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={onCancel}
                    variant="outlined"
                >
                    No
                </Button>
                <Button
                    onClick={onConfirm}
                    variant="contained"
                    color="error"
                    autoFocus
                >
                    Yes
                </Button>
            </DialogActions>
        </Dialog>
    );
}
