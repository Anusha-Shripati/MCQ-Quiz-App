import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/form/checkbox";

const availableModules = ["assessment", "candidates", "questions"];

type Permission = {
  createEdit: boolean;
  view: boolean;
  delete: boolean;
};

const PermissionsTable: React.FC<{
  permissions: Record<string, Permission>;
  onCheckboxChange: (category: string, type: keyof Permission) => void;
}> = ({ permissions, onCheckboxChange }) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Module</TableHead>
        <TableHead className="text-center">Create/Edit</TableHead>
        <TableHead className="text-center">View</TableHead>
        <TableHead className="text-center">Delete</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {availableModules.map((category) => (
        <TableRow key={category}>
          <TableCell>{category}</TableCell>
          {["createEdit", "view", "delete"].map((type) => (
            <TableCell key={type} className="text-center">
              <Checkbox
                checked={
                  permissions[category]?.[type as keyof Permission] || false
                }
                onCheckedChange={() =>
                  onCheckboxChange(category, type as keyof Permission)
                }
                className="dark:bg-gray-600"
              />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

export default PermissionsTable;
