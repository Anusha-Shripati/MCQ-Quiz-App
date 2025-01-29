"use client";

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Copy, Edit, MoreHorizontal, MoreVertical, Share, Share2, Trash, UserSearch } from "lucide-react";
import { candidates } from "@/shared/constants/data";
import { useEffect, useState } from "react";
import Pagination from "@/components/candidates/pagination";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Share2Icon } from "@radix-ui/react-icons";
import { FaShare } from "react-icons/fa";

interface Candidate {
  date: string;
  name: string;
  email: string;
  phone: string;
  test: string;
  experience: string;
  description: string;
  duration: string;
  status: string;
  score: string | number;
}

interface CandidatesTableProps {
  selectedFilter: string;
  search: string;
}

export default function CandidatesTable({
  selectedFilter,
  search,
}: CandidatesTableProps) {
  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>(
    candidates
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(
    null
  );
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(
    null
  );

  const totalPages = Math.ceil(filteredCandidates.length / itemsPerPage);

  const currentItems = filteredCandidates.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const nextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const previousPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  useEffect(() => {
    applyFilter(selectedFilter, search);
  }, [selectedFilter, search]);

  const applyFilter = (filterType: string, searchTerm: string) => {
    const now = new Date();
    let filteredData = [...candidates];

    switch (filterType) {
      case "Day":
        filteredData = candidates.filter(
          (candidate) =>
            new Date(candidate.date).toDateString() === now.toDateString()
        );
        break;

      case "Week":
        filteredData = candidates.filter((candidate) => {
          const candidateDate = new Date(candidate.date);
          const weekAgo = new Date(now);
          weekAgo.setDate(now.getDate() - 7);
          return candidateDate >= weekAgo && candidateDate <= now;
        });
        break;

      case "Month":
        filteredData = candidates.filter((candidate) => {
          const candidateDate = new Date(candidate.date);
          return (
            candidateDate.getMonth() === now.getMonth() &&
            candidateDate.getFullYear() === now.getFullYear()
          );
        });
        break;

      case "Last 30 days":
        filteredData = candidates.filter((candidate) => {
          const candidateDate = new Date(candidate.date);
          const thirtyDaysAgo = new Date(now);
          thirtyDaysAgo.setDate(now.getDate() - 30);
          return candidateDate >= thirtyDaysAgo && candidateDate <= now;
        });
        break;

      default:
        break;
    }

    if (searchTerm.trim()) {
      filteredData = filteredData.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredCandidates(filteredData);
    setCurrentPage(1); // Reset to the first page
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setIsEditMode(false);
    setSelectedCandidate(null);
  };

  const openDialog = (candidate: Candidate) => {
    setIsDialogOpen(true);
    setSelectedCandidate(candidate);
  }

  const openEditDialog = (candidate: Candidate) => {
    setEditingCandidate({ ...candidate });
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCandidate) return;

    const updatedCandidates = filteredCandidates.map((candidate) =>
      candidate.email === editingCandidate.email ? editingCandidate : candidate
    );

    setFilteredCandidates(updatedCandidates);
    closeDialog();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditingCandidate((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  useEffect(() => {
    return () => {
      document.body.style.removeProperty("pointer-events");
    };
  }, [isDialogOpen]);

  return (
    <div className="flex flex-col p-6 rounded-lg shadow-lg bg-card space-y-4">
      <div className="flex-grow overflow-auto">
        {/* Table */}
        <div className="flex-grow overflow-auto">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow className="text-sm text-gray-700">
                <TableHead className="p-3 text-left">Date</TableHead>
                <TableHead className="p-3 text-left">Name</TableHead>
                <TableHead className="p-3 text-left">Email</TableHead>
                <TableHead className="p-3 text-left">Phone</TableHead>
                <TableHead className="p-3 text-left">Test</TableHead>
                <TableHead className="p-3 text-left">Experience</TableHead>
                <TableHead className="p-3 text-left">Description</TableHead>
                <TableHead className="p-3 text-left">Duration</TableHead>
                <TableHead className="p-3 text-left">Status</TableHead>
                <TableHead className="p-3 text-left">Score</TableHead>
                <TableHead className="p-3 text-left"></TableHead>

              </TableRow>
            </TableHeader>

            <TableBody>
              {currentItems.length ? (
                currentItems.map((candidate, index) => (
                  <TableRow
                    key={index}
                    className="hover:bg-gray-100 dark:hover:bg-gray-400 hover:text-gray-900 transition-colors duration-200"
                  >
                    <TableCell className="p-3">{candidate.date}</TableCell>
                    <TableCell className="p-3">{candidate.name}</TableCell>
                    <TableCell className="p-3">{candidate.email}</TableCell>
                    <TableCell className="p-3">{candidate.phone}</TableCell>
                    <TableCell className="p-3">{candidate.test}</TableCell>
                    <TableCell className="p-3">{candidate.experience}</TableCell>
                    <TableCell className="p-3">{candidate.description}</TableCell>
                    <TableCell className="p-3">{candidate.duration}</TableCell>
                    <TableCell className="p-3">{candidate.status}</TableCell>
                    <TableCell className="p-1">{candidate.score} </TableCell>

                    <TableCell className="p-3 flex items-center">

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0 text-gray-600 hover:bg-gray-300 hover:text-gray-900 rounded-full"
                          >
                            <span className="sr-only">Open menu</span>
                            <Share2 className="h-4 dark:text-white" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => openDialog(candidate)}
                            className="hover:bg-gray-200 hover:text-gray-900"
                          >
                            <Copy /> Copy test link
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openEditDialog(candidate)}
                            className="hover:bg-gray-200 hover:text-gray-900"
                          >
                            <FaShare /> Share via email
                          </DropdownMenuItem>

                        </DropdownMenuContent>
                      </DropdownMenu>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0 text-gray-600 hover:bg-gray-300 hover:text-gray-900 rounded-full"
                          >
                            <span className="sr-only">Open menu</span>
                            <MoreVertical className="dark:text-white" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => openDialog(candidate)}
                            className="hover:bg-gray-200 hover:text-gray-900"
                          >
                            <UserSearch /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openEditDialog(candidate)}
                            className="hover:bg-gray-200 hover:text-gray-900"
                          >
                            <Edit /> Edit Candidate
                          </DropdownMenuItem>
                          <DropdownMenuItem className="hover:bg-red-100 text-red-600">
                            <Trash /> Delete Candidate
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={11}
                    className="text-center py-6 text-gray-500"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPrevious={previousPage}
        onNext={nextPage}
      />

      {/* Dialog */}
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => !open && closeDialog()}
      >
        <DialogContent className="max-w-2xl p-6 bg-gray-50 dark:bg-gray-900 rounded-lg shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              {isEditMode ? "Edit Candidate" : `${selectedCandidate?.name}'s Details`}
            </DialogTitle>
          </DialogHeader>
          {isEditMode ? (
            <form
              onSubmit={handleEditSubmit}
              className="space-y-6"
            >
              <div className="grid grid-cols-2 gap-6">
                {/* Input fields */}
                {[
                  { label: "Name", name: "name", type: "text" },
                  { label: "Email", name: "email", type: "email" },
                  { label: "Phone", name: "phone", type: "text" },
                  { label: "Test", name: "test", type: "text" },
                  { label: "Experience", name: "experience", type: "text" },
                  { label: "Description", name: "description", type: "text" },
                  { label: "Duration", name: "duration", type: "text" },
                  { label: "Status", name: "status", type: "text" },
                  { label: "Score", name: "score", type: "text" },
                ].map((field) => (
                  <div key={field.name}>
                    <label
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      htmlFor={field.name}
                    >
                      {field.label}:
                    </label>
                    <input
                      id={field.name}
                      name={field.name}
                      type={field.type}
                      value={editingCandidate?.[field.name] || ""}
                      onChange={handleInputChange}
                      className="mt-1 w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white dark:border-gray-700"
                    />
                  </div>
                ))}
              </div>
              {/* Buttons */}
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={closeDialog}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Save Changes
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4 bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
              {/* Candidate Details */}
              {[
                { label: "Name", value: selectedCandidate?.name },
                { label: "Email", value: selectedCandidate?.email },
                { label: "Date", value: selectedCandidate?.date },
                { label: "Phone", value: selectedCandidate?.phone },
                { label: "Test", value: selectedCandidate?.test },
                { label: "Experience", value: selectedCandidate?.experience },
                { label: "Description", value: selectedCandidate?.description },
                { label: "Duration", value: selectedCandidate?.duration },
                { label: "Status", value: selectedCandidate?.status },
                { label: "Score", value: selectedCandidate?.score },
              ].map((item) => (
                <p
                  key={item.label}
                  className="text-gray-800 dark:text-gray-300 text-sm flex justify-between border-b pb-2"
                >
                  <span className="font-medium">{item.label}:</span>
                  <span>{item.value || "N/A"}</span>
                </p>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
