"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
// import { format } from "date-fns";

interface CreateCandidateDialogProps {
    open: boolean; // Controls whether the dialog is open
    onOpenChange: (open: boolean) => void; // Callback to update the open state
  }

export default function CreateCandidateDialog({ open, onOpenChange }: CreateCandidateDialogProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Dialog Trigger (Button to open the dialog) */}
      <DialogTrigger asChild>
        <Button className="bg-blue-600 text-white font-medium px-6 py-2 rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 transition-all duration-200 ease-in-out">
          Create Candidate
        </Button>
      </DialogTrigger>

      {/* Dialog Content */}
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create Candidates & Test</DialogTitle>
        </DialogHeader>

        {/* Form Fields */}
        <div className="space-y-4">
          {/* Name */}
          <Input placeholder="Name" />

          {/* Email and Phone */}
          <div className="grid grid-cols-2 gap-4">
            <Input placeholder="Email" />
            <Input placeholder="Phone" />
          </div>

          {/* Job Profile (Technology) and Exp. */}
          <div className="grid grid-cols-2 gap-4">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Job Profile (Technology)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mern">MERN</SelectItem>
                <SelectItem value="mean">MEAN</SelectItem>
                <SelectItem value="react">React</SelectItem>
                <SelectItem value="angular">Angular</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Exp." />
          </div>

          {/* Select Technology
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select Technology" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="react">React</SelectItem>
              <SelectItem value="angular">Angular</SelectItem>
              <SelectItem value="vue">Vue</SelectItem>
              <SelectItem value="node">Node.js</SelectItem>
            </SelectContent>
          </Select> */}

          {/* Select Assessment */}
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select Assessment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="frontend">Frontend Assessment</SelectItem>
              <SelectItem value="backend">Backend Assessment</SelectItem>
              <SelectItem value="fullstack">Fullstack Assessment</SelectItem>
            </SelectContent>
          </Select>

          {/* Start Date and End Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium mb-2">Start Date</p>
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                className="rounded-md border"
              />
            </div>
            <div>
              <p className="text-sm font-medium mb-2">End Date</p>
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                className="rounded-md border"
              />
            </div>
          </div>
        </div>

        {/* Dialog Footer (Create and Cancel Buttons) */}
        <DialogFooter onClick={() => onOpenChange(false)}>
          <Button variant="outline" onClick={() => setStartDate(undefined)}>
            Cancel
          </Button>
          <Button
            className="bg-blue-600 text-white hover:bg-blue-700"
            onClick={() => {
              console.log("Candidate created!");
              onOpenChange(false);
            }}
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
