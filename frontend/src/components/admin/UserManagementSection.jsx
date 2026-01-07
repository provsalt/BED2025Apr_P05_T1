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
      meta: {
        className: 'hidden sm:table-cell'
      }
    }),
    columnHelper.accessor('email', {
      header: 'Email',
      cell: info => (
        <div className="max-w-[150px] sm:max-w-none truncate" title={info.getValue()}>
          {info.getValue()}
        </div>
      ),
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
      meta: {
        className: 'hidden md:table-cell'
      }
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const userItem = row.original;
        return (
          <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
            <Button
              variant={userItem.role === 'Admin' ? "secondary" : "default"}
              size="sm"
              className="w-full sm:w-auto text-[10px] sm:text-xs px-2 py-1"
              onClick={() => updateUserRole(userItem.id, userItem.role === 'Admin' ? 'User' : 'Admin')}
            >
              {userItem.role === 'Admin' ? 'Remove' : 'Admin'}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="w-full sm:w-auto text-[10px] sm:text-xs px-2 py-1"
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
      <div className="p-4 sm:p-6 border-b text-center sm:text-left">
        <h3 className="text-lg font-semibold">User Management</h3>
        <p className="text-muted-foreground text-sm">Manage user roles and permissions</p>
      </div>
      
      <div className="p-2 sm:p-4">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead 
                    key={header.id} 
                    className={`text-xs sm:text-sm ${header.column.columnDef.meta?.className || ''}`}
                  >
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
                    <TableCell 
                      key={cell.id} 
                      className={`text-xs sm:text-sm ${cell.column.columnDef.meta?.className || ''}`}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-sm">
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