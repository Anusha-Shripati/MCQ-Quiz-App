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
import { Permissions } from "@/types/common.types";
import { modules as availableModules } from "@/shared/constants/data";


const PermissionsTable: React.FC<{
  permissions: Record<string, Permissions>;
  onCheckboxChange: (category: string, type: keyof Permissions) => void;
}> = ({ permissions, onCheckboxChange }) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Module</TableHead>
        {/* <TableHead className="text-center">Create/Edit</TableHead> */}
        <TableHead className="text-center">View</TableHead>
        <TableHead className="text-center">Delete</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {availableModules.map((category) => (
        <TableRow key={category}>
          <TableCell>{category}</TableCell>
          {["edit", "view"].map((type) => (
            <TableCell key={type} className="text-center">
              <Checkbox
                checked={
                  permissions[category]?.[type as keyof Permissions] || false
                }
                onCheckedChange={() =>
                  onCheckboxChange(category, type as keyof Permissions)
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
