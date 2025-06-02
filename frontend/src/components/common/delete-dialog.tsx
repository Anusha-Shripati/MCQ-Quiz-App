import {
  Dialog,
  // DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '../ui/form/button';

export const DeleteDialog: React.FC<{
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  onDelete: () => void;
}> = ({ isOpen, setOpen, onDelete }) => (
  <Dialog open={isOpen} onOpenChange={() => setOpen(false)}>
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
          Are you sure?
        </DialogTitle>
        <DialogDescription className="text-sm text-gray-600 dark:text-gray-400">
          This action cannot be undone. This will permanently delete the question.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" onClick={() => setOpen(false)} className="text-gray-900 dark:text-white">
          Cancel
        </Button>
        <Button variant="destructive" onClick={() => { onDelete(); setOpen(false) }}>
          Delete
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
