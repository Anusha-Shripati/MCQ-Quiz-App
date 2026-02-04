'use client';

import { useState } from 'react';
import { Button } from '../ui/form/button';
import DialogForm from './dialog-form';
import { PlusCircle } from 'lucide-react';

export default function CreateCandidateDialog() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="bg-foreground text-secondary font-medium px-3 py-2 rounded-lg shadow-md hover:bg-foreground/90 hover:shadow-lg focus:ring-4 focus:ring-ring transition-all duration-200"
      >
        <PlusCircle className=" h-4 w-4" />
        Create Candidate
      </Button>
      <DialogForm setOpen={setOpen} open={open}></DialogForm>
    </>
  );
}
