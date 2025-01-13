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
import { Edit, MoreHorizontal, Trash, UserSearch } from "lucide-react";
import { candidates } from "@/shared/constants/data";
import { useEffect, useState } from "react";
import Pagination from "@/components/candidates/pagination";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
                <TableHead className="p-3 text-left">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {currentItems.length ? (
                currentItems.map((candidate, index) => (
                  <TableRow
                    key={index}
                    className="hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200"
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
                    <TableCell className="p-3">{candidate.score}</TableCell>
                    <TableCell className="p-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0 text-gray-600 hover:bg-gray-200 hover:text-gray-900 rounded-full"
                          >
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal />
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Edit Candidate" : `${selectedCandidate?.name}'s Details`}
            </DialogTitle>
          </DialogHeader>
          {/* Dialog content */}
          {/* Dialog Modal */}
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              if (!open) {
                setIsDialogOpen(false);
              }
            }}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {isEditMode ? 'Edit Candidate' : `${selectedCandidate?.name}'s Details`}
                </DialogTitle>
              </DialogHeader>

              {isEditMode ? (
                <form onSubmit={handleEditSubmit} className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Name:</label>
                      <input
                        type="text"
                        name="name"
                        value={editingCandidate?.name || ''}
                        onChange={handleInputChange}
                        className="w-full border rounded-md p-2"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Email:</label>
                      <input
                        type="email"
                        name="email"
                        value={editingCandidate?.email || ''}
                        onChange={handleInputChange}
                        className="w-full border rounded-md p-2"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Phone:</label>
                      <input
                        type="phone"
                        name="phone"
                        value={editingCandidate?.phone || ''}
                        onChange={handleInputChange}
                        className="w-full border rounded-md p-2"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Test:</label>
                      <input
                        type="test"
                        name="test"
                        value={editingCandidate?.test || ''}
                        onChange={handleInputChange}
                        className="w-full border rounded-md p-2"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Experience:</label>
                      <input
                        type="experience"
                        name="experience"
                        value={editingCandidate?.experience || ''}
                        onChange={handleInputChange}
                        className="w-full border rounded-md p-2"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Description:</label>
                      <input
                        type="description"
                        name="description"
                        value={editingCandidate?.description || ''}
                        onChange={handleInputChange}
                        className="w-full border rounded-md p-2"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Duration:</label>
                      <input
                        type="duration"
                        name="duration"
                        value={editingCandidate?.duration || ''}
                        onChange={handleInputChange}
                        className="w-full border rounded-md p-2"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Status:</label>
                      <input
                        type="status"
                        name="status"
                        value={editingCandidate?.status || ''}
                        onChange={handleInputChange}
                        className="w-full border rounded-md p-2"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Score:</label>
                      <input
                        type="score"
                        name="score"
                        value={editingCandidate?.score || ''}
                        onChange={handleInputChange}
                        className="w-full border rounded-md p-2"
                      />
                    </div>
                    {/* Add more input fields as needed */}
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={closeDialog}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="default">
                      Save Changes
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    <span className="font-bold">Name:</span> {selectedCandidate?.name}
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    <span className="font-bold">Email:</span> {selectedCandidate?.email}
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    <span className="font-bold">Date:</span> {selectedCandidate?.date}
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    <span className="font-bold">Phone:</span> {selectedCandidate?.phone}
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    <span className="font-bold">Test:</span> {selectedCandidate?.test}
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    <span className="font-bold">Experience:</span> {selectedCandidate?.experience}
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    <span className="font-bold">Description:</span> {selectedCandidate?.description}
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    <span className="font-bold">Duration:</span> {selectedCandidate?.duration}
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    <span className="font-bold">Status:</span> {selectedCandidate?.status}
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    <span className="font-bold">Score:</span> {selectedCandidate?.score}
                  </p>
                </div>

              )}
            </DialogContent>
          </Dialog>

        </DialogContent>
      </Dialog>
    </div>
  );
}
