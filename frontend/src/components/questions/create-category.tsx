"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

const CreateCategory = () => {
  const [open, setOpen] = useState(false);

  const handleAddCategory = () => {
    setOpen(true);
  };

  const handleCloseModal = () => {
    setOpen(false);
  };

  return (
    <>
      <div className="flex gap-4">
        <Input
          placeholder="Search Category..."
          className="w-[200px] border-gray-300"
        />
        <Button
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={handleAddCategory}
        >
          Create Category
        </Button>
      </div>
      {/* Add/Edit Category Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Category Name" className="border-gray-300" />
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleCloseModal}
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreateCategory;

