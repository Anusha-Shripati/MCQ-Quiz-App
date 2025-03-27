"use client";

import { useState } from "react";
import { Button } from "../ui/form/button";
import DialogForm from "./dialog-form";

export default function CreateCandidateDialog() {
    const [open, setOpen] = useState(false);
    return (
        <>
            <Button onClick={() => setOpen(true)} className="bg-blue-600 text-white font-medium px-6 py-2 rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 transition-all duration-200 ease-in-out hover:animate-bounce">
                Create Candidate
            </Button>
            <DialogForm setOpen={setOpen} open={open}></DialogForm>
        </>
    );
}