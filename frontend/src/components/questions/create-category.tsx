"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/form/input";
import { Button } from "@/components/ui/form/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

interface Category {
  name: string;
  easy: number;
  medium: number;
  hard: number;
}

interface CreateCategoryProps {
  setCategoriesArray: React.Dispatch<React.SetStateAction<Category[]>>;
  categoriesArray: Category[]; // Pass categories to filter
  setFilteredCategories: React.Dispatch<React.SetStateAction<Category[]>>;
}

const CreateCategory: React.FC<CreateCategoryProps> = ({
  setCategoriesArray,
  categoriesArray,
  setFilteredCategories,
}) => {
  const [open, setOpen] = useState(false);
  const [technologyName, setTechnologyName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Handle search input change
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    if (value === "") {
      setFilteredCategories(categoriesArray); // Reset to all categories when empty
    } else {
      setFilteredCategories(
        categoriesArray.filter((cat) => cat.name.toLowerCase().includes(value))
      );
    }
  };

  const handleCloseModal = () => {
    setOpen(false);
  };

  return (
    <>
      <div className="flex gap-4">
        <Input
          placeholder="Search Technology..."
          className="w-[200px] border-gray-300"
          value={searchTerm}
          onChange={handleSearch}
        />
        <Button
          className="bg-blue-600 text-primary-foreground hover:bg-primary/90"
          onClick={() => setOpen(true)}
        >
          Create Technology
        </Button>
      </div>

      {/* Add/Edit Category Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Technology</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Technology Name"
              className="border-gray-300"
              onChange={(e) => setTechnologyName(e.target.value)}
            />
            <Button
              className="bg-blue-600 text-primary-foreground hover:bg-primary/90"
              onClick={() => {
                handleCloseModal();
                const newCategory = {
                  name: technologyName,
                  easy: 0,
                  medium: 0,
                  hard: 0,
                };
                setCategoriesArray((prev) => [...prev, newCategory]);
                setFilteredCategories((prev) => [...prev, newCategory]);
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
