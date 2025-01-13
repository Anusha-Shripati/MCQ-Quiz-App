"use client";

import React, { Dispatch, SetStateAction, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface FormData {
  name: string;
  email: string;
  phone: string;
  jobProfile: string;
  experience: string;
  category: string;
  time: string;
  image: File | undefined;
}

interface CreateCandidateProps {
  setSearch: Dispatch<SetStateAction<string>>;
}

const CreateCandidate: React.FC<CreateCandidateProps> = ({ setSearch }) => {
  const [open, setOpen] = useState(false);

  const form = useForm<FormData>({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      jobProfile: "",
      experience: "",
      category: "",
      time: "",
      image: undefined,
    },
  });

  const { handleSubmit, control, reset, setValue } = form;

  const handleAddCandidate = () => setOpen(true);

  const handleCloseModal = () => {
    setOpen(false);
  };

  const onSubmit: SubmitHandler<FormData> = (data) => {
    console.log("Form Data", data);
    handleCloseModal();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setValue("image", file);
  };

  const handleSearch = (e: { target: { value: unknown; }; }) => {
    setSearch(e.target.value as string); 
  }

  return (
    <>
      <div className="flex gap-4">
        <Input
          placeholder="Search Candidate or Technology..."
          className="w-[300px] border-gray-300"
          onChange={handleSearch}
        />
        <Button
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={handleAddCandidate}
        >
          Create Candidate
        </Button>
      </div>

      <Dialog
        open={open}
        onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) reset();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Candidate</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1 space-y-4">
                  {[
                    { name: "name", label: "Candidate Name", required: true },
                    { name: "email", label: "Email", required: true },
                    { name: "phone", label: "Phone", required: true },
                  ].map(({ name, label, required }) => (
                    <FormField
                      key={name}
                      name={name as keyof FormData}
                      control={control}
                      rules={
                        required
                          ? {
                              required: `${label} is required`,
                            }
                          : undefined
                      }
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel className="dark:text-white text-dark">{label}</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder={label}
                              value={
                                typeof field.value === "string"
                                  ? field.value
                                  : ""
                              }
                            />
                          </FormControl>
                          {fieldState.error?.message && (
                            <FormMessage>
                              {fieldState.error.message}
                            </FormMessage>
                          )}
                        </FormItem>
                      )}
                    />
                  ))}

                  <FormItem>
                    <FormLabel>Image</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </FormControl>
                  </FormItem>
                </div>
                <div className="flex-1 space-y-4">
                  {[
                    { name: "jobProfile", label: "Job Profile", required: true },
                    { name: "experience", label: "Experience", required: true },
                    { name: "category", label: "Category", required: true },
                    { name: "time", label: "Time", required: true },
                  ].map(({ name, label, required }) => (
                    <FormField
                      key={name}
                      name={name as keyof FormData}
                      control={control}
                      rules={
                        required
                          ? {
                              required: `${label} is required`,
                            }
                          : undefined
                      }
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel className="dark:text-white text-dark">{label}</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder={label}
                              value={
                                typeof field.value === "string"
                                  ? field.value
                                  : ""
                              }
                            />
                          </FormControl>
                          {fieldState.error?.message && (
                            <FormMessage>
                              {fieldState.error.message}
                            </FormMessage>
                          )}
                        </FormItem>
                        
                      )}
                    />
                  ))}
                </div>
              </div>

              <Button
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                type="submit"
              >
                Save
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreateCandidate;
