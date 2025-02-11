"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

// Define Category type
interface Category {
  name: string;
  easy: number;
  medium: number;
  hard: number;
}

// Define props type
interface CreateCategoryProps {
  setCategoriesArray: React.Dispatch<React.SetStateAction<Category[]>>;
}

const CreateCategory: React.FC<CreateCategoryProps> = ({ setCategoriesArray }) => {
  const [open, setOpen] = useState(false);
  const [categoryName, setCategoryName] = useState("");

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
          className="bg-blue-600 text-primary-foreground hover:bg-primary/90"
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
            <Input
              placeholder="Category Name"
              className="border-gray-300"
              onChange={(e) => setCategoryName(e.target.value)}
            />
            <Button
              className="bg-blue-600 text-primary-foreground hover:bg-primary/90"
              onClick={() => {
                handleCloseModal();
                setCategoriesArray((prev) => [
                  ...prev,
                  { name: categoryName, easy: 0, medium: 0, hard: 0 },
                ]);
              }}
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
