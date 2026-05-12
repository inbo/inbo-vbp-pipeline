import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { Spinner } from "./Spinner";

export function ActionConfirmationModal({
  title,
  message,
  actionLabel,
  loading,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  actionLabel: string;
  loading: boolean;
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
      <DialogTitle id="action-confirmation-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="action-confirmation-dialog-description">
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} variant="outlined">
          No
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="error"
          disabled={loading}
          autoFocus
        >
          {loading ? <Spinner /> : actionLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
