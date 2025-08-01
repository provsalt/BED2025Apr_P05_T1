import React from 'react';
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';

const columnHelper = createColumnHelper();

const UserManagementSection = ({ users, updateUserRole, deleteUser }) => {
  const columns = [
    columnHelper.accessor('id', {
      header: 'ID',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('email', {
      header: 'Email',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('role', {
      header: 'Role',
      cell: info => (
        <Chip variant={info.getValue() === 'Admin' ? 'admin' : 'user'}>
          {info.getValue() || 'User'}
        </Chip>
      ),
    }),
    columnHelper.accessor('created_at', {
      header: 'Created',
      cell: info => (
        info.getValue() ? new Date(info.getValue()).toLocaleDateString() : 'N/A'
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const userItem = row.original;
        return (
          <div className="space-x-2">
            <Button
              variant={userItem.role === 'Admin' ? "secondary" : "default"}
              size="sm"
              onClick={() => updateUserRole(userItem.id, userItem.role === 'Admin' ? 'User' : 'Admin')}
            >
              {userItem.role === 'Admin' ? 'Remove Admin' : 'Make Admin'}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => deleteUser(userItem.id)}
            >
              Delete
            </Button>
          </div>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="bg-background rounded-lg shadow-md border">
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold">User Management</h3>
        <p className="text-muted-foreground">Manage user roles and permissions</p>
      </div>
      
      <div className="p-4">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default UserManagementSection;