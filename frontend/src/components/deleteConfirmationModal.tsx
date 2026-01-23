import * as React from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { useCallback, useState } from "react";

export default function DeleteConfirmationDialog({
  id,
  onConfirm,
  onCancel,
}: {
  id: string;
  onConfirm: (id: string) => void;
  onCancel: (id: string) => void;
}) {
  const [confirmText, setConfirmText] = useState("");

  const submit = useCallback(
    (e) => {
      e.preventDefault();

      if (confirmText !== id) {
        throw Error("Provided Resource ID does not match", confirmText, id);
      }

      onConfirm(id);
    },
    [id, onConfirm, confirmText],
  );

  return (
    <Dialog open={true} onClose={() => onCancel(id)}>
      <DialogTitle>Confirm delete of {id}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete {id}?
        </DialogContentText>
        <form onSubmit={submit} id={`delete-${id}`}>
          <TextField
            autoFocus
            required
            margin="dense"
            id="resource_id"
            name="resource_id"
            fullWidth
            variant="standard"
            onChange={(e) => setConfirmText(e.currentTarget.value)}
            value={confirmText}
            error={!!confirmText && confirmText !== id}
            helperText={
              confirmText && confirmText !== id
                ? "Value does not match id"
                : undefined
            }
            label="Confirm by providing the exact resource ID"
          />
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onCancel(id)}>Cancel</Button>
        <Button
          disabled={confirmText !== id}
          type="submit"
          color="error"
          variant="contained"
          form={`delete-${id}`}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}
