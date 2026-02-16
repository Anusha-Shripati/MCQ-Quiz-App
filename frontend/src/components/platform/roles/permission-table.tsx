import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/form/checkbox';
import { Permissions } from '@/types/common.types';

type PermissionType = 'can_edit' | 'can_read';

const PermissionsTable: React.FC<{
  permissions: Permissions[];
  onCheckboxChange: (index: number, type: PermissionType, value: boolean) => void;
}> = ({ permissions, onCheckboxChange }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Module</TableHead>
          <TableHead className="text-center">Edit</TableHead>
          <TableHead className="text-center">Read</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {permissions.map((item, index) => (
          <TableRow key={index}>
            <TableCell>{item.module?.name}</TableCell>
            {(['can_edit', 'can_read'] as Array<PermissionType>).map((type) => (
              <TableCell key={type} className="text-center">
                <Checkbox
                  checked={!!item[type]}
                  onCheckedChange={(e: boolean) => onCheckboxChange(index, type, e)}
                  className="dark:bg-gray-600"
                />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default PermissionsTable;
